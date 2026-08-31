import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STEPS: { id: string; label: string; description: string }[] = [
  { id: "prewriting", label: "Prewriting", description: "Choose a topic about forests and jot down or brainstorm ideas before writing" },
  { id: "drafting", label: "Drafting", description: "Write a rough first version of the composition about saving forests" },
  { id: "editing", label: "Editing", description: "Check and correct spelling, punctuation, and grammar mistakes" },
  { id: "revising", label: "Revising", description: "Improve the ideas, order, and word choice so the composition flows and makes sense" },
  { id: "publishing", label: "Publishing", description: "Write or type out the final, neat copy to share with readers" },
];

const ORDINALS = ["first", "second", "third", "fourth", "fifth and last"];

const ACTIVITIES: { activity: string; stepId: string }[] = [
  { activity: "Amani reads through her forest-conservation draft looking for spelling and punctuation mistakes.", stepId: "editing" },
  { activity: "Before writing, Baraka lists reasons why forests should be protected and jots down facts about deforestation.", stepId: "prewriting" },
  { activity: "Naliaka writes a rough first paragraph about a family tree-planting day, without worrying about mistakes yet.", stepId: "drafting" },
  { activity: "Cherop rereads her composition and moves a weak paragraph about charcoal burning to a better position so it flows more logically.", stepId: "revising" },
  { activity: "Otieno neatly copies out his final composition about saving the Mau Forest to hand in to his teacher.", stepId: "publishing" },
  { activity: "Kiptoo brainstorms a mind map of animals that depend on the forest before he starts writing.", stepId: "prewriting" },
  { activity: "Zawadi checks that every sentence in her composition about forests has correct subject-verb agreement.", stepId: "editing" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "After drafting a composition about deforestation, a writer checks spelling and grammar during the", after: "step.", correctAnswer: "editing" },
  { before: "Before writing about saving forests, a writer brainstorms ideas during the", after: "step.", correctAnswer: "prewriting" },
  { before: "A writer improves the order and flow of ideas in a forest-conservation composition during the", after: "step.", correctAnswer: "revising" },
  { before: "The final, neat copy of a composition about forests is produced during the", after: "step.", correctAnswer: "publishing" },
];

export const writingProcess: Skill = {
  id: "g7-eng-w-writing-process",
  code: "W.7",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Composition: The Writing Process",
  description: "Outline and apply the steps of the writing process — prewriting, drafting, editing, revising, and publishing — in a composition about saving forests.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "mc-order", "match", "mc-activity", "fill"] as const);
    const hint = "The writing process runs: prewriting (planning ideas), drafting (a rough first version), editing (fixing spelling, punctuation, and grammar), revising (improving flow and word choice), and publishing (the final neat copy).";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the steps of the writing process, as applied to a composition about saving forests, in the correct order.",
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, STEPS.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: STEPS.map((s) => s.id),
        hint,
        explanation: STEPS.map((s) => `${s.label} — ${s.description.toLowerCase()}`).join(" → "),
      };
    }

    if (branch === "mc-order") {
      const index = Math.floor(rng() * STEPS.length);
      const target = STEPS[index];
      const choices = shuffle(rng, STEPS.map((s) => s.label));
      return {
        kind: "multiple-choice",
        prompt: `When writing a composition about saving forests, which step of the writing process comes ${ORDINALS[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The writing process goes: ${STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, STEPS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STEPS.map((s) => ({ id: s.id, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of STEPS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: "Match each step of the writing process to what happens during it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STEPS.map((s) => `${s.label}: ${s.description}.`).join(" "),
      };
    }

    if (branch === "mc-activity") {
      const entry = randChoice(rng, ACTIVITIES);
      const stepLabel = STEPS.find((s) => s.id === entry.stepId)!.label;
      const choices = shuffle(rng, STEPS.map((s) => s.label));
      return {
        kind: "multiple-choice",
        prompt: `${entry.activity} Which step of the writing process does this describe?`,
        choices,
        correctIndex: choices.indexOf(stepLabel),
        layout: "list",
        hint,
        explanation: `This describes the ${stepLabel.toLowerCase()} step — ${STEPS.find((s) => s.id === entry.stepId)!.description.toLowerCase()}.`,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing step of the writing process.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
