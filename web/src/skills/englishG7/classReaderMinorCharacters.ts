import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Old Mzee Barasa had guarded the Kakamega forest for forty years, teaching his granddaughter Naliaka the names of every tree that could heal a fever or feed a hungry traveller. Naliaka's classmate Otieno, who dreamed of selling timber for quick money, mocked her for spending weekends pulling weeds instead of watching football. When loggers arrived one morning with chainsaws and false permits, it was Otieno, ashamed of his earlier mockery, who ran to alert the forest rangers before the trees could be cut. Naliaka forgave him instantly, and the two now patrol the forest edge together every Saturday, with Mzee Barasa watching proudly from his porch.";

const CHARACTER_TYPES: { name: string; category: "main" | "minor" }[] = [
  { name: "Naliaka", category: "main" },
  { name: "Mzee Barasa", category: "minor" },
  { name: "Otieno", category: "minor" },
  { name: "The loggers", category: "minor" },
];

const RELATIONSHIP_MATCH: { pairLabel: string; relationship: string }[] = [
  { pairLabel: "Naliaka and Mzee Barasa", relationship: "Family and mentor — her grandfather teaches her about the forest" },
  { pairLabel: "Naliaka and Otieno (at the start)", relationship: "Rivals — Otieno mocks Naliaka's forest work" },
  { pairLabel: "Naliaka and Otieno (by the end)", relationship: "Allies — they patrol the forest together" },
];

const RELATIONSHIP_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What best describes the relationship between Naliaka and Otieno by the end of the excerpt?",
    correct: "They move from being rivals who mock each other to allies who work together",
    distractors: [
      "They remain strangers who never speak to one another",
      "They are family members related by blood",
      "They stay enemies and never reconcile",
    ],
    explanation: "Otieno starts by mocking Naliaka, but after alerting the rangers he is forgiven, and the two 'now patrol the forest edge together every Saturday' — showing a shift from rivalry to alliance.",
  },
];

const ACTION_EFFECT_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What effect did Otieno's decision to alert the forest rangers have on the story?",
    correct: "It stopped the loggers from cutting the trees and led to his friendship with Naliaka",
    distractors: [
      "It caused the loggers to succeed in cutting down the forest",
      "It made Mzee Barasa angry at both Naliaka and Otieno",
      "It had no real effect on how the story ended",
    ],
    explanation: "Otieno's warning brings the rangers before the trees are cut, and this act of responsibility is what earns him Naliaka's forgiveness and friendship.",
  },
];

const APPRECIATE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why are minor characters like Otieno and Mzee Barasa important in this class reader, even though the story centres on Naliaka?",
    correct: "They shape Naliaka's choices and help move the plot forward through their own actions",
    distractors: [
      "They are unnecessary and could be removed without changing the story",
      "They exist only to make the story longer",
      "They have no influence on what happens to the main character",
    ],
    explanation: "Mzee Barasa's teaching shapes Naliaka's values, and Otieno's warning changes the story's outcome — minor characters actively influence the plot around the main character.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Old Mzee Barasa had guarded the Kakamega forest for forty", after: ", teaching his granddaughter Naliaka the names of every tree.", correctAnswer: "years" },
  { before: "it was Otieno, ashamed of his earlier mockery, who ran to alert the forest", after: "before the trees could be cut.", correctAnswer: "rangers" },
  { before: "the two now patrol the forest edge together every", after: ", with Mzee Barasa watching proudly from his porch.", correctAnswer: "Saturday" },
];

export const classReaderMinorCharacters: Skill = {
  id: "g7-eng-r-class-reader-minor-characters",
  code: "R.22",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Characters in Class Readers",
  description: "Distinguish minor characters from main characters, discuss the relationships between them, and appreciate the place of minor characters in a class reader.",
  generate(rng) {
    const branch = randChoice(rng, ["distinguish", "relationship", "match", "action-effect", "fill", "appreciate"] as const);
    const hint = "The main character is who the story follows most closely; minor characters support, challenge, or help them along the way.";

    if (branch === "distinguish") {
      const chosen = shuffle(rng, CHARACTER_TYPES);
      const items = chosen.map((c) => ({ id: c.name, label: c.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.name] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each character as either the Main Character or a Minor Character in this excerpt.",
        passage: STORY,
        items,
        buckets: [
          { id: "main", label: "Main Character" },
          { id: "minor", label: "Minor Character" },
        ],
        correctBucket,
        hint: "The story centres on Naliaka's actions and choices; everyone else supports or affects her story.",
        explanation: chosen.map((c) => `${c.name} is ${c.category === "main" ? "the main character" : "a minor character"}.`).join(" "),
      };
    }

    if (branch === "relationship") {
      const entry = randChoice(rng, RELATIONSHIP_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, RELATIONSHIP_MATCH.map((p, i) => ({ id: `p${i}`, label: p.pairLabel })));
      const targets = shuffle(rng, RELATIONSHIP_MATCH.map((p, i) => ({ id: `p${i}`, label: p.relationship })));
      const correctMap: Record<string, string> = {};
      RELATIONSHIP_MATCH.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each pair of characters to the relationship between them.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: RELATIONSHIP_MATCH.map((p) => `${p.pairLabel} — ${p.relationship.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "action-effect") {
      const entry = randChoice(rng, ACTION_EFFECT_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what changed in the story right after Otieno made his decision.",
        explanation: entry.explanation,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, APPRECIATE_MC);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: STORY,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
