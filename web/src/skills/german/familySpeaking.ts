import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { categorizePrompts, matchMeaningPrompts } from "./germanPromptPools";

const CATEGORIZE_PROMPTS = categorizePrompts("family word", "Nuclear family or Extended family");
const MATCH_PROMPTS = matchMeaningPrompts("family word");

const WORDS: { word: string; meaning: string }[] = [
  { word: "der Vater", meaning: "father" },
  { word: "die Mutter", meaning: "mother" },
  { word: "die Eltern", meaning: "parents" },
  { word: "der Bruder", meaning: "brother" },
  { word: "die Schwester", meaning: "sister" },
  { word: "die Oma", meaning: "grandma" },
  { word: "der Opa", meaning: "grandpa" },
  { word: "der Onkel", meaning: "uncle" },
  { word: "die Tante", meaning: "aunt" },
];

const SORT_ITEMS: { label: string; bucket: "nuclear" | "extended" }[] = [
  { label: "der Vater", bucket: "nuclear" },
  { label: "die Mutter", bucket: "nuclear" },
  { label: "der Bruder", bucket: "nuclear" },
  { label: "die Schwester", bucket: "nuclear" },
  { label: "die Oma", bucket: "extended" },
  { label: "der Opa", bucket: "extended" },
  { label: "der Onkel", bucket: "extended" },
  { label: "die Tante", bucket: "extended" },
];

export const familySpeaking: Skill = {
  id: "de-ls-family",
  code: "LS.2",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Family: nuclear and extended family members",
  description: "Match German family words to their meaning, and sort nuclear from extended family members.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const nuclear = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "nuclear")).slice(0, 3);
      const extended = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "extended")).slice(0, 3);
      const items = shuffle(rng, [...nuclear, ...extended]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "nuclear", label: "Nuclear family" },
          { id: "extended", label: "Extended family" },
        ],
        correctBucket,
        hint: "Nuclear family is parents and siblings; extended family reaches to grandparents, uncles, and aunts.",
        explanation: `Nuclear: ${nuclear.map((f) => f.label).join(" / ")}. Extended: ${extended.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, WORDS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.word] = p.word;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "German nouns carry a gender article: der (masculine), die (feminine).",
      explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
    };
  },
};
