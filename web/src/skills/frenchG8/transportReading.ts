import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Le contrôleur : Bonjour ! Montez dans le train, s'il vous plaît.",
  "Le passager : Merci. Le train part à quelle heure ?",
  "Le contrôleur : Il part dans cinq minutes. Prenez vos places.",
  "Le passager : Je dois descendre où pour aller à l'école ?",
  "Le contrôleur : Descendez à la prochaine gare, puis continuez à pied.",
  "Le passager : D'accord, merci beaucoup Monsieur.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment le passager voyage-t-il au début du dialogue ?",
    correct: "En train",
    distractors: ["En bus", "En vélo", "En bateau"],
    explanation: "Le contrôleur dit : \"Montez dans le train, s'il vous plaît.\"",
  },
  {
    q: "Dans combien de temps le train part-il ?",
    correct: "Dans cinq minutes",
    distractors: ["Dans une heure", "Immédiatement", "Demain"],
    explanation: "Le contrôleur répond : \"Il part dans cinq minutes.\"",
  },
  {
    q: "Où le contrôleur dit-il au passager de descendre ?",
    correct: "À la prochaine gare",
    distractors: ["À l'aéroport", "Au marché", "Devant l'école"],
    explanation: "Le contrôleur dit : \"Descendez à la prochaine gare, puis continuez à pied.\"",
  },
  {
    q: "Comment le passager continue-t-il son trajet après la gare ?",
    correct: "À pied",
    distractors: ["En vélo", "En moto", "En voiture"],
    explanation: "Le contrôleur dit de continuer \"à pied\" après être descendu à la gare.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Le passager voyage en avion.", isTrue: false },
  { text: "Le contrôleur dit de monter dans le train.", isTrue: true },
  { text: "Le train part dans cinq minutes.", isTrue: true },
  { text: "Le passager continue en voiture après la gare.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "la voiture", meaning: "the car" },
  { phrase: "le bus", meaning: "the bus" },
  { phrase: "le train", meaning: "the train" },
  { phrase: "l'avion", meaning: "the plane" },
  { phrase: "le vélo", meaning: "the bicycle" },
  { phrase: "la moto", meaning: "the motorbike" },
  { phrase: "le bateau", meaning: "the boat" },
  { phrase: "à pied", meaning: "on foot" },
  { phrase: "Montez dans le train", meaning: "Get on the train" },
  { phrase: "Descendez à la prochaine gare", meaning: "Get off at the next station" },
];

export const transportReading: Skill = {
  id: "g8-fr-r-transport",
  code: "R.9",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: transport",
  description: "Read a French dialogue of a train conductor giving formal instructions to a passenger, then answer comprehension questions.",
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
        hint: "Reread the contrôleur's instructions to the passager carefully.",
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
        prompt: "Match each French transport word or instruction from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "The contrôleur's instructions use the polite 'vous' imperative form (-ez endings).",
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
        hint: "The passager boards the train before asking where to get off.",
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
      hint: "Look at what the contrôleur tells the passager to do in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
