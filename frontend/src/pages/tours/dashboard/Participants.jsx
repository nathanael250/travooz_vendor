import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, User, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tours/bookings/participants/all');
      const participantsData = response.data?.data || response.data || [];
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    return participant.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           participant.participant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           participant.tour_package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           participant.booking_id?.toString().includes(searchTerm);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading participants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="text-sm text-gray-600 mt-1">View participant details, group sizes, and communication options</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, tour package, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
          />
        </div>
      </div>

      {/* Participants Grid */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search' : 'Participants will appear here once bookings are made'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParticipants.map((participant, index) => (
            <div
              key={participant.participant_id || index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedParticipant(participant)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#3CAF54] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {participant.participant_name?.[0]?.toUpperCase() || 'P'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {participant.participant_name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {participant.tour_package_name || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {participant.participant_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{participant.participant_email}</span>
                  </div>
                )}
                {participant.participant_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{participant.participant_phone}</span>
                  </div>
                )}
                {participant.tour_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(participant.tour_date).toLocaleDateString()}</span>
                  </div>
                )}
                {participant.booking_id && (
                  <div className="text-xs text-gray-500 mt-2">
                    Booking #{participant.booking_id}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Participant Details Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Participant Details</h2>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3CAF54] flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {selectedParticipant.participant_name?.[0]?.toUpperCase() || 'P'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedParticipant.participant_name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedParticipant.tour_package_name || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                {selectedParticipant.participant_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.participant_email}</p>
                  </div>
                )}
                {selectedParticipant.participant_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.participant_phone}</p>
                  </div>
                )}
                {selectedParticipant.participant_age && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.participant_age} years</p>
                  </div>
                )}
                {selectedParticipant.participant_gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedParticipant.participant_gender}</p>
                  </div>
                )}
                {selectedParticipant.tour_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tour Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedParticipant.tour_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedParticipant.booking_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking ID</label>
                    <p className="text-sm text-gray-900">#{selectedParticipant.booking_id}</p>
                  </div>
                )}
                {selectedParticipant.emergency_contact_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                    <p className="text-sm text-gray-900">
                      {selectedParticipant.emergency_contact_name}
                      {selectedParticipant.emergency_contact_phone && 
                        ` - ${selectedParticipant.emergency_contact_phone}`}
                    </p>
                  </div>
                )}
                {selectedParticipant.dietary_restrictions && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dietary Restrictions</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.dietary_restrictions}</p>
                  </div>
                )}
                {selectedParticipant.special_needs && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Special Needs</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.special_needs}</p>
                  </div>
                )}
                {selectedParticipant.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                {selectedParticipant.participant_email && (
                  <a
                    href={`mailto:${selectedParticipant.participant_email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send Email</span>
                  </a>
                )}
                {selectedParticipant.participant_phone && (
                  <a
                    href={`tel:${selectedParticipant.participant_phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
