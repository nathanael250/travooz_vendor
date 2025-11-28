import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, X, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService } from '../../services/staysService';

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

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  const [formData, setFormData] = useState({
    // Languages spoken
    languages: [],
    languageSearch: '',
    
    // Payment methods
    acceptCreditDebitCards: true,
    cardTypes: {
      visa: false,
      mastercard: false,
      unionPay: false,
      travoozCard: false
    },
    installmentsAtFrontDesk: false,
    acceptOtherPayment: false,
    otherPaymentTypes: {
      cash: false,
      momo: false,
      airtelMoney: false
    },
    
    // Deposits
    requireDeposits: 'yes',
    depositTypes: {
      generalDeposit: false,
      breakageCleaningDeposit: false,
      springBreakDeposit: false,
      damageDepositBeforeArrival: false,
      alternateDepositPayment: false
    },
    incidentalsPaymentForm: 'cash_only',
    
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

  // Common languages list
  const commonLanguages = [
    'English', 'French', 'Kinyarwanda', 'Swahili', 'German', 'Spanish', 
    'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Arabic', 'Hindi',
    'Dutch', 'Russian', 'Korean', 'Turkish', 'Polish', 'Greek'
  ];

  const filteredLanguages = commonLanguages.filter(lang =>
    lang.toLowerCase().includes(formData.languageSearch.toLowerCase()) &&
    !formData.languages.includes(lang)
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('cardTypes.')) {
      const cardType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cardTypes: {
          ...prev.cardTypes,
          [cardType]: checked
        }
      }));
    } else if (name.startsWith('otherPaymentTypes.')) {
      const paymentType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        otherPaymentTypes: {
          ...prev.otherPaymentTypes,
          [paymentType]: checked
        }
      }));
    } else if (name.startsWith('depositTypes.')) {
      const depositType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        depositTypes: {
          ...prev.depositTypes,
          [depositType]: checked
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

  const handleRemoveLanguage = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const handleSelectLanguageFromList = (language) => {
    if (!formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language],
        languageSearch: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.acceptCreditDebitCards) {
      const hasCardType = Object.values(formData.cardTypes).some(val => val === true);
      if (!hasCardType) {
        newErrors.cardTypes = 'Please select at least one card type';
      }
    }

    if (formData.acceptOtherPayment) {
      const hasOtherPaymentType = Object.values(formData.otherPaymentTypes).some(val => val === true);
      if (!hasOtherPaymentType) {
        newErrors.otherPaymentTypes = 'Please select at least one other payment method';
      }
    }

    if (formData.requireDeposits === 'yes') {
      const hasDepositType = Object.values(formData.depositTypes).some(val => val === true);
      if (!hasDepositType) {
        newErrors.depositTypes = 'Please select at least one deposit type';
      }
    }

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
      const policiesData = {
        languages: formData.languages,
        acceptCreditDebitCards: formData.acceptCreditDebitCards,
        cardTypes: Object.keys(formData.cardTypes).filter(key => formData.cardTypes[key]),
        installmentsAtFrontDesk: formData.installmentsAtFrontDesk,
        acceptOtherPayment: formData.acceptOtherPayment,
        otherPaymentTypes: Object.keys(formData.otherPaymentTypes).filter(key => formData.otherPaymentTypes[key]),
        requireDeposits: formData.requireDeposits,
        depositTypes: Object.keys(formData.depositTypes).filter(key => formData.depositTypes[key]),
        incidentalsPaymentForm: formData.incidentalsPaymentForm,
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
      setSubmitError(err.message || 'Failed to save policies. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/stays/setup/contract', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={3} totalSteps={10} />

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
                <div className="space-y-4">
                  {/* Selected Languages */}
                  {formData.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0fdf4] border border-[#3CAF54] rounded-lg text-sm"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang)}
                            className="text-[#3CAF54] hover:text-[#2d8f42]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Language Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.languageSearch}
                      onChange={(e) => setFormData(prev => ({ ...prev, languageSearch: e.target.value }))}
                      placeholder="Search"
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                    />
                    {formData.languageSearch && filteredLanguages.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredLanguages.map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => handleSelectLanguageFromList(lang)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Which payment methods do you accept at your property?
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="acceptCreditDebitCards"
                      checked={formData.acceptCreditDebitCards}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm font-medium text-gray-700">Credit / debit cards</span>
                  </label>

                  {formData.acceptCreditDebitCards && (
                    <div className="ml-7 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Types of card you accept</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          { key: 'visa', label: 'Visa (Credit & Debit)' },
                          { key: 'mastercard', label: 'Mastercard (Credit & Debit)' },
                          { key: 'unionPay', label: 'UnionPay (optional)' },
                          { key: 'travoozCard', label: 'Travooz Card' }
                        ].map((card) => (
                          <label key={card.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`cardTypes.${card.key}`}
                              checked={formData.cardTypes[card.key]}
                              onChange={handleChange}
                              className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                            />
                            <span className="text-sm text-gray-700">{card.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.cardTypes && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.cardTypes}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.acceptCreditDebitCards && (
                    <div className="ml-7">
                      <p className="text-sm font-medium text-gray-700 mb-2">Other settings</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="installmentsAtFrontDesk"
                            checked={formData.installmentsAtFrontDesk}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm text-gray-700">
                            Installments payments offered at front desk (for locals only)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Other Payment Methods */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="acceptOtherPayment"
                      checked={formData.acceptOtherPayment}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm font-medium text-gray-700">Other payment methods</span>
                  </label>

                  {formData.acceptOtherPayment && (
                    <div className="ml-7 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Types of other payment you accept</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { key: 'cash', label: 'Cash' },
                          { key: 'momo', label: 'MoMo' },
                          { key: 'airtelMoney', label: 'Airtel Money' }
                        ].map((payment) => (
                          <label key={payment.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`otherPaymentTypes.${payment.key}`}
                              checked={formData.otherPaymentTypes[payment.key]}
                              onChange={handleChange}
                              className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                            />
                            <span className="text-sm text-gray-700">{payment.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.otherPaymentTypes && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.otherPaymentTypes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Deposits */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Do you require any deposits?
                </h2>
                <div className="space-y-4">
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

                  {formData.requireDeposits === 'yes' && (
                    <div className="ml-7 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          { key: 'generalDeposit', label: 'General deposit' },
                          { key: 'breakageCleaningDeposit', label: 'Breakage/cleaning deposit' },
                          { key: 'springBreakDeposit', label: 'Spring break deposit' },
                          { key: 'damageDepositBeforeArrival', label: 'Damage deposit collected before arrival' },
                          { key: 'alternateDepositPayment', label: 'Alternate deposit payment' }
                        ].map((deposit) => (
                          <label key={deposit.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`depositTypes.${deposit.key}`}
                              checked={formData.depositTypes[deposit.key]}
                              onChange={handleChange}
                              className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                            />
                            <span className="text-sm text-gray-700">{deposit.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.depositTypes && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.depositTypes}
                        </p>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Forms of payment accepted for incidentals
                        </label>
                        <select
                          name="incidentalsPaymentForm"
                          value={formData.incidentalsPaymentForm}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                        >
                          <option value="cash_only">Cash only</option>
                          <option value="credit_card_only">Credit card only</option>
                          <option value="both">Both cash and credit card</option>
                        </select>
                      </div>
                    </div>
                  )}
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
