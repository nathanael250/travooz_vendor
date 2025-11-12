# Admin Tour Package Verification API

This document describes the admin API endpoints for verifying tour package submissions.

## Base URL
```
/api/v1/admin/tours
```

All endpoints require:
- Authentication token in header: `Authorization: Bearer <token>`
- Admin role (currently any authenticated user can access)

## Endpoints

### 1. Get All Submissions
Get a paginated list of all tour package submissions for review.

**GET** `/submissions`

**Query Parameters:**
- `status` (optional): Filter by status (`pending_review`, `approved`, `rejected`, `in_progress`, or `all`)
- `search` (optional): Search by business name, owner name, or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/admin/tours/submissions?status=pending_review&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
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
        "user_id": 1,
        "status": "pending_review",
        "submitted_at": "2025-01-09T14:30:00.000Z",
        "tour_business_name": "Rwanda Adventure Tours",
        "tour_type": "adventure",
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
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 2. Get Submission Statistics
Get statistics about submissions.

**GET** `/submissions/stats`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/admin/tours/submissions/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "byStatus": {
      "pending_review": 15,
      "approved": 8,
      "rejected": 2
    },
    "total": 25
  }
}
```

### 3. Get Submission Details
Get detailed information about a specific submission.

**GET** `/submissions/:id`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/admin/tours/submissions/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Submission retrieved successfully",
  "data": {
    "submission_id": 1,
    "tour_business_id": 1,
    "user_id": 1,
    "status": "pending_review",
    "submitted_at": "2025-01-09T14:30:00.000Z",
    "tour_business_name": "Rwanda Adventure Tours",
    "location": "Kigali, Rwanda",
    "tour_type": "adventure",
    "owner_name": "John Doe",
    "owner_email": "john@example.com",
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

### 4. Approve Submission
Approve a tour package submission.

**PATCH** `/submissions/:id/status`

**Request Body:**
```json
{
  "status": "approved",
  "notes": "All documents verified. Business looks legitimate."
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/v1/admin/tours/submissions/1/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "All documents verified. Business looks legitimate."
  }'
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

### 5. Reject Submission
Reject a tour package submission.

**PATCH** `/submissions/:id/status`

**Request Body:**
```json
{
  "status": "rejected",
  "rejectionReason": "ID card photo is unclear. Please upload a clearer image.",
  "notes": "Additional verification needed"
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/v1/admin/tours/submissions/1/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "ID card photo is unclear. Please upload a clearer image.",
    "notes": "Additional verification needed"
  }'
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

## Status Values

- `pending_review`: Submission is waiting for admin review
- `approved`: Submission has been approved
- `rejected`: Submission has been rejected
- `in_progress`: Submission is being reviewed

## What Happens When Approved

When a submission is approved:
1. The submission status is updated to `approved`
2. The `approved_at` timestamp is set
3. The `approved_by` field is set to the admin's user ID
4. The tour business status is updated to `approved`
5. The tour business `is_live` flag is set to `1` (active)

## What Happens When Rejected

When a submission is rejected:
1. The submission status is updated to `rejected`
2. The `rejected_at` timestamp is set
3. The `rejected_by` field is set to the admin's user ID
4. The `rejection_reason` is stored (if provided)
5. The tour business status is updated to `rejected`
6. The tour business `is_live` flag is set to `0` (inactive)

## Testing with Postman/Insomnia

1. **Get Token**: First, authenticate as an admin user to get a token
2. **Set Header**: Add `Authorization: Bearer <your_token>` to all requests
3. **Test Endpoints**: Use the examples above to test each endpoint

## Frontend Integration

The frontend can call these endpoints to:
- Display a list of pending submissions
- Show submission details with all documents
- Approve or reject submissions
- Show statistics dashboard

