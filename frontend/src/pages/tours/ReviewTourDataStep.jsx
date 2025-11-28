import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Edit, Building2, FileText, User, CreditCard, Award, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import apiClient from '../../services/apiClient';

export default function ReviewTourDataStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tourBusinessId = location.state?.tourBusinessId || localStorage.getItem('tour_business_id');
  const userId = location.state?.userId || JSON.parse(localStorage.getItem('user') || '{}')?.userId || JSON.parse(localStorage.getItem('user') || '{}')?.id;

  const [step2Data, setStep2Data] = useState(location.state?.step2Data || {});
  const [businessOwnerInfo, setBusinessOwnerInfo] = useState(location.state?.businessOwnerInfo || {});
  const [identityProof, setIdentityProof] = useState(location.state?.identityProof || {});
  const [businessProof, setBusinessProof] = useState(location.state?.businessProof || {});
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Load existing data from API if tourBusinessId exists but no data in state
  useEffect(() => {
    const loadExistingData = async () => {
      // Only load if we have tourBusinessId but no data in location.state
      if (tourBusinessId && userId && (!location.state?.step2Data || !location.state?.businessOwnerInfo)) {
        setLoading(true);
        try {
          // Fetch business data (step 2)
          try {
            const businessRes = await apiClient.get(`/tours/businesses/${tourBusinessId}`);
            if (businessRes.data?.data) {
              const business = businessRes.data.data;
              let tourTypeNames = [];
              if (business.tour_type_names) {
                try {
                  tourTypeNames = typeof business.tour_type_names === 'string' 
                    ? JSON.parse(business.tour_type_names) 
                    : business.tour_type_names;
                } catch (e) {
                  tourTypeNames = [];
                }
              }
              
              let locationData = null;
              if (business.location_data) {
                try {
                  locationData = typeof business.location_data === 'string'
                    ? JSON.parse(business.location_data)
                    : business.location_data;
                } catch (e) {
                  locationData = null;
                }
              }

              setStep2Data({
                tourBusinessName: business.tour_business_name,
                description: business.description,
                tourTypeName: business.tour_type_name,
                selectedTourTypeNames: tourTypeNames,
                location: business.location,
                locationData: locationData,
                phone: business.phone,
                currency: business.currency
              });
            }
          } catch (err) {
            console.warn('Could not load business data:', err);
          }

          // Fetch business owner info
          try {
            const ownerRes = await apiClient.get(`/tours/setup/business-owner-info?tourBusinessId=${tourBusinessId}`);
            if (ownerRes.data?.data) {
              const owner = ownerRes.data.data;
              setBusinessOwnerInfo({
                firstName: owner.first_name,
                lastName: owner.last_name,
                email: owner.email,
                countryOfResidence: owner.country_of_residence
              });
            }
          } catch (err) {
            console.warn('Could not load owner info:', err);
          }

          // Fetch identity proof
          try {
            const identityRes = await apiClient.get(`/tours/setup/identity-proof?tourBusinessId=${tourBusinessId}`);
            if (identityRes.data?.data) {
              const identity = identityRes.data.data;
              setIdentityProof({
                idCountry: identity.id_country,
                idCardPhoto: identity.id_card_photo_url || identity.id_card_photo
              });
            }
          } catch (err) {
            console.warn('Could not load identity proof:', err);
          }

          // Fetch business proof
          try {
            const businessProofRes = await apiClient.get(`/tours/setup/business-proof?tourBusinessId=${tourBusinessId}`);
            if (businessProofRes.data?.data) {
              const proof = businessProofRes.data.data;
              setBusinessProof({
                businessLegalName: proof.business_legal_name,
                professionalCertificate: proof.professional_certificate_url || proof.professional_certificate
              });
            }
          } catch (err) {
            console.warn('Could not load business proof:', err);
          }
        } catch (error) {
          console.error('Error loading existing data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadExistingData();
  }, [tourBusinessId, userId, location.state]);

  // Validate all information
  useEffect(() => {
    const errors = [];
    
    if (!step2Data.tourBusinessName) errors.push('Business name is missing');
    if (!businessOwnerInfo.firstName || !businessOwnerInfo.lastName) errors.push('Business owner information is incomplete');
    if (!businessOwnerInfo.email) errors.push('Business owner email is missing');
    if (!businessOwnerInfo.countryOfResidence) errors.push('Country of residence is missing');
    if (!identityProof.idCountry) errors.push('ID country is missing');
    if (!identityProof.idCardPhoto) errors.push('ID card photo is missing');
    if (!businessProof.businessLegalName) errors.push('Business legal name is missing');
    if (!businessProof.professionalCertificate) errors.push('Professional certificate is missing');
    
    setValidationErrors(errors);
  }, [step2Data, businessOwnerInfo, identityProof, businessProof]);

  const handleEdit = (step) => {
    const stateData = {
      ...location.state,
      step2Data,
      businessOwnerInfo,
      identityProof,
      businessProof,
      userId,
      tourBusinessId
    };
    
    switch(step) {
      case 'owner':
        navigate('/tours/setup/business-owner-info', { state: stateData });
        break;
      case 'identity':
        navigate('/tours/setup/prove-identity', { state: stateData });
        break;
      case 'business':
        navigate('/tours/setup/prove-business', { state: stateData });
        break;
      default:
        break;
    }
  };

  const handleContinue = () => {
    if (validationErrors.length > 0) {
      return; // Don't allow proceeding if there are validation errors
    }
    
    navigate('/tours/setup/submit', {
      state: {
        ...location.state,
        step2Data,
        businessOwnerInfo,
        identityProof,
        businessProof,
        userId,
        tourBusinessId
      }
    });
  };

  const resolvedTourTypeNames = Array.isArray(step2Data.selectedTourTypeNames) && step2Data.selectedTourTypeNames.length > 0
    ? step2Data.selectedTourTypeNames
    : step2Data.tourTypeName
      ? [step2Data.tourTypeName]
      : [];

  const formattedTourTypes = resolvedTourTypeNames.length
    ? resolvedTourTypeNames.join(', ')
    : 'Not provided';

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
                  5
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  6
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 5 of 6: Review & Verify</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Review & Verify Your Information
            </h1>
            
            <p className="text-gray-600 mb-8">
              Please review all the information you've entered. Make sure all required fields are completed before submitting.
            </p>

            {loading && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Loading your existing information...</p>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-2">Please complete the following:</p>
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Success */}
            {validationErrors.length === 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-900">All required information has been provided and validated.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Business Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" style={{ color: '#3CAF54' }} />
                    <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Business Name:</span>
                    <span className="ml-2 text-gray-900">{step2Data.tourBusinessName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tour Type:</span>
                    <span className="ml-2 text-gray-900">{formattedTourTypes}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="mt-1 text-gray-900">{step2Data.description || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Business Owner Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6" style={{ color: '#3CAF54' }} />
                    <h2 className="text-xl font-semibold text-gray-900">Business Owner Information</h2>
                  </div>
                  <button
                    onClick={() => handleEdit('owner')}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {businessOwnerInfo.firstName && businessOwnerInfo.lastName
                        ? `${businessOwnerInfo.firstName} ${businessOwnerInfo.lastName}`
                        : 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{businessOwnerInfo.email || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Country of Residence:</span>
                    <span className="ml-2 text-gray-900">{businessOwnerInfo.countryOfResidence || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Identity Proof */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" style={{ color: '#3CAF54' }} />
                    <h2 className="text-xl font-semibold text-gray-900">Identity Proof</h2>
                  </div>
                  <button
                    onClick={() => handleEdit('identity')}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">ID Country:</span>
                    <span className="ml-2 text-gray-900">{identityProof.idCountry || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ID Card Photo:</span>
                    <span className="ml-2 text-gray-900">
                      {identityProof.idCardPhoto ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Proof */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6" style={{ color: '#3CAF54' }} />
                    <h2 className="text-xl font-semibold text-gray-900">Business Proof</h2>
                  </div>
                  <button
                    onClick={() => handleEdit('business')}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Business Legal Name:</span>
                    <span className="ml-2 text-gray-900">{businessProof.businessLegalName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Professional Certificate:</span>
                    <span className="ml-2 text-gray-900">
                      {businessProof.professionalCertificate ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/tours/setup/prove-business', { 
                    state: {
                      ...location.state,
                      step2Data,
                      businessOwnerInfo,
                      identityProof,
                      businessProof,
                      userId,
                      tourBusinessId
                    }
                  })}
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
                  disabled={validationErrors.length > 0}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !validationErrors.length && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !validationErrors.length && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>Submit for Verification</span>
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

