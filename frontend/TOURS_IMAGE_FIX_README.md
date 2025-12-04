# Tours Dashboard Image Preview Fix

## Problem
Tour package images were not displaying correctly on the hosted version (vendor.travooz.rw), showing as grey placeholders instead.

## Solution
Applied the same `buildImageUrl()` helper function fix to the Tours dashboard that was used for the Stays dashboard.

## Files Modified
✅ `src/pages/tours/dashboard/ViewTourPackage.jsx`
✅ `src/pages/tours/dashboard/CreateTourPackage.jsx`

## Changes Made

### ViewTourPackage.jsx
- Added `buildImageUrl()` helper function
- Updated image src to use `buildImageUrl(photoUrl)` 
- Added console error logging for failed image loads
- Added `[Tours]` prefix to logs for easy identification

### CreateTourPackage.jsx
- Added `buildImageUrl()` helper function
- Replaced the old incomplete URL building logic (that only prepended `apiBaseUrl` to `/uploads/` paths)
- New logic properly removes `/api/v1` from the base URL
- Handles File objects (blob URLs) correctly - doesn't transform them
- Added console error logging for failed image loads

## How It Works

The `buildImageUrl()` function:
1. Returns empty string if no URL provided
2. Returns URL as-is if it's already absolute (http/https)
3. Gets `VITE_API_BASE_URL` from environment variables
4. Removes `/api/v1` to get the server root
5. Combines server root with the image path

**Example:**
- Input: `/uploads/tours/photo123.jpg`
- Environment: `VITE_API_BASE_URL=https://vendor.travooz.rw/api/v1`
- Output: `https://vendor.travooz.rw/uploads/tours/photo123.jpg`

## Environment Setup

The same `.env.production` file works for both Stays and Tours:

```bash
VITE_API_BASE_URL=https://vendor.travooz.rw/api/v1
```

## Testing

1. **Development (localhost):**
   - Visit: `http://localhost:5173/tours/dashboard/packages`
   - Create or view a tour package with images
   - Images should load from `http://localhost:5000/uploads/tours/...`

2. **Production (vendor.travooz.rw):**
   - Visit: `https://vendor.travooz.rw/tours/dashboard/packages`
   - View or edit a tour package with images
   - Images should load from `https://vendor.travooz.rw/uploads/tours/...`

## Debugging

Open Browser Console (F12) to see logs:
- `✅ [Tours] Image URL is already absolute: ...` - URL didn't need transformation
- `🔧 [Tours] VITE_API_BASE_URL: ...` - Environment variable value
- `🖼️ [Tours] Final image URL: ...` - Final constructed URL
- `[Tours] Failed to load image: ...` - Image load error

## Note for CreateTourPackage

Special handling for File objects:
- When users upload new photos, they're File objects with `blob:` URLs
- The function checks for `blob:` prefix and skips URL transformation
- Only server-returned URLs (from existing/saved images) get transformed

This ensures both new uploads AND saved images display correctly!

---

## Additional Fix: Media Library

### Problem
The Tours Media Library page was also affected - images displayed locally but showed as generic file icons on production.

### Files Modified (Updated)
✅ `src/pages/tours/dashboard/ViewTourPackage.jsx`
✅ `src/pages/tours/dashboard/CreateTourPackage.jsx`
✅ `src/pages/tours/dashboard/MediaLibrary.jsx` ⬅️ **NEW**

### Changes Made in MediaLibrary.jsx

1. **Added `buildImageUrl()` helper function** with `[Tours Media]` log prefix
2. **Updated Gallery Grid Images** - Line ~413
   - Applied `buildImageUrl()` to photo thumbnails
   - Added error handling with placeholder
3. **Updated Modal View Images** - Line ~596
   - Applied `buildImageUrl()` to full-size modal view
   - Added error handling
4. **Upload Preview** - NO CHANGE NEEDED
   - Uses blob URLs from `URL.createObjectURL()` 
   - Already works correctly

### Testing the Media Library

1. **Development:**
   ```
   http://localhost:5173/tours/dashboard/media
   ```

2. **Production:**
   ```
   https://vendor.travooz.rw/tours/dashboard/media
   ```

### Expected Results

✅ Photo thumbnails display correctly in the grid
✅ Primary photos show with yellow "Primary" badge
✅ Click to view full-size image in modal
✅ Upload preview works (uses blob URLs)
✅ Search and filter by package name

### Console Logs to Look For

When viewing the Media Library page:
```
🔧 [Tours Media] VITE_API_BASE_URL: https://vendor.travooz.rw/api/v1
🔧 [Tours Media] API Base URL being used: https://vendor.travooz.rw/api/v1
🔧 [Tours Media] Server root URL: https://vendor.travooz.rw
🖼️ [Tours Media] Final image URL: https://vendor.travooz.rw/uploads/tours/photo123.jpg
```

If images fail to load, you'll see:
```
[Tours Media] Failed to load image: /uploads/tours/photo123.jpg
```
