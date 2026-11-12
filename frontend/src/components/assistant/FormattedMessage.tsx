'use client';

import React from 'react';
import { Sparkles, Database, CheckCircle2, BookOpen } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
}

/**
 * Strips raw LaTeX escape syntax and converts to simple, readable human text.
 */
function toHumanReadable(text: string): string {
  let s = text.trim();
  // Strip outer $$ or $ delimiters
  s = s.replace(/^\$\$+|\$\$+$/g, '').trim();
  s = s.replace(/^\$+|\$$/g, '').trim();

  // Common LaTeX commands to readable text
  s = s.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑($1 to $2)');
  s = s.replace(/\\sum_\{([^}]+)\}/g, '∑($1)');
  s = s.replace(/\\cdot/g, ' · ');
  s = s.replace(/\\times/g, ' × ');
  s = s.replace(/\\quad\s*\\text\{\s*where\s*\}/gi, ', where ');
  s = s.replace(/\\quad/g, ' ');
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  s = s.replace(/\\exp\\left\((.*?)\\right\)/g, 'exp($1)');
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  s = s.replace(/\\Delta\s*t/g, 'Δt');
  s = s.replace(/\\Delta/g, 'Δ');
  s = s.replace(/\\lambda/g, 'λ');
  s = s.replace(/\\tau/g, 'τ');
  s = s.replace(/\\kappa_f/g, 'κ_f');
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\in/g, '∈');
  s = s.replace(/\\ge(q)?/g, '≥');
  s = s.replace(/\\le(q)?/g, '≤');
  s = s.replace(/\\ln/g, 'ln');
  s = s.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
  s = s.replace(/\\/g, ''); // Remove any stray backslashes

  return s;
}

/**
 * Renders inline text, turning **bold**, `code`, [tags], and $variables$ into clean, beautiful styled elements.
 */
function renderInline(text: string): React.ReactNode[] {
  // Matches $math$, **bold**, `code`, or [tag]
  const regex = /(\$[^\$]+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\[[A-Za-z0-9_\s\-]+\])/g;
  const tokens = text.split(regex);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // Inline math $...$
    if (token.startsWith('$') && token.endsWith('$')) {
      const clean = toHumanReadable(token);
      return (
        <span
          key={idx}
          className="inline-block px-1.5 py-0.5 mx-0.5 font-mono text-xs text-cyan-200 bg-cyan-950/70 border border-cyan-500/30 rounded"
        >
          {clean}
        </span>
      );
    }

    // Bold text **...**
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      return (
        <strong key={idx} className="text-white font-semibold">
          {renderInline(inner)}
        </strong>
      );
    }

    // Inline code `...`
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 font-mono text-xs bg-slate-800 text-cyan-300 rounded border border-white/10"
        >
          {code}
        </code>
      );
    }

    // Bracketed metadata tags like [Graph Triple], [Memory]
    if (token.startsWith('[') && token.endsWith(']')) {
      const tag = token.slice(1, -1);
      const isRelational = tag.includes('Triple') || tag.includes('Graph');
      const isAttr = tag.includes('works_on') || tag.includes('prefers') || tag.includes('depends_on');

      const style = isRelational
        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
        : isAttr
        ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30'
        : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30';

      return (
        <span
          key={idx}
          className={`inline-block px-2 py-0.5 mx-1 text-[11px] font-mono font-medium rounded-full border ${style}`}
        >
          {tag}
        </span>
      );
    }

    return <span key={idx}>{token}</span>;
  });
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const items: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Blank line
    if (!line) {
      items.push(<div key={`space-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Display Formula ($$ ... $$)
    if (line.startsWith('$$')) {
      let formula = line;
      if (!line.endsWith('$$') || line === '$$') {
        i++;
        while (i < lines.length) {
          formula += ' ' + lines[i].trim();
          if (lines[i].trim().endsWith('$$')) break;
          i++;
        }
      }
      const readableFormula = toHumanReadable(formula);
      items.push(
        <div
          key={`formula-${i}`}
          className="my-3 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-inner"
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Formulation</span>
          </div>
          <div className="font-mono text-xs md:text-sm text-cyan-100 font-medium px-2 py-1 bg-black/40 rounded border border-white/5 overflow-x-auto whitespace-pre-wrap">
            {readableFormula}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Heading 3: ### Title
    if (line.startsWith('### ')) {
      const heading = line.replace(/^###\s+/, '');
      items.push(
        <div
          key={`h3-${i}`}
          className="flex items-center gap-2.5 pb-2.5 pt-1 border-b border-cyan-500/20 text-white font-semibold text-base tracking-tight mb-2"
        >
          <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="text-white font-semibold">
            {heading}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Heading 4: #### Title
    if (line.startsWith('#### ')) {
      const heading = line.replace(/^####\s+/, '');
      items.push(
        <div
          key={`h4-${i}`}
          className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mt-4 mb-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{heading}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered List: 1. **Title**: Description
    const numMatch = line.match(/^(\d+)\.\s+(\*\*.*?\*\*|\w.*?)(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = line.replace(/^\d+\.\s+/, '');

      items.push(
        <div
          key={`num-${i}`}
          className="my-2 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/5 hover:border-cyan-500/20 transition"
        >
          <div className="flex items-start gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
              0{num}
            </span>
            <div className="text-slate-200 text-sm leading-relaxed flex-1">
              {renderInline(rest)}
            </div>
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Bullet List: • ... or - ...
    if (line.startsWith('• ') || line.startsWith('- ')) {
      const textOnly = line.replace(/^[•\-]\s+/, '');
      items.push(
        <div
          key={`bullet-${i}`}
          className="flex items-start gap-2.5 py-1.5 px-3 rounded-lg bg-white/[0.02] border border-white/5 my-1 text-sm text-slate-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
          <div className="leading-relaxed flex-1">
            {renderInline(textOnly)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Standard paragraph
    items.push(
      <p key={`p-${i}`} className="text-slate-200 text-sm leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="formatted-message space-y-1 font-sans">
      {items}
    </div>
  );
};
