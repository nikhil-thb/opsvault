from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.models.project_users import project_users
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.api.auth import get_current_user
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "ORG_ADMIN":
        return db.query(Project).filter(Project.organization_id == current_user.organization_id).all()
    else:
        return db.query(Project).join(project_users).filter(
            Project.organization_id == current_user.organization_id,
            project_users.c.user_id == current_user.id
        ).all()

@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create projects")
    
    db_project = Project(**project.model_dump(), created_by=current_user.id, organization_id=current_user.organization_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Project).filter(Project.organization_id == current_user.organization_id).filter(Project.id == project_id)
    if current_user.role != "ORG_ADMIN":
        q = q.join(project_users).filter(project_users.c.user_id == current_user.id)
    project = q.first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, project_update: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can edit projects")
    
    project = db.query(Project).filter(Project.organization_id == current_user.organization_id).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for k, v in project_update.model_dump().items():
        setattr(project, k, v)
    
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}/users")
def get_project_users(project_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage project users")
    project = db.query(Project).filter(Project.organization_id == current_user.organization_id).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return [{"id": u.id, "username": u.username} for u in project.users]

@router.post("/{project_id}/users/{user_id}")
def add_project_user(project_id: UUID, user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage project users")
    project = db.query(Project).filter(Project.organization_id == current_user.organization_id).filter(Project.id == project_id).first()
    user = db.query(User).filter(User.organization_id == current_user.organization_id).filter(User.id == user_id).first()
    if not project or not user:
        raise HTTPException(status_code=404, detail="Not found")
    
    if user not in project.users:
        project.users.append(user)
        db.commit()
    return {"status": "ok"}

@router.delete("/{project_id}/users/{user_id}")
def remove_project_user(project_id: UUID, user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ORG_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage project users")
    project = db.query(Project).filter(Project.organization_id == current_user.organization_id).filter(Project.id == project_id).first()
    user = db.query(User).filter(User.organization_id == current_user.organization_id).filter(User.id == user_id).first()
    if not project or not user:
        raise HTTPException(status_code=404, detail="Not found")
    
    if user in project.users:
        project.users.remove(user)
        db.commit()
    return {"status": "ok"}
