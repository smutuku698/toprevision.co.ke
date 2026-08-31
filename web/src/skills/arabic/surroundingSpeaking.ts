import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "qitta", meaning: "cat" },
  { phrase: "kalb", meaning: "dog" },
  { phrase: "baqara", meaning: "cow" },
  { phrase: "kharoof", meaning: "sheep" },
  { phrase: "asad", meaning: "lion" },
  { phrase: "feel", meaning: "elephant" },
  { phrase: "dajaja", meaning: "chicken" },
  { phrase: "hisaan", meaning: "horse" },
];

const MATCH_PROMPTS = [
  "Match each Arabic animal word to its English meaning.",
  "Pair each Arabic animal word with what it means in English.",
  "Connect each animal word below to its correct English meaning.",
  "Match each Arabic word for an animal to its English translation.",
  "Which English meaning goes with each Arabic animal word? Match them up.",
  "Link each Arabic animal name to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each animal as Pet, Farm animal, or Wild animal.",
  "Decide whether each animal is a Pet, Farm animal, or Wild animal, then sort it.",
  "Group these animals under Pet, Farm animal, or Wild animal.",
  "Is each animal below a Pet, Farm animal, or Wild animal? Sort it into the right group.",
  "Place each animal into the Pet, Farm animal, or Wild animal category.",
  "Sort these animals into Pets, Farm animals, and Wild animals.",
];

const SORT_ITEMS: { label: string; bucket: "pet" | "farm" | "wild" }[] = [
  { label: "qitta (cat)", bucket: "pet" },
  { label: "kalb (dog)", bucket: "pet" },
  { label: "baqara (cow)", bucket: "farm" },
  { label: "kharoof (sheep)", bucket: "farm" },
  { label: "dajaja (chicken)", bucket: "farm" },
  { label: "asad (lion)", bucket: "wild" },
  { label: "feel (elephant)", bucket: "wild" },
];

export const surroundingSpeaking: Skill = {
  id: "ar-ls-surrounding",
  code: "LS.3",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Animals in my surrounding",
  description: "Match Arabic animal words to their meaning, and sort pets, farm, and wild animals.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const pets = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "pet"));
      const farm = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "farm")).slice(0, 2);
      const wild = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "wild"));
      const items = shuffle(rng, [...pets, ...farm, ...wild]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "pet", label: "Pet" },
          { id: "farm", label: "Farm animal" },
          { id: "wild", label: "Wild animal" },
        ],
        correctBucket,
        hint: "Pets live in the home, farm animals are raised for food or work, wild animals live freely in nature.",
        explanation: [...pets, ...farm, ...wild].map((f) => `${f.label} is a ${f.bucket === "pet" ? "pet" : f.bucket === "farm" ? "farm animal" : "wild animal"}.`).join(" "),
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
      hint: "Think about the size and habitat of each animal to help you recall its Arabic name.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
