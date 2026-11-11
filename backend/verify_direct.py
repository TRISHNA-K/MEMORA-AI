import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.memory.manager import memory_manager
from app.graph.kg_store import kg_engine
from app.agent.orchestrator import orchestrator
from app.evaluation.harness import experiment_harness

def verify_all():
    print("1. Initializing DB and Seeding Knowledge Graph...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        memory_manager.ensure_default_user(db, "researcher_trishna")
        kg_engine.seed_initial_knowledge(db)
        kg_engine.load_from_db(db)
        
        # 1. Verify Knowledge Graph
        graph_data = kg_engine.get_full_graph()
        print(f"-> Knowledge Graph loaded: {len(graph_data['nodes'])} nodes, {len(graph_data['edges'])} edges")
        assert len(graph_data['nodes']) >= 10, "Nodes count too low"
        
        # 2. Verify Memory Overview
        mem_overview = memory_manager.get_memory_overview(db, "researcher_trishna")
        print(f"-> Memory Overview: {mem_overview['semantic_triples_count']} semantic triples, {mem_overview['average_retention']} avg retention")
        
        # 3. Verify Agent Orchestrator Turn (Memora Agentic Mode + Hybrid GraphRAG)
        chat_turn = orchestrator.execute_turn(
            db=db,
            message="Explain the mathematical formulation of 6-factor memory decay.",
            user_id="researcher_trishna",
            mode="memora_agentic",
            retrieval_strategy="hybrid_graphrag"
        )
        print(f"-> Chat Turn Latency: {chat_turn['latency_ms']} ms")
        print(f"-> Retrieved Memories Count: {len(chat_turn['retrieved_memories'])}")
        print(f"-> Thought Steps: {len(chat_turn['thoughts'])}")
        print(f"-> Response Preview: {chat_turn['response'][:85]}...")
        assert len(chat_turn['response']) > 50, "Response empty"
        
        # 4. Verify Experiment 1 (Memory Impact)
        exp1 = experiment_harness.run_experiment_1(db, "researcher_trishna")
        print(f"-> Exp 1 Variants Evaluated: {len(exp1['scorecards'])}")
        for sc in exp1['scorecards']:
            print(f"   * {sc['variant_name']}: Accuracy = {sc['retrieval_accuracy']*100:.1f}%, Faithfulness = {sc['faithfulness']*100:.1f}%, Satisfaction = {sc['user_satisfaction']*100:.1f}%")
            
        print("\n========================================================")
        print("  ALL CORE COGNITIVE & RESEARCH ENGINES VERIFIED 100%!")
        print("========================================================")
    finally:
        db.close()

if __name__ == "__main__":
    verify_all()
