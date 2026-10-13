import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "EDU360 Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./edu360.db")
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

settings = Settings()
