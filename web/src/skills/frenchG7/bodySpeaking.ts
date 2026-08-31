import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "big" | "small";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "grand", meaning: "tall", tag: "big" },
  { word: "gros", meaning: "big/heavy-set", tag: "big" },
  { word: "fort", meaning: "strong/sturdy", tag: "big" },
  { word: "petit", meaning: "short", tag: "small" },
  { word: "mince", meaning: "slim/thin", tag: "small" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Il est ", after: ".", answer: "grand", gloss: "Il est grand. — He is tall." },
  { before: "Elle est ", after: ".", answer: "petite", gloss: "Elle est petite. — She is short." },
  { before: "Mon frère est ", after: " et fort.", answer: "grand", gloss: "Mon frère est grand et fort. — My brother is tall and strong." },
  { before: "Ma sœur est ", after: " et mince.", answer: "petite", gloss: "Ma sœur est petite et mince. — My sister is short and slim." },
  { before: "Il n'est pas gros, il est ", after: ".", answer: "mince", gloss: "Il n'est pas gros, il est mince. — He is not big, he is slim." },
  { before: "Elle n'est pas petite, elle est ", after: ".", answer: "grande", gloss: "Elle n'est pas petite, elle est grande. — She is not short, she is tall." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "est", "grand", "et", "fort", "."], sentence: "Il est grand et fort." },
  { chunks: ["Elle", "est", "petite", "et", "mince", "."], sentence: "Elle est petite et mince." },
  { chunks: ["Mon", "frère", "est", "grand", "."], sentence: "Mon frère est grand." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} is much taller than most of the class.`,
    correct: "Il/Elle est grand(e).",
    distractors: ["Il/Elle est petit(e).", "Il/Elle est mince.", "Il/Elle est gros(se)."],
    explanation: "'Grand(e)' describes someone tall — 'petit(e)' means short, the opposite.",
  },
  {
    situation: (n) => `${n} is noticeably shorter than most of the class.`,
    correct: "Il/Elle est petit(e).",
    distractors: ["Il/Elle est grand(e).", "Il/Elle est fort(e).", "Il/Elle est mince."],
    explanation: "'Petit(e)' describes someone short — 'grand(e)' means tall, the opposite.",
  },
  {
    situation: (n) => `${n} is very slim and thin.`,
    correct: "Il/Elle est mince.",
    distractors: ["Il/Elle est gros(se).", "Il/Elle est grand(e).", "Il/Elle est petit(e)."],
    explanation: "'Mince' describes someone slim/thin — 'gros(se)' is the near-opposite, describing a heavier build.",
  },
  {
    situation: (n) => `${n} has a bigger, heavier build.`,
    correct: "Il/Elle est gros(se).",
    distractors: ["Il/Elle est mince.", "Il/Elle est petit(e).", "Il/Elle est grand(e)."],
    explanation: "'Gros(se)' describes a bigger, heavier build — 'mince' is the near-opposite, describing a slim build.",
  },
  {
    situation: (n) => `${n} is known for being physically strong and sturdy.`,
    correct: "Il/Elle est fort(e).",
    distractors: ["Il/Elle est mince.", "Il/Elle est petit(e).", "Il/Elle est faible."],
    explanation: "'Fort(e)' describes someone strong/sturdy — the other options describe a slim, short build, or aren't a real vocabulary word here.",
  },
];

export const bodySpeaking: Skill = {
  id: "g7-fr-ls-body",
  code: "LS.7",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "Physical appearance",
  description: "Vocabulary for describing physical appearance — tall, short, big, thin, and strong.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French physical-appearance word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think of each word's opposite to help remember its meaning.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, WORDS);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as describing a Bigger Build or a Smaller Build.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "big", label: "Bigger Build" },
          { id: "small", label: "Smaller Build" },
        ],
        correctBucket,
        hint: "'Grand', 'gros', and 'fort' describe a bigger presence; 'petit' and 'mince' describe a smaller one.",
        explanation: items.map((p) => `"${p.word}" describes a ${p.tag === "big" ? "bigger" : "smaller"} build.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about physical appearance.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which appearance adjective fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence describing appearance.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject comes first, then 'est', then the descriptive adjective(s).",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} How do you describe ${name}?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which physical trait actually matches the description.",
      explanation: s.explanation,
    };
  },
};
