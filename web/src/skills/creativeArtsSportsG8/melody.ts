import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GROUP_ITEMS: { label: string; bucket: "question" | "answer" | "repetition"; reason: string }[] = [
  { label: "Sounds incomplete, as if asking something", bucket: "question", reason: "This describes a question phrase — it sounds unfinished, prompting a response." },
  { label: "Usually the opening 2 bars of a phrase pair", bucket: "question", reason: "This describes a question phrase — it is typically the first half of a phrase pair." },
  { label: "Sounds resolved, as if giving a reply", bucket: "answer", reason: "This describes an answer phrase — it resolves the question phrase that came before it." },
  { label: "Usually the closing 2 bars of a phrase pair", bucket: "answer", reason: "This describes an answer phrase — it typically completes the second half of a phrase pair." },
  { label: "Repeating a melodic idea exactly, note for note", bucket: "repetition", reason: "This is exact repetition — the melody idea is copied precisely." },
  { label: "Repeating a melodic idea with small changes", bucket: "repetition", reason: "This is varied repetition — the melody idea returns but is altered slightly to stay interesting." },
];

const TERMS = [
  { id: "question", label: "Question phrase", meaning: "A musical statement that sounds unfinished, prompting an answering phrase" },
  { id: "answer", label: "Answer phrase", meaning: "A musical statement that resolves the question phrase that came before it" },
  { id: "exact-rep", label: "Exact repetition", meaning: "Repeating a melodic idea precisely, note for note" },
  { id: "varied-rep", label: "Varied repetition", meaning: "Repeating a melodic idea with small changes, so it stays recognisable but not identical" },
  { id: "g-major-melody", label: "Melody in G major", meaning: "A melody built using the notes of the G major scale, which has one sharp (F sharp)" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What is a 'question and answer' phrase structure in melody writing?", correct: "An opening phrase that sounds unfinished, followed by a phrase that resolves it", distractors: ["Two identical phrases played one after another with no change", "A single long phrase with no internal structure", "A phrase played only on the recorder, never sung"] },
  { q: "How does varied repetition extend a melody, compared to exact repetition?", correct: "It keeps the melody recognisable while introducing small changes to hold the listener's interest", distractors: ["It removes the original melodic idea entirely", "It is identical in every way to exact repetition", "It only works in 4/4 time, never in 3/4"] },
  { q: "What defines a 4-bar melody written in G major?", correct: "A melody spanning four bars, built from the notes of the G major scale (one sharp, F sharp)", distractors: ["A melody with no fixed number of bars", "A melody that avoids all sharps and flats", "A melody that must use exactly four different notes"] },
  { q: "Why do composers value the use of melody in Creative Arts and Sports?", correct: "Melody carries the main musical idea and helps make a piece memorable and expressive", distractors: ["Melody has no real effect on how a piece is remembered", "Melody is only used in written notation, never performed", "Melody matters only in sport, not in music"] },
  { q: "What typically happens at the end of an answer phrase, compared to a question phrase?", correct: "The answer phrase feels resolved, while the question phrase feels open or incomplete", distractors: ["Both phrases always feel equally unresolved", "The question phrase always feels more resolved than the answer", "There is no audible difference between the two"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into Question phrase, Answer phrase, or Repetition technique.",
  "Which category does each description below belong to? Sort them.",
  "Classify each description as Question phrase, Answer phrase, or Repetition technique.",
  "Decide which category each description fits, and sort it.",
  "Sort these descriptions by the melody-writing category they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each melody-writing term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each melody-writing term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about melody-writing terms.",
  "Fill in the missing word about melody-writing terms.",
  "Complete this sentence about phrase structure.",
  "Fill in the blank about melody-writing terms.",
  "Complete the sentence with the correct word.",
] as const;

export const melody: Skill = {
  id: "g8-cas-melody",
  code: "C.4",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Melody",
  description: "Question-and-answer phrases, extending a melody through exact or varied repetition, and 4-bar melodies in G major.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "fill-blank", "theory-mc"] as const);

    if (branch === "categorize") {
      const questionPicks = GROUP_ITEMS.filter((g) => g.bucket === "question");
      const answerPicks = GROUP_ITEMS.filter((g) => g.bucket === "answer");
      const repetitionPicks = GROUP_ITEMS.filter((g) => g.bucket === "repetition");
      const items = shuffle(rng, [...questionPicks, ...answerPicks, ...repetitionPicks]);
      const correctBucket: Record<string, string> = {};
      for (const g of items) correctBucket[g.label] = g.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((g) => ({ id: g.label, label: g.label })),
        buckets: [
          { id: "question", label: "Question phrase" },
          { id: "answer", label: "Answer phrase" },
          { id: "repetition", label: "Repetition technique" },
        ],
        correctBucket,
        hint: "A question phrase sounds unfinished; an answer phrase resolves it; repetition can be exact or varied.",
        explanation: items.map((g) => g.reason).join(" "),
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Question phrases sound open; answer phrases resolve them; repetition can be exact or varied.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const isQuestion = rng() < 0.5;
      const word = isQuestion ? "question" : "answer";
      const description = isQuestion
        ? "sounds unfinished and prompts a response"
        : "resolves the phrase that came before it";
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: `A ___ phrase`,
        after: `is a musical statement that ${description}.`,
        correctAnswer: word,
        inputMode: "text",
        hint: "One phrase opens and sounds incomplete; the other closes and resolves it.",
        explanation: `A ${word} phrase ${description}.`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Question phrases sound open, answer phrases resolve them, and repetition can be exact or varied.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
