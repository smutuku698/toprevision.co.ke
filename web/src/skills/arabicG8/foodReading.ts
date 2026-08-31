import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Waiter: Good morning! What would you like to eat?",
  "Kamau: khubz, lahm, and aruz, min fadlik.",
  "Waiter: And to drink — shay, qahwa, or halib?",
  "Kamau: shay, min fadlik. And a glass of maa' too.",
  "Kamau: Al-hisab min fadlik!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What three foods does Kamau order?",
    correct: "khubz, lahm, and aruz (bread, meat, and rice)",
    distractors: ["khubz and aruz only", "lahm and shay", "aruz and qahwa"],
    explanation: "Kamau says, \"khubz, lahm, and aruz, min fadlik.\"",
  },
  {
    q: "What drink does Kamau choose?",
    correct: "shay (tea)",
    distractors: ["qahwa (coffee)", "halib (milk)", "maa' (water) only"],
    explanation: "Kamau says, \"shay, min fadlik.\"",
  },
  {
    q: "What does Kamau ask for besides shay?",
    correct: "A glass of maa' (water)",
    distractors: ["A glass of halib (milk)", "More khubz (bread)", "Nothing else"],
    explanation: "Kamau says, \"And a glass of maa' too.\"",
  },
  {
    q: "What does Kamau say at the end of the meal?",
    correct: "Al-hisab min fadlik (the bill please)",
    distractors: ["Ma'a as-salama (goodbye) only", "Shukran (thank you) only", "Sabahal khayr (good morning)"],
    explanation: "Kamau says, \"Al-hisab min fadlik!\" to ask for the bill.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kamau orders khubz, lahm, and aruz.", isTrue: true },
  { text: "Kamau orders qahwa to drink.", isTrue: false },
  { text: "Kamau asks for the al-hisab at the end.", isTrue: true },
  { text: "The waiter refuses to bring the bill.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "maa'", meaning: "water" },
  { phrase: "khubz", meaning: "bread" },
  { phrase: "lahm", meaning: "meat" },
  { phrase: "aruz", meaning: "rice" },
  { phrase: "shay", meaning: "tea" },
  { phrase: "qahwa", meaning: "coffee" },
  { phrase: "halib", meaning: "milk" },
  { phrase: "min fadlik", meaning: "please" },
  { phrase: "al-hisab min fadlik", meaning: "the bill please" },
];

export const foodReading: Skill = {
  id: "g8-ar-r-food",
  code: "R.6",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: food and drinks",
  description: "Read a short Arabic restaurant dialogue and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check exactly what Kamau orders.",
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
        prompt: "Match each word or phrase from the dialogue to its English meaning.",
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
        hint: "The waiter asks about food first, then Kamau orders food, then a drink, then asks for the bill.",
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
      hint: "Look at exactly what Kamau says he wants.",
      explanation: q.explanation,
    };
  },
};
