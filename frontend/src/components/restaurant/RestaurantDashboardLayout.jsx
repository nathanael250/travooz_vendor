import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Utensils,
  ShoppingCart,
  FileText,
  BookOpen,
  Menu,
  LogOut,
  Bell,
  User as UserIcon,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantSetupService } from '../../services/eatingOutService';

const RestaurantDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication and setup progress
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!userData || !token) {
        console.log('No user data or token found, redirecting to restaurant login');
        // Clear any stale data
        localStorage.removeItem('restaurant_id');
        localStorage.removeItem('restaurant_setup_progress');
        // Explicitly navigate to restaurant login, not stays login
        const targetPath = '/restaurant/login';
        console.log('Redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid by checking with backend
        try {
          const apiClient = (await import('../../services/apiClient')).default;
          const response = await apiClient.get('/eating-out/vendor/my');
          // If this succeeds, user is authenticated
        } catch (authError) {
          // Token invalid or expired
          console.log('Token validation failed, clearing session');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('restaurant_id');
          localStorage.removeItem('restaurant_setup_progress');
          navigate('/restaurant/login', { replace: true });
          return;
        }
        
        setUser(parsedUser);

        // Check for incomplete setup progress
        try {
          const progress = await restaurantSetupService.getSetupProgressByUser();
          if (progress && progress.restaurant_id) {
            // Check if setup is incomplete (not all steps complete)
            const allStepsComplete = 
              progress.step_1_3_complete &&
              progress.step_4_complete &&
              progress.step_5_complete &&
              progress.step_6_complete &&
              progress.step_7_complete &&
              progress.step_8_complete &&
              progress.step_9_complete &&
              progress.step_10_complete &&
              progress.step_11_complete;

            if (!allStepsComplete && location.pathname !== '/restaurant/setup/complete') {
              // Redirect to the appropriate step based on current_step
              const stepRoutes = {
                4: '/restaurant/setup/business-details',
                5: '/restaurant/setup/media',
                6: '/restaurant/setup/payments-pricing',
                7: '/restaurant/setup/capacity',
                8: '/restaurant/setup/tax-legal',
                9: '/restaurant/setup/menu',
                10: '/restaurant/setup/review',
                11: '/restaurant/setup/agreement'
              };

              const targetRoute = stepRoutes[progress.current_step] || '/restaurant/setup/business-details';
              
              // Store progress data in localStorage for restoration
              localStorage.setItem('restaurant_setup_progress', JSON.stringify(progress));
              localStorage.setItem('restaurant_id', progress.restaurant_id);

              // Only redirect if not already on a setup page
              if (!location.pathname.startsWith('/restaurant/setup/')) {
                toast.info('Continuing your restaurant setup...');
                navigate(targetRoute, { 
                  replace: true,
                  state: { 
                    progress,
                    restaurantId: progress.restaurant_id 
                  }
                });
              }
            }
          }
        } catch (progressError) {
          // If progress check fails, continue normally (might be a new user)
          console.log('No incomplete setup found or error checking progress:', progressError);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        console.log('Invalid user data, redirecting to restaurant login');
        // Explicitly navigate to restaurant login, not stays login
        const targetPath = '/restaurant/login';
        console.log('Redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
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
    toast.success('Logged out successfully');
    navigate('/restaurant/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard', category: 'Main' },
    // POS temporarily disabled - system is for online orders only
    // { icon: ShoppingCart, label: 'POS', path: '/restaurant/pos', category: 'Main' },
    { icon: Store, label: 'My Restaurant', path: '/restaurant/restaurants', category: 'Main' },
    { icon: ImageIcon, label: 'Restaurant Gallery', path: '/restaurant/gallery', category: 'Main' },
    { icon: Utensils, label: 'Menu Items', path: '/restaurant/menu-items', category: 'Operations' },
    { icon: ShoppingBag, label: 'Orders', path: '/restaurant/orders', category: 'Operations' },
    { icon: FileText, label: 'Reports', path: '/restaurant/reports', category: 'Analytics' },
    { icon: BookOpen, label: 'API Docs', path: '/restaurant/api-docs', category: 'Documentation' },
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
                <Utensils className="h-5 w-5 text-white" />
              </div>
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
                <span className="text-lg font-semibold whitespace-nowrap">Restaurant</span>
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
            {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Logout</span>}
          </button>
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && user && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              {user.email || 'Restaurant Vendor'}
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
              <Utensils className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 hidden sm:block" style={{ color: '#3CAF54' }} />
              <span className="text-[11px] sm:text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Restaurant Dashboard</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-3.5 w-3.5 sm:h-5 sm:w-5 flex items-center justify-center text-[8px] sm:text-xs">0</span>
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

export default RestaurantDashboardLayout;

