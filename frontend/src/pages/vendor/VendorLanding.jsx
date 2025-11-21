import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, UtensilsCrossed, Plane, Car,
  CheckCircle, Users, Award, TrendingUp, Shield,
  Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin,
  Building2, Settings, Grid3x3
} from 'lucide-react';
import logo from '../../assets/images/travooz_logo.png';

export default function VendorLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    // Enable scrolling for this landing page
    document.body.classList.add('auth-page');
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('auth-page');
    };
  }, []);

  const categories = [
    {
      id: 'rest-stay',
      name: 'Rest & Stay',
      icon: Home,
      description: 'List your hotels, apartments, and accommodations',
      route: '/stays/list-your-property',
      color: '#3B82F6' // blue-500
    },
    {
      id: 'eating-out',
      name: 'Eating Out',
      icon: UtensilsCrossed,
      description: 'Showcase your restaurant and dining experiences',
      route: '/restaurant/list-your-restaurant',
      color: '#F97316' // orange-500
    },
    {
      id: 'tour-package',
      name: 'Tour Package',
      icon: Plane,
      description: 'Offer amazing tour packages and travel experiences',
      route: '/tours/list-your-tour',
      color: '#22C55E' // green-500
    },
    {
      id: 'car',
      name: 'Car',
      icon: Car,
      description: 'List your car rental or transportation services',
      route: '/car-rental/list-your-car-rental',
      color: '#A855F7' // purple-500
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Reach More Customers',
      description: 'Connect with thousands of travelers'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Safe and reliable booking system'
    },
    {
      icon: Award,
      title: 'Boost Revenue',
      description: 'Increase bookings with marketing tools'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Dedicated support for your listings'
    }
  ];

  const handleCategoryClick = (route) => {
    navigate(route);
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#3CAF54' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Travooz Logo" 
                className="h-10 w-auto"
              />
            </div>

            {/* Navigation Links */}
            <div className="md:flex items-center gap-6">
              <button
                onClick={() => navigate('/auth/service-selection')}
                className="text-white hover:text-gray-200 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Welcome Message & Categories - Full Width */}
      <section className="py-12 md:py-20 w-full mb-8" style={{ backgroundColor: '#3CAF54' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Message */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                What do you need to list?
              </h1>
              <p className="text-xl md:text-2xl text-white mb-4">
                Join Rwanda's leading tourism marketplace
              </p>
              <p className="text-lg text-white opacity-90 mb-8">
                List your property, restaurant, tour packages, or cars and reach thousands of travelers.
                Start growing your business today!
              </p>
            </div>

            {/* Right Side - Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.route)}
                    className="group p-6 rounded-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-white"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <IconComponent 
                        className="h-8 w-8 text-white transition-transform group-hover:scale-110" 
                      />
                      <h3 className="text-lg font-semibold text-white text-left">
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-sm text-white text-left opacity-90">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - All Sections in One View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* What Makes Us Best Choice Section */}
      <section className="py-16 md:py-24 bg-white mb-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Makes Us the Best Choice
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of vendors who trust Travooz to grow their business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-[#3CAF54] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                  <IconComponent className="h-8 w-8" style={{ color: '#3CAF54' }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#3CAF54' }}>
                10K+
              </div>
              <p className="text-gray-600">Active Vendors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#3CAF54' }}>
                500K+
              </div>
              <p className="text-gray-600">Monthly Bookings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#3CAF54' }}>
                98%
              </div>
              <p className="text-gray-600">Vendor Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Footer - Full Width */}
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src={logo} 
                  alt="Travooz Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Rwanda's leading tourism marketplace.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => navigate('/auth/service-selection')} className="hover:text-white transition-colors">
                    Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => handleCategoryClick('/stays/list-your-property')} className="hover:text-white transition-colors">
                    Rest & Stay
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('/restaurant/list-your-restaurant')} className="hover:text-white transition-colors">
                    Eating Out
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('/tours/list-your-tour')} className="hover:text-white transition-colors">
                    Tour Package
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('/car-rental/list-your-car-rental')} className="hover:text-white transition-colors">
                    Car Rental
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@travooz.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+250 788 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Kigali, Rwanda</span>
                </li>
              </ul>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Travooz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

