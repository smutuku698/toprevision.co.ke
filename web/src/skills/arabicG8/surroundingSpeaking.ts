import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Kamau: Let me tell you how to get to my bayt.",
  "Kamau: Walk down this tareeq from the madrasa.",
  "Kamau: You will pass the suuq, then the masjid.",
  "Kamau: Turn left at the maktaba.",
  "Kamau: Walk through the hadiqa, near the nahr.",
  "Kamau: My bayt is right there!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to Kamau's spoken directions. Where do they begin?",
    correct: "At the madrasa (school)",
    distractors: ["At the suuq (market)", "At the maktaba (library)", "At the masjid (mosque)"],
    explanation: "Kamau says, \"Walk down this tareeq from the madrasa.\"",
  },
  {
    q: "What does Kamau say to do at the maktaba?",
    correct: "Turn left",
    distractors: ["Turn right", "Stop and wait", "Go straight"],
    explanation: "Kamau says, \"Turn left at the maktaba.\"",
  },
  {
    q: "What two places does Kamau say you pass first, in order?",
    correct: "The suuq, then the masjid",
    distractors: ["The masjid, then the suuq", "The hadiqa, then the nahr", "The maktaba, then the bayt"],
    explanation: "Kamau says, \"You will pass the suuq, then the masjid.\"",
  },
  {
    q: "Where does Kamau say his bayt is?",
    correct: "Just past the hadiqa, near the nahr",
    distractors: ["Right next to the madrasa", "Inside the suuq", "Across from the masjid"],
    explanation: "Kamau says he walks \"through the hadiqa, near the nahr\" and then reaches his bayt.",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Building" | "Open-air place" }[] = [
  { label: "madrasa", bucket: "Building" },
  { label: "maktaba", bucket: "Building" },
  { label: "hadiqa", bucket: "Open-air place" },
  { label: "nahr", bucket: "Open-air place" },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "madrasa", meaning: "school" },
  { phrase: "bayt", meaning: "house / home" },
  { phrase: "suuq", meaning: "market" },
  { phrase: "masjid", meaning: "mosque" },
  { phrase: "maktaba", meaning: "library" },
  { phrase: "hadiqa", meaning: "garden / park" },
  { phrase: "tareeq", meaning: "road / street" },
  { phrase: "nahr", meaning: "river" },
];

export const surroundingSpeaking: Skill = {
  id: "g8-ar-ls-surrounding",
  code: "LS.3",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: my surrounding",
  description: "Listen to Kamau give spoken directions through his neighbourhood, then answer comprehension questions and practise saying place names aloud.",
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
        prompt: "Sort each place as a Building or an Open-air place.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Building", label: "Building" },
          { id: "Open-air place", label: "Open-air place" },
        ],
        correctBucket,
        hint: "A building has walls and a roof; an open-air place does not.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is ${s.bucket === "Building" ? "a building" : "an open-air place"}.`).join(" "),
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
        prompt: "Match each spoken place word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each place word aloud to yourself before matching it.",
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
        prompt: "Put these lines from Kamau's spoken directions in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Kamau starts at the madrasa, passes the suuq and masjid, turns at the maktaba, then walks past the hadiqa and nahr.",
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
      hint: "Follow Kamau's spoken directions step by step.",
      explanation: q.explanation,
    };
  },
};
