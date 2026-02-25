"""Pydantic request/response schemas for FastAPI."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ============================================================================
# Auth
# ============================================================================

class PINLogin(BaseModel):
    """PIN login request."""
    pin: str  # 4-digit PIN


class UserSelect(BaseModel):
    """Select user after PIN authentication."""
    user_id: int


class AuthResponse(BaseModel):
    """Authentication response with session."""
    id: int
    name: str
    display_color: str
    created_at: datetime


# ============================================================================
# Users
# ============================================================================

class UserBase(BaseModel):
    """Base user schema."""
    name: str
    display_color: str = "#648655"


class UserCreate(UserBase):
    """Create user request."""
    pin: str


class UserResponse(UserBase):
    """User response."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Seasons
# ============================================================================

class SeasonCreate(BaseModel):
    """Create season request."""
    year: int
    notes: Optional[str] = None


class SeasonResponse(BaseModel):
    """Season response."""
    id: int
    year: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Plant Varieties
# ============================================================================

class PlantVarietyCreate(BaseModel):
    """Create plant variety request."""
    common_name: str
    scientific_name: Optional[str] = None
    category: str  # vegetable, ornamental, houseplant
    flowering_season: Optional[str] = None
    days_to_germinate: Optional[int] = None
    days_to_mature: Optional[int] = None
    notes: Optional[str] = None


class PlantVarietyResponse(PlantVarietyCreate):
    """Plant variety response."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Plant Batches
# ============================================================================

class PlantBatchCreate(BaseModel):
    """Create plant batch request."""
    variety_id: int
    season_id: int
    seeds_count: Optional[int] = None
    packets: Optional[int] = None
    source: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    transplant_date: Optional[datetime] = None
    repeat_next_year: Optional[str] = None
    outcome_notes: Optional[str] = None


class PlantBatchUpdate(BaseModel):
    """Update plant batch request."""
    seeds_count: Optional[int] = None
    packets: Optional[int] = None
    source: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    transplant_date: Optional[datetime] = None
    repeat_next_year: Optional[str] = None
    outcome_notes: Optional[str] = None


class PlantBatchResponse(PlantBatchCreate):
    """Plant batch response."""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Events
# ============================================================================

class EventCreate(BaseModel):
    """Create event request."""
    batch_id: int
    event_type: str  # Must be valid EventType
    event_date: datetime
    notes: Optional[str] = None


class EventResponse(EventCreate):
    """Event response."""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Photos
# ============================================================================

class PhotoCreate(BaseModel):
    """Create photo request."""
    batch_id: int
    event_id: Optional[int] = None
    caption: Optional[str] = None
    taken_at: Optional[datetime] = None


class PhotoResponse(PhotoCreate):
    """Photo response."""
    id: int
    user_id: int
    filename: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Distributions (Gifts/Trades)
# ============================================================================

class DistributionCreate(BaseModel):
    """Create distribution request."""
    batch_id: int
    recipient: str
    quantity: Optional[int] = None
    type: str  # gift, trade
    date: datetime
    notes: Optional[str] = None


class DistributionResponse(DistributionCreate):
    """Distribution response."""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Season Costs
# ============================================================================

class SeasonCostCreate(BaseModel):
    """Create season cost request."""
    season_id: int
    item_name: str
    cost: float
    quantity: Optional[int] = None
    category: str  # seed, material, tool, etc.
    is_one_time: bool = True
    notes: Optional[str] = None


class SeasonCostResponse(SeasonCostCreate):
    """Season cost response."""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Dashboard / Stats
# ============================================================================

class DashboardStats(BaseModel):
    """Season dashboard statistics."""
    total_batches: int
    germinated_count: int
    mature_count: int
    total_cost: float
    total_distributed: int


class PlantStats(BaseModel):
    """Statistics for a single plant batch."""
    id: int
    name: str
    total_events: int
    germination_rate: Optional[float] = None
    days_to_flower: Optional[int] = None
    days_to_mature: Optional[int] = None
    photo_count: int
