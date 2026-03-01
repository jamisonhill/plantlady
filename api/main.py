"""PlantLady API - FastAPI backend for plant tracking app."""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
from passlib.context import CryptContext

from database import engine, Base, SessionLocal, get_db
from models import User, PlantBatch, Event
from schemas import PINLogin, AuthResponse, UserStatsResponse
from routers import plants, events, seasons, costs, distributions, photos, individual_plants, identify

# Password context for hashing (argon2 only for hashing, but supports bcrypt verification)
# Using only argon2 for hashing to avoid bcrypt compatibility issues
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
# For verification, we'll manually handle bcrypt if needed (see login endpoint)

# Schema managed by Alembic migrations
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PlantLady API",
    description="Track seeds, plants, milestones, and gifting across seasons",
    version="0.1.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3010",  # Nginx production
        "http://127.0.0.1:3010",
        "http://192.168.0.9:3010",  # NAS production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(plants.router)
app.include_router(events.router)
app.include_router(seasons.router)
app.include_router(costs.router)
app.include_router(distributions.router)
app.include_router(photos.router)
app.include_router(individual_plants.router)
app.include_router(identify.router)


# ============================================================================
# Health & Info Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/")
async def root():
    """Root endpoint - API is running."""
    return {
        "message": "PlantLady API",
        "version": "0.1.0",
        "docs": "/docs"
    }


# ============================================================================
# Auth Endpoints (Phase 3 placeholder)
# ============================================================================

@app.post("/auth/login", response_model=AuthResponse)
async def login(request: PINLogin, db: Session = Depends(get_db)):
    """
    Verify PIN and return the matching user.

    Validates the PIN against bcrypt-hashed pin_hash in the database.
    """
    pin = request.pin.strip()

    if not pin or len(pin) != 4 or not pin.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN must be 4 digits"
        )

    # Find user by PIN (check plaintext first for compatibility, then bcrypt hash)
    user = db.query(User).filter(User.pin == pin).first()

    # If not found by plaintext, try bcrypt hash
    if not user:
        users = db.query(User).all()
        for u in users:
            try:
                if u.pin_hash and pwd_context.verify(pin, u.pin_hash):
                    user = u
                    break
            except Exception:
                pass  # Hash verification failed, continue

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN"
        )

    return AuthResponse(
        id=user.id,
        name=user.name,
        display_color=user.display_color,
        created_at=user.created_at
    )


@app.get("/users")
async def get_users(db: Session = Depends(get_db)):
    """Get list of available users."""
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "display_color": user.display_color
        }
        for user in users
    ]


@app.get("/users/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user statistics (plants, events, streak)."""
    from datetime import datetime, timedelta

    # Count plant batches
    batch_count = db.query(func.count(PlantBatch.id)).filter(
        PlantBatch.user_id == user_id
    ).scalar() or 0

    # Count events
    event_count = db.query(func.count(Event.id)).filter(
        Event.user_id == user_id
    ).scalar() or 0

    # Calculate streak: count consecutive days ending today
    streak = 0
    today = datetime.utcnow().date()

    # Get all distinct event dates for this user, ordered descending
    events = db.query(Event).filter(Event.user_id == user_id).order_by(Event.event_date.desc()).all()

    if events:
        event_dates = sorted(set(e.event_date.date() for e in events), reverse=True)

        # Count consecutive days from today backwards
        current_date = today
        for event_date in event_dates:
            if event_date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

    return UserStatsResponse(
        batch_count=batch_count,
        event_count=event_count,
        streak=streak
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
