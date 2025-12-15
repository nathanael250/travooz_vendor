/**
 * Utility function to handle errors in stays onboarding
 * Clears localStorage and redirects to login if user/property is not found
 */
export const handleStaysError = (error, navigate) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || '';
  
  // Check if it's a "not found" error (404) or property/user not found
  const isNotFound = 
    status === 404 || 
    message.toLowerCase().includes('not found') ||
    message.toLowerCase().includes('property not found') ||
    message.toLowerCase().includes('user not found') ||
    message.toLowerCase().includes('does not exist');

  if (isNotFound || status === 401 || status === 403) {
    // Clear all stays-related localStorage data
    const staysKeys = [
      'stays_property_id',
      'stays_user_id',
      'stays_token',
      'stays_contract_accepted',
      'stays_policies',
      'stays_amenities',
      'stays_rooms',
      'stays_property_images',
      'stays_room_images',
      'stays_setup_complete',
      'stays_property_status',
      'stays_rooms',
      'token',
      'auth_token'
    ];

    staysKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('stays_user');

    // Redirect to login
    navigate('/stays/login', { replace: true });
    
    return true; // Indicates error was handled
  }

  return false; // Error was not handled, let caller handle it
};

