import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.db_models import EpisodicMemory, SemanticFact, ProceduralWorkflow, User
from app.memory.decay import decay_engine
from app.graph.kg_store import kg_engine
from app.graph.extractor import triplet_extractor

class UnifiedMemoryManager:
    def __init__(self):
        pass
        
    def ensure_default_user(self, db: Session, user_id: str = "researcher_trishna") -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(
                id=user_id,
                name="Trishna K.",
                bio="AI Researcher focusing on Cognitive Agent Architecture, GraphRAG, and Adaptive Long-Term Memory.",
                preferred_tone="academic_rigorous",
                detail_level="high"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            self._seed_user_memories(db, user_id)
        return user
        
    def _seed_user_memories(self, db: Session, user_id: str):
        # 1. Seed initial procedural workflows
        procedural_seeds = [
            {
                "name": "LaTeX Math Derivation Rule",
                "trigger": "When explaining algorithms, loss functions or theoretical formulations",
                "rule": "Provide KaTeX-ready math formulations, clear variable notation, and step-by-step mathematical reasoning.",
                "priority": 1
            },
            {
                "name": "PyTorch Production Code Standard",
                "trigger": "When writing machine learning or deep learning code",
                "rule": "Provide clean Python code with strict typing (PEP 484), dimension comments on tensors, docstrings, and modular design.",
                "priority": 2
            },
            {
                "name": "Concise Synthesis Preference",
                "trigger": "When summarizing papers or system comparisons",
                "rule": "Prioritize structured comparison matrices, trade-off analyses, and empirical metric definitions.",
                "priority": 3
            }
        ]
        for p in procedural_seeds:
            db.add(ProceduralWorkflow(
                id=str(uuid.uuid4())[:8],
                user_id=user_id,
                workflow_name=p["name"],
                trigger_condition=p["trigger"],
                rule_content=p["rule"],
                priority=p["priority"],
                is_active=True,
                reinforcement_count=3
            ))
            
        # 2. Seed initial semantic facts
        semantic_seeds = [
            ("Trishna K.", "researches", "Human-Centered Cognitive Memory Systems", "Concept", 0.98),
            ("Trishna K.", "applicant_for", "Microsoft Research Internship", "Organization", 0.99),
            ("Trishna K.", "prefers_implementation", "GraphRAG over pure Vector RAG", "Preference", 0.95),
            ("Memora AI", "utilizes", "6-Factor Memory Decay System", "Tool", 0.96),
            ("Memora AI", "implements", "Tripartite Memory (Episodic, Semantic, Procedural)", "Concept", 0.97)
        ]
        for s, p, o, cat, conf in semantic_seeds:
            fact_id = str(uuid.uuid4())[:8]
            db.add(SemanticFact(
                id=fact_id,
                user_id=user_id,
                subject=s,
                predicate=p,
                object=o,
                fact_text=f"{s} {p.replace('_', ' ')} {o}",
                category=cat,
                confidence=conf,
                verified=True,
                access_count=4,
                decay_score=0.92
            ))
            
        # 3. Seed initial episodic interaction
        db.add(EpisodicMemory(
            id=str(uuid.uuid4())[:8],
            user_id=user_id,
            session_id="init_session",
            role="interaction",
            user_query="Can you summarize the theoretical motivation for combining Knowledge Graphs with Agent Memory?",
            assistant_response="Combining Knowledge Graphs with Agent Memory grounds vector similarity in structured relational logic. While vector retrieval captures surface semantic proximity, multi-hop graph traversal resolves entity interdependencies, temporal precedence, and contextual constraints.",
            context_used="GraphRAG principles; Cognitive Psychology dual-process theory",
            salience_score=0.92,
            access_count=5,
            decay_score=0.89
        ))
        
        db.commit()

    def record_interaction(
        self,
        db: Session,
        user_id: str,
        session_id: str,
        user_query: str,
        assistant_response: str,
        context_used: str = "",
        salience: float = 0.8
    ) -> EpisodicMemory:
        self.ensure_default_user(db, user_id)
        
        # 1. Save Episodic Memory
        ep_id = str(uuid.uuid4())[:8]
        ep = EpisodicMemory(
            id=ep_id,
            user_id=user_id,
            session_id=session_id,
            role="interaction",
            user_query=user_query,
            assistant_response=assistant_response,
            context_used=context_used,
            salience_score=salience,
            access_count=1,
            decay_score=1.0,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(ep)
        
        # 2. Extract and save Semantic Facts
        triplets = triplet_extractor.extract_triplets(user_query)
        for t in triplets:
            fact_id = str(uuid.uuid4())[:8]
            fact = SemanticFact(
                id=fact_id,
                user_id=user_id,
                subject=t["subject"],
                predicate=t["predicate"],
                object=t["object"],
                fact_text=t["fact_text"],
                category=t.get("category", "Concept"),
                confidence=t.get("confidence", 0.9),
                verified=True,
                access_count=1,
                decay_score=1.0
            )
            db.add(fact)
            
            # Sync to Knowledge Graph
            s_node = kg_engine.add_node(db, name=t["subject"], entity_type=t.get("category", "Concept"))
            t_node = kg_engine.add_node(db, name=t["object"], entity_type="Concept")
            kg_engine.add_edge(db, s_node, t_node, relation_type=t["predicate"], evidence=f"Learned from session {session_id}")
            
        db.commit()
        db.refresh(ep)
        return ep

    def get_memory_overview(self, db: Session, user_id: str) -> Dict[str, Any]:
        self.ensure_default_user(db, user_id)
        
        episodic_count = db.query(EpisodicMemory).filter(EpisodicMemory.user_id == user_id).count()
        semantic_count = db.query(SemanticFact).filter(SemanticFact.user_id == user_id).count()
        procedural_count = db.query(ProceduralWorkflow).filter(
            ProceduralWorkflow.user_id == user_id,
            ProceduralWorkflow.is_active == True
        ).count()
        
        all_decay_scores = [
            f.decay_score for f in db.query(SemanticFact).filter(SemanticFact.user_id == user_id).all()
        ] + [
            e.decay_score for e in db.query(EpisodicMemory).filter(EpisodicMemory.user_id == user_id).all()
        ]
        avg_retention = round(sum(all_decay_scores) / max(1, len(all_decay_scores)), 3)
        consolidated = sum(1 for s in all_decay_scores if s >= 0.8)
        
        # Categories breakdown
        categories = {}
        for f in db.query(SemanticFact).filter(SemanticFact.user_id == user_id).all():
            cat = f.category or "Other"
            categories[cat] = categories.get(cat, 0) + 1
            
        return {
            "working_memory_count": min(6, episodic_count),
            "episodic_count": episodic_count,
            "semantic_triples_count": semantic_count,
            "procedural_rules_count": procedural_count,
            "average_retention": avg_retention,
            "consolidated_items": consolidated,
            "categories": categories
        }

    def get_all_memories(
        self,
        db: Session,
        user_id: str,
        category: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        self.ensure_default_user(db, user_id)
        items = []
        
        # 1. Episodic
        episodes = db.query(EpisodicMemory).filter(EpisodicMemory.user_id == user_id).all()
        for e in episodes:
            items.append({
                "id": e.id,
                "memory_type": "episodic",
                "title": f"Turn: {e.user_query[:55]}...",
                "content": f"Query: {e.user_query}\nResponse: {e.assistant_response}",
                "category": "Episodic Interaction",
                "importance": e.salience_score,
                "decay_score": e.decay_score,
                "access_count": e.access_count,
                "created_at": e.timestamp.strftime("%b %d, %Y %H:%M") if e.timestamp else "",
                "last_accessed": e.last_accessed_at.strftime("%b %d, %Y %H:%M") if e.last_accessed_at else "",
                "verified": True
            })
            
        # 2. Semantic
        facts = db.query(SemanticFact).filter(SemanticFact.user_id == user_id).all()
        for f in facts:
            items.append({
                "id": f.id,
                "memory_type": "semantic",
                "title": f"{f.subject} -> {f.predicate}",
                "content": f.fact_text or f"{f.subject} {f.predicate} {f.object}",
                "category": f.category or "Concept",
                "importance": f.confidence,
                "decay_score": f.decay_score,
                "access_count": f.access_count,
                "created_at": f.created_at.strftime("%b %d, %Y %H:%M") if f.created_at else "",
                "last_accessed": f.last_accessed_at.strftime("%b %d, %Y %H:%M") if f.last_accessed_at else "",
                "verified": f.verified
            })
            
        # 3. Procedural
        procs = db.query(ProceduralWorkflow).filter(ProceduralWorkflow.user_id == user_id).all()
        for p in procs:
            items.append({
                "id": p.id,
                "memory_type": "procedural",
                "title": p.workflow_name,
                "content": f"When: {p.trigger_condition}\nRule: {p.rule_content}",
                "category": "Procedural Rule",
                "importance": 0.95,
                "decay_score": 0.98,
                "access_count": p.reinforcement_count,
                "created_at": p.created_at.strftime("%b %d, %Y %H:%M") if p.created_at else "",
                "last_accessed": "Active",
                "verified": True
            })
            
        # Filter if requested
        if category and category.lower() != "all":
            items = [it for it in items if it["memory_type"].lower() == category.lower() or it["category"].lower() == category.lower()]
            
        if search_query and search_query.strip():
            sq = search_query.lower()
            items = [it for it in items if sq in it["title"].lower() or sq in it["content"].lower() or sq in it["category"].lower()]
            
        # Sort by decay score / importance
        items.sort(key=lambda x: (x["decay_score"], x["importance"]), reverse=True)
        return items

    def delete_memory(self, db: Session, memory_id: str, user_id: str) -> bool:
        from app.graph.graphrag import graphrag_retriever
        # Check in semantic
        sem = db.query(SemanticFact).filter(SemanticFact.id == memory_id, SemanticFact.user_id == user_id).first()
        if sem:
            db.delete(sem)
            db.commit()
            graphrag_retriever.invalidate_cache()
            return True
            
        # Check in episodic
        ep = db.query(EpisodicMemory).filter(EpisodicMemory.id == memory_id, EpisodicMemory.user_id == user_id).first()
        if ep:
            db.delete(ep)
            db.commit()
            graphrag_retriever.invalidate_cache()
            return True
            
        # Check in procedural
        proc = db.query(ProceduralWorkflow).filter(ProceduralWorkflow.id == memory_id, ProceduralWorkflow.user_id == user_id).first()
        if proc:
            db.delete(proc)
            db.commit()
            graphrag_retriever.invalidate_cache()
            return True
            
        return False

    def update_memory(
        self,
        db: Session,
        memory_id: str,
        user_id: str,
        content: str,
        importance: float,
        category: str
    ) -> bool:
        from app.graph.graphrag import graphrag_retriever
        sem = db.query(SemanticFact).filter(SemanticFact.id == memory_id, SemanticFact.user_id == user_id).first()
        if sem:
            sem.fact_text = content
            sem.confidence = importance
            sem.category = category
            sem.decay_score = min(1.0, sem.decay_score + 0.15)
            db.commit()
            graphrag_retriever.invalidate_cache()
            return True
            
        ep = db.query(EpisodicMemory).filter(EpisodicMemory.id == memory_id, EpisodicMemory.user_id == user_id).first()
        if ep:
            ep.salience_score = importance
            ep.assistant_response = content
            ep.decay_score = min(1.0, ep.decay_score + 0.15)
            db.commit()
            graphrag_retriever.invalidate_cache()
            return True
            
        proc = db.query(ProceduralWorkflow).filter(ProceduralWorkflow.id == memory_id, ProceduralWorkflow.user_id == user_id).first()
        if proc:
            proc.rule_content = content
            proc.reinforcement_count += 1
            db.commit()
            graphrag_retriever.invalidate_cache()
            return True
            
        return False

    def run_consolidation(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Runs the 6-factor composite decay and consolidation routine across all user memories"""
        facts = db.query(SemanticFact).filter(SemanticFact.user_id == user_id).all()
        episodes = db.query(EpisodicMemory).filter(EpisodicMemory.user_id == user_id).all()
        
        updated_count = 0
        decayed_count = 0
        consolidated_count = 0
        
        for f in facts:
            res = decay_engine.calculate_retention(
                created_at=f.created_at,
                last_accessed_at=f.last_accessed_at,
                access_count=f.access_count,
                salience=f.confidence,
                verified=f.verified,
                graph_degree=2
            )
            f.decay_score = res["composite_score"]
            if res["status"] == "Consolidated Core":
                consolidated_count += 1
            elif res["status"] == "Decaying":
                decayed_count += 1
            updated_count += 1
            
        for e in episodes:
            res = decay_engine.calculate_retention(
                created_at=e.timestamp,
                last_accessed_at=e.last_accessed_at,
                access_count=e.access_count,
                salience=e.salience_score,
                verified=True,
                graph_degree=1
            )
            e.decay_score = res["composite_score"]
            if res["status"] == "Consolidated Core":
                consolidated_count += 1
            elif res["status"] == "Decaying":
                decayed_count += 1
            updated_count += 1
            
        db.commit()
        return {
            "total_processed": updated_count,
            "consolidated_core": consolidated_count,
            "decayed_items": decayed_count,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

memory_manager = UnifiedMemoryManager()
