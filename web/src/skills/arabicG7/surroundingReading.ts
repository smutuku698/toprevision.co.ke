import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Zainab: Let's go to the suuq today.",
  "Hassan: Yes! The suuq is near the masjid.",
  "Zainab: We can walk on the tareeq by the nahr.",
  "Hassan: After the suuq, let's visit the maktaba.",
  "Zainab: Good idea — it's next to the hadiqa.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Where do Zainab and Hassan plan to go first?",
    correct: "The suuq (market)",
    distractors: ["The masjid (mosque)", "The maktaba (library)", "The hadiqa (garden)"],
    explanation: "Zainab says, \"Let's go to the suuq today.\"",
  },
  {
    q: "What is the suuq near, according to Hassan?",
    correct: "al-masjid (the mosque)",
    distractors: ["al-maktaba (the library)", "al-hadiqa (the garden)", "al-madrasa (the school)"],
    explanation: "Hassan says, \"The suuq is near the masjid.\"",
  },
  {
    q: "Which path do Zainab and Hassan take to the suuq?",
    correct: "The tareeq (road) by the nahr (river)",
    distractors: ["The tareeq by the jabal (mountain)", "A path through the hadiqa (garden)", "They take a haafila (bus)"],
    explanation: "Zainab says, \"We can walk on the tareeq by the nahr.\"",
  },
  {
    q: "What do Zainab and Hassan plan to visit after the suuq?",
    correct: "al-maktaba (the library)",
    distractors: ["al-masjid (the mosque)", "al-bayt (the house)", "al-madrasa (the school)"],
    explanation: "Hassan says, \"After the suuq, let's visit the maktaba.\"",
  },
];

// Restricted to words that actually appear in PASSAGE above — the click-match prompt below
// claims "from the dialogue," so every entry here must be verifiably present in it.
const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "suuq", meaning: "market" },
  { phrase: "masjid", meaning: "mosque" },
  { phrase: "maktaba", meaning: "library" },
  { phrase: "hadiqa", meaning: "garden / park" },
  { phrase: "tareeq", meaning: "road / street" },
  { phrase: "nahr", meaning: "river" },
];

const PLACE_GROUPS: { word: string; bucket: "Indoor" | "Outdoor" }[] = [
  { word: "madrasa (school)", bucket: "Indoor" },
  { word: "bayt (house)", bucket: "Indoor" },
  { word: "masjid (mosque)", bucket: "Indoor" },
  { word: "maktaba (library)", bucket: "Indoor" },
  { word: "suuq (market)", bucket: "Outdoor" },
  { word: "hadiqa (garden)", bucket: "Outdoor" },
  { word: "tareeq (road)", bucket: "Outdoor" },
  { word: "nahr (river)", bucket: "Outdoor" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "The Arabic word for \"market\" is ", after: ".", correct: "suuq" },
  { before: "The Arabic word for \"library\" is ", after: ".", correct: "maktaba" },
  { before: "The Arabic word for \"garden or park\" is ", after: ".", correct: "hadiqa" },
  { before: "The Arabic word for \"road or street\" is ", after: ".", correct: "tareeq" },
  { before: "Zainab: We can walk on the ", after: " by the nahr.", correct: "tareeq" },
];

export const surroundingReading: Skill = {
  id: "g7-ar-r-surrounding",
  code: "R.3",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading aloud: my surrounding (the market)",
  description: "Read short, simple Arabic sentences about the market and places nearby, fluently and at a good pace.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = PLACE_GROUPS.map((p, i) => ({ id: `w${i}`, label: p.word, bucket: p.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each place as Indoor or Outdoor.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Indoor", label: "Indoor place" },
          { id: "Outdoor", label: "Outdoor place" },
        ],
        correctBucket,
        hint: "Think about whether you are usually under a roof or out in the open at each place.",
        explanation: PLACE_GROUPS.map((p) => `"${p.word}" is an ${p.bucket === "Indoor" ? "indoor" : "outdoor"} place.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each place word from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Zainab suggests the suuq first, then they talk about the route, then their next stop.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the dialogue above for the exact word.",
        explanation: `The missing word is "${f.correct}".`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what Zainab and Hassan say about each place in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
