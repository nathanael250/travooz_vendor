import React from 'react';
import { Package } from 'lucide-react';

const NoTourPackagesCard = ({ onCreateClick }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tour packages found</h3>
        <p className="text-gray-600 mb-6">
          Get started by creating your first tour package
        </p>
        <button
          onClick={onCreateClick}
          className="px-6 py-3 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
        >
          Create Your First Package
        </button>
      </div>
    </div>
  );
};

export default NoTourPackagesCard;

