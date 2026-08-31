import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Otieno: Assalamu alaykum!",
  "Kamau: Wa alaykumu assalam. Sabahal khayr!",
  "Otieno: Sabahal khayr! Maa ismuka?",
  "Kamau: Ismi Kamau. Keyfa haaluka?",
  "Otieno: Bikhayr shukran. Anaa masruurun biliqaika!",
  "Kamau: Anaa masruurun biliqaika!",
  "Otieno: Ma'a as-salama!",
  "Kamau: Ma'a as-salama!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who speaks first in the dialogue?",
    correct: "Otieno",
    distractors: ["Kamau", "The teacher", "Neither — they speak at the same time"],
    explanation: "Otieno opens the dialogue with \"Assalamu alaykum!\"",
  },
  {
    q: "What does Kamau say when Otieno greets him?",
    correct: "Wa alaykumu assalam (And peace be upon you too)",
    distractors: ["Ma'a as-salama (Goodbye)", "Keyfa haaluka? (How are you?)", "Ismi Kamau (My name is Kamau)"],
    explanation: "Kamau replies \"Wa alaykumu assalam\" — the standard response to \"Assalamu alaykum.\"",
  },
  {
    q: "How does Otieno say he is feeling?",
    correct: "He is well (bikhayr shukran)",
    distractors: ["He is unwell", "He is tired", "He does not answer"],
    explanation: "Otieno says \"Bikhayr shukran\" — \"I am well, thank you.\"",
  },
  {
    q: "What do the two boys say to end the conversation?",
    correct: "Ma'a as-salama (Goodbye)",
    distractors: ["Sabahal khayr (Good morning)", "Maa ismuka? (What is your name?)", "Assalamu alaykum (Peace be upon you)"],
    explanation: "Both boys say \"Ma'a as-salama\" to close the conversation.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno greets Kamau first.", isTrue: true },
  { text: "Kamau says his name is Otieno.", isTrue: false },
  { text: "Otieno says he is pleased to meet Kamau.", isTrue: true },
  { text: "The boys say sabahal khayr to end the conversation.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Assalamu alaykum", meaning: "Peace be upon you" },
  { phrase: "Wa alaykumu assalam", meaning: "And peace be upon you too" },
  { phrase: "Sabahal khayr", meaning: "Good morning" },
  { phrase: "Maa ismuka?", meaning: "What is your name?" },
  { phrase: "Keyfa haaluka?", meaning: "How are you?" },
  { phrase: "Ma'a as-salama", meaning: "Goodbye" },
];

export const greetingsReading: Skill = {
  id: "g8-ar-r-greetings",
  code: "R.1",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: greetings and introductions",
  description: "Read a short Arabic dialogue between two students meeting for the first time and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what each boy actually says.",
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
        prompt: "Match each expression from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
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
        hint: "Otieno greets Kamau first, then they exchange names, feelings, and finally say goodbye.",
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
      hint: "Look at what each boy says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
