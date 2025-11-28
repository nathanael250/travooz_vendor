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
  ArrowLeft
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
    pending: 0,
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

  useEffect(() => {
    fetchPackages();
    if (!businessId) {
      fetchStats();
    }
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
        search: searchQuery || null
      };
      
      // Add businessId filter if provided
      if (businessId) {
        filters.businessId = businessId;
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
      const response = await AdminService.getPackageStats();
      setStats(response.data || { pending: 0, active: 0, rejected: 0, total: 0 });
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
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        label: 'Pending Review'
      },
      active: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-300',
        label: 'Active'
      },
      rejected: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-300',
        label: 'Rejected'
      },
      draft: {
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-800 border-gray-300',
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

  // Check authentication
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    if (!adminToken || !adminUser) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Tour Packages</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6" />
                {businessId ? `Tour Packages - ${businessName || 'Business'}` : 'Tour Packages Management'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {businessId 
                  ? `Packages for this business account` 
                  : 'Review and manage tour packages'}
              </p>
            </div>
            {businessId && (
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Account
              </button>
            )}
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages by name, business, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
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
              className="px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#35a048] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Packages Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3CAF54]"></div>
              <p className="mt-4 text-gray-600">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No packages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pkg.package_name || pkg.name || 'N/A'}</div>
                        {pkg.short_description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {pkg.short_description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.tour_business_name || pkg.business_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pkg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(pkg.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {pkg.status === 'pending_review' && (
                            <>
                              <button
                                onClick={() => handleApprove(pkg.id)}
                                disabled={actionLoading === pkg.id}
                                className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(pkg.id)}
                                disabled={actionLoading === pkg.id}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Package Details Modal */}
        {showDetailsModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Package Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPackage(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Package Name</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPackage.package_name || selectedPackage.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedPackage.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Business</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPackage.tour_business_name || selectedPackage.business_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPackage.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPackage.created_at ? new Date(selectedPackage.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Updated At</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPackage.updated_at ? new Date(selectedPackage.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedPackage.short_description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Short Description</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPackage.short_description}</p>
                  </div>
                )}
                {selectedPackage.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedPackage.description}</p>
                  </div>
                )}
                {selectedPackage.status === 'pending_review' && (
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleApprove(selectedPackage.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={actionLoading === selectedPackage.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Approve Package
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedPackage.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={actionLoading === selectedPackage.id}
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
  );
};

export default AdminPackages;

