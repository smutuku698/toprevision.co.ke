import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "mareed", meaning: "sick" },
  { phrase: "muta'ab", meaning: "tired" },
  { phrase: "bikhayr", meaning: "well / fine" },
  { phrase: "jaa'i'", meaning: "hungry" },
  { phrase: "'atshaan", meaning: "thirsty" },
  { phrase: "nasheet", meaning: "energetic" },
];

const MATCH_PROMPTS = [
  "Match each Arabic word for a state of health to its English meaning.",
  "Pair each Arabic health-state word with what it means in English.",
  "Connect each state-of-health word below to its correct English meaning.",
  "Match each Arabic word describing how someone feels to its English translation.",
  "Which English meaning goes with each Arabic health word? Match them up.",
  "Link each Arabic state-of-health word to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each state as a Good state of health or a state that Needs attention.",
  "Decide whether each state is Good or Needs attention, then sort it.",
  "Group these states under Good state of health or Needs attention.",
  "Is each state below Good or does it Need attention? Sort it into the right group.",
  "Place each state of health into the Good or Needs attention category.",
  "Sort these states of health into Good and Needs attention.",
];

const SORT_ITEMS: { label: string; bucket: "good" | "poor" }[] = [
  { label: "bikhayr (well/fine)", bucket: "good" },
  { label: "nasheet (energetic)", bucket: "good" },
  { label: "mareed (sick)", bucket: "poor" },
  { label: "muta'ab (tired)", bucket: "poor" },
  { label: "jaa'i' (hungry)", bucket: "poor" },
  { label: "'atshaan (thirsty)", bucket: "poor" },
];

export const bodySpeaking: Skill = {
  id: "ar-ls-body",
  code: "LS.7",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "States of health",
  description: "Match Arabic words for states of health to their meaning, and sort good states from states needing attention.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const good = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "good"));
      const poor = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "poor")).slice(0, 3);
      const items = shuffle(rng, [...good, ...poor]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "good", label: "Good state of health" },
          { id: "poor", label: "Needs attention" },
        ],
        correctBucket,
        hint: "Being well or energetic is a good state; being sick, tired, hungry, or thirsty needs attention.",
        explanation: [...good, ...poor].map((f) => `"${f.label}" is ${f.bucket === "good" ? "a good state of health" : "a state that needs attention"}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, WORDS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Think about how you might feel at different times of day.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
