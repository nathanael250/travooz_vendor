import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, User, Search, X, Phone, Mail, Calendar, Upload, ChevronDown, Check } from 'lucide-react';
import carRentalService from '../../../services/carRentalService';
import toast from 'react-hot-toast';

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const Drivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessId, setBusinessId] = useState(null);
  const [languagesDropdownOpen, setLanguagesDropdownOpen] = useState(false);
  const languagesDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    vendor_id: null,
    name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry_date: '',
    address: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    experience_years: 0,
    languages: [],
    is_available: 1,
    status: 'active',
    profile_photo: '',
    documents: [],
    notes: ''
  });

  const availableLanguages = [
    'English',
    'Kinyarwanda',
    'French',
    'Swahili',
    'Luganda',
    'Kirundi',
    'Arabic',
    'Spanish',
    'German',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Other'
  ];

  useEffect(() => {
    const businessIdFromStorage = localStorage.getItem('car_rental_business_id');
    const userData = localStorage.getItem('user');
    
    if (!businessIdFromStorage || !userData) {
      toast.error('Please login first');
      navigate('/car-rental/login');
      return;
    }

    setBusinessId(businessIdFromStorage);
    setFormData(prev => ({ ...prev, vendor_id: parseInt(businessIdFromStorage) }));
    fetchDrivers(businessIdFromStorage);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languagesDropdownRef.current && !languagesDropdownRef.current.contains(event.target)) {
        setLanguagesDropdownOpen(false);
      }
    };

    if (languagesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languagesDropdownOpen]);

  const fetchDrivers = async (businessId) => {
    try {
      setLoading(true);
      const response = await carRentalService.getDrivers(businessId);
      setDrivers(response.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64Image = await fileToBase64(file);
      setFormData(prev => ({
        ...prev,
        profile_photo: base64Image
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error converting image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_photo: ''
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => {
      const currentLanguages = Array.isArray(prev.languages) ? prev.languages : [];
      if (currentLanguages.includes(language)) {
        return {
          ...prev,
          languages: currentLanguages.filter(lang => lang !== language)
        };
      } else {
        return {
          ...prev,
          languages: [...currentLanguages, language]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert languages array to comma-separated string for storage
      const languagesString = Array.isArray(formData.languages) 
        ? formData.languages.join(', ') 
        : formData.languages || '';

      const submitData = {
        ...formData,
        vendor_id: parseInt(businessId),
        experience_years: parseInt(formData.experience_years) || 0,
        is_available: formData.is_available ? 1 : 0,
        profile_photo: formData.profile_photo || null,
        languages: languagesString
      };

      if (editingDriver) {
        await carRentalService.updateDriver(editingDriver.driver_id, submitData);
        toast.success('Driver updated successfully');
      } else {
        await carRentalService.createDriver(submitData);
        toast.success('Driver created successfully');
      }

      setShowModal(false);
      setEditingDriver(null);
      resetForm();
      fetchDrivers(businessId);
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error(error.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      vendor_id: driver.vendor_id,
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      license_number: driver.license_number || '',
      license_expiry_date: driver.license_expiry_date || '',
      address: driver.address || '',
      date_of_birth: driver.date_of_birth || '',
      emergency_contact_name: driver.emergency_contact_name || '',
      emergency_contact_phone: driver.emergency_contact_phone || '',
      experience_years: driver.experience_years || 0,
      languages: driver.languages ? (typeof driver.languages === 'string' ? driver.languages.split(',').map(l => l.trim()).filter(l => l) : driver.languages) : [],
      is_available: driver.is_available || 1,
      status: driver.status || 'active',
      profile_photo: driver.profile_photo || '',
      documents: typeof driver.documents === 'string' ? JSON.parse(driver.documents || '[]') : (driver.documents || []),
      notes: driver.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      await carRentalService.deleteDriver(driverId);
      toast.success('Driver deleted successfully');
      fetchDrivers(businessId);
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver');
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: parseInt(businessId),
      name: '',
      email: '',
      phone: '',
      license_number: '',
      license_expiry_date: '',
      address: '',
      date_of_birth: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      experience_years: 0,
      languages: [],
      is_available: 1,
      status: 'active',
      profile_photo: '',
      documents: [],
      notes: ''
    });
    setEditingDriver(null);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading drivers...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Drivers</h1>
          <p className="text-gray-600 mt-1">Manage your driver information</p>
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
          Add Driver
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search drivers by name, phone, or license number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
        />
      </div>

      {/* Drivers List */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No drivers match your search.' : 'Get started by adding your first driver.'}
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
              Add Your First Driver
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div key={driver.driver_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {driver.profile_photo ? (
                      <img
                        src={driver.profile_photo}
                        alt={driver.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">{driver.license_number}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    driver.status === 'active' ? 'bg-green-100 text-green-800' :
                    driver.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {driver.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{driver.phone}</span>
                    </div>
                  )}
                  {driver.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{driver.email}</span>
                    </div>
                  )}
                  {driver.experience_years > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{driver.experience_years} years experience</span>
                    </div>
                  )}
                  {driver.languages && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="font-medium min-w-[70px]">Languages:</span>
                      <span className="flex-1">
                        {typeof driver.languages === 'string' 
                          ? driver.languages 
                          : (Array.isArray(driver.languages) ? driver.languages.join(', ') : '')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className={`font-semibold ${driver.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {driver.is_available ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver.driver_id)}
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
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
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
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Driver full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="+250 788 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="driver@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Driver address"
                  />
                </div>

                {/* Profile Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                  <div className="space-y-4">
                    {formData.profile_photo ? (
                      <div className="relative inline-block">
                        <img
                          src={formData.profile_photo}
                          alt="Driver profile"
                          className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-[#3CAF54] transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-xs text-gray-600">Upload Photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    {!formData.profile_photo && (
                      <p className="text-xs text-gray-500">Click to upload driver profile photo</p>
                    )}
                  </div>
                </div>

                {/* License Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">License Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="License number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry Date</label>
                  <input
                    type="date"
                    value={formData.license_expiry_date}
                    onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="0"
                  />
                </div>

                <div className="relative" ref={languagesDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <button
                    type="button"
                    onClick={() => setLanguagesDropdownOpen(!languagesDropdownOpen)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54] bg-white text-left flex items-center justify-between"
                  >
                    <span className={Array.isArray(formData.languages) && formData.languages.length > 0 
                      ? 'text-gray-900' 
                      : 'text-gray-500'}>
                      {Array.isArray(formData.languages) && formData.languages.length > 0
                        ? formData.languages.join(', ')
                        : 'Select languages...'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${languagesDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  {languagesDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {availableLanguages.map((language) => {
                          const isSelected = Array.isArray(formData.languages) && formData.languages.includes(language);
                          return (
                            <label
                              key={language}
                              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors"
                              onClick={() => handleLanguageToggle(language)}
                            >
                              <div className={`flex items-center justify-center w-5 h-5 border-2 rounded ${
                                isSelected 
                                  ? 'bg-[#3CAF54] border-[#3CAF54]' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className={`text-sm flex-1 ${isSelected ? 'text-[#3CAF54] font-medium' : 'text-gray-700'}`}>
                                {language}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {Array.isArray(formData.languages) && formData.languages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#3CAF54] text-white text-sm rounded-full"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => handleLanguageToggle(lang)}
                            className="hover:bg-[#2d8f3f] rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="+250 788 123 456"
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
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
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
                    Available for assignments
                  </label>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Additional notes about the driver..."
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
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;

