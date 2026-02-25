"""Plant event endpoints (milestones, observations)."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Event, PlantBatch, EventType
from schemas import EventCreate, EventResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=list[EventResponse])
async def list_events(
    batch_id: Optional[int] = None,
    event_type: Optional[str] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List events with optional filters."""
    query = db.query(Event)

    if batch_id:
        query = query.filter(Event.batch_id == batch_id)
    if event_type:
        # Validate event type
        try:
            EventType(event_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid event type: {event_type}"
            )
        query = query.filter(Event.event_type == event_type)
    if user_id:
        query = query.filter(Event.user_id == user_id)

    # Order by event date descending
    return query.order_by(Event.event_date.desc()).offset(skip).limit(limit).all()


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event."""
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return event


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    user_id: int,  # Injected from frontend session
    db: Session = Depends(get_db)
):
    """Create a new event (quick logging primary use case)."""
    # Validate batch exists
    batch = db.query(PlantBatch).filter(PlantBatch.id == event.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    # Validate event type
    try:
        EventType(event.event_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid event type. Must be one of: {', '.join([e.value for e in EventType])}"
        )

    db_event = Event(
        **event.model_dump(),
        user_id=user_id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return db_event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventCreate,
    db: Session = Depends(get_db)
):
    """Update an event (notes, date, etc.)."""
    db_event = db.query(Event).filter(Event.id == event_id).first()

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Validate new event type if changed
    if event_update.event_type != db_event.event_type.value:
        try:
            EventType(event_update.event_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid event type: {event_update.event_type}"
            )

    for key, value in event_update.model_dump(exclude_unset=True).items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)

    return db_event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event."""
    db_event = db.query(Event).filter(Event.id == event_id).first()

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db.delete(db_event)
    db.commit()


@router.get("/batch/{batch_id}/timeline", response_model=list[EventResponse])
async def get_batch_timeline(batch_id: int, db: Session = Depends(get_db)):
    """Get all events for a batch in chronological order (for timeline view)."""
    batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    events = db.query(Event).filter(
        Event.batch_id == batch_id
    ).order_by(Event.event_date.asc()).all()

    return events
