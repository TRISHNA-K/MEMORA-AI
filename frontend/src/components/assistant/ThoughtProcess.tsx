'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Database, 
  Share2, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { ThoughtStep, RetrievedMemoryItem, SubgraphData } from '@/lib/types';

interface ThoughtProcessProps {
  thoughts: ThoughtStep[];
  memories?: RetrievedMemoryItem[];
  subgraph?: SubgraphData;
  latencyMs?: number;
  modeUsed?: string;
}

export const ThoughtProcess: React.FC<ThoughtProcessProps> = ({
  thoughts,
  memories = [],
  subgraph,
  latencyMs,
  modeUsed = 'memora_agentic'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'memories' | 'subgraph'>('steps');

  if (!thoughts || thoughts.length === 0) return null;

  return (
    <div className="my-3 rounded-2xl border border-white/10 bg-[#080B14]/80 backdrop-blur-md overflow-hidden text-xs">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition text-slate-300"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-3 h-3" />
          </div>
          <span className="font-semibold text-white">Cognitive Trace</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
            {thoughts.length} steps
          </span>
          {memories.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {memories.length} retrieved
            </span>
          )}
          {latencyMs && (
            <span className="text-[11px] font-mono text-cyan-400/80">
              {latencyMs}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span>{isOpen ? 'hide' : 'inspect'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#060810]/90">
          <div className="flex gap-2 border-b border-white/10 pb-2.5">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'steps'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reasoning Steps ({thoughts.length})
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'memories'
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Context Passages ({memories.length})
            </button>
            {subgraph && (subgraph.nodes?.length > 0 || subgraph.edges?.length > 0) && (
              <button
                onClick={() => setActiveTab('subgraph')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  activeTab === 'subgraph'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Subgraph (|V|={subgraph.nodes.length})
              </button>
            )}
          </div>

          {activeTab === 'steps' && (
            <div className="space-y-2">
              {thoughts.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-white">{step.step}</div>
                    <div className="text-slate-300 leading-relaxed font-sans">{step.description}</div>
                    {step.data && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 font-mono">
                        {Object.entries(step.data).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-cyan-300 border border-white/5">
                            {k}={String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'memories' && (
            <div className="space-y-2">
              {memories.length === 0 ? (
                <p className="text-slate-400 italic py-2">No external context chunks retrieved.</p>
              ) : (
                memories.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] uppercase font-bold">
                          {m.type}
                        </span>
                        {m.category && (
                          <span className="text-slate-400">
                            [{m.category}]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400">Sim: {(m.score * 100).toFixed(0)}%</span>
                        <span className="text-emerald-400">Ret: {(m.decay_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-mono text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5">{m.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'subgraph' && subgraph && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block font-semibold">
                    Entities Linked ({subgraph.nodes.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {subgraph.nodes.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium">
                        {n.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block font-semibold">
                    Relational Edges ({subgraph.edges.length})
                  </span>
                  <div className="space-y-1 text-[11px] font-mono text-slate-300">
                    {subgraph.edges.slice(0, 4).map((e, i) => (
                      <div key={i} className="truncate">
                        <span className="text-slate-400">{e.source_id}</span> <span className="text-cyan-400">-[{e.relation_type}]-&gt;</span> <span className="text-slate-400">{e.target_id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThoughtProcess;
