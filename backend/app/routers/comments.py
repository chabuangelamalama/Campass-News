from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user
from app.database import get_db

# No shared prefix: these routes live under both /stories/{id}/comments
# and /comments/{id}, so each path is spelled out in full below.
router = APIRouter(tags=["comments"])


@router.get("/stories/{story_id}/comments", response_model=List[schemas.CommentOut])
def list_comments(story_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Comment)
        .filter(models.Comment.story_id == story_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )


@router.post(
    "/stories/{story_id}/comments",
    response_model=schemas.CommentOut,
    status_code=201,
)
def create_comment(
    story_id: int,
    payload: schemas.CommentCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(404, "Story not found.")
    comment = models.Comment(body=payload.body, story_id=story_id, author_id=user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    if story.author_id and story.author_id != user.id:
        db.add(models.Notification(
            recipient_id=story.author_id,
            message=f'{user.username} commented on your story "{story.title}"',
            story_id=story.id,
        ))
        db.commit()
    return comment


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(404, "Comment not found.")
    if comment.author_id != user.id and user.role.value != "admin":
        raise HTTPException(403, "You can only delete your own comments.")
    db.delete(comment)
    db.commit()

