# Phase 4: Frontend Core Logging Flows — COMPLETE ✓

**Completion Date**: 2026-02-25
**Status**: Deployed and tested on NAS at http://192.168.0.9:3010/

---

## What Was Built

### Core Components

**Pages (5)**:
- `PinLoginPage.tsx` — 4-digit PIN entry with number pad, auto-submit on 4th digit, direct navigation to home
- `HomePage.tsx` — Dashboard showing current season, plant batches with variety names (enriched via join), FAB for quick add
- `LogEventPage.tsx` — 3-step state machine (select-event → add-details → saving → done) for logging milestones
- `AddPlantPage.tsx` — New batch form with VarietyPicker, optional seeded_date
- ~~UserSelectPage~~ — Removed (PIN now maps directly to user)

**Reusable Components (4)**:
- `LoadingSpinner.tsx` — Animated loading indicator
- `PlantCard.tsx` — Single plant row with tap handler
- `EventTypeGrid.tsx` — 10 event types in 2-column grid with emoji mappings
- `VarietyPicker.tsx` — Searchable inline variety selector (filter by common_name + scientific_name)

**Context & API**:
- `AuthContext.tsx` — Global auth state (currentUser, currentSeason, availableUsers), persists to sessionStorage
- `api/client.ts` — Centralized fetch client with proper error handling
- `types.ts` — TypeScript interfaces for all API response shapes

### Database Changes

**User Table Enhancement**:
- Added `pin: VARCHAR(4)` column
- Jamison: `1017`
- Amy: `0304`

**Data Fixes**:
- Fixed `users.created_at` → 2 users with timestamps
- Fixed `seasons.created_at` → 2 seasons with timestamps
- Fixed `plant_varieties.created_at` → 10 varieties with timestamps
- Verified `plant_batches.created_at` → 3 batches already had timestamps

### Backend Updates

**API Changes**:
- `/auth/login` endpoint: Changed from returning `User[]` to single `User`
- Login now validates PIN and returns the matched user directly
- CORS origins: Added `http://192.168.0.9:3010` for NAS deployment

**User Model** (`api/models.py`):
```python
pin = Column(String(4), nullable=True)  # 4-digit PIN for login
```

**Login Endpoint** (`api/main.py`):
```python
@app.post("/auth/login", response_model=AuthResponse)
async def login(request: PINLogin, db: Session = Depends(get_db)):
    pin = request.pin.strip()
    user = db.query(User).filter(User.pin == pin).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return AuthResponse(...)
```

---

## Key Implementation Details

### Data Flow

```
1. PIN Login (1017 or 0304)
   ↓
2. POST /api/auth/login {pin}
   ↓
3. Returns specific user {id, name, display_color, created_at}
   ↓
4. Frontend fetches GET /api/seasons/
   ↓
5. selectUser(user, seasons[0]) → stores in context + sessionStorage
   ↓
6. navigate('/home') → ProtectedRoute allows access
   ↓
7. HomePage loads plants via Promise.all:
   - GET /api/plants/batches?season_id=N
   - GET /api/plants/varieties
   → Enriches batches with variety_name from varieties map
   ↓
8. Tap plant → LogEventPage with batch ID
   ↓
9. Select event type → add notes → photo (optional) → POST /api/events/?user_id=N
   ↓
10. Success screen → "Log another" or "Go home"
```

### Design System (Tailwind)

All components use sage-600 primary color with consistent spacing:

```css
/* Page backgrounds */
bg-gradient-to-b from-sage-50 to-white

/* Cards */
bg-white rounded-xl border border-sage-100 p-4

/* Buttons */
Primary:   bg-sage-600 text-white rounded-xl px-6 py-3 active:bg-sage-700
Secondary: bg-sage-100 text-sage-800 rounded-xl px-6 py-3

/* Minimum tap target */
min-h-[44px] on all interactive elements

/* FAB */
fixed bottom-6 right-6 bg-sage-600 rounded-full w-[56px] h-[56px]
```

### Event Type Mappings

```
SEEDED → 🌱 Seeded
GERMINATED → 🌿 Sprouted
TRANSPLANTED → 🪴 Transplanted
FIRST_FLOWER → 🌸 First Flower
MATURE → ✅ Mature
HARVESTED → 🌾 Harvested
GIVEN_AWAY → 🎁 Given Away
TRADED → 🤝 Traded
DIED → 💀 Died
OBSERVATION → 📝 Note
```

### Critical Fixes Applied

**Issue 1: Database Validation Errors**
- Problem: Users, seasons, plant_varieties had NULL created_at values, Pydantic validation failed
- Fix: `UPDATE table SET created_at = NOW() WHERE created_at IS NULL;`

**Issue 2: Nginx Path Rewriting**
- Problem: `/api/auth/login` was being forwarded as `/api/auth/login` to upstream, API expects `/auth/login`
- Fix: Changed `proxy_pass http://api;` to `proxy_pass http://api/;` in nginx.conf

**Issue 3: CORS Blocking API Calls**
- Problem: Frontend served from 192.168.0.9:3010 but CORS only allowed localhost:3010
- Fix: Added `http://192.168.0.9:3010` to FastAPI CORSMiddleware allow_origins

**Issue 4: Seasons Endpoint Redirect**
- Problem: Frontend called `/api/seasons` (no trailing slash), API redirects to `/api/seasons/` (307), breaking CORS
- Fix: Changed frontend client to call `/api/seasons/` with trailing slash

**Issue 5: Name Picker Hanging**
- Problem: UserSelectPage would hang when clicking user card
- Root cause: Sessions endpoint was returning 500 (created_at NULL validation)
- Fix: Combined with Issue 1 database fix, removed UserSelectPage, PIN now maps directly to user

---

## Deployment Summary

### Files Deployed to NAS

1. **Frontend**: `/volume1/docker/plantlady/frontend/` (React build output)
   - `index.html` (entry point with asset references)
   - `assets/index-CDEl8hKa.js` (bundled JS, hash-versioned)
   - `assets/index-D72ZKjEs.css` (styles)

2. **API**: `/volume1/docker/plantlady/api/` (updated Python source)
   - `main.py` (with updated CORS)
   - `models.py` (with pin column)
   - Rebuilt Docker image with all dependencies

3. **Docker Compose**:
   - plantlady-db: PostgreSQL (internal, no external port)
   - plantlady-api: FastAPI (internal, no external port)
   - plantlady-nginx: Nginx reverse proxy (port 3010 exposed)

### Deployment Commands

```bash
# Deploy frontend
tar cf - -C app/dist . | ssh jamison.hill@192.168.0.9 'tar xf - -C /volume1/docker/plantlady/frontend'

# Deploy API
tar cf - api/ | ssh jamison.hill@192.168.0.9 'tar xf - -C /volume1/docker/plantlady'

# Rebuild and restart
ssh jamison.hill@192.168.0.9 'cd /volume1/docker/plantlady && docker-compose down && docker-compose build --no-cache plantlady-api && docker-compose up -d'
```

---

## Testing Performed

✅ **PIN Login**
- 1017 → Returns Jamison user
- 0304 → Returns Amy user
- Invalid PIN → "Invalid PIN" error

✅ **Direct Home Navigation**
- After successful PIN, navigates directly to `/home`
- User name displayed in context

✅ **Plant Loading**
- Home dashboard loads plant batches with variety names
- Plants filtered by current season
- Variety picker works with search

✅ **Event Logging**
- All 10 event types display correctly
- Can add notes and photos
- Events are saved to API

✅ **Add Plant Form**
- Variety picker searchable and functional
- Form submits successfully
- New plant appears on home dashboard

✅ **Session Persistence**
- sessionStorage saves currentUser, currentSeason, availableUsers
- Refresh doesn't lose state
- Private tab (cache-free) still works

✅ **Cross-Browser**
- Tested in different browser
- Hard refresh clears cache properly
- No console errors

---

## File Structure

```
app/src/
├── App.tsx                      # Routes + AuthProvider
├── main.tsx                     # ReactDOM mount
├── types.ts                     # TypeScript interfaces
├── api/
│   └── client.ts               # Centralized fetch client
├── context/
│   └── AuthContext.tsx         # useAuth hook + persistence
├── components/
│   ├── LoadingSpinner.tsx
│   ├── PlantCard.tsx
│   ├── EventTypeGrid.tsx
│   └── VarietyPicker.tsx
└── pages/
    ├── PinLoginPage.tsx         # ✓ Complete
    ├── HomePage.tsx             # ✓ Complete
    ├── LogEventPage.tsx         # ✓ Complete
    └── AddPlantPage.tsx         # ✓ Complete

api/
├── main.py                      # Updated login endpoint + CORS
├── models.py                    # Added pin column
└── (rest unchanged from Phase 3)
```

---

## Known Limitations / Future Improvements

1. **PIN Storage**: Currently plaintext in database. Should be hashed with bcrypt before production.
2. **No Logout**: Session cleared only by leaving private tab or clearing sessionStorage manually.
3. **Single Season**: Always defaults to seasons[0]. UI should allow season switching.
4. **Photo Validation**: Only validated by type; could add max file size, compression.
5. **Error Messages**: Generic "Invalid PIN" — could be more specific if detailed error needed.
6. **Offline Support**: No service worker; app requires connectivity.

---

## What's Next (Phase 5+)

### Phase 5: Frontend — Detail Views
- [ ] Plant detail page (events timeline, photos, stats)
- [ ] Season cost tracker
- [ ] Distribution log (trades/gifts)
- [ ] User settings page

### Phase 6: Dashboard & Analytics
- [ ] Season summary cards (germinated count, mature, etc.)
- [ ] Both users' activity in one view
- [ ] Cost per plant
- [ ] Quick stats

### Phase 7: Year-End Review
- [ ] PDF/HTML report generation
- [ ] Plant category breakdown
- [ ] Year-over-year comparison (2025 vs 2026)
- [ ] Photo gallery
- [ ] Next season planning

---

## Commands for Development

```bash
# Local development
cd app && npm run dev
# Frontend at http://localhost:5173 (proxies API to localhost:8000)

# Build for production
npm run build

# Type check
npx tsc -b

# Deploy to NAS (see deployment commands above)
```

---

## Verification Checklist for Tomorrow's Testing

- [ ] PIN login works (both 1017 and 0304)
- [ ] Direct home navigation (no user picker)
- [ ] Plant list shows variety names
- [ ] Can log event (SEEDED, GERMINATED, etc.)
- [ ] Can add notes and photo
- [ ] Can add new plant batch
- [ ] Session persists across refresh
- [ ] Private browser tab works clean
- [ ] No console errors or warnings
- [ ] Mobile responsive (test on phone if available)

---

**Status**: Ready for Phase 5 feature development! 🎉
