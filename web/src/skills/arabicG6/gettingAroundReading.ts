import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 2.9 Extensive Reading — Theme: Getting Around.
// Content: identifying Arabic texts for enjoyment, creating a reading log (title, author,
// characters, most interesting events) — NOT vocabulary-drill content. Built as a genuinely
// different skill shape from the vocab-heavy sibling sub-strands, following the same style as
// arabicG7's gettingAroundReading.ts library-skills reference file.

const LOG_FIELDS: { field: string; meaning: string }[] = [
  { field: "al-'unwan", meaning: "the title" },
  { field: "al-mu'allif", meaning: "the author" },
  { field: "al-shakhsiyyat", meaning: "the characters" },
  { field: "ahamm hadath", meaning: "the most interesting event" },
  { field: "tareekh al-qira'a", meaning: "the date read" },
  { field: "ra'yi", meaning: "my opinion" },
];

const STEPS: { id: string; label: string }[] = [
  { id: "choose", label: "Choose an Arabic text that looks enjoyable to you" },
  { id: "title", label: "Write down al-'unwan (the title) and al-mu'allif (the author)" },
  { id: "read", label: "Read the text for enjoyment" },
  { id: "characters", label: "Note al-shakhsiyyat (the characters) you meet" },
  { id: "event", label: "Record ahamm hadath (the most interesting event)" },
  { id: "opinion", label: "Write ra'yi (my opinion) about the text" },
];

const FIELD_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "Which reading-log field records who appears in the story?", correct: "al-shakhsiyyat (the characters)", distractors: ["al-'unwan (the title)", "tareekh al-qira'a (the date read)", "ra'yi (my opinion)"], explanation: "'al-shakhsiyyat' means 'the characters' — the field that records who appears in the story." },
  { q: "Which reading-log field records who wrote the text?", correct: "al-mu'allif (the author)", distractors: ["al-'unwan (the title)", "ahamm hadath (the most interesting event)", "ra'yi (my opinion)"], explanation: "'al-mu'allif' means 'the author' — the field for who wrote the text." },
  { q: "Which reading-log field records what you personally thought of the text?", correct: "ra'yi (my opinion)", distractors: ["al-'unwan (the title)", "al-shakhsiyyat (the characters)", "tareekh al-qira'a (the date read)"], explanation: "'ra'yi' means 'my opinion' — a personal reflection field, not a factual field like title or author." },
  { q: "Which reading-log field records the name of the text itself?", correct: "al-'unwan (the title)", distractors: ["al-mu'allif (the author)", "ahamm hadath (the most interesting event)", "ra'yi (my opinion)"], explanation: "'al-'unwan' means 'the title' — the name of the text." },
  { q: "Which reading-log field records the single most exciting or memorable part of the text?", correct: "ahamm hadath (the most interesting event)", distractors: ["al-mu'allif (the author)", "tareekh al-qira'a (the date read)", "al-shakhsiyyat (the characters)"], explanation: "'ahamm hadath' means 'the most interesting event' — the field for the most memorable moment." },
];

const CHOICE_REASON_ITEMS: { reason: string; bucket: "Good reason" | "Poor reason" }[] = [
  { reason: "The text's topic genuinely interests me", bucket: "Good reason" },
  { reason: "I can understand most of the Arabic used in it", bucket: "Good reason" },
  { reason: "A classmate recommended it and explained why they enjoyed it", bucket: "Good reason" },
  { reason: "It is the shortest text on the shelf, even though the topic bores me", bucket: "Poor reason" },
  { reason: "It has a colourful cover, even though I can't read most of the words", bucket: "Poor reason" },
  { reason: "It is the very first text I touched, without looking at any others", bucket: "Poor reason" },
];

const REASONING_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "Amina wants to choose an Arabic text she will genuinely enjoy reading. What should she check first?", correct: "whether the topic and reading level suit her, not just the cover", distractors: ["only how many pages it has", "only how colourful the cover is", "whether it is the newest text on the shelf"], explanation: "A good text choice starts with checking topic interest and reading level, not appearance or length." },
  { q: "Why is filling in 'ahamm hadath' (the most interesting event) useful after finishing a text?", correct: "it helps you remember and reflect on the most memorable part later", distractors: ["it replaces reading the whole text", "it is only useful for the teacher, never the reader", "it must always match the title exactly"], explanation: "Recording the most interesting event is a reflection tool for the reader's own memory and understanding." },
  { q: "Juma reads a text but skips writing down 'al-mu'allif' (the author) in his reading log. What information will his log be missing?", correct: "who wrote the text", distractors: ["what the text was about", "how long the text was", "when he started reading"], explanation: "'al-mu'allif' specifically records the author's identity — skipping it leaves that field blank." },
];

export const gettingAroundReading: Skill = {
  id: "g6-ar-r-getting-around",
  code: "R.9",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Extensive reading: choosing texts and keeping a reading log",
  description: "Practise identifying Arabic texts to read for enjoyment and building a reading log with title, author, characters, and events.",
  generate(rng) {
    const branch = randChoice(rng, ["fieldQuestion", "match", "ordering", "categorize", "reasoning"] as const);

    if (branch === "fieldQuestion") {
      const q = randChoice(rng, FIELD_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          q.q,
          "Which reading-log field is being asked about here? " + q.q,
          "Think about your reading log. " + q.q,
          "Recall the fields of a reading log. " + q.q,
        ]),
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Each reading-log field records one specific kind of information about the text.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, LOG_FIELDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.field, label: s.field })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.field, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.field] = s.field;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each reading-log field to its meaning.",
          "Match the reading-log term to what it means.",
          "Which meaning goes with which reading-log field?",
          "Pair each reading-log field with its correct meaning.",
          "Match each field to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Think about what information you would record for each part of your reading log.",
        explanation: chosen.map((s) => `"${s.field}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const items = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange the steps for choosing a text and starting a reading log in order.",
          "Put these reading-log steps in the correct order.",
          "Sequence these steps as you would follow them.",
          "Order these reading-log steps correctly.",
          "Which order makes sense for choosing and logging a text?",
        ]),
        instruction: "Click the steps in the correct order.",
        items,
        correctOrder: STEPS.map((s) => s.id),
        hint: "Start by choosing a text, then note its title/author, read it, then log characters, events, and your opinion.",
        explanation: STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CHOICE_REASON_ITEMS).slice(0, 5);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.reason }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each reason for choosing a text as a Good reason or a Poor reason.",
          "Group these reasons for picking a text by quality.",
          "Which reasons for choosing a text are good ones?",
          "Sort each reason into the correct category.",
          "Classify each reason for choosing a text.",
        ]),
        items,
        buckets: [
          { id: "Good reason", label: "Good reason" },
          { id: "Poor reason", label: "Poor reason" },
        ],
        correctBucket,
        hint: "A good reason connects to whether the text genuinely interests you and fits your level, not its appearance or size.",
        explanation: chosen.map((r) => `"${r.reason}" is a ${r.bucket.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, REASONING_QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Think about what makes a text choice or reading log genuinely useful, not just quick.",
      explanation: q.explanation,
    };
  },
};
