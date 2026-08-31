import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Amani : Excusez-moi, où est la boucherie ?",
  "Vendeur : Elle est à côté de l'épicerie, là-bas.",
  "Amani : Merci ! Je voudrais un kilo de viande, s'il vous plaît.",
  "Vendeur : Voilà. Ça fait deux cents shillings.",
  "Amani : Et le riz, ça coûte combien ?",
  "Vendeur : Un kilo de riz coûte cent shillings.",
  "Amani : Je voudrais un kilo de riz aussi, s'il vous plaît.",
  "Vendeur : Voilà, merci beaucoup !",
  "Amani : Merci à vous ! Au revoir !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amani asks where the butcher shop is.", isTrue: true },
  { text: "The butcher shop is next to the grocery shop.", isTrue: true },
  { text: "Amani wants two kilos of meat.", isTrue: false },
  { text: "The meat costs two hundred shillings.", isTrue: true },
  { text: "Rice costs one hundred shillings a kilo.", isTrue: true },
  { text: "Amani does not buy any rice.", isTrue: false },
  { text: "Amani says thank you at the end.", isTrue: true },
  { text: "The seller never answers Amani's question about price.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Excusez-moi, où est la boucherie ?", meaning: "Excuse me, where is the butcher shop?" },
  { phrase: "Elle est à côté de l'épicerie.", meaning: "It is next to the grocery shop." },
  { phrase: "Je voudrais un kilo de viande, s'il vous plaît.", meaning: "I would like a kilo of meat, please." },
  { phrase: "Ça fait deux cents shillings.", meaning: "That's two hundred shillings." },
  { phrase: "Ça coûte combien ?", meaning: "How much does it cost?" },
  { phrase: "Un kilo de riz coûte cent shillings.", meaning: "A kilo of rice costs one hundred shillings." },
  { phrase: "Merci beaucoup !", meaning: "Thank you very much!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Où se trouve la boucherie ?",
    correct: "À côté de l'épicerie",
    distractors: ["Derrière le marché", "En face de la boutique", "Près de l'église"],
    explanation: "The seller says: \"Elle est à côté de l'épicerie, là-bas.\" — It is next to the grocery shop.",
  },
  {
    q: "Combien coûte un kilo de viande ?",
    correct: "Deux cents shillings",
    distractors: ["Cent shillings", "Cinquante shillings", "Trois cents shillings"],
    explanation: "The seller says: \"Ça fait deux cents shillings.\" — That's two hundred shillings.",
  },
  {
    q: "Combien coûte un kilo de riz ?",
    correct: "Cent shillings",
    distractors: ["Deux cents shillings", "Cinquante shillings", "Cent cinquante shillings"],
    explanation: "The seller says: \"Un kilo de riz coûte cent shillings.\"",
  },
  {
    q: "Qu'est-ce qu'Amani achète en tout ?",
    correct: "De la viande et du riz",
    distractors: ["Seulement de la viande", "Seulement du riz", "Des légumes et du pain"],
    explanation: "Amani requests a kilo of meat first, then also asks for a kilo of rice — she buys both.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Amani : Excusez-moi, où est la ", after: " ?", answer: "boucherie", gloss: "Excuse me, where is the butcher shop?" },
  { before: "Vendeur : Elle est à côté de l'", after: ", là-bas.", answer: "épicerie", gloss: "It is next to the grocery shop, over there." },
  { before: "Amani : Merci ! Je voudrais un kilo de ", after: ", s'il vous plaît.", answer: "viande", gloss: "Thanks! I would like a kilo of meat, please." },
  { before: "Vendeur : Voilà. Ça fait deux cents ", after: ".", answer: "shillings", gloss: "Here you go. That's two hundred shillings." },
  { before: "Amani : Et le riz, ça coûte ", after: " ?", answer: "combien", gloss: "And the rice, how much does it cost?" },
  { before: "Amani : Je voudrais un kilo de riz ", after: ", s'il vous plaît.", answer: "aussi", gloss: "I would also like a kilo of rice, please." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Excusez-moi,", "où", "est", "la", "boucherie", "?"], sentence: "Excusez-moi, où est la boucherie ?" },
  { chunks: ["Je", "voudrais", "un", "kilo", "de", "viande,", "s'il", "vous", "plaît", "."], sentence: "Je voudrais un kilo de viande, s'il vous plaît." },
];

export const surroundingsReading: Skill = {
  id: "g7-fr-r-surroundings",
  code: "R.3",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: the market",
  description: "Read a short French dialogue about shopping at the market for meat and rice, and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the exact prices and items mentioned.",
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
