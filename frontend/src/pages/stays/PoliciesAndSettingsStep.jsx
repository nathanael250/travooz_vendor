import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService, staysOnboardingProgressService } from '../../services/staysService';
import { handleStaysError } from '../../utils/staysErrorHandler';

export default function PoliciesAndSettingsStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  // Initialize progress tracking when user first lands on this step (first setup step)
  useEffect(() => {
    const initializeProgress = async () => {
      const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
      const userId = location.state?.userId;
      
      if (propertyId && userId) {
        try {
          // Check if progress exists
          const progressData = await staysOnboardingProgressService.getProgress();
          
          // If no progress exists, initialize it at the policies step
          if (!progressData || !progressData.progress) {
            await staysOnboardingProgressService.saveProgress('policies', String(propertyId), false);
          }
        } catch (error) {
          console.error('Error initializing progress tracking:', error);
          // Don't block the user if progress tracking fails
        }
      }
    };

    initializeProgress();
  }, [location.state]);

  const [formData, setFormData] = useState({
    // Languages spoken
    languages: {
      english: false,
      french: false,
      kinyarwanda: false
    },
    
    // Payment methods
    acceptCreditDebitCards: false,
    acceptTravoozCard: false,
    acceptMobileMoney: false,
    acceptAirtelMoney: false,
    
    // Deposits
    requireDeposits: 'no',
    
    // Cancellation policy
    cancellationWindow: '24_hour',
    cancellationFee: 'first_night_plus_tax',
    
    // Taxes and fees
    vatPercentage: 18.00,
    tourismTaxPercentage: 3.00,
    taxesIncludedInRate: true,
    requestTaxTeamAssistance: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load policies data from location.state, localStorage, or API when component mounts
  useEffect(() => {
    const loadPolicies = async () => {
      const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
      
      // First, try location.state (from navigation)
      const savedPolicies = location.state?.policies;
      
      if (savedPolicies) {
        console.log('[PoliciesAndSettingsStep] Loading policies from location.state:', savedPolicies);
        loadPoliciesIntoForm(savedPolicies);
        return;
      }
      
      // Second, try localStorage (same device/browser)
      const localStoragePolicies = localStorage.getItem('stays_policies');
      if (localStoragePolicies) {
        try {
          const parsed = JSON.parse(localStoragePolicies);
          console.log('[PoliciesAndSettingsStep] Loading policies from localStorage:', parsed);
          setFormData(parsed);
          return;
        } catch (e) {
          console.error('[PoliciesAndSettingsStep] Error parsing localStorage policies:', e);
        }
      }
      
      // Third, fetch from API (for different device/browser)
      if (propertyId && propertyId > 0) {
        try {
          console.log('[PoliciesAndSettingsStep] Fetching policies from API for propertyId:', propertyId);
          const apiPolicies = await staysSetupService.getPolicies(propertyId);
          if (apiPolicies) {
            console.log('[PoliciesAndSettingsStep] Loaded policies from API:', apiPolicies);
            loadPoliciesIntoForm(apiPolicies);
            // Also save to localStorage for future use
            localStorage.setItem('stays_policies', JSON.stringify(apiPolicies));
          }
        } catch (error) {
          console.error('[PoliciesAndSettingsStep] Error fetching policies from API:', error);
          // Don't show error to user, just use default form values
        }
      }
    };

    // Helper function to load policies into form
    const loadPoliciesIntoForm = (savedPolicies) => {
      // Handle languages - could be array of strings or object
      let languages = {
        english: false,
        french: false,
        kinyarwanda: false
      };
      
      if (savedPolicies.languages) {
        if (Array.isArray(savedPolicies.languages)) {
          // Convert array of language names to object
          savedPolicies.languages.forEach(lang => {
            const langLower = lang.toLowerCase();
            if (langLower.includes('english')) languages.english = true;
            if (langLower.includes('french')) languages.french = true;
            if (langLower.includes('kinyarwanda')) languages.kinyarwanda = true;
          });
        } else if (typeof savedPolicies.languages === 'object') {
          languages = savedPolicies.languages;
        }
      }
      
      // Map other fields, handling both database and form formats
      const mappedData = {
        languages: languages,
        acceptCreditDebitCards: savedPolicies.acceptCreditDebitCards !== undefined 
          ? savedPolicies.acceptCreditDebitCards 
          : (savedPolicies.accept_credit_debit_cards === 1 || savedPolicies.accept_credit_debit_cards === true),
        acceptTravoozCard: savedPolicies.acceptTravoozCard !== undefined 
          ? savedPolicies.acceptTravoozCard 
          : (savedPolicies.accept_travooz_card === 1 || savedPolicies.accept_travooz_card === true),
        acceptMobileMoney: savedPolicies.acceptMobileMoney !== undefined 
          ? savedPolicies.acceptMobileMoney 
          : (savedPolicies.accept_mobile_money === 1 || savedPolicies.accept_mobile_money === true),
        acceptAirtelMoney: savedPolicies.acceptAirtelMoney !== undefined 
          ? savedPolicies.acceptAirtelMoney 
          : (savedPolicies.accept_airtel_money === 1 || savedPolicies.accept_airtel_money === true),
        requireDeposits: savedPolicies.requireDeposits || savedPolicies.require_deposits || 'no',
        cancellationWindow: savedPolicies.cancellationWindow || savedPolicies.cancellation_window || '24_hour',
        cancellationFee: savedPolicies.cancellationFee || savedPolicies.cancellation_fee || 'first_night_plus_tax',
        vatPercentage: savedPolicies.vatPercentage !== undefined ? savedPolicies.vatPercentage : (savedPolicies.vat_percentage || 18.00),
        tourismTaxPercentage: savedPolicies.tourismTaxPercentage !== undefined ? savedPolicies.tourismTaxPercentage : (savedPolicies.tourism_tax_percentage || 3.00),
        taxesIncludedInRate: savedPolicies.taxesIncludedInRate !== undefined ? savedPolicies.taxesIncludedInRate : (savedPolicies.taxes_included_in_rate !== 0 && savedPolicies.taxes_included_in_rate !== false),
        requestTaxTeamAssistance: savedPolicies.requestTaxTeamAssistance !== undefined 
          ? savedPolicies.requestTaxTeamAssistance 
          : (savedPolicies.request_tax_team_assistance === 1 || savedPolicies.request_tax_team_assistance === true)
      };
      
      setFormData(mappedData);
    };

    loadPolicies();
  }, [location.state?.policies, location.state?.propertyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('languages.')) {
      const language = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        languages: {
          ...prev.languages,
          [language]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    console.log('[PoliciesAndSettingsStep] propertyId:', propertyId, 'from state:', location.state?.propertyId, 'from localStorage:', localStorage.getItem('stays_property_id'));
    
    if (!propertyId || propertyId === 0) {
      console.error('[PoliciesAndSettingsStep] No valid propertyId found!');
      setSubmitError('Property ID is missing. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Transform formData to match backend API expectations
      const selectedLanguages = Object.keys(formData.languages)
        .filter(key => formData.languages[key])
        .map(key => {
          const langMap = {
            english: 'English',
            french: 'French',
            kinyarwanda: 'Kinyarwanda'
          };
          return langMap[key];
        });

      const policiesData = {
        languages: selectedLanguages,
        acceptCreditDebitCards: formData.acceptCreditDebitCards,
        acceptTravoozCard: formData.acceptTravoozCard,
        acceptMobileMoney: formData.acceptMobileMoney,
        acceptAirtelMoney: formData.acceptAirtelMoney,
        requireDeposits: formData.requireDeposits,
        cancellationWindow: formData.cancellationWindow,
        cancellationFee: formData.cancellationFee,
        vatPercentage: formData.vatPercentage,
        tourismTaxPercentage: formData.tourismTaxPercentage,
        taxesIncludedInRate: formData.taxesIncludedInRate,
        requestTaxTeamAssistance: formData.requestTaxTeamAssistance
      };

      // Save policies via API
      console.log('[PoliciesAndSettingsStep] Saving policies with propertyId:', propertyId);
      const result = await staysSetupService.savePolicies(propertyId, policiesData);
      console.log('[PoliciesAndSettingsStep] Policies saved successfully:', result);

      // Store in localStorage as backup
      localStorage.setItem('stays_policies', JSON.stringify(formData));

      // Navigate to next step (Step 4 - Property Amenities)
      navigate('/stays/setup/amenities', {
        state: {
          ...location.state,
          policies: formData
        }
      });
    } catch (err) {
      console.error('Error saving policies:', err);
      
      // Handle not found errors - clear localStorage and redirect to login
      if (handleStaysError(err, navigate)) {
        return; // Error was handled, don't show error message
      }
      
      setSubmitError(err.message || 'Failed to save policies. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Go back to email verification or step 3
    if (location.state?.fromEmailVerification) {
      navigate('/stays/list-your-property/verify-email', {
        state: location.state
      });
    } else {
      navigate('/stays/list-your-property/step-3', {
        state: location.state
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={2} totalSteps={10} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Policies and settings</h1>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
              {/* Languages Spoken */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Which languages are spoken at your property?
                </h2>
                <div className="space-y-3">
                  {[
                    { key: 'english', label: 'English' },
                    { key: 'french', label: 'French' },
                    { key: 'kinyarwanda', label: 'Kinyarwanda' }
                  ].map((lang) => (
                    <label key={lang.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name={`languages.${lang.key}`}
                        checked={formData.languages[lang.key]}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                      <span className="text-sm font-medium text-gray-700">{lang.label}</span>
                    </label>
                        ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Which payment methods do you accept at your property?
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="acceptCreditDebitCards"
                      checked={formData.acceptCreditDebitCards}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm font-medium text-gray-700">Credit / Debit Cards</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                      name="acceptTravoozCard"
                      checked={formData.acceptTravoozCard}
                              onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                            />
                    <span className="text-sm font-medium text-gray-700">Travooz Convenience Card</span>
                          </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                      name="acceptMobileMoney"
                      checked={formData.acceptMobileMoney}
                          onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                    <span className="text-sm font-medium text-gray-700">Mobile Money</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                      name="acceptAirtelMoney"
                      checked={formData.acceptAirtelMoney}
                          onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                    <span className="text-sm font-medium text-gray-700">Airtel Money</span>
                      </label>
                </div>
              </div>

              {/* Deposits */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Do you require any deposits?
                </h2>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="requireDeposits"
                        value="yes"
                        checked={formData.requireDeposits === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="requireDeposits"
                        value="no"
                        checked={formData.requireDeposits === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">No</span>
                    </label>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Default cancellation policy
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  This will be your default policy. You can modify it later.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      A cancellation window is the amount of time before your local cancellation cutoff (18:00) on the day of check-in.
                    </p>
                    <div className="space-y-4">
                      {[
                        { value: '24_hour', label: '24-hour cancellation window', desc: 'Travelers who cancel 24 hours or more before 18:00 on the day of check-in are charged no fee.', defaultFee: 'first_night_plus_tax' },
                        { value: '48_hour', label: '48-hour cancellation window', desc: 'Travelers who cancel 48 hours or more before 18:00 on the day of check-in are charged no fee.', defaultFee: 'first_night_plus_tax' },
                        { value: '72_hour', label: '72-hour cancellation window', desc: 'Travelers who cancel 72 hours or more before 18:00 on the day of check-in are charged no fee.', defaultFee: 'first_night_plus_tax' }
                      ].map((option) => (
                        <div key={option.value} className="border-2 rounded-lg p-4" style={{ borderColor: formData.cancellationWindow === option.value ? '#3CAF54' : '#dcfce7' }}>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="cancellationWindow"
                              value={option.value}
                              checked={formData.cancellationWindow === option.value}
                              onChange={handleChange}
                              className="mt-1 w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                              <p className="text-sm text-gray-600 mb-2">{option.desc}</p>
                              {formData.cancellationWindow === option.value && (
                                <>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Travelers who cancel less than {option.value.replace('_hour', '')} before 18:00 on the day of check-in (including no-shows) are charged:
                                  </p>
                                  <select
                                    name="cancellationFee"
                                    value={formData.cancellationFee}
                                    onChange={handleChange}
                                    className="w-full md:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                                  >
                                    <option value="first_night_plus_tax">1st night + tax</option>
                                    <option value="first_night">1st night</option>
                                    <option value="full_amount">Full amount</option>
                                  </select>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxes and Fees */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Taxes and fees</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">18.00% VAT (Value Added Tax)</p>
                    <p className="text-sm font-medium text-gray-700 mb-4">3.00% Tourism Tax</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Will these taxes be included in your room rate?
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="taxesIncludedInRate"
                          value="true"
                          checked={formData.taxesIncludedInRate === true}
                          onChange={(e) => setFormData(prev => ({ ...prev, taxesIncludedInRate: true }))}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">
                          Yes, taxes are included in rate
                        </span>
                        
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="taxesIncludedInRate"
                          value="false"
                          checked={formData.taxesIncludedInRate === false}
                          onChange={(e) => setFormData(prev => ({ ...prev, taxesIncludedInRate: false }))}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">
                          No, add these taxes to the rate
                        </span>
                        
                      </label>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    If the standard taxes don't apply to your property, our tax team can contact you to set up your taxes before we publish your listing.
                  </p>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requestTaxTeamAssistance"
                      checked={formData.requestTaxTeamAssistance}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm text-gray-700">Request tax team assistance</span>
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {submitError}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: '#dcfce7' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isSubmitting ? '#2d8f42' : '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>{isSubmitting ? 'Saving...' : 'Next'}</span>
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}
