import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STATEMENTS: { label: string; bucket: "breaststroke" | "treading" }[] = [
  { label: "Performed lying on the back, with an inverted (upside-down) leg and arm action", bucket: "breaststroke" },
  { label: "A stroke used for forward movement through the water", bucket: "breaststroke" },
  { label: "Keeps the body upright and afloat without moving forward", bucket: "treading" },
  { label: "Involves a repeated cycling or scissor-like leg motion to stay vertical", bucket: "treading" },
];

const TERMS = [
  { id: "inverted-breaststroke", label: "Inverted breaststroke", meaning: "A breaststroke performed on the back, with an inverted (upside-down) leg and arm action" },
  { id: "water-treading", label: "Water treading", meaning: "A technique used to stay afloat vertically in water without moving forward, often for life-saving" },
  { id: "life-saving", label: "Life-saving use", meaning: "Staying afloat safely near a person in difficulty, or keeping oneself afloat while awaiting help" },
  { id: "body-position", label: "Body position (treading)", meaning: "The body stays upright with the head above water, arms and legs moving continuously for support" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What is the inverted breaststroke technique in swimming?", correct: "A breaststroke performed lying on the back, with an inverted (upside-down) leg and arm action", distractors: ["A stroke swum entirely underwater with no breathing", "A stroke performed only using the arms, with legs kept still", "The same as front crawl, but slower"] },
  { q: "What is water treading used for?", correct: "Staying afloat vertically in water without forward movement, often as a life-saving skill", distractors: ["Moving forward as fast as possible through the water", "Diving to the bottom of a pool", "Only used for competitive racing"] },
  { q: "Why is water treading skill important?", correct: "It lets a swimmer stay safely afloat in one place, which can be vital when waiting for help or supporting someone else", distractors: ["It has no real safety application", "It is only used to warm up before a race", "It is only relevant for professional swimmers"] },
  { q: "How is the inverted breaststroke used in life saving?", correct: "It can let a rescuer swim on their back while keeping a person they are helping visible and supported", distractors: ["It has no life-saving application at all", "It can only be performed by trained lifeguards, never practised by others", "It is used only for competitive swimming events"] },
  { q: "What body position is used during water treading?", correct: "Upright, with the head above the water, arms and legs moving continuously for support", distractors: ["Lying flat and completely still", "Face down with no arm or leg movement", "Upside down, feet above the surface"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into Inverted breaststroke or Water treading.",
  "Which category does each description below belong to? Sort them.",
  "Classify each description as Inverted breaststroke or Water treading.",
  "Decide whether each description is the stroke or treading, and sort it.",
  "Sort these descriptions by which technique they describe.",
] as const;

const MATCH_PROMPTS = [
  "Match each swimming term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each swimming term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const NAME_PROMPTS = [
  "Name the swimming technique being described.",
  "Identify the swimming technique from this description.",
  "Which swimming technique does this describe?",
  "Read the description and name the technique.",
  "What is this swimming technique called?",
] as const;

export const swimming: Skill = {
  id: "g8-cas-swimming",
  code: "C.12",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Swimming",
  description: "Inverted breaststroke and water treading techniques, and their importance for life saving.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "fill-blank", "theory-mc"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, STATEMENTS);
      const correctBucket: Record<string, string> = {};
      for (const s of items) correctBucket[s.label] = s.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((s) => ({ id: s.label, label: s.label })),
        buckets: [
          { id: "breaststroke", label: "Inverted breaststroke" },
          { id: "treading", label: "Water treading" },
        ],
        correctBucket,
        hint: "The inverted breaststroke moves a swimmer forward; water treading keeps a swimmer in one place.",
        explanation: items.map((s) => `"${s.label}" describes ${s.bucket === "breaststroke" ? "the inverted breaststroke" : "water treading"}.`).join(" "),
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The inverted breaststroke moves a swimmer; water treading keeps one afloat in place.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, NAME_PROMPTS),
        before: "___",
        after: "is a technique used to stay afloat vertically in water without forward movement, often used for life saving.",
        correctAnswer: "Water treading",
        inputMode: "text",
        hint: "This is not a stroke that moves you forward — it keeps you in one place.",
        explanation: "Water treading keeps a swimmer upright and afloat in one place without moving forward, an important life-saving skill.",
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "The inverted breaststroke moves a swimmer forward on their back; water treading keeps a swimmer in place.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
