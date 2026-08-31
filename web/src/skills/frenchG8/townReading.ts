import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Le touriste : Excusez-moi, Madame. Comment puis-je aller à la banque, s'il vous plaît ?",
  "La dame : Bonjour Monsieur. Continuez tout droit, puis tournez à gauche à côté de la pharmacie.",
  "Le touriste : Merci. Et où est la poste ?",
  "La dame : La poste est en face de l'école, entre le marché et l'hôpital.",
  "Le touriste : Est-ce que le parc est loin d'ici ?",
  "La dame : Non, le parc est près de l'église, derrière la banque.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que cherche le touriste au début du dialogue ?",
    correct: "La banque",
    distractors: ["La poste", "Le marché", "L'église"],
    explanation: "Le touriste demande : \"Comment puis-je aller à la banque, s'il vous plaît ?\"",
  },
  {
    q: "Où se trouve la poste, selon la dame ?",
    correct: "En face de l'école, entre le marché et l'hôpital",
    distractors: ["À côté de la pharmacie", "Derrière la banque", "Loin du parc"],
    explanation: "La dame répond : \"La poste est en face de l'école, entre le marché et l'hôpital.\"",
  },
  {
    q: "Où est situé le parc ?",
    correct: "Près de l'église, derrière la banque",
    distractors: ["Loin de l'église", "En face de la poste", "Entre le marché et l'hôpital"],
    explanation: "La dame répond : \"Le parc est près de l'église, derrière la banque.\"",
  },
  {
    q: "Que doit faire le touriste pour trouver la banque ?",
    correct: "Continuer tout droit, puis tourner à gauche",
    distractors: ["Tourner à droite immédiatement", "Traverser la rue et tourner à droite", "Continuer tout droit seulement"],
    explanation: "La dame dit : \"Continuez tout droit, puis tournez à gauche à côté de la pharmacie.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Le touriste utilise la forme polie 'vous'.", isTrue: true },
  { text: "La poste est loin de l'école.", isTrue: false },
  { text: "Le parc est près de l'église.", isTrue: true },
  { text: "La dame dit de tourner à droite pour trouver la banque.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "à côté de", meaning: "next to" },
  { phrase: "en face de", meaning: "across from" },
  { phrase: "entre", meaning: "between" },
  { phrase: "près de", meaning: "near" },
  { phrase: "loin de", meaning: "far from" },
  { phrase: "derrière", meaning: "behind" },
  { phrase: "la banque", meaning: "the bank" },
  { phrase: "la poste", meaning: "the post office" },
  { phrase: "le marché", meaning: "the market" },
  { phrase: "l'église", meaning: "the church" },
  { phrase: "la pharmacie", meaning: "the pharmacy" },
];

export const townReading: Skill = {
  id: "g8-fr-r-town",
  code: "R.3",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: my town",
  description: "Read a formal French dialogue about asking for and giving directions around town, then answer comprehension questions.",
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
        hint: "Reread the directions the dame gives carefully.",
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
        prompt: "Match each French word or expression from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these words in the dialogue above.",
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
        hint: "The touriste asks about the bank first, then the post office, then the park.",
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
      hint: "Look at what the dame says about each place in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
