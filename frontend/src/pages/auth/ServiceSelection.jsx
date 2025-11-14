import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, UtensilsCrossed, Plane, Car, Activity,
  ArrowRight
} from 'lucide-react';
import logo from '../../assets/images/travooz_logo.png';

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
      color: '#3B82F6'
    },
    {
      id: 'restaurants',
      name: 'Eating Out',
      icon: UtensilsCrossed,
      description: 'Manage your restaurant and dining experiences',
      loginRoute: '/restaurant/login',
      registerRoute: '/restaurant/list-your-restaurant',
      color: '#F97316'
    },
    {
      id: 'tours',
      name: 'Tour Package',
      icon: Plane,
      description: 'Manage your tour packages and travel experiences',
      loginRoute: '/tours/login',
      registerRoute: '/tours/list-your-tour',
      color: '#22C55E'
    },
    {
      id: 'cars',
      name: 'Car Rental',
      icon: Car,
      description: 'Manage your car rental services',
      loginRoute: '/car-rental/login',
      registerRoute: '/car-rental/list-your-car-rental',
      color: '#A855F7'
    },
    {
      id: 'activities',
      name: 'Activities',
      icon: Activity,
      description: 'Manage your activities and experiences',
      loginRoute: '/activities/login',
      registerRoute: '/activities/list-your-activity',
      color: '#EF4444'
    }
  ];

  const handleServiceClick = (service) => {
    navigate(service.loginRoute);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#3CAF54' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logo} alt="Travooz" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-white hover:text-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full py-12 px-4">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Select Your Service Type
            </h1>
            <p className="text-lg text-gray-600">
              Choose the service you want to manage or register for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white rounded-lg shadow-lg p-6 border-2 border-transparent hover:border-[#3CAF54] transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      <Icon
                        className="h-8 w-8"
                        style={{ color: service.color }}
                      />
                    </div>
                    <ArrowRight
                      className="h-5 w-5 text-gray-400 group-hover:text-[#3CAF54] transition-colors"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {service.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Don't have an account yet?
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-[#3CAF54] hover:text-[#2d8f3f] font-semibold transition-colors"
            >
              Go to registration page →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            © 2025 Travooz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

