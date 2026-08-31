import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.6 Phonological Awareness — pronouncing food vocabulary accurately, via a
// conversation about prices from a price list and a shop-assistant/customer role play.

const LINES = [
  "Assistant: Ahlan! Kam thaman al-khubz?",
  "Yusuf: Al-khubz bi thalaathat junayh.",
  "Assistant: Wa al-halib?",
  "Yusuf: Al-halib bi arba'at junayh.",
  "Assistant: Hadha ghaali shway'an — hal huwa ladheedh?",
  "Yusuf: Na'am, ladheedh jiddan!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does the assistant ask about first?",
    correct: "Kam thaman al-khubz? (How much is the bread?)",
    distractors: ["Kam thaman al-halib? (How much is the milk?)", "Hal huwa ladheedh? (Is it delicious?)", "Nothing about price"],
    explanation: "The assistant asks, \"Kam thaman al-khubz?\" — how much is the bread?",
  },
  {
    q: "According to Yusuf, how much is the khubz (bread)?",
    correct: "thalaathat junayh (three pounds/shillings)",
    distractors: ["arba'at junayh (four pounds/shillings)", "It is free", "The price is not given"],
    explanation: "Yusuf says, \"Al-khubz bi thalaathat junayh\" — the bread is three.",
  },
  {
    q: "What does the assistant think about the price?",
    correct: "Ghaali shway'an (a bit expensive)",
    distractors: ["Very cheap", "Exactly fair", "The assistant says nothing about the price"],
    explanation: "The assistant says, \"Hadha ghaali shway'an\" — this is a bit expensive.",
  },
  {
    q: "How does Yusuf describe the taste?",
    correct: "ladheedh jiddan (very delicious)",
    distractors: ["hulw jiddan (very sweet) only", "baarid (cold)", "He does not describe the taste"],
    explanation: "Yusuf replies, \"Na'am, ladheedh jiddan!\" — yes, very delicious!",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "kam thaman...?", meaning: "how much is...?" },
  { phrase: "khubz", meaning: "bread" },
  { phrase: "halib", meaning: "milk" },
  { phrase: "ghaali", meaning: "expensive" },
  { phrase: "ladheedh", meaning: "delicious" },
  { phrase: "hulw", meaning: "sweet" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Yusuf: Na'am, ", after: " jiddan!", correct: "ladheedh" },
  { before: "Assistant: Ahlan! Kam ", after: " al-khubz?", correct: "thaman" },
  { before: "Yusuf: Al-khubz bi thalaathat ", after: ".", correct: "junayh" },
  { before: "Assistant: Hadha ", after: " shway'an.", correct: "ghaali" },
  { before: "The Arabic word for \"sweet\" is ", after: ".", correct: "hulw" },
];

const CATEGORY_ITEMS: { label: string; bucket: "Price talk" | "Taste talk" }[] = [
  { label: "kam thaman al-khubz?", bucket: "Price talk" },
  { label: "bi thalaathat junayh", bucket: "Price talk" },
  { label: "ghaali shway'an", bucket: "Price talk" },
  { label: "hal huwa ladheedh?", bucket: "Taste talk" },
  { label: "ladheedh jiddan", bucket: "Taste talk" },
  { label: "hulw", bucket: "Taste talk" },
];

export const foodSpeaking: Skill = {
  id: "g7-ar-ls-food",
  code: "LS.6",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Phonological awareness: food and drinks (shopping)",
  description: "Listen to a spoken shop conversation about prices and taste, and practise pronouncing food and price vocabulary.",
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
        prompt: "Sort each expression as Price talk or Taste talk.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Price talk", label: "Price talk" },
          { id: "Taste talk", label: "Taste talk" },
        ],
        correctBucket,
        hint: "Price talk is about cost; taste talk is about how the food tastes.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is ${s.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each spoken word or phrase to its English meaning.",
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
        prompt: "Put these lines from the spoken conversation in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The assistant asks about bread's price first, then milk's price, then comments on cost, then taste.",
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
        hint: "Reread the matching line in the conversation above.",
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
