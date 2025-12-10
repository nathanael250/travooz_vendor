import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Package,
  AlertCircle,
  ArrowLeft,
  Shield,
  Menu,
  Bell,
  LogOut,
  LayoutDashboard,
  Settings,
  Building2,
  MapPin
} from 'lucide-react';
import AdminService from '../../services/AdminService';
import toast from 'react-hot-toast';

const AdminPackages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('businessId');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending_review: 0,
    active: 0,
    rejected: 0,
    total: 0
  });
  const [filter, setFilter] = useState('all'); // all, pending, active, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check authentication and setup mobile detection
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    if (!adminToken || !adminUser) {
      navigate('/admin/login', { replace: true });
      return;
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

  useEffect(() => {
    fetchPackages();
      fetchStats();
  }, [filter, businessId]);

  // Refetch when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPackages();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const filters = {
        status: filter === 'all' ? null : filter,
        search: searchQuery || null,
        limit: 100 // Increase limit to show all packages for the business
      };
      
      // Add businessId filter if provided - convert to number
      if (businessId) {
        filters.businessId = parseInt(businessId, 10);
      }
      
      const response = await AdminService.getPackages(filters);
      // Handle different response structures
      let packagesData = [];
      if (Array.isArray(response.data)) {
        packagesData = response.data;
      } else if (response.data && Array.isArray(response.data.packages)) {
        packagesData = response.data.packages;
      } else if (response && Array.isArray(response.packages)) {
        packagesData = response.packages;
      } else if (Array.isArray(response)) {
        packagesData = response;
      }
      setPackages(packagesData);
      
      // If filtering by business, get business name from first package
      if (businessId && packagesData.length > 0) {
        const businessNameFromPackage = packagesData[0].tour_business_name || packagesData[0].business_name;
        if (businessNameFromPackage) {
          setBusinessName(businessNameFromPackage);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
      setPackages([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = businessId ? { businessId: parseInt(businessId, 10) } : {};
      const response = await AdminService.getPackageStats(params);
      setStats(response.data || { pending_review: 0, active: 0, rejected: 0, total: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (packageId) => {
    if (!window.confirm('Are you sure you want to approve this package? It will become live and visible to customers.')) {
      return;
    }

    try {
      setActionLoading(packageId);
      await AdminService.approvePackage(packageId);
      toast.success('Package approved successfully');
      fetchPackages();
      fetchStats();
    } catch (error) {
      console.error('Error approving package:', error);
      toast.error(error.response?.data?.message || 'Failed to approve package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (packageId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setActionLoading(packageId);
      await AdminService.rejectPackage(packageId, { reason: reason.trim() });
      toast.success('Package rejected');
      fetchPackages();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting package:', error);
      toast.error(error.response?.data?.message || 'Failed to reject package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (packageId) => {
    try {
      const response = await AdminService.getPackageDetails(packageId);
      setSelectedPackage(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast.error('Failed to load package details');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_review: {
        icon: Clock,
        color: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
        label: 'Pending Review'
      },
      active: {
        icon: CheckCircle,
        color: 'bg-green-900/30 text-green-400 border-green-700',
        label: 'Active'
      },
      rejected: {
        icon: XCircle,
        color: 'bg-red-900/30 text-red-400 border-red-700',
        label: 'Rejected'
      },
      draft: {
        icon: AlertCircle,
        color: 'bg-gray-800 text-gray-400 border-gray-700',
        label: 'Draft'
      }
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const filteredPackages = Array.isArray(packages) ? packages.filter(pkg => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pkg.name?.toLowerCase().includes(query) ||
        pkg.package_name?.toLowerCase().includes(query) ||
        (pkg.tour_business_name || pkg.business_name)?.toLowerCase().includes(query) ||
        pkg.category?.toLowerCase().includes(query)
      );
    }
    return true;
  }) : [];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  const navLinks = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onClick: () => navigate('/admin/dashboard') },
    { key: 'packages', label: 'Tour Packages', icon: Package, active: true },
    { key: 'services', label: 'Services', icon: Building2 },
    { key: 'reports', label: 'Reports', icon: MapPin },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

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
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navLinks.map(({ key, label, icon: Icon, active, onClick }) => (
            <button
              key={key}
              onClick={onClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-gray-300 hover:bg-gray-800'
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 rounded-md text-sm font-semibold bg-gray-800 text-gray-100 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
      </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen bg-gray-950 overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-800 text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Packages</p>
                <h2 className="text-xl font-semibold text-white">
                  {businessId ? `Tour Packages - ${businessName || 'Business'}` : 'Tour Packages Management'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="bg-transparent text-sm focus:outline-none text-gray-100 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="relative p-2 rounded-full border border-gray-700 text-gray-300 hover:text-white">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 border border-gray-700 rounded-full px-3 py-1.5">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold">
                  AD
            </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-gray-400">Administrator</p>
          </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="space-y-6">
              {businessId && (
                <div className="flex items-center justify-end mb-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Account
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium truncate text-gray-400">Total Packages</dt>
                          <dd className="text-lg font-semibold text-gray-100">{stats.total}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium truncate text-gray-400">Pending Review</dt>
                          <dd className="text-lg font-semibold text-yellow-400">{stats.pending_review || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium truncate text-gray-400">Active</dt>
                          <dd className="text-lg font-semibold text-green-400">{stats.active}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <XCircle className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium truncate text-gray-400">Rejected</dt>
                          <dd className="text-lg font-semibold text-red-400">{stats.rejected}</dd>
                        </dl>
                      </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative md:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages by name, business, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <button
              onClick={fetchPackages}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Packages Table */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-400">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No packages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Package Name
                    </th>
                    {!businessId && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Business
                    </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredPackages.map((pkg) => {
                    const packageId = pkg.package_id || pkg.id;
                    return (
                      <tr key={packageId} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-100">{pkg.package_name || pkg.name || 'N/A'}</div>
                        {pkg.short_description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-md">
                            {pkg.short_description}
                          </div>
                        )}
                      </td>
                        {!businessId && (
                      <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-100">{pkg.tour_business_name || pkg.business_name || 'N/A'}</div>
                      </td>
                        )}
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-100">{pkg.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pkg.status)}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                              onClick={() => handleViewDetails(packageId)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {pkg.status === 'pending_review' && (
                            <>
                              <button
                                  onClick={() => handleApprove(packageId)}
                                  disabled={actionLoading === packageId}
                                  className="text-green-400 hover:text-green-300 flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                  onClick={() => handleReject(packageId)}
                                  disabled={actionLoading === packageId}
                                  className="text-red-400 hover:text-red-300 flex items-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Package Details Modal */}
        {showDetailsModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
                  <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-100">Package Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPackage(null);
                    }}
                        className="text-gray-400 hover:text-gray-200"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                        <label className="text-sm font-medium text-gray-400">Package Name</label>
                        <p className="text-sm text-gray-100 mt-1">{selectedPackage.package_name || selectedPackage.name || 'N/A'}</p>
                  </div>
                  <div>
                        <label className="text-sm font-medium text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedPackage.status)}</div>
                  </div>
                  <div>
                        <label className="text-sm font-medium text-gray-400">Business</label>
                        <p className="text-sm text-gray-100 mt-1">{selectedPackage.tour_business_name || selectedPackage.business_name || 'N/A'}</p>
                  </div>
                  <div>
                        <label className="text-sm font-medium text-gray-400">Category</label>
                        <p className="text-sm text-gray-100 mt-1">{selectedPackage.category || 'N/A'}</p>
                  </div>
                  <div>
                        <label className="text-sm font-medium text-gray-400">Created At</label>
                        <p className="text-sm text-gray-100 mt-1">
                      {selectedPackage.created_at ? new Date(selectedPackage.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                        <label className="text-sm font-medium text-gray-400">Updated At</label>
                        <p className="text-sm text-gray-100 mt-1">
                      {selectedPackage.updated_at ? new Date(selectedPackage.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedPackage.short_description && (
                  <div>
                        <label className="text-sm font-medium text-gray-400">Short Description</label>
                        <p className="text-sm text-gray-100 mt-1">{selectedPackage.short_description}</p>
                  </div>
                )}
                {selectedPackage.description && (
                  <div>
                        <label className="text-sm font-medium text-gray-400">Description</label>
                        <p className="text-sm text-gray-100 mt-1 whitespace-pre-wrap">{selectedPackage.description}</p>
                  </div>
                )}
                {selectedPackage.status === 'pending_review' && (
                      <div className="flex gap-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => {
                            const packageId = selectedPackage.package_id || selectedPackage.id;
                            handleApprove(packageId);
                        setShowDetailsModal(false);
                      }}
                          disabled={actionLoading === (selectedPackage.package_id || selectedPackage.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Approve Package
                    </button>
                    <button
                      onClick={() => {
                            const packageId = selectedPackage.package_id || selectedPackage.id;
                            handleReject(packageId);
                        setShowDetailsModal(false);
                      }}
                          disabled={actionLoading === (selectedPackage.package_id || selectedPackage.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      Reject Package
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPackages;

