import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.1 Listening for Gist — identifying the main idea in a spoken text and responding
// to simple questions on greetings/introduction. The source's own named examples ("Where do you
// live? / ayna taskun?" and "What is your friend's name? / maa ismu sadeeqak?") are included.

const LINES = [
  "Khadija: Assalamu alaykum! Ayna taskun?",
  "Bilal: Wa alaykumu assalam! Askunu qariban min al-madrasa.",
  "Khadija: Maa ismu sadeeqak?",
  "Bilal: Ismu sadeeqi Hassan.",
  "Khadija: Keyfa haaluka?",
  "Bilal: Bikhayr shukran! Ma'a as-salama.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to the exchange. What is the main idea of this conversation?",
    correct: "Two friends greeting each other and asking simple introduction questions",
    distractors: ["A shopping trip", "A weather report", "A story about a holiday"],
    explanation: "The whole exchange is a greeting between Khadija and Bilal, including introduction questions.",
  },
  {
    q: "What does Khadija ask Bilal first, besides greeting him?",
    correct: "Ayna taskun? (Where do you live?)",
    distractors: ["Maa ismu sadeeqak? (What is your friend's name?)", "Keyfa haaluka? (How are you?)", "She asks nothing else"],
    explanation: "Khadija says, \"Assalamu alaykum! Ayna taskun?\" — right after greeting him.",
  },
  {
    q: "What is the name of Bilal's friend?",
    correct: "Hassan",
    distractors: ["Bilal", "Khadija", "The passage does not say"],
    explanation: "Bilal answers, \"Ismu sadeeqi Hassan\" — my friend's name is Hassan.",
  },
  {
    q: "How does Bilal answer when Khadija asks 'Keyfa haaluka?'",
    correct: "Bikhayr shukran (I am well, thank you)",
    distractors: ["Ma'a as-salama (Goodbye)", "Ayna taskun (Where do you live)", "He does not answer"],
    explanation: "Bilal replies, \"Bikhayr shukran!\" before saying goodbye.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ayna taskun?", meaning: "where do you live?" },
  { phrase: "maa ismu sadeeqak?", meaning: "what is your friend's name?" },
  { phrase: "keyfa haaluka?", meaning: "how are you?" },
  { phrase: "assalamu alaykum", meaning: "peace be upon you" },
  { phrase: "wa alaykumu assalam", meaning: "and peace be upon you too" },
  { phrase: "bikhayr shukran", meaning: "I am well, thank you" },
  { phrase: "ma'a as-salama", meaning: "goodbye" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Khadija: Assalamu alaykum! Ayna ", after: "?", correct: "taskun" },
  { before: "Khadija: Maa ismu ", after: "?", correct: "sadeeqak" },
  { before: "Bilal: Ismu sadeeqi ", after: ".", correct: "Hassan" },
  { before: "Bilal: ", after: " shukran! Ma'a as-salama.", correct: "Bikhayr" },
  { before: "The Arabic phrase for \"where do you live?\" is ", after: ".", correct: "ayna taskun" },
];

const CATEGORY_ITEMS: { label: string; bucket: "Question" | "Answer" }[] = [
  { label: "ayna taskun?", bucket: "Question" },
  { label: "maa ismu sadeeqak?", bucket: "Question" },
  { label: "keyfa haaluka?", bucket: "Question" },
  { label: "askunu qariban min al-madrasa", bucket: "Answer" },
  { label: "ismu sadeeqi Hassan", bucket: "Answer" },
  { label: "bikhayr shukran", bucket: "Answer" },
];

export const greetingsSpeaking: Skill = {
  id: "g7-ar-ls-greetings",
  code: "LS.1",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Listening for gist: greetings and introductions",
  description: "Listen to a spoken Arabic greeting exchange, identify its main idea, and practise answering simple introduction questions.",
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
        prompt: "Sort each expression as a Question or an Answer.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Question", label: "Question" },
          { id: "Answer", label: "Answer" },
        ],
        correctBucket,
        hint: "A question asks for information; an answer gives it.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is a${s.bucket === "Answer" ? "n" : ""} ${s.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each spoken greeting expression to its English meaning.",
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
        prompt: "Put these lines from the spoken exchange in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Khadija greets and asks where Bilal lives first, then asks about his friend, then how he is.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        speakable: true,
        prompt: "Fill in the missing word from the exchange.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Reread the matching line in the exchange above.",
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
