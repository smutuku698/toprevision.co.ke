import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const LINES = [
  "Amina: Every morning, I astayqidh mubakkiran — as-saa'a as-saadisa.",
  "Amina: Then I aakul breakfast.",
  "Amina: I adhhab ilaa al-madrasa fi al-waqt.",
  "Amina: In the afternoon, I adrus.",
  "Amina: At night, I anaam mubakkiran.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string; visual?: VisualSpec }[] = [
  {
    q: "Amina wakes up at the time shown on the clock. What time is it?",
    correct: "as-saa'a as-saadisa (six o'clock)",
    distractors: [
      "as-saa'a al-waahida (one o'clock)",
      "as-saa'a ath-thaalitha wa an-nusf (half past three)",
      "as-saa'a at-taasi'a wa ar-rubu' (quarter past nine)",
    ],
    explanation: "The clock shows 6:00, and the passage says Amina wakes up \"as-saa'a as-saadisa\" — six o'clock.",
    visual: { type: "clock", hour: 6, minute: 0 },
  },
  {
    q: "What does Amina do right after waking up?",
    correct: "She eats breakfast (aakul)",
    distractors: ["She studies (adrus)", "She sleeps (anaam)", "She goes straight to school"],
    explanation: "Amina says, \"Then I aakul breakfast.\"",
  },
  {
    q: "How does Amina get to school, according to the passage?",
    correct: "fi al-waqt (on time)",
    distractors: ["Late every day", "Mubakkiran, long before sunrise", "By bus, arriving late"],
    explanation: "Amina says, \"I adhhab ilaa al-madrasa fi al-waqt\" — she goes to school on time.",
  },
  {
    q: "When does Amina adrus (study)?",
    correct: "In the afternoon",
    distractors: ["Right after waking up", "During breakfast", "Late at night only"],
    explanation: "Amina says, \"In the afternoon, I adrus.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina wakes up at as-saa'a as-saadisa (six o'clock).", isTrue: true },
  { text: "Amina studies before she eats breakfast.", isTrue: false },
  { text: "Amina goes to school fi al-waqt (on time).", isTrue: true },
  { text: "Amina says she never anaam (sleeps) early.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "astayqidh", meaning: "I wake up" },
  { phrase: "aakul", meaning: "I eat" },
  { phrase: "adhhab ilaa al-madrasa", meaning: "I go to school" },
  { phrase: "adrus", meaning: "I study" },
  { phrase: "anaam", meaning: "I sleep" },
  { phrase: "mubakkiran", meaning: "early" },
  { phrase: "fi al-waqt", meaning: "on time" },
];

export const timeReading: Skill = {
  id: "g8-ar-r-time",
  code: "R.4",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: daily routine and time",
  description: "Read a short Arabic passage about a daily school routine and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage carefully and check the order of Amina's activities and their times.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each word or phrase from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the passage above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the passage in the order Amina's day happens.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Amina wakes up, eats, goes to school, studies in the afternoon, then sleeps at night.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      visual: q.visual,
      hint: "Look at the times and activities Amina mentions in the passage above.",
      explanation: q.explanation,
    };
  },
};
