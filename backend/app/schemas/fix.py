from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class FixBase(BaseModel):
    description: str
    commands: Optional[str] = None
    configuration_changes: Optional[str] = None
    notes: Optional[str] = None

class FixCreate(FixBase):
    pass

class FixUpdate(FixBase):
    pass

class FixResponse(FixBase):
    id: UUID
    problem_id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
