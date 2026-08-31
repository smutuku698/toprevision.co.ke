import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Kamau: Let me tell you about the weather today.",
  "Kamau: The shams is haar this morning.",
  "Kamau: But riyah is picking up now.",
  "Kamau: By afternoon, matar may fall, and it will feel baarid.",
  "Kamau: My village sits between a jabal and a wadi, near a ghaaba.",
  "Kamau: On holiday, we like to visit the bahr.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to Kamau's spoken weather report. What is the weather like this morning?",
    correct: "The shams (sun) is haar (hot)",
    distractors: ["The matar (rain) is falling", "It is baarid (cold)", "There is snow"],
    explanation: "Kamau says, \"The shams is haar this morning.\"",
  },
  {
    q: "What does Kamau say is picking up now?",
    correct: "riyah (wind)",
    distractors: ["matar (rain)", "shams (sun)", "Nothing is changing"],
    explanation: "Kamau says, \"riyah is picking up now.\"",
  },
  {
    q: "What does Kamau say may happen by afternoon?",
    correct: "matar (rain) may fall, and it will feel baarid (cold)",
    distractors: ["The shams (sun) will get hotter", "Nothing will change", "The riyah (wind) will stop completely"],
    explanation: "Kamau says, \"By afternoon, matar may fall, and it will feel baarid.\"",
  },
  {
    q: "Where does Kamau say his family likes to visit on holiday?",
    correct: "The bahr (sea)",
    distractors: ["The ghaaba (forest)", "The wadi (valley)", "The jabal (mountain)"],
    explanation: "Kamau says, \"On holiday, we like to visit the bahr.\"",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Weather" | "Landscape" }[] = [
  { label: "matar", bucket: "Weather" },
  { label: "riyah", bucket: "Weather" },
  { label: "jabal", bucket: "Landscape" },
  { label: "bahr", bucket: "Landscape" },
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

export const weatherSpeaking: Skill = {
  id: "g8-ar-ls-weather",
  code: "LS.8",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: weather and environment",
  description: "Listen to Kamau give a spoken weather report about his region, answer comprehension questions, and practise weather words aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each word as Weather or Landscape.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Weather", label: "Weather" },
          { id: "Landscape", label: "Landscape" },
        ],
        correctBucket,
        hint: "Weather changes day to day; a landscape feature stays in place.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is ${s.bucket === "Weather" ? "a weather word" : "a landscape feature"}.`).join(" "),
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
        speakable: true,
        prompt: "Match each spoken weather or landscape word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
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
        speakable: true,
        prompt: "Put these lines from Kamau's spoken weather report in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Kamau describes the morning first, then the wind, then the afternoon rain, then the landscape, then holidays.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      speakable: true,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Listen for how Kamau describes the weather and landscape in each part.",
      explanation: q.explanation,
    };
  },
};
