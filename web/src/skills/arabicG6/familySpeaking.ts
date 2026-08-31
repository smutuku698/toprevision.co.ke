import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FAMILY_VOCAB, name, place } from "./shared";

// Sub-strand 1.2 Listening for Gist: Attentive Listening — Theme: Family.
// Content: minimal pairs (pronounced accurately), vocabulary building on nuclear family members
// identified from an oral text. "Minimal pairs" here are modelled as the base family word vs. its
// "my ___" possessive form (ab -> abi), which differ by exactly one final sound — a genuine,
// curriculum-appropriate minimal-pair contrast for this vocabulary set.

const POSSESSIVE_PAIRS: { base: string; mine: string; meaning: string; myMeaning: string }[] = [
  { base: "ab", mine: "abi", meaning: "father", myMeaning: "my father" },
  { base: "umm", mine: "ummi", meaning: "mother", myMeaning: "my mother" },
  { base: "akh", mine: "akhi", meaning: "brother", myMeaning: "my brother" },
  { base: "ukht", mine: "ukhti", meaning: "sister", myMeaning: "my sister" },
  { base: "ibn", mine: "ibni", meaning: "son", myMeaning: "my son" },
  { base: "bint", mine: "binti", meaning: "daughter", myMeaning: "my daughter" },
  { base: "jadd", mine: "jaddi", meaning: "grandfather", myMeaning: "my grandfather" },
  { base: "jadda", mine: "jaddati", meaning: "grandmother", myMeaning: "my grandmother" },
  { base: "amm", mine: "ammi", meaning: "paternal uncle", myMeaning: "my paternal uncle" },
  { base: "khaal", mine: "khaali", meaning: "maternal uncle", myMeaning: "my maternal uncle" },
  { base: "khaala", mine: "khaalati", meaning: "maternal aunt", myMeaning: "my maternal aunt" },
  { base: "amma", mine: "ammati", meaning: "paternal aunt", myMeaning: "my paternal aunt" },
];

const REASONING_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} points to their father's father and says "jaddi." Who is ${n} pointing to?`,
    correct: "grandfather",
    distractors: ["father", "uncle", "brother"],
    explanation: `"jaddi" means "my grandfather" — one generation above ${n}'s father.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} introduces a woman as "ummi." Who is she?`,
    correct: "mother",
    distractors: ["grandmother", "aunt", "sister"],
    explanation: `"ummi" means "my mother".`,
  }),
  (n, p) => ({
    prompt: `${n} says "akhi yal'ab kurat al-qadam" (my ___ plays football) in ${p}. Which relation fills the blank?`,
    correct: "brother",
    distractors: ["father", "uncle", "grandfather"],
    explanation: `"akhi" means "my brother".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "khaali" while pointing to their mother's brother. What does "khaali" mean?`,
    correct: "my maternal uncle",
    distractors: ["my paternal uncle", "my grandfather", "my brother"],
    explanation: `"khaal" is specifically the MOTHER's brother; "amm" would be the father's brother.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "ammi" while pointing to their father's brother. What does "ammi" mean?`,
    correct: "my paternal uncle",
    distractors: ["my maternal uncle", "my grandfather", "my son"],
    explanation: `"amm" is specifically the FATHER's brother; "khaal" would be the mother's brother.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} shows a photo of their baby cousin and says "binti" by mistake. What word should ${n} have used instead, since it isn't ${n}'s own child?`,
    correct: "the cousin's own name, not a possessive family word for daughter",
    distractors: ["binti is always correct for any young girl", "akhi", "jaddati"],
    explanation: `"binti" means "MY daughter" — it should only be used for one's own child, not any young relative.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "ukhti tadrusu fi ${p}" (my ___ studies in ${p}). Which relation fills the blank?`,
    correct: "sister",
    distractors: ["mother", "aunt", "grandmother"],
    explanation: `"ukhti" means "my sister".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "jaddati tatbakhu jayyidan" (my ___ cooks well). Which relation fills the blank?`,
    correct: "grandmother",
    distractors: ["mother", "aunt", "sister"],
    explanation: `"jaddati" means "my grandmother".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "ibni saghir" (my ___ is young). Which relation fills the blank?`,
    correct: "son",
    distractors: ["brother", "father", "uncle"],
    explanation: `"ibni" means "my son".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "khaalati tazuruna ghadan" (my ___ visits us tomorrow). Which relation fills the blank?`,
    correct: "maternal aunt",
    distractors: ["paternal aunt", "grandmother", "sister"],
    explanation: `"khaalati" means "my maternal aunt" — the mother's sister.`,
  }),
];

const GENERATION_LADDER: { ladder: { word: string; meaning: string }[] }[] = [
  { ladder: [{ word: "jadd", meaning: "grandfather" }, { word: "ab", meaning: "father" }, { word: "akh", meaning: "brother" }, { word: "ibn", meaning: "son (next generation)" }] },
  { ladder: [{ word: "jadda", meaning: "grandmother" }, { word: "umm", meaning: "mother" }, { word: "ukht", meaning: "sister" }, { word: "bint", meaning: "daughter (next generation)" }] },
  { ladder: [{ word: "jadd", meaning: "grandfather" }, { word: "amm", meaning: "paternal uncle (same generation as father)" }, { word: "ibn", meaning: "son" }] },
  { ladder: [{ word: "jadda", meaning: "grandmother" }, { word: "khaala", meaning: "maternal aunt (same generation as mother)" }, { word: "bint", meaning: "daughter" }] },
  { ladder: [{ word: "jadd", meaning: "grandfather" }, { word: "umm", meaning: "mother" }, { word: "akh", meaning: "brother" }] },
];

export const familySpeaking: Skill = {
  id: "g6-ar-ls-family",
  code: "LS.2",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Listening for gist: attentive listening (family)",
  description: "Practise pronouncing minimal-pair family words (base word vs. 'my ___' form) and identify nuclear family vocabulary from spoken descriptions.",
  generate(rng) {
    const branch = randChoice(rng, ["pair", "reasoning", "match", "categorize", "ordering"] as const);

    if (branch === "pair") {
      const pair = randChoice(rng, POSSESSIVE_PAIRS);
      const askMine = randChoice(rng, [true, false]);
      const distractPool = shuffle(rng, POSSESSIVE_PAIRS.filter((p) => p.base !== pair.base)).slice(0, 3);
      const correct = askMine ? pair.mine : pair.base;
      const distractors = askMine ? distractPool.map((p) => p.mine) : distractPool.map((p) => p.base);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: askMine
          ? randChoice(rng, [`Which word means "${pair.myMeaning}"?`, `How do you say "${pair.myMeaning}" in Arabic?`, `Pick the word for "${pair.myMeaning}".`])
          : randChoice(rng, [`Which word means just "${pair.meaning}" (not "my ${pair.meaning}")?`, `Pick the base word for "${pair.meaning}".`, `Which word means simply "${pair.meaning}"?`]),
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: "The 'my ___' form adds an '-i' sound at the end — that one extra sound is the minimal-pair difference.",
        explanation: `"${pair.base}" means "${pair.meaning}" while "${pair.mine}" means "${pair.myMeaning}" — they are a minimal pair, differing only by the final '-i' sound.`,
      };
    }

    if (branch === "reasoning") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, REASONING_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Listen for which possessive family word is used, and think about which relative it names.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FAMILY_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each family word to its meaning.",
          "Match the spoken family word to what it means.",
          "Which meaning goes with which family word?",
          "Pair each family term with its correct meaning.",
          "Match each word you hear to its family meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const nuclear = new Set(["ab", "umm", "akh", "ukht", "ibn", "bint"]);
      const chosen2 = shuffle(rng, FAMILY_VOCAB).slice(0, 8);
      const items = chosen2.map((p, i) => ({ id: `${i}-${p.word}`, label: p.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((p, i) => (correctBucket[`${i}-${p.word}`] = nuclear.has(p.word) ? "Nuclear" : "Extended"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each family word: Nuclear family, or Extended family?",
          "Group these family words by nuclear vs extended family.",
          "Which family group does each word belong to?",
          "Sort each family term into the correct category.",
          "Classify each family word below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Nuclear", label: "Nuclear family (parents, siblings, children)" },
          { id: "Extended", label: "Extended family (grandparents, aunts, uncles)" },
        ],
        correctBucket,
        hint: "Nuclear family = parents, brothers/sisters, sons/daughters. Extended family = grandparents, uncles, aunts.",
        explanation: chosen2.map((p) => `"${p.word}" (${p.meaning}) is ${nuclear.has(p.word) ? "nuclear" : "extended"} family.`).join(" "),
      };
    }

    const set = randChoice(rng, GENERATION_LADDER);
    const items = shuffle(rng, set.ladder.map((s, i) => ({ id: `${i}-${s.word}`, label: `${s.word} (${s.meaning})` })));
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        "Order these family members from the oldest generation to the youngest.",
        "Arrange these relatives from oldest to youngest generation.",
        "Sequence these family words by generation, oldest first.",
        "Put these family members in generation order.",
        "Which generation comes first? Order them oldest to youngest.",
      ]),
      instruction: "Click the family members in generation order, oldest first.",
      items,
      correctOrder: set.ladder.map((s, i) => `${i}-${s.word}`),
      hint: "Grandparents come before parents/aunts/uncles, who come before you and your siblings, who come before your children.",
      explanation: `From oldest to youngest generation: ${set.ladder.map((s) => `${s.word} (${s.meaning})`).join(" -> ")}.`,
    };
  },
};
