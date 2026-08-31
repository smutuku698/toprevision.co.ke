import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "maa'", meaning: "water" },
  { phrase: "khubz", meaning: "bread" },
  { phrase: "lahm", meaning: "meat" },
  { phrase: "aruz", meaning: "rice" },
  { phrase: "shay", meaning: "tea" },
  { phrase: "qahwa", meaning: "coffee" },
  { phrase: "min fadlik", meaning: "please" },
  { phrase: "al-hisab min fadlik", meaning: "the bill, please" },
];

const MATCH_PROMPTS = [
  "Match each Arabic word to its English meaning.",
  "Pair each Arabic food, drink, or etiquette word with what it means in English.",
  "Connect each word below to its correct English meaning.",
  "Match each Arabic restaurant word to its English translation.",
  "Which English meaning goes with each Arabic word? Match them up.",
  "Link each Arabic food or drink word to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each word as Food, Drink, or Restaurant etiquette.",
  "Decide whether each word is Food, Drink, or Restaurant etiquette, then sort it.",
  "Group these words under Food, Drink, or Restaurant etiquette.",
  "Is each word below Food, Drink, or Restaurant etiquette? Sort it into the right group.",
  "Place each word into the Food, Drink, or Restaurant etiquette category.",
  "Sort these Arabic words into Food, Drink, and Restaurant etiquette.",
];

const SORT_ITEMS: { label: string; bucket: "food" | "drink" | "etiquette" }[] = [
  { label: "khubz (bread)", bucket: "food" },
  { label: "lahm (meat)", bucket: "food" },
  { label: "aruz (rice)", bucket: "food" },
  { label: "maa' (water)", bucket: "drink" },
  { label: "shay (tea)", bucket: "drink" },
  { label: "qahwa (coffee)", bucket: "drink" },
  { label: "min fadlik (please)", bucket: "etiquette" },
  { label: "al-hisab min fadlik (the bill, please)", bucket: "etiquette" },
];

export const foodSpeaking: Skill = {
  id: "ar-ls-food",
  code: "LS.6",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Food, drinks, and restaurant etiquette",
  description: "Match Arabic food, drink, and etiquette words to their meaning, and sort them into categories.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const food = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "food"));
      const drink = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "drink"));
      const etiquette = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "etiquette"));
      const items = shuffle(rng, [...food, ...drink, ...etiquette]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "food", label: "Food" },
          { id: "drink", label: "Drink" },
          { id: "etiquette", label: "Restaurant etiquette" },
        ],
        correctBucket,
        hint: "Etiquette words are polite phrases used while ordering, not items you eat or drink.",
        explanation: [...food, ...drink, ...etiquette].map((f) => `"${f.label}" is ${f.bucket === "etiquette" ? "a restaurant etiquette phrase" : "a " + f.bucket + " item"}.`).join(" "),
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
      hint: "Picture a restaurant table and what you might order or say there.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
