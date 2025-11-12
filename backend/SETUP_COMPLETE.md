# ✅ Backend Setup Complete

## Database Configuration

✅ **Database:** `travoozapp_db`  
✅ **All stays tables:** Already imported and ready  
✅ **User tables:** Using `stays_users` (will merge with `users` later)

## Backend Structure

```
travooz_vendor/backend/
├── src/
│   ├── services/stays/          ✅ All stays services migrated
│   ├── controllers/stays/        ✅ All stays controllers migrated
│   ├── models/stays/            ✅ All stays models migrated
│   ├── routes/                  ✅ Routes registered
│   ├── middlewares/             ✅ Auth middleware updated
│   └── utils/                   ✅ All utilities migrated
├── config/
│   └── database.js              ✅ Configured for travoozapp_db
└── server.js                    ✅ Routes registered
```

## Quick Start

### 1. Install Dependencies

```bash
cd travooz_vendor/backend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=travoozapp_db

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h

CORS_ORIGIN=http://localhost:8080

SMTP_HOST=smtp.dreamhost.com
SMTP_PORT=465
SMTP_USERNAME=admin@panacea-soft.co
SMTP_PASSWORD=your_email_password
```

### 3. Start Server

```bash
npm run dev
```

You should see:
```
🚀 Travooz Vendor Backend server running on port 5000
✅ Database connected successfully!
```

### 4. Test Endpoints

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Database Health:**
```bash
curl http://localhost:5000/health/db
```

**Create Property (Test):**
```bash
curl -X POST http://localhost:5000/api/v1/stays/properties \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "propertyName": "Test Property"
  }'
```

## API Endpoints Available

### Stays Service (`/api/v1/stays`)
- `POST /properties` - Create property
- `GET /properties/my` - Get my properties (auth)
- `GET /properties/by-user/:userId` - Get by user ID
- `GET /properties/:id` - Get property by ID
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `POST /email-verification/send` - Send verification code
- `POST /email-verification/verify` - Verify code
- `POST /setup/contract` - Save contract (auth)
- `POST /setup/policies` - Save policies (auth)
- `POST /setup/amenities` - Save amenities (auth)
- `POST /setup/room` - Save room (auth)
- `POST /setup/promotions` - Save promotions (auth)
- `POST /setup/images` - Save images (auth)
- `POST /setup/taxes` - Save tax details (auth)
- `POST /setup/connectivity` - Save connectivity (auth)
- `GET /setup/status/:propertyId` - Get setup status (auth)
- `POST /setup/submit` - Submit listing (auth)

### Admin Routes (`/api/v1/admin/stays`)
- `GET /properties` - Get all properties
- `GET /properties/stats` - Get statistics
- `GET /properties/:id` - Get property details
- `PATCH /properties/:id/status` - Update status

## Next Step: Frontend Migration

Once backend is tested and working, we'll migrate the stays frontend pages to `travooz_vendor/frontend`.

