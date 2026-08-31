import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Achieng : Kiptoo, quel est ton mois préféré ?",
  "Kiptoo : Mon mois préféré est décembre, à cause de Noël !",
  "Achieng : Moi, j'aime avril, à cause de Pâques.",
  "Kiptoo : Et le nouvel an, c'est en janvier, n'est-ce pas ?",
  "Achieng : Oui, le premier janvier. C'est le premier mois de l'année.",
  "Kiptoo : Il y a douze mois dans une année.",
  "Achieng : Oui : janvier, février, mars, avril, mai, juin, juillet, août, septembre, octobre, novembre et décembre.",
  "Kiptoo : Ma famille fête toujours Noël ensemble.",
  "Achieng : Et ma famille fête Pâques à l'église.",
  "Kiptoo : Ces fêtes sont très importantes pour nous.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kiptoo's favourite month is December.", isTrue: true },
  { text: "Kiptoo's favourite month is April.", isTrue: false },
  { text: "Kiptoo likes December because of Christmas.", isTrue: true },
  { text: "Achieng's favourite month is April.", isTrue: true },
  { text: "Achieng likes April because of Easter.", isTrue: true },
  { text: "The New Year is in January.", isTrue: true },
  { text: "The New Year is in March.", isTrue: false },
  { text: "There are twelve months in a year.", isTrue: true },
  { text: "There are ten months in a year.", isTrue: false },
  { text: "Kiptoo's family always celebrates Christmas together.", isTrue: true },
  { text: "Achieng's family celebrates Easter at church.", isTrue: true },
  { text: "Both friends agree these celebrations are important to them.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Quel est ton mois préféré ?", meaning: "What is your favourite month?" },
  { phrase: "à cause de Noël", meaning: "because of Christmas" },
  { phrase: "à cause de Pâques", meaning: "because of Easter" },
  { phrase: "le nouvel an", meaning: "the New Year" },
  { phrase: "le premier janvier", meaning: "the first of January" },
  { phrase: "le premier mois de l'année", meaning: "the first month of the year" },
  { phrase: "douze mois", meaning: "twelve months" },
  { phrase: "une année", meaning: "a year" },
  { phrase: "Ma famille fête Noël.", meaning: "My family celebrates Christmas." },
  { phrase: "à l'église", meaning: "at church" },
  { phrase: "Ces fêtes sont très importantes.", meaning: "These celebrations are very important." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel est le mois préféré de Kiptoo ?",
    correct: "Décembre",
    distractors: ["Avril", "Janvier", "Mars"],
    explanation: "Kiptoo says: \"Mon mois préféré est décembre, à cause de Noël !\"",
  },
  {
    q: "Pourquoi Achieng aime-t-elle avril ?",
    correct: "À cause de Pâques",
    distractors: ["À cause de Noël", "À cause du nouvel an", "À cause de son anniversaire"],
    explanation: "Achieng says: \"Moi, j'aime avril, à cause de Pâques.\"",
  },
  {
    q: "Quand est le nouvel an ?",
    correct: "Le premier janvier",
    distractors: ["Le vingt-cinq décembre", "Le premier avril", "Le dix mai"],
    explanation: "Achieng says: \"Oui, le premier janvier. C'est le premier mois de l'année.\"",
  },
  {
    q: "Combien de mois y a-t-il dans une année ?",
    correct: "Douze",
    distractors: ["Dix", "Onze", "Treize"],
    explanation: "Kiptoo says: \"Il y a douze mois dans une année.\"",
  },
  {
    q: "Où la famille d'Achieng fête-t-elle Pâques ?",
    correct: "À l'église",
    distractors: ["À la maison", "À l'école", "Au marché"],
    explanation: "Achieng says: \"Et ma famille fête Pâques à l'église.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Achieng : Kiptoo, quel est ton mois ", after: " ?", answer: "préféré", gloss: "Achieng asks Kiptoo's favourite month." },
  { before: "Kiptoo : Mon mois préféré est ", after: ", à cause de Noël !", answer: "décembre", gloss: "Kiptoo's favourite month is December, because of Christmas." },
  { before: "Achieng : Moi, j'aime avril, à cause de ", after: ".", answer: "Pâques", gloss: "Achieng likes April, because of Easter." },
  { before: "Kiptoo : Et le nouvel ", after: ", c'est en janvier, n'est-ce pas ?", answer: "an", gloss: "The New Year is in January." },
  { before: "Achieng : Oui, le premier ", after: ". C'est le premier mois de l'année.", answer: "janvier", gloss: "It's the first of January, the first month of the year." },
  { before: "Kiptoo : Il y a ", after: " mois dans une année.", answer: "douze", gloss: "There are twelve months in a year." },
  { before: "Achieng : Oui : janvier, février, mars, ", after: ", mai, juin, juillet, août, septembre, octobre, novembre et décembre.", answer: "avril", gloss: "April is one of the twelve months, listed in order." },
  { before: "Kiptoo : Ma famille fête toujours ", after: " ensemble.", answer: "Noël", gloss: "Kiptoo's family always celebrates Christmas together." },
  { before: "Achieng : Et ma famille fête Pâques à l'", after: ".", answer: "église", gloss: "Achieng's family celebrates Easter at church." },
  { before: "Kiptoo : Ces fêtes sont très ", after: " pour nous.", answer: "importantes", gloss: "These celebrations are very important to them." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Quel", "est", "ton", "mois", "préféré", "?"], sentence: "Quel est ton mois préféré ?" },
  { chunks: ["Il", "y", "a", "douze", "mois", "dans", "une", "année", "."], sentence: "Il y a douze mois dans une année." },
  { chunks: ["Ces", "fêtes", "sont", "très", "importantes", "."], sentence: "Ces fêtes sont très importantes." },
];

export const timeReading: Skill = {
  id: "g6-fr-r-time",
  code: "R.4",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: months and seasonal events",
  description: "Read a short French dialogue about favourite months and seasonal events — le nouvel an, Pâques, Noël — and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the exact months and dates mentioned.",
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
