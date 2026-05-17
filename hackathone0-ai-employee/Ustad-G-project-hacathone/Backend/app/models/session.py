from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id           = Column(String(100), primary_key=True, index=True) # session_id
    app_name     = Column(String(100), nullable=False)
    user_id      = Column(String(100), nullable=False)
    session_data = Column(Text, nullable=False)  # JSON-serialized ADK Session Pydantic model
    updated_at   = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
