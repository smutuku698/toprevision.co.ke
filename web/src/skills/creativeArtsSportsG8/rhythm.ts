import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TIME_FEEL: { label: string; bucket: "3/4" | "4/4" }[] = [
  { label: "Three crotchet beats per bar", bucket: "3/4" },
  { label: "Often nicknamed 'waltz time'", bucket: "3/4" },
  { label: "Feels like STRONG-weak-weak", bucket: "3/4" },
  { label: "Common in dance music like the waltz", bucket: "3/4" },
  { label: "Four crotchet beats per bar", bucket: "4/4" },
  { label: "Also called 'common time'", bucket: "4/4" },
  { label: "Feels like STRONG-weak-medium-weak", bucket: "4/4" },
  { label: "Common in marches and much pop music", bucket: "4/4" },
];

const TERMS = [
  { id: "bar", label: "Bar (measure)", meaning: "A group of beats marked off by vertical lines through the staff" },
  { id: "time-sig", label: "Time signature", meaning: "The two numbers at the start of a piece showing how many beats are in a bar and which note value counts as one beat" },
  { id: "crotchet-beat", label: "Crotchet beat", meaning: "The basic, steady pulse counted in most simple time signatures, including 3/4" },
  { id: "phrase", label: "4-bar phrase", meaning: "A short musical idea spanning four bars, often used as a natural phrase length when composing" },
  { id: "waltz", label: "Waltz time", meaning: "A common nickname for 3/4 time, because of its long association with the waltz dance" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "How would you describe 3/4 time?", correct: "A time signature with three crotchet beats in every bar", distractors: ["A time signature with four crotchet beats in every bar", "A time signature with no fixed number of beats per bar", "A tempo marking, not a time signature"] },
  { q: "What role does rhythm play in day-to-day life?", correct: "It organises movement and sound into a pattern people can feel, walk, dance, or work to", distractors: ["It has no connection to everyday activities", "It only matters inside a music classroom", "It only applies to written music, never to speech or movement"] },
  { q: "Why is composing a rhythmic pattern in 3/4 time useful practice?", correct: "It builds the skill of fitting note values correctly into a fixed number of beats per bar", distractors: ["It has no real musical purpose", "It removes the need to ever count beats", "It only applies to instruments, never to singing"] },
  { q: "What distinguishes a 4-bar rhythmic pattern from a single bar?", correct: "It repeats the counting of beats-per-bar across four separate bars to form one longer phrase", distractors: ["It has four times as many beats in a single bar", "It uses a completely different time signature for each bar", "It removes the need for a time signature"] },
  { q: "In 3/4 time, which beat of the bar is usually felt as the strongest?", correct: "The first beat", distractors: ["The second beat", "The third beat", "All three beats are always equally strong"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into 3/4 time or 4/4 time.",
  "Which time signature does each description below fit? Sort them.",
  "Classify each description as 3/4 time or 4/4 time.",
  "Decide whether each description is 3/4 or 4/4 time, and sort it.",
  "Sort these descriptions by the time signature they describe.",
] as const;

const MATCH_PROMPTS = [
  "Match each rhythm/time term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each rhythm/time term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const BEATS_PER_BAR_PROMPTS = [
  "How many crotchet beats does each bar contain in 3/4 time?",
  "In 3/4 time, how many crotchet beats are in every bar?",
  "Each bar in 3/4 time holds how many crotchet beats?",
  "What is the number of crotchet beats per bar in 3/4 time?",
  "In 3/4 time, count the crotchet beats in a single bar.",
] as const;

const TOTAL_BEATS_PROMPTS = [
  "A rhythmic pattern in 3/4 time is written across {bars} bars. Click the point showing the total number of beats in the whole pattern.",
  "Across {bars} bars of 3/4 time, how many beats does the pattern total? Click the number line.",
  "A pattern spans {bars} bars in 3/4 time. Click the number line to show the total beats.",
  "How many beats total across {bars} bars of 3/4 time? Mark it on the number line.",
  "Click the point showing the total beats in a {bars}-bar pattern written in 3/4 time.",
] as const;

export const rhythm: Skill = {
  id: "g8-cas-rhythm",
  code: "C.2",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Rhythm",
  description: "Describing 3/4 time, composing 4-bar rhythmic patterns, and the role of rhythm in daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "beats-per-bar", "total-beats", "theory-mc"] as const);

    if (branch === "categorize") {
      const threeFour = shuffle(rng, TIME_FEEL.filter((t) => t.bucket === "3/4")).slice(0, 3);
      const fourFour = shuffle(rng, TIME_FEEL.filter((t) => t.bucket === "4/4")).slice(0, 3);
      const items = shuffle(rng, [...threeFour, ...fourFour]);
      const correctBucket: Record<string, string> = {};
      for (const t of items) correctBucket[t.label] = t.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((t) => ({ id: t.label, label: t.label })),
        buckets: [
          { id: "3/4", label: "3/4 time" },
          { id: "4/4", label: "4/4 time" },
        ],
        correctBucket,
        hint: "3/4 time has three beats per bar and a STRONG-weak-weak feel; 4/4 has four beats per bar.",
        explanation: items.map((t) => `"${t.label}" describes ${t.bucket} time.`).join(" "),
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
        hint: "A bar is marked by barlines; a time signature tells you the beats-per-bar and beat value.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "beats-per-bar") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, BEATS_PER_BAR_PROMPTS),
        before: "In 3/4 time, each bar contains",
        after: "crotchet beats.",
        correctAnswer: "3",
        inputMode: "numeric",
        hint: "The top number of a time signature tells you the number of beats per bar.",
        explanation: "In 3/4 time, the top '3' means every bar contains three crotchet beats.",
      };
    }

    if (branch === "total-beats") {
      const bars = randInt(rng, 2, 6);
      const total = bars * 3;
      return {
        kind: "number-line",
        prompt: randChoice(rng, TOTAL_BEATS_PROMPTS).replace("{bars}", String(bars)),
        hint: "Multiply the number of bars by the number of beats in each bar (3, since this is 3/4 time).",
        min: 0,
        max: 20,
        step: 1,
        correctValue: total,
        mode: "point",
        explanation: `${bars} bars × 3 beats per bar = ${total} beats in total.`,
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
      hint: "3/4 time has three beats per bar, with the first beat usually felt as the strongest.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
