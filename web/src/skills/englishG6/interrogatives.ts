import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./grammarSharedA";

type Interrogative = "who" | "whom" | "whose" | "what" | "which" | "when" | "where" | "why" | "how";
const MEANINGS: Record<Interrogative, string> = {
  who: "asks about a person doing the action",
  whom: "asks about a person receiving the action (formal object form)",
  whose: "asks about ownership or possession",
  what: "asks about a thing, action, or idea",
  which: "asks someone to choose among specific options",
  when: "asks about time",
  where: "asks about place or location",
  why: "asks about a reason",
  how: "asks about manner, method, or process",
};

// wh- words that look like interrogatives but are not — used for the real-vs-fake categorize branch.
const NON_INTERROGATIVES = ["whip", "whisper", "while", "white", "whole", "wharf", "wheat", "wheel"];

// 27 sports/indoor-games-themed sentences (3 per interrogative), per the source sub-strand's theme.
type Item = { word: Interrogative; sentence: (n: string) => string };
const ITEMS: Item[] = [
  { word: "who", sentence: () => `___ won the chess tournament at the sports club?` },
  { word: "who", sentence: () => `___ is the front runner in the swimming lane today?` },
  { word: "who", sentence: (n) => `___ taught ${n} how to play table tennis?` },
  { word: "whom", sentence: () => `___ did the coach select for the netball team?` },
  { word: "whom", sentence: (n) => `To ___ did ${n} give the trophy after the match?` },
  { word: "whom", sentence: () => `___ should we thank for organising the chess club?` },
  { word: "whose", sentence: () => `___ paddle is this on the table tennis table?` },
  { word: "whose", sentence: () => `___ turn is it to roll the dice in monopoly?` },
  { word: "whose", sentence: (n) => `___ badminton racket did ${n} borrow for the match?` },
  { word: "what", sentence: (n) => `___ indoor game does ${n} enjoy playing most?` },
  { word: "what", sentence: () => `___ happened at the end of the chess tournament?` },
  { word: "what", sentence: () => `___ is the score in today's netball match?` },
  { word: "which", sentence: () => `___ game would you rather play, chess or monopoly?` },
  { word: "which", sentence: (n) => `___ lane is ${n} swimming in during the gala?` },
  { word: "which", sentence: () => `___ team won the draw at the sports arena?` },
  { word: "when", sentence: () => `___ does the badminton tournament begin?` },
  { word: "when", sentence: (n) => `___ did ${n} join the wrestling club?` },
  { word: "when", sentence: () => `___ is the next chess competition at the gymnasium?` },
  { word: "where", sentence: () => `___ is the card room located in the stadium?` },
  { word: "where", sentence: (n) => `___ did ${n} learn to play table tennis?` },
  { word: "where", sentence: () => `___ will the indoor games be hosted this year?` },
  { word: "why", sentence: (n) => `___ did ${n} choose swimming as a hobby?` },
  { word: "why", sentence: () => `___ was the boxing match postponed?` },
  { word: "why", sentence: () => `___ does the coach prefer netball over basketball?` },
  { word: "how", sentence: (n) => `___ did ${n} become the front runner in the tournament?` },
  { word: "how", sentence: () => `___ do you play monopoly correctly?` },
  { word: "how", sentence: () => `___ does one improve at table tennis?` },
];

const FILL_PROMPTS = [
  "Complete the sentence with the correct interrogative word.",
  "Fill in the blank with the interrogative that best fits this sentence.",
  "Which question word correctly completes this sentence?",
  "Choose the right interrogative to complete the sentence below.",
  "Supply the missing interrogative word in this sentence.",
];

const MC_PROMPTS = [
  "Which interrogative correctly completes this sentence?",
  "Pick the interrogative word that best fits this question.",
  "Select the correct question word for this sentence.",
  "Which of these interrogatives belongs in the blank below?",
  "Choose the interrogative that makes this sentence correct.",
];

const CATEGORIZE_PROMPTS = [
  "Sort these words: is each one an INTERROGATIVE, or NOT an interrogative?",
  "Some of these words look like question words but are not. Sort them correctly.",
  "Decide whether each word is a true interrogative or just looks like one.",
  "Sort each word into the correct group: interrogative, or not an interrogative.",
  "Which of these words are used to ask questions, and which are not?",
];

export const interrogatives: Skill = {
  id: "g6-eng-grammar-interrogatives",
  code: "G.11",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Interrogatives",
  description: "Identify and use the interrogatives who, whom, whose, what, which, when, where, why and how correctly in sentences about indoor games and sports.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-choose", "categorize-real-fake", "click-match-meaning", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before,
        after,
        correctAnswer: item.word,
        inputMode: "text",
        hint: `This interrogative ${MEANINGS[item.word]}.`,
        explanation: `"${cap(item.word)}" is correct — it ${MEANINGS[item.word]}.`,
      };
    }

    if (branch === "mc-choose") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const wrongPool = (Object.keys(MEANINGS) as Interrogative[]).filter((k) => k !== item.word);
      const distractors = shuffle(rng, wrongPool).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_PROMPTS)}\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: `Think about what kind of information the sentence is asking for.`,
        explanation: `"${cap(item.word)}" is correct — it ${MEANINGS[item.word]}.`,
      };
    }

    if (branch === "categorize-real-fake") {
      const pool = shuffle(rng, [
        ...(Object.keys(MEANINGS) as Interrogative[]).map((w) => ({ id: w, label: w, isReal: true })),
        ...NON_INTERROGATIVES.map((w) => ({ id: w, label: w, isReal: false })),
      ]).slice(0, 10);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.isReal ? "interrogative" : "not-interrogative";
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "interrogative", label: "Interrogative Word" },
          { id: "not-interrogative", label: "Not an Interrogative" },
        ],
        correctBucket,
        hint: "Interrogatives are used to ask questions: who, whom, whose, what, which, when, where, why, how.",
        explanation: `Interrogatives: ${(Object.keys(MEANINGS) as Interrogative[]).join(", ")}. These other words only look similar but are not used to ask questions.`,
      };
    }

    if (branch === "click-match-meaning") {
      const pool = shuffle(rng, Object.keys(MEANINGS) as Interrogative[]).slice(0, 6);
      const tokens = shuffle(rng, pool.map((w) => ({ id: w, label: w })));
      const targets = shuffle(rng, pool.map((w) => ({ id: w, label: MEANINGS[w] })));
      const correctMap: Record<string, string> = {};
      for (const w of pool) correctMap[w] = w;
      return {
        kind: "click-match",
        prompt: "Match each interrogative to what it asks about.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these have close meanings — read carefully before matching.",
        explanation: pool.map((w) => `"${w}" ${MEANINGS[w]}.`).join(" "),
      };
    }

    const item = randChoice(rng, ITEMS);
    const name = randChoice(rng, KENYAN_NAMES);
    const full = item.sentence(name).replace("___", cap(item.word)).replace("?", "");
    const words = full.trim().split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct question.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `The interrogative "${item.word}" comes first in this question.`,
      explanation: `The correct sentence is: "${full.trim()}?"`,
    };
  },
};
