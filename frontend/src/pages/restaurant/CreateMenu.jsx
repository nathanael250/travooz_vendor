import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon, Clock, DollarSign, Package, ChefHat, Save } from 'lucide-react';
import { restaurantSetupService } from '../../services/eatingOutService';
import { restaurantsAPI, menuItemsAPI } from '../../services/restaurantDashboardService';
import toast from 'react-hot-toast';

export default function CreateMenu() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'items'
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    editingIndex: null
  });

  // Menu item form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount: '',
    availability: 'available',
    preparationTime: '',
    portionSize: '',
    photo: null,
    photoPreview: null,
    addOns: [],
    customizations: [],
    editingIndex: null
  });

  // Add-on form state
  const [addOnForm, setAddOnForm] = useState({
    name: '',
    price: ''
  });

  // Customization form state
  const [customizationForm, setCustomizationForm] = useState({
    name: '',
    options: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const photoInputRef = useRef(null);

  const portionSizes = [
    { value: '', label: '-- Select Portion Size (Optional) --' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  useEffect(() => {
    // Verify we're on the correct route
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/restaurant/menu-items/create')) {
      console.warn('Unexpected route path:', currentPath);
    }
    
    // Verify we have a token before making API calls
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      console.error('No token found - should redirect to restaurant login');
      // Don't navigate here - let RestaurantDashboardLayout handle it
      return;
    }
    
    console.log('Token found, proceeding with API calls');
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchExistingData();
    }
  }, [restaurant]);

  const fetchRestaurant = async () => {
    try {
      // Double-check token before making request
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        console.error('No token available for API call');
        // Don't navigate - let layout handle it
        return;
      }
      
      console.log('Fetching restaurant with token available');
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      if (myRestaurant) {
        setRestaurant(myRestaurant);
      } else {
        toast.error('Restaurant not found. Please complete your restaurant setup.');
        navigate('/restaurant/restaurants', { replace: true });
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Don't redirect here - let RestaurantDashboardLayout handle it
        // But also don't clear tokens - let the layout component handle authentication
        console.log('Authentication error detected, but not clearing tokens - letting layout handle it');
        console.log('Current path:', window.location.pathname);
        // Don't show toast - the layout will handle the redirect
        // toast.error('Authentication required. Please log in again.');
        return;
      }
      
      toast.error('Failed to fetch restaurant information');
    }
  };

  const fetchExistingData = async () => {
    try {
      // Fetch categories
      try {
        const categoriesData = await menuItemsAPI.getCategories();
        if (categoriesData && categoriesData.length > 0) {
          const categoryNames = categoriesData.map(cat => cat.name);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // If it's a 401, don't let it propagate - the layout will handle auth
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication error in fetchExistingData - stopping further API calls');
          // Don't throw - just stop here and let the layout handle it
          return;
        }
        // Continue even if categories fail for other errors
      }

      // Fetch menu items
      try {
        const itemsData = await menuItemsAPI.getAll();
        if (itemsData && itemsData.length > 0) {
        const mappedItems = itemsData.map(item => {
          // Get first image if available
          let photoPreview = null;
          if (item.images && item.images.length > 0) {
            const imageUrl = item.images[0].image_url;
            if (imageUrl) {
              // Normalize image URL
              if (imageUrl.startsWith('http')) {
                photoPreview = imageUrl;
              } else if (imageUrl.startsWith('/')) {
                photoPreview = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${imageUrl}`;
              } else {
                photoPreview = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads${imageUrl}`;
              }
            }
          } else if (item.image_url) {
            const imageUrl = item.image_url;
            if (imageUrl.startsWith('http')) {
              photoPreview = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              photoPreview = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${imageUrl}`;
            } else {
              photoPreview = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads${imageUrl}`;
            }
          }

          return {
            name: item.name || '',
            description: item.description || '',
            category: item.category || '', // Use category name from API
            price: item.price ? parseFloat(item.price) : 0,
            discount: item.discount ? parseFloat(item.discount) : null,
            availability: item.availability || 'available',
            preparationTime: item.preparation_time || '',
            portionSize: item.portion_size || null,
            photo: null, // We don't have the file, only the URL
            photoPreview: photoPreview,
            addOns: item.addOns || [],
            customizations: item.customizations || []
          };
        });
        setMenuItems(mappedItems);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // If it's a 401, don't let it propagate - the layout will handle auth
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication error in fetchExistingData (menu items) - stopping');
          // Don't throw - just stop here
          return;
        }
        // Continue even if menu items fail for other errors - it's okay if there's no existing data
      }
    } catch (error) {
      console.error('Error fetching existing menu data:', error);
      // If it's a 401, don't let it propagate
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error in fetchExistingData - stopping');
        return;
      }
      // Don't show error toast - it's okay if there's no existing data
    }
  };

  // Category Management
  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) {
      setErrors({ categoryName: 'Category name is required' });
      return;
    }
    
    if (categoryForm.editingIndex !== null) {
      // Edit existing category
      const updated = [...categories];
      updated[categoryForm.editingIndex] = categoryForm.name.trim();
      setCategories(updated);
    } else {
      // Add new category
      setCategories([...categories, categoryForm.name.trim()]);
    }
    
    setCategoryForm({ name: '', editingIndex: null });
    setErrors({});
  };

  const handleEditCategory = (index) => {
    setCategoryForm({
      name: categories[index],
      editingIndex: index
    });
  };

  const handleDeleteCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
    
    // Update menu items that use this category
    const updatedItems = menuItems.map(item => {
      if (item.category === categories[index]) {
        return { ...item, category: '' };
      }
      return item;
    });
    setMenuItems(updatedItems);
  };

  // Menu Item Management
  const handleAddMenuItem = () => {
    const newErrors = {};
    
    if (!itemForm.name.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    if (!itemForm.category) {
      newErrors.itemCategory = 'Category is required';
    }
    if (!itemForm.price || parseFloat(itemForm.price) <= 0) {
      newErrors.itemPrice = 'Valid price is required';
    }
    if (!itemForm.preparationTime.trim()) {
      newErrors.preparationTime = 'Estimated preparation time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newItem = {
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      category: itemForm.category,
      price: parseFloat(itemForm.price),
      discount: itemForm.discount ? parseFloat(itemForm.discount) : null,
      availability: itemForm.availability,
      preparationTime: itemForm.preparationTime.trim(),
      portionSize: itemForm.portionSize || null,
      photo: itemForm.photo,
      photoPreview: itemForm.photoPreview,
      addOns: [...itemForm.addOns],
      customizations: [...itemForm.customizations]
    };

    if (itemForm.editingIndex !== null) {
      // Edit existing item
      const updated = [...menuItems];
      updated[itemForm.editingIndex] = newItem;
      setMenuItems(updated);
    } else {
      // Add new item
      setMenuItems([...menuItems, newItem]);
    }

    // Reset form
    setItemForm({
      name: '',
      description: '',
      category: '',
      price: '',
      discount: '',
      availability: 'available',
      preparationTime: '',
      portionSize: '',
      photo: null,
      photoPreview: null,
      addOns: [],
      customizations: [],
      editingIndex: null
    });
    setErrors({});
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleEditMenuItem = (index) => {
    const item = menuItems[index];
    setItemForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price.toString(),
      discount: item.discount ? item.discount.toString() : '',
      availability: item.availability,
      preparationTime: item.preparationTime,
      portionSize: item.portionSize || '',
      photo: item.photo,
      photoPreview: item.photoPreview,
      addOns: [...item.addOns],
      customizations: [...item.customizations],
      editingIndex: index
    });
    setActiveTab('items');
  };

  const handleDeleteMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setItemForm(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemForm(prev => ({ ...prev, photoPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setItemForm(prev => ({
      ...prev,
      photo: null,
      photoPreview: null
    }));
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Add-on Management
  const handleAddAddOn = () => {
    if (!addOnForm.name.trim()) {
      toast.error('Add-on name is required');
      return;
    }
    
    const newAddOn = {
      name: addOnForm.name.trim(),
      price: addOnForm.price ? parseFloat(addOnForm.price) : 0
    };
    
    setItemForm(prev => ({
      ...prev,
      addOns: [...prev.addOns, newAddOn]
    }));
    
    setAddOnForm({ name: '', price: '' });
  };

  const handleDeleteAddOn = (index) => {
    setItemForm(prev => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index)
    }));
  };

  // Customization Management
  const handleAddCustomization = () => {
    if (!customizationForm.name.trim()) {
      toast.error('Customization name is required');
      return;
    }
    
    const options = customizationForm.options
      .split(',')
      .map(opt => opt.trim())
      .filter(opt => opt.length > 0);
    
    if (options.length === 0) {
      toast.error('Please provide at least one customization option');
      return;
    }
    
    const newCustomization = {
      name: customizationForm.name.trim(),
      options: options
    };
    
    setItemForm(prev => ({
      ...prev,
      customizations: [...prev.customizations, newCustomization]
    }));
    
    setCustomizationForm({ name: '', options: '' });
  };

  const handleDeleteCustomization = (index) => {
    setItemForm(prev => ({
      ...prev,
      customizations: prev.customizations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!restaurant) {
      toast.error('Restaurant information not found');
      return;
    }
    
    if (categories.length === 0) {
      setSubmitError('Please add at least one menu category');
      setActiveTab('categories');
      return;
    }
    
    if (menuItems.length === 0) {
      setSubmitError('Please add at least one menu item');
      setActiveTab('items');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare menu data with images
      const menuItemImages = {};
      const menuItemsData = menuItems.map((item, index) => {
        const tempId = `item_${index}`;
        if (item.photo) {
          menuItemImages[tempId] = item.photo;
        }
        // Ensure availability defaults to 'available' for new items
        const itemAvailability = item.availability || 'available';
        const itemAvailable = item.available !== undefined 
          ? item.available 
          : (itemAvailability === 'available' || itemAvailability === '' || !itemAvailability);
        
        return {
          ...item,
          // Ensure backend-friendly availability fields: include both the string `availability`
          // and a boolean `available` so different endpoints that expect either form will behave
          // consistently. This prevents new items from being treated as unavailable by default.
          availability: itemAvailability,
          available: itemAvailable,
          id: tempId,
          tempId: tempId
        };
      });

      // Save menu setup via API
      await restaurantSetupService.saveMenuSetup(restaurant.id, {
        categories,
        menuItems: menuItemsData,
        menuItemImages
      });
      
      toast.success('Menu saved successfully!');
      
      // Navigate back to menu items page
      navigate('/restaurant/menu-items');
    } catch (error) {
      console.error('Error saving menu:', error);
      setSubmitError(error.message || 'Failed to save menu. Please try again.');
      toast.error(error.message || 'Failed to save menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Menu</h1>
          <p className="text-sm text-gray-600 mt-1">Create your restaurant menu by adding categories and menu items</p>
        </div>
        <button
          onClick={() => navigate('/restaurant/menu-items')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'border-b-2 text-green-600 border-green-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Menu Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'items'
                ? 'border-b-2 text-green-600 border-green-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Menu Items ({menuItems.length})
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Menu Category</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => {
                    setCategoryForm({ ...categoryForm, name: e.target.value });
                    if (errors.categoryName) setErrors({ ...errors, categoryName: '' });
                  }}
                  placeholder="e.g., Starters, Main Dishes, Desserts, Drinks"
                  className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.categoryName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  {categoryForm.editingIndex !== null ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {categoryForm.editingIndex !== null ? 'Update' : 'Add'}
                </button>
                {categoryForm.editingIndex !== null && (
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ name: '', editingIndex: null })}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {errors.categoryName && (
                <p className="mt-2 text-sm text-red-600">{errors.categoryName}</p>
              )}
            </div>

            {/* Categories List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Categories ({categories.length})</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No categories added yet. Add your first category above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <span className="font-medium text-gray-900">{category}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {itemForm.editingIndex !== null ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => {
                      setItemForm({ ...itemForm, name: e.target.value });
                      if (errors.itemName) setErrors({ ...errors, itemName: '' });
                    }}
                    placeholder="e.g., Grilled Chicken"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.itemName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.itemName && (
                    <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => {
                      setItemForm({ ...itemForm, category: e.target.value });
                      if (errors.itemCategory) setErrors({ ...errors, itemCategory: '' });
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.itemCategory ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.itemCategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.itemCategory}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (ingredients, taste, notes)
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Describe the dish, its ingredients, taste, and any special notes..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                />
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => {
                        setItemForm({ ...itemForm, price: e.target.value });
                        if (errors.itemPrice) setErrors({ ...errors, itemPrice: '' });
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.itemPrice ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.itemPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.itemPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount/Offer (Optional)
                  </label>
                  <input
                    type="number"
                    value={itemForm.discount}
                    onChange={(e) => setItemForm({ ...itemForm, discount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status *
                  </label>
                  <select
                    value={itemForm.availability}
                    onChange={(e) => setItemForm({ ...itemForm, availability: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  >
                    {availabilityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preparation Time and Portion Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Preparation Time *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    {/* Simplified: provide common ranges to choose from to avoid free-text entry */}
                    <select
                      value={itemForm.preparationTimeOption || itemForm.preparationTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          // open custom input with empty value
                          setItemForm({ ...itemForm, preparationTimeOption: 'custom', preparationTime: '' });
                        } else {
                          setItemForm({ ...itemForm, preparationTimeOption: val, preparationTime: val });
                          if (errors.preparationTime) setErrors({ ...errors, preparationTime: '' });
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.preparationTime ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    >
                      <option value="">-- Select preparation time --</option>
                      <option value="Under 10 minutes">Under 10 minutes</option>
                      <option value="10-15 minutes">10-15 minutes</option>
                      <option value="15-20 minutes">15-20 minutes</option>
                      <option value="20-30 minutes">20-30 minutes</option>
                      <option value="30-45 minutes">30-45 minutes</option>
                      <option value="45-60 minutes">45-60 minutes</option>
                      <option value=">60 minutes">60+ minutes</option>
                      <option value="custom">Custom (minutes)</option>
                    </select>
                  </div>
                  {itemForm.preparationTimeOption === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="number"
                        min="1"
                        value={itemForm.preparationMinutes || ''}
                        onChange={(e) => {
                          const mins = e.target.value;
                          setItemForm({ ...itemForm, preparationMinutes: mins, preparationTime: mins ? `${mins} minutes` : '' });
                          if (errors.preparationTime) setErrors({ ...errors, preparationTime: '' });
                        }}
                        placeholder="e.g., 25"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                      />
                    </div>
                  )}
                  {errors.preparationTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.preparationTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portion Size (Optional)
                  </label>
                  <select
                    value={itemForm.portionSize}
                    onChange={(e) => setItemForm({ ...itemForm, portionSize: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  >
                    {portionSizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dish Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Photo
                </label>
                {itemForm.photoPreview ? (
                  <div className="relative">
                    <img src={itemForm.photoPreview} alt="Dish preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload dish photo</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG - max 5MB</p>
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Add-ons Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-ons (e.g., extra cheese, sauce)</h3>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={addOnForm.name}
                    onChange={(e) => setAddOnForm({ ...addOnForm, name: e.target.value })}
                    placeholder="Add-on name (e.g., Extra Cheese)"
                    className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                  <input
                    type="number"
                    value={addOnForm.price}
                    onChange={(e) => setAddOnForm({ ...addOnForm, price: e.target.value })}
                    placeholder="Price (optional)"
                    min="0"
                    step="0.01"
                    className="w-32 px-4 py-2 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddOn}
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                {itemForm.addOns.length > 0 && (
                  <div className="space-y-2">
                    {itemForm.addOns.map((addOn, index) => (
                      <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {addOn.name} {addOn.price > 0 && `(+RWF ${addOn.price.toLocaleString()})`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddOn(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customization Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization Options (e.g., "no onions," "spicy level")</h3>
                <div className="space-y-4 mb-4">
                  <input
                    type="text"
                    value={customizationForm.name}
                    onChange={(e) => setCustomizationForm({ ...customizationForm, name: e.target.value })}
                    placeholder="Customization name (e.g., Spicy Level)"
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                  <input
                    type="text"
                    value={customizationForm.options}
                    onChange={(e) => setCustomizationForm({ ...customizationForm, options: e.target.value })}
                    placeholder="Options (comma-separated, e.g., Mild, Medium, Hot)"
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomization}
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Customization
                  </button>
                </div>
                {itemForm.customizations.length > 0 && (
                  <div className="space-y-2">
                    {itemForm.customizations.map((custom, index) => (
                      <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">{custom.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomization(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {custom.options.map((opt, optIndex) => (
                            <span key={optIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add/Update Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleAddMenuItem}
                  className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {itemForm.editingIndex !== null ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {itemForm.editingIndex !== null ? 'Update Item' : 'Add Item'}
                </button>
                {itemForm.editingIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setItemForm({
                        name: '',
                        description: '',
                        category: '',
                        price: '',
                        discount: '',
                        availability: 'available',
                        preparationTime: '',
                        portionSize: '',
                        photo: null,
                        photoPreview: null,
                        addOns: [],
                        customizations: [],
                        editingIndex: null
                      });
                      if (photoInputRef.current) {
                        photoInputRef.current.value = '';
                      }
                    }}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Menu Items List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Menu Items ({menuItems.length})</h3>
              {menuItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No menu items added yet. Add your first item above.</p>
              ) : (
                <div className="space-y-4">
                  {menuItems.map((item, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex gap-4">
                        {item.photoPreview && (
                          <img src={item.photoPreview} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.category}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditMenuItem(index)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMenuItem(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="font-semibold text-gray-900">RWF {item.price.toLocaleString()}</span>
                            {item.discount && (
                              <span className="text-green-600">Discount: ${item.discount.toFixed(2)}</span>
                            )}
                            <span className={`px-2 py-1 rounded ${item.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.availability === 'available' ? 'Available' : 'Out of Stock'}
                            </span>
                            <span className="text-gray-600">⏱ {item.preparationTime}</span>
                            {item.portionSize && (
                              <span className="text-gray-600">📦 {item.portionSize}</span>
                            )}
                          </div>
                          {item.addOns.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Add-ons:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.addOns.map((addOn, addOnIndex) => (
                                  <span key={addOnIndex} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                    {addOn.name} {addOn.price > 0 && `(+RWF ${addOn.price.toLocaleString()})`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.customizations.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Customizations:</p>
                              <div className="space-y-1">
                                {item.customizations.map((custom, customIndex) => (
                                  <div key={customIndex} className="text-xs">
                                    <span className="font-medium text-gray-700">{custom.name}:</span>
                                    <span className="ml-2 text-gray-600">{custom.options.join(', ')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-4 pt-8 border-t mt-8">
          <button
            type="button"
            onClick={() => navigate('/restaurant/menu-items')}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Menu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

