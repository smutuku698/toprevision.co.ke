import katex from "katex";

// Renders one LaTeX expression via KaTeX. `renderToString` is pure JS (no
// DOM needed), so this works identically on the server and the client.
export function Katex({ latex, display = false, className }: { latex: string; display?: boolean; className?: string }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: display,
    output: "html",
  });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
