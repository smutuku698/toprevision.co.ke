import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ordinals = ["first", "second", "third", "fourth and last"];

const ORDINAL_MC_PROMPTS = (ordinal: string) => [
  `Which step of tawbah (repentance) comes ${ordinal}?`,
  `What is the ${ordinal} step of tawbah (repentance)?`,
  `Identify the step of tawbah that comes ${ordinal}.`,
  `In the process of tawbah, which step is the ${ordinal}?`,
  `Which of these is the ${ordinal} step of sincere repentance?`,
  `Name the ${ordinal} step in the process of tawbah.`,
];

const ORDER_PROMPTS = [
  "Arrange these steps of tawbah (repentance) in the order they should be taken.",
  "Put these steps of tawbah into the order they should be taken.",
  "Sequence these steps of sincere repentance correctly.",
  "Order these steps of tawbah as they should actually happen.",
  "Sort these steps of repentance into the correct order.",
  "Arrange these steps of tawbah in the order a sincere repentance follows.",
];

const STEPS: { id: string; label: string }[] = [
  { id: "regret", label: "Recognise the sin and sincerely regret it" },
  { id: "stop", label: "Stop the sinful act immediately" },
  { id: "resolve", label: "Resolve firmly never to return to it" },
  { id: "amend", label: "Make amends, if the sin wronged another person" },
];

export const tawbah: Skill = {
  id: "ire-da-tawbah",
  code: "DA.2",
  subjectId: "ire",
  strandId: "ire-devotional",
  grade: 9,
  title: "Tawbah (Repentance)",
  description: "Arrange the steps of tawbah (sincere repentance) in the correct order.",
  generate(rng) {
    const hint = "Sincere repentance starts with regret, then stopping the sin, then a firm resolve, and — if someone else was wronged — making amends with them.";
    const explanation = `The order is: ${STEPS.map((s) => s.label).join(" → ")}. Tawbah is a condition for forgiveness from Allah (S.W.T.) and for success in this life and the Hereafter.`;

    if (rng() < 0.5) {
      const index = Math.floor(rng() * STEPS.length);
      const target = STEPS[index];
      const choices = shuffle(rng, STEPS.map((s) => s.label));

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, ORDINAL_MC_PROMPTS(ordinals[index])),
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation,
      };
    }

    const correctOrder = STEPS.map((s) => s.id);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the steps in order, from first to last.",
      items: shuffle(rng, STEPS),
      correctOrder,
      hint,
      explanation,
    };
  },
};
