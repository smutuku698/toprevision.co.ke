import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.9 Guided Writing: Paragraph Writing — outlining ideas logically and constructing
// a coherent paragraph, framed around giving directions to a facility in the neighbourhood.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "The Arabic word for \"right\" is ", after: ".", answer: "yameen" },
  { before: "The Arabic word for \"left\" is ", after: ".", answer: "yasaar" },
  { before: "The Arabic word for \"go straight\" is ", after: ".", answer: "idhhab mustaqeem" },
  { before: "The Arabic word for \"stop\" is ", after: ".", answer: "qif" },
  { before: "The Arabic word for \"hospital\" is ", after: ".", answer: "mustashfa" },
  { before: "The Arabic word for \"turn\" is ", after: ".", answer: "in'atif" },
];

const PARAGRAPH_SETS: { sentences: string[] }[] = [
  {
    sentences: [
      "To reach the mustashfa (hospital) from my bayt, first idhhab mustaqeem down the tareeq.",
      "Then in'atif yameen at the masjid.",
      "Continue straight until you see the maktaba on your yasaar.",
      "The mustashfa is right next to the maktaba — qif there.",
    ],
  },
  {
    sentences: [
      "To reach my madrasa from the suuq, idhhab mustaqeem first.",
      "Then in'atif yasaar at the hadiqa.",
      "Walk past the masjid on your yameen.",
      "The madrasa is at the end of the tareeq.",
    ],
  },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means \"go straight\"?",
    correct: "idhhab mustaqeem",
    distractors: ["in'atif", "qif", "yasaar"],
    explanation: "\"idhhab mustaqeem\" means go straight; \"in'atif\" is turn, \"qif\" is stop, and \"yasaar\" is left.",
  },
  {
    prompt: "A visitor asks you to describe the way to the mustashfa (hospital). Which sentence should come first in your paragraph?",
    correct: "To reach the mustashfa from my bayt, first idhhab mustaqeem down the tareeq.",
    distractors: ["The mustashfa is right next to the maktaba.", "Continue straight until you see the maktaba.", "Then in'atif yameen at the masjid."],
    explanation: "A direction-giving paragraph should open by stating the destination and the very first step, not a step in the middle or the final landmark.",
  },
  {
    prompt: "Which word means \"stop\"?",
    correct: "qif",
    distractors: ["yameen", "idhhab mustaqeem", "in'atif"],
    explanation: "\"qif\" means stop; \"yameen\" is right, \"idhhab mustaqeem\" is go straight, and \"in'atif\" is turn.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "yameen", meaning: "right" },
  { term: "yasaar", meaning: "left" },
  { term: "amaam", meaning: "ahead / in front" },
  { term: "qif", meaning: "stop" },
  { term: "idhhab mustaqeem", meaning: "go straight" },
  { term: "in'atif", meaning: "turn" },
  { term: "mustashfa", meaning: "hospital" },
  { term: "masjid", meaning: "mosque" },
];

const CATEGORY_BUCKETS: { id: string; label: string; items: string[] }[] = [
  { id: "direction", label: "Direction word", items: ["yameen", "yasaar", "amaam", "qif", "idhhab mustaqeem", "in'atif"] },
  { id: "facility", label: "Facility / place", items: ["mustashfa", "masjid", "madrasa", "maktaba"] },
];

export const gettingAroundWriting: Skill = {
  id: "g7-ar-w-getting-around",
  code: "W.9",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: paragraph writing (getting around)",
  description: "Practise direction-giving vocabulary and build a simple, coherent paragraph describing the way to a facility in your neighbourhood.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each romanized Arabic direction word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'yameen' (right) and 'yasaar' (left) are opposites — easy to mix up.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const picks: { id: string; label: string; bucket: string }[] = [];
      CATEGORY_BUCKETS.forEach((b) => {
        shuffle(rng, b.items).slice(0, Math.min(4, b.items.length)).forEach((item, i) => picks.push({ id: `${b.id}-${i}-${item}`, label: item, bucket: b.id }));
      });
      const items = shuffle(rng, picks.map((p) => ({ id: p.id, label: p.label })));
      const buckets = CATEGORY_BUCKETS.map((b) => ({ id: b.id, label: b.label }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p) => (correctBucket[p.id] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each word: is it a direction word, or a facility/place?",
        items,
        buckets,
        correctBucket,
        hint: "A direction word tells you which way to move; a facility is a destination.",
        explanation: picks
          .map((p) => `"${p.label}" is a ${CATEGORY_BUCKETS.find((b) => b.id === p.bucket)!.label.toLowerCase()}.`)
          .join(" "),
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, PARAGRAPH_SETS);
      const items = shuffle(rng, set.sentences.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.sentences.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the sentences to form a coherent set of directions to a facility.",
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder,
        hint: "Good directions state the destination and starting point first, then the steps in the order you'd walk them.",
        explanation: `The correctly ordered paragraph is: "${set.sentences.join(" ")}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing Arabic word to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the direction and facility words you've learned.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    const q = randChoice(rng, MC_ITEMS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Think carefully about the exact meaning of each direction word.",
      explanation: q.explanation,
    };
  },
};
