import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Omar: I astayqidh mubakkiran every day.",
  "Layla: What do you do after that?",
  "Omar: I aakul, then adhhab ilaa al-madrasa fi al-waqt.",
  "Layla: And in the evening?",
  "Omar: I adrus, then anaam early so I'm not tired.",
  "Layla: Next week is Eid — no madrasa, it's an 'utla!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "According to Omar, when does he wake up?",
    correct: "mubakkiran (early)",
    distractors: ["fi al-waqt (on time)", "He does not say", "Very late"],
    explanation: "Omar says, \"I astayqidh mubakkiran every day\" — I wake up early.",
  },
  {
    q: "What does Omar do right before going to school?",
    correct: "aakul (I eat)",
    distractors: ["adrus (I study)", "anaam (I sleep)", "astayqidh (I wake up)"],
    explanation: "Omar says, \"I aakul, then adhhab ilaa al-madrasa fi al-waqt\" — I eat, then go to school on time.",
  },
  {
    q: "Why does Omar say he anaam early?",
    correct: "So he is not tired",
    distractors: ["Because school starts very early", "Because it is a holiday", "He does not give a reason"],
    explanation: "Omar says, \"I adrus, then anaam early so I'm not tired.\"",
  },
  {
    q: "What does Layla say about next week?",
    correct: "It is Eid, an 'utla (holiday) — no school",
    distractors: ["It is a normal school week", "Omar will astayqidh later than usual", "There is a reading contest"],
    explanation: "Layla says, \"Next week is Eid — no madrasa, it's an 'utla!\"",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "astayqidh", meaning: "I wake up" },
  { phrase: "aakul", meaning: "I eat" },
  { phrase: "adhhab ilaa al-madrasa", meaning: "I go to school" },
  { phrase: "adrus", meaning: "I study" },
  { phrase: "anaam", meaning: "I sleep" },
  { phrase: "mubakkiran", meaning: "early" },
  { phrase: "fi al-waqt", meaning: "on time" },
  { phrase: "'utla", meaning: "holiday" },
];

const ROUTINE_GROUPS: { word: string; bucket: "Morning" | "Evening" }[] = [
  { word: "astayqidh (I wake up)", bucket: "Morning" },
  { word: "aakul (I eat)", bucket: "Morning" },
  { word: "adhhab ilaa al-madrasa (I go to school)", bucket: "Morning" },
  { word: "adrus (I study)", bucket: "Evening" },
  { word: "anaam (I sleep)", bucket: "Evening" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "Omar: I ", after: " mubakkiran every day.", correct: "astayqidh" },
  { before: "The Arabic word for \"on time\" is ", after: ".", correct: "fi al-waqt", accepted: ["fi al waqt"] },
  { before: "The major Islamic festival mentioned by Layla is ", after: ".", correct: "Eid" },
  { before: "Layla: Next week is Eid — it's an ", after: "!", correct: "'utla", accepted: ["utla"] },
  { before: "Omar: I adrus, then ", after: " early so I'm not tired.", correct: "anaam" },
];

export const timeReading: Skill = {
  id: "g7-ar-r-time",
  code: "R.4",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading for comprehension: time",
  description: "Read a short Arabic dialogue about a daily routine and an upcoming holiday, and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = ROUTINE_GROUPS.map((r, i) => ({ id: `w${i}`, label: r.word, bucket: r.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each routine word as something Omar does in the Morning or in the Evening.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Morning", label: "Morning" },
          { id: "Evening", label: "Evening" },
        ],
        correctBucket,
        hint: "Reread the dialogue — Omar describes his morning routine first, then his evening routine.",
        explanation: ROUTINE_GROUPS.map((r) => `"${r.word}" happens in the ${r.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each word from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the dialogue above.",
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
        hint: "Omar describes waking up first, then his morning, then his evening, then Layla mentions Eid.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the dialogue.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
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
      hint: "Look at what each person says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
