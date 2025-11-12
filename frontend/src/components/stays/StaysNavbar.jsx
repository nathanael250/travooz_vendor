import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/cdc_logo.jpg';

export default function StaysNavbar() {
  return (
    <nav className="bg-white shadow-sm border-b" style={{ borderColor: '#dcfce7' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Travooz Logo" 
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

