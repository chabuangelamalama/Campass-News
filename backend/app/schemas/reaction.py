from typing import Optional, Dict
from pydantic import BaseModel, Field

class ReactionCreate(BaseModel):
    target_type: str = Field(pattern="^(story|comment|tea)$")
    target_id: int
    emoji: str

class ReactionCounts(BaseModel):
    target_type: str
    target_id: int
    counts: Dict[str, int]
    my_reaction: Optional[str] = None