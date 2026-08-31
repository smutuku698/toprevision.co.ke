import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

type Gender = "masculine" | "feminine";

const WORDS: { word: string; meaning: string; gender: Gender }[] = [
  { word: "le stylo", meaning: "pen", gender: "masculine" },
  { word: "le crayon", meaning: "pencil", gender: "masculine" },
  { word: "le cahier", meaning: "notebook", gender: "masculine" },
  { word: "le livre", meaning: "book", gender: "masculine" },
  { word: "le sac", meaning: "bag", gender: "masculine" },
  { word: "le tableau", meaning: "chalkboard", gender: "masculine" },
  { word: "la règle", meaning: "ruler", gender: "feminine" },
  { word: "la gomme", meaning: "eraser", gender: "feminine" },
  { word: "la table", meaning: "table", gender: "feminine" },
  { word: "la chaise", meaning: "chair", gender: "feminine" },
  { word: "la fenêtre", meaning: "window", gender: "feminine" },
  { word: "la porte", meaning: "door", gender: "feminine" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Qu'est-ce que ", after: " ?", answer: "c'est", gloss: "Qu'est-ce que c'est ? — What is this?" },
  { before: "C'est un ", after: ".", answer: "stylo", gloss: "C'est un stylo. — It's a pen." },
  { before: "C'est une ", after: ".", answer: "règle", gloss: "C'est une règle. — It's a ruler." },
  { before: "C'est un ", after: ".", answer: "cahier", gloss: "C'est un cahier. — It's a notebook." },
  { before: "C'est une ", after: ".", answer: "gomme", gloss: "C'est une gomme. — It's an eraser." },
  { before: "C'est un ", after: ".", answer: "crayon", gloss: "C'est un crayon. — It's a pencil." },
  { before: "C'est une ", after: ".", answer: "chaise", gloss: "C'est une chaise. — It's a chair." },
  { before: "C'est un ", after: ".", answer: "livre", gloss: "C'est un livre. — It's a book." },
  { before: "C'est une ", after: ".", answer: "fenêtre", gloss: "C'est une fenêtre. — It's a window." },
  { before: "C'est un ", after: ".", answer: "sac", gloss: "C'est un sac. — It's a bag." },
  { before: "C'est une ", after: ".", answer: "porte", gloss: "C'est une porte. — It's a door." },
  { before: "C'est un ", after: ".", answer: "tableau", gloss: "C'est un tableau. — It's a chalkboard." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Qu'est-ce", "que", "c'est", "?"], sentence: "Qu'est-ce que c'est ?" },
  { chunks: ["C'est", "un", "stylo", "."], sentence: "C'est un stylo." },
  { chunks: ["C'est", "une", "règle", "."], sentence: "C'est une règle." },
  { chunks: ["Oui", ",", "c'est", "un", "cahier", "."], sentence: "Oui, c'est un cahier." },
  { chunks: ["Non", ",", "c'est", "un", "crayon", "."], sentence: "Non, c'est un crayon." },
  { chunks: ["C'est", "une", "fenêtre", "."], sentence: "C'est une fenêtre." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are labelling a picture of a pen for a classroom vocabulary poster.",
    correct: "C'est un stylo.",
    distractors: ["C'est une stylo.", "C'est un crayon.", "C'est une règle."],
    explanation: "'stylo' is masculine, so it takes 'un' — 'une stylo' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are labelling a picture of a ruler for the same poster.",
    correct: "C'est une règle.",
    distractors: ["C'est un règle.", "C'est une gomme.", "C'est un stylo."],
    explanation: "'règle' is feminine, so it takes 'une' — 'un règle' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are answering a classmate's written question 'Qu'est-ce que c'est ?' about a notebook, and you want to say yes.",
    correct: "Oui, c'est un cahier.",
    distractors: ["Oui, c'est une cahier.", "Non, c'est un cahier.", "C'est une règle."],
    explanation: "'cahier' is masculine ('un cahier'), and confirming means starting with 'Oui' — the wrong article or 'Non' both break the answer.",
  },
  {
    note: "You are writing the question that asks what an object in the picture is.",
    correct: "Qu'est-ce que c'est ?",
    distractors: ["C'est un stylo.", "Oui, c'est une gomme.", "Non, c'est une chaise."],
    explanation: "'Qu'est-ce que c'est ?' is the question itself — the other options are all answers, not the question.",
  },
  {
    note: "You are labelling a picture of an eraser on the same classroom poster.",
    correct: "C'est une gomme.",
    distractors: ["C'est un gomme.", "C'est une règle.", "C'est un cahier."],
    explanation: "'gomme' is feminine, so it takes 'une' — 'un gomme' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are labelling a picture of a pencil.",
    correct: "C'est un crayon.",
    distractors: ["C'est une crayon.", "C'est un stylo.", "C'est une table."],
    explanation: "'crayon' is masculine, so it takes 'un' — 'une crayon' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are labelling a picture of a chair for the classroom poster.",
    correct: "C'est une chaise.",
    distractors: ["C'est un chaise.", "C'est une table.", "C'est un livre."],
    explanation: "'chaise' is feminine, so it takes 'une' — 'un chaise' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are labelling a picture of a book.",
    correct: "C'est un livre.",
    distractors: ["C'est une livre.", "C'est un cahier.", "C'est une fenêtre."],
    explanation: "'livre' is masculine, so it takes 'un' — 'une livre' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are labelling a picture of a window in the classroom.",
    correct: "C'est une fenêtre.",
    distractors: ["C'est un fenêtre.", "C'est une porte.", "C'est un tableau."],
    explanation: "'fenêtre' is feminine, so it takes 'une' — 'un fenêtre' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are answering a classmate's question about a ruler, and this time you want to correct them — it's actually a pencil.",
    correct: "Non, c'est un crayon.",
    distractors: ["Oui, c'est un crayon.", "Non, c'est une règle.", "C'est une gomme."],
    explanation: "Correcting someone means starting with 'Non', then naming the right item — 'Oui' would wrongly confirm their guess, and 'une règle' just repeats it.",
  },
  {
    note: "You are labelling a picture of a bag hanging on the classroom wall.",
    correct: "C'est un sac.",
    distractors: ["C'est une sac.", "C'est un cahier.", "C'est une porte."],
    explanation: "'sac' is masculine, so it takes 'un' — 'une sac' has the wrong article, and the others name a different item.",
  },
  {
    note: "You are labelling a picture of the classroom door.",
    correct: "C'est une porte.",
    distractors: ["C'est un porte.", "C'est une fenêtre.", "C'est un tableau."],
    explanation: "'porte' is feminine, so it takes 'une' — 'un porte' has the wrong article, and the others name a different item.",
  },
];

export const surroundingsWriting: Skill = {
  id: "g5-fr-w-surroundings",
  code: "W.3",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "My surroundings: classroom items",
  description: "Guided writing about classroom items (les affaires scolaires), with correct gendered articles, accents, and the 'Qu'est-ce que c'est ? C'est un/une…' pattern.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "written French classroom item to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Notice the accent marks — writing them correctly matters as much as the word itself.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const masc = shuffle(rng, WORDS.filter((p) => p.gender === "masculine")).slice(0, 3);
      const fem = shuffle(rng, WORDS.filter((p) => p.gender === "feminine")).slice(0, 3);
      const items = shuffle(rng, [...masc, ...fem]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.gender;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each classroom word is Masculine (le/un) or Feminine (la/une)"),
        items: items.map((p) => ({ id: p.word, label: p.word.replace(/^(le|la) /, "") })),
        buckets: [
          { id: "masculine", label: "Masculine (le/un)" },
          { id: "feminine", label: "Feminine (la/une)" },
        ],
        correctBucket,
        hint: "Check the article written in front of the word — 'le'/'un' is masculine, 'la'/'une' is feminine.",
        explanation: [...masc, ...fem].map((p) => `"${p.word}" is ${p.gender}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Check whether the item needs 'un' or 'une', and write any accents carefully.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words/phrases to write a correct sentence about a classroom item"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Qu'est-ce que c'est ?' asks what something is; 'C'est un/une…' answers it.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check both the article (un/une) and the item name match what's being labelled.",
      explanation: s.explanation,
    };
  },
};
