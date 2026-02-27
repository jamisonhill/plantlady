"""Individual plants (my plants collection) endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import os
import uuid

from database import get_db
from models import IndividualPlant, CareSchedule, CareEvent, User
from schemas import (
    IndividualPlantCreate,
    IndividualPlantResponse,
    CareScheduleCreate,
    CareScheduleResponse,
    CareEventCreate,
    CareEventResponse,
)

router = APIRouter(prefix="/individual-plants", tags=["individual-plants"])

# Photo storage directory
PHOTOS_DIR = "/app/photos"
os.makedirs(PHOTOS_DIR, exist_ok=True)


# ============================================================================
# Individual Plants
# ============================================================================

@router.get("", response_model=list[IndividualPlantResponse])
async def list_plants(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List user's individual plants."""
    plants = db.query(IndividualPlant).filter(
        IndividualPlant.user_id == user_id
    ).offset(skip).limit(limit).all()
    return plants


@router.post("", response_model=IndividualPlantResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(
    user_id: int,
    plant_data: IndividualPlantCreate,
    db: Session = Depends(get_db)
):
    """Create a new individual plant."""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    plant = IndividualPlant(
        user_id=user_id,
        common_name=plant_data.common_name,
        scientific_name=plant_data.scientific_name,
        location=plant_data.location,
        notes=plant_data.notes
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=IndividualPlantResponse)
async def get_plant_detail(plant_id: int, db: Session = Depends(get_db)):
    """Get individual plant details."""
    plant = db.query(IndividualPlant).filter(IndividualPlant.id == plant_id).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    return plant


@router.put("/{plant_id}", response_model=IndividualPlantResponse)
async def update_plant(
    plant_id: int,
    plant_data: IndividualPlantCreate,
    db: Session = Depends(get_db)
):
    """Update individual plant."""
    plant = db.query(IndividualPlant).filter(IndividualPlant.id == plant_id).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    plant.common_name = plant_data.common_name
    plant.scientific_name = plant_data.scientific_name
    plant.location = plant_data.location
    plant.notes = plant_data.notes

    db.commit()
    db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(plant_id: int, db: Session = Depends(get_db)):
    """Delete individual plant (cascades to care schedules and events)."""
    plant = db.query(IndividualPlant).filter(IndividualPlant.id == plant_id).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    db.delete(plant)
    db.commit()


# ============================================================================
# Care Schedules
# ============================================================================

@router.get("/{plant_id}/care-schedule", response_model=list[CareScheduleResponse])
async def get_care_schedules(plant_id: int, db: Session = Depends(get_db)):
    """Get care schedules for a plant."""
    schedules = db.query(CareSchedule).filter(
        CareSchedule.plant_id == plant_id
    ).all()
    return schedules


@router.post("/{plant_id}/care-schedule", response_model=CareScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_care_schedule(
    plant_id: int,
    user_id: int,
    schedule_data: CareScheduleCreate,
    db: Session = Depends(get_db)
):
    """Create or update (upsert) care schedule for a plant.

    If a schedule already exists for this care_type, it's deleted and replaced.
    """
    # Verify plant exists
    plant = db.query(IndividualPlant).filter(IndividualPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    # Delete existing schedule for this care type
    db.query(CareSchedule).filter(
        CareSchedule.plant_id == plant_id,
        CareSchedule.care_type == schedule_data.care_type
    ).delete()

    # Create new schedule
    schedule = CareSchedule(
        plant_id=plant_id,
        care_type=schedule_data.care_type,
        frequency_days=schedule_data.frequency_days
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


# ============================================================================
# Care Events
# ============================================================================

@router.get("/{plant_id}/care-events", response_model=list[CareEventResponse])
async def get_care_events(
    plant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get care events for a plant (ordered by event_date descending)."""
    events = db.query(CareEvent).filter(
        CareEvent.plant_id == plant_id
    ).order_by(CareEvent.event_date.desc()).offset(skip).limit(limit).all()
    return events


@router.post("/{plant_id}/care-events", response_model=CareEventResponse, status_code=status.HTTP_201_CREATED)
async def log_care_event(
    plant_id: int,
    user_id: int,
    event_data: CareEventCreate,
    db: Session = Depends(get_db)
):
    """Log a care event for a plant."""
    # Verify plant exists
    plant = db.query(IndividualPlant).filter(IndividualPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    event = CareEvent(
        plant_id=plant_id,
        user_id=user_id,
        care_type=event_data.care_type,
        event_date=event_data.event_date,
        notes=event_data.notes
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.post("/{plant_id}/care-events/{event_id}/photo", response_model=CareEventResponse)
async def upload_care_event_photo(
    plant_id: int,
    event_id: int,
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload photo for a care event."""
    # Verify event exists and belongs to the plant
    event = db.query(CareEvent).filter(
        CareEvent.id == event_id,
        CareEvent.plant_id == plant_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Care event not found"
        )

    # Save file with unique name
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(PHOTOS_DIR, unique_filename)

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save photo: {str(e)}"
        )

    # Update event with photo filename
    event.photo_filename = unique_filename
    db.commit()
    db.refresh(event)
    return event
