from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from .tag import TagResponse
from .fix import FixResponse

class ProblemBase(BaseModel):
    title: str
    description: str
    environment: Optional[str] = None
    category: str
    status: str = "OPEN"
    investigation: Optional[str] = None
    root_cause: Optional[str] = None
    symptoms: Optional[str] = None
    technology: Optional[str] = None
    prevention: Optional[str] = None
    references: Optional[str] = None

class ProblemCreate(ProblemBase):
    project_id: UUID
    tags: Optional[List[str]] = []

class ProblemUpdate(ProblemBase):
    tags: Optional[List[str]] = None

class ProblemResponse(ProblemBase):
    id: UUID
    project_id: UUID
    created_by: UUID
    author_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse]
    fixes: List[FixResponse] = []

    class Config:
        from_attributes = True
