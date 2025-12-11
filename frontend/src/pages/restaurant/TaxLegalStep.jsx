import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, FileText, Building2, Percent, Upload, X } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';

export default function TaxLegalStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
  const media = location.state?.media || {};
  const paymentsPricing = location.state?.paymentsPricing || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Get restaurantId from multiple sources
  const restaurantIdFromState = location.state?.restaurantId;
  const restaurantIdFromStorage = localStorage.getItem('restaurant_id');
  const progressFromStorage = localStorage.getItem('restaurant_setup_progress');
  
  let restaurantId = restaurantIdFromState || restaurantIdFromStorage;
  if (!restaurantId && progressFromStorage) {
    try {
      const progress = JSON.parse(progressFromStorage);
      restaurantId = progress.restaurant_id;
    } catch (e) {
      console.error('Error parsing progress from storage:', e);
    }
  }

  // Store restaurantId in localStorage
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('restaurant_id', restaurantId);
    }
  }, [restaurantId]);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    taxIdentificationNumber: '',
    registeredBusinessName: '',
    businessLicenseFile: null,
    businessLicensePreview: null,
    taxRegistrationCertificateFile: null,
    taxRegistrationCertificatePreview: null,
    vatTaxRate: '',
    pricesVatInclusive: '',
    taxType: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Load saved progress data when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!restaurantId) return;

      setIsLoadingProgress(true);
      try {
        const progress = await restaurantSetupService.getSetupProgress(restaurantId);
        
        if (progress && progress.step_data && progress.step_data.step_8) {
          const savedStep8Data = progress.step_data.step_8;
          
          setFormData(prev => ({
            ...prev,
            taxIdentificationNumber: savedStep8Data.taxIdentificationNumber || prev.taxIdentificationNumber,
            registeredBusinessName: savedStep8Data.registeredBusinessName || prev.registeredBusinessName,
            vatTaxRate: savedStep8Data.vatTaxRate || prev.vatTaxRate,
            pricesVatInclusive: savedStep8Data.pricesVatInclusive || prev.pricesVatInclusive,
            taxType: savedStep8Data.taxType || prev.taxType
          }));
        }
      } catch (error) {
        console.log('No saved progress found or error loading:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [restaurantId]);

  const businessLicenseInputRef = useRef(null);
  const taxCertificateInputRef = useRef(null);

  const taxTypes = [
    { value: '', label: '-- Select Tax Type --' },
    { value: 'vat', label: 'VAT (Value Added Tax)' },
    { value: 'none', label: 'None' }
  ];

  const vatInclusiveOptions = [
    { value: '', label: '-- Select --' },
    { value: 'inclusive', label: 'VAT Inclusive (prices include tax)' },
    { value: 'exclusive', label: 'VAT Exclusive (tax added at checkout)' }
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert('File size should be less than 10MB');
          return;
        }
        
        if (name === 'businessLicenseFile') {
          setFormData(prev => ({
            ...prev,
            businessLicenseFile: file
          }));
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({
              ...prev,
              businessLicensePreview: reader.result
            }));
          };
          reader.readAsDataURL(file);
        } else if (name === 'taxRegistrationCertificateFile') {
          setFormData(prev => ({
            ...prev,
            taxRegistrationCertificateFile: file
          }));
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({
              ...prev,
              taxRegistrationCertificatePreview: reader.result
            }));
          };
          reader.readAsDataURL(file);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const removeFile = (fileType) => {
    if (fileType === 'businessLicense') {
      setFormData(prev => ({
        ...prev,
        businessLicenseFile: null,
        businessLicensePreview: null
      }));
      if (businessLicenseInputRef.current) {
        businessLicenseInputRef.current.value = '';
      }
    } else if (fileType === 'taxCertificate') {
      setFormData(prev => ({
        ...prev,
        taxRegistrationCertificateFile: null,
        taxRegistrationCertificatePreview: null
      }));
      if (taxCertificateInputRef.current) {
        taxCertificateInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!formData.taxIdentificationNumber.trim()) {
      newErrors.taxIdentificationNumber = 'Tax Identification Number is required';
    }
    
    if (!formData.registeredBusinessName.trim()) {
      newErrors.registeredBusinessName = 'Registered business name is required';
    }
    
    if (!formData.businessLicenseFile) {
      newErrors.businessLicenseFile = 'Please upload business license';
    }
    
    if (!formData.taxRegistrationCertificateFile) {
      newErrors.taxRegistrationCertificateFile = 'Please upload tax registration certificate';
    }
    
    if (!formData.taxType) {
      newErrors.taxType = 'Please select tax type';
    }
    
    // If tax type is not "none", require VAT/tax rate and VAT inclusive/exclusive
    if (formData.taxType && formData.taxType !== 'none') {
      if (!formData.vatTaxRate.trim()) {
        newErrors.vatTaxRate = 'VAT/Tax rate is required';
      }
      if (!formData.pricesVatInclusive) {
        newErrors.pricesVatInclusive = 'Please specify if prices are VAT inclusive or exclusive';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!restaurantId) {
      setSubmitError('Restaurant ID is missing. Please go back to the previous step and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Save tax & legal information via API
      await restaurantSetupService.saveTaxLegal(restaurantId, formData);
      
      // Navigate to next setup step (Menu Setup)
      navigate('/restaurant/setup/menu', {
        state: {
          ...location.state,
          locationData,
          step2Data,
          businessDetails,
          media,
          paymentsPricing,
          taxLegal: formData,
          userId,
          email,
          userName,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving tax & legal information:', error);
      setSubmitError(error.message || 'Failed to save tax & legal information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/setup/capacity', {
      state: {
        ...location.state,
        restaurantId: restaurantId // Pass restaurantId when going back
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
                  5
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  6
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  7
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Setup Step 5 of 7</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Tax & Legal Information
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide your restaurant's tax and legal documentation for verification.
            </p>

            {isLoadingProgress && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Loading your saved progress...</p>
              </div>
            )}

            {!restaurantId && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Restaurant ID is missing. Please go back to the previous step and complete the account creation process.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Tax Information Section */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Information</h2>
                
                <div className="space-y-4">
                  {/* Tax Identification Number */}
                  <div>
                    <label htmlFor="taxIdentificationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Identification Number (TIN) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="taxIdentificationNumber"
                        name="taxIdentificationNumber"
                        value={formData.taxIdentificationNumber}
                        onChange={handleChange}
                        placeholder="Enter your TIN"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                          errors.taxIdentificationNumber ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                        }`}
                      />
                    </div>
                    {errors.taxIdentificationNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.taxIdentificationNumber}</p>
                    )}
                  </div>

                  {/* Registered Business Name */}
                  <div>
                    <label htmlFor="registeredBusinessName" className="block text-sm font-medium text-gray-700 mb-2">
                      Registered Business Name (as per tax records) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="registeredBusinessName"
                        name="registeredBusinessName"
                        value={formData.registeredBusinessName}
                        onChange={handleChange}
                        placeholder="Enter registered business name"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                          errors.registeredBusinessName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                        }`}
                      />
                    </div>
                    {errors.registeredBusinessName && (
                      <p className="mt-1 text-sm text-red-600">{errors.registeredBusinessName}</p>
                    )}
                  </div>

                  {/* Tax Type */}
                  <div>
                    <label htmlFor="taxType" className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Type *
                    </label>
                    <select
                      id="taxType"
                      name="taxType"
                      value={formData.taxType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.taxType ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    >
                      {taxTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.taxType && (
                      <p className="mt-1 text-sm text-red-600">{errors.taxType}</p>
                    )}
                  </div>

                  {/* VAT/Tax Rate - Conditional */}
                  {formData.taxType && formData.taxType !== 'none' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="vatTaxRate" className="block text-sm font-medium text-gray-700 mb-2">
                          VAT or Tax Rate (%) *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Percent className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="vatTaxRate"
                            name="vatTaxRate"
                            value={formData.vatTaxRate}
                            onChange={handleChange}
                            placeholder="e.g., 18"
                            min="0"
                            max="100"
                            step="0.01"
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                              errors.vatTaxRate ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                            }`}
                          />
                        </div>
                        {errors.vatTaxRate && (
                          <p className="mt-1 text-sm text-red-600">{errors.vatTaxRate}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="pricesVatInclusive" className="block text-sm font-medium text-gray-700 mb-2">
                          Prices VAT-Inclusive or Exclusive *
                        </label>
                        <select
                          id="pricesVatInclusive"
                          name="pricesVatInclusive"
                          value={formData.pricesVatInclusive}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                            errors.pricesVatInclusive ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                          }`}
                        >
                          {vatInclusiveOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.pricesVatInclusive && (
                          <p className="mt-1 text-sm text-red-600">{errors.pricesVatInclusive}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business License Section */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business License</h2>
                
                <div className="space-y-4">
                  {/* Business License Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business License Upload *
                      <span className="text-gray-500 font-normal ml-2">(PDF, JPG, PNG - max 10MB)</span>
                    </label>
                    {formData.businessLicensePreview ? (
                      <div className="relative">
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formData.businessLicenseFile?.name || 'Business License'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(formData.businessLicenseFile?.size / 1024 / 1024).toFixed(2)} MB
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
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG format</p>
                      </div>
                    )}
                    <input
                      ref={businessLicenseInputRef}
                      type="file"
                      name="businessLicenseFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      className="hidden"
                    />
                    {errors.businessLicenseFile && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessLicenseFile}</p>
                    )}
                  </div>

                  {/* Tax Registration Certificate Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Registration Certificate Upload *
                      <span className="text-gray-500 font-normal ml-2">(PDF, JPG, PNG - max 10MB)</span>
                    </label>
                    {formData.taxRegistrationCertificatePreview ? (
                      <div className="relative">
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formData.taxRegistrationCertificateFile?.name || 'Tax Registration Certificate'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(formData.taxRegistrationCertificateFile?.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('taxCertificate')}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => taxCertificateInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload tax registration certificate</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG format</p>
                      </div>
                    )}
                    <input
                      ref={taxCertificateInputRef}
                      type="file"
                      name="taxRegistrationCertificateFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      className="hidden"
                    />
                    {errors.taxRegistrationCertificateFile && (
                      <p className="mt-1 text-sm text-red-600">{errors.taxRegistrationCertificateFile}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

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
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <span>Uploading...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
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

