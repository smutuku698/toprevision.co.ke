import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { term: string; meaning: string }[] = [
  { term: "Sequence", meaning: "a set of instructions carried out one after another, in order" },
  { term: "Loop", meaning: "a block that repeats a set of instructions multiple times" },
  { term: "Event", meaning: "an action that triggers a script to start running, like a key press or a click" },
  { term: "Condition (if-else)", meaning: "a block that runs different instructions depending on whether something is true or false" },
  { term: "Variable", meaning: "a named place to store a value that can change while a program runs" },
  { term: "Sprite", meaning: "a character or object in a visual programming project that can be programmed to move or act" },
  { term: "Script", meaning: "a stack of connected blocks that together perform a task" },
];

export const visualProgramming: Skill = {
  id: "pt-c-visual-programming",
  code: "C.2",
  subjectId: "pre-technical",
  strandId: "pt-communication",
  grade: 9,
  title: "Visual programming concepts",
  description: "Match visual programming terms to their meanings.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify"] as const);

    if (branch === "identify") {
      const pool = shuffle(rng, TERMS);
      const correct = pool[0];
      const choices = shuffle(rng, pool.slice(0, 4).map((t) => t.term));

      return {
        kind: "multiple-choice",
        prompt: `Which visual programming term means: ${correct.meaning}?`,
        choices,
        correctIndex: choices.indexOf(correct.term),
        layout: "list",
        hint: "Think about what each block does when a program using visual programming software (like Scratch) runs.",
        explanation: `${correct.term} — ${correct.meaning}.`,
      };
    }

    const chosen = shuffle(rng, TERMS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each visual programming term to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Think about what each block does when a program using visual programming software (like Scratch) runs.",
      explanation: chosen.map((t) => `${t.term} — ${t.meaning}.`).join(" "),
    };
  },
};
