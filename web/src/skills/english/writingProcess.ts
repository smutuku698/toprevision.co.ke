import { shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ordinals = ["first", "second", "third", "fourth", "fifth and last"];

const STAGES: { id: string; label: string }[] = [
  { id: "plan", label: "Planning — brainstorm ideas and make an outline" },
  { id: "draft", label: "Drafting — write a rough first draft" },
  { id: "revise", label: "Revising — improve ideas, content, and organization" },
  { id: "edit", label: "Editing — correct grammar, spelling, and punctuation" },
  { id: "publish", label: "Publishing — produce and share the final neat copy" },
];

export const writingProcess: Skill = {
  id: "eng-w-writing-process",
  code: "W.4",
  subjectId: "english",
  strandId: "eng-writing",
  grade: 9,
  title: "The stages of the writing process",
  description: "Arrange the stages of the writing process in the correct order.",
  generate(rng) {
    const hint = "Ideas come first, and the finished piece being shared comes last.";

    if (rng() < 0.5) {
      const index = Math.floor(rng() * STAGES.length);
      const target = STAGES[index];
      const choices = shuffle(rng, STAGES.map((s) => s.label));

      return {
        kind: "multiple-choice",
        prompt: `Which stage of the writing process comes ${ordinals[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The writing process goes: ${STAGES.map((s) => s.label).join(" → ")}.`,
      };
    }

    const correctOrder = STAGES.map((s) => s.id);

    return {
      kind: "ordering",
      prompt: "Arrange the stages of the writing process in the correct order.",
      instruction: "Click the stages in order, from first to last.",
      items: shuffle(rng, STAGES),
      correctOrder,
      hint,
      explanation: `The writing process goes: ${STAGES.map((s) => s.label).join(" → ")}.`,
    };
  },
};
