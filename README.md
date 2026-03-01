# PlantLady App

A beautiful, mobile-friendly gardening tracker for collaborative plant management, logging milestones, costs, and gifting/trading across seasons.

---

## START HERE

### Coming Back to Work?
1. **Read**: `ROADMAP.md` — current status and next phase (Phase 12)
2. **Check**: `CHANGELOG.md` — what changed in the last phase
3. **Reference**: `PHASE_11_COMPLETE.md` — detailed record of Phase 11 work

### Want Project Overview?
- **ROADMAP.md** — Complete project roadmap, all phases, long-term plan
- **CHANGELOG.md** — Summary of every phase's changes
- **PROJECT_STATUS.md** — Phase checklist and progress tracker

### Want to Deploy or Set Up?
- See "Quick Start" section below
- See "Docker Deployment (NAS)" for production setup

---

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


## Project Structure

```
/
├── README.md                  # START HERE — Overview & documentation index
├── ROADMAP.md                 # Long-term project roadmap & all phases
├── CHANGELOG.md               # Summary of every phase's changes
├── PROJECT_STATUS.md          # Phase checklist and progress tracker
├── PHASE_11_COMPLETE.md       # Detailed record of Phase 11
├── docker-compose.yml          # Portainer Stack definition
├── .env.example               # Environment variables template
├── .env.local                 # Local NAS config (gitignored)
├── scripts/nas-helper.sh      # 🔧 Helper script for NAS operations
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

See `ROADMAP.md` for full details.

1. **Infrastructure** (complete) — Docker compose, Nginx, basic containers
2. **Database** (complete) — PostgreSQL schema, migrations, seed data
3. **API** (complete) — 40+ endpoints, auth, CRUD, photo upload
4. **Frontend Core** (complete) — Login, dashboard, quick logging
5. **Auth** (complete) — Argon2 PIN hashing, user stats
6. **My Plants** (complete) — Individual plant tracking, care schedules
7. **Today Page** (complete) — Real data, care urgency, live logging
8. **My Garden** (complete) — Batch tracking, event timeline
9-10. **Collection & Polish** (complete) — Toggle view, route cleanup
11. **Distribution & Costs** (complete) — Gift/trade log, season costs
12. **Photo Gallery** — Batch and plant photos (next)
13. **Dashboard & Analytics** — Season stats, cost summaries
14. **Year-End Review** — Auto-generated season report

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
