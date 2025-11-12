import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Info, ExternalLink, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { staysSetupService } from '../../services/staysService';

export default function TaxesStep() {
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

  // Load saved tax data from localStorage
  const [formData, setFormData] = useState({
    legalName: '',
    vatRegistered: '',
    vatId: ''
  });

  useEffect(() => {
    const savedTaxData = JSON.parse(localStorage.getItem('stays_tax_data') || '{}');
    setFormData({
      legalName: savedTaxData.legalName || '',
      vatRegistered: savedTaxData.vatRegistered || '',
      vatId: savedTaxData.vatId || ''
    });
  }, []);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    localStorage.setItem('stays_tax_data', JSON.stringify(updated));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleNext = async () => {
    // Validate required fields
    if (!formData.legalName.trim()) {
      setSubmitError('Please enter the legal name of your property');
      return;
    }

    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    if (!propertyId || propertyId === 0) {
      setSubmitError('Property ID is missing. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Transform formData to match backend API expectations
      const taxData = {
        legalName: formData.legalName,
        vatRegistered: formData.vatRegistered || 'no',
        vatId: formData.vatId || null
      };

      // Save tax details via API
      await staysSetupService.saveTaxDetails(propertyId, taxData);

      // Store in localStorage as backup
      localStorage.setItem('stays_tax_data', JSON.stringify(formData));
      localStorage.setItem('stays_taxes_complete', 'true');

      // Navigate to next step (Step 10 - Connectivity Settings - Final Step)
      navigate('/stays/setup/connectivity', {
        state: {
          ...location.state,
          currentStep: 10
        }
      });
    } catch (err) {
      console.error('Error saving tax details:', err);
      setSubmitError(err.message || 'Failed to save tax details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/stays/setup/images', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {/* Steps 1-9 - Completed */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                      <span>✓</span>
                    </div>
                    <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                  </React.Fragment>
                ))}
                
                {/* Step 10 - Not completed */}
                <div className="w-8 h-8 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300">
                  10
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 9 of 10</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Taxes</h1>
            </div>

            {/* Legal Name Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Legal name of your property</h2>
              <p className="text-sm text-gray-600 mb-4">
                The legal name associated with your property that you use for tax purposes or government registration. 
                This could be the name of a company or an individual.
              </p>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                placeholder="Legal name of your property"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] text-base"
                required
              />
            </div>

            {/* VAT/GST Registration Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Is this property registered for VAT/GST?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Let us know if you collect and pay value-added tax (VAT) or goods and services tax (GST) for your property's services.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="vatRegistered"
                    value="yes"
                    checked={formData.vatRegistered === 'yes'}
                    onChange={(e) => handleChange('vatRegistered', e.target.value)}
                    className="w-5 h-5 text-[#3CAF54] focus:ring-[#3CAF54]"
                  />
                  <span className="text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="vatRegistered"
                    value="no"
                    checked={formData.vatRegistered === 'no'}
                    onChange={(e) => handleChange('vatRegistered', e.target.value)}
                    className="w-5 h-5 text-[#3CAF54] focus:ring-[#3CAF54]"
                  />
                  <span className="text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* VAT/GST ID Section */}
            {formData.vatRegistered === 'yes' && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">VAT/GST ID</h2>
                <p className="text-sm text-gray-600 mb-4">
                  We display this number on your invoices to identify your business for tax purposes. 
                  Please select the appropriate number according to the rules of your business or region.
                </p>
                <input
                  type="text"
                  value={formData.vatId}
                  onChange={(e) => handleChange('vatId', e.target.value)}
                  placeholder="VAT/GST ID"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] text-base mb-2"
                />
                <button
                  type="button"
                  className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium flex items-center gap-1"
                  onClick={() => {
                    // Show examples modal or information
                    alert('VAT/GST ID Examples:\n\n• EU: DE123456789\n• UK: GB123456789\n• Australia: 12 345 678 901\n• Canada: RT123456789');
                  }}
                >
                  <span>Some examples</span>
                  <Info className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ borderColor: '#d1d5db' }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
              >
                <span>{isSubmitting ? 'Saving...' : 'Next'}</span>
                {!isSubmitting && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

