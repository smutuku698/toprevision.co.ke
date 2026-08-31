import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COMPONENTS: { name: string; benefit: string }[] = [
  { name: "Fish rearing", benefit: "provides fish for food, and pond water rich in nutrients that can be used to irrigate crops" },
  { name: "Rabbit keeping", benefit: "provides meat, and droppings that fertilise the vegetable garden" },
  { name: "Poultry keeping", benefit: "provides eggs and meat, and droppings that enrich the soil" },
  { name: "Vegetable production", benefit: "provides food for the household and benefits from the manure produced by the animals" },
];

const IDENTIFY_PROMPTS: ((benefit: string) => string)[] = [
  (benefit) => `Which integrated farming component ${benefit}?`,
  (benefit) => `Which part of an integrated farming system ${benefit}?`,
  (benefit) => `Can you name the component that ${benefit}?`,
  (benefit) => `Which enterprise on the farm ${benefit}?`,
  (benefit) => `Identify the component that ${benefit}.`,
  (benefit) => `Which piece of the integrated system ${benefit}?`,
];

const MATCH_PROMPTS = [
  "Match each integrated farming component to how it benefits the whole system.",
  "Pair each component with the benefit it brings to the system.",
  "Connect each integrated farming component to its role in the system.",
  "Link each part of the integrated farm to the benefit it provides.",
  "Match each component below to how it helps the whole farming system.",
  "Pair each enterprise with the way it supports the rest of the system.",
];

export const integratedFarming: Skill = {
  id: "ag-c-integrated-farming",
  code: "C.2",
  subjectId: "agriculture-nutrition",
  strandId: "ag-conservation",
  grade: 9,
  title: "Components of integrated farming",
  description: "Match each integrated farming component to how it benefits the whole system.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify"] as const);

    if (branch === "identify") {
      const pool = shuffle(rng, COMPONENTS);
      const correct = pool[0];
      const choices = shuffle(rng, pool.map((c) => c.name));

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS)(correct.benefit),
        choices,
        correctIndex: choices.indexOf(correct.name),
        layout: "list",
        hint: "Integrated farming combines fish rearing, rabbit keeping, poultry keeping, and vegetable production on the same plot so each part supports the others.",
        explanation: `${correct.name} — ${correct.benefit}.`,
      };
    }

    const chosen = shuffle(rng, COMPONENTS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((c) => ({ id: c.name, label: c.name })));
    const targets = shuffle(rng, chosen.map((c) => ({ id: c.name, label: c.benefit })));
    const correctMap: Record<string, string> = {};
    for (const c of chosen) correctMap[c.name] = c.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Integrated farming combines fish rearing, rabbit keeping, poultry keeping, and vegetable production on the same plot so each part supports the others.",
      explanation: chosen.map((c) => `${c.name} — ${c.benefit}.`).join(" "),
    };
  },
};
