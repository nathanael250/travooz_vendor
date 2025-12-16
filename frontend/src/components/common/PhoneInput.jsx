import React, { useState, useRef, useEffect } from 'react';
import { countries, getDefaultCountry } from '../../utils/countries';

/**
 * Reusable Phone Input Component with Country Selector
 * @param {string} countryCode - Current country code value
 * @param {string} phone - Current phone number value
 * @param {function} onChange - Callback function (countryCode, phone)
 * @param {string} phoneName - Name attribute for phone input (default: 'phone')
 * @param {string} countryCodeName - Name attribute for country code select (default: 'countryCode')
 * @param {string} placeholder - Placeholder for phone input
 * @param {boolean} error - Whether to show error styling
 * @param {string} errorMessage - Error message to display
 * @param {string} className - Additional CSS classes
 * @param {boolean} required - Whether field is required
 */
export default function PhoneInput({
  countryCode,
  phone,
  onChange,
  phoneName = 'phone',
  countryCodeName = 'countryCode',
  placeholder = '7XX XXX XXX',
  error = false,
  errorMessage = '',
  className = '',
  required = false,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  // Get current country display
  const currentCountry = countries.find(c => c.code === countryCode) || getDefaultCountry();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (selectedCountry) => {
    onChange(selectedCountry.code, phone);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handlePhoneChange = (e) => {
    onChange(countryCode, e.target.value);
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative w-40 flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-3 py-3 border-2 rounded-lg focus:outline-none transition-all text-left flex items-center justify-between ${
              error
                ? 'border-red-500'
                : 'border-gray-300 focus:border-green-500'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-green-400'}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{currentCountry.flag}</span>
              <span className="text-sm font-medium text-gray-700">{currentCountry.code}</span>
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Country List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full px-4 py-2 text-left hover:bg-green-50 transition-colors flex items-center gap-3 ${
                        country.code === countryCode ? 'bg-green-100' : ''
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="flex-1 text-sm text-gray-700">{country.name}</span>
                      <span className="text-sm font-medium text-gray-600">{country.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500 text-center">No countries found</div>
                )}
              </div>
            </div>
          )}

          {/* Hidden input for form submission */}
          <input type="hidden" name={countryCodeName} value={countryCode} />
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            name={phoneName}
            value={phone}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
              error
                ? 'border-red-500'
                : 'border-gray-300 focus:border-green-500'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

