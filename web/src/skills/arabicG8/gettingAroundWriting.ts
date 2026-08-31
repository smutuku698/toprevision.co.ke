import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DIALOGUE_SETS: { lines: string[] }[] = [
  {
    lines: [
      "A: How shall we travel to the market today?",
      "B: Let's go by bus (haafila), it is cheap.",
      "A: Good idea. Is the bus (haafila) coming soon?",
      "B: Yes, it arrives in five minutes.",
    ],
  },
  {
    lines: [
      "A: Shall we take the train (qitaar) or the car (sayyara) to the city?",
      "B: The train (qitaar) is faster today.",
      "A: Then let's go to the station now.",
      "B: Agreed, let's not be late.",
    ],
  },
  {
    lines: [
      "A: It's a short distance, shall we go on foot (mashyan)?",
      "B: Yes, walking is good exercise.",
      "A: Or we could ride our bicycles (darraja).",
      "B: A bicycle (darraja) ride sounds fun too!",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'car' is written as ", after: ".", answer: "sayyara" },
  { before: "In Arabic, 'bus' is written as ", after: ".", answer: "haafila" },
  { before: "In Arabic, 'train' is written as ", after: ".", answer: "qitaar" },
  { before: "In Arabic, 'airplane' is written as ", after: ".", answer: "tayyaara" },
  { before: "In Arabic, 'bicycle' is written as ", after: ".", answer: "darraja" },
  { before: "In Arabic, 'on foot' is written as ", after: ".", answer: "mashyan" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'train'?",
    correct: "qitaar",
    distractors: ["haafila", "sayyara", "tayyaara"],
    explanation: "'qitaar' means train; 'haafila' is bus, 'sayyara' is car, and 'tayyaara' is airplane.",
  },
  {
    prompt: "Which word means 'airplane'?",
    correct: "tayyaara",
    distractors: ["darraja", "mashyan", "qitaar"],
    explanation: "'tayyaara' means airplane; 'darraja' is bicycle, 'mashyan' is on foot, and 'qitaar' is train.",
  },
  {
    prompt: "In a dialogue about getting around, which line best responds to 'How shall we travel to the market today?'",
    correct: "Let's go by bus (haafila), it is cheap.",
    distractors: ["My name is Ahmad.", "The weather is very hot today.", "I have three brothers."],
    explanation: "A good dialogue response stays on topic — replying with a transport suggestion directly answers the question about how to travel.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "sayyara", meaning: "car" },
  { term: "haafila", meaning: "bus" },
  { term: "qitaar", meaning: "train" },
  { term: "tayyaara", meaning: "airplane" },
  { term: "darraja", meaning: "bicycle" },
  { term: "mashyan", meaning: "on foot" },
];

export const gettingAroundWriting: Skill = {
  id: "g8-ar-w-getting-around",
  code: "W.9",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing a dialogue about getting around",
  description: "Practise romanized Arabic transport vocabulary for creative dialogue writing: order a two-person dialogue, fill in words, and match meanings.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "fill", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, DIALOGUE_SETS);
      const items = shuffle(rng, set.lines.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.lines.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the lines to form a logical dialogue about getting around.",
        instruction: "Click the lines in the correct spoken order.",
        items,
        correctOrder,
        hint: "Follow the conversation: a question from A is usually answered by B.",
        explanation: `The correctly ordered dialogue is: "${set.lines.join(" ")}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about the meaning of each transport word, or which reply stays on topic.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each romanized Arabic transport word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'qitaar' and 'tayyaara' both start with a consonant cluster but travel very differently.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing Arabic word to complete the sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the transport words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
