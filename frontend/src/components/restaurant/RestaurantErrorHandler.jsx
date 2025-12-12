import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogOut } from 'lucide-react';
import { handleRestaurantNotFound } from '../../utils/restaurantAuth';

/**
 * Component to display restaurant error with logout option
 * Used when restaurant is not found or access is denied
 */
export default function RestaurantErrorHandler({ error, message }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    handleRestaurantNotFound();
  };
  
  const errorMessage = message || 
                       error?.response?.data?.message || 
                       error?.response?.data?.error || 
                       error?.message || 
                       'Restaurant not found or access denied';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 rounded-full p-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {errorMessage}
          </p>
          
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            Your restaurant may have been deleted or you no longer have access. Please log in again.
          </p>
          
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout & Go to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}


