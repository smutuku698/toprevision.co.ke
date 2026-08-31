import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Kevin : Quelle est la date aujourd'hui ?",
  "Njeri : C'est lundi, le quatre janvier.",
  "Kevin : Ah oui, le nouvel an était il y a quatre jours !",
  "Njeri : Oui ! Et mon anniversaire est le dix mai.",
  "Kevin : Le mien est le vingt-cinq décembre, le jour de Noël !",
  "Njeri : C'est un jour spécial pour toi alors.",
  "Kevin : Oui, il y a toujours une grande fête ce jour-là.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Today is Monday.", isTrue: true },
  { text: "Today is the fourth of January.", isTrue: true },
  { text: "New Year happened four days ago.", isTrue: true },
  { text: "Njeri's birthday is in May.", isTrue: true },
  { text: "Kevin's birthday is in January.", isTrue: false },
  { text: "Kevin's birthday is on Christmas Day.", isTrue: true },
  { text: "There is always a big celebration on Kevin's birthday.", isTrue: true },
  { text: "Njeri's birthday is on the twenty-fifth.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Quelle est la date aujourd'hui ?", meaning: "What is the date today?" },
  { phrase: "C'est lundi, le quatre janvier.", meaning: "It's Monday, the fourth of January." },
  { phrase: "Le nouvel an était il y a quatre jours.", meaning: "New Year was four days ago." },
  { phrase: "Mon anniversaire est le dix mai.", meaning: "My birthday is the tenth of May." },
  { phrase: "Le jour de Noël", meaning: "Christmas Day" },
  { phrase: "Une grande fête", meaning: "A big celebration" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel jour sommes-nous ?",
    correct: "Lundi",
    distractors: ["Mardi", "Dimanche", "Vendredi"],
    explanation: "Njeri says: \"C'est lundi, le quatre janvier.\" — It's Monday.",
  },
  {
    q: "Quand est l'anniversaire de Njeri ?",
    correct: "Le dix mai",
    distractors: ["Le quatre janvier", "Le vingt-cinq décembre", "Le premier janvier"],
    explanation: "Njeri says: \"Mon anniversaire est le dix mai.\"",
  },
  {
    q: "Quand est l'anniversaire de Kevin ?",
    correct: "Le vingt-cinq décembre",
    distractors: ["Le dix mai", "Le quatre janvier", "Le premier janvier"],
    explanation: "Kevin says: \"Le mien est le vingt-cinq décembre, le jour de Noël !\"",
  },
  {
    q: "Pourquoi le jour de Kevin est-il spécial ?",
    correct: "Il y a toujours une grande fête",
    distractors: ["Il n'y a pas d'école", "C'est le premier jour de l'année", "Il pleut toujours ce jour-là"],
    explanation: "Kevin says: \"Il y a toujours une grande fête ce jour-là.\" — There is always a big celebration that day.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kevin : Quelle est la ", after: " aujourd'hui ?", answer: "date", gloss: "What is the date today?" },
  { before: "Njeri : C'est lundi, le quatre ", after: ".", answer: "janvier", gloss: "It's Monday, the fourth of January." },
  { before: "Kevin : Ah oui, le nouvel an était il y a quatre ", after: " !", answer: "jours", gloss: "Ah yes, New Year was four days ago!" },
  { before: "Njeri : Oui ! Et mon anniversaire est le dix ", after: ".", answer: "mai", gloss: "Yes! And my birthday is the tenth of May." },
  { before: "Kevin : Le mien est le vingt-cinq décembre, le jour de ", after: " !", answer: "Noël", gloss: "Mine is the twenty-fifth of December, Christmas Day!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Quelle", "est", "la", "date", "aujourd'hui", "?"], sentence: "Quelle est la date aujourd'hui ?" },
  { chunks: ["C'est", "lundi,", "le", "quatre", "janvier", "."], sentence: "C'est lundi, le quatre janvier." },
];

export const timeReading: Skill = {
  id: "g7-fr-r-time",
  code: "R.4",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: important dates",
  description: "Read a short French dialogue about today's date, New Year, and birthdays, and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the exact dates mentioned.",
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
