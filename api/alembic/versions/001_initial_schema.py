"""Initial schema - Create all tables

Revision ID: 001
Revises:
Create Date: 2026-02-24

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM type - check if it exists first
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'eventtype') THEN
                CREATE TYPE eventtype AS ENUM (
                    'SEEDED', 'GERMINATED', 'TRANSPLANTED', 'FIRST_FLOWER',
                    'MATURE', 'HARVESTED', 'GIVEN_AWAY', 'TRADED', 'DIED', 'OBSERVATION'
                );
            END IF;
        END $$;
    """)

    # Create users table
    op.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            display_color VARCHAR(7),
            pin_hash VARCHAR(255) NOT NULL,
            pin VARCHAR(4),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create seasons table
    op.execute("""
        CREATE TABLE seasons (
            id SERIAL PRIMARY KEY,
            year INTEGER UNIQUE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create plant_varieties table
    op.execute("""
        CREATE TABLE plant_varieties (
            id SERIAL PRIMARY KEY,
            common_name VARCHAR(100) NOT NULL,
            scientific_name VARCHAR(150),
            category VARCHAR(50) NOT NULL,
            flowering_season VARCHAR(50),
            days_to_germinate INTEGER,
            days_to_mature INTEGER,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create plant_batches table
    op.execute("""
        CREATE TABLE plant_batches (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            variety_id INTEGER NOT NULL REFERENCES plant_varieties(id),
            season_id INTEGER NOT NULL REFERENCES seasons(id),
            seeds_count INTEGER,
            packets INTEGER,
            source VARCHAR(100),
            location VARCHAR(100),
            start_date TIMESTAMP,
            transplant_date TIMESTAMP,
            repeat_next_year VARCHAR(10),
            outcome_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create events table
    op.execute("""
        CREATE TABLE events (
            id SERIAL PRIMARY KEY,
            batch_id INTEGER NOT NULL REFERENCES plant_batches(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            event_type eventtype NOT NULL,
            event_date TIMESTAMP NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create photos table
    op.execute("""
        CREATE TABLE photos (
            id SERIAL PRIMARY KEY,
            batch_id INTEGER NOT NULL REFERENCES plant_batches(id),
            event_id INTEGER REFERENCES events(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            filename VARCHAR(255) UNIQUE NOT NULL,
            caption TEXT,
            taken_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create distributions table
    op.execute("""
        CREATE TABLE distributions (
            id SERIAL PRIMARY KEY,
            batch_id INTEGER NOT NULL REFERENCES plant_batches(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            recipient VARCHAR(100) NOT NULL,
            quantity INTEGER,
            type VARCHAR(20) NOT NULL,
            date TIMESTAMP NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create season_costs table
    op.execute("""
        CREATE TABLE season_costs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            season_id INTEGER NOT NULL REFERENCES seasons(id),
            item_name VARCHAR(100) NOT NULL,
            cost NUMERIC(10, 2) NOT NULL,
            quantity INTEGER,
            category VARCHAR(50) NOT NULL,
            is_one_time BOOLEAN DEFAULT TRUE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create indexes
    op.execute("CREATE INDEX ix_plant_batches_season_id ON plant_batches(season_id)")
    op.execute("CREATE INDEX ix_plant_batches_variety_id ON plant_batches(variety_id)")
    op.execute("CREATE INDEX ix_plant_batches_user_id ON plant_batches(user_id)")
    op.execute("CREATE INDEX ix_events_batch_id ON events(batch_id)")
    op.execute("CREATE INDEX ix_events_user_id ON events(user_id)")
    op.execute("CREATE INDEX ix_photos_batch_id ON photos(batch_id)")
    op.execute("CREATE INDEX ix_season_costs_season_id ON season_costs(season_id)")


def downgrade() -> None:
    # Drop indexes
    op.execute("DROP INDEX IF EXISTS ix_season_costs_season_id")
    op.execute("DROP INDEX IF EXISTS ix_photos_batch_id")
    op.execute("DROP INDEX IF EXISTS ix_events_user_id")
    op.execute("DROP INDEX IF EXISTS ix_events_batch_id")
    op.execute("DROP INDEX IF EXISTS ix_plant_batches_user_id")
    op.execute("DROP INDEX IF EXISTS ix_plant_batches_variety_id")
    op.execute("DROP INDEX IF EXISTS ix_plant_batches_season_id")

    # Drop tables in reverse order
    op.execute("DROP TABLE IF EXISTS season_costs")
    op.execute("DROP TABLE IF EXISTS distributions")
    op.execute("DROP TABLE IF EXISTS photos")
    op.execute("DROP TABLE IF EXISTS events")
    op.execute("DROP TABLE IF EXISTS plant_batches")
    op.execute("DROP TABLE IF EXISTS plant_varieties")
    op.execute("DROP TABLE IF EXISTS seasons")
    op.execute("DROP TABLE IF EXISTS users")

    # Drop enum type
    op.execute("DROP TYPE IF EXISTS eventtype")
