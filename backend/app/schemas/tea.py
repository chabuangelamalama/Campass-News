from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import AuthorOut


class TeaCreate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)


class TeaPublicOut(BaseModel):
    """Public shape: NO author information, ever. Do not add author_id here.

    This is the anonymity guarantee described in SECURITY.md — it's enforced
    by this schema shape, not by a UI choice to hide a field.
    """

    id: int
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


class TeaAdminOut(TeaPublicOut):
    """Admin-only shape: reveals who posted it. Only ever returned from a
    route protected by require_admin — see app/routers/tea.py."""

    author: Optional[AuthorOut] = None
    poster_label: str