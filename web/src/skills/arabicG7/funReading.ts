import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Nadia: What do you do in your free time?",
  "Karim: I love al-qiraa'a and as-sibaaha at the pool.",
  "Nadia: I prefer kurat al-qadam and al-musiqa.",
  "Karim: What about ar-rasm? Do you enjoy drawing?",
  "Nadia: Not really — but I love as-safar and ar-rihla!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which two activities does Karim say he enjoys?",
    correct: "al-qiraa'a (reading) and as-sibaaha (swimming)",
    distractors: ["kurat al-qadam (football) and al-musiqa (music)", "ar-rasm (drawing) and as-safar (travel)", "ar-rihla (trip) and al-qiraa'a (reading)"],
    explanation: "Karim says, \"I love al-qiraa'a and as-sibaaha at the pool.\"",
  },
  {
    q: "What does Nadia prefer instead of reading and swimming?",
    correct: "kurat al-qadam (football) and al-musiqa (music)",
    distractors: ["al-qiraa'a (reading) and ar-rasm (drawing)", "as-safar (travel) and as-sibaaha (swimming)", "ar-rihla (trip) only"],
    explanation: "Nadia says, \"I prefer kurat al-qadam and al-musiqa.\"",
  },
  {
    q: "How does Nadia feel about ar-rasm (drawing)?",
    correct: "Not really — she does not enjoy it much",
    distractors: ["She loves it more than anything", "She has never tried it", "She only draws football players"],
    explanation: "Nadia replies, \"Not really\" when Karim asks about drawing.",
  },
  {
    q: "What does Nadia say she loves at the end of the dialogue?",
    correct: "as-safar (travel) and ar-rihla (trip/excursion)",
    distractors: ["al-musiqa (music) and kurat al-qadam (football)", "as-sibaaha (swimming) and al-qiraa'a (reading)", "ar-rasm (drawing) only"],
    explanation: "Nadia says, \"but I love as-safar and ar-rihla!\"",
  },
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

const ACTIVITY_GROUPS: { word: string; bucket: "Active" | "Quiet" }[] = [
  { word: "as-sibaaha (swimming)", bucket: "Active" },
  { word: "kurat al-qadam (football)", bucket: "Active" },
  { word: "as-safar (travel)", bucket: "Active" },
  { word: "al-qiraa'a (reading)", bucket: "Quiet" },
  { word: "al-musiqa (music)", bucket: "Quiet" },
  { word: "ar-rasm (drawing)", bucket: "Quiet" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "Karim: I love al-qiraa'a and ", after: " at the pool.", correct: "as-sibaaha" },
  { before: "The Arabic word for \"football\" is ", after: ".", correct: "kurat al-qadam" },
  { before: "The Arabic word for \"music\" is ", after: ".", correct: "al-musiqa" },
  { before: "Nadia: I love as-safar and ", after: "!", correct: "ar-rihla" },
  { before: "The Arabic word for \"drawing\" is ", after: ".", correct: "ar-rasm" },
];

export const funReading: Skill = {
  id: "g7-ar-r-fun",
  code: "R.5",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading aloud: fun and enjoyment",
  description: "Read a short Arabic dialogue about leisure-time activities fluently, with good intonation and pace.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = ACTIVITY_GROUPS.map((a, i) => ({ id: `w${i}`, label: a.word, bucket: a.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each leisure activity as Active or Quiet.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Active", label: "Active activity" },
          { id: "Quiet", label: "Quiet activity" },
        ],
        correctBucket,
        hint: "Active activities involve a lot of movement; quiet activities can be done sitting still.",
        explanation: ACTIVITY_GROUPS.map((a) => `"${a.word}" is ${a.bucket === "Active" ? "an active" : "a quiet"} activity.`).join(" "),
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
        prompt: "Match each activity word from the dialogue to its English meaning.",
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
        hint: "Nadia asks first, then Karim answers, then Nadia gives her own preferences.",
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
