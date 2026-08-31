import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Fee qaryatina, ash-shamsu haaratun fee as-sayf, wa an-naasu ya'maloona fee az-ziraa'a.\n" +
  "Ba'du ar-rijaal yadhhaboona ilaa al-buhayra li sayd as-samak.\n" +
  "Fee al-shitaa', al-jawwu baaridun wa yanzilu al-matar katheeran.\n" +
  "An-naasu aydan yamaarisoona at-tijaara fee as-souq kulla usbu'.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What do people in the village do in summer?",
    correct: "Farming, because the sun is hot",
    distractors: ["Fishing only", "Nothing at all", "Trading only"],
    explanation: "The text says \"ash-shamsu haaratun fee as-sayf, wa an-naasu ya'maloona fee az-ziraa'a\" — \"the sun is hot in summer, and people work in farming.\"",
  },
  {
    q: "Where do some men go to fish?",
    correct: "To the lake",
    distractors: ["To the river", "To the sea", "To the market"],
    explanation: "The text says \"yadhhaboona ilaa al-buhayra li sayd as-samak\" — \"they go to the lake to fish.\"",
  },
  {
    q: "What is the weather like in winter, according to the text?",
    correct: "Cold, with a lot of rain",
    distractors: ["Hot and dry", "Windy but warm", "The same as summer"],
    explanation: "The text says \"al-jawwu baaridun wa yanzilu al-matar katheeran\" — \"the weather is cold and a lot of rain falls.\"",
  },
];

const TRUE_FALSE_PROMPTS = [
  "Sort each statement as True or False, based on the passage.",
  "Decide whether each statement below is True or False, based on the passage.",
  "Read the passage again and sort each statement as True or False.",
  "Is each statement True or False according to the passage? Sort it.",
  "Using the passage above, sort each statement into True or False.",
  "Check the passage and sort each statement as True or False.",
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "People farm in the village because the summer sun is hot.", isTrue: true },
  { text: "No one in the village goes fishing.", isTrue: false },
  { text: "Winter in the village is cold with a lot of rain.", isTrue: true },
  { text: "People never trade in the market.", isTrue: false },
];

export const weatherReading: Skill = {
  id: "ar-r-weather",
  code: "R.8",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: weather and local activities",
  description: "Read a short Arabic passage about weather and local activities and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: randChoice(rng, TRUE_FALSE_PROMPTS),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage carefully and check what activities go with which season.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
      hint: "Look at how the passage links each season to certain activities.",
      explanation: q.explanation,
    };
  },
};
