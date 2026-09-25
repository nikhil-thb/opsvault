from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import datetime

class UserLogin(BaseModel):
    username: str
    pin: str

class UserSignup(BaseModel):
    organization_name: str
    username: str
    pin: str

class UserResponse(BaseModel):
    id: UUID
    organization_id: UUID
    username: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True

class PinChange(BaseModel):
    current_pin: str
    new_pin: str

class UserCreate(BaseModel):
    username: str
    pin: str
    role: str = "USER"
    is_active: bool = True

class UserRoleUpdate(BaseModel):
    role: str
