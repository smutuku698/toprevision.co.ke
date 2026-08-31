import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const LINES = [
  "L'élève : Excusez-moi Madame, quelle heure est-il, s'il vous plaît ?",
  "La maîtresse : Il est trois heures et quart de l'après-midi.",
  "L'élève : Merci. Et quelle est la date aujourd'hui ?",
  "La maîtresse : Nous sommes le lundi douze mars.",
  "L'élève : Le cours de français commence à quelle heure ?",
  "La maîtresse : Il commence à quatre heures moins le quart de l'après-midi.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string; visual?: VisualSpec }[] = [
  {
    q: "Quelle heure la maîtresse indique-t-elle au début du dialogue ?",
    correct: "Trois heures et quart",
    distractors: ["Quatre heures moins le quart", "Deux heures et demie", "Minuit"],
    explanation: "La maîtresse répond : \"Il est trois heures et quart de l'après-midi.\"",
  },
  {
    q: "Quelle est la date mentionnée dans le dialogue ?",
    correct: "Lundi douze mars",
    distractors: ["Mardi douze mars", "Lundi douze avril", "Dimanche douze mars"],
    explanation: "La maîtresse dit : \"Nous sommes le lundi douze mars.\"",
  },
  {
    q: "À quelle heure commence le cours de français ?",
    correct: "Quatre heures moins le quart",
    distractors: ["Trois heures et quart", "Midi", "Une heure"],
    explanation: "La maîtresse dit : \"Il commence à quatre heures moins le quart de l'après-midi.\"",
  },
  {
    q: "Quelle phrase du dialogue correspond à l'heure indiquée sur l'horloge ci-dessus ?",
    correct: "Il est trois heures et quart de l'après-midi.",
    distractors: [
      "Il est quatre heures moins le quart de l'après-midi.",
      "Il est midi.",
      "Il est deux heures et demie.",
    ],
    explanation: "L'horloge montre 3 h 15, ce qui correspond à \"Il est trois heures et quart de l'après-midi.\"",
    visual: { type: "clock", hour: 3, minute: 15 },
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "L'élève utilise la forme polie 'vous' pour parler à la maîtresse.", isTrue: true },
  { text: "Il est minuit quand l'élève pose sa question.", isTrue: false },
  { text: "Le cours de français commence à quatre heures moins le quart.", isTrue: true },
  { text: "La date mentionnée est le dimanche douze mars.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Quelle heure est-il ?", meaning: "What time is it?" },
  { phrase: "Il est trois heures et quart", meaning: "It is quarter past three" },
  { phrase: "Il est quatre heures moins le quart", meaning: "It is quarter to four" },
  { phrase: "Il est deux heures et demie", meaning: "It is half past two" },
  { phrase: "Il est midi", meaning: "It is noon" },
  { phrase: "Il est minuit", meaning: "It is midnight" },
  { phrase: "Nous sommes le lundi douze mars", meaning: "It is Monday the twelfth of March" },
];

export const timeReading: Skill = {
  id: "g8-fr-r-time",
  code: "R.4",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: telling time",
  description: "Read a formal French dialogue about time, dates, and a class schedule, then answer comprehension questions.",
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
        hint: "Reread the times and dates given by the maîtresse carefully.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each French time expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'et quart' means 'past the quarter hour' and 'moins le quart' means 'to the next hour'.",
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
        hint: "The élève first asks the time, then the date, then when class starts.",
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
      visual: q.visual,
      hint: "Look at the times and date given in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
