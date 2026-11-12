import json
import uuid
import datetime
import networkx as nx
from typing import List, Dict, Any, Optional, Set
from sqlalchemy.orm import Session
from app.models.db_models import KGNodeModel, KGEdgeModel

class KnowledgeGraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._cached_full_graph = None
        
    def load_from_db(self, db: Session):
        """Loads nodes and edges from database into NetworkX graph"""
        self._cached_full_graph = None
        self.graph.clear()
        nodes = db.query(KGNodeModel).all()
        for node in nodes:
            props = {}
            if node.properties_json:
                try:
                    props = json.loads(node.properties_json)
                except Exception:
                    props = {}
            self.graph.add_node(
                node.id,
                name=node.name,
                entity_type=node.entity_type,
                description=node.description or "",
                decay_score=node.decay_score,
                degree=node.degree_connections,
                properties=props,
                created_at=node.created_at.isoformat() if node.created_at else "",
                updated_at=node.updated_at.isoformat() if node.updated_at else ""
            )
            
        edges = db.query(KGEdgeModel).all()
        for edge in edges:
            self.graph.add_edge(
                edge.source_id,
                edge.target_id,
                id=edge.id,
                relation_type=edge.relation_type,
                weight=edge.weight,
                evidence=edge.evidence or ""
            )
            
    def add_node(
        self,
        db: Session,
        name: str,
        entity_type: str = "Concept",
        description: str = "",
        properties: Dict[str, Any] = None,
        decay_score: float = 1.0,
        node_id: Optional[str] = None
    ) -> str:
        node_id = node_id or str(uuid.uuid4())[:8]
        # Check if node with same name exists
        existing = db.query(KGNodeModel).filter(KGNodeModel.name == name).first()
        if existing:
            existing.decay_score = min(1.0, existing.decay_score + 0.1) # Access reinforcement
            existing.updated_at = datetime.datetime.utcnow()
            db.commit()
            return existing.id
            
        new_node = KGNodeModel(
            id=node_id,
            name=name,
            entity_type=entity_type,
            description=description,
            properties_json=json.dumps(properties or {}),
            decay_score=decay_score,
            degree_connections=0
        )
        db.add(new_node)
        db.commit()
        db.refresh(new_node)
        
        self.graph.add_node(
            node_id,
            name=name,
            entity_type=entity_type,
            description=description,
            decay_score=decay_score,
            degree=0,
            properties=properties or {},
            created_at=new_node.created_at.isoformat(),
            updated_at=new_node.updated_at.isoformat()
        )
        self._cached_full_graph = None
        return node_id

    def add_edge(
        self,
        db: Session,
        source_id: str,
        target_id: str,
        relation_type: str,
        weight: float = 1.0,
        evidence: str = ""
    ) -> str:
        if source_id == target_id:
            return ""
            
        # Check if edge exists
        existing = db.query(KGEdgeModel).filter(
            KGEdgeModel.source_id == source_id,
            KGEdgeModel.target_id == target_id,
            KGEdgeModel.relation_type == relation_type
        ).first()
        if existing:
            existing.weight += 0.2
            db.commit()
            return existing.id
            
        edge_id = str(uuid.uuid4())[:8]
        new_edge = KGEdgeModel(
            id=edge_id,
            source_id=source_id,
            target_id=target_id,
            relation_type=relation_type,
            weight=weight,
            evidence=evidence
        )
        db.add(new_edge)
        
        # Update degree counts
        for n_id in [source_id, target_id]:
            n = db.query(KGNodeModel).filter(KGNodeModel.id == n_id).first()
            if n:
                n.degree_connections += 1
                
        db.commit()
        
        self.graph.add_edge(
            source_id,
            target_id,
            id=edge_id,
            relation_type=relation_type,
            weight=weight,
            evidence=evidence
        )
        self._cached_full_graph = None
        return edge_id

    def get_full_graph(self) -> Dict[str, Any]:
        if self._cached_full_graph is not None:
            return self._cached_full_graph

        nodes_list = []
        for n_id, data in self.graph.nodes(data=True):
            deg = self.graph.degree(n_id) if self.graph.has_node(n_id) else 0
            nodes_list.append({
                "id": n_id,
                "name": data.get("name", n_id),
                "entity_type": data.get("entity_type", "Concept"),
                "description": data.get("description", ""),
                "properties": data.get("properties", {}),
                "decay_score": data.get("decay_score", 1.0),
                "degree_connections": deg,
                "created_at": data.get("created_at", ""),
                "updated_at": data.get("updated_at", "")
            })
            
        edges_list = []
        for u, v, data in self.graph.edges(data=True):
            edges_list.append({
                "id": data.get("id", f"{u}_{v}"),
                "source_id": u,
                "target_id": v,
                "relation_type": data.get("relation_type", "relates_to"),
                "weight": data.get("weight", 1.0),
                "evidence": data.get("evidence", "")
            })
            
        # Graph metrics
        pagerank = {}
        communities_count = 1
        if len(self.graph.nodes) > 1:
            try:
                pagerank = nx.pagerank(self.graph, alpha=0.85, max_iter=50)
            except Exception:
                pass
            try:
                undirected = self.graph.to_undirected()
                comms = list(nx.community.greedy_modularity_communities(undirected))
                communities_count = len(comms)
            except Exception:
                pass
                
        res = {
            "nodes": nodes_list,
            "edges": edges_list,
            "stats": {
                "total_nodes": len(nodes_list),
                "total_edges": len(edges_list),
                "communities": communities_count,
                "density": round(nx.density(self.graph), 4) if len(self.graph.nodes) > 0 else 0.0,
                "top_pagerank": sorted(
                    [{"id": k, "score": round(v, 4)} for k, v in pagerank.items()],
                    key=lambda x: x["score"],
                    reverse=True
                )[:5]
            }
        }
        self._cached_full_graph = res
        return res

    def get_subgraph_by_seeds(self, seed_node_ids: List[str], depth: int = 1) -> Dict[str, Any]:
        """Expands k-hop neighborhood around seed nodes"""
        valid_seeds = [s for s in seed_node_ids if self.graph.has_node(s)]
        if not valid_seeds:
            return {"nodes": [], "edges": []}
            
        collected_nodes: Set[str] = set(valid_seeds)
        current_layer = set(valid_seeds)
        
        for _ in range(depth):
            next_layer = set()
            for n in current_layer:
                # Add successors and predecessors
                for succ in self.graph.successors(n):
                    if succ not in collected_nodes:
                        next_layer.add(succ)
                for pred in self.graph.predecessors(n):
                    if pred not in collected_nodes:
                        next_layer.add(pred)
            collected_nodes.update(next_layer)
            current_layer = next_layer
            
        sub = self.graph.subgraph(collected_nodes)
        
        nodes = []
        for n_id, data in sub.nodes(data=True):
            nodes.append({
                "id": n_id,
                "name": data.get("name", n_id),
                "entity_type": data.get("entity_type", "Concept"),
                "description": data.get("description", ""),
                "decay_score": data.get("decay_score", 1.0),
                "degree_connections": self.graph.degree(n_id)
            })
            
        edges = []
        for u, v, data in sub.edges(data=True):
            edges.append({
                "id": data.get("id", f"{u}_{v}"),
                "source_id": u,
                "target_id": v,
                "relation_type": data.get("relation_type", "relates_to"),
                "weight": data.get("weight", 1.0),
                "evidence": data.get("evidence", "")
            })
            
        return {"nodes": nodes, "edges": edges}

    def seed_initial_knowledge(self, db: Session):
        """Seeds the Microsoft Research flagship domain knowledge graph if empty"""
        if db.query(KGNodeModel).count() > 0:
            return
            
        seed_data = [
            # Entities
            {"id": "n_shared_mem", "name": "SharedMemory Architecture", "type": "Concept", "desc": "Cognitive agent memory layer enabling cross-session decision intelligence."},
            {"id": "n_decay_sys", "name": "Memory Decay System", "type": "Concept", "desc": "6-factor composite scoring mechanism incorporating recency, frequency, salience, verification, centrality, and utility."},
            {"id": "n_episodic", "name": "Episodic Memory", "type": "Concept", "desc": "Temporal log of conversational interactions, events, emotional markers, and historical trajectories."},
            {"id": "n_semantic", "name": "Semantic Memory", "type": "Concept", "desc": "Structured factual knowledge, user profile attributes, entity-relation triples, and world concepts."},
            {"id": "n_procedural", "name": "Procedural Memory", "type": "Concept", "desc": "Learned user workflows, coding formatting habits, response depth rules, and heuristics."},
            {"id": "n_graphrag", "name": "GraphRAG", "type": "Tool", "desc": "Graph-based retrieval-augmented generation combining semantic vector lookup with topological knowledge graph expansion."},
            {"id": "n_vector_rag", "name": "Vector Retrieval", "type": "Tool", "desc": "Dense embedding nearest-neighbor search using cosine similarity over chunked text."},
            {"id": "n_langgraph", "name": "LangGraph Agent Engine", "type": "Tool", "desc": "Cyclic state-machine orchestrator coordinating retrieval, reflection, planning, and generation."},
            {"id": "n_msr", "name": "Microsoft Research", "type": "Organization", "desc": "Leading research institution investigating human-centered AI, cognitive systems, and graph intelligence."},
            {"id": "n_ragas", "name": "RAGAS Evaluation", "type": "Process", "desc": "Framework evaluating faithfulness, answer relevance, and context recall in retrieval-augmented systems."},
            {"id": "n_user_profile", "name": "User Trishna", "type": "Person", "desc": "AI Researcher specializing in memory systems, graph neural networks, and personalized agent architectures."},
            {"id": "n_feedback_loop", "name": "Feedback Consolidation", "type": "Process", "desc": "Online loop updating memory weights, resolving fact contradictions, and reinforcing procedural rules."},
            {"id": "n_faiss", "name": "FAISS Vector Index", "type": "Tool", "desc": "High-performance vector similarity search library developed for dense indexing."},
            {"id": "n_pagerank", "name": "Personalized PageRank", "type": "Process", "desc": "Random walk algorithm highlighting central entities relevant to query seed nodes."}
        ]
        
        for item in seed_data:
            self.add_node(
                db,
                name=item["name"],
                entity_type=item["type"],
                description=item["desc"],
                decay_score=0.95,
                node_id=item["id"],
                properties={"category": item["type"], "status": "Consolidated Core"}
            )
            
        seed_edges = [
            ("n_shared_mem", "n_decay_sys", "utilizes", "Implements 6-factor composite scoring"),
            ("n_shared_mem", "n_episodic", "manages", "Stores temporal interactions"),
            ("n_shared_mem", "n_semantic", "indexes", "Builds knowledge graph triples"),
            ("n_shared_mem", "n_procedural", "executes", "Enforces user workflow guidelines"),
            ("n_decay_sys", "n_feedback_loop", "triggered_by", "Feedback adjusts reinforcement weight"),
            ("n_graphrag", "n_semantic", "queries", "Traverses multi-hop entity triples"),
            ("n_graphrag", "n_vector_rag", "complements", "Fuses vector proximity with graph topology"),
            ("n_graphrag", "n_pagerank", "computes", "Calculates topological relevance"),
            ("n_langgraph", "n_graphrag", "orchestrates", "Executes retrieval tool in state graph"),
            ("n_user_profile", "n_shared_mem", "researches", "Designing human-centered cognitive agents"),
            ("n_user_profile", "n_msr", "applicant_for", "Targeting Microsoft Research internship flagship"),
            ("n_msr", "n_graphrag", "innovates", "Pioneers graph-augmented LLM architectures"),
            ("n_ragas", "n_graphrag", "benchmarks", "Measures context precision, recall, and faithfulness"),
            ("n_vector_rag", "n_faiss", "powered_by", "Uses FAISS Inner-Product indexing")
        ]
        
        for s, t, rel, ev in seed_edges:
            self.add_edge(db, s, t, rel, weight=1.0, evidence=ev)

kg_engine = KnowledgeGraphEngine()
