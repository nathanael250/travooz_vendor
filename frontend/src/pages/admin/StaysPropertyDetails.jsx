import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Home,
  MapPin,
  Mail,
  Phone,
  Building2,
  Users,
  DollarSign,
  Calendar,
  Bed,
  Wifi,
  Car,
  Coffee,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Clock,
  CreditCard,
  AlertCircle,
  FileText,
  Shield,
  LayoutDashboard,
  Settings,
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  X
} from 'lucide-react';
import AdminService from '../../services/AdminService';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const FILE_BASE = API_BASE.replace(/\/api\/v1$/i, '');

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${FILE_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-1" />}
    <div className="flex-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-gray-100 text-sm mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
);

const SectionCard = ({ title, children, icon: Icon }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-[#3CAF54]" />}
      {title}
    </h3>
    {children}
  </div>
);

const NAV_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'approvals', label: 'Account Approvals', icon: Shield, active: true },
  { key: 'services', label: 'Services', icon: Building2 },
  { key: 'reports', label: 'Reports', icon: MapPin },
  { key: 'settings', label: 'Settings', icon: Settings }
];

const StaysPropertyDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [accountId]);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    if (!adminToken || !adminUser) {
      navigate('/admin/login', { replace: true });
    }

    const handleResize = () => {
      const mobileView = window.innerWidth < 1024;
      setIsMobile(mobileView);
      setSidebarOpen(!mobileView);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const result = await AdminService.getStaysPropertyDetails(accountId);
      setProperty(result.data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this property? It will become visible to customers.')) {
      return;
    }

    try {
      setActionLoading(true);
      await AdminService.approveAccount('stays', accountId, { notes: '' });
      toast.success('Property approved successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error approving property:', error);
      toast.error(error.response?.data?.message || 'Failed to approve property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setActionLoading(true);
      await AdminService.rejectAccount('stays', accountId, { notes: reason.trim() });
      toast.success('Property rejected');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast.error(error.response?.data?.message || 'Failed to reject property');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-500/10', text: 'text-gray-300', label: 'Draft' },
      pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-300', label: 'Pending Review' },
      approved: { bg: 'bg-green-500/10', text: 'text-green-300', label: 'Approved' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-300', label: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.text.replace('text-', 'border-')}/30`}>
        {config.label}
      </span>
    );
  };

  let content = null;

  if (loading) {
    content = (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
          <p className="text-sm text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  } else if (!property) {
    content = (
      <div className="flex items-center justify-center py-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <Shield className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm text-gray-400">Property not found</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-800 text-sm text-gray-300 hover:bg-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-widest">Reviewing</p>
              <h1 className="text-2xl font-semibold text-white">{property.property_name || 'Untitled Property'}</h1>
              <div className="mt-2 flex items-center gap-3">
                {getStatusBadge(property.status)}
                <span className="text-xs text-gray-400">
                  Property ID: <span className="text-gray-100 font-medium">{property.property_id}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <SectionCard title="Property Images" icon={Home}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.map((img, index) => (
                    <img
                      key={index}
                      src={buildImageUrl(img.image_url || img)}
                      alt={`Property ${index + 1}`}
                      onClick={() => setPreviewImage(buildImageUrl(img.image_url || img))}
                      className="w-full h-40 object-cover rounded-lg border border-gray-700 cursor-pointer hover:border-[#3CAF54] transition-colors"
                    />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Basic Information */}
            <SectionCard title="Basic Information" icon={Building2}>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Property Name" value={property.property_name} icon={Home} />
                <InfoRow label="Property Type" value={property.property_type} icon={Building2} />
                <InfoRow label="Legal Name" value={property.legal_name} icon={FileText} />
                <InfoRow label="Number of Rooms" value={property.number_of_rooms} icon={Bed} />
                <InfoRow label="Currency" value={property.currency} icon={DollarSign} />
                <InfoRow 
                  label="Location" 
                  value={property.location_data?.formatted_address || property.location} 
                  icon={MapPin} 
                />
              </div>
            </SectionCard>

            {/* Rooms */}
            {property.rooms && property.rooms.length > 0 && (
              <SectionCard title={`Rooms (${property.rooms.length})`} icon={Bed}>
                <div className="space-y-4">
                  {property.rooms.map((room, index) => (
                    <div key={room.room_id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-100">{room.room_name}</h4>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                          {room.number_of_rooms} {room.number_of_rooms === 1 ? 'room' : 'rooms'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-100">{room.room_type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Class:</span>
                          <span className="ml-2 text-gray-100">{room.room_class || 'Standard'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Occupancy:</span>
                          <span className="ml-2 text-gray-100">{room.recommended_occupancy} guests</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Base Rate:</span>
                          <span className="ml-2 text-gray-100 font-semibold">
                            {property.currency} {parseFloat(room.base_rate || 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Smoking:</span>
                          <span className="ml-2 text-gray-100">{room.smoking_policy}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pricing:</span>
                          <span className="ml-2 text-gray-100">{room.pricing_model}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Amenities */}
            {property.amenities && (
              <SectionCard title="Property Amenities" icon={Coffee}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.has_front_desk === 'yes' && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="h-4 w-4 text-[#3CAF54]" />
                      Front Desk
                    </div>
                  )}
                  {property.amenities.offer_breakfast === 'yes' && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Coffee className="h-4 w-4 text-[#3CAF54]" />
                      Breakfast
                    </div>
                  )}
                  {property.amenities.offer_internet === 'yes' && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Wifi className="h-4 w-4 text-[#3CAF54]" />
                      Internet/WiFi
                    </div>
                  )}
                  {property.amenities.offer_parking === 'yes' && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Car className="h-4 w-4 text-[#3CAF54]" />
                      Parking
                    </div>
                  )}
                  {property.amenities.has_pool && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Waves className="h-4 w-4 text-[#3CAF54]" />
                      Pool
                    </div>
                  )}
                  {property.amenities.has_spa && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Waves className="h-4 w-4 text-[#3CAF54]" />
                      Spa
                    </div>
                  )}
                  {property.amenities.has_fitness_center && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Dumbbell className="h-4 w-4 text-[#3CAF54]" />
                      Fitness Center
                    </div>
                  )}
                  {property.amenities.has_restaurant && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <UtensilsCrossed className="h-4 w-4 text-[#3CAF54]" />
                      Restaurant
                    </div>
                  )}
                  {property.amenities.has_bar && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <UtensilsCrossed className="h-4 w-4 text-[#3CAF54]" />
                      Bar
                    </div>
                  )}
                  {property.amenities.has_concierge && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="h-4 w-4 text-[#3CAF54]" />
                      Concierge
                    </div>
                  )}
                  {property.amenities.has_laundry && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Home className="h-4 w-4 text-[#3CAF54]" />
                      Laundry
                    </div>
                  )}
                  {property.amenities.has_business_center && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Building2 className="h-4 w-4 text-[#3CAF54]" />
                      Business Center
                    </div>
                  )}
                  {property.amenities.pets_allowed === 'yes' && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="h-4 w-4 text-[#3CAF54]" />
                      Pets Allowed
                    </div>
                  )}
                </div>

                {/* Check-in Info */}
                {(property.amenities.check_in_time || property.amenities.min_check_in_age) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm font-medium text-gray-300 mb-2">Check-in Information</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {property.amenities.check_in_time && (
                        <div>
                          <span className="text-gray-500">Check-in Time:</span>
                          <span className="ml-2 text-gray-100">{property.amenities.check_in_time}</span>
                        </div>
                      )}
                      {property.amenities.check_in_ends && (
                        <div>
                          <span className="text-gray-500">Check-in Ends:</span>
                          <span className="ml-2 text-gray-100">{property.amenities.check_in_ends}</span>
                        </div>
                      )}
                      {property.amenities.min_check_in_age && (
                        <div>
                          <span className="text-gray-500">Minimum Age:</span>
                          <span className="ml-2 text-gray-100">{property.amenities.min_check_in_age} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Policies */}
            {property.policies && (
              <SectionCard title="Policies & Settings" icon={FileText}>
                <div className="space-y-4">
                  {/* Languages */}
                  {property.policies.languages && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">Languages Spoken</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            // Try to parse as JSON array
                            const langs = typeof property.policies.languages === 'string' 
                              ? JSON.parse(property.policies.languages) 
                              : property.policies.languages;
                            return (Array.isArray(langs) ? langs : []).map((lang, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                                {lang}
                              </span>
                            ));
                          } catch (e) {
                            // Fallback: treat as comma-separated string
                            const langs = property.policies.languages.split(',').map(l => l.trim()).filter(Boolean);
                            return langs.map((lang, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                                {lang}
                              </span>
                            ));
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Payment Methods Accepted</p>
                    <div className="flex flex-wrap gap-2">
                      {property.policies.accept_credit_debit_cards && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          Credit/Debit Cards
                        </span>
                      )}
                      {property.policies.accept_travooz_card && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                          Travooz Card
                        </span>
                      )}
                      {property.policies.accept_mobile_money && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                          Mobile Money
                        </span>
                      )}
                      {property.policies.accept_airtel_money && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                          Airtel Money
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cancellation */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Cancellation Window:</span>
                      <span className="ml-2 text-gray-100">{property.policies.cancellation_window?.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cancellation Fee:</span>
                      <span className="ml-2 text-gray-100">{property.policies.cancellation_fee?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Taxes */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {property.policies.vat_percentage && (
                      <div>
                        <span className="text-gray-500">VAT:</span>
                        <span className="ml-2 text-gray-100">{property.policies.vat_percentage}%</span>
                      </div>
                    )}
                    {property.policies.tourism_tax_percentage && (
                      <div>
                        <span className="text-gray-500">Tourism Tax:</span>
                        <span className="ml-2 text-gray-100">{property.policies.tourism_tax_percentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Column - Owner Info & Actions */}
          <div className="space-y-6">
            {/* Owner Information */}
            <SectionCard title="Property Owner" icon={Users}>
              <div className="space-y-3">
                <InfoRow label="Name" value={property.owner_name} icon={Users} />
                <InfoRow label="Email" value={property.owner_email} icon={Mail} />
                <InfoRow label="Phone" value={property.owner_phone} icon={Phone} />
              </div>
            </SectionCard>

            {/* Submission Info */}
            <SectionCard title="Submission Details" icon={Calendar}>
              <div className="space-y-3">
                <InfoRow 
                  label="Submitted At" 
                  value={property.submitted_at ? new Date(property.submitted_at).toLocaleString() : 'Not submitted'} 
                  icon={Clock} 
                />
                <InfoRow 
                  label="Created At" 
                  value={new Date(property.created_at).toLocaleString()} 
                  icon={Calendar} 
                />
                {property.approved_at && (
                  <InfoRow 
                    label="Approved At" 
                    value={new Date(property.approved_at).toLocaleString()} 
                    icon={CheckCircle} 
                  />
                )}
              </div>
            </SectionCard>

            {/* Action Buttons */}
            {(property.status === 'pending' || property.status === 'pending_review') && (
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="h-5 w-5" />
                  Approve Property
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="h-5 w-5" />
                  Reject Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Travooz</p>
              <h1 className="text-lg font-semibold text-white">Admin Console</h1>
            </div>
          </div>
          {isMobile && (
            <button
              className="p-2 rounded-md hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {NAV_LINKS.map(({ key, label, icon: Icon, active }) => (
            <button
              key={key}
              onClick={() => key === 'dashboard' && navigate('/admin/dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
        {isMobile && (
          <div className="px-6 py-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-950 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-800 text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Property Details</p>
                <h2 className="text-xl font-semibold text-white">Stays Management</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="bg-transparent text-sm focus:outline-none text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="relative p-2 rounded-md hover:bg-gray-800 text-gray-400 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden lg:flex items-center gap-2 ml-2 cursor-pointer hover:bg-gray-800 rounded-lg px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div>
                  <p className="text-xs text-gray-400">Admin</p>
                  <p className="text-sm font-medium text-gray-200">Administrator</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {content}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaysPropertyDetails;

