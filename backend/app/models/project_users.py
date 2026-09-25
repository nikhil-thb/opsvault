from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

project_users = Table(
    "project_users",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)
