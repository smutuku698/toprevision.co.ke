import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STEPS = [
  { id: "sorting", label: "Sorting", detail: "Grouping clothes by colour and fabric before washing, so colours do not run onto each other" },
  { id: "washing", label: "Washing (kneading and squeezing)", detail: "Working detergent into the loose coloured item by kneading and squeezing it gently, without harsh scrubbing" },
  { id: "drying", label: "Drying", detail: "Hanging the item in shade rather than direct sun, so its colour does not fade" },
  { id: "finishing", label: "Finishing", detail: "Ironing or folding the item neatly once it is completely dry" },
] as const;

const ORDER_STEPS = STEPS.map((s) => ({ id: s.id, label: s.detail }));

const SORT_ITEMS = [
  { text: "A bright red loose t-shirt and a load of white bedsheets", bucket: "separately" },
  { text: "Two loose blue cotton shirts of a similar shade", bucket: "together" },
  { text: "A dark green loose blouse and pale yellow loose garments", bucket: "separately" },
  { text: "Several loose grey cotton items of about the same colour", bucket: "together" },
] as const;
const SORT_LABEL: Record<string, string> = { together: "Safe to wash together", separately: "Should be washed separately" };

const SCENARIOS = [
  {
    q: "Amina washed a bright red loose garment together with a load of white items, and the white items turned pink. What went wrong?",
    correct: "She did not sort the items by colour before washing, so the red dye ran onto the white items",
    distractors: [
      "White items always turn pink regardless of what they are washed with",
      "Kneading and squeezing always causes colours to run",
      "Drying in the sun caused the colour to transfer",
    ],
  },
  {
    q: "A loose coloured garment is hung to dry in strong, direct sunlight for hours. What is the likely result?",
    correct: "The strong sunlight is likely to fade the garment's colour over time",
    distractors: [
      "Direct sunlight has no effect at all on a garment's colour",
      "Sunlight always makes colours brighter and more vivid",
      "Only white garments can be affected by sunlight",
    ],
  },
];

const FILL_ITEMS = [
  { before: "Grouping clothes by colour and fabric before washing is called ", after: ".", correctAnswer: "sorting" },
  { before: "Gently working detergent into fabric using kneading and squeezing, without harsh scrubbing, protects loose ", after: " items.", correctAnswer: "coloured" },
];

const ORDER_PROMPTS = [
  "Arrange the steps for laundering a loose coloured article, in the correct order.",
  "Put these laundering steps into the correct order.",
  "Sequence the steps for washing and finishing a loose coloured article correctly.",
  "Arrange these actions into the order a careful launderer would follow them.",
  "Order these laundry tasks the way they should actually happen.",
  "Sort these steps into the order needed to launder a loose coloured item.",
];

const MATCH_PROMPTS = [
  "Match each laundering step to its description.",
  "Pair each step with the description that explains it.",
  "Connect each laundering step to what it actually involves.",
  "Match each step below to the statement that describes it.",
  "Link each laundry step to its correct description.",
  "Match each step to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each group of laundry as safe to wash together, or items that should be washed separately.",
  "Decide whether each group below is safe to wash together, and sort it there.",
  "Group these laundry pairs under safe-together or wash-separately.",
  "Sort each pair into the correct washing bucket.",
  "Read each group of laundry and place it under the correct washing rule.",
  "Classify each group as safe to combine in the wash, or not.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const laundryLooseColouredItems: Skill = {
  id: "g7-ag-h-laundry-loose-coloured-items",
  code: "H.2",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-hygiene",
  grade: 7,
  title: "Laundry: Loose Coloured Items",
  description: "Laundering a loose coloured article for hygiene purposes — sorting, washing by kneading and squeezing, drying, and finishing.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "sort", "scenario", "fill"] as const);
    const hint = "Loose coloured items need gentle handling and shade-drying to stay hygienic and keep their colour from running or fading.";

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: STEPS.map((s) => s.id),
        hint: "Sorting comes before washing, and finishing only happens once the item is fully dry.",
        explanation: STEPS.map((s) => `${s.label}: ${s.detail}`).join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, STEPS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STEPS.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of STEPS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STEPS.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, SORT_ITEMS);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "together", label: SORT_LABEL.together },
          { id: "separately", label: SORT_LABEL.separately },
        ],
        correctBucket,
        hint: "Similar colours can usually be washed together; very different or strong colours risk running onto lighter ones.",
        explanation: chosen.map((c) => `"${c.text}" — ${SORT_LABEL[c.bucket].toLowerCase()}.`).join(" "),
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
