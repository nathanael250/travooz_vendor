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
  DollarSign,
  Settings,
  Tag,
  Receipt
} from 'lucide-react';
import { getPropertyWithAllData, updatePropertyListing, getMyPropertyListings, staysAuthService, staysSetupService } from '../../services/staysService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';
import AmenitiesTabContent from '../../components/stays/AmenitiesTabContent';
import RoomsTabContent from '../../components/stays/RoomsTabContent';

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

const MyPropertyTabbed = () => {
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
  const [activeTab, setActiveTab] = useState('basic'); // basic, rooms, policies, amenities, images, taxes
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

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building },
    { id: 'rooms', label: 'Rooms', icon: Bed },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'amenities', label: 'Amenities', icon: Settings },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'taxes', label: 'Taxes', icon: Receipt },
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab 
          property={property} 
          formData={formData} 
          editing={editing} 
          handleInputChange={handleInputChange}
          locationData={locationData}
        />;
      case 'rooms':
        return <RoomsTabContent property={property} onUpdate={fetchPropertyData} />;
      case 'policies':
        return <PoliciesTab property={property} editing={editing} />;
      case 'amenities':
        return <AmenitiesTabContent property={property} onUpdate={fetchPropertyData} />;
      case 'images':
        return <ImagesTab property={property} editing={editing} />;
      case 'taxes':
        return <TaxesTab property={property} editing={editing} />;
      default:
        return null;
    }
  };

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
                {activeTab === 'basic' && (
                  !editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
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
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setEditing(false); // Reset editing when changing tabs
                      }}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Tab Components
const BasicInfoTab = ({ property, formData, editing, handleInputChange, locationData }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
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
  </div>
);

// RoomsTab is now imported from RoomsTabContent component

const PoliciesTab = ({ property, editing }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900">Policies</h2>
    {property.policies ? (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
          <p className="text-gray-900">{property.policies.check_in_time || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
          <p className="text-gray-900">{property.policies.check_out_time || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
          <p className="text-gray-900">{property.policies.cancellation_policy || 'Not set'}</p>
        </div>
        {editing && (
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Edit Policies
          </button>
        )}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No policies set yet</p>
        {editing && (
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Set Policies
          </button>
        )}
      </div>
    )}
  </div>
);

// AmenitiesTab is now imported from AmenitiesTabContent component

const ImagesTab = ({ property, editing }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">Property Images</h2>
      {editing && (
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Upload Images
        </button>
      )}
    </div>
    {property.images && property.images.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {property.images.map((image, index) => (
          <div key={image.image_id || index} className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={buildImageUrl(image.image_url)}
              alt={`Property image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load image:', image.image_url);
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
            {image.is_primary && (
              <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}
            {editing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button className="text-white hover:text-red-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No images uploaded yet</p>
        {editing && (
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Upload Your First Image
          </button>
        )}
      </div>
    )}
  </div>
);

const TaxesTab = ({ property, editing }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900">Tax Details</h2>
    {property.taxDetails ? (
      <div className="space-y-4">
        <p className="text-gray-600">Tax details information will be displayed here</p>
        {editing && (
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Edit Tax Details
          </button>
        )}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No tax details set yet</p>
        {editing && (
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Add Tax Details
          </button>
        )}
      </div>
    )}
  </div>
);

export default MyPropertyTabbed;

