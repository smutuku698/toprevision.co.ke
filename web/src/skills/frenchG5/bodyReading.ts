import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

// Grade 5's "My Body" theme is body-part naming PLUS function ("Ma bouche est pour manger, mes
// oreilles sont pour écouter" — Parties du corps + est/sont + verbe infinitif), NOT the grooming/
// hygiene vocabulary used for Grade 6/7's same-titled theme.

const LINES = [
  "Otieno : Kamau, à quoi sert la bouche ?",
  "Kamau : La bouche est pour manger.",
  "Otieno : Et les oreilles, à quoi servent-elles ?",
  "Kamau : Les oreilles sont pour écouter.",
  "Otieno : Et les yeux ?",
  "Kamau : Les yeux sont pour voir.",
  "Otieno : Et le nez ?",
  "Kamau : Le nez est pour sentir.",
  "Otieno : Et les mains et les pieds ?",
  "Kamau : Les mains sont pour toucher, et les pieds sont pour marcher.",
  "Otieno : Et la tête ?",
  "Kamau : La tête est pour penser. Merci pour ce jeu, Otieno !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno asks Kamau what the mouth is for.", isTrue: true },
  { text: "Kamau says the mouth is for listening.", isTrue: false },
  { text: "Kamau says the ears are for listening.", isTrue: true },
  { text: "Kamau says the eyes are for smelling.", isTrue: false },
  { text: "Kamau says the eyes are for seeing.", isTrue: true },
  { text: "Kamau says the nose is for smelling.", isTrue: true },
  { text: "Kamau says the hands are for touching.", isTrue: true },
  { text: "Kamau says the feet are for thinking.", isTrue: false },
  { text: "Kamau says the feet are for walking.", isTrue: true },
  { text: "Kamau says the head is for thinking.", isTrue: true },
  { text: "Otieno is the one answering all the questions.", isTrue: false },
  { text: "Otieno thanks Kamau for the game.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "À quoi sert la bouche ?", meaning: "What is the mouth for?" },
  { phrase: "La bouche est pour manger.", meaning: "The mouth is for eating." },
  { phrase: "Les oreilles sont pour écouter.", meaning: "The ears are for listening." },
  { phrase: "Les yeux sont pour voir.", meaning: "The eyes are for seeing." },
  { phrase: "Le nez est pour sentir.", meaning: "The nose is for smelling." },
  { phrase: "Les mains sont pour toucher.", meaning: "The hands are for touching." },
  { phrase: "Les pieds sont pour marcher.", meaning: "The feet are for walking." },
  { phrase: "La tête est pour penser.", meaning: "The head is for thinking." },
  { phrase: "Merci pour ce jeu.", meaning: "Thanks for this game." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "À quoi sert la bouche, selon Kamau ?",
    correct: "À manger",
    distractors: ["À écouter", "À voir", "À marcher"],
    explanation: "Kamau dit : \"La bouche est pour manger.\"",
  },
  {
    q: "À quoi servent les oreilles ?",
    correct: "À écouter",
    distractors: ["À voir", "À sentir", "À toucher"],
    explanation: "Kamau dit : \"Les oreilles sont pour écouter.\"",
  },
  {
    q: "À quoi servent les yeux ?",
    correct: "À voir",
    distractors: ["À écouter", "À manger", "À marcher"],
    explanation: "Kamau dit : \"Les yeux sont pour voir.\"",
  },
  {
    q: "À quoi sert le nez ?",
    correct: "À sentir",
    distractors: ["À voir", "À toucher", "À penser"],
    explanation: "Kamau dit : \"Le nez est pour sentir.\"",
  },
  {
    q: "À quoi servent les mains, selon Kamau ?",
    correct: "À toucher",
    distractors: ["À marcher", "À voir", "À écouter"],
    explanation: "Kamau dit : \"Les mains sont pour toucher.\"",
  },
  {
    q: "À quoi servent les pieds ?",
    correct: "À marcher",
    distractors: ["À penser", "À sentir", "À toucher"],
    explanation: "Kamau dit : \"Les pieds sont pour marcher.\"",
  },
  {
    q: "À quoi sert la tête, selon Kamau ?",
    correct: "À penser",
    distractors: ["À manger", "À marcher", "À voir"],
    explanation: "Kamau dit : \"La tête est pour penser.\"",
  },
  {
    q: "Qui pose toutes les questions dans le dialogue ?",
    correct: "Otieno",
    distractors: ["Kamau", "Les deux ensemble", "Personne"],
    explanation: "C'est Otieno qui demande à chaque fois \"à quoi sert...\" et Kamau qui répond.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kamau : La bouche est pour ", after: ".", answer: "manger", gloss: "The mouth is for eating." },
  { before: "Kamau : Les oreilles sont pour ", after: ".", answer: "écouter", gloss: "The ears are for listening." },
  { before: "Kamau : Les yeux sont pour ", after: ".", answer: "voir", gloss: "The eyes are for seeing." },
  { before: "Kamau : Le nez est pour ", after: ".", answer: "sentir", gloss: "The nose is for smelling." },
  { before: "Kamau : Les mains sont pour toucher, et les pieds sont pour ", after: ".", answer: "marcher", gloss: "The hands are for touching, and the feet are for walking." },
  { before: "Kamau : La tête est pour ", after: ". Merci pour ce jeu, Otieno !", answer: "penser", gloss: "The head is for thinking." },
  { before: "Otieno : Kamau, à quoi sert la ", after: " ?", answer: "bouche", gloss: "Otieno asks what the mouth is for." },
  { before: "Otieno : Et les ", after: ", à quoi servent-elles ?", answer: "oreilles", gloss: "Otieno asks what the ears are for." },
  { before: "Otieno : Et le ", after: " ?", answer: "nez", gloss: "Otieno asks about the nose." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["La", "bouche", "est", "pour", "manger", "."], sentence: "La bouche est pour manger." },
  { chunks: ["Les", "oreilles", "sont", "pour", "écouter", "."], sentence: "Les oreilles sont pour écouter." },
  { chunks: ["Les", "yeux", "sont", "pour", "voir", "."], sentence: "Les yeux sont pour voir." },
  { chunks: ["La", "tête", "est", "pour", "penser", "."], sentence: "La tête est pour penser." },
];

export const bodyReading: Skill = {
  id: "g5-fr-r-body",
  code: "R.7",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: body parts and their functions",
  description: "Read a short French dialogue quizzing body parts and what each one is for, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what Kamau says each body part is for.",
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
      hint: "Look at what Kamau actually says each body part is for.",
      explanation: q.explanation,
    };
  },
};
