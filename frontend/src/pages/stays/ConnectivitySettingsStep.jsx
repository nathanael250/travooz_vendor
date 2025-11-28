import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function ConnectivitySettingsStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  // Load saved connectivity data from localStorage
  const [addConnectivityProvider, setAddConnectivityProvider] = useState('');

  useEffect(() => {
    const savedConnectivityData = JSON.parse(localStorage.getItem('stays_connectivity_data') || '{}');
    setAddConnectivityProvider(savedConnectivityData.addConnectivityProvider || '');
  }, []);

  const handleChange = (value) => {
    setAddConnectivityProvider(value);
    localStorage.setItem('stays_connectivity_data', JSON.stringify({ addConnectivityProvider: value }));
  };

  const handleNext = () => {
    // Validate selection
    if (!addConnectivityProvider) {
      alert('Please select whether you want to add a connectivity provider');
      return;
    }

    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');

    // Mark connectivity step as complete
    localStorage.setItem('stays_connectivity_complete', 'true');
    localStorage.setItem('stays_setup_complete', 'true'); // Mark entire setup as complete

    // Navigate to review page
    navigate('/stays/setup/review', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
        setupComplete: true
      }
    });
  };

  const handleBack = () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    navigate('/stays/setup/taxes', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={10} totalSteps={10} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connectivity settings</h1>
              <p className="text-gray-600">
                Connectivity providers—such as channel managers or property management systems—keep your rates, availability, and reservations in sync with our platform.
              </p>
            </div>

            {/* Connectivity Provider Question */}
            <div className="mb-8">
              <div className="border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Do you want to add a connectivity provider?</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add a connectivity provider, like a channel manager or property management system, to sync your rates, reservations, and availability with our system. You can also add this after you're live.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="addConnectivityProvider"
                      value="yes"
                      checked={addConnectivityProvider === 'yes'}
                      onChange={(e) => handleChange(e.target.value)}
                      className="w-5 h-5 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="addConnectivityProvider"
                      value="no"
                      checked={addConnectivityProvider === 'no'}
                      onChange={(e) => handleChange(e.target.value)}
                      className="w-5 h-5 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#d1d5db' }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!addConnectivityProvider}
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#2d8f42';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#3CAF54';
                  }
                }}
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

