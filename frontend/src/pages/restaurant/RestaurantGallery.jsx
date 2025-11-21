import { useEffect, useState } from 'react';
import { restaurantsAPI, imagesAPI } from '../../services/restaurantDashboardService';
import { Image as ImageIcon, Upload, X, Trash2, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Get backend base URL for static assets
const getBackendBaseURL = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
};

// Helper function to normalize image URLs
const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  if (import.meta.env.DEV && cleanPath.startsWith('/uploads')) {
    return cleanPath;
  }
  
  const backendBase = getBackendBaseURL();
  return `${backendBase}${cleanPath}`;
};

const RestaurantGallery = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [logo, setLogo] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchRestaurantAndImages();
  }, []);

  const fetchRestaurantAndImages = async () => {
    try {
      setFetching(true);
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      
      if (!myRestaurant) {
        toast.error('Restaurant not found');
        return;
      }

      setRestaurant(myRestaurant);

      // Fetch all images
      const allImages = await imagesAPI.getByEntity('restaurant', myRestaurant.id);
      
      // Separate logo and gallery images
      const logoImage = allImages.find(img => img.image_type === 'logo' || (img.is_primary && !img.image_type));
      const galleryImgs = allImages.filter(img => 
        img.image_type === 'gallery' || (!img.image_type && img.id !== logoImage?.id)
      );

      setLogo(logoImage || null);
      setGalleryImages(galleryImgs);
    } catch (error) {
      console.error('Error fetching restaurant images:', error);
      toast.error('Failed to load images');
    } finally {
      setFetching(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        // Delete old logo if exists
        if (logo) {
          try {
            await imagesAPI.delete(logo.id);
          } catch (error) {
            console.error('Error deleting old logo:', error);
          }
        }

        // Upload new logo
        const imagesToSave = [{
          image_url: base64String,
          display_order: 0,
          is_primary: true,
          image_type: 'logo'
        }];

        const savedImages = await imagesAPI.add('restaurant', restaurant.id, imagesToSave);
        if (savedImages && savedImages.length > 0) {
          setLogo(savedImages[0]);
          toast.success('Logo updated successfully');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !restaurant) return;

    const MAX_GALLERY_IMAGES = 10;
    const currentCount = galleryImages.length;
    const remainingSlots = MAX_GALLERY_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`);
      e.target.value = '';
      return;
    }

    const validFiles = Array.from(files).slice(0, remainingSlots).filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length === 0) {
      toast.error('No valid images selected');
      e.target.value = '';
      return;
    }

    try {
      setUploadingGallery(true);
      const imagesToSave = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onloadend = () => {
            imagesToSave.push({
              image_url: reader.result,
              display_order: currentCount + i,
              is_primary: false,
              image_type: 'gallery'
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      const savedImages = await imagesAPI.add('restaurant', restaurant.id, imagesToSave);
      if (savedImages && savedImages.length > 0) {
        setGalleryImages(prev => [...prev, ...savedImages]);
        toast.success(`${savedImages.length} gallery image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast.error('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId, imageType) => {
    if (!imageId) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${imageType === 'logo' ? 'logo' : 'gallery image'}?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(imageId);
      await imagesAPI.delete(imageId);
      
      if (imageType === 'logo') {
        setLogo(null);
        toast.success('Logo deleted successfully');
      } else {
        setGalleryImages(prev => prev.filter(img => img.id !== imageId));
        toast.success('Gallery image deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await imagesAPI.update(imageId, { is_primary: true });
      await fetchRestaurantAndImages();
      toast.success('Primary image updated');
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to set primary image');
    }
  };

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Restaurant Found</h2>
          <p className="text-gray-600">
            Please set up your restaurant first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Gallery</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your restaurant logo and gallery images</p>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Restaurant Logo</h2>
            <p className="text-sm text-gray-600">Upload your restaurant logo (recommended: square, 500x500px)</p>
          </div>
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {uploadingLogo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{logo ? 'Change Logo' : 'Upload Logo'}</span>
                </>
              )}
            </div>
          </label>
        </div>

        {logo ? (
          <div className="relative inline-block">
            <img
              src={normalizeImageUrl(logo.image_url)}
              alt="Restaurant Logo"
              className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              onClick={() => handleDeleteImage(logo.id, 'logo')}
              disabled={deletingId === logo.id}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 disabled:opacity-50"
              title="Delete logo"
            >
              {deletingId === logo.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
            {logo.is_primary && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                <Star className="h-4 w-4 fill-current" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No logo uploaded</p>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gallery Images</h2>
            <p className="text-sm text-gray-600">
              Upload up to 10 gallery images ({galleryImages.length}/10 used)
            </p>
          </div>
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploadingGallery || galleryImages.length >= 10}
              className="hidden"
            />
            <div className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              galleryImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              {uploadingGallery ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Add Images</span>
                </>
              )}
            </div>
          </label>
        </div>

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={normalizeImageUrl(image.image_url)}
                  alt={`Gallery ${image.display_order + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleDeleteImage(image.id, 'gallery')}
                  disabled={deletingId === image.id}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  title="Delete image"
                >
                  {deletingId === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                )}
                {!image.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100"
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No gallery images uploaded yet</p>
            <p className="text-sm text-gray-500">Upload images to showcase your restaurant</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantGallery;

