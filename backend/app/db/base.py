from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models here for Alembic auto-discovery
from app.models.organization import Organization
from app.models.user import User
from app.models.session import Session
from app.models.project import Project
from app.models.project_users import project_users
from app.models.problem import Problem, problem_tags
from app.models.category import Category
from app.models.tag import Tag
from app.models.fix import Fix
