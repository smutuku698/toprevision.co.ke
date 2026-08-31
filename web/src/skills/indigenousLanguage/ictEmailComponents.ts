import { shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EMAIL_ITEMS: { id: string; label: string; meaning: string }[] = [
  { id: "subj", label: "Subject line", meaning: "a short phrase summarizing what the email is about" },
  { id: "sal", label: "Salutation", meaning: "a greeting to the reader, such as 'Dear Mr. Otieno,'" },
  { id: "open", label: "Opening paragraph", meaning: "states the purpose of the email" },
  { id: "close", label: "Closing paragraph", meaning: "sums up the message or calls the reader to act" },
  { id: "sign", label: "Sign-off and name", meaning: "a polite closing phrase followed by the sender's name" },
];

export const ictEmailComponents: Skill = {
  id: "il-w-ict-email-components",
  code: "W.2",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "ICT & cyber security: parts of an email",
  description: "Match each part of an email to its purpose and arrange the parts of an email in the correct order.",
  generate(rng) {
    const hint = "An email starts with the subject line and ends with the sign-off.";

    if (rng() < 0.4) {
      const tokens = shuffle(rng, EMAIL_ITEMS.map((i) => ({ id: i.id, label: i.label })));
      const targets = shuffle(rng, EMAIL_ITEMS.map((i) => ({ id: i.id, label: i.meaning })));
      const correctMap: Record<string, string> = {};
      for (const i of EMAIL_ITEMS) correctMap[i.id] = i.id;

      return {
        kind: "click-match",
        prompt: "Match each part of an email to its purpose.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: EMAIL_ITEMS.map((i) => `${i.label} — ${i.meaning}.`).join(" "),
      };
    }

    if (rng() < 0.7) {
      const ordinals = ["first", "second", "third", "fourth", "fifth and last"];
      const index = Math.floor(rng() * EMAIL_ITEMS.length);
      const target = EMAIL_ITEMS[index];
      const choices = shuffle(rng, EMAIL_ITEMS.map((i) => i.label));

      return {
        kind: "multiple-choice",
        prompt: `Which part of an email comes ${ordinals[index]}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The correct order is: ${EMAIL_ITEMS.map((i) => i.label).join(" → ")}.`,
      };
    }

    return {
      kind: "ordering",
      prompt: "Arrange the parts of an email in the correct order.",
      instruction: "Click the parts in the order they should appear, from top to bottom.",
      items: shuffle(rng, EMAIL_ITEMS.map((i) => ({ id: i.id, label: i.label }))),
      correctOrder: EMAIL_ITEMS.map((i) => i.id),
      hint,
      explanation: `The correct order is: ${EMAIL_ITEMS.map((i) => i.label).join(" → ")}.`,
    };
  },
};
