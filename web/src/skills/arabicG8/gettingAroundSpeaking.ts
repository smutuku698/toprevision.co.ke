import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Amina: How shall we get to the coast this weekend?",
  "Juma: Let's take the qitaar, it's comfortable.",
  "Amina: Good idea! How do we get to the station?",
  "Juma: We can go mashyan, it's not far.",
  "Amina: And after we return, want to try the safeena next time?",
  "Juma: Yes! Or even the tayyaara one day.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to Amina and Juma plan aloud. What transport does Juma suggest for the coast trip?",
    correct: "The qitaar (train)",
    distractors: ["The sayyara (car)", "The tayyaara (airplane)", "The safeena (boat)"],
    explanation: "Juma says, \"Let's take the qitaar, it's comfortable.\"",
  },
  {
    q: "How does Juma say they should get to the station?",
    correct: "mashyan (on foot)",
    distractors: ["By darraja (bicycle)", "By haafila (bus)", "By sayyara (car)"],
    explanation: "Juma says, \"We can go mashyan, it's not far.\"",
  },
  {
    q: "What does Amina suggest trying next time, after they return?",
    correct: "The safeena (ship / boat)",
    distractors: ["The darraja (bicycle)", "The haafila (bus)", "Walking mashyan"],
    explanation: "Amina says, \"want to try the safeena next time?\"",
  },
  {
    q: "What does Juma say he'd like to try one day, besides the safeena?",
    correct: "The tayyaara (airplane)",
    distractors: ["The qitaar (train) again", "The sayyara (car)", "Nothing else"],
    explanation: "Juma says, \"Or even the tayyaara one day.\"",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Travels on land" | "Travels on water or air" }[] = [
  { label: "sayyara", bucket: "Travels on land" },
  { label: "haafila", bucket: "Travels on land" },
  { label: "tayyaara", bucket: "Travels on water or air" },
  { label: "safeena", bucket: "Travels on water or air" },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "sayyara", meaning: "car" },
  { phrase: "haafila", meaning: "bus" },
  { phrase: "qitaar", meaning: "train" },
  { phrase: "tayyaara", meaning: "airplane" },
  { phrase: "darraja", meaning: "bicycle" },
  { phrase: "safeena", meaning: "ship / boat" },
  { phrase: "mashyan", meaning: "on foot" },
];

export const gettingAroundSpeaking: Skill = {
  id: "g8-ar-ls-getting-around",
  code: "LS.9",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: getting around",
  description: "Listen to Amina and Juma plan a trip out loud, answer comprehension questions, and practise saying transport words yourself.",
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
        prompt: "Sort each transport word as Travels on land or Travels on water or air.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Travels on land", label: "Travels on land" },
          { id: "Travels on water or air", label: "Travels on water or air" },
        ],
        correctBucket,
        hint: "Think about the surface or space each vehicle actually moves through.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" ${s.bucket === "Travels on land" ? "travels on land" : "travels on water or in the air"}.`).join(" "),
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
        prompt: "Match each spoken transport word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each transport word aloud to yourself before matching it.",
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
        prompt: "Put these lines from Amina and Juma's spoken conversation in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Amina asks a question, Juma answers, then Amina asks again, and so on.",
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
      hint: "Listen for exactly what transport Amina and Juma each suggest.",
      explanation: q.explanation,
    };
  },
};
