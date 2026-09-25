from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from app.db.base import Base
from app.models.project_users import project_users

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    technology = Column(String, nullable=True)
    repository_url = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization")
    creator = relationship("User")
    users = relationship("User", secondary=project_users, back_populates="projects")
    problems = relationship("Problem", back_populates="project")
