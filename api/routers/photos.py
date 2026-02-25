"""Photo upload and management endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
import shutil

from database import get_db
from models import Photo, PlantBatch, Event
from schemas import PhotoCreate, PhotoResponse

router = APIRouter(prefix="/photos", tags=["photos"])

# Photo storage directory
PHOTOS_DIR = Path(__file__).parent.parent / "photos"
PHOTOS_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.get("/", response_model=list[PhotoResponse])
async def list_photos(
    batch_id: Optional[int] = None,
    event_id: Optional[int] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List photos with optional filters."""
    query = db.query(Photo)

    if batch_id:
        query = query.filter(Photo.batch_id == batch_id)
    if event_id:
        query = query.filter(Photo.event_id == event_id)
    if user_id:
        query = query.filter(Photo.user_id == user_id)

    return query.order_by(Photo.taken_at.desc()).offset(skip).limit(limit).all()


@router.get("/{photo_id}", response_model=PhotoResponse)
async def get_photo(photo_id: int, db: Session = Depends(get_db)):
    """Get a specific photo record."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )

    return photo


@router.post("/upload", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    batch_id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = None,
    event_id: Optional[int] = None,
    user_id: int = None,  # Injected from session
    db: Session = Depends(get_db)
):
    """Upload a photo for a plant batch."""
    # Validate batch exists
    batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    # Validate event if provided
    if event_id:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event or event.batch_id != batch_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found or doesn't belong to this batch"
            )

    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Must be: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024:.1f} MB"
        )

    # Generate unique filename
    unique_id = uuid.uuid4().hex
    new_filename = f"{unique_id}{file_ext}"
    file_path = PHOTOS_DIR / new_filename

    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Create database record
    photo = Photo(
        batch_id=batch_id,
        event_id=event_id,
        user_id=user_id,
        filename=new_filename,
        caption=caption
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


@router.put("/{photo_id}", response_model=PhotoResponse)
async def update_photo(
    photo_id: int,
    caption: Optional[str] = None,
    taken_at: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update photo metadata (caption, taken_at)."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )

    if caption is not None:
        photo.caption = caption
    if taken_at is not None:
        from datetime import datetime
        try:
            photo.taken_at = datetime.fromisoformat(taken_at)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid datetime format"
            )

    db.commit()
    db.refresh(photo)

    return photo


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    """Delete a photo (removes from database and storage)."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )

    # Delete file from storage
    file_path = PHOTOS_DIR / photo.filename
    try:
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        # Log but don't fail - database record gets deleted
        print(f"Warning: Failed to delete file {photo.filename}: {e}")

    # Delete database record
    db.delete(photo)
    db.commit()


@router.get("/batch/{batch_id}/gallery", response_model=list[PhotoResponse])
async def get_batch_gallery(batch_id: int, db: Session = Depends(get_db)):
    """Get all photos for a batch, ordered by date (for gallery/timeline view)."""
    batch = db.query(PlantBatch).filter(PlantBatch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant batch not found"
        )

    photos = db.query(Photo).filter(
        Photo.batch_id == batch_id
    ).order_by(Photo.taken_at.desc(), Photo.created_at.desc()).all()

    return photos
