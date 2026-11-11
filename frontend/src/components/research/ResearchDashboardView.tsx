'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  BarChart3, 
  Radar as RadarIcon, 
  Award, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  FileCode,
  Download,
  Copy,
  Check,
  TrendingUp,
  Table
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ExperimentReport } from '@/lib/types';
import { api } from '@/lib/api';

export const ResearchDashboardView: React.FC = () => {
  const [activeExp, setActiveExp] = useState<'exp1_memory' | 'exp2_graphrag' | 'exp3_personalization'>('exp1_memory');
  const [report, setReport] = useState<ExperimentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [latexCopied, setLatexCopied] = useState(false);

  const runExperiment = async (expId: string, query?: string) => {
    setLoading(true);
    try {
      const data = await api.runExperiment(expId, query);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runExperiment(activeExp);
  }, [activeExp]);

  const experiments = [
    {
      id: 'exp1_memory' as const,
      title: 'Experiment 1: Memory Architecture',
      subtitle: 'Zero-Shot LLM vs Vector RAG vs Agentic Tripartite Memory',
      tag: 'Hypothesis H1'
    },
    {
      id: 'exp2_graphrag' as const,
      title: 'Experiment 2: Retrieval Paradigm',
      subtitle: 'Dense Vector (MIPS) vs Graph Traversal vs Hybrid GraphRAG',
      tag: 'Hypothesis H2'
    },
    {
      id: 'exp3_personalization' as const,
      title: 'Experiment 3: Adaptive Usability',
      subtitle: 'Generic Baseline vs Procedurally Grounded Assistant',
      tag: 'Hypothesis H3'
    }
  ];

  const generateLatexTable = () => {
    if (!report || !report.scorecards) return '';
    let latex = `\\begin{table}[t]\n\\centering\n\\small\n\\caption{${report.experiment_title}}\n\\begin{tabular}{lcccccc}\n\\toprule\nVariant & Retr. Acc & Prec. & Faithfulness & Relevance & Latency (ms) & Sat.\\\\\n\\midrule\n`;
    for (const sc of report.scorecards) {
      latex += `${sc.variant_name} & ${(sc.retrieval_accuracy * 100).toFixed(1)}\\% & ${(sc.context_precision * 100).toFixed(1)}\\% & ${(sc.faithfulness * 100).toFixed(1)}\\% & ${(sc.answer_relevance * 100).toFixed(1)}\\% & ${sc.response_latency_ms} & ${(sc.user_satisfaction * 100).toFixed(1)}\\% \\\\\n`;
    }
    latex += `\\bottomrule\n\\end{tabular}\n\\label{tab:${report.experiment_id}}\n\\end{table}`;
    return latex;
  };

  const copyLatex = () => {
    const table = generateLatexTable();
    navigator.clipboard.writeText(table);
    setLatexCopied(true);
    setTimeout(() => setLatexCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#080B11] text-slate-200 overflow-y-auto">
      {/* Research Header */}
      <div className="p-6 border-b border-slate-800/90 bg-[#0C101A]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                EMPIRICAL EVALUATION SUITE • BENCHMARK HARNESS
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
              Research Experiments & RAGAS Benchmarks
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Comparative ablation studies measuring context recall, faithfulness, answer relevance, and personalization quality.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLatex}
              disabled={!report}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition disabled:opacity-40"
              title="Copy LaTeX Table for paper submission"
            >
              {latexCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-slate-400" />}
              <span>{latexCopied ? 'LaTeX Copied!' : 'Export LaTeX'}</span>
            </button>
            <button
              onClick={() => runExperiment(activeExp, customQuery || undefined)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-semibold transition disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating...' : 'Run Benchmark'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6 flex-1 w-full">
        {/* Experiment Selector Tabs */}
        <div className="grid grid-cols-3 gap-3.5">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                setActiveExp(exp.id);
                setCustomQuery('');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeExp === exp.id
                  ? 'bg-[#101826] border-emerald-600/80 shadow-sm'
                  : 'bg-[#0C101A] border-slate-800 hover:bg-[#0E1422] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {exp.tag}
                </span>
                {activeExp === exp.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <h3 className="font-semibold text-xs text-slate-100">{exp.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{exp.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Custom Query Input */}
        <div className="p-3 rounded-xl bg-[#0C101A] border border-slate-800 flex items-center gap-2.5">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Execute benchmark on custom query (e.g., 'What evaluation framework measures the decay system?')..."
            className="flex-1 bg-[#080B11] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => runExperiment(activeExp, customQuery)}
            disabled={!customQuery.trim() || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-medium border border-slate-700 transition disabled:opacity-40"
          >
            Run Custom Test
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            <p className="text-xs font-mono">Executing multi-variant evaluation passes & computing RAGAS metrics...</p>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Hypothesis & Findings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block">
                  Formal Hypothesis
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {report.hypothesis}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0C141E] border border-emerald-900/50 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block">
                  Empirical Findings & Statistical Takeaways
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed font-sans">
                  {report.findings_summary}
                </p>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-2 gap-5">
              {/* Radar Chart */}
              <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <RadarIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Multi-Metric Trade-off Radar
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Scale: [0.0, 1.0]</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={report.radar_metrics}>
                      <PolarGrid stroke="#243044" />
                      <PolarAngleAxis dataKey="metric" stroke="#8da2be" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 1.0]} stroke="#3b4b63" />
                      {activeExp === 'exp1_memory' && (
                        <>
                          <Radar name="Zero-Shot LLM" dataKey="Standard LLM" stroke="#64748b" fill="#64748b" fillOpacity={0.15} />
                          <Radar name="Vector RAG" dataKey="RAG Baseline" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} />
                          <Radar name="MEMORA Agentic" dataKey="MEMORA Agentic" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
                        </>
                      )}
                      {activeExp === 'exp2_graphrag' && (
                        <>
                          <Radar name="Vector (MIPS)" dataKey="Vector Only" stroke="#818cf8" fill="#818cf8" fillOpacity={0.15} />
                          <Radar name="Graph Traversal" dataKey="Graph Traversal" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                          <Radar name="Hybrid GraphRAG" dataKey="Hybrid GraphRAG" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                        </>
                      )}
                      {activeExp === 'exp3_personalization' && (
                        <>
                          <Radar name="Generic Baseline" dataKey="Generic Response" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                          <Radar name="Adaptive Persona" dataKey="Personalized Response" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
                        </>
                      )}
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#334155', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    Comparative Accuracy & Faithfulness
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Head-to-head</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.bar_chart_data}>
                      <XAxis dataKey="name" stroke="#8da2be" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <YAxis domain={[0, 1.0]} stroke="#3b4b63" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#334155', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar dataKey="Accuracy" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Faithfulness" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Satisfaction" fill="#818cf8" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-slate-400" />
                  RAGAS & System Performance Evaluation Table
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Benchmark Suite: msr_benchmark_v1
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2.5 font-semibold">Variant</th>
                      <th className="pb-2.5 font-semibold text-center">Retr. Acc</th>
                      <th className="pb-2.5 font-semibold text-center">Context Prec</th>
                      <th className="pb-2.5 font-semibold text-center">Faithfulness</th>
                      <th className="pb-2.5 font-semibold text-center">Relevance</th>
                      <th className="pb-2.5 font-semibold text-center">Latency (ms)</th>
                      <th className="pb-2.5 font-semibold text-center">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {report.scorecards.map((sc, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition">
                        <td className="py-2.5 font-semibold text-slate-200">
                          {sc.variant_name}
                        </td>
                        <td className="py-2.5 text-center text-cyan-300">
                          {(sc.retrieval_accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-center text-slate-300">
                          {(sc.context_precision * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-center text-emerald-400 font-semibold">
                          {(sc.faithfulness * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-center text-slate-300">
                          {(sc.answer_relevance * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-center text-slate-400">
                          {sc.response_latency_ms} ms
                        </td>
                        <td className="py-2.5 text-center text-emerald-400 font-bold">
                          {(sc.user_satisfaction * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
