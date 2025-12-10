import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Calendar,
  DollarSign,
  BookOpen,
  Users,
  Image,
  BarChart3,
  Star,
  Settings,
  Shield,
  FileText,
  HelpCircle,
  Menu,
  LogOut,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { tourPackageSetupService } from '../../services/tourPackageService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';
import useTranslation from '../../hooks/useTranslation';
import LanguageSelector from '../common/LanguageSelector';

const TourDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication and verification
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!userData || !token) {
        navigate('/tours/login', { replace: true });
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const tourBusinessId = localStorage.getItem('tour_business_id');
        if (tourBusinessId) {
          try {
            const status = await tourPackageSetupService.getSubmissionStatus(tourBusinessId);
            
            // Check if this is a "no submission found" response (database cleared)
            const apiMessage = status?.message || status?.data?.message || '';
            const dataStatus = status?.data?.status;
            
            if (apiMessage.includes('No submission found') || 
                apiMessage.includes('No submission') ||
                (dataStatus === null && apiMessage)) {
              console.log('🗑️ Database appears to be cleared. Clearing stale data and redirecting...');
              localStorage.removeItem('tour_business_id');
              localStorage.removeItem('tour_submission_status');
              navigate('/tours/list-your-tour', { replace: true });
              return;
            }
            
            const submissionStatus = status?.status || status?.data?.status || status?.data?.data?.status;
            const prevStatus = localStorage.getItem('tour_submission_status');
            
            if (submissionStatus === null || submissionStatus === undefined) {
              console.log('⚠️ No submission data found. Clearing stale data and redirecting...');
              localStorage.removeItem('tour_business_id');
              localStorage.removeItem('tour_submission_status');
              navigate('/tours/list-your-tour', { replace: true });
              return;
            }
            
            if (submissionStatus !== 'approved') {
              if (prevStatus === 'approved') {
                toast.error('Your submission was moved back to review. Please fix the requested items.');
              }
              localStorage.setItem('tour_submission_status', submissionStatus);
              navigate('/tours/setup/complete', { replace: true });
              return;
            }

            localStorage.setItem('tour_submission_status', 'approved');
          } catch (error) {
            // If 404 or "not found", database was cleared
            if (error.response?.status === 404 || 
                error.message?.includes('not found') || 
                error.message?.includes('No submission')) {
              console.log('🗑️ Submission not found. Clearing stale data and redirecting...');
              localStorage.removeItem('tour_business_id');
              localStorage.removeItem('tour_submission_status');
              navigate('/tours/list-your-tour', { replace: true });
              return;
            }
            
            console.error('Error checking submission status:', error);
            navigate('/tours/setup/complete', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/tours/login', { replace: true });
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
    localStorage.removeItem('tour_business_id');
    localStorage.removeItem('tour_setup_data');
    localStorage.removeItem('tour_setup_complete');
    localStorage.removeItem('tour_submission_status');
    toast.success('Logged out successfully');
    navigate('/tours/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('tours.nav.dashboard'), path: '/tours/dashboard', category: 'Main' },
    { icon: Package, label: t('tours.nav.packages'), path: '/tours/dashboard/packages', category: 'Main' },
    { icon: Calendar, label: t('tours.nav.schedules'), path: '/tours/dashboard/schedules', category: 'Main' },
    { icon: DollarSign, label: t('tours.nav.pricing'), path: '/tours/dashboard/pricing', category: 'Main' },
    { icon: BookOpen, label: t('tours.nav.bookings'), path: '/tours/dashboard/bookings', category: 'Operations' },
    { icon: Users, label: t('tours.nav.participants'), path: '/tours/dashboard/participants', category: 'Operations' },
    { icon: Image, label: t('tours.nav.media'), path: '/tours/dashboard/media', category: 'Content' },
    { icon: BarChart3, label: t('tours.nav.reports'), path: '/tours/dashboard/analytics', category: 'Analytics' },
    { icon: Star, label: t('tours.nav.reviews'), path: '/tours/dashboard/reviews', category: 'Analytics' },
    { icon: FileText, label: t('tours.nav.finance'), path: '/tours/dashboard/finance', category: 'Financial' },
    { icon: Settings, label: t('tours.nav.settings'), path: '/tours/dashboard/settings', category: 'Settings' },
    { icon: Shield, label: t('tours.nav.security'), path: '/tours/dashboard/security', category: 'Settings' },
    { icon: HelpCircle, label: t('tours.nav.support'), path: '/tours/dashboard/support', category: 'Support' },
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
              <img src={logo} alt="Travooz Logo" className="h-8 w-auto flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
                <span className="text-lg font-semibold whitespace-nowrap">Tour Agent</span>
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
              const isActive = location.pathname === item.path;
              
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
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              localhost:8080/tours/dashboard
            </div>
          )}
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
        <header className="bg-gray-800 text-white px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-between gap-1 sm:gap-2 min-w-0 overflow-hidden">
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
              className="p-1 sm:p-2 hover:bg-gray-700 rounded-lg flex-shrink-0"
              title={!isMobile ? (sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar') : 'Toggle sidebar'}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
              <Package className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 hidden sm:block" style={{ color: '#3CAF54' }} />
              <span className="text-[11px] sm:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">{t('tours.dashboard.title')}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3.5 w-3.5 sm:h-5 sm:w-5 flex items-center justify-center text-[8px] sm:text-xs">3</span>
            </div>
            <div className="flex-shrink-0">
              <LanguageSelector compact={true} isDark={true} />
            </div>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer flex-shrink-0">
              <UserIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TourDashboardLayout;

