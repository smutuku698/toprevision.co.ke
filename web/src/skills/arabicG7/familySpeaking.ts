import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.2 Imitative Speaking: Pronunciation — identifying family members by name AND
// profession, applying intonation/stress. Includes the source's own example question
// "Where does your parents work?"

const LINES = [
  "Interviewer: Ayna ya'malu waaliduka? (Where does your father work?)",
  "Amina: Abi muhandis. Ya'malu fi mashru' kabeer.",
  "Interviewer: Wa waalidatuka?",
  "Amina: Ummi tabiba fi al-mustashfa.",
  "Interviewer: Wa akhuuki?",
  "Amina: Akhi fallah — yazra'u fi ash-shamba.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is Amina's father's profession?",
    correct: "muhandis (engineer)",
    distractors: ["tabib (doctor)", "fallah (farmer)", "muallim (teacher)"],
    explanation: "Amina says, \"Abi muhandis. Ya'malu fi mashru' kabeer\" — my father is an engineer, he works on a big project.",
  },
  {
    q: "Where does Amina's mother work?",
    correct: "al-mustashfa (the hospital) — she is a tabiba (doctor)",
    distractors: ["al-madrasa (the school)", "as-suuq (the market)", "The passage does not say"],
    explanation: "Amina says, \"Ummi tabiba fi al-mustashfa\" — my mother is a doctor at the hospital.",
  },
  {
    q: "What does Amina's brother (akh) do?",
    correct: "He is a fallah (farmer) who grows crops",
    distractors: ["He is a muhandis (engineer)", "He is a tabib (doctor)", "He is still in school with no job"],
    explanation: "Amina says, \"Akhi fallah — yazra'u fi ash-shamba\" — my brother is a farmer, he grows crops on the farm.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ab", meaning: "father" },
  { phrase: "umm", meaning: "mother" },
  { phrase: "akh", meaning: "brother" },
  { phrase: "ukht", meaning: "sister" },
  { phrase: "muallim", meaning: "teacher" },
  { phrase: "tabib", meaning: "doctor" },
  { phrase: "muhandis", meaning: "engineer" },
  { phrase: "fallah", meaning: "farmer" },
  { phrase: "mumarrida", meaning: "nurse" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Amina: Abi ", after: ". Ya'malu fi mashru' kabeer.", correct: "muhandis" },
  { before: "Amina: Ummi tabiba fi al-", after: ".", correct: "mustashfa" },
  { before: "Amina: Akhi ", after: " — yazra'u fi ash-shamba.", correct: "fallah" },
  { before: "The Arabic word for \"nurse\" is ", after: ".", correct: "mumarrida" },
  { before: "The Arabic word for \"where does your father work?\" is ", after: ".", correct: "ayna ya'malu waaliduka" },
];

const CATEGORY_ITEMS: { label: string; bucket: "Family word" | "Profession word" }[] = [
  { label: "ab (father)", bucket: "Family word" },
  { label: "umm (mother)", bucket: "Family word" },
  { label: "akh (brother)", bucket: "Family word" },
  { label: "ukht (sister)", bucket: "Family word" },
  { label: "muhandis (engineer)", bucket: "Profession word" },
  { label: "tabib (doctor)", bucket: "Profession word" },
  { label: "fallah (farmer)", bucket: "Profession word" },
  { label: "muallim (teacher)", bucket: "Profession word" },
];

export const familySpeaking: Skill = {
  id: "g7-ar-ls-family",
  code: "LS.2",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Imitative speaking: family members and professions",
  description: "Listen to a spoken interview about family members and their professions, and practise saying names and job words aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each word as a Family word or a Profession word.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Family word", label: "Family word" },
          { id: "Profession word", label: "Profession word" },
        ],
        correctBucket,
        hint: "A family word names a relative; a profession word names a job.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is a ${s.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each spoken word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
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
        prompt: "Put these lines from the spoken interview in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The interviewer asks about the father first, then the mother, then the brother.",
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
        hint: "Reread the matching line in the interview above.",
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
