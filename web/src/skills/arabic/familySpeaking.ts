import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "ab", meaning: "father" },
  { phrase: "umm", meaning: "mother" },
  { phrase: "akh", meaning: "brother" },
  { phrase: "ukht", meaning: "sister" },
  { phrase: "jadd", meaning: "grandfather" },
  { phrase: "jadda", meaning: "grandmother" },
  { phrase: "'amm", meaning: "paternal uncle" },
  { phrase: "khaal", meaning: "maternal uncle" },
];

const MATCH_PROMPTS = [
  "Match each Arabic family word to its English meaning.",
  "Pair each Arabic family word with what it means in English.",
  "Connect each family word below to its correct English meaning.",
  "Match each Arabic word for a family member to its English translation.",
  "Which English meaning goes with each Arabic family word? Match them up.",
  "Link each Arabic family term to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each family word as Nuclear family or Extended family.",
  "Decide whether each family word names Nuclear family or Extended family, then sort it.",
  "Group these family words under Nuclear family or Extended family.",
  "Is each word below Nuclear family or Extended family? Sort it into the right group.",
  "Place each family word into the Nuclear family or Extended family category.",
  "Sort these Arabic family words into Nuclear family and Extended family.",
];

const SORT_ITEMS: { label: string; bucket: "nuclear" | "extended" }[] = [
  { label: "ab (father)", bucket: "nuclear" },
  { label: "umm (mother)", bucket: "nuclear" },
  { label: "akh (brother)", bucket: "nuclear" },
  { label: "ukht (sister)", bucket: "nuclear" },
  { label: "jadd (grandfather)", bucket: "extended" },
  { label: "jadda (grandmother)", bucket: "extended" },
  { label: "'amm (paternal uncle)", bucket: "extended" },
  { label: "khaal (maternal uncle)", bucket: "extended" },
];

export const familySpeaking: Skill = {
  id: "ar-ls-family",
  code: "LS.2",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Family members",
  description: "Match Arabic family words to their meaning, and sort nuclear from extended family members.",
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
        hint: "Nuclear family = parents and siblings living together; extended family = grandparents, uncles, aunts.",
        explanation: `Nuclear: ${nuclear.map((f) => f.label).join(" / ")}. Extended: ${extended.map((f) => f.label).join(" / ")}.`,
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
      hint: "'amm is a father's brother, while khaal is a mother's brother — Arabic distinguishes the two.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
