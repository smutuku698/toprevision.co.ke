import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const BENEFITS = [
  { id: "erosion", label: "Preventing soil erosion", detail: "Tree roots bind the soil together, stopping it from being washed or blown away" },
  { id: "water", label: "Protecting water catchments", detail: "Trees help rainwater soak into the ground slowly instead of running off, feeding rivers and springs" },
  { id: "microclimate", label: "Improving the microclimate", detail: "Trees provide shade and release moisture, cooling the immediate environment around them" },
  { id: "timber", label: "Providing timber and produce", detail: "Trees supply wood, fruits, or other products the household or community can use or sell" },
] as const;

const METHOD_ITEMS = [
  { text: "Planting seeds directly into a prepared seedbed", bucket: "seed" },
  { text: "Transplanting a young tree already growing in a nursery bag", bucket: "seedling" },
  { text: "Planting a cut stem or branch that will grow its own roots", bucket: "cutting" },
  { text: "Sowing tiny tree seeds that need protection before they germinate", bucket: "seed" },
  { text: "Moving an established sapling from a tree nursery to its final spot", bucket: "seedling" },
] as const;
const METHOD_LABEL: Record<string, string> = { seed: "Growing from seed", seedling: "Growing from a seedling", cutting: "Growing from a cutting" };

const SCENARIOS = [
  {
    q: "A steep hillside farm keeps losing its topsoil every time it rains heavily. Which action would most directly reduce this problem?",
    correct: "Planting trees along the slope, since their roots bind the soil and reduce erosion",
    distractors: [
      "Removing all existing vegetation so rain can reach the soil directly",
      "Ploughing the slope more deeply before every rainy season",
      "Watering the slope more often to help the soil settle",
    ],
  },
  {
    q: "A community wants a fast-growing tree established this season with the highest chance of survival, since seeds in that area often fail to germinate. Which planting method suits this best?",
    correct: "Transplanting seedlings from a nursery, since they are already established and more likely to survive",
    distractors: [
      "Sowing seeds directly, since seeds always grow faster than seedlings",
      "Waiting until next season to avoid planting altogether",
      "Planting only fully grown trees dug up from elsewhere",
    ],
  },
];

const ORDER_STEPS = [
  { id: "choose", label: "Choose an appropriate tree species and planting method for the site" },
  { id: "hole", label: "Dig a planting hole of the right size for the seed, seedling, or cutting" },
  { id: "plant", label: "Plant it at the correct depth and firm the soil around it" },
  { id: "water", label: "Water it immediately after planting" },
  { id: "care", label: "Continue watering and protecting it until it is fully established" },
];

const FILL_ITEMS = [
  { before: "A young tree grown in a nursery and then transplanted to its final site is called a ", after: ".", correctAnswer: "seedling" },
  { before: "A cut stem or branch planted so it grows its own roots is called a ", after: ".", correctAnswer: "cutting" },
];

const MATCH_PROMPTS = [
  "Match each importance of trees to how it actually helps the environment.",
  "Pair each benefit of trees with the explanation of how it works.",
  "Connect each reason trees matter to its correct explanation.",
  "Match each benefit below to the description that explains it.",
  "Link each environmental benefit of trees to why it happens.",
  "Match each way trees help the environment to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each description by the tree-planting method it describes.",
  "Decide which planting method each description below belongs to, and sort it there.",
  "Group these descriptions under the planting method they match.",
  "Sort each statement into seed, seedling, or cutting.",
  "Read each description and place it under the correct planting method.",
  "Classify each description by the method of establishing a tree it describes.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for planting and establishing a tree, in the correct order.",
  "Put these tree-planting and establishment steps into a sensible order.",
  "Sequence the steps for getting a tree successfully established correctly.",
  "Arrange these actions into the order a careful planter would follow them.",
  "Order these tree-establishment tasks the way they should actually happen.",
  "Sort these steps into the order needed to plant and establish a tree.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const growingTrees: Skill = {
  id: "g7-ag-c-growing-trees",
  code: "C.4",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-conservation",
  grade: 7,
  title: "Growing Trees",
  description: "The importance of trees in conserving the environment, planting from seeds, seedlings, or cuttings, and caring for a tree until it is fully established.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Trees conserve the environment mainly by holding soil in place, protecting water sources, and improving the local climate.";

    if (branch === "match") {
      const chosen = shuffle(rng, BENEFITS);
      const tokens = shuffle(rng, chosen.map((b) => ({ id: b.id, label: b.label })));
      const targets = shuffle(rng, chosen.map((b) => ({ id: b.id, label: b.detail })));
      const correctMap: Record<string, string> = {};
      for (const b of chosen) correctMap[b.id] = b.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((b) => `${b.label}: ${b.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, METHOD_ITEMS);
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "seed", label: METHOD_LABEL.seed },
          { id: "seedling", label: METHOD_LABEL.seedling },
          { id: "cutting", label: METHOD_LABEL.cutting },
        ],
        correctBucket,
        hint: "Seeds are sown directly, seedlings are already-growing young trees moved from a nursery, and cuttings are stems that grow new roots.",
        explanation: chosen.map((c) => `"${c.text}" — ${METHOD_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIOS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Choosing and digging come before planting, and ongoing care continues after the tree is in the ground.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
