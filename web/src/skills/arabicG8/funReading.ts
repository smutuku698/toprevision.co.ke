import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Njeri: In my free time, I enjoy al-qiraa'a and ar-rasm at home.",
  "Njeri: On weekends, I play kurat al-qadam with my friends.",
  "Njeri: I also love as-sibaaha and al-musiqa.",
  "Njeri: Next month, my family is going on a ar-rihla — I love as-safar!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What two activities does Njeri enjoy at home?",
    correct: "al-qiraa'a (reading) and ar-rasm (drawing)",
    distractors: [
      "as-sibaaha (swimming) and al-musiqa (music)",
      "kurat al-qadam (football) and as-safar (travel)",
      "ar-rihla (a trip) and al-musiqa (music)",
    ],
    explanation: "Njeri says, \"I enjoy al-qiraa'a and ar-rasm at home.\"",
  },
  {
    q: "What does Njeri play with her friends on weekends?",
    correct: "kurat al-qadam (football)",
    distractors: ["as-sibaaha (swimming)", "al-musiqa (music)", "ar-rasm (drawing)"],
    explanation: "Njeri says, \"I play kurat al-qadam with my friends.\"",
  },
  {
    q: "What is Njeri's family doing next month?",
    correct: "Going on a ar-rihla (trip / excursion)",
    distractors: ["Moving to a new bayt", "Starting a new madrasa", "Nothing special"],
    explanation: "Njeri says, \"my family is going on a ar-rihla.\"",
  },
  {
    q: "What does Njeri say she loves, besides reading and drawing?",
    correct: "as-sibaaha (swimming) and al-musiqa (music)",
    distractors: ["kurat al-qadam (football) only", "as-safar (travel) only", "Nothing else"],
    explanation: "Njeri says, \"I also love as-sibaaha and al-musiqa.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Njeri enjoys al-qiraa'a and ar-rasm at home.", isTrue: true },
  { text: "Njeri never plays kurat al-qadam.", isTrue: false },
  { text: "Njeri's family is going on a ar-rihla next month.", isTrue: true },
  { text: "Njeri says she dislikes as-safar.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "al-qiraa'a", meaning: "reading" },
  { phrase: "as-sibaaha", meaning: "swimming" },
  { phrase: "kurat al-qadam", meaning: "football" },
  { phrase: "ar-rasm", meaning: "drawing" },
  { phrase: "al-musiqa", meaning: "music" },
  { phrase: "as-safar", meaning: "travel" },
  { phrase: "ar-rihla", meaning: "trip / excursion" },
];

export const funReading: Skill = {
  id: "g8-ar-r-fun",
  code: "R.5",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: leisure and presentations",
  description: "Read a short Arabic passage about a student's hobbies and free-time activities and answer comprehension questions.",
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
        hint: "Reread the passage carefully and check what Njeri actually says she enjoys.",
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
        prompt: "Match each activity from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each activity is used in the passage above.",
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
        prompt: "Put these lines from the passage in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Njeri talks about home activities first, then weekends, then other hobbies, then the family trip.",
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
      hint: "Look at what Njeri says she enjoys doing in the passage above.",
      explanation: q.explanation,
    };
  },
};
