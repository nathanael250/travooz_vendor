import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Package, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';

const SchedulesAvailability = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({ start: '', end: '', capacity: '' });

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      fetchPackageSchedules(selectedPackage);
    }
  }, [selectedPackage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      let businessId = localStorage.getItem('tour_business_id');
      if (!businessId) {
        const response = await apiClient.get('/tours/businesses/my');
        const businesses = response.data?.data || response.data || [];
        if (businesses.length > 0) {
          businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
          if (businessId) {
            localStorage.setItem('tour_business_id', businessId);
          }
        }
      }

      if (businessId) {
        const response = await apiClient.get(`/tours/packages/business/${businessId}`);
        const packagesData = response.data?.data || response.data || [];
        setPackages(packagesData);
        if (packagesData.length > 0 && !selectedPackage) {
          setSelectedPackage(packagesData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageSchedules = async (pkg) => {
    try {
      const packageId = pkg.id || pkg.package_id;
      const response = await apiClient.get(`/tours/packages/${packageId}`);
      if (response.data.success && response.data.data) {
        const packageData = response.data.data;
        setSchedules(packageData.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to fetch schedules');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isDateInRange = (date, startDate, endDate) => {
    if (!date || !startDate) return false;
    const dateKey = getDateKey(date);
    const startKey = getDateKey(new Date(startDate));
    if (!endDate) return dateKey === startKey;
    const endKey = getDateKey(new Date(endDate));
    return dateKey >= startKey && dateKey <= endKey;
  };

  const getTimeSlotsForDate = (date) => {
    if (!date || !schedules.length) return [];
    
    const dateKey = getDateKey(date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const timeSlots = [];

    // Check each schedule
    schedules.forEach(schedule => {
      // Check if date is in schedule range
      if (isDateInRange(date, schedule.start_date, schedule.end_date)) {
        // Check for exceptions first
        if (schedule.exceptions && schedule.exceptions.length > 0) {
          const exception = schedule.exceptions.find(ex => {
            const exDate = new Date(ex.exception_date || ex.date);
            return getDateKey(exDate) === dateKey;
          });
          
          if (exception && exception.timeSlots && exception.timeSlots.length > 0) {
            exception.timeSlots.forEach(slot => {
              const startHour = slot.start_hour || slot.startHour || 0;
              const startMinute = slot.start_minute || slot.startMinute || 0;
              const endHour = slot.end_hour || slot.endHour || 0;
              const endMinute = slot.end_minute || slot.endMinute || 0;
              timeSlots.push({
                start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
                end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
                capacity: slot.capacity || 'Unlimited',
                isException: true
              });
            });
            return; // Exception overrides weekly schedule
          }
        }

        // Check weekly schedule
        if (schedule.weeklySchedule && schedule.weeklySchedule[dayName]) {
          const daySchedule = schedule.weeklySchedule[dayName];
          if (daySchedule && daySchedule.length > 0) {
            daySchedule.forEach(slot => {
              const startHour = slot.start_hour || slot.startHour || 0;
              const startMinute = slot.start_minute || slot.startMinute || 0;
              const endHour = slot.end_hour || slot.endHour || 0;
              const endMinute = slot.end_minute || slot.endMinute || 0;
              timeSlots.push({
                start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
                end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
                capacity: slot.capacity || 'Unlimited',
                isException: false
              });
            });
          }
        }
      }
    });

    return timeSlots;
  };

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.start || !newTimeSlot.end) {
      toast.error('Please enter both start and end times');
      return;
    }
    setTimeSlots([...timeSlots, { ...newTimeSlot, id: Date.now() }]);
    setNewTimeSlot({ start: '', end: '', capacity: '' });
  };

  const handleRemoveTimeSlot = (id) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleSaveSchedule = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (timeSlots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }
    
    // TODO: Save to backend
    toast.success('Schedule added successfully');
    setShowAddModal(false);
    setSelectedDate(null);
    setTimeSlots([]);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules & Availability</h1>
          <p className="text-sm text-gray-600 mt-1">Configure time slots, seasonal availability, and weekly schedules</p>
        </div>
        {selectedPackage && (
          <button
            onClick={() => navigate(`/tours/dashboard/packages/create/${selectedPackage.id || selectedPackage.package_id}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Package</span>
          </button>
        )}
      </div>

      {/* Package Selector */}
      {packages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Package</label>
          <select
            value={selectedPackage ? (selectedPackage.id || selectedPackage.package_id) : ''}
            onChange={(e) => {
              const pkg = packages.find(p => (p.id || p.package_id).toString() === e.target.value);
              setSelectedPackage(pkg);
            }}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
          >
            {packages.map((pkg) => {
              const id = pkg.id || pkg.package_id;
              const name = pkg.title || pkg.name || 'Unnamed Package';
              return (
                <option key={id} value={id}>{name}</option>
              );
            })}
          </select>
        </div>
      )}

      {packages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tour packages found</h3>
          <p className="text-gray-600 mb-6">Create a tour package to manage schedules and availability</p>
          <button
            onClick={() => navigate('/tours/dashboard/packages/create')}
            className="px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
          >
            Create Package
          </button>
        </div>
      ) : selectedPackage && (
        <>
          {/* Calendar View */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Availability Calendar</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-base font-medium text-gray-900 min-w-[160px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-16"></div>;
                }

                const dateTimeSlots = getTimeSlotsForDate(date);
                const isToday = getDateKey(date) === getDateKey(today);
                const isPast = date < today;
                const hasAvailability = dateTimeSlots.length > 0;
                const isSelected = selectedDate && getDateKey(date) === getDateKey(selectedDate);

                return (
                  <div
                    key={getDateKey(date)}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDate(date);
                        setTimeSlots(dateTimeSlots.map((slot, idx) => ({ ...slot, id: idx })));
                        setShowAddModal(true);
                      }
                    }}
                    className={`
                      h-16 border rounded p-1 cursor-pointer transition-all text-xs
                      ${isPast ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50' : 'hover:border-[#3CAF54] hover:bg-green-50'}
                      ${isToday ? 'border-2 border-blue-500 bg-blue-50' : 'border-gray-200'}
                      ${isSelected ? 'border-[#3CAF54] bg-green-100' : ''}
                      ${hasAvailability ? 'bg-green-50 border-green-200' : ''}
                    `}
                  >
                    <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                    {hasAvailability && (
                      <div className="space-y-0.5">
                        {dateTimeSlots.slice(0, 1).map((slot, idx) => (
                          <div key={idx} className="text-[10px] text-green-700 truncate leading-tight">
                            {slot.start}-{slot.end}
                          </div>
                        ))}
                        {dateTimeSlots.length > 1 && (
                          <div className="text-[10px] text-green-600 leading-tight">+{dateTimeSlots.length - 1}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Details */}
          {schedules.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h2>
              <div className="space-y-4">
                {schedules.map((schedule, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{schedule.schedule_name || 'Default Schedule'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {schedule.start_date && new Date(schedule.start_date).toLocaleDateString()}
                          {schedule.end_date && ` - ${new Date(schedule.end_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    {/* Weekly Schedule */}
                    {schedule.weeklySchedule && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Weekly Schedule</h4>
                        <div className="grid grid-cols-7 gap-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                            const daySchedule = schedule.weeklySchedule[day];
                            return (
                              <div key={day} className="border border-gray-200 rounded p-2">
                                <div className="text-xs font-medium text-gray-700 capitalize mb-1">{day.substring(0, 3)}</div>
                                {daySchedule && daySchedule.length > 0 ? (
                                  <div className="space-y-1">
                                    {daySchedule.map((slot, slotIdx) => {
                                      const startHour = slot.start_hour || slot.startHour || 0;
                                      const startMinute = slot.start_minute || slot.startMinute || 0;
                                      const endHour = slot.end_hour || slot.endHour || 0;
                                      const endMinute = slot.end_minute || slot.endMinute || 0;
                                      return (
                                        <div key={slotIdx} className="text-xs text-gray-600">
                                          {String(startHour).padStart(2, '0')}:{String(startMinute).padStart(2, '0')} - {String(endHour).padStart(2, '0')}:{String(endMinute).padStart(2, '0')}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">Closed</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Exceptions */}
                    {schedule.exceptions && schedule.exceptions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Exception Dates</h4>
                        <div className="space-y-2">
                          {schedule.exceptions.map((exception, exIdx) => (
                            <div key={exIdx} className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                              <CalendarIcon className="h-4 w-4 text-yellow-600" />
                              <span>{new Date(exception.exception_date || exception.date).toLocaleDateString()}</span>
                              {exception.timeSlots && exception.timeSlots.length > 0 && (
                                <span className="text-gray-500">
                                  • {exception.timeSlots.length} time slot(s)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Schedule Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {timeSlots.length > 0 ? 'Edit' : 'Add'} Schedule for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="time"
                    value={newTimeSlot.start}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Start"
                  />
                  <input
                    type="time"
                    value={newTimeSlot.end}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="End"
                  />
                  <input
                    type="number"
                    value={newTimeSlot.capacity}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, capacity: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
                    placeholder="Capacity"
                  />
                  <button
                    onClick={handleAddTimeSlot}
                    className="px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42]"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {timeSlots.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {timeSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {slot.start} - {slot.end} (Capacity: {slot.capacity || 'Unlimited'})
                        </span>
                        <button
                          onClick={() => handleRemoveTimeSlot(slot.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveSchedule}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
              >
                <span>Save Schedule</span>
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDate(null);
                  setTimeSlots([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesAvailability;
