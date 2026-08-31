import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 8.0 The Farm-Cash Crops, sub-strand 8.2 Fluency in Reading:
// Texts of about 400 words; choral reading; readers' theatre. Focus: identify unfamiliar words, read
// accurately, with expression, at the right speed. See curriculum-reference/grade-5/english.json.

type Part = "accuracy" | "rate" | "expression";
const PART_LABEL: Record<Part, string> = {
  accuracy: "Accuracy — reading the words correctly, with few mistakes",
  rate: "Rate — reading at the right speed: not so slow it drags, not so fast it blurs",
  expression: "Expression (prosody) — changing your voice for meaning, pausing at punctuation, sounding interested",
};

const READERS: { desc: string; weak: Part }[] = [
  { desc: "reads every word correctly but so slowly that the meaning is lost by the end of the sentence", weak: "rate" },
  { desc: "reads at a good speed but says 'plantation' as 'plant-nation' and 'cooperative' as 'co-op-rate'", weak: "accuracy" },
  { desc: "reads the words right and at a fair speed, but in a flat voice with no pauses at full stops", weak: "expression" },
  { desc: "rushes so fast that words run together and listeners cannot follow", weak: "rate" },
  { desc: "reads a question exactly like a statement, so you cannot tell it is a question", weak: "expression" },
  { desc: "guesses at 'sisal', 'granary' and 'irrigate' instead of sounding them out", weak: "accuracy" },
];

const IMPROVE_TIPS: { problem: Part; tip: string }[] = [
  { problem: "accuracy", tip: "Learn the tricky words first: point to each one and sound it out before you read the passage aloud." },
  { problem: "rate", tip: "Read a short paragraph aloud each day and try to read it a little more smoothly, not faster, each time." },
  { problem: "expression", tip: "Echo-read after a good model: listen to a sentence, then copy the pauses and the rise and fall of the voice." },
];

export const readingFluency: Skill = {
  id: "g5-eng-reading-fluency",
  code: "R.8",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Reading Fluency",
  description: "Understand the three parts of fluent reading — accuracy, rate and expression — spot which part a reader needs to work on, and know how choral reading and readers' theatre help.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-weak", "fill-part", "sort-part", "match", "order-theatre", "reason-tip"] as const);

    if (branch === "mc-weak") {
      const r = randChoice(rng, READERS);
      const wrong = (["accuracy", "rate", "expression"] as Part[]).filter((p) => p !== r.weak).map((p) => PART_LABEL[p].split(" — ")[0]);
      const { choices, correctIndex } = mcFromCluster(rng, PART_LABEL[r.weak].split(" — ")[0], wrong, 2);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `${name(rng)} ${r.desc}.`, "Which part of fluency does this reader most need to work on?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "Accuracy = right words. Rate = right speed. Expression = right voice and pauses.",
        explanation: `This reader needs to work on ${PART_LABEL[r.weak].split(" — ")[0].toLowerCase()}: ${PART_LABEL[r.weak].split(" — ")[1]}.`,
      };
    }

    if (branch === "fill-part") {
      const p = randChoice(rng, ["accuracy", "rate", "expression"] as Part[]);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the part of fluency (accuracy, rate or expression)"),
        before: `Changing your voice for meaning and pausing at full stops is called `,
        after: p === "expression" ? "." : `, but the part described is ${PART_LABEL[p].split(" — ")[0].toLowerCase()}.`,
        correctAnswer: "expression",
        acceptedAnswers: ["expression", "prosody"],
        inputMode: "text",
        hint: "The three parts are accuracy, rate and expression (prosody).",
        explanation: "Expression (prosody) means reading with feeling — pausing at punctuation, stressing important words, and changing pitch.",
      };
    }

    if (branch === "sort-part") {
      const pool = shuffle(rng, READERS).slice(0, 5);
      const items = pool.map((r, i) => ({ id: `r${i}`, label: `A reader ${r.desc}.` }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((r, i) => (correctBucket[`r${i}`] = r.weak));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which part of fluency each reader needs to improve"),
        items,
        buckets: [
          { id: "accuracy", label: "Accuracy" },
          { id: "rate", label: "Rate (speed)" },
          { id: "expression", label: "Expression" },
        ],
        correctBucket,
        hint: "Wrong words → accuracy. Too slow or too fast → rate. Flat voice, no pauses → expression.",
        explanation: "Fluent reading needs all three: correct words, a comfortable speed, and a voice that shows the meaning.",
      };
    }

    if (branch === "match") {
      const rows = [
        { term: "Accuracy", def: "reading the words correctly" },
        { term: "Rate", def: "reading at a comfortable speed" },
        { term: "Expression", def: "using your voice and pauses to show meaning" },
        { term: "Choral reading", def: "the whole class or group reading a text aloud together" },
        { term: "Readers' theatre", def: "each reader takes a part in a play or poem and reads it aloud" },
      ];
      const pool = shuffle(rng, rows).slice(0, 5);
      const tokens = shuffle(rng, pool.map((r) => ({ id: r.term, label: r.term })));
      const targets = shuffle(rng, pool.map((r) => ({ id: r.term, label: r.def })));
      const correctMap: Record<string, string> = {};
      pool.forEach((r) => (correctMap[r.term] = r.term));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "reading term to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Three terms are parts of fluency; two are activities that build fluency.",
        explanation: pool.map((r) => `${r.term}: ${r.def}`).join("  "),
      };
    }

    if (branch === "order-theatre") {
      const steps = [
        { id: "choose", label: "Choose a short poem or play that can be split into parts" },
        { id: "assign", label: "Assign a part to each member of the group" },
        { id: "practise", label: "Read your own part aloud several times to practise" },
        { id: "perform", label: "Read the parts together for the class, using expression" },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of a readers' theatre activity"),
        instruction: "Click the steps in the correct order.",
        items: shuffle(rng, steps),
        correctOrder: ["choose", "assign", "practise", "perform"],
        hint: "Pick and share the parts, practise, then perform.",
        explanation: "Readers' theatre: choose a text with parts → assign parts → practise your part aloud → perform it with expression.",
      };
    }

    // reason — Apply: choose the tip that fits the reader's weakness.
    const r = randChoice(rng, READERS);
    const tip = IMPROVE_TIPS.find((t) => t.problem === r.weak)!;
    const wrong = IMPROVE_TIPS.filter((t) => t.problem !== r.weak).map((t) => t.tip);
    const { choices, correctIndex } = mcFromCluster(rng, tip.tip, wrong, 2);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `${name(rng)} ${r.desc}.`, "Which tip would help most?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Match the tip to the exact problem: wrong words, wrong speed, or flat voice.",
      explanation: tip.tip,
    };
  },
};
