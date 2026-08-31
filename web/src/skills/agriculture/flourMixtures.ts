import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRODUCTS: { name: string; description: string; bucket: "batter" | "dough" }[] = [
  { name: "Pancake", description: "made from a batter — a runny mixture that is poured and cooked on a flat pan", bucket: "batter" },
  { name: "Mandazi", description: "made from a dough — a firmer mixture that is kneaded, shaped, and deep-fried", bucket: "dough" },
  { name: "Chapati", description: "made from a dough — a firmer mixture that is kneaded, rolled flat, and pan-fried", bucket: "dough" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each food into Batter or Dough, based on the flour mixture used to make it.",
  "Group each food under Batter or Dough, depending on the flour mixture used.",
  "Decide whether each food is made from a batter or a dough, and sort it there.",
  "Place each food into Batter or Dough, based on how its mixture is made.",
  "Read each food and sort it as Batter or Dough.",
  "Classify each food as Batter or Dough, based on its flour mixture.",
];

const MATCH_PROMPTS = [
  "Match each food to the type of flour mixture used to make it.",
  "Pair each food with the flour mixture used to prepare it.",
  "Connect each food to whether it is made from a batter or a dough.",
  "Link each food below to the type of mixture used to cook it.",
  "Match each dish to the flour mixture behind it.",
  "Pair each food item with its correct flour mixture type.",
];

export const flourMixtures: Skill = {
  id: "ag-f-flour-mixtures",
  code: "F.2",
  subjectId: "agriculture-nutrition",
  strandId: "ag-food-production",
  grade: 9,
  title: "Cooking with flour mixtures",
  description: "Match each food to the type of flour mixture used to make it.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, PRODUCTS);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.name] = p.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((p) => ({ id: p.name, label: p.name })),
        buckets: [
          { id: "batter", label: "Batter" },
          { id: "dough", label: "Dough" },
        ],
        correctBucket,
        hint: "A batter is a runny mixture that is poured; a dough is a firmer mixture that is kneaded.",
        explanation: items.map((p) => `${p.name} is ${p.description}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, PRODUCTS);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.description })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.name] = p.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Flour mixtures used in food production are either batters (runny, poured) or doughs (firm, kneaded).",
      explanation: chosen.map((p) => `${p.name} is ${p.description}.`).join(" "),
    };
  },
};
