import { useEffect, useState } from 'react';
import { restaurantsAPI, imagesAPI } from '../../services/restaurantDashboardService';
import { Edit, Store, MapPin, Phone, Users, X, Image as ImageIcon, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

// Get backend base URL for static assets (remove /api/v1 if present)
const getBackendBaseURL = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  // Remove /api/v1 to get the base server URL
  return apiBase.replace(/\/api\/v1\/?$/, '');
};

// Helper function to normalize image URLs
const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // For relative paths starting with /uploads, use relative path in development
  // (so Vite proxy can handle it) or full URL in production
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  // In development, use relative paths so Vite proxy handles CORS
  // In production, use full backend URL
  if (import.meta.env.DEV && cleanPath.startsWith('/uploads')) {
    return cleanPath;
  }
  
  // For production or non-upload paths, use full backend URL
  const backendBase = getBackendBaseURL();
  return `${backendBase}${cleanPath}`;
};

const Restaurants = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 0,
    available_seats: 0,
    address: '',
    phone: '',
    status: 'active',
    image_url: '',
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (!restaurant?.images || restaurant.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % restaurant.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [restaurant?.images]);

  const fetchRestaurant = async () => {
    try {
      setFetching(true);
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      
      if (myRestaurant) {
        // Images might already be included in the response from backend
        let images = myRestaurant.images || [];
        
        // If no images in response, try fetching separately
        if (!images || images.length === 0) {
          try {
            const fetchedImages = await imagesAPI.getByEntity('restaurant', myRestaurant.id);
            images = Array.isArray(fetchedImages) ? fetchedImages : [];
            console.log('Fetched images separately:', images);
          } catch (error) {
            console.error('Error fetching images:', error);
            images = [];
          }
        } else {
          console.log('Images found in restaurant response:', images);
        }
        
        // Sort images by display_order, filter out invalid URLs, and normalize URLs
        const sortedImages = images
          .filter(img => img && img.image_url && img.image_url.trim() !== '')
          .map(img => ({
            ...img,
            image_url: normalizeImageUrl(img.image_url)
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        console.log('Final sorted images:', sortedImages);
        console.log('Image URLs (normalized):', sortedImages.map(img => img.image_url));
        console.log('Total images found:', images.length, 'Valid images:', sortedImages.length);
        console.log('Backend base URL:', getBackendBaseURL());
        
        setRestaurant({
          ...myRestaurant,
          images: sortedImages
        });
        
        // Set form data for editing
        setFormData({
          name: myRestaurant.name || '',
          description: myRestaurant.description || '',
          capacity: myRestaurant.capacity || 0,
          available_seats: myRestaurant.available_seats || 0,
          address: myRestaurant.address || '',
          phone: myRestaurant.phone || '',
          status: myRestaurant.status || 'active',
          image_url: myRestaurant.image_url || '',
        });
        
        // Load existing images for form (already normalized in sortedImages)
        const existingImages = sortedImages.map(img => img.image_url).filter(url => url) || [];
        setImagePreviews(existingImages);
      } else {
        setRestaurant(null);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to fetch restaurant information');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const restaurantData = {
        ...formData,
        image_url: formData.image_url || null,
        available_seats: formData.available_seats || formData.capacity,
      };
      
      await restaurantsAPI.update(restaurant.id, restaurantData);
      
      // Save images if any
      if (imagePreviews.length > 0) {
        try {
          const imagesToSave = imagePreviews.map((url, index) => ({
            image_url: url,
            display_order: index,
            is_primary: index === 0 ? true : false
          }));
          
          await imagesAPI.add('restaurant', restaurant.id, imagesToSave);
        } catch (imageError) {
          console.error('Error saving images:', imageError);
          toast.error('Restaurant updated but some images may not have been saved');
        }
      }

      toast.success('Restaurant information updated successfully');
      setDialogOpen(false);
      setIsEditing(false);
      fetchRestaurant();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error(error.message || 'Failed to update restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleCancel = () => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        capacity: restaurant.capacity || 0,
        available_seats: restaurant.available_seats || 0,
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        status: restaurant.status || 'active',
        image_url: restaurant.image_url || '',
      });
      // Normalize existing image URLs when loading for edit
      const existingImages = (restaurant.images || [])
        .map(img => normalizeImageUrl(img.image_url))
        .filter(url => url) || [];
      setImagePreviews(existingImages);
    }
    setIsEditing(false);
    setDialogOpen(false);
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_IMAGES = 2;
    const currentCount = imagePreviews.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed for restaurants`);
      e.target.value = '';
      return;
    }

    const validFiles = [];
    let invalidFiles = 0;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles++;
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles++;
        return;
      }

      validFiles.push(file);
    });

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be uploaded. Maximum ${MAX_IMAGES} images allowed.`);
    }

    if (invalidFiles > 0) {
      toast.error(`${invalidFiles} file(s) were invalid. Only images under 5MB are allowed.`);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const newPreviews = [];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        newPreviews.push(base64String);
        loadedCount++;
        
        if (loadedCount === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleSeatsChange = (value) => {
    const numValue = parseInt(value) || 0;
    const maxSeats = formData.capacity || 0;
    const newValue = Math.max(0, Math.min(numValue, maxSeats));
    setFormData({ ...formData, available_seats: newValue });
  };

  const handleSaveSeats = async () => {
    if (!restaurant) return;
    
    if (formData.available_seats < 0 || formData.available_seats > formData.capacity) {
      toast.error(`Seats must be between 0 and ${formData.capacity}`);
      return;
    }

    try {
      setLoading(true);
      await restaurantsAPI.update(restaurant.id, { available_seats: formData.available_seats });
      toast.success('Available seats updated successfully');
      fetchRestaurant();
    } catch (error) {
      console.error('Error updating seats:', error);
      toast.error('Failed to update available seats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
    }
    return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">Inactive</span>;
  };

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Restaurant Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't set up your restaurant yet. Please contact support to create your restaurant profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Restaurant</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage your restaurant information</p>
        </div>
        
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Restaurant
        </button>
      </div>

      {/* Restaurant Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Image Section */}
        {restaurant.images && restaurant.images.length > 0 && restaurant.images[currentImageIndex]?.image_url ? (
          <div className="relative h-64 bg-gray-100">
            <img
              key={`${restaurant.images[currentImageIndex]?.id || currentImageIndex}-${restaurant.images[currentImageIndex]?.image_url}`}
              src={restaurant.images[currentImageIndex]?.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', restaurant.images[currentImageIndex]?.image_url);
                console.error('Current image index:', currentImageIndex);
                console.error('All images:', restaurant.images);
                // Try to show next image if available
                if (restaurant.images.length > currentImageIndex + 1) {
                  setCurrentImageIndex(currentImageIndex + 1);
                } else if (currentImageIndex > 0) {
                  setCurrentImageIndex(0);
                } else {
                  e.target.style.display = 'none';
                }
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', restaurant.images[currentImageIndex]?.image_url);
              }}
            />
            {restaurant.images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 hover:bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center transition-opacity"
                  onClick={() => {
                    setCurrentImageIndex(prev => prev === 0 ? restaurant.images.length - 1 : prev - 1);
                  }}
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 hover:bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center transition-opacity"
                  onClick={() => {
                    setCurrentImageIndex(prev => (prev + 1) % restaurant.images.length);
                  }}
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {restaurant.images.length}
                </div>
              </>
            )}
          </div>
        ) : restaurant.image_url && restaurant.image_url.length > 100 && restaurant.image_url.startsWith('data:image') ? (
          <div className="h-64 bg-gray-100">
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No image available</p>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="p-6 space-y-6">
          {/* Name and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="text-gray-600">{restaurant.description}</p>
              )}
            </div>
            {getStatusBadge(restaurant.status)}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacity */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Capacity</p>
                <p className="text-lg font-semibold text-gray-900">{restaurant.capacity || 0} seats</p>
              </div>
            </div>

            {/* Available Seats */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Available Seats</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={restaurant.capacity || 0}
                    value={formData.available_seats || 0}
                    onChange={(e) => handleSeatsChange(e.target.value)}
                    onBlur={handleSaveSeats}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveSeats();
                      }
                    }}
                    className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                    title={`Available seats (max: ${restaurant.capacity || 0})`}
                  />
                  <button
                    onClick={handleSaveSeats}
                    disabled={loading}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Save"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            {restaurant.address && (
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-base text-gray-900">{restaurant.address}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {restaurant.phone && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-base font-medium text-gray-900">{restaurant.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Restaurant Information</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter restaurant name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[60px]"
                    placeholder="Describe your restaurant..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Images (Max 2)
                  </label>
                  <div className="space-y-2">
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md border border-gray-300"
                              onError={(e) => {
                                console.error('Preview image failed to load:', preview);
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {index === 0 && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {imagePreviews.length < 2 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <label
                          htmlFor="images"
                          className="cursor-pointer flex flex-col items-center gap-1"
                        >
                          <span className="text-sm text-gray-600">
                            Click to upload images ({imagePreviews.length}/2)
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG, GIF up to 5MB each
                          </span>
                        </label>
                        <input
                          id="images"
                          type="file"
                          accept="image/*,.jpeg,.jpg,.png,.gif"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    placeholder="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Seats
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    max={formData.capacity}
                    placeholder="0"
                    value={formData.available_seats}
                    onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter restaurant address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+250799393729"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Update Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
