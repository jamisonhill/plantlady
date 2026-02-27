# PlantLady App

A beautiful, mobile-friendly gardening tracker for collaborative plant management, logging milestones, costs, and gifting/trading across seasons.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local API development)

### Local Development

1. **Frontend** (React + Vite)
   ```bash
   cd app
   npm install
   npm run dev
   # Opens at http://localhost:5173
   # API calls proxied to http://localhost:8000
   ```

2. **Backend** (FastAPI)
   ```bash
   cd api
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   # Opens at http://localhost:8000
   # Docs at http://localhost:8000/docs
   ```

### Docker Deployment (NAS)

1. Copy files to NAS via Portainer or direct SSH
2. Create NAS folders:
   ```bash
   mkdir -p /volume1/docker/plantlady/{db,photos,frontend}
   ```

3. Copy `.env.example` to `.env` and set `DB_PASSWORD`

4. Deploy via Portainer:
   - Stacks → Add Stack → Upload `docker-compose.yml`
   - Set environment variables from `.env`

5. Verify:
   - API health: `curl http://localhost:3010/api/health`
   - Cloudflare Tunnel: `https://plants.yourdomain.com`

---

## 🗺️ **What's Next?**

**Read `ROADMAP.md` for the complete project roadmap and next steps.**

This is the **single source of truth** for:
- What's completed ✅
- What's in progress 🚀
- What's next 📋
- How to start the next phase

Start with `ROADMAP.md` — it has everything you need to continue development.

---

## Project Structure

```
/
├── docker-compose.yml          # Portainer Stack definition
├── .env.example               # Environment variables template
├── ROADMAP.md                 # 🗺️ **START HERE** — Project roadmap & next steps
├── api/                       # FastAPI backend
│   ├── main.py               # Entry point
│   ├── models.py             # SQLAlchemy ORM models (Phase 2)
│   ├── schemas.py            # Pydantic request/response schemas (Phase 3)
│   ├── database.py           # DB connection & session (Phase 2)
│   ├── routers/              # API route handlers (Phase 3)
│   ├── Dockerfile
│   └── requirements.txt
├── app/                       # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── nginx/
    └── nginx.conf             # Reverse proxy config
```

## Architecture

### Container Services
- **plantlady-db**: PostgreSQL 16
- **plantlady-api**: FastAPI on port 8000 (internal)
- **plantlady-nginx**: Nginx on port 3010 (exposed → Cloudflare)

### Networking
- Internal Docker network for db ↔ api communication
- Nginx reverse proxy routes `/api/*` to FastAPI
- Frontend served as static files via Nginx
- Photos accessible at `/photos/*`

## Implementation Phases

See `nextsteps.md` for detailed checklist:

1. **Infrastructure** ✓ — Docker compose, Nginx, basic containers
2. **Database** — PostgreSQL schema, migrations, seed data
3. **API** — Auth, CRUD endpoints, photo upload
4. **Frontend (Phase 4)** — Login, dashboard, quick logging
5. **Frontend (Phase 5)** — Detail views, cost tracking, distribution log
6. **Dashboard & Analytics** — Stats, year-end review prep
7. **Year-End Review** — Automated report generation with photos

## Data Model Overview

- **Users**: Jamison & Amy (same login, see all data)
- **Seasons**: Years (2025, 2026, etc.)
- **Plant Varieties**: Catalog of plants with germination/maturity data
- **Plant Batches**: Individual seed/plant tracking per season
- **Events**: Milestones (seeded, germinated, bloomed, harvested, etc.)
- **Photos**: Linked to batches/events with captions
- **Distributions**: Gifting & trading log
- **Season Costs**: Seeds, materials, tracking

## Security

- 4-digit PIN login (shared, stored hashed)
- No per-user authentication at this stage (collaborative approach)
- All data visible to both users
- CORS restricted to frontend URLs
- Nginx handles HTTPS via Cloudflare Tunnel

## Notes

- Photo storage: `/volume1/docker/plantlady/photos` on NAS (browsable, backupable)
- Database: PostgreSQL with persistent volume
- API documentation auto-generated at `/api/docs` (Swagger UI)
- Environment variables in `.env` (not committed to git)
