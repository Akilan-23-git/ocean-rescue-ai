# MSAR — Maritime Search & Rescue Prediction System

Enterprise-grade frontend dashboard for maritime search and rescue operations, inspired by OpenDrift-based trajectory prediction research.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![MUI](https://img.shields.io/badge/MUI-6-007FFF?logo=mui)

## Overview

MSAR provides coast guards and maritime rescue agencies with a professional dashboard to:

- Create and manage rescue missions
- Set incident locations on interactive ocean maps
- *(Upcoming)* Configure drift simulations, view predictions, and generate reports

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| UI | Material UI 6, Framer Motion |
| Maps | Leaflet + React Leaflet |
| Data | React Query, Axios |
| Forms | React Hook Form |
| Charts | Recharts |
| Routing | React Router 7 |

## Getting Started

### Prerequisites

- Node.js 20+ (22 recommended)
- npm 10+

### Installation

```bash
git clone <your-repo-url>
cd Marine
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/     # Shared UI & layout components
│   ├── layout/       # TopNavBar, Sidebar
│   └── ui/           # GlassCard, StatCard, etc.
├── features/         # Feature modules (Clean Architecture)
│   ├── mission/      # Phase 1 — Mission Creation
│   └── incident-location/  # Phase 2 — Incident Location
├── pages/            # Route page components
├── layouts/          # Dashboard layout wrapper
├── hooks/            # Shared hooks
├── services/         # API client (Axios)
├── routes/           # React Router config
├── types/            # TypeScript interfaces
├── context/          # React context providers
├── constants/        # App constants
├── theme/            # MUI maritime theme
└── utils/            # Utility functions
```

## Implemented Phases

### Phase 1 — Mission Creation
- Auto-generated Mission ID
- Mission details form with validation
- Object type selection (person, vessels, oil spill, etc.)
- Life jacket status, incident type, notes
- Save Draft / Start Simulation

### Phase 2 — Incident Location
- Interactive Leaflet ocean map
- Click to place / drag marker
- Manual coordinate entry & search
- Reference points with GPS import
- Map layers: ports, shipping lanes, coastline radius
- Distance measurement tool

### Upcoming Phases (3–13)
Environmental Data, Simulation Setup, Drift Prediction, Search Area, Live Tracking, Decision Support, Mission Management, Historical Replay, Analytics, Reports, Administration.

## API Integration

The frontend is designed to connect to:

- **Spring Boot** — `VITE_API_BASE_URL` (default: `http://localhost:8080/api`)
- **FastAPI** — `VITE_FASTAPI_BASE_URL` (default: `http://localhost:8000/api`)

Currently uses localStorage for mission persistence during development.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## License

MIT
