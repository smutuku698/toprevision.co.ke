import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 2.7 Reading Aloud: Fluency — adjectives/descriptive words, pronunciation.
// The source PDF's page header for 2.7 mistakenly repeats "THEME 7: FOOD AND DRINKS," but the
// actual Specific Learning Outcomes are about describing physical appearance — this skill's real
// theme is "My Body," matching Listening&Speaking 1.7 and Writing 3.7 (see BUILD notes/curriculum-
// reference/grade-7/arabic.json for the full explanation of this source-document typo).

const LINES = [
  "Sara is describing her new friend to her mother.",
  "Sara: My friend is tawil and very nasheet.",
  "Mother: What about his ra's? Is his hair short?",
  "Sara: Yes! And he has a small anf and a big fam when he smiles.",
  "Mother: He sounds bikhayr and happy!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How does Sara first describe her friend?",
    correct: "tawil (tall) and nasheet (energetic)",
    distractors: ["qaseer (short) and muta'ab (tired)", "mareed (sick) and tawil (tall)", "jaa'i' (hungry) and nasheet (energetic)"],
    explanation: "Sara says, \"My friend is tawil and very nasheet.\"",
  },
  {
    q: "What does Sara say about her friend's fam when he smiles?",
    correct: "It is big",
    distractors: ["It is small", "She does not mention it", "It is described as sick"],
    explanation: "Sara says, \"he has a small anf and a big fam when he smiles\" — a big mouth (fam).",
  },
  {
    q: "What word does the mother use to describe how the friend sounds overall?",
    correct: "bikhayr (well / fine) and happy",
    distractors: ["mareed (sick) and tired", "'atshaan (thirsty)", "muta'ab (tired) but happy"],
    explanation: "The mother says, \"He sounds bikhayr and happy!\"",
  },
];

// Restricted to words that actually appear in PASSAGE above — the click-match prompt below
// claims "from the passage," so every entry here must be verifiably present in it.
const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ra's", meaning: "head" },
  { phrase: "anf", meaning: "nose" },
  { phrase: "fam", meaning: "mouth" },
  { phrase: "tawil", meaning: "tall" },
  { phrase: "nasheet", meaning: "energetic" },
  { phrase: "bikhayr", meaning: "well / fine" },
];

const WORD_GROUPS: { word: string; bucket: "Body part" | "Descriptor" }[] = [
  { word: "ra's (head)", bucket: "Body part" },
  { word: "yad (hand)", bucket: "Body part" },
  { word: "anf (nose)", bucket: "Body part" },
  { word: "fam (mouth)", bucket: "Body part" },
  { word: "tawil (tall)", bucket: "Descriptor" },
  { word: "qaseer (short)", bucket: "Descriptor" },
  { word: "nasheet (energetic)", bucket: "Descriptor" },
  { word: "bikhayr (well / fine)", bucket: "Descriptor" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "Sara: My friend is ", after: " and very nasheet.", correct: "tawil" },
  { before: "The Arabic word for \"mouth\" is ", after: ".", correct: "fam" },
  { before: "The Arabic word for \"short\" is ", after: ".", correct: "qaseer" },
  { before: "The Arabic word for \"nose\" is ", after: ".", correct: "anf" },
  { before: "Mother: He sounds ", after: " and happy!", correct: "bikhayr" },
];

export const bodyReading: Skill = {
  id: "g7-ar-r-body",
  code: "R.7",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading aloud: describing people (my body)",
  description: "Read a short Arabic passage describing a person's appearance, and pick out the descriptive words used.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = WORD_GROUPS.map((w, i) => ({ id: `w${i}`, label: w.word, bucket: w.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Body part or a Descriptor (a describing word).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Body part", label: "Body part" },
          { id: "Descriptor", label: "Descriptor" },
        ],
        correctBucket,
        hint: "A body part names something on your body; a descriptor describes how someone looks or feels.",
        explanation: WORD_GROUPS.map((w) => `"${w.word}" is a ${w.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each word from the passage to its English meaning.",
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
        hint: "Sara starts with general build, then the mother asks about the head, then Sara adds facial details.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the passage.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the matching line in the passage above.",
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
      hint: "Look at what Sara says about her friend in the passage above.",
      explanation: q.explanation,
    };
  },
};
