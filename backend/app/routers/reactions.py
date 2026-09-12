from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.core.security import get_current_user, get_current_user_optional
from app.database import get_db

router = APIRouter(prefix="/reactions", tags=["reactions"])
ALLOWED_EMOJIS = {"🔥", "😂", "❤️", "😮", "👏", "👍🏽", "👍🏻", "👎🏽","👎🏻", "🥹", "👀", "☕", "🫖"}

def _counts(target_type, target_id, db, user):
    rows = db.query(models.Reaction).filter(
        models.Reaction.target_type == target_type,
        models.Reaction.target_id == target_id,
    ).all()
    counts, mine = {}, None
    for r in rows:
        counts[r.emoji] = counts.get(r.emoji, 0) + 1
        if user and r.user_id == user.id:
            mine = r.emoji
    return schemas.ReactionCounts(target_type=target_type, target_id=target_id, counts=counts, my_reaction=mine)

@router.get("", response_model=schemas.ReactionCounts)
def get_reactions(target_type: str, target_id: int, db: Session = Depends(get_db),
                   user: Optional[models.User] = Depends(get_current_user_optional)):
    return _counts(target_type, target_id, db, user)

@router.post("", response_model=schemas.ReactionCounts)
def set_reaction(payload: schemas.ReactionCreate, db: Session = Depends(get_db),
                  user: models.User = Depends(get_current_user)):
    if payload.emoji not in ALLOWED_EMOJIS:
        raise HTTPException(400, "That emoji isn't supported.")
    existing = db.query(models.Reaction).filter(
        models.Reaction.user_id == user.id,
        models.Reaction.target_type == payload.target_type,
        models.Reaction.target_id == payload.target_id,
    ).first()
    if existing:
        if existing.emoji == payload.emoji:
            db.delete(existing)  # tapping the same emoji again removes it
        else:
            existing.emoji = payload.emoji
    else:
        db.add(models.Reaction(**payload.model_dump(), user_id=user.id))
    db.commit()
    return _counts(payload.target_type, payload.target_id, db, user)