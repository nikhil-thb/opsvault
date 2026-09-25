from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OpsVault"
    DATABASE_URL: str
    SESSION_SECRET: str
    ENVIRONMENT: str = "development"
    COOKIE_SECURE: bool = False
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
