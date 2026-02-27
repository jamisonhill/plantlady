"""Seed initial data from CSV files into database."""

import csv
import sys
from datetime import datetime
from pathlib import Path
from passlib.context import CryptContext

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, Season, PlantVariety, PlantBatch, SeasonCost, EventType

# Password hashing context (argon2 primary for compatibility)
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def hash_pin(pin: str) -> str:
    """Hash a 4-digit PIN using argon2."""
    return pwd_context.hash(pin)


def create_users(db: Session):
    """Create default users (Jamison and Amy)."""
    users = [
        User(
            name="Jamison",
            display_color="#648655",
            pin_hash=hash_pin("1234")  # Default PIN - change in production!
        ),
        User(
            name="Amy",
            display_color="#a8bf8f",
            pin_hash=hash_pin("1234")  # Same PIN - shared access
        )
    ]

    for user in users:
        existing = db.query(User).filter(User.name == user.name).first()
        if not existing:
            db.add(user)
            print(f"✓ Created user: {user.name}")
        else:
            print(f"• User already exists: {user.name}")

    db.commit()


def create_seasons(db: Session):
    """Create season entries for 2025 and 2026."""
    seasons = [
        Season(year=2025, notes="Learning year"),
        Season(year=2026, notes="Second growing season")
    ]

    for season in seasons:
        existing = db.query(Season).filter(Season.year == season.year).first()
        if not existing:
            db.add(season)
            print(f"✓ Created season: {season.year}")
        else:
            print(f"• Season already exists: {season.year}")

    db.commit()


def parse_date(date_str: str) -> datetime | None:
    """Parse various date formats from CSV."""
    if not date_str or date_str.strip() == "":
        return None

    date_str = date_str.strip()
    formats = [
        "%m/%d/%Y",
        "%m/%d/%y",
        "%Y-%m-%d",
        "%m/%d",  # Will assume current year
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    # Try extracting first date from range like "2/26 - 3/18"
    if " - " in date_str:
        try:
            return datetime.strptime(date_str.split(" - ")[0].strip(), "%m/%d")
        except ValueError:
            pass

    return None


def parse_int_range(value: str) -> int | None:
    """Parse integer or range like '14-21' and return first value."""
    if not value or value.strip() == "":
        return None

    value = value.strip()
    try:
        return int(value.split("-")[0])
    except (ValueError, IndexError):
        return None


def seed_plant_varieties_2025(db: Session):
    """Import plant varieties from 2025 CSV."""
    csv_path = Path(__file__).parent.parent / "Progress-sheet3-2025 Seed Starting Information.csv"

    if not csv_path.exists():
        print(f"⚠ CSV not found: {csv_path}")
        return

    season_2025 = db.query(Season).filter(Season.year == 2025).first()
    jamison = db.query(User).filter(User.name == "Jamison").first()

    if not season_2025 or not jamison:
        print("✗ Season or User not found")
        return

    with open(csv_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        row_num = 0

        for row in reader:
            row_num += 1
            plant_name = row.get("Plant Name", "").strip()

            if not plant_name:
                continue

            # Check if variety exists
            existing_variety = db.query(PlantVariety).filter(
                PlantVariety.common_name == plant_name
            ).first()

            if not existing_variety:
                variety = PlantVariety(
                    common_name=plant_name,
                    category="vegetable",  # Default - adjust as needed
                    flowering_season=row.get("Flowering Season", "").strip() or None,
                    days_to_germinate=parse_int_range(row.get("Days to Germinate", "")),
                    notes=row.get("Notes", "").strip() or None
                )
                db.add(variety)
                db.flush()
                existing_variety = variety

            # Create plant batch for 2025
            batch_exists = db.query(PlantBatch).filter(
                PlantBatch.variety_id == existing_variety.id,
                PlantBatch.season_id == season_2025.id
            ).first()

            if not batch_exists:
                batch = PlantBatch(
                    user_id=jamison.id,
                    variety_id=existing_variety.id,
                    season_id=season_2025.id,
                    seeds_count=parse_int_range(row.get("Seeds", "")),
                    packets=parse_int_range(row.get("Packets", "")),
                    start_date=parse_date(row.get("Date Planted", "")),
                    transplant_date=parse_date(row.get("Transplant Outside", "")),
                    repeat_next_year=row.get("Repeat?", "").strip().lower() or None,
                    outcome_notes=row.get("Outcome", "").strip() or None
                )
                db.add(batch)

    db.commit()
    print(f"✓ Imported {row_num} plant varieties from 2025")


def seed_season_costs_2026(db: Session):
    """Import season costs from 2026 CSV."""
    csv_path = Path(__file__).parent.parent / "Progress-sheet2-2026 Season Costs.csv"

    if not csv_path.exists():
        print(f"⚠ CSV not found: {csv_path}")
        return

    season_2026 = db.query(Season).filter(Season.year == 2026).first()
    jamison = db.query(User).filter(User.name == "Jamison").first()

    if not season_2026 or not jamison:
        print("✗ Season or User not found")
        return

    with open(csv_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        cost_count = 0

        for row in reader:
            item_name = row.get("Material", "").strip()
            cost_str = row.get("Cost", "").strip()
            quantity_str = row.get("Quantity", "").strip()

            if not item_name or not cost_str or cost_str == "$0.00":
                continue

            try:
                cost_value = float(cost_str.replace("$", "").replace(",", ""))
                quantity = int(quantity_str) if quantity_str and quantity_str.isdigit() else 1

                cost_entry = SeasonCost(
                    user_id=jamison.id,
                    season_id=season_2026.id,
                    item_name=item_name,
                    cost=cost_value,
                    quantity=quantity,
                    category="material",
                    is_one_time=True
                )
                db.add(cost_entry)
                cost_count += 1
            except ValueError:
                continue

        db.commit()
        if cost_count > 0:
            print(f"✓ Imported {cost_count} season costs from 2026")


def main():
    """Run all seed operations."""
    print("\n🌱 Seeding PlantLady database...\n")

    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("\n👥 Creating users...")
        create_users(db)

        print("\n📅 Creating seasons...")
        create_seasons(db)

        print("\n🌿 Importing plant varieties (2025)...")
        seed_plant_varieties_2025(db)

        print("\n💰 Importing season costs (2026)...")
        seed_season_costs_2026(db)

        print("\n✅ Database seeding complete!\n")

    except Exception as e:
        print(f"\n✗ Error: {e}\n")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
