import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, X, Image as ImageIcon, Home, Bed, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import {
  getPropertyImageLibrary,
  uploadPropertyImages,
  deletePropertyImage,
  updatePropertyImage,
  uploadRoomImages,
  deleteRoomImage,
  updateRoomImage
} from '../../services/staysService';

export default function ImageManagementStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  const [propertyId, setPropertyId] = useState(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [uploadingProperty, setUploadingProperty] = useState(false);
  const [roomUploadStatus, setRoomUploadStatus] = useState({});
  // Load rooms from localStorage or API
  const [rooms, setRooms] = useState([]);
  const [propertyImages, setPropertyImages] = useState([]);
  const [roomImages, setRoomImages] = useState({}); // { roomId: [images] }

  const syncImageLibrary = useCallback((library) => {
    if (!library) return;
    setPropertyImages(library.propertyImages || []);

    if (Array.isArray(library.rooms) && library.rooms.length > 0) {
      setRooms(library.rooms);
      const mapped = {};
      library.rooms.forEach((room) => {
        const key = room.room_id || room.id;
        if (key) {
          mapped[key] = room.images || [];
        }
      });
      setRoomImages(mapped);
    }
  }, []);

  const getRoomKey = (room) => room?.room_id || room?.id;
  const getRoomName = (room) => room?.room_name || room?.roomName || 'Room';
  const getRoomImages = (room) => {
    const key = getRoomKey(room);
    if (!key) return room?.images || [];
    return roomImages[key] || room?.images || [];
  };

  const fetchImageLibrary = useCallback(async (propId) => {
    if (!propId) return;
    setLoadingLibrary(true);
    try {
      const library = await getPropertyImageLibrary(propId);
      syncImageLibrary(library);
    } catch (error) {
      console.error('Error loading property images:', error);
      toast.error(error?.message || 'Failed to load property images from server');
    } finally {
      setLoadingLibrary(false);
    }
  }, [syncImageLibrary]);

  useEffect(() => {
    const savedRooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
    setRooms(savedRooms.filter(room => room.roomSetupComplete));
    
    // Load saved images from localStorage (fallback if property not yet saved)
    const savedPropertyImages = JSON.parse(localStorage.getItem('stays_property_images') || '[]');
    setPropertyImages(savedPropertyImages);
    
    const savedRoomImages = JSON.parse(localStorage.getItem('stays_room_images') || '{}');
    setRoomImages(savedRoomImages);

    const derivedPropertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0', 10);
    if (derivedPropertyId && !Number.isNaN(derivedPropertyId)) {
      setPropertyId(derivedPropertyId);
      fetchImageLibrary(derivedPropertyId);
    }
  }, [location.state, fetchImageLibrary]);

  const uploadPropertyImagesToServer = useCallback(async (imageFiles) => {
    if (!propertyId) {
      toast.error('Property ID missing. Please go back and restart the setup.');
      return;
    }
    setUploadingProperty(true);
    try {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('images', file));
      const library = await uploadPropertyImages(propertyId, formData);
      syncImageLibrary(library);
      toast.success('Property images saved successfully');
    } catch (error) {
      console.error('Error uploading property images:', error);
      toast.error(error?.message || 'Failed to upload property images');
    } finally {
      setUploadingProperty(false);
    }
  }, [propertyId, syncImageLibrary]);

  const uploadRoomImagesToServer = useCallback(async (roomId, imageFiles) => {
    if (!roomId) {
      toast.error('Room ID is required to upload images');
      return;
    }
    setRoomUploadStatus(prev => ({ ...prev, [roomId]: true }));
    try {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('images', file));
      const library = await uploadRoomImages(roomId, formData);
      syncImageLibrary(library);
      toast.success('Room images saved successfully');
    } catch (error) {
      console.error('Error uploading room images:', error);
      toast.error(error?.message || 'Failed to upload room images');
    } finally {
      setRoomUploadStatus(prev => ({ ...prev, [roomId]: false }));
    }
  }, [syncImageLibrary]);

  const handleImageUpload = async (files, type, roomId = null) => {
    const imageFiles = Array.from(files || []);
    if (imageFiles.length === 0) return;

    if (propertyId) {
      if (type === 'property') {
        await uploadPropertyImagesToServer(imageFiles);
      } else if (type === 'room' && roomId) {
        await uploadRoomImagesToServer(roomId, imageFiles);
      }
      return;
    }

    // Fallback to local storage if property is not yet persisted
    const newImages = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    if (type === 'property') {
      const updatedImages = [...propertyImages, ...newImages];
      setPropertyImages(updatedImages);
      localStorage.setItem('stays_property_images', JSON.stringify(updatedImages.map(img => ({
        id: img.id,
        name: img.name,
        preview: img.preview
      }))));
    } else if (type === 'room' && roomId) {
      const updatedRoomImages = {
        ...roomImages,
        [roomId]: [...(roomImages[roomId] || []), ...newImages]
      };
      setRoomImages(updatedRoomImages);
      localStorage.setItem('stays_room_images', JSON.stringify(
        Object.keys(updatedRoomImages).reduce((acc, key) => {
          acc[key] = updatedRoomImages[key].map(img => ({
            id: img.id,
            name: img.name,
            preview: img.preview
          }));
          return acc;
        }, {})
      ));
    }
  };

  const handleImageDelete = async (imageId, type, roomId = null) => {
    if (!imageId) return;

    if (propertyId) {
      try {
        let library = null;
        if (type === 'property') {
          library = await deletePropertyImage(imageId);
          toast.success('Property image deleted');
        } else if (type === 'room') {
          library = await deleteRoomImage(imageId);
          toast.success('Room image deleted');
        }
        if (library) {
          syncImageLibrary(library);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error(error?.message || 'Failed to delete image');
      }
      return;
    }

    if (type === 'property') {
      const updatedImages = propertyImages.filter(img => img.id !== imageId);
      setPropertyImages(updatedImages);
      localStorage.setItem('stays_property_images', JSON.stringify(updatedImages.map(img => ({
        id: img.id,
        name: img.name,
        preview: img.preview
      }))));
    } else if (type === 'room' && roomId) {
      const updatedRoomImages = {
        ...roomImages,
        [roomId]: (roomImages[roomId] || []).filter(img => img.id !== imageId)
      };
      setRoomImages(updatedRoomImages);
      localStorage.setItem('stays_room_images', JSON.stringify(
        Object.keys(updatedRoomImages).reduce((acc, key) => {
          acc[key] = updatedRoomImages[key].map(img => ({
            id: img.id,
            name: img.name,
            preview: img.preview
          }));
          return acc;
        }, {})
      ));
    }
  };

  const handleNext = () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    // Mark images step as complete
    localStorage.setItem('stays_images_complete', 'true');

    // Navigate to next step (Step 9 - Taxes)
    navigate('/stays/setup/taxes', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
        currentStep: 9
      }
    });
  };

  const handleBack = () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    navigate('/stays/setup/promote-listing', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {/* Steps 1-7 - Completed */}
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                      <span>✓</span>
                    </div>
                    <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                  </React.Fragment>
                ))}
                
                {/* Step 8 - Current */}
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  8
                </div>
                <div className="w-16 h-1 bg-gray-300"></div>
                
                {/* Steps 9-10 - Not completed */}
                {[9, 10].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300">
                      {step}
                    </div>
                    {step < 10 && <div className="w-16 h-1 bg-gray-300"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 8 of 10</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Add photos to your listing</h1>
              <p className="text-gray-600">
                High-quality photos help travelers imagine themselves at your property. Upload photos of your property and rooms.
              </p>
              {propertyId ? (
                <div className="mt-4 p-3 rounded-lg border border-green-100 bg-green-50 text-green-800 text-sm">
                  Images are saved directly to your property account.
                  {loadingLibrary && <span className="ml-1 italic"> Syncing...</span>}
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-lg border border-yellow-100 bg-yellow-50 text-yellow-800 text-sm">
                  We will store these images locally until your property profile is created. Please finish the remaining steps to sync them.
                </div>
              )}
            </div>

            {/* Property Images Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Property Images</h2>
              </div>
              
              <div className="border-2 border-dashed rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {propertyImages.map((image) => {
                    const imageId = image.image_id || image.id;
                    const imageSrc = image.preview || image.image_url || image.url;
                    const imageName = image.name || image.original_name || 'Property image';
                    return (
                      <div key={imageId || imageSrc} className="relative group">
                        <img
                          src={imageSrc}
                          alt={imageName}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(imageId || image.id, 'property')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${uploadingProperty ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingProperty ? (
                      <Loader2 className="h-8 w-8 mb-2 text-gray-500 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 mb-2 text-gray-500" />
                    )}
                    <p className="text-sm text-gray-600 mb-1">
                      {uploadingProperty ? 'Uploading images...' : (
                        <>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    disabled={uploadingProperty}
                    onChange={async (e) => {
                      await handleImageUpload(e.target.files, 'property');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Room Images Section */}
            {rooms.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Bed className="h-5 w-5 text-[#3CAF54]" />
                  <h2 className="text-xl font-semibold text-gray-900">Room Images</h2>
                </div>

                <div className="space-y-6">
                  {rooms.map((room) => {
                    const roomKey = getRoomKey(room);
                    const roomImagesList = getRoomImages(room);
                    const isUploading = !!roomUploadStatus[roomKey];
                    return (
                      <div key={roomKey || room.id} className="border rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {getRoomName(room)}
                        </h3>
                        
                        <div className="border-2 border-dashed rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {roomImagesList.map((image) => {
                              const imageId = image.image_id || image.id;
                              const imageSrc = image.preview || image.image_url || image.url;
                              const imageName = image.name || image.original_name || getRoomName(room);
                              return (
                                <div key={imageId || imageSrc} className="relative group">
                                  <img
                                    src={imageSrc}
                                    alt={imageName}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleImageDelete(imageId || image.id, 'room', roomKey)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {isUploading ? (
                                <Loader2 className="h-8 w-8 mb-2 text-gray-500 animate-spin" />
                              ) : (
                                <Upload className="h-8 w-8 mb-2 text-gray-500" />
                              )}
                              <p className="text-sm text-gray-600 mb-1">
                                {isUploading ? 'Uploading images...' : (
                                  <>
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              multiple
                              accept="image/*"
                              disabled={isUploading}
                              onChange={async (e) => {
                                await handleImageUpload(e.target.files, 'room', roomKey);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Message */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">Photo Tips</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Include at least 5 high-quality photos</li>
                    <li>• Show different areas: exterior, lobby, rooms, amenities</li>
                    <li>• Use natural lighting when possible</li>
                    <li>• Make sure photos are clear and well-lit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#d1d5db' }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

