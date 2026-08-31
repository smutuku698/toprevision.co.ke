import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is an example of a waste disposal facility at home?",
    correct: "A dust bin, sink, or open drain",
    distractors: ["A wardrobe", "A bookshelf", "A cooking pot"],
  },
  {
    q: "Why is it important to clean waste disposal facilities regularly?",
    correct: "To prevent bad smells, pests, and the spread of disease",
    distractors: ["To make them last longer as furniture", "To increase their resale value", "To make them heavier"],
  },
  {
    q: "Which of these should not be left blocked or dirty for hygiene reasons?",
    correct: "An open drain",
    distractors: ["A window", "A door", "A roof"],
  },
  {
    q: "What could happen if a sink or drain is left dirty for a long time?",
    correct: "It can become blocked and attract pests or bad odours",
    distractors: ["It will clean itself over time", "It becomes more waterproof", "It increases water pressure"],
  },
  {
    q: "Which improvised resources could help maintain a clean waste disposal facility at home?",
    correct: "A scrubbing brush and some water with soap or disinfectant",
    distractors: ["A hammer and nails", "A paintbrush and paint", "A tape measure"],
  },
];

const FILL_QUESTIONS: { before: string; after: string; correctAnswer: string }[] = [
  {
    before: "Waste disposal facilities such as dust bins, sinks, and open drains should be cleaned regularly to prevent bad smells, pests, and the spread of ",
    after: ".",
    correctAnswer: "disease",
  },
  {
    before: "An open ",
    after: " should never be left blocked or dirty, as it can attract pests and bad odours.",
    correctAnswer: "drain",
  },
  {
    before: "A scrubbing brush and water with soap or ",
    after: " are simple resources that can help keep a waste disposal facility clean.",
    correctAnswer: "disinfectant",
  },
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word completes this sentence correctly?",
  "Fill in the blank below.",
  "Supply the missing word to complete the sentence.",
  "What word belongs in the blank?",
];

export const wasteDisposal: Skill = {
  id: "ag-h-waste-disposal",
  code: "H.1",
  subjectId: "agriculture-nutrition",
  strandId: "ag-hygiene",
  grade: 9,
  title: "Cleaning waste disposal facilities",
  description: "Answer questions about keeping waste disposal facilities clean at home.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill"] as const);

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_QUESTIONS);

      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Waste disposal facilities such as dust bins, sinks, and open drains need regular cleaning to prevent pests, bad smells, and disease.",
        explanation: `${entry.before}${entry.correctAnswer}${entry.after}`,
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Waste disposal facilities such as dust bins, sinks, and open drains need regular cleaning to prevent pests, bad smells, and disease.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
