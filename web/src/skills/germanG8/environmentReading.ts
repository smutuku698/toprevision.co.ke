import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const FORECAST_DAYS: { label: string; condition: "sunny" | "cloudy" | "rainy" | "stormy" }[] = [
  { label: "Montag", condition: "sunny" },
  { label: "Dienstag", condition: "cloudy" },
  { label: "Mittwoch", condition: "rainy" },
  { label: "Donnerstag", condition: "stormy" },
  { label: "Freitag", condition: "sunny" },
];

const LINES = [
  "Frau Njeri: Wie ist das Wetter heute, Herr Otieno?",
  "Herr Otieno: Die Sonne scheint, und es ist heiß.",
  "Frau Njeri: Wenn die Sonne scheint, gehe ich schwimmen.",
  "Herr Otieno: Der See ist schön, und der Berg dort ist sehr hoch.",
  "Frau Njeri: Ja, und der Wald ist so grün. Aber wenn es regnet, bleibe ich zu Hause.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string; visual?: VisualSpec }[] = [
  {
    q: "What is the weather like today?",
    correct: "Die Sonne scheint, und es ist heiß.",
    distractors: ["Es regnet und ist kalt.", "Es ist windig und kalt.", "Es regnet und ist heiß."],
    explanation: "Herr Otieno says \"Die Sonne scheint, und es ist heiß\" — the sun is shining and it is hot.",
  },
  {
    q: "Look at the forecast strip above. Which day matches 'Es regnet' (it is raining) from the dialogue?",
    correct: "Mittwoch",
    distractors: ["Montag", "Dienstag", "Donnerstag"],
    explanation: "Mittwoch is shown with a rain icon on the forecast strip, matching \"Es regnet\" — it is raining.",
    visual: { type: "weather", days: FORECAST_DAYS },
  },
  {
    q: "What does Frau Njeri do when the sun shines?",
    correct: "Sie geht schwimmen.",
    distractors: ["Sie bleibt zu Hause.", "Sie geht zum Berg.", "Sie geht zur Bibliothek."],
    explanation: "Frau Njeri says \"Wenn die Sonne scheint, gehe ich schwimmen\" — when the sun shines, she goes swimming.",
  },
  {
    q: "How does Herr Otieno describe the mountain?",
    correct: "Sehr hoch.",
    distractors: ["Sehr grün.", "Sehr klein.", "Sehr kalt."],
    explanation: "Herr Otieno says \"der Berg dort ist sehr hoch\" — the mountain there is very high.",
  },
  {
    q: "What does Frau Njeri do when it rains?",
    correct: "Sie bleibt zu Hause.",
    distractors: ["Sie geht schwimmen.", "Sie geht zum See.", "Sie geht in den Wald."],
    explanation: "Frau Njeri says \"wenn es regnet, bleibe ich zu Hause\" — when it rains, she stays home.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "The sun is shining and it is hot today.", isTrue: true },
  { text: "Frau Njeri stays home when the sun shines.", isTrue: false },
  { text: "The forest is described as green.", isTrue: true },
  { text: "Frau Njeri goes swimming when it rains.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Wie ist das Wetter?", meaning: "How is the weather?" },
  { phrase: "Die Sonne scheint.", meaning: "The sun is shining." },
  { phrase: "Es ist heiß.", meaning: "It is hot." },
  { phrase: "Es regnet.", meaning: "It is raining." },
  { phrase: "der See", meaning: "the lake" },
  { phrase: "der Berg", meaning: "the mountain" },
  { phrase: "der Wald", meaning: "the forest" },
  { phrase: "zu Hause bleiben", meaning: "to stay home" },
];

export const environmentReading: Skill = {
  id: "g8-de-r-environment",
  code: "R.8",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: weather and the environment",
  description: "Read a formal German dialogue about weather and physical features, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what each speaker says about the weather and landscape.",
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
        prompt: "Match each German word or phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these exact expressions in the dialogue above.",
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
        hint: "The dialogue opens by asking about the weather and ends with what happens when it rains.",
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
      hint: "Look at what each speaker says about the weather and the landscape in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
