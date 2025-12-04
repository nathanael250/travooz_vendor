import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Calendar as CalendarIcon,
  Home,
  DollarSign,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Loader2,
  Menu,
  Bell,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';
import {
  staysAuthService,
  getMyPropertyListings,
  getPropertyImageLibrary,
  uploadPropertyImages,
  deletePropertyImage,
  updatePropertyImage,
  uploadRoomImages,
  deleteRoomImage,
  updateRoomImage
} from '../../services/staysService';

// Helper function to build image URLs for both development and production
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL (http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Get the API base URL from environment
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  
  // Remove '/api/v1' from the base URL to get the server root
  const serverUrl = apiBaseUrl.replace('/api/v1', '');
  
  // Ensure the image URL starts with /
  const normalizedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  // Combine server URL with image path
  return `${serverUrl}${normalizedImageUrl}`;
};

const PropertyImages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [imageLibrary, setImageLibrary] = useState(null);
  const [uploadingProperty, setUploadingProperty] = useState(false);
  const [roomUploading, setRoomUploading] = useState({});
  const [isPropertyLive, setIsPropertyLive] = useState(false);
  const [propertySummary, setPropertySummary] = useState(null);

  useEffect(() => {
    if (!staysAuthService.isAuthenticated()) {
      navigate('/stays/login');
      return;
    }

    const handleResize = () => {
      const desktopView = window.innerWidth >= 1024;
      setIsMobile(!desktopView);
      setSidebarOpen(desktopView);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    fetchInitialData();

    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const properties = await getMyPropertyListings();

      if (!properties || properties.length === 0) {
        toast.error('No property found. Please create a property first.');
        navigate('/stays/dashboard');
        return;
      }

      const primaryProperty = properties[0];
      const selectedPropertyId = primaryProperty.property_id || primaryProperty.propertyId;
      setPropertyId(selectedPropertyId);

      const liveStatus =
        primaryProperty.status === 'approved' ||
        primaryProperty.is_live === 1 ||
        primaryProperty.is_live === true ||
        primaryProperty.setup_complete === 1;
      setIsPropertyLive(liveStatus);

      const library = await getPropertyImageLibrary(selectedPropertyId);
      setImageLibrary(library);
      setPropertySummary({
        name:
          library?.property?.property_name ||
          primaryProperty.property_name ||
          'My Property',
        type: library?.property?.property_type || primaryProperty.property_type || 'Hotel',
        rooms:
          library?.property?.number_of_rooms ||
          primaryProperty.number_of_rooms ||
          0
      });
    } catch (error) {
      console.error('Error loading property images:', error);
      const message = error?.message || error?.data?.message || 'Failed to load property images';
      toast.error(message);
      if (error?.status === 401) {
        staysAuthService.logout();
        navigate('/stays/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshLibrary = async (propId = propertyId) => {
    if (!propId) return;
    try {
      const library = await getPropertyImageLibrary(propId);
      setImageLibrary(library);
      setPropertySummary((prev) => ({
        ...prev,
        name: library?.property?.property_name || prev?.name,
        type: library?.property?.property_type || prev?.type,
        rooms: library?.property?.number_of_rooms ?? prev?.rooms
      }));
    } catch (error) {
      console.error('Error refreshing images:', error);
      toast.error(error?.message || 'Unable to refresh images');
    }
  };

  const handlePropertyUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !propertyId) {
      return;
    }

    try {
      setUploadingProperty(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const library = await uploadPropertyImages(propertyId, formData);
      setImageLibrary(library);
      toast.success('Property images uploaded successfully');
    } catch (error) {
      console.error('Error uploading property images:', error);
      toast.error(error?.message || 'Failed to upload images');
    } finally {
      setUploadingProperty(false);
      event.target.value = '';
    }
  };

  const handleRoomUpload = async (roomId, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    try {
      setRoomUploading((prev) => ({ ...prev, [roomId]: true }));
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const library = await uploadRoomImages(roomId, formData);
      setImageLibrary(library);
      toast.success('Room images uploaded successfully');
    } catch (error) {
      console.error('Error uploading room images:', error);
      toast.error(error?.message || 'Failed to upload room images');
    } finally {
      setRoomUploading((prev) => ({ ...prev, [roomId]: false }));
      event.target.value = '';
    }
  };

  const handleDeletePropertyImage = async (imageId) => {
    if (!imageId) return;
    const confirmed = window.confirm('Delete this image? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const library = await deletePropertyImage(imageId);
      setImageLibrary(library);
      toast.success('Image deleted');
    } catch (error) {
      console.error('Error deleting property image:', error);
      toast.error(error?.message || 'Failed to delete image');
    }
  };

  const handleDeleteRoomImage = async (imageId) => {
    if (!imageId) return;
    const confirmed = window.confirm('Delete this room image?');
    if (!confirmed) return;

    try {
      const library = await deleteRoomImage(imageId);
      setImageLibrary(library);
      toast.success('Room image deleted');
    } catch (error) {
      console.error('Error deleting room image:', error);
      toast.error(error?.message || 'Failed to delete room image');
    }
  };

  const handleSetPrimaryPropertyImage = async (imageId) => {
    try {
      const library = await updatePropertyImage(imageId, { is_primary: true });
      setImageLibrary(library);
      toast.success('Primary image updated');
    } catch (error) {
      console.error('Error setting primary property image:', error);
      toast.error(error?.message || 'Failed to set primary image');
    }
  };

  const handleSetPrimaryRoomImage = async (imageId) => {
    try {
      const library = await updateRoomImage(imageId, { is_primary: true });
      setImageLibrary(library);
      toast.success('Primary room image updated');
    } catch (error) {
      console.error('Error setting primary room image:', error);
      toast.error(error?.message || 'Failed to set primary image');
    }
  };

  const handleLogout = () => {
    staysAuthService.logout();
    navigate('/stays/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Property Images...</p>
        </div>
      </div>
    );
  }

  const propertyImages = imageLibrary?.propertyImages || [];
  const rooms = imageLibrary?.rooms || [];

  const renderSidebarLinks = () => (
    <nav className="px-2 pb-4">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate('/stays/dashboard');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          currentPath === '/stays/dashboard'
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Dashboard</span>}
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate('/stays/dashboard/my-property');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          currentPath === '/stays/dashboard/my-property'
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <Building2 className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>My Property</span>}
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate('/stays/dashboard/property-images');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          currentPath === '/stays/dashboard/property-images'
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <ImageIcon className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Property Images</span>}
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate('/stays/dashboard/bookings');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          currentPath === '/stays/dashboard/bookings'
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <CalendarIcon className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Bookings</span>}
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate('/stays/dashboard/room-availability');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          currentPath === '/stays/dashboard/room-availability'
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <Home className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Room Availability</span>}
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate('/stays/dashboard/finance');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          currentPath === '/stays/dashboard/finance'
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <DollarSign className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Finance</span>}
      </a>
      <a
        href="#"
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          isPropertyLive
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-500 opacity-50 cursor-not-allowed'
        }`}
        onClick={(e) => !isPropertyLive && e.preventDefault()}
      >
        <FileText className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Reports</span>}
      </a>
      <a
        href="#"
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
          isPropertyLive
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-500 opacity-50 cursor-not-allowed'
        }`}
        onClick={(e) => !isPropertyLive && e.preventDefault()}
      >
        <BookOpen className="h-5 w-5 flex-shrink-0" />
        {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>API Docs</span>}
      </a>
    </nav>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-800 text-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarExpanded ? 'w-64' : 'w-20'} flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Travooz Logo" className="h-8 w-auto flex-shrink-0" />
            {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
              <span className="text-lg font-semibold whitespace-nowrap">Admin Dashboard</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-700 rounded flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="p-4 text-xs text-gray-400 uppercase tracking-wider">Menu</div>
          )}
          {renderSidebarLinks()}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 w-full"
          >
            <span className="flex items-center gap-2">
              <User className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Logout</span>}
            </span>
          </button>
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              vendor.travooz.com/dashboard
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 text-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (!isMobile) {
                  setSidebarExpanded(!sidebarExpanded);
                  if (!sidebarOpen) setSidebarOpen(true);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-2 hover:bg-gray-700 rounded-lg"
              title={!isMobile ? (sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar') : 'Toggle sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-semibold truncate">
                  {propertySummary?.name || 'Property Images'}
                </span>
                <span className="text-xs text-gray-300">
                  Manage photos for your property and rooms
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 cursor-pointer opacity-50" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center hidden sm:flex">
                3
              </span>
            </div>
            <select className="bg-gray-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm opacity-50 hidden sm:block" disabled>
              <option>EN</option>
              <option>FR</option>
            </select>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-600 flex items-center justify-center opacity-50">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Property Type</p>
                <p className="text-lg font-semibold">{propertySummary?.type || 'Hotel'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Rooms</p>
                <p className="text-lg font-semibold">{propertySummary?.rooms || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Property Images</p>
                <p className="text-lg font-semibold">{propertyImages.length}</p>
              </div>
            </div>

            <section className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Property Gallery</h2>
                  <p className="text-gray-500 text-sm">
                    Upload high-resolution images that showcase your property exterior, lobby, dining areas and amenities.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700">
                  {uploadingProperty ? (
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
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePropertyUpload}
                    disabled={uploadingProperty}
                  />
                </label>
              </div>

              {propertyImages.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No property images uploaded yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Upload at least 5 photos to improve your listing quality.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyImages.map((image) => (
                    <div key={image.image_id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={buildImageUrl(image.image_url)}
                        alt="Property"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', image.image_url);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors"></div>
                      <div className="absolute top-3 left-3">
                        {image.is_primary ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                            <Star className="h-3 w-3 fill-current" />
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPropertyImage(image.image_id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-white text-gray-700 shadow hover:bg-gray-50"
                          >
                            <Star className="h-3 w-3" />
                            Make Primary
                          </button>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePropertyImage(image.image_id)}
                          className="p-2 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Room Galleries</h2>
                <p className="text-gray-500 text-sm">
                  Upload individual room photos to help guests understand layouts and amenities offered in each room category.
                </p>
              </div>

              {rooms.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <p>No rooms have been created yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Set up rooms to start managing photos for each room type.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room) => (
                    <div key={room.room_id} className="border border-gray-200 rounded-lg p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{room.room_name}</h3>
                          <p className="text-sm text-gray-500">
                            {room.room_type || 'Room'} • {room.images?.length || 0} photos
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100">
                          {roomUploading[room.room_id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span>Add Room Images</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) => handleRoomUpload(room.room_id, event)}
                            disabled={roomUploading[room.room_id]}
                          />
                        </label>
                      </div>

                      {room.images && room.images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {room.images.map((image) => (
                            <div key={image.image_id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                              <img
                                src={buildImageUrl(image.image_url)}
                                alt={room.room_name}
                                className="h-40 w-full object-cover"
                                onError={(e) => {
                                  console.error('Failed to load room image:', image.image_url);
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute top-3 left-3">
                                {image.is_primary ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                    <Star className="h-3 w-3 fill-current" />
                                    Primary
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryRoomImage(image.image_id)}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-white text-gray-700 shadow hover:bg-gray-50"
                                  >
                                    <Star className="h-3 w-3" />
                                    Set Primary
                                  </button>
                                )}
                              </div>
                              <div className="absolute top-3 right-3">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRoomImage(image.image_id)}
                                  className="p-2 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                          <p>No images uploaded for this room yet.</p>
                          <p className="text-sm text-gray-400">Upload at least 3 images showcasing the room interior.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Photo Guidelines</h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Minimum resolution: 1200 x 800 pixels, JPG or PNG.</li>
                <li>• Showcase exterior, lobby, rooms, bathrooms, amenities, dining and views.</li>
                <li>• Avoid watermarks, collages or low-light noisy photos.</li>
                <li>• Keep a consistent orientation (landscape recommended for cover photos).</li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PropertyImages;

