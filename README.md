# PlantLady App

A mobile-friendly gardening tracker for collaborative plant management, logging milestones, costs, gifting/trading, and AI-powered plant identification.

**Live**: https://plants.duski.org

---

## START HERE

### Coming Back to Work?
1. **Read**: `IMPLEMENTATION_SUMMARY.md` — full architecture, all phases, what exists today
2. **Ask Claude Code**: "What should we work on next?" — memory has full context
3. **Reference this README** for deployment steps and environment setup

### Ideas for Next Phase
- **PlantInfoPage**: Currently a placeholder — could show detailed care guides sourced from Claude
- **Search/filter**: No search across plants or batches yet
- **Notifications**: Care schedule reminders (push or in-app)
- **Data export**: CSV/backup of plant data
- **Offline support**: Service worker for spotty connections
- **Dark mode**: Theme system exists in CSS vars but no toggle yet
- **Dashboard & Analytics**: Season stats, cost summaries, year-end review

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL running locally

### Frontend (React + Vite)
```bash
cd app
npm install
npm run dev
# Opens at http://localhost:5173
# API calls proxied to http://localhost:8000
```

### Backend (FastAPI)
```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Environment Variables (Backend)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (default in `database.py`) |
| `ANTHROPIC_API_KEY` | Claude Vision API for plant identification |
| `DEBUG` | Set to `true` for SQLAlchemy query logging |

In production, these are set in **Portainer** on the `plantlady-api` container.

---

## Deployment (NAS)

Frontend deploys via SSH. Backend runs as a Docker container managed in Portainer.

```bash
# 1. Build frontend
cd app && npm run build

# 2. Deploy to NAS
tar czf - -C dist . | ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "cd /volume1/docker/plantlady/frontend && rm -rf assets && tar xzf -"

# 3. Restart nginx
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S /usr/local/bin/docker restart plantlady-nginx"
```

Backend changes require rebuilding the Docker image in Portainer.

---

## Project Structure

```
api/                    # FastAPI backend
  routers/              # Route handlers
    plants.py           #   Varieties + Batches
    events.py           #   Batch event timeline
    photos.py           #   Photo upload/gallery/delete
    identify.py         #   Plant ID via Claude Vision
    individual_plants.py#   My Plants, care schedules
    distributions.py    #   Gifts/trades
    costs.py            #   Season cost tracking
    seasons.py          #   Season CRUD
  models.py             # SQLAlchemy models (12 tables)
  schemas.py            # Pydantic request/response schemas
  database.py           # DB connection config
  alembic/              # Database migrations

app/                    # React + TypeScript frontend
  src/
    pages/              # Page components (18 routes)
    components/         # Shared UI components (24)
    api/client.ts       # Typed API client
    types.ts            # TypeScript interfaces
    App.tsx             # Router + layout
```

## Architecture

```
Browser → Cloudflare Tunnel → Nginx (port 3010)
                                ├── Static files (React)
                                ├── /api/* → FastAPI (port 8000)
                                └── /photos/* → Photo storage
                                      FastAPI ↔ PostgreSQL (port 5432)
```

### Container Services (Portainer)
- **plantlady-db**: PostgreSQL 16
- **plantlady-api**: FastAPI (+ anthropic SDK for plant ID)
- **plantlady-nginx**: Nginx reverse proxy

---

## Phase History

| Phase | Name | Key Features |
|-------|------|-------------|
| 1-3 | Backend & Infrastructure | FastAPI, PostgreSQL, Docker, Nginx, Alembic |
| 4 | Frontend Core | React scaffold, Tailwind, routing, design system |
| 8 | Auth & User Management | argon2 PIN hashing, user stats, profile page |
| 9 | Today Page & Data Cleanup | Real data, removed mocks, route cleanup |
| 10 | Plant Batches + My Garden | Batches, events, AddBatchFlow, season selector |
| 11 | Distribution Log & Costs | Gifts/trades, season costs, category breakdowns |
| 12 | Photo Gallery | Batch photo upload/gallery/delete, care event thumbnails |
| 13 | Plant Identifier | Claude Vision API integration, real plant ID from photos |

See `IMPLEMENTATION_SUMMARY.md` for the complete feature list and architecture details.
