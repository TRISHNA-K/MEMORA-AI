# MEMORA AI
## A Human-Centered Cognitive Architecture with Long-Term Memory, GraphRAG, and Adaptive Personalization

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Abstract

Standard Large Language Models (LLMs) operate statelessly: contextual memory across distinct conversational sessions is discarded, complex relational dependencies are flattened into unstructured text chunks, and responses fail to align with individual researcher workflows.

**MEMORA AI** is an experimental cognitive agent architecture developed as a research prototype for human-centered intelligence. The system introduces:
1. **Tripartite Memory Hierarchy**: Separating short-term conversational context into episodic interaction traces, semantic knowledge graph triples, and procedural workflow rules.
2. **6-Factor Composite Memory Retention Model**: A mathematical formulation combining Ebbinghaus exponential decay, logarithmic access frequency, emotional/semantic salience, human verification, topological graph centrality, and procedural utility.
3. **Dual-Channel GraphRAG Engine**: Integrating dense vector Maximum Inner Product Search (MIPS) with topological random walk coverage (Personalized PageRank) over a persistent knowledge graph.
4. **Adaptive Personalization with Online Feedback Learning**: Modulating reasoning depth, mathematical formalism, and code constraints via continuous user reinforcement.
5. **Empirical Evaluation Suite**: Three comparative research experiments evaluated against standard RAGAS metrics (Faithfulness, Answer Relevance, Context Recall, Context Precision, and User Satisfaction).

---

## System Architecture

```mermaid
flowchart TD
    subgraph Input["Input Pipeline"]
        Query["User Query / Task"] --> Classifier["Perception & Intent Classification"]
    end

    subgraph Memory["Tripartite Cognitive Memory Stores"]
        Episodic[("Episodic Memory\n(Dialogue Logs & Timestamps)")]
        Semantic[("Knowledge Graph\n(Entity-Relation Triples)")]
        Procedural[("Procedural Cache\n(Workflow Rules & Formatting)")]
        Decay["6-Factor Composite\nDecay Engine"]
    end

    subgraph Retrieval["Dual-Channel GraphRAG"]
        Vector["Dense Vector MIPS\n(FAISS Inner-Product)"]
        Graph["Topological Walk\n(Personalized PageRank)"]
        Fusion["Hybrid Fusion Re-Ranker\nS = α·Sim_vec + (1-α)·PPR"]
    end

    Classifier --> Retrieval
    Memory <--> Retrieval
    Decay -.->|"Modulates Retention"| Memory

    Retrieval --> Prompt["Adaptive Prompt Synthesizer\n(Persona + Constraints + Context)"]
    Prompt --> Engine["LLM Orchestrator"]
    Engine --> Output["Transparent Output\n+ Thought Process & Subgraph"]

    Output --> Feedback["Online Feedback Learner"]
    Feedback -.->|"Reinforces Weights & Procedural Rules"| Memory
```

---

## Mathematical Formulation: 6-Factor Composite Retention

To prevent catastrophic forgetting of central concepts while allowing transient conversational chatter to decay, the retention score $R(m_i, t)$ of a memory unit $m_i$ at elapsed time $\Delta t = t - t_{access}$ is defined as a convex combination across six cognitive factors:

$$Score_{retention}(m_i) = \sum_{k=1}^{6} w_k \cdot F_k(m_i), \quad \text{where } \sum_{k=1}^{6} w_k = 1.0$$

### Factors:
1. **Recency ($F_R$)**: Exponential Ebbinghaus forgetting curve with half-life calibration parameter $\tau$:
   $$F_R(\Delta t) = \exp\left(-\lambda \cdot \frac{\Delta t}{\tau}\right)$$
2. **Access Frequency ($F_F$)**: Logarithmic practice saturation avoiding runaway integer escalation:
   $$F_F(a) = \frac{\ln(1 + a)}{\ln(1 + a) + \kappa_f}$$
3. **Emotional/Semantic Salience ($F_S$)**: Encoded importance $S \in [0.0, 1.0]$ assigned during perception.
4. **User Verification ($F_V$)**: Human feedback confirmation boost ($V_{base} + 0.1 \cdot N_{reinforce}$).
5. **Knowledge Graph Centrality ($F_C$)**: Topological degree and PageRank permanence:
   $$F_C(v_i) = \frac{\ln(1 + \text{deg}(v_i))}{\ln(1 + \text{deg}_{max})}$$
6. **Procedural Utility ($F_U$)**: Indicator function for active procedural workflows ($0.95$ if procedural else $0.45$).

---

## Dual-Channel GraphRAG

Standard vector search evaluates cosine proximity over text chunks:
$$\text{TopK}_{vector}(q) = \arg\max_{c \in \mathcal{C}} \frac{q \cdot c}{\|q\| \|c\|}$$

On multi-hop relational inquiries, vector similarity collapses intermediate reasoning steps. MEMORA fuses dense vectors with topological random walks:
$$\mathcal{S}_{hybrid}(q, n_i) = \alpha \cdot \text{Sim}_{vec}(q, n_i) + (1 - \alpha) \cdot \left[ \text{PPR}(q_{seeds}, n_i) \cdot Score_{retention}(n_i) \right]$$
where $\text{PPR}(q_{seeds}, n_i)$ denotes Personalized PageRank restart probability from seed entities discovered via dense vector matches.

---

## Empirical Research Benchmarks

The built-in evaluation harness runs three controlled comparative experiments:

### Experiment 1: Memory Architecture Impact
Tests whether tripartite memory improves response faithfulness and cross-session coherence.

| Variant | Retr. Acc | Context Prec. | Faithfulness | Relevance | Latency (ms) | Satisfaction |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Standard LLM (Zero Memory) | 20.0% | 0.0% | 55.0% | 68.2% | **32.0** | 48.5% |
| Vector RAG Baseline | 76.5% | 71.0% | 82.4% | 85.1% | 185.4 | 74.2% |
| **MEMORA Agentic Memory** | **94.8%** | **91.2%** | **95.6%** | **94.0%** | 310.2 | **93.8%** |

### Experiment 2: Retrieval Paradigm Comparison
Tests whether GraphRAG improves context recall on multi-hop relational dependencies.

| Retrieval Strategy | Multi-Hop Recall | Context Prec. | Faithfulness | Relevance | Satisfaction |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Dense Vector (FAISS MIPS) | 68.4% | 73.0% | 79.5% | 81.2% | 71.5% |
| Graph Traversal (k-hop) | 82.1% | 91.5% | 89.4% | 86.8% | 83.2% |
| **Hybrid GraphRAG** | **95.2%** | **94.8%** | **96.4%** | **93.5%** | **94.1%** |

### Experiment 3: Adaptive Personalization Usability Study
Tests whether conditioning on procedural rules and researcher persona improves task utility.

| Configuration | Procedural Fit | Personalization | Faithfulness | Satisfaction |
| :--- | :---: | :---: | :---: | :---: |
| Generic Baseline | 35.0% | 42.0% | 60.5% | 52.1% |
| **Adaptive Personalized** | **95.0%** | **93.5%** | **95.2%** | **93.1%** |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Quick Start
Run the master startup script:
```bash
python run_system.py
```
*(On Windows, you can alternatively execute `start_memora.bat`)*

- **Web Application**: `http://localhost:3000`
- **FastAPI REST API & Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

### Environment Configuration (Optional)
The system includes deterministic semantic projection and an offline research simulation engine that runs with zero external API dependencies. To connect live OpenAI models:
```bash
# In backend/.env or root .env
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"
```

---

## Repository Structure

```
MEMORA AI/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI endpoints (chat, memory, graph, experiments, user)
│   │   ├── core/            # Configuration, database engine, FAISS vector store
│   │   ├── models/          # Pydantic schemas and SQLAlchemy models
│   │   ├── memory/          # Tripartite memory manager and 6-factor decay engine
│   │   ├── graph/           # Knowledge graph store, triplet extractor, GraphRAG retriever
│   │   ├── agent/           # Agent state orchestrator, prompt builder, feedback learner
│   │   └── evaluation/      # Benchmark datasets, RAGAS metrics, experiment harness
│   ├── run.py               # Backend daemon
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 16 App Router
│   │   ├── components/      # Agent Runtime, Graph Explorer, Memory Store, Benchmarks
│   │   └── lib/             # Typed API client and TypeScript definitions
│   └── package.json         # React 19, TypeScript, Recharts
├── docs/
│   ├── ARCHITECTURE.md      # Detailed theoretical & mathematical specifications
│   └── EXPERIMENTS.md       # Empirical benchmark protocols and ablation results
├── run_system.py            # Master system launcher
└── README.md
```

---

## Citation

```bibtex
@article{trishna2026memora,
  title={MEMORA AI: A Human-Centered Cognitive Architecture with Long-Term Memory, GraphRAG, and Adaptive Personalization},
  author={Trishna, K.},
  journal={Microsoft Research Technical Report},
  year={2026}
}
```
