from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.problem import Problem
from app.models.project import Project
from app.models.project_users import project_users
from app.models.tag import Tag
from app.models.user import User
from app.schemas.problem import ProblemCreate, ProblemUpdate, ProblemResponse
from app.api.auth import get_current_user
from typing import List, Optional
from uuid import UUID

router = APIRouter()

def get_base_problem_query(db, current_user):
    q = db.query(Problem).filter(Problem.organization_id == current_user.organization_id)
    if current_user.role != "ORG_ADMIN":
        # Only show problems in projects the user is assigned to
        q = q.join(Project).join(project_users).filter(project_users.c.user_id == current_user.id)
    return q

@router.get("/")
def get_problems(
    skip: int = 0, limit: int = 20, 
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    q = get_base_problem_query(db, current_user)
    problems = q.order_by(Problem.updated_at.desc()).offset(skip).limit(limit).all()
    total = q.count()
    return {
        "items": [ProblemResponse.model_validate(p).model_copy(update={"author_username": p.creator.username if p.creator else "Unknown"}) for p in problems],
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }

@router.post("/", response_model=ProblemResponse)
def create_problem(problem: ProblemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check project access
    if problem.project_id:
        proj = db.query(Project).filter(Project.id == problem.project_id, Project.organization_id == current_user.organization_id)
        if current_user.role != "ORG_ADMIN":
            proj = proj.join(project_users).filter(project_users.c.user_id == current_user.id)
        if not proj.first():
            raise HTTPException(status_code=403, detail="Not assigned to this project or project does not exist")

    tags = []
    if problem.tags:
        for tag_name in problem.tags:
            t = db.query(Tag).filter(Tag.name == tag_name.lower()).first()
            if not t:
                t = Tag(name=tag_name.lower())
                db.add(t)
            tags.append(t)
    
    problem_data = problem.model_dump(exclude={"tags"})
    db_problem = Problem(**problem_data, created_by=current_user.id, organization_id=current_user.organization_id)
    db_problem.tags = tags
    
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

@router.get("/{problem_id}", response_model=ProblemResponse)
def get_problem(problem_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    problem = get_base_problem_query(db, current_user).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found or access denied")
    return ProblemResponse.model_validate(problem).model_copy(update={"author_username": problem.creator.username if problem.creator else "Unknown"})

@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(problem_id: UUID, problem_update: ProblemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_problem = get_base_problem_query(db, current_user).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found or access denied")
        
    if db_problem.created_by != current_user.id and current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to edit this problem")

    if problem_update.project_id:
        proj = db.query(Project).filter(Project.id == problem_update.project_id, Project.organization_id == current_user.organization_id)
        if current_user.role != "ORG_ADMIN":
            proj = proj.join(project_users).filter(project_users.c.user_id == current_user.id)
        if not proj.first():
            raise HTTPException(status_code=403, detail="Not assigned to this project or project does not exist")


    update_data = problem_update.model_dump(exclude_unset=True, exclude={"tags"})
    for key, value in update_data.items():
        setattr(db_problem, key, value)
        
    if problem_update.tags is not None:
        tags = []
        for tag_name in problem_update.tags:
            t = db.query(Tag).filter(Tag.name == tag_name.lower()).first()
            if not t:
                t = Tag(name=tag_name.lower())
                db.add(t)
            tags.append(t)
        db_problem.tags = tags

    db.commit()
    db.refresh(db_problem)
    return db_problem

@router.delete("/{problem_id}")
def delete_problem(problem_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_problem = get_base_problem_query(db, current_user).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    if db_problem.created_by != current_user.id and current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to delete this problem")
        
    db.delete(db_problem)
    db.commit()
    return {"status": "ok"}
