import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const METHODS: { term: string; meaning: string }[] = [
  { term: "Reduce", meaning: "using less of a material in the first place, so less waste is created" },
  { term: "Reuse", meaning: "using an item again for the same or a different purpose instead of throwing it away" },
  { term: "Recycle", meaning: "processing a used material so it can be made into a new product" },
  { term: "Compost", meaning: "letting organic waste like food scraps and plant matter break down naturally into fertile soil" },
  { term: "Burn", meaning: "safely incinerating certain waste materials, usually as a last-resort method under controlled conditions" },
];

export const wasteHandling: Skill = {
  id: "pt-m-waste-handling",
  code: "M.2",
  subjectId: "pre-technical",
  strandId: "pt-materials",
  grade: 9,
  title: "Ways of handling waste materials",
  description: "Match each waste-handling method to its meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify"] as const);

    if (branch === "identify") {
      const pool = shuffle(rng, METHODS);
      const correct = pool[0];
      const choices = shuffle(rng, pool.slice(0, 4).map((m) => m.term));

      return {
        kind: "multiple-choice",
        prompt: `Which waste-handling method means: ${correct.meaning}?`,
        choices,
        correctIndex: choices.indexOf(correct.term),
        layout: "list",
        hint: "These are the five safe ways of handling waste materials in the environment.",
        explanation: `${correct.term} — ${correct.meaning}.`,
      };
    }

    const chosen = shuffle(rng, METHODS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((m) => ({ id: m.term, label: m.term })));
    const targets = shuffle(rng, chosen.map((m) => ({ id: m.term, label: m.meaning })));
    const correctMap: Record<string, string> = {};
    for (const m of chosen) correctMap[m.term] = m.term;

    return {
      kind: "click-match",
      prompt: "Match each waste-handling method to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "These are the five safe ways of handling waste materials in the environment.",
      explanation: chosen.map((m) => `${m.term} — ${m.meaning}.`).join(" "),
    };
  },
};
