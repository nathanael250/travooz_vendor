# Travooz Vendor Platform

Unified vendor platform for managing all Travooz services:
- 🏨 Stays (Hotels, Homestays, Properties)
- 🍽️ Restaurants
- 🎒 Tour Packages
- 🚗 Car Rentals
- 🎯 Activities

## Architecture

```
travooz_vendor/
├── backend/          # Unified Node.js backend (port 5000)
│   ├── src/
│   │   ├── services/    # Service modules (stays, restaurants, tours, cars, activities)
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── models/      # Database models
│   │   └── middlewares/ # Shared middlewares
│   └── config/          # Database, environment config
│
└── frontend/       # Unified React frontend (port 8080)
    ├── src/
    │   ├── pages/       # Service dashboards (stays, restaurants, etc.)
    │   ├── services/    # API service clients
    │   └── components/  # Shared components
    └── public/
```

## Features

- ✅ Single backend process
- ✅ Single frontend application
- ✅ Unified authentication
- ✅ Shared database (travooz_database)
- ✅ Service-based organization
- ✅ Modular architecture

## Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure .env with API URL
npm run dev
```

## Database

All services use a single database: `travooz_database`

Tables are organized with prefixes:
- `stays_*` - Stays service tables
- `restaurants`, `menu_*` - Restaurant service tables
- `tour_*` - Tour package tables
- `car_*` - Car rental tables
- `activities` - Activity tables
- `users` - Shared user table

## Services

Each service has its own module:
- `/api/v1/stays/*` - Stays management
- `/api/v1/restaurants/*` - Restaurant management
- `/api/v1/tours/*` - Tour package management
- `/api/v1/cars/*` - Car rental management
- `/api/v1/activities/*` - Activity management

