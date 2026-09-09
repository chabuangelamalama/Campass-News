from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user_optional, require_admin
from app.database import get_db

router = APIRouter(prefix="/tea", tags=["tea"])


@router.get("", response_model=List[schemas.TeaPublicOut])
def list_tea_public(db: Session = Depends(get_db)):
    """Public wall. TeaPublicOut has no author field at all, so there is
    nothing to leak here even by accident — see SECURITY.md."""
    posts = db.query(models.Tea).order_by(models.Tea.created_at.desc()).all()
    return posts


@router.post("", response_model=schemas.TeaPublicOut, status_code=201)
def post_tea(
    payload: schemas.TeaCreate,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_current_user_optional),
):
    # We record who posted it (if logged in) purely for admin moderation.
    # This is never exposed through the public schema above.
    post = models.Tea(text=payload.text, author_id=user.id if user else None)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/admin", response_model=List[schemas.TeaAdminOut])
def list_tea_admin(
    db: Session = Depends(get_db), user: models.User = Depends(require_admin)
):
    posts = db.query(models.Tea).order_by(models.Tea.created_at.desc()).all()
    results = []
    for p in posts:
        label = p.author.username if p.author else "Unregistered visitor"
        results.append(
            schemas.TeaAdminOut(
                id=p.id,
                text=p.text,
                created_at=p.created_at,
                author=p.author,
                poster_label=label,
            )
        )
    return results


@router.delete("/{tea_id}", status_code=204)
def delete_tea(
    tea_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_admin),
):
    post = db.query(models.Tea).filter(models.tea.id == tea_id).first()
    if not post:
        raise HTTPException(404, "Post not found.")
    db.delete(post)
    db.commit()