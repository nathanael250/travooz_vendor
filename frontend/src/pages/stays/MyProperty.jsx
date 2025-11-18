import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building, 
  MapPin, 
  Edit2, 
  Save, 
  X,
  Image as ImageIcon,
  Bed,
  Shield,
  Menu,
  Bell,
  User,
  Home,
  LogOut,
  LayoutDashboard,
  Building2,
  Calendar as CalendarIcon,
  FileText,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { getPropertyWithAllData, updatePropertyListing, getMyPropertyListings, staysAuthService } from '../../services/staysService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';

const MyProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPropertyLive, setIsPropertyLive] = useState(false);
  const [formData, setFormData] = useState({
    property_name: '',
    property_type: '',
    location: '',
    number_of_rooms: '',
    legal_name: '',
    currency: 'RWF',
    channel_manager: 'no',
    part_of_chain: 'no',
    booking_com_url: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!staysAuthService.isAuthenticated()) {
      navigate('/stays/login');
      return;
    }

    // Set initial sidebar state based on screen size
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsMobile(!isDesktop);
      if (isDesktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Get current user
    const currentUser = staysAuthService.getCurrentUser();
    setUser(currentUser);

    fetchPropertyData();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      // Get user's properties to find the property ID
      const properties = await getMyPropertyListings();

      if (!properties || properties.length === 0) {
        toast.error('No property found. Please create a property first.');
        navigate('/stays/dashboard');
        return;
      }

      const propertyId = properties[0].property_id;
      
      // Fetch complete property data
      const completeData = await getPropertyWithAllData(propertyId);
      setProperty(completeData);
      
      // Check if property is live
      const propertyIsLive = 
        completeData.is_live === 1 || 
        completeData.isLive === true || 
        completeData.is_live === true ||
        completeData.status === 'approved';
      setIsPropertyLive(propertyIsLive);
      
      // Set form data
      setFormData({
        property_name: completeData.property_name || '',
        property_type: completeData.property_type || '',
        location: completeData.location || '',
        number_of_rooms: completeData.number_of_rooms || '',
        legal_name: completeData.legal_name || '',
        currency: completeData.currency || 'RWF',
        channel_manager: completeData.channel_manager || 'no',
        part_of_chain: completeData.part_of_chain || 'no',
        booking_com_url: completeData.booking_com_url || ''
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error(error.message || 'Failed to load property data');
      if (error.response?.status === 401) {
        navigate('/stays/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const propertyId = property.property_id;
      
      await updatePropertyListing(propertyId, {
        propertyName: formData.property_name,
        propertyType: formData.property_type,
        location: formData.location,
        numberOfRooms: parseInt(formData.number_of_rooms) || 0,
        legalName: formData.legal_name,
        currency: formData.currency,
        channelManager: formData.channel_manager,
        partOfChain: formData.part_of_chain,
        bookingComUrl: formData.booking_com_url
      });

      toast.success('Property updated successfully');
      setEditing(false);
      await fetchPropertyData(); // Refresh data
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error(error.message || 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original property data
    setFormData({
      property_name: property?.property_name || '',
      property_type: property?.property_type || '',
      location: property?.location || '',
      number_of_rooms: property?.number_of_rooms || '',
      legal_name: property?.legal_name || '',
      currency: property?.currency || 'RWF',
      channel_manager: property?.channel_manager || 'no',
      part_of_chain: property?.part_of_chain || 'no',
      booking_com_url: property?.booking_com_url || ''
    });
  };

  const handleLogout = () => {
    staysAuthService.logout();
    navigate('/stays/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property data...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No property found</p>
          <button
            onClick={() => navigate('/stays/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const locationData = property.location_data || {};
  const addressComponents = locationData.address_components || [];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-800 text-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarExpanded ? 'w-64' : 'w-20'} flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
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
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto">
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="p-4 text-xs text-gray-400 uppercase tracking-wider">Menu</div>
          )}
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
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Logout</span>}
          </button>
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              localhost:8080/dashboard
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gray-800 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            {property && property.property_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold truncate">{property.property_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold">My Property</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <div className="relative">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">3</span>
            </div>
            <select className="bg-gray-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hidden sm:block">
              <option>EN</option>
              <option>FR</option>
            </select>
            <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer flex-shrink-0">
              <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6">
          {/* Page Header */}
          <div className="bg-white shadow-sm border-b rounded-lg mb-6">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Property</h1>
                  <p className="text-sm text-gray-500 mt-1">View and manage your property information</p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Property
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="property_name"
                      value={formData.property_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{property.property_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  {editing ? (
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Resort">Resort</option>
                      <option value="Lodge">Lodge</option>
                      <option value="Guesthouse">Guesthouse</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Bed and Breakfast">Bed and Breakfast</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{property.property_type || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900">{property.location || 'Not set'}</p>
                        {locationData.formatted_address && (
                          <p className="text-sm text-gray-500 mt-1">{locationData.formatted_address}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                    {editing ? (
                      <input
                        type="number"
                        name="number_of_rooms"
                        value={formData.number_of_rooms}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{property.number_of_rooms || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    {editing ? (
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="RWF">RWF (Rwandan Franc)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{property.currency || 'RWF'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="legal_name"
                      value={formData.legal_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{property.legal_name || 'Not set'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel Manager</label>
                    {editing ? (
                      <select
                        name="channel_manager"
                        value={formData.channel_manager}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{property.channel_manager === 'yes' ? 'Yes' : 'No'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part of Chain</label>
                    {editing ? (
                      <select
                        name="part_of_chain"
                        value={formData.part_of_chain}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{property.part_of_chain === 'yes' ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                </div>

                {formData.channel_manager === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking.com URL</label>
                    {editing ? (
                      <input
                        type="url"
                        name="booking_com_url"
                        value={formData.booking_com_url}
                        onChange={handleInputChange}
                        placeholder="https://www.booking.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {property.booking_com_url ? (
                          <a href={property.booking_com_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                            {property.booking_com_url}
                          </a>
                        ) : (
                          'Not set'
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Property Status</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'approved' ? 'bg-green-100 text-green-800' :
                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status?.charAt(0).toUpperCase() + property.status?.slice(1) || 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Setup Complete</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.setup_complete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.setup_complete ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contract Accepted</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.contract_accepted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.contract_accepted ? 'Yes' : 'No'}
                  </span>
                </div>
                {property.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            {property.images && property.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Property Images</h2>
                  <span className="text-sm text-gray-500">({property.images.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.images.map((image, index) => (
                    <div key={image.image_id || index} className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.is_primary && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            {property.rooms && property.rooms.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bed className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Rooms</h2>
                  <span className="text-sm text-gray-500">({property.rooms.length})</span>
                </div>
                <div className="space-y-4">
                  {property.rooms.map((room, index) => (
                    <div key={room.room_id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{room.room_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          room.room_status === 'active' ? 'bg-green-100 text-green-800' :
                          room.room_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {room.room_status || 'Draft'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Type: <span className="text-gray-900">{room.room_type || 'N/A'}</span></div>
                        <div>Class: <span className="text-gray-900">{room.room_class || 'N/A'}</span></div>
                        <div>Rooms: <span className="text-gray-900">{room.number_of_rooms || 1}</span></div>
                        <div>Occupancy: <span className="text-gray-900">{room.recommended_occupancy || 'N/A'}</span></div>
                        {room.base_rate && (
                          <div>Base Rate: <span className="text-gray-900">{room.base_rate} {property.currency || 'RWF'}</span></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Rooms</span>
                  <span className="text-lg font-semibold text-gray-900">{property.rooms?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Images</span>
                  <span className="text-lg font-semibold text-gray-900">{property.images?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Policies Set</span>
                  <span className="text-lg font-semibold text-gray-900">{property.policies ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amenities Set</span>
                  <span className="text-lg font-semibold text-gray-900">{property.amenities ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax Details</span>
                  <span className="text-lg font-semibold text-gray-900">{property.taxDetails ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Setup Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Progress</h3>
              <div className="space-y-2">
                {[
                  { label: 'Contract', complete: property.contract_accepted },
                  { label: 'Policies', complete: !!property.policies },
                  { label: 'Amenities', complete: !!property.amenities },
                  { label: 'Rooms', complete: (property.rooms?.length || 0) > 0 },
                  { label: 'Images', complete: (property.images?.length || 0) > 0 },
                  { label: 'Tax Details', complete: !!property.taxDetails }
                ].map((step, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{step.label}</span>
                    {step.complete ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/stays/dashboard')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  ← Back to Dashboard
                </button>
                {!property.setup_complete && (
                  <button
                    onClick={() => navigate('/stays/setup/in-progress')}
                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Continue Setup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
};

export default MyProperty;

