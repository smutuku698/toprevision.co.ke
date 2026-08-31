import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.5 Listening for Information — identifying specific details and responding to
// simple verbal instructions. The source names a "Simon says"-style verbal-instruction game.

const LINES = [
  "Coach: Let's play! Simon yaqool: qif! (Simon says: stop!)",
  "Coach: Simon yaqool: irfa' yadaka! (Simon says: raise your hand!)",
  "Coach: Ijlis! (Sit down!)",
  "Coach: Ha! That was a trick — I didn't say 'Simon yaqool!'",
  "Coach: Now, what do you do in your free time?",
  "Sami: Ana uhibbu al-qiraa'a wa as-sibaaha.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "In the 'Simon says' game, when should you follow the instruction?",
    correct: "Only when the coach says 'Simon yaqool' (Simon says) first",
    distractors: ["Every single instruction, always", "Never — it's just for listening", "Only instructions given twice"],
    explanation: "The coach's third instruction (\"Ijlis!\") has no \"Simon yaqool\" before it — it's a trick, and following it means you're out.",
  },
  {
    q: "Which instruction in the passage is the trick, with no 'Simon yaqool' before it?",
    correct: "Ijlis! (Sit down!)",
    distractors: ["Qif! (Stop!)", "Irfa' yadaka! (Raise your hand!)", "There is no trick instruction"],
    explanation: "\"Ijlis!\" is given without \"Simon yaqool\" first, making it the trick instruction.",
  },
  {
    q: "What does Sami say he loves doing in his free time?",
    correct: "al-qiraa'a (reading) and as-sibaaha (swimming)",
    distractors: ["kurat al-qadam (football) and al-musiqa (music)", "ar-rasm (drawing) only", "as-safar (travel) and ar-rihla (trip)"],
    explanation: "Sami says, \"Ana uhibbu al-qiraa'a wa as-sibaaha\" — I love reading and swimming.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "qif!", meaning: "stop!" },
  { phrase: "irfa' yadaka!", meaning: "raise your hand!" },
  { phrase: "ijlis!", meaning: "sit down!" },
  { phrase: "Simon yaqool", meaning: "Simon says" },
  { phrase: "al-qiraa'a", meaning: "reading" },
  { phrase: "as-sibaaha", meaning: "swimming" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Sami: Ana uhibbu al-qiraa'a wa ", after: ".", correct: "as-sibaaha" },
  { before: "Coach: Simon yaqool: irfa' ", after: "!", correct: "yadaka" },
  { before: "Coach: ", after: "! (Sit down!)", correct: "Ijlis" },
  { before: "The Arabic word for \"stop\" is ", after: ".", correct: "qif" },
  { before: "The Arabic phrase for \"Simon says\" is ", after: ".", correct: "Simon yaqool" },
];

const INSTRUCTION_ITEMS: { label: string; bucket: "Follow it" | "Do not follow it" }[] = [
  { label: "Simon yaqool: qif!", bucket: "Follow it" },
  { label: "Simon yaqool: irfa' yadaka!", bucket: "Follow it" },
  { label: "Ijlis! (with no 'Simon yaqool')", bucket: "Do not follow it" },
];

export const funSpeaking: Skill = {
  id: "g7-ar-ls-fun",
  code: "LS.5",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Listening for information: fun and enjoyment",
  description: "Listen to a spoken 'Simon says' verbal-instruction game, respond correctly, and talk about leisure activities.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = INSTRUCTION_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "In this 'Simon says' game, sort each instruction: should you Follow it, or not?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Follow it", label: "Follow it" },
          { id: "Do not follow it", label: "Do not follow it" },
        ],
        correctBucket,
        hint: "Only follow instructions that start with 'Simon yaqool' (Simon says).",
        explanation: INSTRUCTION_ITEMS.map((s) => `"${s.label}" — ${s.bucket === "Follow it" ? "follow it" : "do not follow it"}.`).join(" "),
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
        speakable: true,
        prompt: "Match each spoken instruction or word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each phrase aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        speakable: true,
        prompt: "Put these lines from the spoken game in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The game gives two 'Simon says' instructions, then a trick, then the coach reveals it, then asks about free time.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        speakable: true,
        prompt: "Fill in the missing word.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Reread the matching line in the game above.",
        explanation: `The missing word is "${f.correct}".`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      speakable: true,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Imagine hearing each line spoken aloud, one at a time.",
      explanation: q.explanation,
    };
  },
};
