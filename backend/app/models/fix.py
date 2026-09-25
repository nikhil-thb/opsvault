from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from app.db.base import Base

class Fix(Base):
    __tablename__ = "fixes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"))
    description = Column(Text, nullable=False)
    commands = Column(Text, nullable=True)
    configuration_changes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User")
    problem = relationship("Problem", back_populates="fixes")
