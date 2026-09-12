from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.user import AuthorOut

class YearbookEntryCreate(BaseModel):
    year: int = Field(ge=2000, le=2100)
    image_url: str
    caption: str = ""

class YearbookEntryOut(BaseModel):
    id: int
    year: int
    image_url: str
    caption: str
    created_at: datetime
    author: AuthorOut

    class Config:
        from_attributes = True