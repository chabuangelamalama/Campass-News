from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    category = Column(String(50), default="Announcement")
    summary = Column(String(500), default="")
    body = Column(Text, nullable=False)
    image_url = Column(String(500), default="")
    featured = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="stories")
    comments = relationship(
        "Comment", back_populates="story", cascade="all, delete-orphan"
    )