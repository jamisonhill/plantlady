"""SQLAlchemy ORM models for PlantLady."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
import enum

from database import Base


class User(Base):
    """User account (Jamison, Amy)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    display_color = Column(String(7), default="#648655")  # Hex color
    pin_hash = Column(String(255), nullable=False)  # Hashed PIN
    pin = Column(String(4), nullable=True)  # 4-digit PIN for login
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plant_batches = relationship("PlantBatch", back_populates="user")
    events = relationship("Event", back_populates="user")
    photos = relationship("Photo", back_populates="user")
    distributions = relationship("Distribution", back_populates="user")
    season_costs = relationship("SeasonCost", back_populates="user")
    individual_plants = relationship("IndividualPlant", back_populates="user")
    care_events = relationship("CareEvent", back_populates="user")


class Season(Base):
    """Growing season (year)."""
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True)
    year = Column(Integer, unique=True, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plant_batches = relationship("PlantBatch", back_populates="season")
    season_costs = relationship("SeasonCost", back_populates="season")


class PlantVariety(Base):
    """Plant variety catalog (seeds)."""
    __tablename__ = "plant_varieties"

    id = Column(Integer, primary_key=True)
    common_name = Column(String(100), nullable=False)
    scientific_name = Column(String(150))
    category = Column(String(50), nullable=False)  # vegetable, ornamental, houseplant
    flowering_season = Column(String(50))
    days_to_germinate = Column(Integer)
    days_to_mature = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plant_batches = relationship("PlantBatch", back_populates="variety")


class PlantBatch(Base):
    """Individual plant batch (seeds planted, tracking per season)."""
    __tablename__ = "plant_batches"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    variety_id = Column(Integer, ForeignKey("plant_varieties.id"), nullable=False)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)

    seeds_count = Column(Integer)
    packets = Column(Integer)
    source = Column(String(100))  # Seed company, gift, saved, etc.
    location = Column(String(100))  # Garden bed, container, indoors, etc.

    start_date = Column(DateTime)
    transplant_date = Column(DateTime)
    repeat_next_year = Column(String(10))  # yes, no, maybe
    outcome_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="plant_batches")
    variety = relationship("PlantVariety", back_populates="plant_batches")
    season = relationship("Season", back_populates="plant_batches")
    events = relationship("Event", back_populates="batch")
    photos = relationship("Photo", back_populates="batch")
    distributions = relationship("Distribution", back_populates="batch")


class EventType(str, enum.Enum):
    """Milestone event types."""
    SEEDED = "SEEDED"
    GERMINATED = "GERMINATED"
    TRANSPLANTED = "TRANSPLANTED"
    FIRST_FLOWER = "FIRST_FLOWER"
    MATURE = "MATURE"
    HARVESTED = "HARVESTED"
    GIVEN_AWAY = "GIVEN_AWAY"
    TRADED = "TRADED"
    DIED = "DIED"
    OBSERVATION = "OBSERVATION"


class Event(Base):
    """Plant milestone event."""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("plant_batches.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    event_date = Column(DateTime, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    batch = relationship("PlantBatch", back_populates="events")
    user = relationship("User", back_populates="events")
    photos = relationship("Photo", back_populates="event")


class Photo(Base):
    """Plant photo (linked to batch and/or event)."""
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("plant_batches.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"))  # Optional: specific event
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    filename = Column(String(255), unique=True, nullable=False)  # Stored in volume
    caption = Column(Text)
    taken_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    batch = relationship("PlantBatch", back_populates="photos")
    event = relationship("Event", back_populates="photos")
    user = relationship("User", back_populates="photos")


class Distribution(Base):
    """Gifting or trading log."""
    __tablename__ = "distributions"

    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("plant_batches.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    recipient = Column(String(100), nullable=False)
    quantity = Column(Integer)
    type = Column(String(20), nullable=False)  # gift, trade
    date = Column(DateTime, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    batch = relationship("PlantBatch", back_populates="distributions")
    user = relationship("User", back_populates="distributions")


class SeasonCost(Base):
    """Season expense tracking (seeds, materials)."""
    __tablename__ = "season_costs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)

    item_name = Column(String(100), nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer)
    category = Column(String(50), nullable=False)  # seed, material, tool, etc.
    is_one_time = Column(Boolean, default=True)  # vs recurring
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="season_costs")
    season = relationship("Season", back_populates="season_costs")


class IndividualPlant(Base):
    """Individual houseplant (my plants collection)."""
    __tablename__ = "individual_plants"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    common_name = Column(String(100), nullable=False)
    scientific_name = Column(String(150), nullable=True)
    location = Column(String(100), nullable=True)
    photo_url = Column(String(500), nullable=True)  # stored filename
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    care_schedules = relationship("CareSchedule", back_populates="plant", cascade="all, delete-orphan")
    care_events = relationship("CareEvent", back_populates="plant", cascade="all, delete-orphan")
    user = relationship("User", back_populates="individual_plants")


class CareSchedule(Base):
    """Care schedule for a plant (watering, fertilizing, etc)."""
    __tablename__ = "care_schedules"

    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("individual_plants.id"), nullable=False)
    care_type = Column(String(20), nullable=False)  # WATERING, FERTILIZING, REPOTTING
    frequency_days = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plant = relationship("IndividualPlant", back_populates="care_schedules")


class CareEvent(Base):
    """Care event log (when a plant was watered, fertilized, etc)."""
    __tablename__ = "care_events"

    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("individual_plants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    care_type = Column(String(20), nullable=False)
    event_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    photo_filename = Column(String(255), nullable=True)  # optional photo
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plant = relationship("IndividualPlant", back_populates="care_events")
    user = relationship("User", back_populates="care_events")
