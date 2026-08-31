import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CAUSES = [
  { id: "waste-water", label: "Household waste water", detail: "Soapy or dirty water poured directly onto the garden soil, upsetting its natural balance" },
  { id: "excess-fertiliser", label: "Excessive artificial fertiliser", detail: "Using far more fertiliser than a crop needs, so the excess builds up and harms the soil" },
  { id: "chemical-waste", label: "Agricultural chemicals", detail: "Pesticides or herbicides used in the wrong amounts, or their empty containers thrown onto the ground" },
  { id: "plastic-waste", label: "Plastic wastes", detail: "Plastic bags and wrappers dumped in the garden, where they take years to break down and block soil air and water" },
] as const;

const PRACTICE_ITEMS = [
  { text: "Pouring used dishwashing water straight onto the vegetable bed every day", bucket: "pollutes" },
  { text: "Burying or safely disposing of empty pesticide containers away from the garden", bucket: "protects" },
  { text: "Applying fertiliser strictly according to the recommended amount for the crop", bucket: "protects" },
  { text: "Dumping plastic packaging in a corner of the shamba instead of a bin", bucket: "pollutes" },
  { text: "Composting kitchen waste instead of burning or dumping it in the garden", bucket: "protects" },
  { text: "Spraying double the recommended dose of a pesticide to 'be sure' it works", bucket: "pollutes" },
] as const;
const PRACTICE_LABEL: Record<string, string> = { pollutes: "Pollutes the soil", protects: "Protects the soil" };

const SCENARIOS = [
  {
    q: "Kevin has just finished spraying his tomato crop and is left with an empty chemical container. What is the safest way to handle it?",
    correct: "Dispose of it according to the label's safety instructions, away from water sources and the garden",
    distractors: [
      "Rinse it and reuse it to store drinking water",
      "Toss it into the nearby stream so it is out of sight",
      "Leave it in the garden bed, since the chemical is already used up",
    ],
  },
  {
    q: "Amani notices her maize is growing poorly even after adding extra fertiliser each week 'just to help it along.' What is most likely happening?",
    correct: "Excess fertiliser has built up in the soil and is now harming the crop instead of helping it",
    distractors: [
      "Fertiliser can never be applied in excess, so something else must be wrong",
      "The maize needs even more fertiliser to recover",
      "Fertiliser only affects the plant's leaves, never the soil",
    ],
  },
  {
    q: "A family in Kiambu regularly pours their laundry water directly onto their kitchen garden. What household practice would reduce soil pollution here?",
    correct: "Channel greywater through a simple filter or soak pit before it reaches the garden soil",
    distractors: [
      "Pour the water even faster so it disappears into the soil sooner",
      "Switch to using more detergent so the water 'cleans' the soil too",
      "Water pollution only matters for rivers, not garden soil",
    ],
  },
];

const AWARENESS_STEPS = [
  { id: "identify", label: "Identify the main causes of soil pollution happening in the home or garden" },
  { id: "gather", label: "Gather facts and real examples to support an awareness message" },
  { id: "create", label: "Create a clear awareness message against improper disposal and chemical misuse" },
  { id: "share", label: "Share the message with family or classmates" },
  { id: "practise", label: "Practise the safe disposal habits being promoted" },
];

const FILL_ITEMS = [
  { before: "The damage caused to soil by waste water, chemicals, or plastics is called soil ", after: ".", correctAnswer: "pollution" },
  { before: "Pesticides and herbicides used on crops are examples of agricultural ", after: ".", correctAnswer: "chemicals" },
  { before: "Water containing soap, food scraps, or other household waste is called ", after: " water.", correctAnswer: "waste" },
];

const MATCH_PROMPTS = [
  "Match each cause of soil pollution to how it actually harms the soil.",
  "Pair each pollution cause with the explanation of its real effect on the soil.",
  "Connect each source of soil pollution to what it does to the soil.",
  "Match each cause below to the description that explains the harm it causes.",
  "Link each cause of soil pollution to its correct explanation.",
  "Match each polluting cause to how it damages the soil.",
];

const SORT_PROMPTS = [
  "Sort each household or garden practice as one that pollutes the soil or one that protects it.",
  "Decide whether each practice below pollutes the soil or protects it, and sort it there.",
  "Group these practices under whether they harm or protect the soil.",
  "Sort each action into pollutes-the-soil or protects-the-soil.",
  "Read each practice and place it under the effect it actually has on the soil.",
  "Classify each garden or household habit as harmful or protective for the soil.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for creating a soil pollution awareness message in the correct order.",
  "Put these steps for building an awareness message about soil pollution into a sensible order.",
  "Sequence the steps for spreading awareness against soil pollution correctly.",
  "Arrange these actions in the order you would follow to create and share an awareness message.",
  "Order these awareness-building steps the way they should actually happen.",
  "Sort these steps into the order needed to raise awareness about soil pollution.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const controllingSoilPollution: Skill = {
  id: "g7-ag-c-controlling-soil-pollution",
  code: "C.1",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-conservation",
  grade: 7,
  title: "Controlling Soil Pollution",
  description: "Causes of soil pollution in gardening (waste water, excess fertiliser, agricultural chemicals, plastic wastes), safe disposal practices, and responsible farming to conserve the soil.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Soil pollution usually comes from putting the wrong substance, or too much of it, into the soil — waste water, chemicals, fertiliser, or plastic.";

    if (branch === "match") {
      const tokens = shuffle(rng, CAUSES.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CAUSES.map((c) => ({ id: c.id, label: c.detail })));
      const correctMap: Record<string, string> = {};
      for (const c of CAUSES) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CAUSES.map((c) => `${c.label}: ${c.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, PRACTICE_ITEMS);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "pollutes", label: PRACTICE_LABEL.pollutes },
          { id: "protects", label: PRACTICE_LABEL.protects },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" — ${PRACTICE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
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
      const items = shuffle(rng, AWARENESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: AWARENESS_STEPS.map((s) => s.id),
        hint: "You must understand the causes and gather facts before you can create and share a message, and practising comes last.",
        explanation: AWARENESS_STEPS.map((s) => s.label).join(" → "),
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
