# Phase 3: API Endpoints — COMPLETE ✓

## What Was Built

### 1. API Router Structure ✓
**api/routers/** — 6 modular router files:

- **plants.py** — Plant varieties & batches CRUD
- **events.py** — Event logging (milestones)
- **seasons.py** — Season management
- **costs.py** — Expense tracking
- **distributions.py** — Gift/trade logging
- **photos.py** — Photo upload & gallery

Each router is:
- ✓ Independently testable
- ✓ Properly documented with docstrings
- ✓ Includes input validation
- ✓ Returns correct HTTP status codes
- ✓ Uses dependency injection for database

### 2. Plant Varieties & Batches Endpoints ✓
**routers/plants.py**

**Plant Varieties:**
- `GET /plants/varieties` — List all varieties (filterable by category)
- `GET /plants/varieties/{id}` — Get single variety
- `POST /plants/varieties` — Create new variety
- `PUT /plants/varieties/{id}` — Update variety
- `DELETE /plants/varieties/{id}` — Delete variety (if no batches)

**Plant Batches:**
- `GET /plants/batches` — List batches (filter by season, variety, user)
- `GET /plants/batches/{id}` — Get batch with full details
- `POST /plants/batches` — Create new batch (auto-assigns current user)
- `PUT /plants/batches/{id}` — Update batch details
- `DELETE /plants/batches/{id}` — Delete batch (cascade deletes events/photos)

### 3. Event Logging Endpoints ✓
**routers/events.py** — Quick milestone logging

**Events:**
- `GET /events/` — List events (filter by batch, type, user)
- `GET /events/{id}` — Get single event
- `POST /events/` — Log new event (SEEDED, GERMINATED, MATURE, etc.)
- `PUT /events/{id}` — Update event (notes, date, type)
- `DELETE /events/{id}` — Delete event

**Timeline:**
- `GET /events/batch/{batch_id}/timeline` — Chronological event list for batch

**Supported Event Types:**
```
SEEDED, GERMINATED, TRANSPLANTED, FIRST_FLOWER,
MATURE, HARVESTED, GIVEN_AWAY, TRADED, DIED, OBSERVATION
```

### 4. Season Management Endpoints ✓
**routers/seasons.py**

- `GET /seasons/` — List all seasons (newest first)
- `GET /seasons/{id}` — Get specific season
- `GET /seasons/year/{year}` — Get season by year (shortcut)
- `POST /seasons/` — Create new season
- `PUT /seasons/{id}` — Update season notes
- `DELETE /seasons/{id}` — Delete if empty

### 5. Cost Tracking Endpoints ✓
**routers/costs.py** — Expense management

- `GET /costs/` — List costs (filter by season, category, user)
- `GET /costs/{id}` — Get single cost entry
- `POST /costs/` — Add new cost (seeds, materials, tools)
- `PUT /costs/{id}` — Update cost details
- `DELETE /costs/{id}` — Delete cost entry

**Analytics:**
- `GET /costs/season/{season_id}/total` — Total cost for season with breakdown by category

Categories: seed, material, tool, etc.

### 6. Distribution Endpoints ✓
**routers/distributions.py** — Gift & trade tracking

- `GET /distributions/` — List all distributions (filter by batch, type, user)
- `GET /distributions/{id}` — Get single distribution
- `POST /distributions/` — Log new gift or trade
- `PUT /distributions/{id}` — Update distribution
- `DELETE /distributions/{id}` — Delete distribution

**Types:** gift, trade

**Summary:**
- `GET /distributions/batch/{batch_id}/summary` — Total recipients, quantities, breakdown

### 7. Photo Upload Endpoints ✓
**routers/photos.py** — Photo management with file storage

- `GET /photos/` — List photos (filter by batch, event, user)
- `GET /photos/{id}` — Get photo record
- `POST /photos/upload` — Upload new photo
  - Stores file in `/api/photos/` directory
  - Auto-generates unique filename
  - Validates file type (.jpg, .png, .gif, .webp)
  - Max 10 MB per file
  - Returns photo record with filename
- `PUT /photos/{id}` — Update caption & taken_at date
- `DELETE /photos/{id}` — Delete photo (removes from storage & DB)

**Gallery:**
- `GET /photos/batch/{batch_id}/gallery` — All photos for batch (chronological order)

### 8. Authentication Endpoints ✓
**main.py** — Auth endpoints

- `POST /auth/login` — Verify PIN and return available users
  - Input: `{"pin": "1234"}`
  - Returns: List of users with id, name, display_color
- `GET /users` — List available users (for user selector UI)

### 9. Health & Info Endpoints ✓
- `GET /` — API info (version, docs link)
- `GET /health` — Health check (used by Nginx)

## API Documentation

When running the API, visit:
```
http://localhost:8000/docs
```

Swagger UI shows:
- ✓ All 40+ endpoints
- ✓ Request/response schemas
- ✓ Try-it-out button for testing
- ✓ Authentication info

## File Structure

```
api/
├── main.py                  ✓ Updated with router includes
├── database.py              ✓ DB connection & sessions
├── models.py                ✓ SQLAlchemy ORM models
├── schemas.py               ✓ Pydantic schemas
├── seed_data.py             ✓ CSV import
├── Dockerfile
├── requirements.txt
└── routers/
    ├── __init__.py
    ├── plants.py            ✓ Varieties & batches CRUD
    ├── events.py            ✓ Event logging & timeline
    ├── seasons.py           ✓ Season management
    ├── costs.py             ✓ Expense tracking + totals
    ├── distributions.py     ✓ Gift/trade logging + summary
    └── photos.py            ✓ Photo upload & gallery
```

## Testing the API

### Locally (without Docker)

```bash
cd ~/Ai/Seeds/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL (Docker)
docker run -e POSTGRES_DB=plantlady -e POSTGRES_USER=plantlady \
  -e POSTGRES_PASSWORD=change_me -p 5432:5432 postgres:16-alpine

# Run migrations & seed
export DATABASE_URL="postgresql://plantlady:change_me@localhost:5432/plantlady"
alembic upgrade head
python seed_data.py

# Start API
python main.py
# API at http://localhost:8000/docs
```

### Docker

```bash
cd ~/Ai/Seeds
docker-compose up plantlady-db plantlady-api
docker-compose exec plantlady-api alembic upgrade head
docker-compose exec plantlady-api python seed_data.py
```

## Example API Calls

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'
```

Response:
```json
[
  {"id": 1, "name": "Jamison", "display_color": "#648655", "created_at": "..."},
  {"id": 2, "name": "Amy", "display_color": "#a8bf8f", "created_at": "..."}
]
```

### Create Event (Quick Logging)
```bash
curl -X POST http://localhost:8000/events/ \
  -H "Content-Type: application/json" \
  -d '{
    "batch_id": 1,
    "event_type": "GERMINATED",
    "event_date": "2026-02-24T10:30:00",
    "notes": "Sprouted early!"
  }' \
  -H "X-User-ID: 1"  # Would come from session
```

### Upload Photo
```bash
curl -X POST http://localhost:8000/photos/upload \
  -F "batch_id=1" \
  -F "caption=Beautiful blooms!" \
  -F "file=@/path/to/photo.jpg" \
  -H "X-User-ID: 1"
```

### List Plant Batches for Season
```bash
curl http://localhost:8000/plants/batches?season_id=2&limit=50
```

### Get Season Cost Total
```bash
curl http://localhost:8000/costs/season/2/total
```

Response:
```json
{
  "season_id": 2,
  "year": 2026,
  "total_cost": 53.39,
  "by_category": [
    {"category": "material", "total": 44.75},
    {"category": "seed", "total": 8.64}
  ]
}
```

## Error Handling

All endpoints return proper HTTP status codes:

- `200 OK` — Successful GET/PUT
- `201 Created` — Successful POST
- `204 No Content` — Successful DELETE
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Auth failed
- `404 Not Found` — Resource doesn't exist
- `413 Payload Too Large` — File too large
- `500 Internal Server Error` — Server error

Error responses include detail message:
```json
{
  "detail": "Plant batch not found"
}
```

## Photo Storage

Photos are stored in:
- **Local dev**: `~/Ai/Seeds/api/photos/`
- **Docker NAS**: `/volume1/docker/plantlady/photos/`

Nginx serves them at:
```
http://localhost:3010/photos/{filename}
```

## CORS Configuration

API is accessible from:
- `http://localhost:5173` — React dev server
- `http://localhost:3010` — Production via Nginx
- Cloudflare tunnel domain (once deployed)

## Dependency Injection Pattern

All routes use FastAPI's `Depends(get_db)` for sessions:

```python
@router.get("/items")
async def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()
```

This ensures:
- ✓ Automatic session cleanup
- ✓ Clean code without manual session management
- ✓ Testable (can mock session)

## What's Ready for Phase 4

✓ All CRUD endpoints implemented
✓ Photo upload working
✓ Stats endpoints (costs, distributions)
✓ Proper error handling & validation
✓ Full API documentation (Swagger)
✓ All routers tested & functional

**Next Step**: Phase 4 will build the frontend to consume these APIs:
- PIN login screen
- User selector
- Plant list & quick event logging
- Photo upload UI

---

**API Phase Complete!** 🚀
40+ endpoints ready for frontend integration.
