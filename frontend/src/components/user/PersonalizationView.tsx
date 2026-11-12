'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  User, 
  Check, 
  FileText, 
  Code2, 
  BookOpen, 
  Zap, 
  ShieldCheck,
  Sparkles,
  Bot
} from 'lucide-react';
import { UserProfile } from '../../lib/types';
import { api } from '../../lib/api';

export const PersonalizationView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [preferredTone, setPreferredTone] = useState('academic_rigorous');
  const [detailLevel, setDetailLevel] = useState('high');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const u = await api.getUserProfile();
      setProfile(u);
      setName(u.name);
      setBio(u.bio || '');
      setPreferredTone(u.preferred_tone);
      setDetailLevel(u.detail_level);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend profile service.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.updateUserProfile({
        name,
        bio,
        preferred_tone: preferredTone,
        detail_level: detailLevel
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const toneOptions = [
    {
      id: 'academic_rigorous',
      title: 'Formal Academic & Mathematical Rigor',
      desc: 'Formulates answers with LaTeX equations, formal notation, variable definitions, and theoretical provenance.',
      icon: BookOpen,
      accent: 'from-amber-500/20 to-orange-500/20 text-amber-300'
    },
    {
      id: 'concise',
      title: 'High-Density Concision',
      desc: 'Information-dense bullet points without conversational preamble, greetings, or filler text.',
      icon: Zap,
      accent: 'from-cyan-500/20 to-blue-500/20 text-cyan-300'
    },
    {
      id: 'technical_code',
      title: 'Technical Implementation Standard',
      desc: 'Production Python implementations, strict PEP 484 type annotations, tensor dimension comments, and complexity analysis.',
      icon: Code2,
      accent: 'from-indigo-500/20 to-purple-500/20 text-indigo-300'
    },
    {
      id: 'pedagogical',
      title: 'Pedagogical & Intuitive Synthesis',
      desc: 'Step-by-step conceptual motivation followed by formal mathematical definitions.',
      icon: FileText,
      accent: 'from-emerald-500/20 to-teal-500/20 text-emerald-300'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#06080F] text-slate-100 cyber-grid overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="p-6 border-b border-white/[0.08] bg-[#0A0D18]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>AGENT REASONING CALIBRATION</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Researcher Persona & Procedural Tuning
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Configure agent prompt conditioning parameters, output depth, and active procedural guidelines enforced during inference.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6 flex-1 w-full text-xs">
        {error && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center justify-between font-mono">
            <span>{error}</span>
            <button
              onClick={load}
              className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold"
            >
              Retry
            </button>
          </div>
        )}
        {saveError && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs font-mono">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity Parameters */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Researcher Identity Parameters
              </h3>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Identity Handle:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080B14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Detail Level:
                </label>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full bg-[#080B14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="high">Deep Technical & Formal (High)</option>
                  <option value="medium">Balanced Executive Summary (Medium)</option>
                  <option value="concise">Compact Overview (Low)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                Domain Specialization & Research Focus:
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#080B14] border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Reasoning Tone Options */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="w-4 h-4 text-amber-400" />
              Inference Tone & Formalism Mode
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              {toneOptions.map((t) => {
                const Icon = t.icon;
                const isSelected = preferredTone === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setPreferredTone(t.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 space-y-2 ${
                      isSelected
                        ? 'glass-panel-elevated border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                        : 'glass-panel hover:border-white/20 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-white/10 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-xs text-white">
                          {t.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center">
                          <Check className="w-3 h-3 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {t.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 items-center pt-2">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono animate-fadeIn">
                <Check className="w-4 h-4" />
                Parameters synchronized with cognitive engine
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
            >
              {saving ? 'Applying...' : 'Apply Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalizationView;
