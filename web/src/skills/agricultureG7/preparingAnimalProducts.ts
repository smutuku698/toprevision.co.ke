import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS = [
  { id: "sorting", label: "Sorting (eggs)", detail: "Separating eggs by qualities such as cleanliness, shell condition, and shape" },
  { id: "grading", label: "Grading (eggs)", detail: "Classifying sorted eggs into size categories such as small, medium, or large" },
  { id: "crushing", label: "Crushing (honey)", detail: "Breaking open the wax honeycomb so the honey inside can be released" },
  { id: "straining", label: "Straining (honey)", detail: "Passing crushed honey through a fine sieve or cloth to remove wax and bee parts" },
] as const;

type Grade = "small" | "medium" | "large";
const GRADE_LABEL: Record<Grade, string> = { small: "Small (under 53 g)", medium: "Medium (53–63 g)", large: "Large (over 63 g)" };
function gradeOf(weight: number): Grade {
  if (weight < 53) return "small";
  if (weight <= 63) return "medium";
  return "large";
}

const SCENARIOS = [
  {
    q: "A farmer has just harvested honeycomb from the hive and wants clean, ready-to-pack liquid honey. What should be done first?",
    correct: "Crush the honeycomb to release the honey, then strain it to remove wax and bee parts",
    distractors: [
      "Strain the whole honeycomb first, then crush what remains",
      "Pack the honeycomb directly into containers without any processing",
      "Boil the honeycomb until only wax remains",
    ],
  },
  {
    q: "Before selling eggs at the market, why should a farmer sort them before grading them by size?",
    correct: "Sorting removes dirty, cracked, or misshapen eggs first, so only good eggs are graded and sold",
    distractors: [
      "Sorting and grading are the same step done in either order",
      "Grading should always happen before sorting, never after",
      "Sorting is only needed for honey, never for eggs",
    ],
  },
];

const HONEY_STEPS = [
  { id: "harvest", label: "Harvest the honeycomb from the hive" },
  { id: "crush", label: "Crush the honeycomb to release the honey" },
  { id: "strain", label: "Strain the crushed honey through a sieve or cloth" },
  { id: "pack", label: "Pack the strained honey into clean, appropriate containers" },
];

const FILL_ITEMS = [
  { before: "Classifying sorted eggs into size categories such as small, medium, or large is called ", after: ".", correctAnswer: "grading" },
  { before: "Passing crushed honey through a sieve to remove wax and bee parts is called ", after: ".", correctAnswer: "straining" },
];

const MATCH_PROMPTS = [
  "Match each animal product preparation term to its meaning.",
  "Pair each term with the description that explains it.",
  "Connect each egg or honey preparation term to what it actually means.",
  "Match each term below to the statement that describes it.",
  "Link each preparation term to its correct meaning.",
  "Match each term to its explanation.",
];

const GRADE_PROMPTS = [
  "Grade each egg by its weight: small (under 53 g), medium (53–63 g), or large (over 63 g).",
  "Sort each egg into its correct grade using the weight ranges: small (under 53 g), medium (53–63 g), or large (over 63 g).",
  "Using the boundaries small (under 53 g), medium (53–63 g), and large (over 63 g), grade each egg below.",
  "Place each egg into the grade its weight falls under: small (under 53 g), medium (53–63 g), or large (over 63 g).",
  "Work out the correct grade for each egg, given small is under 53 g, medium is 53–63 g, and large is over 63 g.",
  "Classify each egg by weight into small (under 53 g), medium (53–63 g), or large (over 63 g).",
];

const ORDER_PROMPTS = [
  "Arrange the steps for preparing honey for use and storage, in the correct order.",
  "Put these honey preparation steps into the correct order.",
  "Sequence the steps for turning harvested honeycomb into stored honey correctly.",
  "Arrange these actions into the order a careful beekeeper would follow them.",
  "Order these honey processing tasks the way they should actually happen.",
  "Sort these steps into the order needed to prepare honey for storage.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Complete the sentence with the correct term.",
  "Which term correctly completes this sentence?",
  "Supply the missing term to finish the sentence.",
  "Work out the missing term in this sentence.",
  "Type the term that correctly fills the gap.",
];

export const preparingAnimalProducts: Skill = {
  id: "g7-ag-f-preparing-animal-products",
  code: "F.3",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-food-production",
  grade: 7,
  title: "Preparing Animal Products: Eggs and Honey",
  description: "Preparing eggs (sorting, grading, packing) and honey (crushing and straining, packing) for use and storage, using clean tools and ethical procedures.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "grade-calc", "scenario", "order", "fill"] as const);
    const hint = "Eggs are sorted by quality then graded by size; honey is crushed out of the comb, then strained clean before packing.";

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.id, label: t.detail })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TERMS.map((t) => `${t.label}: ${t.detail}.`).join(" "),
      };
    }

    if (branch === "grade-calc") {
      const weights = [randInt(rng, 40, 52), randInt(rng, 54, 62), randInt(rng, 64, 78), randInt(rng, 45, 51), randInt(rng, 65, 75), randInt(rng, 55, 61)];
      const chosen = shuffle(rng, weights).slice(0, 5);
      const items = chosen.map((w, i) => ({ id: `e${i}`, label: `Egg weighing ${w} g` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((w, i) => (correctBucket[`e${i}`] = gradeOf(w)));
      return {
        kind: "categorize",
        prompt: randChoice(rng, GRADE_PROMPTS),
        items,
        buckets: (["small", "medium", "large"] as Grade[]).map((g) => ({ id: g, label: GRADE_LABEL[g] })),
        correctBucket,
        hint: "Compare each weight to the grade boundaries: under 53 g, 53 to 63 g, or over 63 g.",
        explanation: chosen.map((w) => `An egg weighing ${w} g is graded ${gradeOf(w)}.`).join(" "),
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
      const items = shuffle(rng, HONEY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: HONEY_STEPS.map((s) => s.id),
        hint: "Honey must be released from the comb before it can be cleaned and packed.",
        explanation: HONEY_STEPS.map((s) => s.label).join(" → "),
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
