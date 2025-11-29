# Tours Database Schema Documentation

## Overview
This database schema supports the complete 6-step tour package vendor onboarding flow for the Travooz Tours system.

## Database: `travoozapp_db`

All tables use the `tours_` prefix and are created in the shared `travoozapp_db` database alongside other modules (restaurants, stays, etc.).

## Tables Structure

### 1. `tours_users`
User accounts for tour businesses. Created in **Step 3** (Account Creation).

**Key Fields:**
- `user_id`: Primary key
- `role`: User role (`admin`, `vendor`, `client`) - defaults to `vendor`
- `name`: Full name of the user
- `email`: Email address (unique)
- `phone`: Phone number
- `password_hash`: Hashed password
- `email_verified`: Whether email has been verified
- `is_active`: Whether account is active

**Note:** This table is separate from `stays_users` to keep tour users organized. Both tables have the same structure and can be merged later if needed.

### 2. `tours_businesses`
Main tour business listing table. Created in **Step 1** (Location + Basic Info + Account Creation).

**Key Fields:**
- `tour_business_id`: Primary key
- `user_id`: Foreign key to users table
- `location`: Location string (e.g., "Kigali, Rwanda")
- `location_data`: JSON field for detailed location information (lat, lng, place_id, etc.)
- `tour_business_name`: Business name
- `tour_type`: Type of tour business
- `tour_type_name`: Display name for tour type
- `tour_type_ids`: JSON array of all selected tour type/subcategory IDs
- `tour_type_names`: JSON array of all selected tour type names
- `subcategory_id`: Subcategory reference
- `initial_password`: Plaintext password captured during onboarding (admin-only reference – handle securely)
- `description`: Business description
- `phone`: Contact phone number
- `country_code`: Phone country code (default: '+250')
- `currency`: Business currency (default: 'RWF')
- `status`: Business status (`draft`, `pending_review`, `approved`, `rejected`)
- `is_live`: Whether business is live on platform
- `setup_complete`: Whether all setup steps are completed
- `submitted_at`: When business was submitted for review

### 3. `tours_email_verifications`
Email verification codes table. Used in **Step 1** (Email Verification).

**Key Fields:**
- `verification_id`: Primary key
- `user_id`: Foreign key to users table
- `email`: Email address to verify
- `code`: 6-digit verification code (plain text - for development only)
- `code_hash`: SHA-256 hash of verification code
- `expires_at`: Code expiration timestamp (5 minutes)
- `is_used`: Whether code has been used
- `verified_at`: When code was verified

**Security:**
- Codes are hashed before storage
- Expires after 5 minutes
- Previous unused codes are invalidated when new code is generated

### 4. `tours_business_owner_info`
Business owner personal information. Created in **Step 2** (Business Owner Information).

**Key Fields:**
- `owner_info_id`: Primary key
- `tour_business_id`: Foreign key to tours_businesses
- `user_id`: Foreign key to users table
- `first_name`: Owner first name
- `last_name`: Owner last name
- `country_of_residence`: Country where owner resides
- `email`: Owner email address

**Privacy:**
- This information is marked as private and not shown to clients
- Used only for internal verification and contact purposes

### 5. `tours_identity_proof`
Identity verification documents. Created in **Step 3** (Prove Your Identity).

**Key Fields:**
- `identity_proof_id`: Primary key
- `tour_business_id`: Foreign key to tours_businesses
- `user_id`: Foreign key to users table
- `id_country`: Country where ID was issued
- `id_card_photo_url`: Path/URL to uploaded ID card photo
- `id_card_photo_name`: Original filename
- `id_card_photo_size`: File size in bytes
- `id_card_photo_type`: MIME type
- `verified`: Whether document has been verified by admin
- `verified_at`: When document was verified
- `verified_by`: Admin user ID who verified

### 6. `tours_business_proof`
Business verification documents. Created in **Step 4** (Prove Your Business).

**Key Fields:**
- `business_proof_id`: Primary key
- `tour_business_id`: Foreign key to tours_businesses
- `user_id`: Foreign key to users table
- `business_legal_name`: Legal business name as per certificate
- `professional_certificate_url`: Path/URL to uploaded certificate
- `professional_certificate_name`: Original filename
- `professional_certificate_size`: File size in bytes
- `professional_certificate_type`: MIME type
- `verified`: Whether document has been verified by admin
- `verified_at`: When document was verified
- `verified_by`: Admin user ID who verified

### 7. `tours_setup_submissions`
Final submission and approval tracking. Created in **Step 6** (Submit for Verification).

**Key Fields:**
- `submission_id`: Primary key
- `tour_business_id`: Foreign key to tours_businesses
- `user_id`: Foreign key to users table
- `status`: Submission status (`pending_review`, `approved`, `rejected`, `in_progress`)
- `submitted_at`: When submission was made
- `approved_at`: When submission was approved
- `approved_by`: Admin user ID who approved
- `rejected_at`: When submission was rejected
- `rejected_by`: Admin user ID who rejected
- `rejection_reason`: Reason for rejection (if applicable)
- `notes`: Admin notes

### 8. `tours_setup_progress`
Tracks completion status of each setup step. Helps determine which step user should continue from.

**Key Fields:**
- `progress_id`: Primary key
- `tour_business_id`: Foreign key to tours_businesses (unique)
- `user_id`: Foreign key to users table
- `step_1_complete`: Step 1 completion (Location + Basic Info + Account Creation + Email Verification)
- `step_2_complete`: Step 2 completion (Business Owner Information)
- `step_3_complete`: Step 3 completion (Prove Your Identity)
- `step_4_complete`: Step 4 completion (Prove Your Business)
- `step_5_complete`: Step 5 completion (Review & Verify)
- `step_6_complete`: Step 6 completion (Submit for Verification)
- `current_step`: Current step number (1-6)
- `last_updated_step`: Last step that was updated

## Setup Flow Mapping

| Step | Description | Tables Updated |
|------|-------------|---------------|
| 1.1 | Location Selection | `tours_businesses` (location, location_data) |
| 1.2 | Basic Info | `tours_businesses` (tour_business_name, tour_type, description, etc.) |
| 1.3 | Account Creation | `users` table (if new user), `tours_businesses` (user_id) |
| 1.4 | Email Verification | `tours_email_verifications` (code generation/verification) |
| 2 | Business Owner Information | `tours_business_owner_info` |
| 3 | Prove Your Identity | `tours_identity_proof` |
| 4 | Prove Your Business | `tours_business_proof` |
| 5 | Review & Verify | No table update (validation only) |
| 6 | Submit for Verification | `tours_setup_submissions`, `tours_businesses` (status, submitted_at) |

## Status Flow

```
draft → pending_review → approved/rejected
```

- **draft**: Business is being set up, not yet submitted
- **pending_review**: Business has been submitted, awaiting admin review
- **approved**: Business has been approved and can go live
- **rejected**: Business has been rejected (with reason)

## File Uploads

All file uploads (ID cards, certificates) are stored as:
- **URL/Path**: Stored in `*_url` fields
- **Metadata**: Original filename, size, and MIME type stored separately
- **Storage**: Files should be stored in `/uploads/tours/` directory structure

## Foreign Key Relationships

```
tours_businesses (tour_business_id)
    ├── tours_business_owner_info
    ├── tours_identity_proof
    ├── tours_business_proof
    ├── tours_setup_submissions
    └── tours_setup_progress
```

## Indexes

All tables have appropriate indexes for:
- Foreign keys (`user_id`, `tour_business_id`)
- Status fields (`status`, `verified`)
- Search fields (`email`, `tour_type`)
- Timestamps (`submitted_at`, `created_at`)

## Notes

1. **User Table**: Uses `tours_users` table (separate from `stays_users` for organization, but same structure)
2. **Email Verification**: Follows same pattern as stays system
3. **File Storage**: URLs point to files in `/uploads/tours/` directory
4. **JSON Fields**: `location_data` stores flexible location information
5. **Progress Tracking**: `tours_setup_progress` helps resume flow if user leaves mid-process
6. **Status Management**: Two-level status tracking (business status + submission status)
7. **Default Currency**: All currency defaults to 'RWF' (Rwandan Franc)
8. **Default Country Code**: Phone country code defaults to '+250' (Rwanda)

