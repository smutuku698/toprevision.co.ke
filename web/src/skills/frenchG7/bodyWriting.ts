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
  { before: "Ma sœur est petite et ", after: ".", answer: "mince", gloss: "Ma sœur est petite et mince. — My sister is short and slim." },
  { before: "Il n'est pas gros, il est ", after: ".", answer: "mince", gloss: "Il n'est pas gros, il est mince. — He is not big, he is slim." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "est", "grand", "et", "fort", "."], sentence: "Il est grand et fort." },
  { chunks: ["Elle", "est", "petite", "et", "mince", "."], sentence: "Elle est petite et mince." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a caption under a class photo describing a tall, strong classmate.",
    correct: "Il est grand et fort.",
    distractors: ["Il est petit et mince.", "Elle est grande et forte.", "Il est gros et petit."],
    explanation: "'Il est grand et fort' correctly uses the masculine pronoun with 'tall' and 'strong' for a boy classmate.",
  },
  {
    note: "You are writing a caption under a class photo describing a short, slim classmate.",
    correct: "Elle est petite et mince.",
    distractors: ["Elle est grande et forte.", "Il est petit et mince.", "Elle est petite et grosse."],
    explanation: "'Elle est petite et mince' correctly uses the feminine pronoun with 'short' and 'slim' for a girl classmate.",
  },
  {
    note: "You are writing a self-description paragraph, and you are short but not slim.",
    correct: "Je suis petit(e), mais pas mince.",
    distractors: ["Je suis grand(e), mais mince.", "Je suis mince, mais pas petit(e).", "Je suis fort(e), mais grand(e)."],
    explanation: "'Je suis petit(e), mais pas mince' correctly matches the description: short, but not slim.",
  },
  {
    note: "You are writing that everyone in class looks different, and that this is a good thing.",
    correct: "Chacun est différent, et c'est bien ainsi.",
    distractors: ["Tout le monde doit être pareil.", "Chacun est grand et fort.", "Personne n'est différent."],
    explanation: "'Chacun est différent, et c'est bien ainsi' correctly expresses that everyone is different, and that's good.",
  },
];

export const bodyWriting: Skill = {
  id: "g7-fr-w-body",
  code: "W.7",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Physical appearance",
  description: "Guided writing describing physical appearance — tall, short, big, thin, and strong.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French physical-appearance word to its English meaning.",
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
        prompt: "Sort each written word as describing a Bigger Build or a Smaller Build.",
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
        prompt: "Fill in the missing word to complete the written sentence about physical appearance.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which appearance adjective fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence describing appearance.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject comes first, then 'est', then the descriptive adjective(s).",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check that the pronoun and the physical trait both match the situation.",
      explanation: s.explanation,
    };
  },
};
