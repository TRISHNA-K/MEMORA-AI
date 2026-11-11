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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<KGNode | null>(null);

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
      if (positionedNodes.length > 0 && !selectedNode) {
        setSelectedNode(positionedNodes[0]);
      }
    } catch (err) {
      console.error(err);
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

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      // Force relaxation
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (n1 === draggedNodeRef.current) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = (n2.x || 0) - (n1.x || 0);
          const dy = (n2.y || 0) - (n1.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 170) {
            const force = (170 - dist) / dist * 0.035;
            n1.x = (n1.x || 0) - dx * force;
            n1.y = (n1.y || 0) - dy * force;
            n2.x = (n2.x || 0) + dx * force;
            n2.y = (n2.y || 0) + dy * force;
          }
        }
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
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, edges, selectedNode, searchQuery, selectedCategory]);

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
          return;
        }
      }
    }

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      draggedNodeRef.current.x = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
      draggedNodeRef.current.y = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;
    } else if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingRef.current = false;
  };

  const handleZoom = (factor: number) => {
    transformRef.current.k = Math.max(0.4, Math.min(3.0, transformRef.current.k * factor));
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
    <div className="flex-1 flex flex-col h-screen bg-[#080B11] text-slate-200 overflow-hidden font-mono">
      {/* Top Knowledge Graph Bar */}
      <header className="px-5 py-2.5 border-b border-slate-800/90 bg-[#0C101A] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold font-mono text-xs">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>KNOWLEDGE_GRAPH_EXPLORER</span>
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="filter entities..."
              className="w-full bg-[#080B11] border border-slate-800 rounded px-2.5 pl-7 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  selectedCategory === cat.label
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-600/70'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-[#080B11] border border-slate-800">
            |V| = {nodes.length}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#080B11] border border-slate-800">
            |E| = {edges.length}
          </span>
          <button
            onClick={exportGraphJson}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Export Graph JSON"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Canvas & Detail Sidebar */}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative bg-[radial-gradient(#1a2333_1px,transparent_1px)] [background-size:20px_20px]">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          <div className="absolute bottom-4 left-4 flex items-center gap-1 p-1 rounded-lg bg-[#0C101A] border border-slate-800">
            <button onClick={() => handleZoom(1.2)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleZoom(0.8)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetView} className="p-1 rounded hover:bg-slate-800 text-slate-400">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Node Detail Inspector */}
        {selectedNode && (
          <aside className="w-80 border-l border-slate-800 bg-[#0C101A] p-4 flex flex-col justify-between overflow-y-auto font-mono text-xs">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold border mb-1"
                    style={{
                      color: getColorForType(selectedNode.entity_type),
                      borderColor: getColorForType(selectedNode.entity_type) + '40',
                      backgroundColor: getColorForType(selectedNode.entity_type) + '15'
                    }}
                  >
                    {selectedNode.entity_type}
                  </span>
                  <h2 className="text-sm font-bold text-slate-100 font-sans">{selectedNode.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <div className="p-2.5 rounded bg-[#080B11] border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
                {selectedNode.description || 'Extracted entity from conversation episodic traces.'}
              </div>

              {/* Decay Retention Telemetry */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Decay Retention Telemetry
                </span>
                <div className="p-2.5 rounded bg-[#080B11] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Retention Score:</span>
                    <span className="font-bold text-emerald-400">
                      {(selectedNode.decay_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedNode.decay_score * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                    <span>Degree: {selectedNode.degree_connections} links</span>
                    <span>State: Consolidated Core</span>
                  </div>
                </div>
              </div>

              {/* Incident Edges */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Incident Edges ({connectedEdges.length})
                </span>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {connectedEdges.map((edge) => {
                    const isOutgoing = edge.source_id === selectedNode.id;
                    const neighborId = isOutgoing ? edge.target_id : edge.source_id;
                    const neighbor = nodes.find((n) => n.id === neighborId);
                    return (
                      <div
                        key={edge.id}
                        onClick={() => neighbor && setSelectedNode(neighbor)}
                        className="p-2 rounded bg-[#080B11] hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-600/50 transition cursor-pointer flex items-center justify-between text-[11px]"
                      >
                        <div className="truncate">
                          <span className="text-cyan-400 text-[10px] block">
                            {isOutgoing ? `-[${edge.relation_type}]->` : `<-[${edge.relation_type}]-`}
                          </span>
                          <span className="text-slate-200 font-sans">
                            {neighbor?.name || neighborId}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
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
