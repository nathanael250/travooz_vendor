import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Calendar, Car, Info, ArrowRight, FileText, MapPin, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import useTranslation from '../../../hooks/useTranslation';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    totalBookings: 0,
    activeCars: 0,
  });

  const [loading, setLoading] = useState(true);
  const [hasCars, setHasCars] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get business ID from localStorage
      const businessId = localStorage.getItem('car_rental_business_id');
      
      if (!businessId) {
        setLoading(false);
        return;
      }

      // TODO: Fetch actual data from API
      // For now, using mock data
      setStats({
        totalRevenue: 0,
        todayBookings: 0,
        totalBookings: 0,
        activeCars: 0,
      });

      setHasCars(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('dashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('car.dashboard.welcome')}
            </h1>
            <p className="text-gray-600">
              {t('car.dashboard.welcomeDesc')}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Car className="h-12 w-12" style={{ color: '#3CAF54' }} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6" style={{ color: '#3CAF54' }} />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('car.dashboard.totalRevenue')}</h3>
          <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{t('car.dashboard.allTime')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('car.dashboard.todayBookings')}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
          <p className="text-xs text-gray-500 mt-1">{t('car.dashboard.newBookingsToday')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('car.dashboard.totalBookings')}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
          <p className="text-xs text-gray-500 mt-1">{t('car.dashboard.allBookings')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Car className="h-6 w-6 text-orange-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('car.dashboard.activeCars')}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activeCars}</p>
          <p className="text-xs text-gray-500 mt-1">{t('car.dashboard.availableForRent')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/car-rental/dashboard/cars')}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Car className="h-6 w-6" style={{ color: '#3CAF54' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{t('car.dashboard.manageCars')}</h3>
              <p className="text-sm text-gray-600">{t('car.dashboard.manageCarsDesc')}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/car-rental/dashboard/bookings')}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{t('car.dashboard.viewBookings')}</h3>
              <p className="text-sm text-gray-600">{t('car.dashboard.viewBookingsDesc')}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/car-rental/dashboard/pricing')}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Set Pricing</h3>
              <p className="text-sm text-gray-600">Configure rates and pricing for your cars</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      {!hasCars && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
              <Info className="h-6 w-6" style={{ color: '#3CAF54' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Get Started with Your Car Rental Business</h3>
              <p className="text-sm text-gray-700 mb-4">
                Start by adding your first car to your fleet. You can manage availability, set pricing, and start accepting bookings.
              </p>
              <button
                onClick={() => navigate('/car-rental/dashboard/cars')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: '#3CAF54' }}
              >
                Add Your First Car
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-lg bg-green-100">
              <Car className="h-5 w-5" style={{ color: '#3CAF54' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">No recent activity</p>
              <p className="text-xs text-gray-500">Your recent bookings and updates will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

