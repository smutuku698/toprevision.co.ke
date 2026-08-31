import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "ziraa'a", meaning: "farming" },
  { phrase: "sayd as-samak", meaning: "fishing" },
  { phrase: "tijaara", meaning: "trade" },
  { phrase: "matar", meaning: "rain" },
  { phrase: "shams", meaning: "sun" },
  { phrase: "haar", meaning: "hot" },
  { phrase: "baarid", meaning: "cold" },
];

const MATCH_PROMPTS = [
  "Match each Arabic word to its English meaning.",
  "Pair each Arabic weather or activity word with what it means in English.",
  "Connect each word below to its correct English meaning.",
  "Match each Arabic weather-and-activity word to its English translation.",
  "Which English meaning goes with each Arabic word? Match them up.",
  "Link each Arabic weather or activity word to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each word as a Local activity or a Weather word.",
  "Decide whether each word is a Local activity or a Weather word, then sort it.",
  "Group these words under Local activity or Weather word.",
  "Is each word below a Local activity or a Weather word? Sort it into the right group.",
  "Place each word into the Local activity or Weather word category.",
  "Sort these Arabic words into Local activities and Weather words.",
];

const SORT_ITEMS: { label: string; bucket: "activity" | "weather" }[] = [
  { label: "ziraa'a (farming)", bucket: "activity" },
  { label: "sayd as-samak (fishing)", bucket: "activity" },
  { label: "tijaara (trade)", bucket: "activity" },
  { label: "matar (rain)", bucket: "weather" },
  { label: "shams (sun)", bucket: "weather" },
  { label: "haar (hot)", bucket: "weather" },
  { label: "baarid (cold)", bucket: "weather" },
];

export const weatherSpeaking: Skill = {
  id: "ar-ls-weather",
  code: "LS.8",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Weather and local activities",
  description: "Match Arabic words for weather and local activities to their meaning, and sort them into categories.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const activity = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "activity"));
      const weather = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "weather")).slice(0, 3);
      const items = shuffle(rng, [...activity, ...weather]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "activity", label: "Local activity" },
          { id: "weather", label: "Weather word" },
        ],
        correctBucket,
        hint: "Activities are things people do; weather words describe the sky or temperature.",
        explanation: [...activity, ...weather].map((f) => `"${f.label}" is a ${f.bucket === "activity" ? "local activity" : "weather word"}.`).join(" "),
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
      hint: "Think about what people in your locality do, and what the sky looks like on different days.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
