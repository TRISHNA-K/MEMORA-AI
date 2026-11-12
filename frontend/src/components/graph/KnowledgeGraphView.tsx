'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Activity, 
  X,
  ExternalLink,
  Download,
  Table,
  Layers
} from 'lucide-react';
import { KGNode, KGEdge } from '@/lib/types';
import { api } from '@/lib/api';

export const KnowledgeGraphView: React.FC = () => {
  const [nodes, setNodes] = useState<KGNode[]>([]);
  const [edges, setEdges] = useState<KGEdge[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<KGNode | null>(null);
  const alphaRef = useRef(1.0);
  const requestFrameRef = useRef<number | null>(null);

  const categories = [
    { label: 'All', color: '#38bdf8' },
    { label: 'Concept', color: '#06b6d4' },
    { label: 'Tool', color: '#ec4899' },
    { label: 'Process', color: '#8b5cf6' },
    { label: 'Person', color: '#f59e0b' },
    { label: 'Organization', color: '#10b981' },
    { label: 'Preference', color: '#3b82f6' }
  ];

  const getColorForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'concept': return '#06b6d4';
      case 'tool': return '#ec4899';
      case 'process': return '#8b5cf6';
      case 'person': return '#f59e0b';
      case 'organization': return '#10b981';
      case 'preference': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFullGraph();
      const width = 800;
      const height = 600;
      const radius = 220;
      const total = data.nodes.length;
      
      const positionedNodes: KGNode[] = data.nodes.map((n, i) => {
        const angle = (i / total) * 2 * Math.PI;
        return {
          ...n,
          x: width / 2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
          y: height / 2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0
        };
      });

      setNodes(positionedNodes);
      setEdges(data.edges);
      setStats(data.stats || {});
      alphaRef.current = 1.0;
      if (positionedNodes.length > 0 && !selectedNode) {
        setSelectedNode(positionedNodes[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to load Knowledge Graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    alphaRef.current = 1.0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      // Force relaxation with exponential cooling to prevent permanent 100% CPU burn
      if (alphaRef.current > 0.005) {
        const alpha = alphaRef.current;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          if (n1 === draggedNodeRef.current) continue;
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = (n2.x || 0) - (n1.x || 0);
            const dy = (n2.y || 0) - (n1.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 170) {
              const force = ((170 - dist) / dist) * 0.035 * alpha;
              n1.x = (n1.x || 0) - dx * force;
              n1.y = (n1.y || 0) - dy * force;
              n2.x = (n2.x || 0) + dx * force;
              n2.y = (n2.y || 0) + dy * force;
            }
          }
        }
        alphaRef.current *= 0.95;
      }

      // Draw Edges
      edges.forEach((edge) => {
        const sNode = nodes.find((n) => n.id === edge.source_id);
        const tNode = nodes.find((n) => n.id === edge.target_id);
        if (sNode && tNode && sNode.x && sNode.y && tNode.x && tNode.y) {
          const isHighlighted = selectedNode && (selectedNode.id === sNode.id || selectedNode.id === tNode.id);

          ctx.beginPath();
          ctx.moveTo(sNode.x, sNode.y);
          ctx.lineTo(tNode.x, tNode.y);
          ctx.strokeStyle = isHighlighted ? 'rgba(6, 182, 212, 0.7)' : 'rgba(38, 50, 70, 0.45)';
          ctx.lineWidth = isHighlighted ? 1.8 : 1.0;
          ctx.stroke();

          // Edge Label
          if (isHighlighted || transformRef.current.k > 1.25) {
            const midX = (sNode.x + tNode.x) / 2;
            const midY = (sNode.y + tNode.y) / 2;
            ctx.fillStyle = isHighlighted ? '#38bdf8' : '#475569';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(edge.relation_type, midX, midY - 4);
          }
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        if (!node.x || !node.y) return;
        const isSelected = selectedNode?.id === node.id;
        const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || node.entity_type.toLowerCase() === selectedCategory.toLowerCase();
        const baseColor = getColorForType(node.entity_type);

        const nodeRadius = isSelected ? 15 : 10;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius + 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = matchesSearch && matchesCategory ? baseColor : '#334155';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : '#080b11';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
        ctx.fillStyle = isSelected ? '#f8fafc' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + nodeRadius + 13);
      });

      ctx.restore();

      // Only loop if physics simulation is cooling down or actively dragging/panning
      if (alphaRef.current > 0.005 || isDraggingRef.current || draggedNodeRef.current !== null) {
        animationFrameId = requestAnimationFrame(render);
        requestFrameRef.current = animationFrameId;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      requestFrameRef.current = null;
    };
  }, [nodes, edges, selectedNode, searchQuery, selectedCategory]);

  const triggerRender = () => {
    alphaRef.current = Math.max(alphaRef.current, 0.3);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Wake up render
    if (!requestFrameRef.current) {
      requestFrameRef.current = requestAnimationFrame(() => {
        requestFrameRef.current = null;
        alphaRef.current = 0.1;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const mouseY = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    for (const node of nodes) {
      if (node.x && node.y) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          draggedNodeRef.current = node;
          setSelectedNode(node);
          triggerRender();
          return;
        }
      }
    }

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    triggerRender();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      draggedNodeRef.current.x = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
      draggedNodeRef.current.y = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;
      triggerRender();
    } else if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      triggerRender();
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingRef.current = false;
    triggerRender();
  };

  const handleZoom = (factor: number) => {
    transformRef.current.k = Math.max(0.4, Math.min(3.0, transformRef.current.k * factor));
    triggerRender();
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
  };

  const exportGraphJson = () => {
    const data = JSON.stringify({ nodes, edges, stats }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memora_knowledge_graph.json';
    a.click();
  };

  const connectedEdges = selectedNode
    ? edges.filter((e) => e.source_id === selectedNode.id || e.target_id === selectedNode.id)
    : [];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#06080F] text-slate-100 overflow-hidden font-sans cyber-grid">
      {/* Top Knowledge Graph Bar */}
      {error && (
        <div className="px-6 py-2.5 bg-red-950/80 border-b border-red-800 text-red-200 text-xs flex items-center justify-between font-mono">
          <span>Failed to connect to backend: {error}</span>
          <button
            onClick={fetchGraph}
            className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold"
          >
            Retry
          </button>
        </div>
      )}
      <header className="px-6 py-3 border-b border-white/[0.08] bg-[#0A0D18]/80 backdrop-blur-xl flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wide">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <span>SHAREDMEMORY TOPOLOGY</span>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, entities, tools..."
              className="w-full bg-[#0C101E]/90 border border-white/10 rounded-xl px-3 pl-8 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.label
                    ? 'bg-slate-800 text-white border border-indigo-500/50 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 shadow-sm"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-cyan-300 font-bold">
            |V| = {nodes.length}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-indigo-300 font-bold">
            |E| = {edges.length}
          </span>
          <button
            onClick={exportGraphJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-sans text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
            title="Export Graph JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Canvas & Detail Sidebar */}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:24px_24px]">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          <div className="absolute bottom-6 left-6 flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel-elevated">
            <button onClick={() => handleZoom(1.2)} className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => handleZoom(0.8)} className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={resetView} className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Node Detail Inspector */}
        {selectedNode && (
          <aside className="w-88 border-l border-white/[0.08] bg-[#0A0D18]/95 backdrop-blur-2xl p-5 flex flex-col justify-between overflow-y-auto text-xs z-10 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border mb-1.5"
                    style={{
                      color: getColorForType(selectedNode.entity_type),
                      borderColor: getColorForType(selectedNode.entity_type) + '40',
                      backgroundColor: getColorForType(selectedNode.entity_type) + '15'
                    }}
                  >
                    {selectedNode.entity_type}
                  </span>
                  <h2 className="text-base font-bold text-white font-sans">{selectedNode.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl glass-panel text-xs text-slate-200 leading-relaxed font-sans">
                {selectedNode.description || 'Extracted entity from conversation episodic traces.'}
              </div>

              {/* Decay Retention Telemetry */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Decay Retention Telemetry
                </span>
                <div className="p-3.5 rounded-2xl glass-panel space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Retention Score:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {(selectedNode.decay_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                      style={{ width: `${selectedNode.decay_score * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
                    <span>Degree: {selectedNode.degree_connections} links</span>
                    <span className="text-emerald-400 font-semibold">Consolidated Core</span>
                  </div>
                </div>
              </div>

              {/* Incident Edges */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Connected Triples ({connectedEdges.length})
                </span>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {connectedEdges.map((edge) => {
                    const isOutgoing = edge.source_id === selectedNode.id;
                    const neighborId = isOutgoing ? edge.target_id : edge.source_id;
                    const neighbor = nodes.find((n) => n.id === neighborId);
                    return (
                      <div
                        key={edge.id}
                        onClick={() => neighbor && setSelectedNode(neighbor)}
                        className="p-3 rounded-xl glass-panel hover:bg-slate-800/80 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between text-xs group"
                      >
                        <div className="truncate pr-2">
                          <span className="text-cyan-400 text-[10px] font-mono block font-semibold">
                            {isOutgoing ? `—[${edge.relation_type}]→` : `←[${edge.relation_type}]—`}
                          </span>
                          <span className="text-slate-200 font-medium group-hover:text-cyan-200 transition">
                            {neighbor?.name || neighborId}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraphView;
