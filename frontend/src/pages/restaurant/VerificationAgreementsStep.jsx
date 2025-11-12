import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, FileCheck, Shield, FileText, Upload, X, CheckCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function VerificationAgreementsStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
  const media = location.state?.media || {};
  const paymentsPricing = location.state?.paymentsPricing || {};
  const taxLegal = location.state?.taxLegal || {};
  const menuSetup = location.state?.menuSetup || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    businessLicenseVerification: null,
    businessLicensePreview: null,
    foodSafetyCertificate: null,
    foodSafetyCertificatePreview: null,
    proofOfOwnership: null,
    proofOfOwnershipPreview: null,
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});

  const businessLicenseInputRef = useRef(null);
  const foodSafetyInputRef = useRef(null);
  const proofOfOwnershipInputRef = useRef(null);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      
      if (fileType === 'businessLicense') {
        setFormData(prev => ({ ...prev, businessLicenseVerification: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, businessLicensePreview: reader.result }));
        };
        reader.readAsDataURL(file);
      } else if (fileType === 'foodSafety') {
        setFormData(prev => ({ ...prev, foodSafetyCertificate: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, foodSafetyCertificatePreview: reader.result }));
        };
        reader.readAsDataURL(file);
      } else if (fileType === 'proofOfOwnership') {
        setFormData(prev => ({ ...prev, proofOfOwnership: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, proofOfOwnershipPreview: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
    
    // Clear error for this field
    if (errors[fileType]) {
      setErrors(prev => ({
        ...prev,
        [fileType]: ''
      }));
    }
  };

  const removeFile = (fileType) => {
    if (fileType === 'businessLicense') {
      setFormData(prev => ({
        ...prev,
        businessLicenseVerification: null,
        businessLicensePreview: null
      }));
      if (businessLicenseInputRef.current) {
        businessLicenseInputRef.current.value = '';
      }
    } else if (fileType === 'foodSafety') {
      setFormData(prev => ({
        ...prev,
        foodSafetyCertificate: null,
        foodSafetyCertificatePreview: null
      }));
      if (foodSafetyInputRef.current) {
        foodSafetyInputRef.current.value = '';
      }
    } else if (fileType === 'proofOfOwnership') {
      setFormData(prev => ({
        ...prev,
        proofOfOwnership: null,
        proofOfOwnershipPreview: null
      }));
      if (proofOfOwnershipInputRef.current) {
        proofOfOwnershipInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.businessLicenseVerification) {
      newErrors.businessLicense = 'Business license verification is required';
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions to continue';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Log verification data (for frontend-only testing)
    console.log('Verification & Agreements Data:', {
      businessLicenseVerification: formData.businessLicenseVerification?.name,
      foodSafetyCertificate: formData.foodSafetyCertificate?.name || 'Not provided',
      proofOfOwnership: formData.proofOfOwnership?.name || 'Not provided',
      termsAccepted: formData.termsAccepted
    });
    
    // TODO: Save verification & agreements via API
    alert('Verification & Agreements submitted successfully! (Mock - Frontend Only)\n\nYour restaurant setup is complete!');
    
    // Navigate to success/completion page or dashboard
    // navigate('/restaurant/dashboard', {
    //   state: {
    //     ...location.state,
    //     verificationAgreements: formData
    //   }
    // });
  };

  const handleBack = () => {
    navigate('/restaurant/setup/menu', {
      state: {
        location: location.state?.location || '',
        locationData: locationData,
        step2Data: step2Data,
        businessDetails: businessDetails,
        media: media,
        paymentsPricing: paymentsPricing,
        taxLegal: taxLegal,
        menuSetup: menuSetup,
        userId,
        email,
        userName
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
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  7
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Setup Step 7 of 7</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Verification & Agreements
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please upload the required verification documents and accept our terms and conditions to complete your restaurant setup.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business License Verification */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Business License Verification *</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a clear copy of your business license for verification purposes.
                </p>
                {formData.businessLicensePreview ? (
                  <div className="relative">
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formData.businessLicenseVerification?.name || 'Business License'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(formData.businessLicenseVerification?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('businessLicense')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => businessLicenseInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload business license</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG format - max 10MB</p>
                  </div>
                )}
                <input
                  ref={businessLicenseInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'businessLicense')}
                  className="hidden"
                />
                {errors.businessLicense && (
                  <p className="mt-2 text-sm text-red-600">{errors.businessLicense}</p>
                )}
              </div>

              {/* Food Safety Certificate */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Food Safety Certificate (Optional)</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  If you have a food safety certificate, please upload it here. This helps build trust with customers.
                </p>
                {formData.foodSafetyCertificatePreview ? (
                  <div className="relative">
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formData.foodSafetyCertificate?.name || 'Food Safety Certificate'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(formData.foodSafetyCertificate?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('foodSafety')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => foodSafetyInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload food safety certificate</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG format - max 10MB</p>
                  </div>
                )}
                <input
                  ref={foodSafetyInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'foodSafety')}
                  className="hidden"
                />
              </div>

              {/* Proof of Ownership */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Proof of Ownership (Optional)</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  If you own the restaurant property, you may upload proof of ownership (e.g., property deed, lease agreement).
                </p>
                {formData.proofOfOwnershipPreview ? (
                  <div className="relative">
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formData.proofOfOwnership?.name || 'Proof of Ownership'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(formData.proofOfOwnership?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('proofOfOwnership')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => proofOfOwnershipInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload proof of ownership</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG format - max 10MB</p>
                  </div>
                )}
                <input
                  ref={proofOfOwnershipInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'proofOfOwnership')}
                  className="hidden"
                />
              </div>

              {/* Terms and Conditions Agreement */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Terms and Conditions Agreement *</h2>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 border-2 mb-4" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="font-semibold text-gray-900 mb-3">By accepting, you agree to:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Provide accurate and truthful information about your restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Maintain food safety standards and comply with local health regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Honor all bookings and reservations made through the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Keep menu information, prices, and availability up to date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Respond promptly to customer inquiries and reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Comply with Travooz's platform policies and guidelines</span>
                    </li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
                      if (errors.termsAccepted) {
                        setErrors(prev => ({ ...prev, termsAccepted: '' }));
                      }
                    }}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => {/* Open terms modal or navigate to terms page */}}
                      className="text-[#3CAF54] hover:underline font-medium"
                    >
                      Terms and Conditions
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => {/* Open privacy policy modal or navigate to privacy page */}}
                      className="text-[#3CAF54] hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                    . I understand that I am responsible for maintaining accurate information and complying with all applicable laws and regulations.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </div>
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                >
                  <span>Complete Setup</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

