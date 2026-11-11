'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppMode, MemoryOverviewStats } from '@/lib/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/assistant/ChatInterface';
import { KnowledgeGraphView } from '@/components/graph/KnowledgeGraphView';
import { MemoryExplorerView } from '@/components/memory/MemoryExplorerView';
import { PersonalizationView } from '@/components/user/PersonalizationView';
import { api } from '@/lib/api';

// Dynamically import ResearchDashboardView with SSR disabled to prevent Recharts canvas hydration mismatch
const ResearchDashboardView = dynamic(
  () => import('@/components/research/ResearchDashboardView').then((m) => m.ResearchDashboardView),
  { ssr: false }
);

export function AppShell() {
  const [currentMode, setCurrentMode] = useState<AppMode>('assistant');
  const [stats, setStats] = useState<MemoryOverviewStats | null>(null);

  const loadStats = async () => {
    try {
      const data = await api.getMemoryOverview();
      setStats(data);
    } catch (err) {
      // Backend may be starting up
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090F] font-sans">
      <Sidebar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        stats={{
          avgRetention: stats?.average_retention || 0.94,
          triplesCount: stats?.semantic_triples_count || 14,
        }}
      />

      <main className="flex-1 flex overflow-hidden">
        {currentMode === 'assistant' && (
          <ChatInterface onMemoryUpdated={loadStats} />
        )}
        {currentMode === 'graph' && (
          <KnowledgeGraphView />
        )}
        {currentMode === 'memory' && (
          <MemoryExplorerView />
        )}
        {currentMode === 'research' && (
          <ResearchDashboardView />
        )}
        {currentMode === 'personalization' && (
          <PersonalizationView />
        )}
      </main>
    </div>
  );
}

export default AppShell;
