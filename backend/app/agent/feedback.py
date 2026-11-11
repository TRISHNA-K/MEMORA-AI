import uuid
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.db_models import FeedbackLog, EpisodicMemory, SemanticFact, ProceduralWorkflow, User

class FeedbackLearner:
    def __init__(self):
        pass
        
    def process_feedback(
        self,
        db: Session,
        user_id: str,
        is_positive: bool,
        rating: Optional[int] = None,
        feedback_text: Optional[str] = None,
        episode_id: Optional[str] = None,
        target_aspect: str = "accuracy"
    ) -> Dict[str, Any]:
        log_id = str(uuid.uuid4())[:8]
        feedback_log = FeedbackLog(
            id=log_id,
            episode_id=episode_id,
            rating=rating,
            is_positive=is_positive,
            feedback_text=feedback_text,
            target_aspect=target_aspect,
            applied_to_procedural=False
        )
        db.add(feedback_log)
        
        actions_taken = []
        
        # 1. Update Episode Salience & Retention
        if episode_id:
            ep = db.query(EpisodicMemory).filter(EpisodicMemory.id == episode_id).first()
            if ep:
                if is_positive:
                    ep.salience_score = min(1.0, ep.salience_score + 0.15)
                    ep.decay_score = min(1.0, ep.decay_score + 0.20)
                    ep.access_count += 1
                    actions_taken.append(f"Reinforced episodic memory {episode_id} (+20% retention)")
                else:
                    ep.salience_score = max(0.2, ep.salience_score - 0.20)
                    actions_taken.append(f"Down-weighted episodic memory {episode_id}")
                    
        # 2. Extract implicit preferences from feedback text
        if feedback_text and len(feedback_text.strip()) > 3:
            txt_lower = feedback_text.lower()
            user = db.query(User).filter(User.id == user_id).first()
            
            # Tone adjustments
            if "too verbose" in txt_lower or "shorter" in txt_lower or "more concise" in txt_lower:
                if user:
                    user.preferred_tone = "concise"
                # Add procedural workflow rule
                db.add(ProceduralWorkflow(
                    id=str(uuid.uuid4())[:8],
                    user_id=user_id,
                    workflow_name="Learned Concision Directive",
                    trigger_condition="Always",
                    rule_content="User requested extreme brevity. Provide concise bullet points without preamble.",
                    priority=5,
                    is_active=True,
                    reinforcement_count=2
                ))
                feedback_log.applied_to_procedural = True
                actions_taken.append("Updated user preference to 'concise' and added procedural rule")
                
            elif "more math" in txt_lower or "formula" in txt_lower or "formal" in txt_lower:
                if user:
                    user.preferred_tone = "academic_rigorous"
                actions_taken.append("Set tone to 'academic_rigorous'")
                
            elif "more code" in txt_lower or "show implementation" in txt_lower:
                if user:
                    user.preferred_tone = "technical_code"
                actions_taken.append("Set tone to 'technical_code'")
                
        # 3. If positive, reinforce all active procedural rules
        if is_positive:
            procs = db.query(ProceduralWorkflow).filter(
                ProceduralWorkflow.user_id == user_id,
                ProceduralWorkflow.is_active == True
            ).all()
            for p in procs:
                p.reinforcement_count += 1
            if procs:
                actions_taken.append(f"Reinforced {len(procs)} active procedural workflows")
                
        db.commit()
        return {
            "status": "success",
            "feedback_id": log_id,
            "actions_taken": actions_taken,
            "applied_timestamp": datetime.datetime.utcnow().isoformat()
        }

feedback_learner = FeedbackLearner()
