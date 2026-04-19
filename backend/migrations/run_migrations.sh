#!/bin/bash

# Unified Users Migration Script
# Run this script to execute all migration steps in order

# Database configuration
DB_NAME="travoozapp_db"
DB_USER="admin"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Unified Users Migration${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "001_create_unified_users_table.sql" ]; then
    echo -e "${RED}Error: Migration files not found!${NC}"
    echo "Please run this script from: travooz_vendor/backend/migrations/"
    exit 1
fi

# Prompt for database password
read -sp "Enter MySQL password for user '$DB_USER': " DB_PASS
echo ""

# Step 1: Create unified users table
echo -e "${GREEN}Step 1/3: Creating unified users table...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 001_create_unified_users_table.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Unified users table created${NC}"
else
    echo -e "${RED}✗ Failed to create unified users table${NC}"
    exit 1
fi
echo ""

# Step 2: Create service profile tables
echo -e "${GREEN}Step 2/3: Creating service profile tables...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 002_create_service_profiles.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Service profile tables created${NC}"
else
    echo -e "${RED}✗ Failed to create service profile tables${NC}"
    exit 1
fi
echo ""

# Step 3: Migrate data
echo -e "${GREEN}Step 3/3: Migrating data to unified structure...${NC}"
echo -e "${YELLOW}This may take a few moments...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 003_migrate_to_unified_users.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data migration completed${NC}"
else
    echo -e "${RED}✗ Failed to migrate data${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify migration: Check users and profile tables"
echo "2. Update application code (registration flows, etc.)"
echo "3. Test login for all services"
echo "4. Users will need to log in again (tokens are invalidated)"





