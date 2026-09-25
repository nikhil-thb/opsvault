"""Add search vector trigger

Revision ID: bf2d340582e9
Revises: e95d42fa2467
Create Date: 2026-09-25 06:54:27.697981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf2d340582e9'
down_revision: Union[str, Sequence[str], None] = 'e95d42fa2467'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.symptoms, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.investigation, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.root_cause, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.prevention, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.technology, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'D');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON problems FOR EACH ROW EXECUTE PROCEDURE update_search_vector();
    
    CREATE INDEX idx_problems_search_vector ON problems USING GIN(search_vector);
    """)
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
