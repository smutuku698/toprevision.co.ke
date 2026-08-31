import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Kamau: In my region, the shams is haar in December, and it barely rains.",
  "Kamau: In April, the matar falls often, and it becomes baarid, with strong riyah.",
  "Kamau: My village sits between a jabal and a wadi, near a ghaaba.",
  "Kamau: On holiday, my family visits the bahr.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is the weather like in December, according to Kamau?",
    correct: "The shams (sun) is haar (hot), with little rain",
    distractors: ["It is baarid (cold) with strong riyah (wind)", "It rains every day", "There is snow"],
    explanation: "Kamau says, \"the shams is haar in December, and it barely rains.\"",
  },
  {
    q: "What happens in April?",
    correct: "The matar (rain) falls often, and it becomes baarid (cold)",
    distractors: ["The shams (sun) becomes hotter", "Nothing changes", "The riyah (wind) stops completely"],
    explanation: "Kamau says, \"In April, the matar falls often, and it becomes baarid, with strong riyah.\"",
  },
  {
    q: "What two landforms does Kamau say his village sits between?",
    correct: "A jabal (mountain) and a wadi (valley)",
    distractors: ["A bahr (sea) and a ghaaba (forest)", "A nahr (river) and a suuq (market)", "A jabal (mountain) and a bahr (sea)"],
    explanation: "Kamau says his village \"sits between a jabal and a wadi.\"",
  },
  {
    q: "Where does Kamau's family go on holiday?",
    correct: "The bahr (sea)",
    distractors: ["The ghaaba (forest)", "The wadi (valley)", "The jabal (mountain)"],
    explanation: "Kamau says, \"On holiday, my family visits the bahr.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kamau says December is haar with little rain.", isTrue: true },
  { text: "Kamau says it never rains in his region.", isTrue: false },
  { text: "Kamau's village is near a ghaaba.", isTrue: true },
  { text: "Kamau's family visits the jabal on holiday.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "matar", meaning: "rain" },
  { phrase: "shams", meaning: "sun" },
  { phrase: "haar", meaning: "hot" },
  { phrase: "baarid", meaning: "cold" },
  { phrase: "riyah", meaning: "wind" },
  { phrase: "jabal", meaning: "mountain" },
  { phrase: "bahr", meaning: "sea" },
  { phrase: "ghaaba", meaning: "forest" },
  { phrase: "wadi", meaning: "valley" },
];

export const weatherReading: Skill = {
  id: "g8-ar-r-weather",
  code: "R.8",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: weather and environment",
  description: "Read a short Arabic passage describing weather and landscape and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage carefully and check the weather and landscape details for each part.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
        prompt: "Match each word from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the passage above.",
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
        prompt: "Put these lines from the passage in the order they appear.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Kamau describes December first, then April, then the landscape, then holidays.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Look at how Kamau describes the weather and landscape in each part of the passage.",
      explanation: q.explanation,
    };
  },
};
