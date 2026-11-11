from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.core.database import get_db
from app.models.schemas import FullGraphResponse
from app.graph.kg_store import kg_engine

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

class NodeCreateBody(BaseModel):
    name: str
    entity_type: str = "Concept"
    description: str = ""
    properties: Dict[str, Any] = {}

class EdgeCreateBody(BaseModel):
    source_id: str
    target_id: str
    relation_type: str
    weight: float = 1.0
    evidence: str = ""

@router.get("/full", response_model=FullGraphResponse)
def get_full_graph(db: Session = Depends(get_db)):
    kg_engine.load_from_db(db)
    kg_engine.seed_initial_knowledge(db)
    return kg_engine.get_full_graph()

@router.get("/subgraph")
def get_subgraph(node_id: str, depth: int = 1, db: Session = Depends(get_db)):
    kg_engine.load_from_db(db)
    return kg_engine.get_subgraph_by_seeds([node_id], depth=depth)

@router.post("/node")
def create_node(body: NodeCreateBody, db: Session = Depends(get_db)):
    node_id = kg_engine.add_node(
        db,
        name=body.name,
        entity_type=body.entity_type,
        description=body.description,
        properties=body.properties
    )
    return {"status": "success", "node_id": node_id}

@router.post("/edge")
def create_edge(body: EdgeCreateBody, db: Session = Depends(get_db)):
    edge_id = kg_engine.add_edge(
        db,
        source_id=body.source_id,
        target_id=body.target_id,
        relation_type=body.relation_type,
        weight=body.weight,
        evidence=body.evidence
    )
    return {"status": "success", "edge_id": edge_id}
