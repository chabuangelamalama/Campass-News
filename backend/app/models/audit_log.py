from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)       # e.g. "role_change", "story_status_change"
    target_type = Column(String(50), nullable=False)   # "user", "story", "comment", "tea"
    target_id = Column(Integer, nullable=False)
    detail = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    actor = relationship("User")