# Unified Users Migration - Quick Reference

## Migration Files

1. **001_create_unified_users_table.sql** - Creates the unified users table
2. **002_create_service_profiles.sql** - Creates service-specific profile tables
3. **003_migrate_to_unified_users.sql** - Migrates data from old tables to new structure

## Quick Start

```bash
# 1. Backup first!
mysqldump -u username -p travoozapp_db > backup.sql

# 2. Run migrations in order
mysql -u username -p travoozapp_db < migrations/001_create_unified_users_table.sql
mysql -u username -p travoozapp_db < migrations/002_create_service_profiles.sql
mysql -u username -p travoozapp_db < migrations/003_migrate_to_unified_users.sql
```

## What Changes

### Before
- `restaurant_users` table
- `car_rental_users` table
- `tours_users` table
- `stays_users` table

### After
- `users` table (unified, with `service` column)
- `restaurant_profiles` table
- `car_rental_profiles` table
- `tour_profiles` table
- `stay_profiles` table

## Key Benefits

✅ **No more cross-service conflicts** - `UNIQUE(service, email)` enforces separation  
✅ **Service-scoped tokens** - JWT tokens include service, preventing reuse  
✅ **Backend guards** - Routes protected by service validation  
✅ **Clean architecture** - Identity separate from service-specific data  

## See Also

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed migration guide
- [../src/constants/services.js](../src/constants/services.js) - Service constants
- [../src/middlewares/serviceGuard.middleware.js](../src/middlewares/serviceGuard.middleware.js) - Service guard middleware





