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
  Plus
} from 'lucide-react';
import { MemoryItem, MemoryOverviewStats } from '@/lib/types';
import { api } from '@/lib/api';

export const MemoryExplorerView: React.FC = () => {
  const [stats, setStats] = useState<MemoryOverviewStats | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [consolidating, setConsolidating] = useState(false);

  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImportance, setEditImportance] = useState(0.8);
  const [editCategory, setEditCategory] = useState('Concept');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewData, listData] = await Promise.all([
        api.getMemoryOverview(),
        api.getMemories(selectedCategory, search)
      ]);
      setStats(overviewData);
      setMemories(listData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const handleConsolidate = async () => {
    setConsolidating(true);
    try {
      await api.triggerConsolidation();
      await fetchData();
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await api.updateMemory(editingItem.id, editContent, editImportance, editCategory);
      setEditingItem(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (item: MemoryItem) => {
    setEditingItem(item);
    setEditContent(item.content);
    setEditImportance(item.importance);
    setEditCategory(item.category);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#080B11] text-slate-200 overflow-y-auto font-mono">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/90 bg-[#0C101A]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-purple-400 uppercase tracking-wider">
                PERSISTENT MEMORY STORAGE & CONSOLIDATION
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
              Memory Store Explorer
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-sans">
              Inspect active working context, episodic logs, knowledge graph semantic triples, and procedural rule cache governed by 6-factor composite decay.
            </p>
          </div>

          <button
            onClick={handleConsolidate}
            disabled={consolidating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-mono font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${consolidating ? 'animate-spin' : ''}`} />
            <span>{consolidating ? 'Consolidating...' : 'Run Consolidation Routine'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6 flex-1 w-full">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Working Window</span>
            <div className="text-xl font-bold text-slate-100">
              {stats?.working_memory_count ?? 6}
            </div>
            <span className="text-[9px] text-slate-500">active turns</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Episodic Logs</span>
            <div className="text-xl font-bold text-cyan-400">
              {stats?.episodic_count ?? 8}
            </div>
            <span className="text-[9px] text-slate-500">recorded episodes</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Semantic Triples</span>
            <div className="text-xl font-bold text-purple-400">
              {stats?.semantic_triples_count ?? 14}
            </div>
            <span className="text-[9px] text-slate-500">graph facts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Procedural Rules</span>
            <div className="text-xl font-bold text-amber-400">
              {stats?.procedural_rules_count ?? 3}
            </div>
            <span className="text-[9px] text-slate-500">active workflows</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Mean Retention</span>
            <div className="text-xl font-bold text-emerald-400">
              {stats?.average_retention ? `${Math.round(stats.average_retention * 100)}%` : '92%'}
            </div>
            <span className="text-[9px] text-emerald-500">decay coefficient</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex bg-[#0C101A] p-0.5 rounded-lg border border-slate-800">
            {['all', 'episodic', 'semantic', 'procedural'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-3 py-1 rounded text-[11px] capitalize transition ${
                  selectedCategory === tab
                    ? 'bg-purple-950 text-purple-300 border border-purple-800/80 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="query memory store..."
              className="w-full bg-[#0C101A] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Memory List */}
        <div className="space-y-2.5">
          {memories.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs italic bg-[#0C101A] rounded-xl border border-slate-800">
              No memory items match current filter parameters.
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[#0C101A] hover:bg-[#0E1422] border border-slate-800/90 transition flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold border ${
                        m.memory_type === 'episodic'
                          ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
                          : m.memory_type === 'procedural'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                          : 'bg-purple-950/80 text-purple-400 border-purple-800/60'
                      }`}
                    >
                      {m.memory_type}
                    </span>
                    <span className="font-semibold text-slate-200 font-sans">{m.title}</span>
                    <span className="text-[10px] text-slate-500">[{m.id}]</span>
                  </div>

                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap bg-[#080B11] p-2 rounded border border-slate-800/70 leading-relaxed font-mono">
                    {m.content}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span>Category: <strong className="text-slate-400 font-normal">{m.category}</strong></span>
                    <span>Access Count: <strong className="text-slate-400 font-normal">{m.access_count}</strong></span>
                    <span>Recorded: <strong className="text-slate-400 font-normal">{m.created_at}</strong></span>
                  </div>
                </div>

                {/* Retention Bar & Actions */}
                <div className="flex flex-col items-end space-y-2 shrink-0">
                  <div className="text-right space-y-1">
                    <span className="text-[9px] text-slate-400 block uppercase">
                      Decay Retention
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {(m.decay_score * 100).toFixed(1)}%
                    </span>
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${m.decay_score * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                      title="Edit content"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      title="Prune memory"
                    >
                      <Trash2 className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0C101A] border border-slate-700 rounded-xl p-5 shadow-2xl relative text-slate-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 font-sans">Edit Memory Entry [{editingItem.id}]</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Content Text:</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full bg-[#080B11] border border-slate-800 rounded p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Category:</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#080B11] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Salience Weight ({Math.round(editImportance * 100)}%):
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white rounded transition"
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
