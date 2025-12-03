# Admin Delete Account Feature

## Overview
This feature allows administrators to permanently delete vendor accounts and all their associated data from the system. This is a powerful administrative tool that should be used with caution.

## Implementation Date
December 2, 2025

## Feature Description
Administrators can now delete vendor accounts from any service (Tours, Car Rental, Stays, Restaurant) directly from the admin dashboard. When an account is deleted:
- The vendor user account is permanently removed
- All business data is deleted
- All associated records (submissions, progress, documents, etc.) are removed
- All uploaded files references are deleted from the database

## Safety Measures
1. **Double Confirmation**: Users must confirm twice before deletion
2. **Business Name Verification**: Admin must type the exact business name to confirm
3. **Clear Warning**: Displays what will be deleted before proceeding
4. **No Undo**: Clearly states the action cannot be undone

## Backend Implementation

### 1. Service Layer
**File**: `travooz_vendor/backend/src/services/admin/adminAccounts.service.js`

Added `deleteAccount(serviceType, accountId)` method that handles deletion for all service types:

#### Car Rental Deletion
Deletes from:
- `car_rental_setup_submissions`
- `car_rental_setup_progress`
- `car_rental_vehicles`
- `car_rental_businesses`
- `car_rental_users`

#### Tours Deletion
Deletes from:
- `tours_setup_submissions`
- `tours_setup_progress`
- `tours_business_owner_info`
- `tours_identity_proof`
- `tours_business_proof`
- `tour_packages`
- `tours_businesses`
- `tours_users`

#### Stays Deletion
Deletes from:
- `stays_rooms`
- `stays_property_images`
- `stays_amenities`
- `stays_policies`
- `stays_properties`
- `stays_users`

#### Restaurant Deletion
Deletes from:
- `restaurant_tables`
- `restaurant_menus`
- `restaurant_images`
- `restaurants`
- `restaurant_users`

### 2. Controller Layer
**File**: `travooz_vendor/backend/src/controllers/admin/adminAccounts.controller.js`

Added `deleteAccount(req, res)` controller method that:
- Extracts `serviceType` and `accountId` from request params
- Validates admin authentication
- Handles UUID vs integer account IDs (restaurants use UUID)
- Calls the service layer
- Returns success/error response

### 3. Routes
**File**: `travooz_vendor/backend/src/routes/adminAccounts.routes.js`

Added route:
```javascript
router.delete('/accounts/:serviceType/:accountId', adminAccountsController.deleteAccount.bind(adminAccountsController));
```

**Full Endpoint**: `DELETE /api/v1/admin/accounts/:serviceType/:accountId`

**Authentication**: Requires admin authentication and authorization

## Frontend Implementation

### 1. Admin Service
**File**: `travooz_vendor/frontend/src/services/AdminService.js`

Added `deleteAccount(serviceType, accountId)` method:
```javascript
async deleteAccount(serviceType, accountId) {
  const response = await apiClient.delete(`/admin/accounts/${serviceType}/${accountId}`);
  return response.data;
}
```

### 2. Admin Dashboard
**File**: `travooz_vendor/frontend/src/pages/admin/AdminDashboard.jsx`

**Changes**:
- Added `Trash2` icon import from lucide-react
- Added `handleDeleteAccount(account)` function with double confirmation
- Added delete button in the actions column for each account row

**UI Location**: Delete button appears as a red trash icon in the "Actions" column of the accounts table

**Confirmation Flow**:
1. Click trash icon
2. First confirmation dialog with warning
3. Second confirmation requiring exact business name
4. Account deleted and list refreshed

### 3. Admin Account Details Page
**File**: `travooz_vendor/frontend/src/pages/admin/AdminAccountDetails.jsx`

**Changes**:
- Added `Trash2` icon import
- Added `handleDeleteAccount()` function
- Added "Delete Account" button in the header actions area

**UI Location**: Delete button appears in the top-right action buttons area, next to Approve/Reject buttons

## Usage

### From Admin Dashboard
1. Navigate to Admin Dashboard
2. Find the vendor account you want to delete
3. Click the red trash icon in the Actions column
4. Confirm the first warning dialog
5. Type the exact business name when prompted
6. Account is deleted and you're returned to the dashboard

### From Account Details Page
1. Navigate to a specific account's detail page
2. Click the "Delete Account" button in the top-right
3. Confirm the first warning dialog
4. Type the exact business name when prompted
5. Account is deleted and you're redirected to the dashboard

## API Endpoint

### Delete Account
**Method**: DELETE  
**Endpoint**: `/api/v1/admin/accounts/:serviceType/:accountId`  
**Authentication**: Required (Admin token)  
**Authorization**: Admin role required

**Path Parameters**:
- `serviceType`: One of `car_rental`, `tours`, `stays`, `restaurant`
- `accountId`: Integer (for car_rental, tours, stays) or UUID string (for restaurant)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "success": true,
    "accountId": 123,
    "serviceType": "tours",
    "message": "Account and all associated data deleted successfully"
  }
}
```

**Response Error (500)**:
```json
{
  "success": false,
  "message": "Failed to delete account",
  "error": "Error details..."
}
```

## Testing

### Manual Testing Steps
1. **Test Car Rental Deletion**:
   - Create a car rental account
   - Add vehicles and complete setup
   - Delete from admin dashboard
   - Verify all data is removed from database

2. **Test Tours Deletion**:
   - Create a tour business account
   - Submit for approval
   - Delete from account details page
   - Verify all data is removed

3. **Test Stays Deletion**:
   - Create a property
   - Add rooms and amenities
   - Delete from admin dashboard
   - Verify all data is removed

4. **Test Restaurant Deletion**:
   - Create a restaurant account
   - Add tables and menus
   - Delete from admin dashboard
   - Verify all data is removed (note: UUID handling)

5. **Test Confirmation Flow**:
   - Try to delete but cancel at first prompt
   - Try to delete but enter wrong business name
   - Successfully delete with correct business name

### Database Verification
After deletion, verify these queries return no results:
```sql
-- For Tours (example)
SELECT * FROM tours_users WHERE user_id = <deleted_user_id>;
SELECT * FROM tours_businesses WHERE tour_business_id = <deleted_business_id>;
SELECT * FROM tours_setup_submissions WHERE tour_business_id = <deleted_business_id>;
-- etc.
```

## Security Considerations

1. **Admin Only**: Only users with admin role can access this endpoint
2. **Authentication Required**: Must have valid admin token
3. **Audit Trail**: Consider adding logging for deletion actions (future enhancement)
4. **Irreversible**: No soft delete - data is permanently removed
5. **Cascading Deletes**: All related data is removed to maintain referential integrity

## Future Enhancements

1. **Soft Delete**: Add option for soft delete with ability to restore
2. **Audit Logging**: Log all deletion actions with admin user, timestamp, and reason
3. **Deletion Reason**: Require admin to provide a reason for deletion
4. **Email Notification**: Notify vendor when their account is deleted
5. **Backup Before Delete**: Create a backup of the account data before deletion
6. **Scheduled Deletion**: Allow scheduling deletion for a future date
7. **File Cleanup**: Physically delete uploaded files from server storage
8. **Batch Delete**: Allow deleting multiple accounts at once

## Notes

- File uploads are only removed from the database; physical files remain on the server
- Consider implementing a scheduled job to clean up orphaned files
- For production, consider implementing soft deletes first
- Add proper audit logging before deploying to production
- Consider data retention policies and legal requirements

## Related Files

### Backend
- `travooz_vendor/backend/src/services/admin/adminAccounts.service.js`
- `travooz_vendor/backend/src/controllers/admin/adminAccounts.controller.js`
- `travooz_vendor/backend/src/routes/adminAccounts.routes.js`

### Frontend
- `travooz_vendor/frontend/src/services/AdminService.js`
- `travooz_vendor/frontend/src/pages/admin/AdminDashboard.jsx`
- `travooz_vendor/frontend/src/pages/admin/AdminAccountDetails.jsx`

## Support

For issues or questions regarding this feature, contact the development team.









