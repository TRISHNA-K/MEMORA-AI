'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Sliders,
  X,
  Plus,
  Sparkles,
  Zap,
  BookOpen,
  History
} from 'lucide-react';
import { MemoryItem, MemoryOverviewStats } from '@/lib/types';
import { api } from '@/lib/api';

export const MemoryExplorerView: React.FC = () => {
  const [stats, setStats] = useState<MemoryOverviewStats | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consolidating, setConsolidating] = useState(false);

  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImportance, setEditImportance] = useState(0.8);
  const [editCategory, setEditCategory] = useState('Concept');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, listData] = await Promise.all([
        api.getMemoryOverview(),
        api.getMemories(selectedCategory, debouncedSearch)
      ]);
      setStats(overviewData);
      setMemories(listData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to memory stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, debouncedSearch]);

  const handleConsolidate = async () => {
    setConsolidating(true);
    try {
      await api.triggerConsolidation();
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Consolidation routine failed.');
    } finally {
      setConsolidating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently prune this memory item?')) return;
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (stats) {
        setStats({ ...stats, semantic_triples_count: Math.max(0, stats.semantic_triples_count - 1) });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete memory item.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await api.updateMemory(editingItem.id, editContent, editImportance, editCategory);
      setEditingItem(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update memory.');
    }
  };

  const openEditModal = (item: MemoryItem) => {
    setEditingItem(item);
    setEditContent(item.content);
    setEditImportance(item.importance);
    setEditCategory(item.category);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#06080F] text-slate-100 cyber-grid overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="p-6 border-b border-white/[0.08] bg-[#0A0D18]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 font-semibold">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>PERSISTENT TRIPARTITE MEMORY ENGINE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Memory Store Explorer
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Inspect active working context, episodic logs, knowledge graph semantic triples, and procedural rule cache governed by 6-factor composite decay.
            </p>
          </div>

          <button
            onClick={handleConsolidate}
            disabled={consolidating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${consolidating ? 'animate-spin' : ''}`} />
            <span>{consolidating ? 'Consolidating...' : 'Run Consolidation'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6 flex-1 w-full">
        {error && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center justify-between font-mono">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-cyan-500/40 transition">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Working Window</span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.working_memory_count ?? 6}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">active turns</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-cyan-500/40 transition">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Episodic Logs</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {stats?.episodic_count ?? 8}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">dialogue episodes</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-purple-500/40 transition">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Semantic Triples</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {stats?.semantic_triples_count ?? 15}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">graph triples</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Procedural Rules</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {stats?.procedural_rules_count ?? 3}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">active workflows</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-emerald-500/40 transition">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Mean Retention</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {stats?.average_retention ? `${Math.round(stats.average_retention * 100)}%` : '98%'}
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">composite score</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-inner">
            {['all', 'episodic', 'semantic', 'procedural'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs capitalize font-medium transition ${
                  selectedCategory === tab
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, subject, or predicate..."
              className="w-full bg-[#0C101E]/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
            />
          </div>
        </div>

        {/* Memory List */}
        <div className="space-y-3">
          {memories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs italic glass-panel rounded-2xl">
              No memory items match current filter parameters.
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl glass-panel hover:bg-slate-800/40 hover:border-slate-700/80 transition-all duration-200 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold font-mono border ${
                        m.memory_type === 'episodic'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : m.memory_type === 'procedural'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {m.memory_type}
                    </span>
                    <span className="font-semibold text-slate-100 text-sm font-sans">{m.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">#{m.id}</span>
                  </div>

                  <p className="text-xs text-slate-200 whitespace-pre-wrap bg-[#080B14]/90 p-3 rounded-xl border border-white/5 leading-relaxed font-mono">
                    {m.content}
                  </p>

                  <div className="flex items-center gap-5 text-[11px] text-slate-400">
                    <span>Category: <strong className="text-slate-300 font-normal">{m.category}</strong></span>
                    <span>Access Count: <strong className="text-slate-300 font-normal">{m.access_count}</strong></span>
                    <span>Recorded: <strong className="text-slate-300 font-normal">{m.created_at}</strong></span>
                  </div>
                </div>

                {/* Retention Bar & Actions */}
                <div className="flex flex-col items-end space-y-3 shrink-0">
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Retention
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {(m.decay_score * 100).toFixed(1)}%
                    </span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        style={{ width: `${m.decay_score * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 transition"
                      title="Edit content"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition"
                      title="Prune memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass-panel-elevated rounded-2xl p-6 shadow-2xl relative text-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-sm font-sans">Edit Memory Entry [{editingItem.id}]</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">Content Text:</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full bg-[#080B14] border border-white/10 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Category:</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#080B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Salience ({Math.round(editImportance * 100)}%):
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={editImportance}
                  onChange={(e) => setEditImportance(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md transition"
              >
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryExplorerView;
