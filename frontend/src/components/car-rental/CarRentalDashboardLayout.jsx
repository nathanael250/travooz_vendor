import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  DollarSign,
  BookOpen,
  BarChart3,
  Star,
  Settings,
  Shield,
  FileText,
  HelpCircle,
  Menu,
  LogOut,
  Bell,
  User as UserIcon,
  MapPin,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';
import LanguageSelector from '../common/LanguageSelector';

const CarRentalDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!userData || !token) {
        navigate('/car-rental/login', { replace: true });
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/car-rental/login', { replace: true });
      }
    };

    checkAuth();

    // Handle responsive sidebar
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

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('car_rental_business_id');
    localStorage.removeItem('car_rental_setup_data');
    toast.success('Logged out successfully');
    navigate('/car-rental/list-your-car-rental');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('car.nav.dashboard'), path: '/car-rental/dashboard', category: 'Main' },
    { icon: Car, label: t('car.nav.cars'), path: '/car-rental/dashboard/cars', category: 'Main' },
    { icon: UserIcon, label: t('car.nav.drivers'), path: '/car-rental/dashboard/drivers', category: 'Main' },
    { icon: Calendar, label: t('car.nav.availability'), path: '/car-rental/dashboard/availability', category: 'Main' },
    { icon: DollarSign, label: t('car.nav.pricing'), path: '/car-rental/dashboard/pricing', category: 'Main' },
    { icon: BookOpen, label: t('car.nav.bookings'), path: '/car-rental/dashboard/bookings', category: 'Operations' },
    { icon: MapPin, label: t('car.nav.locations'), path: '/car-rental/dashboard/locations', category: 'Operations' },
    { icon: BarChart3, label: t('car.nav.analytics'), path: '/car-rental/dashboard/analytics', category: 'Analytics' },
    { icon: Star, label: t('car.nav.reviews'), path: '/car-rental/dashboard/reviews', category: 'Analytics' },
    { icon: FileText, label: t('car.nav.finance'), path: '/car-rental/dashboard/finance', category: 'Financial' },
    { icon: CreditCard, label: t('car.nav.payments'), path: '/car-rental/dashboard/payments', category: 'Financial' },
    { icon: Settings, label: t('car.nav.settings'), path: '/car-rental/dashboard/settings', category: 'Settings' },
    { icon: Shield, label: t('car.nav.security'), path: '/car-rental/dashboard/security', category: 'Settings' },
    { icon: HelpCircle, label: t('car.nav.support'), path: '/car-rental/dashboard/support', category: 'Support' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white transition-all duration-300 z-50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 justify-center w-full">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Car className="h-5 w-5 text-white" />
              </div>
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
                <span className="text-lg font-semibold whitespace-nowrap">Car Rental</span>
              )}
            </div>
            {isMobile && sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-700 rounded flex-shrink-0"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto">
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="p-4 text-xs text-gray-400 uppercase tracking-wider">Menu</div>
          )}
          <nav className="px-2 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>{t('common.logout')}</span>}
          </button>
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && user && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              {user.email || 'Car Rental Vendor'}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-between gap-1 sm:gap-2 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => {
                if (!isMobile) {
                  setSidebarExpanded(!sidebarExpanded);
                  if (!sidebarOpen) setSidebarOpen(true);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              title={!isMobile ? (sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar') : 'Toggle sidebar'}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
              <Car className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 hidden sm:block" style={{ color: '#3CAF54' }} />
              <span className="text-[11px] sm:text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">{t('car.dashboard.title')}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3.5 w-3.5 sm:h-5 sm:w-5 flex items-center justify-center text-[8px] sm:text-xs">0</span>
            </div>
            <div className="flex-shrink-0">
            <LanguageSelector compact={true} />
            </div>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer flex-shrink-0">
              <UserIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-gray-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CarRentalDashboardLayout;

