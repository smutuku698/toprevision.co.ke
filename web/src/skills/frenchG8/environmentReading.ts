import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Le guide : Bienvenue ! Regardez la montagne et la vallée devant vous.",
  "Le guide : Ici, il y a une rivière qui traverse la forêt et la plaine.",
  "Le touriste : Quel temps fait-il aujourd'hui ?",
  "Le guide : Il fait beau, mais sur la colline, il fait du vent.",
  "Le touriste : Et en hiver, fait-il froid ici ?",
  "Le guide : En été, il fait chaud. En hiver, il pleut près du lac.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que voit-on devant le groupe au début ?",
    correct: "La montagne et la vallée",
    distractors: ["Le lac et la colline", "La forêt et la rivière", "La plaine et la mer"],
    explanation: "Le guide dit : \"Regardez la montagne et la vallée devant vous.\"",
  },
  {
    q: "Qu'est-ce qui traverse la forêt et la plaine ?",
    correct: "Une rivière",
    distractors: ["Un lac", "Une montagne", "Une vallée"],
    explanation: "Le guide dit : \"Il y a une rivière qui traverse la forêt et la plaine.\"",
  },
  {
    q: "Quel temps fait-il sur la colline ?",
    correct: "Il fait du vent",
    distractors: ["Il neige", "Il fait très froid", "Il pleut"],
    explanation: "Le guide dit : \"Sur la colline, il fait du vent.\"",
  },
  {
    q: "Que se passe-t-il en hiver, près du lac ?",
    correct: "Il pleut",
    distractors: ["Il fait chaud", "Il neige", "Il fait beau"],
    explanation: "Le guide dit : \"En hiver, il pleut près du lac.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Le guide parle d'une montagne et d'une vallée.", isTrue: true },
  { text: "En été, il fait froid selon le guide.", isTrue: false },
  { text: "Il pleut près du lac en hiver.", isTrue: true },
  { text: "Il neige sur la colline.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Il fait chaud", meaning: "It is hot" },
  { phrase: "Il fait froid", meaning: "It is cold" },
  { phrase: "Il fait beau", meaning: "The weather is nice" },
  { phrase: "Il pleut", meaning: "It is raining" },
  { phrase: "Il fait du vent", meaning: "It is windy" },
  { phrase: "la montagne", meaning: "the mountain" },
  { phrase: "la rivière", meaning: "the river" },
  { phrase: "la forêt", meaning: "the forest" },
  { phrase: "la plaine", meaning: "the plain" },
  { phrase: "le lac", meaning: "the lake" },
  { phrase: "la colline", meaning: "the hill" },
  { phrase: "la vallée", meaning: "the valley" },
];

export const environmentReading: Skill = {
  id: "g8-fr-r-environment",
  code: "R.8",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: physical features and weather",
  description: "Read a French dialogue of a tour guide describing landforms and weather, then answer comprehension questions.",
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
        hint: "Reread what the guide says about each landform and season carefully.",
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
        prompt: "Match each French weather or landform word from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Weather expressions use 'Il fait...' or 'Il pleut/neige'; landforms are nouns with le/la.",
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
        hint: "The guide welcomes the group and describes the landscape before discussing the weather and seasons.",
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
      hint: "Look at what the guide describes about the landscape and weather above.",
      explanation: q.explanation,
    };
  },
};
