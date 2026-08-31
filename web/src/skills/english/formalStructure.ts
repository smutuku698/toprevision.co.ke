import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LETTER_ITEMS: { id: string; label: string }[] = [
  { id: "addr", label: "Sender's address" },
  { id: "date", label: "Date" },
  { id: "sal", label: "Salutation (e.g. 'Dear Sir/Madam,')" },
  { id: "open", label: "Opening paragraph — states your purpose" },
  { id: "close", label: "Closing paragraph — sums up / calls to action" },
  { id: "sign", label: "Complimentary close and signature" },
];

const EMAIL_ITEMS: { id: string; label: string }[] = [
  { id: "subj", label: "Subject line" },
  { id: "sal", label: "Salutation (e.g. 'Dear Mr. Otieno,')" },
  { id: "open", label: "Opening paragraph — states your purpose" },
  { id: "close", label: "Closing paragraph — sums up / calls to action" },
  { id: "sign", label: "Sign-off and name" },
];

export const formalStructure: Skill = {
  id: "eng-w-formal-structure",
  code: "W.1",
  subjectId: "english",
  strandId: "eng-writing",
  grade: 9,
  title: "Order the parts of a formal letter or email",
  description: "Arrange the parts of a formal letter or email in the correct order.",
  generate(rng) {
    const format = randChoice(rng, ["letter", "email"] as const);
    const items = format === "letter" ? LETTER_ITEMS : EMAIL_ITEMS;
    const correctOrder = items.map((i) => i.id);
    const hint =
      format === "letter"
        ? "A letter starts with the sender's address, and ends with the signature."
        : "An email starts with the subject line, and ends with the sign-off.";
    const explanation = `The correct order for a formal ${format} is: ${items.map((i) => i.label).join(" → ")}.`;
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth and last"];

    if (rng() < 0.5) {
      const index = Math.floor(rng() * items.length);
      const target = items[index];
      const choices = shuffle(rng, items.map((i) => i.label));

      return {
        kind: "multiple-choice",
        prompt: `Which part comes ${ordinals[index]} in a formal ${format}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation,
      };
    }

    return {
      kind: "ordering",
      prompt: `Arrange the parts of a formal ${format} in the correct order.`,
      instruction: "Click the parts in the order they should appear, from top to bottom.",
      items: shuffle(rng, items),
      correctOrder,
      hint,
      explanation,
    };
  },
};
