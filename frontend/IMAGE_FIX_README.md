# Image Preview Fix for Production

## Problem
Property and room images were displaying correctly on `localhost` but showing as grey placeholders on the hosted version (`vendor.travooz.rw`).

## Root Cause
Image URLs returned from the backend are **relative paths** (e.g., `/uploads/stays/...`). While these work in development (localhost), they don't resolve correctly in production without proper URL construction.

## Solution
Added a `buildImageUrl()` helper function that:
1. Checks if the URL is already complete (http/https)
2. Gets the API base URL from environment variables
3. Combines the backend server URL with the image path
4. Works in both development and production environments

## Files Modified
✅ `src/pages/stays/PropertyImages.jsx`
✅ `src/pages/stays/MyPropertyTabbed.jsx`
✅ `src/pages/stays/MyProperty.jsx`

## Setup Instructions

### For Development (localhost)
Create a `.env` file in the frontend directory:
```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### For Production (vendor.travooz.rw)
Create a `.env.production` file in the frontend directory:
```bash
VITE_API_BASE_URL=https://vendor.travooz.rw/api/v1
```

**Note:** Replace `https://vendor.travooz.rw` with your actual production backend URL if different.

## Build for Production
```bash
npm run build
```

The Vite build process will automatically use `.env.production` when building for production.

## How It Works
The `buildImageUrl()` function:
```javascript
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Get the API base URL from environment
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  
  // Remove '/api/v1' from the base URL to get the server root
  const serverUrl = apiBaseUrl.replace('/api/v1', '');
  
  // Ensure the image URL starts with /
  const normalizedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  // Combine server URL with image path
  return `${serverUrl}${normalizedImageUrl}`;
};
```

## Testing
1. **Development:** Images should display at `http://localhost:8080/stays/dashboard/property-images`
2. **Production:** Images should display at `https://vendor.travooz.rw/stays/dashboard/property-images`

## Fallback Behavior
If an image fails to load, the `onError` handler displays a grey placeholder with "No Image" text, and logs the failed URL to the console for debugging.
