from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user, require_admin
from app.core.uploads import upload_image
from app.database import get_db

router = APIRouter(prefix="/yearbook", tags=["yearbook"])

MAX_UPLOAD_SIZE = 8 * 1024 * 1024  # 8MB


@router.get("/{year}", response_model=List[schemas.YearbookEntryOut])
def list_year(
    year: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),  # sign-in required to VIEW too
):
    return (
        db.query(models.YearbookEntry)
        .filter(models.YearbookEntry.year == year)
        .order_by(models.YearbookEntry.created_at.desc())
        .all()
    )


@router.get("/years/list", response_model=List[int])
def list_available_years(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    rows = db.query(models.YearbookEntry.year).distinct().all()
    return sorted({r[0] for r in rows}, reverse=True)

@router.post("", response_model=schemas.YearbookEntryOut, status_code=201)
async def upload_entry(
    year: int = Form(...),
    caption: str = Form(""),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if image.content_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        raise HTTPException(400, "Please upload a JPEG, PNG, WEBP, or GIF image.")

    contents = await image.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(400, "Image is too large (max 8MB).")

    image_url = upload_image(contents)

    entry = models.YearbookEntry(
        year=year, image_url=image_url, caption=caption, author_id=user.id
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    entry = db.query(models.YearbookEntry).filter(models.YearbookEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(404, "Entry not found.")
    if entry.author_id != user.id and user.role.value != "admin":
        raise HTTPException(403, "You can only delete your own uploads.")
    db.delete(entry)
    db.commit()