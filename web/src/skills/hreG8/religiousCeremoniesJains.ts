import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (description: string) => [
  `Which Jain religious ceremony is described as: "${description}"?`,
  `"${description}" — which Jain ceremony is this?`,
  `Identify the Jain religious ceremony described as "${description}".`,
  `This description fits which Jain ceremony: "${description}"?`,
  `Which ceremony below matches this description: "${description}"?`,
  `Name the Jain ceremony that is described as "${description}".`,
];

const MATCH_PROMPTS = [
  "Match each Jain religious ceremony to its significance.",
  "Pair each ceremony with its significance.",
  "Connect each Jain religious ceremony to what it means.",
  "Link each ceremony below to its significance.",
  "Match each ceremony to its correct significance.",
  "Choose the correct significance for each Jain religious ceremony.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the ceremony.",
  "Which ceremony is being described?",
  "Name the ceremony described below.",
  "Work out which ceremony completes the description.",
  "Identify the missing ceremony name.",
  "Which ceremony name belongs in the blank?",
];

const ORDER_PROMPTS = [
  "Arrange these Jain religious ceremonies in the order they occur across a person's life.",
  "Put these Jain ceremonies into the order they happen across a lifetime.",
  "Sequence the three Jain rites of passage correctly.",
  "Order these ceremonies from earliest to latest in a person's life.",
  "Arrange the Jain Sanskaars in the sequence a person experiences them.",
  "Sort these ceremonies into the order they occur in life.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into the Jain ceremony it belongs to.",
  "Group these descriptions under the Jain ceremony each one belongs to.",
  "Decide which Jain ceremony each description matches, and sort it there.",
  "Sort each fact into the correct Jain ceremony.",
  "Place each description under the ceremony it belongs to.",
  "Read each description and sort it under the matching Jain ceremony.",
];

const CEREMONIES = [
  {
    name: "Naam Sanskaar",
    description: "The naming ceremony performed shortly after a child's birth, welcoming the new life into the family and community with blessings",
  },
  {
    name: "Vivah Sanskaar",
    description: "The marriage ceremony, joining two individuals in a union witnessed by family and community, performed with rites emphasising non-violence and mutual respect",
  },
  {
    name: "Antim Sanskaar",
    description: "The final rites performed to honour someone who has passed away, reflecting Jain belief in the soul's ongoing journey, kept simple and focused on a peaceful passing",
  },
] as const;

const CATEGORIZE_ITEMS = [
  { text: "A ceremony welcoming a newborn child into the family with blessings", ceremony: "Naam Sanskaar" },
  { text: "A ceremony in which a baby is formally given their name", ceremony: "Naam Sanskaar" },
  { text: "A ceremony joining two people in marriage before family and community", ceremony: "Vivah Sanskaar" },
  { text: "A ceremony performed with rites emphasising non-violence and mutual respect between a couple", ceremony: "Vivah Sanskaar" },
  { text: "The final rites performed to honour someone who has passed away", ceremony: "Antim Sanskaar" },
  { text: "A ceremony reflecting Jain belief in the soul's ongoing journey after death", ceremony: "Antim Sanskaar" },
] as const;

const HINT = "These three Sanskaars mark the beginning, the middle, and the end of a person's life journey.";

export const religiousCeremoniesJains: Skill = {
  id: "g8-hre-sk-religious-ceremonies-jains",
  code: "SK.1",
  subjectId: "hre",
  strandId: "g8-hre-sk",
  grade: 8,
  title: "Religious Ceremonies (Jains)",
  description: "Jain rite-of-passage ceremonies (Sanskaars) — Naam, Vivah, and Antim — and their significance across a person's life.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill", "order", "categorize"] as const);

    if (branch === "mc") {
      const target = randChoice(rng, CEREMONIES);
      const distractors = shuffle(rng, CEREMONIES.filter((c) => c.name !== target.name)).map((c) => c.name);
      const choices = shuffle(rng, [target.name, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, DESCRIBED_MC_PROMPTS(target.description)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint: HINT,
        explanation: `${target.name} — ${target.description.toLowerCase()}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CEREMONIES.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CEREMONIES.map((c) => ({ id: c.name, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CEREMONIES) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: CEREMONIES.map((c) => `${c.name} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const target = randChoice(rng, CEREMONIES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "",
        after: `is described as: "${target.description}."`,
        correctAnswer: target.name,
        inputMode: "text",
        hint: HINT,
        explanation: `${target.name} — ${target.description.toLowerCase()}.`,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from earliest in life to latest.",
        items: shuffle(rng, CEREMONIES.map((c) => ({ id: c.name, label: `${c.name} — ${c.description}` }))),
        correctOrder: CEREMONIES.map((c) => c.name),
        hint: "Think about the natural order of a person's life: birth, marriage, and death.",
        explanation: `The order across a life is: ${CEREMONIES.map((c) => c.name).join(" → ")}.`,
      };
    }

    // categorize
    const chosen = shuffle(rng, CATEGORIZE_ITEMS);
    const buckets = CEREMONIES.map((c) => ({ id: c.name, label: c.name }));
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.ceremony));
    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items,
      buckets,
      correctBucket,
      hint: HINT,
      explanation: chosen.map((c) => `"${c.text}" — ${c.ceremony}.`).join(" "),
    };
  },
};
