from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import ChatRequest, ChatResponse
from app.agent.orchestrator import orchestrator

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
def handle_chat_message(req: ChatRequest, db: Session = Depends(get_db)):
    result = orchestrator.execute_turn(
        db=db,
        message=req.message,
        user_id=req.user_id or "researcher_trishna",
        session_id=req.session_id or "default_session",
        mode=req.mode,
        retrieval_strategy=req.retrieval_strategy or "hybrid_graphrag",
        personalization_enabled=req.personalization_enabled
    )
    return result
