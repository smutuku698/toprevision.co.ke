import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Otieno: What do you like to do in your free time?",
  "Njeri: I love al-qiraa'a and ar-rasm.",
  "Otieno: Do you play kurat al-qadam?",
  "Njeri: Sometimes! I also enjoy as-sibaaha and al-musiqa.",
  "Otieno: Do you like as-safar?",
  "Njeri: Yes, I love as-safar — we are going on a ar-rihla soon!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to the conversation. What two activities does Njeri say she loves first?",
    correct: "al-qiraa'a (reading) and ar-rasm (drawing)",
    distractors: [
      "as-sibaaha (swimming) and al-musiqa (music)",
      "kurat al-qadam (football) and as-safar (travel)",
      "ar-rihla (a trip) and al-musiqa (music)",
    ],
    explanation: "Njeri says, \"I love al-qiraa'a and ar-rasm.\"",
  },
  {
    q: "How often does Njeri say she plays kurat al-qadam?",
    correct: "Sometimes",
    distractors: ["Every day", "Never", "Only on holidays"],
    explanation: "Njeri answers Otieno's question with \"Sometimes!\"",
  },
  {
    q: "What does Njeri say she also enjoys, besides reading and drawing?",
    correct: "as-sibaaha (swimming) and al-musiqa (music)",
    distractors: ["kurat al-qadam (football) only", "as-safar (travel) only", "Nothing else"],
    explanation: "Njeri says, \"I also enjoy as-sibaaha and al-musiqa.\"",
  },
  {
    q: "What is Njeri going on soon, according to the conversation?",
    correct: "A ar-rihla (trip / excursion)",
    distractors: ["A new madrasa", "A move to a new bayt", "Nothing special"],
    explanation: "Njeri says, \"we are going on a ar-rihla soon!\"",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Active" | "Calm" }[] = [
  { label: "as-sibaaha", bucket: "Active" },
  { label: "kurat al-qadam", bucket: "Active" },
  { label: "al-qiraa'a", bucket: "Calm" },
  { label: "ar-rasm", bucket: "Calm" },
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

export const funSpeaking: Skill = {
  id: "g8-ar-ls-fun",
  code: "LS.5",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: leisure and hobbies",
  description: "Listen to Otieno and Njeri talk about hobbies out loud, answer comprehension questions, and practise saying hobby words yourself.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each hobby word as an Active or a Calm activity.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Active", label: "Active" },
          { id: "Calm", label: "Calm" },
        ],
        correctBucket,
        hint: "An active hobby moves your whole body; a calm hobby can be done sitting still.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is ${s.bucket === "Active" ? "an active" : "a calm"} activity.`).join(" "),
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
        prompt: "Match each spoken hobby word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each hobby word aloud to yourself before matching it.",
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
        speakable: true,
        prompt: "Put these lines from the spoken conversation in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Otieno asks a question, Njeri answers, then Otieno asks again, and so on.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Listen for what Njeri says she enjoys doing in each line.",
      explanation: q.explanation,
    };
  },
};
