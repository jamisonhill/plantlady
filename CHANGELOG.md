# PlantLady — Changelog

All notable changes to this project are documented here.
Format: [Phase] Date — Summary, then details.

---

## Phase 11: Distribution Log & Cost Tracking
**Date**: 2026-02-28
**Commit**: cb3f9be
**Scope**: Frontend only (backend endpoints already existed)

### New Pages
- `AddDistributionPage.tsx` — Gift/trade entry form with type toggle (GIFT / TRADE), recipient name, quantity, date, and notes fields
- `CostTrackerPage.tsx` — Season cost list with season selector dropdown, total display, per-category breakdown, and delete support
- `AddCostPage.tsx` — Cost entry form with item name, amount, quantity, category picker, one-time toggle, and notes

### New Routes (App.tsx)
- `/batch/:id/distribute` — AddDistributionPage
- `/costs` — CostTrackerPage
- `/add-cost` — AddCostPage

### Updated Files
- `app/src/types.ts` — Added Distribution, DistributionSummary, SeasonCost, SeasonCostTotal interfaces
- `app/src/api/client.ts` — Added getDistributions, createDistribution, deleteDistribution, getDistributionSummary, getCosts, createCost, deleteCost, getSeasonCostTotal
- `app/src/pages/BatchDetailPage.tsx` — Added Distributions section: list view, summary stats, delete button, "Add Gift/Trade" navigation button
- `app/src/pages/MyGardenPage.tsx` — Added "Season Costs" button linking to /costs

---

## Phase 10: Plant Batches + My Garden (Phases 8-10 documented in MEMORY.md)
**Date**: 2026-02-27 to 2026-02-28
**Commits**: d422f4b, 95dfdc8, 6296bad, cde6bf6, 40203db

### Changes
- Collection page redesigned with My Plants / My Garden toggle
- MyGardenPage wired to real API: seasons, batches, events
- BatchDetailPage with event timeline and stage computation from latest event type
- AddBatchFlow for creating new plant batches with variety picker
- LogEventPage "Cancel" and post-save navigation fixed to return to batch
- Fixed trailing slash on events endpoint (95dfdc8)
- Removed auto-log SEEDED event from batch creation (6296bad)
- Fixed optional chaining in MyGardenPage empty state (cde6bf6)

---

## Phase 9: Today Page & Data Cleanup
**Date**: 2026-02-27

### Changes
- TodayPage migrated from mock data to real API (getPlants, getCareSchedules, getCareEvents)
- Care due today calculated per plant, sorted by most overdue first
- Upcoming care calendar built for next 7 days
- Personalized header shows real user name and streak from getUserStats()
- Care logging calls logCareEvent() API and refreshes data
- CollectionPage.tsx deleted (184 lines removed)
- Duplicate /my-plants route removed from App.tsx
- NAS helper script added at scripts/nas-helper.sh

---

## Phase 8: My Plants Integration
**Date**: 2026-02-27

### Backend
- IndividualPlant, CareSchedule, CareEvent ORM models added to models.py
- Alembic migration 002_individual_plants.py: three new tables, four indexes
- Pydantic schemas for IndividualPlant, CareSchedule, CareEvent
- Router individual_plants.py: 10 endpoints (CRUD, care logging, photo upload)
- Registered individual_plants router in main.py

### Frontend
- MyPlantsPage: loads real plants, calculates care urgency per plant
- PlantDetailPage: fetches plant, schedules, events; logs care events; re-fetches on update
- AddPlantFlow: creates plant + 2-3 care schedules (WATERING, FERTILIZING, optional REPOTTING)
- types.ts: added photo_filename, user_id, created_at to CareEvent
- client.ts: added getPlantDetail, createIndividualPlant, createCareSchedule, uploadCareEventPhoto

---

## Phase 5 (Auth): Auth & User Management
**Date**: Prior to Phase 8

### Changes
- PIN hashing switched from bcrypt to argon2 (argon2-cffi 23.1.0) to resolve Docker compatibility issues
- Users re-seeded with argon2id hashes
- User stats endpoint added: GET /api/users/{user_id}/stats returns batch_count, event_count, streak
- ProfilePage updated to fetch and display real stats, uses display_color for avatar
- User interface in types.ts extended with display_color, created_at

---

## Phase 4: Frontend Core Logging Flows
**Date**: 2026-02-25
**Deployment**: NAS at http://192.168.0.9:3010/

### New Pages
- PinLoginPage.tsx — 4-digit PIN entry, auto-submit on 4th digit, direct navigation to home
- HomePage.tsx — Dashboard showing current season plant batches, FAB for quick add
- LogEventPage.tsx — 3-step state machine for logging milestones (10 event types)
- AddPlantPage.tsx — New batch form with searchable VarietyPicker

### New Components
- LoadingSpinner.tsx
- PlantCard.tsx
- EventTypeGrid.tsx (10 event types with emoji mappings)
- VarietyPicker.tsx (searchable by common_name and scientific_name)

### New Infrastructure
- AuthContext.tsx — global auth state with sessionStorage persistence
- api/client.ts — centralized fetch client
- types.ts — TypeScript interfaces for all API shapes

### Backend Changes
- /auth/login changed from returning User[] to single User
- CORS origins expanded for NAS IP

### Fixes
- NULL created_at on users, seasons, varieties resolved
- Nginx proxy_pass trailing slash fix for /api/ routing
- CORS added for http://192.168.0.9:3010

---

## Phase 3: API
**Date**: Before Phase 4

40+ REST endpoints across 6 routers. Full Swagger docs at /api/docs.

Routers: plants, events, seasons, costs, distributions, photos

---

## Phase 2: Database
**Date**: Before Phase 3

8 SQLAlchemy ORM models, Alembic migrations, CSV seed data import.
Tables: users, seasons, plant_varieties, plant_batches, events, photos, distributions, season_costs

---

## Phase 1: Infrastructure
**Date**: Project start

Docker Compose stack (PostgreSQL, FastAPI, Nginx), Cloudflare Tunnel configuration, NAS deployment guide.
