import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EXPRESSIONS: { term: string; meaning: string }[] = [
  { term: "Il fait beau", meaning: "The weather is nice" },
  { term: "Il fait chaud", meaning: "It is hot" },
  { term: "Il pleut", meaning: "It is raining" },
  { term: "Il fait du vent", meaning: "It is windy" },
  { term: "la saison sèche", meaning: "the dry season" },
  { term: "la saison des pluies", meaning: "the rainy season" },
  { term: "la sécheresse", meaning: "the drought" },
  { term: "les inondations", meaning: "the floods" },
];

const SORT_ITEMS: { label: string; bucket: "good" | "bad" }[] = [
  { label: "Il fait beau", bucket: "good" },
  { label: "Il fait chaud", bucket: "good" },
  { label: "Il fait du soleil", bucket: "good" },
  { label: "Il pleut", bucket: "bad" },
  { label: "Il fait froid", bucket: "bad" },
  { label: "Il fait du vent", bucket: "bad" },
];

export const environmentSpeaking: Skill = {
  id: "fr-ls-environment",
  code: "LS.8",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Talking about weather and environment",
  description: "Match weather and environment expressions to their meaning, and sort good weather from bad weather.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, SORT_ITEMS);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each weather expression as Good weather (beau temps) or Bad weather (mauvais temps).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "good", label: "Good weather" },
          { id: "bad", label: "Bad weather" },
        ],
        correctBucket,
        hint: "'Beau', 'chaud', and 'soleil' describe pleasant weather; 'pleut', 'froid', and 'vent' describe less pleasant weather.",
        explanation: SORT_ITEMS.map((s) => `"${s.label}" is ${s.bucket === "good" ? "good" : "bad"} weather.`).join(" "),
      };
    }

    const chosen = shuffle(rng, EXPRESSIONS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each French weather/environment expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Il fait...' describes weather conditions; 'la saison...' describes a season.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
