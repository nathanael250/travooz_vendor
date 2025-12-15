import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, UtensilsCrossed, Plane, Car,
  ArrowRight
} from 'lucide-react';
import logo from '../../assets/images/cdc_logo.jpg';

export default function ServiceSelection() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const services = [
    {
      id: 'stays',
      name: 'Rest & Stay',
      icon: Home,
      description: 'Manage your hotels, apartments, and accommodations',
      loginRoute: '/stays/login',
      registerRoute: '/stays/list-your-property',
      color: '#3CAF54',
      bgColor: '#dcfce7'
    },
    {
      id: 'restaurants',
      name: 'Eating Out',
      icon: UtensilsCrossed,
      description: 'Manage your restaurant and dining experiences',
      loginRoute: '/restaurant/login',
      registerRoute: '/restaurant/list-your-restaurant',
      color: '#3CAF54',
      bgColor: '#dcfce7'
    },
    {
      id: 'tours',
      name: 'Tour Package',
      icon: Plane,
      description: 'Manage your tour packages and travel experiences',
      loginRoute: '/tours/login',
      registerRoute: '/tours/list-your-tour',
      color: '#3CAF54',
      bgColor: '#dcfce7'
    },
    {
      id: 'cars',
      name: 'Car Rental',
      icon: Car,
      description: 'Manage your car rental services',
      loginRoute: '/car-rental/login',
      registerRoute: '/car-rental/list-your-car-rental',
      color: '#3CAF54',
      bgColor: '#dcfce7'
    }
  ];

  const handleServiceClick = (service) => {
    navigate(service.loginRoute);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto" style={{ backgroundColor: '#f0fdf4' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <img src={logo} alt="Travooz" className="h-8 sm:h-10 w-auto" />
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-[#3CAF54] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              Select Your Service Type
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
              Choose the service you want to manage or register for
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 px-2 sm:px-0">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white rounded-lg shadow-md sm:shadow-lg p-4 sm:p-5 md:p-6 border-2 border-gray-200 hover:border-[#3CAF54] transition-all duration-200 text-left group w-full hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div
                      className="p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: service.bgColor }}
                    >
                      <Icon
                        className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                        style={{ color: service.color }}
                      />
                    </div>
                    <ArrowRight
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#3CAF54] transition-colors flex-shrink-0 mt-1"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 break-words group-hover:text-[#3CAF54] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                    {service.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 text-center px-2">
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Don't have an account yet?
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-[#3CAF54] hover:text-[#2d8f3f] font-semibold transition-colors text-sm sm:text-base"
            >
              Go to registration page →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 sm:py-5 md:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            © 2025 Travooz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

