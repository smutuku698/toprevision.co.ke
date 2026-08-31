import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STEPS: { id: string; label: string }[] = [
  { id: "plan", label: "Planning — brainstorm the wildlife scene and jot down what each speaker will say" },
  { id: "draft", label: "Drafting — write a rough first version of the dialogue" },
  { id: "revise", label: "Revising — improve how natural and clear each character's words sound" },
  { id: "edit", label: "Editing — correct the punctuation, spelling and paragraphing of the dialogue" },
  { id: "publish", label: "Publishing — write out the final, neat copy of the dialogue" },
];

const ORDINALS = ["first", "second", "third", "fourth", "fifth and last"];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "The tour guide said", after: '"look closely at the acacia tree — there is a leopard resting on that branch."', correctAnswer: "," },
  { before: "The two rangers agreed", after: '"we must report the poachers\' tracks to headquarters immediately."', correctAnswer: "," },
];

const CATEGORIZE_ITEMS: { text: string; correct: boolean }[] = [
  { text: 'The ranger said, "The elephants are heading toward the waterhole."', correct: true },
  { text: 'The ranger said "The elephants are heading toward the waterhole."', correct: false },
  { text: '"We should keep our distance," whispered the tour guide.', correct: true },
  { text: '"we should keep our distance," whispered the tour guide.', correct: false },
  { text: 'The visitor asked, "Is it safe to get out of the vehicle here?"', correct: true },
  { text: "The visitor asked, Is it safe to get out of the vehicle here?", correct: false },
];

export const writingProcessDialogueWildlife: Skill = {
  id: "g8-eng-w-writing-process-dialogue-wildlife",
  code: "W.7",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Composition Writing: The Writing Process - Dialogue",
  description: "Identify the steps of the writing process and apply correct dialogue punctuation in a wildlife-themed conversation.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "mc-order", "fill", "categorize"] as const);
    const hint = "The writing process runs from planning to publishing. In dialogue, each quoted sentence needs quotation marks, a capital letter, and a comma introducing it.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the stages of writing a dialogue between two rangers about a wildlife sighting, in the correct order.",
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, STEPS),
        correctOrder: STEPS.map((s) => s.id),
        hint,
        explanation: STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "mc-order") {
      const index = Math.floor(rng() * STEPS.length);
      const target = STEPS[index];
      const choices = shuffle(rng, STEPS.map((s) => s.label));
      return {
        kind: "multiple-choice",
        prompt: `When writing a dialogue about a wildlife sighting, which stage of the writing process comes ${ORDINALS[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The writing process goes: ${STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Type the punctuation mark that is missing right before the quotation.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "A comma usually introduces a direct quotation when it follows words like 'said' or 'agreed'.",
        explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer} ${entry.after}" — a comma introduces the quoted speech.`,
      };
    }

    const chosen = shuffle(rng, CATEGORIZE_ITEMS).slice(0, 4);
    const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.correct ? "correct" : "incorrect"));
    return {
      kind: "categorize",
      prompt: "Sort each line of ranger/tour-guide dialogue by whether it is correctly punctuated.",
      items,
      buckets: [
        { id: "correct", label: "Correctly punctuated" },
        { id: "incorrect", label: "Incorrectly punctuated" },
      ],
      correctBucket,
      hint: "Check for quotation marks around the exact words spoken, a capital letter starting the quote, and a comma introducing or following it.",
      explanation: chosen.map((c) => `"${c.text}" is ${c.correct ? "correctly" : "incorrectly"} punctuated.`).join(" "),
    };
  },
};
