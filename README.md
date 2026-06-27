# Shen Nong TCM

> Traditional Chinese Medicine meets modern full-stack engineering.

A production-grade appointment booking and clinic management platform for Shen Nong Traditional Chinese Medicine — serving patients across Bangladesh with multiple clinic locations.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌───────────┐
│  React 19 + Vite │────▶│  ASP.NET Core 8 API  │────▶│ SQL Server│
│  Tailwind CSS    │     │  SignalR · JWT · EF   │     │  (SQLite) │
└─────────────────┘     └──────────────────────┘     └───────────┘
```

**Frontend** — React 19 with Vite (Rolldown), Tailwind CSS, Framer Motion, Recharts  
**Backend** — ASP.NET Core 8 Web API, Entity Framework Core, SignalR, JWT authentication  
**Real-time** — SignalR WebSocket hub for live chat between patients and agents  
**i18n** — English, 中文, বাংলা  

## Features

- **Patient Portal** — Book appointments, manage visit history, save frequent visitors
- **Partner System** — Multi-tier referral network with recursive team tree visualization
- **Agent Dashboard** — Real-time chat workspace with session management and unread tracking
- **Admin Console** — User management, appointment processing, partner approvals, analytics
- **Live Chat** — WebSocket-powered messaging between patients and support agents
- **Clinic Map** — Interactive Leaflet map with multi-location navigation
- **Role-based Access** — JWT-secured authentication with user / agent / admin roles

## Quick Start

```bash
# Clone
git clone https://github.com/Tastelessor/shennong.git
cd shennong

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && dotnet run
```

## API Endpoints

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `POST /api/login`, `/register`, `GET /verify` | JWT authentication |
| User | `GET /api/user/profile/:id`, `POST /bind-inviter` | Profile & referral binding |
| Appointments | `GET/POST /api/appointments` | Booking & history |
| Visitors | `GET/POST/DELETE /api/visitors` | Frequent visitor management |
| Partners | `POST /api/partner/apply`, `GET /tree/:id` | Partner applications & hierarchy |
| Admin | `GET /api/admin/all`, `/stats`, `/partners-detailed` | System-wide data & analytics |
| Agent | `GET /api/agent/sessions` | Chat session management |
| Chat | `GET /api/chat/history`, `POST /read` + SignalR hub | Real-time messaging |

## Project Structure

```
shennong/
├── frontend/          # React 19 + Vite SPA
│   ├── src/
│   │   ├── api/       # API client (axios)
│   │   ├── features/  # Feature modules (auth, chat, appointment, i18n, user)
│   │   ├── pages/     # Route pages (Home, Admin, Agent)
│   │   ├── layouts/   # Layout wrappers
│   │   ├── providers/ # Context providers (Auth, Socket, I18n)
│   │   └── components/# Shared UI components
│   └── ...
├── backend/           # ASP.NET Core 8 Web API
│   ├── Controllers/   # API controllers
│   ├── Models/        # EF Core entities
│   ├── DTOs/          # Request/response DTOs
│   ├── Services/      # Business logic
│   ├── Hubs/          # SignalR hubs
│   └── Data/          # DbContext & migrations
└── docker-compose.yml # One-command startup
```

## Tech Decisions

- **Why ASP.NET Core?** — Type safety, async/await throughout, EF Core migrations, SignalR for real-time. A natural fit for demonstrating enterprise-grade .NET development.
- **Why SignalR over socket.io?** — Unified .NET ecosystem, native WebSocket/Long Polling fallback, built-in group management.
- **Why EF Core?** — Code First migrations eliminate manual schema management. Database-agnostic: SQLite for dev, SQL Server for prod.

## License

MIT
