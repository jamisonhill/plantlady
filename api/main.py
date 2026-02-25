"""PlantLady API - FastAPI backend for plant tracking app."""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import engine, Base, SessionLocal, get_db
from models import User
from schemas import PINLogin, AuthResponse
from routers import plants, events, seasons, costs, distributions, photos

# Create tables on startup
Base.metadata.create_all(bind=engine)

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

    Each user has their own PIN (Jamison: 1017, Amy: 0304).
    """
    pin = request.pin.strip()

    if not pin or len(pin) != 4 or not pin.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN must be 4 digits"
        )

    # Look up user by PIN
    user = db.query(User).filter(User.pin == pin).first()

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
