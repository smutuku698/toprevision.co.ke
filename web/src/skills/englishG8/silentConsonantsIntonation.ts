import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SILENT_WORDS: { word: string; silent: string; clue: string }[] = [
  { word: "knife", silent: "k", clue: "a sharp tool used for cutting food" },
  { word: "climb", silent: "b", clue: "to move up something, such as a mountain" },
  { word: "listen", silent: "t", clue: "to pay attention with your ears" },
  { word: "honest", silent: "h", clue: "truthful and sincere" },
  { word: "island", silent: "s", clue: "a piece of land surrounded by water" },
  { word: "castle", silent: "t", clue: "a large fortified building, often with towers" },
  { word: "wrist", silent: "w", clue: "the joint that connects the hand to the arm" },
  { word: "whistle", silent: "t", clue: "the small object a referee blows to stop a match" },
  { word: "sign", silent: "g", clue: "a board or gesture that gives information" },
  { word: "comb", silent: "b", clue: "a tool used to arrange your hair" },
];

const DECLARATIVE = [
  "The athlete trained every morning before the Olympics.",
  "Kenya has won many medals in long-distance running.",
  "The stadium was built for the competition.",
  "The relay team practised their baton exchange for weeks.",
  "The Olympic Games take place every four years.",
];

const EXCLAMATORY = [
  "What a thrilling final that was!",
  "How fast she ran!",
  "That was an incredible jump!",
  "What a magnificent victory for the team!",
  "How amazing the closing ceremony was!",
];

const FILL_ITEMS = [
  { before: "The referee blew the", after: "to stop the match. (It has a silent \"t\".)", correctAnswer: "whistle" },
  { before: "A sharp tool used for cutting food is called a", after: ". (It has a silent \"k\".)", correctAnswer: "knife" },
  { before: "To move up something, such as a mountain, is to", after: ". (It has a silent \"b\".)", correctAnswer: "climb" },
  { before: "The joint that connects your hand to your arm is your", after: ". (It has a silent \"w\".)", correctAnswer: "wrist" },
  { before: "A piece of land completely surrounded by water is an", after: ". (It has a silent \"s\".)", correctAnswer: "island" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should we use the right intonation when speaking?",
    correct: "Because it helps convey the intended meaning and emotion accurately to the listener",
    distractors: ["Because it changes the spelling of the words being spoken", "Because it makes speech shorter", "Intonation has no real effect on meaning"],
  },
  {
    q: "Which type of sentence typically uses a strong, excited tone to show emotion?",
    correct: "An exclamatory sentence",
    distractors: ["A declarative sentence", "A sentence with no punctuation", "Any sentence spoken very quietly"],
  },
  {
    q: "What is the typical intonation pattern of a declarative sentence?",
    correct: "The pitch falls gently towards the end of the sentence",
    distractors: ["The pitch rises sharply at the end, like a question", "The pitch stays completely flat throughout", "The pitch rises and falls randomly"],
  },
];

export const silentConsonantsIntonation: Skill = {
  id: "g8-eng-ls-silent-consonants-intonation",
  code: "LS.14",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Pronunciation and Intonation: Silent Consonants",
  description: "Identify silent consonant letters in words and use correct intonation in declarative and exclamatory sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc"] as const);
    const hint = "A silent letter is written but not pronounced; a declarative sentence falls gently in pitch, while an exclamatory sentence rises with strong feeling.";

    if (branch === "match") {
      const chosen = shuffle(rng, SILENT_WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: `Silent letter "${w.silent}"` })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Match each word to its silent letter.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((w) => `"${w.word}" has a silent letter "${w.silent}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const declarative = shuffle(rng, DECLARATIVE).slice(0, 3);
      const exclamatory = shuffle(rng, EXCLAMATORY).slice(0, 3);
      const items = shuffle(rng, [
        ...declarative.map((label) => ({ id: label, label, bucket: "declarative" })),
        ...exclamatory.map((label) => ({ id: label, label, bucket: "exclamatory" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each sentence into Declarative or Exclamatory.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "declarative", label: "Declarative" },
          { id: "exclamatory", label: "Exclamatory" },
        ],
        correctBucket,
        hint: "Declarative sentences simply state a fact; exclamatory sentences express strong feeling, often ending with an exclamation mark.",
        explanation: `Declarative: ${declarative.join(" / ")}. Exclamatory: ${exclamatory.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word based on its clue.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "The bracketed note tells you which letter in the word is silent.",
        explanation: `The word is "${entry.correctAnswer}".`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
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
