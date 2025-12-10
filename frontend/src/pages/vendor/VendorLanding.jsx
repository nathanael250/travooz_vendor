import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, UtensilsCrossed, Plane, Car,
  CheckCircle, Users, Award, TrendingUp, Shield,
  Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin,
  Building2, Settings, Grid3x3, Navigation2, Search, Menu, X, Mountain
} from 'lucide-react';
import logo from '../../assets/images/cdc_logo.jpg';
import tourImage from '../../assets/images/tour.png';
import carsImage from '../../assets/images/cars.png';
import eatingoutImage from '../../assets/images/eatingout.png';
import staysImage from '../../assets/images/stays.png';

// Typewriter Effect Component
function TypewriterText({ text, speed = 100, color = '#3CAF54' }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length) {
      // Hide cursor after typing is complete
      const timeout = setTimeout(() => {
        setShowCursor(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span style={{ color }}>
      {displayedText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
}

// Cycling Typewriter Component - alternates between words
function CyclingTypewriter({ words = ['premier', 'trusted'], speed = 80, color = '#3CAF54' }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    if (!isDeleting && currentIndex < currentWord.length) {
      // Typing
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + currentWord[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && currentIndex === currentWord.length) {
      // Finished typing, wait then start deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); // Wait 2 seconds before deleting
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex > 0) {
      // Deleting
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);
      }, speed / 2); // Delete faster
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex === 0) {
      // Finished deleting, move to next word
      setCurrentWordIndex(prev => (prev + 1) % words.length);
      setIsDeleting(false);
      setDisplayedText('');
    }
  }, [currentIndex, isDeleting, currentWordIndex, words, speed]);

  return (
    <span style={{ color }}>
      {displayedText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
}

export default function VendorLanding() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      name: 'Rest and stay',
      icon: Home,
      route: '/stays/list-your-property',
      image: staysImage
    },
    {
      id: 'tour-package',
      name: 'Tour packages',
      icon: Mountain,
      route: '/tours/list-your-tour',
      image: tourImage
    },
    {
      id: 'eating-out',
      name: 'Eating out',
      icon: UtensilsCrossed,
      route: '/restaurant/list-your-restaurant',
      image: eatingoutImage
    },
    {
      id: 'car',
      name: 'Car hire',
      icon: Car,
      route: '/car-rental/list-your-car-rental',
      image: carsImage
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Reach More Customers',
      description: 'Connect with thousands of travelers looking for accommodations, dining, tours, and transportation'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Safe and reliable booking system with secure payment processing for your business'
    },
    {
      icon: Award,
      title: 'Boost Revenue',
      description: 'Increase your bookings and grow your business with our marketing tools and analytics'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Dedicated support team available round-the-clock to help you manage your listings'
    }
  ];

  const handleCategoryClick = (route) => {
    navigate(route);
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Travooz Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto"
              />
            </div>

            {/* Navigation Links - Center (Desktop) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <button className="text-gray-700 hover:text-[#3CAF54] font-medium transition-colors">
                Home
              </button>
              <button className="text-gray-700 hover:text-[#3CAF54] font-medium transition-colors">
                About
              </button>
              <button className="text-gray-700 hover:text-[#3CAF54] font-medium transition-colors">
                Services
              </button>
              <button className="text-gray-700 hover:text-[#3CAF54] font-medium transition-colors">
                Contact
              </button>
            </div>

            {/* Right Side - Search and Get Started */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button className="p-2 text-gray-600 hover:text-[#3CAF54] transition-colors">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => navigate('/auth/service-selection')}
                className="hidden sm:block px-4 sm:px-6 py-2 rounded-lg text-white text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                style={{ backgroundColor: '#3CAF54' }}
              >
                Login
              </button>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#3CAF54] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#3CAF54] font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#3CAF54] font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#3CAF54] font-medium transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#3CAF54] font-medium transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  navigate('/auth/service-selection');
                  setMobileMenuOpen(false);
                }}
                className="block w-full mx-4 px-6 py-3 rounded-lg text-white text-base font-medium transition-all duration-300"
                style={{ backgroundColor: '#3CAF54' }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Redesigned Layout */}
      <section className="py-4 sm:py-6 md:py-12 lg:py-16 xl:py-20 w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 order-2 lg:order-1 text-center lg:text-left">
              {/* Main Headline */}
              <div className="animate-fade-in">
                <h1 className="mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", fontWeight: 700, letterSpacing: '-0.02em' }}>
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-black" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Your</span>
                  <br />
                  <span className="block mt-1 sm:mt-2 md:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                    <CyclingTypewriter words={['premier', 'trusted']} speed={80} color="#3CAF54" />
                  </span>
                  <span className="block mt-1 sm:mt-2 md:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-black" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                    travel marketplace
                  </span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 mt-2 sm:mt-3 md:mt-4 lg:mt-6 max-w-xl mx-auto lg:mx-0">
                  Join Rwanda's leading tourism marketplace. List your property, restaurant, tour packages, or car rental services and reach thousands of travelers.
                </p>
              </div>

              {/* Services Buttons - Horizontal Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 md:pt-4">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.route)}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 min-h-[60px] sm:min-h-[70px]"
                      style={{ backgroundColor: '#E8F5E9' }}
                    >
                      <div className="flex-shrink-0">
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" style={{ color: '#3CAF54' }} />
                      </div>
                      <span className="text-sm sm:text-base md:text-lg font-medium text-gray-900 text-left flex-1">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Image Collage (Diamond Shape) - Hidden on Mobile */}
            <div className="hidden lg:flex relative w-full h-[450px] xl:h-[500px] 2xl:h-[600px] items-center justify-center order-1 lg:order-2 mb-2 sm:mb-4 md:mb-6 lg:mb-0">
              <div 
                className="relative w-full h-full max-w-[450px] lg:max-h-[450px] xl:max-w-[500px] xl:max-h-[500px] 2xl:max-w-[500px] 2xl:max-h-[500px] transition-transform duration-500"
                style={{ transform: 'rotate(-18deg)' }}
              >
                {/* Top Left - Eating Out */}
                <div className="absolute top-2 lg:top-4 left-2 lg:left-4 w-36 h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 z-10">
                  <img 
                    src={eatingoutImage} 
                    alt="Eating Out" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Bottom Left - Stays */}
                <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 w-36 h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 z-10">
                  <img 
                    src={staysImage} 
                    alt="Rest and Stay" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Top Right - Cars */}
                <div className="absolute top-2 lg:top-4 right-2 lg:right-4 w-36 h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-110 hover:-rotate-3 transition-all duration-300 z-10">
                  <img 
                    src={carsImage} 
                    alt="Car Hire" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Bottom Right - Tours */}
                <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 w-36 h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-110 hover:-rotate-3 transition-all duration-300 z-10">
                  <img 
                    src={tourImage} 
                    alt="Tour Packages" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - All Sections in One View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

      {/* What Makes Us Best Choice Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 rounded-2xl sm:rounded-3xl mb-8 sm:mb-12">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Makes Us the Best Choice
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of vendors who trust us to grow their business. List your services and start reaching more customers today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 px-4 sm:px-0">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white sm:bg-gray-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#3CAF54] bg-opacity-10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" style={{ color: '#3CAF54' }} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm mx-4 sm:mx-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3" style={{ color: '#3CAF54' }}>
                10K+
              </div>
              <p className="text-base sm:text-lg text-gray-600">Active Vendors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3" style={{ color: '#3CAF54' }}>
                500K+
              </div>
              <p className="text-base sm:text-lg text-gray-600">Monthly Bookings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3" style={{ color: '#3CAF54' }}>
                98%
              </div>
              <p className="text-base sm:text-lg text-gray-600">Vendor Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Footer - Full Width */}
      <footer className="w-full bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <img 
                  src={logo} 
                  alt="Travooz Logo" 
                  className="h-7 sm:h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Rwanda's leading tourism marketplace for vendors. List your property, restaurant, tour packages, or car rental services and grow your business with us.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <button onClick={() => navigate('/auth/service-selection')} className="hover:text-white transition-colors text-left">
                    Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Categories</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <button onClick={() => handleCategoryClick('/stays/list-your-property')} className="hover:text-white transition-colors text-left">
                    Rest & Stay
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('/restaurant/list-your-restaurant')} className="hover:text-white transition-colors text-left">
                    Eating Out
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('/tours/list-your-tour')} className="hover:text-white transition-colors text-left">
                    Tour Package
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('/car-rental/list-your-car-rental')} className="hover:text-white transition-colors text-left">
                    Car Rental
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400 mb-4">
                <li className="flex items-center gap-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="break-all">info@travooz.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>+250 788 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Kigali, Rwanda</span>
                </li>
              </ul>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Travooz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

