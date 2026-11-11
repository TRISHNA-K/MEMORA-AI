import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.embeddings import embedding_engine, VectorStore
from app.models.db_models import EpisodicMemory, SemanticFact
from app.graph.kg_store import kg_engine
from app.memory.decay import decay_engine

class GraphRAGRetriever:
    def __init__(self):
        pass
        
    def retrieve_vector_only(
        self,
        query: str,
        db: Session,
        user_id: str,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Pure Vector Retrieval:
        Encodes query into dense vector, searches episodic and semantic memories via cosine similarity.
        """
        q_vec = embedding_engine.get_embedding(query)
        vstore = VectorStore()
        
        # Index episodic memories
        episodes = db.query(EpisodicMemory).filter(EpisodicMemory.user_id == user_id).all()
        for ep in episodes:
            text = f"User: {ep.user_query}\nAssistant: {ep.assistant_response}"
            vec = embedding_engine.get_embedding(text)
            vstore.add(
                text=text,
                meta={
                    "id": ep.id,
                    "type": "episodic",
                    "category": "Dialogue",
                    "decay_score": ep.decay_score,
                    "salience": ep.salience_score
                },
                vector=vec
            )
            
        # Index semantic facts
        facts = db.query(SemanticFact).filter(SemanticFact.user_id == user_id).all()
        for f in facts:
            text = f.fact_text or f"{f.subject} {f.predicate} {f.object}"
            vec = embedding_engine.get_embedding(text)
            vstore.add(
                text=text,
                meta={
                    "id": f.id,
                    "type": "semantic",
                    "category": f.category,
                    "decay_score": f.decay_score,
                    "salience": f.confidence
                },
                vector=vec
            )
            
        hits = vstore.search(q_vec, top_k=top_k)
        
        # Format context
        context_parts = []
        retrieved_items = []
        for h in hits:
            context_parts.append(f"[{h['type'].upper()} | Rel: {h['similarity_score']:.2f}] {h['text']}")
            retrieved_items.append({
                "id": h["id"],
                "type": h["type"],
                "content": h["text"],
                "score": round(float(h["similarity_score"]), 4),
                "decay_score": round(float(h.get("decay_score", 1.0)), 2),
                "category": h.get("category", "Concept")
            })
            
        return {
            "mode": "vector_only",
            "context_text": "\n".join(context_parts),
            "retrieved_items": retrieved_items,
            "subgraph": {"nodes": [], "edges": []}
        }

    def retrieve_graph_only(
        self,
        query: str,
        db: Session,
        max_depth: int = 2
    ) -> Dict[str, Any]:
        """
        Pure Graph Traversal Retrieval:
        Extracts entities from the query, locates them in the Knowledge Graph,
        and extracts multi-hop paths and relational neighborhoods.
        """
        words = [w.strip().lower() for w in query.split() if len(w) > 3]
        matched_node_ids = []
        
        # Find seed nodes matching query tokens
        for n_id, data in kg_engine.graph.nodes(data=True):
            name = data.get("name", "").lower()
            desc = data.get("description", "").lower()
            if any(w in name or w in desc for w in words):
                matched_node_ids.append(n_id)
                
        # If no explicit keyword hit, use top central concepts
        if not matched_node_ids and len(kg_engine.graph.nodes) > 0:
            matched_node_ids = list(kg_engine.graph.nodes)[:3]
            
        subgraph = kg_engine.get_subgraph_by_seeds(matched_node_ids, depth=max_depth)
        
        # Build relational facts context from edges
        triples_context = []
        retrieved_items = []
        node_lookup = {n["id"]: n["name"] for n in subgraph["nodes"]}
        
        for e in subgraph["edges"]:
            s_name = node_lookup.get(e["source_id"], e["source_id"])
            t_name = node_lookup.get(e["target_id"], e["target_id"])
            rel = e["relation_type"]
            ev = f" ({e['evidence']})" if e.get("evidence") else ""
            fact = f"{s_name} --[{rel}]--> {t_name}{ev}"
            triples_context.append(fact)
            retrieved_items.append({
                "id": e["id"],
                "type": "semantic",
                "content": fact,
                "score": float(e.get("weight", 1.0)),
                "decay_score": 1.0,
                "category": "Relationship"
            })
            
        # Add node definitions
        for n in subgraph["nodes"]:
            if n.get("description"):
                triples_context.append(f"Entity [{n['name']} ({n['entity_type']})]: {n['description']}")
                
        return {
            "mode": "graph_traversal",
            "context_text": "\n".join(triples_context),
            "retrieved_items": retrieved_items,
            "subgraph": subgraph
        }

    def retrieve_hybrid_graphrag(
        self,
        query: str,
        db: Session,
        user_id: str,
        alpha: float = 0.55,
        top_k: int = 6
    ) -> Dict[str, Any]:
        """
        Hybrid GraphRAG:
        1. Dense vector retrieval over episodic memories & semantic entities to find seeds.
        2. Graph traversal expanding relational neighborhood around matched entities.
        3. Fuses vector score and topological graph centrality/decay score.
        """
        # Step 1: Vector retrieval
        vec_res = self.retrieve_vector_only(query, db, user_id, top_k=top_k)
        
        # Step 2: Extract candidate seed nodes from vector hits & query text
        seed_node_ids = set()
        query_lower = query.lower()
        for n_id, data in kg_engine.graph.nodes(data=True):
            name = data.get("name", "").lower()
            if name in query_lower:
                seed_node_ids.add(n_id)
                
        for hit in vec_res["retrieved_items"]:
            content_lower = hit["content"].lower()
            for n_id, data in kg_engine.graph.nodes(data=True):
                name = data.get("name", "").lower()
                if name in content_lower:
                    seed_node_ids.add(n_id)
                    
        # Step 3: Graph expansion
        subgraph = kg_engine.get_subgraph_by_seeds(list(seed_node_ids), depth=1)
        node_lookup = {n["id"]: n["name"] for n in subgraph["nodes"]}
        
        # Step 4: Re-rank & fuse
        fused_items = []
        seen_contents = set()
        
        # Add vector items with weighted score
        for v in vec_res["retrieved_items"]:
            if v["content"] not in seen_contents:
                seen_contents.add(v["content"])
                v_score = v["score"]
                # Modulate by decay retention
                effective_score = alpha * v_score + (1.0 - alpha) * (v["decay_score"] * 0.9)
                fused_items.append({
                    **v,
                    "fused_score": round(effective_score, 4)
                })
                
        # Add graph relationships with topological boost
        for e in subgraph["edges"]:
            s_name = node_lookup.get(e["source_id"], e["source_id"])
            t_name = node_lookup.get(e["target_id"], e["target_id"])
            fact = f"{s_name} {e['relation_type'].replace('_', ' ')} {t_name}"
            if fact not in seen_contents:
                seen_contents.add(fact)
                g_score = 0.85 * float(e.get("weight", 1.0))
                effective_score = (1.0 - alpha) * g_score + alpha * 0.7
                fused_items.append({
                    "id": e["id"],
                    "type": "semantic",
                    "content": f"[Graph Triple] {fact}",
                    "score": round(g_score, 4),
                    "decay_score": 1.0,
                    "category": "Relational Triple",
                    "fused_score": round(effective_score, 4)
                })
                
        fused_items.sort(key=lambda x: x["fused_score"], reverse=True)
        final_items = fused_items[:top_k]
        
        context_text = "\n".join([f"- {it['content']}" for it in final_items])
        
        return {
            "mode": "hybrid_graphrag",
            "context_text": context_text,
            "retrieved_items": final_items,
            "subgraph": subgraph
        }

graphrag_retriever = GraphRAGRetriever()
