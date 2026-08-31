import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PERIODS = [
  { id: "early", label: "Early Stone Age — simple, roughly-shaped pebble tools and choppers used mainly for basic cutting and pounding" },
  { id: "middle", label: "Middle Stone Age — more refined tools like points and scrapers, made using the prepared-core technique" },
  { id: "late", label: "Late Stone Age — small, finely-made tools (microliths) and bone tools for specialised hunting and fishing" },
];

type Period = "early" | "middle" | "late";

const PRACTICES: { text: string; period: Period }[] = [
  { text: "Making simple, roughly-shaped pebble tools and choppers", period: "early" },
  { text: "Hunting and gathering wild plants for food", period: "early" },
  { text: "Living a nomadic life, moving to follow food sources", period: "early" },
  { text: "Sheltering in caves and other natural shelters", period: "early" },
  { text: "Shaping tools using the prepared-core technique", period: "middle" },
  { text: "Making refined points and scrapers for organised hunting", period: "middle" },
  { text: "Controlled use of fire for cooking and warmth", period: "middle" },
  { text: "Early symbolic behaviour, such as using ochre pigment", period: "middle" },
  { text: "Making small, finely-worked tools called microliths", period: "late" },
  { text: "Making bone tools for specialised hunting and fishing", period: "late" },
  { text: "Creating rock art and paintings", period: "late" },
  { text: "Living in more settled, semi-permanent camps", period: "late" },
  { text: "Exchanging goods with neighbouring groups", period: "late" },
];

const PERIOD_LABEL: Record<Period, string> = {
  early: "Early Stone Age",
  middle: "Middle Stone Age",
  late: "Late Stone Age",
};

const FILL_BLANK_TEMPLATES = [
  { before: "A simple, roughly-shaped stone tool used for basic cutting and pounding is called a ", after: ".", correctAnswer: "chopper", accepted: ["chopper"], explanation: "A chopper is a simple, roughly-shaped stone tool used for basic cutting and pounding, typical of the Early Stone Age." },
  { before: "A small, finely-worked stone tool from the Late Stone Age is called a ", after: ".", correctAnswer: "microlith", accepted: ["microlith"], explanation: "A microlith is a small, finely-worked stone tool typical of the Late Stone Age, used for specialised tasks like hunting and fishing." },
  { before: "Moving from place to place instead of settling permanently, in search of food, describes a ", after: " way of life.", correctAnswer: "nomadic", accepted: ["nomadic"], explanation: "A nomadic way of life means moving from place to place in search of food, typical of the Early Stone Age." },
  { before: "Obtaining food directly from nature, by hunting animals and gathering plants, is called hunting and ", after: ".", correctAnswer: "gathering", accepted: ["gathering"], explanation: "Hunting and gathering means obtaining food directly from nature by hunting animals and gathering wild plants." },
  { before: "A natural reddish-brown pigment used by Middle Stone Age humans, possibly for symbolic purposes, is called ", after: ".", correctAnswer: "ochre", accepted: ["ochre"], explanation: "Ochre is a natural reddish-brown pigment used by Middle Stone Age humans, likely for symbolic or decorative purposes." },
] as const;

const MODERN_IMPACT_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "How does Stone Age toolmaking connect to modern society?",
    choices: ["It represents the earliest foundation of human technology and innovation", "It has no connection to modern life at all", "It only matters to museum curators", "It proves early humans never needed tools"],
    correctIndex: 0,
    explanation: "Stone Age toolmaking was the earliest form of human technology — the same problem-solving instinct underlies all technological innovation since.",
  },
  {
    prompt: "How does the Stone Age discovery of controlled fire use still affect modern society?",
    choices: ["Cooking, heating, and many manufacturing processes still rely on controlled fire and energy use", "Fire has never been used by humans since the Stone Age", "Modern society has no use for fire at all", "It only affected Stone Age diets, with no lasting effect"],
    correctIndex: 0,
    explanation: "Controlled use of fire, first mastered in the Stone Age, remains fundamental to cooking, heating, and much of modern industry.",
  },
  {
    prompt: "Why are Late Stone Age rock art sites valuable to modern society?",
    choices: ["They provide a historical record of early human life, beliefs, and culture", "They have no historical value at all", "They only matter for tourism income", "They prove early humans could not communicate"],
    correctIndex: 0,
    explanation: "Rock art gives historians and archaeologists a direct record of early human life, beliefs, and culture that would otherwise be lost.",
  },
];

export const stoneAgePractices: Skill = {
  id: "ss-pr-stone-age",
  code: "PR.1",
  subjectId: "social-studies",
  strandId: "ss-pr",
  grade: 9,
  title: "Socio-economic practices of early humans",
  description: "Order the Stone Age periods and their tool-making practices in Africa.",
  generate(rng) {
    const hint = "Toolmaking became more refined and specialised over time — from simple choppers to fine microliths.";
    const branch = randChoice(rng, ["period-mc", "order", "categorize", "match", "modern-impact", "fill-blank"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about Stone Age socio-economic practices.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe Stone Age tools and ways of life.",
        explanation: fb.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PRACTICES).slice(0, 6);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.period));
      return {
        kind: "categorize",
        prompt: "Sort each socio-economic practice by the Stone Age period it belongs to.",
        items,
        buckets: (["early", "middle", "late"] as Period[]).map((p) => ({ id: p, label: PERIOD_LABEL[p] })),
        correctBucket,
        hint: "Tools and practices became more refined and specialised over time — from simple choppers to fine microliths and settled camps.",
        explanation: chosen.map((p) => `"${p.text}" — ${PERIOD_LABEL[p.period]}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PRACTICES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.text })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: PERIOD_LABEL[p.period] })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each socio-economic practice to its Stone Age period.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how tools, shelter, and daily life changed as the Stone Age progressed.",
        explanation: chosen.map((p) => `"${p.text}" — ${PERIOD_LABEL[p.period]}.`).join(" "),
      };
    }

    if (branch === "modern-impact") {
      const q = randChoice(rng, MODERN_IMPACT_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think about which basic human technologies and traditions trace back to Stone Age innovations.",
        explanation: q.explanation,
      };
    }

    if (branch === "period-mc") {
      const target = randChoice(rng, PERIODS);
      const choices = shuffle(rng, PERIODS.map((p) => p.label));

      return {
        kind: "multiple-choice",
        prompt: `Which Stone Age period does this describe: "${target.label.split(" — ")[1]}"?`,
        choices: choices.map((c) => c.split(" — ")[0]),
        correctIndex: choices.map((c) => c.split(" — ")[0]).indexOf(target.label.split(" — ")[0]),
        layout: "list",
        hint,
        explanation: PERIODS.map((p, i) => `${i + 1}. ${p.label}.`).join(" "),
      };
    }

    const shuffled = shuffle(rng, PERIODS);
    return {
      kind: "ordering",
      prompt: "Arrange these Stone Age periods and their tool-making practices in chronological order.",
      instruction: "Drag to put the periods in order, from earliest to most recent.",
      items: shuffled.map((p) => ({ id: p.id, label: p.label })),
      correctOrder: PERIODS.map((p) => p.id),
      hint,
      explanation: PERIODS.map((p, i) => `${i + 1}. ${p.label}.`).join(" "),
    };
  },
};
