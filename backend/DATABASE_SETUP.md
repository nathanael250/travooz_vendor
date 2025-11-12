# Database Setup for travoozapp_db

## Current Database: `travoozapp_db`

The backend is now configured to use `travoozapp_db` as the unified database.

## Existing Tables

The database already contains stays tables:
- `stays_users` - User accounts for stays service
- `stays_properties` - Property listings
- `stays_property_*` - All property-related tables
- `stays_rooms` - Room configurations
- `stays_room_*` - All room-related tables
- `stays_email_verifications` - Email verification codes
- `stays_bookings` - Booking records

## Configuration

Update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=travoozapp_db
```

## User Tables

Currently using:
- **`stays_users`** - For stays service users (temporary, will be merged later)
- **`users`** - Main users table (for other services)

The auth middleware checks both tables for authentication.

## Next Steps

1. **Test the backend:**
   ```bash
   cd travooz_vendor/backend
   npm install
   npm run dev
   ```

2. **Verify database connection:**
   - Check console for "✅ Database connected successfully!"
   - Test API endpoints

3. **Future Migration:**
   - Merge `stays_users` into `users` table
   - Update foreign keys to reference `users` instead of `stays_users`
   - This can be done later without breaking existing functionality

## API Endpoints

All stays endpoints are available at:
- `/api/v1/stays/*` - Stays service routes
- `/api/v1/admin/stays/*` - Admin routes

