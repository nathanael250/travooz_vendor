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

## Debugging

I've added extensive console logging to help debug the issue. When you visit the Property Images page, open your browser's Developer Tools (F12) and check the Console tab.

You should see logs like:
```
🔧 VITE_API_BASE_URL: https://vendor.travooz.rw/api/v1
🔧 API Base URL being used: https://vendor.travooz.rw/api/v1
🔧 Server root URL: https://vendor.travooz.rw
🖼️ Final image URL: https://vendor.travooz.rw/uploads/stays/property-images/filename.jpg (from /uploads/stays/property-images/filename.jpg)
```

### Common Issues:

1. **VITE_API_BASE_URL not set**: If you see `(not set, using default)`, create the `.env.production` file
2. **Wrong server URL**: Check that the constructed URL matches your actual backend domain
3. **CORS issues**: Check the Network tab (F12 -> Network) to see if image requests are being blocked
4. **404 errors**: Image file doesn't exist on the server - check that uploads are being saved correctly

### Next Steps:

Please do the following and report back:
1. Visit `https://vendor.travooz.rw/stays/dashboard/property-images` 
2. Open Browser Console (F12 -> Console tab)
3. Take a screenshot of the console logs
4. Also check the Network tab (F12 -> Network) and filter by "Img" to see if image requests are failing
5. Share what you see!
