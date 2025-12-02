import React, { useState } from 'react';
import { Bed, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { staysSetupService } from '../../services/staysService';
import toast from 'react-hot-toast';

const RoomsTabContent = ({ property, onUpdate }) => {
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    roomName: '',
    roomType: '',
    roomClass: 'standard',
    smokingPolicy: 'non-smoking',
    numberOfRooms: 1,
    recommendedOccupancy: 2,
    pricingModel: 'per-day',
    baseRate: '',
    peopleIncluded: 2
  });

  const resetForm = () => {
    setRoomFormData({
      roomName: '',
      roomType: '',
      roomClass: 'standard',
      smokingPolicy: 'non-smoking',
      numberOfRooms: 1,
      recommendedOccupancy: 2,
      pricingModel: 'per-day',
      baseRate: '',
      peopleIncluded: 2
    });
  };

  const handleAddRoom = () => {
    resetForm();
    setShowAddForm(true);
    setEditingRoomId(null);
  };

  const handleEditRoom = (room) => {
    setRoomFormData({
      roomId: room.room_id,
      roomName: room.room_name || '',
      roomType: room.room_type || '',
      roomClass: room.room_class || 'standard',
      smokingPolicy: room.smoking_policy || 'non-smoking',
      numberOfRooms: room.number_of_rooms || 1,
      recommendedOccupancy: room.recommended_occupancy || 2,
      pricingModel: room.pricing_model || 'per-day',
      baseRate: room.base_rate || '',
      peopleIncluded: room.people_included || 2
    });
    setEditingRoomId(room.room_id);
    setShowAddForm(true);
  };

  const handleChange = (field, value) => {
    setRoomFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveRoom = async () => {
    // Validation
    if (!roomFormData.roomName.trim()) {
      toast.error('Room name is required');
      return;
    }
    if (!roomFormData.roomType) {
      toast.error('Room type is required');
      return;
    }
    if (!roomFormData.baseRate || parseFloat(roomFormData.baseRate) <= 0) {
      toast.error('Base rate is required and must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      await staysSetupService.saveRoom(property.property_id, roomFormData);
      toast.success(editingRoomId ? 'Room updated successfully' : 'Room added successfully');
      setShowAddForm(false);
      setEditingRoomId(null);
      resetForm();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error(error.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRoomId(null);
    resetForm();
  };

  const rooms = property?.rooms || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Rooms</h2>
        {!showAddForm && (
          <button
            onClick={handleAddRoom}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Room
          </button>
        )}
      </div>

      {/* Add/Edit Room Form */}
      {showAddForm && (
        <div className="border border-green-500 rounded-lg p-6 bg-green-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingRoomId ? 'Edit Room' : 'Add New Room'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomFormData.roomName}
                  onChange={(e) => handleChange('roomName', e.target.value)}
                  placeholder="e.g., Deluxe King Room"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={roomFormData.roomType}
                  onChange={(e) => handleChange('roomType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Twin">Twin</option>
                  <option value="Triple">Triple</option>
                  <option value="Quad">Quad</option>
                  <option value="Suite">Suite</option>
                  <option value="Studio">Studio</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Bungalow">Bungalow</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Class</label>
                <select
                  value={roomFormData.roomClass}
                  onChange={(e) => handleChange('roomClass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Policy</label>
                <select
                  value={roomFormData.smokingPolicy}
                  onChange={(e) => handleChange('smokingPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="non-smoking">Non-Smoking</option>
                  <option value="smoking">Smoking Allowed</option>
                  <option value="both">Both Available</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Rooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={roomFormData.numberOfRooms}
                  onChange={(e) => handleChange('numberOfRooms', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">How many rooms of this type?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended Occupancy <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={roomFormData.recommendedOccupancy}
                  onChange={(e) => handleChange('recommendedOccupancy', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Max guests</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">People Included</label>
                <input
                  type="number"
                  min="1"
                  value={roomFormData.peopleIncluded}
                  onChange={(e) => handleChange('peopleIncluded', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">In base rate</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
                <select
                  value={roomFormData.pricingModel}
                  onChange={(e) => handleChange('pricingModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="per-day">Per Day</option>
                  <option value="per-person">Per Person</option>
                  <option value="per-person-per-day">Per Person Per Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Rate ({property?.currency || 'RWF'}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomFormData.baseRate}
                  onChange={(e) => handleChange('baseRate', e.target.value)}
                  placeholder="Enter base rate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveRoom}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : editingRoomId ? 'Update Room' : 'Add Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms List */}
      {rooms.length > 0 ? (
        <div className="space-y-4">
          {rooms.map((room, index) => (
            <div key={room.room_id || index} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Bed className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{room.room_name}</h3>
                    <p className="text-sm text-gray-600">{room.room_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    room.room_status === 'active' ? 'bg-green-100 text-green-800' :
                    room.room_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.room_status || 'Draft'}
                  </span>
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit room"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Class:</span>
                  <p className="text-gray-900 font-medium capitalize">{room.room_class || 'Standard'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Smoking:</span>
                  <p className="text-gray-900 font-medium capitalize">{room.smoking_policy?.replace('-', ' ') || 'Non-smoking'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Rooms Available:</span>
                  <p className="text-gray-900 font-medium">{room.number_of_rooms || 1}</p>
                </div>
                <div>
                  <span className="text-gray-500">Max Occupancy:</span>
                  <p className="text-gray-900 font-medium">{room.recommended_occupancy || 'N/A'} guests</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-sm">Base Rate:</span>
                  <p className="text-lg font-bold text-green-600">
                    {room.base_rate ? `${parseFloat(room.base_rate).toLocaleString()} ${property?.currency || 'RWF'}` : 'Not set'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {room.pricing_model?.replace('-', ' ') || 'Per day'} • {room.people_included || 2} people included
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <Bed className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No rooms added yet</p>
          <p className="text-sm text-gray-500 mb-4">Start by adding your first room to make your property bookable</p>
          {!showAddForm && (
            <button
              onClick={handleAddRoom}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Your First Room
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomsTabContent;

