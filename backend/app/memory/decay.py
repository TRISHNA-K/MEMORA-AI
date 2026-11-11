import math
import datetime
from typing import Dict, Any

class MemoryDecayEngine:
    """
    6-Factor Composite Memory Decay & Consolidation Engine
    Inspired by human cognitive neuroscience (Ebbinghaus forgetting curve + connectionist memory consolidation).
    Factors:
    1. Recency (Temporal decay)
    2. Frequency (Repetition / Access count)
    3. Salience (Emotional & semantic weight)
    4. User Verification (Explicit reinforcement)
    5. Graph Centrality (Knowledge Graph topological integration)
    6. Procedural Utility (Actionability & workflow relevance)
    """
    
    def __init__(
        self,
        decay_lambda: float = 0.04, # Half-life ~ 17.3 days in standard time units
        frequency_k: float = 3.0,
        weights: Dict[str, float] = None
    ):
        self.decay_lambda = decay_lambda
        self.frequency_k = frequency_k
        self.weights = weights or {
            "recency": 0.25,
            "frequency": 0.20,
            "salience": 0.20,
            "verification": 0.15,
            "centrality": 0.10,
            "utility": 0.10
        }
        
    def calculate_retention(
        self,
        created_at: datetime.datetime,
        last_accessed_at: datetime.datetime,
        access_count: int,
        salience: float = 0.7,
        verified: bool = True,
        reinforcements: int = 0,
        graph_degree: int = 1,
        is_procedural: bool = False
    ) -> Dict[str, Any]:
        now = datetime.datetime.utcnow()
        if not last_accessed_at:
            last_accessed_at = created_at or now
            
        # 1. Recency Factor F_R
        delta_hours = max(0.0, (now - last_accessed_at).total_seconds() / 3600.0)
        # Using a calibrated half-life curve
        f_recency = math.exp(-self.decay_lambda * (delta_hours / 24.0))
        
        # 2. Frequency Factor F_F (log saturation)
        f_freq = math.log1p(access_count) / (math.log1p(access_count) + self.frequency_k)
        f_freq = min(1.0, max(0.0, f_freq * 1.5))
        
        # 3. Salience Factor F_S
        f_salience = min(1.0, max(0.0, salience))
        
        # 4. Verification & Reinforcement Factor F_V
        base_v = 1.0 if verified else 0.6
        f_verification = min(1.0, base_v + 0.1 * min(4, reinforcements))
        
        # 5. Graph Centrality Factor F_C (Entities linked to many concepts resist decay)
        f_centrality = min(1.0, math.log1p(graph_degree) / math.log1p(10.0))
        
        # 6. Procedural Utility Factor F_U
        f_utility = 0.95 if is_procedural else 0.45
        
        # Composite score
        composite = (
            self.weights["recency"] * f_recency +
            self.weights["frequency"] * f_freq +
            self.weights["salience"] * f_salience +
            self.weights["verification"] * f_verification +
            self.weights["centrality"] * f_centrality +
            self.weights["utility"] * f_utility
        )
        composite = round(min(1.0, max(0.05, composite)), 4)
        
        # Consolidation status
        status = "Active"
        if composite > 0.82:
            status = "Consolidated Core"
        elif composite < 0.25:
            status = "Decaying"
        elif composite < 0.12:
            status = "Eligible for Pruning"
            
        return {
            "composite_score": composite,
            "status": status,
            "factors": {
                "recency": round(f_recency, 3),
                "frequency": round(f_freq, 3),
                "salience": round(f_salience, 3),
                "verification": round(f_verification, 3),
                "centrality": round(f_centrality, 3),
                "utility": round(f_utility, 3)
            },
            "age_hours": round(delta_hours, 1)
        }

decay_engine = MemoryDecayEngine()
