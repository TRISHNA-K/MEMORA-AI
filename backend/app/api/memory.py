from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.schemas import MemoryOverviewStats, MemoryItemResponse
from app.memory.manager import memory_manager

router = APIRouter(prefix="/memory", tags=["Memory Management"])

class MemoryUpdateBody(BaseModel):
    content: str
    importance: float
    category: str

@router.get("/overview", response_model=MemoryOverviewStats)
def get_overview(user_id: str = "researcher_trishna", db: Session = Depends(get_db)):
    return memory_manager.get_memory_overview(db, user_id=user_id)

@router.get("/list", response_model=List[MemoryItemResponse])
def get_memories_list(
    user_id: str = "researcher_trishna",
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return memory_manager.get_all_memories(db, user_id=user_id, category=category, search_query=search)

@router.post("/consolidate")
def run_memory_consolidation(user_id: str = "researcher_trishna", db: Session = Depends(get_db)):
    return memory_manager.run_consolidation(db, user_id=user_id)

@router.put("/{memory_id}")
def update_memory_item(
    memory_id: str,
    body: MemoryUpdateBody,
    user_id: str = "researcher_trishna",
    db: Session = Depends(get_db)
):
    success = memory_manager.update_memory(
        db, memory_id=memory_id, user_id=user_id,
        content=body.content, importance=body.importance, category=body.category
    )
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found")
    return {"status": "success", "memory_id": memory_id}

@router.delete("/{memory_id}")
def delete_memory_item(
    memory_id: str,
    user_id: str = "researcher_trishna",
    db: Session = Depends(get_db)
):
    success = memory_manager.delete_memory(db, memory_id=memory_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found")
    return {"status": "success", "deleted_id": memory_id}
