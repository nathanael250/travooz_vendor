# Tour Packages Database Schema Documentation

## Overview
This database schema supports the complete tour package creation flow for the Travooz Tours system. It stores all data collected from the multi-step tour package creation form.

## Database: `travoozapp_db`

All tables use the `tours_` prefix and are created in the shared `travoozapp_db` database alongside other modules.

## Table Structure

### Main Tables

#### 1. `tours_packages`
**Purpose**: Main table storing tour package information from all steps.

**Key Fields**:
- `package_id`: Primary key
- `tour_business_id`: Foreign key to `tours_businesses`
- **Step 1 (Basic Informations)**:
  - `name`: Package title (max 60 chars)
  - `category`: Tour category
  - `short_description`: Short description (max 200 chars)
  - `full_description`: Full description (TEXT)
- **Step 2 (Inclusions)**:
  - `whats_included`: What's included text
  - `whats_not_included`: What's not included text
  - `guide_type`: Type of guide (self-guided, tour-guide, etc.)
  - `guide_language`: Guide language
  - `drinks_included`: Boolean
  - `show_dietary_restrictions`: Boolean
  - `transportation_used`: Boolean
  - `travel_to_different_city`: Boolean
- **Step 3 (Extra Information)**:
  - `pet_policy`: Boolean
  - `pet_policy_details`: Text details
  - `know_before_you_go`: Text
  - `emergency_contact`: Contact name
  - `emergency_phone`: Phone number
  - `voucher_information`: Text
- **Step 5 (Options - Option setup)**:
  - `option_reference_code`: Reference code
  - `max_group_size`: Maximum group size
  - `guide_materials`: Boolean
  - `is_private_activity`: Boolean
  - `skip_the_line`: Boolean
  - `skip_the_line_type`: Type of skip-the-line
  - `wheelchair_accessible`: Boolean
  - `duration_type`: Duration or validity
  - `duration_value`: Duration value
- **Step 5 (Options - Meeting point)**:
  - `customer_arrival_type`: Self or pickup
  - `pickup_type`: Any address or defined locations
  - `pickup_timing`: Same time or before activity
  - `pickup_confirmation`: Day before or after selection
  - `pickup_time`: Pickup time
  - `pickup_description`: Pickup description
  - `drop_off_type`: Same place, different place, or no drop-off
  - `pickup_transportation`: Transportation type
- **Step 5 (Options - Availability & Pricing)**:
  - `availability_type`: Time slots or opening hours
  - `pricing_type`: Per person or per group
- `status`: Package status (draft, pending, active, inactive)

**Relationships**:
- One-to-many with all related tables
- Foreign key to `tours_businesses`

---

### Step 1: Basic Informations Tables

#### 2. `tours_package_locations`
**Purpose**: Stores locations visited during the tour (Substep 3).

**Key Fields**:
- `location_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `location_name`: Location name
- `formatted_address`: Full address
- `place_id`: Google Places ID
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate
- `address_components`: JSON field for detailed address components
- `display_order`: For ordering locations

**Relationships**:
- Many-to-one with `tours_packages`

#### 3. `tours_package_tags`
**Purpose**: Stores keywords/tags for searchability (Substep 4).

**Key Fields**:
- `tag_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `tag_name`: Tag name
- `display_order`: For ordering tags

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, tag_name)

#### 4. `tours_package_highlights`
**Purpose**: Stores highlights/bullet points (Substep 2).

**Key Fields**:
- `highlight_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `highlight_text`: Highlight text (max 80 chars)
- `display_order`: For ordering highlights

**Relationships**:
- Many-to-one with `tours_packages`

---

### Step 2: Inclusions Tables

#### 5. `tours_package_meals`
**Purpose**: Stores meal information (Substep 3 - Food).

**Key Fields**:
- `meal_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `meal_type`: Type (breakfast, lunch, dinner, snack, brunch, tea, coffee)
- `meal_format`: Format (food-tasting, buffet, set-menu, a-la-carte, picnic, street-food, cooking-class)
- `display_order`: For ordering meals

**Relationships**:
- Many-to-one with `tours_packages`

#### 6. `tours_package_dietary_restrictions`
**Purpose**: Stores dietary restrictions that can be accommodated (Substep 3).

**Key Fields**:
- `restriction_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `restriction_name`: Name of restriction (e.g., "Vegetarian", "Gluten-free")

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, restriction_name)

#### 7. `tours_package_transportation_types`
**Purpose**: Stores transportation types used during activity (Substep 4).

**Key Fields**:
- `transportation_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `transportation_type`: Type of transportation

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, transportation_type)

---

### Step 3: Extra Information Tables

#### 8. `tours_package_not_suitable`
**Purpose**: Stores restrictions on who can participate.

**Key Fields**:
- `not_suitable_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `restriction_name`: Name of restriction (e.g., "Pregnant women", "Children under 18 years")

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, restriction_name)

#### 9. `tours_package_not_allowed`
**Purpose**: Stores items/actions not allowed.

**Key Fields**:
- `not_allowed_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `item_name`: Name of item/action not allowed

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, item_name)

#### 10. `tours_package_mandatory_items`
**Purpose**: Stores mandatory items customers must bring.

**Key Fields**:
- `mandatory_item_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `item_name`: Name of mandatory item (e.g., "Comfortable shoes", "Passport")

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, item_name)

---

### Step 4: Photos Table

#### 11. `tours_package_photos`
**Purpose**: Stores photos for the package.

**Key Fields**:
- `photo_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `photo_url`: URL/path to photo
- `photo_name`: Original filename
- `photo_size`: File size in bytes
- `photo_type`: MIME type
- `display_order`: For ordering photos
- `is_primary`: Whether this is the primary/cover photo

**Relationships**:
- Many-to-one with `tours_packages`

---

### Step 5: Options Tables

#### 12. `tours_package_languages`
**Purpose**: Stores languages offered (Option setup).

**Key Fields**:
- `language_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `language_name`: Name of language

**Relationships**:
- Many-to-one with `tours_packages`
- Unique constraint on (package_id, language_name)

#### 13. `tours_package_guide_materials`
**Purpose**: Stores guide materials information (Option setup).

**Key Fields**:
- `guide_material_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `material_type`: Type (audio-guides, information-booklets)
- `language_name`: Language of material

**Relationships**:
- Many-to-one with `tours_packages`

---

### Step 5: Availability & Pricing Tables

#### 14. `tours_package_schedules`
**Purpose**: Main schedule table (Schedule tab).

**Key Fields**:
- `schedule_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `schedule_name`: Name of schedule (e.g., "Summer", "Weekends")
- `start_date`: Starting date
- `has_end_date`: Boolean
- `end_date`: End date (if applicable)

**Relationships**:
- Many-to-one with `tours_packages`
- One-to-many with weekly schedule, exceptions, pricing, capacity, add-ons

#### 15. `tours_package_weekly_schedule`
**Purpose**: Stores weekly time slots (Schedule tab).

**Key Fields**:
- `weekly_schedule_id`: Primary key
- `schedule_id`: Foreign key to `tours_package_schedules`
- `day_of_week`: Day (monday through sunday)
- `start_hour`: Start hour (00-23)
- `start_minute`: Start minute (00, 15, 30, 45)
- `end_hour`: End hour (00-23)
- `end_minute`: End minute (00, 15, 30, 45)
- `display_order`: For ordering time slots

**Relationships**:
- Many-to-one with `tours_package_schedules`

#### 16. `tours_package_schedule_exceptions`
**Purpose**: Stores exception dates with alternative hours (Schedule tab).

**Key Fields**:
- `exception_id`: Primary key
- `schedule_id`: Foreign key to `tours_package_schedules`
- `exception_date`: Date of exception

**Relationships**:
- Many-to-one with `tours_package_schedules`
- One-to-many with exception time slots and capacity
- Unique constraint on (schedule_id, exception_date)

#### 17. `tours_package_exception_time_slots`
**Purpose**: Stores time slots for exception dates.

**Key Fields**:
- `time_slot_id`: Primary key
- `exception_id`: Foreign key to `tours_package_schedule_exceptions`
- `start_hour`, `start_minute`, `end_hour`, `end_minute`: Time slot details
- `display_order`: For ordering time slots

**Relationships**:
- Many-to-one with `tours_package_schedule_exceptions`

#### 18. `tours_package_pricing_categories`
**Purpose**: Stores pricing category information (Pricing Categories tab).

**Key Fields**:
- `pricing_category_id`: Primary key
- `schedule_id`: Foreign key to `tours_package_schedules`
- `category_type`: Same price or age-based

**Relationships**:
- Many-to-one with `tours_package_schedules`

#### 19. `tours_package_pricing_tiers`
**Purpose**: Stores pricing tiers (Price tab).

**Key Fields**:
- `tier_id`: Primary key
- `schedule_id`: Foreign key to `tours_package_schedules`
- `participant_range`: Range (e.g., "1 to 5", "6 to 20")
- `customer_pays`: Amount customer pays
- `commission_percentage`: Commission percentage
- `price_per_participant`: Calculated price per participant
- `display_order`: For ordering tiers

**Relationships**:
- Many-to-one with `tours_package_schedules`

#### 20. `tours_package_capacity`
**Purpose**: Stores capacity information (Capacity tab).

**Key Fields**:
- `capacity_id`: Primary key
- `schedule_id`: Foreign key to `tours_package_schedules`
- `min_participants`: Minimum participants
- `max_participants`: Maximum participants
- `exceptions_share_capacity`: Whether exceptions share capacity

**Relationships**:
- One-to-one with `tours_package_schedules` (per schedule)

#### 21. `tours_package_exception_capacity`
**Purpose**: Stores capacity for exception dates.

**Key Fields**:
- `exception_capacity_id`: Primary key
- `exception_id`: Foreign key to `tours_package_schedule_exceptions`
- `max_participants`: Maximum participants for this exception

**Relationships**:
- One-to-one with `tours_package_schedule_exceptions`

#### 22. `tours_package_addons`
**Purpose**: Stores add-on services/items (Add-ons tab).

**Key Fields**:
- `addon_id`: Primary key
- `schedule_id`: Foreign key to `tours_package_schedules`
- `addon_name`: Name of add-on
- `quantity_range`: Quantity range (e.g., "1 to 12")
- `customer_pays`: Amount customer pays
- `commission_percentage`: Commission percentage
- `payout`: Calculated payout amount
- `display_order`: For ordering add-ons

**Relationships**:
- Many-to-one with `tours_package_schedules`
- One-to-many with addon tiers

#### 23. `tours_package_addon_tiers`
**Purpose**: Stores pricing tiers for add-ons.

**Key Fields**:
- `tier_id`: Primary key
- `addon_id`: Foreign key to `tours_package_addons`
- `quantity_range`: Quantity range
- `customer_pays`: Amount customer pays
- `commission_percentage`: Commission percentage
- `payout`: Calculated payout amount
- `display_order`: For ordering tiers

**Relationships**:
- Many-to-one with `tours_package_addons`

---

## Data Relationships

```
tours_businesses
    └── tours_packages (1:N)
            ├── tours_package_locations (1:N)
            ├── tours_package_tags (1:N)
            ├── tours_package_highlights (1:N)
            ├── tours_package_meals (1:N)
            ├── tours_package_dietary_restrictions (1:N)
            ├── tours_package_transportation_types (1:N)
            ├── tours_package_not_suitable (1:N)
            ├── tours_package_not_allowed (1:N)
            ├── tours_package_mandatory_items (1:N)
            ├── tours_package_photos (1:N)
            ├── tours_package_languages (1:N)
            ├── tours_package_guide_materials (1:N)
            └── tours_package_schedules (1:N)
                    ├── tours_package_weekly_schedule (1:N)
                    ├── tours_package_schedule_exceptions (1:N)
                    │       ├── tours_package_exception_time_slots (1:N)
                    │       └── tours_package_exception_capacity (1:1)
                    ├── tours_package_pricing_categories (1:N)
                    ├── tours_package_pricing_tiers (1:N)
                    ├── tours_package_capacity (1:1)
                    └── tours_package_addons (1:N)
                            └── tours_package_addon_tiers (1:N)
```

## Usage Notes

1. **Package Creation Flow**:
   - Create record in `tours_packages` first
   - Add related records in child tables as user progresses through steps
   - Update `status` field as package moves through lifecycle

2. **Schedule-Based Pricing**:
   - Each package can have multiple schedules (e.g., "Summer", "Winter", "Weekends")
   - Each schedule has its own pricing, capacity, and add-ons
   - Exception dates allow special pricing/hours for holidays

3. **Data Integrity**:
   - Foreign keys ensure referential integrity
   - Unique constraints prevent duplicate entries
   - CASCADE deletes ensure cleanup when packages are deleted

4. **Performance**:
   - Indexes on foreign keys and frequently queried fields
   - Display order fields allow efficient sorting
   - JSON fields used sparingly for flexible data

5. **Status Workflow**:
   - `draft`: Package being created
   - `pending`: Submitted for review
   - `active`: Approved and live
   - `inactive`: Disabled but not deleted

## Migration Notes

- Run this schema after `tours_db.sql` (which creates `tours_businesses`)
- All tables use InnoDB engine for foreign key support
- UTF8MB4 charset supports emojis and special characters
- Timestamps use MySQL's automatic timestamp features

