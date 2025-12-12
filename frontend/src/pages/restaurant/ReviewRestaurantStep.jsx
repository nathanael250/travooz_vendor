import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Edit, Building2, Camera, FileText, UtensilsCrossed, Percent } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import SetupProgressIndicator from '../../components/restaurant/SetupProgressIndicator';

export default function ReviewRestaurantStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
  const media = location.state?.media || {};
  const taxLegal = location.state?.taxLegal || {};
  const menuSetup = location.state?.menuSetup || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  const handleEdit = (section) => {
    const routes = {
      'business-details': '/restaurant/setup/business-details',
      'media': '/restaurant/setup/media',
      'tax-legal': '/restaurant/setup/tax-legal',
      'menu': '/restaurant/setup/menu'
    };

    if (routes[section]) {
      navigate(routes[section], {
        state: location.state
      });
    }
  };

  const handleNext = () => {
    navigate('/restaurant/setup/agreement', {
      state: {
        ...location.state
      }
    });
  };


  const taxTypeLabels = {
    'vat': 'VAT (Value Added Tax)',
    'gst': 'GST (Goods and Services Tax)',
    'none': 'None'
  };

  const vatInclusiveLabels = {
    'inclusive': 'VAT Inclusive (prices include tax)',
    'exclusive': 'VAT Exclusive (tax added at checkout)'
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Indicator */}
          <SetupProgressIndicator currentStep={10} totalSteps={11} />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your restaurant information</h1>
            <p className="text-gray-600">
              Review all the details you've entered for your restaurant. You can edit any section before finalizing your listing.
            </p>
          </div>

          {/* Business Details Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Business Details</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('business-details')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Restaurant Name:</span> {businessDetails.restaurantName || step2Data.restaurantName || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Business Registration Number:</span> {businessDetails.businessRegistrationNumber || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Contact Number:</span> {businessDetails.contactNumber || step2Data.phone || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Email:</span> {businessDetails.emailAddress || email || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Website:</span> {businessDetails.website || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Social Media:</span> {businessDetails.socialMediaLinks || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Operating Hours:</span> {
                businessDetails.is24Hours 
                  ? '24/7' 
                  : businessDetails.openingTime && businessDetails.closingTime 
                    ? `${businessDetails.openingTime} - ${businessDetails.closingTime}` 
                    : 'Not set'
              }</p>
              <p><span className="font-medium text-gray-900">Description:</span> {businessDetails.shortDescription || step2Data.description || 'Not set'}</p>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Media</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('media')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Logo:</span> {media.logo ? 'Uploaded' : 'Not uploaded'}</p>
              <p><span className="font-medium text-gray-900">Gallery Images:</span> {media.galleryImages?.length || 0} image(s)</p>
            </div>
          </div>

          {/* Tax & Legal Information Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Tax & Legal Information</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('tax-legal')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">TIN:</span> {taxLegal.taxIdentificationNumber || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Registered Business Name:</span> {taxLegal.registeredBusinessName || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Business License Number:</span> {taxLegal.businessLicenseNumber || 'Not set'}</p>
              <p><span className="font-medium text-gray-900">Business License:</span> {taxLegal.businessLicenseFile ? 'Uploaded' : 'Not uploaded'}</p>
              <p><span className="font-medium text-gray-900">Tax Registration Certificate:</span> {taxLegal.taxRegistrationCertificateFile ? 'Uploaded' : 'Not uploaded'}</p>
              <p><span className="font-medium text-gray-900">Tax Type:</span> {taxTypeLabels[taxLegal.taxType] || 'Not set'}</p>
              {taxLegal.taxType && taxLegal.taxType !== 'none' && (
                <>
                  <p><span className="font-medium text-gray-900">VAT/Tax Rate:</span> {taxLegal.vatTaxRate ? `${taxLegal.vatTaxRate}%` : 'Not set'}</p>
                  <p><span className="font-medium text-gray-900">VAT Pricing:</span> {vatInclusiveLabels[taxLegal.pricesVatInclusive] || 'Not set'}</p>
                </>
              )}
            </div>
          </div>

          {/* Menu Setup Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Menu Setup</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('menu')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Categories:</span> {menuSetup.categories?.length || 0} category(ies)</p>
              <p><span className="font-medium text-gray-900">Menu Items:</span> {menuSetup.menuItems?.length || 0} item(s)</p>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleNext}
              className="text-white font-semibold py-4 px-12 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-lg"
              style={{ backgroundColor: '#3CAF54' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
            >
              <span>Next</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

