'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  Cpu, 
  Share2, 
  Sliders, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  Mic,
  Brain,
  Network,
  Activity,
  Flame,
  Bot
} from 'lucide-react';
import { ChatMessage } from '../../lib/types';
import { api } from '../../lib/api';
import { ThoughtProcess } from './ThoughtProcess';
import { FeedbackModal } from './FeedbackModal';
import { VoiceAmbientModal } from './VoiceAmbientModal';
import { FormattedMessage } from './FormattedMessage';

interface BotPersona {
  id: 'aria' | 'kira' | 'atlas';
  name: string;
  role: string;
  tagline: string;
  eyeColor: string;
  glowColor: string;
  accentBg: string;
  avatarBg: string;
  borderGlow: string;
  activePill: string;
}

const botPersonas: BotPersona[] = [
  {
    id: 'aria',
    name: 'Aria',
    role: 'Cognitive Guide',
    tagline: 'Adaptive memory bot guiding your research and tracking progress',
    eyeColor: 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]',
    glowColor: 'from-cyan-500/25 via-indigo-500/20 to-blue-500/20',
    accentBg: 'from-cyan-500 via-indigo-500 to-purple-600',
    avatarBg: 'bg-cyan-950/60 border-cyan-400/50 text-cyan-300',
    borderGlow: 'border-cyan-400/40 shadow-cyan-500/30',
    activePill: 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
  },
  {
    id: 'kira',
    name: 'Kira',
    role: 'Empathic Persona',
    tagline: 'Warm, intuitive reasoning tuned for user preference and context recall',
    eyeColor: 'bg-fuchsia-400 shadow-[0_0_12px_#e879f9]',
    glowColor: 'from-fuchsia-500/25 via-pink-500/20 to-purple-500/20',
    accentBg: 'from-fuchsia-500 via-pink-500 to-purple-600',
    avatarBg: 'bg-fuchsia-950/60 border-fuchsia-400/50 text-fuchsia-300',
    borderGlow: 'border-fuchsia-400/40 shadow-fuchsia-500/30',
    activePill: 'border-fuchsia-400 bg-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Deep Mecha',
    tagline: 'Rigorous multi-hop GraphRAG traversal and benchmark analysis',
    eyeColor: 'bg-blue-400 shadow-[0_0_12px_#60a5fa]',
    glowColor: 'from-blue-500/25 via-teal-500/20 to-indigo-500/20',
    accentBg: 'from-blue-500 via-cyan-500 to-teal-600',
    avatarBg: 'bg-blue-950/60 border-blue-400/50 text-blue-300',
    borderGlow: 'border-blue-400/40 shadow-blue-500/30',
    activePill: 'border-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
  }
];

interface ChatInterfaceProps {
  onMemoryUpdated?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMemoryUpdated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'memora_agentic' | 'rag_vector' | 'standard_llm'>('memora_agentic');
  const [strategy, setStrategy] = useState<'hybrid_graphrag' | 'vector_only' | 'graph_traversal'>('hybrid_graphrag');
  const [personalization, setPersonalization] = useState(true);
  const [selectedBot, setSelectedBot] = useState<BotPersona>(botPersonas[0]);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<{ id?: string; query?: string; resp?: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendChat({
        message: text,
        mode,
        retrieval_strategy: strategy,
        personalization_enabled: personalization
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughts: res.thoughts,
        retrieved_memories: res.retrieved_memories,
        subgraph: res.knowledge_subgraph,
        latency_ms: res.latency_ms,
        mode_used: res.mode_used
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (onMemoryUpdated) onMemoryUpdated();
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Execution failed: ${err.message}. Ensure backend is running at http://127.0.0.1:8000.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      icon: Brain,
      title: 'Memory Decay',
      desc: 'Mathematical 6-factor Ebbinghaus retention',
      color: 'from-orange-500/10 via-rose-500/10 to-amber-500/5 text-rose-200 border-rose-500/20 hover:border-rose-400/50',
      badge: 'Cognitive',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      query: 'Derive the mathematical formulation of the 6-factor composite memory decay system and state its half-life parameters.'
    },
    {
      icon: Network,
      title: 'Hybrid GraphRAG',
      desc: 'Personalized PageRank & topological reasoning',
      color: 'from-indigo-500/10 via-purple-500/10 to-blue-500/5 text-indigo-200 border-indigo-500/20 hover:border-indigo-400/50',
      badge: 'Retrieval',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      query: 'Compare Hybrid GraphRAG against standard Vector MIPS on multi-hop entity reasoning and topological context recall.'
    },
    {
      icon: Activity,
      title: 'Tripartite Memory',
      desc: 'Episodic to semantic graph triples & procedural rules',
      color: 'from-teal-500/10 via-cyan-500/10 to-emerald-500/5 text-teal-200 border-teal-500/20 hover:border-teal-400/50',
      badge: 'Consolidation',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      query: 'Describe how episodic interaction traces consolidate into permanent semantic graph triples and procedural workflow rules.'
    },
    {
      icon: Sparkles,
      title: 'MSR Benchmarks',
      desc: 'RAGAS context recall & accuracy evaluations',
      color: 'from-fuchsia-500/10 via-purple-500/10 to-pink-500/5 text-purple-200 border-purple-500/20 hover:border-purple-400/50',
      badge: 'Evaluation',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      query: 'Outline the experimental hypotheses, baseline configurations, and RAGAS metrics evaluated across Experiments 1, 2, and 3.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#06080F] text-slate-100 cyber-grid relative overflow-hidden font-sans">
      {/* Top Floating Glass Navigation Header */}
      <header className="px-6 py-3.5 border-b border-white/[0.07] bg-[#0A0D18]/80 backdrop-blur-xl flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">Mode:</span>
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-inner">
              <button
                onClick={() => setMode('memora_agentic')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  mode === 'memora_agentic'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Agentic Memory
              </button>
              <button
                onClick={() => setMode('rag_vector')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  mode === 'rag_vector'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Vector RAG
              </button>
              <button
                onClick={() => setMode('standard_llm')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  mode === 'standard_llm'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Baseline LLM
              </button>
            </div>
          </div>

          {mode === 'memora_agentic' && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">Strategy:</span>
              <select
                value={strategy}
                onChange={(e: any) => setStrategy(e.target.value)}
                className="bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer"
              >
                <option value="hybrid_graphrag">Hybrid GraphRAG (Vector + PPR)</option>
                <option value="graph_traversal">Graph Traversal (Multi-Hop)</option>
                <option value="vector_only">Vector Only (Dense FAISS)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none px-3 py-1 rounded-xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition">
            <input
              type="checkbox"
              checked={personalization}
              onChange={(e) => setPersonalization(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className={personalization ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
              Adaptive Persona
            </span>
          </label>
        </div>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-8 space-y-7 flex flex-col items-center text-center">
            
            {/* Dribbble-inspired Futuristic Glowing AI Robot & Nebula Visualizer (Screen 1 & 2) */}
            <div className="relative flex flex-col items-center justify-center pt-2">
              {/* Outer Energy Pulse Rings */}
              <div className="absolute w-52 h-52 rounded-full border border-cyan-500/20 animate-pulse-ring" />
              <div className="absolute w-40 h-40 rounded-full border border-purple-500/30 animate-pulse" />
              <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${selectedBot.glowColor} blur-2xl transition-all duration-500`} />

              {/* Central Glowing AI Robot Orb */}
              <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-950/95 border ${selectedBot.borderGlow} p-1 shadow-2xl animate-float flex flex-col items-center justify-center transition-all duration-500`}>
                <div className="w-full h-full rounded-[22px] bg-[#0A0E1A] flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Robot Head Top Sensor */}
                  <div className={`w-7 h-1.5 bg-gradient-to-r ${selectedBot.accentBg} rounded-full mb-2 shadow-[0_0_10px_rgba(6,182,212,0.8)]`} />
                  
                  {/* Glowing Eyes */}
                  <div className="flex items-center gap-3 my-1">
                    <div className={`w-4 h-5 rounded-full ${selectedBot.eyeColor} flex items-center justify-center transition-all duration-300`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className={`w-4 h-5 rounded-full ${selectedBot.eyeColor} flex items-center justify-center transition-all duration-300`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>

                  {/* Soundwave equalizer indicator */}
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-1 h-2 bg-cyan-400/80 rounded-full animate-pulse" />
                    <span className="w-1 h-3.5 bg-indigo-400 rounded-full animate-pulse" />
                    <span className="w-1 h-2 bg-purple-400/80 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* 3 Circular Avatar Selectors (Dribbble Screen 1) */}
              <div className="flex items-center gap-3 mt-4">
                {botPersonas.map((bot) => (
                  <button
                    key={bot.id}
                    onClick={() => setSelectedBot(bot)}
                    className={`relative p-1 rounded-full transition-all duration-300 ${
                      selectedBot.id === bot.id
                        ? bot.activePill + ' scale-110'
                        : 'bg-slate-900/70 border border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    title={`${bot.name} — ${bot.role}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${bot.avatarBg}`}>
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Greetings (Dribbble Screen 2) */}
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/20 text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>HUMAN-CENTERED COGNITIVE ARCHITECTURE</span>
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                Hi, I&apos;m <span className={`text-transparent bg-clip-text bg-gradient-to-r ${selectedBot.accentBg}`}>{selectedBot.name}</span>.
              </h1>
              
              <p className="text-xl font-medium text-slate-100">
                I can help you.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto">
                {selectedBot.tagline}
              </p>
            </div>

            {/* Tap to Talk with Aria / Mic Action Pill (Dribbble Screen 2 & 3) */}
            <div>
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0C1222] via-[#0F172E] to-[#140E26] border border-cyan-500/30 hover:border-cyan-400/80 text-slate-200 hover:text-white shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20 transition-all duration-300 group"
              >
                <span className="text-xs font-semibold tracking-wide">Tap to talk with {selectedBot.name}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/40 group-hover:scale-110 transition">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Dribbble-inspired Frosted Pastel Glass Cards (Screen 2) */}
            <div className="grid grid-cols-2 gap-3.5 w-full pt-1">
              {quickPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.query)}
                    className={`p-4 rounded-2xl border bg-gradient-to-br ${item.color} backdrop-blur-xl transition-all duration-200 text-left space-y-2 hover:-translate-y-1 hover:shadow-xl group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium ${item.badgeBg}`}>
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1px] flex-shrink-0 mt-0.5 shadow-md shadow-cyan-500/20">
                      <div className="w-full h-full rounded-xl bg-[#090D18] flex items-center justify-center text-cyan-400">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-900/60 to-indigo-950/70 border border-cyan-500/30 text-slate-100 shadow-lg shadow-cyan-950/40 rounded-tr-sm'
                        : 'glass-panel-elevated text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {/* Turn Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10 text-xs font-mono text-slate-400">
                      <span className={msg.role === 'assistant' ? 'text-cyan-400 font-semibold' : 'text-slate-300 font-medium'}>
                        {msg.role === 'assistant'
                          ? `MEMORA • ${msg.mode_used || mode}`
                          : 'Researcher'}
                      </span>
                      <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Content */}
                    {msg.role === 'assistant' ? (
                      <FormattedMessage content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-100">
                        {msg.content}
                      </div>
                    )}

                    {/* Reasoning Trace Drawer */}
                    {msg.thoughts && msg.thoughts.length > 0 && (
                      <ThoughtProcess
                        thoughts={msg.thoughts}
                        memories={msg.retrieved_memories}
                        subgraph={msg.subgraph}
                        latencyMs={msg.latency_ms}
                        modeUsed={msg.mode_used}
                      />
                    )}

                    {/* Action Toolbar */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                          <button
                            onClick={() => {
                              setSelectedEpisode({ id: msg.id, resp: msg.content });
                              setFeedbackModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Reinforce</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEpisode({ id: msg.id, resp: msg.content });
                              setFeedbackModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Critique</span>
                          </button>
                        </div>

                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 items-center p-4 max-w-sm rounded-2xl glass-panel text-xs text-slate-300">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="font-mono text-xs text-cyan-300">Traversing knowledge graph & computing retention...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Capsule Input Form */}
      <div className="p-5 border-t border-white/[0.08] bg-[#080B14]/90 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative flex items-center bg-[#0C101E]/90 border border-white/10 rounded-2xl p-2 pl-4 transition-all duration-200 focus-within:border-cyan-400/80 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.25)] shadow-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${selectedBot.name} about cognitive memory, GraphRAG, or tap mic for voice...`}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            
            <div className="flex items-center gap-2 pl-2">
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition group"
                title={`Launch Ambient Voice with ${selectedBot.name}`}
              >
                <Mic className="w-4 h-4 group-hover:scale-110 text-cyan-400 transition" />
              </button>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/30 transition disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        episodeId={selectedEpisode.id}
        query={selectedEpisode.query}
        response={selectedEpisode.resp}
        onFeedbackSubmitted={onMemoryUpdated}
      />

      <VoiceAmbientModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        botName={selectedBot.name}
        onSendTranscript={(text) => handleSend(text)}
      />
    </div>
  );
};

export default ChatInterface;
