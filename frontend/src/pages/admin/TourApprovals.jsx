import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  FileText, 
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
  CreditCard,
  Award
} from 'lucide-react';
import AdminToursService from '../../services/AdminToursService';
import toast from 'react-hot-toast';

const TourApprovals = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    in_progress: 0
  });

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [filters]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const result = await AdminToursService.getAllSubmissions(filters);
      setSubmissions(result.data?.submissions || []);
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
      const result = await AdminToursService.getSubmissionStats();
      const statsData = result.data?.byStatus || {};
      setStats({
        total: result.data?.total || 0,
        pending_review: statsData.pending_review || 0,
        approved: statsData.approved || 0,
        rejected: statsData.rejected || 0,
        in_progress: statsData.in_progress || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const updateSubmissionStatus = async (submissionId, status) => {
    try {
      let notes = '';
      let rejectionReason = '';
      
      if (status === 'rejected') {
        rejectionReason = prompt('Enter rejection reason (optional):') || '';
        notes = prompt('Enter additional notes (optional):') || '';
      } else if (status === 'approved') {
        notes = prompt('Enter approval notes (optional):') || '';
      }
      
      await AdminToursService.updateSubmissionStatus(submissionId, status, notes, rejectionReason);
      
      // Refresh submissions and stats
      fetchSubmissions();
      fetchStats();
      
      // Show success message
      toast.success(`Submission ${status === 'approved' ? 'approved' : status} successfully!`);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const viewSubmission = (submissionId) => {
    navigate(`/admin/tour-approvals/${submissionId}`);
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
      in_progress: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Package Approvals</h1>
          <p className="text-gray-600">Review and approve tour package setup requests</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} icon={FileText} color="text-gray-600" />
        <StatCard title="Pending" value={stats.pending_review} icon={Clock} color="text-yellow-600" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" />
        <StatCard title="In Progress" value={stats.in_progress} icon={Clock} color="text-blue-600" />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
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
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={fetchSubmissions}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <Plane className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions</h3>
              <p className="mt-1 text-sm text-gray-500">No tour package submissions found matching your criteria.</p>
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
                    {submissions.map((submission) => (
                      <tr key={submission.submission_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-300">
                                <Plane className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.tour_business_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.tour_type_name || submission.tour_type || 'Tour Package'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{submission.owner_name || submission.first_name + ' ' + (submission.last_name || '') || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{submission.owner_email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{submission.location || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewSubmission(submission.submission_id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {submission.status === 'pending_review' && (
                              <>
                                <button
                                  onClick={() => updateSubmissionStatus(submission.submission_id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => updateSubmissionStatus(submission.submission_id, 'rejected')}
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
                    ))}
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
  );
};

export default TourApprovals;

