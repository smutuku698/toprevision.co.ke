import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is a traditional Kenyan indigenous board game?",
    correct: "Bao (a mancala-style game played by moving seeds between pits)",
    distractors: ["Chess", "Monopoly", "Ludo"],
  },
  {
    q: "Bao and Ajua both belong to which family of traditional board games?",
    correct: "Mancala-style games played by sowing or moving seeds between pits",
    distractors: ["Card games", "Dice-only games", "Board games with no moving pieces"],
  },
  {
    q: "How do indigenous board games enhance mental relaxation?",
    correct: "They provide a calm, focused, social activity that reduces stress",
    distractors: ["They require no thinking at all", "They are always played alone in silence", "They increase stress through constant competition"],
  },
  {
    q: "Why are games like Bao considered 'indigenous' games?",
    correct: "They originated within, and have long been passed down through, local Kenyan communities",
    distractors: ["They were invented very recently by a toy company", "They are only played outside Kenya", "They were imported from a board game superstore"],
  },
  {
    q: "What can indigenous board games be performed with, for enjoyment, according to the curriculum?",
    correct: "Background music",
    distractors: ["Only complete silence", "Only outdoors at night", "Only during school exams"],
  },
  {
    q: "What is one recognised benefit of playing indigenous board games regularly?",
    correct: "They support mental health by offering relaxation and social connection",
    distractors: ["They have been shown to have no benefits at all", "They only benefit physical fitness, not mental health", "They are only beneficial to young children"],
  },
  {
    q: "In games like Bao and Ajua, what do players typically move between the pits on the board?",
    correct: "Seeds or small counters",
    distractors: ["Playing cards", "Dice", "Coins only"],
  },
];

const TOPICS: { label: string; bucket: "About the Games" | "Mental Health Benefits" }[] = [
  { label: "A mancala-style game played by moving seeds between pits", bucket: "About the Games" },
  { label: "Passed down through generations within local Kenyan communities", bucket: "About the Games" },
  { label: "Players move seeds or small counters between pits on the board", bucket: "About the Games" },
  { label: "Provides a calm, focused, social activity that reduces stress", bucket: "Mental Health Benefits" },
  { label: "Supports mental health through relaxation and social connection", bucket: "Mental Health Benefits" },
  { label: "Can be enjoyed alongside background music", bucket: "Mental Health Benefits" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement into About the Games or Mental Health Benefits.",
  "Which category does each statement below belong to? Sort them.",
  "Classify each statement as About the Games or Mental Health Benefits.",
  "Decide which category each statement fits, and sort it.",
  "Sort these statements by the category they describe.",
] as const;

export const indigenousGames: Skill = {
  id: "cas-indigenous-games",
  code: "C.12",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Kenyan Indigenous Games",
  description: "Types of Kenyan indigenous board games and their value for mental relaxation.",
  generate(rng) {
    const hint = "Kenyan indigenous board games like Bao and Ajua belong to the mancala family and support relaxation.";

    if (rng() < 0.5) {
      const chosen = shuffle(rng, TOPICS);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.label, bucket: t.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "About the Games", label: "About the Games" },
          { id: "Mental Health Benefits", label: "Mental Health Benefits" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((t) => `"${t.label}" belongs to ${t.bucket}.`).join(" "),
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
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
