from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.problem import Problem
from app.models.project import Project
from app.models.project_users import project_users
from app.models.user import User
from app.schemas.problem import ProblemResponse
from app.api.auth import get_current_user
from typing import List, Optional

router = APIRouter()

@router.get("/")
def search_problems(
    q: Optional[str] = None,
    category: Optional[str] = None,
    technology: Optional[str] = None,
    environment: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Problem).filter(Problem.organization_id == current_user.organization_id)
    if current_user.role != "ORG_ADMIN":
        query = query.join(Project).join(project_users).filter(project_users.c.user_id == current_user.id)
    
    if q:
        tsquery = func.websearch_to_tsquery('english', q)
        query = query.filter(Problem.search_vector.op('@@')(tsquery))
        query = query.order_by(func.ts_rank(Problem.search_vector, tsquery).desc())
    else:
        query = query.order_by(Problem.updated_at.desc())

    if category:
        query = query.filter(Problem.category == category)
    if technology:
        query = query.filter(Problem.technology == technology)
    if environment:
        query = query.filter(Problem.environment == environment)
        
    total = query.count()
    problems = query.offset(skip).limit(limit).all()
    
    return {
        "items": [ProblemResponse.model_validate(p) for p in problems],
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }
