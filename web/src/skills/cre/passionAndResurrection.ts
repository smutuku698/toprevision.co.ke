import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const IMMEDIATELY_BEFORE_PROMPTS = [
  (label: string) => `What happened immediately before "${label}"?`,
  (label: string) => `Which event came right before "${label}"?`,
  (label: string) => `Identify the event that took place just before "${label}".`,
  (label: string) => `In the sequence, what came right before "${label}"?`,
  (label: string) => `Choose the event that happened directly before "${label}".`,
  (label: string) => `"${label}" came after which event?`,
];

const ORDERING_PROMPTS = [
  "Arrange these events from Jesus' passion, death and resurrection in the order they happened.",
  "Put these events of Jesus' passion, death and resurrection into the correct order.",
  "Sequence these events correctly, from first to last.",
  "Arrange these moments from Jesus' final days and resurrection in order.",
  "Order these events the way they unfolded.",
  "Sort these events into the order they happened.",
];

const EVENTS: { id: string; order: number; label: string }[] = [
  { id: "supper", order: 1, label: "The Lord's Supper — Jesus shares the Passover meal with his disciples" },
  { id: "olives", order: 2, label: "Jesus prays at the Mount of Olives (Gethsemane)" },
  { id: "arrest", order: 3, label: "Jesus is betrayed and arrested" },
  { id: "trial", order: 4, label: "Jesus is tried before the Jewish and Roman leaders" },
  { id: "crucifixion", order: 5, label: "Jesus is crucified at Golgotha" },
  { id: "burial", order: 6, label: "Jesus' body is placed in the tomb" },
  { id: "resurrection", order: 7, label: "Jesus rises from the dead on the third day" },
  { id: "ascension", order: 8, label: "Jesus ascends to heaven" },
];

export const passionAndResurrection: Skill = {
  id: "cre-jc-passion-resurrection",
  code: "JC.6",
  subjectId: "cre",
  strandId: "cre-jesus",
  grade: 9,
  title: "Jesus' passion, death and resurrection",
  description: "Arrange the events of Jesus' passion, death and resurrection in the correct order.",
  generate(rng) {
    const hint = "The events run from the Lord's Supper through to Jesus' ascension into heaven.";

    if (rng() < 0.5) {
      const index = 1 + Math.floor(rng() * (EVENTS.length - 1));
      const target = EVENTS[index];
      const before = EVENTS[index - 1];
      const distractors = shuffle(rng, EVENTS.filter((e) => e.id !== before.id && e.id !== target.id)).slice(0, 3);
      const choices = shuffle(rng, [before.label, ...distractors.map((d) => d.label)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IMMEDIATELY_BEFORE_PROMPTS)(target.label),
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
      prompt: randChoice(rng, ORDERING_PROMPTS),
      instruction: "Click the events in order, from first to last.",
      items: shuffle(rng, selected.map((e) => ({ id: e.id, label: e.label }))),
      correctOrder,
      hint,
      explanation: `The order is: ${correctOrder.map((id) => EVENTS.find((e) => e.id === id)!.label).join(" → ")}. Christ's resurrection is central to the Christian faith, and Christians also look forward to his second coming.`,
    };
  },
};
