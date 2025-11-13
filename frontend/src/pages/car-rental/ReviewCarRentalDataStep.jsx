import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Edit, Building2, FileText, CreditCard } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function ReviewCarRentalDataStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
  const taxPayment = location.state?.taxPayment || {};
  const carRental = location.state?.carRental || null;
  const userId = location.state?.userId;
  const carRentalBusinessId = location.state?.carRentalBusinessId || localStorage.getItem('car_rental_business_id');

  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const handleContinue = () => {
    navigate('/car-rental/setup/agreement', {
      state: {
        ...location.state,
        step2Data,
        businessDetails,
        taxPayment,
        carRental,
        userId,
        carRentalBusinessId
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  6
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  7
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  8
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 6 of 8: Review & Verify</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Review & Verify Your Information
            </h1>
            
            <p className="text-gray-600 mb-8">
              Please review all the information you've entered. Make sure all required fields are completed before submitting.
            </p>

            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-green-900">All required information has been provided and validated.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Business Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Business Name:</span>
                    <span className="ml-2 text-gray-900">{step2Data.carRentalBusinessName || businessDetails.businessName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Car Type:</span>
                    <span className="ml-2 text-gray-900">{step2Data.carTypeName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="mt-1 text-gray-900">{step2Data.description || businessDetails.shortDescription || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Tax & Payment Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Tax & Payment Information</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">TIN:</span>
                    <span className="ml-2 text-gray-900">{taxPayment.tin || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Legal Business Name:</span>
                    <span className="ml-2 text-gray-900">{taxPayment.legalBusinessName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Payment Method:</span>
                    <span className="ml-2 text-gray-900">{taxPayment.paymentMethod || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/car-rental/setup/tax-payment', { state: { ...location.state, carRentalBusinessId } })}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>Continue to Agreement</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}















