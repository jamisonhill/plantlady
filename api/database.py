"""Database connection and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os

# Database URL from environment or local default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://plantlady:change_me@localhost:5432/plantlady"
)

# Create engine with connection pooling disabled for Alembic compatibility
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    poolclass=NullPool
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db():
    """Dependency injection for database session in FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
