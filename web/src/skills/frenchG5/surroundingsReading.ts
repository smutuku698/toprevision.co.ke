import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Kiptoo : Faith, qu'est-ce que c'est ?",
  "Faith : C'est un livre.",
  "Kiptoo : Et ça, qu'est-ce que c'est ? C'est un cahier ?",
  "Faith : Oui, c'est un cahier.",
  "Kiptoo : Où est mon stylo ?",
  "Faith : Ton stylo est sur la table.",
  "Kiptoo : Et ma règle ?",
  "Faith : Ta règle est dans le sac.",
  "Kiptoo : Qu'est-ce que c'est ? C'est un crayon ?",
  "Faith : Non, ce n'est pas un crayon. C'est une gomme.",
  "Kiptoo : Merci ! Les affaires scolaires sont importantes.",
  "Faith : Oui, il faut bien les ranger.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kiptoo asks Faith 'Qu'est-ce que c'est ?' about an object.", isTrue: true },
  { text: "Faith says the first object is a book (un livre).", isTrue: true },
  { text: "Faith says the first object is a pen.", isTrue: false },
  { text: "Kiptoo asks if the second object is a notebook (cahier).", isTrue: true },
  { text: "Faith confirms the second object is a notebook.", isTrue: true },
  { text: "Kiptoo's pen is on the table.", isTrue: true },
  { text: "Kiptoo's pen is in the bag.", isTrue: false },
  { text: "Kiptoo's ruler is in the bag.", isTrue: true },
  { text: "Kiptoo's ruler is on the table.", isTrue: false },
  { text: "The third object is a pencil.", isTrue: false },
  { text: "Faith says the third object is an eraser (une gomme).", isTrue: true },
  { text: "Faith says school items should be kept tidy.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Qu'est-ce que c'est ?", meaning: "What is it?" },
  { phrase: "C'est un livre.", meaning: "It is a book." },
  { phrase: "C'est un cahier ?", meaning: "Is it a notebook?" },
  { phrase: "Où est mon stylo ?", meaning: "Where is my pen?" },
  { phrase: "Ton stylo est sur la table.", meaning: "Your pen is on the table." },
  { phrase: "Ta règle est dans le sac.", meaning: "Your ruler is in the bag." },
  { phrase: "C'est un crayon ?", meaning: "Is it a pencil?" },
  { phrase: "Ce n'est pas un crayon.", meaning: "It is not a pencil." },
  { phrase: "C'est une gomme.", meaning: "It is an eraser." },
  { phrase: "Les affaires scolaires sont importantes.", meaning: "School items are important." },
  { phrase: "Il faut bien les ranger.", meaning: "They must be put away properly." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qu'est-ce que Faith dit sur le premier objet ?",
    correct: "C'est un livre",
    distractors: ["C'est un cahier", "C'est un stylo", "C'est une règle"],
    explanation: "Faith dit : \"C'est un livre.\"",
  },
  {
    q: "Où est le stylo de Kiptoo ?",
    correct: "Sur la table",
    distractors: ["Dans le sac", "Sous la chaise", "Derrière le tableau"],
    explanation: "Faith dit : \"Ton stylo est sur la table.\"",
  },
  {
    q: "Où est la règle de Kiptoo ?",
    correct: "Dans le sac",
    distractors: ["Sur la table", "Sur la chaise", "Dans le cahier"],
    explanation: "Faith dit : \"Ta règle est dans le sac.\"",
  },
  {
    q: "Qu'est-ce que le troisième objet est vraiment ?",
    correct: "Une gomme",
    distractors: ["Un crayon", "Un cahier", "Un livre"],
    explanation: "Faith dit : \"Non, ce n'est pas un crayon. C'est une gomme.\"",
  },
  {
    q: "Qui demande 'Qu'est-ce que c'est ?' en premier ?",
    correct: "Kiptoo",
    distractors: ["Faith", "Les deux ensemble", "Personne"],
    explanation: "Le dialogue commence par la question de Kiptoo : \"Faith, qu'est-ce que c'est ?\"",
  },
  {
    q: "Que répond Faith quand Kiptoo demande si c'est un cahier ?",
    correct: "Oui, c'est un cahier",
    distractors: ["Non, c'est un livre", "Non, c'est une règle", "Oui, c'est un stylo"],
    explanation: "Faith répond : \"Oui, c'est un cahier.\"",
  },
  {
    q: "Que dit Kiptoo à la fin sur les affaires scolaires ?",
    correct: "Elles sont importantes",
    distractors: ["Elles sont inutiles", "Elles sont lourdes", "Elles sont perdues"],
    explanation: "Kiptoo dit : \"Les affaires scolaires sont importantes.\"",
  },
  {
    q: "Que doit-on faire avec les affaires scolaires, selon Faith ?",
    correct: "Bien les ranger",
    distractors: ["Les jeter", "Les partager toujours", "Les cacher"],
    explanation: "Faith dit : \"Oui, il faut bien les ranger.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kiptoo : Faith, qu'est-ce que ", after: " ?", answer: "c'est", gloss: "Kiptoo asks what the object is." },
  { before: "Faith : C'est un ", after: ".", answer: "livre", gloss: "Faith says it is a book." },
  { before: "Kiptoo : Et ça, qu'est-ce que c'est ? C'est un ", after: " ?", answer: "cahier", gloss: "Kiptoo asks if it is a notebook." },
  { before: "Kiptoo : Où est mon ", after: " ?", answer: "stylo", gloss: "Kiptoo asks where his pen is." },
  { before: "Faith : Ton stylo est sur la ", after: ".", answer: "table", gloss: "The pen is on the table." },
  { before: "Kiptoo : Et ma ", after: " ?", answer: "règle", gloss: "Kiptoo asks about his ruler." },
  { before: "Faith : Ta règle est dans le ", after: ".", answer: "sac", gloss: "The ruler is in the bag." },
  { before: "Faith : Non, ce n'est pas un crayon. C'est une ", after: ".", answer: "gomme", gloss: "It is actually an eraser." },
  { before: "Kiptoo : Merci ! Les affaires scolaires sont ", after: ".", answer: "importantes", gloss: "Kiptoo says school items are important." },
  { before: "Faith : Oui, il faut bien les ", after: ".", answer: "ranger", gloss: "Faith says they must be put away properly." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Qu'est-ce", "que", "c'est", "?"], sentence: "Qu'est-ce que c'est ?" },
  { chunks: ["C'est", "un", "cahier", "."], sentence: "C'est un cahier." },
  { chunks: ["Ton", "stylo", "est", "sur", "la", "table", "."], sentence: "Ton stylo est sur la table." },
  { chunks: ["Ta", "règle", "est", "dans", "le", "sac", "."], sentence: "Ta règle est dans le sac." },
];

export const surroundingsReading: Skill = {
  id: "g5-fr-r-surroundings",
  code: "R.3",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: my surroundings",
  description: "Read a short French dialogue about Kiptoo and Faith naming and locating classroom items, then answer comprehension questions.",
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
        prompt: readingTrueFalsePrompt(rng),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check exactly where each item is.",
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
        prompt: matchPrompt(rng, "phrase from the dialogue to its English meaning"),
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
        prompt: orderPrompt(rng, "the words to rebuild this line from the dialogue"),
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
        prompt: fillPrompt(rng),
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
      hint: "Look at what each speaker actually says about each classroom item.",
      explanation: q.explanation,
    };
  },
};
