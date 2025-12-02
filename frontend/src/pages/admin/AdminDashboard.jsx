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
  LogOut,
  Menu,
  Bell,
  Settings,
  ChevronDown,
  LayoutDashboard,
  X,
  Trash2
} from 'lucide-react';
import AdminService from '../../services/AdminService';
import toast from 'react-hot-toast';
import AccountActionModal from '../../components/admin/AccountActionModal';

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
    status: 'all',
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: 'approve',
    account: null,
    loading: false,
  });

  // Check authentication on mount
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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  const openActionModal = (type, account) => {
    setActionModal({
      open: true,
      type,
      account,
      loading: false,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      open: false,
      type: 'approve',
      account: null,
      loading: false,
    });
  };

  const submitAction = async (payload) => {
    const { account, type } = actionModal;
    if (!account) return;

    try {
      setActionModal((prev) => ({ ...prev, loading: true }));
      if (type === 'approve') {
        await AdminService.approveAccount(account.service_type, account.account_id, payload.approvalNote);
        toast.success('Account approved successfully!');
      } else {
        await AdminService.rejectAccount(
          account.service_type,
          account.account_id,
          payload.rejectionReason,
          payload.returnToStep
        );
        toast.success('Changes requested from vendor.');
      }
      closeActionModal();
      fetchAccounts();
      fetchStats();
    } catch (err) {
      setActionModal((prev) => ({ ...prev, loading: false }));
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDeleteAccount = async (account) => {
    const serviceName = getServiceName(account.service_type);
    const businessName = account.business_name || 'this vendor';
    
    const confirmed = window.confirm(
      `⚠️ WARNING: This action cannot be undone!\n\n` +
      `Are you sure you want to permanently delete ${businessName} (${serviceName})?\n\n` +
      `This will delete:\n` +
      `• The vendor account\n` +
      `• All business data\n` +
      `• All associated records\n` +
      `• All uploaded files\n\n` +
      `Type the business name to confirm deletion.`
    );

    if (!confirmed) return;

    // Additional confirmation with business name
    const typedName = window.prompt(
      `To confirm deletion, please type the business name:\n"${businessName}"`
    );

    if (typedName !== businessName) {
      toast.error('Business name does not match. Deletion cancelled.');
      return;
    }

    try {
      setLoading(true);
      await AdminService.deleteAccount(account.service_type, account.account_id);
      toast.success('Account and all associated data deleted successfully');
      fetchAccounts();
      fetchStats();
    } catch (err) {
      toast.error(`Error deleting account: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (account) => {
    if (account?.service_type === 'tours') {
      navigate(`/admin/accounts/${account.service_type}/${account.account_id}`);
      return;
    }
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedAccount(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
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
    <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium truncate text-gray-400">{title}</dt>
              <dd className="text-lg font-semibold text-gray-100">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const navLinks = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'approvals', label: 'Account Approvals', icon: Shield, active: true },
    { key: 'services', label: 'Services', icon: Building2 },
    { key: 'reports', label: 'Reports', icon: MapPin },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  const serviceFilterOptions = [
    { key: 'all', label: 'All Services' },
    { key: 'car_rental', label: 'Car Rental', icon: Car },
    { key: 'tours', label: 'Tours', icon: Plane },
    { key: 'stays', label: 'Stays', icon: Home },
    { key: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed }
  ];

  const statusFilterOptions = [
    { key: 'pending_review', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All Statuses' }
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
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Overview</p>
                <h2 className="text-xl font-semibold text-white">Account Approvals</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="bg-transparent text-sm focus:outline-none text-gray-100"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                />
              </div>
              <button className="relative p-2 rounded-full border border-gray-700 text-gray-300 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2 border border-gray-700 rounded-full px-3 py-1.5">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 border border-gray-700 rounded-md text-sm font-semibold bg-gray-800 text-gray-100 hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 overflow-y-auto">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatCard title="Total Pending" value={stats.pending_review} icon={Clock} color="text-yellow-400" />
              <StatCard title="Car Rental" value={stats.by_service?.car_rental || 0} icon={Car} color="text-blue-300" />
              <StatCard title="Tours" value={stats.by_service?.tours || 0} icon={Plane} color="text-green-300" />
              <StatCard title="Stays" value={stats.by_service?.stays || 0} icon={Home} color="text-purple-300" />
              <StatCard title="Restaurant" value={stats.by_service?.restaurant || 0} icon={UtensilsCrossed} color="text-red-400" />
            </div>

            {/* Service Filters */}
            <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
              <p className="text-sm font-semibold text-gray-200 mb-3">Filter by Service</p>
              <div className="flex flex-wrap gap-3">
                {serviceFilterOptions.map(({ key, label, icon: Icon }) => {
                  const active = filters.service_type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilters({ ...filters, service_type: key, page: 1 })}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        active
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Pending Accounts</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium bg-gray-800 text-gray-100 hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Service Type</label>
                  <select
                    value={filters.service_type}
                    onChange={(e) => setFilters({ ...filters, service_type: e.target.value, page: 1 })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-100"
                  >
                    {serviceFilterOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-100"
                  >
                    {statusFilterOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Search</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-100 placeholder-gray-400"
                      placeholder="Search by business name, owner..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Per Page</label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value, 10), page: 1 })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-100"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Accounts Table */}
          <div className="bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-800">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-gray-600">Loading accounts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-400">Error: {error}</p>
                  <button
                    onClick={fetchAccounts}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Retry
                  </button>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-gray-100">No accounts to show</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    We couldn't find any businesses for "{serviceFilterOptions.find(o => o.key === filters.service_type)?.label || 'All Services'}" with status "{statusFilterOptions.find(o => o.key === filters.status)?.label || 'All Statuses'}".
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-gray-800/80">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Service Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {accounts.map((account) => {
                          const ServiceIcon = getServiceIcon(account.service_type);
                          return (
                            <tr
                              key={`${account.service_type}-${account.account_id}`}
                              className="hover:bg-gray-900/60 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-800">
                                      <ServiceIcon className="h-5 w-5 text-gray-200" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">
                                      {account.business_name || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-100">{account.owner_name || 'N/A'}</div>
                                <div className="text-sm text-gray-400">{account.owner_email || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-100">{getServiceName(account.service_type)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-100">{account.location || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(account.status || account.submission_status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {account.submitted_at ? new Date(account.submitted_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => openDetails(account)}
                                    className="text-indigo-400 hover:text-indigo-200"
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {(account.status === 'pending_review' || account.submission_status === 'pending_review' || account.status === 'pending') && (
                                    <>
                                      <button
                                        onClick={() => openActionModal('approve', account)}
                                        className="text-green-400 hover:text-green-200"
                                        title="Approve"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => openActionModal('reject', account)}
                                        className="text-red-400 hover:text-red-200"
                                        title="Reject"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAccount(account)}
                                    className="text-red-500 hover:text-red-300"
                                    title="Delete Account"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
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
      </main>
    </div>

    {detailsOpen && selectedAccount && (
      <div className="fixed inset-0 z-40 flex">
        <div className="absolute inset-0 bg-black/70" onClick={closeDetails}></div>
        <div className="relative ml-auto w-full max-w-xl h-full bg-gray-900 text-gray-100 shadow-2xl flex flex-col border-l border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-400">Business Details</p>
              <h3 className="text-lg font-semibold text-white">{selectedAccount.business_name || 'N/A'}</h3>
              <p className="text-sm text-gray-400 capitalize">{selectedAccount.service_type}</p>
            </div>
            <button onClick={closeDetails} className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <section>
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Business Info</h4>
              <div className="space-y-3">
                <DetailRow label="Status" value={getStatusBadge(selectedAccount.status || selectedAccount.submission_status)} isBadge />
                <DetailRow label="Location" value={selectedAccount.location || 'N/A'} icon={MapPin} />
                <DetailRow label="Submitted At" value={formatDate(selectedAccount.submitted_at)} />
                <DetailRow label="Current Step" value={selectedAccount.current_step || 'N/A'} />
              </div>
            </section>
            <section>
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Owner Info</h4>
              <div className="space-y-3">
                <DetailRow label="Name" value={selectedAccount.owner_name || 'N/A'} icon={Users} />
                <DetailRow label="Email" value={selectedAccount.owner_email || 'N/A'} icon={Mail} />
                <DetailRow label="Phone" value={selectedAccount.owner_phone || 'N/A'} icon={Phone} />
              </div>
            </section>
          </div>
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={() => openActionModal('reject', selectedAccount)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={() => openActionModal('approve', selectedAccount)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          </div>
        </div>
      </div>
    )}

    <AccountActionModal
      open={actionModal.open}
      type={actionModal.type}
      account={actionModal.account}
      loading={actionModal.loading}
      onClose={closeActionModal}
      onConfirm={submitAction}
    />
  </div>
  );
};

export default AdminDashboard;

const DetailRow = ({ label, value, icon: Icon, isBadge = false }) => (
  <div className="flex items-start gap-3 text-sm">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5" />}
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <div className="text-gray-100 mt-0.5">
        {isBadge ? value : value || 'N/A'}
      </div>
    </div>
  </div>
);

