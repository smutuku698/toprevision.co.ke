import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " Sie die Tiere ruhig!", answer: "Beobachten" },
  { before: "", after: " Sie im Auto!", answer: "Bleiben" },
  { before: "", after: " Sie keinen Lärm!", answer: "Machen" },
  { before: "", after: " Sie den Löwen!", answer: "Fotografieren" },
  { before: "Wohin fahren wir ", after: "?", answer: "denn" },
  { before: "Wohin gehen wir ", after: "?", answer: "denn" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Beobachten Sie", "die Tiere", "ruhig", "!"], sentence: "Beobachten Sie die Tiere ruhig!" },
  { chunks: ["Bleiben Sie", "im Auto", "!"], sentence: "Bleiben Sie im Auto!" },
  { chunks: ["Fotografieren Sie", "den Löwen", "!"], sentence: "Fotografieren Sie den Löwen!" },
  { chunks: ["Wohin fahren wir", "denn", "?"], sentence: "Wohin fahren wir denn?" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal imperative for 'Stay in the car!'",
    correct: "Bleiben Sie im Auto!",
    distractors: ["Bleib im Auto!", "Bleiben im Auto Sie!", "Bleibt im Auto!"],
    explanation: "The formal imperative places 'Sie' directly after the verb: 'Bleiben Sie ...'; 'Bleib' is the informal 'du'-imperative.",
  },
  {
    prompt: "Choose the correct formal imperative for 'Don't make any noise!'",
    correct: "Machen Sie keinen Lärm!",
    distractors: ["Macht keinen Lärm!", "Machen Sie kein Lärm!", "Sie machen keinen Lärm!"],
    explanation: "'Lärm' is masculine, so 'no noise' is accusative 'keinen Lärm'; the formal imperative also needs 'Machen Sie', not 'Sie machen'.",
  },
  {
    prompt: "What does the particle 'denn' add to the question 'Wohin gehen wir denn?'",
    correct: "curiosity/interest, roughly 'So where are we going?'",
    distractors: ["a negative meaning", "a past-tense meaning", "a formal command"],
    explanation: "'Denn' has no direct English translation — it softens or adds curiosity to a question, roughly like adding 'so' in English.",
  },
  {
    prompt: "Choose the correct formal imperative for 'Photograph the lion!'",
    correct: "Fotografieren Sie den Löwen!",
    distractors: ["Fotografieren Sie der Löwe!", "Fotografiert den Löwen!", "Sie fotografieren den Löwen!"],
    explanation: "'Der Löwe' becomes accusative 'den Löwen' as the direct object, and the formal imperative order is 'Fotografieren Sie ...'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "der Löwe", meaning: "lion" },
  { term: "der Elefant", meaning: "elephant" },
  { term: "die Schlange", meaning: "snake" },
  { term: "der Affe", meaning: "monkey" },
  { term: "das Zebra", meaning: "zebra" },
  { term: "die Giraffe", meaning: "giraffe" },
  { term: "der Tiger", meaning: "tiger" },
  { term: "der Zoo", meaning: "zoo" },
  { term: "der Nationalpark", meaning: "national park" },
  { term: "die Safari", meaning: "safari" },
];

export const travelWriting: Skill = {
  id: "g8-de-w-travel",
  code: "W.5",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing safari and travel instructions",
  description: "Write formal imperative instructions for a safari trip and match wild-animal vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct formal safari instruction or question.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal imperatives start with the verb, then 'Sie'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Formal imperative instructions put the verb first, then 'Sie'.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each German safari/animal word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'der Affe' and 'der Löwe' are both animals, but only one climbs trees.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German safari sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the safari instruction and think of the formal imperative verb, or the particle 'denn'.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
