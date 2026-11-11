import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, default="Researcher")
    email = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    preferred_tone = Column(String, default="academic_rigorous") # academic_rigorous, concise, technical_code, pedagogical
    detail_level = Column(String, default="high")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    episodic_memories = relationship("EpisodicMemory", back_populates="user", cascade="all, delete-orphan")
    semantic_facts = relationship("SemanticFact", back_populates="user", cascade="all, delete-orphan")
    procedural_workflows = relationship("ProceduralWorkflow", back_populates="user", cascade="all, delete-orphan")

class EpisodicMemory(Base):
    __tablename__ = "episodic_memories"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    session_id = Column(String, index=True)
    role = Column(String, default="user") # user or assistant or interaction
    user_query = Column(Text)
    assistant_response = Column(Text)
    context_used = Column(Text, nullable=True) # Summary of retrieved context
    
    # 6-Factor Composite Scoring attributes
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    salience_score = Column(Float, default=0.7) # Emotional/semantic importance (0.0 to 1.0)
    access_count = Column(Integer, default=1)
    last_accessed_at = Column(DateTime, default=datetime.datetime.utcnow)
    decay_score = Column(Float, default=1.0) # Current composite retention (0.0 to 1.0)
    embedding_json = Column(Text, nullable=True) # Serialized float vector
    
    user = relationship("User", back_populates="episodic_memories")

class SemanticFact(Base):
    __tablename__ = "semantic_facts"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    subject = Column(String, index=True)
    predicate = Column(String, index=True)
    object = Column(String, index=True)
    fact_text = Column(Text) # "User specializes in Graph Neural Networks"
    category = Column(String, default="Concept") # Concept, Person, Process, Tool, Event, Preference
    confidence = Column(Float, default=0.9)
    verified = Column(Boolean, default=True)
    access_count = Column(Integer, default=1)
    last_accessed_at = Column(DateTime, default=datetime.datetime.utcnow)
    decay_score = Column(Float, default=1.0)
    embedding_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="semantic_facts")

class ProceduralWorkflow(Base):
    __tablename__ = "procedural_workflows"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    workflow_name = Column(String) # e.g. "Python Research Code Formatting"
    trigger_condition = Column(String) # e.g. "When writing machine learning code"
    rule_content = Column(Text) # e.g. "Include type annotations, PyTorch tensor shape docstrings, and KaTeX math derivations"
    priority = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    reinforcement_count = Column(Integer, default=1) # Incremented on positive feedback
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="procedural_workflows")

class KGNodeModel(Base):
    __tablename__ = "kg_nodes"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    entity_type = Column(String, default="Concept") # Concept, Person, Process, Tool, Event, Other
    description = Column(Text, nullable=True)
    properties_json = Column(Text, default="{}")
    decay_score = Column(Float, default=1.0)
    degree_connections = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class KGEdgeModel(Base):
    __tablename__ = "kg_edges"
    
    id = Column(String, primary_key=True, index=True)
    source_id = Column(String, ForeignKey("kg_nodes.id"), index=True)
    target_id = Column(String, ForeignKey("kg_nodes.id"), index=True)
    relation_type = Column(String, index=True) # e.g., "researches", "built_with", "prefers", "depends_on"
    weight = Column(Float, default=1.0)
    evidence = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ExperimentLog(Base):
    __tablename__ = "experiment_logs"
    
    id = Column(String, primary_key=True, index=True)
    experiment_type = Column(String, index=True) # "exp1_memory", "exp2_graphrag", "exp3_personalization"
    variant = Column(String) # "standard_llm", "rag_vector", "memora_agentic", "graph_traversal", "hybrid_graphrag", "generic", "personalized"
    query = Column(Text)
    context_retrieved = Column(Text, nullable=True)
    generated_response = Column(Text)
    ground_truth = Column(Text, nullable=True)
    latency_ms = Column(Float)
    metrics_json = Column(Text) # JSON of faithfulness, answer_relevance, context_precision, personalization_score
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackLog(Base):
    __tablename__ = "feedback_logs"
    
    id = Column(String, primary_key=True, index=True)
    episode_id = Column(String, nullable=True)
    rating = Column(Integer, nullable=True) # 1 to 5
    is_positive = Column(Boolean, nullable=True)
    feedback_text = Column(Text, nullable=True)
    target_aspect = Column(String, nullable=True) # "accuracy", "tone", "personalization", "retrieval"
    applied_to_procedural = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
