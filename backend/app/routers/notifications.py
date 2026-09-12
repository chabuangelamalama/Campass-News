from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[schemas.NotificationOut])
def list_notifications(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Notification).filter(
        models.Notification.recipient_id == user.id
    ).order_by(models.Notification.created_at.desc()).limit(50).all()

@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    count = db.query(models.Notification).filter(
        models.Notification.recipient_id == user.id, models.Notification.is_read == False
    ).count()
    return {"count": count}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.recipient_id == user.id, models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}