import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GOOD = [
  "Cleaning tools after use",
  "Storing tools in their designated place",
  "Checking a tool for damage before using it",
  "Using the correct tool for the task",
  "Keeping cutting edges sharp and covered when stored",
  "Reporting a damaged tool instead of using it",
];

const POOR = [
  "Leaving tools scattered on the workbench or floor",
  "Using a screwdriver as a substitute for a chisel",
  "Storing tools in a damp, rusty area",
  "Ignoring a cracked handle and continuing to use the tool",
  "Leaving sharp tools uncovered where others can be cut",
  "Forcing a tool to do a job it wasn't designed for",
];

export const toolCare: Skill = {
  id: "pt-t-tool-care",
  code: "T.2",
  subjectId: "pre-technical",
  strandId: "pt-tools",
  grade: 9,
  title: "Caring for tools safely",
  description: "Sort practices into good and poor ways of caring for and using tools.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify"] as const);

    if (branch === "identify") {
      const askGood = rng() < 0.5;
      const pool = askGood ? GOOD : POOR;
      const otherPool = askGood ? POOR : GOOD;
      const correct = randChoice(rng, pool);
      const distractors = shuffle(rng, otherPool).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these is an example of ${askGood ? "good" : "poor"} tool care?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Good care keeps tools working safely and lasting longer; poor care risks damage or injury.",
        explanation: `"${correct}" is ${askGood ? "good" : "poor"} tool care.`,
      };
    }

    const good = shuffle(rng, GOOD).slice(0, 3);
    const poor = shuffle(rng, POOR).slice(0, 3);
    const items = shuffle(rng, [
      ...good.map((label) => ({ id: label, label, bucket: "good" })),
      ...poor.map((label) => ({ id: label, label, bucket: "poor" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each practice into Good Tool Care or Poor Tool Care.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "good", label: "Good Tool Care" },
        { id: "poor", label: "Poor Tool Care" },
      ],
      correctBucket,
      hint: "Good care keeps tools working safely and lasting longer; poor care risks damage or injury.",
      explanation: `Good practice: ${good.join(" / ")}. Poor practice: ${poor.join(" / ")}.`,
    };
  },
};
