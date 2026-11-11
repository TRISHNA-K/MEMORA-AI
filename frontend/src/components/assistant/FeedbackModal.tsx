'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, X, Check } from 'lucide-react';
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
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-md bg-[#0C101A] border border-slate-700 rounded-xl p-5 shadow-2xl relative text-slate-200 text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-bold text-slate-100 font-sans mb-1">
          Online Feedback & Procedural Reinforcement
        </h3>
        <p className="text-[11px] text-slate-400 mb-4 font-sans">
          Logs human critique to update episodic salience and reinforce active procedural workflows.
        </p>

        {submitted ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-1.5 text-emerald-400">
            <Check className="w-6 h-6" />
            <p className="font-semibold text-xs font-mono">Preference Vector Updated in Database</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => { setIsPositive(true); setRating(5); }}
                className={`flex-1 py-1.5 rounded border flex items-center justify-center gap-1.5 text-xs transition ${
                  isPositive
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Positive Reinforcement
              </button>
              <button
                type="button"
                onClick={() => { setIsPositive(false); setRating(2); }}
                className={`flex-1 py-1.5 rounded border flex items-center justify-center gap-1.5 text-xs transition ${
                  !isPositive
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Negative Critique
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Targeted Dimension:
              </label>
              <select
                value={targetAspect}
                onChange={(e) => setTargetAspect(e.target.value)}
                className="w-full bg-[#080B11] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="accuracy">Factual Grounding / Faithfulness</option>
                <option value="tone">Tone & Persona Calibration</option>
                <option value="personalization">Procedural Rules & Formatting Constraints</option>
                <option value="retrieval">Context Relevance / Retrieval Coverage</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Feedback Annotation / Guideline Instruction:
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                placeholder="e.g. Always provide KaTeX derivations; be more concise..."
                className="w-full bg-[#080B11] border border-slate-800 rounded p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-semibold bg-cyan-700 hover:bg-cyan-600 text-white rounded transition disabled:opacity-50"
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
