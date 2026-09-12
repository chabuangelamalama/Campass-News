from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db


from fastapi import Request
from app.core.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.Token, status_code=201)
@limiter.limit("5/minute")
def signup(request: Request, payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(400, "That username is already taken.")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(400, "That email is already registered.")

    user = models.User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=models.RoleEnum.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user)
    return schemas.Token(access_token=token, user=user)

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.username == payload.username)
        .first()
    )
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Incorrect username or password.")
    if not user.is_active:
        raise HTTPException(403, "This account has been disabled.")
    token = create_access_token(user)
    return schemas.Token(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/revoke-sessions")
def revoke_sessions(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    user.token_version += 1
    db.commit()
    return {"status": "all sessions revoked"}