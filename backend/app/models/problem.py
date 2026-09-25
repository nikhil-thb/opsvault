from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Table
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship
import uuid
import datetime
from sqlalchemy.orm import relationship
from app.db.base import Base

problem_tags = Table(
    "problem_tags",
    Base.metadata,
    Column("problem_id", UUID(as_uuid=True), ForeignKey("problems.id"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id"), primary_key=True),
)

class Problem(Base):
    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    environment = Column(String)
    category = Column(String, nullable=False)
    status = Column(String, default="OPEN")
    
    # Existing fields
    investigation = Column(Text)
    root_cause = Column(Text)
    
    # New P0 Fields
    symptoms = Column(Text)
    technology = Column(String)
    prevention = Column(Text)
    references = Column(Text)
    
    # Search Vector
    search_vector = Column(TSVECTOR)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    tags = relationship("Tag", secondary=problem_tags)
    fixes = relationship("Fix")
    project = relationship("Project", back_populates="problems")
    organization = relationship("Organization")
    creator = relationship("User", foreign_keys=[created_by])
