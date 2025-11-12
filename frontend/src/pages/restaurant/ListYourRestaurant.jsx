import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, X } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function ListYourRestaurant() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [mapError, setMapError] = useState('');

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyD2arEwy-YlQ7NU7fWOIxbJgTOLiH6RUqc'; // Not used - loaded from index.html

  // Initialize Google Places Autocomplete
  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'], // Allow both places and addresses
      fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components']
    });

    autocompleteRef.current = autocomplete;

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
        address_components: place.address_components
      };

      setLocationData(locationInfo);
      setLocation(place.name || place.formatted_address);
      setError('');
    });
  };

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
        // Only set error if not already set by global error handler
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
    };
  }, []);

  // Handle map click to select location
  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    // Don't reinitialize if map already exists
    if (mapInstanceRef.current) {
      return;
    }

    // Default center location - Kigali, Rwanda (for demo purposes)
    const defaultCenter = { lat: -1.9441, lng: 30.0619 }; // Kigali, Rwanda
    
    // Use Kigali as default location (geolocation disabled for demo)
    createMap(defaultCenter);

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

        // Update selected location
        setSelectedMapLocation({ lat, lng });
        setMapError(''); // Clear any previous errors

        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const place = results[0];
            const locationInfo = {
              name: place.formatted_address,
              formatted_address: place.formatted_address,
              place_id: place.place_id || `manual_${lat}_${lng}`,
              lat: lat,
              lng: lng,
              address_components: place.address_components || []
            };
            setSelectedMapLocation({ ...locationInfo, lat, lng });
            // Automatically fill the address field
            setLocation(place.formatted_address);
            setLocationData(locationInfo);
            setError('');
          }
        });

        // Update marker position when dragged
        marker.addListener('dragend', (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          setSelectedMapLocation({ lat: newLat, lng: newLng });

          // Reverse geocode new position
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const place = results[0];
              const locationInfo = {
                name: place.formatted_address,
                formatted_address: place.formatted_address,
                place_id: place.place_id || `manual_${newLat}_${newLng}`,
                lat: newLat,
                lng: newLng,
                address_components: place.address_components || []
              };
              setSelectedMapLocation({ ...locationInfo, lat: newLat, lng: newLng });
              // Automatically update the address field when marker is dragged
              setLocation(place.formatted_address);
              setLocationData(locationInfo);
              setError('');
            }
          });
        });
      });
    }
  };

  // Cleanup map when modal closes
  useEffect(() => {
    if (!showMapModal) {
      // Clean up map instance
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      setSelectedMapLocation(null);
      setMapError('');
    }
  }, [showMapModal]);

  // Handle opening map modal
  const handleOpenMap = () => {
    if (!isGoogleMapsLoaded) {
      setError('Please wait for Google Maps to load');
      return;
    }
    // Reset map instance to allow reinitialization
    mapInstanceRef.current = null;
    markerRef.current = null;
    setSelectedMapLocation(null);
    setShowMapModal(true);
    // Initialize map after modal opens
    setTimeout(() => {
      initializeMap();
    }, 100);
  };

  // Handle confirming map selection
  const handleConfirmMapLocation = () => {
    if (!selectedMapLocation || !selectedMapLocation.formatted_address) {
      setMapError('Please click on the map to select a location');
      return;
    }

    // Location is already set automatically when clicking on map
    // Just close the modal
    setError('');
    setMapError('');
    setShowMapModal(false);
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    // Location is optional - user can proceed without selecting a location
    // Navigate to next step with location data (if available)
    navigate('/restaurant/list-your-restaurant/step-2', { 
      state: { 
        location: location.trim() || '',
        locationData: locationData || null
      } 
    });
  };

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
            Where is your restaurant located?
          </h1>
          
          <p className="text-gray-600 text-center mb-8">
            Start with your restaurant name or address. This will make it easier to find your location.
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
                  }}
                  placeholder="Enter restaurant name or address..."
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
                    <li>Under "Application restrictions", make sure to add your current domain:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><code className="bg-yellow-100 px-1 rounded">localhost:5173/*</code> (for development)</li>
                        <li><code className="bg-yellow-100 px-1 rounded">localhost:*/*</code> (for all localhost ports)</li>
                        <li>Your production domain (e.g., <code className="bg-yellow-100 px-1 rounded">yourdomain.com/*</code>)</li>
                      </ul>
                    </li>
                    <li>Under "API restrictions", ensure "Places API" and "Maps JavaScript API" are allowed</li>
                    <li>Make sure billing is enabled in your Google Cloud Project</li>
                    <li>Refresh this page after making changes</li>
                  </ol>
                  <p className="text-xs text-yellow-600">
                    Note: Google provides $200 free credit per month for Maps API usage, which covers most small to medium applications.
                  </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" style={{ borderColor: '#dcfce7' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#dcfce7' }}>
              <h2 className="text-xl font-bold text-gray-900">Pick Location on Map</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <div
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: '500px' }}
              />
            </div>

            {/* Selected Location Info */}
            {selectedMapLocation && selectedMapLocation.formatted_address && (
              <div className="p-4 border-t bg-gray-50" style={{ borderColor: '#dcfce7' }}>
                <p className="text-sm font-semibold text-gray-700 mb-1">Selected Location:</p>
                <p className="text-sm text-gray-600 mb-3">{selectedMapLocation.formatted_address}</p>
                {mapError && (
                  <p className="text-sm text-red-600 mb-3">{mapError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmMapLocation}
                    className="flex-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <span>Confirm Location</span>
                    <MapPin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowMapModal(false)}
                    className="px-4 py-2 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!selectedMapLocation && (
              <div className="p-4 border-t bg-blue-50" style={{ borderColor: '#dcfce7' }}>
                <p className="text-sm text-blue-800">
                  💡 Click anywhere on the map to select a location. You can drag the marker to adjust the position.
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

