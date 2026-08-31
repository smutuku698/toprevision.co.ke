import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Ich möchte bitte eine Tasse Tee.", meaning: "I would like a cup of tea, please." },
  { phrase: "Darf ich eine Flasche Wasser haben?", meaning: "May I have a bottle of water?" },
  { phrase: "Danke.", meaning: "Thank you." },
  { phrase: "Bitte schön.", meaning: "You're welcome. / Here you are." },
  { phrase: "Ich möchte eine Flasche Wasser, bitte.", meaning: "I would like a bottle of water, please." },
];

const SORT_ITEMS: { label: string; bucket: "polite" | "item" }[] = [
  { label: "Ich möchte bitte...", bucket: "polite" },
  { label: "Darf ich... bestellen?", bucket: "polite" },
  { label: "Danke", bucket: "polite" },
  { label: "Bitte schön", bucket: "polite" },
  { label: "eine Tasse Tee", bucket: "item" },
  { label: "eine Flasche Wasser", bucket: "item" },
];

export const eatingOutSpeaking: Skill = {
  id: "de-ls-eating-out",
  code: "LS.6",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Food and drinks: eating out",
  description: "Match German restaurant expressions to their meaning, and sort polite phrases from ordered items.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const polite = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "polite")).slice(0, 3);
      const item = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "item"));
      const items = shuffle(rng, [...polite, ...item]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.label] = it.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each phrase as a Polite expression or a Food/drink item.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "polite", label: "Polite expression" },
          { id: "item", label: "Food/drink item" },
        ],
        correctBucket,
        hint: "Polite expressions are used to ask or thank; items are the food or drink being ordered.",
        explanation: `Polite: ${polite.map((f) => f.label).join(" / ")}. Item: ${item.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each German restaurant expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'bitte' and 'Bitte schön' look similar but mean different things depending on context.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
