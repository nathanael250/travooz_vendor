import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, Upload, X, FileCheck, Award } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export default function ProveBusinessStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const businessOwnerInfo = location.state?.businessOwnerInfo || {};
  const identityProof = location.state?.identityProof || {};
  const existingBusinessProof = location.state?.businessProof || {};
  const userId = location.state?.userId;
  const tourBusinessId = location.state?.tourBusinessId || localStorage.getItem('tour_business_id');
  const step2Data = location.state?.step2Data || {};

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Initialize preview from existing data
  const getInitialPreview = () => {
    if (existingBusinessProof.professionalCertificate) {
      // If it's a URL string, use it directly
      if (typeof existingBusinessProof.professionalCertificate === 'string') {
        return existingBusinessProof.professionalCertificate;
      }
      // If it's a File object, create object URL
      if (existingBusinessProof.professionalCertificate instanceof File) {
        return URL.createObjectURL(existingBusinessProof.professionalCertificate);
      }
    }
    // Also check for professionalCertificateUrl if available
    if (existingBusinessProof.professionalCertificateUrl && typeof existingBusinessProof.professionalCertificateUrl === 'string') {
      return existingBusinessProof.professionalCertificateUrl;
    }
    return null;
  };

  const [formData, setFormData] = useState({
    businessLegalName: existingBusinessProof.businessLegalName || step2Data.tourBusinessName || '',
    professionalCertificate: existingBusinessProof.professionalCertificate instanceof File ? existingBusinessProof.professionalCertificate : null,
  });

  const [certificatePreview, setCertificatePreview] = useState(getInitialPreview());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to check if a file/URL is a PDF
  const isPDF = (fileOrUrl) => {
    if (!fileOrUrl) return false;
    if (fileOrUrl instanceof File) {
      return fileOrUrl.type === 'application/pdf';
    }
    if (typeof fileOrUrl === 'string') {
      return fileOrUrl.toLowerCase().endsWith('.pdf') || fileOrUrl.toLowerCase().includes('application/pdf');
    }
    return false;
  };

  // Helper function to check if a file/URL is an image
  const isImage = (fileOrUrl) => {
    if (!fileOrUrl) return false;
    if (fileOrUrl instanceof File) {
      return fileOrUrl.type.startsWith('image/');
    }
    if (typeof fileOrUrl === 'string') {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      return imageExtensions.some(ext => fileOrUrl.toLowerCase().includes(ext));
    }
    return false;
  };

  // Load existing data from API if available and not in state
  useEffect(() => {
    const loadExistingData = async () => {
      if (tourBusinessId && userId && !existingBusinessProof.businessLegalName) {
        setLoading(true);
        try {
          const businessProofRes = await apiClient.get(`/tours/setup/business-proof?tourBusinessId=${tourBusinessId}`);
          if (businessProofRes.data?.data) {
            const proof = businessProofRes.data.data;
            const certificateUrl = proof.professional_certificate_url || proof.professional_certificate;
            setFormData({
              businessLegalName: proof.business_legal_name || step2Data.tourBusinessName || '',
              professionalCertificate: null, // We'll use the URL for preview
            });
            if (certificateUrl) {
              // Set the preview URL - this will be used to display the image
              setCertificatePreview(certificateUrl);
              // Also store the URL in formData for reference
              setFormData(prev => ({
                ...prev,
                certificateUrl: certificateUrl
              }));
            }
          }
        } catch (err) {
          console.warn('Could not load business proof:', err);
        } finally {
          setLoading(false);
        }
      } else if (existingBusinessProof.professionalCertificate || existingBusinessProof.professionalCertificateUrl) {
        // If we have existing data from state, ensure preview is set
        const certUrl = existingBusinessProof.professionalCertificateUrl || existingBusinessProof.professionalCertificate;
        if (typeof certUrl === 'string') {
          setCertificatePreview(certUrl);
        } else if (certUrl instanceof File) {
          setCertificatePreview(URL.createObjectURL(certUrl));
        }
      }
    };

    loadExistingData();
  }, [tourBusinessId, userId, existingBusinessProof.businessLegalName, existingBusinessProof.professionalCertificate, step2Data.tourBusinessName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (PDF, JPG, PNG)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      professionalCertificate: file
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCertificatePreview('pdf');
    }
  };

  const removeCertificate = () => {
    setFormData(prev => ({
      ...prev,
      professionalCertificate: null
    }));
    setCertificatePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.businessLegalName.trim()) {
      newErrors.businessLegalName = 'Business legal name is required';
    }
    if (!formData.professionalCertificate && !certificatePreview) {
      newErrors.professionalCertificate = 'Professional certificate is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!tourBusinessId) {
        throw new Error('Tour business ID is required. Please go back and complete the previous steps.');
      }
      
      // Save business proof - only upload new file if it's a File object
      await tourPackageSetupService.saveBusinessProof({
        tourBusinessId: parseInt(tourBusinessId),
        businessLegalName: formData.businessLegalName,
        professionalCertificate: formData.professionalCertificate instanceof File ? formData.professionalCertificate : undefined,
        professionalCertificateUrl: !(formData.professionalCertificate instanceof File) && certificatePreview ? certificatePreview : undefined,
        userId
      });
      
      toast.success('Business proof saved successfully');
      
      // Navigate to review step - preserve all existing data
      navigate('/tours/setup/review', {
        state: {
          ...location.state,
          step2Data: location.state?.step2Data || step2Data,
          businessOwnerInfo: location.state?.businessOwnerInfo || businessOwnerInfo,
          identityProof: location.state?.identityProof || identityProof,
          businessProof: {
            businessLegalName: formData.businessLegalName,
            professionalCertificate: formData.professionalCertificate || certificatePreview,
            professionalCertificateUrl: certificatePreview && typeof certificatePreview === 'string' ? certificatePreview : null
          },
          userId,
          tourBusinessId
        }
      });
    } catch (error) {
      console.error('Error saving business proof:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save business proof. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/tours/setup/prove-identity', {
      state: {
        ...location.state,
        step2Data: location.state?.step2Data || step2Data,
        businessOwnerInfo: location.state?.businessOwnerInfo || businessOwnerInfo,
        identityProof: location.state?.identityProof || identityProof,
        businessProof: {
          businessLegalName: formData.businessLegalName,
          professionalCertificate: formData.professionalCertificate || certificatePreview,
          professionalCertificateUrl: certificatePreview && typeof certificatePreview === 'string' ? certificatePreview : null
        },
        userId,
        tourBusinessId
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
            {/* Mobile: Simple progress bar */}
            <div className="block md:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#1f6f31' }}>
                  Step 4 of 6: Prove Your Business
                </span>
                <span className="text-xs text-gray-500">67%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: '#3CAF54', width: '67%' }}
                ></div>
              </div>
            </div>

            {/* Desktop: Show all steps */}
            <div className="hidden md:flex items-center justify-center mb-4">
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
                  4
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  5
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  6
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium hidden md:block" style={{ color: '#1f6f31' }}>Step 4 of 6: Prove Your Business</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Prove Your Business
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide your business legal information and professional certificate.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Legal Name */}
              <div>
                <label htmlFor="businessLegalName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Legal Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="businessLegalName"
                    name="businessLegalName"
                    value={formData.businessLegalName}
                    onChange={handleChange}
                    placeholder="Enter your business legal name as registered"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.businessLegalName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.businessLegalName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessLegalName}</p>
                )}
              </div>

              {/* Professional Certificate Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Professional Certificate *
                </label>
                {!formData.professionalCertificate && !certificatePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificateChange}
                      className="hidden"
                      id="certificate-input"
                    />
                    <label
                      htmlFor="certificate-input"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700 mb-1">Click to upload professional certificate</span>
                      <span className="text-xs text-gray-500">PDF, JPG, or PNG (Max 5MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          // Determine the image source
                          let imageSrc = null;
                          if (certificatePreview && isImage(certificatePreview)) {
                            imageSrc = certificatePreview;
                          } else if (formData.professionalCertificate && isImage(formData.professionalCertificate)) {
                            imageSrc = formData.professionalCertificate instanceof File 
                              ? URL.createObjectURL(formData.professionalCertificate) 
                              : formData.professionalCertificate;
                          }
                          
                          return imageSrc ? (
                            <img 
                              src={imageSrc} 
                              alt="Certificate" 
                              className="h-16 w-16 object-cover rounded" 
                              onError={(e) => {
                                // If image fails to load, show document icon
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null;
                        })() || (
                          <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                            <FileCheck className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formData.professionalCertificate?.name || (isPDF(certificatePreview || formData.professionalCertificate) ? 'Professional Certificate (PDF)' : 'Professional Certificate')}
                          </p>
                          {formData.professionalCertificate?.size ? (
                          <p className="text-xs text-gray-500">
                            {(formData.professionalCertificate.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          ) : certificatePreview && (
                            <p className="text-xs text-gray-500">
                              {isPDF(certificatePreview) ? 'PDF document uploaded' : 'Previously uploaded'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleCertificateChange}
                          className="hidden"
                          id="certificate-replace-input"
                        />
                        <label
                          htmlFor="certificate-replace-input"
                          className="px-3 py-1 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer border border-green-300 rounded hover:bg-green-50 transition-colors"
                        >
                          Replace
                        </label>
                      <button
                        type="button"
                        onClick={removeCertificate}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      </div>
                    </div>
                  </div>
                )}
                {errors.professionalCertificate && (
                  <p className="mt-1 text-sm text-red-600">{errors.professionalCertificate}</p>
                )}
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <div className="flex gap-4">
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
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <span>Saving...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
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

