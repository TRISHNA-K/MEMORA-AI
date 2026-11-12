export type AppMode = 'assistant' | 'graph' | 'memory' | 'research' | 'personalization';

export interface ThoughtStep {
  step: string;
  description: string;
  data?: Record<string, any>;
}

export interface RetrievedMemoryItem {
  id: string;
  type: string;
  content: string;
  score: number;
  decay_score: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface KGNode {
  id: string;
  name: string;
  entity_type: string;
  description?: string;
  properties?: Record<string, any>;
  decay_score: number;
  degree_connections: number;
  created_at?: string;
  updated_at?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface KGEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  weight: number;
  evidence?: string;
}

export interface SubgraphData {
  nodes: KGNode[];
  edges: KGEdge[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thoughts?: ThoughtStep[];
  retrieved_memories?: RetrievedMemoryItem[];
  subgraph?: SubgraphData;
  latency_ms?: number;
  mode_used?: string;
}

export interface MemoryOverviewStats {
  working_memory_count: number;
  episodic_count: number;
  semantic_triples_count: number;
  procedural_rules_count: number;
  average_retention: number;
  consolidated_items: number;
  categories: Record<string, number>;
}

export interface MemoryItem {
  id: string;
  memory_type: string;
  title: string;
  content: string;
  category: string;
  importance: number;
  decay_score: number;
  access_count: number;
  created_at: string;
  last_accessed: string;
  verified: boolean;
  metadata?: Record<string, any>;
}

export interface MetricScorecard {
  variant_name: string;
  retrieval_accuracy: number;
  context_precision: number;
  context_recall: number;
  faithfulness: number;
  answer_relevance: number;
  personalization_quality: number;
  response_latency_ms: number;
  user_satisfaction: number;
  sample_responses?: Array<{ query: string; response: string }>;
}

export interface ExperimentReport {
  experiment_id: string;
  experiment_title: string;
  hypothesis: string;
  findings_summary: string;
  scorecards: MetricScorecard[];
  radar_metrics: Array<Record<string, any>>;
  bar_chart_data: Array<Record<string, any>>;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  preferred_tone: string;
  detail_level: string;
}
