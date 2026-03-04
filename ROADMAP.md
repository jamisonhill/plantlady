# PlantLady App — Roadmap

**Last Updated**: March 3, 2026
**Current Status**: Phase 16 Complete ✅
**Next Up**: See Bullpen below

---

## Current State (March 3, 2026)

### ✅ What's Working
- PIN authentication (argon2 hashing)
- My Plants — list, detail, add, care log, photo
- Today page — streak, My Garden, Friend Activity
- Collection toggle — My Plants / My Garden
- My Garden — season selector, batch list
- Batch detail — event timeline, care history, photo gallery, distribution log
- Add Batch flow
- Add Plant flow — name/location, acquired date (backdatable), photo upload
- Plant detail — hero photo, CareCalendar, CareLog, Log Care modal
- Care log — 4 types (💧 Watering, 🌿 Fertilizing, 🌱 Milestone, 📝 Note), milestone presets
- Photo gallery on batches (upload, fullscreen modal, delete)
- Individual plant hero photo (set during add flow or from plant page)
- Distribution log per batch (gifts and trades)
- Season cost tracker with category breakdown
- Plant identifier via Claude Vision API — photo → name, confidence, care tips
- "Add to My Plants" from identifier result pre-fills name in AddPlantFlow
- Season Dashboard — batches, varieties, gifts, trades, cost breakdown
- Alembic migrations at revision 004
- Deployed at https://plants.duski.org

### ⚠️ Known Gaps
- **Plant photo not displayed** on PlantDetailPage header or Collection list — uploaded but not shown (see Bullpen #1)
- Plant editing — no way to update name/location/notes after creation
- Batch editing — no way to update batch fields after creation

---

## Completed Phases

### Phase 1–7: Infrastructure, Schema, API, Auth ✅
Docker + NAS, PostgreSQL, FastAPI, React scaffold, 40+ endpoints, PIN auth, argon2 hashing.

### Phase 8: My Plants ✅ *Feb 27*
IndividualPlant model, care events, MyPlantsPage, PlantDetailPage, AddPlantFlow.

### Phase 9: Today Page & Data Cleanup ✅ *Feb 27*
TodayPage real data, removed mock data, consolidated routes.

### Phase 10: Plant Batches + My Garden ✅ *Feb 28*
Batch tracking, Collection toggle, BatchDetailPage, AddBatchFlow, event logging.

### Phase 11: Distribution Log & Cost Tracking ✅ *Feb 28*
Gift/trade distributions per batch, season cost tracker, category breakdown.

### Phase 12: Photo Gallery & Batch Photos ✅ *Feb 28*
Batch photo gallery, fullscreen PhotoModal, care event thumbnails, plant hero image.

### Phase 13: Plant Identifier ✅ *Mar 1 (fixed Mar 3)*
Claude Vision API integration — upload a photo, get plant name, scientific name, confidence, care tips. Result page offers "Add to My Plants" pre-filling the name.

**Fix required after initial deploy** (Mar 3): wrong model ID (`claude-sonnet-4-20250514` → `claude-sonnet-4-6`), `identify` router missing from `main.py`, `anthropic` package missing from Docker image, `ANTHROPIC_API_KEY` missing from container. Required full image rebuild.

### Phase 14: Dashboard & Analytics ✅ *Mar 3*
DashboardPage (from Profile), season selector, Overview stats, Top Varieties, Cost Breakdown. Frontend-only.

### Phase 15: Care History Overhaul ✅ *Mar 3*
Replaced schedule-based care system with log-first history.
- Dropped `care_schedules` table (Migration 003)
- `CareCalendar` component — monthly grid, emoji dots per type
- `CareLog` component — date-grouped log with scroll-to-date
- `LogCareModal` — 4 care types, milestone presets, notes, photo
- Wired into both PlantDetailPage and BatchDetailPage

### Phase 16: AddPlantFlow Improvements ✅ *Mar 3*
Cleaned up the Add Plant flow after Phase 15 removed care schedules.
- Removed watering/fertilizing/repotting step (care schedules are gone)
- Added **acquired date** step — date picker with "Today / This week / This month" quick picks, supports backdating
- Enabled **photo upload** step — "Take Photo" (rear camera on mobile) and "From Library" both work
- Photo is uploaded immediately after plant creation via new `POST /individual-plants/{plant_id}/photo` endpoint
- `acquired_date` stored in DB (Migration 004 — new `DATE` column on `individual_plants`)
- AddPlantFlow pre-fills both `commonName` and `scientificName` when navigated from plant identifier result

---

## Bullpen — Upcoming Features

Roughly in priority order.

### 1. 🌿 Individual Plant Photo Display *(requested Mar 3)*
The `photo_url` field is set on `IndividualPlant` (uploaded in AddPlantFlow or via the `/photo` endpoint) but is **not yet displayed** anywhere in the UI.

**What to build:**
- `PlantDetailPage` — show uploaded photo in the hero area at the top of the page instead of the green placeholder. If no photo, keep the current placeholder.
- `MyPlantsPage` (Collection list) — show a small thumbnail alongside each plant card if a photo exists.

**Scope:** Frontend only — no backend changes needed. The `photo_url` field is already returned by the API and typed in `IndividualPlant`. The photo file is served at `/photos/{filename}` via nginx (same as batch photos).

**Files to touch:** `PlantDetailPage.tsx`, `MyPlantsPage.tsx` (possibly a shared `PlantCard` component).

---

### 2. Plant & Batch Editing
No way to update a plant or batch after creation. Common need: fix a typo, change location, update notes.
- Plant: Edit button on PlantDetailPage → form with name, scientific name, location, notes, acquired date
- Batch: Edit button on BatchDetailPage → form with location, source, notes, repeat_next_year
- Backend: `PUT /individual-plants/{id}` already exists; `PATCH /plants/batches/{id}` may need adding

### 3. Identify → Add Batch
After identifying a plant, offer an "Add as Garden Batch" button alongside "Add to My Plants". Pre-fills variety name in AddBatchFlow via `location.state`. Frontend-only.

### 4. Search / Filter
No way to find a plant or batch by name.
- MyPlantsPage and MyGardenPage: text input, client-side filter
- No backend changes needed

### 5. Plant Notes & Milestones on Collection List
MyPlantsPage currently just shows name + "Tap to view care history". Could show the most recent care event or a milestone label for quick context.

### 6. Year-End / Season Review Export
Generate a summary of the season: photo gallery, event timeline, cost summary, distribution list.
- Could be a shareable HTML page or PDF export
- Significant effort (~10-15 hours)

---

## API Quick Reference

### Individual Plants
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/individual-plants?user_id={id}` | List user's plants |
| POST | `/api/individual-plants?user_id={id}` | Create plant |
| GET | `/api/individual-plants/{id}` | Plant detail |
| PUT | `/api/individual-plants/{id}` | Update plant |
| DELETE | `/api/individual-plants/{id}` | Delete plant |
| POST | `/api/individual-plants/{id}/photo?user_id={id}` | Set hero photo |
| GET | `/api/individual-plants/{id}/care-events` | Plant care log |
| POST | `/api/individual-plants/{id}/care-events?user_id={id}` | Log care event |
| POST | `/api/individual-plants/{id}/care-events/{eid}/photo` | Add photo to care event |
| GET | `/api/individual-plants/batch/{id}/care-events` | Batch care log |
| POST | `/api/individual-plants/batch/{id}/care-events?user_id={id}` | Log batch care event |

### Batches & Events
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/plants/batches?season_id={id}` | List batches |
| GET | `/api/plants/batches/{id}` | Batch detail |
| POST | `/api/plants/batches?user_id={id}` | Create batch |
| GET | `/api/events/batch/{id}/timeline` | Batch event timeline |
| POST | `/api/events/?user_id={id}` | Log batch event |

### Distributions & Costs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/distributions/?batch_id={id}` | List distributions |
| POST | `/api/distributions/?user_id={id}` | Create distribution |
| DELETE | `/api/distributions/{id}` | Delete distribution |
| GET | `/api/distributions/batch/{id}/summary` | Distribution summary |
| GET | `/api/costs/?season_id={id}` | List costs |
| POST | `/api/costs/?user_id={id}` | Create cost |
| DELETE | `/api/costs/{id}` | Delete cost |
| GET | `/api/costs/season/{id}/total` | Season total |

### Photos & Identify
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/photos/upload` | Upload batch photo |
| GET | `/api/photos/batch/{id}/gallery` | Batch gallery |
| DELETE | `/api/photos/{id}` | Delete photo |
| POST | `/api/identify/` | Identify plant via Claude Vision |

---

## Database Schema (11 tables)

`users`, `seasons`, `plant_varieties`, `plant_batches`, `events`, `photos`, `distributions`, `season_costs`, `individual_plants`, `care_events`, `alembic_version`

**Migration history:**
- 001 — initial schema
- 002 — individual_plants table
- 003 — care_history refactor (drop care_schedules, add milestone_label + batch_id to care_events)
- 004 — add acquired_date to individual_plants
