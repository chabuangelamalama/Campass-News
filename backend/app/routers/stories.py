from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user, require_editor_or_admin
from app.database import get_db
from app.core.security import get_current_user, get_current_user_optional, require_editor_or_admin

router = APIRouter(prefix="/stories", tags=["stories"])


def _story_out(story: models.Story) -> schemas.StoryOut:
    out = schemas.StoryOut.model_validate(story)
    out.comment_count = len(story.comments)
    return out


@router.get("", response_model=List[schemas.StoryOut])
def list_stories(category: Optional[str] = None, db: Session = Depends(get_db)):
   
    q = db.query(models.Story).filter(models.Story.status == "published")
    if category:
        q = q.filter(models.Story.category == category)
    return [_story_out(s) for s in q.order_by(models.Story.created_at.desc()).all()]


@router.get("/pending", response_model=List[schemas.StoryOut])
def list_pending(db: Session = Depends(get_db), user: models.User = Depends(require_editor_or_admin)):
    q = db.query(models.Story).filter(models.Story.status == "pending")
    return [_story_out(s) for s in q.order_by(models.Story.created_at.asc()).all()]


@router.get("/mine", response_model=List[schemas.StoryOut])
def list_my_submissions(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    q = db.query(models.Story).filter(models.Story.author_id == user.id)
    return [_story_out(s) for s in q.order_by(models.Story.created_at.desc()).all()]


@router.get("/{story_id}", response_model=schemas.StoryOut)
def get_story(story_id: int, db: Session = Depends(get_db),
              user: Optional[models.User] = Depends(get_current_user_optional)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(404, "Story not found.")
  
    if story.status != "published":
        is_owner = user and user.id == story.author_id
        is_mod = user and user.role.value in ("editor", "admin")
        if not (is_owner or is_mod):
            raise HTTPException(404, "Story not found.")
    return _story_out(story)


@router.post("", response_model=schemas.StoryOut, status_code=201)
def create_story(
    payload: schemas.StoryCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),  # any signed-in user, not just editor/admin
):
    # Editors/admins publish immediately; everyone else goes into the queue
    initial_status = "published" if user.role.value in ("editor", "admin") else "pending"
    story = models.Story(**payload.model_dump(), author_id=user.id, status=initial_status)
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


@router.put("/{story_id}/status", response_model=schemas.StoryOut)
def set_story_status(
    story_id: int,
    payload: schemas.StoryStatusUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_editor_or_admin),
):
    if payload.status not in ("published", "rejected", "pending"):
        raise HTTPException(400, "Status must be 'published', 'rejected', or 'pending'.")
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(404, "Story not found.")
    story.status = payload.status
    db.commit()
    db.refresh(story)

    if payload.status == "published" and story.author_id:
        db.add(models.Notification(
            recipient_id=story.author_id,
            message=f'Your story "{story.title}" was approved and is now live!',
            story_id=story.id,
        ))

    story.status = payload.status
    db.commit()
    db.refresh(story)
    log_action(db, user.id, "story_status_change", "story", story.id, f"set to {payload.status}")
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