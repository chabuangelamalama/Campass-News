from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AuditLogOut(BaseModel):
    id: int
    actor_id: Optional[int] = None
    action: str
    target_type: str
    target_id: int
    detail: str
    created_at: datetime

    class Config:
        from_attributes = True