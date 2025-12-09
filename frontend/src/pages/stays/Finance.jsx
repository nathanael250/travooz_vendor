import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu,
  Bell,
  User,
  Home,
  LogOut,
  LayoutDashboard,
  Building2,
  Calendar as CalendarIcon,
  FileText,
  BookOpen,
  DollarSign,
  CheckCircle,
  CreditCard,
  Info,
  X,
  Edit,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { staysAuthService, staysBookingService, getMyPropertyListings } from '../../services/staysService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';

const Finance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(true);
  const [bookingsForPayout, setBookingsForPayout] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentConfirmations, setPaymentConfirmations] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPropertyLive, setIsPropertyLive] = useState(false);
  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('payouts');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!staysAuthService.isAuthenticated()) {
      navigate('/stays/login');
      return;
    }

    // Set initial sidebar state based on screen size
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsMobile(!isDesktop);
      if (isDesktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Get current user
    const currentUser = staysAuthService.getCurrentUser();
    setUser(currentUser);

    fetchPropertyAndFinanceData();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [activeTab, selectedYear]);

  const fetchPropertyAndFinanceData = async () => {
    try {
      // Get user's property
      const properties = await getMyPropertyListings();
      if (!properties || properties.length === 0) {
        toast.error('No property found. Please create a property first.');
        navigate('/stays/dashboard');
        return;
      }

      const currentProperty = properties[0];
      setProperty(currentProperty);
      
      // Check if property is live
      const propertyIsLive = 
        currentProperty.is_live === 1 || 
        currentProperty.isLive === true || 
        currentProperty.is_live === true ||
        currentProperty.status === 'approved';
      setIsPropertyLive(propertyIsLive);

      // Fetch finance data
      await fetchFinanceData();
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error(error.message || 'Failed to load property data');
      if (error.response?.status === 401) {
        navigate('/stays/login');
      }
    }
  };

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
      const bookings = await staysBookingService.getBookings({ status: 'confirmed,completed' });
      const bookingsArray = Array.isArray(bookings) ? bookings : [];
      
      // Filter bookings that are eligible for payout (paid bookings)
      // For stays, we'll assume confirmed/completed bookings are eligible
      const eligibleBookings = bookingsArray.filter(b => 
        b.status === 'confirmed' || b.status === 'completed'
      );
      
      // Calculate vendor payout (assuming 85% of total amount after commission)
      const bookingsWithPayout = eligibleBookings.map(booking => ({
        ...booking,
        vendor_payout: booking.total_amount ? (booking.total_amount * 0.85) : 0
      }));
      
      setBookingsForPayout(bookingsWithPayout);
    } catch (error) {
      console.error('Error fetching bookings for payout:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const bookings = await staysBookingService.getBookings();
      const bookingsArray = Array.isArray(bookings) ? bookings : [];
      
      // Generate invoices from bookings
      const invoicesData = bookingsArray
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .map((booking, index) => ({
          invoice_id: `INV-${selectedYear}-${String(index + 1).padStart(4, '0')}`,
          date: booking.created_at || booking.check_in_date,
          amount: booking.total_amount || 0,
          status: booking.status === 'completed' ? 'paid' : 'pending',
          booking_id: booking.booking_id
        }))
        .filter(inv => {
          const invDate = new Date(inv.date);
          return invDate.getFullYear() === selectedYear;
        });
      
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPaymentConfirmations = async () => {
    try {
      const bookings = await staysBookingService.getBookings({ status: 'confirmed,completed' });
      const bookingsArray = Array.isArray(bookings) ? bookings : [];
      
      // Generate payment confirmations from paid bookings
      const confirmationsData = bookingsArray
        .filter(b => b.status === 'completed')
        .map((booking, index) => ({
          confirmation_id: `PAY-${selectedYear}-${String(index + 1).padStart(4, '0')}`,
          date: booking.created_at || booking.check_in_date,
          amount: booking.total_amount ? (booking.total_amount * 0.85) : 0, // Vendor payout
          status: 'confirmed',
          booking_id: booking.booking_id
        }))
        .filter(conf => {
          const confDate = new Date(conf.date);
          return confDate.getFullYear() === selectedYear;
        });
      
      setPaymentConfirmations(confirmationsData);
    } catch (error) {
      console.error('Error fetching payment confirmations:', error);
    }
  };

  const fetchPaymentTaxDetails = async () => {
    try {
      // For stays, we can get tax details from property tax details
      if (property) {
        // Set defaults - in future, fetch from property tax details
        setPaymentSettings({
          payment_frequency: 'monthly',
          commission_rate: 15,
          currency: property.currency || 'RWF'
        });
        
        // Try to get tax details from property
        // This would need to be implemented in the backend
        setTaxDetails({
          vat_number: null,
          vat_country: null,
          tin: null,
          tin_country: null
        });
      } else {
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
    } catch (error) {
      console.error('Error fetching payment tax details:', error);
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

  const handleLogout = () => {
    staysAuthService.logout();
    navigate('/stays/login');
    toast.success('Logged out successfully');
  };

  if (loading && activeTab === 'payouts') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading finance data...</p>
        </div>
      </div>
    );
  }

  // Page content only - layout is handled by StaysDashboardLayout
  return (
    <div className="space-y-4 sm:space-y-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#1f6f31' }}>
                Finance
              </h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                        ${activeTab === tab.id
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
                <div className="space-y-4 sm:space-y-6">
                  {/* Balance Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Your balance (RWF)</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#1f6f31]">
                            {totalBalance.toLocaleString()} RWF
                          </p>
                        </div>
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-[#1f6f31]" />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Next payout (RWF)</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#1f6f31]">
                            {nextPayout.toLocaleString()} RWF
                          </p>
                        </div>
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-[#1f6f31]" />
                      </div>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail rate</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net rate</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookingsForPayout.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                No payouts found
                              </td>
                            </tr>
                          ) : (
                            bookingsForPayout.map((booking) => (
                              <tr key={booking.booking_id} className="hover:bg-gray-50">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  #{booking.booking_id}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {booking.room_name || 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {booking.total_amount ? `${Number(booking.total_amount).toLocaleString()} RWF` : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1f6f31]">
                                  {booking.vendor_payout ? `${Number(booking.vendor_payout).toLocaleString()} RWF` : 'N/A'}
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
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h2>
                    
                    {showInfoBanner && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800">
                            Are you curious about invoice statuses and payment confirmations? Visit our FAQs to learn more.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowInfoBanner(false)}
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                              <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.invoice_id || 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.amount ? `${Number(invoice.amount).toLocaleString()} RWF` : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
                    
                    {showInfoBanner && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800">
                            Are you curious about invoice statuses and payment confirmations? Visit our FAQs to learn more.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowInfoBanner(false)}
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Confirmation</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                              <tr key={confirmation.confirmation_id} className="hover:bg-gray-50">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {confirmation.date ? new Date(confirmation.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {confirmation.confirmation_id || 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {confirmation.amount ? `${Number(confirmation.amount).toLocaleString()} RWF` : 'N/A'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                <div className="space-y-4 sm:space-y-6">
                  {/* Tax Details Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Tax details</h2>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1f6f31] hover:text-[#155a25] font-medium">
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
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1f6f31] hover:text-[#155a25] font-medium">
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
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Payment settings</h2>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1f6f31] hover:text-[#155a25] font-medium">
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
    </div>
  );
};

export default Finance;

