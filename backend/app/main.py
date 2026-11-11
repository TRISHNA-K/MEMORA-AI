import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.chat import router as chat_router
from app.api.memory import router as memory_router
from app.api.graph import router as graph_router
from app.api.experiments import router as exp_router
from app.api.user import router as user_router
from app.memory.manager import memory_manager
from app.graph.kg_store import kg_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("memora")

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        logger.info("Initializing MEMORA AI Cognitive Engine...")
        memory_manager.ensure_default_user(db, settings.DEFAULT_USER_ID)
        kg_engine.seed_initial_knowledge(db)
        kg_engine.load_from_db(db)
        logger.info("Knowledge Graph and Memory Stores successfully initialized.")
    except Exception as e:
        logger.error(f"Startup initialization warning: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A Human-Centered AI System with Long-Term Memory, GraphRAG, and Adaptive Personalization (Microsoft Research Flagship)",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(memory_router, prefix=settings.API_PREFIX)
app.include_router(graph_router, prefix=settings.API_PREFIX)
app.include_router(exp_router, prefix=settings.API_PREFIX)
app.include_router(user_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "target": "Microsoft Research Flagship Cognitive AI System"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "memora-backend"}
