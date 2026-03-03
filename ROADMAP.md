# PlantLady App — Complete Roadmap

**Last Updated**: March 2, 2026
**Current Status**: Phase 13 Complete ✅
**Next Phase**: Phase 14 — Dashboard & Analytics

---

## Project Overview

PlantLady is a plant tracking app for Jamison & Amy to:
- Log plant care (watering, fertilizing, repotting)
- Track plant care schedules and urgency
- Monitor plant collections and gifting
- Review season summaries and trends

**Stack**: React + TypeScript (frontend) | FastAPI + PostgreSQL (backend) | Docker + NAS (deployment)

---

## Completed Phases ✅

### Phase 1: Infrastructure ✅
- Docker setup on NAS
- PostgreSQL database
- FastAPI backend
- React frontend scaffold

### Phase 2: Database Schema ✅
- 8 core tables (users, plants, seasons, batches, events, photos, distributions, costs)
- Relationships and foreign keys
- Alembic migrations

### Phase 3: API Endpoints ✅
- 40+ endpoints across 7 routers
- Full CRUD for plant batches, events, photos, etc.
- User stats endpoint
- Seasons endpoint

### Phase 4: Authentication & Core Flows ✅
- PIN-based login (secure argon2 hashing)
- Session management
- User selection
- Basic plant listing

### Phase 5-7: Plant Details & Analytics ⏸️
- (Skipped in favor of My Plants feature)

### Phase 8: My Plants Integration ✅ **[COMPLETED Feb 27]**
- New individual plant tracking system (separate from plant batches)
- IndividualPlant, CareSchedule, CareEvent models
- Full CRUD endpoints for individual plants
- MyPlantsPage with real API data
- PlantDetailPage with care logging
- AddPlantFlow for creating new plants
- Care urgency calculation (Overdue/Today/Soon/Healthy)
- Photo upload support for care events

### Phase 9: Today Page & Data Cleanup ✅ **[COMPLETED Feb 27]**
- Migrated TodayPage to real API data
- Removed mock data and hardcoded plants
- Deleted unused CollectionPage component
- Consolidated routes and removed duplicates
- Infrastructure setup with NAS helper script

### Phase 10: Plant Batches + My Garden ✅ **[COMPLETED Feb 28]**
- Reactivated plant batch tracking system
- Collection page toggle between My Plants / My Garden
- MyGardenPage with real API data and season selector
- BatchDetailPage with event timeline
- AddBatchFlow for creating new batches
- Event logging for batches (SEEDED, GERMINATED, etc.)
- Full end-to-end testing on production NAS
- Fixed CORS and API endpoint issues

### Phase 11: Distribution Log & Cost Tracking ✅ **[COMPLETED Feb 28]**
- Distribution types added to types.ts + 4 API client methods (getDistributions, createDistribution, deleteDistribution, getDistributionSummary)
- Season cost types added to types.ts + 4 API client methods (getCosts, createCost, deleteCost, getSeasonCostTotal)
- Distributions section added to BatchDetailPage (list, summary stats, delete, "Add Gift/Trade" button)
- AddDistributionPage: gift/trade entry form (type toggle, recipient, quantity, date, notes)
- CostTrackerPage: season cost list with season selector, total display, category breakdown, delete
- AddCostPage: cost entry form (item name, amount, quantity, category, one-time toggle, notes)
- 3 new routes: /batch/:id/distribute, /costs, /add-cost
- "Season Costs" button added to MyGardenPage
- All frontend-only work — backend endpoints were already complete
- Commit: cb3f9be

### Phase 12: Photo Gallery & Batch Photos ✅ **[COMPLETED Feb 28]**
- Added `Photo` interface to types.ts
- Fixed `uploadPhoto` return type, added `getBatchGallery` + `deletePhoto` API client methods
- Created `PhotoModal` component (fullscreen viewer with caption, date, close/delete buttons)
- Wired BatchDetailPage photo gallery (3-column grid, file upload, upload/delete handlers, modal)
- Care event photo thumbnails in PlantDetailTabs care log
- Wired `photoUrl` to PlantHeroSection in PlantDetailPage
- Frontend only — backend photo endpoints already existed
- Commit: 13b4efb

### Phase 13: Plant Identifier ✅ **[COMPLETED Mar 1]**
- PlantIdentifyPage: camera/file upload UI to capture plant photo
- PlantIdentifyResultPage: displays identification results via location.state
- `/api/identify/` backend router using Claude Vision API (Anthropic SDK)
- Returns plant name, confidence score, care tips, and description
- Requires `ANTHROPIC_API_KEY` env var set in Portainer on plantlady-api container
- New routes: `/plant-identify`, `/plant-identify-result`
- Commit: af01d0b

---

## Current State (March 2, 2026)

### ✅ What's Working
- PIN authentication with secure hashing (argon2)
- My Plants page shows real user plants (no mock data)
- Today page shows real data with live care tracking
- Collection page toggle between My Plants and My Garden
- My Garden page with season selector and real batches
- Add batch flow and event logging
- Add plant flow with care schedules
- Plant detail page with care logging
- Care event history with photo thumbnails
- Batch event history
- Distribution log per batch (gifts and trades)
- Season cost tracker with category breakdown
- Add distribution and add cost forms
- **Batch photo gallery with fullscreen modal** ✅ **[NEW Phase 12]**
- **Plant hero image and care event photo thumbnails** ✅ **[NEW Phase 12]**
- **Plant identifier via Claude Vision API** ✅ **[NEW Phase 13]**
- All 12+ database tables populated with real data
- API fully responsive at https://plants.duski.org/api/
- Frontend deployed and responsive
- All code building with zero TypeScript errors

### ⚠️ Known Issues
- None

---

## Phase 9: Today Page & Data Cleanup ✅ **[COMPLETED Feb 27]**

### 🎯 Objective
Clean up the Today page to use real data instead of mock plants, and remove deprecated code.

### 📋 Detailed Tasks

#### Task 1: Migrate Today Page to Real Data
**File**: `app/src/pages/TodayPage.tsx`

**What to do**:
1. Currently shows hardcoded mock plants
2. Should instead fetch user's individual plants from API
3. Display care urgency for each plant (same calculation as MyPlantsPage)
4. Quick-log care button for urgent items

**Implementation**:
```typescript
// On mount:
- Get user ID from auth context
- Fetch plants: GET /api/individual-plants?user_id={userId}
- For each plant, fetch schedules and events
- Calculate care urgency
- Render in current UI layout
```

**UI to Update**:
- "Your Plants" section → actual plants instead of mock
- Show care status cards for overdue items first
- Quick-log buttons functional

**Estimated effort**: 2-3 hours

---

#### Task 2: Remove Deprecated Code
**Files to Delete**:
- `app/src/pages/CollectionPage.tsx` — no longer used
- Any temporary scripts in `/volume1/docker/plantlady/` directory

**Files to Review**:
- `api/seed_data.py` — check if still needed (has CSV parsing that may not be used)
- Old plant_batches code if not being used

**Estimated effort**: 30 minutes

---

#### Task 3: Clean Up Unused Imports & Routes
**File**: `app/src/App.tsx`

**What to do**:
1. Remove unused page imports (if any)
2. Clean up commented routes
3. Consolidate redundant routes (e.g., `/collection` is now `/my-plants`)

**Current situation**:
- `/collection` → MyPlantsPage ✅
- `/my-plants` → MyPlantsPage (duplicate)
- Decision: Keep `/collection` (it's where AddPlantFlow navigates to) or consolidate?

**Estimated effort**: 30 minutes

---

#### Task 4: Data Consistency Audit
**What to check**:
- Verify plant data in database
- Check for orphaned records (events without plants, etc.)
- Ensure all users have correct data

**Commands to run**:
```bash
# Check database state
docker exec plantlady-db psql -U plantlady -d plantlady -c "
  SELECT 'users' as table, COUNT(*) FROM users
  UNION ALL
  SELECT 'individual_plants', COUNT(*) FROM individual_plants
  UNION ALL
  SELECT 'care_schedules', COUNT(*) FROM care_schedules
  UNION ALL
  SELECT 'care_events', COUNT(*) FROM care_events
"
```

**Estimated effort**: 1 hour

---

### 📊 Phase 9 Summary

| Task | Time | Blocker | Notes |
|------|------|---------|-------|
| Migrate Today Page | 2-3h | No | Core work |
| Delete deprecated files | 30m | No | Cleanup |
| Review imports/routes | 30m | No | Code quality |
| Data audit | 1h | No | Validation |
| **Total** | **4-5h** | — | **Can start immediately** |

---

## Phase 14+: Future Roadmap

### Phase 14: Dashboard & Analytics ⏳ **[READY TO START]**

**Objective**: High-level season overview

**Tasks**:
1. **Season Dashboard**
   - Total batches started/completed
   - Distribution summary (gifted, traded, kept)
   - Cost summary
   - Key dates and milestones

2. **Variety Statistics**
   - Most planted varieties
   - Success rate by variety
   - Seasonal trends

3. **User Comparison** (if relevant)
   - Side-by-side stats
   - Who planted what
   - Distribution patterns

**Estimated**: 8-10 hours

---

### Phase 15: Year-End Review ⏳ **[FUTURE]**

**Objective**: Generate seasonal reports

**Tasks**:
1. **Report Generation**
   - PDF or HTML export
   - Timeline view of season
   - Photo gallery
   - Stats summary

2. **Planning for Next Season**
   - Repeat batch recommendations
   - Failed batch analysis
   - Budget planning

3. **Year-over-Year Comparison**
   - Compare 2025 vs 2026
   - Trends and patterns
   - Lessons learned

**Estimated**: 10-15 hours

---

## Key Code Locations for Reference

### Frontend
- **Batch Detail**: `app/src/pages/BatchDetailPage.tsx` — add photo section here
- **Plant Detail**: `app/src/pages/PlantDetailPage.tsx` — add care event photos here
- **API Client**: `app/src/api/client.ts` — add photo client methods here
- **Types**: `app/src/types.ts` — Photo type already defined
- **Auth Context**: `app/src/context/AuthContext.tsx`

### Backend
- **Photos Router**: `api/routers/photos.py` — all endpoints already exist
- **Models**: `api/models.py`

### Database
- **Schema**: See `DATABASE.md`
- **Migrations**: `api/alembic/versions/`

---

## Testing Checklist for Phase 12

### Before Committing
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Photo grid renders on BatchDetailPage
- [ ] Tap to expand photo modal works
- [ ] Photo upload from batch detail works
- [ ] Delete photo with confirmation works
- [ ] Console has no errors

### On NAS
- [ ] Frontend builds successfully
- [ ] https://plants.duski.org loads
- [ ] Login works (PIN "1234")
- [ ] Photo grid visible on batch pages
- [ ] Upload photo from mobile camera works
- [ ] All previous features still working

---

## Deployment (Standard)

### Local Build
```bash
cd /Users/jamisonhill/Ai/plantlady/app
npm run build
```

### Deploy to NAS
```bash
# Build then deploy via tar (SCP doesn't work on this NAS)
tar czf - -C dist . | ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "cd /volume1/docker/plantlady/frontend && rm -rf assets && tar xzf -"

# Restart nginx
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S /usr/local/bin/docker restart plantlady-nginx"
```

---

## Quick Reference: API Endpoints

### Individual Plants
- `GET /api/individual-plants?user_id={userId}`
- `GET /api/individual-plants/{plant_id}/care-schedule`
- `GET /api/individual-plants/{plant_id}/care-events`
- `POST /api/individual-plants/{plant_id}/care-events`

### Batches & Events
- `GET /api/plants/batches?season_id={seasonId}`
- `GET /api/plants/batches/{batchId}`
- `GET /api/events/batch/{batchId}/timeline`
- `POST /api/events/`

### Distributions
- `GET /api/distributions?batch_id={batchId}`
- `POST /api/distributions/`
- `DELETE /api/distributions/{id}`
- `GET /api/distributions/summary?batch_id={batchId}`

### Costs
- `GET /api/costs?season_id={seasonId}`
- `POST /api/costs/`
- `DELETE /api/costs/{id}`
- `GET /api/costs/total?season_id={seasonId}`

### Photos
- `GET /api/photos/batch/{batchId}`
- `POST /api/photos/upload`
- `DELETE /api/photos/{photoId}`

All backend endpoints exist. No backend work needed for Phase 12.

---

**Ready to start Phase 14? See the Dashboard & Analytics section above.**
