import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (description: string) => [
  `Which Buddhist Sanskaar is described as: "${description}"?`,
  `"${description}" — which Buddhist Sanskaar is this?`,
  `Identify the Buddhist Sanskaar described as "${description}".`,
  `This description fits which Buddhist Sanskaar: "${description}"?`,
  `Which Sanskaar below matches this description: "${description}"?`,
  `Name the Buddhist Sanskaar that is described as "${description}".`,
];

const MATCH_PROMPTS = [
  "Match each Buddhist Sanskaar to its significance.",
  "Pair each Sanskaar with its significance.",
  "Connect each Buddhist Sanskaar to what it means.",
  "Link each Sanskaar below to its significance.",
  "Match each Sanskaar to its correct significance.",
  "Choose the correct significance for each Buddhist Sanskaar.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the Sanskaar.",
  "Which Sanskaar is being described?",
  "Name the Sanskaar described below.",
  "Work out which Sanskaar completes the description.",
  "Identify the missing Sanskaar name.",
  "Which Sanskaar name belongs in the blank?",
];

const ORDER_PROMPTS = [
  "Arrange these Buddhist Sanskaars in the order they occur across a person's life.",
  "Put these Buddhist Sanskaars into the order they happen across a lifetime.",
  "Sequence the three Buddhist rites of passage correctly.",
  "Order these Sanskaars from earliest to latest in a person's life.",
  "Arrange the Buddhist Sanskaars in the sequence a person experiences them.",
  "Sort these rites of passage into the order they occur in life.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into the Buddhist Sanskaar it belongs to.",
  "Group these descriptions under the Buddhist Sanskaar each one belongs to.",
  "Decide which Buddhist Sanskaar each description matches, and sort it there.",
  "Sort each fact into the correct Buddhist Sanskaar.",
  "Place each description under the Sanskaar it belongs to.",
  "Read each description and sort it under the matching Buddhist Sanskaar.",
];

const SANSKAARS = [
  {
    name: "Naming",
    description: "A ceremony welcoming and naming a newborn child, often blessed by monks and family with wishes for a virtuous life",
  },
  {
    name: "Marriage",
    description: "A ceremony uniting two people, often blessed by monks who chant paritta (protective verses) for a harmonious life together",
  },
  {
    name: "Death (Maranam)",
    description: "Death rites performed with chanting and reflection on impermanence (anicca), comforting the family and often including cremation and merit-making offerings",
  },
] as const;

const CATEGORIZE_ITEMS = [
  { text: "A ceremony welcoming and naming a newborn child", sanskaar: "Naming" },
  { text: "A ceremony where monks bless a child with wishes for a virtuous life", sanskaar: "Naming" },
  { text: "A ceremony uniting two people, blessed by monks chanting paritta", sanskaar: "Marriage" },
  { text: "A ceremony marking a couple's commitment to a harmonious life together", sanskaar: "Marriage" },
  { text: "Rites performed with chanting and reflection on impermanence (anicca)", sanskaar: "Death (Maranam)" },
  { text: "Rites that often include cremation and merit-making offerings for the deceased", sanskaar: "Death (Maranam)" },
] as const;

const HINT = "These three Sanskaars mark the beginning, the middle, and the end of a person's life journey.";

export const buddhistSanskaars: Skill = {
  id: "g8-hre-sk-buddhist-sanskaars",
  code: "SK.2",
  subjectId: "hre",
  strandId: "g8-hre-sk",
  grade: 8,
  title: "Buddhist Sanskaars",
  description: "Buddhist rite-of-passage ceremonies (Sanskaars) — Naming, Marriage, and Death (Maranam) — and their significance across a person's life.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill", "order", "categorize"] as const);

    if (branch === "mc") {
      const target = randChoice(rng, SANSKAARS);
      const distractors = shuffle(rng, SANSKAARS.filter((s) => s.name !== target.name)).map((s) => s.name);
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
      const tokens = shuffle(rng, SANSKAARS.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, SANSKAARS.map((s) => ({ id: s.name, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of SANSKAARS) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: SANSKAARS.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const target = randChoice(rng, SANSKAARS);
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
        items: shuffle(rng, SANSKAARS.map((s) => ({ id: s.name, label: `${s.name} — ${s.description}` }))),
        correctOrder: SANSKAARS.map((s) => s.name),
        hint: "Think about the natural order of a person's life: birth, marriage, and death.",
        explanation: `The order across a life is: ${SANSKAARS.map((s) => s.name).join(" → ")}.`,
      };
    }

    // categorize
    const chosen = shuffle(rng, CATEGORIZE_ITEMS);
    const buckets = SANSKAARS.map((s) => ({ id: s.name, label: s.name }));
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.sanskaar));
    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items,
      buckets,
      correctBucket,
      hint: HINT,
      explanation: chosen.map((c) => `"${c.text}" — ${c.sanskaar}.`).join(" "),
    };
  },
};
