from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
