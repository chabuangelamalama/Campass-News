from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Reaction(Base):
    __tablename__ = "reactions"
    __table_args__ = (
        UniqueConstraint("user_id", "target_type", "target_id", name="uq_reaction_per_user_target"),
    )
    id = Column(Integer, primary_key=True, index=True)
    target_type = Column(String(20), nullable=False)  # "story" or "comment"
    target_id = Column(Integer, nullable=False)
    emoji = Column(String(8), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")