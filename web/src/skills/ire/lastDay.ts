import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const BEFORE_MC_PROMPTS = (label: string) => [
  `What happens immediately before "${label}"?`,
  `Which event comes right before "${label}"?`,
  `"${label}" is preceded by which event?`,
  `Identify the event that happens just before "${label}".`,
  `Which of these events comes directly before "${label}"?`,
  `What is the step right before "${label}" in the sequence?`,
];

const ORDER_PROMPTS = [
  "Arrange these events of the Last Day in the order Muslims believe they occur.",
  "Put these events of the Last Day into the order Muslims believe they occur.",
  "Sequence these events of the Last Day correctly, from first to last.",
  "Order these events of the Last Day as Muslims believe they unfold.",
  "Sort these events of the Last Day into their believed order.",
  "Arrange these events in the order the Last Day is believed to unfold.",
];

const EVENTS: { id: string; order: number; label: string }[] = [
  { id: "resurrection", order: 1, label: "Resurrection — all people are raised from death" },
  { id: "gathering", order: 2, label: "Gathering — everyone is assembled for judgement" },
  { id: "record", order: 3, label: "Record of deeds — each person's book of deeds is presented" },
  { id: "scale", order: 4, label: "Scale of deeds — good and bad deeds are weighed" },
  { id: "accounting", order: 5, label: "Accounting — each person answers for their deeds" },
  { id: "intercession", order: 6, label: "Intercession — the Prophet intercedes on behalf of believers" },
  { id: "siraat", order: 7, label: "Siraat — each person crosses the bridge over Hellfire" },
  { id: "destination", order: 8, label: "Paradise or Hellfire — the final destination is reached" },
];

export const lastDay: Skill = {
  id: "ire-pi-last-day",
  code: "PI.1",
  subjectId: "ire",
  strandId: "ire-iman",
  grade: 9,
  title: "Belief in the Last Day",
  description: "Arrange the events of the Last Day (Day of Judgement) in the order Muslims believe they occur.",
  generate(rng) {
    const hint = "The sequence runs from resurrection through to each person reaching their final destination.";

    if (rng() < 0.5) {
      const index = 1 + Math.floor(rng() * (EVENTS.length - 1));
      const target = EVENTS[index];
      const before = EVENTS[index - 1];
      const distractors = shuffle(rng, EVENTS.filter((e) => e.id !== before.id && e.id !== target.id)).slice(0, 3);
      const choices = shuffle(rng, [before.label, ...distractors.map((d) => d.label)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, BEFORE_MC_PROMPTS(target.label)),
        choices,
        correctIndex: choices.indexOf(before.label),
        layout: "list",
        hint,
        explanation: `The order is: ${EVENTS.map((e) => e.label).join(" → ")}.`,
      };
    }

    const count = randChoice(rng, [5, 6] as const);
    const selected = shuffle(rng, EVENTS).slice(0, count);
    const correctOrder = [...selected].sort((a, b) => a.order - b.order).map((e) => e.id);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the events in order, from first to last.",
      items: shuffle(rng, selected.map((e) => ({ id: e.id, label: e.label }))),
      correctOrder,
      hint,
      explanation: `The order is: ${correctOrder.map((id) => EVENTS.find((e) => e.id === id)!.label).join(" → ")}.`,
    };
  },
};
