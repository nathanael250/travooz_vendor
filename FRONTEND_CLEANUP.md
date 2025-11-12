# Frontend Cleanup After Database Deletion

## What Happens to the Frontend?

After deleting all tour package data from the database, the frontend will have **stale data** in `localStorage` that references non-existent database records. This can cause several issues:

### Potential Issues:

1. **API Errors**: When the frontend tries to fetch data using stored `tourBusinessId`, it will get 404 errors because the records don't exist in the database.

2. **Broken Navigation**: Users might be redirected to pages that expect data to exist (e.g., `/tours/setup/complete`), but the submission status won't be found.

3. **Authentication Issues**: If users are logged in with tokens that reference deleted users, they might get authentication errors.

4. **Stale Status**: The frontend might show "pending_review" status even though the submission was deleted.

## localStorage Keys Used by Tour Package:

The following keys are stored in `localStorage`:

- `tour_business_id` - The tour business ID
- `tour_setup_data` - JSON object with setup progress data
- `tour_setup_complete` - Complete setup data
- `tour_submission_status` - Submission status (pending_review, approved, etc.)

**Note**: The following keys are shared with other modules and should NOT be cleared unless you want to log out:
- `token` / `auth_token` / `stays_token` - Authentication tokens
- `user` - User account data

## How to Clear Frontend Data:

### Option 1: Use the Cleanup Page (Recommended)

1. Open your browser and navigate to:
   ```
   http://localhost:8080/clear-tour-data.html
   ```

2. Click "Clear Tour Package Data Only" to remove only tour-related data
   - OR -
   Click "Clear All Data" if you also want to log out

### Option 2: Clear via Browser Console

Open your browser's Developer Console (F12) and run:

```javascript
// Clear only tour package data
localStorage.removeItem('tour_business_id');
localStorage.removeItem('tour_setup_data');
localStorage.removeItem('tour_setup_complete');
localStorage.removeItem('tour_submission_status');
console.log('✅ Tour package data cleared');
```

### Option 3: Clear All localStorage (Nuclear Option)

⚠️ **Warning**: This will log you out and clear ALL data:

```javascript
localStorage.clear();
console.log('✅ All localStorage cleared');
```

### Option 4: Manual Browser Clear

1. Open Browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click on "Local Storage" → `http://localhost:8080`
4. Delete the tour-related keys manually:
   - `tour_business_id`
   - `tour_setup_data`
   - `tour_setup_complete`
   - `tour_submission_status`

## After Clearing:

1. **Refresh the page** or navigate to `/tours/list-your-tour` to start fresh
2. The tour setup flow will work as if it's the first time
3. All new data will be saved to the database

## Verification:

After clearing, you can verify by running this in the browser console:

```javascript
console.log('tour_business_id:', localStorage.getItem('tour_business_id'));
console.log('tour_setup_data:', localStorage.getItem('tour_setup_data'));
console.log('tour_setup_complete:', localStorage.getItem('tour_setup_complete'));
console.log('tour_submission_status:', localStorage.getItem('tour_submission_status'));
```

All should return `null`.

## Recommended Workflow:

1. ✅ Delete database data (using `delete_all_tours_data.sql`)
2. ✅ Clear frontend localStorage (using cleanup page or console)
3. ✅ Refresh browser or restart frontend
4. ✅ Start fresh tour setup flow

