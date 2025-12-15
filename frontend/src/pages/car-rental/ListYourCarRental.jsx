import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, X } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function ListYourCarRental() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Redirect logged-in users away from the listing form
  useEffect(() => {
    const checkUserStatus = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      // If user is logged in (has user data and token), redirect them immediately
      if (user && token) {
        try {
          const userData = JSON.parse(user);
          const carRentalBusinessId = localStorage.getItem('car_rental_business_id');
          
          console.log('🔍 User is logged in, checking status...', { userId: userData.id, carRentalBusinessId });
          
          // If they have a car rental business ID, check submission status
          if (carRentalBusinessId) {
            // For now, just redirect to complete page
            // TODO: Implement getSubmissionStatus for car rental
            navigate('/car-rental/setup/complete', { replace: true });
            setIsCheckingAuth(false);
            return;
          } else {
            // Logged in but no car rental business - they can start fresh here
            console.log('🚀 Logged in but no car rental business, allowing to start fresh');
            setIsCheckingAuth(false);
            return;
          }
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          // If error, clear invalid data and allow them to continue
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          setIsCheckingAuth(false);
        }
      } else {
        console.log('👤 User not logged in, allowing access to listing form');
        setIsCheckingAuth(false);
      }
    };
    
    checkUserStatus();
  }, [navigate]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  // Reuse native Google Places Autocomplete (no custom suggestion UI)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [mapError, setMapError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Helper function to create coordinate label
  const createCoordinateLabel = (lat, lng) => `Pinned near (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  // Helper function to apply location selection (consistent with tour form)
  const applyLocationSelection = (lat, lng, formattedAddress, placeId = `manual_${lat}_${lng}`, extraFields = {}) => {
    const label = formattedAddress?.trim() || createCoordinateLabel(lat, lng);
    const locationInfo = {
      name: label,
      formatted_address: label,
      place_id: placeId,
      lat,
      lng,
      ...extraFields
    };

    setSelectedMapLocation(locationInfo);
    setLocation(label);
    setLocationData(locationInfo);
    setError('');
  };

  // Fallback address lookup using OpenStreetMap
  const fetchFallbackAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (fallbackError) {
      console.error('Fallback geocoding error:', fallbackError);
      return null;
    }
  };

  const handleFallbackAddressLookup = async (lat, lng, placeId) => {
    setIsGeocoding(true);
    const fallbackData = await fetchFallbackAddress(lat, lng);
    setIsGeocoding(false);

    if (fallbackData?.display_name) {
      const components = fallbackData.address
        ? Object.entries(fallbackData.address).map(([key, value]) => ({
            long_name: value,
            short_name: value,
            types: [key]
          }))
        : [];

      applyLocationSelection(lat, lng, fallbackData.display_name, placeId, {
        fallback_provider: 'nominatim',
        address_components: components
      });
      setMapError('Using OpenStreetMap to describe this pinned location.');
    } else {
      setMapError('Address lookup failed. Saving precise coordinates only.');
    }
  };

  const getGeocodeErrorMessage = (status) => {
    switch (status) {
      case 'ZERO_RESULTS':
        return 'No address found for this location. Using coordinates instead.';
      case 'OVER_QUERY_LIMIT':
        return 'Geocoding service temporarily unavailable. Using coordinates instead.';
      case 'REQUEST_DENIED':
        return 'Geocoding request denied. Using coordinates instead.';
      case 'INVALID_REQUEST':
        return 'We could not understand this map request. Using coordinates instead.';
      case 'UNKNOWN_ERROR':
        return 'Geocoding service returned an unknown error. Using coordinates instead.';
      default:
        return `Geocoding failed (${status}). Using coordinates instead.`;
    }
  };

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Initialize Google Places Autocomplete
  const initializeAutocomplete = () => {
    if (!inputRef.current) {
      console.warn('Input ref not ready for autocomplete initialization');
      // Retry after a short delay
      setTimeout(() => {
        if (inputRef.current && window.google && window.google.maps && window.google.maps.places) {
          initializeAutocomplete();
        }
      }, 100);
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps Places API not loaded yet');
      return;
    }

    // Clean up existing autocomplete if any
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components']
      });

      autocompleteRef.current = autocomplete;
      console.log('Google Places Autocomplete initialized successfully');

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          setError('Please select a valid location from the suggestions');
          return;
        }

        // Store location data
        const locationInfo = {
          name: place.name || place.formatted_address,
          formatted_address: place.formatted_address,
          place_id: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          geometry: {
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          },
          address_components: place.address_components
        };

        setLocationData(locationInfo);
        setLocation(place.name || place.formatted_address);
        setError('');
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setError('Failed to initialize location autocomplete. Please refresh the page.');
    }
  };

  // We rely on the native Google Places Autocomplete UI for suggestions to match other services

  // Load Google Maps script - check if already loaded or wait for it
  useEffect(() => {
    // Check if Google Maps is already loaded
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        setGoogleMapsError(null);
        initializeAutocomplete();
        return true;
      }
      return false;
    };

    // Listen for global Google Maps error events
    const handleGoogleMapsError = (event) => {
      const error = event.detail?.error;
      if (error) {
        console.error('Google Maps error detected:', error);
        
        if (error.type === 'auth_failure') {
          setGoogleMapsError('billing');
          setError('Google Maps API authentication failed. Please check your API key and ensure billing is enabled in Google Cloud Console.');
        } else if (error.type === 'script_load_failed' || error.type === 'max_attempts_reached') {
          setGoogleMapsError('load');
          setError(error.message || 'Failed to load Google Maps. Please check your API key and network connection.');
        } else if (error.type === 'callback_timeout') {
          setGoogleMapsError('timeout');
          setError('Google Maps API is taking too long to load. Please refresh the page or check your network connection.');
        } else {
          setGoogleMapsError('unknown');
          setError(error.message || 'An error occurred while loading Google Maps.');
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

    // Also listen for the explicit load event dispatched from index.html
    const handleGoogleMapsLoaded = () => {
      // Try to initialize when the global loader notifies us
      checkGoogleMaps();
    };
    window.addEventListener('googlemaps:loaded', handleGoogleMapsLoaded);

    // Re-initialize autocomplete when the input gains focus (helps when script loads late)
    const handleInputFocus = () => {
      try {
        if (!autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
          console.log('Re-initializing autocomplete on focus');
          initializeAutocomplete();
        }
      } catch (err) {
        console.error('Error re-initializing autocomplete on focus:', err);
      }
    };
    
    // Set up focus listener with a slight delay to ensure inputRef is set
    const setupFocusListener = () => {
      if (inputRef.current) {
        inputRef.current.addEventListener('focus', handleInputFocus);
      } else {
        // Retry if inputRef is not ready yet
        setTimeout(setupFocusListener, 100);
      }
    };
    setupFocusListener();

    // Wait for Google Maps to load (it's loaded in index.html)
    let checkInterval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.google || !window.google.maps) {
        if (!window.googleMapsLoadError) {
          setGoogleMapsError('load');
          setError('Failed to load Google Maps. Please check your API key and network connection.');
        }
      }
    }, 15000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      window.removeEventListener('googlemaps:error', handleGoogleMapsError);
      window.removeEventListener('googlemaps:loaded', handleGoogleMapsLoaded);
      if (inputRef.current) {
        inputRef.current.removeEventListener('focus', handleInputFocus);
      }
      // Clean up autocomplete
      if (autocompleteRef.current && window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  // Additional useEffect to ensure autocomplete is initialized when inputRef becomes available
  useEffect(() => {
    if (!isGoogleMapsLoaded) return;
    
    // Check periodically if inputRef is ready and autocomplete needs initialization
    const checkAndInit = () => {
      if (inputRef.current && window.google && window.google.maps && window.google.maps.places && !autocompleteRef.current) {
        console.log('Initializing autocomplete from additional useEffect');
        initializeAutocomplete();
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (checkAndInit()) return;
    
    // If not ready, check every 100ms for up to 2 seconds
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts++;
      if (checkAndInit() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isGoogleMapsLoaded]);

  // Handle map click to select location
  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    // Don't reinitialize if map already exists
    if (mapInstanceRef.current) {
      return;
    }

    // Default center location - Kigali, Rwanda
    const defaultCenter = { lat: -1.9441, lng: 30.0619 };
    
    // Try geolocation first, then create map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          createMap(userLocation);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Fallback to default location
          createMap(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Browser doesn't support geolocation
      createMap(defaultCenter);
    }

    function createMap(center) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Add click listener to map
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Add new marker at clicked location
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
        });

        markerRef.current = marker;

        const placeId = `manual_${lat}_${lng}`;
        applyLocationSelection(lat, lng, null, placeId, { address_components: [] });
        setMapError(''); // Clear any previous errors
        setIsGeocoding(true);

        // Reverse geocode to get address
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
            setIsGeocoding(false);
            
            if (status === 'OK' && results && results[0]) {
              const place = results[0];
              applyLocationSelection(
                lat,
                lng,
                place.formatted_address,
                place.place_id || placeId,
                { address_components: place.address_components || [] }
              );
              setMapError('');
            } else {
              setMapError(getGeocodeErrorMessage(status));
              await handleFallbackAddressLookup(lat, lng, placeId);
            }
          });
        } catch (error) {
          console.error('Geocoding error:', error);
          setIsGeocoding(false);
          setMapError('Error getting address. Using coordinates instead.');
        }

        // Update marker position when dragged
        marker.addListener('dragend', (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          
          // Immediately update with coordinates
          const newPlaceId = `manual_${newLat}_${newLng}`;
          applyLocationSelection(newLat, newLng, null, newPlaceId, { address_components: [] });
          setIsGeocoding(true);

          // Reverse geocode new position
          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat: newLat, lng: newLng } }, async (results, status) => {
              setIsGeocoding(false);
              
              if (status === 'OK' && results && results[0]) {
                const place = results[0];
                applyLocationSelection(
                  newLat,
                  newLng,
                  place.formatted_address,
                  place.place_id || newPlaceId,
                  { address_components: place.address_components || [] }
                );
                setMapError('');
              } else {
                setMapError(getGeocodeErrorMessage(status));
                await handleFallbackAddressLookup(newLat, newLng, newPlaceId);
              }
            });
          } catch (error) {
            console.error('Geocoding error:', error);
            setIsGeocoding(false);
            setMapError('Error getting address. Using coordinates instead.');
          }
        });
      });
    }
  };

  // Cleanup map when modal closes and handle resize for mobile
  useEffect(() => {
    if (!showMapModal) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      setSelectedMapLocation(null);
      setMapError('');
    } else {
      // Handle window resize/orientation change on mobile
      const handleResize = () => {
        if (mapInstanceRef.current && window.google && window.google.maps) {
          setTimeout(() => {
            window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
            if (selectedMapLocation && selectedMapLocation.lat && selectedMapLocation.lng) {
              mapInstanceRef.current.setCenter({
                lat: selectedMapLocation.lat,
                lng: selectedMapLocation.lng
              });
            }
          }, 100);
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }
  }, [showMapModal, selectedMapLocation]);

  // Handle opening map modal
  const handleOpenMap = () => {
    if (!isGoogleMapsLoaded) {
      setError('Please wait for Google Maps to load');
      return;
    }
    mapInstanceRef.current = null;
    markerRef.current = null;
    setSelectedMapLocation(null);
    setShowMapModal(true);
    // Initialize map after modal opens - longer delay for mobile to ensure DOM is ready
    setTimeout(() => {
      initializeMap();
      // Trigger resize event for Google Maps to recalculate on mobile
      setTimeout(() => {
        if (mapInstanceRef.current && window.google && window.google.maps) {
          window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
        }
      }, 200);
    }, 300);
  };

  // Handle confirming map selection
  const handleConfirmMapLocation = () => {
    if (!selectedMapLocation || (!selectedMapLocation.lat && !selectedMapLocation.lng)) {
      setMapError('Please click on the map to select a location');
      return;
    }

    // If geocoding is still in progress, wait a bit
    if (isGeocoding) {
      setMapError('Please wait while we get the address...');
      return;
    }

    setError('');
    setMapError('');
    setShowMapModal(false);
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    // Location is optional - user can proceed without selecting a location
    navigate('/car-rental/list-your-car-rental/step-2', { 
      state: { 
        location: location.trim() || '',
        locationData: locationData || null
      } 
    });
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CAF54] mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-2xl w-full mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                1
              </div>
              <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                2
              </div>
              <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                3
              </div>
            </div>
          </div>
          <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 1 of 3</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Where is your car rental business located?
          </h1>
          
          <p className="text-gray-600 text-center mb-8">
            Start with your business name or address. This will make it easier to find your location.
          </p>

          <form onSubmit={handleNext} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5" style={{ color: '#3CAF54' }} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  id="location-input"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setError('');
                    // Ensure autocomplete is initialized when user starts typing
                    if (!autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
                      initializeAutocomplete();
                    }
                  }}
                  placeholder="Enter business name or address..."
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{
                    ...(error ? { borderColor: '#ef4444' } : {})
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.borderColor = '#3CAF54';
                      e.target.style.boxShadow = '0 0 0 2px rgba(60, 175, 84, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  autoFocus
                />
              </div>
              {!isGoogleMapsLoaded && !googleMapsError && (
                <p className="mt-2 text-sm text-gray-500">Loading location services...</p>
              )}
              {/* Use native Google Places dropdown (pac-container) for consistent UI */}
              {googleMapsError === 'billing' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    ⚠️ Google Maps Configuration Issue
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Google Maps is showing "for development purpose only" watermark. This usually means:
                  </p>
                  <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1 mb-3">
                    <li><strong>API Key Restrictions:</strong> Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console API Credentials</a></li>
                    <li>Select your API key</li>
                    <li>Under "Application restrictions", make sure to add your current domain</li>
                    <li>Under "API restrictions", ensure "Places API" and "Maps JavaScript API" are allowed</li>
                    <li>Make sure billing is enabled in your Google Cloud Project</li>
                    <li>Refresh this page after making changes</li>
                  </ol>
                </div>
              )}
              {error && !googleMapsError && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              {locationData && (
                <p className="mt-2 text-sm text-green-600">✓ Location selected: {locationData.formatted_address}</p>
              )}
              {isGoogleMapsLoaded && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    className="text-sm font-medium underline hover:no-underline transition-all"
                    style={{ color: '#3CAF54' }}
                  >
                    Pick location on map
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#3CAF54' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2d8f42';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3CAF54';
              }}
            >
              <span>Next</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[85vh] sm:min-h-[520px] flex flex-col sm:overflow-hidden" style={{ borderColor: '#dcfce7' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0" style={{ borderColor: '#dcfce7' }}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pick Location on Map</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative min-h-0 overflow-hidden" style={{ minHeight: '320px', maxHeight: '60vh' }}>
              <div
                ref={mapRef}
                className="w-full h-full absolute inset-0"
                style={{ minHeight: '320px' }}
              />
            </div>

            {/* Selected Location Info */}
            {selectedMapLocation && (selectedMapLocation.lat || selectedMapLocation.lng) && (
              <div className="p-3 sm:p-4 border-t bg-gray-50 flex-shrink-0" style={{ borderColor: '#dcfce7' }}>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Selected Location:</p>
                {isGeocoding ? (
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">Getting address...</p>
                ) : selectedMapLocation.formatted_address ? (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 break-words">{selectedMapLocation.formatted_address}</p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 break-all">
                    {selectedMapLocation.lat?.toFixed(6)}, {selectedMapLocation.lng?.toFixed(6)}
                  </p>
                )}
                {mapError && (
                  <p className="text-xs sm:text-sm text-yellow-600 mb-3 break-words">{mapError}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleConfirmMapLocation}
                    disabled={isGeocoding}
                    className="flex-1 text-white font-semibold py-3 sm:py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => {
                      if (!isGeocoding) {
                        e.target.style.backgroundColor = '#2d8f42';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isGeocoding) {
                        e.target.style.backgroundColor = '#3CAF54';
                      }
                    }}
                    onTouchStart={(e) => {
                      if (!isGeocoding) {
                        e.currentTarget.style.backgroundColor = '#2d8f42';
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (!isGeocoding) {
                        e.currentTarget.style.backgroundColor = '#3CAF54';
                      }
                    }}
                  >
                    <span className="text-sm sm:text-base">{isGeocoding ? 'Getting Address...' : 'Confirm Location'}</span>
                    {!isGeocoding && <MapPin className="h-4 w-4 flex-shrink-0" />}
                  </button>
                  <button
                    onClick={() => setShowMapModal(false)}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 border-2 rounded-lg font-medium transition-colors text-gray-700 active:bg-gray-100 touch-manipulation"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!selectedMapLocation && (
              <div className="p-3 sm:p-4 border-t bg-blue-50 flex-shrink-0" style={{ borderColor: '#dcfce7' }}>
                <p className="text-xs sm:text-sm text-blue-800">
                  💡 Tap anywhere on the map to select a location. You can drag the marker to adjust the position.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      <StaysFooter />
    </div>
  );
}















