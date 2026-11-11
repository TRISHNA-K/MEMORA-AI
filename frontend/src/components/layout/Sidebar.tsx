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
  HardDrive
} from 'lucide-react';
import { AppMode } from '@/lib/types';

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
      desc: 'Execution & Tracing',
      icon: Terminal,
      activeColor: 'text-cyan-400',
      activeBg: 'bg-[#121927] border-cyan-800/80 text-cyan-200'
    },
    {
      id: 'graph' as AppMode,
      label: 'Knowledge Graph',
      desc: 'SharedMemory Topology',
      icon: Share2,
      activeColor: 'text-indigo-400',
      activeBg: 'bg-[#121927] border-indigo-800/80 text-indigo-200'
    },
    {
      id: 'memory' as AppMode,
      label: 'Memory Stores',
      desc: 'Tripartite Cache & Decay',
      icon: Database,
      activeColor: 'text-purple-400',
      activeBg: 'bg-[#121927] border-purple-800/80 text-purple-200'
    },
    {
      id: 'research' as AppMode,
      label: 'Research Benchmarks',
      desc: 'Empirical MSR Evaluation',
      icon: FlaskConical,
      activeColor: 'text-emerald-400',
      activeBg: 'bg-[#121927] border-emerald-800/80 text-emerald-200'
    },
    {
      id: 'personalization' as AppMode,
      label: 'Persona & Procedural',
      desc: 'Learned Guidelines',
      icon: Sliders,
      activeColor: 'text-amber-400',
      activeBg: 'bg-[#121927] border-amber-800/80 text-amber-200'
    }
  ];

  return (
    <aside className="w-64 h-screen bg-[#070A0F] border-r border-slate-800/90 flex flex-col justify-between select-none">
      <div>
        {/* System Title */}
        <div className="p-4 border-b border-slate-800/80 bg-[#090D14]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-slate-100">
                MEMORA <span className="text-[10px] text-cyan-400 font-normal">v1.0</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Cognitive Memory & GraphRAG</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2.5 space-y-1">
          <p className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            System Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left border transition-all ${
                  isActive
                    ? `${item.activeBg} font-medium`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? item.activeColor : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Health & Profile */}
      <div className="p-3 border-t border-slate-800/90 space-y-2.5 bg-[#080B10]">
        <div className="p-2.5 rounded-lg bg-[#0C101A] border border-slate-800/90 text-[11px] space-y-1 font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-[10px]">
              <Activity className="w-3 h-3 text-emerald-400" />
              RETENTION INDEX
            </span>
            <span className="text-emerald-400 font-semibold">
              {stats?.avgRetention ? `${Math.round(stats.avgRetention * 100)}%` : '92%'}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${stats?.avgRetention ? stats.avgRetention * 100 : 92}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
            <span>6-Factor Model</span>
            <span>{stats?.triplesCount || 14} Triples</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 font-mono text-[10px] text-slate-300 flex items-center justify-center font-bold">
              TK
            </div>
            <div>
              <div className="text-xs text-slate-200">Trishna K.</div>
              <div className="text-[9px] text-slate-500 font-mono">Principal Researcher</div>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            MSR
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
