from sqlalchemy.orm import Session
from app import models

def log_action(db: Session, actor_id: int, action: str, target_type: str, target_id: int, detail: str = ""):
    db.add(models.AuditLog(actor_id=actor_id, action=action, target_type=target_type, target_id=target_id, detail=detail))
    db.commit()