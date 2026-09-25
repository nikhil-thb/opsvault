from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization
from app.models.session import Session as DBSession
from app.schemas.user import UserLogin, UserSignup, UserResponse, PinChange
from app.core.security import verify_pin, get_pin_hash, generate_session_token
import datetime

router = APIRouter()

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    session_obj = db.query(DBSession).filter(DBSession.token == token).first()
    if not session_obj or session_obj.expires_at < datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    
    user = db.query(User).filter(User.id == session_obj.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive")
    
    return user

@router.post("/signup", response_model=UserResponse)
def signup_org_admin(user_in: UserSignup, response: Response, db: Session = Depends(get_db)):
    # Check if org exists
    org = db.query(Organization).filter(Organization.name == user_in.organization_name).first()
    if org:
        raise HTTPException(status_code=400, detail="Organization already exists. Ask your admin to add you.")
    
    # Create org
    org = Organization(name=user_in.organization_name)
    db.add(org)
    db.commit()
    db.refresh(org)

    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already taken.")

    admin_user = User(
        organization_id=org.id,
        username=user_in.username,
        pin_hash=get_pin_hash(user_in.pin),
        role="ORG_ADMIN"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    # Auto log them in
    token = generate_session_token()
    expires = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
    new_session = DBSession(token=token, user_id=admin_user.id, expires_at=expires.replace(tzinfo=None))
    db.add(new_session)
    admin_user.last_login_at = datetime.datetime.utcnow()
    db.commit()

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        expires=expires
    )
    return admin_user

failed_login_attempts = {}

@router.post("/login", response_model=UserResponse)
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    username = login_data.username
    now = datetime.datetime.utcnow()
    
    for k in list(failed_login_attempts.keys()):
        if now - failed_login_attempts[k]["last_attempt"] > datetime.timedelta(minutes=15):
            del failed_login_attempts[k]
            
    if username in failed_login_attempts:
        if failed_login_attempts[username]["count"] >= 5:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_pin(login_data.pin, user.pin_hash):
        if username not in failed_login_attempts:
            failed_login_attempts[username] = {"count": 1, "last_attempt": now}
        else:
            failed_login_attempts[username]["count"] += 1
            failed_login_attempts[username]["last_attempt"] = now
            
        raise HTTPException(status_code=401, detail="Invalid username or PIN.")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid username or PIN.")

    if username in failed_login_attempts:
        del failed_login_attempts[username]

    token = generate_session_token()
    expires = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
    
    new_session = DBSession(token=token, user_id=user.id, expires_at=expires.replace(tzinfo=None))
    db.add(new_session)
    user.last_login_at = datetime.datetime.utcnow()
    db.commit()

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        expires=expires
    )
    return user

@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if token:
        db.query(DBSession).filter(DBSession.token == token).delete()
        db.commit()
    response.delete_cookie("session_token")
    return {"status": "ok"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/reset-pin")
def reset_pin(pin_data: PinChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_pin(pin_data.current_pin, current_user.pin_hash):
        raise HTTPException(status_code=400, detail="Invalid current PIN.")
    
    current_user.pin_hash = get_pin_hash(pin_data.new_pin)
    db.commit()
    return {"status": "ok"}
