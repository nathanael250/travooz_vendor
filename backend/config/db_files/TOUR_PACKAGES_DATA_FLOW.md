# Tour Packages Data Flow Mapping

This document maps all form fields from `CreateTourPackage.jsx` to the database schema, ensuring the complete creation process can be saved to the database.

## Form to Database Mapping

### Step 1: Basic Informations

#### Substep 1: Title and Category
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `name` | `tours_packages` | `name` | VARCHAR(60) |
| `category` | `tours_packages` | `category` | VARCHAR(100) |

#### Substep 2: Description & Highlights
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `shortDescription` | `tours_packages` | `short_description` | VARCHAR(200) |
| `fullDescription` | `tours_packages` | `full_description` | TEXT |
| `highlights[]` | `tours_package_highlights` | `highlight_text` | VARCHAR(80) |

**Data Flow**: Each highlight in the array becomes a row in `tours_package_highlights`.

#### Substep 3: Locations
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `locations[]` | `tours_package_locations` | Multiple fields | See below |

**Data Flow**: Each location object becomes a row with:
- `location_name` (from location object)
- `formatted_address`
- `place_id`
- `latitude`
- `longitude`
- `address_components` (JSON)

#### Substep 4: Tags/Keywords
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `tags[]` | `tours_package_tags` | `tag_name` | VARCHAR(100) |

**Data Flow**: Each tag string becomes a row in `tours_package_tags`.

---

### Step 2: Inclusions

#### Substep 1: What's included & What's not included
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `whatsIncluded` | `tours_packages` | `whats_included` | TEXT |
| `whatsNotIncluded` | `tours_packages` | `whats_not_included` | TEXT |

#### Substep 2: Guide information
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `guideType` | `tours_packages` | `guide_type` | ENUM |
| `guideLanguage` | `tours_packages` | `guide_language` | VARCHAR(100) |

#### Substep 3: Food & drinks
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `foodIncluded` | `tours_packages` | `food_included` | TINYINT(1) |
| `meals[]` | `tours_package_meals` | Multiple fields | See below |
| `drinksIncluded` | `tours_packages` | `drinks_included` | TINYINT(1) |
| `showDietaryRestrictions` | `tours_packages` | `show_dietary_restrictions` | TINYINT(1) |
| `dietaryRestrictions[]` | `tours_package_dietary_restrictions` | `restriction_name` | VARCHAR(100) |

**Data Flow**: 
- Each meal object in `meals[]` becomes a row in `tours_package_meals` with `meal_type` and `meal_format`.
- Each dietary restriction string becomes a row in `tours_package_dietary_restrictions`.

#### Substep 4: Transportation
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `transportationUsed` | `tours_packages` | `transportation_used` | TINYINT(1) |
| `transportationTypes[]` | `tours_package_transportation_types` | `transportation_type` | VARCHAR(100) |
| `travelToDifferentCity` | `tours_packages` | `travel_to_different_city` | TINYINT(1) |

**Data Flow**: Each transportation type string becomes a row in `tours_package_transportation_types`.

---

### Step 3: Extra Information

| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `notSuitableFor[]` | `tours_package_not_suitable` | `restriction_name` | VARCHAR(255) |
| `notAllowed[]` | `tours_package_not_allowed` | `item_name` | VARCHAR(255) |
| `petPolicy` | `tours_packages` | `pet_policy` | TINYINT(1) |
| `petPolicyDetails` | `tours_packages` | `pet_policy_details` | TEXT |
| `mandatoryItems[]` | `tours_package_mandatory_items` | `item_name` | VARCHAR(255) |
| `knowBeforeYouGo` | `tours_packages` | `know_before_you_go` | TEXT |
| `emergencyContact` | `tours_packages` | `emergency_contact` | VARCHAR(255) |
| `emergencyPhone` | `tours_packages` | `emergency_phone` | VARCHAR(35) |
| `voucherInformation` | `tours_packages` | `voucher_information` | TEXT |

**Data Flow**: 
- Each restriction/item string becomes a row in respective tables.

---

### Step 4: Photos

| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `photos[]` | `tours_package_photos` | Multiple fields | See below |

**Data Flow**: Each photo object becomes a row with:
- `photo_url`
- `photo_name`
- `photo_size`
- `photo_type`
- `display_order`
- `is_primary` (first photo or explicitly marked)

---

### Step 5: Options

#### Substep 1: Option setup
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `optionReferenceCode` | `tours_packages` | `option_reference_code` | VARCHAR(20) |
| `maxGroupSize` | `tours_packages` | `max_group_size` | INT |
| `languages[]` | `tours_package_languages` | `language_name` | VARCHAR(100) |
| `guideMaterials` | `tours_packages` | `guide_materials` | TINYINT(1) |
| `guideMaterialsTypes[]` | `tours_package_guide_materials` | `material_type` | ENUM |
| `guideMaterialsLanguages[]` | `tours_package_guide_materials` | `language_name` | VARCHAR(100) |
| `isPrivateActivity` | `tours_packages` | `is_private_activity` | TINYINT(1) |
| `skipTheLine` | `tours_packages` | `skip_the_line` | TINYINT(1) |
| `skipTheLineType` | `tours_packages` | `skip_the_line_type` | VARCHAR(100) |
| `wheelchairAccessible` | `tours_packages` | `wheelchair_accessible` | TINYINT(1) |
| `durationType` | `tours_packages` | `duration_type` | ENUM |
| `durationValue` | `tours_packages` | `duration_value` | VARCHAR(50) |

**Data Flow**: 
- Each language string becomes a row in `tours_package_languages`.
- Each guide material combination becomes a row in `tours_package_guide_materials`.

#### Substep 2: Meeting point info
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `customerArrivalType` | `tours_packages` | `customer_arrival_type` | ENUM |
| `pickupType` | `tours_packages` | `pickup_type` | ENUM |
| `pickupTiming` | `tours_packages` | `pickup_timing` | ENUM |
| `pickupConfirmation` | `tours_packages` | `pickup_confirmation` | ENUM |
| `pickupTime` | `tours_packages` | `pickup_time` | VARCHAR(50) |
| `pickupDescription` | `tours_packages` | `pickup_description` | TEXT |
| `dropOffType` | `tours_packages` | `drop_off_type` | ENUM |
| `pickupTransportation` | `tours_packages` | `pickup_transportation` | VARCHAR(100) |

#### Substep 3: Availability & Pricing

##### Tab 1: Schedule
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `availabilityType` | `tours_packages` | `availability_type` | ENUM |
| `pricingType` | `tours_packages` | `pricing_type` | ENUM |
| `scheduleName` | `tours_package_schedules` | `schedule_name` | VARCHAR(255) |
| `scheduleStartDate` | `tours_package_schedules` | `start_date` | DATE |
| `scheduleHasEndDate` | `tours_package_schedules` | `has_end_date` | TINYINT(1) |
| `scheduleEndDate` | `tours_package_schedules` | `end_date` | DATE |
| `weeklySchedule` | `tours_package_weekly_schedule` | Multiple fields | See below |
| `scheduleExceptions[]` | `tours_package_schedule_exceptions` + `tours_package_exception_time_slots` | Multiple fields | See below |

**Data Flow**:
1. Create a row in `tours_package_schedules` with schedule name and dates.
2. For each day in `weeklySchedule`, create rows in `tours_package_weekly_schedule` with:
   - `day_of_week`
   - `start_hour`, `start_minute`, `end_hour`, `end_minute`
3. For each exception date, create:
   - Row in `tours_package_schedule_exceptions`
   - Rows in `tours_package_exception_time_slots` for each time slot

##### Tab 2: Pricing Categories
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `pricingCategory` (radio) | `tours_package_pricing_categories` | `category_type` | ENUM |

**Data Flow**: One row per schedule in `tours_package_pricing_categories`.

##### Tab 3: Capacity
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `minParticipants` | `tours_package_capacity` | `min_participants` | INT |
| `maxParticipants` | `tours_package_capacity` | `max_participants` | INT |
| `exceptionsShareCapacity` | `tours_package_capacity` | `exceptions_share_capacity` | TINYINT(1) |

**Data Flow**: One row per schedule in `tours_package_capacity`.

##### Tab 4: Price
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `pricingTiers[]` | `tours_package_pricing_tiers` | Multiple fields | See below |

**Data Flow**: Each tier object becomes a row with:
- `participant_range` (e.g., "1 to 5", "Adults", "Children")
- `min_participants`, `max_participants` (for calculations)
- `customer_pays`
- `commission_percentage`
- `price_per_participant` (calculated)
- `currency`

##### Tab 5: Add-ons (optional)
| Form Field | Database Table | Database Field | Type |
|------------|----------------|----------------|------|
| `addons[]` | `tours_package_addons` + `tours_package_addon_tiers` | Multiple fields | See below |

**Data Flow**: 
1. Each add-on becomes a row in `tours_package_addons` with:
   - `addon_name`
   - `addon_type`
   - `description`
   - `quantity_range`
   - `customer_pays`
   - `commission_percentage`
   - `payout` (calculated)
2. If add-on has tiers, create rows in `tours_package_addon_tiers`.

---

## Complete Save Process

### 1. Create Main Package Record
```sql
INSERT INTO tours_packages (tour_business_id, name, category, ...)
VALUES (?, ?, ?, ...)
```

### 2. Save Step 1 Data
- Insert highlights into `tours_package_highlights`
- Insert locations into `tours_package_locations`
- Insert tags into `tours_package_tags`

### 3. Save Step 2 Data
- Insert meals into `tours_package_meals`
- Insert dietary restrictions into `tours_package_dietary_restrictions`
- Insert transportation types into `tours_package_transportation_types`

### 4. Save Step 3 Data
- Insert not suitable restrictions into `tours_package_not_suitable`
- Insert not allowed items into `tours_package_not_allowed`
- Insert mandatory items into `tours_package_mandatory_items`

### 5. Save Step 4 Data
- Insert photos into `tours_package_photos`

### 6. Save Step 5 Data
- Insert languages into `tours_package_languages`
- Insert guide materials into `tours_package_guide_materials`
- Create schedule in `tours_package_schedules`
- Insert weekly schedule into `tours_package_weekly_schedule`
- Insert exceptions into `tours_package_schedule_exceptions` and `tours_package_exception_time_slots`
- Insert pricing category into `tours_package_pricing_categories`
- Insert capacity into `tours_package_capacity`
- Insert pricing tiers into `tours_package_pricing_tiers`
- Insert add-ons into `tours_package_addons` and `tours_package_addon_tiers`

## Transaction Management

**Important**: All inserts should be wrapped in a database transaction to ensure data consistency:
- If any step fails, rollback all changes
- Only commit when all data is successfully saved
- This ensures package data integrity

## Status Updates

Update `tours_packages.status` field:
- `draft`: While user is creating (can save and exit)
- `pending`: When submitted for review
- `active`: When approved and published
- `inactive`: When disabled

## Notes

1. **Multiple Schedules**: A package can have multiple schedules (e.g., "Summer", "Winter"). Each schedule has its own pricing, capacity, and add-ons.

2. **Exception Dates**: Exception dates can have different time slots and capacity than the regular schedule.

3. **Calculated Fields**: 
   - `price_per_participant` = `customer_pays * (1 - commission_percentage/100)`
   - `payout` = `customer_pays * (1 - commission_percentage/100)`

4. **Display Order**: Use `display_order` fields to maintain the order of items as entered by the user.

5. **Unique Constraints**: Prevent duplicate entries (e.g., same tag twice, same location twice).

