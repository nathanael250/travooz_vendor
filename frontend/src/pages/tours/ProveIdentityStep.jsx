import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Globe, Upload, X, FileCheck, CreditCard } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';
import toast from 'react-hot-toast';

export default function ProveIdentityStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const businessOwnerInfo = location.state?.businessOwnerInfo || {};
  const userId = location.state?.userId;
  const tourBusinessId = location.state?.tourBusinessId || localStorage.getItem('tour_business_id');

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    idCountry: '',
    idCardPhoto: null,
  });

  const [idCardPreview, setIdCardPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Common countries list
  const countries = [
    'Rwanda',
    'Uganda',
    'Tanzania',
    'Kenya',
    'Burundi',
    'Ethiopia',
    'South Africa',
    'Nigeria',
    'Ghana',
    'United States',
    'United Kingdom',
    'France',
    'Germany',
    'Other'
  ];

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

  const handleIdCardChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (JPG, PNG, PDF)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      idCardPhoto: file
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setIdCardPreview('pdf');
    }
  };

  const removeIdCard = () => {
    setFormData(prev => ({
      ...prev,
      idCardPhoto: null
    }));
    setIdCardPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.idCountry) {
      newErrors.idCountry = 'Please select the country where your ID is registered';
    }
    if (!formData.idCardPhoto) {
      newErrors.idCardPhoto = 'ID card photo is required';
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
      
      // Save identity proof
      await tourPackageSetupService.saveIdentityProof({
        tourBusinessId: parseInt(tourBusinessId),
        idCountry: formData.idCountry,
        idCardPhoto: formData.idCardPhoto,
        userId
      });
      
      toast.success('Identity proof saved successfully');
      
      // Navigate to next step (Prove Your Business)
      navigate('/tours/setup/prove-business', {
        state: {
          ...location.state,
          businessOwnerInfo,
          identityProof: {
            idCountry: formData.idCountry,
            idCardPhoto: formData.idCardPhoto
          },
          userId,
          tourBusinessId
        }
      });
    } catch (error) {
      console.error('Error saving identity proof:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save identity proof. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/tours/setup/business-owner-info', {
      state: {
        ...location.state,
        businessOwnerInfo
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
                  3
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
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
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 3 of 6: Prove Your Identity</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Prove Your Identity
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide your identity information for verification purposes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country where ID is registered */}
              <div>
                <label htmlFor="idCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Country where your ID is registered *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="idCountry"
                    name="idCountry"
                    value={formData.idCountry}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all appearance-none bg-white ${
                      errors.idCountry ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                {errors.idCountry && (
                  <p className="mt-1 text-sm text-red-600">{errors.idCountry}</p>
                )}
              </div>

              {/* ID Card Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload ID Card Photo *
                </label>
                {!formData.idCardPhoto ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleIdCardChange}
                      className="hidden"
                      id="idCard-input"
                    />
                    <label
                      htmlFor="idCard-input"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700 mb-1">Click to upload ID card</span>
                      <span className="text-xs text-gray-500">PDF, JPG, or PNG (Max 5MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {idCardPreview && idCardPreview !== 'pdf' ? (
                          <img src={idCardPreview} alt="ID Card" className="h-16 w-16 object-cover rounded" />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                            <FileCheck className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formData.idCardPhoto.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.idCardPhoto.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeIdCard}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.idCardPhoto && (
                  <p className="mt-1 text-sm text-red-600">{errors.idCardPhoto}</p>
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

