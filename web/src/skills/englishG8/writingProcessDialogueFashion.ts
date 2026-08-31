import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STEPS: { id: string; label: string }[] = [
  { id: "plan", label: "Planning — decide who is speaking (e.g. a customer and a tailor) and what they will discuss" },
  { id: "draft", label: "Drafting — write a rough version of what each speaker says" },
  { id: "revise", label: "Revising — make sure each character's words sound natural and realistic" },
  { id: "edit", label: "Editing — correct the punctuation and paragraphing of the dialogue" },
  { id: "publish", label: "Publishing — write out the final, neat copy of the dialogue" },
];

const PUNCT_MC: { correct: string; wrongs: string[] }[] = [
  {
    correct: 'The tailor said, "This fabric will look elegant as a suit."',
    wrongs: [
      'The tailor said "This fabric will look elegant as a suit."',
      'The tailor said, "this fabric will look elegant as a suit."',
      "The tailor said, This fabric will look elegant as a suit.",
    ],
  },
  {
    correct: '"I love this new design," said Achieng.',
    wrongs: [
      '"I love this new design" said Achieng.',
      '"i love this new design," said Achieng.',
      "I love this new design, said Achieng.",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "The customer said", after: '"I would like a dress for the graduation ceremony."', correctAnswer: "," },
  { before: "The tailor replied", after: '"Come back on Friday for a fitting."', correctAnswer: "," },
];

const RULES: { rule: string; example: string }[] = [
  { rule: "Enclose the exact spoken words in quotation marks", example: 'The customer asked, "Do you have this design in blue?"' },
  { rule: "Start the quoted words with a capital letter", example: 'The tailor replied, "Yes, I can order that colour."' },
  { rule: "Use a comma to introduce or follow the quotation", example: '"This style suits you well," said the tailor.' },
  { rule: "Start a new paragraph each time the speaker changes", example: 'The customer said, "I love it." (new paragraph) The tailor smiled and said, "Wonderful choice."' },
];

export const writingProcessDialogueFashion: Skill = {
  id: "g8-eng-w-writing-process-dialogue-fashion",
  code: "W.12",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "The Writing Process: Dialogue",
  description: "Explain the writing process and apply correct dialogue punctuation in a modern-fashion conversation between a customer and a tailor.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-punct", "fill", "match", "order"] as const);
    const hint = "A quoted sentence needs quotation marks around the exact words, a capital letter to start the quote, and a comma introducing it. A new speaker starts a new paragraph.";

    if (branch === "mc-punct") {
      const entry = randChoice(rng, PUNCT_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence correctly punctuates this line of dialogue about fashion?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correctly punctuated sentence is: "${entry.correct}"`,
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
        hint: "A comma usually introduces a direct quotation when it follows words like 'said' or 'replied'.",
        explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer} ${entry.after}" — a comma introduces the quoted speech.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, RULES.map((r, i) => ({ id: `r${i}`, label: r.rule })));
      const targets = shuffle(rng, RULES.map((r, i) => ({ id: `r${i}`, label: r.example })));
      const correctMap: Record<string, string> = {};
      RULES.forEach((_, i) => (correctMap[`r${i}`] = `r${i}`));
      return {
        kind: "click-match",
        prompt: "Match each rule for writing dialogue to an example that follows it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: RULES.map((r) => `${r.rule}: "${r.example}"`).join(" "),
      };
    }

    return {
      kind: "ordering",
      prompt: "Arrange the stages of the writing process in the correct order for writing a dialogue between a customer and a tailor.",
      instruction: "Click them in order.",
      items: shuffle(rng, STEPS),
      correctOrder: STEPS.map((s) => s.id),
      hint,
      explanation: STEPS.map((s) => s.label).join(" → "),
    };
  },
};
