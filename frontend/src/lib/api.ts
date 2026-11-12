import { 
  ChatMessage, 
  MemoryOverviewStats, 
  MemoryItem, 
  KGNode, 
  KGEdge, 
  ExperimentReport, 
  UserProfile 
} from './types';




function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }

  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/+$/, '')}/api`;
  }

  return 'http://127.0.0.1:8000/api';
}

const API_BASE = getApiBase();


async function safeFetch(url: string, options: RequestInit = {}, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s. Check backend server.`);
    }
    throw new Error(`Failed to communicate with MEMORA backend: ${err.message || 'Connection refused'}. Ensure backend is running at http://127.0.0.1:8000.`);
  }
}

export const api = {
  // Chat
  async sendChat(params: {
    message: string;
    session_id?: string;
    user_id?: string;
    mode?: string;
    retrieval_strategy?: string;
    personalization_enabled?: boolean;
  }) {
    const res = await safeFetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }, 30000);
    if (!res.ok) throw new Error(`Chat API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  // Knowledge Graph
  async getFullGraph(): Promise<{ nodes: KGNode[]; edges: KGEdge[]; stats: Record<string, any> }> {
    const res = await safeFetch(`${API_BASE}/graph/full`);
    if (!res.ok) throw new Error(`Graph API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async getSubgraph(nodeId: string, depth = 1) {
    const res = await safeFetch(`${API_BASE}/graph/subgraph?node_id=${encodeURIComponent(nodeId)}&depth=${depth}`);
    if (!res.ok) throw new Error(`Subgraph API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  // Memory
  async getMemoryOverview(): Promise<MemoryOverviewStats> {
    const res = await safeFetch(`${API_BASE}/memory/overview`);
    if (!res.ok) throw new Error(`Memory overview API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async getMemories(category?: string, search?: string): Promise<MemoryItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString();
    const url = qs ? `${API_BASE}/memory/list?${qs}` : `${API_BASE}/memory/list`;
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`Memory list API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async triggerConsolidation() {
    const res = await safeFetch(`${API_BASE}/memory/consolidate`, { method: 'POST' });
    if (!res.ok) throw new Error(`Consolidation API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async updateMemory(id: string, content: string, importance: number, category: string) {
    const res = await safeFetch(`${API_BASE}/memory/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, importance, category }),
    });
    if (!res.ok) throw new Error(`Update memory API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async deleteMemory(id: string) {
    const res = await safeFetch(`${API_BASE}/memory/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete memory API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  // Research Experiments
  async runExperiment(experimentId: string, query?: string): Promise<ExperimentReport> {
    if (query) {
      const res = await safeFetch(`${API_BASE}/experiments/run_custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment_id: experimentId, query }),
      }, 35000);
      if (!res.ok) throw new Error(`Experiment API error (${res.status}): ${res.statusText}`);
      return res.json();
    } else {
      const res = await safeFetch(`${API_BASE}/experiments/run/${encodeURIComponent(experimentId)}`, {}, 35000);
      if (!res.ok) throw new Error(`Experiment API error (${res.status}): ${res.statusText}`);
      return res.json();
    }
  },

  // User & Feedback
  async getUserProfile(): Promise<UserProfile> {
    const res = await safeFetch(`${API_BASE}/user/profile`);
    if (!res.ok) throw new Error(`User profile API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await safeFetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error(`Update profile API error (${res.status}): ${res.statusText}`);
    return res.json();
  },

  async submitFeedback(data: {
    episode_id?: string;
    is_positive: boolean;
    rating?: number;
    feedback_text?: string;
    target_aspect?: string;
  }) {
    const res = await safeFetch(`${API_BASE}/user/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Feedback API error (${res.status}): ${res.statusText}`);
    return res.json();
  },
};
