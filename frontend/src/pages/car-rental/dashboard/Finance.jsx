import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, CreditCard, Info, X, Edit, Plus } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('payouts');
  const [bookingsForPayout, setBookingsForPayout] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentConfirmations, setPaymentConfirmations] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, [activeTab, selectedYear]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'payouts') {
        await fetchBookingsForPayout();
      } else if (activeTab === 'invoices') {
        await fetchInvoices();
      } else if (activeTab === 'payment-confirmations') {
        await fetchPaymentConfirmations();
      } else if (activeTab === 'payment-tax') {
        await fetchPaymentTaxDetails();
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast.error('Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsForPayout = async () => {
    try {
      const businessId = localStorage.getItem('car_rental_business_id');
      if (businessId) {
        const response = await apiClient.get(`/car-rental/business/${businessId}/bookings?status=confirmed,completed`);
        const bookings = response.data?.data || response.data || [];
        
        // Filter bookings that are eligible for payout (paid bookings)
        const eligibleBookings = bookings.filter(b => 
          b.payment_status === 'paid' && b.vendor_payout
        );
        
        setBookingsForPayout(eligibleBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings for payout:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const businessId = localStorage.getItem('car_rental_business_id');
      if (businessId) {
        const response = await apiClient.get(`/car-rental/invoices?year=${selectedYear}&businessId=${businessId}`);
        const invoicesData = response.data?.data || response.data || [];
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // If endpoint doesn't exist, generate from bookings
      try {
        const businessId = localStorage.getItem('car_rental_business_id');
        if (businessId) {
          const bookingsResponse = await apiClient.get(`/car-rental/business/${businessId}/bookings`);
          const bookings = bookingsResponse.data?.data || bookingsResponse.data || [];
          const invoicesData = bookings
            .filter(b => b.status === 'confirmed' || b.status === 'completed')
            .map((booking, index) => ({
              invoice_id: `INV-${selectedYear}-${String(index + 1).padStart(4, '0')}`,
              date: booking.booking_date || booking.created_at,
              amount: booking.total_amount || 0,
              status: booking.payment_status === 'paid' ? 'paid' : 'pending',
              booking_id: booking.booking_id || booking.id
            }))
            .filter(inv => {
              const invDate = new Date(inv.date);
              return invDate.getFullYear() === selectedYear;
            });
          setInvoices(invoicesData);
        }
      } catch (err) {
        console.error('Error generating invoices from bookings:', err);
      }
    }
  };

  const fetchPaymentConfirmations = async () => {
    try {
      const businessId = localStorage.getItem('car_rental_business_id');
      if (businessId) {
        const response = await apiClient.get(`/car-rental/payment-confirmations?year=${selectedYear}&businessId=${businessId}`);
        const confirmationsData = response.data?.data || response.data || [];
        setPaymentConfirmations(confirmationsData);
      }
    } catch (error) {
      console.error('Error fetching payment confirmations:', error);
      // If endpoint doesn't exist, generate from paid bookings
      try {
        const businessId = localStorage.getItem('car_rental_business_id');
        if (businessId) {
          const bookingsResponse = await apiClient.get(`/car-rental/business/${businessId}/bookings?status=confirmed,completed`);
          const bookings = bookingsResponse.data?.data || bookingsResponse.data || [];
          const confirmationsData = bookings
            .filter(b => b.payment_status === 'paid')
            .map((booking, index) => ({
              confirmation_id: `PAY-${selectedYear}-${String(index + 1).padStart(4, '0')}`,
              date: booking.booking_date || booking.created_at,
              amount: booking.vendor_payout || booking.total_amount || 0,
              status: 'confirmed',
              booking_id: booking.booking_id || booking.id
            }))
            .filter(conf => {
              const confDate = new Date(conf.date);
              return confDate.getFullYear() === selectedYear;
            });
          setPaymentConfirmations(confirmationsData);
        }
      } catch (err) {
        console.error('Error generating payment confirmations from bookings:', err);
      }
    }
  };

  const fetchPaymentTaxDetails = async () => {
    try {
      const businessId = localStorage.getItem('car_rental_business_id');
      if (businessId) {
        const response = await apiClient.get(`/car-rental/businesses/${businessId}/payment-tax`);
        if (response.data.success && response.data.data) {
          setPaymentSettings(response.data.data.paymentSettings);
          setTaxDetails(response.data.data.taxDetails);
        } else {
          // Set defaults
          setPaymentSettings({
            payment_frequency: 'monthly',
            commission_rate: 15,
            currency: 'RWF'
          });
          setTaxDetails({
            vat_number: null,
            vat_country: null,
            tin: null,
            tin_country: null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payment tax details:', error);
      // Set defaults
      setPaymentSettings({
        payment_frequency: 'monthly',
        commission_rate: 15,
        currency: 'RWF'
      });
      setTaxDetails({
        vat_number: null,
        vat_country: null,
        tin: null,
        tin_country: null
      });
    }
  };

  // Calculate balances
  const totalBalance = bookingsForPayout.reduce((sum, b) => sum + (b.vendor_payout || 0), 0);
  const nextPayout = bookingsForPayout
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.vendor_payout || 0), 0);

  const tabs = [
    { id: 'payouts', label: 'Bookings for payout', icon: DollarSign },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payment-confirmations', label: 'Payment Confirmations', icon: CheckCircle },
    { id: 'payment-tax', label: 'Payment & tax details', icon: CreditCard }
  ];

  if (loading && activeTab === 'payouts') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Bookings for Payout Tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your balance (RWF)</p>
                    <p className="text-2xl font-bold text-[#3CAF54]">
                      {totalBalance.toLocaleString()} RWF
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#3CAF54]" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Next payout (RWF)</p>
                    <p className="text-2xl font-bold text-[#3CAF54]">
                      {nextPayout.toLocaleString()} RWF
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#3CAF54]" />
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of purchase</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookingsForPayout.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No payouts found
                        </td>
                      </tr>
                    ) : (
                      bookingsForPayout.map((booking) => (
                        <tr key={booking.booking_id || booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{booking.booking_id || booking.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.customer_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.car_brand} {booking.car_model} ({booking.car_license_plate || 'N/A'})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.pickup_date ? new Date(booking.pickup_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.total_amount ? `${Number(booking.total_amount).toLocaleString()} ${booking.currency || 'RWF'}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3CAF54]">
                            {booking.vendor_payout ? `${Number(booking.vendor_payout).toLocaleString()} ${booking.currency || 'RWF'}` : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h2>
              
              {showInfoBanner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Are you curious about invoice statuses and payment confirmations? Visit our FAQs to learn more.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInfoBanner(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          No invoices found for the selected period
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice) => (
                        <tr key={invoice.invoice_id || invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoice_id || invoice.invoice_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.amount ? `${Number(invoice.amount).toLocaleString()} RWF` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmations Tab */}
        {activeTab === 'payment-confirmations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
              
              {showInfoBanner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Are you curious about invoice statuses and payment confirmations? Visit our FAQs to learn more.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInfoBanner(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Confirmation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentConfirmations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          No payments were found for the selected period
                        </td>
                      </tr>
                    ) : (
                      paymentConfirmations.map((confirmation) => (
                        <tr key={confirmation.confirmation_id || confirmation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {confirmation.date ? new Date(confirmation.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {confirmation.confirmation_id || confirmation.payment_confirmation || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {confirmation.amount ? `${Number(confirmation.amount).toLocaleString()} RWF` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {confirmation.status?.toUpperCase() || 'CONFIRMED'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payment & Tax Details Tab */}
        {activeTab === 'payment-tax' && (
          <div className="space-y-6">
            {/* Tax Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tax details</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-gray-700">VAT number</label>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900">
                    {taxDetails?.vat_number || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country of issue</label>
                  <p className="text-sm text-gray-900">
                    {taxDetails?.vat_country || '-'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-gray-700">Tax Identification Number (TIN)</label>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900">
                    {taxDetails?.tin || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country of issue</label>
                  <p className="text-sm text-gray-900">
                    {taxDetails?.tin_country || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium">
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-600 mt-0.5">▲</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-2">Action needed: Payment information not found</p>
                    <p className="text-sm text-red-700">
                      Looks like your payment information is not available. Make sure to add your billing information for successful payouts. 
                      <a href="#" className="underline ml-1">Contact our support team</a> if you need any further assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment settings</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Payment frequency</label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment_frequency"
                        value="monthly"
                        checked={paymentSettings?.payment_frequency === 'monthly'}
                        className="mt-1"
                        readOnly
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Once per month</p>
                        <p className="text-xs text-gray-500">Payment will occur on the 5th business working day of the month</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment_frequency"
                        value="biweekly"
                        className="mt-1"
                        readOnly
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Twice per month (2% additional commission)</p>
                        <p className="text-xs text-gray-500">Payment is issued on the 5th & 20th of every month or the first following business day</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Commission rate</label>
                  <p className="text-sm text-gray-900">{paymentSettings?.commission_rate || 15}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-gray-700">Currency</label>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900">{paymentSettings?.currency || 'RWF'} (Rwandan Franc)</p>
                  <p className="text-xs text-gray-500 mt-1">Currency you will be paid by Travooz</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
