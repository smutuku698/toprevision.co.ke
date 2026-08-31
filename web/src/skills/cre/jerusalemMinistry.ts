import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_EVENT_PROMPTS = [
  (ordinal: string) => `Which event happened ${ordinal} in Jesus' ministry in Jerusalem?`,
  (ordinal: string) => `What was the ${ordinal} event in Jesus' time in Jerusalem?`,
  (ordinal: string) => `Identify the event that happened ${ordinal} during Jesus' ministry in Jerusalem.`,
  (ordinal: string) => `Which of these happened ${ordinal}, during Jesus' final days in Jerusalem?`,
  (ordinal: string) => `Choose the event that came ${ordinal} in this account of Jesus in Jerusalem.`,
  (ordinal: string) => `In the sequence of Jesus' ministry in Jerusalem, which event was ${ordinal}?`,
];

const ORDERING_PROMPTS = [
  "Arrange these events of Jesus' ministry in Jerusalem in the order they happened.",
  "Put these events from Jesus' time in Jerusalem into the correct order.",
  "Sequence these events of Jesus' ministry in Jerusalem correctly.",
  "Arrange these moments from Jesus' final days in Jerusalem in order.",
  "Order these events the way they unfolded in Jerusalem.",
  "Sort these events into the order Jesus' ministry in Jerusalem followed.",
];

const EVENTS: { id: string; label: string }[] = [
  { id: "entry", label: "Jesus enters Jerusalem riding a donkey as crowds wave palm branches" },
  { id: "cleansing", label: "Jesus cleanses the temple, driving out those buying and selling" },
  { id: "conflict", label: "Jesus teaches in the temple and is confronted by the Jewish leaders" },
];

export const jerusalemMinistry: Skill = {
  id: "cre-jc-jerusalem-ministry",
  code: "JC.5",
  subjectId: "cre",
  strandId: "cre-jesus",
  grade: 9,
  title: "Jesus' ministry in Jerusalem",
  description: "Arrange the events of Jesus' ministry in Jerusalem in the correct order.",
  generate(rng) {
    const hint = "Jesus first arrived triumphantly, then acted against wrongdoing in the temple, which led to conflict with the Jewish leaders.";
    const ordinals = ["first", "second", "third and last"];

    if (rng() < 0.5) {
      const index = Math.floor(rng() * EVENTS.length);
      const target = EVENTS[index];
      const choices = shuffle(rng, EVENTS.map((e) => e.label));

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_EVENT_PROMPTS)(ordinals[index]),
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `The order is: ${EVENTS.map((e) => e.label).join(" → ")}.`,
      };
    }

    const correctOrder = EVENTS.map((e) => e.id);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDERING_PROMPTS),
      instruction: "Click the events in order, from first to last.",
      items: shuffle(rng, EVENTS),
      correctOrder,
      hint,
      explanation: `The order is: ${EVENTS.map((e) => e.label).join(" → ")}. Jesus' triumphant entry was followed by his cleansing of the temple, which led to his conflict with the Jewish leaders — avoiding conflict at home, school, and in the community is a lesson drawn from this.`,
    };
  },
};
