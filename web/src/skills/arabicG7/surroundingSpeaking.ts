import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.3 Phonological Awareness — pronouncing market vocabulary with correct stress and
// intonation, via a buying-and-selling role play.

const LINES = [
  "Shopkeeper: Ahlan! Maadha tureed?",
  "Layla: Ureedu khubz min fadlik.",
  "Shopkeeper: Tafaddal. Shay' aakhar?",
  "Layla: Na'am, ureedu aydan halib.",
  "Shopkeeper: Tafaddal, hadha kulluh bi khamsa junayh.",
  "Layla: Shukran! Ma'a as-salama.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Layla first ask for in the suuq?",
    correct: "khubz (bread)",
    distractors: ["halib (milk)", "lahm (meat)", "aruz (rice)"],
    explanation: "Layla says, \"Ureedu khubz min fadlik\" — I want bread, please.",
  },
  {
    q: "What does Layla ask for next, besides bread?",
    correct: "halib (milk)",
    distractors: ["shay (tea)", "qahwa (coffee)", "khubz (bread) again"],
    explanation: "Layla says, \"Na'am, ureedu aydan halib\" — yes, I also want milk.",
  },
  {
    q: "How much does the shopkeeper say the total is?",
    correct: "khamsa junayh (five pounds/shillings)",
    distractors: ["The price is not mentioned", "Ten pounds/shillings", "It is free"],
    explanation: "The shopkeeper says, \"hadha kulluh bi khamsa junayh\" — this is all for five.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ureedu", meaning: "I want" },
  { phrase: "min fadlik", meaning: "please" },
  { phrase: "tafaddal", meaning: "here you go" },
  { phrase: "shay' aakhar?", meaning: "anything else?" },
  { phrase: "shukran", meaning: "thank you" },
  { phrase: "suuq", meaning: "market" },
  { phrase: "masjid", meaning: "mosque" },
  { phrase: "maktaba", meaning: "library" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Layla: Ureedu khubz ", after: ".", correct: "min fadlik" },
  { before: "Shopkeeper: Ahlan! Maadha ", after: "?", correct: "tureed" },
  { before: "Shopkeeper: ", after: ". Shay' aakhar?", correct: "Tafaddal" },
  { before: "The Arabic word for \"market\" is ", after: ".", correct: "suuq" },
  { before: "Layla: Shukran! Ma'a ", after: ".", correct: "as-salama" },
];

const CATEGORY_ITEMS: { label: string; bucket: "Shopkeeper says" | "Customer says" }[] = [
  { label: "Maadha tureed?", bucket: "Shopkeeper says" },
  { label: "Tafaddal", bucket: "Shopkeeper says" },
  { label: "Shay' aakhar?", bucket: "Shopkeeper says" },
  { label: "Ureedu khubz min fadlik", bucket: "Customer says" },
  { label: "Na'am, ureedu aydan halib", bucket: "Customer says" },
  { label: "Shukran! Ma'a as-salama", bucket: "Customer says" },
];

export const surroundingSpeaking: Skill = {
  id: "g7-ar-ls-surrounding",
  code: "LS.3",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Phonological awareness: my surrounding (the market)",
  description: "Listen to a spoken market role play between a shopkeeper and a customer, and practise pronouncing shopping expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each line as something the Shopkeeper says or the Customer says.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Shopkeeper says", label: "Shopkeeper says" },
          { id: "Customer says", label: "Customer says" },
        ],
        correctBucket,
        hint: "The shopkeeper offers and asks; the customer requests and thanks.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" — the ${s.bucket === "Shopkeeper says" ? "shopkeeper" : "customer"} says this.`).join(" "),
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
        prompt: "Match each spoken market expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each phrase aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        speakable: true,
        prompt: "Put these lines from the spoken role play in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The shopkeeper greets first, then Layla orders bread, then more items, then pays and leaves.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        speakable: true,
        prompt: "Fill in the missing word.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Reread the matching line in the role play above.",
        explanation: `The missing word is "${f.correct}".`,
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
      hint: "Imagine hearing each line spoken aloud, one at a time.",
      explanation: q.explanation,
    };
  },
};
