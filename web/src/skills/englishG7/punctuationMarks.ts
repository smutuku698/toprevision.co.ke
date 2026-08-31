import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type MarkType = "statement" | "question" | "exclamation";
const MARK_OF: Record<MarkType, string> = { statement: ".", question: "?", exclamation: "!" };

const TYPE_INFO: { id: MarkType; label: string; description: string; example: string }[] = [
  { id: "statement", label: "Statement", description: "Makes a statement, gives a fact, or an instruction — ends with a full stop", example: "Regular hand washing prevents the spread of germs." },
  { id: "question", label: "Question", description: "Asks something directly — ends with a question mark", example: "Why should we boil drinking water before use?" },
  { id: "exclamation", label: "Exclamation", description: "Shows strong feeling, surprise, or urgency — ends with an exclamation mark", example: "Never touch a live wire!" },
];

const SENTENCES: { text: string; type: MarkType }[] = [
  { text: "Regular hand washing prevents the spread of germs", type: "statement" },
  { text: "Malaria is spread by the female Anopheles mosquito", type: "statement" },
  { text: "Wash your hands before every meal", type: "statement" },
  { text: "The doctor examined the patient carefully", type: "statement" },
  { text: "Drink plenty of clean water every day", type: "statement" },
  { text: "Why should we boil drinking water before use", type: "question" },
  { text: "What causes tooth decay", type: "question" },
  { text: "How many bones are in the human body", type: "question" },
  { text: "Do mosquitoes only bite at night", type: "question" },
  { text: "Which vitamin prevents scurvy", type: "question" },
  { text: "Wow, the human heart beats about 100,000 times a day", type: "exclamation" },
  { text: "Never touch a live wire", type: "exclamation" },
  { text: "That is amazing, the vaccine saved thousands of lives", type: "exclamation" },
  { text: "Watch out, the Bunsen burner flame is very hot", type: "exclamation" },
  { text: "Stop, that water is not safe to drink", type: "exclamation" },
];

const PASSAGES: { correct: string; distractors: string[] }[] = [
  {
    correct: "Malaria is spread by mosquitoes. How can we prevent it? Always sleep under a treated mosquito net!",
    distractors: [
      "Malaria is spread by mosquitoes? How can we prevent it. Always sleep under a treated mosquito net!",
      "Malaria is spread by mosquitoes. How can we prevent it! Always sleep under a treated mosquito net.",
      "Malaria is spread by mosquitoes! How can we prevent it? Always sleep under a treated mosquito net?",
    ],
  },
  {
    correct: "Germs spread quickly in a dirty kitchen. Have you washed your hands? Please wash them now!",
    distractors: [
      "Germs spread quickly in a dirty kitchen! Have you washed your hands. Please wash them now?",
      "Germs spread quickly in a dirty kitchen. Have you washed your hands! Please wash them now.",
      "Germs spread quickly in a dirty kitchen? Have you washed your hands? Please wash them now?",
    ],
  },
  {
    correct: "Vaccines protect children from deadly diseases. Has your baby been immunised? Visit the clinic today!",
    distractors: [
      "Vaccines protect children from deadly diseases! Has your baby been immunised. Visit the clinic today?",
      "Vaccines protect children from deadly diseases. Has your baby been immunised! Visit the clinic today.",
      "Vaccines protect children from deadly diseases? Has your baby been immunised? Visit the clinic today?",
    ],
  },
  {
    correct: "A balanced diet keeps the body healthy. Do you eat vegetables every day? Add more greens to your plate!",
    distractors: [
      "A balanced diet keeps the body healthy? Do you eat vegetables every day. Add more greens to your plate!",
      "A balanced diet keeps the body healthy. Do you eat vegetables every day! Add more greens to your plate.",
      "A balanced diet keeps the body healthy! Do you eat vegetables every day? Add more greens to your plate?",
    ],
  },
];

export const punctuationMarks: Skill = {
  id: "g7-eng-w-punctuation-marks",
  code: "W.2",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Mechanics of Writing: Punctuation Marks",
  description: "Recognise and correctly use the full stop, question mark, and exclamation mark in science- and health-themed sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["choose-mark-mc", "fill", "categorize", "passage-mc", "match"] as const);
    const hint = "A statement or instruction ends with a full stop (.), a direct question ends with a question mark (?), and strong feeling or urgency ends with an exclamation mark (!).";

    if (branch === "choose-mark-mc") {
      const entry = randChoice(rng, SENTENCES);
      const choices = shuffle(rng, [".", "?", "!"]);
      return {
        kind: "multiple-choice",
        prompt: `Which end punctuation mark correctly completes this sentence? "${entry.text}___"`,
        choices,
        correctIndex: choices.indexOf(MARK_OF[entry.type]),
        layout: "row",
        hint,
        explanation: `"${entry.text}${MARK_OF[entry.type]}" — this is a${entry.type === "exclamation" ? "n" : ""} ${entry.type}, so it needs "${MARK_OF[entry.type]}".`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, SENTENCES);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing end punctuation mark.",
        before: entry.text,
        after: "",
        correctAnswer: MARK_OF[entry.type],
        inputMode: "text",
        hint,
        explanation: `"${entry.text}${MARK_OF[entry.type]}" — this is a${entry.type === "exclamation" ? "n" : ""} ${entry.type}, so it needs "${MARK_OF[entry.type]}".`,
      };
    }

    if (branch === "categorize") {
      const statements = shuffle(rng, SENTENCES.filter((s) => s.type === "statement")).slice(0, 2);
      const questions = shuffle(rng, SENTENCES.filter((s) => s.type === "question")).slice(0, 2);
      const exclamations = shuffle(rng, SENTENCES.filter((s) => s.type === "exclamation")).slice(0, 2);
      const chosen = shuffle(rng, [...statements, ...questions, ...exclamations]);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by which end punctuation mark it needs.",
        items,
        buckets: TYPE_INFO.map((t) => ({ id: t.id, label: `${t.label} (${MARK_OF[t.id]})` })),
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}${MARK_OF[s.type]}" is a${s.type === "exclamation" ? "n" : ""} ${s.type}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TYPE_INFO.map((t) => ({ id: t.id, label: `${t.label} (${MARK_OF[t.id]})` })));
      const targets = shuffle(rng, TYPE_INFO.map((t) => ({ id: t.id, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of TYPE_INFO) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each sentence type to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TYPE_INFO.map((t) => `${t.label}: ${t.description} — e.g. "${t.example}"`).join(" "),
      };
    }

    const entry = randChoice(rng, PASSAGES);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: "Which version of this short passage uses punctuation marks correctly throughout?",
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correctly punctuated passage is: "${entry.correct}"`,
    };
  },
};
