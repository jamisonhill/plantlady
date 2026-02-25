# PlantLady Database — Setup & Migration Guide

## Schema Overview

The database has 8 tables with relationships for collaborative plant tracking:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts (Jamison, Amy) | name, pin_hash, display_color |
| **seasons** | Growing years | year (2025, 2026, etc.) |
| **plant_varieties** | Plant catalog | common_name, category, germination_days, maturity_days |
| **plant_batches** | Individual planting events | user_id, variety_id, season_id, start_date, repeat_next_year |
| **events** | Milestones per batch | batch_id, event_type (SEEDED, GERMINATED, MATURE, etc.), date |
| **photos** | Plant photos | batch_id, event_id (optional), filename, caption, taken_at |
| **distributions** | Gifting & trading log | batch_id, recipient, type (gift/trade), quantity |
| **season_costs** | Expense tracking | season_id, item_name, cost, category (seed/material) |

## Local Development Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 14+ (or just test against Docker PostgreSQL)
- Virtual environment

### 1. Install Dependencies

```bash
cd ~/Ai/Seeds/api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create Local PostgreSQL (Optional)

If you don't have PostgreSQL running, use Docker:

```bash
docker run --name plantlady-db \
  -e POSTGRES_DB=plantlady \
  -e POSTGRES_USER=plantlady \
  -e POSTGRES_PASSWORD=change_me \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 3. Run Migrations

```bash
# From api/ directory
export DATABASE_URL="postgresql://plantlady:change_me@localhost:5432/plantlady"

# Create all tables
alembic upgrade head
```

### 4. Seed Initial Data

This imports your CSV files into the database:

```bash
python seed_data.py
```

Expected output:
```
🌱 Seeding PlantLady database...

Creating database tables...

👥 Creating users...
✓ Created user: Jamison
✓ Created user: Amy

📅 Creating seasons...
✓ Created season: 2025
✓ Created season: 2026

🌿 Importing plant varieties (2025)...
✓ Imported 20 plant varieties from 2025

💰 Importing season costs (2026)...
✓ Imported 3 season costs from 2026

✅ Database seeding complete!
```

### 5. Verify Data

```bash
psql -U plantlady -d plantlady -c "SELECT COUNT(*) FROM users;"
psql -U plantlady -d plantlady -c "SELECT * FROM users;"
psql -U plantlady -d plantlady -c "SELECT * FROM plant_varieties LIMIT 5;"
```

## Migrations (Alembic)

### Viewing Migration Status

```bash
alembic current    # Show current migration
alembic heads      # Show latest migration
```

### Creating New Migrations

When you modify models.py, create a migration:

```bash
# Alembic will auto-detect changes
alembic revision --autogenerate -m "Description of change"

# Review the generated migration in alembic/versions/
# Then apply it:
alembic upgrade head
```

### Rolling Back

```bash
# Rollback one migration
alembic downgrade -1

# Rollback all migrations
alembic downgrade base
```

## Docker Deployment

When deploying to NAS via docker-compose:

### 1. Environment Setup

The `docker-compose.yml` automatically:
- Creates PostgreSQL container with persistent volume
- Sets `DATABASE_URL` environment variable
- Mounts the `/volume1/docker/plantlady/` directories

### 2. Database Initialization

The first time the API container starts, it:
1. Connects to PostgreSQL
2. Runs `Base.metadata.create_all()` to create tables (from main.py)
3. Is ready to accept requests

Alternatively, run migrations manually:

```bash
# SSH into NAS
docker-compose exec plantlady-api alembic upgrade head

# Or seed data
docker-compose exec plantlady-api python seed_data.py
```

### 3. Verify Database Health

```bash
# Check if container is healthy
docker-compose ps

# View logs
docker-compose logs plantlady-db

# Access PostgreSQL from host
psql -h [NAS_IP] -U plantlady -d plantlady -p 5432
```

## Data Model Details

### Users
- **Jamison** and **Amy** share the same PIN
- Both see all data (collaborative approach)
- `display_color` is a hex color for UI differentiation

### Plant Varieties
Imported from your `Progress-sheet3-2025 Seed Starting Information.csv`:
- Common name, scientific name, category
- Days to germinate, days to mature
- Notes from your tracking

### Plant Batches
One batch = one seed-starting session for one variety in one season
- Tracks: seed count, packets, source (seed company, gift, saved)
- Location (garden bed, container, indoors)
- Start date, transplant date
- Repeat status for next season (yes/no/maybe)

### Events
Milestones tracked per batch:
- `SEEDED` — initial planting
- `GERMINATED` — sprouted
- `TRANSPLANTED` — moved to garden
- `FIRST_FLOWER` — first bloom
- `MATURE` — ready to harvest
- `HARVESTED` — collected
- `GIVEN_AWAY` — gifted to someone
- `TRADED` — exchanged for something
- `DIED` — didn't make it
- `OBSERVATION` — general note

### Photos
Can be linked to:
- A batch (general plant photos)
- A batch + event (photo of a milestone)
- Each photo gets a filename stored in `/volume1/docker/plantlady/photos/`

### Distributions
Tracks gifting & trading:
- Which plant batch was distributed
- Who received it
- Quantity
- Type: `gift` or `trade`

### Season Costs
From your `Progress-sheet2-2026 Season Costs.csv`:
- Item name (seeds, grow lights, soil, etc.)
- Cost per item
- Quantity
- Category (seed, material, tool, etc.)
- One-time vs recurring

## Common Queries

```sql
-- Plants that germinated in 2025
SELECT pv.common_name, COUNT(*) as count
FROM plant_batches pb
JOIN plant_varieties pv ON pb.variety_id = pv.id
JOIN seasons s ON pb.season_id = s.id
WHERE s.year = 2025
  AND EXISTS (SELECT 1 FROM events e WHERE e.batch_id = pb.id AND e.event_type = 'GERMINATED')
GROUP BY pv.common_name;

-- Total cost for 2026
SELECT SUM(cost) as total_cost FROM season_costs WHERE season_id = 2;

-- Plants with photos
SELECT pv.common_name, COUNT(p.id) as photo_count
FROM plant_batches pb
JOIN plant_varieties pv ON pb.variety_id = pv.id
LEFT JOIN photos p ON pb.id = p.batch_id
GROUP BY pv.common_name
HAVING COUNT(p.id) > 0;
```

## Troubleshooting

### "Database connection refused"
- Make sure PostgreSQL is running
- Check DATABASE_URL environment variable: `echo $DATABASE_URL`
- Verify credentials: user=plantlady, password from .env, host=localhost

### "Alembic can't import models"
- Make sure you're in the `api/` directory
- Activate virtual environment: `source .venv/bin/activate`

### "Foreign key constraint failed"
- Ensure migrations ran in correct order: `alembic current`
- Check that parent records exist before inserting child records

### "CSV import fails"
- Verify CSV file paths are correct in `seed_data.py`
- Check file encoding (should be UTF-8 with BOM)
- Ensure CSV is in same directory as seed_data.py

## Next Steps

Once database is set up and seeded:
1. **Phase 3**: Implement CRUD endpoints for each model
2. **Phase 4**: Frontend can start calling these endpoints
3. **Phase 5+**: Build out photo upload, stats, and reporting features
