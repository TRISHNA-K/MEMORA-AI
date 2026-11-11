import re
import json
from typing import List, Dict, Any
from app.core.config import settings

class TripletExtractor:
    def __init__(self):
        pass
        
    def extract_triplets(self, text: str) -> List[Dict[str, str]]:
        """
        Extracts (subject, predicate, object, entity_type) from text.
        Works via LLM if available, or fast deterministic rule-based semantic parser.
        """
        if not text or len(text.strip()) < 5:
            return []
            
        triplets = []
        
        # 1. Regex heuristics for user facts and domain concepts
        patterns = [
            # User preferences and attributes
            (r"(?:i am|i'm|user is) (?:a|an)?\s*([a-zA-Z\s]+?)(?:working on|studying|focusing on|specializing in) ([a-zA-Z\s]+)", "specializes_in", "Concept"),
            (r"(?:i prefer|i like|i love|please use) ([a-zA-Z\s]+?)(?:over|instead of|for) ([a-zA-Z\s]+)", "prefers", "Preference"),
            (r"(?:i prefer|i like|always use) ([a-zA-Z\s]+)", "prefers", "Preference"),
            (r"([a-zA-Z\s]+) (?:is built with|uses|utilizes|relies on) ([a-zA-Z\s]+)", "uses", "Tool"),
            (r"([a-zA-Z\s]+) (?:is|represents|means) (?:a|an) ([a-zA-Z\s]+)", "is_a", "Concept"),
            (r"([a-zA-Z\s]+) (?:improves|enhances|optimizes) ([a-zA-Z\s]+)", "improves", "Process"),
            (r"([a-zA-Z\s]+) (?:causes|leads to|results in) ([a-zA-Z\s]+)", "causes", "Process"),
            (r"([a-zA-Z\s]+) (?:is located in|works at|associated with) ([a-zA-Z\s]+)", "associated_with", "Organization")
        ]
        
        for pat, rel, ent_type in patterns:
            matches = re.finditer(pat, text, re.IGNORECASE)
            for m in matches:
                groups = m.groups()
                if len(groups) == 2:
                    sub = groups[0].strip().title()
                    obj = groups[1].strip().title()
                    if len(sub) > 2 and len(obj) > 2:
                        triplets.append({
                            "subject": sub,
                            "predicate": rel,
                            "object": obj,
                            "fact_text": f"{sub} {rel.replace('_', ' ')} {obj}",
                            "category": ent_type,
                            "confidence": 0.88
                        })
                elif len(groups) == 1:
                    sub = "User"
                    obj = groups[0].strip().title()
                    if len(obj) > 2:
                        triplets.append({
                            "subject": sub,
                            "predicate": rel,
                            "object": obj,
                            "fact_text": f"User {rel} {obj}",
                            "category": ent_type,
                            "confidence": 0.92
                        })
                        
        # 2. Key entity keyword detection for research systems
        keywords = {
            "GraphRAG": ("Tool", "retrieval through knowledge graph"),
            "FAISS": ("Tool", "vector similarity indexing"),
            "Neo4j": ("Tool", "graph database management"),
            "LangGraph": ("Tool", "state-machine agent orchestration"),
            "Memory Decay": ("Concept", "6-factor retention modeling"),
            "Episodic Memory": ("Concept", "historical interaction log"),
            "Semantic Memory": ("Concept", "facts and conceptual triples"),
            "Procedural Memory": ("Concept", "learned workflow patterns"),
            "Microsoft Research": ("Organization", "advanced computing laboratory"),
            "RAGAS": ("Process", "retrieval evaluation framework")
        }
        
        for kw, (k_type, desc) in keywords.items():
            if kw.lower() in text.lower():
                triplets.append({
                    "subject": kw,
                    "predicate": "concept_of",
                    "object": k_type,
                    "fact_text": f"{kw} is classified as {k_type} ({desc})",
                    "category": k_type,
                    "confidence": 0.95
                })
                
        return triplets

triplet_extractor = TripletExtractor()
