"""Plant variety and batch endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import PlantVariety, PlantBatch, Season
from schemas import (
    PlantVarietyCreate,
    PlantVarietyResponse,
    PlantBatchCreate,
    PlantBatchUpdate,
    PlantBatchResponse,
)

router = APIRouter(prefix="/plants", tags=["plants"])


# ============================================================================
# Plant Varieties
# ============================================================================

@router.get("/varieties", response_model=list[PlantVarietyResponse])
async def list_varieties(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all plant varieties, optionally filtered by category."""
    query = db.query(PlantVariety)

    if category:
        query = query.filter(PlantVariety.category == category)

    return query.offset(skip).limit(limit).all()


@router.get("/varieties/{variety_id}", response_model=PlantVarietyResponse)
async def get_variety(variety_id: int, db: Session = Depends(get_db)):
    """Get a specific plant variety."""
    variety = db.query(PlantVariety).filter(PlantVariety.id == variety_id).first()

    if not variety:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant variety not found"
        )

    return variety


@router.post("/varieties", response_model=PlantVarietyResponse, status_code=status.HTTP_201_CREATED)
async def create_variety(variety: PlantVarietyCreate, db: Session = Depends(get_db)):
    """Create a new plant variety."""
    # Check if variety already exists
    existing = db.query(PlantVariety).filter(
        PlantVariety.common_name == variety.common_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plant variety already exists"
        )

    db_variety = PlantVariety(**variety.model_dump())
    db.add(db_variety)
    db.commit()
    db.refresh(db_variety)

    return db_variety


@router.put("/varieties/{variety_id}", response_model=PlantVarietyResponse)
async def update_variety(
    variety_id: int,
    variety_update: PlantVarietyCreate,
    db: Session = Depends(get_db)
):
    """Update a plant variety."""
    db_variety = db.query(PlantVariety).filter(PlantVariety.id == variety_id).first()

    if not db_variety:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant variety not found"
        )

    for key, value in variety_update.model_dump(exclude_unset=True).items():
        setattr(db_variety, key, value)

    db.commit()
    db.refresh(db_variety)

    return db_variety


@router.delete("/varieties/{variety_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_variety(variety_id: int, db: Session = Depends(get_db)):
    """Delete a plant variety (if no batches exist)."""
    db_variety = db.query(PlantVariety).filter(PlantVariety.id == variety_id).first()

    if not db_variety:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant variety not found"
        )

    # Check if any batches use this variety
    batches = db.query(PlantBatch).filter(PlantBatch.variety_id == variety_id).count()
    if batches > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete variety with existing plant batches"
        )

    db.delete(db_variety)
    db.commit()


# ============================================================================
# Plant Batches
# ============================================================================

@router.get("/batches", response_model=list[PlantBatchResponse])
async def list_batches(
    season_id: Optional[int] = None,
    variety_id: Optional[int] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List plant batches with optional filters."""
    query = db.query(PlantBatch)

    if season_id:
        query = query.filter(PlantBatch.season_id == season_id)
    if variety_id:
        query = query.filter(PlantBatch.variety_id == variety_id)
    if user_id:
        query = query.filter(PlantBatch.user_id == user_id)

    return query.offset(skip).limit(limit).all()


@router.get("/batches/{batch_id}", response_model=PlantBatchResponse)
async def get_batch(batch_id: int, db: Session = Depends(get_db)):
    """Get a specific plant batch with full details."""
    batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    return batch


@router.post("/batches", response_model=PlantBatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    batch: PlantBatchCreate,
    user_id: int,  # Injected from frontend session
    db: Session = Depends(get_db)
):
    """Create a new plant batch for current user."""
    # Validate variety exists
    variety = db.query(PlantVariety).filter(
        PlantVariety.id == batch.variety_id
    ).first()
    if not variety:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant variety not found"
        )

    # Validate season exists
    season = db.query(Season).filter(
        Season.id == batch.season_id
    ).first()
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )

    db_batch = PlantBatch(**batch.model_dump(), user_id=user_id)
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    return db_batch


@router.put("/batches/{batch_id}", response_model=PlantBatchResponse)
async def update_batch(
    batch_id: int,
    batch_update: PlantBatchUpdate,
    db: Session = Depends(get_db)
):
    """Update a plant batch."""
    db_batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()

    if not db_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    for key, value in batch_update.model_dump(exclude_unset=True).items():
        setattr(db_batch, key, value)

    db.commit()
    db.refresh(db_batch)

    return db_batch


@router.delete("/batches/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    """Delete a plant batch and associated events/photos."""
    db_batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()

    if not db_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    # Cascade delete: events, photos, distributions
    from models import Event, Photo, Distribution
    db.query(Event).filter(Event.batch_id == batch_id).delete()
    db.query(Photo).filter(Photo.batch_id == batch_id).delete()
    db.query(Distribution).filter(Distribution.batch_id == batch_id).delete()

    db.delete(db_batch)
    db.commit()
