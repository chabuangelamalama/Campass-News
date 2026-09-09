from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_editor_or_admin
from app.database import get_db

router = APIRouter(prefix="/stories", tags=["stories"])


def _story_out(story: models.Story) -> schemas.StoryOut:
    out = schemas.StoryOut.model_validate(story)
    out.comment_count = len(story.comments)
    return out


@router.get("", response_model=List[schemas.StoryOut])
def list_stories(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Story).order_by(models.Story.created_at.desc())
    if category:
        q = q.filter(models.Story.category == category)
    return [_story_out(s) for s in q.all()]


@router.get("/{story_id}", response_model=schemas.StoryOut)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(404, "Story not found.")
    return _story_out(story)


@router.post("", response_model=schemas.StoryOut, status_code=201)
def create_story(
    payload: schemas.StoryCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_editor_or_admin),
):
    story = models.Story(**payload.model_dump(), author_id=user.id)
    db.add(story)
    db.commit()
    db.refresh(story)
    return _story_out(story)


@router.put("/{story_id}", response_model=schemas.StoryOut)
def update_story(
    story_id: int,
    payload: schemas.StoryUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_editor_or_admin),
):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(404, "Story not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(story, field, value)
    db.commit()
    db.refresh(story)
    return _story_out(story)


@router.delete("/{story_id}", status_code=204)
def delete_story(
    story_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_editor_or_admin),
):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(404, "Story not found.")
    db.delete(story)
    db.commit()