"""Distribution endpoints (gifting and trading)."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Distribution, PlantBatch
from schemas import DistributionCreate, DistributionResponse

router = APIRouter(prefix="/distributions", tags=["distributions"])


@router.get("/", response_model=list[DistributionResponse])
async def list_distributions(
    batch_id: Optional[int] = None,
    dist_type: Optional[str] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List distributions (gifts/trades) with optional filters."""
    query = db.query(Distribution)

    if batch_id:
        query = query.filter(Distribution.batch_id == batch_id)
    if dist_type:
        if dist_type not in ["gift", "trade"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Type must be 'gift' or 'trade'"
            )
        query = query.filter(Distribution.type == dist_type)
    if user_id:
        query = query.filter(Distribution.user_id == user_id)

    return query.order_by(Distribution.date.desc()).offset(skip).limit(limit).all()


@router.get("/{distribution_id}", response_model=DistributionResponse)
async def get_distribution(distribution_id: int, db: Session = Depends(get_db)):
    """Get a specific distribution record."""
    dist = db.query(Distribution).filter(Distribution.id == distribution_id).first()

    if not dist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Distribution record not found"
        )

    return dist


@router.post("/", response_model=DistributionResponse, status_code=status.HTTP_201_CREATED)
async def create_distribution(
    distribution: DistributionCreate,
    user_id: int,  # Injected from frontend session
    db: Session = Depends(get_db)
):
    """Log a new gift or trade."""
    # Validate batch exists
    batch = db.query(PlantBatch).filter(PlantBatch.id == distribution.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    # Validate type
    if distribution.type not in ["gift", "trade"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type must be 'gift' or 'trade'"
        )

    db_dist = Distribution(**distribution.model_dump(), user_id=user_id)
    db.add(db_dist)
    db.commit()
    db.refresh(db_dist)

    return db_dist


@router.put("/{distribution_id}", response_model=DistributionResponse)
async def update_distribution(
    distribution_id: int,
    dist_update: DistributionCreate,
    db: Session = Depends(get_db)
):
    """Update a distribution record."""
    db_dist = db.query(Distribution).filter(Distribution.id == distribution_id).first()

    if not db_dist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Distribution record not found"
        )

    if dist_update.type not in ["gift", "trade"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type must be 'gift' or 'trade'"
        )

    for key, value in dist_update.model_dump(exclude_unset=True).items():
        setattr(db_dist, key, value)

    db.commit()
    db.refresh(db_dist)

    return db_dist


@router.delete("/{distribution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_distribution(distribution_id: int, db: Session = Depends(get_db)):
    """Delete a distribution record."""
    db_dist = db.query(Distribution).filter(Distribution.id == distribution_id).first()

    if not db_dist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Distribution record not found"
        )

    db.delete(db_dist)
    db.commit()


@router.get("/batch/{batch_id}/summary", response_model=dict)
async def get_batch_distribution_summary(batch_id: int, db: Session = Depends(get_db)):
    """Get summary of all gifts/trades for a batch."""
    # Validate batch exists
    batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    dists = db.query(Distribution).filter(Distribution.batch_id == batch_id).all()

    gifts = [d for d in dists if d.type == "gift"]
    trades = [d for d in dists if d.type == "trade"]

    total_quantity = sum(d.quantity or 0 for d in dists)

    return {
        "batch_id": batch_id,
        "total_distributed": len(dists),
        "total_quantity": total_quantity,
        "gifts": len(gifts),
        "trades": len(trades),
        "recipients": list(set(d.recipient for d in dists))
    }
