import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';
import SetupProgressIndicator from '../../components/restaurant/SetupProgressIndicator';

export default function MediaStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
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

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load saved images from restaurant (if already uploaded)
  useEffect(() => {
    const loadSavedMedia = async () => {
      if (!restaurantId) return;

      setIsLoadingProgress(true);
      try {
        // Get restaurant data which includes images
        const restaurant = await restaurantSetupService.getRestaurant(restaurantId);
        
        console.log('📸 Loaded restaurant data:', restaurant);
        console.log('📸 Restaurant images:', restaurant?.images);
        
        if (restaurant && restaurant.images && Array.isArray(restaurant.images)) {
          // Handle both possible image structures: {image_url} or {url}
          // Separate logo from gallery images
          // Logo: image_type = 'logo' OR is_primary = 1
          // Gallery: image_type = 'gallery' OR (not logo and not primary)
          const logoImage = restaurant.images.find(img => 
            img.image_type === 'logo' || 
            img.is_primary === 1 || 
            img.is_primary === true ||
            (img.entity_type === 'logo')
          );
          
          const galleryImagesList = restaurant.images.filter(img => 
            (img.image_type === 'gallery') || 
            (img.image_type !== 'logo' && 
             img.is_primary !== 1 && 
             img.is_primary !== true &&
             img.entity_type !== 'logo')
          );

          console.log('📸 Logo image found:', logoImage);
          console.log('📸 Gallery images found:', galleryImagesList);

          // Get image URL - try both image_url and url fields
          if (logoImage) {
            const logoUrl = logoImage.image_url || logoImage.url || logoImage.imageUrl;
            if (logoUrl) {
              // Construct full URL if it's a relative path
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
              const fullUrl = logoUrl.startsWith('http') 
                ? logoUrl 
                : `${apiBaseUrl.replace('/api/v1', '')}${logoUrl}`;
              console.log('📸 Setting logo preview:', fullUrl);
              setLogoPreview(fullUrl);
              // Set a marker to indicate logo exists (even though it's not a file object)
              // This allows validation to pass when logo is loaded from database
              setLogo('existing'); // Use a marker value to indicate existing logo
              // This allows validation to pass when logo is loaded from database
              setLogo('existing'); // Use a marker value to indicate existing logo
            }
          }

          if (galleryImagesList.length > 0) {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
            const previews = galleryImagesList
              .map(img => img.image_url || img.url || img.imageUrl)
              .filter(Boolean)
              .map(url => {
                if (url.startsWith('http')) {
                  return url;
                }
                // Remove /api/v1 from base URL for image paths
                return `${apiBaseUrl.replace('/api/v1', '')}${url}`;
              });
            console.log('📸 Setting gallery previews:', previews);
            setGalleryPreviews(previews);
          }
        }
      } catch (error) {
        console.error('❌ Error loading saved media:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedMedia();
  }, [restaurantId]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Logo file size should be less than 10MB. Please compress the image and try again.');
        return;
      }
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB. Please compress the image and try again.`);
        return false;
      }
      return true;
    });

    if (galleryImages.length + validFiles.length > 20) {
      alert('Maximum 20 gallery images allowed');
      return;
    }

    const newImages = [...galleryImages, ...validFiles];
    setGalleryImages(newImages);

    // Create previews for new images
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - logo is required (either new upload or existing from database)
    if (!logo && !logoPreview) {
      setSubmitError('Please upload a front image');
      return;
    }

    if (!restaurantId) {
      setSubmitError('Restaurant ID is missing. Please go back to the previous step and try again.');
      return;
    }

    // Save progress before submitting (for data persistence)
    try {
      await restaurantSetupService.saveStepData(restaurantId, 5, {
        hasLogo: !!logo,
        hasGalleryImages: galleryImages.length > 0,
        galleryImageCount: galleryImages.length
      });
    } catch (progressError) {
      console.log('Progress save warning (non-blocking):', progressError);
      // Don't block submission if progress save fails
    }

    setIsSubmitting(true);
    setSubmitError('');
    setUploadProgress(0);

    try {
      // Save media via API with upload progress tracking
      // Only send logo if it's a File object (new upload), not if it's 'existing' marker
      await restaurantSetupService.saveMedia(restaurantId, {
        logo: logo instanceof File ? logo : null, // Only send file if it's a new upload
        galleryImages
      }, (progress) => {
        setUploadProgress(progress);
      });

      // Navigate to next setup step (Capacity)
      navigate('/restaurant/setup/capacity', {
        state: {
          ...location.state,
          locationData,
          step2Data,
          businessDetails,
          media: {
            logo,
            galleryImages
          },
          userId,
          email,
          userName,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving media:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save media. Please try again.';
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          errorMessage = 'Upload timed out. Please check your internet connection and try again. If the problem persists, try uploading smaller images (under 5MB each).';
        } else if (error.message.includes('Network Error') || error.message.includes('network')) {
          errorMessage = 'Network error occurred. Please check your internet connection and try again. If the problem persists, try uploading smaller images or using a different network.';
        } else if (error.message.includes('too large')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      } else if (error.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSubmitError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/setup/business-details', {
      state: {
        location: location.state?.location || '',
        locationData: locationData,
        step2Data: step2Data,
        businessDetails: businessDetails,
        userId,
        email,
        userName,
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
          <SetupProgressIndicator currentStepKey="media" currentStepNumber={5} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Camera className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Media
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Upload your restaurant's logo and gallery images to showcase your establishment.
            </p>

            {isLoadingProgress && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Loading your saved images...</p>
              </div>
            )}

            {isSubmitting && uploadProgress > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600 font-medium">Uploading images...</p>
                  <span className="text-sm text-blue-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
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
              {/* Front Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Front Image *
                  <span className="text-gray-500 font-normal ml-2">(Recommended: Square, 500x500px, max 10MB)</span>
                </label>
                <div className="flex items-start gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 text-center px-2">Click to upload</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{logo ? 'Change Front Image' : 'Upload Front Image'}</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Your front image will be displayed on your listing and in search results.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gallery Images
                  <span className="text-gray-500 font-normal ml-2">(Optional, up to 20 images, max 10MB each)</span>
                </label>
                <div>
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium mb-1">
                      {galleryPreviews.length === 0 
                        ? 'Click to upload gallery images' 
                        : `Add more images (${galleryPreviews.length}/20)`
                      }
                    </p>
                    <p className="text-sm text-gray-500">Showcase your restaurant's atmosphere, dishes, and ambiance</p>
                  </div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
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

