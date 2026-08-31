import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FACTORS = [
  { id: "food-groups", label: "Balance of food groups", detail: "Including carbohydrates, proteins, fats, vitamins and minerals, and water in the right proportions" },
  { id: "age-activity", label: "Age and activity level", detail: "A growing child or physically active person needs different amounts of energy and nutrients than others" },
  { id: "budget", label: "Cost and household budget", detail: "The meal must be affordable using foods the household can actually buy or produce" },
  { id: "availability", label: "Availability of foods", detail: "Using foods that are in season or locally available keeps the meal practical and affordable" },
  { id: "health-needs", label: "Special health needs", detail: "Adjusting a meal for a family member with a condition such as diabetes, allergies, or pregnancy" },
] as const;

const FOOD_ITEMS = [
  { text: "Ugali / rice / bread", bucket: "carbohydrate" },
  { text: "Sweet potatoes / cassava", bucket: "carbohydrate" },
  { text: "Beans / meat / fish", bucket: "protein" },
  { text: "Eggs / milk", bucket: "protein" },
  { text: "Cooking oil / avocado", bucket: "fat" },
  { text: "Sukuma wiki / spinach", bucket: "vitamin-mineral" },
  { text: "Mangoes / oranges", bucket: "vitamin-mineral" },
] as const;
const FOOD_LABEL: Record<string, string> = { carbohydrate: "Carbohydrate (energy) food", protein: "Protein (body-building) food", fat: "Fat/oil food", "vitamin-mineral": "Vitamin/mineral (protective) food" };

const PLAN_STEPS = [
  { id: "identify", label: "Identify who will eat the meal and their nutritional needs" },
  { id: "budget", label: "Check what foods are affordable and available" },
  { id: "select", label: "Select foods from each food group to include" },
  { id: "prepare", label: "Prepare and cook the foods using appropriate methods" },
  { id: "present", label: "Present the meal attractively on the plate" },
];

const PRICES = { carbohydrate: [15, 40], protein: [60, 150], fat: [10, 30], vegetable: [10, 30] } as const;

const FACTOR_MATCH_PROMPTS = [
  "Match each factor to consider in meal planning to what it means.",
  "Pair each meal-planning factor below with its correct explanation.",
  "Connect each factor in planning a balanced meal to what it involves.",
  "Match each factor to the description that explains it.",
  "Link each meal-planning consideration to what it actually means.",
  "Match each factor to the statement that describes it.",
];

const FOOD_GROUP_SORT_PROMPTS = [
  "Sort each food into its food group.",
  "Decide which food group each food below belongs to, and sort it.",
  "Group these foods under their correct food group.",
  "Read each food and sort it into the food group it belongs to.",
  "Sort these foods into carbohydrate, protein, fat, or vitamin/mineral groups.",
  "Place each food into the food group it mainly belongs to.",
];

const PLATE_PROPORTION_PROMPTS = [
  (vegFraction: number, denom: number) =>
    `A well-known guide to plating a balanced meal recommends roughly ${vegFraction}/${denom} of the plate as vegetables/fruits, with the rest split between carbohydrates and protein. Looking at the shaded portion below (${vegFraction}/${denom} of the plate), what does this shaded section represent on a balanced plate?`,
  (vegFraction: number, denom: number) =>
    `On a balanced plate, about ${vegFraction}/${denom} is recommended for one food group, with the rest split between carbohydrates and protein. What does the shaded ${vegFraction}/${denom} portion shown below represent?`,
  (vegFraction: number, denom: number) =>
    `A balanced meal guide shades ${vegFraction}/${denom} of the plate below for a specific food group, with carbohydrates and protein sharing what's left. What does that shaded section stand for?`,
  (vegFraction: number, denom: number) =>
    `Looking at the plate diagram below, where ${vegFraction}/${denom} is shaded and the remainder is split between carbohydrates and protein, what food group does the shaded part represent?`,
  (vegFraction: number, denom: number) =>
    `A balanced plate recommendation shades ${vegFraction}/${denom} for one group, leaving the rest for carbohydrates and protein. Based on the diagram below, what is the shaded group?`,
];

const BUDGET_FAT_PROMPTS = [
  (total: number, carbPrice: number, proteinPrice: number, vegPrice: number) =>
    `A family's balanced meal budget is KES ${total}. So far they have spent KES ${carbPrice} on carbohydrates, KES ${proteinPrice} on protein, and KES ${vegPrice} on vegetables. How much is left in the budget for cooking oil/fat?`,
  (total: number, carbPrice: number, proteinPrice: number, vegPrice: number) =>
    `Out of a KES ${total} meal budget, KES ${carbPrice} went to carbohydrates, KES ${proteinPrice} to protein, and KES ${vegPrice} to vegetables. What amount remains for cooking oil/fat?`,
  (total: number, carbPrice: number, proteinPrice: number, vegPrice: number) =>
    `With a total budget of KES ${total} for a balanced meal, a family has spent KES ${carbPrice} (carbohydrates), KES ${proteinPrice} (protein), and KES ${vegPrice} (vegetables). Find what's left for fat/oil.`,
  (total: number, carbPrice: number, proteinPrice: number, vegPrice: number) =>
    `A household budgets KES ${total} for a balanced meal. Carbohydrates cost KES ${carbPrice}, protein KES ${proteinPrice}, and vegetables KES ${vegPrice}. How much of the budget remains for cooking oil/fat?`,
  (total: number, carbPrice: number, proteinPrice: number, vegPrice: number) =>
    `Given a KES ${total} meal budget, with KES ${carbPrice} spent on carbohydrates, KES ${proteinPrice} on protein, and KES ${vegPrice} on vegetables, what is left over for fat/oil?`,
];

const BUDGET_TOTAL_PROMPTS = [
  (carbPrice: number, proteinPrice: number, vegPrice: number, fatPrice: number) =>
    `A balanced meal is planned with these costs: carbohydrates KES ${carbPrice}, protein KES ${proteinPrice}, vegetables KES ${vegPrice}, and cooking fat/oil KES ${fatPrice}. What is the total cost of the meal's ingredients?`,
  (carbPrice: number, proteinPrice: number, vegPrice: number, fatPrice: number) =>
    `A meal's ingredients cost: KES ${carbPrice} for carbohydrates, KES ${proteinPrice} for protein, KES ${vegPrice} for vegetables, and KES ${fatPrice} for fat/oil. Find the total cost.`,
  (carbPrice: number, proteinPrice: number, vegPrice: number, fatPrice: number) =>
    `For a balanced meal, a family spends KES ${carbPrice} on carbohydrates, KES ${proteinPrice} on protein, KES ${vegPrice} on vegetables, and KES ${fatPrice} on fat/oil. What is the combined total?`,
  (carbPrice: number, proteinPrice: number, vegPrice: number, fatPrice: number) =>
    `Add up these meal costs: carbohydrates KES ${carbPrice}, protein KES ${proteinPrice}, vegetables KES ${vegPrice}, fat/oil KES ${fatPrice}. What is the total spent?`,
  (carbPrice: number, proteinPrice: number, vegPrice: number, fatPrice: number) =>
    `A balanced meal's ingredient costs are: KES ${carbPrice} (carbohydrates), KES ${proteinPrice} (protein), KES ${vegPrice} (vegetables), KES ${fatPrice} (fat/oil). What do they add up to?`,
];

const PLAN_ORDER_PROMPTS = [
  "Arrange the correct order for planning and preparing a balanced meal.",
  "Put these steps for planning and preparing a balanced meal into the right order.",
  "Sequence the process of planning a balanced meal correctly.",
  "Arrange these steps in the order a cook should follow to plan a balanced meal.",
  "Order these actions the way someone would carry them out when preparing a balanced meal.",
  "Sort these steps into the order they should happen when planning a balanced meal.",
];

export const balancedMeal: Skill = {
  id: "g8-ag-f-balanced-meal",
  code: "F.6",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-food-production",
  grade: 8,
  title: "Cooking: Preparing a Balanced Meal",
  description: "Factors to consider when preparing a balanced meal, sorting foods into food groups, plate proportions, and budgeting for a meal's ingredients.",
  generate(rng) {
    const branch = randChoice(rng, ["factor-match", "food-group-sort", "plate-proportion", "budget-calc", "plan-order"] as const);

    if (branch === "factor-match") {
      const tokens = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FACTORS.map((f) => ({ id: f.id, label: f.detail })));
      const correctMap: Record<string, string> = {};
      for (const f of FACTORS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, FACTOR_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "A balanced meal has to be nutritious, suitable for who is eating it, and realistic to prepare.",
        explanation: FACTORS.map((f) => `${f.label}: ${f.detail}.`).join(" "),
      };
    }

    if (branch === "food-group-sort") {
      const chosen = shuffle(rng, FOOD_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: FOOD_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FOOD_GROUP_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Think about what the food mainly provides: energy, body-building, protection, or fat.",
        explanation: chosen.map((c) => `"${c.text}" — ${FOOD_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "plate-proportion") {
      const vegFraction = 1;
      const denom = 2;
      const carbFraction = 1;
      const proteinFraction = 1;
      const bigDenom = 4;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, PLATE_PROPORTION_PROMPTS)(vegFraction, denom),
        visual: { type: "fraction-bar", numerator: vegFraction, denominator: denom, label: "Plate" },
        choices: ["Vegetables and fruits", "Carbohydrates only", "Protein only", "Fats and oils"],
        correctIndex: 0,
        hint: "The largest recommended portion of a balanced plate is usually vegetables and fruits, with carbohydrates and protein sharing the rest.",
        explanation: `On a balanced plate, roughly ${vegFraction}/${denom} is vegetables and fruits, and the remaining half is split about evenly between carbohydrates (${carbFraction}/${bigDenom}) and protein (${proteinFraction}/${bigDenom}).`,
      };
    }

    if (branch === "budget-calc") {
      const carbPrice = randInt(rng, ...PRICES.carbohydrate);
      const proteinPrice = randInt(rng, ...PRICES.protein);
      const vegPrice = randInt(rng, ...PRICES.vegetable);
      const fatPrice = randInt(rng, ...PRICES.fat);
      const total = carbPrice + proteinPrice + vegPrice + fatPrice;
      const solveForFat = randChoice(rng, [true, false]);
      if (solveForFat) {
        return {
          kind: "fill-blank",
          prompt: randChoice(rng, BUDGET_FAT_PROMPTS)(total, carbPrice, proteinPrice, vegPrice),
          before: "Amount left for fat/oil = KES",
          after: "",
          correctAnswer: String(fatPrice),
          inputMode: "numeric",
          hint: "Subtract what has already been spent from the total budget.",
          explanation: `Amount left $= ${total} - ${carbPrice} - ${proteinPrice} - ${vegPrice} = ${fatPrice}$ KES.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, BUDGET_TOTAL_PROMPTS)(carbPrice, proteinPrice, vegPrice, fatPrice),
        before: "Total cost = KES",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up the cost of all four food groups.",
        explanation: `Total $= ${carbPrice} + ${proteinPrice} + ${vegPrice} + ${fatPrice} = ${total}$ KES.`,
      };
    }

    // plan-order
    const items = shuffle(rng, PLAN_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, PLAN_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: PLAN_STEPS.map((s) => s.id),
      hint: "Know who you're feeding and what you can afford before choosing and cooking the foods.",
      explanation: PLAN_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
