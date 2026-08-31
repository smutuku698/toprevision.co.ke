import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "This is my family, my aa'ila.",
  "My ab is a muhandis. He builds bridges and roads.",
  "My umm is a tabiba. She works at the clinic.",
  "My akh Ali is a fallah. He grows maize on our shamba.",
  "My ukht Amina is a mumarrida. She helps sick people at the hospital.",
  "My jadd was a muallim, and my jadda was a tabbakha.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is Ali's profession, according to the passage?",
    correct: "fallah (farmer)",
    distractors: ["muhandis (engineer)", "tabib (doctor)", "muallim (teacher)"],
    explanation: "The passage says, \"My akh Ali is a fallah. He grows maize on our shamba.\"",
  },
  {
    q: "Where does the umm work, based on the passage?",
    correct: "At the clinic — she is a tabiba (doctor)",
    distractors: ["At the school — she is a muallima", "At the hospital farm — she is a fallaha", "At home only"],
    explanation: "The passage says, \"My umm is a tabiba. She works at the clinic.\"",
  },
  {
    q: "The passage says a muhandis \"builds bridges and roads.\" From this context clue, what does muhandis mean?",
    correct: "An engineer",
    distractors: ["A farmer", "A cook", "A driver"],
    explanation: "Someone who builds bridges and roads is an engineer — that is what \"muhandis\" means.",
  },
  {
    q: "What was the jadda's profession, according to the passage?",
    correct: "tabbakha (cook)",
    distractors: ["muallima (teacher)", "tabiba (doctor)", "mumarrida (nurse)"],
    explanation: "The passage says, \"my jadda was a tabbakha.\"",
  },
  {
    q: "Who is described as a mumarrida who helps sick people?",
    correct: "Amina, the ukht (sister)",
    distractors: ["Ali, the akh (brother)", "The jadda (grandmother)", "The umm (mother)"],
    explanation: "The passage says, \"My ukht Amina is a mumarrida. She helps sick people at the hospital.\"",
  },
];

// Restricted to words that actually appear in PASSAGE above — the click-match prompt below
// claims "from the passage," so every entry here must be verifiably present in it.
const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ab", meaning: "father" },
  { phrase: "umm", meaning: "mother" },
  { phrase: "akh", meaning: "brother" },
  { phrase: "ukht", meaning: "sister" },
  { phrase: "jadd", meaning: "grandfather" },
  { phrase: "jadda", meaning: "grandmother" },
];

const FAMILY_GROUPS: { word: string; bucket: "Immediate" | "Extended" }[] = [
  { word: "ab (father)", bucket: "Immediate" },
  { word: "umm (mother)", bucket: "Immediate" },
  { word: "akh (brother)", bucket: "Immediate" },
  { word: "ukht (sister)", bucket: "Immediate" },
  { word: "ibn (son)", bucket: "Immediate" },
  { word: "bint (daughter)", bucket: "Immediate" },
  { word: "jadd (grandfather)", bucket: "Extended" },
  { word: "jadda (grandmother)", bucket: "Extended" },
  { word: "khaal (maternal uncle)", bucket: "Extended" },
  { word: "khaala (maternal aunt)", bucket: "Extended" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "The passage says a muhandis builds bridges and roads, so \"muhandis\" means an ", after: ".", correct: "engineer" },
  { before: "A person who grows crops on a farm, like Ali, is called a ", after: " in Arabic.", correct: "fallah" },
  { before: "The Arabic word for \"mother\" is ", after: ".", correct: "umm" },
  { before: "The Arabic word for \"grandfather\" is ", after: ".", correct: "jadd" },
  { before: "The Arabic word for \"nurse\" is ", after: ".", correct: "mumarrida" },
];

export const familyReading: Skill = {
  id: "g7-ar-r-family",
  code: "R.2",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading for comprehension: family",
  description: "Read a short Arabic passage introducing a family and their professions, and infer the meaning of new words from context.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = FAMILY_GROUPS.map((f, i) => ({ id: `w${i}`, label: f.word, bucket: f.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each family word as Immediate family or Extended family.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Immediate", label: "Immediate family" },
          { id: "Extended", label: "Extended family" },
        ],
        correctBucket,
        hint: "Immediate family are parents, siblings, and children; extended family are grandparents, uncles, and aunts.",
        explanation: FAMILY_GROUPS.map((f) => `"${f.word}" is ${f.bucket === "Immediate" ? "immediate" : "extended"} family.`).join(" "),
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
        prompt: "Match each family word from the passage to its English meaning.",
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
        prompt: "Put these lines from the passage in the order they appear.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The passage introduces the parents first, then the siblings, then the grandparents.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the passage above for a context clue or the exact Arabic word.",
        explanation: `The missing word is "${f.correct}".`,
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
      hint: "Look at what the passage says about each family member in turn.",
      explanation: q.explanation,
    };
  },
};
