# Quick Start Guide

## ✅ Dependencies Installed

All required dependencies are now installed, including:
- ✅ `nodemailer` - For email verification
- ✅ All other dependencies from package.json

## 🚀 Start the Server

```bash
cd travooz_vendor/backend
npm run dev
```

You should see:
```
🚀 Travooz Vendor Backend server running on port 5000
✅ Database connected successfully!
```

## ⚙️ Environment Setup

Make sure you have a `.env` file with:

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

## 🧪 Test the Backend

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Database Health:**
   ```bash
   curl http://localhost:5000/health/db
   ```

3. **Create Property (Test):**
   ```bash
   curl -X POST http://localhost:5000/api/v1/stays/properties \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "propertyName": "Test Property"
     }'
   ```

## ✅ All Set!

The backend is now ready. Once it's running successfully, we can proceed to migrate the frontend.

