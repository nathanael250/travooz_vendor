# Admin Tour Verification - Postman Guide

This guide shows you how to verify and approve tour package submissions as an admin using Postman.

## Base URL
```
http://localhost:5000/api/v1
```

---

## Step 1: Get Admin Authentication Token

**Note:** You need to be logged in as an admin user. If you don't have an admin account, you can:
1. Create one in the database, OR
2. Use any existing user's token (currently admin check is disabled for testing)

### Option A: Login as Admin User
**Request:**
```
POST http://localhost:5000/api/v1/tours/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "user_id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copy the `token` value** - you'll need it for all admin requests.

---

## Step 2: Get All Submissions

View all tour package submissions waiting for review.

**Request:**
```
GET http://localhost:5000/api/v1/admin/tours/submissions
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Query Parameters (Optional):**
- `status` - Filter by status: `pending_review`, `approved`, `rejected`, `in_progress`, or `all` (default: all)
- `search` - Search by business name, owner name, or email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example with filters:**
```
GET http://localhost:5000/api/v1/admin/tours/submissions?status=pending_review&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Submissions retrieved successfully",
  "data": {
    "submissions": [
      {
        "submission_id": 1,
        "tour_business_id": 1,
        "user_id": 2,
        "status": "pending_review",
        "submitted_at": "2025-01-15T10:30:00.000Z",
        "tour_business_name": "Rwanda Adventure Tours",
        "tour_type": "adventure",
        "location": "Kigali, Rwanda",
        "owner_name": "John Doe",
        "owner_email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "country_of_residence": "Rwanda",
        "id_registration_country": "Rwanda",
        "id_card_photo_url": "/uploads/tours/id-card-1234567890.jpg",
        "business_legal_name": "Rwanda Adventure Tours Ltd",
        "professional_certificate_url": "/uploads/tours/certificate-1234567890.pdf"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## Step 3: Get Specific Submission Details

Get detailed information about a specific submission.

**Request:**
```
GET http://localhost:5000/api/v1/admin/tours/submissions/:id
```

**Example:**
```
GET http://localhost:5000/api/v1/admin/tours/submissions/1
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Submission retrieved successfully",
  "data": {
    "submission_id": 1,
    "tour_business_id": 1,
    "user_id": 2,
    "status": "pending_review",
    "submitted_at": "2025-01-15T10:30:00.000Z",
    "tour_business_name": "Rwanda Adventure Tours",
    "tour_type": "adventure",
    "location": "Kigali, Rwanda",
    "currency": "RWF",
    "owner_name": "John Doe",
    "owner_email": "john@example.com",
    "owner_phone": "+250788123456",
    "first_name": "John",
    "last_name": "Doe",
    "country_of_residence": "Rwanda",
    "id_registration_country": "Rwanda",
    "id_card_photo_url": "/uploads/tours/id-card-1234567890.jpg",
    "business_legal_name": "Rwanda Adventure Tours Ltd",
    "professional_certificate_url": "/uploads/tours/certificate-1234567890.pdf",
    "step_1_complete": 1,
    "step_2_complete": 1,
    "step_3_complete": 1,
    "step_4_complete": 1,
    "step_5_complete": 1,
    "step_6_complete": 1,
    "current_step": 6
  }
}
```

---

## Step 4: Approve a Submission

Approve a tour package submission. This will:
- Update submission status to `approved`
- Set tour business status to `approved` and `is_live = 1`
- Allow the user to access their dashboard

**Request:**
```
PATCH http://localhost:5000/api/v1/admin/tours/submissions/:id/status
```

**Example:**
```
PATCH http://localhost:5000/api/v1/admin/tours/submissions/1/status
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "approved",
  "notes": "All documents verified. Business looks legitimate. Approved for listing."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission approved successfully",
  "data": {
    "submissionId": 1,
    "status": "approved",
    "tourBusinessId": 1
  }
}
```

---

## Step 5: Reject a Submission

Reject a tour package submission. This will:
- Update submission status to `rejected`
- Set tour business status to `rejected` and `is_live = 0`
- User will see rejection message on their setup complete page

**Request:**
```
PATCH http://localhost:5000/api/v1/admin/tours/submissions/:id/status
```

**Example:**
```
PATCH http://localhost:5000/api/v1/admin/tours/submissions/1/status
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "rejected",
  "rejectionReason": "ID card photo is unclear. Please upload a clearer image.",
  "notes": "User needs to resubmit with better quality documents."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission rejected successfully",
  "data": {
    "submissionId": 1,
    "status": "rejected",
    "tourBusinessId": 1
  }
}
```

---

## Step 6: Get Submission Statistics

Get overview statistics of all submissions.

**Request:**
```
GET http://localhost:5000/api/v1/admin/tours/submissions/stats
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "byStatus": {
      "pending_review": 3,
      "approved": 10,
      "rejected": 2,
      "in_progress": 1
    },
    "total": 16
  }
}
```

---

## Postman Collection Setup

### 1. Create Environment Variables

In Postman, create a new environment with:
- `base_url`: `http://localhost:5000/api/v1`
- `admin_token`: (leave empty, will be set after login)

### 2. Create Requests

#### Request 1: Admin Login
- **Method:** POST
- **URL:** `{{base_url}}/tours/auth/login`
- **Body:** JSON with email and password
- **Tests Tab:** Add script to save token:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.data.token);
}
```

#### Request 2: Get All Submissions
- **Method:** GET
- **URL:** `{{base_url}}/admin/tours/submissions?status=pending_review`
- **Headers:** 
  - `Authorization: Bearer {{admin_token}}`

#### Request 3: Get Submission by ID
- **Method:** GET
- **URL:** `{{base_url}}/admin/tours/submissions/1`
- **Headers:** 
  - `Authorization: Bearer {{admin_token}}`

#### Request 4: Approve Submission
- **Method:** PATCH
- **URL:** `{{base_url}}/admin/tours/submissions/1/status`
- **Headers:** 
  - `Authorization: Bearer {{admin_token}}`
- **Body:** JSON
```json
{
  "status": "approved",
  "notes": "Approved"
}
```

#### Request 5: Reject Submission
- **Method:** PATCH
- **URL:** `{{base_url}}/admin/tours/submissions/1/status`
- **Headers:** 
  - `Authorization: Bearer {{admin_token}}`
- **Body:** JSON
```json
{
  "status": "rejected",
  "rejectionReason": "Documents need review",
  "notes": "Rejected"
}
```

#### Request 6: Get Statistics
- **Method:** GET
- **URL:** `{{base_url}}/admin/tours/submissions/stats`
- **Headers:** 
  - `Authorization: Bearer {{admin_token}}`

---

## Status Values

- `pending_review` - Submitted and waiting for admin review
- `approved` - Approved by admin, user can access dashboard
- `rejected` - Rejected by admin, user sees rejection message
- `in_progress` - User is still completing the setup process

---

## Important Notes

1. **Authentication Required:** All admin endpoints require a valid JWT token in the Authorization header.

2. **Admin Check:** Currently, the admin check is disabled for testing. In production, you should enable role checking in `adminTours.routes.js`.

3. **File URLs:** When viewing submission details, file URLs (like `id_card_photo_url` and `professional_certificate_url`) are relative paths. To view them:
   - Full URL: `http://localhost:5000/uploads/tours/filename.jpg`

4. **After Approval:** Once a submission is approved:
   - User can access `/tours/dashboard`
   - Tour business status becomes `approved` and `is_live = 1`
   - User will see "Verification Complete!" message

5. **After Rejection:** Once a submission is rejected:
   - User sees rejection message on `/tours/setup/complete`
   - Tour business status becomes `rejected` and `is_live = 0`
   - User may need to resubmit with corrected documents

---

## Quick Test Flow

1. **Login as Admin:**
   ```
   POST /tours/auth/login
   Body: { "email": "admin@example.com", "password": "password" }
   ```
   Copy the token from response.

2. **View Pending Submissions:**
   ```
   GET /admin/tours/submissions?status=pending_review
   Headers: Authorization: Bearer YOUR_TOKEN
   ```

3. **View Submission Details:**
   ```
   GET /admin/tours/submissions/1
   Headers: Authorization: Bearer YOUR_TOKEN
   ```

4. **Approve Submission:**
   ```
   PATCH /admin/tours/submissions/1/status
   Headers: Authorization: Bearer YOUR_TOKEN
   Body: { "status": "approved", "notes": "Looks good!" }
   ```

5. **Verify User Can Access Dashboard:**
   - User should now be able to login and access `/tours/dashboard`
   - Submission status should be `approved`

---

## Troubleshooting

### Error: "Access token is required"
- Make sure you're including the `Authorization: Bearer YOUR_TOKEN` header
- Verify your token hasn't expired (tokens expire after 24h by default)

### Error: "Submission not found"
- Check that the submission ID exists
- Verify the submission hasn't been deleted

### Error: "Invalid status"
- Status must be one of: `pending_review`, `approved`, `rejected`, `in_progress`
- Check spelling and case sensitivity

### Files Not Loading
- File URLs are relative paths
- Access files at: `http://localhost:5000/uploads/tours/filename.jpg`
- Make sure the uploads directory exists and files are present

