'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  Cpu, 
  Share2, 
  Sliders, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  RefreshCw,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { api } from '@/lib/api';
import { ThoughtProcess } from './ThoughtProcess';
import { FeedbackModal } from './FeedbackModal';

interface ChatInterfaceProps {
  onMemoryUpdated?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMemoryUpdated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'memora_agentic' | 'rag_vector' | 'standard_llm'>('memora_agentic');
  const [strategy, setStrategy] = useState<'hybrid_graphrag' | 'vector_only' | 'graph_traversal'>('hybrid_graphrag');
  const [personalization, setPersonalization] = useState(true);
  
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<{ id?: string; query?: string; resp?: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendChat({
        message: text,
        mode,
        retrieval_strategy: strategy,
        personalization_enabled: personalization
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        thoughts: res.thoughts,
        retrieved_memories: res.retrieved_memories,
        subgraph: res.knowledge_subgraph,
        latency_ms: res.latency_ms,
        mode_used: res.mode_used
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (onMemoryUpdated) onMemoryUpdated();
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Execution failed: ${err.message}. Verify backend daemon at port 8000.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const presetQueries = [
    {
      title: '6-Factor Decay Formulation',
      query: 'Derive the mathematical formulation of the 6-factor composite memory decay system and state its half-life parameters.',
      domain: 'Memory Systems'
    },
    {
      title: 'GraphRAG vs Vector MIPS',
      query: 'Compare Hybrid GraphRAG against standard Vector MIPS on multi-hop entity reasoning and topological context recall.',
      domain: 'Retrieval'
    },
    {
      title: 'Tripartite Consolidation',
      query: 'Describe how episodic interaction traces consolidate into permanent semantic graph triples and procedural workflow rules.',
      domain: 'Cognitive Architecture'
    },
    {
      title: 'MSR Benchmark Suite',
      query: 'Outline the experimental hypotheses, baseline configurations, and RAGAS metrics evaluated across Experiments 1, 2, and 3.',
      domain: 'Evaluation'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#080B11] text-slate-200">
      {/* Technical Header Toolbar */}
      <header className="px-5 py-3 border-b border-slate-800/90 bg-[#0C101A] flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px] uppercase">Execution Mode:</span>
            <div className="flex bg-[#07090F] p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setMode('memora_agentic')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                  mode === 'memora_agentic'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/70 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                agentic_memory
              </button>
              <button
                onClick={() => setMode('rag_vector')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                  mode === 'rag_vector'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/70 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                vector_rag
              </button>
              <button
                onClick={() => setMode('standard_llm')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                  mode === 'standard_llm'
                    ? 'bg-slate-800 text-slate-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                zero_shot_baseline
              </button>
            </div>
          </div>

          {mode === 'memora_agentic' && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="text-slate-400 font-mono text-[11px] uppercase">Retrieval Strategy:</span>
              <select
                value={strategy}
                onChange={(e: any) => setStrategy(e.target.value)}
                className="bg-[#07090F] border border-slate-800 rounded px-2.5 py-1 text-[11px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
              >
                <option value="hybrid_graphrag">hybrid_graphrag (vector + ppr)</option>
                <option value="graph_traversal">graph_traversal (k-hop)</option>
                <option value="vector_only">vector_only (faiss)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-[11px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={personalization}
              onChange={(e) => setPersonalization(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className={personalization ? 'text-cyan-400' : 'text-slate-500'}>
              adaptive_persona [active]
            </span>
          </label>
        </div>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-10 space-y-6">
            <div className="border border-slate-800/90 rounded-xl p-5 bg-[#0C101A] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold">
                  <Terminal className="w-4 h-4" />
                  MEMORA COGNITIVE RUNTIME v1.0
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Target: Microsoft Research Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Human-centered agent runtime equipped with tripartite memory stores (episodic interaction history, semantic graph triples, and procedural workflow rules). Select a benchmark prompt below or execute a custom query.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-[#0C101A]/60 hover:bg-[#0E1422] hover:border-slate-700 transition text-left space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {item.domain}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-mono">
                    {item.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1.5">
                <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#182338] border border-cyan-900/60 text-slate-100'
                        : 'bg-[#0C101A] border border-slate-800/90 text-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Turn Header */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800/70 text-[10px] font-mono text-slate-400">
                      <span className={msg.role === 'assistant' ? 'text-cyan-400' : 'text-slate-300'}>
                        {msg.role === 'assistant'
                          ? `agent [${msg.mode_used || mode}]`
                          : 'researcher'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Content */}
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed space-y-2">
                      {msg.content}
                    </div>

                    {/* Reasoning Trace Drawer */}
                    {msg.thoughts && msg.thoughts.length > 0 && (
                      <ThoughtProcess
                        thoughts={msg.thoughts}
                        memories={msg.retrieved_memories}
                        subgraph={msg.subgraph}
                        latencyMs={msg.latency_ms}
                        modeUsed={msg.mode_used}
                      />
                    )}

                    {/* Action Toolbar */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/70">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                          <button
                            onClick={() => {
                              setSelectedEpisode({ id: msg.id, resp: msg.content });
                              setFeedbackModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Reinforce</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEpisode({ id: msg.id, resp: msg.content });
                              setFeedbackModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>Critique</span>
                          </button>
                        </div>

                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center p-3.5 max-w-sm rounded-xl bg-[#0C101A] border border-slate-800 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="font-mono text-[11px]">Traversing graph & computing retention...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800/90 bg-[#0C101A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto flex gap-2.5 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Execute query or enter instruction..."
            className="flex-1 bg-[#07090F] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-medium transition disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>Run</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        episodeId={selectedEpisode.id}
        query={selectedEpisode.query}
        response={selectedEpisode.resp}
        onFeedbackSubmitted={onMemoryUpdated}
      />
    </div>
  );
};

export default ChatInterface;
