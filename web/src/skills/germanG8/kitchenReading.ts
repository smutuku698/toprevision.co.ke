import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Mutter: Ich habe Hunger. Schneiden Sie bitte das Gemüse!",
  "Sohn: Gut, Mama. Soll ich auch die Kartoffeln schälen?",
  "Mutter: Ja, bitte. Dann mischen Sie die Zutaten gut.",
  "Sohn: Fügen Sie auch Salz hinzu?",
  "Mutter: Ja, und kochen Sie den Reis zwanzig Minuten.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does the mother ask the son to do first?",
    correct: "Das Gemüse schneiden.",
    distractors: ["Die Kartoffeln schälen.", "Den Reis kochen.", "Salz hinzufügen."],
    explanation: "The mother says \"Schneiden Sie bitte das Gemüse!\" — cut the vegetables.",
  },
  {
    q: "What does the son offer to do next?",
    correct: "Die Kartoffeln schälen.",
    distractors: ["Das Gemüse schneiden.", "Die Zutaten mischen.", "Den Reis kochen."],
    explanation: "The son asks \"Soll ich auch die Kartoffeln schälen?\" — should I also peel the potatoes?",
  },
  {
    q: "What does the mother tell the son to do after peeling the potatoes?",
    correct: "Die Zutaten gut mischen.",
    distractors: ["Salz hinzufügen.", "Den Reis kochen.", "Das Gemüse schneiden."],
    explanation: "The mother says \"Dann mischen Sie die Zutaten gut\" — then mix the ingredients well.",
  },
  {
    q: "How long should the rice cook?",
    correct: "Zwanzig Minuten.",
    distractors: ["Zehn Minuten.", "Dreißig Minuten.", "Fünfzehn Minuten."],
    explanation: "The mother says \"kochen Sie den Reis zwanzig Minuten\" — cook the rice for twenty minutes.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "The mother asks the son to cut the vegetables first.", isTrue: true },
  { text: "The son refuses to peel the potatoes.", isTrue: false },
  { text: "The mother says to add salt.", isTrue: true },
  { text: "The rice cooks for ten minutes.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Schneiden Sie das Gemüse!", meaning: "Cut the vegetables!" },
  { phrase: "die Kartoffeln schälen", meaning: "to peel the potatoes" },
  { phrase: "die Zutaten mischen", meaning: "to mix the ingredients" },
  { phrase: "Salz hinzufügen", meaning: "to add salt" },
  { phrase: "den Reis kochen", meaning: "to cook the rice" },
  { phrase: "Ich habe Hunger.", meaning: "I am hungry." },
  { phrase: "zwanzig Minuten", meaning: "twenty minutes" },
];

export const kitchenReading: Skill = {
  id: "g8-de-r-kitchen",
  code: "R.6",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: in the kitchen",
  description: "Read a formal German dialogue about preparing a meal, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check each cooking step in order.",
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
        hint: "The recipe steps follow the cooking order: cutting, peeling, mixing, adding salt, then cooking the rice.",
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
      hint: "Look at the order of cooking steps described in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
