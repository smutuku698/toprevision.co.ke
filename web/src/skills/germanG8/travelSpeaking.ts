import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const ANIMALS: { word: string; meaning: string }[] = [
  { word: "der Löwe", meaning: "the lion" },
  { word: "der Elefant", meaning: "the elephant" },
  { word: "die Schlange", meaning: "the snake" },
  { word: "der Affe", meaning: "the monkey" },
  { word: "das Zebra", meaning: "the zebra" },
  { word: "die Giraffe", meaning: "the giraffe" },
  { word: "der Tiger", meaning: "the tiger" },
];

const IMPERATIVES: { phrase: string; meaning: string }[] = [
  { phrase: "Beobachten Sie die Tiere ruhig!", meaning: "Observe the animals calmly!" },
  { phrase: "Bleiben Sie im Auto!", meaning: "Stay in the car!" },
  { phrase: "Machen Sie keinen Lärm!", meaning: "Don't make any noise!" },
  { phrase: "Fotografieren Sie den Löwen!", meaning: "Photograph the lion!" },
];

const DECLARATIVES: string[] = [
  "Der Löwe ist hier.",
  "Die Giraffe ist da.",
  "Der Affe ist da.",
  "Das Zebra ist hier.",
  "Der Tiger ist hier.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " Sie die Tiere ruhig!", answer: "Beobachten" },
  { before: "Bleiben Sie im ", after: "!", answer: "Auto" },
  { before: "Machen Sie keinen ", after: "!", answer: "Lärm" },
  { before: "Fotografieren Sie den ", after: "!", answer: "Löwen" },
  { before: "Wohin gehen wir ", after: "?", answer: "denn" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Beobachten Sie", "die Tiere", "ruhig", "!"], sentence: "Beobachten Sie die Tiere ruhig!" },
  { chunks: ["Bleiben Sie", "im Auto", "!"], sentence: "Bleiben Sie im Auto!" },
  { chunks: ["Fotografieren Sie", "den Löwen", "!"], sentence: "Fotografieren Sie den Löwen!" },
  { chunks: ["Wohin", "gehen wir", "denn", "?"], sentence: "Wohin gehen wir denn?" },
];

export const travelSpeaking: Skill = {
  id: "g8-de-ls-travel",
  code: "LS.5",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Safari and travel",
  description: "Give and understand formal safari instructions in the imperative mood, and name wild animals in German.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const imperative = shuffle(rng, IMPERATIVES).slice(0, 4).map((i) => i.phrase);
      const declarative = shuffle(rng, DECLARATIVES).slice(0, 3);
      const items = shuffle(rng, [...imperative, ...declarative]);
      const correctBucket: Record<string, string> = {};
      for (const s of imperative) correctBucket[s] = "imperative";
      for (const s of declarative) correctBucket[s] = "declarative";

      return {
        kind: "categorize",
        prompt: "Sort each sentence as an Imperative command (giving an order) or a Declarative statement (describing a fact).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "imperative", label: "Imperative (command)" },
          { id: "declarative", label: "Declarative (statement)" },
        ],
        correctBucket,
        hint: "Imperative sentences give a command and start with the verb+Sie; declarative sentences describe a fact with 'ist'.",
        explanation: `Imperative: ${imperative.join(" / ")}. Declarative: ${declarative.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German safari sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Safari instructions use the formal Sie-Form imperative (verb+en Sie ...).",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German imperative sentence about a safari.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal imperative sentences start directly with the verb, followed by 'Sie'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const imp = randChoice(rng, IMPERATIVES);
      const distractors = shuffle(rng, IMPERATIVES.filter((i) => i.phrase !== imp.phrase)).map((i) => i.meaning);
      const choices = shuffle(rng, [imp.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Was bedeutet "${imp.phrase}" auf Englisch?`,
        choices,
        correctIndex: choices.indexOf(imp.meaning),
        layout: "list",
        hint: "Match the command verb (Beobachten, Bleiben, Machen, Fotografieren) to its meaning.",
        explanation: `"${imp.phrase}" means "${imp.meaning}".`,
      };
    }

    const chosen = shuffle(rng, ANIMALS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
    const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.meaning })));
    const correctMap: Record<string, string> = {};
    for (const a of chosen) correctMap[a.word] = a.word;

    return {
      kind: "click-match",
      prompt: "Match each German wild animal word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Der Löwe' is a lion, while 'der Affe' is a monkey.",
      explanation: chosen.map((a) => `"${a.word}" means "${a.meaning}".`).join(" "),
    };
  },
};
