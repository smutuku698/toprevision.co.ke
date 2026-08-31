import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each Sikh Sanskaar to its description.",
  "Pair each Sanskaar with the description that fits it.",
  "Connect each Sikh rite of passage to its description.",
  "Link each Sanskaar below to what it involves.",
  "Match each rite of passage to its correct description.",
  "Choose the correct description for each Sikh Sanskaar.",
];

const ORDER_PROMPTS = [
  "Arrange these Sikh Sanskaars (rites of passage) in the order they occur across a person's life.",
  "Put these Sikh Sanskaars into the order they happen across a lifetime.",
  "Sequence the five Sikh rites of passage correctly.",
  "Order these Sanskaars from earliest to latest in a person's life.",
  "Arrange the Sikh Sanskaars in the sequence a person experiences them.",
  "Sort these rites of passage into the order they occur in life.",
];

const SANSKAARS: { id: string; name: string; description: string }[] = [
  { id: "naam-karan", name: "Naam Karan", description: "The naming ceremony for a newborn child" },
  { id: "dastar-bandhan", name: "Dastar Bandhan", description: "The tying of the first turban" },
  { id: "amrit-shakna", name: "Amrit Shakna", description: "Baptism into the Khalsa" },
  { id: "anand-karaj", name: "Anand Karaj", description: "The marriage ceremony" },
  { id: "antim-sanskaar", name: "Antim Sanskaar", description: "The final death rites" },
];

export const sikhSanskaars: Skill = {
  id: "hre-sk-sikh-sanskaars",
  code: "SK.1",
  subjectId: "hre",
  strandId: "hre-sanskaars",
  grade: 9,
  title: "The five Sikh Sanskaars",
  description: "Arrange the five Sikh Sanskaars in the order they occur across a person's life.",
  generate(rng) {
    if (rng() < 0.5) {
      const tokens = shuffle(rng, SANSKAARS.map((s) => ({ id: s.id, label: s.name })));
      const targets = shuffle(rng, SANSKAARS.map((s) => ({ id: s.id, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of SANSKAARS) correctMap[s.id] = s.id;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These are the five rites of passage marking key life stages for a Sikh.",
        explanation: SANSKAARS.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    const correctOrder = SANSKAARS.map((s) => s.id);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the Sanskaars in order, from earliest in life to latest.",
      items: shuffle(rng, SANSKAARS.map((s) => ({ id: s.id, label: `${s.name} — ${s.description}` }))),
      correctOrder,
      hint: "Think about the natural order of a person's life: birth, growing up, initiation, marriage, and death.",
      explanation: `The order across a life is: ${SANSKAARS.map((s) => s.name).join(" → ")}.`,
    };
  },
};
