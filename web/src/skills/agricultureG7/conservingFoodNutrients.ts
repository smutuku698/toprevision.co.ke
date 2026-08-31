import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRACTICES = [
  { id: "washing", label: "Washing before cutting", detail: "Washing vegetables whole, before cutting them, stops water-soluble vitamins from leaching out through cut surfaces" },
  { id: "peeling", label: "Peeling thinly", detail: "Peeling only a thin layer keeps most of the mineral salts, which are concentrated just beneath the skin" },
  { id: "cutting", label: "Cutting just before cooking", detail: "Cutting vegetables into large pieces right before cooking reduces the surface area exposed to air and water" },
  { id: "cooking-time", label: "Short cooking time", detail: "Cooking for the shortest time needed, in the least water possible, reduces vitamin loss through heat and dissolving" },
  { id: "covering", label: "Covering while cooking", detail: "Covering the pot with a lid traps steam and reduces the oxygen that destroys some vitamins" },
] as const;

const HANDLING_ITEMS = [
  { text: "Washing vegetables whole before cutting them into pieces", bucket: "conserves" },
  { text: "Cutting vegetables into small pieces and leaving them soaking in water for an hour", bucket: "destroys" },
  { text: "Boiling vegetables in a large amount of water for a long time, uncovered", bucket: "destroys" },
  { text: "Covering the pot with a lid while the vegetables cook", bucket: "conserves" },
  { text: "Peeling only a very thin layer off the vegetable's skin", bucket: "conserves" },
  { text: "Chopping vegetables long before they are needed and leaving them exposed to air", bucket: "destroys" },
] as const;
const HANDLING_LABEL: Record<string, string> = { conserves: "Conserves vitamins and mineral salts", destroys: "Destroys vitamins and mineral salts" };

const SCENARIOS = [
  {
    q: "Wanjiku wants to cook sukuma wiki while keeping as many vitamins as possible for her family's meal. Which approach should she use?",
    correct: "Wash the leaves whole, shred them just before cooking, and cook briefly in a little water with the lid on",
    distractors: [
      "Shred the leaves first, soak them in water for an hour, then boil uncovered for a long time",
      "Boil the leaves in plenty of water for as long as possible to make sure they are soft",
      "Peel away a thick layer before washing, then leave the leaves exposed to air before cooking",
    ],
  },
  {
    q: "Otieno notices that vegetables cooked at his neighbour's house always taste better and look brighter than his own. His neighbour always covers the pot and uses very little water. What does this suggest?",
    correct: "Covering the pot and using less water reduces vitamin loss, which can also affect colour and taste",
    distractors: [
      "The type of pot used has no effect on the vegetables at all",
      "Covering a pot only affects how fast food cooks, never its nutrients",
      "Using more water always cooks vegetables better than using less",
    ],
  },
];

const ORDER_STEPS = [
  { id: "wash", label: "Wash the vegetable whole, before it is cut" },
  { id: "peel", label: "Peel thinly, removing only the outer skin if needed" },
  { id: "cut", label: "Cut into large pieces just before cooking" },
  { id: "cook", label: "Cook briefly, in a little water, with the pot covered" },
  { id: "serve", label: "Serve immediately after cooking" },
];

const FILL_ITEMS = [
  { before: "Vitamins that dissolve in water and can be lost when a vegetable is cut and soaked are ", after: " vitamins.", correctAnswer: "water-soluble" },
  { before: "Small amounts of substances like iron, calcium, and potassium found in food are called ", after: ".", correctAnswer: "mineral salts" },
];

const MATCH_PROMPTS = [
  "Match each nutrient-conserving practice to why it works.",
  "Pair each practice with the reason it helps conserve nutrients.",
  "Connect each vegetable-handling practice to why it protects vitamins and mineral salts.",
  "Match each practice below to its correct explanation.",
  "Link each nutrient-conserving habit to the reason it works.",
  "Match each practice to the explanation of why it preserves nutrients.",
];

const SORT_PROMPTS = [
  "Sort each vegetable handling practice by whether it conserves or destroys vitamins and mineral salts.",
  "Decide whether each practice below conserves or destroys nutrients, and sort it there.",
  "Group these practices under conserves-nutrients or destroys-nutrients.",
  "Sort each handling habit into the correct nutrient-effect bucket.",
  "Read each practice and place it under whether it protects or wastes nutrients.",
  "Classify each practice as nutrient-conserving or nutrient-destroying.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for handling and cooking a vegetable to conserve its nutrients, in the correct order.",
  "Put these vegetable handling and cooking steps into the order that best conserves nutrients.",
  "Sequence these steps correctly to keep as many vitamins and mineral salts as possible.",
  "Arrange these actions into the order a careful cook would follow them.",
  "Order these preparation steps the way they should happen to protect nutrients.",
  "Sort these steps into the sequence that best conserves the vegetable's nutrients.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Complete the sentence with the correct term.",
  "Which term correctly completes this sentence?",
  "Supply the missing term to finish the sentence.",
  "Work out the missing term in this sentence.",
  "Type the term that correctly fills the gap.",
];

export const conservingFoodNutrients: Skill = {
  id: "g7-ag-c-conserving-food-nutrients",
  code: "C.3",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-conservation",
  grade: 7,
  title: "Conserving Food Nutrients",
  description: "Ways of conserving vitamins and mineral salts in vegetables during handling, preparation, and cooking — washing, peeling, cutting, cooking time, and covering.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Vitamins and mineral salts are lost through cutting, soaking, long cooking, and exposure to air and heat — so minimise all four.";

    if (branch === "match") {
      const chosen = shuffle(rng, PRACTICES);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.detail })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `${p.label}: ${p.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, HANDLING_ITEMS);
      const items = chosen.map((c, i) => ({ id: `h${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`h${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "conserves", label: HANDLING_LABEL.conserves },
          { id: "destroys", label: HANDLING_LABEL.destroys },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" — ${HANDLING_LABEL[c.bucket].toLowerCase()}.`).join(" "),
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
        hint: "Washing whole comes before cutting, and cutting comes right before cooking, not long before.",
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
