import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { term: string; meaning: string }[] = [
  { term: "le père", meaning: "father" },
  { term: "la mère", meaning: "mother" },
  { term: "le frère", meaning: "brother" },
  { term: "la sœur", meaning: "sister" },
  { term: "le grand-père", meaning: "grandfather" },
  { term: "la grand-mère", meaning: "grandmother" },
  { term: "l'oncle", meaning: "uncle" },
  { term: "la tante", meaning: "aunt" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each family member as part of the Nuclear family (famille nucléaire) or Extended family (famille élargie).",
  "Decide whether each family member is Nuclear or Extended family, then sort it.",
  "Group these family members into Nuclear family and Extended family.",
  "Which of these relatives belong to the nuclear family and which to the extended family? Sort them.",
  "Place each family member under Nuclear family or Extended family.",
  "Sort each relative by whether they are nuclear or extended family.",
];

const MATCH_PROMPTS = [
  "Match each French family word to its English meaning.",
  "Pair each French family term with its correct English meaning.",
  "Connect each family word to what it means in English.",
  "Match each term below to its English translation.",
  "Link each French family word to the meaning that fits it.",
  "Match each family term to its English equivalent.",
];

const MEMBERS: { label: string; bucket: "nuclear" | "extended" }[] = [
  { label: "le père", bucket: "nuclear" },
  { label: "la mère", bucket: "nuclear" },
  { label: "le frère", bucket: "nuclear" },
  { label: "la sœur", bucket: "nuclear" },
  { label: "le grand-père", bucket: "extended" },
  { label: "la grand-mère", bucket: "extended" },
  { label: "l'oncle", bucket: "extended" },
  { label: "la tante", bucket: "extended" },
];

export const familySpeaking: Skill = {
  id: "fr-ls-family",
  code: "LS.2",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Talking about the nuclear and extended family",
  description: "Match family vocabulary to its meaning, and sort family members into nuclear or extended family.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const nuclear = shuffle(rng, MEMBERS.filter((m) => m.bucket === "nuclear")).slice(0, 3);
      const extended = shuffle(rng, MEMBERS.filter((m) => m.bucket === "extended")).slice(0, 3);
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
        hint: "Nuclear family (famille nucléaire) is parents and siblings; extended family (famille élargie) reaches further, like grandparents, uncles, and aunts.",
        explanation: `Nuclear family: ${nuclear.map((m) => m.label).join(" / ")}. Extended family: ${extended.map((m) => m.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, TERMS).slice(0, 4);
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
      hint: "Le/la before a word signals its gender: le for masculine, la for feminine.",
      explanation: chosen.map((t) => `"${t.term}" means "${t.meaning}".`).join(" "),
    };
  },
};
