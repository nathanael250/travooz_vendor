import React from 'react';

export default function StaysFooter() {
  return (
    <footer className="bg-white border-t mt-auto" style={{ borderColor: '#dcfce7' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Travooz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

