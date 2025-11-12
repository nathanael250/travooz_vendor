# Travooz Vendor Backend

Unified backend API for all Travooz vendor services.

## Structure

```
backend/
├── src/
│   ├── services/        # Business logic organized by service
│   │   ├── stays/
│   │   ├── restaurants/
│   │   ├── tours/
│   │   ├── cars/
│   │   └── activities/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API route definitions
│   ├── models/         # Database models
│   ├── middlewares/    # Shared middlewares (auth, validation, etc.)
│   └── utils/          # Utility functions
├── config/             # Configuration files
│   └── database.js     # Database connection
└── server.js           # Main entry point
```

## API Routes

- `/api/v1/stays/*` - Stays management
- `/api/v1/restaurants/*` - Restaurant management
- `/api/v1/tours/*` - Tour package management
- `/api/v1/cars/*` - Car rental management
- `/api/v1/activities/*` - Activity management
- `/api/v1/auth/*` - Authentication
- `/api/v1/admin/*` - Admin operations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Start development server:
```bash
npm run dev
```

## Database

Uses single database: `travooz_database`

All tables use service prefixes:
- `stays_*` - Stays tables
- `restaurants`, `menu_*` - Restaurant tables
- `tour_*` - Tour tables
- `car_*` - Car tables
- `activities` - Activity tables
- `users` - Shared user table

