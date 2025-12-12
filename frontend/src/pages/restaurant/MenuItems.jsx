import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuItemsAPI, restaurantsAPI, imagesAPI } from '../../services/restaurantDashboardService';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, ChevronLeft, ChevronRight, Upload, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuItems = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    available: true,
    restaurant_id: '',
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchRestaurants();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedRestaurant]);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const updated = {};
        menuItems.forEach(item => {
          if (item.images && item.images.length > 1) {
            const currentIndex = prev[item.id] || 0;
            updated[item.id] = (currentIndex + 1) % item.images.length;
          }
        });
        return { ...prev, ...updated };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [menuItems]);

  const fetchRestaurants = async () => {
    try {
      // Vendor has one restaurant - get it automatically
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      if (myRestaurant) {
        setRestaurants([myRestaurant]);
        setSelectedRestaurant(myRestaurant.id);
      }
    } catch (error) {
      toast.error('Failed to fetch restaurant');
    }
  };

  const fetchMenuItems = async () => {
    try {
      // No need to pass restaurant_id - API automatically uses vendor's restaurant
      const data = await menuItemsAPI.getAll();
      
      const restaurantsData = await restaurantsAPI.getAll();
      const restaurantsMap = new Map(restaurantsData.map(r => [r.id, r.name]));
      
      const itemsWithData = await Promise.all(
        data.map(async (item) => {
          try {
            const images = await imagesAPI.getByEntity('menu_item', item.id);
            return {
              ...item,
              restaurants: { name: restaurantsMap.get(item.restaurant_id) || '' },
              images: images.sort((a, b) => a.display_order - b.display_order)
            };
          } catch (error) {
            return {
              ...item,
              restaurants: { name: restaurantsMap.get(item.restaurant_id) || '' },
              images: []
            };
          }
        })
      );
      
      const sorted = itemsWithData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMenuItems(sorted);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.restaurants?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const duplicate = menuItems.find(
          item => 
            item.id !== editingId &&
            item.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
            item.restaurant_id === formData.restaurant_id
        );
        
        if (duplicate) {
          toast.error(`A menu item with the name "${formData.name}" already exists in this restaurant`);
          setLoading(false);
          return;
        }

        await menuItemsAPI.update(editingId, {
          ...formData,
          price: Number(formData.price),
        });
        
        // Update images
        try {
          const existingItem = menuItems.find(item => item.id === editingId);
          if (existingItem?.images && existingItem.images.length > 0) {
            const deletePromises = existingItem.images.map(async (img) => {
              try {
                await imagesAPI.delete(img.id);
              } catch (err) {
                console.warn('Error deleting image:', err);
              }
            });
            await Promise.all(deletePromises);
          }
          
          if (imagePreviews.length > 0) {
            const imagesToSave = imagePreviews.map((url, index) => ({
              image_url: url,
              display_order: index,
              is_primary: index === 0 ? true : false
            }));
            
            await new Promise(resolve => setTimeout(resolve, 100));
            await imagesAPI.add('menu_item', editingId, imagesToSave);
          }
        } catch (imageError) {
          console.error('Error saving images:', imageError);
          toast.error(`Failed to save images: ${imageError.message || 'Unknown error'}`);
        }
        
        toast.success('Menu item updated successfully');
      } else {
        const duplicate = menuItems.find(
          item => 
            item.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
            item.restaurant_id === formData.restaurant_id
        );
        
        if (duplicate) {
          toast.error(`A menu item with the name "${formData.name}" already exists in this restaurant`);
          setLoading(false);
          return;
        }

        // Ensure available is explicitly set to true if not provided
        const menuItemData = {
          ...formData,
          price: Number(formData.price),
          available: formData.available !== undefined ? formData.available : true, // Default to true
        };
        
        const newMenuItem = await menuItemsAPI.create(menuItemData);
        
        if (imagePreviews.length > 0) {
          try {
            const imagesToSave = imagePreviews.map((url, index) => ({
              image_url: url,
              display_order: index,
              is_primary: index === 0 ? true : false
            }));
            
            await imagesAPI.add('menu_item', newMenuItem.id, imagesToSave);
          } catch (imageError) {
            console.error('Error saving images:', imageError);
            toast.warning('Menu item created but some images may not have been saved');
          }
        }
        
        toast.success('Menu item created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      available: item.available,
      restaurant_id: item.restaurant_id,
    });
    const existingImages = item.images?.map(img => img.image_url) || [];
    setImagePreviews(existingImages);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await menuItemsAPI.delete(deletingId);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await menuItemsAPI.update(id, { available: !currentStatus });
      toast.success(`Menu item ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const resetForm = () => {
    // Auto-set restaurant_id to selected restaurant if available
    const defaultRestaurantId = selectedRestaurant && selectedRestaurant !== 'all' 
      ? selectedRestaurant 
      : (restaurants.length > 0 ? restaurants[0].id : '');
    
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      available: true, // Default to available
      restaurant_id: defaultRestaurantId,
    });
    setImagePreviews([]);
    setEditingId(null);
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_IMAGES = 3;
    const currentCount = imagePreviews.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed for menu items`);
      e.target.value = '';
      return;
    }

    const validFiles = [];
    let invalidFiles = 0;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles++;
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles++;
        return;
      }

      validFiles.push(file);
    });

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be uploaded. Maximum ${MAX_IMAGES} images allowed.`);
    }

    if (invalidFiles > 0) {
      toast.error(`${invalidFiles} file(s) were invalid. Only images under 5MB are allowed.`);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const newPreviews = [];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        newPreviews.push(base64String);
        loadedCount++;
        
        if (loadedCount === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food & Menu Items</h1>
          <p className="text-sm text-gray-600 mt-1">Dashboard &gt; All menu items</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/restaurant/menu-items/create')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md flex items-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            Create Menu
          </button>
          <button
            onClick={() => {
              resetForm(); // Reset form with default values including restaurant_id
              setDialogOpen(true);
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create new Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-[200px]">
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Restaurants</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Menu Items ({filteredMenuItems.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {filteredMenuItems.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Image</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Restaurant</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Price</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700">Availability</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {item.images && item.images.length > 0 ? (
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-md border-2 border-gray-200 shadow-sm overflow-hidden bg-gray-100">
                            <img
                              key={item.images[currentImageIndex[item.id] || 0]?.id}
                              src={item.images[currentImageIndex[item.id] || 0]?.image_url}
                              alt={`${item.name} ${(currentImageIndex[item.id] || 0) + 1}`}
                              className="w-full h-full object-cover transition-opacity duration-300"
                            />
                          </div>
                          {item.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentIndex = currentImageIndex[item.id] || 0;
                                  const newIndex = currentIndex === 0 ? item.images.length - 1 : currentIndex - 1;
                                  setCurrentImageIndex({ ...currentImageIndex, [item.id]: newIndex });
                                }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/80 hover:bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentIndex = currentImageIndex[item.id] || 0;
                                  const newIndex = currentIndex === item.images.length - 1 ? 0 : currentIndex + 1;
                                  setCurrentImageIndex({ ...currentImageIndex, [item.id]: newIndex });
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/80 hover:bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white/80 px-1.5 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                {(currentImageIndex[item.id] || 0) + 1} / {item.images.length}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-md border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="font-medium py-3 px-4 text-sm min-w-[180px]">
                      <span className="block truncate" title={item.name}>
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs border border-gray-300 rounded-md">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[120px]">
                      <span className="text-xs truncate block" title={item.restaurants?.name || 'N/A'}>
                        {item.restaurants?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="font-medium text-xs">frw {item.price?.toLocaleString()}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => toggleAvailability(item.id, item.available)}
                        className={`px-2 py-1 text-xs border rounded-md cursor-pointer ${
                          item.available 
                            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery || selectedRestaurant !== 'all' 
                  ? 'No menu items found matching your filters' 
                  : 'No menu items yet. Add your first menu item to get started!'}
              </p>
              {(!searchQuery && selectedRestaurant === 'all') && (
                <button
                  onClick={() => {
              resetForm(); // Reset form with default values including restaurant_id
              setDialogOpen(true);
            }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Menu Item
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant *</label>
                <select
                  value={formData.restaurant_id}
                  onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select restaurant</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (frw) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select category</option>
                    <option value="Food">Food</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                <select
                  value={formData.available ? 'available' : 'unavailable'}
                  onChange={(e) => setFormData({ ...formData, available: e.target.value === 'available' })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (Max 3)</label>
                <div className="space-y-2">
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {imagePreviews.length < 3 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center">
                      <ImageIcon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                      <label className="cursor-pointer flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-600">
                          Click to upload images ({imagePreviews.length}/3)
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, JPEG, GIF up to 5MB each
                        </span>
                        <input
                          type="file"
                          accept="image/*,.jpeg,.jpg,.png,.gif"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {imagePreviews.length >= 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      Maximum 3 images reached
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Menu Item' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the menu item.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;

