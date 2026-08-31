import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill, VisualSpec } from "@/lib/types";

const LINE_TYPES = [
  { id: "thick-continuous", label: "Thick continuous line", use: "Drawing the visible outlines and edges of an object" },
  { id: "thin-continuous", label: "Thin continuous line", use: "Drawing dimension lines and projection lines" },
  { id: "dashed", label: "Dashed line", use: "Showing hidden edges that cannot be seen from the outside" },
  { id: "chain", label: "Chain line", use: "Marking the centre lines of circles and symmetrical parts" },
] as const;

const SYMBOLS = [
  { symbol: "⌀", meaning: "diameter" },
  { symbol: "R", meaning: "radius" },
  { symbol: "⊥", meaning: "perpendicular" },
  { symbol: "℄", meaning: "centre line" },
  { symbol: "▢", meaning: "square" },
] as const;

const ABBREVIATIONS = [
  { abbr: "DRG", meaning: "Drawing" },
  { abbr: "A/F", meaning: "Across flats" },
  { abbr: "A/C", meaning: "Across corners" },
  { abbr: "I/D", meaning: "Inside diameter" },
  { abbr: "O/D", meaning: "Outside diameter" },
] as const;

const DRAWING_FEATURES = [
  { text: "Expresses the personal creativity and feelings of the artist", bucket: "artistic" },
  { text: "May use exaggeration or abstract shapes for effect", bucket: "artistic" },
  { text: "Is often used for paintings, sketches and illustrations", bucket: "artistic" },
  { text: "Different artists may draw the same scene very differently", bucket: "artistic" },
  { text: "Is judged mainly by how it looks or feels, not by exact measurement", bucket: "artistic" },
  { text: "Follows strict, standard conventions and an exact scale", bucket: "technical" },
  { text: "Is used by engineers to communicate exact manufacturing details", bucket: "technical" },
  { text: "Uses standard symbols, abbreviations and types of lines", bucket: "technical" },
  { text: "Any trained person reading it should interpret it the same way", bucket: "technical" },
  { text: "Is used to make sure a manufactured part matches its design exactly", bucket: "technical" },
] as const;

const WORKFLOW_STEPS = [
  { id: "construction", label: "Draw thin construction/projection lines lightly" },
  { id: "outline", label: "Draw the thick continuous outline over the correct edges" },
  { id: "hidden", label: "Add dashed lines to show any hidden details" },
  { id: "dimension", label: "Add dimension lines, symbols and abbreviations" },
  { id: "finish", label: "Darken and clean up the finished drawing" },
] as const;

export const introToDrawing: Skill = {
  id: "g7-pt-com-introduction-to-drawing",
  code: "COM.2",
  subjectId: "pre-technical",
  strandId: "g7-pt-communication",
  grade: 7,
  title: "Introduction to drawing",
  description: "Distinguishing artistic and technical drawing, the types of lines used in drawing, and the symbols and abbreviations used in technical drawing.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-line", "line-match", "drawing-sort", "symbol-fill", "workflow-order"] as const);

    if (branch === "identify-line") {
      const target = randChoice(rng, LINE_TYPES);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        LINE_TYPES.filter((l) => l.id !== target.id).map((l) => l.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Identify this type of line used in technical drawing.",
        visual: { type: "drawing-line", style: target.id } satisfies VisualSpec,
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label.toLowerCase()}, used for ${target.use.toLowerCase()}.`,
      };
    }

    if (branch === "line-match") {
      const tokens = shuffle(rng, LINE_TYPES.map((l) => ({ id: l.id, label: l.label })));
      const targets = shuffle(
        rng,
        LINE_TYPES.map((l) => ({ id: l.id, label: l.use, icon: { type: "drawing-line" as const, style: l.id } }))
      );
      const correctMap: Record<string, string> = {};
      for (const l of LINE_TYPES) correctMap[l.id] = l.id;
      return {
        kind: "click-match",
        prompt: "Match each type of line used in drawing to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "Thick lines show what you can see; thin, dashed and chain lines add extra information.",
        explanation: LINE_TYPES.map((l) => `${l.label} — ${l.use}.`).join(" "),
      };
    }

    if (branch === "drawing-sort") {
      const chosen = shuffle(rng, DRAWING_FEATURES);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each feature as describing artistic drawing or technical drawing.",
        items,
        buckets: [
          { id: "artistic", label: "Artistic drawing" },
          { id: "technical", label: "Technical drawing" },
        ],
        correctBucket,
        hint: "Artistic drawing expresses creativity; technical drawing communicates exact, standardised information.",
        explanation: chosen.map((f) => `"${f.text}" describes ${f.bucket} drawing.`).join(" "),
      };
    }

    if (branch === "symbol-fill") {
      const useSymbol = randChoice(rng, [true, false]);
      if (useSymbol) {
        const s = randChoice(rng, SYMBOLS);
        return {
          kind: "fill-blank",
          prompt: "Complete the sentence about this drawing symbol.",
          before: `The symbol "${s.symbol}" used in technical drawing stands for `,
          after: ".",
          correctAnswer: s.meaning,
          acceptedAnswers: [s.meaning],
          inputMode: "text",
          hint: "This symbol is drawn next to a measurement on a technical drawing.",
          explanation: `The symbol "${s.symbol}" stands for ${s.meaning}.`,
        };
      }
      const a = randChoice(rng, ABBREVIATIONS);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about this drawing abbreviation.",
        before: `The abbreviation "${a.abbr}" used in technical drawing stands for `,
        after: ".",
        correctAnswer: a.meaning.toLowerCase(),
        acceptedAnswers: [a.meaning, a.meaning.toLowerCase()],
        inputMode: "text",
        hint: "This abbreviation is a short way of writing a common drawing term.",
        explanation: `The abbreviation "${a.abbr}" stands for ${a.meaning}.`,
      };
    }

    const shuffled = shuffle(rng, WORKFLOW_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for producing a neat technical drawing, from first to last.",
      items: shuffled.map((s) => ({ id: s.id, label: s.label })),
      correctOrder: WORKFLOW_STEPS.map((s) => s.id),
      instruction: "Drag to arrange from first to last.",
      hint: "Light guide lines come first, then the visible outline, then extra details, then finishing touches.",
      explanation: `The correct order is: ${WORKFLOW_STEPS.map((s) => s.label).join("; ")}.`,
    };
  },
};
