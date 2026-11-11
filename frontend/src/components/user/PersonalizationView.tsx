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
  ShieldCheck 
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { api } from '@/lib/api';

export const PersonalizationView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [preferredTone, setPreferredTone] = useState('academic_rigorous');
  const [detailLevel, setDetailLevel] = useState('high');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await api.getUserProfile();
        setProfile(u);
        setName(u.name);
        setBio(u.bio || '');
        setPreferredTone(u.preferred_tone);
        setDetailLevel(u.detail_level);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateUserProfile({
        name,
        bio,
        preferred_tone: preferredTone,
        detail_level: detailLevel
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toneOptions = [
    {
      id: 'academic_rigorous',
      title: 'Formal Academic & Mathematical Rigor',
      desc: 'Formulates answers with LaTeX equations, formal notation, variable definitions, and theoretical provenance.',
      icon: BookOpen
    },
    {
      id: 'concise',
      title: 'High-Density Concision',
      desc: 'Information-dense bullet points without conversational preamble, greetings, or filler text.',
      icon: Zap
    },
    {
      id: 'technical_code',
      title: 'Technical Implementation Standard',
      desc: 'Production Python implementations, strict PEP 484 type annotations, tensor dimension comments, and complexity analysis.',
      icon: Code2
    },
    {
      id: 'pedagogical',
      title: 'Pedagogical & Intuitive Synthesis',
      desc: 'Step-by-step conceptual motivation followed by formal mathematical definitions.',
      icon: FileText
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#080B11] text-slate-200 overflow-y-auto font-mono">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/90 bg-[#0C101A]">
        <div className="max-w-4xl mx-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
              AGENT REASONING CALIBRATION
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            Researcher Persona & Procedural Tuning
          </h1>
          <p className="text-xs text-slate-400 max-w-xl font-sans">
            Configure agent prompt conditioning parameters, output depth, and active procedural guidelines enforced during inference.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6 flex-1 w-full text-xs">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Identity Parameters */}
          <div className="p-5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-semibold text-slate-200 font-mono flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Researcher Identity Parameters
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Identity Handle:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080B11] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Detail Level:
                </label>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="w-full bg-[#080B11] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="high">Deep Technical & Formal (High)</option>
                  <option value="medium">Balanced Executive Summary (Medium)</option>
                  <option value="concise">Compact Overview (Low)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Domain Specialization & Research Focus:
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#080B11] border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Reasoning Tone Options */}
          <div className="p-5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-3.5">
            <h3 className="font-semibold text-slate-200 font-mono flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Inference Tone & Formalism Mode
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((t) => {
                const Icon = t.icon;
                const isSelected = preferredTone === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setPreferredTone(t.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition space-y-1.5 ${
                      isSelected
                        ? 'bg-[#121927] border-amber-500/80'
                        : 'bg-[#080B11] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-200">
                          {t.title}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {t.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 items-center">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" />
                Parameters updated in database
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-mono font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Apply Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
