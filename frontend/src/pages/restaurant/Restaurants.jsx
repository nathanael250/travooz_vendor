import { useEffect, useState } from 'react';
import { restaurantsAPI, imagesAPI } from '../../services/restaurantDashboardService';
import { Plus, Edit, Trash2, Store, MapPin, Phone, Users, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 0,
    available_seats: 0,
    address: '',
    phone: '',
    status: 'active',
    image_url: '',
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const updated = {};
        restaurants.forEach(restaurant => {
          if (restaurant.images && restaurant.images.length > 1) {
            const currentIndex = prev[restaurant.id] || 0;
            updated[restaurant.id] = (currentIndex + 1) % restaurant.images.length;
          }
        });
        return { ...prev, ...updated };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [restaurants]);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantsAPI.getAll();
      
      // Fetch images for each restaurant
      const restaurantsWithData = await Promise.all(
        data.map(async (restaurant) => {
          try {
            const images = await imagesAPI.getByEntity('restaurant', restaurant.id);
            return {
              ...restaurant,
              images: images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            };
          } catch (error) {
            return {
              ...restaurant,
              images: []
            };
          }
        })
      );
      
      // Sort by created_at descending
      const sorted = restaurantsWithData.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setRestaurants(sorted);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const restaurantData = {
        ...formData,
        image_url: formData.image_url || null,
        available_seats: formData.available_seats || formData.capacity,
      };
      
      let restaurantId;
      
      if (editingId) {
        await restaurantsAPI.update(editingId, restaurantData);
        restaurantId = editingId;
        toast.success('Restaurant updated successfully');
      } else {
        const newRestaurant = await restaurantsAPI.create(restaurantData);
        restaurantId = newRestaurant.id;
        toast.success('Restaurant created successfully');
      }

      // Save images if any
      if (imagePreviews.length > 0) {
        try {
          const imagesToSave = imagePreviews.map((url, index) => ({
            image_url: url,
            display_order: index,
            is_primary: index === 0 ? true : false
          }));
          
          await imagesAPI.add('restaurant', restaurantId, imagesToSave);
        } catch (imageError) {
          console.error('Error saving images:', imageError);
          toast.error('Restaurant saved but some images may not have been saved');
        }
      }

      setDialogOpen(false);
      resetForm();
      fetchRestaurants();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error(error.message || 'Failed to save restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingId(restaurant.id);
    setFormData({
      name: restaurant.name || '',
      description: restaurant.description || '',
      capacity: restaurant.capacity || 0,
      available_seats: restaurant.available_seats || 0,
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      status: restaurant.status || 'active',
      image_url: restaurant.image_url || '',
    });
    // Load existing images
    const existingImages = restaurant.images?.map(img => img.image_url) || [];
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
      await restaurantsAPI.delete(deletingId);
      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: 0,
      available_seats: 0,
      address: '',
      phone: '',
      status: 'active',
      image_url: '',
    });
    setImagePreviews([]);
    setEditingId(null);
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_IMAGES = 2;
    const currentCount = imagePreviews.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed for restaurants`);
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

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Active</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">Inactive</span>;
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your restaurant locations</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Restaurant
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Restaurant Locations ({restaurants.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {restaurants.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Restaurant Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Capacity</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Available Seats</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {restaurant.images && restaurant.images.length > 0 ? (
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-md border-2 border-gray-200 shadow-sm overflow-hidden bg-gray-100">
                            <img
                              key={restaurant.images[currentImageIndex[restaurant.id] || 0]?.id}
                              src={restaurant.images[currentImageIndex[restaurant.id] || 0]?.image_url}
                              alt={`${restaurant.name} ${(currentImageIndex[restaurant.id] || 0) + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                          {restaurant.images.length > 1 && (
                            <>
                              <button
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/80 hover:bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentIndex = currentImageIndex[restaurant.id] || 0;
                                  const newIndex = currentIndex === 0 ? restaurant.images.length - 1 : currentIndex - 1;
                                  setCurrentImageIndex({ ...currentImageIndex, [restaurant.id]: newIndex });
                                }}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                              <button
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/80 hover:bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentIndex = currentImageIndex[restaurant.id] || 0;
                                  const newIndex = currentIndex === restaurant.images.length - 1 ? 0 : currentIndex + 1;
                                  setCurrentImageIndex({ ...currentImageIndex, [restaurant.id]: newIndex });
                                }}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white/80 px-1.5 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                {(currentImageIndex[restaurant.id] || 0) + 1} / {restaurant.images.length}
                              </div>
                            </>
                          )}
                        </div>
                      ) : restaurant.image_url && restaurant.image_url.length > 100 && restaurant.image_url.startsWith('data:image') ? (
                        <div className="w-20 h-20 rounded-md border-2 border-gray-200 shadow-sm overflow-hidden">
                          <img
                            src={restaurant.image_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-md border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{restaurant.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {restaurant.description || <span className="italic">No description</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{restaurant.capacity || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-medium border border-gray-300 rounded">
                        {restaurant.available_seats || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {restaurant.address ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-[200px]" title={restaurant.address}>
                            {restaurant.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No address</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {restaurant.phone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {restaurant.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No phone</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(restaurant.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(restaurant)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(restaurant.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
                No restaurants yet. Add your first restaurant to get started!
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Restaurant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter restaurant name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[60px]"
                    placeholder="Describe your restaurant..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Images (Max 2)
                  </label>
                  <div className="space-y-2">
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md border border-gray-300"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {index === 0 && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {imagePreviews.length < 2 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <label
                          htmlFor="images"
                          className="cursor-pointer flex flex-col items-center gap-1"
                        >
                          <span className="text-sm text-gray-600">
                            Click to upload images ({imagePreviews.length}/2)
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG, GIF up to 5MB each
                          </span>
                        </label>
                        <input
                          id="images"
                          type="file"
                          accept="image/*,.jpeg,.jpg,.png,.gif"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    placeholder="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Seats
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max={formData.capacity}
                      placeholder="0"
                      value={formData.available_seats}
                      onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter restaurant address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+250799393729"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Restaurant' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the restaurant
              and all associated data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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

export default Restaurants;

