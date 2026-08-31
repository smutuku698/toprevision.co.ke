import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 1 cm³ = 1 mL, and 1000 mL = 1 L, so 1000 cm³ = 1 L.

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// 32 real-world Kenyan liquid-measuring contexts.
const CONTEXTS = [
  "spraying pesticide on a maize farm",
  "mixing paint for a house wall",
  "a dairy farmer measuring the day's milk yield",
  "filling a car's fuel tank",
  "measuring cooking oil for a recipe",
  "mixing a fruit juice concentrate",
  "watering seedlings in a tree nursery",
  "mixing a disinfectant solution for a clinic",
  "topping up a motorbike's engine oil",
  "bottling honey harvested from a hive",
  "a milk vendor measuring milk for a customer",
  "a chemistry teacher mixing a solution in the lab",
  "filling a perfume bottle",
  "measuring a child's cough syrup dose",
  "mixing detergent for laundry",
  "filling a boda boda's fuel tank",
  "mixing herbicide for a coffee farm",
  "filling water bottles for a school trip",
  "a nurse measuring an injection dose",
  "mixing cement slurry with water on a building site",
  "a tailor mixing fabric dye",
  "filling a thermos flask with tea",
  "a baker measuring milk for dough",
  "a mechanic topping up brake fluid",
  "a farmer mixing acaricide for cattle dipping",
  "filling a water dispenser",
  "a shopkeeper decanting cooking oil into smaller bottles",
  "mixing soft-drink syrup at a bottling plant",
  "measuring rainfall collected in a rain gauge",
  "a vet measuring a dose of dewormer for a cow",
  "filling a hot water bottle",
  "mixing yoghurt starter culture with milk",
] as const;

export const capacityRelationshipsAndConversions: Skill = {
  id: "g6-math-m-capacity-relationships",
  code: "M.5",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Capacity: cm³, millilitres and litres",
  description: "Identify the relationship among cubic centimetres, millilitres and litres, and convert between litres and millilitres in real Kenyan contexts.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "cm3-ml-relationship",
        "l-to-ml",
        "ml-to-l",
        "cm3-to-l",
        "classical-convert",
        "click-match",
        "categorize",
        "order-capacity",
      ] as const
    );

    if (branch === "cm3-ml-relationship") {
      const askWhich = randChoice(rng, ["cm3-mL", "mL-L"] as const);
      if (askWhich === "cm3-mL") {
        const wrong = ["10", "100", "1000"];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, "1", wrong, 3);
        return {
          kind: "multiple-choice",
          prompt: "How many millilitres (mL) are equal to 1 cubic centimetre (cm³)?",
          choices,
          correctIndex,
          layout: "row",
          hint: "This is a direct one-to-one relationship.",
          explanation: "1 cm³ = 1 mL exactly — this is why cm³ and mL are used interchangeably for small volumes.",
        };
      }
      const wrong = ["100", "10", "10,000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "1,000", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: "How many millilitres (mL) make up 1 litre (L)?",
        choices,
        correctIndex,
        layout: "row",
        hint: "Since 1 cm³ = 1 mL, and 1000 cm³ = 1 L, the same 1000 links mL and L.",
        explanation: "1000 mL = 1 L. (Since 1000 cm³ = 1 L and 1 cm³ = 1 mL, it follows that 1000 mL = 1 L.)",
      };
    }

    if (branch === "l-to-ml") {
      const litres = roundTo2(randInt(rng, 2, 40) + randChoice(rng, [0, 0, 0, 0.5]));
      const mlVal = litres * 1000;
      const ctx = randChoice(rng, CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `While ${ctx}, ${litres} L of liquid is measured out. Convert this to millilitres.`,
        before: "",
        after: "mL",
        correctAnswer: fmt(mlVal),
        inputMode: "numeric",
        hint: "1 L = 1000 mL, so multiply the number of litres by 1000.",
        explanation: `${fmt(litres)} L × 1000 = ${fmt(mlVal)} mL.`,
      };
    }

    if (branch === "ml-to-l") {
      const mlVal = randInt(rng, 2, 47) * 100;
      const litres = mlVal / 1000;
      const ctx = randChoice(rng, CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `While ${ctx}, ${mlVal} mL of liquid is measured out. Convert this to litres.`,
        before: "",
        after: "L",
        correctAnswer: fmt(litres),
        inputMode: "numeric",
        hint: "1000 mL = 1 L, so divide the number of mL by 1000.",
        explanation: `${mlVal} mL ÷ 1000 = ${fmt(litres)} L.`,
      };
    }

    if (branch === "cm3-to-l") {
      const direction = randChoice(rng, ["cm3-to-l", "l-to-cm3"] as const);
      const ctx = randChoice(rng, CONTEXTS);
      if (direction === "cm3-to-l") {
        const cm3 = randInt(rng, 2, 47) * 100;
        const litres = cm3 / 1000;
        return {
          kind: "fill-blank",
          prompt: `A rectangular container used for ${ctx} has a volume of ${cm3} cm³. What is its capacity in litres?`,
          before: "",
          after: "L",
          correctAnswer: fmt(litres),
          inputMode: "numeric",
          hint: "1000 cm³ = 1 L, so divide the number of cm³ by 1000.",
          explanation: `${cm3} cm³ ÷ 1000 = ${fmt(litres)} L (since 1 cm³ = 1 mL and 1000 mL = 1 L).`,
        };
      }
      const litres = randInt(rng, 2, 30);
      const cm3 = litres * 1000;
      return {
        kind: "fill-blank",
        prompt: `A container used for ${ctx} has a capacity of ${litres} L. What is its volume in cm³?`,
        before: "",
        after: "cm³",
        correctAnswer: String(cm3),
        inputMode: "numeric",
        hint: "1 L = 1000 cm³, so multiply the number of litres by 1000.",
        explanation: `${litres} L × 1000 = ${cm3} cm³ (since 1 L = 1000 mL and 1 mL = 1 cm³).`,
      };
    }

    if (branch === "classical-convert") {
      const direction = randChoice(rng, ["l-to-ml", "ml-to-l"] as const);
      if (direction === "l-to-ml") {
        const litres = roundTo2(randInt(rng, 1, 60) + randChoice(rng, [0, 0.25, 0.5, 0.75]));
        const mlVal = litres * 1000;
        return {
          kind: "fill-blank",
          prompt: `Convert ${fmt(litres)} L to millilitres.`,
          before: "",
          after: "mL",
          correctAnswer: fmt(mlVal),
          inputMode: "numeric",
          hint: "1 L = 1000 mL.",
          explanation: `${fmt(litres)} L × 1000 = ${fmt(mlVal)} mL.`,
        };
      }
      const mlVal = randInt(rng, 5, 95) * 100;
      const litres = mlVal / 1000;
      return {
        kind: "fill-blank",
        prompt: `Convert ${mlVal} mL to litres.`,
        before: "",
        after: "L",
        correctAnswer: fmt(litres),
        inputMode: "numeric",
        hint: "1000 mL = 1 L.",
        explanation: `${mlVal} mL ÷ 1000 = ${fmt(litres)} L.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctLitres(rng, 4);
      const tokens = shuffle(rng, chosen.map((l, i) => ({ id: `c${i}`, label: `${fmt(l)} L` })));
      const targets = shuffle(rng, chosen.map((l, i) => ({ id: `c${i}`, label: `${fmt(l * 1000)} mL` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      return {
        kind: "click-match",
        prompt: "Match each quantity in litres to its equivalent in millilitres.",
        tokens,
        targets,
        correctMap,
        hint: "Multiply the number of litres by 1000.",
        explanation: chosen.map((l) => `${fmt(l)} L = ${fmt(l * 1000)} mL`).join("; ") + ".",
      };
    }

    if (branch === "categorize") {
      const chosenContexts = shuffle(rng, [...CONTEXTS]).slice(0, 6);
      const quantities = chosenContexts.map(() => ({
        litres: roundTo2(randFloat05(rng)),
      }));
      const items = chosenContexts.map((ctx, i) => ({ id: `q${i}`, label: `${fmt(quantities[i].litres)} L — ${ctx}` }));
      const buckets = [
        { id: "over", label: "More than 1 L" },
        { id: "under", label: "1 L or less" },
      ];
      const correctBucket: Record<string, string> = {};
      quantities.forEach((q, i) => (correctBucket[`q${i}`] = q.litres > 1 ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: "Sort each quantity by whether it is more than 1 litre, or 1 litre and less.",
        items,
        buckets,
        correctBucket,
        hint: "Compare each amount directly to 1 L.",
        explanation: quantities.map((q) => `${fmt(q.litres)} L is ${q.litres > 1 ? "more than" : "at most"} 1 L`).join("; ") + ".",
      };
    }

    // order-capacity
    const raw = pickMixedCapacities(rng, 4);
    const items = raw.map((r, i) => ({ id: `c${i}`, label: r.label }));
    const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].ml - raw[b].ml);
    return {
      kind: "ordering",
      prompt: "Arrange these capacities from smallest to largest.",
      instruction: "Click them in order, smallest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `c${i}`),
      hint: "Convert every amount to millilitres before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${raw[i].ml} mL)`).join(", ")}.`,
    };
  },
};

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}
function randFloat05(rng: RNG): number {
  return randInt(rng, 10, 300) / 100; // 0.10 to 3.00 L
}
function pickDistinctLitres(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 2, 40));
  return shuffle(rng, Array.from(seen));
}
function pickMixedCapacities(rng: RNG, count: number): { label: string; ml: number }[] {
  const options: { label: string; ml: number }[] = [];
  const usedMl = new Set<number>();
  while (options.length < count) {
    const unit = randChoice(rng, ["L", "mL", "cm3"] as const);
    let ml: number;
    let label: string;
    if (unit === "L") {
      const v = randInt(rng, 1, 20);
      ml = v * 1000;
      label = `${v} L`;
    } else if (unit === "mL") {
      const v = randInt(rng, 100, 9500);
      ml = v;
      label = `${v} mL`;
    } else {
      const v = randInt(rng, 100, 9500);
      ml = v;
      label = `${v} cm³`;
    }
    if (!usedMl.has(ml)) {
      usedMl.add(ml);
      options.push({ label, ml });
    }
  }
  return options;
}
