import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 2.9 Extensive Reading: Library Skills — selecting a reading text from a collection
// and tracking reading progress for self-assessment. Unlike the other Reading sub-strands, this
// one is genuinely about library/reading-habit skills, not theme vocabulary — built accordingly.

const STEPS: { id: string; label: string }[] = [
  { id: "browse", label: "Browse the shelf or collection of books" },
  { id: "blurb", label: "Read the blurb (the short description on the back cover)" },
  { id: "genre", label: "Check the genre matches what you enjoy" },
  { id: "skim", label: "Skim the first page to check the reading level" },
  { id: "choose", label: "Choose the book and start reading" },
  { id: "log", label: "Record what you read in a reading log" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "reading log", meaning: "a record of what and how much you have read" },
  { term: "skim", meaning: "to read quickly to get the main idea" },
  { term: "browse", meaning: "to look through many books before choosing one" },
  { term: "genre", meaning: "the category or type of a book, e.g. adventure or poetry" },
  { term: "blurb", meaning: "the short description on a book's back cover" },
];

const REASON_ITEMS: { reason: string; bucket: "Good reason" | "Poor reason" }[] = [
  { reason: "The topic genuinely interests me", bucket: "Good reason" },
  { reason: "The reading level feels right for me", bucket: "Good reason" },
  { reason: "A friend recommended it and explained why", bucket: "Good reason" },
  { reason: "It has the most pages of any book on the shelf", bucket: "Poor reason" },
  { reason: "It has a colourful cover, even though the blurb doesn't interest me", bucket: "Poor reason" },
  { reason: "It is the very first book I touched, without looking at any others", bucket: "Poor reason" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Amina wants to choose a good book for herself in the library. What should she check first?",
    correct: "The blurb and genre, to see if the book interests her",
    distractors: ["Only how many pages it has", "Only how colourful the cover is", "Whether it is the newest book on the shelf"],
    explanation: "A good book choice starts with checking the blurb and genre, not the cover or page count.",
  },
  {
    q: "Why is a reading log useful?",
    correct: "It helps you track and reflect on how much you have read over time",
    distractors: ["It tells you which books are the most expensive", "It replaces the need to actually read the book", "It is only useful for teachers, not students"],
    explanation: "A reading log is a self-assessment tool — it records what and how much you've read so you can track your own progress.",
  },
  {
    q: "Juma picks a book only because it has the thickest cover, without reading the blurb. What is the risk?",
    correct: "He might choose a book that doesn't actually interest him or match his reading level",
    distractors: ["There is no risk — thicker books are always better", "The book will automatically be too easy", "He will finish it faster than a thin book"],
    explanation: "Choosing by page count alone ignores whether the content and reading level are actually a good fit.",
  },
];

export const gettingAroundReading: Skill = {
  id: "g7-ar-r-getting-around",
  code: "R.9",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Extensive reading: library skills",
  description: "Practise the skills of selecting a good reading text and tracking your own reading progress.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, REASON_ITEMS);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.reason }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each reason for choosing a book as a Good reason or a Poor reason.",
        items,
        buckets: [
          { id: "Good reason", label: "Good reason" },
          { id: "Poor reason", label: "Poor reason" },
        ],
        correctBucket,
        hint: "A good reason connects to whether the book actually interests you and fits your reading level, not its appearance or size alone.",
        explanation: chosen.map((r) => `"${r.reason}" is a ${r.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each library-skills term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'Skim' and 'browse' are both quick actions, but one is about a whole page, the other about a whole shelf.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const items = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for selecting and starting a new book in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: STEPS.map((s) => s.id),
        hint: "Start broad (browsing many books), then narrow down (blurb, genre, reading level), then commit and track.",
        explanation: STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill-blank") {
      const term = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: `Fill in the term: ${term.meaning}.`,
        before: "The library-skills term for this is ",
        after: ".",
        correctAnswer: term.term,
        inputMode: "text",
        hint: "Reread the definition carefully — it names the exact skill or item.",
        explanation: `"${term.term}" means "${term.meaning}".`,
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
      hint: "Think about what makes a book choice genuinely good, not just quick or eye-catching.",
      explanation: q.explanation,
    };
  },
};
