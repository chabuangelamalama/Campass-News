from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Tea(Base):
    __tablename__ = "tea"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

   
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    author = relationship("User", back_populates="tea_posts")