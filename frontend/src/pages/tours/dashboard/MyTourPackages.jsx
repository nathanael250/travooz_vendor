import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { tourPackagesAPI } from '../../../services/tourDashboardService';
import toast from 'react-hot-toast';
import NoTourPackagesCard from '../../../components/tours/NoTourPackagesCard';

const MyTourPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Get business ID from localStorage or fetch it
      let businessId = localStorage.getItem('tour_business_id');
      if (!businessId) {
        try {
          const apiClient = (await import('../../../services/apiClient')).default;
          const response = await apiClient.get('/tours/businesses/my');
          const businesses = response.data?.data || response.data || [];
          if (businesses.length > 0) {
            businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
            if (businessId) {
              localStorage.setItem('tour_business_id', businessId);
            }
          }
        } catch (error) {
          console.error('Error fetching business ID:', error);
        }
      }
      
      // Fetch packages for this business
      let data = [];
      if (businessId) {
        try {
          const apiClient = (await import('../../../services/apiClient')).default;
          const response = await apiClient.get(`/tours/packages/business/${businessId}`);
          data = response.data?.data || response.data || [];
        } catch (error) {
          console.error('Error fetching packages by business:', error);
          // Fallback to old method
          data = await tourPackagesAPI.getAll();
        }
      } else {
        data = await tourPackagesAPI.getAll();
      }
      
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch tour packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this tour package?')) {
      return;
    }

    try {
      await tourPackagesAPI.delete(packageId);
      toast.success('Tour package deleted successfully');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete tour package');
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const title = pkg.title || pkg.name || '';
    const description = pkg.description || pkg.short_description || pkg.full_description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour packages...</p>
        </div>
      </div>
    );
  }

  // If no packages exist, show only the empty state message
  if (packages.length === 0) {
    return (
      <NoTourPackagesCard 
        onCreateClick={async () => {
          // Clear any existing draft data when creating a new package
          localStorage.removeItem('tour_package_draft');
          
          // Try to get businessId from localStorage or fetch it
          let businessId = localStorage.getItem('tour_business_id');
          if (!businessId) {
            try {
              const apiClient = (await import('../../../services/apiClient')).default;
              const response = await apiClient.get('/tours/businesses/my');
              const businesses = response.data?.data || response.data || [];
              if (businesses.length > 0) {
                businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
                if (businessId) {
                  localStorage.setItem('tour_business_id', businessId);
                }
              }
            } catch (error) {
              console.error('Error fetching business ID:', error);
            }
          }
          navigate(`/tours/dashboard/packages/create${businessId ? `?businessId=${businessId}` : ''}`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Tour Packages</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all your tour packages</p>
        </div>
        <button
          onClick={async () => {
            // Clear any existing draft data when creating a new package
            localStorage.removeItem('tour_package_draft');
            
            // Try to get businessId from localStorage or fetch it
            let businessId = localStorage.getItem('tour_business_id');
            if (!businessId) {
              try {
                const apiClient = (await import('../../../services/apiClient')).default;
                const response = await apiClient.get('/tours/businesses/my');
                const businesses = response.data?.data || response.data || [];
                if (businesses.length > 0) {
                  businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
                  if (businessId) {
                    localStorage.setItem('tour_business_id', businessId);
                  }
                }
              } catch (error) {
                console.error('Error fetching business ID:', error);
              }
            }
            navigate(`/tours/dashboard/packages/create${businessId ? `?businessId=${businessId}` : ''}`);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tour packages found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Card View */}
          <div className="block md:hidden space-y-4">
            {filteredPackages.map((pkg) => {
              const packageId = pkg.id || pkg.package_id;
              const packageName = pkg.title || pkg.name || 'Unnamed Package';
              const category = pkg.category || 'N/A';
              const duration = pkg.duration_value ? `${pkg.duration_value} ${pkg.duration_type || 'hours'}` : 'N/A';
              const priceValue = pkg.price_per_person || pkg.pricePerPerson || pkg.price || pkg.min_price;
              const price = priceValue 
                ? `${parseFloat(priceValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pkg.currency || 'RWF'}`
                : 'Price not set';
              
              return (
                <div key={packageId} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{packageName}</h3>
                      {pkg.short_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pkg.short_description}</p>
                      )}
                    </div>
                    {(pkg.status && pkg.status !== 'draft') && (
                      <div className="ml-2 flex-shrink-0">
                        {getStatusBadge(pkg.status)}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 text-gray-900 font-medium">{category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 text-gray-900 font-medium">{duration}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-2 text-[#3CAF54] font-semibold">{price}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/tours/dashboard/packages/${packageId}`)}
                      className="p-2 text-gray-600 hover:text-[#3CAF54] hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/tours/dashboard/packages/create/${packageId}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(packageId)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.map((pkg) => {
                  const packageId = pkg.id || pkg.package_id;
                  const packageName = pkg.title || pkg.name || 'Unnamed Package';
                  const category = pkg.category || 'N/A';
                  const duration = pkg.duration_value ? `${pkg.duration_value} ${pkg.duration_type || 'hours'}` : 'N/A';
                  const priceValue = pkg.price_per_person || pkg.pricePerPerson || pkg.price || pkg.min_price;
                  const price = priceValue 
                    ? `${parseFloat(priceValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pkg.currency || 'RWF'}`
                    : 'Price not set';
                  
                  return (
                    <tr key={packageId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{packageName}</div>
                        {pkg.short_description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {pkg.short_description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{duration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#3CAF54]">{price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(pkg.status && pkg.status !== 'draft') && getStatusBadge(pkg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/tours/dashboard/packages/${packageId}`)}
                            className="p-2 text-gray-600 hover:text-[#3CAF54] hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/tours/dashboard/packages/create/${packageId}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(packageId)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
        </div>
        </>
      )}
    </div>
  );
};

export default MyTourPackages;

