import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Waiter: Good evening! What would you like?",
  "Njeri: khubz and lahm, min fadlik.",
  "Waiter: Would you like aruz too?",
  "Njeri: Yes, aruz is ladheedh here!",
  "Waiter: And to drink — shay, qahwa, or halib?",
  "Njeri: qahwa, min fadlik. Hulw, please.",
  "Njeri: Al-hisab min fadlik!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to Njeri order aloud. What two foods does she ask for first?",
    correct: "khubz and lahm (bread and meat)",
    distractors: ["aruz and shay", "lahm and qahwa", "khubz and halib"],
    explanation: "Njeri says, \"khubz and lahm, min fadlik.\"",
  },
  {
    q: "What does Njeri say about the aruz?",
    correct: "It is ladheedh (delicious) here",
    distractors: ["It is haar (hot)", "It is baarid (cold)", "She does not want any"],
    explanation: "Njeri says, \"aruz is ladheedh here!\"",
  },
  {
    q: "What drink does Njeri choose, and how does she want it?",
    correct: "qahwa (coffee), hulw (sweet)",
    distractors: ["shay (tea), baarid (cold)", "halib (milk), haar (hot)", "maa' (water), hulw (sweet)"],
    explanation: "Njeri says, \"qahwa, min fadlik. Hulw, please.\"",
  },
  {
    q: "What does Njeri say at the end of the meal?",
    correct: "Al-hisab min fadlik (the bill please)",
    distractors: ["Shukran (thank you) only", "Ma'a as-salama (goodbye) only", "Sabahal khayr (good morning)"],
    explanation: "Njeri says, \"Al-hisab min fadlik!\" to ask for the bill.",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Food" | "Drink" }[] = [
  { label: "khubz", bucket: "Food" },
  { label: "lahm", bucket: "Food" },
  { label: "shay", bucket: "Drink" },
  { label: "halib", bucket: "Drink" },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "maa'", meaning: "water" },
  { phrase: "khubz", meaning: "bread" },
  { phrase: "lahm", meaning: "meat" },
  { phrase: "aruz", meaning: "rice" },
  { phrase: "shay", meaning: "tea" },
  { phrase: "qahwa", meaning: "coffee" },
  { phrase: "halib", meaning: "milk" },
  { phrase: "al-hisab min fadlik", meaning: "the bill please" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "When ordering politely, you name the food then add ", after: ".", answer: "min fadlik" },
  { before: "To ask aloud for the bill at the end of a meal, you say ", after: ".", answer: "al-hisab min fadlik" },
  { before: "The word you'd say aloud to compliment tasty food is ", after: ".", answer: "ladheedh" },
  { before: "The word you'd use to describe a sweet drink is ", after: ".", answer: "hulw" },
];

export const foodSpeaking: Skill = {
  id: "g8-ar-ls-food",
  code: "LS.6",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: food and drinks",
  description: "Listen to a spoken restaurant order, answer comprehension questions, and practise the words you would say aloud to order food.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "fill"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each word as Food or Drink.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Food", label: "Food" },
          { id: "Drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Food is eaten; a drink is sipped.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is a ${s.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each spoken food or drink word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        speakable: true,
        prompt: "Fill in what you would say aloud to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the polite ordering phrases you've learned.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
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
      hint: "Listen for exactly what Njeri says she wants.",
      explanation: q.explanation,
    };
  },
};
