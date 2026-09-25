from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.category import Category
from app.models.user import User
from app.api.auth import get_current_user
from pydantic import BaseModel, ConfigDict
import uuid
from typing import List

router = APIRouter()

class CategoryCreate(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    organization_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Category).filter(Category.organization_id == current_user.organization_id).all()

@router.post("/", response_model=CategoryResponse)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    existing = db.query(Category).filter(
        Category.organization_id == current_user.organization_id,
        Category.name == category_in.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
        
    category = Category(
        name=category_in.name,
        organization_id=current_user.organization_id
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.organization_id == current_user.organization_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    db.delete(category)
    db.commit()
    return {"ok": True}
