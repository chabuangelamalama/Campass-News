from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import RoleEnum


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True


class RoleUpdate(BaseModel):
    role: RoleEnum


class AuthorOut(BaseModel):
    """Minimal public-safe user shape, embedded in stories/comments."""

    id: int
    username: str

    class Config:
        from_attributes = True