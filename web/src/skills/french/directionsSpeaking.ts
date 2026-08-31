import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EXPRESSIONS: { term: string; meaning: string }[] = [
  { term: "à droite", meaning: "to the right" },
  { term: "à gauche", meaning: "to the left" },
  { term: "tout droit", meaning: "straight ahead" },
  { term: "tourner", meaning: "to turn" },
  { term: "continuer", meaning: "to continue" },
  { term: "traverser", meaning: "to cross" },
  { term: "le nord", meaning: "north" },
  { term: "le sud", meaning: "south" },
];

const SORT_ITEMS: { label: string; bucket: "direction" | "transport" }[] = [
  { label: "à droite", bucket: "direction" },
  { label: "à gauche", bucket: "direction" },
  { label: "tout droit", bucket: "direction" },
  { label: "tourner", bucket: "direction" },
  { label: "le bus", bucket: "transport" },
  { label: "le taxi", bucket: "transport" },
  { label: "le vélo", bucket: "transport" },
  { label: "le train", bucket: "transport" },
];

export const directionsSpeaking: Skill = {
  id: "fr-ls-directions",
  code: "LS.9",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Asking for and giving directions",
  description: "Match direction expressions to their meaning, and sort words as directions or means of transport.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const direction = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "direction")).slice(0, 4);
      const transport = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "transport")).slice(0, 4);
      const items = shuffle(rng, [...direction, ...transport]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Direction word or a Means of transport.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "direction", label: "Direction" },
          { id: "transport", label: "Transport" },
        ],
        correctBucket,
        hint: "Direction words tell you which way to go; transport words name how you travel.",
        explanation: `Directions: ${direction.map((m) => m.label).join(" / ")}. Transport: ${transport.map((m) => m.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, EXPRESSIONS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each French direction word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'À droite' and 'à gauche' are opposites, just like 'le nord' and 'le sud'.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
