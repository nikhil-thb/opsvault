from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    technology: Optional[str] = None
    repository_url: Optional[str] = None
    status: str = "ACTIVE"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
