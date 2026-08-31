import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Amina: To visit my grandmother, I first ride my darraja to the haafila stop.",
  "Amina: The haafila takes me to the qitaar station.",
  "Amina: From there, I travel by qitaar to the coast.",
  "Amina: My uncle drives his sayyara to meet me, but sometimes we go mashyan instead.",
  "Amina: Last year, we even traveled by tayyaara and by safeena!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How does Amina first travel to the haafila stop?",
    correct: "By darraja (bicycle)",
    distractors: ["By sayyara (car)", "Mashyan (on foot)", "By qitaar (train)"],
    explanation: "Amina says, \"I first ride my darraja to the haafila stop.\"",
  },
  {
    q: "What does the haafila take Amina to?",
    correct: "The qitaar station",
    distractors: ["The airport", "Her grandmother's house directly", "The suuq"],
    explanation: "Amina says, \"The haafila takes me to the qitaar station.\"",
  },
  {
    q: "What does Amina's uncle sometimes do instead of driving his sayyara?",
    correct: "They go mashyan (on foot)",
    distractors: ["They take a safeena (boat)", "They take a tayyaara (airplane)", "They stay home"],
    explanation: "Amina says, \"sometimes we go mashyan instead.\"",
  },
  {
    q: "What two forms of transport did Amina's family use last year?",
    correct: "A tayyaara (airplane) and a safeena (ship / boat)",
    distractors: ["A qitaar (train) and a darraja (bicycle)", "A sayyara (car) and a haafila (bus)", "Only mashyan (on foot)"],
    explanation: "Amina says, \"we even traveled by tayyaara and by safeena!\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina rides a darraja to the haafila stop.", isTrue: true },
  { text: "Amina says she never travels by qitaar.", isTrue: false },
  { text: "Amina's uncle sometimes travels mashyan instead of driving.", isTrue: true },
  { text: "Amina says her family has never used a tayyaara.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "sayyara", meaning: "car" },
  { phrase: "haafila", meaning: "bus" },
  { phrase: "qitaar", meaning: "train" },
  { phrase: "tayyaara", meaning: "airplane" },
  { phrase: "darraja", meaning: "bicycle" },
  { phrase: "safeena", meaning: "ship / boat" },
  { phrase: "mashyan", meaning: "on foot" },
];

export const gettingAroundReading: Skill = {
  id: "g8-ar-r-getting-around",
  code: "R.9",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: getting around",
  description: "Read a short Arabic passage about a student's journey using different kinds of transport and answer comprehension questions.",
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
        hint: "Reread the passage carefully and check exactly which transport Amina uses at each step.",
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
        prompt: "Match each transport word from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each transport word is used in the passage above.",
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
        prompt: "Put these lines from the passage in the order Amina's journey happens.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Amina rides her bicycle first, then the bus, then the train, then meets her uncle, then recalls last year's trip.",
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
      hint: "Follow Amina's journey step by step, noting each type of transport.",
      explanation: q.explanation,
    };
  },
};
