import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Info, TrendingUp } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function PromoteListingStep() {
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

  const handleNext = () => {
    // Mark promotions step as complete
    localStorage.setItem('stays_promotions_complete', 'true');

    // Navigate to next step (Step 8 - Image Management)
    navigate('/stays/setup/images', {
      state: {
        ...location.state,
        currentStep: 8
      }
    });
  };

  const handleBack = () => {
    navigate('/stays/setup/rooms', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={7} totalSteps={10} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Next, promote your new listing</h1>
            </div>

            {/* Information Banner */}
            <div className="mb-8 p-4 bg-blue-700 rounded-lg flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="h-4 w-4 text-blue-700" />
              </div>
              <p className="text-white text-sm">
                We couldn't load promotions here. You can add promotions after your listing is live.
              </p>
            </div>

            {/* Promotions Card */}
            <div className="border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f3f4f6' }}>
                  <TrendingUp className="h-6 w-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Promotions help capture guests' attention with:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-[#3CAF54] mt-1">•</span>
                      <span className="text-gray-700">A visibility boost in search results</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3CAF54] mt-1">•</span>
                      <span className="text-gray-700">Special badging to highlight your listing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3CAF54] mt-1">•</span>
                      <span className="text-gray-700">Enhanced marketing</span>
                    </li>
                  </ul>
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
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
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

