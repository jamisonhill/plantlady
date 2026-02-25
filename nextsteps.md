# PlantLady App — Implementation Checklist

## Phase 1: Infrastructure — Get containers running
- [x] Create NAS folders: `/volume1/docker/plantlady/{db,photos}`
- [x] Write `docker-compose.yml` (Portainer Stack)
- [x] Deploy PostgreSQL container
- [x] Deploy FastAPI container (skeleton)
- [x] Deploy Nginx container (serves placeholder page)
- [x] Add Cloudflare tunnel entry → `plants.yourdomain.com:3010`
- [x] Verify: app reachable from phone via Cloudflare URL

## Phase 2: Database
- [x] Write and run schema migrations (SQLAlchemy + Alembic)
- [x] Seed initial data: users (Jamison, Amy), 2025 and 2026 plant data from CSV files

## Phase 3: API
- [x] Auth endpoints (PIN check, session)
- [x] CRUD: plant_batches, events, photos, distributions, season_costs
- [x] Photo upload endpoint (saves to volume, returns URL)
- [x] Summary/stats endpoints (for dashboard and year-end review)

## Phase 4: Frontend — Core logging flows
- [ ] PIN login screen
- [ ] User selector
- [ ] Home dashboard (plant list, quick-add button)
- [ ] Quick event logging flow (3 taps max)
- [ ] Add new plant form

## Phase 5: Frontend — Detail views
- [ ] Plant detail page with photo timeline
- [ ] Season cost tracker
- [ ] Distribution log (gifts/trades)

## Phase 6: Dashboard & Analytics
- [ ] Running season stats
- [ ] Both users' combined view
- [ ] Cost tracking + cost per plant

## Phase 7: Year-End Review
- [ ] Auto-generated season report
- [ ] Photo gallery per plant
- [ ] Year-over-year comparison
- [ ] Repeat/Skip/Maybe rollup

---

## Notes
- Current date: 2026-02-24
- Target environment: Synology DS918+ NAS with Docker + Portainer
- External access: Cloudflare Tunnel at `plants.yourdomain.com`
- Database: PostgreSQL (existing on NAS)
- API Port: 8000 (internal)
- Nginx Port: 3010 (exposed)
