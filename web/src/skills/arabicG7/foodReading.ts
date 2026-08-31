import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Waiter: Welcome! What would you like?",
  "Yusuf: Khubz and lahm, please. And shay to drink.",
  "Waiter: Would you like qahwa or halib instead?",
  "Yusuf: No, shay is fine — min fadlik.",
  "Waiter: The lahm here is very ladheedh and hulw on the side!",
  "Yusuf: Great — al-hisab min fadlik when we're done.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Yusuf order to eat?",
    correct: "khubz (bread) and lahm (meat)",
    distractors: ["aruz (rice) and lahm (meat)", "khubz (bread) only", "shay (tea) and qahwa (coffee)"],
    explanation: "Yusuf says, \"Khubz and lahm, please.\"",
  },
  {
    q: "What does Yusuf choose to drink?",
    correct: "shay (tea)",
    distractors: ["qahwa (coffee)", "halib (milk)", "maa' (water)"],
    explanation: "The waiter offers qahwa or halib, but Yusuf says \"shay is fine.\"",
  },
  {
    q: "According to the waiter, how does the lahm taste?",
    correct: "ladheedh (delicious)",
    distractors: ["baarid (cold)", "haar (hot) only", "The waiter does not say"],
    explanation: "The waiter says, \"The lahm here is very ladheedh.\"",
  },
  {
    q: "What does Yusuf ask for at the end of the dialogue?",
    correct: "al-hisab min fadlik (the bill, please)",
    distractors: ["More shay, please", "A different waiter", "To change his order"],
    explanation: "Yusuf says, \"al-hisab min fadlik when we're done\" — the bill, please.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "khubz", meaning: "bread" },
  { phrase: "lahm", meaning: "meat" },
  { phrase: "shay", meaning: "tea" },
  { phrase: "qahwa", meaning: "coffee" },
  { phrase: "halib", meaning: "milk" },
  { phrase: "ladheedh", meaning: "delicious" },
  { phrase: "hulw", meaning: "sweet" },
  { phrase: "al-hisab min fadlik", meaning: "the bill, please" },
];

const PLACE_ITEMS: { word: string; bucket: "Bakery / market" | "Restaurant / café" }[] = [
  { word: "khubz (bread)", bucket: "Bakery / market" },
  { word: "aruz (rice)", bucket: "Bakery / market" },
  { word: "halib (milk)", bucket: "Bakery / market" },
  { word: "shay (tea)", bucket: "Restaurant / café" },
  { word: "qahwa (coffee)", bucket: "Restaurant / café" },
  { word: "lahm (meat, cooked)", bucket: "Restaurant / café" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "Yusuf: Khubz and ", after: ", please.", correct: "lahm" },
  { before: "The Arabic word for \"delicious\" is ", after: ".", correct: "ladheedh" },
  { before: "The Arabic word for \"the bill, please\" is ", after: ".", correct: "al-hisab min fadlik" },
  { before: "The waiter offers qahwa or ", after: " instead.", correct: "halib" },
  { before: "The Arabic word for \"sweet\" is ", after: ".", correct: "hulw" },
];

export const foodReading: Skill = {
  id: "g7-ar-r-food",
  code: "R.6",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading for information: food and drinks",
  description: "Read a short Arabic restaurant dialogue, identify where different foods are bought, and summarise the key ideas.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = PLACE_ITEMS.map((p, i) => ({ id: `w${i}`, label: p.word, bucket: p.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each food/drink by where you would most likely buy or get it.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Bakery / market", label: "Bakery / market" },
          { id: "Restaurant / café", label: "Restaurant / café" },
        ],
        correctBucket,
        hint: "Raw ingredients are bought at a market; already-prepared drinks and cooked meat are usually served at a restaurant or café.",
        explanation: PLACE_ITEMS.map((p) => `"${p.word}" is typically found at a ${p.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each word from the dialogue to its English meaning.",
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
        hint: "The waiter greets first, Yusuf orders, they discuss the drink, then the meal is praised, then the bill is requested.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the dialogue.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
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
      hint: "Look at what each person says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
