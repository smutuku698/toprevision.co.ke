import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "La mère : Nous allons voyager en avion aujourd'hui. Prenez vos bagages !",
  "Le père : N'oubliez pas votre passeport et votre billet !",
  "L'enfant : D'accord. Nous partons à quelle heure pour l'aéroport ?",
  "La mère : Nous partons maintenant. Présentez votre billet à l'entrée de l'aéroport.",
  "Le père : Dans l'avion, attachez votre ceinture, s'il vous plaît.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment la famille va-t-elle voyager ?",
    correct: "En avion",
    distractors: ["En train", "En bus", "En voiture"],
    explanation: "La mère dit : \"Nous allons voyager en avion aujourd'hui.\"",
  },
  {
    q: "Que demande la mère à l'enfant de prendre en premier ?",
    correct: "Ses bagages",
    distractors: ["Son passeport", "Son billet", "Sa valise"],
    explanation: "La mère dit : \"Prenez vos bagages !\"",
  },
  {
    q: "Que ne faut-il pas oublier, selon le père ?",
    correct: "Le passeport et le billet",
    distractors: ["Les bagages et la valise", "La ceinture", "L'aéroport"],
    explanation: "Le père dit : \"N'oubliez pas votre passeport et votre billet !\"",
  },
  {
    q: "Que doit faire l'enfant dans l'avion ?",
    correct: "Attacher sa ceinture",
    distractors: ["Présenter son billet", "Prendre ses bagages", "Oublier son passeport"],
    explanation: "Le père dit : \"Dans l'avion, attachez votre ceinture, s'il vous plaît.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "La famille voyage en train.", isTrue: false },
  { text: "Le père rappelle à l'enfant de ne pas oublier son passeport.", isTrue: true },
  { text: "L'enfant doit présenter son billet à l'entrée de l'aéroport.", isTrue: true },
  { text: "La mère dit qu'ils partent demain.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Prenez vos bagages !", meaning: "Take your luggage!" },
  { phrase: "N'oubliez pas votre passeport !", meaning: "Don't forget your passport!" },
  { phrase: "Attachez votre ceinture !", meaning: "Fasten your seatbelt!" },
  { phrase: "Présentez votre billet !", meaning: "Show your ticket!" },
  { phrase: "l'aéroport", meaning: "the airport" },
  { phrase: "la gare", meaning: "the train station" },
  { phrase: "les bagages", meaning: "the luggage" },
  { phrase: "la valise", meaning: "the suitcase" },
];

export const travelReading: Skill = {
  id: "g8-fr-r-travel",
  code: "R.5",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: travel",
  description: "Read a French dialogue of parents giving formal travel instructions before a flight, then answer comprehension questions.",
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
        hint: "Reread the instructions the parents give the enfant carefully.",
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
        prompt: "Match each French travel word or instruction from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "The imperative instructions all use the polite 'vous' form (-ez endings).",
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
        hint: "Packing bags comes before boarding the plane and fastening the seatbelt.",
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
      hint: "Look at what each parent tells the enfant to do in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
