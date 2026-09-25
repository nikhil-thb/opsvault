from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_pin_hash

db = SessionLocal()
try:
    if not db.query(User).filter_by(username="admin").first():
        admin = User(
            username="admin",
            pin_hash=get_pin_hash("1234"),
            role="ORG_ADMIN"
        )
        db.add(admin)
        db.commit()
        print("Seed data inserted.")
    else:
        print("Seed data already exists.")
finally:
    db.close()
