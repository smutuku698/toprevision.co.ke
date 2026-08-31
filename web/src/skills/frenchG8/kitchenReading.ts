import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Dans la cuisine, la grand-mère prépare le déjeuner avec sa petite-fille.",
  "La grand-mère : Épluchez les pommes de terre, puis coupez les légumes avec le couteau.",
  "La grand-mère : Mettez-les dans la casserole et faites cuire le riz.",
  "La grand-mère : Ajoutez du sel et mélangez les ingrédients.",
  "La petite-fille : J'ai faim ! Qu'est-ce que nous mangeons ?",
  "La grand-mère : Nous mangeons du riz et des légumes pour le déjeuner.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Où se passe la scène ?",
    correct: "Dans la cuisine",
    distractors: ["Dans le jardin", "À l'école", "Au marché"],
    explanation: "Le texte commence : \"Dans la cuisine, la grand-mère prépare le déjeuner...\"",
  },
  {
    q: "Que doit faire la petite-fille en premier ?",
    correct: "Éplucher les pommes de terre",
    distractors: ["Faire cuire le riz", "Ajouter du sel", "Mélanger les ingrédients"],
    explanation: "La grand-mère dit : \"Épluchez les pommes de terre, puis coupez les légumes avec le couteau.\"",
  },
  {
    q: "Avec quoi coupe-t-on les légumes ?",
    correct: "Le couteau",
    distractors: ["La cuillère", "La fourchette", "L'assiette"],
    explanation: "La grand-mère dit de couper les légumes \"avec le couteau\".",
  },
  {
    q: "Qu'est-ce que la famille mange pour le déjeuner ?",
    correct: "Du riz et des légumes",
    distractors: ["Des pommes de terre seules", "Du pain et du lait", "De la viande et des fruits"],
    explanation: "La grand-mère répond : \"Nous mangeons du riz et des légumes pour le déjeuner.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "La scène se passe dans la cuisine.", isTrue: true },
  { text: "La grand-mère prépare le dîner.", isTrue: false },
  { text: "La petite-fille a faim.", isTrue: true },
  { text: "On ajoute du sucre aux ingrédients.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Épluchez les pommes de terre", meaning: "Peel the potatoes" },
  { phrase: "Coupez les légumes", meaning: "Cut the vegetables" },
  { phrase: "Faites cuire le riz", meaning: "Cook the rice" },
  { phrase: "Ajoutez du sel", meaning: "Add salt" },
  { phrase: "Mélangez les ingrédients", meaning: "Mix the ingredients" },
  { phrase: "la casserole", meaning: "the pot" },
  { phrase: "la poêle", meaning: "the frying pan" },
  { phrase: "le couteau", meaning: "the knife" },
  { phrase: "la cuillère", meaning: "the spoon" },
  { phrase: "la fourchette", meaning: "the fork" },
  { phrase: "l'assiette", meaning: "the plate" },
];

export const kitchenReading: Skill = {
  id: "g8-fr-r-kitchen",
  code: "R.6",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: in the kitchen",
  description: "Read a French recipe-style passage of a grandmother giving cooking instructions, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the grand-mère's cooking instructions carefully.",
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
        prompt: "Match each French kitchen word or instruction from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "The recipe instructions use the polite 'vous' imperative form (-ez endings).",
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
        prompt: "Put these steps from the passage in the order they happen.",
        instruction: "Click the steps in the correct order.",
        items,
        correctOrder,
        hint: "Peeling and cutting come before cooking, and mixing comes last.",
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
      hint: "Look at what the grand-mère instructs in the passage above.",
      explanation: q.explanation,
    };
  },
};
