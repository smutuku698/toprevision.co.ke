import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Fatuma: Masaa al khayr!",
  "Juma: Masaa al khayr! Keyfa haaluka?",
  "Fatuma: Bikhayr shukran! Maa ismuka?",
  "Juma: Ismi Juma. Anaa masruurun biliqaika!",
  "Fatuma: Anaa masruurun biliqaika!",
  "Juma: Ma'a as-salama!",
  "Fatuma: Ma'a as-salama!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to the exchange. What time of day do Fatuma and Juma greet each other?",
    correct: "Evening (masaa al khayr)",
    distractors: ["Morning (sabahal khayr)", "Neither says a time-specific greeting", "Night (there is no greeting used)"],
    explanation: "Both speakers say \"Masaa al khayr\" — Good evening.",
  },
  {
    q: "What does Juma say when Fatuma asks 'Maa ismuka?'",
    correct: "Ismi Juma (My name is Juma)",
    distractors: ["Keyfa haaluka? (How are you?)", "Bikhayr shukran (I am well, thank you)", "He does not answer"],
    explanation: "Juma replies \"Ismi Juma\" — My name is Juma.",
  },
  {
    q: "How does Fatuma say she is feeling when Juma asks 'Keyfa haaluka?'",
    correct: "She is well (Bikhayr shukran)",
    distractors: ["She is tired", "She does not answer", "She says she is unwell"],
    explanation: "Fatuma says \"Bikhayr shukran\" — I am well, thank you.",
  },
  {
    q: "What do both speakers say to close the conversation?",
    correct: "Ma'a as-salama (Goodbye)",
    distractors: ["Masaa al khayr (Good evening)", "Maa ismuka? (What is your name?)", "Anaa masruurun biliqaika (I am pleased to meet you)"],
    explanation: "Both Fatuma and Juma say \"Ma'a as-salama\" to end the conversation.",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Opener" | "Response" }[] = [
  { label: "Assalamu alaykum", bucket: "Opener" },
  { label: "Wa alaykumu assalam", bucket: "Response" },
  { label: "Keyfa haaluka?", bucket: "Opener" },
  { label: "Bikhayr shukran", bucket: "Response" },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Assalamu alaykum", meaning: "Peace be upon you" },
  { phrase: "Wa alaykumu assalam", meaning: "And peace be upon you too" },
  { phrase: "Sabahal khayr", meaning: "Good morning" },
  { phrase: "Masaa al khayr", meaning: "Good evening" },
  { phrase: "Maa ismuka?", meaning: "What is your name?" },
  { phrase: "Keyfa haaluka?", meaning: "How are you?" },
  { phrase: "Bikhayr shukran", meaning: "I am well, thank you" },
  { phrase: "Ma'a as-salama", meaning: "Goodbye" },
];

export const greetingsSpeaking: Skill = {
  id: "g8-ar-ls-greetings",
  code: "LS.1",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: greetings and introductions",
  description: "Listen to a spoken Arabic greeting exchange, then answer comprehension questions and practise the phrases you would say aloud.",
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
        prompt: "Sort each expression as something you would say to Open a conversation or to Respond to someone.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Opener", label: "Opener" },
          { id: "Response", label: "Response" },
        ],
        correctBucket,
        hint: "An opener starts the exchange; a response answers what the other person just said.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is a ${s.bucket === "Opener" ? "conversation opener" : "response"}.`).join(" "),
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
        hint: "Fatuma greets Juma first, then they exchange names, feelings, and finally say goodbye.",
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
      hint: "Imagine hearing each line spoken aloud, one at a time.",
      explanation: q.explanation,
    };
  },
};
