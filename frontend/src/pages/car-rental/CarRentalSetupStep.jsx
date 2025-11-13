import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, MapPin, Calendar, DollarSign, Upload, Plus, X } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import toast from 'react-hot-toast';
import carRentalSetupService from '../../services/carRentalSetupService';

export default function CarRentalSetupStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const businessDetails = location.state?.businessDetails || {};
  const taxPayment = location.state?.taxPayment || {};
  const userId = location.state?.userId;
  const carRentalBusinessId = location.state?.carRentalBusinessId || localStorage.getItem('car_rental_business_id');
  const resolvedUserId = userId || localStorage.getItem('car_rental_user_id');

  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [createCarRentalNow, setCreateCarRentalNow] = useState(false);
  const [formData, setFormData] = useState({
    carTitle: '',
    description: '',
    carTypes: [''],
    dailyRate: '',
    currency: 'RWF',
    availabilityStartDate: '',
    availabilityEndDate: '',
    features: [''],
    coverPhoto: null,
  });

  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayChange = (index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      coverPhoto: file
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const convertFileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const handleSkip = () => {
    navigate('/car-rental/setup/review', {
      state: {
        ...location.state,
        businessDetails,
        taxPayment,
        carRental: null,
        userId: resolvedUserId,
        carRentalBusinessId
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!createCarRentalNow) {
      handleSkip();
      return;
    }

    const newErrors = {};
    if (!formData.carTitle.trim()) {
      newErrors.carTitle = 'Car title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.dailyRate || parseFloat(formData.dailyRate) <= 0) {
      newErrors.dailyRate = 'Valid daily rate is required';
    }
    if (!formData.availabilityStartDate) {
      newErrors.availabilityStartDate = 'Start date is required';
    }
    if (!formData.availabilityEndDate) {
      newErrors.availabilityEndDate = 'End date is required';
    }
    if (!formData.coverPhoto) {
      newErrors.coverPhoto = 'Cover photo is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!carRentalBusinessId) {
      toast.error('Unable to locate your car rental registration. Please restart the onboarding flow.');
      return;
    }

    if (!resolvedUserId) {
      toast.error('Unable to determine the current user. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const coverPhotoBase64 = formData.coverPhoto ? await convertFileToBase64(formData.coverPhoto) : null;

      const cleanCarTypes = (formData.carTypes || []).filter(item => item && item.trim().length > 0);
      const cleanFeatures = (formData.features || []).filter(item => item && item.trim().length > 0);

      await carRentalSetupService.createCarRental({
        carRentalBusinessId: Number(carRentalBusinessId),
        userId: resolvedUserId,
        carRental: {
          carTitle: formData.carTitle,
          description: formData.description,
          carTypes: cleanCarTypes,
          dailyRate: formData.dailyRate,
          currency: formData.currency,
          availabilityStartDate: formData.availabilityStartDate,
          availabilityEndDate: formData.availabilityEndDate,
          features: cleanFeatures,
          coverPhoto: coverPhotoBase64
        }
      });
      
      toast.success('Car rental created successfully');
      
      navigate('/car-rental/setup/review', {
        state: {
          ...location.state,
          businessDetails,
          taxPayment,
          carRental: {
            ...formData,
            carTypes: cleanCarTypes,
            features: cleanFeatures,
            coverPhoto: coverPhotoBase64
          },
          userId: resolvedUserId,
          carRentalBusinessId
        }
      });
    } catch (error) {
      console.error('Error creating car rental:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create car rental. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/car-rental/setup/tax-payment', {
      state: {
        ...location.state,
        businessDetails,
        taxPayment
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
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  9
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 6 of 9: Car Rental Setup (Optional)</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your First Car Rental
            </h1>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>You can skip this step</strong> and create your first car rental later in your vendor dashboard. Would you like to do it now?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Create Car Rental Now Option */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createCarRentalNow}
                    onChange={(e) => setCreateCarRentalNow(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    style={{ accentColor: '#3CAF54' }}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Yes, I would like to create my first car rental now
                  </span>
                </label>
              </div>

              {/* Car Rental Form - Only show if createCarRentalNow is true */}
              {createCarRentalNow && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  {/* Car Title */}
                  <div>
                    <label htmlFor="carTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Car Title *
                    </label>
                    <input
                      type="text"
                      id="carTitle"
                      name="carTitle"
                      value={formData.carTitle}
                      onChange={handleChange}
                      placeholder="e.g., 2023 Toyota RAV4"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.carTitle ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                    {errors.carTitle && (
                      <p className="mt-1 text-sm text-red-600">{errors.carTitle}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe your car rental in detail..."
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 50 characters</p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Daily Rate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Rate *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex">
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="px-3 py-3 border-2 border-r-0 rounded-l-lg focus:outline-none border-gray-300 bg-gray-50"
                          >
                            <option value="RWF">RWF</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                          <input
                            type="number"
                            id="dailyRate"
                            name="dailyRate"
                            value={formData.dailyRate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className={`flex-1 pl-4 pr-4 py-3 border-2 rounded-r-lg focus:outline-none transition-all ${
                              errors.dailyRate ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                            }`}
                          />
                        </div>
                      </div>
                      {errors.dailyRate && (
                        <p className="mt-1 text-sm text-red-600">{errors.dailyRate}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="availabilityStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Availability Start Date *
                      </label>
                      <input
                        type="date"
                        id="availabilityStartDate"
                        name="availabilityStartDate"
                        value={formData.availabilityStartDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                          errors.availabilityStartDate ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                        }`}
                      />
                      {errors.availabilityStartDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.availabilityStartDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Availability End Date */}
                  <div>
                    <label htmlFor="availabilityEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Availability End Date *
                    </label>
                    <input
                      type="date"
                      id="availabilityEndDate"
                      name="availabilityEndDate"
                      value={formData.availabilityEndDate}
                      onChange={handleChange}
                      min={formData.availabilityStartDate}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.availabilityEndDate ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                    {errors.availabilityEndDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.availabilityEndDate}</p>
                    )}
                  </div>

                  {/* Cover Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Photo *
                    </label>
                    {!coverPhotoPreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverPhotoChange}
                          className="hidden"
                          id="coverPhoto-input"
                        />
                        <label
                          htmlFor="coverPhoto-input"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700 mb-1">Click to upload cover photo</span>
                          <span className="text-xs text-gray-500">JPG, PNG (Max 5MB)</span>
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={coverPhotoPreview} alt="Cover" className="h-20 w-20 object-cover rounded" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{formData.coverPhoto.name}</p>
                              <p className="text-xs text-gray-500">
                                {(formData.coverPhoto.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, coverPhoto: null }));
                              setCoverPhotoPreview(null);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.coverPhoto && (
                      <p className="mt-1 text-sm text-red-600">{errors.coverPhoto}</p>
                    )}
                  </div>
                </div>
              )}

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
                {!createCarRentalNow && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Skip for Now</span>
                    </div>
                  </button>
                )}
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
                      <span>{createCarRentalNow ? 'Create & Continue' : 'Continue'}</span>
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















