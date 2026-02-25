"""Season cost tracking endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import SeasonCost, Season
from schemas import SeasonCostCreate, SeasonCostResponse

router = APIRouter(prefix="/costs", tags=["costs"])


@router.get("/", response_model=list[SeasonCostResponse])
async def list_costs(
    season_id: Optional[int] = None,
    category: Optional[str] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List season costs with optional filters."""
    query = db.query(SeasonCost)

    if season_id:
        query = query.filter(SeasonCost.season_id == season_id)
    if category:
        query = query.filter(SeasonCost.category == category)
    if user_id:
        query = query.filter(SeasonCost.user_id == user_id)

    return query.order_by(SeasonCost.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{cost_id}", response_model=SeasonCostResponse)
async def get_cost(cost_id: int, db: Session = Depends(get_db)):
    """Get a specific cost entry."""
    cost = db.query(SeasonCost).filter(SeasonCost.id == cost_id).first()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost entry not found"
        )

    return cost


@router.post("/", response_model=SeasonCostResponse, status_code=status.HTTP_201_CREATED)
async def create_cost(
    cost: SeasonCostCreate,
    user_id: int,  # Injected from frontend session
    db: Session = Depends(get_db)
):
    """Add a new cost to a season."""
    # Validate season exists
    season = db.query(Season).filter(Season.id == cost.season_id).first()
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )

    db_cost = SeasonCost(**cost.model_dump(), user_id=user_id)
    db.add(db_cost)
    db.commit()
    db.refresh(db_cost)

    return db_cost


@router.put("/{cost_id}", response_model=SeasonCostResponse)
async def update_cost(
    cost_id: int,
    cost_update: SeasonCostCreate,
    db: Session = Depends(get_db)
):
    """Update a cost entry."""
    db_cost = db.query(SeasonCost).filter(SeasonCost.id == cost_id).first()

    if not db_cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost entry not found"
        )

    for key, value in cost_update.model_dump(exclude_unset=True).items():
        setattr(db_cost, key, value)

    db.commit()
    db.refresh(db_cost)

    return db_cost


@router.delete("/{cost_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cost(cost_id: int, db: Session = Depends(get_db)):
    """Delete a cost entry."""
    db_cost = db.query(SeasonCost).filter(SeasonCost.id == cost_id).first()

    if not db_cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost entry not found"
        )

    db.delete(db_cost)
    db.commit()


@router.get("/season/{season_id}/total", response_model=dict)
async def get_season_total(season_id: int, db: Session = Depends(get_db)):
    """Get total cost for a season, with breakdown by category."""
    # Validate season exists
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )

    # Total cost
    total = db.query(func.sum(SeasonCost.cost)).filter(
        SeasonCost.season_id == season_id
    ).scalar() or 0.0

    # Breakdown by category
    breakdown = db.query(
        SeasonCost.category,
        func.sum(SeasonCost.cost).label("total")
    ).filter(
        SeasonCost.season_id == season_id
    ).group_by(SeasonCost.category).all()

    return {
        "season_id": season_id,
        "year": season.year,
        "total_cost": float(total),
        "by_category": [
            {"category": cat, "total": float(amt)} for cat, amt in breakdown
        ]
    }
