import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GROUP_ITEMS = [
  { label: "Marbling", bucket: "tie-dye", reason: "Marbling is a tie-and-dye technique — the fabric is scrunched or dipped so dye spreads in random, marbled patterns." },
  { label: "Pleating", bucket: "tie-dye", reason: "Pleating is a tie-and-dye technique — the fabric is folded into pleats and tied before dyeing, resisting dye along the folds." },
  { label: "Cutting a stencil design", bucket: "stencil", reason: "Cutting the design is part of stencil printing — the cut-out shape is what lets paint or dye through." },
  { label: "Applying dye or paint through the cut-out shape", bucket: "stencil", reason: "Applying dye through the openings is part of stencil printing — it transfers the design onto the fabric." },
  { label: "Repeating a motif across the fabric", bucket: "pattern", reason: "Repeating a motif is part of alternate pattern layout — it builds a consistent design across the fabric." },
  { label: "Alternating colours between repeated motifs", bucket: "pattern", reason: "Alternating colours is part of alternate pattern layout — it adds rhythm and visual interest to the repeated design." },
];

const BUCKET_LABEL: Record<string, string> = { "tie-dye": "Tie and dye technique", stencil: "Stencil printing step", pattern: "Alternate pattern layout" };

const TERMS = [
  { id: "marbling", label: "Marbling", meaning: "Scrunching or dipping fabric so dye spreads unevenly, creating a marbled, random pattern" },
  { id: "pleating", label: "Pleating", meaning: "Folding fabric into pleats and tying it before dyeing, so the folds resist the dye" },
  { id: "stencil", label: "Stencil", meaning: "A cut-out template that lets paint or dye pass through only in the shape of the design" },
  { id: "motif", label: "Motif", meaning: "A single repeated design element used to build up a larger pattern across the fabric" },
  { id: "alternate-pattern", label: "Alternate pattern", meaning: "A layout where motifs or colours are arranged to repeat in a regular, alternating sequence" },
];

const STENCIL_STEPS = [
  { id: "design", label: "Design the motif to be printed" },
  { id: "cut", label: "Cut the stencil so the design's shape is open" },
  { id: "position", label: "Position the stencil securely on the fabric" },
  { id: "apply", label: "Apply dye or paint through the cut-out openings" },
  { id: "lift", label: "Carefully lift the stencil away from the fabric" },
  { id: "dry", label: "Let the fabric dry, then finish the edges" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What is the main difference between marbling and pleating as tie-and-dye techniques?", correct: "Marbling creates a random, mottled pattern, while pleating creates regular resist lines along the folds", distractors: ["They produce exactly the same pattern every time", "Marbling never uses dye, only paint", "Pleating always uses a cut-out stencil"] },
  { q: "How is a stencil printing design applied to fabric?", correct: "Dye or paint is pushed through a cut-out template so it only reaches the fabric in the shape of the design", distractors: ["The fabric is boiled together with the dye and stencil", "The stencil is sewn permanently into the fabric", "The design is drawn freehand with no template at all"] },
  { q: "What does an 'alternate pattern' layout involve?", correct: "Arranging motifs or colours so they repeat in a regular, alternating sequence across the fabric", distractors: ["Using only a single colour across the whole fabric", "Placing every motif in exactly the same spot, overlapping", "Removing all colour from the design"] },
  { q: "Why should a decorated fabric be 'finished' after decoration?", correct: "Finishing (such as trimming, hemming, or setting the dye) protects the design and gives the fabric a neat, complete appearance", distractors: ["Finishing has no real purpose once the fabric is dyed", "Finishing always removes the applied pattern", "Finishing is only necessary for stencil-printed fabric"] },
  { q: "What helps you identify a fabric as tie-and-dye rather than stencil-printed?", correct: "Tie-and-dye shows soft, blended patterns from folding or dyeing, while stencil printing shows a sharp, repeated design", distractors: ["There is no visible difference between the two techniques", "Tie-and-dye always uses only one single colour", "Stencil-printed fabric never has a repeating design"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each action into Tie and dye technique, Stencil printing step, or Alternate pattern layout.",
  "Which category does each action below belong to? Sort them.",
  "Classify each action into its correct category.",
  "Decide which category each action fits, and sort it.",
  "Sort these actions by the category they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each fabric decoration term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each fabric decoration term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the correct order for printing a fabric using a stencil.",
  "Put these stencil-printing steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these stencil-printing steps into the correct sequence.",
  "Place these stencil-printing steps in the order you would follow them.",
] as const;

export const fabricDecoration: Skill = {
  id: "g8-cas-fabric-decoration",
  code: "C.6",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Fabric Decoration",
  description: "Tie-and-dye (marbling, pleating), stencil printing, and alternate pattern layout for decorating fabric.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "stencil-order", "theory-mc"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, GROUP_ITEMS);
      const correctBucket: Record<string, string> = {};
      for (const g of items) correctBucket[g.label] = g.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((g) => ({ id: g.label, label: g.label })),
        buckets: [
          { id: "tie-dye", label: BUCKET_LABEL["tie-dye"] },
          { id: "stencil", label: BUCKET_LABEL.stencil },
          { id: "pattern", label: BUCKET_LABEL.pattern },
        ],
        correctBucket,
        hint: "Tie-and-dye resists dye by folding or scrunching; stencils use a cut-out template; pattern layout repeats a motif.",
        explanation: items.map((g) => g.reason).join(" "),
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Marbling and pleating are tie-and-dye techniques; a stencil is a cut-out template; a motif is a repeated design element.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "stencil-order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, STENCIL_STEPS),
        correctOrder: STENCIL_STEPS.map((s) => s.id),
        hint: "The stencil must be designed and cut before it can be positioned, used, and removed.",
        explanation: `The order is: ${STENCIL_STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Tie-and-dye resists dye with folds; stencils use a cut-out template; finishing protects and completes the fabric.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
