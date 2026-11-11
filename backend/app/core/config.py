import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "MEMORA AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Storage & Persistence
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/memora.db"
    DATA_DIR: Path = BASE_DIR / "data"
    
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
os.makedirs(BASE_DIR / "data", exist_ok=True)
settings = Settings()
