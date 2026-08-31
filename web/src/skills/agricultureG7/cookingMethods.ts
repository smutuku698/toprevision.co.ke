import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const METHODS = [
  { id: "grilling", label: "Grilling", detail: "Cooking food directly over or under a strong, dry heat source, such as hot embers or a grill" },
  { id: "roasting", label: "Roasting", detail: "Cooking food, often whole, using dry heat in an oven, over embers, or in hot ash" },
  { id: "steaming", label: "Steaming", detail: "Cooking food using the hot vapour rising from boiling water, without the food touching the water directly" },
] as const;

const FOOD_ITEMS = [
  { text: "Meat skewers cooked directly over hot charcoal", bucket: "grilling" },
  { text: "Fish cooked directly over an open flame", bucket: "grilling" },
  { text: "Whole maize cobs cooked in hot embers", bucket: "roasting" },
  { text: "Sweet potatoes buried and cooked in hot ash", bucket: "roasting" },
  { text: "Managu (African nightshade) cooked over rising steam in a covered pot", bucket: "steaming" },
  { text: "Rice cooked in a steamer basket above boiling water", bucket: "steaming" },
] as const;
const METHOD_LABEL: Record<string, string> = { grilling: "Grilling", roasting: "Roasting", steaming: "Steaming" };

const SCENARIOS = [
  {
    q: "Faith wants to cook vegetables while keeping them tender and avoiding direct contact with boiling water. Which method suits her best?",
    correct: "Steaming, since the food cooks in rising vapour without touching the water directly",
    distractors: [
      "Grilling, since it always uses vapour instead of direct heat",
      "Roasting, since it always involves submerging food in water",
      "Any method works equally well when avoiding contact with water",
    ],
  },
  {
    q: "Why should a cook using grilling or roasting over an open flame or embers pay extra attention to safety, compared to steaming?",
    correct: "Grilling and roasting involve direct exposure to intense heat and open flame, which carries a higher risk of burns",
    distractors: [
      "Steaming is actually more dangerous than grilling or roasting",
      "Safety only matters when using electric cooking equipment",
      "There is no real safety difference between any cooking method",
    ],
  },
];

const ROASTING_STEPS = [
  { id: "prepare", label: "Prepare the fire or embers until they are hot and glowing" },
  { id: "position", label: "Place the food directly on or in the embers, or over the heat source" },
  { id: "turn", label: "Turn the food occasionally so it cooks evenly on all sides" },
  { id: "check", label: "Check that the food is fully cooked before removing it" },
];

const FILL_ITEMS = [
  { before: "Cooking food using vapour rising from boiling water, without touching the water, is called ", after: ".", correctAnswer: "steaming" },
  { before: "Cooking food directly over hot embers or an open flame is called ", after: ".", correctAnswer: "grilling" },
];

const MATCH_PROMPTS = [
  "Match each cooking method to its description.",
  "Pair each method with the description that explains it.",
  "Connect each cooking method to what it actually involves.",
  "Match each method below to the statement that describes it.",
  "Link each cooking method to its correct description.",
  "Match each method to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each food example by the cooking method it describes.",
  "Decide which cooking method each food example below uses, and sort it there.",
  "Group these food examples under the method that cooked them.",
  "Sort each example into grilling, roasting, or steaming.",
  "Read each food example and place it under the correct cooking method.",
  "Classify each example by the cooking method it demonstrates.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for roasting food over hot embers, in the correct order.",
  "Put these roasting steps into a sensible order.",
  "Sequence the steps for roasting food over embers correctly.",
  "Arrange these actions into the order a careful cook would follow them.",
  "Order these roasting tasks the way they should actually happen.",
  "Sort these steps into the order needed to roast food over embers.",
];

const FILL_PROMPTS = [
  "Fill in the missing cooking method.",
  "Complete the sentence with the correct cooking method.",
  "Which cooking method correctly completes this sentence?",
  "Supply the missing cooking method to finish the sentence.",
  "Work out the missing cooking method in this sentence.",
  "Type the cooking method that correctly fills the gap.",
];

export const cookingMethods: Skill = {
  id: "g7-ag-f-cooking-methods",
  code: "F.4",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-food-production",
  grade: 7,
  title: "Cooking: Grilling, Roasting and Steaming",
  description: "Describing and using grilling, roasting, and steaming to cook different foods, and observing safety when using sharp tools and fuel.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Grilling and roasting both use dry heat directly, while steaming cooks food gently using rising vapour instead of direct heat or water contact.";

    if (branch === "match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.detail })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: METHODS.map((m) => `${m.label}: ${m.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, FOOD_ITEMS);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: METHODS.map((m) => ({ id: m.id, label: METHOD_LABEL[m.id] })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is an example of ${METHOD_LABEL[c.bucket].toLowerCase()}.`).join(" "),
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
      const items = shuffle(rng, ROASTING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ROASTING_STEPS.map((s) => s.id),
        hint: "The fire must be ready before food is placed near it, and doneness is only checked at the end.",
        explanation: ROASTING_STEPS.map((s) => s.label).join(" → "),
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
