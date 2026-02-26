# PlantLady App — Implementation Roadmap

## Completed ✅

### Backend Infrastructure (Phases 1-3)
- [x] NAS setup: `/volume1/docker/plantlady/{db,photos,nginx}`
- [x] Docker Compose stack: PostgreSQL, FastAPI, Nginx via Portainer
- [x] Database schema & migrations (SQLAlchemy + Alembic)
- [x] Auth endpoints (PIN check, session)
- [x] 40+ API endpoints (batches, events, photos, distributions, costs, stats)
- [x] Photo upload & storage
- [x] Cloudflare Tunnel: `plants.duski.org` → 192.168.0.9:3010

### Frontend UI Design System (Phases 1-7) ✅
- [x] Phase 1: Design System (colors, typography, spacing, components)
- [x] Phase 2: Navigation Shell (4-tab bottom bar, auth redesign)
- [x] Phase 3: Today Dashboard (care due, upcoming, friend activity)
- [x] Phase 4: My Plants (grid, detail, add flow, care logging)
- [x] Phase 5: My Garden (batch list, detail, event timeline)
- [x] Phase 6: Discover (plant catalog, search/filter, plant ID)
- [x] Phase 7: Profile & Social (friends, settings, activity feed, sharing)

### Production Deployment ✅
- [x] Frontend built (79 modules, 263KB)
- [x] Deployed to NAS via tar+SSH to volume
- [x] Live at `https://plants.duski.org` (Cloudflare)
- [x] All 4-tab navigation working
- [x] Design system fully implemented
- [x] Mock data throughout for testing

---

## Phase 8: API Integration (NEXT) 🚀

### Auth & User Management
- [ ] Connect login to real user auth (verify PIN against DB)
- [ ] Store session token on frontend (localStorage or secure cookie)
- [ ] Fetch current user data (name, ID, stats)
- [ ] Update ProfilePage to show real user info
- [ ] Implement logout (clear session)

### My Plants Integration
- [ ] Fetch individual plants: `GET /api/individual-plants?userId={id}`
- [ ] Populate MyPlantsPage grid with real plants
- [ ] Plant detail → fetch care schedule + events
- [ ] Care logging: `POST /api/care-events` (watering, fertilizing, repotting)
- [ ] Plant creation: `POST /api/individual-plants` (from AddPlantFlow)
- [ ] Plant deletion (optional: soft delete or archive)
- [ ] Photo upload for plants: `POST /api/photos/individual-plants/{plantId}`

### My Garden Integration
- [ ] Fetch batches: `GET /api/plant-batches?seasonId={id}`
- [ ] Event logging: `POST /api/events` (existing endpoint)
- [ ] Batch creation: `POST /api/plant-batches`
- [ ] Wrap existing batch data in new UI

### Discover Integration
- [ ] Plant catalog: `GET /api/plants/varieties` (populate browse)
- [ ] Search/filter logic connected to backend
- [ ] Plant identification: `POST /api/identify` (third-party API)
- [ ] "Add to My Plants" flow → create individual plant

### Friends & Social
- [ ] Fetch user connections: `GET /api/user/connections`
- [ ] Add friend: `POST /api/user/connections` (by username)
- [ ] Remove friend: `DELETE /api/user/connections/{userId}`
- [ ] Fetch activity feed: `GET /api/activity-feed`
- [ ] Sharing preferences: `PUT /api/user/sharing-preferences`
- [ ] Filter activity by sharing settings

### Settings & Theme
- [ ] Persist theme selection: `PUT /api/user/settings`
- [ ] Persist notification preferences
- [ ] Persist sharing toggles per friend

---

## Phase 9: Enhancements

### Photo Gallery
- [ ] Growth photo upload for plants
- [ ] Chronological photo display
- [ ] Photos per batch

### Advanced Care
- [ ] Care reminders (in-app notifications)
- [ ] Overdue indicators (badge count on Today tab)
- [ ] Care schedule adjustments (after logging)

### Analytics & Reporting
- [ ] Year-end season report
- [ ] Cost tracking per plant
- [ ] Plant success rate
- [ ] Streak calculations

### Native Mobile
- [ ] React Native or PWA
- [ ] Push notifications
- [ ] Camera integration (photo ID)

---

## Database Extensions Needed

| Table | Purpose | Status |
|-------|---------|--------|
| `individual_plants` | User houseplants (separate from garden batches) | Create |
| `care_schedules` | Per-plant watering/fertilizing/repotting cadence | Create |
| `care_events` | Log of when care was performed on individual plants | Create |
| `plant_health` | Plant health observations, issues, treatments | Create |
| `growth_photos` | Chronological photos per plant | Create |
| `user_connections` | Friend relationships + sharing preferences | Create |

---

## API Endpoints to Add

**Individual Plants:**
- `GET /api/individual-plants` — list user's plants
- `POST /api/individual-plants` — create new plant
- `GET /api/individual-plants/{id}` — plant detail
- `PUT /api/individual-plants/{id}` — update plant
- `DELETE /api/individual-plants/{id}` — delete plant

**Care Events (Individual):**
- `GET /api/care-events?plantId={id}` — care history
- `POST /api/care-events` — log care (watering, fertilizing, repotting)
- `PUT /api/care-events/{id}` — edit event
- `DELETE /api/care-events/{id}` — delete event

**Plant Health:**
- `GET /api/plant-health/{plantId}` — health status
- `POST /api/plant-health` — log health issue
- `PUT /api/plant-health/{id}` — update status

**Friends & Social:**
- `GET /api/user/connections` — list friends
- `POST /api/user/connections` — add friend (by username)
- `DELETE /api/user/connections/{userId}` — remove friend
- `GET /api/activity-feed` — friend activities (filtered by sharing)
- `PUT /api/user/sharing-preferences` — update per-friend sharing

**Photos (Extended):**
- `POST /api/photos/individual-plants/{plantId}` — upload plant growth photo
- `GET /api/photos/individual-plants/{plantId}` — fetch growth photos

**Discover:**
- `GET /api/plants/varieties` — plant catalog (already exists)
- `POST /api/identify` — plant identification (third-party)

---

## Current Status

**Date**: Feb 26, 2026
**Deployment**: ✅ Live at https://plants.duski.org
**Frontend**: ✅ Complete redesign (all 7 phases)
**Backend**: ✅ Infrastructure up, 40+ endpoints
**Next**: Phase 8 — Connect frontend to real API

**Team Notes**:
- 10-person agent team available in `~/.claude/agents/`
- Design skills reference at `~/.claude/design-skills/`
- All memory & deployment info synced to GitHub
- NAS credentials + Cloudflare setup documented in project memory
