from pydantic import BaseModel
from uuid import UUID

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: UUID

    class Config:
        from_attributes = True
