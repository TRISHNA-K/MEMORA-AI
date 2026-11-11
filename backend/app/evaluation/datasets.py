from typing import List, Dict, Any

EXPERIMENT_1_BENCHMARK = [
    {
        "id": "exp1_q1",
        "query": "What is the theoretical motivation behind the 6-factor memory decay system?",
        "ground_truth": "The 6-factor decay system models human cognitive retention by balancing temporal recency, repetition frequency, emotional salience, user verification, knowledge graph topological centrality, and procedural utility.",
        "key_entities": ["Memory Decay System", "SharedMemory Architecture", "Ebbinghaus", "Centrality"]
    },
    {
        "id": "exp1_q2",
        "query": "Which research institution is Trishna targeting for the flagship cognitive AI project?",
        "ground_truth": "Trishna is targeting Microsoft Research for the human-centered cognitive agent flagship project.",
        "key_entities": ["Microsoft Research", "Trishna K.", "Internship"]
    },
    {
        "id": "exp1_q3",
        "query": "How does Memora handle procedural memory and formatting constraints?",
        "ground_truth": "Memora captures procedural workflows such as LaTeX mathematical derivations and strict PyTorch typing, automatically enforcing them during response synthesis.",
        "key_entities": ["Procedural Memory", "LaTeX", "PyTorch"]
    }
]

EXPERIMENT_2_BENCHMARK = [
    {
        "id": "exp2_q1",
        "query": "What cognitive components does the SharedMemory Architecture manage and connect?",
        "ground_truth": "SharedMemory manages Episodic Memory, indexes Semantic Memory triples, and executes Procedural Memory workflows via GraphRAG.",
        "key_entities": ["SharedMemory Architecture", "Episodic Memory", "Semantic Memory", "Procedural Memory", "GraphRAG"],
        "hop_count": 2
    },
    {
        "id": "exp2_q2",
        "query": "How is the Memory Decay System triggered and what evaluation framework measures its performance?",
        "ground_truth": "The Memory Decay System is triggered by Feedback Consolidation and evaluated via RAGAS metrics for faithfulness and relevance.",
        "key_entities": ["Memory Decay System", "Feedback Consolidation", "RAGAS Evaluation"],
        "hop_count": 2
    },
    {
        "id": "exp2_q3",
        "query": "Explain how GraphRAG complements Vector Retrieval and what graph walk algorithm is used.",
        "ground_truth": "GraphRAG complements Vector Retrieval by fusing semantic embedding similarity with topological Personalized PageRank walks across the entity graph.",
        "key_entities": ["GraphRAG", "Vector Retrieval", "Personalized PageRank"],
        "hop_count": 2
    }
]

EXPERIMENT_3_BENCHMARK = [
    {
        "id": "exp3_q1",
        "query": "Explain how agentic memory prevents catastrophic forgetting in long-running conversational assistants.",
        "target_persona": "academic_rigorous",
        "expected_elements": ["KaTeX math formulation", "exponential decay parameter", "formal terminology", "graph centrality"]
    },
    {
        "id": "exp3_q2",
        "query": "Provide a comparison between Vector RAG and GraphRAG for research discussion.",
        "target_persona": "academic_rigorous",
        "expected_elements": ["structured trade-off matrix", "retrieval complexity", "multi-hop reasoning limits"]
    }
]
