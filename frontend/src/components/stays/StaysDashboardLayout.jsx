import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Home,
  DollarSign,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Menu,
  LogOut,
  Bell,
  User,
  AlertCircle
} from 'lucide-react';
import { staysAuthService, getMyPropertyListings } from '../../services/staysService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';
import useTranslation from '../../hooks/useTranslation';
import LanguageSelector from '../common/LanguageSelector';

const StaysDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [isPropertyLive, setIsPropertyLive] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      if (!staysAuthService.isAuthenticated()) {
        navigate('/stays/login', { replace: true });
        return;
      }

      try {
        const currentUser = staysAuthService.getCurrentUser();
        setUser(currentUser);

        // Load user's properties
        const userProperties = await getMyPropertyListings();
        const propertiesArray = Array.isArray(userProperties) ? userProperties : [];
        setProperties(propertiesArray);
        
        if (propertiesArray.length > 0) {
          const latestProperty = propertiesArray[0];
          setCurrentProperty(latestProperty);
          
          const propertyIsLive = 
            latestProperty.is_live === 1 || 
            latestProperty.isLive === true || 
            latestProperty.is_live === true ||
            latestProperty.status === 'approved';
          setIsPropertyLive(propertyIsLive);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/stays/login', { replace: true });
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
    staysAuthService.logout();
    toast.success('Logged out successfully');
    navigate('/stays/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('stays.nav.dashboard'), path: '/stays/dashboard', category: 'Main' },
    { icon: Building2, label: t('stays.nav.myProperty'), path: '/stays/dashboard/my-property', category: 'Main' },
    { icon: ImageIcon, label: t('stays.nav.propertyImages'), path: '/stays/dashboard/property-images', category: 'Main' },
    { icon: Calendar, label: t('stays.nav.bookings'), path: '/stays/dashboard/bookings', category: 'Operations' },
    { icon: Home, label: t('stays.nav.roomAvailability'), path: '/stays/dashboard/room-availability', category: 'Operations' },
    { icon: DollarSign, label: t('stays.nav.finance'), path: '/stays/dashboard/finance', category: 'Financial' },
    { icon: FileText, label: t('stays.nav.reports'), path: '/stays/dashboard/reports', category: 'Analytics', disabled: !isPropertyLive },
    { icon: BookOpen, label: t('stays.nav.apiDocs'), path: '/stays/dashboard/api-docs', category: 'Support', disabled: !isPropertyLive },
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
                <span className="text-lg font-semibold whitespace-nowrap">Stays</span>
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
              const isDisabled = item.disabled;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                      isDisabled
                        ? 'text-gray-500 opacity-50 cursor-not-allowed'
                        : isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                  onClick={(e) => isDisabled && e.preventDefault()}
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
              localhost:8080/stays/dashboard
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
            {currentProperty && currentProperty.property_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
                <Home className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 hidden sm:block" style={{ color: '#3CAF54' }} />
                <span className="text-xs sm:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{currentProperty.property_name}</span>
              </div>
            ) : properties.length > 0 && properties[0].property_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
                <Home className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 hidden sm:block" style={{ color: '#3CAF54' }} />
                <span className="text-xs sm:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{properties[0].property_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
                <Home className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 hidden sm:block" style={{ color: '#3CAF54' }} />
                <span className="text-xs sm:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{t('stays.nav.myProperty')}</span>
              </div>
            )}
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
              <User className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </div>
        </header>

        {/* Property Status Banner - Show if not live */}
        {!isPropertyLive && currentProperty && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-3 md:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-yellow-700">
                  <strong>Property Under Review:</strong> Your property is currently being reviewed by our admin team. 
                  Once approved, it will go live and you'll have full dashboard access.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaysDashboardLayout;




