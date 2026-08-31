import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "L'infirmière : Bonjour. Comment vous sentez-vous aujourd'hui ?",
  "L'élève : Je me sens fatigué. J'ai mal à la tête.",
  "L'infirmière : Êtes-vous inquiet ou triste aussi ?",
  "L'élève : Non, je ne suis pas triste, mais je suis un peu inquiet pour l'examen.",
  "L'infirmière : Ne soyez pas effrayé ! Après l'examen, vous serez content.",
  "L'élève : Merci Madame. Maintenant je suis content.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment l'élève se sent-il au début du dialogue ?",
    correct: "Fatigué, avec mal à la tête",
    distractors: ["Content et heureux", "En colère", "Surpris"],
    explanation: "L'élève dit : \"Je me sens fatigué. J'ai mal à la tête.\"",
  },
  {
    q: "Est-ce que l'élève est triste ?",
    correct: "Non, il n'est pas triste",
    distractors: ["Oui, il est très triste", "Il ne répond pas", "Il est en colère"],
    explanation: "L'élève répond : \"Non, je ne suis pas triste.\"",
  },
  {
    q: "Pourquoi l'élève est-il inquiet ?",
    correct: "À cause de l'examen",
    distractors: ["À cause de la tête", "À cause de l'infirmière", "À cause de ses mains"],
    explanation: "L'élève dit qu'il est \"inquiet pour l'examen\".",
  },
  {
    q: "Comment l'élève se sent-il à la fin du dialogue ?",
    correct: "Content",
    distractors: ["Effrayé", "Fatigué", "En colère"],
    explanation: "L'élève dit : \"Maintenant je suis content.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "L'infirmière utilise 'vous' pour parler à l'élève.", isTrue: true },
  { text: "L'élève a mal aux pieds.", isTrue: false },
  { text: "L'élève est inquiet pour l'examen.", isTrue: true },
  { text: "L'infirmière dit à l'élève d'être effrayé.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "content(e)", meaning: "happy, pleased" },
  { phrase: "triste", meaning: "sad" },
  { phrase: "fatigué(e)", meaning: "tired" },
  { phrase: "en colère", meaning: "angry" },
  { phrase: "inquiet/inquiète", meaning: "worried" },
  { phrase: "effrayé(e)", meaning: "scared" },
  { phrase: "la tête", meaning: "the head" },
  { phrase: "les yeux", meaning: "the eyes" },
  { phrase: "les mains", meaning: "the hands" },
  { phrase: "le cœur", meaning: "the heart" },
];

export const feelingsReading: Skill = {
  id: "g8-fr-r-feelings",
  code: "R.7",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: feelings and emotions",
  description: "Read a formal French dialogue between a school nurse and a student about how they feel, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
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
        hint: "Reread how the élève describes their feelings carefully.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
        prompt: "Match each French feeling or body word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Feeling words often end in -é(e) or -eux/-euse depending on who is speaking.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The élève feels tired and worried at first, then content by the end.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Look at how the élève describes their feelings in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
