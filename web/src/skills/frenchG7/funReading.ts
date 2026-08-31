import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Brian : Qu'est-ce que tu aimes faire pendant les vacances ?",
  "Faith : J'aime la lecture et la peinture. Et toi ?",
  "Brian : Moi, j'aime le sport et les jeux vidéo.",
  "Faith : Et à la récréation, qu'est-ce que tu fais ?",
  "Brian : Je joue au football avec mes amis.",
  "Faith : Moi, j'écoute de la musique après les cours.",
  "Brian : Le week-end, je regarde le cinéma avec ma famille.",
  "Faith : Ça a l'air amusant !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Faith likes reading and painting.", isTrue: true },
  { text: "Brian likes sport and video games.", isTrue: true },
  { text: "Brian plays football at break time.", isTrue: true },
  { text: "Faith plays football at break time.", isTrue: false },
  { text: "Faith listens to music after class.", isTrue: true },
  { text: "Brian watches movies on the weekend.", isTrue: true },
  { text: "Brian watches movies alone.", isTrue: false },
  { text: "Faith thinks it sounds fun.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Qu'est-ce que tu aimes faire ?", meaning: "What do you like to do?" },
  { phrase: "J'aime la lecture et la peinture.", meaning: "I like reading and painting." },
  { phrase: "Je joue au football avec mes amis.", meaning: "I play football with my friends." },
  { phrase: "J'écoute de la musique après les cours.", meaning: "I listen to music after class." },
  { phrase: "Je regarde le cinéma avec ma famille.", meaning: "I watch movies with my family." },
  { phrase: "Ça a l'air amusant !", meaning: "That sounds fun!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qu'est-ce que Faith aime faire pendant les vacances ?",
    correct: "La lecture et la peinture",
    distractors: ["Le sport et les jeux vidéo", "La musique et le cinéma", "La danse et le football"],
    explanation: "Faith says: \"J'aime la lecture et la peinture.\" — I like reading and painting.",
  },
  {
    q: "Que fait Brian à la récréation ?",
    correct: "Il joue au football",
    distractors: ["Il écoute de la musique", "Il regarde le cinéma", "Il fait de la peinture"],
    explanation: "Brian says: \"Je joue au football avec mes amis.\" — I play football with my friends.",
  },
  {
    q: "Quand est-ce que Faith écoute de la musique ?",
    correct: "Après les cours",
    distractors: ["Le week-end", "Pendant les vacances", "À la récréation"],
    explanation: "Faith says: \"J'écoute de la musique après les cours.\" — I listen to music after class.",
  },
  {
    q: "Avec qui Brian regarde-t-il le cinéma ?",
    correct: "Avec sa famille",
    distractors: ["Avec ses amis", "Seul", "Avec Faith"],
    explanation: "Brian says: \"Je regarde le cinéma avec ma famille.\" — I watch movies with my family.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Faith : J'aime la lecture et la ", after: ".", answer: "peinture", gloss: "I like reading and painting." },
  { before: "Brian : Moi, j'aime le sport et les jeux ", after: ".", answer: "vidéo", gloss: "Me, I like sport and video games." },
  { before: "Brian : Je joue au football avec mes ", after: ".", answer: "amis", gloss: "I play football with my friends." },
  { before: "Faith : Moi, j'écoute de la musique après les ", after: ".", answer: "cours", gloss: "Me, I listen to music after class." },
  { before: "Brian : Le week-end, je regarde le cinéma avec ma ", after: ".", answer: "famille", gloss: "On the weekend, I watch movies with my family." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'aime", "la", "lecture", "et", "la", "peinture", "."], sentence: "J'aime la lecture et la peinture." },
  { chunks: ["Je", "joue", "au", "football", "avec", "mes", "amis", "."], sentence: "Je joue au football avec mes amis." },
];

export const funReading: Skill = {
  id: "g7-fr-r-fun",
  code: "R.5",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: leisure time",
  description: "Read a short French dialogue about Brian and Faith's leisure activities and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what each speaker says.",
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
