import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Otieno: Every afternoon, I walk home from the madrasa.",
  "Otieno: I leave the madrasa and walk down the tareeq.",
  "Otieno: I pass the suuq, then the masjid.",
  "Otieno: I stop at the maktaba to return a book.",
  "Otieno: I walk through the hadiqa, near the nahr.",
  "Otieno: Finally, I reach my bayt.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Where does Otieno's walk begin?",
    correct: "At the madrasa (school)",
    distractors: ["At the suuq (market)", "At the maktaba (library)", "At the masjid (mosque)"],
    explanation: "Otieno says he walks home \"from the madrasa.\"",
  },
  {
    q: "What does Otieno do at the maktaba?",
    correct: "He returns a book",
    distractors: ["He buys food", "He prays", "He plays football"],
    explanation: "Otieno says, \"I stop at the maktaba to return a book.\"",
  },
  {
    q: "What two places does Otieno pass, in order, after leaving school?",
    correct: "The suuq, then the masjid",
    distractors: ["The masjid, then the suuq", "The hadiqa, then the nahr", "The bayt, then the maktaba"],
    explanation: "Otieno says, \"I pass the suuq, then the masjid.\"",
  },
  {
    q: "Where does Otieno's walk end?",
    correct: "At his bayt (house)",
    distractors: ["At the hadiqa (park)", "At the nahr (river)", "At the madrasa (school)"],
    explanation: "Otieno says, \"Finally, I reach my bayt.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno's walk starts at the madrasa.", isTrue: true },
  { text: "Otieno buys vegetables at the maktaba.", isTrue: false },
  { text: "Otieno walks near the nahr and through the hadiqa.", isTrue: true },
  { text: "Otieno's walk ends at the masjid.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "madrasa", meaning: "school" },
  { phrase: "bayt", meaning: "house / home" },
  { phrase: "suuq", meaning: "market" },
  { phrase: "masjid", meaning: "mosque" },
  { phrase: "maktaba", meaning: "library" },
  { phrase: "hadiqa", meaning: "garden / park" },
  { phrase: "tareeq", meaning: "road / street" },
  { phrase: "nahr", meaning: "river" },
];

export const surroundingReading: Skill = {
  id: "g8-ar-r-surrounding",
  code: "R.3",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: my surrounding",
  description: "Read a short Arabic passage describing a walk through a neighbourhood and answer comprehension questions.",
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
        hint: "Reread the passage carefully and follow Otieno's route step by step.",
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
        prompt: "Match each place name from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each place is used in the passage above.",
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
        prompt: "Put these lines from the passage in the order they happen.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Otieno leaves school, passes the market and mosque, stops at the library, then walks home past the park and river.",
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
      hint: "Follow Otieno's route through the neighbourhood, one place at a time.",
      explanation: q.explanation,
    };
  },
};
