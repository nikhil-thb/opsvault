from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserRoleUpdate
from app.core.security import get_pin_hash
from app.api.auth import get_current_user
from typing import List
import random

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return db.query(User).filter(User.organization_id == current_user.organization_id).all()

@router.post("/", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(organization_id=current_user.organization_id, 
        username=user_in.username,
        role=user_in.role,
        is_active=user_in.is_active,
        pin_hash=get_pin_hash(user_in.pin)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/{user_id}/reset-pin")
def reset_pin(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id, User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_pin = str(random.randint(1000, 9999))
    user.pin_hash = get_pin_hash(new_pin)
    db.commit()
    
    return {"message": "PIN reset successfully", "new_pin": new_pin}

@router.post("/{user_id}/disable", response_model=UserResponse)
def disable_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id, User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot disable yourself")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user

@router.post("/{user_id}/enable", response_model=UserResponse)
def enable_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id, User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: str, role_update: UserRoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id, User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    if role_update.role not in ["ORG_ADMIN", "USER"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id, User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    db.delete(user)
    db.commit()
    return {"status": "ok"}

