"""Season endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Season
from schemas import SeasonCreate, SeasonResponse

router = APIRouter(prefix="/seasons", tags=["seasons"])


@router.get("/", response_model=list[SeasonResponse])
async def list_seasons(db: Session = Depends(get_db)):
    """List all seasons."""
    return db.query(Season).order_by(Season.year.desc()).all()


@router.get("/{season_id}", response_model=SeasonResponse)
async def get_season(season_id: int, db: Session = Depends(get_db)):
    """Get a specific season."""
    season = db.query(Season).filter(Season.id == season_id).first()

    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )

    return season


@router.get("/year/{year}", response_model=SeasonResponse)
async def get_season_by_year(year: int, db: Session = Depends(get_db)):
    """Get season by year."""
    season = db.query(Season).filter(Season.year == year).first()

    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Season {year} not found"
        )

    return season


@router.post("/", response_model=SeasonResponse, status_code=status.HTTP_201_CREATED)
async def create_season(season: SeasonCreate, db: Session = Depends(get_db)):
    """Create a new season."""
    # Check if season already exists
    existing = db.query(Season).filter(Season.year == season.year).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Season {season.year} already exists"
        )

    db_season = Season(**season.model_dump())
    db.add(db_season)
    db.commit()
    db.refresh(db_season)

    return db_season


@router.put("/{season_id}", response_model=SeasonResponse)
async def update_season(
    season_id: int,
    season_update: SeasonCreate,
    db: Session = Depends(get_db)
):
    """Update a season."""
    db_season = db.query(Season).filter(Season.id == season_id).first()

    if not db_season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )

    for key, value in season_update.model_dump(exclude_unset=True).items():
        setattr(db_season, key, value)

    db.commit()
    db.refresh(db_season)

    return db_season


@router.delete("/{season_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_season(season_id: int, db: Session = Depends(get_db)):
    """Delete a season (if empty)."""
    season = db.query(Season).filter(Season.id == season_id).first()

    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Season not found"
        )

    # Check if season has any batches or costs
    from models import PlantBatch, SeasonCost
    batch_count = db.query(PlantBatch).filter(PlantBatch.season_id == season_id).count()
    cost_count = db.query(SeasonCost).filter(SeasonCost.season_id == season_id).count()

    if batch_count > 0 or cost_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete season with existing batches or costs"
        )

    db.delete(season)
    db.commit()
