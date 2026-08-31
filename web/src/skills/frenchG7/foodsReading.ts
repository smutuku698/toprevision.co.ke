import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Amani : Je vais faire les courses aujourd'hui.",
  "Njeri : Qu'est-ce que tu vas acheter ?",
  "Amani : Je voudrais un kilo de viande à la boucherie.",
  "Njeri : Et le pain ?",
  "Amani : Je voudrais deux pains à la boulangerie.",
  "Njeri : N'oublie pas le lait !",
  "Amani : Ah oui, un litre de lait à la crèmerie.",
  "Njeri : Bonne idée. Le boucher est très gentil.",
  "Amani : Oui, et le pain de la boulangerie est délicieux !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amani is going shopping today.", isTrue: true },
  { text: "Amani wants two kilos of meat.", isTrue: false },
  { text: "Amani buys meat at the butcher shop.", isTrue: true },
  { text: "Amani wants two loaves of bread.", isTrue: true },
  { text: "Amani buys bread at the dairy shop.", isTrue: false },
  { text: "Njeri reminds Amani about milk.", isTrue: true },
  { text: "Amani wants a liter of milk.", isTrue: true },
  { text: "Njeri says the butcher is very kind.", isTrue: true },
  { text: "Amani says the bread from the bakery is delicious.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Je vais faire les courses.", meaning: "I am going shopping." },
  { phrase: "Je voudrais un kilo de viande.", meaning: "I would like a kilo of meat." },
  { phrase: "Je voudrais deux pains.", meaning: "I would like two loaves of bread." },
  { phrase: "N'oublie pas le lait !", meaning: "Don't forget the milk!" },
  { phrase: "Un litre de lait", meaning: "A liter of milk" },
  { phrase: "Le boucher est très gentil.", meaning: "The butcher is very kind." },
  { phrase: "Le pain est délicieux.", meaning: "The bread is delicious." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qu'est-ce qu'Amani achète à la boucherie ?",
    correct: "Un kilo de viande",
    distractors: ["Deux pains", "Un litre de lait", "Un paquet de riz"],
    explanation: "Amani says: \"Je voudrais un kilo de viande à la boucherie.\"",
  },
  {
    q: "Combien de pains Amani achète-t-elle ?",
    correct: "Deux",
    distractors: ["Un", "Trois", "Quatre"],
    explanation: "Amani says: \"Je voudrais deux pains à la boulangerie.\"",
  },
  {
    q: "Où Amani achète-t-elle le lait ?",
    correct: "À la crèmerie",
    distractors: ["À la boucherie", "À la boulangerie", "Au restaurant"],
    explanation: "Amani says: \"Un litre de lait à la crèmerie.\"",
  },
  {
    q: "Comment est le boucher, selon Njeri ?",
    correct: "Très gentil",
    distractors: ["Très occupé", "Très cher", "Très loin"],
    explanation: "Njeri says: \"Le boucher est très gentil.\" — The butcher is very kind.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Amani : Je voudrais un kilo de viande à la ", after: ".", answer: "boucherie", gloss: "I would like a kilo of meat at the butcher shop." },
  { before: "Amani : Je voudrais deux pains à la ", after: ".", answer: "boulangerie", gloss: "I would like two loaves of bread at the bakery." },
  { before: "Njeri : N'oublie pas le ", after: " !", answer: "lait", gloss: "Don't forget the milk!" },
  { before: "Amani : Ah oui, un litre de lait à la ", after: ".", answer: "crèmerie", gloss: "Ah yes, a liter of milk at the dairy shop." },
  { before: "Njeri : Le boucher est très ", after: ".", answer: "gentil", gloss: "The butcher is very kind." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "voudrais", "un", "kilo", "de", "viande", "à", "la", "boucherie", "."], sentence: "Je voudrais un kilo de viande à la boucherie." },
  { chunks: ["Je", "voudrais", "deux", "pains", "à", "la", "boulangerie", "."], sentence: "Je voudrais deux pains à la boulangerie." },
];

export const foodsReading: Skill = {
  id: "g7-fr-r-foods",
  code: "R.6",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: shopping for food",
  description: "Read a short French dialogue about Amani's shopping trip for meat, bread, and milk, and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
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
        hint: "Reread the dialogue carefully and check the exact items and shops mentioned.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put the pieces in order to rebuild this line from the dialogue.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the dialogue above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from this line of the dialogue.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
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
      hint: "Look at what each speaker actually says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
