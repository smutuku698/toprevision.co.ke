import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { phrase: string; meaning: string }[] = [
  { phrase: "astayqidh", meaning: "I wake up" },
  { phrase: "aakul", meaning: "I eat" },
  { phrase: "adhhab ilaa al-madrasa", meaning: "I go to school" },
  { phrase: "adrus", meaning: "I study" },
  { phrase: "anaam", meaning: "I sleep" },
];

const MATCH_PROMPTS = [
  "Match each Arabic routine expression to its English meaning.",
  "Pair each Arabic daily-routine expression with what it means in English.",
  "Connect each routine expression below to its correct English meaning.",
  "Match each Arabic routine verb to its English translation.",
  "Which English meaning goes with each Arabic routine expression? Match them up.",
  "Link each Arabic daily-routine word to what it means in English.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each activity as a Morning activity or an Evening activity.",
  "Decide whether each activity is a Morning activity or an Evening activity, then sort it.",
  "Group these activities under Morning activity or Evening activity.",
  "Is each activity below a Morning activity or an Evening activity? Sort it into the right group.",
  "Place each activity into the Morning activity or Evening activity category.",
  "Sort these daily activities into Morning activities and Evening activities.",
];

const SORT_ITEMS: { label: string; bucket: "morning" | "evening" }[] = [
  { label: "astayqidh (I wake up)", bucket: "morning" },
  { label: "aakul al-fatoor (I eat breakfast)", bucket: "morning" },
  { label: "adhhab ilaa al-madrasa (I go to school)", bucket: "morning" },
  { label: "adrus (I study)", bucket: "evening" },
  { label: "aakul al-'asha' (I eat dinner)", bucket: "evening" },
  { label: "anaam (I sleep)", bucket: "evening" },
];

export const timeSpeaking: Skill = {
  id: "ar-ls-time",
  code: "LS.4",
  subjectId: "arabic",
  strandId: "ar-listening-speaking",
  grade: 9,
  title: "Daily routine and time",
  description: "Match Arabic daily-routine verbs to their meaning, and sort morning from evening activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const morning = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "morning"));
      const evening = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "evening"));
      const items = shuffle(rng, [...morning, ...evening]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "morning", label: "Morning activity" },
          { id: "evening", label: "Evening activity" },
        ],
        correctBucket,
        hint: "Think about the order of a typical school day, from waking up to going to bed.",
        explanation: [...morning, ...evening].map((f) => `"${f.label}" is a ${f.bucket} activity.`).join(" "),
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
      hint: "Picture a typical school day in order to help you recall each activity.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
