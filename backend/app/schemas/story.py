from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import AuthorOut


class StoryBase(BaseModel):
    title: str
    category: str = "Announcement"
    summary: str = ""
    body: str
    image_url: str = ""


class StoryCreate(StoryBase):
    pass  # students submit these fields only — no featured, no status


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None


class StoryStatusUpdate(BaseModel):
    status: str  # "published" or "rejected"


class StoryOut(StoryBase):
    id: int
    featured: bool
    status: str
    created_at: datetime
    author: Optional[AuthorOut] = None
    comment_count: int = 0

    class Config:
        from_attributes = True