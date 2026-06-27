<div align="center">

# Shen Nong TCM

**Traditional Chinese Medicine clinic management platform**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Rolldown-646cff?logo=vite)](https://vitejs.dev)
[![.NET](https://img.shields.io/badge/.NET-8-512bd4?logo=dotnet)](https://dotnet.microsoft.com)
[![SignalR](https://img.shields.io/badge/SignalR-Realtime-007acc)](https://learn.microsoft.com/aspnet/core/signalr)

Appointment booking · Partner referral system · Live chat · Multi-language (EN / 中文 / বাংলা)

</div>

---

## About

Shen Nong TCM is a clinic management platform built for a traditional Chinese medicine practice in Sylhet, Bangladesh. It handles patient appointment booking, a multi-tier partner referral system, real-time patient-agent chat, and clinic location management — all wrapped in a trilingual interface.

This is a **commercial project**, not open source.

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend/Shennong.Api && dotnet run
```

Frontend: `http://localhost:5173` · API: `http://localhost:5000`

## Architecture

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│   React 19 SPA   │──────▶│  ASP.NET Core 8 API  │──────▶│  SQL Server  │
│   Vite + Tailwind│  REST │  SignalR · JWT · EF  │  TCP  │  (or SQLite) │
└──────────────────┘       └──────────────────────┘       └──────────────┘
        │                          │
        │   @microsoft/signalr     │   WebSocket
        └──────────────────────────┘
```

## Features

| | |
|---|---|
| 🏥 **Patient Portal** | Book appointments, view history, save frequent visitors |
| 👥 **Partner System** | Multi-tier referral network with recursive team tree visualization |
| 💬 **Live Chat** | Real-time messaging between patients and agents (SignalR) |
| 📊 **Admin Dashboard** | User management, appointment processing, partner approvals, analytics |
| 🗺️ **Clinic Map** | Interactive Leaflet map with multi-location navigation |
| 🔐 **Auth** | JWT-based with role-based access control (user / agent / admin) |
| 🌐 **i18n** | English, 中文, বাংলা — switchable at runtime |

## Project Structure

```
shennong/
├── frontend/                # React 19 SPA
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── features/        # Feature modules (auth, chat, appointment, i18n, user)
│   │   ├── pages/           # Route pages (Home, Admin, Agent)
│   │   ├── layouts/         # Layout wrappers
│   │   ├── providers/       # Context providers (Auth, Socket, I18n)
│   │   ├── components/      # Shared UI components
│   │   └── utils/           # Helpers
│   └── vite.config.js
│
├── backend/
│   ├── Shennong.Api/        # ASP.NET Core 8 Web API
│   │   ├── Controllers/     # 9 API controllers
│   │   ├── Models/          # EF Core entities
│   │   ├── DTOs/            # Request/response records
│   │   ├── Data/            # DbContext
│   │   ├── Services/        # JWT, ID generation
│   │   ├── Hubs/            # SignalR chat hub
│   │   └── Program.cs       # DI + middleware pipeline
│   └── Shennong.sln
│
├── terraform/               # AWS infrastructure (ECS, RDS, ALB, VPC)
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite (Rolldown), Tailwind CSS, Framer Motion, Recharts, Leaflet |
| Backend | ASP.NET Core 8, Entity Framework Core, SignalR, BCrypt |
| Auth | JWT Bearer tokens, role-based authorization |
| Database | SQLite (dev) → SQL Server (prod) |
| Infrastructure | Terraform → AWS (ECS Fargate, RDS, ALB, Route 53) |
| Real-time | SignalR (WebSocket with Long Polling fallback) |

## Tech Decisions

### Frontend

**Why React 19 (not Next.js)?**
This is a SPA with no SSR/SSG needs — the content is dynamic (appointments, chat, dashboards), not SEO-driven. Next.js would add server complexity we don't need. Plain React + Vite keeps the build simple and the deployment to S3/CloudFront trivial.

**Why Vite with Rolldown (not Webpack/CRA)?**
Vite's dev server starts in milliseconds via native ESM. Rolldown (Rust-based bundler) gives us fast production builds. CRA is dead; Webpack is overkill for a project this size.

**Why Tailwind CSS (not styled-components/CSS modules)?**
Utility-first CSS eliminates naming decisions and keeps styles co-located with markup. For a project with one developer, the reduced context-switching matters more than CSS-in-JS flexibility.

**Why Framer Motion?**
Page transitions and modal animations. The clinic branding benefits from smooth, polished feel. Framer Motion is the standard for React animation — declarative, performant, small bundle impact with tree-shaking.

**Why Leaflet (not Google Maps)?**
Free, open-source, no API key required. The clinic locations are static coordinates — we don't need Google's routing or Places API. Leaflet with OpenStreetMap tiles is sufficient and costs nothing.

**Why Recharts?**
Admin dashboard needs charts (user activity, appointment trends). Recharts is React-native, composable, and covers our needs (line, area, bar) without the weight of D3.

**Why `@microsoft/signalr` (not socket.io)?**
The backend is ASP.NET Core — SignalR is the native choice. It handles WebSocket/Long Polling/SSE negotiation automatically, integrates with ASP.NET auth middleware, and keeps the stack within the Microsoft ecosystem. socket.io would require a third-party bridge on the server side.

### Backend

**Why ASP.NET Core 8 (not Node.js/Express)?**
The original backend was Node.js. Migration to C# was deliberate:
- **Type safety** — the partner tree recursion and invite-stats logic had subtle bugs in JS that TypeScript/C# would catch at compile time
- **async/await consistency** — every I/O operation is properly async, no callback hell
- **EF Core migrations** — schema management without hand-written ALTER TABLE statements
- **SignalR** — first-party real-time support, no dependency on socket.io
- **Resume value** — demonstrates enterprise .NET skills for the NZ job market

**Why EF Core (not Dapper/raw SQL)?**
Code First migrations eliminate manual schema management. The data model is simple enough that EF's overhead is negligible. For the recursive partner tree query, we fall back to in-memory traversal — EF doesn't support recursive CTEs natively, and the user volume doesn't warrant optimization.

**Why SQLite (dev) → SQL Server (prod)?**
SQLite requires zero setup — `dotnet run` and the database exists. EF Core's provider model makes the switch a connection string change. SQL Server is chosen for production because it's free on Azure (up to 10 vCores with Azure SQL), integrates with the AWS/Azure ecosystem, and supports concurrent writes without SQLite's locking issues.

**Why JWT (not session cookies)?**
The frontend is a SPA deployed separately from the API. JWT tokens work across origins without CORS cookie complications. The 7-day expiry with refresh-on-login balances security and UX — patients booking appointments don't want to re-authenticate daily.

**Why BCrypt (not ASP.NET Identity)?**
ASP.NET Identity brings a full user management system (confirmation, lockout, two-factor) that this project doesn't need. The auth flow is simple: register → login → verify. BCrypt gives us password hashing without the Identity framework's schema and middleware overhead.

### Infrastructure

**Why Terraform (not CDK/Pulumi/Console)?**
Infrastructure as code is non-negotiable for reproducibility. Terraform is cloud-agnostic (AWS today, Azure tomorrow), has the largest provider ecosystem, and the HCL syntax is readable. CDK/Pulumi let you write infra in general-purpose languages, but that's a feature we don't need — HCL's constraints keep configurations declarative and reviewable.

**Why AWS ECS Fargate (not EC2/Lambda)?**
Fargate gives us container orchestration without managing EC2 instances. The API is a long-running server (SignalR WebSocket connections), so Lambda's cold-start model doesn't fit. Fargate's pay-per-request pricing works for a low-traffic clinic app.

**Why no Docker Compose?**
The development environment has zero external dependencies — SQLite is embedded, the frontend is a static dev server. Docker Compose would add complexity for no benefit. Production deployment goes through Terraform → ECS, not docker-compose.

## API

RESTful API with JWT authentication.

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `POST /api/auth/register`, `/login`, `GET /verify` | JWT authentication |
| User | `GET /api/user/profile/:id`, `POST /bind-inviter` | Profile & referral binding |
| Appointments | `GET/POST /api/appointments` | Booking & history |
| Visitors | `GET/POST/DELETE /api/visitors` | Frequent visitor management |
| Partners | `POST /api/partner/apply`, `GET /tree/:id` | Applications & hierarchy |
| Admin | `GET /api/admin/all`, `/stats`, `/partners-detailed` | System-wide data |
| Agent | `GET /api/agent/sessions` | Chat session management |
| Chat | `GET /api/chat/history`, `POST /read` + SignalR hub | Real-time messaging |

## Deployment

Infrastructure managed via Terraform in `terraform/`. Target: AWS ECS Fargate + RDS + ALB + Route 53.

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## License

Proprietary. All rights reserved. This is a commercial project — not open source.
