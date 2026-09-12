from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class NotificationOut(BaseModel):
    id: int
    message: str
    story_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True