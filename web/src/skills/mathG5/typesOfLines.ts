import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { LINE_ENVIRONMENT_EXAMPLES, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// This engine has no freehand drawing canvas, so the source's "draw horizontal/vertical/perpendicular/
// parallel lines" outcomes are translated honestly into identify/classify-style questions (matching real
// described line pairs to their relationship) rather than literal drawing — a documented scope translation,
// not a silent skip. Grade 5 stops at identify/describe, conceptually — no compass/ruler construction or
// bisection, which is Grade 6 content instead. Capped at 4 QuestionKinds (multiple-choice, click-match,
// categorize, fill-blank): this sub-strand's content (4 named line relationships, no numeric angle/length
// data) doesn't naturally support ordering, hotspot (no suitable labelled diagram), or number-line.

const RELATIONSHIP_DEFINITIONS = [
  { term: "Horizontal line", meaning: "a line that runs flat, side to side, like the horizon" },
  { term: "Vertical line", meaning: "a line that runs straight up and down" },
  { term: "Parallel lines", meaning: "two lines that never meet and stay the same distance apart" },
  { term: "Perpendicular lines", meaning: "two lines that cross each other at a right angle (90°)" },
] as const;

export const typesOfLines: Skill = {
  id: "g5-math-g-lines",
  code: "G.1",
  subjectId: "math",
  strandId: "g5-math-geometry",
  grade: 5,
  title: "Types of lines",
  description: "Identify horizontal, vertical, perpendicular and parallel lines in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "definition-fill-blank", "environment-mc", "click-match", "categorize"] as const);

    if (branch === "identify-mc") {
      const chosen = randChoice(rng, RELATIONSHIP_DEFINITIONS);
      const others = RELATIONSHIP_DEFINITIONS.filter((d) => d.term !== chosen.term);
      const wrong = shuffle(rng, [...others]).slice(0, 3).map((d) => d.term);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, chosen.term, wrong, 3);
      const openers = [
        `A line described as "${chosen.meaning}" is called what?`,
        `What is the name for ${chosen.meaning}?`,
        `Which term describes ${chosen.meaning}?`,
        `If a line (or pair of lines) is ${chosen.meaning}, what is it called?`,
      ];
      const closers = ["", "Choose the correct term.", "Pick the correct name.", "Which term fits?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers).trim(),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about the exact relationship being described — flat vs upright, crossing vs never crossing.",
        explanation: `${chosen.term}: ${chosen.meaning}. The other terms describe different line relationships.`,
      };
    }

    if (branch === "definition-fill-blank") {
      const chosen = randChoice(rng, RELATIONSHIP_DEFINITIONS);
      const openers = [
        `Fill in the term: ${chosen.meaning[0].toUpperCase()}${chosen.meaning.slice(1)} is called a ___ line.`,
        `Complete this: a line (or lines) that is ${chosen.meaning} is called ___.`,
        `${chosen.meaning[0].toUpperCase()}${chosen.meaning.slice(1)} — what is this type of line called?`,
        `Name this type of line: ${chosen.meaning}.`,
      ];
      const closers = ["", "Fill in the missing term.", "What word completes this?", "Give the correct term."];
      const correctTerm = chosen.term.replace(" line", "").replace(" lines", "").toLowerCase();
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "",
        after: "",
        correctAnswer: correctTerm,
        acceptedAnswers: [correctTerm, chosen.term.toLowerCase()],
        inputMode: "text",
        hint: "This is one of four named line relationships: horizontal, vertical, parallel, or perpendicular.",
        explanation: `${chosen.meaning[0].toUpperCase()}${chosen.meaning.slice(1)} — this is called ${correctTerm}.`,
      };
    }

    if (branch === "environment-mc") {
      const entry = randChoice(rng, LINE_ENVIRONMENT_EXAMPLES);
      const object = entry.object.replace("{place}", place(rng));
      const correct = entry.relationship;
      const allRel = ["parallel", "vertical", "horizontal", "perpendicular"];
      const wrong = allRel.filter((r) => r !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, shuffle(rng, wrong).slice(0, 3), 3);
      const openers = [
        `Think about ${object}.`,
        `Consider ${object}.`,
        `Picture ${object}.`,
        `Look at ${object} in your mind.`,
      ];
      const closers = [
        " Which type of line relationship best describes it?",
        " Which line relationship does this show?",
        " What kind of line relationship is this an example of?",
        " Which term best fits this example?",
      ];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Picture the lines involved: do they run flat, run upright, cross at a right angle, or stay the same distance apart?",
        explanation: `${object[0].toUpperCase()}${object.slice(1)} is an example of ${correct} lines.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...RELATIONSHIP_DEFINITIONS]);
      const tokens = chosen.map((d, i) => ({ id: `t${i}`, label: d.term }));
      const targets = shuffle(rng, chosen.map((d, i) => ({ id: `m${i}`, label: d.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      const prompts = [
        "Match each type of line to its meaning.",
        "Pair each line term with its correct meaning.",
        "Match each line relationship to its description.",
        "Connect each line term to its explanation.",
        "Match each line type to what it means.",
        "Pair each term with its correct definition.",
        "Match each line word to its correct meaning.",
        "Link each line relationship to its correct meaning.",
        "Match every line term to its explanation.",
        "Connect each line type with its meaning.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term describes about how the line(s) sit or cross.",
        explanation: chosen.map((d) => `${d.term}: ${d.meaning}`).join("; ") + ".",
      };
    }

    // categorize: sort environment examples by their line relationship (parallel/perpendicular grouping).
    const chosenExamples = shuffle(rng, [...LINE_ENVIRONMENT_EXAMPLES]).slice(0, 6);
    const items = chosenExamples.map((e, i) => ({ id: `e${i}`, label: e.object.replace("{place}", place(rng)) }));
    const buckets = [
      { id: "parallel", label: "Parallel lines" },
      { id: "not-parallel", label: "Not parallel (vertical, horizontal, or perpendicular)" },
    ];
    const correctBucket: Record<string, string> = {};
    chosenExamples.forEach((e, i) => (correctBucket[`e${i}`] = e.relationship === "parallel" ? "parallel" : "not-parallel"));
    const catPrompts = [
      "Sort each example by whether it shows parallel lines.",
      "Group each example as parallel, or not parallel.",
      "Classify each real-life example: parallel lines, or another relationship.",
      "Sort these examples into 'parallel' and 'not parallel'.",
      "Decide whether each example shows parallel lines, then sort it.",
      "Sort each example by whether the lines involved never meet.",
      "Group these examples by whether they involve parallel lines.",
      "Classify each example by whether it is an example of parallel lines.",
      "Sort each example based on whether it shows parallel lines.",
      "Which examples show parallel lines? Sort them all.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Parallel lines never meet and stay the same distance apart — everything else here is vertical, horizontal, or perpendicular instead.",
      explanation: chosenExamples.map((e, i) => `"${items[i].label}" shows ${e.relationship} lines`).join("; ") + ".",
    };
  },
};
