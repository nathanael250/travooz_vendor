import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Search,
  MapPin,
  Users,
  Mail,
  Phone,
  Building2,
  Car,
  Plane,
  Home,
  UtensilsCrossed,
  LogOut
} from 'lucide-react';
import AdminService from '../../services/AdminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending_review: 0,
    by_service: {
      car_rental: 0,
      tours: 0,
      stays: 0,
      restaurant: 0
    }
  });

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'pending_review',
    search: '',
    page: 1,
    limit: 10,
    service_type: 'all'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Check authentication on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    if (!adminToken || !adminUser) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Fetch data when filters change (only if authenticated)
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      fetchAccounts();
      fetchStats();
    }
  }, [filters]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const result = await AdminService.getAllPendingAccounts(filters);
      setAccounts(result.data?.accounts || []);
      setPagination(result.data?.pagination || pagination);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await AdminService.getAccountStats();
      setStats(result.data || stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApprove = async (serviceType, accountId) => {
    try {
      const notes = prompt('Enter approval notes (optional):') || '';
      await AdminService.approveAccount(serviceType, accountId, notes);
      
      // Refresh accounts and stats
      fetchAccounts();
      fetchStats();
      
      toast.success('Account approved successfully!');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleReject = async (serviceType, accountId) => {
    try {
      const rejectionReason = prompt('Enter rejection reason (required):') || '';
      if (!rejectionReason) {
        toast.error('Rejection reason is required');
        return;
      }
      const notes = prompt('Enter additional notes (optional):') || '';
      
      await AdminService.rejectAccount(serviceType, accountId, rejectionReason, notes);
      
      // Refresh accounts and stats
      fetchAccounts();
      fetchStats();
      
      toast.success('Account rejected successfully!');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'car_rental':
        return Car;
      case 'tours':
        return Plane;
      case 'stays':
        return Home;
      case 'restaurant':
        return UtensilsCrossed;
      default:
        return Building2;
    }
  };

  const getServiceName = (serviceType) => {
    switch (serviceType) {
      case 'car_rental':
        return 'Car Rental';
      case 'tours':
        return 'Tour Package';
      case 'stays':
        return 'Stays';
      case 'restaurant':
        return 'Restaurant';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status) => {
    const safeStatus = status || 'pending_review';
    
    const statusConfig = {
      pending_review: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock 
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock 
      }
    };

    const config = statusConfig[safeStatus] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {safeStatus.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium truncate text-gray-500">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage account approvals</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard title="Total Pending" value={stats.pending_review} icon={Clock} color="text-yellow-600" />
            <StatCard title="Car Rental" value={stats.by_service?.car_rental || 0} icon={Car} color="text-blue-600" />
            <StatCard title="Tours" value={stats.by_service?.tours || 0} icon={Plane} color="text-green-600" />
            <StatCard title="Stays" value={stats.by_service?.stays || 0} icon={Home} color="text-purple-600" />
            <StatCard title="Restaurant" value={stats.by_service?.restaurant || 0} icon={UtensilsCrossed} color="text-red-600" />
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pending Accounts</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <select
                    value={filters.service_type}
                    onChange={(e) => setFilters({ ...filters, service_type: e.target.value, page: 1 })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
                  >
                    <option value="all">All Services</option>
                    <option value="car_rental">Car Rental</option>
                    <option value="tours">Tours</option>
                    <option value="stays">Stays</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Search</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Search by business name, owner..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Per Page</label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Accounts Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-gray-600">Loading accounts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-600">Error: {error}</p>
                  <button
                    onClick={fetchAccounts}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Retry
                  </button>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending accounts</h3>
                  <p className="mt-1 text-sm text-gray-500">No accounts found matching your criteria.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Service Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accounts.map((account) => {
                          const ServiceIcon = getServiceIcon(account.service_type);
                          return (
                            <tr key={`${account.service_type}-${account.account_id}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-300">
                                      <ServiceIcon className="h-5 w-5 text-gray-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {account.business_name || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{account.owner_name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{account.owner_email || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{getServiceName(account.service_type)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{account.location || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(account.status || account.submission_status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {account.submitted_at ? new Date(account.submitted_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  {(account.status === 'pending_review' || account.submission_status === 'pending_review' || account.status === 'pending') && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(account.service_type, account.account_id)}
                                        className="text-green-600 hover:text-green-900"
                                        title="Approve"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleReject(account.service_type, account.account_id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Reject"
                                      >
                                        <XCircle className="h-4 w-4" />
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
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                          disabled={pagination.page === 1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                          disabled={pagination.page >= pagination.totalPages}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

