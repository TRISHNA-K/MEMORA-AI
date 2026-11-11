from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.schemas import ExperimentReport
from app.evaluation.harness import experiment_harness

router = APIRouter(prefix="/experiments", tags=["Research Experiments"])

class CustomRunBody(BaseModel):
    experiment_id: str # "exp1_memory", "exp2_graphrag", "exp3_personalization"
    query: Optional[str] = None
    user_id: Optional[str] = "researcher_trishna"

@router.get("/run/{experiment_id}", response_model=ExperimentReport)
def run_benchmark_experiment(
    experiment_id: str,
    user_id: str = "researcher_trishna",
    db: Session = Depends(get_db)
):
    if experiment_id == "exp1_memory":
        return experiment_harness.run_experiment_1(db, user_id=user_id)
    elif experiment_id == "exp2_graphrag":
        return experiment_harness.run_experiment_2(db, user_id=user_id)
    elif experiment_id == "exp3_personalization":
        return experiment_harness.run_experiment_3(db, user_id=user_id)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown experiment ID: {experiment_id}")

@router.post("/run_custom", response_model=ExperimentReport)
def run_custom_experiment(body: CustomRunBody, db: Session = Depends(get_db)):
    u_id = body.user_id or "researcher_trishna"
    if body.experiment_id == "exp1_memory":
        return experiment_harness.run_experiment_1(db, user_id=u_id, custom_query=body.query)
    elif body.experiment_id == "exp2_graphrag":
        return experiment_harness.run_experiment_2(db, user_id=u_id, custom_query=body.query)
    elif body.experiment_id == "exp3_personalization":
        return experiment_harness.run_experiment_3(db, user_id=u_id, custom_query=body.query)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown experiment ID: {body.experiment_id}")
