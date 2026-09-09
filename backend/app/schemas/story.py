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
    featured: bool = False


class StoryCreate(StoryBase):
    pass


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None


class StoryOut(StoryBase):
    id: int
    created_at: datetime
    author: Optional[AuthorOut] = None
    comment_count: int = 0

    class Config:
        from_attributes = True