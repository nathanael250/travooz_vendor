import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, X, HelpCircle, Plus, Check } from 'lucide-react';
import StaysNavbar from '../../../components/stays/StaysNavbar';
import StaysFooter from '../../../components/stays/StaysFooter';
import { saveTourPackage, getTourPackage, transformApiDataToFormData } from '../../../services/tourPackageService';
import apiClient from '../../../services/apiClient';

// Helper function to build image URLs for both development and production
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL (http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Get the API base URL from environment
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  
  // Remove '/api/v1' from the base URL to get the server root
  const serverUrl = apiBaseUrl.replace('/api/v1', '');
  
  // Ensure the image URL starts with /
  const normalizedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  // Combine server URL with image path
  return `${serverUrl}${normalizedImageUrl}`;
};

const CreateTourPackage = () => {
  const navigate = useNavigate();
  const { packageId: urlPackageId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [businessId, setBusinessId] = useState(searchParams.get('businessId'));
  // Use state for packageId so we can update it when a new package is created
  const [packageId, setPackageId] = useState(urlPackageId);
  
  // Sync packageId state with URL params when URL changes
  useEffect(() => {
    if (urlPackageId && urlPackageId !== packageId) {
      setPackageId(urlPackageId);
    }
  }, [urlPackageId]);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState(1); // Sub-step within current step
  const [optionSubStep, setOptionSubStep] = useState(1); // Sub-step within Step 5 (Options)
  const [availabilitySubStep, setAvailabilitySubStep] = useState(1); // Sub-step within Step 5 Substep 3 (Availability & Pricing)
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Track completed steps
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  const [commission, setCommission] = useState(null); // Global commission from database
  const [formData, setFormData] = useState({
    // Step 1: Basic Informations
    name: '', // Substep 1: Title
    category: '', // Substep 1: Category
    shortDescription: '', // Substep 2: Short description
    fullDescription: '', // Substep 2: Full description
    highlights: ['', '', ''], // Substep 2: Highlights (array, starting with 3 empty)
    locations: [], // Substep 3: Locations (array of location objects)
    tags: [], // Substep 4: Tags (array of strings)
    
    // Step 2: Inclusions
    whatsIncluded: '', // Substep 1: What's included
    whatsNotIncluded: '', // Substep 1: What's not included
    guideType: '', // Substep 2: Guide information (self-guided, tour-guide, host-greeter, instructor, driver)
    guideLanguage: '', // Substep 2: Guide language (if tour-guide)
    foodIncluded: false, // Substep 3: Food
    meals: [], // Substep 3: Array of meals { type: '', format: '' }
    drinksIncluded: false, // Substep 3: Drinks included
    showDietaryRestrictions: false, // Substep 3: Show dietary restrictions toggle
    dietaryRestrictions: [], // Substep 3: Array of dietary restrictions
    transportationUsed: false, // Substep 4: Transportation
    transportationTypes: [], // Substep 4: Transportation types
    travelToDifferentCity: false, // Substep 4: Travel to different city
    
    // Step 3: Extra Information
    notSuitableFor: [], // Who is this activity not suitable for
    notAllowed: [], // What's not allowed
    petPolicy: false, // Pet-friendly
    petPolicyDetails: '', // Pet policy details
    mandatoryItems: [], // Mandatory items to bring
    knowBeforeYouGo: '', // Know before you go
    emergencyCountryCode: '+250', // Emergency phone country code
    emergencyPhone: '', // Emergency phone
    voucherInformation: '', // Voucher information
    
    // Step 4: Photos
    photos: [], // Array of photo files/URLs
    
    // Step 5: Options
    // Substep 1: Option setup
    optionReferenceCode: '', // Option reference code
    maxGroupSize: '', // Maximum group size
    languages: [], // Languages offered
    guideMaterials: false, // Add guide materials
    guideMaterialsTypes: [], // Guide materials types
    guideMaterialsLanguages: [], // Guide materials languages
    isPrivateActivity: false, // Is private activity
    skipTheLine: false, // Skip the line
    skipTheLineType: '', // Skip the line type
    wheelchairAccessible: false, // Wheelchair accessible
    durationType: '', // Duration or validity (duration/validity)
    durationValue: '', // Duration/validity value
    
    // Substep 2: Meeting point or pickup
    customerArrivalType: '', // How customers get to activity (self/ pickup)
    pickupType: '', // Pickup type (any-address/ defined-locations)
    pickupTiming: '', // When pickup (same-time/ before-activity)
    pickupConfirmation: '', // When to confirm pickup
    pickupTime: '', // When usually pick up
    pickupDescription: '', // Describe pickup
    dropOffType: '', // Drop-off type
    pickupTransportation: '', // Transportation for pickup/drop-off
    
    // Substep 3: Availability & Pricing
    availabilityType: '', // Time slots or Opening hours
    pricingType: '', // Price per person or per group/vehicle
    pricingCategory: 'same-price', // Pricing category: same-price or age-based
    schedules: [], // Array of schedule objects
    // Schedule details
    scheduleName: '', // Name of the schedule
    scheduleStartDate: '', // Starting date
    scheduleHasEndDate: false, // Has end date checkbox
    scheduleEndDate: '', // End date
    weeklySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }, // Weekly schedule with time slots for each day
    scheduleExceptions: [], // Array of exception dates with time slots
    // Capacity (for Step 5, Substep 3, Tab 3)
    minParticipants: '', // Minimum participants per time slot
    maxParticipants: '', // Maximum participants per time slot
    exceptionsShareCapacity: true, // Whether exceptions share capacity
    // Simple Price (for Step 5, Substep 3, Tab 4)
    pricePerPerson: '' // Simple price per person (same for all)
  });
  const [locationSearch, setLocationSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [transportationSearch, setTransportationSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [notSuitableSearch, setNotSuitableSearch] = useState('');
  const [showNotSuitableDropdown, setShowNotSuitableDropdown] = useState(false);
  const [notAllowedSearch, setNotAllowedSearch] = useState('');
  const [showNotAllowedDropdown, setShowNotAllowedDropdown] = useState(false);
  const [mandatoryItemsSearch, setMandatoryItemsSearch] = useState('');
  const [showMandatoryItemsDropdown, setShowMandatoryItemsDropdown] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const notSuitableDropdownRef = useRef(null);
  const notAllowedDropdownRef = useRef(null);
  const mandatoryItemsDropdownRef = useRef(null);
  
  const TOTAL_SUB_STEPS = 4; // Title, Description, Location, Tags

  // Photo upload limits
  const MIN_PHOTOS = 4; // Minimum number of photos required
  const MAX_PHOTOS = 20; // Maximum number of photos allowed

  // Not suitable for options list
  const NOT_SUITABLE_OPTIONS = [
    'People over 70 years',
    'People over 95 years',
    'People with altitude sickness',
    'Babies under 1 year',
    'Children under 10 years',
    'Children under 11 years',
    'Children under 12 years',
    'Children under 13 years',
    'Children under 14 years',
    'Children under 15 years',
    'Children under 16 years',
    'Children under 18 years',
    'Children under 2 years',
    'Children under 3 years',
    'Children under 4 years',
    'Children under 5 years',
    'Children under 6 years',
    'Children under 7 years',
    'Children under 8 years',
    'Children under 3 ft (90 cm)',
    'Children under 9 years',
    'Cruise ship guests',
    'People with diabetes',
    'Divers without certification',
    'People diving up to 24 hours prior',
    'Drivers under 18 years',
    'Drivers under 21 years',
    'Drivers under 16 years',
    'Hearing-impaired people',
    'People with high blood pressure',
    'People with lactose intolerance',
    'People with low level of fitness',
    'Non-swimmers',
    'People with nut allergies',
    'People over 287 lbs (130 kg)',
    'People over 309 lbs (140 kg)',
    'People over 209 lbs (95 kg)',
    'People afraid of heights',
    'People over 220 lbs (100 kg)',
    'People over 243 lbs (110 kg)',
    'People over 254 lbs (115 kg)',
    'People over 260 lbs (118 kg)',
    'People over 275 lbs (125 kg)',
    'People over 297 lbs (135 kg)',
    'People over 331 lbs (150 kg)',
    'People over 5 ft 9 in (180 cm)',
    'People over 6 ft 6 in (200 cm)',
    'People over 200 lbs (91 kg)',
    'People over 230 lbs (104 kg)',
    'People over 250 lbs (113 kg)',
    'People over 264 lbs (120 kg)',
    'People over 270 lbs (122 kg)',
    'People over 280 lbs (127 kg)',
    'People over 300 lbs (136 kg)',
    'People over 350 lbs (159 kg)',
    'People over 55 years',
    'People over 60 years',
    'People over 65 years',
    'People over 75 years',
    'People prone to seasickness',
    'People under 3 ft 3 in (100 cm)',
    'People under 3 ft 6 in (110 cm)',
    'People under 3 ft 9 in (120 cm)',
    'People under 4 ft 3 in (130 cm)',
    'People under 4 ft 4 in (135 cm)',
    'People under 4 ft 6 in (140 cm)',
    'People under 4 ft 8 in (145 cm)',
    'People under 4 ft 9 in (150 cm)',
    'People under 5 ft 1 in (155 cm)',
    'People under 5 ft 2 in (160 cm)',
    'People under 17 years',
    'People under 19 years',
    'Children under 44 lbs (20 kg)',
    'People under 20 years',
    'People under 21 years',
    'People under 66 lbs (30 kg)',
    'People under 77 lbs (35 kg)',
    'People under 88 lbs (40 kg)',
    'People under 99 lbs (45 kg)',
    'Children under 50 lbs (23 kg)',
    'People who can\'t drive manual transmission',
    'People who can\'t ride a bike',
    'People with a cold',
    'People with animal allergies',
    'People with back problems',
    'People with claustrophobia',
    'People with epilepsy',
    'People with food allergies',
    'People with gluten intolerance',
    'People with haemophilia',
    'People with heart problems',
    'People with insect allergies',
    'People with kidney problems',
    'People with mobility impairments',
    'People with motion sickness',
    'People without driver\'s license',
    'People without experience',
    'People with recent surgeries',
    'People with respiratory issues',
    'People with vertigo',
    'People with pre-existing medical conditions',
    'Pregnant women',
    'People over 80 years',
    'Children under 33 lbs (15 kg)',
    'Vegans',
    'Vegetarians',
    'Visually impaired people',
    'Wheelchair users'
  ];

  // Not allowed options list
  const NOT_ALLOWED_OPTIONS = [
    'Alcohol',
    'Alcoholic beverages',
    'Animals',
    'Backpacks',
    'Bags',
    'Cameras',
    'Children under 12',
    'Children under 16',
    'Children under 18',
    'Clothing that reveals too much',
    'Drones',
    'Drugs',
    'Electronic devices',
    'Firearms',
    'Food',
    'Glass containers',
    'Illegal substances',
    'Large bags',
    'Loud music',
    'Mobile phones',
    'Outside food and drinks',
    'Pets',
    'Photography',
    'Professional cameras',
    'Recording devices',
    'Selfie sticks',
    'Smoking',
    'Strollers',
    'Tripods',
    'Umbrellas',
    'Valuables',
    'Video recording',
    'Weapons',
    'Weapons or sharp objects',
    'Wheelchairs',
    'Wheeled luggage'
  ];

  // Mandatory items options list
  const MANDATORY_ITEMS_OPTIONS = [
    'Beachwear',
    'Binoculars',
    'Biodegradable sunscreen',
    'Biodegradable insect repellent',
    'Boating licence',
    'Camera',
    'Cash',
    'Change of clothes',
    'Charged Smartphone',
    'Child safety seat',
    'Climbing gear',
    'Closed-toe shoes',
    'Clothes that can get dirty',
    'Collared shirt',
    'Comfortable clothes',
    'Comfortable shoes',
    'Cooking equipment',
    'Credit card',
    'Cycling clothing',
    'Daypack',
    'Deposit',
    'Disability card',
    'Dive log',
    'Diving certification',
    'Downloaded app',
    'Drinks',
    'Driver\'s license',
    'Face mask or protective covering',
    'FFP2 mask',
    'First aid kit',
    'Fishing license',
    'Flashlight',
    'Flip-flops',
    'Food',
    'Food and drinks',
    'Game box',
    'Garbage bag',
    'Gloves',
    'Goggles',
    'Trekking gear',
    'GPS/map',
    'Hair tie',
    'Hand sanitizer or tissues',
    'Hat',
    'Head covering or kippah',
    'Headphones',
    'Headscarf',
    'Helmet',
    'Hiking pants',
    'Hiking shoes',
    'Ingredients',
    'Insect repellent',
    'International driver\'s license',
    'Internet access',
    'Jacket',
    'Breathable clothing',
    'Long pants',
    'Long-sleeved shirt',
    'Medical mask',
    'Medical statement',
    'Motion sickness prevention',
    'Outdoor clothing',
    'Pacemaker card',
    'Packed lunch',
    'Passport',
    'Passport, copy accepted',
    'Passport or ID card',
    'Passport or ID card for children',
    'Passport or ID card, copy accepted',
    'Passport-sized photo',
    'Pen',
    'Personal medication',
    'Pillow',
    'Power bank',
    'Public transport ticket',
    'Quick-dry clothing',
    'Rain gear',
    'Reusable water bottle',
    'Sandals',
    'Sarong',
    'Scarf',
    'Shorts',
    'Signed waiver',
    'Sleeping bag',
    'Snacks',
    'Snorkeling gear',
    'Snow clothing',
    'Socks',
    'Sports shoes',
    'Sportswear',
    'Storage device',
    'Student card',
    'Sunglasses',
    'Sun hat',
    'Sunscreen',
    'Swimming cap',
    'Swimwear',
    'Tent',
    'Thermal clothing',
    'Tie',
    'Toiletries',
    'Towel',
    'Travel insurance',
    'Tripod',
    'T-shirt',
    'Umbrella',
    'ID card, copy accepted',
    'Visa, if required',
    'Warm clothing',
    'Warm shoes',
    'Water',
    'Waterproof bag',
    'Waterproof camera',
    'Waterproof shoes',
    'Water shoes',
    'Weather-appropriate clothing',
    'Wetsuit',
    'Windbreaker',
    'Winter sports gear',
    'Your own vehicle'
  ];

  // Language options list
  const LANGUAGE_OPTIONS = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian',
    'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean', 'Arabic', 'Hindi',
    'Turkish', 'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Czech',
    'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian', 'Slovak', 'Slovenian',
    'Estonian', 'Latvian', 'Lithuanian', 'Ukrainian', 'Hebrew', 'Thai', 'Vietnamese',
    'Indonesian', 'Malay', 'Tagalog', 'Swahili', 'Zulu', 'Afrikaans', 'Amharic',
    'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Persian',
    'Kiswahili', 'Luganda', 'Kinyarwanda', 'Kirundi', 'Somali', 'Oromo', 'Hausa',
    'Yoruba', 'Igbo', 'Fulani', 'Wolof', 'Mandinka', 'Bambara', 'Twi', 'Akan',
    'Catalan', 'Basque', 'Galician', 'Welsh', 'Irish', 'Scottish Gaelic', 'Breton',
    'Icelandic', 'Maltese', 'Luxembourgish', 'Albanian', 'Macedonian', 'Bosnian',
    'Montenegrin', 'Moldovan', 'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh',
    'Uzbek', 'Mongolian', 'Nepali', 'Sinhala', 'Burmese', 'Khmer', 'Lao',
    'Javanese', 'Sundanese', 'Cebuano', 'Ilocano', 'Hiligaynon', 'Bicolano'
  ];

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Fetch businessId if not in URL
  useEffect(() => {
    const fetchBusinessId = async () => {
      if (businessId) return; // Already have businessId

      // Try to get from localStorage first
      const storedBusinessId = localStorage.getItem('tour_business_id');
      if (storedBusinessId) {
        setBusinessId(storedBusinessId);
        // Update URL
        setSearchParams({ businessId: storedBusinessId });
        return;
      }

      // Try to fetch from API
      try {
        const response = await apiClient.get('/tours/businesses/my');
        const businesses = response.data?.data || response.data?.data || response.data || [];
        if (businesses.length > 0) {
          const firstBusinessId = businesses[0].tour_business_id || businesses[0].tourBusinessId;
          if (firstBusinessId) {
            const businessIdStr = firstBusinessId.toString();
            setBusinessId(businessIdStr);
            // Update URL
            setSearchParams({ businessId: businessIdStr });
            // Store in localStorage for future use
            localStorage.setItem('tour_business_id', businessIdStr);
          }
        }
      } catch (error) {
        console.error('Error fetching business ID:', error);
        // If we can't get businessId, show a warning but don't block the form
        console.warn('Could not fetch business ID. Package will be saved to localStorage only until business ID is available.');
      }
    };

    fetchBusinessId();
  }, [businessId, setSearchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notSuitableDropdownRef.current &&
        !notSuitableDropdownRef.current.contains(event.target) &&
        !event.target.closest('input[placeholder="Search for restrictions"]')
      ) {
        setShowNotSuitableDropdown(false);
      }
      if (
        notAllowedDropdownRef.current &&
        !notAllowedDropdownRef.current.contains(event.target) &&
        !event.target.closest('input[placeholder*="Search for restrictions or type"]')
      ) {
        setShowNotAllowedDropdown(false);
      }
      if (
        mandatoryItemsDropdownRef.current &&
        !mandatoryItemsDropdownRef.current.contains(event.target) &&
        !event.target.closest('input[placeholder="Search for items"]')
      ) {
        setShowMandatoryItemsDropdown(false);
      }
    };

    if (showNotSuitableDropdown || showNotAllowedDropdown || showMandatoryItemsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotSuitableDropdown, showMandatoryItemsDropdown]);

  // Initialize Google Places Autocomplete for locations (same as ListYourTour.jsx)
  const initializeLocationAutocomplete = () => {
    if (!locationInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    // Clean up existing autocomplete if it exists
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        types: ['establishment', 'geocode'], // Allow both places and addresses (same as ListYourTour.jsx)
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components']
      });

      autocompleteRef.current = autocomplete;
      console.log('Google Places Autocomplete initialized successfully');

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          console.warn('Selected place has no geometry');
          return;
        }

        // Create location object
        const locationInfo = {
          id: place.place_id || `location_${Date.now()}`,
          name: place.name || place.formatted_address,
          formatted_address: place.formatted_address,
          place_id: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address_components: place.address_components
        };

        // Check if location already exists
        setFormData(prev => {
          const exists = prev.locations.some(loc => 
            loc.place_id === locationInfo.place_id || 
            loc.formatted_address === locationInfo.formatted_address
          );

          if (!exists) {
            return {
              ...prev,
              locations: [...prev.locations, locationInfo]
            };
          }
          return prev;
        });

        // Clear search input
        setLocationSearch('');
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  };

  // Load Google Maps script - check if already loaded or wait for it
  // Only initialize when on substep 3 (Locations) - copied from ListYourTour.jsx
  useEffect(() => {
    // Only run this effect when we're on the locations sub-step
    if (currentStep !== 1 || currentSubStep !== 3) {
      // Clean up autocomplete when leaving this step
      if (autocompleteRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          // Ignore errors during cleanup
        }
        autocompleteRef.current = null;
      }
      return;
    }

    // Check if Google Maps is already loaded
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places && locationInputRef.current) {
        setIsGoogleMapsLoaded(true);
          initializeLocationAutocomplete();
        return true;
      }
      return false;
    };

    // Listen for global Google Maps error events (same as ListYourTour.jsx)
    const handleGoogleMapsError = (event) => {
      const error = event.detail?.error;
      if (error) {
        console.error('Google Maps error detected:', error);
        if (error.type === 'auth_failure') {
          console.error('Google Maps API authentication failed. Please check your API key and ensure billing is enabled in Google Cloud Console.');
        } else if (error.type === 'script_load_failed' || error.type === 'max_attempts_reached') {
          console.error('Failed to load Google Maps. Please check your API key and network connection.');
        } else if (error.type === 'callback_timeout') {
          console.error('Google Maps API is taking too long to load. Please refresh the page or check your network connection.');
        } else {
          console.error('An error occurred while loading Google Maps:', error.message);
        }
      }
    };

    // Check for existing error state
    if (window.googleMapsLoadError) {
      handleGoogleMapsError({ detail: { error: window.googleMapsLoadError } });
    }

    // If already loaded, initialize immediately
    if (checkGoogleMaps()) {
      return;
    }

    // Listen for error events
    window.addEventListener('googlemaps:error', handleGoogleMapsError);

    // Wait for Google Maps to load (it's loaded in index.html)
    let checkInterval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout after 15 seconds (matching index.html timeout)
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.google || !window.google.maps) {
        // Only log error if not already set by global error handler
        if (!window.googleMapsLoadError) {
        console.error('Failed to load Google Maps. Please check your API key and network connection.');
        }
      } else if (!locationInputRef.current) {
        console.warn('Google Maps loaded but input field not available yet');
      }
    }, 15000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      window.removeEventListener('googlemaps:error', handleGoogleMapsError);
    };
  }, [currentStep, currentSubStep]);

  // Re-initialize autocomplete when input field becomes available or is focused
  useEffect(() => {
    if (currentStep === 1 && currentSubStep === 3 && isGoogleMapsLoaded && locationInputRef.current) {
      // Re-initialize when input is focused to ensure autocomplete works
      const input = locationInputRef.current;
      const handleFocus = () => {
        // Only initialize if autocomplete doesn't exist and Google Maps is ready
        if (!autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
          console.log('Re-initializing autocomplete on focus');
          initializeLocationAutocomplete();
        }
      };

      // Also try to initialize immediately if not already initialized
      if (!autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
        setTimeout(() => {
          initializeLocationAutocomplete();
        }, 50);
      }

      input.addEventListener('focus', handleFocus);
      return () => {
        input.removeEventListener('focus', handleFocus);
      };
    }
  }, [currentStep, currentSubStep, isGoogleMapsLoaded]);

  // Load existing package data on mount
  useEffect(() => {
    const loadPackageData = async () => {
      if (packageId) {
        setIsLoading(true);
        try {
          const response = await getTourPackage(packageId);
          if (response.success && response.data) {
            // Package exists in database - load it
            const transformedData = transformApiDataToFormData(response.data);
            if (transformedData) {
              setFormData(transformedData);
              // Restore completed steps based on data
              const steps = new Set();
              if (transformedData.name && transformedData.category) steps.add(1);
              if (transformedData.whatsIncluded || transformedData.guideType) steps.add(2);
              if (transformedData.notSuitableFor.length > 0 || transformedData.knowBeforeYouGo) steps.add(3);
              if (transformedData.photos.length > 0) steps.add(4);
              if (transformedData.optionReferenceCode || transformedData.availabilityType) steps.add(5);
              setCompletedSteps(steps);
              
              // Navigate to appropriate step when editing existing package
              const completedStepsArray = Array.from(steps).sort((a, b) => b - a);
              if (completedStepsArray.length > 0) {
                // If all 5 main steps are completed, go to Review step (Step 6)
                // Otherwise, go to the next incomplete step
                const allStepsCompleted = steps.has(1) && steps.has(2) && steps.has(3) && steps.has(4) && steps.has(5);
                const targetStep = allStepsCompleted ? 6 : (completedStepsArray[0] + 1);
                
                setCurrentStep(targetStep);
                
                // Set appropriate substeps based on the target step
                if (targetStep === 1) {
                  setCurrentSubStep(1);
                } else if (targetStep === 2) {
                  setCurrentSubStep(1);
                } else if (targetStep === 5) {
                  setCurrentSubStep(1);
                  setAvailabilitySubStep(1);
                } else if (targetStep === 6) {
                  // Review step - no substeps needed
                }
              }
              
              // Clear localStorage since we have fresh data from DB
              localStorage.removeItem('tour_package_draft');
            }
          } else {
            // Package doesn't exist in database - clear localStorage and start fresh
            console.log('⚠️ Package not found in database. Starting fresh.');
            localStorage.removeItem('tour_package_draft');
            // Clear the packageId from URL if it doesn't exist
            if (packageId) {
              window.history.replaceState({}, '', `/tours/dashboard/packages/create?businessId=${businessId || ''}`);
              setPackageId(null);
            }
          }
        } catch (error) {
          console.error('Error loading package:', error);
          // If error loading, clear localStorage and start fresh
          localStorage.removeItem('tour_package_draft');
          if (packageId) {
            window.history.replaceState({}, '', `/tours/dashboard/packages/create?businessId=${businessId || ''}`);
            setPackageId(null);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // No packageId - check if we should load from localStorage
        // Only load from localStorage if it's a recent draft (less than 1 hour old)
        const saved = localStorage.getItem('tour_package_draft');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Check if there's a saved packageId that might still exist
            if (parsed.packageId) {
              // Try to verify the package still exists before loading
              try {
                const response = await getTourPackage(parsed.packageId);
                if (response.success && response.data) {
                  // Package exists - load from DB instead
                  const transformedData = transformApiDataToFormData(response.data);
                  if (transformedData) {
                    setFormData(transformedData);
                    setCompletedSteps(new Set(parsed.completedSteps || []));
                    // Update URL with the packageId
                    window.history.replaceState({}, '', `/tours/dashboard/packages/create/${parsed.packageId}?businessId=${businessId || ''}`);
                    setPackageId(parsed.packageId);
                    return;
                  }
                }
              } catch (e) {
                // Package doesn't exist - clear localStorage and start fresh
                console.log('⚠️ Saved packageId no longer exists. Starting fresh.');
                localStorage.removeItem('tour_package_draft');
                return;
              }
            }
            // No packageId in saved data, or package doesn't exist - load draft
            setFormData(parsed.formData || parsed);
            setCompletedSteps(new Set(parsed.completedSteps || []));
          } catch (e) {
            console.error('Error loading from localStorage:', e);
            localStorage.removeItem('tour_package_draft');
          }
        }
      }
    };

    loadPackageData();
  }, [packageId, businessId]);

  // Fetch commission on mount
  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await apiClient.get('/tours/commission/active');
        if (response.data.success && response.data.data) {
          setCommission(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching commission:', error);
        // Set default commission if API fails
        setCommission({ commission_percentage: 15, currency: 'RWF' });
      }
    };
    fetchCommission();
  }, []);

  // Auto-save to backend and localStorage
  // Only trigger on formData changes, not on packageId changes
  useEffect(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Don't auto-save on initial load or if no business ID
    if (isLoading || !businessId) return;

    // Auto-save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      savePackageData();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // Only depend on formData and businessId - NOT packageId to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, businessId, isLoading]);

  // Check if package is 100% complete
  const isPackageComplete = (data) => {
    // Check all required fields from all steps
    const hasBasicInfo = data.name && data.category && data.shortDescription && data.locations && data.locations.length > 0;
    const hasInclusions = data.whatsIncluded || data.guideType;
    const hasExtraInfo = data.knowBeforeYouGo || (data.notSuitableFor && data.notSuitableFor.length > 0);
    const hasPhotos = data.photos && data.photos.length >= MIN_PHOTOS;
    const hasOptions = data.availabilityType && data.pricingType && data.pricePerPerson && parseFloat(data.pricePerPerson) > 0;
    
    return hasBasicInfo && hasInclusions && hasExtraInfo && hasPhotos && hasOptions;
  };

  // Save package data to backend and localStorage
  const savePackageData = async (showMessage = false) => {
    try {
      setIsSaving(true);
      
      // Check if we have a business ID
      if (!businessId) {
        console.warn('⚠️ No businessId found. Cannot save package without a tour business.');
        // Still save to localStorage as backup
        localStorage.setItem('tour_package_draft', JSON.stringify({
          formData,
          completedSteps: Array.from(completedSteps),
          packageId
        }));
        return;
      }
      
      // Prepare data for backend - keep File objects as-is for file upload
      // Separate File objects from existing photo URLs/objects
      const photoFiles = [];
      const existingPhotos = [];
      
      formData.photos.forEach((photo) => {
        if (photo instanceof File) {
          // Keep File objects as-is - they'll be uploaded via FormData
          photoFiles.push(photo);
        } else if (typeof photo === 'string') {
          // Existing photo URL - preserve it
          existingPhotos.push({
            photo_url: photo,
            photo_name: null,
            photo_size: null,
            photo_type: null
          });
        } else if (photo && typeof photo === 'object' && photo.photo_url) {
          // Existing photo object - preserve it
          existingPhotos.push(photo);
        }
      });

      // Check if package is complete and set status accordingly
      const packageComplete = isPackageComplete(formData);
      const statusToSave = packageComplete ? 'active' : (formData.status || 'draft');

      // Combine existing photos with new File objects
      // File objects will be sent via FormData, existing photos as JSON
      const dataToSave = {
        ...formData,
        photos: [...existingPhotos, ...photoFiles], // Mix of existing photo objects and File objects
        tour_business_id: businessId,
        status: statusToSave
      };

      console.log('💾 Saving package data:', { 
        businessId, 
        packageId, 
        hasName: !!formData.name, 
        photoFilesCount: photoFiles.length,
        existingPhotosCount: existingPhotos.length,
        totalPhotosCount: dataToSave.photos.length,
        isComplete: packageComplete,
        status: statusToSave
      });

      // Save to backend
      const response = await saveTourPackage(dataToSave, packageId);
      
      if (response && response.success) {
        // Always get the packageId from the response (could be new or existing)
        const newPackageId = response.data?.package_id || response.data?.id || packageId;
        
        // Only update packageId if it actually changed AND we're not in the middle of a save
        // This prevents infinite loops when the backend creates a new package
        if (newPackageId && newPackageId !== packageId && !isSaving) {
          console.log('🔄 Package ID changed:', { old: packageId, new: newPackageId });
          // Use a timeout to prevent immediate re-triggering of auto-save
          setTimeout(() => {
            window.history.replaceState({}, '', `/tours/dashboard/packages/create/${newPackageId}?businessId=${businessId}`);
            setPackageId(newPackageId);
          }, 100);
        }
        
        // Save to localStorage as backup
        localStorage.setItem('tour_package_draft', JSON.stringify({
          formData,
          completedSteps: Array.from(completedSteps),
          packageId: newPackageId || packageId
        }));

        setLastSaved(new Date());
        if (showMessage) {
          console.log('✅ Package saved successfully', { packageId: newPackageId || packageId });
          return { success: true, packageId: newPackageId || packageId };
        }
        return { success: true, packageId: newPackageId || packageId };
      } else {
        throw new Error(response?.message || 'Failed to save package');
      }
    } catch (error) {
      console.error('❌ Error saving package:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error message:', error.message);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save package';
      if (showMessage) {
        alert(`Error saving package: ${errorMessage}`);
      }
      
      // Still save to localStorage as backup
      localStorage.setItem('tour_package_draft', JSON.stringify({
        formData,
        completedSteps: Array.from(completedSteps),
        packageId
      }));
      
      throw error; // Re-throw so caller knows it failed
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate to a specific step
  const navigateToStep = (step) => {
    // Only allow navigation to completed steps or current step
    if (step <= currentStep || completedSteps.has(step) || step === 1) {
      setCurrentStep(step);
      // Reset substeps appropriately
      if (step === 1) {
        setCurrentSubStep(1);
      } else if (step === 2) {
        setCurrentSubStep(1);
      } else if (step === 5) {
        setCurrentSubStep(1);
        setAvailabilitySubStep(1);
      }
    }
  };

  // Check if a step is completed - memoized to avoid recreating on every render
  const isStepCompleted = React.useCallback((step, data) => {
    switch (step) {
      case 1:
        return data.name && data.category && data.shortDescription && data.locations.length > 0;
      case 2:
        return data.whatsIncluded || data.guideType;
      case 3:
        return data.knowBeforeYouGo || data.notSuitableFor.length > 0;
      case 4:
        return data.photos.length >= MIN_PHOTOS;
      case 5:
        return data.availabilityType && data.pricingType;
      default:
        return false;
    }
  }, []);

  // Update completed steps when form data changes
  useEffect(() => {
    const newCompleted = new Set();
    for (let i = 1; i <= 5; i++) {
      if (isStepCompleted(i, formData)) {
        newCompleted.add(i);
      }
    }
    setCompletedSteps(newCompleted);
  }, [formData, isStepCompleted]);

  const categories = [
    'Adventure Tours',
    'Cultural Tours',
    'Safari Tours',
    'Beach Tours',
    'Mountain Tours',
    'City Tours',
    'Wildlife Tours',
    'Historical Tours',
    'Religious Tours',
    'Other'
  ];

  // Common country codes (focusing on East Africa)
  const countryCodes = [
    { code: '+250', country: 'Rwanda' },
    { code: '+256', country: 'Uganda' },
    { code: '+255', country: 'Tanzania' },
    { code: '+254', country: 'Kenya' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+234', country: 'Nigeria' },
    { code: '+27', country: 'South Africa' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+61', country: 'Australia' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData(prev => ({
      ...prev,
      highlights: newHighlights
    }));
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const handleRemoveHighlight = (index) => {
    if (formData.highlights.length > 1) {
      const newHighlights = formData.highlights.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        highlights: newHighlights
      }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleNext = async () => {
    // Save data before moving to next step
    await savePackageData();
    
    if (currentStep === 1) {
      // Handle sub-steps within Step 1: Basic Informations
      if (currentSubStep === 1) {
        if (!formData.name.trim()) {
          alert('Please enter a package name');
          return;
        }
        if (!formData.category) {
          alert('Please select a category');
          return;
        }
        setCurrentSubStep(2);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 2) {
        if (!formData.shortDescription.trim()) {
          alert('Please enter a short description');
          return;
        }
        if (!formData.fullDescription.trim()) {
          alert('Please enter a full description');
          return;
        }
        const filledHighlights = formData.highlights.filter(h => h.trim() !== '');
        if (filledHighlights.length < 3) {
          alert('Please provide at least 3 highlights');
          return;
        }
        setCurrentSubStep(3);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 3) {
        if (formData.locations.length === 0) {
          alert('Please add at least one location');
          return;
        }
        setCurrentSubStep(4);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 4) {
        setCurrentStep(2);
        setCurrentSubStep(1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } else if (currentStep === 2) {
      // Handle sub-steps within Step 2: Inclusions
      if (currentSubStep === 1) {
        if (!formData.whatsIncluded.trim()) {
          alert('Please enter what\'s included');
          return;
        }
        setCurrentSubStep(2);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 2) {
        if (!formData.guideType) {
          alert('Please select a guide type');
          return;
        }
        setCurrentSubStep(3);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 3) {
        setCurrentSubStep(4);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 4) {
        setCurrentStep(3);
        setCurrentSubStep(1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } else if (currentStep === 3) {
      // Step 3: Extra Information (no substeps)
      setCurrentStep(4);
      setCurrentSubStep(1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else if (currentStep === 4) {
      // Step 4: Photos (no substeps)
      if (formData.photos.length < MIN_PHOTOS) {
        alert(`Please upload at least ${MIN_PHOTOS} photos. You currently have ${formData.photos.length} photo(s).`);
        return;
      }
      if (formData.photos.length > MAX_PHOTOS) {
        alert(`You have uploaded ${formData.photos.length} photos, but the maximum is ${MAX_PHOTOS}. Please remove ${formData.photos.length - MAX_PHOTOS} photo(s).`);
        return;
      }
      setCurrentStep(5);
      setCurrentSubStep(1);
      setOptionSubStep(1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else if (currentStep === 5) {
      // Handle sub-steps within Step 5: Options
      if (currentSubStep === 1) {
        // Option setup
        setCurrentSubStep(2);
        setOptionSubStep(1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 2) {
        // Meeting point or pickup
        if (!formData.customerArrivalType) {
          alert('Please select how customers get to the activity');
          return;
        }
        setCurrentSubStep(3);
        setAvailabilitySubStep(1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 3) {
        // Availability & Pricing - handle its own substeps
        if (availabilitySubStep === 1) {
          // Schedule
          setAvailabilitySubStep(2);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        } else if (availabilitySubStep === 2) {
          // Pricing Categories
          setAvailabilitySubStep(3);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        } else if (availabilitySubStep === 3) {
          // Capacity
          setAvailabilitySubStep(4);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        } else if (availabilitySubStep === 4) {
          // Price - complete Availability & Pricing
          // Move to review step
          setCurrentStep(6);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
      } else {
        // All steps complete - move to review
        setCurrentStep(6);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    }
  };

  const handleRemoveLocation = (locationId) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId)
    }));
  };

  const handleAddManualLocation = () => {
    if (!locationSearch.trim()) {
      return;
    }

    // Create mock location data
    const mockLocation = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: locationSearch.trim(),
      formatted_address: locationSearch.trim(),
      place_id: `manual_${Date.now()}`,
      lat: -1.9441, // Default to Kigali, Rwanda coordinates
      lng: 30.0619,
      address_components: []
    };

    // Check if location already exists
    setFormData(prev => {
      const exists = prev.locations.some(loc => 
        loc.place_id === mockLocation.place_id || 
        loc.formatted_address === mockLocation.formatted_address
      );

      if (!exists) {
        return {
          ...prev,
          locations: [...prev.locations, mockLocation]
        };
      }
      return prev;
    });

    // Clear search input
    setLocationSearch('');
  };

  const handleBack = () => {
    if (currentStep === 1) {
      if (currentSubStep === 1) {
        navigate('/tours/dashboard/packages');
      } else {
        setCurrentSubStep(currentSubStep - 1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } else if (currentStep === 2) {
      if (currentSubStep === 1) {
        setCurrentStep(1);
        setCurrentSubStep(4); // Go back to last substep of Step 1
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else {
        setCurrentSubStep(currentSubStep - 1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setCurrentSubStep(4); // Go back to last substep of Step 2
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else if (currentStep === 4) {
      setCurrentStep(3);
      setCurrentSubStep(1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else if (currentStep === 5) {
      if (currentSubStep === 1) {
        setCurrentStep(4);
        setCurrentSubStep(1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 2) {
        setCurrentSubStep(1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else if (currentSubStep === 3) {
        // Availability & Pricing substeps
        if (availabilitySubStep === 1) {
          setCurrentSubStep(2);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        } else {
          setAvailabilitySubStep(availabilitySubStep - 1);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
      } else {
        setCurrentSubStep(currentSubStep - 1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-800">Loading package data...</p>
            </div>
          )}
          
          {/* Progress Indicator */}
          <div className="mb-8">
            {/* Mobile: Simple progress bar */}
            <div className="block md:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#1f6f31' }}>
                  Step {currentStep} of 6
                  {currentStep === 1 && ` - Basic Informations (Substep ${currentSubStep} of 4)`}
                  {currentStep === 2 && ` - Inclusions (Substep ${currentSubStep} of 4)`}
                  {currentStep === 5 && currentSubStep === 1 && ` - Options (Substep ${currentSubStep} of 3: Option setup)`}
                  {currentStep === 5 && currentSubStep === 2 && ` - Options (Substep ${currentSubStep} of 3: Meeting point or pickup)`}
                  {currentStep === 5 && currentSubStep === 3 && ` - Options (Substep ${currentSubStep} of 3: Availability & Pricing - Step ${availabilitySubStep} of 4)`}
                  {currentStep === 6 && ` - Review & Submit`}
                </span>
                <span className="text-xs text-gray-500">{Math.round((currentStep / 6) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: '#3CAF54', width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Desktop: Show all steps */}
            <div className="hidden md:flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {/* Step 1 - Clickable */}
                <button
                  type="button"
                  onClick={() => navigateToStep(1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-md transition-all ${
                    currentStep === 1 ? 'ring-2 ring-[#3CAF54] ring-offset-2' : ''
                  } ${
                    completedSteps.has(1) ? 'hover:scale-110' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentStep === 1 ? '#3CAF54' : (completedSteps.has(1) ? '#22c55e' : '#bbf7d0'),
                    color: currentStep === 1 || completedSteps.has(1) ? 'white' : '#1f6f31',
                    cursor: completedSteps.has(1) || currentStep === 1 ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!completedSteps.has(1) && currentStep !== 1}
                  title={completedSteps.has(1) ? 'Step 1 completed - Click to go back' : currentStep === 1 ? 'Current step' : 'Complete previous steps first'}
                >
                  {completedSteps.has(1) && currentStep !== 1 ? <Check className="h-5 w-5" /> : '1'}
                </button>
                <div className={`w-16 h-1 ${completedSteps.has(1) ? 'bg-[#3CAF54]' : ''}`} style={{ 
                  backgroundColor: completedSteps.has(1) ? '#3CAF54' : '#bbf7d0' 
                }}></div>
                
                {/* Steps 2-6 - Clickable */}
                {[2, 3, 4, 5, 6].map((step) => {
                  const canNavigate = step <= currentStep || completedSteps.has(step) || step === 1;
                  const isCompleted = completedSteps.has(step);
                  const isCurrent = currentStep === step;
                  
                  return (
                    <React.Fragment key={step}>
                      <button
                        type="button"
                        onClick={() => navigateToStep(step)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isCurrent ? 'ring-2 ring-[#3CAF54] ring-offset-2 shadow-md' : ''
                        } ${
                          isCompleted ? 'hover:scale-110' : ''
                        }`}
                        style={{ 
                          backgroundColor: isCurrent ? '#3CAF54' : (isCompleted ? '#22c55e' : '#bbf7d0'),
                          color: isCurrent || isCompleted ? 'white' : '#1f6f31',
                          cursor: canNavigate ? 'pointer' : 'not-allowed',
                          opacity: canNavigate ? 1 : 0.6
                        }}
                        disabled={!canNavigate}
                        title={isCompleted ? `Step ${step} completed - Click to go back` : isCurrent ? `Current step ${step}` : `Complete previous steps first`}
                      >
                        {isCompleted && !isCurrent ? <Check className="h-5 w-5" /> : step}
                      </button>
                      {step < 6 && (
                        <div className={`w-16 h-1 ${completedSteps.has(step) ? 'bg-[#3CAF54]' : ''}`} style={{ 
                          backgroundColor: completedSteps.has(step) ? '#3CAF54' : '#bbf7d0' 
                        }}></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <p className="text-center text-sm font-medium hidden md:block" style={{ color: '#1f6f31' }}>
                Step {currentStep} of 6
                {currentStep === 1 && ` - Basic Informations (Substep ${currentSubStep} of 4)`}
                {currentStep === 2 && ` - Inclusions (Substep ${currentSubStep} of 4)`}
                {currentStep === 5 && currentSubStep === 1 && ` - Options (Substep ${currentSubStep} of 3: Option setup)`}
                {currentStep === 5 && currentSubStep === 2 && ` - Options (Substep ${currentSubStep} of 3: Meeting point or pickup)`}
                {currentStep === 5 && currentSubStep === 3 && ` - Options (Substep ${currentSubStep} of 3: Availability & Pricing - Step ${availabilitySubStep} of 4)`}
                {currentStep === 6 && ` - Review & Submit`}
              </p>
              {(isSaving || lastSaved) && (
                <span className="text-xs text-gray-500 hidden md:inline">
                  {isSaving ? 'Saving...' : lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Step 1: Basic Informations - Sub-steps */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              {/* Substep 1: Title and Category */}
              {currentSubStep === 1 && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      What's the title that customers will see?
                    </h2>
                    <p className="text-sm text-gray-600">
                      Provide a location followed by a colon (:), and include the activity type e.g. Tour or Entry Ticket, and the important inclusions and unique selling points. Use title case.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Package Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Kigali: 3-Day Gorilla Trekking Adventure Tour"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Choose a clear and descriptive name for your tour package</span>
                        <span>{formData.name.length} / 60</span>
                      </p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Select the category that best describes your tour package
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Substep 2: Description and Highlights */}
              {currentSubStep === 2 && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Descriptions & highlights
                    </h2>
                    <p className="text-sm text-gray-600">
                      Provide details that will attract customers and highlight what makes your tour special.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Short Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Short description <span className="text-red-500">*</span>
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Give the customer a taste of what they'll do in 2 or 3 sentences. This will be the first thing customers read after the title, and will inspire them to continue.
                      </p>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        placeholder="Please insert your text in English."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                        maxLength={200}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.shortDescription.length} / 200
                      </p>
                    </div>

                    {/* Full Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Full description <span className="text-red-500">*</span>
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Provide all the details about what the customer will see and experience during the activity, in the correct order. Bring the activity to life and write at least 500 characters.
                      </p>
                      <textarea
                        name="fullDescription"
                        value={formData.fullDescription}
                        onChange={handleChange}
                        placeholder="Please insert your text in English."
                        rows="8"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                        maxLength={3000}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.fullDescription.length} / 3000
                      </p>
                    </div>

                    {/* Highlights */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Highlights <span className="text-red-500">*</span>
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Write 3-5 sentences explaining what makes your activity special and stand out from the competition. Customers will use these to compare between different activities.
                      </p>
                      {formData.highlights.filter(h => h.trim() !== '').length < 3 && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm mb-3 flex items-center justify-between">
                          <span>{3 - formData.highlights.filter(h => h.trim() !== '').length} Highlights are required</span>
                        </div>
                      )}
                      <div className="space-y-3">
                        {formData.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={highlight}
                              onChange={(e) => handleHighlightChange(index, e.target.value)}
                              placeholder="Please insert your text in English"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                              maxLength={80}
                            />
                            <span className="text-xs text-gray-500 w-12 text-right">{highlight.length} / 80</span>
                            {formData.highlights.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveHighlight(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove highlight"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="flex items-center gap-2 mt-4 px-4 py-2 text-[#3CAF54] hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add another highlight</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Substep 3: Locations */}
              {currentSubStep === 3 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Where will customers visit?
                      </h2>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-600">
                      List all the major cities, sites, and attractions that your customers will visit during your experience. Add as many relevant locations as possible.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Location Search Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          ref={locationInputRef}
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && locationSearch.trim()) {
                              e.preventDefault();
                              handleAddManualLocation();
                            }
                          }}
                          placeholder="Search for locations or type a location name and press Enter"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddManualLocation}
                        disabled={!locationSearch.trim()}
                        className="px-6 py-3 bg-[#3CAF54] text-white font-medium rounded-lg hover:bg-[#2d8f42] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      Type a location name and click "Add" or press Enter to add it manually. Google Maps autocomplete will work if available.
                    </p>

                    {/* Selected Locations Tags */}
                    {formData.locations.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.locations.map((location) => (
                          <div
                            key={location.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700"
                          >
                            <span>{location.name || location.formatted_address}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLocation(location.id)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.locations.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        No locations added yet. Start typing to search for locations.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Substep 4: Tags */}
              {currentSubStep === 4 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Add keywords to your product (optional)
                      </h2>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Keywords work as tags for your product and help customers find it when they search by a theme or their interests. Try to use all 15 for maximum reach.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Tags Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search keywords
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder="Type a keyword and press Enter"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Press Enter to add a keyword</span>
                        <span>{formData.tags.length} / 15</span>
                      </p>
                    </div>

                    {/* Suggested Keywords */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-700 uppercase">Suggestions</p>
                          {!keywordSearch.trim() && (
                            <p className="text-xs text-gray-500 mt-0.5">Showing popular keywords. Search for more...</p>
                          )}
                        </div>
                        <input
                          type="text"
                          value={keywordSearch}
                          onChange={(e) => setKeywordSearch(e.target.value)}
                          placeholder="Search keywords..."
                          className="text-xs px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3CAF54] focus:border-transparent w-40"
                        />
                      </div>
                      
                      {(() => {
                        // All available keywords
                        const allKeywords = [
                          // Activities & Experiences
                          'Adventure', 'Hiking', 'Trekking', 'Swimming', 'Snorkeling', 'Diving', 'Kayaking', 'Rafting', 'Cycling', 'Biking',
                          'Photography', 'Bird Watching', 'Safari', 'Game Drive', 'Fishing', 'Camping', 'Rock Climbing', 'Ziplining',
                          'Paragliding', 'Hot Air Balloon', 'Boat Tour', 'Cruise', 'Sailing', 'Surfing', 'Water Sports',
                          
                          // Themes & Interests
                          'Educational', 'History', 'Cultural', 'Heritage', 'Archaeology', 'Museums', 'Art', 'Architecture',
                          'Nature', 'Wildlife', 'Conservation', 'Ecology', 'Botanical', 'Geology', 'Astronomy',
                          'Food & Drink', 'Culinary', 'Wine Tasting', 'Local Cuisine', 'Street Food', 'Cooking Class',
                          'Music', 'Dance', 'Festivals', 'Nightlife', 'Entertainment', 'Theater', 'Performance',
                          
                          // Tour Types
                          'City Tour', 'Walking Tour', 'Bus Tour', 'Private Tour', 'Group Tour', 'Small Group',
                          'Day Trip', 'Multi-Day', 'Half Day', 'Full Day', 'Sunset Tour', 'Sunrise Tour',
                          'Night Tour', 'Morning Tour', 'Afternoon Tour',
                          
                          // Locations & Settings
                          'Mountain', 'Beach', 'Coastal', 'Island', 'Forest', 'Jungle', 'Desert', 'Valley',
                          'Waterfall', 'Lake', 'River', 'Ocean', 'Volcano', 'Cave', 'Canyon', 'National Park',
                          'Village', 'Rural', 'Urban', 'Downtown', 'Historic District', 'Market', 'Bazaar',
                          
                          // Experiences & Atmosphere
                          'Scenic', 'Relaxation', 'Wellness', 'Spa', 'Meditation', 'Yoga', 'Retreat',
                          'Romantic', 'Honeymoon', 'Family-Friendly', 'Kids', 'Senior-Friendly', 'Accessible',
                          'Luxury', 'Budget-Friendly', 'Backpacking', 'Eco-Tourism', 'Sustainable',
                          
                          // Guides & Services
                          'Local Guides', 'Expert Guide', 'English Speaking', 'Multi-Language', 'Professional',
                          'Skip the Line', 'VIP', 'All-Inclusive', 'Transportation Included', 'Meals Included',
                          'Hotel Pickup', 'Flexible Schedule', 'Instant Confirmation',
                          
                          // Special Interests
                          'Photography Tour', 'Instagram Worthy', 'Hidden Gems', 'Off the Beaten Path',
                          'Local Culture', 'Traditions', 'Customs', 'Religious', 'Spiritual', 'Pilgrimage',
                          'Shopping', 'Souvenirs', 'Handicrafts', 'Markets', 'Boutique',
                          
                          // Outdoor Recreation
                          'Outdoor Recreation', 'Fresh Air', 'Exercise', 'Fitness', 'Active', 'Strenuous',
                          'Easy', 'Moderate', 'Challenging', 'Beginner Friendly', 'Advanced',
                          
                          // Seasonal & Weather
                          'Summer', 'Winter', 'Spring', 'Fall', 'Rainy Season', 'Dry Season',
                          'Indoor', 'Weather Dependent', 'All Weather'
                        ];

                        // Popular keywords to show initially
                        const popularKeywords = [
                          'Adventure', 'History', 'Nature', 'Cultural', 'Wildlife', 'Photography',
                          'City Tour', 'Beach', 'Mountain', 'Food & Drink', 'Local Guides', 'Family-Friendly'
                        ];

                        // Filter keywords based on search
                        const filteredKeywords = keywordSearch.trim() 
                          ? allKeywords.filter(keyword => 
                              keyword.toLowerCase().includes(keywordSearch.toLowerCase())
                            )
                          : popularKeywords;

                        // Remove already selected keywords
                        const availableKeywords = filteredKeywords.filter(
                          keyword => !formData.tags.includes(keyword)
                        );

                        return (
                      <div className="flex flex-wrap gap-2">
                            {availableKeywords.length > 0 ? (
                              availableKeywords.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              if (!formData.tags.includes(suggestion) && formData.tags.length < 15) {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: [...prev.tags, suggestion]
                                }));
                                      setKeywordSearch(''); // Clear search after selection
                              }
                            }}
                            disabled={formData.tags.includes(suggestion) || formData.tags.length >= 15}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              formData.tags.includes(suggestion)
                                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {suggestion}
                          </button>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                {keywordSearch.trim() 
                                  ? `No keywords found matching "${keywordSearch}"`
                                  : 'All popular keywords have been selected'}
                              </p>
                            )}
                      </div>
                        );
                      })()}
                    </div>

                    {/* Selected Tags */}
                    {formData.tags.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Selected Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Navigation Buttons for Sub-steps */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/tours/dashboard/packages')}
                    className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                  >
                    Save and exit
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <span>{currentSubStep === 4 ? 'Continue' : 'Next'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Inclusions - Sub-steps */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              {/* Substep 1: What's included & What's not included */}
              {currentSubStep === 1 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Inclusions & exclusions
                      </h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Customizable</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* What's included */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          What's included? <span className="text-red-500">*</span>
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        List everything that's included in the price. Start a new line for each one. Ensure it's consistent with your descriptions and highlights.
                      </p>
                      <textarea
                        name="whatsIncluded"
                        value={formData.whatsIncluded}
                        onChange={handleChange}
                        placeholder="Professional tour guide with local insights&#10;Transportation between major sites (if applicable)&#10;Entrance fees to selected landmarks and attractions"
                        rows="8"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                        maxLength={1000}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.whatsIncluded.length} / 1000
                      </p>
                    </div>

                    {/* What's not included */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          What's not included? (optional)
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Name any optional fees or charges that customers may encounter during the activity. This allows customers to know what to expect.
                      </p>
                      <textarea
                        name="whatsNotIncluded"
                        value={formData.whatsNotIncluded}
                        onChange={handleChange}
                        placeholder="Personal expenses such as souvenirs or gifts&#10;Optional activities not listed in the itinerary&#10;Gratuities for guides or drivers"
                        rows="8"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                        maxLength={1000}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.whatsNotIncluded.length} / 1000
                      </p>
                    </div>

                    {/* Information box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Any obligatory fees must be included in the price of the tour and are not allowed to be paid in person, so shouldn't be added here.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Substep 2: Guide information */}
              {currentSubStep === 2 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Who will guide the customers?
                      </h2>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="guideType"
                          value="self-guided"
                          checked={formData.guideType === 'self-guided'}
                          onChange={(e) => setFormData(prev => ({ ...prev, guideType: e.target.value }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Self-Guided</div>
                          <div className="text-sm text-gray-600">The activity does not include a guide or similar; travellers will navigate the activity or attraction independently.</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="guideType"
                          value="tour-guide"
                          checked={formData.guideType === 'tour-guide'}
                          onChange={(e) => setFormData(prev => ({ ...prev, guideType: e.target.value }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Tour guide</div>
                          <div className="text-sm text-gray-600">Leads a group of customers through a tour and explains things about the destination or attraction.</div>
                          {formData.guideType === 'tour-guide' && (
                            <button
                              type="button"
                              className="mt-2 px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                              Customizable language
                            </button>
                          )}
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="guideType"
                          value="host-greeter"
                          checked={formData.guideType === 'host-greeter'}
                          onChange={(e) => setFormData(prev => ({ ...prev, guideType: e.target.value }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Host or greeter</div>
                          <div className="text-sm text-gray-600">Provides an introduction, purchases a ticket, or waits in line with customers, but doesn't provide a full tour of the attraction.</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="guideType"
                          value="instructor"
                          checked={formData.guideType === 'instructor'}
                          onChange={(e) => setFormData(prev => ({ ...prev, guideType: e.target.value }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Instructor</div>
                          <div className="text-sm text-gray-600">Shows customers how to use equipment or teaches them how to do something.</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="guideType"
                          value="driver"
                          checked={formData.guideType === 'driver'}
                          onChange={(e) => setFormData(prev => ({ ...prev, guideType: e.target.value }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Driver</div>
                          <div className="text-sm text-gray-600">Drives the customer somewhere but doesn't explain anything along the way.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Substep 3: Food & drinks */}
              {currentSubStep === 3 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Food & drinks
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Is food included? */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Is food included in your activity?
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="foodIncluded"
                            checked={!formData.foodIncluded}
                            onChange={() => setFormData(prev => ({ ...prev, foodIncluded: false }))}
                          />
                          <span className="text-gray-700">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="foodIncluded"
                            checked={formData.foodIncluded}
                            onChange={() => setFormData(prev => ({ ...prev, foodIncluded: true }))}
                          />
                          <span className="text-gray-700">Yes</span>
                        </label>
                      </div>
                    </div>

                    {/* Drinks included */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.drinksIncluded}
                          onChange={(e) => setFormData(prev => ({ ...prev, drinksIncluded: e.target.checked }))}
                          className="w-5 h-5"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Drinks are included
                        </label>
                      </div>

                    {/* Dietary restrictions */}
                      <div className="space-y-4 border-t pt-6">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Show dietary restrictions ({formData.dietaryRestrictions.length})
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.showDietaryRestrictions}
                              onChange={(e) => setFormData(prev => ({ ...prev, showDietaryRestrictions: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3CAF54]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3CAF54]"></div>
                          </label>
                        </div>

                        {formData.showDietaryRestrictions && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Which dietary restrictions can you accommodate?
                            </label>
                            <p className="text-xs text-gray-600 mb-3">
                              Please select all that are relevant
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                'Diabetic',
                                'Gluten-free',
                                'Keto',
                                'Lactose-free',
                                'Nut-free',
                                'Seafood/fish-free',
                                'Vegetarian',
                                'Egg-free',
                                'Halal',
                                'Kosher',
                                'Low-carb',
                                'Pescatarian',
                                'Vegan'
                              ].map((restriction) => (
                                <label key={restriction} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.dietaryRestrictions.includes(restriction)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData(prev => ({
                                          ...prev,
                                          dietaryRestrictions: [...prev.dietaryRestrictions, restriction]
                                        }));
                                      } else {
                                        setFormData(prev => ({
                                          ...prev,
                                          dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction)
                                        }));
                                      }
                                    }}
                                    className="w-4 h-4 text-[#3CAF54] border-gray-300 rounded focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">{restriction}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </>
              )}

              {/* Substep 4: Transportation */}
              {currentSubStep === 4 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Transportation
                      </h2>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Is transportation used during this activity?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Provide the main transportation type(s) that customers use during the experience, like a Segway or bike. Transportation used for pickup and drop-off will be added later.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transportationUsed"
                          checked={!formData.transportationUsed}
                          onChange={() => setFormData(prev => ({ ...prev, transportationUsed: false, transportationTypes: [] }))}
                        />
                        <span className="text-gray-700">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transportationUsed"
                          checked={formData.transportationUsed}
                          onChange={() => setFormData(prev => ({ ...prev, transportationUsed: true }))}
                        />
                        <span className="text-gray-700">Yes</span>
                      </label>
                    </div>

                    {formData.transportationUsed && (
                      <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search for items
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                              value={transportationSearch}
                              onChange={(e) => setTransportationSearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && transportationSearch.trim()) {
                                  e.preventDefault();
                                  const trimmed = transportationSearch.trim();
                                  if (!formData.transportationTypes.includes(trimmed)) {
                                    setFormData(prev => ({
                                      ...prev,
                                      transportationTypes: [...prev.transportationTypes, trimmed]
                                    }));
                                    setTransportationSearch('');
                                  }
                                }
                              }}
                              placeholder="Search for transportation types or type and press Enter"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                          />
                        </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Press Enter to add a custom transportation type
                          </p>
                        </div>

                        {/* Transportation Type Suggestions */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase">Suggestions</p>
                            {!transportationSearch.trim() && (
                              <p className="text-xs text-gray-500">Showing popular types. Search for more...</p>
                            )}
                          </div>
                          {(() => {
                            // All available transportation types
                            const allTransportationTypes = [
                              // Land Transportation
                              'Walking', 'Hiking', 'Trekking', 'Running', 'Jogging',
                              'Bicycle', 'Bike', 'Mountain Bike', 'E-bike', 'Electric Bike',
                              'Scooter', 'E-scooter', 'Electric Scooter', 'Segway',
                              'Car', 'SUV', 'Van', 'Minivan', 'Bus', 'Coach', 'Shuttle',
                              'Motorcycle', 'Scooter (Motorcycle)', 'Tuk-tuk', 'Rickshaw',
                              'Taxi', 'Ride Share', 'Private Vehicle', 'Luxury Car',
                              
                              // Water Transportation
                              'Boat', 'Speedboat', 'Yacht', 'Sailboat', 'Catamaran',
                              'Ferry', 'Cruise Ship', 'Canoe', 'Kayak', 'Paddle Boat',
                              'Jet Ski', 'Water Taxi', 'Dhow', 'Traditional Boat',
                              
                              // Air Transportation
                              'Helicopter', 'Hot Air Balloon', 'Airplane', 'Small Aircraft',
                              
                              // Public Transportation
                              'Metro', 'Subway', 'Train', 'Railway', 'Tram', 'Trolley',
                              'Cable Car', 'Funicular', 'Gondola', 'Chairlift',
                              
                              // Special/Unique
                              'Horseback', 'Horse', 'Camel', 'Elephant', 'Donkey',
                              'ATV', 'Quad Bike', 'Dune Buggy', 'Jeep', '4x4',
                              'Tractor', 'Trolley', 'Cart', 'Wagon'
                            ];

                            // Popular transportation types to show initially
                            const popularTransportationTypes = [
                              'Walking', 'Bicycle', 'Car', 'Bus', 'Boat', 'Train',
                              'Motorcycle', 'Scooter', 'Taxi', 'Helicopter'
                            ];

                            // Filter transportation types based on search
                            const filteredTypes = transportationSearch.trim()
                              ? allTransportationTypes.filter(type =>
                                  type.toLowerCase().includes(transportationSearch.toLowerCase())
                                )
                              : popularTransportationTypes;

                            // Remove already selected types
                            const availableTypes = filteredTypes.filter(
                              type => !formData.transportationTypes.includes(type)
                            );

                            return (
                              <div className="flex flex-wrap gap-2">
                                {availableTypes.length > 0 ? (
                                  availableTypes.map((type) => (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() => {
                                        if (!formData.transportationTypes.includes(type)) {
                                          setFormData(prev => ({
                                            ...prev,
                                            transportationTypes: [...prev.transportationTypes, type]
                                          }));
                                          setTransportationSearch('');
                                        }
                                      }}
                                      className="px-3 py-1 rounded-full text-sm border transition-colors bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      {type}
                                    </button>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 italic">
                                    {transportationSearch.trim()
                                      ? `No transportation types found matching "${transportationSearch}"`
                                      : 'All popular types have been selected'}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Selected Transportation Types */}
                        {formData.transportationTypes.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Selected Transportation Types</p>
                            <div className="flex flex-wrap gap-2">
                            {formData.transportationTypes.map((type, index) => (
                              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                                <span>{type}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    transportationTypes: prev.transportationTypes.filter((_, i) => i !== index)
                                  }))}
                                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Do customers travel to a different city/town during the activity?
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="travelToDifferentCity"
                            checked={formData.travelToDifferentCity}
                            onChange={() => setFormData(prev => ({ ...prev, travelToDifferentCity: true }))}
                          />
                          <span className="text-gray-700">Yes</span>
                          <span className="text-xs text-gray-500 ml-2">Example: going from Paris to Versailles</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="travelToDifferentCity"
                            checked={!formData.travelToDifferentCity}
                            onChange={() => setFormData(prev => ({ ...prev, travelToDifferentCity: false }))}
                          />
                          <span className="text-gray-700">No</span>
                          <span className="text-xs text-gray-500 ml-2">Example: going from one part of Paris to another part of Paris</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/tours/dashboard/packages')}
                    className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                  >
                    Save and exit
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <span>{currentSubStep === 4 ? 'Continue' : 'Next'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Extra Information */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Extra information
                </h2>
                <p className="text-sm text-gray-600">
                  Provide additional details that will help customers prepare for their experience.
                </p>
              </div>

              <div className="space-y-6">
                {/* Not suitable for */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who is this activity not suitable for? (optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Add the types of travelers who should not join this activity, like under 18s or pregnant women.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={notSuitableSearch}
                      onChange={(e) => {
                        setNotSuitableSearch(e.target.value);
                        setShowNotSuitableDropdown(true);
                      }}
                      onFocus={() => setShowNotSuitableDropdown(true)}
                      placeholder="Search for restrictions"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                    />
                    {showNotSuitableDropdown && (
                      <div 
                        ref={notSuitableDropdownRef}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {NOT_SUITABLE_OPTIONS
                          .filter(option => 
                            option.toLowerCase().includes(notSuitableSearch.toLowerCase()) &&
                            !formData.notSuitableFor.includes(option)
                          )
                          .map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  notSuitableFor: [...prev.notSuitableFor, option]
                                }));
                                setNotSuitableSearch('');
                                setShowNotSuitableDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        {NOT_SUITABLE_OPTIONS
                          .filter(option => 
                            option.toLowerCase().includes(notSuitableSearch.toLowerCase()) &&
                            !formData.notSuitableFor.includes(option)
                          ).length === 0 && notSuitableSearch && (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No results found
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {formData.notSuitableFor.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.notSuitableFor.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              notSuitableFor: prev.notSuitableFor.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Not allowed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's not allowed? (optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    List any object, clothing, or action that's not allowed on your activity.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={notAllowedSearch}
                      onChange={(e) => {
                        setNotAllowedSearch(e.target.value);
                        setShowNotAllowedDropdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && notAllowedSearch.trim()) {
                          e.preventDefault();
                          const trimmed = notAllowedSearch.trim();
                          if (!formData.notAllowed.includes(trimmed)) {
                            setFormData(prev => ({
                              ...prev,
                              notAllowed: [...prev.notAllowed, trimmed]
                            }));
                            setNotAllowedSearch('');
                            setShowNotAllowedDropdown(false);
                          }
                        }
                      }}
                      onFocus={() => setShowNotAllowedDropdown(true)}
                      placeholder="Search for restrictions or type and press Enter"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                    />
                    {showNotAllowedDropdown && (
                      <div 
                        ref={notAllowedDropdownRef}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {NOT_ALLOWED_OPTIONS
                          .filter(option => 
                            option.toLowerCase().includes(notAllowedSearch.toLowerCase()) &&
                            !formData.notAllowed.includes(option)
                          )
                          .map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  notAllowed: [...prev.notAllowed, option]
                                }));
                                setNotAllowedSearch('');
                                setShowNotAllowedDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        {NOT_ALLOWED_OPTIONS
                          .filter(option => 
                            option.toLowerCase().includes(notAllowedSearch.toLowerCase()) &&
                            !formData.notAllowed.includes(option)
                          ).length === 0 && notAllowedSearch && (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No results found. Press Enter to add "{notAllowedSearch}"
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {formData.notAllowed.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.notAllowed.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              notAllowed: prev.notAllowed.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pet policy */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.petPolicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, petPolicy: e.target.checked }))}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Pet-friendly
                    </label>
                  </div>
                  {formData.petPolicy && (
                    <textarea
                      name="petPolicyDetails"
                      value={formData.petPolicyDetails}
                      onChange={handleChange}
                      placeholder="Add any additional information about certain pet policies..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y mt-2"
                      maxLength={1000}
                    ></textarea>
                  )}
                </div>

                {/* Mandatory items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What mandatory items must the customer bring with them? (optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Such as a towel for a boat tour, or comfortable shoes for a hike.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={mandatoryItemsSearch}
                      onChange={(e) => {
                        setMandatoryItemsSearch(e.target.value);
                        setShowMandatoryItemsDropdown(true);
                      }}
                      onFocus={() => setShowMandatoryItemsDropdown(true)}
                      placeholder="Search for items"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                    />
                    {showMandatoryItemsDropdown && (
                      <div 
                        ref={mandatoryItemsDropdownRef}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {MANDATORY_ITEMS_OPTIONS
                          .filter(option => 
                            option.toLowerCase().includes(mandatoryItemsSearch.toLowerCase()) &&
                            !formData.mandatoryItems.includes(option)
                          )
                          .map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  mandatoryItems: [...prev.mandatoryItems, option]
                                }));
                                setMandatoryItemsSearch('');
                                setShowMandatoryItemsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        {MANDATORY_ITEMS_OPTIONS
                          .filter(option => 
                            option.toLowerCase().includes(mandatoryItemsSearch.toLowerCase()) &&
                            !formData.mandatoryItems.includes(option)
                          ).length === 0 && mandatoryItemsSearch && (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No results found
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {formData.mandatoryItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.mandatoryItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              mandatoryItems: prev.mandatoryItems.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Know before you go */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Know before you go (optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Add anything else that customers should know before making a booking.
                  </p>
                  <textarea
                    name="knowBeforeYouGo"
                    value={formData.knowBeforeYouGo}
                    onChange={handleChange}
                    placeholder="Please insert your text in English"
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                    maxLength={1000}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.knowBeforeYouGo.length} / 1000
                  </p>
                </div>

                {/* Emergency contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How can customers contact you in case of an emergency? (optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    This information appears on the voucher.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative w-32">
                      <select
                        name="emergencyCountryCode"
                        value={formData.emergencyCountryCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 appearance-none"
                      >
                        {countryCodes.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.code}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                      maxLength={35}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.emergencyPhone.length} / 35
                  </p>
                </div>

                {/* Voucher information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What information needs to appear on the voucher? (optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Provide any other logistical information that hasn't been covered elsewhere.
                  </p>
                  <textarea
                    name="voucherInformation"
                    value={formData.voucherInformation}
                    onChange={handleChange}
                    placeholder="Please insert your text in English"
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                    maxLength={1000}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.voucherInformation.length} / 1000
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/tours/dashboard/packages')}
                    className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                  >
                    Save and exit
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Add photos to your product
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Images help customers visualize joining your activity.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Minimum:</span> {MIN_PHOTOS} photos required
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Maximum:</span> {MAX_PHOTOS} photos allowed
                  </span>
                </div>
                {formData.photos.length > 0 && (
                  <div className="mt-2">
                    <p className={`text-sm font-medium ${formData.photos.length < MIN_PHOTOS ? 'text-orange-600' : formData.photos.length >= MAX_PHOTOS ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.photos.length} / {MAX_PHOTOS} photos uploaded
                      {formData.photos.length < MIN_PHOTOS && ` (${MIN_PHOTOS - formData.photos.length} more needed for minimum)`}
                      {formData.photos.length >= MAX_PHOTOS && ' (Maximum reached)'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className={`border-2 border-dashed rounded-lg p-12 text-center ${
                  formData.photos.length >= MAX_PHOTOS 
                    ? 'border-gray-200 bg-gray-50 opacity-60' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={formData.photos.length >= MAX_PHOTOS}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      setPhotoUploadError('');
                      
                      if (files.length === 0) {
                        e.target.value = ''; // Reset input
                        return;
                      }
                      
                      // Check if adding these files would exceed maximum
                      const currentPhotoCount = formData.photos.length;
                      if (currentPhotoCount + files.length > MAX_PHOTOS) {
                        setPhotoUploadError(
                          `Maximum ${MAX_PHOTOS} photos allowed. You have ${currentPhotoCount} photo(s) and tried to add ${files.length} more. Please remove some photos first.`
                        );
                        e.target.value = ''; // Reset input
                        return;
                      }
                      
                      // Validate each file - only check if it's an image
                      const validFiles = [];
                      const errors = [];
                      
                      for (const file of files) {
                        // Basic check: ensure it's an image file
                        if (!file.type.startsWith('image/')) {
                          errors.push(`${file.name}: not a valid image file`);
                          continue;
                        }
                        
                        validFiles.push(file);
                      }
                      
                      // Update form data with valid files
                      if (validFiles.length > 0) {
                        setFormData(prev => ({
                          ...prev,
                          photos: [...prev.photos, ...validFiles]
                        }));
                      }
                      
                      // Show errors if any
                      if (errors.length > 0) {
                        setPhotoUploadError(errors.join('. '));
                      }
                      
                      // Reset input
                      e.target.value = '';
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`flex flex-col items-center gap-4 ${
                      formData.photos.length >= MAX_PHOTOS 
                        ? 'cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      formData.photos.length >= MAX_PHOTOS 
                        ? 'bg-gray-200' 
                        : 'bg-gray-100'
                    }`}>
                      <Plus className={`h-8 w-8 ${
                        formData.photos.length >= MAX_PHOTOS 
                          ? 'text-gray-300' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      {formData.photos.length >= MAX_PHOTOS ? (
                        <>
                          <p className="text-sm font-medium text-gray-500">Maximum photos reached</p>
                          <p className="text-xs text-gray-400 mt-1">Remove photos to upload more</p>
                        </>
                      ) : (
                        <>
                      <p className="text-sm font-medium text-gray-700">Drag photos here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to upload</p>
                        </>
                      )}
                    </div>
                    {formData.photos.length < MAX_PHOTOS && (
                    <p className="text-xs text-gray-500">
                        JPG, PNG, or GIF format.
                    </p>
                    )}
                  </label>
                </div>
                
                {/* Error message display */}
                {photoUploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Upload Error</p>
                        <p className="text-sm text-red-700 mt-1">{photoUploadError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoUploadError('')}
                        className="flex-shrink-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => {
                      // Get photo URL - handle File objects, string URLs, or photo objects
                      let photoUrl = null;
                      if (photo instanceof File) {
                        photoUrl = URL.createObjectURL(photo);
                      } else if (typeof photo === 'string') {
                        photoUrl = photo;
                      } else if (photo && typeof photo === 'object') {
                        photoUrl = photo.photo_url || photo.image_url || photo.url || photo.imageUrl;
                      }
                      
                      // Build proper URL for relative paths (but not for blob URLs from File objects)
                      if (photoUrl && !photoUrl.startsWith('blob:')) {
                        photoUrl = buildImageUrl(photoUrl);
                      }
                      
                      return (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('[Tours] Failed to load image:', photoUrl);
                                // Use a data URI instead of external placeholder to avoid network issues
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                                e.target.onerror = null; // Prevent infinite loop
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>No image</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              // Clean up object URL if it's a File
                              if (photo instanceof File && photoUrl) {
                                URL.revokeObjectURL(photoUrl);
                              }
                              setFormData(prev => ({
                                ...prev,
                                photos: prev.photos.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <p className="text-xs text-gray-600">
                    I confirm that I own the copyright for these pictures and have obtained model release forms for any recognizable faces depicted.
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/tours/dashboard/packages')}
                    className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                  >
                    Save and exit
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Options - Sub-steps */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              {/* Substep 1: Option setup */}
              {currentSubStep === 1 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Option setup
                      </h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Customizable</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Option reference code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option reference code (optional)
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        Provide a reference code to help you keep track of which option the customer has booked. This is for your own records and won't be seen by the customer.
                      </p>
                      <input
                        type="text"
                        name="optionReferenceCode"
                        value={formData.optionReferenceCode}
                        onChange={handleChange}
                        placeholder="e.g., default"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                        maxLength={20}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.optionReferenceCode.length} / 20
                      </p>
                    </div>

                    {/* Maximum group size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum group size
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        What's the maximum total of people in your activity for each time slot? This includes those who don't book on GetYourGuide.
                      </p>
                      <select
                        name="maxGroupSize"
                        value={formData.maxGroupSize}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                      >
                        <option value="">Select maximum group size</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 100].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Languages */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          What languages is the activity offered in?
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        List all available languages to attract more customers.
                      </p>
                      <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && languageSearch.trim()) {
                              e.preventDefault();
                              const lang = languageSearch.trim();
                                if (!formData.languages.includes(lang)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    languages: [...prev.languages, lang]
                                  }));
                              setLanguageSearch('');
                                }
                            }
                          }}
                          placeholder="Search for language or type and press Enter"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                        />
                      </div>

                        {/* Language Suggestions */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase">Suggestions</p>
                            {!languageSearch.trim() && (
                              <p className="text-xs text-gray-500">Showing popular languages. Search for more...</p>
                            )}
                          </div>
                          {(() => {
                            // Popular languages to show initially
                            const popularLanguages = [
                              'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
                              'Chinese (Mandarin)', 'Japanese', 'Arabic', 'Hindi', 'Russian', 'Dutch'
                            ];

                            // Filter languages based on search
                            const filteredLanguages = languageSearch.trim()
                              ? LANGUAGE_OPTIONS.filter(lang =>
                                  lang.toLowerCase().includes(languageSearch.toLowerCase())
                                )
                              : popularLanguages;

                            // Remove already selected languages
                            const availableLanguages = filteredLanguages.filter(
                              lang => !formData.languages.includes(lang)
                            );

                            return (
                              <div className="flex flex-wrap gap-2">
                                {availableLanguages.length > 0 ? (
                                  availableLanguages.map((lang) => (
                                    <button
                                      key={lang}
                                      type="button"
                                      onClick={() => {
                                        if (!formData.languages.includes(lang)) {
                                          setFormData(prev => ({
                                            ...prev,
                                            languages: [...prev.languages, lang]
                                          }));
                                          setLanguageSearch('');
                                        }
                                      }}
                                      className="px-3 py-1 rounded-full text-sm border transition-colors bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      {lang}
                                    </button>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 italic">
                                    {languageSearch.trim()
                                      ? `No languages found matching "${languageSearch}"`
                                      : 'All popular languages have been selected'}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Selected Languages */}
                      {formData.languages.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Selected Languages</p>
                            <div className="flex flex-wrap gap-2">
                          {formData.languages.map((lang, index) => (
                            <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                              <span>{lang}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  languages: prev.languages.filter((_, i) => i !== index)
                                }))}
                                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))}
                            </div>
                        </div>
                      )}
                    </div>
                    </div>

                    {/* Private activity */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Is this a private activity?
                        </label>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        This means that only one group or person can participate. There won't be other customers in the same activity.
                      </p>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isPrivateActivity"
                            checked={!formData.isPrivateActivity}
                            onChange={() => setFormData(prev => ({ ...prev, isPrivateActivity: false }))}
                          />
                          <span className="text-gray-700">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isPrivateActivity"
                            checked={formData.isPrivateActivity}
                            onChange={() => setFormData(prev => ({ ...prev, isPrivateActivity: true }))}
                          />
                          <span className="text-gray-700">Yes</span>
                        </label>
                      </div>
                    </div>


                    {/* Wheelchair accessible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Is the activity wheelchair accessible?
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="wheelchairAccessible"
                            checked={!formData.wheelchairAccessible}
                            onChange={() => setFormData(prev => ({ ...prev, wheelchairAccessible: false }))}
                          />
                          <span className="text-gray-700">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="wheelchairAccessible"
                            checked={formData.wheelchairAccessible}
                            onChange={() => setFormData(prev => ({ ...prev, wheelchairAccessible: true }))}
                          />
                          <span className="text-gray-700">Yes</span>
                        </label>
                      </div>
                    </div>

                    {/* Duration or validity */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Duration or validity
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Customizable</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-4">
                        Some activities start and stop at specific times, like a tour. Others allow customers to use their ticket anytime within a certain amount of time, like a 2-day city pass.
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="durationType"
                            value="duration"
                            checked={formData.durationType === 'duration'}
                            onChange={(e) => setFormData(prev => ({ ...prev, durationType: e.target.value }))}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">It lasts for a specific amount of time (duration)</div>
                            <div className="text-sm text-gray-600 mt-1">Includes transfer time. Example: 3-hour guided tour</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="durationType"
                            value="validity"
                            checked={formData.durationType === 'validity'}
                            onChange={(e) => setFormData(prev => ({ ...prev, durationType: e.target.value }))}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Customers can use their ticket anytime during a certain period (validity)</div>
                            <div className="text-sm text-gray-600 mt-1">Example: museum tickets that can be used anytime during opening hours</div>
                          </div>
                        </label>
                      </div>
                      {formData.durationType && (
                        <div className="mt-4">
                          <select
                            name="durationValue"
                            value={formData.durationValue}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                          >
                            <option value="">Choose one...</option>
                            {formData.durationType === 'duration' ? (
                              <>
                                <option value="1-hour">1 hour</option>
                                <option value="2-hours">2 hours</option>
                                <option value="3-hours">3 hours</option>
                                <option value="4-hours">4 hours</option>
                                <option value="half-day">Half day (4-6 hours)</option>
                                <option value="full-day">Full day (6-8 hours)</option>
                                <option value="multi-day">Multi-day</option>
                              </>
                            ) : (
                              <>
                                <option value="1-day">1 day</option>
                                <option value="2-days">2 days</option>
                                <option value="3-days">3 days</option>
                                <option value="7-days">7 days</option>
                                <option value="14-days">14 days</option>
                                <option value="30-days">30 days</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => navigate('/tours/dashboard/packages')}
                        className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                      >
                        Save and exit
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Substep 2: Meeting point or pickup */}
              {currentSubStep === 2 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Meeting point or pickup
                      </h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Customizable</span>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* How do customers get to the activity? */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How do customers get to the activity?
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="customerArrivalType"
                            value="self"
                            checked={formData.customerArrivalType === 'self'}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerArrivalType: e.target.value }))}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">They go to the starting point of the activity by themselves</div>
                            <div className="text-sm text-gray-600 mt-1">(e.g. meeting point, entrance)</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="customerArrivalType"
                            value="pickup"
                            checked={formData.customerArrivalType === 'pickup'}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerArrivalType: e.target.value }))}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">They get picked up</div>
                            <div className="text-sm text-gray-600 mt-1">(by bus, car, etc.)</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Pickup service - only show if pickup is selected */}
                    {formData.customerArrivalType === 'pickup' && (
                      <div className="space-y-6 border-t pt-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Where will you pick up your customers?
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pickupType"
                                value="any-address"
                                checked={formData.pickupType === 'any-address'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupType: e.target.value }))}
                              />
                              <span className="text-gray-700">From any address within a specific area</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pickupType"
                                value="defined-locations"
                                checked={formData.pickupType === 'defined-locations'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupType: e.target.value }))}
                              />
                              <span className="text-gray-700">From a defined list of pickup locations (hotels, airports, etc.)</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            When do you pick up your customers?
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="pickupTiming"
                                value="same-time"
                                checked={formData.pickupTiming === 'same-time'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupTiming: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">At the activity start time</div>
                                <div className="text-sm text-gray-600 mt-1">Pickup and activity are at the same time</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="pickupTiming"
                                value="before-activity"
                                checked={formData.pickupTiming === 'before-activity'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupTiming: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Before the activity starts</div>
                                <div className="text-sm text-gray-600 mt-1">Example: pickup is at 8:00 AM, activity starts at 9:00 AM</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            When can the customer expect your final pickup confirmation?
                          </label>
                          <p className="text-xs text-gray-600 mb-3">
                            We'll inform the customer about your suggested pickup details but you're responsible to confirm the exact pickup details to each customer individually.
                          </p>
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pickupConfirmation"
                                value="day-before"
                                checked={formData.pickupConfirmation === 'day-before'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupConfirmation: e.target.value }))}
                              />
                              <span className="text-gray-700">The day before the activity takes place</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pickupConfirmation"
                                value="after-selection"
                                checked={formData.pickupConfirmation === 'after-selection'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupConfirmation: e.target.value }))}
                              />
                              <span className="text-gray-700">Directly after customer selects pickup location</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            When do you usually pick up your customers?
                          </label>
                          <p className="text-xs text-gray-600 mb-2">
                            Note that you'll still need to communicate the exact pickup time for every booking.
                          </p>
                          <select
                            name="pickupTime"
                            value={formData.pickupTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                          >
                            <option value="">Choose one...</option>
                            <option value="morning">Morning (6:00 AM - 12:00 PM)</option>
                            <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
                            <option value="evening">Evening (6:00 PM - 12:00 AM)</option>
                            <option value="night">Night (12:00 AM - 6:00 AM)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Describe your pickup (optional)
                          </label>
                          <p className="text-xs text-gray-600 mb-2">
                            What should customers look for when waiting for their vehicle? Where should they wait? If your pickup areas/places are very specific, describe them in more detail.
                          </p>
                          <textarea
                            name="pickupDescription"
                            value={formData.pickupDescription}
                            onChange={handleChange}
                            placeholder="Please insert your text in English"
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent resize-y"
                            maxLength={1000}
                          ></textarea>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {formData.pickupDescription.length} / 1000
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Drop-off */}
                    {formData.customerArrivalType === 'pickup' && (
                      <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Where will you drop off the customer at the end of the activity?
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="dropOffType"
                              value="same-place"
                              checked={formData.dropOffType === 'same-place'}
                              onChange={(e) => setFormData(prev => ({ ...prev, dropOffType: e.target.value }))}
                            />
                            <span className="text-gray-700">At the same place you picked them up</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="dropOffType"
                              value="different-place"
                              checked={formData.dropOffType === 'different-place'}
                              onChange={(e) => setFormData(prev => ({ ...prev, dropOffType: e.target.value }))}
                            />
                            <span className="text-gray-700">At a different place</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="dropOffType"
                              value="no-dropoff"
                              checked={formData.dropOffType === 'no-dropoff'}
                              onChange={(e) => setFormData(prev => ({ ...prev, dropOffType: e.target.value }))}
                            />
                            <span className="text-gray-700">No drop-off service, the customer stays at the site or destination</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Transportation for pickup/drop-off */}
                    {formData.customerArrivalType === 'pickup' && (
                      <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What's the transportation used for pickup and drop-off?
                        </label>
                        <select
                          name="pickupTransportation"
                          value={formData.pickupTransportation}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                        >
                          <option value="">Select a transportation type</option>
                          <option value="car">Car</option>
                          <option value="van">Van</option>
                          <option value="bus">Bus</option>
                          <option value="minibus">Minibus</option>
                          <option value="motorcycle">Motorcycle</option>
                          <option value="boat">Boat</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => navigate('/tours/dashboard/packages')}
                        className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                      >
                        Save and exit
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Substep 3: Availability & Pricing with tabs */}
              {currentSubStep === 3 && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Availability & Pricing
                      </h2>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-600">
                      This will apply to all the schedules added to this option.
                    </p>
                  </div>

                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200 mb-6">
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {[
                        { id: 1, label: '1 Schedule', name: 'Schedule' },
                        { id: 2, label: '2 Pricing Categories', name: 'Pricing Categories' },
                        { id: 3, label: '3 Capacity', name: 'Capacity' },
                        { id: 4, label: '4 Price', name: 'Price' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAvailabilitySubStep(tab.id)}
                          className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            availabilitySubStep === tab.id
                              ? 'border-[#3CAF54] text-[#3CAF54]'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {availabilitySubStep < tab.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                {tab.id}
                              </span>
                              {tab.name}
                            </span>
                          ) : availabilitySubStep === tab.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#3CAF54] text-white flex items-center justify-center text-xs font-semibold">
                                {tab.id}
                              </span>
                              {tab.name}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#3CAF54] text-white flex items-center justify-center text-xs">
                                ✓
                              </span>
                              {tab.name}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[400px]">
                    {/* Tab 1: Schedule */}
                    {availabilitySubStep === 1 && (
                      <div className="space-y-6">
                        {/* How do you set your availability? */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            How do you set your availability?
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="availabilityType"
                                value="time-slots"
                                checked={formData.availabilityType === 'time-slots'}
                                onChange={(e) => setFormData(prev => ({ ...prev, availabilityType: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Time slots</div>
                                <div className="text-sm text-gray-600 mt-1">Example: walking tour starting at 9:00 AM, 11:00 AM, and 2:00 PM</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="availabilityType"
                                value="opening-hours"
                                checked={formData.availabilityType === 'opening-hours'}
                                onChange={(e) => setFormData(prev => ({ ...prev, availabilityType: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Opening hours</div>
                                <div className="text-sm text-gray-600 mt-1">Example: museum open from Mon to Sat, between 9:00 AM and 7:00 PM</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* How do you set your prices? */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            How do you set your prices?
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="pricingType"
                                value="per-person"
                                checked={formData.pricingType === 'per-person'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pricingType: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Price per person</div>
                                <div className="text-sm text-gray-600 mt-1">Set different prices for adults, youth, child, etc.</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="pricingType"
                                value="per-group"
                                checked={formData.pricingType === 'per-group'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pricingType: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Price per group/vehicle</div>
                                <div className="text-sm text-gray-600 mt-1">Set different prices based on group size, vehicle type, etc.</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Name your schedule */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name your schedule
                          </label>
                          <input
                            type="text"
                            name="scheduleName"
                            value={formData.scheduleName}
                            onChange={handleChange}
                            placeholder="E.g. Summer, Weekends price..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                          />
                        </div>

                        {/* Starting date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            What's the starting date of your activity?
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="date"
                              name="scheduleStartDate"
                              value={formData.scheduleStartDate}
                              onChange={handleChange}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                            />
                            {formData.scheduleHasEndDate && (
                              <>
                                <span className="text-gray-500">to</span>
                                <input
                                  type="date"
                                  name="scheduleEndDate"
                                  value={formData.scheduleEndDate}
                                  onChange={handleChange}
                                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                                />
                              </>
                            )}
                          </div>
                          <div className="mt-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.scheduleHasEndDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduleHasEndDate: e.target.checked, scheduleEndDate: e.target.checked ? prev.scheduleEndDate : '' }))}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">My activity has an end date</span>
                            </label>
                            {formData.scheduleHasEndDate && (
                              <p className="text-xs text-gray-500 mt-2">
                                If applicable, it is better to have no end date to avoid your product going offline.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Standard Weekly Schedule */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Standard weekly schedule
                            </label>
                            {(formData.weeklySchedule.monday.length > 0 || 
                              formData.weeklySchedule.tuesday.length > 0 ||
                              formData.weeklySchedule.wednesday.length > 0 ||
                              formData.weeklySchedule.thursday.length > 0 ||
                              formData.weeklySchedule.friday.length > 0 ||
                              formData.weeklySchedule.saturday.length > 0 ||
                              formData.weeklySchedule.sunday.length > 0) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    weeklySchedule: {
                                      monday: [],
                                      tuesday: [],
                                      wednesday: [],
                                      thursday: [],
                                      friday: [],
                                      saturday: [],
                                      sunday: []
                                    }
                                  }));
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove all
                              </button>
                            )}
                          </div>

                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, dayIndex) => (
                            <div key={day} className="mb-4 p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700 capitalize">
                                  {day}
                                </label>
                                {dayIndex === 0 && formData.weeklySchedule.monday.length === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const defaultTime = { startHour: '08', startMinute: '00', endHour: '18', endMinute: '00' };
                                      setFormData(prev => ({
                                        ...prev,
                                        weeklySchedule: {
                                          ...prev.weeklySchedule,
                                          monday: [defaultTime]
                                        }
                                      }));
                                    }}
                                    className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium"
                                  >
                                    Create regular time slots
                                  </button>
                                )}
                                {dayIndex > 0 && formData.weeklySchedule[day].length === 0 && formData.weeklySchedule.monday.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        weeklySchedule: {
                                          ...prev.weeklySchedule,
                                          [day]: [...prev.weeklySchedule.monday]
                                        }
                                      }));
                                    }}
                                    className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium"
                                  >
                                    Copy to remaining days
                                  </button>
                                )}
                              </div>

                              {formData.weeklySchedule[day].map((timeSlot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center gap-2 mb-2">
                                  <select
                                    value={timeSlot.startHour || '08'}
                                    onChange={(e) => {
                                      const updatedSchedule = { ...formData.weeklySchedule };
                                      updatedSchedule[day][slotIndex].startHour = e.target.value;
                                      setFormData(prev => ({ ...prev, weeklySchedule: updatedSchedule }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={String(i).padStart(2, '0')}>
                                        {String(i).padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500">:</span>
                                  <select
                                    value={timeSlot.startMinute || '00'}
                                    onChange={(e) => {
                                      const updatedSchedule = { ...formData.weeklySchedule };
                                      updatedSchedule[day][slotIndex].startMinute = e.target.value;
                                      setFormData(prev => ({ ...prev, weeklySchedule: updatedSchedule }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {['00', '15', '30', '45'].map(min => (
                                      <option key={min} value={min}>{min}</option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500 mx-2">to</span>
                                  <select
                                    value={timeSlot.endHour || '18'}
                                    onChange={(e) => {
                                      const updatedSchedule = { ...formData.weeklySchedule };
                                      updatedSchedule[day][slotIndex].endHour = e.target.value;
                                      setFormData(prev => ({ ...prev, weeklySchedule: updatedSchedule }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={String(i).padStart(2, '0')}>
                                        {String(i).padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500">:</span>
                                  <select
                                    value={timeSlot.endMinute || '00'}
                                    onChange={(e) => {
                                      const updatedSchedule = { ...formData.weeklySchedule };
                                      updatedSchedule[day][slotIndex].endMinute = e.target.value;
                                      setFormData(prev => ({ ...prev, weeklySchedule: updatedSchedule }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {['00', '15', '30', '45'].map(min => (
                                      <option key={min} value={min}>{min}</option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedSchedule = { ...formData.weeklySchedule };
                                      updatedSchedule[day] = updatedSchedule[day].filter((_, i) => i !== slotIndex);
                                      setFormData(prev => ({ ...prev, weeklySchedule: updatedSchedule }));
                                    }}
                                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const newTimeSlot = { startHour: '08', startMinute: '00', endHour: '18', endMinute: '00' };
                                  const updatedSchedule = { ...formData.weeklySchedule };
                                  updatedSchedule[day] = [...updatedSchedule[day], newTimeSlot];
                                  setFormData(prev => ({ ...prev, weeklySchedule: updatedSchedule }));
                                }}
                                className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium flex items-center gap-1 mt-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add time slot
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Exceptions */}
                        <div className="border-t pt-6">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Exceptions (Optional)
                            </label>
                            <p className="text-xs text-gray-600">
                              Do you have alternative operating hours? Use this if you want different operating hours on a special day, like Easter or Christmas.
                            </p>
                          </div>

                          {formData.scheduleExceptions.map((exception, index) => (
                            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <input
                                  type="date"
                                  value={exception.date || ''}
                                  onChange={(e) => {
                                    const updatedExceptions = [...formData.scheduleExceptions];
                                    updatedExceptions[index].date = e.target.value;
                                    setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                  }}
                                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      scheduleExceptions: prev.scheduleExceptions.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {exception.timeSlots?.map((timeSlot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center gap-2 mb-2">
                                  <select
                                    value={timeSlot.startHour || '08'}
                                    onChange={(e) => {
                                      const updatedExceptions = [...formData.scheduleExceptions];
                                      updatedExceptions[index].timeSlots[slotIndex].startHour = e.target.value;
                                      setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={String(i).padStart(2, '0')}>
                                        {String(i).padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500">:</span>
                                  <select
                                    value={timeSlot.startMinute || '00'}
                                    onChange={(e) => {
                                      const updatedExceptions = [...formData.scheduleExceptions];
                                      updatedExceptions[index].timeSlots[slotIndex].startMinute = e.target.value;
                                      setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {['00', '15', '30', '45'].map(min => (
                                      <option key={min} value={min}>{min}</option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500 mx-2">to</span>
                                  <select
                                    value={timeSlot.endHour || '18'}
                                    onChange={(e) => {
                                      const updatedExceptions = [...formData.scheduleExceptions];
                                      updatedExceptions[index].timeSlots[slotIndex].endHour = e.target.value;
                                      setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={String(i).padStart(2, '0')}>
                                        {String(i).padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500">:</span>
                                  <select
                                    value={timeSlot.endMinute || '00'}
                                    onChange={(e) => {
                                      const updatedExceptions = [...formData.scheduleExceptions];
                                      updatedExceptions[index].timeSlots[slotIndex].endMinute = e.target.value;
                                      setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                                  >
                                    {['00', '15', '30', '45'].map(min => (
                                      <option key={min} value={min}>{min}</option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedExceptions = [...formData.scheduleExceptions];
                                      updatedExceptions[index].timeSlots = updatedExceptions[index].timeSlots.filter((_, i) => i !== slotIndex);
                                      setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                    }}
                                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const updatedExceptions = [...formData.scheduleExceptions];
                                  if (!updatedExceptions[index].timeSlots) {
                                    updatedExceptions[index].timeSlots = [];
                                  }
                                  updatedExceptions[index].timeSlots.push({ startHour: '08', startMinute: '00', endHour: '18', endMinute: '00' });
                                  setFormData(prev => ({ ...prev, scheduleExceptions: updatedExceptions }));
                                }}
                                className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium flex items-center gap-1 mt-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add opening hours
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                scheduleExceptions: [...prev.scheduleExceptions, { date: '', timeSlots: [] }]
                              }));
                            }}
                            className="px-4 py-2 text-[#3CAF54] hover:bg-green-50 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add date
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Pricing Categories */}
                    {availabilitySubStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Tell us more about your prices:
                          </h3>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="pricingCategory"
                                value="same-price"
                                checked={formData.pricingCategory === 'same-price'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pricingCategory: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">The price is the same for everyone, eg: per participant</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name="pricingCategory"
                                value="age-based"
                                checked={formData.pricingCategory === 'age-based'}
                                onChange={(e) => setFormData(prev => ({ ...prev, pricingCategory: e.target.value }))}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Price depends on age, eg: adults, child, senior, etc</div>
                              </div>
                            </label>
                          </div>
                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                              💡 Offering multiple participant types can boost bookings by up to 3x compared with activities with only one participant type.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Capacity */}
                    {availabilitySubStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Now, let's look at your capacity
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                How many participants (who book on GetYourGuide) can you take per time slot?
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Minimum number
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="4"
                                    value={formData.minParticipants}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minParticipants: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                                  />
                                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                      With a lower min # of participants you ensure not to lose sales by restricting travellers to book your activity.
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Maximum number
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="20"
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Price */}
                    {availabilitySubStep === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Set the price for your activity
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Enter a single price per person. This price will apply to all participants regardless of group size.
                          </p>
                          
                          <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price per person (RWF)
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.pricePerPerson || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, pricePerPerson: e.target.value }))}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] focus:border-transparent"
                              />
                              <span className="text-sm font-medium text-gray-700">RWF</span>
                            </div>
                            
                            {commission && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Customer pays:</span>
                                    <span className="font-medium text-gray-900">
                                      {formData.pricePerPerson ? parseFloat(formData.pricePerPerson).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} RWF
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Commission ({commission.commission_percentage}%):</span>
                                    <span className="font-medium text-gray-700">
                                      {formData.pricePerPerson ? (parseFloat(formData.pricePerPerson) * (commission.commission_percentage / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} RWF
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                                    <span className="font-medium text-gray-900">You receive:</span>
                                    <span className="font-semibold text-[#3CAF54]">
                                      {formData.pricePerPerson ? (parseFloat(formData.pricePerPerson) * (1 - commission.commission_percentage / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} RWF
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {!formData.pricePerPerson || parseFloat(formData.pricePerPerson) <= 0 ? (
                              <p className="mt-2 text-sm text-amber-600">
                                Please enter a valid price per person
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (availabilitySubStep === 1) {
                          handleBack();
                        } else {
                          setAvailabilitySubStep(availabilitySubStep - 1);
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => navigate('/tours/dashboard/packages')}
                        className="px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
                      >
                        Save and exit
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 text-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <span>{availabilitySubStep === 4 ? 'Continue' : 'Save and continue'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Tour Package</h2>
                <p className="text-gray-600">Please review all the information below before submitting your tour package.</p>
              </div>

              <div className="space-y-6">
                {/* Step 1: Basic Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step 1: Basic Information</h3>
                    <button
                      onClick={() => navigateToStep(1)}
                      className="text-[#3CAF54] hover:underline text-sm flex items-center gap-1"
                    >
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.name || 'Not provided'}</p>
                    <p><span className="font-medium">Category:</span> {formData.category || 'Not provided'}</p>
                    <p><span className="font-medium">Short Description:</span> {formData.shortDescription || 'Not provided'}</p>
                    <p><span className="font-medium">Locations:</span> {formData.locations.length > 0 ? formData.locations.map(l => l.name || l.address).join(', ') : 'Not provided'}</p>
                    <p><span className="font-medium">Tags:</span> {formData.tags.length > 0 ? formData.tags.join(', ') : 'Not provided'}</p>
                  </div>
                </div>

                {/* Step 2: Inclusions */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step 2: Inclusions</h3>
                    <button
                      onClick={() => navigateToStep(2)}
                      className="text-[#3CAF54] hover:underline text-sm flex items-center gap-1"
                    >
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">What's Included:</span> {formData.whatsIncluded || 'Not provided'}</p>
                    <p><span className="font-medium">Guide Type:</span> {formData.guideType || 'Not provided'}</p>
                    <p><span className="font-medium">Food Included:</span> {formData.foodIncluded ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Transportation:</span> {formData.transportationUsed ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Step 3: Extra Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step 3: Extra Information</h3>
                    <button
                      onClick={() => navigateToStep(3)}
                      className="text-[#3CAF54] hover:underline text-sm flex items-center gap-1"
                    >
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Pet Policy:</span> {formData.petPolicy ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Emergency Phone:</span> {formData.emergencyCountryCode} {formData.emergencyPhone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Step 4: Photos */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step 4: Photos</h3>
                    <button
                      onClick={() => navigateToStep(4)}
                      className="text-[#3CAF54] hover:underline text-sm flex items-center gap-1"
                    >
                      <span>Edit</span>
                    </button>
                  </div>
                  <p className="text-sm"><span className="font-medium">Photos Uploaded:</span> {formData.photos.length} photo(s)</p>
                </div>

                {/* Step 5: Options */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step 5: Options</h3>
                    <button
                      onClick={() => navigateToStep(5)}
                      className="text-[#3CAF54] hover:underline text-sm flex items-center gap-1"
                    >
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Max Group Size:</span> {formData.maxGroupSize || 'Not provided'}</p>
                    <p><span className="font-medium">Private Activity:</span> {formData.isPrivateActivity ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Wheelchair Accessible:</span> {formData.wheelchairAccessible ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSaving(true);
                      const result = await savePackageData(true);
                      if (result && result.success) {
                        // Mark package as complete (status = 'active' or 'published')
                        const finalData = {
                          ...formData,
                          tour_business_id: businessId,
                          status: 'active'
                        };
                        await saveTourPackage(finalData, result.packageId || packageId);
                        alert('✅ Tour package created and saved successfully!');
                        navigate('/tours/dashboard/packages');
                      }
                    } catch (error) {
                      console.error('Error submitting package:', error);
                      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to submit package'}`);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSaving && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSaving && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSaving ? (
                    <>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Package</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <StaysFooter />
    </div>
  );
};

export default CreateTourPackage;

