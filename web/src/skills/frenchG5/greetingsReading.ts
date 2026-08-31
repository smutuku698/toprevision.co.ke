import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Amani : Bonjour ! Comment tu t'appelles ?",
  "Njeri : Je m'appelle Njeri. Et toi ?",
  "Amani : Je m'appelle Amani. Comment ça va ?",
  "Njeri : Ça va bien, merci ! Et toi, comment ça va ?",
  "Amani : Ça va très bien !",
  "Njeri : Qui est-ce ?",
  "Amani : C'est Kevin. Voici mon ami Kevin.",
  "Kevin : Bonjour ! Je suis un garçon. Enchanté !",
  "Njeri : Je suis une fille. Enchantée !",
  "Amani : Nous sommes amis.",
  "Kevin : Au revoir, Njeri !",
  "Njeri : Au revoir, Amani et Kevin !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amani greets Njeri first with 'Bonjour'.", isTrue: true },
  { text: "Njeri says her name is Wanjiru.", isTrue: false },
  { text: "Amani asks 'Comment ça va ?' after saying his name.", isTrue: true },
  { text: "Njeri says 'Ça va bien, merci'.", isTrue: true },
  { text: "Njeri says she feels unwell.", isTrue: false },
  { text: "Kevin is introduced by Amani as 'mon ami'.", isTrue: true },
  { text: "Kevin says 'Je suis une fille'.", isTrue: false },
  { text: "Njeri says 'Je suis une fille'.", isTrue: true },
  { text: "Amani asks 'Qui est-ce ?' about Kevin.", isTrue: false },
  { text: "Kevin says 'Enchanté' when he meets Njeri.", isTrue: true },
  { text: "The three friends say goodbye with 'Au revoir'.", isTrue: true },
  { text: "Amani is the first person to say goodbye.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Comment tu t'appelles ?", meaning: "What is your name? (informal)" },
  { phrase: "Je m'appelle Njeri.", meaning: "My name is Njeri." },
  { phrase: "Comment ça va ?", meaning: "How are you?" },
  { phrase: "Ça va bien, merci !", meaning: "I'm doing well, thank you!" },
  { phrase: "Qui est-ce ?", meaning: "Who is this?" },
  { phrase: "Voici mon ami Kevin.", meaning: "Here is my friend Kevin." },
  { phrase: "Je suis un garçon.", meaning: "I am a boy." },
  { phrase: "Je suis une fille.", meaning: "I am a girl." },
  { phrase: "Enchanté !", meaning: "Nice to meet you! (said by a boy)" },
  { phrase: "Enchantée !", meaning: "Nice to meet you! (said by a girl)" },
  { phrase: "Nous sommes amis.", meaning: "We are friends." },
  { phrase: "Au revoir !", meaning: "Goodbye!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment s'appelle la fille dans le dialogue ?",
    correct: "Njeri",
    distractors: ["Wanjiru", "Achieng", "Mumbi"],
    explanation: "Elle dit : \"Je m'appelle Njeri.\" — My name is Njeri.",
  },
  {
    q: "Qui Amani présente-t-il à Njeri ?",
    correct: "Kevin",
    distractors: ["Brian", "Wafula", "Otieno"],
    explanation: "Amani dit : \"C'est Kevin. Voici mon ami Kevin.\"",
  },
  {
    q: "Que répond Njeri quand Amani demande 'Comment ça va ?'",
    correct: "Ça va bien, merci",
    distractors: ["Ça va mal", "Je suis fatiguée", "Comme ci comme ça"],
    explanation: "Njeri répond : \"Ça va bien, merci ! Et toi, comment ça va ?\"",
  },
  {
    q: "Qui demande 'Qui est-ce ?' dans le dialogue ?",
    correct: "Njeri",
    distractors: ["Amani", "Kevin", "Personne"],
    explanation: "C'est Njeri qui demande : \"Qui est-ce ?\" quand Kevin arrive.",
  },
  {
    q: "Comment Kevin se décrit-il ?",
    correct: "Je suis un garçon",
    distractors: ["Je suis une fille", "Je suis un ami", "Je m'appelle Njeri"],
    explanation: "Kevin dit : \"Je suis un garçon. Enchanté !\"",
  },
  {
    q: "Que dit Njeri pour se décrire ?",
    correct: "Je suis une fille",
    distractors: ["Je suis un garçon", "Je suis Kevin", "Je suis amie"],
    explanation: "Njeri dit : \"Je suis une fille. Enchantée !\"",
  },
  {
    q: "Quelle expression Kevin utilise-t-il pour dire qu'il est content de rencontrer Njeri ?",
    correct: "Enchanté",
    distractors: ["Bonsoir", "Au revoir", "Ça va"],
    explanation: "Kevin dit : \"Bonjour ! Je suis un garçon. Enchanté !\"",
  },
  {
    q: "Qui dit au revoir en dernier dans le dialogue ?",
    correct: "Njeri",
    distractors: ["Amani", "Kevin", "Tout le monde ensemble"],
    explanation: "Kevin dit au revoir à Njeri, puis Njeri répond : \"Au revoir, Amani et Kevin !\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Njeri : Je m'appelle ", after: ". Et toi ?", answer: "Njeri", gloss: "Njeri states her name." },
  { before: "Amani : Je m'appelle Amani. Comment ça ", after: " ?", answer: "va", gloss: "Amani asks how Njeri is doing." },
  { before: "Njeri : Ça va ", after: ", merci ! Et toi, comment ça va ?", answer: "bien", gloss: "Njeri says she is doing well." },
  { before: "Njeri : Qui est-", after: " ?", answer: "ce", gloss: "Njeri asks who the new person is." },
  { before: "Amani : C'est Kevin. Voici mon ", after: " Kevin.", answer: "ami", gloss: "Amani introduces Kevin as his friend." },
  { before: "Kevin : Bonjour ! Je suis un ", after: ". Enchanté !", answer: "garçon", gloss: "Kevin says he is a boy." },
  { before: "Njeri : Je suis une ", after: ". Enchantée !", answer: "fille", gloss: "Njeri says she is a girl." },
  { before: "Amani : Nous sommes ", after: ".", answer: "amis", gloss: "Amani says they are friends." },
  { before: "Kevin : Au revoir, ", after: " !", answer: "Njeri", gloss: "Kevin says goodbye to Njeri." },
  { before: "Njeri : Au revoir, Amani et ", after: " !", answer: "Kevin", gloss: "Njeri says goodbye to both friends." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment", "tu", "t'appelles", "?"], sentence: "Comment tu t'appelles ?" },
  { chunks: ["Comment", "ça", "va", "?"], sentence: "Comment ça va ?" },
  { chunks: ["Voici", "mon", "ami", "Kevin", "."], sentence: "Voici mon ami Kevin." },
  { chunks: ["Je", "suis", "une", "fille", "."], sentence: "Je suis une fille." },
];

export const greetingsReading: Skill = {
  id: "g5-fr-r-greetings",
  code: "R.1",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: greetings and introductions",
  description: "Read a short French dialogue of three learners greeting each other, introducing themselves and each other, then answer comprehension questions.",
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
      hint: "Look at what each speaker actually says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
