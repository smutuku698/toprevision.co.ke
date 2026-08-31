import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Ärztin: Guten Tag! Wie fühlen Sie sich?",
  "Herr Otieno: Ich fühle mich müde und ich habe Kopfschmerzen.",
  "Ärztin: Haben Sie auch Hunger oder Durst?",
  "Herr Otieno: Nein, aber ich brauche Wasser, bitte.",
  "Ärztin: Gut. Bleiben Sie ruhig, das hilft.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How does the doctor open the conversation?",
    correct: "Wie fühlen Sie sich?",
    distractors: ["Wie heißen Sie?", "Wie alt sind Sie?", "Wohin gehen Sie?"],
    explanation: "The doctor asks formally \"Wie fühlen Sie sich?\" — how are you feeling?",
  },
  {
    q: "How does Herr Otieno describe his feelings?",
    correct: "Müde und mit Kopfschmerzen.",
    distractors: ["Glücklich und hungrig.", "Nervös und durstig.", "Wütend und krank."],
    explanation: "Herr Otieno says \"Ich fühle mich müde und ich habe Kopfschmerzen\" — tired with a headache.",
  },
  {
    q: "What does Herr Otieno say he needs?",
    correct: "Wasser.",
    distractors: ["Essen.", "Hilfe.", "Medizin."],
    explanation: "Herr Otieno says \"ich brauche Wasser, bitte.\"",
  },
  {
    q: "What advice does the doctor give at the end?",
    correct: "Bleiben Sie ruhig.",
    distractors: ["Gehen Sie nach Hause.", "Trinken Sie Kaffee.", "Fühlen Sie sich glücklich."],
    explanation: "The doctor says \"Bleiben Sie ruhig, das hilft\" — stay calm, that helps.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Herr Otieno feels tired and has a headache.", isTrue: true },
  { text: "Herr Otieno says he is hungry.", isTrue: false },
  { text: "Herr Otieno needs water.", isTrue: true },
  { text: "The doctor tells him to drink coffee.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Wie fühlen Sie sich?", meaning: "How do you feel? (formal)" },
  { phrase: "Ich fühle mich müde.", meaning: "I feel tired." },
  { phrase: "Ich habe Kopfschmerzen.", meaning: "I have a headache." },
  { phrase: "Ich brauche Wasser.", meaning: "I need water." },
  { phrase: "Bleiben Sie ruhig.", meaning: "Stay calm." },
  { phrase: "hungrig", meaning: "hungry" },
  { phrase: "durstig", meaning: "thirsty" },
];

export const feelingsReading: Skill = {
  id: "g8-de-r-feelings",
  code: "R.7",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: feelings and needs",
  description: "Read a formal German dialogue between a doctor and a patient about feelings and needs, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check how Herr Otieno describes himself.",
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
        prompt: "Match each German word or phrase from the dialogue to its English meaning.",
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
        hint: "The doctor's opening question comes first, and her advice comes last.",
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
      hint: "Look at how Herr Otieno describes his feelings and needs in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
