# PlantLady App — Complete Roadmap

**Last Updated**: February 28, 2026
**Current Status**: Phase 11 Complete ✅
**Next Phase**: Phase 12 — Photo Gallery & Batch Photos

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

---

## Current State (February 28, 2026)

### ✅ What's Working
- PIN authentication with secure hashing (argon2)
- My Plants page shows real user plants (no mock data)
- Today page shows real data with live care tracking
- Collection page toggle between My Plants and My Garden
- My Garden page with season selector and real batches
- Add batch flow and event logging
- Add plant flow with care schedules
- Plant detail page with care logging
- Care event history
- Batch event history
- **Distribution log per batch (gifts and trades)** ✅ **[NEW Phase 11]**
- **Season cost tracker with category breakdown** ✅ **[NEW Phase 11]**
- **Add distribution and add cost forms** ✅ **[NEW Phase 11]**
- All 12+ database tables populated with real data
- API fully responsive at https://plants.duski.org/api/
- Frontend deployed and responsive
- All code building with zero TypeScript errors

### ⚠️ Known Issues
- None

### Phase 11 Accomplishments
- ✅ Distribution types and API client methods wired up
- ✅ Season cost types and API client methods wired up
- ✅ Distributions section on BatchDetailPage
- ✅ AddDistributionPage (gift/trade form)
- ✅ CostTrackerPage with season selector and totals
- ✅ AddCostPage (cost entry form)
- ✅ 3 new routes registered in App.tsx
- ✅ "Season Costs" button on MyGardenPage

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

## Phase 12+: Future Roadmap (Ready to Start)

### Phase 12: Photo Gallery & Batch Photos ⏳ **[READY TO START]**

**Objective**: Let users capture and browse photos per batch and per event.

**Notes**: Backend endpoints already exist in `api/routers/photos.py`. This is frontend work only.

**Tasks**:
1. **Photo Grid on BatchDetailPage**
   - Display all photos attached to a batch
   - Tap to expand into a modal viewer
   - Wire to API: GET /api/photos/batch/{batchId} (existing endpoint)

2. **Photo Upload from BatchDetailPage**
   - Camera/file picker button
   - Optional caption
   - Wire to API: POST /api/photos/upload (existing endpoint)

3. **Photo on PlantDetailPage**
   - Same grid/modal pattern for individual plant care event photos
   - Wire to existing photo endpoints

4. **Delete Photo**
   - Long-press or swipe to delete with confirmation
   - Wire to API: DELETE /api/photos/{photoId} (existing endpoint)

**Estimated**: 4-6 hours

---

### Phase 13: Dashboard & Analytics ⏳ **[FUTURE]**

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

### Phase 14: Year-End Review ⏳ **[FUTURE]**

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

## How to Start Phase 12

### 1. Read This File First
You're reading it!

### 2. Create a Feature Branch (optional)
```bash
cd /Users/jamisonhill/Ai/plantlady
git checkout -b feature/phase-12-photos
```

### 3. Start with Task 1: Photo Grid on BatchDetailPage
- Open `app/src/pages/BatchDetailPage.tsx`
- Add a photos section below the events timeline
- Fetch photos from `GET /api/photos/batch/{batchId}`
- Render as a 3-column grid of thumbnails

### 4. Test Locally
```bash
cd app
npm run dev
# Visit http://localhost:5173
# Login with PIN "1234"
# Navigate to a batch detail page
# Verify photo grid renders
```

### 5. Build & Deploy
```bash
npm run build
# Copy dist files to NAS /volume1/docker/plantlady/frontend/
```

### 6. Verify on NAS
```bash
# Visit https://plants.duski.org
# Verify no console errors
# Test photo upload and delete
```

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
# Clear old frontend
ssh jamison.hill@192.168.0.9 "rm -rf /volume1/docker/plantlady/frontend/*"

# Upload new files
scp -r dist/* jamison.hill@192.168.0.9:/volume1/docker/plantlady/frontend/
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

**Ready to start Phase 12? Pick up with the "How to Start Phase 12" section above.**
