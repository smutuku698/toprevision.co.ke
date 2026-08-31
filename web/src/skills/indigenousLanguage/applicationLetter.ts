import { shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LETTER_ITEMS: { id: string; label: string }[] = [
  { id: "addr", label: "Sender's address" },
  { id: "date", label: "Date" },
  { id: "recipient", label: "Recipient's address" },
  { id: "sal", label: "Salutation (e.g. 'Dear Sir/Madam,')" },
  { id: "open", label: "Opening paragraph — states the purpose of the application" },
  { id: "body", label: "Body paragraph — gives supporting details (e.g. results, need)" },
  { id: "close", label: "Closing paragraph — requests consideration and thanks the reader" },
  { id: "sign", label: "Complimentary close and signature" },
];

export const applicationLetter: Skill = {
  id: "il-w-application-letter",
  code: "W.9",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Kenyan cultures: scholarship application letter",
  description: "Arrange the parts of a scholarship application letter in the correct order.",
  generate(rng) {
    const hint = "A formal letter starts with the sender's address and date, and ends with the signature.";
    const explanation = `The correct order for a scholarship application letter is: ${LETTER_ITEMS.map((i) => i.label).join(" → ")}.`;

    if (rng() < 0.5) {
      const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth and last"];
      const index = Math.floor(rng() * LETTER_ITEMS.length);
      const target = LETTER_ITEMS[index];
      const choices = shuffle(rng, LETTER_ITEMS.map((i) => i.label));

      return {
        kind: "multiple-choice",
        prompt: `Which part of a scholarship application letter comes ${ordinals[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation,
      };
    }

    return {
      kind: "ordering",
      prompt: "Arrange the parts of a scholarship application letter in the correct order.",
      instruction: "Click the parts in the order they should appear, from top to bottom.",
      items: shuffle(rng, LETTER_ITEMS),
      correctOrder: LETTER_ITEMS.map((i) => i.id),
      hint,
      explanation,
    };
  },
};
