from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.fix import Fix
from app.models.problem import Problem
from app.models.user import User
from app.schemas.fix import FixCreate, FixUpdate, FixResponse
from app.api.auth import get_current_user
from uuid import UUID

router = APIRouter()

@router.post("/problems/{problem_id}/fixes", response_model=FixResponse)
def create_fix(problem_id: UUID, fix: FixCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    db_fix = Fix(**fix.model_dump(), problem_id=problem_id, created_by=current_user.id)
    db.add(db_fix)
    db.commit()
    db.refresh(db_fix)
    return db_fix

@router.put("/fixes/{fix_id}", response_model=FixResponse)
def update_fix(fix_id: UUID, fix_update: FixUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_fix = db.query(Fix).filter(Fix.id == fix_id).first()
    if not db_fix:
        raise HTTPException(status_code=404, detail="Fix not found")
        
    if db_fix.created_by != current_user.id and current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = fix_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fix, key, value)

    db.commit()
    db.refresh(db_fix)
    return db_fix

@router.delete("/fixes/{fix_id}")
def delete_fix(fix_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_fix = db.query(Fix).filter(Fix.id == fix_id).first()
    if not db_fix:
        raise HTTPException(status_code=404, detail="Fix not found")
        
    if db_fix.created_by != current_user.id and current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(db_fix)
    db.commit()
    return {"status": "ok"}
