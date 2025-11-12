# Migration Guide: Consolidating to travooz_vendor

This guide will help you migrate from the current multi-backend structure to the unified `travooz_vendor` platform.

## Current Structure

```
travooz/
├── travooz_backend/        # Main backend (port 5000)
├── travooz_stay_backend/   # Stays backend (port 5001)
├── travooz_frontend/       # Vendor frontend
└── travooz/                # Main dashboard (frontend + backend)
```

## Target Structure

```
travooz_vendor/
├── backend/                # Unified backend (port 5000)
└── frontend/               # Unified frontend (port 8080)
```

## Migration Steps

### Phase 1: Database Consolidation

1. **Export stays database:**
   ```bash
   mysqldump -u root -p travooz_stays > travooz_stays_backup.sql
   ```

2. **Import into main database:**
   ```bash
   mysql -u root -p travooz_database < travooz_stays_backup.sql
   ```

3. **Merge users tables:**
   - If `stays_users` exists, merge into main `users` table
   - Update foreign keys in stays tables to reference `users.user_id`

### Phase 2: Backend Migration

1. **Move stays services:**
   - Copy `travooz_stay_backend/src/services/*` → `travooz_vendor/backend/src/services/stays/`
   - Copy `travooz_stay_backend/src/controllers/*` → `travooz_vendor/backend/src/controllers/stays/`
   - Copy `travooz_stay_backend/src/routes/*` → `travooz_vendor/backend/src/routes/stays.routes.js`

2. **Move restaurant services:**
   - Copy from `travooz_backend/src/services/eatingOut.service.js` → `travooz_vendor/backend/src/services/restaurants/`
   - Copy restaurant controllers and routes

3. **Move other services:**
   - Tours, Cars, Activities from `travooz_backend`

4. **Update database connections:**
   - All services use `travooz_database`
   - Update all `executeQuery` calls to use the unified database

5. **Register routes in server.js:**
   ```javascript
   app.use('/api/v1/stays', staysRoutes);
   app.use('/api/v1/restaurants', restaurantRoutes);
   app.use('/api/v1/tours', tourRoutes);
   app.use('/api/v1/cars', carRoutes);
   app.use('/api/v1/activities', activityRoutes);
   ```

### Phase 3: Frontend Migration

1. **Move stays pages:**
   - Copy `travooz_frontend/src/pages/stays/*` → `travooz_vendor/frontend/src/pages/stays/`

2. **Move restaurant pages:**
   - Copy restaurant pages from `travooz_frontend`

3. **Move other service pages:**
   - Tours, Cars, Activities

4. **Update API services:**
   - All services use the unified `apiClient`
   - Update base URLs to point to unified backend

5. **Update routing:**
   - Create unified routing in `App.jsx`
   - Add navigation between services

### Phase 4: Testing & Cleanup

1. **Test each service:**
   - Stays setup flow
   - Restaurant setup flow
   - Tour package management
   - Car rental management
   - Activity management

2. **Remove old backends:**
   - After successful migration, remove `travooz_stay_backend`
   - Archive `travooz_backend` (keep for reference)

3. **Update documentation:**
   - Update README files
   - Update API documentation

## Benefits After Migration

✅ Single backend process (one port, one deployment)
✅ Single frontend application
✅ Unified authentication
✅ Shared database
✅ Easier maintenance
✅ Better code organization
✅ Simplified development workflow

## Next Steps

1. Start with database consolidation
2. Migrate one service at a time (start with stays)
3. Test thoroughly before moving to next service
4. Keep old backends running during migration for comparison

