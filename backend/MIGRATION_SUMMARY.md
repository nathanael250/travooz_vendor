# Stays Backend Migration Summary

## ✅ Successfully Migrated from `travooz_stay_backend`

All stays backend code has been migrated to `travooz_vendor/backend` and organized by service.

## 📁 File Structure

```
travooz_vendor/backend/
├── src/
│   ├── services/
│   │   └── stays/
│   │       ├── staysProperty.service.js          ✅ Migrated
│   │       ├── propertySetup.service.js          ✅ Migrated
│   │       └── emailVerification.service.js      ✅ Migrated
│   │
│   ├── controllers/
│   │   └── stays/
│   │       ├── staysProperty.controller.js       ✅ Migrated
│   │       ├── propertySetup.controller.js       ✅ Migrated
│   │       ├── emailVerification.controller.js  ✅ Migrated
│   │       └── adminProperty.controller.js      ✅ Migrated
│   │
│   ├── models/
│   │   └── stays/
│   │       └── staysProperty.model.js           ✅ Migrated
│   │
│   ├── routes/
│   │   ├── stays.routes.js                       ✅ Migrated
│   │   └── admin.routes.js                       ✅ Migrated
│   │
│   ├── utils/
│   │   ├── response.utils.js                     ✅ Migrated
│   │   ├── validation.js                         ✅ Migrated
│   │   └── email.service.js                      ✅ Migrated
│   │
│   └── middlewares/
│       └── auth.middleware.js                    ✅ Already exists (unified)
│
├── config/
│   └── database.js                               ✅ Updated (unified DB)
│
└── server.js                                     ✅ Updated (routes registered)
```

## 🔄 Key Changes Made

### 1. Database References Updated
- ✅ Changed `stays_users` → `users` (main users table)
- ✅ All queries now use unified `travooz_database`
- ✅ Updated JOIN queries to use `users` table

### 2. Import Paths Updated
- ✅ All imports updated to match new folder structure
- ✅ Services: `../../services/stays/...`
- ✅ Controllers: `../../controllers/stays/...`
- ✅ Models: `../../models/stays/...`
- ✅ Utils: `../../utils/...`
- ✅ Database: `../../../config/database`

### 3. Routes Registered
- ✅ `/api/v1/stays/*` - Stays service routes
- ✅ `/api/v1/admin/stays/*` - Admin routes for stays

### 4. Services Organized
- ✅ `staysProperty.service.js` - Property CRUD operations
- ✅ `propertySetup.service.js` - Setup flow (10 steps)
- ✅ `emailVerification.service.js` - Email verification

### 5. Controllers Organized
- ✅ `staysProperty.controller.js` - Property endpoints
- ✅ `propertySetup.controller.js` - Setup endpoints
- ✅ `emailVerification.controller.js` - Verification endpoints
- ✅ `adminProperty.controller.js` - Admin endpoints

## 📋 API Endpoints Available

### Stays Service (`/api/v1/stays`)
- `POST /properties` - Create property
- `GET /properties/my` - Get my properties (auth required)
- `GET /properties/by-user/:userId` - Get properties by user ID
- `GET /properties/:id` - Get property by ID
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `POST /email-verification/send` - Send verification code
- `POST /email-verification/verify` - Verify code
- `POST /setup/contract` - Save contract (auth)
- `POST /setup/policies` - Save policies (auth)
- `POST /setup/amenities` - Save amenities (auth)
- `POST /setup/room` - Save room (auth)
- `POST /setup/promotions` - Save promotions (auth)
- `POST /setup/images` - Save images (auth)
- `POST /setup/taxes` - Save tax details (auth)
- `POST /setup/connectivity` - Save connectivity (auth)
- `GET /setup/status/:propertyId` - Get setup status (auth)
- `POST /setup/submit` - Submit listing (auth)

### Admin Routes (`/api/v1/admin/stays`)
- `GET /properties` - Get all properties (with filters)
- `GET /properties/stats` - Get property statistics
- `GET /properties/:id` - Get property details
- `PATCH /properties/:id/status` - Update property status

## 🗄️ Database Tables Used

All tables use the `stays_` prefix in the unified `travooz_database`:
- `stays_properties`
- `stays_property_policies`
- `stays_property_amenities`
- `stays_property_promotions`
- `stays_property_images`
- `stays_property_tax_details`
- `stays_property_connectivity`
- `stays_rooms`
- `stays_room_beds`
- `stays_room_amenities`
- `stays_room_rate_plans`
- `stays_room_images`
- `stays_email_verifications`
- `users` (main users table - shared)

## ✅ Next Steps

1. **Test the migration:**
   ```bash
   cd travooz_vendor/backend
   npm install
   npm run dev
   ```

2. **Verify database connection:**
   - Ensure `.env` is configured with correct database credentials
   - Database should be `travooz_database` (unified)

3. **Test API endpoints:**
   - Use Postman or curl to test the migrated endpoints
   - Verify authentication works correctly

4. **Migrate frontend:**
   - Next: Migrate stays frontend pages to `travooz_vendor/frontend`

## 📝 Notes

- All user creation now uses the main `users` table
- Email verification codes stored in `stays_email_verifications` (service-specific)
- Admin routes require authentication (role check can be added later)
- All services use the unified database connection pool

