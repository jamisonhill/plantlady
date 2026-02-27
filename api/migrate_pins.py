#!/usr/bin/env python
"""One-time migration script: Hash plaintext PINs with bcrypt."""

from passlib.context import CryptContext
from database import SessionLocal
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def migrate_pins():
    """Hash all plaintext PINs and clear the pin field."""
    db = SessionLocal()
    try:
        # Get all users with a plaintext PIN
        users = db.query(User).filter(User.pin != None).all()

        migrated_count = 0
        for user in users:
            if user.pin:  # Double-check pin exists
                # Hash the PIN
                hashed = pwd_context.hash(user.pin)
                user.pin_hash = hashed
                user.pin = None  # Clear plaintext PIN
                migrated_count += 1
                print(f"✓ Migrated {user.name} (ID: {user.id})")

        # Commit changes
        db.commit()
        print(f"\n✅ Successfully migrated {migrated_count} users")

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔐 PlantLady PIN Migration (plaintext → bcrypt)")
    print("=" * 50)
    migrate_pins()
