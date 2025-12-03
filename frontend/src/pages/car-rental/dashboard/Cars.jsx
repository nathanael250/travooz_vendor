import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Car, Search, X, Upload, Image as ImageIcon } from 'lucide-react';
import carRentalService from '../../../services/carRentalService';
import toast from 'react-hot-toast';

// Helper function to create preview URL from file
const createPreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

// Helper function to build image URL - removes /api/v1 from base URL for file serving
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
  
  // Get base URL without /api/v1
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
  
  // Ensure path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${fileBaseUrl}${normalizedPath}`;
};

const Cars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessId, setBusinessId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [managingImagesCar, setManagingImagesCar] = useState(null);
  const [imageModalImages, setImageModalImages] = useState([]);
  const [imageModalLoading, setImageModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    vendor_id: null,
    subcategory_id: 1,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    color: '',
    seat_capacity: 4,
    transmission: 'automatic',
    fuel_type: 'petrol',
    mileage: '',
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    security_deposit: 0,
    is_available: 1,
    location: '',
    description: '',
    features: [],
    images: [],
    status: 'active'
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    const businessIdFromStorage = localStorage.getItem('car_rental_business_id');
    const userData = localStorage.getItem('user');
    
    if (!businessIdFromStorage || !userData) {
      toast.error('Please login first');
      navigate('/car-rental/login');
      return;
    }

    setBusinessId(businessIdFromStorage);
    const user = JSON.parse(userData);
    setFormData(prev => ({ ...prev, vendor_id: parseInt(businessIdFromStorage) }));
    fetchCars(businessIdFromStorage);
  }, [navigate]);

  const fetchCars = async (businessId) => {
    try {
      setLoading(true);
      const response = await carRentalService.getCars(businessId);
      const carsData = response.data || [];
      
      // Process cars to ensure images is always an array
      const processedCars = carsData.map(car => {
        let images = car.images;
        
        // If images is a string, try to parse it as JSON
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            // If not JSON, treat as a single image path
            images = images ? [images] : [];
          }
        }
        
        // Ensure images is an array
        if (!Array.isArray(images)) {
          images = [];
        }
        
        console.log('Car images for', car.brand, car.model, ':', images);
        
        return {
          ...car,
          images
        };
      });
      
      setCars(processedCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('=== Uploading Files ===');
    console.log('Files selected:', files.length);
    
    const newImages = files.map((file, index) => {
      const preview = createPreviewUrl(file);
      console.log(`File ${index}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        preview: preview
      });
      
      return {
        id: Date.now() + index,
        file: file,
        preview: preview,
        isNew: true
      };
    });

    console.log('New images created:', newImages);
    console.log('Current images before:', formData.images.length);

    setFormData(prev => {
      const updated = {
        ...prev,
        images: [...prev.images, ...newImages]
      };
      console.log('Updated images after:', updated.images.length);
      return updated;
    });
    setImageFiles([...imageFiles, ...files]);
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Separate existing image URLs from new image files
      const existingImages = formData.images
        .filter(img => !img.isNew && img.url)
        .map(img => img.url);
      
      const newImageFiles = formData.images
        .filter(img => img.isNew && img.file)
        .map(img => img.file);

      console.log('=== Submitting Car ===');
      console.log('Edit mode:', !!editingCar);
      console.log('Car ID:', editingCar?.car_id);
      console.log('Existing images to keep:', existingImages);
      console.log('New image files to upload:', newImageFiles.map(f => f.name));
      console.log('Total images in form:', formData.images);

      const submitData = {
        ...formData,
        vendor_id: parseInt(businessId),
        subcategory_id: parseInt(formData.subcategory_id),
        year: parseInt(formData.year),
        seat_capacity: parseInt(formData.seat_capacity),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        daily_rate: parseFloat(formData.daily_rate),
        weekly_rate: formData.weekly_rate ? parseFloat(formData.weekly_rate) : null,
        monthly_rate: formData.monthly_rate ? parseFloat(formData.monthly_rate) : null,
        security_deposit: parseFloat(formData.security_deposit),
        is_available: formData.is_available ? 1 : 0,
        images: existingImages // Only send existing image URLs
      };

      if (editingCar) {
        // Update car data
        console.log('Calling updateCar with:', submitData, 'and', newImageFiles.length, 'new files');
        await carRentalService.updateCar(editingCar.car_id, submitData, newImageFiles);
        toast.success('Car updated successfully!');
      } else {
        // Create new car with images
        console.log('Calling createCar with:', submitData, 'and', newImageFiles.length, 'files');
        await carRentalService.createCar(submitData, newImageFiles);
        toast.success('Car created successfully!');
      }

      setShowModal(false);
      setEditingCar(null);
      resetForm();
      fetchCars(businessId);
    } catch (error) {
      console.error('Error saving car:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save car');
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    
    console.log('Editing car:', car);
    console.log('Car images raw:', car.images);
    
    // Process images - they should come as array of paths from the API
    const imageArray = Array.isArray(car.images) ? car.images : [];
    const processedImages = imageArray
      .filter(url => url) // Remove null/undefined/empty
      .map((url, idx) => {
        const fullUrl = buildImageUrl(url);
        console.log(`Processing image ${idx}:`, { original: url, built: fullUrl });
        return {
          id: Date.now() + idx, // Unique ID
          url: url, // Keep original path
          preview: fullUrl, // Full URL for display
          isNew: false
        };
      });
    
    console.log('Processed images for form:', processedImages);
    
    setFormData({
      vendor_id: car.vendor_id,
      subcategory_id: car.subcategory_id || 1,
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      license_plate: car.license_plate || '',
      color: car.color || '',
      seat_capacity: car.seat_capacity || 4,
      transmission: car.transmission || 'automatic',
      fuel_type: car.fuel_type || 'petrol',
      mileage: car.mileage || '',
      daily_rate: car.daily_rate || '',
      weekly_rate: car.weekly_rate || '',
      monthly_rate: car.monthly_rate || '',
      security_deposit: car.security_deposit || 0,
      is_available: car.is_available || 1,
      location: car.location || '',
      description: car.description || '',
      features: typeof car.features === 'string' ? JSON.parse(car.features || '[]') : (car.features || []),
      images: processedImages,
      status: car.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      await carRentalService.deleteCar(carId);
      toast.success('Car deleted successfully');
      fetchCars(businessId);
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const handleManageImages = (car) => {
    setManagingImagesCar(car);
    console.log('Managing images for car:', car);
    
    // Process existing images
    const carImages = Array.isArray(car.images) ? car.images : [];
    const processedImages = carImages
      .filter(url => url)
      .map((url, idx) => ({
        id: Date.now() + idx,
        url: url,
        preview: buildImageUrl(url),
        isNew: false
      }));
    
    setImageModalImages(processedImages);
    setShowImageModal(true);
  };

  const handleImageModalUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('Image modal - uploading files:', files.length);
    
    const newImages = files.map((file, index) => {
      const preview = createPreviewUrl(file);
      return {
        id: Date.now() + index,
        file: file,
        preview: preview,
        isNew: true
      };
    });

    setImageModalImages(prev => [...prev, ...newImages]);
  };

  const handleImageModalRemove = (imageId) => {
    setImageModalImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleImageModalSave = async () => {
    if (!managingImagesCar) return;

    try {
      setImageModalLoading(true);

      // Separate existing images from new uploads
      const existingImages = imageModalImages
        .filter(img => !img.isNew && img.url)
        .map(img => img.url);
      
      const newImageFiles = imageModalImages
        .filter(img => img.isNew && img.file)
        .map(img => img.file);

      console.log('Saving images:', {
        carId: managingImagesCar.car_id,
        existingImages,
        newFiles: newImageFiles.length
      });

      // Update car with new image list
      await carRentalService.updateCar(
        managingImagesCar.car_id,
        { images: existingImages },
        newImageFiles
      );

      toast.success('Images updated successfully!');
      setShowImageModal(false);
      setManagingImagesCar(null);
      setImageModalImages([]);
      fetchCars(businessId);
    } catch (error) {
      console.error('Error saving images:', error);
      toast.error('Failed to update images');
    } finally {
      setImageModalLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: parseInt(businessId),
      subcategory_id: 1,
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      color: '',
      seat_capacity: 4,
      transmission: 'automatic',
      fuel_type: 'petrol',
      mileage: '',
      daily_rate: '',
      weekly_rate: '',
      monthly_rate: '',
      security_deposit: 0,
      is_available: 1,
      location: '',
      description: '',
      features: [],
      images: [],
      status: 'active'
    });
    setImageFiles([]);
    setEditingCar(null);
  };

  const filteredCars = cars.filter(car =>
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.license_plate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading cars...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cars</h1>
          <p className="text-gray-600 mt-1">Manage your car fleet</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: '#3CAF54' }}
        >
          <Plus className="h-5 w-5" />
          Add Car
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search cars by brand, model, or license plate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
        />
      </div>

      {/* Cars List */}
      {filteredCars.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No cars match your search.' : 'Get started by adding your first car.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#3CAF54' }}
            >
              <Plus className="h-5 w-5" />
              Add Your First Car
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div key={car.car_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Car Image */}
              {car.images && (() => {
                const carImages = Array.isArray(car.images) ? car.images : [];
                const firstImage = carImages[0];
                const imageUrl = buildImageUrl(firstImage);
                return imageUrl ? (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-48 bg-gray-200 flex items-center justify-center"><svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
                  </div>
                );
              })()}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{car.brand} {car.model}</h3>
                    <p className="text-sm text-gray-600">{car.year} • {car.license_plate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    car.status === 'active' ? 'bg-green-100 text-green-800' :
                    car.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {car.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-semibold text-gray-900">${parseFloat(car.daily_rate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Seats:</span>
                    <span className="font-semibold text-gray-900">{car.seat_capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Transmission:</span>
                    <span className="font-semibold text-gray-900 capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className={`font-semibold ${car.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {car.is_available ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(car)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleManageImages(car)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                    title="Manage Images"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(car.car_id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCar ? 'Edit Car' : 'Add New Car'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="e.g., Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="e.g., Camry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
                  <input
                    type="text"
                    required
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="e.g., RAA123A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="e.g., Red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seat Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={formData.seat_capacity}
                    onChange={(e) => setFormData({ ...formData, seat_capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
                  <select
                    required
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                  <select
                    required
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Current mileage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="e.g., Kigali"
                  />
                </div>

                {/* Pricing */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weekly_rate}
                    onChange={(e) => setFormData({ ...formData, weekly_rate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_rate}
                    onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="0.00"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available === 1}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4 text-[#3CAF54] focus:ring-[#3CAF54] border-gray-300 rounded"
                  />
                  <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
                    Available for rent
                  </label>
                </div>

                {/* Car Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Images</label>
                  <div className="space-y-4">
                    {/* Image Upload Button */}
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3CAF54] transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload images</span>
                        <span className="text-xs text-gray-500">or drag and drop</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Image Preview Grid */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {formData.images.map((image, idx) => {
                          // Get the image source - prefer already-processed preview
                          let fullImageUrl;
                          if (image.preview) {
                            // If preview exists and is already a full URL (blob: or http), use it directly
                            fullImageUrl = image.preview;
                          } else if (image.url) {
                            // If only URL exists, build it
                            fullImageUrl = buildImageUrl(image.url);
                          } else if (typeof image === 'string') {
                            // If image is just a string path
                            fullImageUrl = buildImageUrl(image);
                          } else {
                            fullImageUrl = null;
                          }
                          
                          console.log(`Modal image preview [${idx}]:`, {
                            id: image.id,
                            isNew: image.isNew,
                            hasFile: !!image.file,
                            hasPreview: !!image.preview,
                            hasUrl: !!image.url,
                            previewValue: image.preview,
                            urlValue: image.url,
                            finalUrl: fullImageUrl,
                            imageType: typeof image
                          });
                          
                          return (
                            <div key={image.id} className="relative group">
                              {fullImageUrl ? (
                                <img
                                  src={fullImageUrl}
                                  alt="Car preview"
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                  onLoad={() => {
                                    console.log(`✓ Image ${idx} loaded successfully:`, fullImageUrl);
                                  }}
                                  onError={(e) => {
                                    console.error(`✗ Image ${idx} load error:`, fullImageUrl);
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <div className="text-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                                    <span className="text-xs text-gray-500 mt-1">No Image</span>
                                  </div>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Describe the car..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#3CAF54' }}
                >
                  {editingCar ? 'Update Car' : 'Create Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageModal && managingImagesCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manage Images</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {managingImagesCar.brand} {managingImagesCar.model} - {managingImagesCar.year}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setManagingImagesCar(null);
                    setImageModalImages([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={imageModalLoading}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Images
                  </label>
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3CAF54] transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload images</span>
                      <span className="text-xs text-gray-500">or drag and drop</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageModalUpload}
                      className="hidden"
                      disabled={imageModalLoading}
                    />
                  </label>
                </div>

                {/* Image Preview Grid */}
                {imageModalImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {imageModalImages.map((image, idx) => {
                      let fullImageUrl;
                      if (image.preview) {
                        fullImageUrl = image.preview;
                      } else if (image.url) {
                        fullImageUrl = buildImageUrl(image.url);
                      } else {
                        fullImageUrl = null;
                      }
                      
                      return (
                        <div key={image.id} className="relative group">
                          {fullImageUrl ? (
                            <img
                              src={fullImageUrl}
                              alt={`Car image ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                console.error(`Image ${idx} load error:`, fullImageUrl);
                              }}
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageModalRemove(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={imageModalLoading}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {image.isNew && (
                            <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No images yet. Upload some images above.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(false);
                    setManagingImagesCar(null);
                    setImageModalImages([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={imageModalLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImageModalSave}
                  disabled={imageModalLoading}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#3CAF54' }}
                >
                  {imageModalLoading ? 'Saving...' : 'Save Images'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;

