import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie ", after: " Sie sich?", answer: "fühlen" },
  { before: "Ich fühle mich ", after: ".", answer: "glücklich" },
  { before: "Ich fühle mich ", after: ".", answer: "müde" },
  { before: "Ich habe ", after: ".", answer: "Kopfschmerzen" },
  { before: "Ich brauche ", after: ".", answer: "Wasser" },
  { before: "Ich brauche ", after: ".", answer: "Hilfe" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie fühlen Sie sich", "heute", "?"], sentence: "Wie fühlen Sie sich heute?" },
  { chunks: ["Ich fühle mich", "sehr", "müde", "."], sentence: "Ich fühle mich sehr müde." },
  { chunks: ["Ich habe Kopfschmerzen", "und", "ich brauche Hilfe", "."], sentence: "Ich habe Kopfschmerzen und ich brauche Hilfe." },
  { chunks: ["Ich brauche Wasser,", "bitte", "."], sentence: "Ich brauche Wasser, bitte." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal question for 'How do you feel?'",
    correct: "Wie fühlen Sie sich?",
    distractors: ["Wie fühlst du dich?", "Wie fühlen Sie?", "Wie sich fühlen Sie?"],
    explanation: "The formal reflexive question needs both 'Sie' and the reflexive pronoun 'sich' in the order 'Wie fühlen Sie sich?'.",
  },
  {
    prompt: "Choose the correctly spelled feeling meaning 'scared'.",
    correct: "ängstlich",
    distractors: ["angstlich", "ängslich", "eangstlich"],
    explanation: "The correct spelling keeps the umlaut: 'ängstlich' — dropping it to 'angstlich' is a common misspelling.",
  },
  {
    prompt: "Choose the correct way to say 'I need help' in German.",
    correct: "Ich brauche Hilfe.",
    distractors: ["Ich habe Hilfe.", "Ich brauche Hilfen.", "Ich bin Hilfe."],
    explanation: "'Brauchen' (to need) takes a direct object: 'Ich brauche Hilfe.' — 'haben'/'sein' don't express 'need' here, and 'Hilfe' doesn't pluralize this way.",
  },
  {
    prompt: "Which feeling correctly completes: 'Ich habe Hunger. Ich fühle mich ___.'",
    correct: "hungrig",
    distractors: ["durstig", "müde", "wütend"],
    explanation: "'Hungrig' (hungry) matches 'Ich habe Hunger' (I have hunger) — the other adjectives describe different states.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "glücklich", meaning: "happy" },
  { term: "traurig", meaning: "sad" },
  { term: "müde", meaning: "tired" },
  { term: "hungrig", meaning: "hungry" },
  { term: "durstig", meaning: "thirsty" },
  { term: "wütend", meaning: "angry" },
  { term: "krank", meaning: "sick" },
  { term: "nervös", meaning: "nervous" },
  { term: "ängstlich", meaning: "scared" },
];

export const feelingsWriting: Skill = {
  id: "g8-de-w-feelings",
  code: "W.7",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing about feelings and needs",
  description: "Write formal sentences describing feelings, needs, and complaints.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about feelings or needs.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Wie fühlen Sie sich?' needs both 'Sie' and 'sich'; 'Ich habe'/'Ich brauche' start need-sentences.",
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
        hint: "Check whether the sentence needs 'haben', 'sein', or the reflexive 'sich fühlen'.",
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
        prompt: "Match each German feeling word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'hungrig' and 'durstig' are related needs, but only one means 'thirsty'.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German sentence about feelings or needs.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about how the sentence describes a feeling or a need.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
