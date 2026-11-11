'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Database, 
  Share2, 
  CheckCircle2, 
  Layers 
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
    <div className="my-2 rounded-lg border border-slate-800 bg-[#07090F] overflow-hidden text-xs font-mono">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#090D15] hover:bg-[#0C121D] transition text-slate-300"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">Execution Trace</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {thoughts.length} steps
          </span>
          {memories.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-900/60">
              {memories.length} memories retrieved
            </span>
          )}
          {latencyMs && (
            <span className="text-[10px] text-slate-500">
              {latencyMs}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[10px]">
          <span>{isOpen ? 'collapse' : 'expand trace'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-[#07090F]">
          <div className="flex gap-2 border-b border-slate-800/80 pb-2">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                activeTab === 'steps'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Trace Steps ({thoughts.length})
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                activeTab === 'memories'
                  ? 'bg-slate-800 text-indigo-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Retrieved Chunks ({memories.length})
            </button>
            {subgraph && (subgraph.nodes?.length > 0 || subgraph.edges?.length > 0) && (
              <button
                onClick={() => setActiveTab('subgraph')}
                className={`px-2 py-0.5 rounded text-[10px] transition ${
                  activeTab === 'subgraph'
                    ? 'bg-slate-800 text-purple-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Subgraph (|V|={subgraph.nodes.length})
              </button>
            )}
          </div>

          {activeTab === 'steps' && (
            <div className="space-y-1.5">
              {thoughts.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start p-2 rounded bg-[#090D14] border border-slate-800/70 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-slate-200">{step.step}</div>
                    <div className="text-slate-400 leading-relaxed font-sans">{step.description}</div>
                    {step.data && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(step.data).map(([k, v]) => (
                          <span key={k} className="px-1.5 py-0.2 rounded bg-slate-800/80 text-[10px] text-slate-400">
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
            <div className="space-y-1.5">
              {memories.length === 0 ? (
                <p className="text-slate-500 italic py-1">No external context chunks retrieved.</p>
              ) : (
                memories.map((m, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#090D14] border border-slate-800/70 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                          {m.type}
                        </span>
                        {m.category && (
                          <span className="text-slate-400">
                            [{m.category}]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">sim={(m.score * 100).toFixed(0)}%</span>
                        <span className="text-emerald-400">ret={(m.decay_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{m.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'subgraph' && subgraph && (
            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#090D14] border border-slate-800">
                  <span className="text-slate-400 text-[10px] block mb-1">Entities ({subgraph.nodes.length}):</span>
                  <div className="flex flex-wrap gap-1">
                    {subgraph.nodes.map((n, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px]">
                        {n.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-2 rounded bg-[#090D14] border border-slate-800">
                  <span className="text-slate-400 text-[10px] block mb-1">Edges ({subgraph.edges.length}):</span>
                  <div className="space-y-0.5 text-[10px] text-slate-400">
                    {subgraph.edges.slice(0, 4).map((e, i) => (
                      <div key={i} className="truncate">
                        {e.source_id} -[{e.relation_type}]-&gt; {e.target_id}
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
