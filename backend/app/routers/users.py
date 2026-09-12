from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_admin
from app.database import get_db
from app.core.audit import log_action

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    return db.query(models.User).order_by(models.User.created_at.asc()).all()


@router.put("/{user_id}/role", response_model=schemas.UserOut)
def set_user_role(
    user_id: int,
    payload: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(require_admin),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:

        raise HTTPException(404, "User not found.")
    
    old_role = target.role.value
    target.role = payload.role

    db.commit()
    log_action(db, admin_user.id, "role_change", "user", target.id, f"{old_role} -> {payload.role.value}")
    return target


@router.get("/audit-log", response_model=List[schemas.AuditLogOut])
def get_audit_log(db: Session = Depends(get_db), user: models.User = Depends(require_admin)):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(200).all()