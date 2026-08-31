import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LULLABY =
  "Sleep now, sleep now, my little one, sleep,\nThe cattle are resting, the moon climbing steep.\nGrow tall and gentle, my little one, sleep,\nFar from the drink that makes strong men weep.\n\nSleep now, sleep now, my little one, sleep,\nYour father walks home, no bottle to keep.\nChoose clean hands and a clear mind, sleep,\nMy little one, sleep, my little one, sleep.\n\nSleep now, sleep now, my little one, sleep,\nThe stars are your guardians, watching you sleep.\nGrow far from the smoke that steals a man's mind,\nMy little one, sleep, and leave sorrow behind.";

const REFRAIN_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which phrase is repeated throughout the lullaby, and what effect does it create?",
    correct: "\"my little one, sleep\" — its repetition creates a soothing, rhythmic effect that helps lull a child to sleep",
    distractors: [
      "\"my little one, sleep\" — its repetition is meant to frighten the child",
      "\"the moon climbing steep\" — its repetition builds suspense about danger",
      "\"strong men weep\" — its repetition makes the song comical",
    ],
    explanation: "The phrase 'my little one, sleep' returns in every stanza; in a lullaby, this steady, gentle repetition calms and soothes a child rather than creating suspense or humour.",
  },
  {
    q: "Which opening words are repeated at the start of every stanza?",
    correct: "\"Sleep now, sleep now\"",
    distractors: ["\"Grow tall and gentle\"", "\"Choose clean hands\"", "\"The stars are your guardians\""],
    explanation: "Each stanza of the lullaby opens with 'Sleep now, sleep now,' anchoring the song's soothing, repetitive rhythm.",
  },
];

const MESSAGE_MATCH: { line: string; message: string }[] = [
  { line: "Far from the drink that makes strong men weep", message: "Warns against the harm of alcohol abuse" },
  { line: "Choose clean hands and a clear mind, sleep", message: "Encourages a healthy life, free from harmful substances" },
  { line: "Grow far from the smoke that steals a man's mind", message: "Warns against the harm of smoking or substance abuse" },
];

const REPETITION_FUNCTIONS: { text: string; category: "rhythm" | "memorability" | "emphasis" | "soothing" }[] = [
  { text: "A lullaby's soft 'sleep, sleep' repeated gently to calm a crying baby", category: "soothing" },
  { text: "A praise song repeating a hero's name so the audience remembers it after the performance", category: "memorability" },
  { text: "A song's steady repeated beat that helps dancers keep time together", category: "rhythm" },
  { text: "A singer repeating 'Never, never!' to stress how strongly they feel about something", category: "emphasis" },
];

const IMPORTANCE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why are lullabies with messages like this one important in real life?",
    correct: "They gently pass on values and health messages to children from an early age, in a form they will remember",
    distractors: [
      "They exist only to keep parents occupied with no real purpose",
      "They are meant to be forgotten as soon as the child falls asleep",
      "They are only sung in formal school settings, never at home",
    ],
    explanation: "Sung softly and often, lullabies plant ideas — like avoiding alcohol and drugs and choosing a clear mind — early and memorably in a child's life.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Sleep now, sleep now, my little one, sleep,\nThe cattle are resting, the moon climbing", after: ".", correctAnswer: "steep" },
  { before: "Your father walks home, no bottle to keep.\nChoose clean hands and a clear", after: ", sleep,", correctAnswer: "mind" },
  { before: "Grow far from the smoke that steals a man's mind,\nMy little one, sleep, and leave sorrow", after: ".", correctAnswer: "behind" },
];

export const oralLiteratureLullabies: Skill = {
  id: "g7-eng-r-oral-literature-lullabies",
  code: "R.21",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Oral Literature: Songs — Lullabies",
  description: "Identify repeated words and phrases in lullabies, pick out key messages, and appreciate the importance of lullabies, including their role in health messaging.",
  generate(rng) {
    const branch = randChoice(rng, ["refrain", "match", "function", "importance", "fill"] as const);
    const hint = "Lullabies use gentle repetition to soothe a child while quietly passing on an important message.";

    if (branch === "refrain") {
      const entry = randChoice(rng, REFRAIN_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: LULLABY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, MESSAGE_MATCH.map((m, i) => ({ id: `m${i}`, label: m.line })));
      const targets = shuffle(rng, MESSAGE_MATCH.map((m, i) => ({ id: `m${i}`, label: m.message })));
      const correctMap: Record<string, string> = {};
      MESSAGE_MATCH.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each line from the lullaby to the health message it carries.",
        passage: LULLABY,
        tokens,
        targets,
        correctMap,
        hint: "Each line quietly warns against a harmful habit or encourages a healthy one.",
        explanation: MESSAGE_MATCH.map((m) => `"${m.line}" — ${m.message.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "function") {
      const chosen = shuffle(rng, REPETITION_FUNCTIONS);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each example by the main function repetition serves in that oral song.",
        items,
        buckets: [
          { id: "rhythm", label: "Rhythm" },
          { id: "memorability", label: "Memorability" },
          { id: "emphasis", label: "Emphasis" },
          { id: "soothing", label: "Soothing" },
        ],
        correctBucket,
        hint: "Ask: does this repetition calm someone, help them remember, keep a beat, or stress a feeling?",
        explanation: chosen.map((c) => `"${c.text}" mainly serves ${c.category}.`).join(" "),
      };
    }

    if (branch === "importance") {
      const entry = randChoice(rng, IMPORTANCE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: LULLABY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about who sings lullabies, when, and what young children absorb from repeated songs.",
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the lullaby.",
      passage: LULLABY,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Look for the exact word in the lullaby above, and notice how it rhymes.",
      explanation: `The lullaby reads: "...${entry.correctAnswer}${entry.after}"`,
    };
  },
};
