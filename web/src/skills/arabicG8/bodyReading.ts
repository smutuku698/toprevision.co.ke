import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// This sub-strand's SLO is Extensive Reading (selecting appropriate reading
// materials, building a reading habit/reading log, recommending materials to
// peers) rather than passage comprehension, so there is no dialogue/passage here.

const SOURCES: { label: string; bucket: "Digital" | "Non-digital" }[] = [
  { label: "An e-book", bucket: "Digital" },
  { label: "A website article", bucket: "Digital" },
  { label: "An audiobook app", bucket: "Digital" },
  { label: "A kitaab (book)", bucket: "Non-digital" },
  { label: "A majalla (magazine)", bucket: "Non-digital" },
  { label: "A jareeda (newspaper)", bucket: "Non-digital" },
];

const HABIT_STEPS = [
  "Choose a book that interests you",
  "Set a daily reading time",
  "Write the title and date in your reading log",
  "Recommend a favorite book to a friend",
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "For the latest local news, you should read a...",
    correct: "jareeda (newspaper)",
    distractors: ["kitaab (book)", "majalla (magazine)", "qissa (story)"],
    explanation: "A jareeda (newspaper) reports the latest news.",
  },
  {
    q: "To read a fictional tale with characters and a plot, you should choose a...",
    correct: "qissa (story)",
    distractors: ["jareeda (newspaper)", "majalla (magazine)", "a dictionary"],
    explanation: "A qissa (story) is a fictional tale.",
  },
  {
    q: "A periodical with articles and pictures on many topics is called a...",
    correct: "majalla (magazine)",
    distractors: ["jareeda (newspaper)", "qissa (story)", "kitaab (book)"],
    explanation: "A majalla (magazine) is published periodically with articles and pictures on many topics.",
  },
  {
    q: "A single bound work you read cover to cover, fiction or non-fiction, is called a...",
    correct: "kitaab (book)",
    distractors: ["jareeda (newspaper)", "majalla (magazine)", "an audiobook app only"],
    explanation: "A kitaab (book) is a complete bound written work.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "kitaab", meaning: "book" },
  { phrase: "majalla", meaning: "magazine" },
  { phrase: "jareeda", meaning: "newspaper" },
  { phrase: "qissa", meaning: "story" },
];

export const bodyReading: Skill = {
  id: "g8-ar-r-body",
  code: "R.7",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Extensive reading: choosing what to read",
  description: "Practice choosing appropriate reading materials, building a reading habit, and recommending books to peers.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = SOURCES.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each reading source as Digital or Non-digital.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Digital", label: "Digital" },
          { id: "Non-digital", label: "Non-digital" },
        ],
        correctBucket,
        hint: "Digital sources are read on a screen; non-digital sources are printed on paper.",
        explanation: SOURCES.map((s) => `"${s.label}" is a ${s.bucket.toLowerCase()} source.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        prompt: "Match each Arabic reading-material word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the kind of reading material each word names.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = HABIT_STEPS.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        prompt: "Put these steps for building a good reading habit in the correct order.",
        instruction: "Click the steps in the correct order.",
        items,
        correctOrder,
        hint: "First pick a book, then make time for it, then log it, then share it.",
        explanation: `The correct order is:\n${HABIT_STEPS.join("\n")}`,
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
      hint: "Think about what each type of reading material is best used for.",
      explanation: q.explanation,
    };
  },
};
