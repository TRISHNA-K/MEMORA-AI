from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import UserProfile, UserProfileUpdate, FeedbackRequest
from app.models.db_models import User
from app.memory.manager import memory_manager
from app.agent.feedback import feedback_learner

router = APIRouter(prefix="/user", tags=["User & Personalization"])

@router.get("/profile", response_model=UserProfile)
def get_user_profile(user_id: str = "researcher_trishna", db: Session = Depends(get_db)):
    u = memory_manager.ensure_default_user(db, user_id=user_id)
    return UserProfile(
        id=u.id,
        name=u.name,
        email=u.email,
        bio=u.bio,
        preferred_tone=u.preferred_tone,
        detail_level=u.detail_level
    )

@router.put("/profile", response_model=UserProfile)
def update_user_profile(body: UserProfileUpdate, user_id: str = "researcher_trishna", db: Session = Depends(get_db)):
    u = memory_manager.ensure_default_user(db, user_id=user_id)
    if body.name is not None:
        u.name = body.name
    if body.email is not None:
        u.email = body.email
    if body.bio is not None:
        u.bio = body.bio
    if body.preferred_tone is not None:
        u.preferred_tone = body.preferred_tone
    if body.detail_level is not None:
        u.detail_level = body.detail_level
    db.commit()
    db.refresh(u)
    return UserProfile(
        id=u.id,
        name=u.name,
        email=u.email,
        bio=u.bio,
        preferred_tone=u.preferred_tone,
        detail_level=u.detail_level
    )

@router.post("/feedback")
def submit_feedback(body: FeedbackRequest, user_id: str = "researcher_trishna", db: Session = Depends(get_db)):
    result = feedback_learner.process_feedback(
        db=db,
        user_id=user_id,
        is_positive=body.is_positive,
        rating=body.rating,
        feedback_text=body.feedback_text,
        episode_id=body.episode_id,
        target_aspect=body.target_aspect or "accuracy"
    )
    return result
