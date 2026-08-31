import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EXPRESSIONS: { term: string; meaning: string }[] = [
  { term: "Je voudrais du poulet, s'il vous plaît", meaning: "I would like some chicken, please" },
  { term: "J'aimerais du café, s'il vous plaît", meaning: "I would like some coffee, please" },
  { term: "J'ai besoin d'un couteau", meaning: "I need a knife" },
  { term: "L'addition, s'il vous plaît", meaning: "The bill, please" },
  { term: "le menu", meaning: "the menu" },
  { term: "le serveur", meaning: "the waiter" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each item as Food (nourriture) or Drink (boisson).",
  "Decide whether each item is food or drink, then sort it.",
  "Group these items into Food and Drink.",
  "Which of these items are food and which are drink? Sort them.",
  "Place each item under Food or Drink.",
  "Sort each item on the menu by whether it is food or drink.",
];

const MATCH_PROMPTS = [
  "Match each French restaurant expression to its English meaning.",
  "Pair each French restaurant phrase with its correct English meaning.",
  "Connect each restaurant expression to what it means in English.",
  "Match each phrase below to its English translation.",
  "Link each French restaurant expression to the meaning that fits it.",
  "Match each expression to its English equivalent.",
];

const SORT_ITEMS: { label: string; bucket: "food" | "drink" }[] = [
  { label: "le poulet", bucket: "food" },
  { label: "le riz", bucket: "food" },
  { label: "le poisson", bucket: "food" },
  { label: "la salade", bucket: "food" },
  { label: "le pain", bucket: "food" },
  { label: "le café", bucket: "drink" },
  { label: "le thé", bucket: "drink" },
  { label: "le jus", bucket: "drink" },
  { label: "l'eau", bucket: "drink" },
];

export const eatingOutSpeaking: Skill = {
  id: "fr-ls-eating-out",
  code: "LS.6",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Ordering food at a restaurant",
  description: "Match restaurant expressions to their meaning, and sort items as food or drink.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const food = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "food")).slice(0, 4);
      const drink = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "drink")).slice(0, 4);
      const items = shuffle(rng, [...food, ...drink]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "food", label: "Food" },
          { id: "drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Think about what you'd eat versus what you'd drink at a restaurant.",
        explanation: `Food: ${food.map((m) => m.label).join(" / ")}. Drink: ${drink.map((m) => m.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, EXPRESSIONS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "'Je voudrais' and 'j'aimerais' are both polite ways to say 'I would like'.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
