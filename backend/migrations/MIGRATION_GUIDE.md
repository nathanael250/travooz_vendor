# Unified Users Migration Guide

## Overview

This migration implements the **FIRST APPROACH** solution: Unified Identity + Service Profiles. It transforms the system from service-specific user tables to a unified identity model with service scoping.

## What This Migration Does

1. **Creates unified `users` table** with `service` column and `UNIQUE(service, email)` constraint
2. **Creates service-specific profile tables** (`restaurant_profiles`, `car_rental_profiles`, `tour_profiles`, `stay_profiles`)
3. **Migrates existing data** from service-specific user tables to unified structure
4. **Preserves all relationships** using a mapping table
5. **Keeps old tables** for rollback safety (can be dropped later)

## Migration Steps

### Step 1: Backup Database

**CRITICAL**: Always backup your database before running migrations.

```bash
mysqldump -u username -p travoozapp_db > backup_before_unified_users_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Migration Scripts in Order

```bash
# 1. Create unified users table
mysql -u username -p travoozapp_db < migrations/001_create_unified_users_table.sql

# 2. Create service profile tables
mysql -u username -p travoozapp_db < migrations/002_create_service_profiles.sql

# 3. Migrate data (this is the critical step)
mysql -u username -p travoozapp_db < migrations/003_migrate_to_unified_users.sql
```

### Step 3: Verify Migration

Run these queries to verify the migration:

```sql
-- Check users were migrated
SELECT service, COUNT(*) as count FROM users GROUP BY service;

-- Check profiles were created
SELECT 'restaurant' as service, COUNT(*) as count FROM restaurant_profiles
UNION ALL
SELECT 'car_rental', COUNT(*) FROM car_rental_profiles
UNION ALL
SELECT 'tours', COUNT(*) FROM tour_profiles
UNION ALL
SELECT 'stays', COUNT(*) FROM stay_profiles;

-- Check mapping table
SELECT service, COUNT(*) as count FROM user_id_mapping GROUP BY service;
```

### Step 4: Update Application Code

After running migrations, you need to:

1. ✅ Update authentication services (already done)
2. ⏳ Update registration flows
3. ⏳ Update all database queries
4. ⏳ Add service guards to protected routes
5. ⏳ Update frontend to handle service in tokens

### Step 5: Test Thoroughly

Test login, registration, and all user-related operations for each service.

## Rollback Plan

If something goes wrong:

1. **Stop the application**
2. **Restore from backup**:
   ```bash
   mysql -u username -p travoozapp_db < backup_before_unified_users_YYYYMMDD_HHMMSS.sql
   ```
3. **Revert code changes** (git revert)
4. **Restart application**

## Important Notes

### Data Preservation

- All existing user data is preserved
- Old user tables are kept (not dropped) for safety
- Foreign key relationships are maintained via mapping table

### Token Invalidation

**IMPORTANT**: After this migration, all existing JWT tokens will be invalid because:
- Token structure now includes `service` field
- Old tokens don't have service information

Users will need to log in again after migration.

### Foreign Key Updates

The migration creates a `user_id_mapping` table that maps old `user_id` values to new unified `id` values. This allows:

- Existing foreign keys to continue working (temporarily)
- Gradual migration of foreign keys to new structure
- Safe rollback if needed

## Post-Migration Tasks

1. **Update foreign keys**: Gradually update tables to reference `users.id` instead of old user tables
2. **Add service guards**: Protect all routes with service guards
3. **Update queries**: Update all queries to use unified users table
4. **Drop old tables**: After verification, drop old user tables (optional)

## Troubleshooting

### Issue: Duplicate email errors

**Cause**: Email already exists in unified users table  
**Solution**: Check `user_id_mapping` table to see if migration partially completed

### Issue: Foreign key constraint errors

**Cause**: Tables still reference old user tables  
**Solution**: Use mapping table to find new user_id, or update foreign keys gradually

### Issue: Login fails after migration

**Cause**: Token doesn't have service field  
**Solution**: Users must log in again to get new tokens with service scoping

## Support

If you encounter issues:

1. Check migration logs
2. Verify data in `users` and profile tables
3. Check `user_id_mapping` table
4. Review application logs for service-related errors





