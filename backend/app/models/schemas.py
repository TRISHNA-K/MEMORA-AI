from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# ==================== User & Profile ====================
class UserProfile(BaseModel):
    id: str
    name: str = "Researcher"
    email: Optional[str] = None
    bio: Optional[str] = "Research Scientist exploring Graph-based Reasoning and Memory Augmentation"
    preferred_tone: str = "academic_rigorous" # academic_rigorous, concise, technical_code, pedagogical
    detail_level: str = "high"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    preferred_tone: Optional[str] = None
    detail_level: Optional[str] = None

# ==================== Chat & Orchestration ====================
class ChatMessage(BaseModel):
    role: str # "user" or "assistant" or "system"
    content: str
    timestamp: Optional[datetime] = None

class ThoughtStep(BaseModel):
    step: str
    description: str
    data: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"
    user_id: Optional[str] = "researcher_trishna"
    mode: str = "memora_agentic" # "memora_agentic", "rag_vector", "standard_llm"
    retrieval_strategy: Optional[str] = "hybrid_graphrag" # "hybrid_graphrag", "vector_only", "graph_traversal"
    personalization_enabled: bool = True

class RetrievedMemoryItem(BaseModel):
    id: str
    type: str # "episodic", "semantic", "procedural"
    content: str
    score: float
    decay_score: float
    category: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SubgraphData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class ChatResponse(BaseModel):
    response: str
    session_id: str
    thoughts: List[ThoughtStep]
    retrieved_memories: List[RetrievedMemoryItem]
    knowledge_subgraph: SubgraphData
    latency_ms: float
    mode_used: str

# ==================== Memory CRUD & Inspection ====================
class EpisodicMemoryCreate(BaseModel):
    user_query: str
    assistant_response: str
    salience_score: float = 0.8
    context_used: Optional[str] = None

class SemanticFactCreate(BaseModel):
    subject: str
    predicate: str
    object: str
    fact_text: Optional[str] = None
    category: str = "Concept"
    confidence: float = 0.9

class ProceduralWorkflowCreate(BaseModel):
    workflow_name: str
    trigger_condition: str
    rule_content: str
    priority: int = 1

class MemoryItemResponse(BaseModel):
    id: str
    memory_type: str # "episodic", "semantic", "procedural"
    title: str
    content: str
    category: str
    importance: float
    decay_score: float
    access_count: int
    created_at: str
    last_accessed: str
    verified: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MemoryOverviewStats(BaseModel):
    working_memory_count: int
    episodic_count: int
    semantic_triples_count: int
    procedural_rules_count: int
    average_retention: float
    consolidated_items: int
    categories: Dict[str, int]

# ==================== Knowledge Graph ====================
class KGNodeSchema(BaseModel):
    id: str
    name: str
    entity_type: str # Concept, Person, Process, Tool, Event, Other
    description: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    decay_score: float = 1.0
    degree_connections: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class KGEdgeSchema(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str
    weight: float = 1.0
    evidence: Optional[str] = None

class FullGraphResponse(BaseModel):
    nodes: List[KGNodeSchema]
    edges: List[KGEdgeSchema]
    stats: Dict[str, Any]

# ==================== Feedback ====================
class FeedbackRequest(BaseModel):
    episode_id: Optional[str] = None
    query: Optional[str] = None
    response: Optional[str] = None
    rating: Optional[int] = None # 1 to 5
    is_positive: bool
    feedback_text: Optional[str] = None
    target_aspect: Optional[str] = "accuracy" # "accuracy", "tone", "personalization", "retrieval"

# ==================== Research Experiments & Benchmarks ====================
class ExperimentRunRequest(BaseModel):
    experiment_id: str # "exp1_memory", "exp2_graphrag", "exp3_personalization"
    sample_queries: Optional[List[str]] = None
    custom_query: Optional[str] = None

class MetricScorecard(BaseModel):
    variant_name: str
    retrieval_accuracy: float
    context_precision: float
    context_recall: float
    faithfulness: float
    answer_relevance: float
    personalization_quality: float
    response_latency_ms: float
    user_satisfaction: float
    sample_responses: List[Dict[str, Any]] = Field(default_factory=list)

class ExperimentReport(BaseModel):
    experiment_id: str
    experiment_title: str
    hypothesis: str
    findings_summary: str
    scorecards: List[MetricScorecard]
    radar_metrics: List[Dict[str, Any]]
    bar_chart_data: List[Dict[str, Any]]
