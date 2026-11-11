from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.db_models import User, ProceduralWorkflow

class PromptBuilder:
    def __init__(self):
        pass
        
    def build_system_prompt(
        self,
        user: User,
        mode: str, # "memora_agentic", "rag_vector", "standard_llm"
        context_text: str = "",
        procedural_rules: List[str] = None
    ) -> str:
        if mode == "standard_llm":
            return (
                "You are an AI assistant. Answer the user's question accurately and helpfully. "
                "You do not possess persistent cross-session memory or knowledge of user preferences."
            )
            
        if mode == "rag_vector":
            return (
                "You are a Retrieval-Augmented Generation (RAG) assistant. "
                "Answer the user's question using strictly the retrieved context passages below. "
                "If the context does not contain the answer, state that you do not know.\n\n"
                f"### RETRIEVED CONTEXT:\n{context_text}"
            )
            
        # Memora Agentic Mode: Full Human-Centered Cognitive Architecture
        tone_directives = {
            "academic_rigorous": "Maintain high academic and theoretical rigor suitable for a Microsoft Research collaboration. Provide formal definitions, LaTeX formulations, and conceptual precision.",
            "concise": "Deliver ultra-dense, high-signal, bulleted responses without redundant conversational fluff.",
            "technical_code": "Prioritize production-grade, typed Python implementations with architecture diagrams and complexity analysis.",
            "pedagogical": "Provide clear, step-by-step intuitive explanations followed by deep formal concepts."
        }
        chosen_tone = tone_directives.get(user.preferred_tone, tone_directives["academic_rigorous"])
        
        rules_text = ""
        if procedural_rules:
            rules_text = "\n### LEARNED USER PROCEDURAL WORKFLOWS & CONSTRAINTS:\n" + "\n".join([f"- {r}" for r in procedural_rules])
            
        system_prompt = f"""You are MEMORA AI: A Human-Centered Cognitive AI Co-pilot featuring Long-Term Memory, GraphRAG, and Adaptive Personalization.
You are collaborating with {user.name} ({user.bio}).

### COGNITIVE PERSONA & OBJECTIVES:
1. Tone & Depth: {chosen_tone}
2. Grounded Reasoning: Seamlessly synthesize user-specific episodic history, semantic knowledge graph relationships, and procedural habits.
3. Transparency: When utilizing retrieved facts or past interactions, maintain contextual coherence.

### RETRIEVED COGNITIVE CONTEXT (Episodic Memories & Graph Subgraph):
{context_text if context_text else "No relevant historical memories required for this turn."}
{rules_text}
"""
        return system_prompt

prompt_builder = PromptBuilder()
