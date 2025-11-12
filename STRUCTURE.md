# Travooz Vendor Platform - Structure Overview

## Directory Structure

```
travooz_vendor/
├── README.md                    # Main documentation
├── MIGRATION_GUIDE.md          # Guide for migrating from old structure
├── STRUCTURE.md                 # This file
│
├── backend/                     # Unified Node.js Backend
│   ├── package.json
│   ├── README.md
│   ├── .env.example            # Environment variables template
│   ├── .gitignore
│   │
│   ├── config/
│   │   └── database.js         # Database connection configuration
│   │
│   ├── src/
│   │   ├── server.js           # Main entry point
│   │   │
│   │   ├── services/           # Business logic (organized by service)
│   │   │   ├── stays/
│   │   │   │   ├── property.service.js
│   │   │   │   ├── booking.service.js
│   │   │   │   └── setup.service.js
│   │   │   ├── restaurants/
│   │   │   │   ├── menu.service.js
│   │   │   │   ├── order.service.js
│   │   │   │   └── setup.service.js
│   │   │   ├── tours/
│   │   │   ├── cars/
│   │   │   └── activities/
│   │   │
│   │   ├── controllers/        # Request handlers (organized by service)
│   │   │   ├── stays/
│   │   │   ├── restaurants/
│   │   │   ├── tours/
│   │   │   ├── cars/
│   │   │   └── activities/
│   │   │
│   │   ├── routes/             # API route definitions
│   │   │   ├── stays.routes.js
│   │   │   ├── restaurants.routes.js
│   │   │   ├── tours.routes.js
│   │   │   ├── cars.routes.js
│   │   │   ├── activities.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── models/             # Database models
│   │   │   ├── stays/
│   │   │   ├── restaurants/
│   │   │   └── ...
│   │   │
│   │   ├── middlewares/        # Shared middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   │
│   │   └── utils/              # Utility functions
│   │       ├── response.utils.js
│   │       └── validation.utils.js
│   │
│   └── uploads/                # File uploads directory
│
└── frontend/                    # Unified React Frontend
    ├── package.json
    ├── README.md
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example            # Environment variables template
    ├── .gitignore
    │
    ├── public/                  # Static assets
    │
    └── src/
        ├── main.jsx             # Entry point
        ├── App.jsx              # Main app component
        ├── index.css            # Global styles
        │
        ├── pages/               # Page components (organized by service)
        │   ├── stays/
        │   │   ├── Dashboard.jsx
        │   │   ├── Setup/
        │   │   └── Management/
        │   ├── restaurants/
        │   ├── tours/
        │   ├── cars/
        │   └── activities/
        │
        ├── services/            # API service clients
        │   ├── apiClient.js     # Axios instance with interceptors
        │   ├── staysService.js
        │   ├── restaurantService.js
        │   ├── tourService.js
        │   ├── carService.js
        │   └── activityService.js
        │
        ├── components/          # Shared React components
        │   ├── common/
        │   └── ui/
        │
        ├── layouts/            # Layout components
        │   ├── DashboardLayout.jsx
        │   └── AuthLayout.jsx
        │
        ├── hooks/              # Custom React hooks
        │   ├── useAuth.js
        │   └── useApi.js
        │
        └── utils/              # Utility functions
            └── helpers.js
```

## API Route Structure

```
/api/v1/
├── auth/                       # Authentication
│   ├── POST /login
│   ├── POST /signup
│   ├── POST /refresh-token
│   └── GET  /verify
│
├── stays/                      # Stays service
│   ├── GET    /properties
│   ├── POST   /properties
│   ├── GET    /properties/:id
│   ├── PUT    /properties/:id
│   ├── POST   /setup/...
│   └── ...
│
├── restaurants/                # Restaurant service
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── POST   /setup/...
│   └── ...
│
├── tours/                      # Tour packages
├── cars/                       # Car rentals
├── activities/                 # Activities
│
└── admin/                      # Admin operations
    ├── stays/
    ├── restaurants/
    └── ...
```

## Database Structure

Single database: `travooz_database`

### Table Organization

```
travooz_database/
├── Core Tables
│   ├── users                   # Shared user table
│   ├── categories
│   ├── subcategories
│   └── ...
│
├── Stays Tables (stays_ prefix)
│   ├── stays_properties
│   ├── stays_rooms
│   ├── stays_property_policies
│   ├── stays_property_amenities
│   └── ...
│
├── Restaurant Tables
│   ├── restaurants
│   ├── menu_categories
│   ├── menu_items
│   ├── orders
│   └── ...
│
├── Tour Tables (tour_ prefix)
│   ├── tour_packages
│   ├── tour_package_itinerary
│   └── ...
│
├── Car Tables (car_ prefix)
│   └── cars
│
└── Activity Tables
    └── activities
```

## Service Organization Principles

1. **Separation by Service**: Each service (stays, restaurants, etc.) has its own folder in services, controllers, and routes
2. **Shared Resources**: Common utilities, middlewares, and models are shared
3. **Unified Authentication**: Single auth system for all services
4. **Single Database**: All services use the same database with table prefixes
5. **Modular Routes**: Each service has its own route file that gets registered in server.js

## Next Steps

1. ✅ Structure created
2. ⏳ Migrate stays service from `travooz_stay_backend`
3. ⏳ Migrate restaurant service from `travooz_backend`
4. ⏳ Migrate other services (tours, cars, activities)
5. ⏳ Migrate frontend pages
6. ⏳ Test and validate
7. ⏳ Update documentation

