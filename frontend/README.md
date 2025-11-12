# Travooz Vendor Frontend

Unified React frontend for all Travooz vendor services.

## Structure

```
frontend/
├── src/
│   ├── pages/          # Page components organized by service
│   │   ├── stays/
│   │   ├── restaurants/
│   │   ├── tours/
│   │   ├── cars/
│   │   └── activities/
│   ├── services/       # API service clients
│   ├── components/     # Shared components
│   ├── layouts/        # Layout components
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
├── public/             # Static assets
└── App.jsx            # Main app component
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start development server:
```bash
npm run dev
```

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 Unified authentication
- 📱 Responsive design
- 🚀 Fast development with Vite
- 🔄 React Router for navigation
- 📡 Axios for API calls

