import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Amani : Salut, Peter ! Bonjour !",
  "Peter : Bonjour, Amani ! Ça va ?",
  "Amani : Ça gaze, merci ! Et toi ?",
  "Peter : Ça va bien aussi, merci.",
  "Amani : Quel âge as-tu ?",
  "Peter : J'ai treize ans. Et toi ?",
  "Amani : J'ai treize ans aussi.",
  "Peter : Tu habites où ?",
  "Amani : J'habite à Kisumu. Et toi ?",
  "Peter : J'habite à Nairobi.",
  "Amani : Super ! Je dois y aller maintenant. À bientôt !",
  "Peter : Au revoir, Amani ! À demain !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amani greets Peter in the morning.", isTrue: true },
  { text: "Peter says he is doing badly.", isTrue: false },
  { text: "Amani is thirteen years old.", isTrue: true },
  { text: "Peter is fourteen years old.", isTrue: false },
  { text: "Amani lives in Nairobi.", isTrue: false },
  { text: "Peter lives in Nairobi.", isTrue: true },
  { text: "Peter is the first one to say 'Au revoir'.", isTrue: true },
  { text: "Peter will see Amani again tomorrow.", isTrue: true },
  { text: "Amani asks Peter's age before asking where he lives.", isTrue: true },
  { text: "Peter says 'Ça va bien aussi', meaning he is also doing well.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Bonjour !", meaning: "Hello!/Good day!" },
  { phrase: "Ça va ?", meaning: "How are you? (informal)" },
  { phrase: "Ça gaze, merci !", meaning: "I'm doing great, thanks!" },
  { phrase: "Et toi ?", meaning: "And you? (informal)" },
  { phrase: "Quel âge as-tu ?", meaning: "How old are you? (informal)" },
  { phrase: "J'ai treize ans.", meaning: "I am thirteen years old." },
  { phrase: "Tu habites où ?", meaning: "Where do you live? (informal)" },
  { phrase: "J'habite à Kisumu.", meaning: "I live in Kisumu." },
  { phrase: "À bientôt !", meaning: "See you soon!" },
  { phrase: "À demain !", meaning: "See you tomorrow!" },
  { phrase: "Au revoir !", meaning: "Goodbye!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel âge a Peter ?",
    correct: "Treize ans",
    distractors: ["Douze ans", "Quatorze ans", "Quinze ans"],
    explanation: "Peter says: \"J'ai treize ans.\" — I am thirteen years old.",
  },
  {
    q: "Où habite Amani ?",
    correct: "À Kisumu",
    distractors: ["À Nairobi", "À Mombasa", "À Kisii"],
    explanation: "Amani says: \"J'habite à Kisumu.\" — I live in Kisumu.",
  },
  {
    q: "Qui dit d'abord 'Bonjour' ?",
    correct: "Amani",
    distractors: ["Peter", "Les deux ensemble", "Personne"],
    explanation: "The dialogue opens with Amani's line: \"Salut, Peter ! Bonjour !\"",
  },
  {
    q: "Quand Amani et Peter se reverront-ils ?",
    correct: "Demain (à demain)",
    distractors: ["Dans une semaine", "L'année prochaine", "Jamais"],
    explanation: "Peter's closing line is: \"Au revoir, Amani ! À demain !\" — they will meet again tomorrow.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Amani : Salut, Peter ! ", after: " !", answer: "Bonjour", gloss: "Amani greets Peter in the morning." },
  { before: "Peter : Bonjour, Amani ! Ça ", after: " ?", answer: "va", gloss: "Peter asks how Amani is doing." },
  { before: "Amani : Ça gaze, merci ! Et ", after: " ?", answer: "toi", gloss: "Amani asks Peter the same question back." },
  { before: "Amani : Quel âge ", after: "-tu ?", answer: "as", gloss: "Amani asks Peter's age." },
  { before: "Peter : J'ai treize ", after: ". Et toi ?", answer: "ans", gloss: "Peter states his age." },
  { before: "Peter : Tu habites ", after: " ?", answer: "où", gloss: "Peter asks where Amani lives." },
  { before: "Amani : J'habite à ", after: ". Et toi ?", answer: "Kisumu", gloss: "Amani states where she lives." },
  { before: "Peter : J'habite à ", after: ".", answer: "Nairobi", gloss: "Peter states where he lives." },
  { before: "Amani : Je dois y aller maintenant. À ", after: " !", answer: "bientôt", gloss: "Amani says she has to leave now." },
  { before: "Peter : Au revoir, Amani ! À ", after: " !", answer: "demain", gloss: "Peter says he'll see Amani tomorrow." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Amani :", "Quel âge as-tu ?"], sentence: "Amani : Quel âge as-tu ?" },
  { chunks: ["Peter :", "J'ai treize ans.", "Et toi ?"], sentence: "Peter : J'ai treize ans. Et toi ?" },
];

export const greetingsReading: Skill = {
  id: "g7-fr-r-greetings",
  code: "R.1",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: casual greetings and introductions",
  description: "Read a short French dialogue of an informal introduction between two learners and answer comprehension questions.",
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
