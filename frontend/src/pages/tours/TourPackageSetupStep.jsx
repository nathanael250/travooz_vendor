import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, MapPin, Calendar, DollarSign, Image as ImageIcon, Plus, X, Upload } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';
import toast from 'react-hot-toast';

export default function TourPackageSetupStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const businessDetails = location.state?.businessDetails || {};
  const taxPayment = location.state?.taxPayment || {};
  const userId = location.state?.userId;

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [createTourNow, setCreateTourNow] = useState(false);
  const [formData, setFormData] = useState({
    packageTitle: '',
    description: '',
    destinations: [''],
    duration: '',
    price: '',
    currency: 'RWF',
    availabilityStartDate: '',
    availabilityEndDate: '',
    inclusions: [''],
    exclusions: [''],
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
    
    // Clear error for this field
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      coverPhoto: file
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    // Navigate to review step without creating tour
    navigate('/tours/setup/review', {
      state: {
        ...location.state,
        businessDetails,
        taxPayment,
        tourPackage: null,
        userId
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!createTourNow) {
      handleSkip();
      return;
    }

    // Validation
    const newErrors = {};
    if (!formData.packageTitle.trim()) {
      newErrors.packageTitle = 'Package title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (formData.destinations.filter(d => d.trim()).length === 0) {
      newErrors.destinations = 'At least one destination is required';
    }
    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
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

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Filter out empty array items
      const tourData = {
        ...formData,
        destinations: formData.destinations.filter(d => d.trim()),
        inclusions: formData.inclusions.filter(i => i.trim()),
        exclusions: formData.exclusions.filter(e => e.trim()),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        userId
      };

      // Create tour package via API
      await tourPackageSetupService.createTourPackage(tourData);
      
      toast.success('Tour package created successfully');
      
      // Navigate to review step
      navigate('/tours/setup/review', {
        state: {
          ...location.state,
          businessDetails,
          taxPayment,
          tourPackage: tourData,
          userId
        }
      });
    } catch (error) {
      console.error('Error creating tour package:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create tour package. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/tours/setup/tax-payment', {
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
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 6 of 9: Tour Package Setup (Optional)</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your First Tour Package
            </h1>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>You can skip this step</strong> and create your first tour package later in your vendor dashboard. Would you like to do it now?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Create Tour Now Option */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createTourNow}
                    onChange={(e) => setCreateTourNow(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    style={{ accentColor: '#3CAF54' }}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Yes, I would like to create my first tour package now
                  </span>
                </label>
              </div>

              {/* Tour Package Form - Only show if createTourNow is true */}
              {createTourNow && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  {/* Package Title */}
                  <div>
                    <label htmlFor="packageTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Package Title *
                    </label>
                    <input
                      type="text"
                      id="packageTitle"
                      name="packageTitle"
                      value={formData.packageTitle}
                      onChange={handleChange}
                      placeholder="e.g., 3-Day Gorilla Trekking Adventure"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.packageTitle ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                    {errors.packageTitle && (
                      <p className="mt-1 text-sm text-red-600">{errors.packageTitle}</p>
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
                      placeholder="Describe your tour package in detail..."
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 50 characters</p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Destinations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destinations *
                    </label>
                    {formData.destinations.map((destination, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleArrayChange(index, 'destinations', e.target.value)}
                            placeholder="Enter destination"
                            className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                          />
                        </div>
                        {formData.destinations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'destinations')}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('destinations')}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Destination
                    </button>
                    {errors.destinations && (
                      <p className="mt-1 text-sm text-red-600">{errors.destinations}</p>
                    )}
                  </div>

                  {/* Duration and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (Days) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          min="1"
                          placeholder="e.g., 3"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                            errors.duration ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                          }`}
                        />
                      </div>
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
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
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className={`flex-1 pl-4 pr-4 py-3 border-2 rounded-r-lg focus:outline-none transition-all ${
                              errors.price ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                            }`}
                          />
                        </div>
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>
                  </div>

                  {/* Availability Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {/* Inclusions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inclusions
                    </label>
                    {formData.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={inclusion}
                          onChange={(e) => handleArrayChange(index, 'inclusions', e.target.value)}
                          placeholder="e.g., Accommodation, Meals, Guide"
                          className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                        />
                        {formData.inclusions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'inclusions')}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('inclusions')}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Inclusion
                    </button>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exclusions
                    </label>
                    {formData.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={exclusion}
                          onChange={(e) => handleArrayChange(index, 'exclusions', e.target.value)}
                          placeholder="e.g., Flights, Travel Insurance"
                          className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                        />
                        {formData.exclusions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'exclusions')}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('exclusions')}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Exclusion
                    </button>
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
                {!createTourNow && (
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
                      <span>{createTourNow ? 'Create & Continue' : 'Continue'}</span>
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

