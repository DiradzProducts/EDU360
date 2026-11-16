import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Explicitly load backend/.env
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_file = os.path.join(backend_root, ".env")
if os.path.exists(env_file):
    load_dotenv(dotenv_path=env_file, override=True)

class Settings(BaseModel):
    APP_NAME: str = "EDU360 Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")  # No SQLite fallback; PostgreSQL is required
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    LIVEKIT_URL: str = os.getenv("LIVEKIT_URL", "wss://demo.livekit.cloud")
    LIVEKIT_API_KEY: str = os.getenv("LIVEKIT_API_KEY", "devkey")
    LIVEKIT_API_SECRET: str = os.getenv("LIVEKIT_API_SECRET", "secret")

def get_livekit_config() -> dict:
    if os.path.exists(env_file):
        load_dotenv(dotenv_path=env_file, override=True)
    return {
        "url": os.getenv("LIVEKIT_URL", "wss://demo.livekit.cloud").strip(),
        "api_key": os.getenv("LIVEKIT_API_KEY", "devkey").strip(),
        "api_secret": os.getenv("LIVEKIT_API_SECRET", "secret").strip()
    }

def get_current_gemini_key() -> str:
    """Dynamically get the GEMINI_API_KEY, re-checking .env so runtime edits take effect immediately."""
    if os.path.exists(env_file):
        load_dotenv(dotenv_path=env_file, override=True)
    return os.getenv("GEMINI_API_KEY", "").strip()

def get_current_gemini_model() -> str:
    """Dynamically get the GEMINI_MODEL, re-checking .env so runtime edits take effect immediately."""
    if os.path.exists(env_file):
        load_dotenv(dotenv_path=env_file, override=True)
    return os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip() or "gemini-1.5-flash"

settings = Settings()


