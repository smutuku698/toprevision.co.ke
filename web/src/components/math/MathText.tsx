import { Katex } from "./Katex";

// Every question/hint/explanation string in the skills is plain sentence
// text with inline math wrapped in $...$ (e.g. "Simplify: $2^5 \\times 2^3$").
// This splits on that delimiter and renders math segments through KaTeX,
// leaving the surrounding sentence as normal text — so a fraction, exponent,
// root, or inequality symbol looks properly typeset instead of ASCII-art.
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g).filter((p) => p.length > 0);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("$") && part.endsWith("$") ? (
          <Katex key={i} latex={part.slice(1, -1)} />
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
