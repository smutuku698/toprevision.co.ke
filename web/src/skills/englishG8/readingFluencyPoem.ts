import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FLUENCY_COMPONENTS: { name: string; meaning: string }[] = [
  { name: "Accuracy", meaning: "Reading the words correctly, without mistakes or skipped words" },
  { name: "Expression", meaning: "Changing your tone and emphasis to match the meaning and feeling of a line" },
  { name: "Pace", meaning: "Reading at a steady, natural speed — not too fast and not too slow" },
  { name: "Phrasing", meaning: "Grouping words into short, meaningful chunks instead of reading word by word" },
  { name: "Self-correction", meaning: "Noticing and fixing a mistake while reading, without help from someone else" },
];

const HABITS: { text: string; fluent: boolean }[] = [
  { text: "Reading smoothly in phrases that match a line's meaning", fluent: true },
  { text: "Changing tone at a question mark or an exclamation point", fluent: true },
  { text: "Correcting a misread word right away, then continuing", fluent: true },
  { text: "Reading at a pace the listener can easily follow", fluent: true },
  { text: "Reading every word in a flat, monotone voice", fluent: false },
  { text: "Pausing awkwardly after almost every single word", fluent: false },
  { text: "Reading so fast that words are skipped or slurred", fluent: false },
  { text: "Ignoring punctuation marks such as commas and line breaks", fluent: false },
];

const READ_ALOUD_STEPS = [
  { id: "preview", label: "Preview the poem silently before reading it aloud" },
  { id: "phrase", label: "Group the words into short, meaningful phrases" },
  { id: "pace", label: "Read at a steady pace that matches natural speech" },
  { id: "expression", label: "Use your tone and expression to match the poem's meaning" },
  { id: "correct", label: "Notice and correct any mistakes as you go" },
];

const FILL_ITEMS = [
  { before: "Grouping words into short, meaningful chunks instead of reading word by word is called", after: ".", correctAnswer: "phrasing" },
  { before: "Reading the words correctly, without mistakes or skipped words, is called", after: ".", correctAnswer: "accuracy" },
  { before: "Noticing and fixing your own mistake while reading, without help, is called", after: ".", correctAnswer: "self-correction" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should we display appropriate expressions when reading a text?",
    correct: "To help the listener understand the feeling and meaning behind the words",
    distractors: ["To make the reading finish more quickly", "Because expression has no real effect on listeners", "To avoid reading any of the punctuation marks"],
  },
  {
    q: "A reader races through a poem so fast that several words are skipped. Which fluency technique are they missing?",
    correct: "Accuracy and an appropriate pace",
    distractors: ["Self-correction only", "Loudness only", "Handwriting neatness"],
  },
  {
    q: "Why is fluency important when reading a poem aloud?",
    correct: "It helps the listener follow the poem's meaning and enjoy how it sounds",
    distractors: ["It has no effect on how a listener experiences the poem", "It only matters for reading silently, not aloud", "It is only useful for reading very long poems"],
  },
];

export const readingFluencyPoem: Skill = {
  id: "g8-eng-r-reading-fluency-poem",
  code: "R.11",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Reading Fluency: Poem",
  description: "Identify and apply fluency techniques — accuracy, expression, pace, phrasing, and self-correction — when reading a poem aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Fluent reading is accurate, at a steady pace, grouped into meaningful phrases, and expressive — with mistakes corrected along the way.";

    if (branch === "match") {
      const tokens = shuffle(rng, FLUENCY_COMPONENTS.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, FLUENCY_COMPONENTS.map((c) => ({ id: c.name, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of FLUENCY_COMPONENTS) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each fluency technique to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FLUENCY_COMPONENTS.map((c) => `${c.name} — ${c.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, HABITS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `h${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`h${i}`] = c.fluent ? "Fluent" : "Not fluent"));
      return {
        kind: "categorize",
        prompt: "Sort each reading habit as Fluent or Not fluent.",
        items,
        buckets: [
          { id: "Fluent", label: "Fluent" },
          { id: "Not fluent", label: "Not fluent" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.fluent ? "a fluent" : "a non-fluent"} habit.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READ_ALOUD_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for reading a poem aloud fluently in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READ_ALOUD_STEPS.map((s) => s.id),
        hint: "Preview first, then phrase the words, then pace yourself, then add expression, correcting mistakes throughout.",
        explanation: READ_ALOUD_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing fluency term.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
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
