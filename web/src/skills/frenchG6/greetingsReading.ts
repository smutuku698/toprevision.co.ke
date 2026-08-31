import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Wafula : Bonjour ! Tu t'appelles comment ?",
  "Faith : Je m'appelle Faith. Et toi, tu t'appelles comment ?",
  "Wafula : Je m'appelle Wafula. Enchanté !",
  "Faith : Enchantée aussi ! Tu as quel âge ?",
  "Wafula : J'ai douze ans. Et toi, tu as quel âge ?",
  "Faith : J'ai onze ans.",
  "Wafula : Tu habites où, Faith ?",
  "Faith : J'habite à Eldoret. Et toi ?",
  "Wafula : J'habite à Kitale.",
  "Faith : Bonsoir, Wafula ! Je dois partir maintenant.",
  "Wafula : Bonsoir, Faith ! À la prochaine !",
  "Faith : Au revoir !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Wafula greets Faith by saying 'Bonjour'.", isTrue: true },
  { text: "Faith says her name is Njeri.", isTrue: false },
  { text: "Wafula is eleven years old.", isTrue: false },
  { text: "Faith is eleven years old.", isTrue: true },
  { text: "Wafula is twelve years old.", isTrue: true },
  { text: "Faith lives in Kitale.", isTrue: false },
  { text: "Wafula lives in Kitale.", isTrue: true },
  { text: "Wafula asks Faith's name before asking her age.", isTrue: true },
  { text: "Faith says 'Enchantée aussi' after Wafula introduces himself.", isTrue: true },
  { text: "The two friends say 'Bonsoir' to say goodbye.", isTrue: true },
  { text: "Wafula is older than Faith.", isTrue: true },
  { text: "Faith is the first to say 'Bonjour'.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Tu t'appelles comment ?", meaning: "What is your name? (informal)" },
  { phrase: "Je m'appelle Faith.", meaning: "My name is Faith." },
  { phrase: "Enchanté !", meaning: "Nice to meet you! (said by a boy/man)" },
  { phrase: "Enchantée aussi !", meaning: "Nice to meet you too! (said by a girl/woman)" },
  { phrase: "Tu as quel âge ?", meaning: "How old are you? (informal)" },
  { phrase: "J'ai douze ans.", meaning: "I am twelve years old." },
  { phrase: "J'ai onze ans.", meaning: "I am eleven years old." },
  { phrase: "Tu habites où ?", meaning: "Where do you live? (informal)" },
  { phrase: "J'habite à Eldoret.", meaning: "I live in Eldoret." },
  { phrase: "Bonsoir !", meaning: "Good evening!" },
  { phrase: "À la prochaine !", meaning: "See you next time!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment s'appelle le garçon dans le dialogue ?",
    correct: "Wafula",
    distractors: ["Kevin", "Brian", "Kamau"],
    explanation: "He says: \"Je m'appelle Wafula.\" — My name is Wafula.",
  },
  {
    q: "Quel âge a Faith ?",
    correct: "Onze ans",
    distractors: ["Douze ans", "Dix ans", "Treize ans"],
    explanation: "Faith says: \"J'ai onze ans.\" — I am eleven years old.",
  },
  {
    q: "Où habite Wafula ?",
    correct: "À Kitale",
    distractors: ["À Eldoret", "À Nairobi", "À Kisumu"],
    explanation: "Wafula says: \"J'habite à Kitale.\" — I live in Kitale.",
  },
  {
    q: "Qui demande le nom de l'autre en premier ?",
    correct: "Wafula",
    distractors: ["Faith", "Les deux ensemble", "Personne"],
    explanation: "The dialogue opens with Wafula's line: \"Bonjour ! Tu t'appelles comment ?\"",
  },
  {
    q: "Que dit Faith pour dire au revoir le soir ?",
    correct: "Bonsoir",
    distractors: ["Bonjour", "Salut", "À demain"],
    explanation: "Faith's closing line begins: \"Bonsoir, Wafula ! Je dois partir maintenant.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wafula : ", after: " ! Tu t'appelles comment ?", answer: "Bonjour", gloss: "Wafula greets Faith." },
  { before: "Faith : Je m'appelle ", after: ". Et toi, tu t'appelles comment ?", answer: "Faith", gloss: "Faith states her name." },
  { before: "Wafula : Je m'appelle Wafula. ", after: " !", answer: "Enchanté", gloss: "Wafula says nice to meet you (male form)." },
  { before: "Faith : Enchantée aussi ! Tu as quel ", after: " ?", answer: "âge", gloss: "Faith asks Wafula's age." },
  { before: "Wafula : J'ai douze ", after: ". Et toi, tu as quel âge ?", answer: "ans", gloss: "Wafula states he is twelve years old." },
  { before: "Faith : J'ai onze ", after: ".", answer: "ans", gloss: "Faith states she is eleven years old." },
  { before: "Wafula : Tu habites ", after: ", Faith ?", answer: "où", gloss: "Wafula asks where Faith lives." },
  { before: "Faith : J'habite à ", after: ". Et toi ?", answer: "Eldoret", gloss: "Faith states she lives in Eldoret." },
  { before: "Wafula : J'habite à ", after: ".", answer: "Kitale", gloss: "Wafula states he lives in Kitale." },
  { before: "Faith : ", after: ", Wafula ! Je dois partir maintenant.", answer: "Bonsoir", gloss: "Faith says good evening as she must leave." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Tu", "t'appelles", "comment", "?"], sentence: "Tu t'appelles comment ?" },
  { chunks: ["Tu", "as", "quel", "âge", "?"], sentence: "Tu as quel âge ?" },
  { chunks: ["J'ai", "douze", "ans", "."], sentence: "J'ai douze ans." },
];

export const greetingsReading: Skill = {
  id: "g6-fr-r-greetings",
  code: "R.1",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: greetings and introductions",
  description: "Read a short French dialogue of two learners greeting each other and exchanging names and ages, then answer comprehension questions.",
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
