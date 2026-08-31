import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Kamau : Mumbi, voici une photo de ma famille.",
  "Mumbi : Montre-moi ! Qui est-ce ?",
  "Kamau : C'est ma mère. Elle s'appelle Grace. Elle est infirmière.",
  "Mumbi : Et ton père ?",
  "Kamau : Mes parents sont séparés. J'habite avec ma mère et ma grand-mère.",
  "Mumbi : Ah, d'accord. Tu as des frères et sœurs ?",
  "Kamau : Oui, j'ai deux sœurs. Elles s'appellent Joy et Ann.",
  "Mumbi : Quel âge ont-elles ?",
  "Kamau : Joy a neuf ans et Ann a six ans.",
  "Mumbi : Et ta grand-mère, comment s'appelle-t-elle ?",
  "Kamau : Elle s'appelle Esther. Elle habite avec nous à Eldoret.",
  "Mumbi : Ta famille est belle, Kamau !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kamau shows Mumbi a photo of his family.", isTrue: true },
  { text: "Kamau's mother is called Grace.", isTrue: true },
  { text: "Kamau's mother is a teacher.", isTrue: false },
  { text: "Kamau's parents live together.", isTrue: false },
  { text: "Kamau lives with his mother and his grandmother.", isTrue: true },
  { text: "Kamau has two sisters.", isTrue: true },
  { text: "Kamau has one brother.", isTrue: false },
  { text: "Joy is nine years old.", isTrue: true },
  { text: "Ann is nine years old.", isTrue: false },
  { text: "Kamau's grandmother is called Esther.", isTrue: true },
  { text: "The family lives in Eldoret.", isTrue: true },
  { text: "Mumbi says the family is beautiful.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Voici une photo de ma famille.", meaning: "Here is a photo of my family." },
  { phrase: "Elle est infirmière.", meaning: "She is a nurse." },
  { phrase: "Mes parents sont séparés.", meaning: "My parents are separated." },
  { phrase: "J'habite avec ma mère et ma grand-mère.", meaning: "I live with my mother and my grandmother." },
  { phrase: "Tu as des frères et sœurs ?", meaning: "Do you have brothers and sisters? (informal)" },
  { phrase: "J'ai deux sœurs.", meaning: "I have two sisters." },
  { phrase: "Quel âge ont-elles ?", meaning: "How old are they?" },
  { phrase: "Joy a neuf ans.", meaning: "Joy is nine years old." },
  { phrase: "Ann a six ans.", meaning: "Ann is six years old." },
  { phrase: "Elle habite avec nous.", meaning: "She lives with us." },
  { phrase: "Ta famille est belle !", meaning: "Your family is beautiful!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel est le métier de la mère de Kamau ?",
    correct: "Infirmière",
    distractors: ["Médecin", "Professeure", "Agricultrice"],
    explanation: "Kamau says: \"Elle s'appelle Grace. Elle est infirmière.\" — She is a nurse.",
  },
  {
    q: "Avec qui Kamau habite-t-il ?",
    correct: "Sa mère et sa grand-mère",
    distractors: ["Son père et sa mère", "Ses deux sœurs seulement", "Sa grand-mère seulement"],
    explanation: "Kamau says: \"J'habite avec ma mère et ma grand-mère.\"",
  },
  {
    q: "Quel âge a Joy ?",
    correct: "Neuf ans",
    distractors: ["Six ans", "Sept ans", "Dix ans"],
    explanation: "Kamau says: \"Joy a neuf ans et Ann a six ans.\"",
  },
  {
    q: "Comment s'appelle la grand-mère de Kamau ?",
    correct: "Esther",
    distractors: ["Grace", "Joy", "Ann"],
    explanation: "Kamau says: \"Elle s'appelle Esther. Elle habite avec nous à Eldoret.\"",
  },
  {
    q: "Où habite la famille de Kamau ?",
    correct: "À Eldoret",
    distractors: ["À Kitale", "À Nairobi", "À Nakuru"],
    explanation: "Kamau says: \"Elle habite avec nous à Eldoret.\" — She (grandmother) lives with us in Eldoret.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kamau : Mumbi, voici une photo de ma ", after: ".", answer: "famille", gloss: "Kamau shows Mumbi a photo of his family." },
  { before: "Kamau : C'est ma mère. Elle s'appelle ", after: ". Elle est infirmière.", answer: "Grace", gloss: "Kamau's mother is called Grace." },
  { before: "Kamau : C'est ma mère. Elle s'appelle Grace. Elle est ", after: ".", answer: "infirmière", gloss: "Kamau's mother is a nurse." },
  { before: "Kamau : Mes parents sont ", after: ". J'habite avec ma mère et ma grand-mère.", answer: "séparés", gloss: "Kamau's parents are separated." },
  { before: "Kamau : Oui, j'ai deux ", after: ". Elles s'appellent Joy et Ann.", answer: "sœurs", gloss: "Kamau has two sisters." },
  { before: "Kamau : Oui, j'ai deux sœurs. Elles s'appellent Joy et ", after: ".", answer: "Ann", gloss: "His sisters are called Joy and Ann." },
  { before: "Kamau : Joy a ", after: " ans et Ann a six ans.", answer: "neuf", gloss: "Joy is nine years old." },
  { before: "Kamau : Joy a neuf ans et Ann a ", after: " ans.", answer: "six", gloss: "Ann is six years old." },
  { before: "Kamau : Elle s'appelle ", after: ". Elle habite avec nous à Eldoret.", answer: "Esther", gloss: "The grandmother is called Esther." },
  { before: "Kamau : Elle s'appelle Esther. Elle habite avec nous à ", after: ".", answer: "Eldoret", gloss: "The family lives in Eldoret." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Elle", "s'appelle", "Grace", "."], sentence: "Elle s'appelle Grace." },
  { chunks: ["J'ai", "deux", "sœurs", "."], sentence: "J'ai deux sœurs." },
  { chunks: ["Elle", "habite", "avec", "nous", "à", "Eldoret", "."], sentence: "Elle habite avec nous à Eldoret." },
];

export const familyReading: Skill = {
  id: "g6-fr-r-family",
  code: "R.2",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: my family",
  description: "Read a short French dialogue about Kamau describing his nuclear family — a mother, grandmother and two sisters — and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what it says about each family member.",
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
      hint: "Look at what the dialogue actually says about each family member.",
      explanation: q.explanation,
    };
  },
};
