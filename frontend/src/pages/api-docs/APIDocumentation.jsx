import React, { useState, useEffect } from 'react';
import { BookOpen, CreditCard, Home, Car, UtensilsCrossed, MapPin, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const APIDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const apiBase = `${baseUrl}/client`;

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const CodeBlock = ({ code, language = 'json', id }) => (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs flex items-center gap-1"
      >
        {copiedCode === id ? (
          <>
            <Check className="h-3 w-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Travooz API Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete API reference for booking stays, tours, restaurants, and car rentals. 
            All endpoints are publicly accessible and require no authentication.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <span className="font-semibold">Base URL:</span>
            <code className="text-sm">{apiBase}</code>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="#discovery-properties" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Home className="h-4 w-4" />
              <span>Discover Properties (Stays)</span>
            </a>
            <a href="#discovery-tours" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <MapPin className="h-4 w-4" />
              <span>Discover Tours</span>
            </a>
            <a href="#discovery-restaurants" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Discover Restaurants</span>
            </a>
            <a href="#discovery-cars" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Car className="h-4 w-4" />
              <span>Discover Car Rentals</span>
            </a>
            <a href="#stays" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Home className="h-4 w-4" />
              <span>Stays / Room Bookings</span>
            </a>
            <a href="#tours" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <MapPin className="h-4 w-4" />
              <span>Tour Package Bookings</span>
            </a>
            <a href="#restaurants" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Restaurant Orders</span>
            </a>
            <a href="#car-rentals" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Car className="h-4 w-4" />
              <span>Car Rental Bookings</span>
            </a>
            <a href="#payments" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <CreditCard className="h-4 w-4" />
              <span>Payment Processing</span>
            </a>
            <a href="#booking-status" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <BookOpen className="h-4 w-4" />
              <span>Booking Status</span>
            </a>
          </div>
        </div>

        {/* Discovery: Properties (Stays) */}
        <section id="discovery-properties" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Home className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Discover Properties (Stays)</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Properties</h3>
              <p className="text-gray-600 mb-4">Search and filter properties by location, property type, and more. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/properties
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <CodeBlock
                  id="properties-query"
                  code={JSON.stringify({
                    location: "Kigali",
                    property_type: "hotel",
                    guests: 2,
                    limit: 20,
                    offset: 0
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Properties with Available Rooms</h3>
              <p className="text-gray-600 mb-4">Search for properties that have available rooms for specific dates. Returns only properties with at least one available room. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/properties/available
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <CodeBlock
                  id="properties-available-query"
                  code={JSON.stringify({
                    check_in_date: "2025-01-15",
                    check_out_date: "2025-01-20",
                    guests: 2,
                    location: "Kigali",
                    property_type: "hotel",
                    limit: 20,
                    offset: 0
                  }, null, 2)}
                />
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-2">
                  <li><code>check_in_date</code> (required) - Check-in date in YYYY-MM-DD format</li>
                  <li><code>check_out_date</code> (required) - Check-out date in YYYY-MM-DD format</li>
                  <li><code>guests</code> (optional) - Minimum number of guests the room should accommodate</li>
                  <li><code>location</code> (optional) - Filter by location</li>
                  <li><code>property_type</code> (optional) - Filter by property type</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="properties-available-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Properties with available rooms retrieved successfully",
                    data: [
                      {
                        property_id: 1,
                        name: "Luxury Hotel",
                        location: "Kigali",
                        property_type: "hotel",
                        images: ["url1", "url2"],
                        min_price: 300000,
                        available_rooms: [
                          {
                            room_id: 1,
                            room_name: "Single Room, Garden view, Standard",
                            room_type: "Single Room",
                            room_class: "Standard",
                            base_rate: 300000,
                            recommended_occupancy: 1,
                            available_count: 45,
                            total_rooms: 50,
                            pricing_model: "per-day",
                            people_included: 1
                          }
                        ]
                      }
                    ]
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="properties-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Properties retrieved successfully",
                    data: [
                      {
                        property_id: 1,
                        name: "Luxury Hotel",
                        location: "Kigali",
                        property_type: "hotel",
                        number_of_rooms: 50,
                        images: ["url1", "url2"]
                      }
                    ]
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Property Details</h3>
              <p className="text-gray-600 mb-4">Get detailed information about a specific property including rooms, amenities, and images. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/properties/:propertyId
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="property-details-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Property retrieved successfully",
                    data: {
                      property_id: 1,
                      property_name: "Luxury Hotel",
                      location: "Kigali",
                      property_type: "hotel",
                      images: ["url1", "url2"],
                      amenities: [
                        {
                          amenity_id: 1,
                          amenity_name: "WiFi",
                          amenity_type: "connectivity"
                        }
                      ],
                      rooms: [
                        {
                          room_id: 1,
                          room_name: "Single Room, Garden view, Standard",
                          room_type: "Single Room",
                          room_class: "Standard",
                          base_rate: 300000,
                          recommended_occupancy: 1,
                          number_of_rooms: 50,
                          pricing_model: "per-day",
                          people_included: 1
                        }
                      ],
                      policies: []
                    }
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Property Availability</h3>
              <p className="text-gray-600 mb-4">Check room availability and pricing for specific dates at a property. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/properties/:propertyId/availability?check_in_date=2025-01-15&check_out_date=2025-01-20
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2">
                  <li><code>check_in_date</code> (required) - Check-in date in YYYY-MM-DD format</li>
                  <li><code>check_out_date</code> (required) - Check-out date in YYYY-MM-DD format</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="property-availability-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Availability checked successfully",
                    data: [
                      {
                        room_id: 1,
                        room_name: "Single Room, Garden view, Standard",
                        room_type: "Single Room",
                        room_class: "Standard",
                        price_per_night: 300000,
                        max_guests: 1,
                        available: true,
                        available_count: 45,
                        total_rooms: 50,
                        pricing_model: "per-day",
                        people_included: 1
                      }
                    ]
                  }, null, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Discovery: Tours */}
        <section id="discovery-tours" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Discover Tours</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Tour Packages</h3>
              <p className="text-gray-600 mb-4">Search and filter tour packages by location, date, price, and category.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/tours
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <CodeBlock
                  id="tours-query"
                  code={JSON.stringify({
                    location: "Kigali",
                    tour_date: "2024-12-25",
                    participants: 4,
                    min_price: 50000,
                    max_price: 200000,
                    category: "adventure",
                    limit: 20,
                    offset: 0
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Tour Details</h3>
              <p className="text-gray-600 mb-4">Get detailed information about a specific tour package.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/tours/:tourId
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Tour Availability</h3>
              <p className="text-gray-600 mb-4">Check available spots for a specific tour date.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/tours/:tourId/availability?tour_date=2024-12-25
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="tour-availability-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Availability checked successfully",
                    data: {
                      available: true,
                      available_spots: 15,
                      max_participants: 20,
                      booked_participants: 5,
                      price_per_person: 50000
                    }
                  }, null, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Discovery: Restaurants */}
        <section id="discovery-restaurants" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <UtensilsCrossed className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Discover Restaurants</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Restaurants</h3>
              <p className="text-gray-600 mb-4">Search and filter restaurants by location, cuisine type, rating, and availability. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/restaurants
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <CodeBlock
                  id="restaurants-query"
                  code={JSON.stringify({
                    location: "Kigali",
                    cuisine_type: "Italian",
                    min_rating: 4.0,
                    reservation_date: "2024-12-25",
                    reservation_time: "19:00",
                    guests: 4,
                    limit: 20,
                    offset: 0
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Restaurant Details</h3>
              <p className="text-gray-600 mb-4">Get detailed information including menu, images, and capacity. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/restaurants/:restaurantId
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="restaurant-details-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Restaurant retrieved successfully",
                    data: {
                      id: "restaurant-uuid",
                      name: "Luxury Restaurant",
                      description: "A fine dining experience...",
                      address: "123 Main St, Kigali",
                      cuisine_type: "Italian",
                      rating: 4.5,
                      images: ["url1", "url2"],
                      menu: [
                        {
                          id: "menu-item-uuid",
                          name: "Pizza Margherita",
                          description: "Classic Italian pizza",
                          price: 7500,
                          category_id: "category-uuid",
                          available: 1
                        }
                      ],
                      capacity: {
                        total_seats: 50,
                        available_seats: 30
                      }
                    }
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Restaurant Menu Categories</h3>
              <p className="text-gray-600 mb-4">Get all menu categories for a restaurant. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {baseUrl}/restaurant/menu/categories?restaurant_id=restaurant-uuid
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2">
                  <li><code>restaurant_id</code> (required) - The restaurant ID</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="menu-categories-response"
                  code={JSON.stringify({
                    data: [
                      {
                        id: "category-uuid",
                        restaurant_id: "restaurant-uuid",
                        name: "Appetizers",
                        display_order: 1
                      },
                      {
                        id: "category-uuid-2",
                        restaurant_id: "restaurant-uuid",
                        name: "Main Courses",
                        display_order: 2
                      }
                    ]
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Restaurant Menu Items</h3>
              <p className="text-gray-600 mb-4">Get all menu items for a restaurant. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {baseUrl}/restaurant/menu?restaurant_id=restaurant-uuid&available=1
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2">
                  <li><code>restaurant_id</code> (required) - The restaurant ID</li>
                  <li><code>available</code> (optional) - Filter by availability (1 for available, 0 for all)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="menu-items-response"
                  code={JSON.stringify({
                    data: [
                      {
                        id: "menu-item-uuid",
                        restaurant_id: "restaurant-uuid",
                        category_id: "category-uuid",
                        name: "Pizza Margherita",
                        description: "Classic Italian pizza with tomato and mozzarella",
                        price: 7500,
                        discount: 0,
                        availability: "available",
                        preparation_time: 20,
                        portion_size: "Large",
                        image_url: "https://example.com/pizza.jpg",
                        available: 1
                      }
                    ]
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Table Availability</h3>
              <p className="text-gray-600 mb-4">Check table availability for a specific date and time. <strong>No authentication required.</strong></p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/restaurants/:restaurantId/availability?reservation_date=2024-12-25&reservation_time=19:00&guests=4
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2">
                  <li><code>reservation_date</code> (required) - Date in YYYY-MM-DD format</li>
                  <li><code>reservation_time</code> (required) - Time in HH:MM format</li>
                  <li><code>guests</code> (required) - Number of guests</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="table-availability-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Availability checked successfully",
                    data: {
                      available: true,
                      available_seats: 20,
                      total_seats: 50,
                      capacity: {
                        total_seats: 50,
                        available_seats: 20
                      }
                    }
                  }, null, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Discovery: Car Rentals */}
        <section id="discovery-cars" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Car className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Discover Car Rentals</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Car Rentals</h3>
              <p className="text-gray-600 mb-4">Search and filter available cars by location, dates, type, and price.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/car-rentals
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                <CodeBlock
                  id="cars-query"
                  code={JSON.stringify({
                    location: "Kigali",
                    pickup_date: "2024-12-25",
                    return_date: "2024-12-30",
                    car_type: "SUV",
                    transmission: "automatic",
                    seats: 5,
                    min_price: 50000,
                    max_price: 200000,
                    limit: 20,
                    offset: 0
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Car Details</h3>
              <p className="text-gray-600 mb-4">Get detailed information about a specific car.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/car-rentals/:carId
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Car Availability</h3>
              <p className="text-gray-600 mb-4">Check car availability and calculate total price for specific dates.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/car-rentals/:carId/availability?pickup_date=2024-12-25&return_date=2024-12-30
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="car-availability-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Availability checked successfully",
                    data: {
                      available: true,
                      daily_rate: 50000,
                      security_deposit: 100000,
                      days: 5,
                      total_price: 350000
                    }
                  }, null, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stays / Room Bookings */}
        <section id="stays" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Home className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Stays / Room Bookings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Room Booking</h3>
              <p className="text-gray-600 mb-4">Book a room at a property for specific check-in and check-out dates. The system will check availability and create the booking if rooms are available.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  POST {apiBase}/bookings/stays
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                <CodeBlock
                  id="stay-request"
                  code={JSON.stringify({
                    property_id: 1,
                    room_id: 1,
                    check_in_date: "2025-01-15",
                    check_out_date: "2025-01-20",
                    guest_name: "John Doe",
                    guest_email: "john@example.com",
                    guest_phone: "+250788123456",
                    number_of_adults: 2,
                    number_of_children: 1,
                    special_requests: "High floor, quiet room",
                    payment_method: "card",
                    user_id: null
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (201 Created):</h4>
                <CodeBlock
                  id="stay-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Booking created successfully",
                    data: {
                      booking_id: 123,
                      booking_reference: "STAY-1234567890-ABC123XYZ",
                      total_amount: 1500000,
                      nights: 5,
                      transaction_id: 456,
                      status: "pending",
                      payment_status: "pending",
                      room_id: 1,
                      property_id: 1,
                      check_in_date: "2025-01-15",
                      check_out_date: "2025-01-20",
                      guests: 3
                    }
                  }, null, 2)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Required Fields:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><code>property_id</code> - ID of the property (from <code>/properties</code> endpoint)</li>
                  <li><code>room_id</code> - ID of the room (from <code>/properties/:propertyId</code> or <code>/properties/:propertyId/availability</code>)</li>
                  <li><code>check_in_date</code> - Check-in date in YYYY-MM-DD format</li>
                  <li><code>check_out_date</code> - Check-out date in YYYY-MM-DD format</li>
                  <li><code>guest_name</code> - Guest full name</li>
                  <li><code>guest_email</code> - Guest email address</li>
                  <li><code>guest_phone</code> - Guest phone number</li>
                  <li><code>number_of_adults</code> - Number of adult guests</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  <li>Use <code>room_id</code> (not <code>room_type_id</code>) - this is the ID from the <code>stays_rooms</code> table</li>
                  <li>The system validates that the room can accommodate the number of guests</li>
                  <li>Availability is checked in real-time - if no rooms are available, the booking will fail</li>
                  <li>Guest information is stored in the booking's <code>special_requests</code> field</li>
                  <li><code>user_id</code> is optional - only include if the user is logged in</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tour Package Bookings */}
        <section id="tours" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Tour Package Bookings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Tour Booking</h3>
              <p className="text-gray-600 mb-4">Book a tour package for a specific date and number of participants.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  POST {apiBase}/bookings/tours
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                <CodeBlock
                  id="tour-request"
                  code={JSON.stringify({
                    tour_package_id: 1,
                    tour_date: "2024-12-25",
                    number_of_participants: 4,
                    customer_name: "Jane Smith",
                    customer_email: "jane@example.com",
                    customer_phone: "+250788654321",
                    special_requests: "Vegetarian meals",
                    payment_method: "card"
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (201 Created):</h4>
                <CodeBlock
                  id="tour-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Booking created successfully",
                    data: {
                      booking_id: 124,
                      booking_reference: "TOUR-1234567890-DEF456UVW",
                      total_amount: 200000,
                      number_of_participants: 4,
                      transaction_id: 457,
                      status: "pending",
                      payment_status: "pending"
                    }
                  }, null, 2)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Required Fields:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><code>tour_package_id</code> - ID of the tour package</li>
                  <li><code>tour_date</code> - Date of the tour (YYYY-MM-DD)</li>
                  <li><code>number_of_participants</code> - Number of people</li>
                  <li><code>customer_name</code> - Customer full name</li>
                  <li><code>customer_email</code> - Customer email address</li>
                  <li><code>customer_phone</code> - Customer phone number</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant Orders */}
        <section id="restaurants" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <UtensilsCrossed className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Restaurant Orders</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Food Order</h3>
              <p className="text-gray-600 mb-4">Order food from a restaurant. Supports three order types: <strong>dine_in</strong> (with automatic table reservation), <strong>delivery</strong>, and <strong>pickup</strong>. For dine-in orders, a table is automatically reserved when you place your order.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  POST {apiBase}/orders/restaurants
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body (Dine-In Order):</h4>
                <CodeBlock
                  id="restaurant-dinein-request"
                  code={JSON.stringify({
                    restaurant_id: "restaurant-uuid",
                    order_type: "dine_in",
                    customer_name: "John Doe",
                    customer_email: "john@example.com",
                    customer_phone: "+250788123456",
                    booking_date: "2024-12-25",
                    booking_time: "19:00",
                    number_of_guests: 4,
                    table_booking_special_requests: "Window seat preferred",
                    items: [
                      {
                        menu_item_id: "menu-item-uuid",
                        quantity: 2,
                        addons: ["addon-id-1", "addon-id-2"],
                        customizations: [
                          { name: "Spice Level", value: "Medium" }
                        ]
                      }
                    ],
                    tax_amount: 0,
                    discount_amount: 0,
                    payment_method: "card",
                    special_instructions: "No onions please"
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body (Delivery Order):</h4>
                <CodeBlock
                  id="restaurant-delivery-request"
                  code={JSON.stringify({
                    restaurant_id: "restaurant-uuid",
                    order_type: "delivery",
                    customer_name: "Jane Smith",
                    customer_email: "jane@example.com",
                    customer_phone: "+250788654321",
                    delivery_address: "123 Main Street, Kigali",
                    delivery_latitude: -1.9441,
                    delivery_longitude: 30.0619,
                    items: [
                      {
                        menu_item_id: "menu-item-uuid",
                        quantity: 1,
                        addons: []
                      }
                    ],
                    delivery_fee: 2000,
                    tax_amount: 0,
                    discount_amount: 0,
                    payment_method: "mobile_money",
                    special_instructions: "Ring doorbell twice"
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body (Pickup Order):</h4>
                <CodeBlock
                  id="restaurant-pickup-request"
                  code={JSON.stringify({
                    restaurant_id: "restaurant-uuid",
                    order_type: "pickup",
                    customer_name: "Bob Johnson",
                    customer_phone: "+250788999888",
                    items: [
                      {
                        menu_item_id: "menu-item-uuid",
                        quantity: 3
                      }
                    ],
                    payment_method: "card"
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (201 Created):</h4>
                <CodeBlock
                  id="restaurant-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Order created successfully",
                    data: {
                      id: "order-uuid",
                      restaurant_id: "restaurant-uuid",
                      order_type: "dine_in",
                      customer_name: "John Doe",
                      order_status: "pending",
                      payment_status: "pending",
                      subtotal: 15000,
                      total_amount: 15000,
                      table_booking_id: 123,
                      items: [
                        {
                          id: "item-uuid",
                          menu_item_id: "menu-item-uuid",
                          item_name: "Pizza Margherita",
                          quantity: 2,
                          unit_price: 7500,
                          subtotal: 15000
                        }
                      ],
                      created_at: "2024-12-25T10:00:00.000Z"
                    }
                  }, null, 2)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Required Fields:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><code>restaurant_id</code> - ID of the restaurant</li>
                  <li><code>order_type</code> - Order type: <code>"dine_in"</code>, <code>"delivery"</code>, or <code>"pickup"</code></li>
                  <li><code>customer_name</code> - Customer full name</li>
                  <li><code>customer_phone</code> - Customer phone number</li>
                  <li><code>items</code> - Array of menu items (at least one item required)</li>
                  <li><strong>For dine_in orders:</strong> <code>booking_date</code>, <code>booking_time</code>, <code>number_of_guests</code></li>
                  <li><strong>For delivery orders:</strong> <code>delivery_address</code></li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-green-900 mb-2">💡 Note:</h4>
                <p className="text-sm text-green-800">
                  For <code>dine_in</code> orders, a table is automatically reserved when you place your order. 
                  The system checks availability and creates both the order and table booking in one transaction. 
                  You don't need to make a separate table reservation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Car Rental Bookings */}
        <section id="car-rentals" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Car className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Car Rental Bookings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Car Rental Booking</h3>
              <p className="text-gray-600 mb-4">Book a car for rental with pickup and return dates and locations.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  POST {apiBase}/bookings/car-rentals
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                <CodeBlock
                  id="car-request"
                  code={JSON.stringify({
                    car_id: 1,
                    pickup_date: "2024-12-25",
                    return_date: "2024-12-30",
                    pickup_location: "Kigali Airport",
                    return_location: "Kigali Airport",
                    customer_name: "Alice Brown",
                    customer_email: "alice@example.com",
                    customer_phone: "+250788111222",
                    driver_license_number: "DL123456",
                    special_requests: "GPS navigation required",
                    payment_method: "card"
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (201 Created):</h4>
                <CodeBlock
                  id="car-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Booking created successfully",
                    data: {
                      booking_id: 126,
                      booking_reference: "CAR-1234567890-JKL012MNO",
                      total_amount: 300000,
                      days: 5,
                      transaction_id: 458,
                      status: "pending",
                      payment_status: "pending"
                    }
                  }, null, 2)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Required Fields:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><code>car_id</code> - ID of the car</li>
                  <li><code>pickup_date</code> - Pickup date (YYYY-MM-DD)</li>
                  <li><code>return_date</code> - Return date (YYYY-MM-DD)</li>
                  <li><code>customer_name</code> - Customer full name</li>
                  <li><code>customer_email</code> - Customer email address</li>
                  <li><code>customer_phone</code> - Customer phone number</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Processing */}
        <section id="payments" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Payment Processing</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Payment</h3>
              <p className="text-gray-600 mb-4">Confirm payment for a booking transaction. Use the transaction_id from the booking response.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  POST {apiBase}/payments/:transactionId/process
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                <CodeBlock
                  id="payment-request"
                  code={JSON.stringify({
                    payment_gateway_id: "gateway_123456",
                    gateway_response: {
                      transaction_id: "gateway_txn_123",
                      status: "success",
                      payment_method: "card"
                    },
                    payment_status: "completed"
                  }, null, 2)}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="payment-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Payment processed successfully",
                    data: {
                      transaction_id: 456,
                      status: "completed",
                      booking_id: 123
                    }
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Transaction Details</h3>
              <p className="text-gray-600 mb-4">Retrieve payment transaction information.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/payments/:transactionId
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="transaction-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Transaction retrieved successfully",
                    data: {
                      transaction_id: 456,
                      booking_id: 123,
                      booking_reference: "STAY-1234567890-ABC123XYZ",
                      amount: 500000,
                      payment_method: "card",
                      status: "completed",
                      service_type: "room"
                    }
                  }, null, 2)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Payment Status</h3>
              <p className="text-gray-600 mb-4">Verify the current status of a payment transaction.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/payments/:transactionId/verify
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="verify-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Payment verified successfully",
                    data: {
                      transaction_id: 456,
                      status: "completed",
                      payment_status: "completed",
                      booking_reference: "STAY-1234567890-ABC123XYZ",
                      amount: 500000
                    }
                  }, null, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Booking Status */}
        <section id="booking-status" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-[#3CAF54]" />
            <h2 className="text-2xl font-bold text-gray-900">Booking Status</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Booking by Reference</h3>
              <p className="text-gray-600 mb-4">Retrieve booking details using the booking reference from the booking response.</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  GET {apiBase}/bookings/:bookingReference
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Example Request:</h4>
                <CodeBlock
                  id="booking-status-request"
                  code={`GET ${apiBase}/bookings/STAY-1234567890-ABC123XYZ`}
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK):</h4>
                <CodeBlock
                  id="booking-status-response"
                  code={JSON.stringify({
                    success: true,
                    message: "Booking retrieved successfully",
                    data: {
                      booking_id: 123,
                      booking_reference: "STAY-1234567890-ABC123XYZ",
                      service_type: "room",
                      total_amount: 500000,
                      status: "confirmed",
                      payment_status: "paid",
                      check_in_date: "2024-12-25",
                      check_out_date: "2024-12-30",
                      guest_name: "John Doe",
                      guest_email: "john@example.com",
                      guest_phone: "+250788123456"
                    }
                  }, null, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Error Responses */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Responses</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">400 Bad Request</h3>
              <CodeBlock
                id="error-400"
                code={JSON.stringify({
                  success: false,
                  message: "Missing required booking fields"
                }, null, 2)}
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">404 Not Found</h3>
              <CodeBlock
                id="error-404"
                code={JSON.stringify({
                  success: false,
                  message: "Booking not found"
                }, null, 2)}
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">500 Internal Server Error</h3>
              <CodeBlock
                id="error-500"
                code={JSON.stringify({
                  success: false,
                  message: "Internal server error"
                }, null, 2)}
              />
            </div>
          </div>
        </section>

        {/* Integration Examples */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">JavaScript/React Example</h3>
              <CodeBlock
                id="js-example"
                code={`// Create a booking
const createBooking = async (bookingData) => {
  try {
    const response = await fetch('${apiBase}/bookings/stays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Process payment
      await processPayment(result.data.transaction_id);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
};

// Process payment
const processPayment = async (transactionId) => {
  const response = await fetch(\`${apiBase}/payments/\${transactionId}/process\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment_gateway_id: 'gateway_123',
      gateway_response: { status: 'success' },
      payment_status: 'completed'
    })
  });
  
  return await response.json();
};`}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">cURL Example</h3>
              <CodeBlock
                id="curl-example"
                code={`# Create a stay booking
curl -X POST ${apiBase}/bookings/stays \\
  -H "Content-Type: application/json" \\
  -d '{
    "property_id": 1,
    "room_id": 1,
    "check_in_date": "2025-01-15",
    "check_out_date": "2025-01-20",
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "+250788123456",
    "number_of_adults": 2,
    "number_of_children": 1,
    "special_requests": "Late check-in please",
    "payment_method": "card"
  }'

# Process payment
curl -X POST ${apiBase}/payments/456/process \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_gateway_id": "gateway_123",
    "gateway_response": {"status": "success"},
    "payment_status": "completed"
  }'`}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-600 py-8">
          <p>For support, please contact our development team.</p>
          <p className="mt-2">API Version: 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;

