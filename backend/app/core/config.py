import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# On Vercel / serverless runtime, filesystem outside /tmp is read-only.
IS_VERCEL = bool(os.getenv("VERCEL"))
if IS_VERCEL:
    DEFAULT_DB_FILE = "/tmp/memora.db"
    source_db = BASE_DIR / "memora.db"
    if source_db.exists() and not os.path.exists(DEFAULT_DB_FILE):
        try:
            import shutil
            shutil.copyfile(source_db, DEFAULT_DB_FILE)
        except Exception:
            pass
    DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_FILE}"
    DEFAULT_DATA_DIR = Path("/tmp/data")
else:
    DEFAULT_DB_URL = f"sqlite:///{BASE_DIR}/memora.db"
    DEFAULT_DATA_DIR = BASE_DIR / "data"

class Settings(BaseSettings):
    PROJECT_NAME: str = "MEMORA AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Storage & Persistence
    DATABASE_URL: str = DEFAULT_DB_URL
    DATA_DIR: Path = DEFAULT_DATA_DIR
    
    # LLM & Embeddings Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    USE_LOCAL_EMBEDDINGS: bool = True
    
    # Memory Decay & Retrieval Parameters (6-factor scoring)
    DEFAULT_DECAY_RATE: float = 0.05       # lambda for e^(-lambda * dt)
    RETRIEVAL_SIMILARITY_THRESHOLD: float = 0.35
    HYBRID_GRAPH_ALPHA: float = 0.55       # Weight between vector similarity (alpha) and graph score (1-alpha)
    WORKING_MEMORY_WINDOW: int = 6        # Recent conversational turns kept active
    
    # Demo & Research Defaults
    DEFAULT_USER_ID: str = "researcher_trishna"
    
    class Config:
        env_file = ".env"
        extra = "allow"

# Ensure data dir exists
os.makedirs(DEFAULT_DATA_DIR, exist_ok=True)
settings = Settings()
