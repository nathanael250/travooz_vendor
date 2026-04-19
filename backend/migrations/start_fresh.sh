#!/bin/bash

# Start Fresh Script
# This script cleans up unified users tables and allows you to start fresh

# Database configuration
DB_NAME="travoozapp_db"
DB_USER="admin"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Start Fresh - Cleanup Unified Users${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${RED}WARNING: This will delete all unified users data!${NC}"
echo -e "${RED}Old service-specific user tables (restaurant_users, etc.) will NOT be affected.${NC}"
echo ""

# Prompt for confirmation
read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Aborted.${NC}"
    exit 0
fi

# Prompt for database password
read -sp "Enter MySQL password for user '$DB_USER': " DB_PASS
echo ""

# Step 1: Cleanup
echo -e "${GREEN}Step 1: Cleaning up unified users tables...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 000_cleanup_unified_users.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Cleanup completed${NC}"
else
    echo -e "${RED}✗ Cleanup failed${NC}"
    exit 1
fi
echo ""

# Step 2: Create unified users table
echo -e "${GREEN}Step 2: Creating unified users table...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 001_create_unified_users_table.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Unified users table created${NC}"
else
    echo -e "${RED}✗ Failed to create unified users table${NC}"
    exit 1
fi
echo ""

# Step 3: Create service profile tables
echo -e "${GREEN}Step 3: Creating service profile tables...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 002_create_service_profiles.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Service profile tables created${NC}"
else
    echo -e "${RED}✗ Failed to create service profile tables${NC}"
    exit 1
fi
echo ""

# Step 4: Migrate data (optional - can be skipped if starting completely fresh)
echo -e "${YELLOW}Step 4: Migrate existing data?${NC}"
read -p "Do you want to migrate data from old user tables? (yes/no): " migrate_data

if [ "$migrate_data" = "yes" ]; then
    echo -e "${GREEN}Migrating data to unified structure...${NC}"
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 003_migrate_to_unified_users.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Data migration completed${NC}"
    else
        echo -e "${RED}✗ Failed to migrate data${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭ Skipping data migration - starting with empty tables${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Fresh start completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
if [ "$migrate_data" != "yes" ]; then
    echo -e "${YELLOW}Note: Tables are empty. New users will be created in unified structure.${NC}"
fi





