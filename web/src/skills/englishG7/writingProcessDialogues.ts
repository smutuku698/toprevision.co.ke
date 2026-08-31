import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STEPS: { id: string; label: string; description: string }[] = [
  { id: "draft", label: "Draft", description: "Write a rough version of what each speaker says about traditional fashion" },
  { id: "edit", label: "Edit", description: "Correct grammar, spelling, and punctuation, and make sure each speaker's words are clear" },
  { id: "revise", label: "Revise", description: "Improve how natural the conversation sounds and reorder ideas if needed" },
  { id: "publish", label: "Publish", description: "Write out the final, neat copy of the dialogue to share" },
];

const ORDINALS = ["first", "second", "third", "fourth and last"];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "The elder said", after: '"this headdress is worn only during important ceremonies."', correctAnswer: "," },
  { before: "The two designers agreed", after: '"the beadwork patterns tell a story."', correctAnswer: "," },
  { before: "The tailor explained", after: '"this kitenge pattern represents unity among the community."', correctAnswer: "," },
];

const CATEGORIZE_ITEMS: { text: string; correct: boolean }[] = [
  { text: 'The tailor said, "This kitenge pattern represents unity among the Luo people."', correct: true },
  { text: 'The tailor said "This kitenge pattern represents unity among the Luo people."', correct: false },
  { text: '"My grandmother wove this shuka by hand," explained the Maasai elder.', correct: true },
  { text: '"my grandmother wove this shuka by hand," explained the Maasai elder.', correct: false },
  { text: 'The designer asked, "Do you know the meaning of these beadwork colours?"', correct: true },
  { text: "The designer asked, Do you know the meaning of these beadwork colours?", correct: false },
  { text: '"This headdress is only worn during important ceremonies," said the chief.', correct: true },
  { text: '"This headdress is only worn during important ceremonies" said the chief.', correct: false },
];

export const writingProcessDialogues: Skill = {
  id: "g7-eng-w-writing-process-dialogues",
  code: "W.12",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "The Writing Process: Dialogues",
  description: "Apply the writing process and correct dialogue formatting — quotation marks, speaker tags, and punctuation — to a conversation about traditional fashion.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "mc-order", "categorize", "fill"] as const);
    const hint = "In dialogue, each speaker's exact words go in quotation marks, a comma usually introduces or follows the quoted words, and each new speaker starts on a new line.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the steps of the writing process, as applied to writing a dialogue about traditional fashion, in the correct order.",
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
        prompt: `When writing a dialogue about traditional fashion, which step of the writing process comes ${ORDINALS[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The writing process for a dialogue goes: ${STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS).slice(0, 4);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.correct ? "correct" : "incorrect"));
      return {
        kind: "categorize",
        prompt: "Sort each line of dialogue about traditional fashion by whether it is correctly punctuated and formatted.",
        items,
        buckets: [
          { id: "correct", label: "Correctly formatted" },
          { id: "incorrect", label: "Incorrectly formatted" },
        ],
        correctBucket,
        hint: "Check for quotation marks around the exact words spoken, a capital letter starting the quote, and a comma introducing or following it.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.correct ? "correctly" : "incorrectly"} formatted.`).join(" "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Type the punctuation mark that is missing right before the quotation.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "A comma usually introduces a direct quotation when it follows words like 'said' or 'explained'.",
      explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer} ${entry.after}" — a comma introduces the quoted speech.`,
    };
  },
};
