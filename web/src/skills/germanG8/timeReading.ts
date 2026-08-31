import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const LINES = [
  "Frau Njeri: Wie spät ist es, Herr Otieno?",
  "Herr Otieno: Es ist Viertel nach neun.",
  "Frau Njeri: Um wie viel Uhr haben wir Deutsch?",
  "Herr Otieno: Wir haben Deutsch um halb zehn, und Mathematik um Viertel vor elf.",
  "Frau Njeri: Danke! Ich habe heute auch Sport am Montag.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string; visual?: VisualSpec }[] = [
  {
    q: "What time does Herr Otieno say it is?",
    correct: "Es ist Viertel nach neun.",
    distractors: ["Es ist halb zehn.", "Es ist Viertel vor zehn.", "Es ist neun Uhr."],
    explanation: "Herr Otieno answers \"Es ist Viertel nach neun\" — a quarter past nine.",
  },
  {
    q: "Which sentence from the dialogue matches the time shown on the clock above?",
    correct: "Es ist Viertel nach neun.",
    distractors: ["Es ist halb zehn.", "Es ist Viertel vor elf.", "Es ist neun Uhr."],
    explanation: "The clock shows 9:15, which matches \"Es ist Viertel nach neun\" — a quarter past nine.",
    visual: { type: "clock", hour: 9, minute: 15 },
  },
  {
    q: "What time does German class start?",
    correct: "Um halb zehn.",
    distractors: ["Um Viertel nach neun.", "Um Viertel vor elf.", "Um zehn Uhr."],
    explanation: "Herr Otieno says \"Wir haben Deutsch um halb zehn\" — German is at half past nine.",
  },
  {
    q: "What time does Maths class start?",
    correct: "Um Viertel vor elf.",
    distractors: ["Um halb zehn.", "Um Viertel nach neun.", "Um elf Uhr."],
    explanation: "Herr Otieno says \"Mathematik um Viertel vor elf\" — Maths is a quarter to eleven.",
  },
  {
    q: "Which day does Frau Njeri mention she also has PE?",
    correct: "Am Montag.",
    distractors: ["Am Dienstag.", "Am Freitag.", "Am Mittwoch."],
    explanation: "Frau Njeri says \"Ich habe heute auch Sport am Montag.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "It is a quarter past nine when the dialogue begins.", isTrue: true },
  { text: "German class is at a quarter to eleven.", isTrue: false },
  { text: "Maths class is at a quarter to eleven.", isTrue: true },
  { text: "Frau Njeri has PE on Wednesday.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Wie spät ist es?", meaning: "What time is it?" },
  { phrase: "Viertel nach neun", meaning: "quarter past nine" },
  { phrase: "halb zehn", meaning: "half past nine" },
  { phrase: "Viertel vor elf", meaning: "quarter to eleven" },
  { phrase: "Um wie viel Uhr...?", meaning: "At what time...?" },
  { phrase: "Deutsch", meaning: "German (subject)" },
  { phrase: "Mathematik", meaning: "Maths" },
  { phrase: "Sport", meaning: "PE" },
];

export const timeReading: Skill = {
  id: "g8-de-r-time",
  code: "R.4",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: telling time and the timetable",
  description: "Read a formal German dialogue about the time and school timetable, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check each time and subject mentioned.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each German time expression or subject from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these exact expressions in the dialogue above.",
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
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The dialogue opens by asking the time and ends by mentioning Monday's PE class.",
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
      hint: "Look at the times and subjects each speaker mentions in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
