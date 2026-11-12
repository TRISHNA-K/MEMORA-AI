'use client';

import React from 'react';
import { 
  Terminal, 
  Share2, 
  Database, 
  FlaskConical, 
  Sliders, 
  Activity, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AppMode } from '../../lib/types';

interface SidebarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  stats?: {
    avgRetention: number;
    triplesCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onSelectMode, stats }) => {
  const navItems = [
    {
      id: 'assistant' as AppMode,
      label: 'Agent Runtime',
      desc: 'Cognitive loop & tracing',
      icon: Terminal,
      activeColor: 'text-cyan-400',
      activeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      dotColor: 'bg-cyan-400'
    },
    {
      id: 'graph' as AppMode,
      label: 'Knowledge Graph',
      desc: 'SharedMemory topology',
      icon: Share2,
      activeColor: 'text-indigo-400',
      activeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
      dotColor: 'bg-indigo-400'
    },
    {
      id: 'memory' as AppMode,
      label: 'Memory Stores',
      desc: 'Tripartite cache & decay',
      icon: Database,
      activeColor: 'text-purple-400',
      activeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      dotColor: 'bg-purple-400'
    },
    {
      id: 'research' as AppMode,
      label: 'Research Benchmarks',
      desc: 'Empirical MSR evaluation',
      icon: FlaskConical,
      activeColor: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      dotColor: 'bg-emerald-400'
    },
    {
      id: 'personalization' as AppMode,
      label: 'Persona & Rules',
      desc: 'Learned procedural tuning',
      icon: Sliders,
      activeColor: 'text-amber-400',
      activeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      dotColor: 'bg-amber-400'
    }
  ];

  return (
    <aside className="w-72 h-screen bg-[#070912]/95 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col justify-between select-none relative z-20">
      <div>
        {/* Futuristic Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-[#0F1424]/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full rounded-xl bg-[#090D18] flex items-center justify-center font-mono text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
                  M
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#070912] animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#070912]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-slate-100 font-sans">
                  MEMORA AI
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  MSR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Cognitive Architecture</p>
            </div>
          </div>
        </div>

        {/* Live System Status Pill */}
        <div className="px-5 pt-3.5 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80">~62ms</span>
          </div>
        </div>

        {/* Navigation Modules */}
        <div className="p-3.5 space-y-1.5">
          <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Cognitive Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left border transition-all duration-200 group ${
                  isActive
                    ? `${item.activeBg} font-medium`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/10' : 'bg-slate-800/50 group-hover:bg-slate-800'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? item.activeColor : 'text-slate-400 group-hover:text-slate-200'}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400">{item.desc}</div>
                  </div>
                </div>
                {isActive && (
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Retention & Persona Card */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#080B14]/80">
        {/* Retention Meter */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/90 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Composite Retention
            </span>
            <span className="text-cyan-400 font-bold font-mono text-xs">
              {stats?.avgRetention ? `${Math.round(stats.avgRetention * 100)}%` : '98%'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              style={{ width: `${stats?.avgRetention ? stats.avgRetention * 100 : 98}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="font-mono text-slate-400">6-Factor Decay Model</span>
            <span className="text-slate-400 font-mono">{stats?.triplesCount || 15} Triples</span>
          </div>
        </div>

        {/* User Persona Capsule */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/70 hover:border-slate-700/80 transition">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
              <div className="w-full h-full rounded-lg bg-[#0A0E1A] flex items-center justify-center font-mono text-[11px] text-cyan-300 font-bold">
                TK
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Trishna K.</div>
              <div className="text-[10px] text-slate-400">Cognitive AI Researcher</div>
            </div>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 font-bold">
            FLAGSHIP
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
