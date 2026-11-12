'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, X, Check, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodeId?: string;
  query?: string;
  response?: string;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  episodeId,
  query,
  response,
  onFeedbackSubmitted
}) => {
  const [isPositive, setIsPositive] = useState(true);
  const [rating, setRating] = useState(5);
  const [targetAspect, setTargetAspect] = useState('accuracy');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitFeedback({
        episode_id: episodeId,
        is_positive: isPositive,
        rating,
        feedback_text: feedbackText,
        target_aspect: targetAspect
      });
      setSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
      <div className="w-full max-w-md glass-panel-elevated rounded-2xl p-6 shadow-2xl relative text-slate-100 text-xs space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 font-semibold mb-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>ONLINE REINFORCEMENT LEARNER</span>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Procedural Feedback & Calibration
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Logs human critique to reinforce factual grounding and active procedural workflow heuristics.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-emerald-400">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="font-semibold text-sm font-sans text-white">Preference Synchronized</p>
            <p className="text-xs text-slate-400 font-mono">Cognitive weights reinforced in database</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setIsPositive(true); setRating(5); }}
                className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                  isPositive
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'glass-panel text-slate-400 hover:text-slate-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" /> Positive Reinforce
              </button>
              <button
                type="button"
                onClick={() => { setIsPositive(false); setRating(2); }}
                className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                  !isPositive
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-md shadow-rose-950/40'
                    : 'glass-panel text-slate-400 hover:text-slate-200'
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-rose-400" /> Negative Critique
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                Target Dimension:
              </label>
              <select
                value={targetAspect}
                onChange={(e) => setTargetAspect(e.target.value)}
                className="w-full bg-[#080B14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="accuracy">Factual Grounding / Faithfulness</option>
                <option value="tone">Tone & Persona Calibration</option>
                <option value="personalization">Procedural Rules & Formatting Constraints</option>
                <option value="retrieval">Context Relevance / Retrieval Coverage</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                Feedback Annotation / Guideline Instruction:
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                placeholder="e.g. Always include KaTeX derivations; prefer structured comparison tables..."
                className="w-full bg-[#080B14] border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Committing...' : 'Commit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
