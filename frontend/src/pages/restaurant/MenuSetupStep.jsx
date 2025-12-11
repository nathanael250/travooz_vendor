import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Utensils, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon, Clock, DollarSign, Package, ChefHat } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';
import apiClient from '../../services/apiClient';

export default function MenuSetupStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
  const media = location.state?.media || {};
  const paymentsPricing = location.state?.paymentsPricing || {};
  const taxLegal = location.state?.taxLegal || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Get restaurantId from multiple sources
  const restaurantIdFromState = location.state?.restaurantId;
  const restaurantIdFromStorage = localStorage.getItem('restaurant_id');
  const progressFromStorage = localStorage.getItem('restaurant_setup_progress');
  
  let restaurantId = restaurantIdFromState || restaurantIdFromStorage;
  if (!restaurantId && progressFromStorage) {
    try {
      const progress = JSON.parse(progressFromStorage);
      restaurantId = progress.restaurant_id;
    } catch (e) {
      console.error('Error parsing progress from storage:', e);
    }
  }

  // Store restaurantId in localStorage
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('restaurant_id', restaurantId);
    }
  }, [restaurantId]);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

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
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const photoInputRef = useRef(null);

  // Load saved progress data when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!restaurantId) return;

      setIsLoadingProgress(true);
      try {
        console.log('📋 Loading menu data for restaurant:', restaurantId);
        
        // Fetch categories and menu items separately
        // Note: We don't filter by available=true because we want to show all items during setup
        const [categoriesRes, menuItemsRes] = await Promise.all([
          apiClient.get(`/menu-items/categories?restaurant_id=${restaurantId}`).catch((err) => {
            console.error('❌ Error fetching categories:', err);
            console.error('Error response:', err.response?.data);
            return { data: { data: [] } };
          }),
          apiClient.get(`/menu-items?restaurant_id=${restaurantId}`).catch((err) => {
            console.error('❌ Error fetching menu items:', err);
            console.error('Error response:', err.response?.data);
            return { data: { data: [] } };
          })
        ]);

        const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
        const menuItemsData = menuItemsRes.data?.data || menuItemsRes.data || [];

        console.log('📋 Raw categories response:', categoriesRes.data);
        console.log('📋 Raw menu items response:', menuItemsRes.data);
        console.log('📋 Loaded categories:', categoriesData);
        console.log('📋 Loaded menu items:', menuItemsData);
        console.log('📋 Categories count:', categoriesData.length);
        console.log('📋 Menu items count:', menuItemsData.length);

        // Load categories
        if (categoriesData && categoriesData.length > 0) {
          const categoryNames = categoriesData.map(cat => cat.name || cat);
          setCategories(categoryNames);
        }
        
        // Load menu items with proper image URLs
        if (menuItemsData && menuItemsData.length > 0) {
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
          const baseUrl = apiBaseUrl.replace('/api/v1', '');
          
          const items = menuItemsData.map(item => {
            console.log('📋 Processing menu item:', item);
            
            // Get image URL - backend returns images array
            let imageUrl = null;
            let photoPreview = null;
            
            if (item.images && Array.isArray(item.images) && item.images.length > 0) {
              // Get first image from images array
              imageUrl = item.images[0].image_url || item.images[0].url || null;
            } else if (item.image_url) {
              // Fallback to direct image_url field
              imageUrl = item.image_url;
            } else if (item.photo) {
              // Fallback to photo field
              imageUrl = item.photo;
            }
            
            // Construct full URL if it's a relative path
            if (imageUrl) {
              photoPreview = imageUrl.startsWith('http') 
                ? imageUrl 
                : `${baseUrl}${imageUrl}`;
            }

            // Addons - backend already returns as array
            const addOns = Array.isArray(item.addOns) ? item.addOns : [];

            // Customizations - backend already returns as array
            const customizations = Array.isArray(item.customizations) ? item.customizations : [];

            // Category - backend returns as 'category' field (name) or category_id
            const category = item.category || item.category_name || '';

            const processedItem = {
              name: item.name || '',
              description: item.description || '',
              category: category,
              price: parseFloat(item.price) || 0,
              discount: parseFloat(item.discount) || 0,
              availability: item.availability || (item.available === 1 || item.available === true ? 'available' : 'out_of_stock'),
              preparationTime: item.preparation_time || item.preparationTime || '',
              portionSize: item.portion_size || item.portionSize || '',
              photo: imageUrl, // Keep original URL for reference
              photoPreview: photoPreview, // Full URL for display
              addOns: addOns,
              customizations: customizations
            };
            
            console.log('📋 Processed item:', processedItem);
            return processedItem;
          });
          
          console.log('📋 All processed menu items:', items);
          setMenuItems(items);
        } else {
          console.log('📋 No menu items found in response');
        }
      } catch (error) {
        console.error('❌ Error loading saved menu:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [restaurantId]);

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
        alert('File size should be less than 5MB');
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
      alert('Add-on name is required');
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
      alert('Customization name is required');
      return;
    }
    
    const options = customizationForm.options
      .split(',')
      .map(opt => opt.trim())
      .filter(opt => opt.length > 0);
    
    if (options.length === 0) {
      alert('Please provide at least one customization option');
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

    if (!restaurantId) {
      setSubmitError('Restaurant ID is missing. Please go back to the previous step and try again.');
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
        return {
          ...item,
          id: tempId,
          tempId: tempId
        };
      });

      // Save menu setup via API
      await restaurantSetupService.saveMenuSetup(restaurantId, {
        categories,
        menuItems: menuItemsData,
        menuItemImages
      });
      
      // Navigate to next step (Review)
      navigate('/restaurant/setup/review', {
        state: {
          ...location.state,
          locationData,
          step2Data,
          businessDetails,
          media,
          paymentsPricing,
          taxLegal,
          menuSetup: { categories, menuItems },
          userId,
          email,
          userName,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving menu setup:', error);
      setSubmitError(error.message || 'Failed to save menu setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/setup/tax-legal', {
      state: {
        ...location.state,
        restaurantId: restaurantId // Pass restaurantId when going back
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-6xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  6
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  7
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Setup Step 6 of 7</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Utensils className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Menu Setup
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Create your restaurant menu by adding categories and menu items. You can add add-ons and customization options for each item.
            </p>

            {isLoadingProgress && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Loading your saved menu...</p>
              </div>
            )}

            {!restaurantId && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Restaurant ID is missing. Please go back to the previous step and complete the account creation process.
                </p>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'categories'
                    ? 'border-b-2 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'categories' ? { borderColor: '#3CAF54' } : {}}
              >
                Menu Categories
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'items'
                    ? 'border-b-2 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'items' ? { borderColor: '#3CAF54' } : {}}
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
                      className="px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                      style={{ backgroundColor: '#3CAF54' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                    >
                      {categoryForm.editingIndex !== null ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      {categoryForm.editingIndex !== null ? 'Update' : 'Add'}
                    </button>
                    {categoryForm.editingIndex !== null && (
                      <button
                        type="button"
                        onClick={() => setCategoryForm({ name: '', editingIndex: null })}
                        className="px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                        style={{ borderColor: '#d1d5db' }}
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
                        <div key={index} className="bg-white border-2 rounded-lg p-4 flex items-center justify-between" style={{ borderColor: '#dcfce7' }}>
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
                        <input
                          type="text"
                          value={itemForm.preparationTime}
                          onChange={(e) => {
                            setItemForm({ ...itemForm, preparationTime: e.target.value });
                            if (errors.preparationTime) setErrors({ ...errors, preparationTime: '' });
                          }}
                          placeholder="e.g., 15-20 minutes"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                            errors.preparationTime ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                          }`}
                        />
                      </div>
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
                        <img src={itemForm.photoPreview} alt="Dish preview" className="w-full h-48 object-cover rounded-lg border-2" style={{ borderColor: '#dcfce7' }} />
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
                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                    {itemForm.addOns.length > 0 && (
                      <div className="space-y-2">
                        {itemForm.addOns.map((addOn, index) => (
                          <div key={index} className="bg-white border-2 rounded-lg p-3 flex items-center justify-between" style={{ borderColor: '#dcfce7' }}>
                            <span className="text-sm font-medium text-gray-900">
                              {addOn.name} {addOn.price > 0 && `(+$${addOn.price.toFixed(2)})`}
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
                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <Plus className="h-4 w-4" />
                        Add Customization
                      </button>
                    </div>
                    {itemForm.customizations.length > 0 && (
                      <div className="space-y-2">
                        {itemForm.customizations.map((custom, index) => (
                          <div key={index} className="bg-white border-2 rounded-lg p-3" style={{ borderColor: '#dcfce7' }}>
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
                      className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#3CAF54' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
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
                        className="px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                        style={{ borderColor: '#d1d5db' }}
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
                        <div key={index} className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
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
                                <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
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
                                        {addOn.name} {addOn.price > 0 && `(+$${addOn.price.toFixed(2)})`}
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

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 border-t mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                style={{ borderColor: '#d1d5db' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </div>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
              >
                {isSubmitting ? (
                  <>
                    <span>Saving...</span>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

