# PlantLady App — Complete Roadmap

**Last Updated**: February 28, 2026
**Current Status**: Phase 10 Complete ✅
**Next Phase**: Phase 11 — Distribution Log & Cost Tracking

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

---

## Current State (February 28, 2026)

### ✅ What's Working
- PIN authentication with secure hashing (argon2)
- My Plants page shows real user plants (no mock data)
- Today page shows real data with live care tracking
- **Collection page toggle between My Plants and My Garden** ✅ **[NEW]**
- **My Garden page with season selector and real batches** ✅ **[NEW]**
- **Add batch flow and event logging** ✅ **[NEW]**
- Add plant flow with care schedules
- Plant detail page with care logging
- Care event history
- Batch event history
- All 12+ database tables populated with real data
- API fully responsive at https://plants.duski.org/api/
- Frontend deployed and responsive
- All code building with zero TypeScript errors
- **Full end-to-end testing complete on production NAS** ✅

### ⚠️ Known Issues
- None (Phase 10 testing complete)

### 🚀 Phase 10 Accomplishments
- ✅ Collection page redesigned with toggle
- ✅ MyGarden page with real API data
- ✅ Batch creation and detail viewing
- ✅ Event logging for batches
- ✅ Fixed CORS for production domain
- ✅ Fixed API endpoint trailing slash issue
- ✅ Full end-to-end testing on NAS

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

## Phase 11+: Future Roadmap (Ready to Start)

### Phase 11: Distribution Log & Cost Tracking ⏳ **[READY TO START]**

**Objective**: Track gifting/trading and seed costs

**Tasks**:
1. **Distribution Log Page**
   - Display list of all distributions (gifts/trades)
   - Link to batches that were distributed
   - Show recipient and date
   - Wire to API: GET /api/distributions (existing endpoint)

2. **Cost Tracking Page**
   - Display season costs by category
   - Track seed costs, material costs, tools
   - Wire to API: GET /api/costs (existing endpoint)
   - Summary per season

3. **Cost Entry Page**
   - Add new cost record
   - Link to batch or general
   - Wire to API: POST /api/costs

**Estimated**: 5-7 hours

---

### Phase 12: Dashboard & Analytics ⏳ **[FUTURE]**

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

### Phase 13: Year-End Review ⏳ **[FUTURE]**

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

## How to Start Phase 9

### 1️⃣ **Read This File First**
You're reading it! ✓

### 2️⃣ **Create a Feature Branch** (optional)
```bash
cd /Users/jamisonhill/Ai/plantlady
git checkout -b feature/phase-9-cleanup
```

### 3️⃣ **Start with Task 1: Today Page Migration**
- Open `app/src/pages/TodayPage.tsx`
- Review current mock data structure
- Look at `MyPlantsPage.tsx` for reference implementation
- Implement real API data fetching
- Test in browser: PIN login → Today tab

### 4️⃣ **Test Locally**
```bash
cd app
npm run dev
# Visit http://localhost:5173
# Login with PIN "1234"
# Check Today page displays real plants
```

### 5️⃣ **Build & Deploy**
```bash
npm run build
# Copy dist files to NAS /volume1/docker/plantlady/frontend/
```

### 6️⃣ **Verify on NAS**
```bash
# Visit https://plants.duski.org
# Check Today page shows real plants
# Verify no console errors
```

### 7️⃣ **Commit & Push**
```bash
git add -A
git commit -m "Phase 9: Migrate Today page to real data"
git push origin feature/phase-9-cleanup
```

---

## Key Code Locations for Reference

### Frontend
- **Login/Auth**: `app/src/context/AuthContext.tsx`
- **My Plants (reference)**: `app/src/pages/MyPlantsPage.tsx` ⭐ Copy urgency calc from here
- **Plant Detail**: `app/src/pages/PlantDetailPage.tsx` ⭐ Copy care logging from here
- **Today Page**: `app/src/pages/TodayPage.tsx` ← MODIFY THIS
- **API Client**: `app/src/api/client.ts`
- **Types**: `app/src/types.ts`

### Backend
- **Individual Plants Router**: `api/routers/individual_plants.py` ⭐ Shows all endpoints
- **Models**: `api/models.py`
- **Main**: `api/main.py`

### Database
- **Schema**: See `DATABASE.md`
- **Migrations**: `api/alembic/versions/`

---

## Testing Checklist for Phase 9

### Before Committing
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] No ESLint warnings
- [ ] Today page loads without errors
- [ ] Real plants display on Today page
- [ ] Care urgency badges show correctly
- [ ] Quick-log buttons work
- [ ] Console has no errors

### On NAS
- [ ] Frontend builds successfully
- [ ] https://plants.duski.org loads
- [ ] Login works (PIN "1234")
- [ ] Today page shows real plants
- [ ] Plant detail page still works
- [ ] My Plants page still works
- [ ] Add plant flow still works

---

## Deployment Instructions (Phase 9)

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

### Or use heredoc method (if SCP fails)
```bash
# Upload index.html
cat app/dist/index.html | ssh jamison.hill@192.168.0.9 "cat > /volume1/docker/plantlady/frontend/index.html"

# Upload assets one by one
for file in app/dist/assets/*; do
  filename=$(basename "$file")
  cat "$file" | ssh jamison.hill@192.168.0.9 "cat > /volume1/docker/plantlady/frontend/assets/$filename"
done
```

---

## Git Commit Message Template for Phase 9

```
Phase 9: [Task Name]

- Brief description of changes
- What was removed/deprecated
- Testing done

Fixes: [any issues]
```

### Example
```
Phase 9: Migrate Today page to real data

- Replace hardcoded mock plants with API fetch
- Reuse care urgency calculation from MyPlantsPage
- Add loading state while fetching plants
- Tested: Login → Today tab shows real plants

Fixes: #issue-number (if any)
```

---

## Success Criteria for Phase 9

✅ **Phase 9 is Complete When**:
1. Today page displays real user plants (not mock data)
2. Care urgency badges calculate correctly
3. Quick-log care buttons functional
4. CollectionPage.tsx deleted
5. No unused imports or broken routes
6. Database audit completed
7. Frontend deployed and tested on NAS
8. All commits pushed to GitHub
9. No console errors in production
10. All previous features still working

---

## Quick Reference: API Endpoints Needed

For Phase 9, you'll need:
- ✅ `GET /api/individual-plants?user_id={userId}` — fetch plants
- ✅ `GET /api/individual-plants/{plant_id}/care-schedule` — fetch schedules
- ✅ `GET /api/individual-plants/{plant_id}/care-events` — fetch events

All these exist! No backend work needed.

---

## Questions Before Starting?

If anything is unclear:
1. Check the code references above
2. Look at MyPlantsPage.tsx for the exact pattern to follow
3. Review the API docs at https://plants.duski.org/api/docs
4. Check DATABASE.md for schema questions

---

## Next Document to Read

After Phase 9 is done:
- Create a Phase 10 plan (Plant Batches + My Garden)
- Or decide if that's still relevant

---

**Ready to start Phase 9? Pick up with the "How to Start" section above! 🚀**
