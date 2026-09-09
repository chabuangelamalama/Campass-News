from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.user import AuthorOut


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class CommentOut(BaseModel):
    id: int
    body: str
    created_at: datetime
    author: AuthorOut

    class Config:
        from_attributes = True