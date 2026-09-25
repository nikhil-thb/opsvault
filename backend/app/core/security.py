from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    return pwd_context.verify(plain_pin, hashed_pin)

def get_pin_hash(pin: str) -> str:
    return pwd_context.hash(pin)

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)
