import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Eye, X, Package, Star, Search, Filter } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const MediaLibrary = () => {
  const [packages, setPackages] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchPackagesAndPhotos();
  }, []);

  const fetchPackagesAndPhotos = async () => {
    try {
      setLoading(true);
      let businessId = localStorage.getItem('tour_business_id');
      if (!businessId) {
        const response = await apiClient.get('/tours/businesses/my');
        const businesses = response.data?.data || response.data || [];
        if (businesses.length > 0) {
          businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
          if (businessId) {
            localStorage.setItem('tour_business_id', businessId);
          }
        }
      }

      if (businessId) {
        // Fetch all packages
        const packagesResponse = await apiClient.get(`/tours/packages/business/${businessId}`);
        const packagesData = packagesResponse.data?.data || packagesResponse.data || [];
        setPackages(packagesData);

        // Fetch photos for all packages
        const photosPromises = packagesData.map(async (pkg) => {
          try {
            const packageId = pkg.id || pkg.package_id;
            const photoResponse = await apiClient.get(`/tours/packages/${packageId}`);
            if (photoResponse.data.success && photoResponse.data.data) {
              const photos = photoResponse.data.data.photos || [];
              return photos.map(photo => ({
                ...photo,
                package_id: packageId,
                package_name: pkg.name || pkg.title
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error fetching photos for package ${pkg.id || pkg.package_id}:`, error);
            return [];
          }
        });

        const photosArrays = await Promise.all(photosPromises);
        const allPhotosFlat = photosArrays.flat();
        setAllPhotos(allPhotosFlat);
      }
    } catch (error) {
      console.error('Error fetching packages and photos:', error);
      toast.error('Failed to fetch media library');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Only image files are supported');
    }
    
    if (imageFiles.length === 0) {
      return;
    }

    setSelectedFiles(imageFiles);
    
    // Create previews
    const newPreviews = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setPreviews(newPreviews);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedPackage || selectedPackage === 'all') {
      toast.error('Please select a package and files to upload');
      return;
    }

    setUploading(true);
    try {
      // Convert files to base64
      const base64Photos = await Promise.all(
        selectedFiles.map(async (file) => {
          const base64 = await convertFileToBase64(file);
          return {
            photo_url: base64,
            photo_name: file.name,
            photo_size: file.size,
            photo_type: file.type
          };
        })
      );

      // Get existing package data
      const packageId = selectedPackage;
      const packageResponse = await apiClient.get(`/tours/packages/${packageId}`);
      const packageData = packageResponse.data.data;

      // Add new photos to existing photos
      const updatedPhotos = [...(packageData.photos || []), ...base64Photos];

      // Update package with new photos
      const updateData = {
        ...packageData,
        photos: updatedPhotos
      };

      await apiClient.put(`/tours/packages/${packageId}`, updateData);
      
      toast.success(`${selectedFiles.length} photo(s) uploaded successfully`);
      setSelectedFiles([]);
      setPreviews([]);
      setShowUploadModal(false);
      fetchPackagesAndPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId, packageId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeleting(photoId);
    try {
      // Get existing package data
      const packageResponse = await apiClient.get(`/tours/packages/${packageId}`);
      const packageData = packageResponse.data.data;

      // Remove the photo from the array
      const updatedPhotos = (packageData.photos || []).filter(
        photo => (photo.photo_id || photo.id) !== photoId
      );

      // Update package without the deleted photo
      const updateData = {
        ...packageData,
        photos: updatedPhotos
      };

      await apiClient.put(`/tours/packages/${packageId}`, updateData);
      
      toast.success('Photo deleted successfully');
      fetchPackagesAndPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(error.response?.data?.message || 'Failed to delete photo');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetPrimary = async (photoId, packageId) => {
    try {
      // Get existing package data
      const packageResponse = await apiClient.get(`/tours/packages/${packageId}`);
      const packageData = packageResponse.data.data;

      // Update photos to set the selected one as primary
      const updatedPhotos = (packageData.photos || []).map(photo => ({
        ...photo,
        is_primary: (photo.photo_id || photo.id) === photoId ? 1 : 0
      }));

      // Update package
      const updateData = {
        ...packageData,
        photos: updatedPhotos
      };

      await apiClient.put(`/tours/packages/${packageId}`, updateData);
      
      toast.success('Primary photo updated successfully');
      fetchPackagesAndPhotos();
    } catch (error) {
      console.error('Error setting primary photo:', error);
      toast.error(error.response?.data?.message || 'Failed to update primary photo');
    }
  };

  // Filter photos
  const filteredPhotos = allPhotos.filter(photo => {
    const matchesPackage = selectedPackage === 'all' || 
      (photo.package_id && photo.package_id.toString() === selectedPackage);
    const matchesSearch = !searchTerm || 
      photo.photo_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.package_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPackage && matchesSearch;
  });

  // Group photos by package
  const photosByPackage = filteredPhotos.reduce((acc, photo) => {
    const pkgName = photo.package_name || 'Unknown Package';
    if (!acc[pkgName]) {
      acc[pkgName] = [];
    }
    acc[pkgName].push(photo);
    return acc;
  }, {});

  const totalPhotos = allPhotos.length;
  const totalPackages = packages.length;
  const primaryPhotos = allPhotos.filter(p => p.is_primary || p.isPrimary).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-600 mt-1">Upload and manage images for tour listings</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Photos</p>
              <p className="text-2xl font-bold text-gray-900">{totalPhotos}</p>
            </div>
            <Image className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tour Packages</p>
              <p className="text-2xl font-bold text-gray-900">{totalPackages}</p>
            </div>
            <Package className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Primary Photos</p>
              <p className="text-2xl font-bold text-gray-900">{primaryPhotos}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by photo name or package name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            >
              <option value="all">All Packages</option>
              {packages.map((pkg) => {
                const id = pkg.id || pkg.package_id;
                const name = pkg.name || pkg.title || 'Unnamed Package';
                return (
                  <option key={id} value={id}>{name}</option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Photos by Package */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedPackage !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Upload photos to your tour packages to see them here'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(photosByPackage).map(([packageName, photos]) => (
            <div key={packageName} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#3CAF54]" />
                  {packageName}
                </h2>
                <span className="text-sm text-gray-500">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                {photos.map((photo) => {
                  const photoId = photo.photo_id || photo.id;
                  const photoUrl = photo.photo_url || photo.url;
                  const isPrimary = photo.is_primary || photo.isPrimary;
                  const isDeleting = deleting === photoId;

                  return (
                    <div key={photoId} className="relative group">
                      {isPrimary && (
                        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </div>
                      )}
                      <img
                        src={photoUrl}
                        alt={photo.photo_name || 'Tour photo'}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhoto(photo);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-white hover:text-gray-200 p-1"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {!isPrimary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(photoId, photo.package_id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white hover:text-yellow-200 p-1"
                            title="Set as Primary"
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(photoId, photo.package_id);
                          }}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 text-white hover:text-red-200 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload Photos</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setPreviews([]);
                  setSelectedPackage('all');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Package
                </label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                >
                  <option value="all">Select a package...</option>
                  {packages.map((pkg) => {
                    const id = pkg.id || pkg.package_id;
                    const name = pkg.name || pkg.title || 'Unnamed Package';
                    return (
                      <option key={id} value={id}>{name}</option>
                    );
                  })}
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-[#3CAF54] font-medium">Click to upload</span> or drag and drop
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
              </div>

              {previews.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview.preview}
                        alt={preview.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== index);
                          const newPreviews = previews.filter((_, i) => i !== index);
                          setSelectedFiles(newFiles);
                          setPreviews(newPreviews);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">{preview.name}</p>
                      <p className="text-xs text-gray-500">
                        {(preview.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0 || selectedPackage === 'all'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload {selectedFiles.length} Photo(s)</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setPreviews([]);
                  setSelectedPackage('all');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full mx-4">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-200 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedPhoto.photo_url || selectedPhoto.url}
              alt={selectedPhoto.photo_name || 'Tour photo'}
              className="max-w-full max-h-[90vh] mx-auto rounded-lg"
            />
            <div className="mt-4 text-center text-white">
              <p className="font-medium">{selectedPhoto.photo_name || 'Tour Photo'}</p>
              <p className="text-sm text-gray-300">
                {selectedPhoto.package_name && `Package: ${selectedPhoto.package_name}`}
              </p>
              {selectedPhoto.photo_size && (
                <p className="text-sm text-gray-300">
                  {(selectedPhoto.photo_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
