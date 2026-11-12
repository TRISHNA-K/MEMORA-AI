'use client';

import React from 'react';
import { Sigma, Sparkles, Database, CheckCircle2, Layers, Cpu } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
}

/**
 * Converts raw LaTeX expressions into clean, legible mathematical Unicode typography.
 */
function cleanLatex(latex: string): string {
  let s = latex.trim();
  // Strip outer $$ or $ delimiters
  s = s.replace(/^\$\$+|\$\$+$/g, '').trim();
  s = s.replace(/^\$+|\$$/g, '').trim();

  // Summations & products
  s = s.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑[$1..$2]');
  s = s.replace(/\\sum_\{([^}]+)\}/g, '∑[$1]');
  s = s.replace(/\\prod_\{([^}]+)\}\^\{([^}]+)\}/g, '∏[$1..$2]');

  // Operations & spacing
  s = s.replace(/\\cdot/g, ' · ');
  s = s.replace(/\\times/g, ' × ');
  s = s.replace(/\\quad\s*\\text\{\s*where\s*\}/g, ' , where ');
  s = s.replace(/\\quad/g, '   ');
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');

  // Fractions & Exponentials
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  s = s.replace(/\\exp\\left\((.*?)\\right\)/g, 'exp($1)');
  s = s.replace(/\\exp\((.*?)\)/g, 'exp($1)');
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  s = s.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');

  // Greek letters & math symbols
  s = s.replace(/\\Delta\s*t/g, 'Δt');
  s = s.replace(/\\Delta/g, 'Δ');
  s = s.replace(/\\lambda/g, 'λ');
  s = s.replace(/\\tau/g, 'τ');
  s = s.replace(/\\kappa_f/g, 'κ_f');
  s = s.replace(/\\kappa/g, 'κ');
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\beta/g, 'β');
  s = s.replace(/\\in/g, '∈');
  s = s.replace(/\\ge(q)?/g, '≥');
  s = s.replace(/\\le(q)?/g, '≤');
  s = s.replace(/\\neq/g, '≠');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\subset/g, '⊂');
  s = s.replace(/\\mathcal\{V\}/g, '𝒱');
  s = s.replace(/\\mathcal\{E\}/g, 'ℰ');
  s = s.replace(/\\mathcal\{G\}/g, '𝒢');
  s = s.replace(/\\mathcal\{S\}/g, '𝒮');
  s = s.replace(/\\mathbb\{R\}\^d/g, 'ℝᵈ');
  s = s.replace(/\\mathbb\{R\}/g, 'ℝ');
  s = s.replace(/\\ln/g, 'ln');
  s = s.replace(/\\arg\\max_\{([^}]+)\}/g, 'argmax[$1]');
  s = s.replace(/\\|([a-zA-Z0-9_]+)\\|/g, '‖$1‖');

  // Clean remaining braces {word} -> word
  s = s.replace(/\{([a-zA-Z0-9_\-\.]+)\}/g, '$1');

  return s;
}

/**
 * Renders inline text, converting **bold**, `code`, tags [tag], and $math$ into styled inline spans.
 */
function renderInlineText(text: string): React.ReactNode[] {
  // Regex splitting by math ($...$), bold (**...**), inline code (`...`), or tag ([...])
  const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\[[A-Za-z0-9_\s\-]+\])/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Display math embedded inline
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const math = cleanLatex(part);
      return (
        <span
          key={i}
          className="inline-block my-1 px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-md font-mono text-xs text-cyan-200 font-semibold"
        >
          {math}
        </span>
      );
    }

    // Inline math $...$
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = cleanLatex(part);
      return (
        <span
          key={i}
          className="inline-block px-1.5 py-0.5 mx-0.5 bg-cyan-950/50 border border-cyan-500/30 rounded text-cyan-200 font-mono text-xs font-medium"
        >
          {math}
        </span>
      );
    }

    // Bold text **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="text-white font-semibold">
          {renderInlineText(inner)}
        </strong>
      );
    }

    // Inline code `...`
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 bg-slate-800 text-cyan-300 font-mono text-xs rounded border border-white/10"
        >
          {code}
        </code>
      );
    }

    // Bracketed metadata tags like [Graph Triple], [Memory], etc.
    if (part.startsWith('[') && part.endsWith(']')) {
      const tag = part.slice(1, -1);
      const isRelational = tag.includes('Triple') || tag.includes('Graph');
      const isAttribute = tag.includes('works_on') || tag.includes('prefers') || tag.includes('depends_on');
      
      const badgeStyle = isRelational
        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
        : isAttribute
        ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30'
        : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30';

      return (
        <span
          key={i}
          className={`inline-block px-2 py-0.5 mx-1 text-[11px] font-mono font-medium rounded-full border ${badgeStyle}`}
        >
          {tag}
        </span>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  if (!content) return null;

  // Split lines while preserving block structures
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty lines
    if (!line) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 2. Multiline Display Math ($$ ... $$)
    if (line.startsWith('$$')) {
      let formula = line;
      if (!line.endsWith('$$') || line === '$$') {
        // Collect until closing $$
        i++;
        while (i < lines.length) {
          formula += '\n' + lines[i];
          if (lines[i].trim().endsWith('$$')) break;
          i++;
        }
      }

      elements.push(
        <div
          key={`math-${i}`}
          className="my-3.5 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2 text-[11px] font-mono font-semibold text-cyan-400 tracking-wider">
            <Sigma className="w-3.5 h-3.5 text-cyan-400" />
            <span>MATHEMATICAL MODEL</span>
          </div>
          <div className="font-mono text-xs md:text-sm text-cyan-100 font-medium px-3 py-2 bg-black/40 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {cleanLatex(formula)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 3. Level 3 Heading (### Title)
    if (line.startsWith('### ')) {
      const heading = line.replace(/^###\s+/, '');
      elements.push(
        <div
          key={`h3-${i}`}
          className="flex items-center gap-2.5 pb-2.5 pt-2 border-b border-cyan-500/20 text-white font-semibold text-base tracking-tight mb-2"
        >
          <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            {heading}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // 4. Level 4 Heading (#### Title)
    if (line.startsWith('#### ')) {
      const heading = line.replace(/^####\s+/, '');
      elements.push(
        <div
          key={`h4-${i}`}
          className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mt-4 mb-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span>{heading}</span>
        </div>
      );
      i++;
      continue;
    }

    // 5. Numbered List Item (e.g., 1. **Recency ($F_R$)**: ...)
    const numberedMatch = line.match(/^(\d+)\.\s+(\*\*.*?\*\*|\w.*?)(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const rest = line.replace(/^\d+\.\s+/, '');

      // Check if subsequent line is a formula for this item
      let nextFormula: string | null = null;
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('$$')) {
        nextFormula = lines[i + 1].trim();
        i++;
      }

      elements.push(
        <div
          key={`num-${i}`}
          className="my-2 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 hover:border-cyan-500/20 transition group"
        >
          <div className="flex items-start gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
              0{num}
            </span>
            <div className="text-slate-200 text-sm leading-relaxed flex-1">
              {renderInlineText(rest)}
            </div>
          </div>
          {nextFormula && (
            <div className="mt-2 ml-8 p-2.5 rounded-lg bg-black/40 border border-cyan-500/20 font-mono text-xs text-cyan-200">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-cyan-400/80 font-semibold uppercase">
                <Sigma className="w-3 h-3" />
                <span>Expression</span>
              </div>
              <div className="overflow-x-auto whitespace-pre-wrap">
                {cleanLatex(nextFormula)}
              </div>
            </div>
          )}
        </div>
      );
      i++;
      continue;
    }

    // 6. Bullet Items (• ... or - ...)
    if (line.startsWith('• ') || line.startsWith('- ')) {
      const bulletText = line.replace(/^[•\-]\s+/, '');
      elements.push(
        <div
          key={`bullet-${i}`}
          className="flex items-start gap-2.5 py-1.5 px-3 rounded-lg bg-white/[0.02] border border-white/5 my-1 text-sm text-slate-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          <div className="leading-relaxed flex-1">
            {renderInlineText(bulletText)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Standard Paragraph Text
    elements.push(
      <p key={`p-${i}`} className="text-slate-200 text-sm leading-relaxed my-1">
        {renderInlineText(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="formatted-message space-y-1 font-sans">
      {elements}
    </div>
  );
};
