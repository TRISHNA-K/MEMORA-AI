'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mic, MicOff, Sparkles, Volume2, X } from 'lucide-react';

interface VoiceAmbientModalProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
  onSendTranscript: (text: string) => void;
}

export const VoiceAmbientModal: React.FC<VoiceAmbientModalProps> = ({
  isOpen,
  onClose,
  botName,
  onSendTranscript,
}) => {
  const [isListening, setIsListening] = useState(true);
  const [transcriptIndex, setTranscriptIndex] = useState(0);

  const sampleTranscripts = [
    "I'm exploring how MEMORA combines 6-factor decay with topological GraphRAG...",
    "Can you retrieve my previous interaction regarding cross-session memory consolidation?",
    "Show me the comparison between dense vector search and personalized PageRank.",
    "Evaluate context recall and faithfulness metrics on the MSR evaluation benchmark."
  ];

  useEffect(() => {
    if (!isOpen) return;
    setIsListening(true);
    const interval = setInterval(() => {
      setTranscriptIndex((prev) => (prev + 1) % sampleTranscripts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTranscript = sampleTranscripts[transcriptIndex];

  const handleCommitTranscript = () => {
    onSendTranscript(currentTranscript);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-md h-[90vh] max-h-[780px] rounded-[36px] bg-gradient-to-b from-[#090D1A] via-[#070A14] to-[#04060C] border border-cyan-500/20 shadow-2xl flex flex-col justify-between p-7 overflow-hidden">
        
        {/* Ambient Top Bar */}
        <div className="flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>LIVE COGNITIVE VOICE • {botName.toUpperCase()}</span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Cosmic Soundwave Star / Nebula (Dribbble Screen 3) */}
        <div className="relative flex flex-col items-center justify-center my-auto py-6">
          {/* Outermost Nebula Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/30 via-fuchsia-500/25 to-indigo-600/30 blur-3xl animate-pulse" />

          {/* Electric Corona Rays */}
          <div className="absolute w-64 h-64 flex items-center justify-center">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm rotate-45 animate-pulse" />
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent blur-sm -rotate-45 animate-pulse" />
            <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent blur-[2px] animate-pulse" />
          </div>

          {/* Orbiting Ring Particles */}
          <div className="relative w-44 h-44 rounded-full border border-cyan-400/30 flex items-center justify-center animate-spin" style={{ animationDuration: '18s' }}>
            <span className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
            <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#e879f9]" />
          </div>

          {/* Middle Energy Corona Ring */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-fuchsia-500/40 animate-ping" style={{ animationDuration: '3s' }} />

          {/* Dark Event Horizon Core with Glowing Rim */}
          <div className="absolute w-28 h-28 rounded-full bg-[#05070E] border-2 border-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.7),inset_0_0_20px_rgba(232,121,249,0.5)] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-950 via-[#0a0f24] to-purple-950 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Live Speech Recognition Transcript */}
        <div className="space-y-4 text-center z-10 px-4">
          <div className="space-y-2">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
              {isListening ? 'Listening to voice stream...' : 'Microphone muted'}
            </span>
            <p className="text-base font-medium text-slate-100 leading-relaxed min-h-[56px] transition-all duration-300">
              &ldquo;{currentTranscript}&rdquo;
            </p>
          </div>

          {/* Quick Submit Prompt Button */}
          <button
            onClick={handleCommitTranscript}
            className="text-xs font-mono text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 underline-offset-4 transition"
          >
            Send this query to {botName} &rarr;
          </button>
        </div>

        {/* Bottom Ambient Soundwave Equalizer & Mic Trigger */}
        <div className="flex flex-col items-center gap-5 z-10 pt-4">
          {/* Soundwave Bars Visualizer */}
          <div className="flex items-center gap-1.5 h-8">
            {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 35].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-cyan-500 to-fuchsia-400 rounded-full transition-all duration-150"
                style={{
                  height: isListening ? `${height}%` : '20%',
                  opacity: isListening ? 0.9 : 0.3
                }}
              />
            ))}
          </div>

          {/* Big Circular Mic Trigger */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div className="absolute w-20 h-20 rounded-full border border-fuchsia-500/30 animate-pulse" />
            )}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white shadow-fuchsia-500/40 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
