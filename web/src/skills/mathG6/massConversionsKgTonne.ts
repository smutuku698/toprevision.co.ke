import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 1000 kg = 1 tonne.

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
function tonnesLabel(n: number): string {
  return `${fmt(n)} tonne${n === 1 ? "" : "s"}`;
}

// 32 real-world tonne-scale Kenyan contexts.
const CONTEXTS = [
  "a fully loaded delivery lorry",
  "a shipping container at Mombasa port",
  "a goods train wagon",
  "a truckload of maize",
  "a truckload of cement",
  "a truckload of river sand",
  "a truckload of gravel",
  "a livestock truck carrying cattle",
  "a truckload of sugarcane",
  "a truckload of tea leaves",
  "a truckload of coffee beans",
  "a milk tanker",
  "a truckload of bricks",
  "a truckload of timber",
  "a truckload of fertiliser",
  "a truckload of charcoal sacks",
  "a truckload of potatoes",
  "a truckload of onions",
  "a truckload of bananas",
  "a truckload of scrap metal",
  "a truckload of steel bars",
  "a truckload of packaged flour",
  "a truckload of rice sacks",
  "a truckload of beans",
  "a bulldozer at a construction site",
  "a farm tractor",
  "a cargo ship's hold",
  "a grain silo's stock",
  "a quarry's daily rock output",
  "a cargo aeroplane's freight hold",
  "hardcore delivered to a construction site",
  "cement bags stored in a warehouse",
] as const;

export const massConversionsKgTonne: Skill = {
  id: "g6-math-m-mass-conversions",
  code: "M.7",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Mass: kilogrammes and tonnes",
  description: "Identify the tonne as a unit for measuring very heavy mass, understand the relationship between kilogrammes and tonnes, and convert between them.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-tonne-mc",
        "relationship-mc",
        "kg-to-tonne",
        "tonne-to-kg",
        "classical-convert",
        "click-match",
        "categorize",
        "order-mass",
      ] as const
    );

    if (branch === "identify-tonne-mc") {
      const ctx = randChoice(rng, CONTEXTS);
      const wrong = ["Kilogram", "Gram", "Litre"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "Tonne", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which unit would be most sensible for measuring the mass of ${ctx}?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "This is far too heavy to sensibly measure in kilograms or grams, and litres measure volume, not mass.",
        explanation: `${ctx[0].toUpperCase()}${ctx.slice(1)} is extremely heavy, so the tonne — 1000 kg — is the sensible unit. A litre is a unit of capacity/volume, not mass, so it can never be correct here.`,
      };
    }

    if (branch === "relationship-mc") {
      const wrong = ["100", "10", "10,000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "1,000", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: "How many kilogrammes (kg) make up 1 tonne?",
        choices,
        correctIndex,
        layout: "row",
        hint: "This is the basic relationship between kg and tonnes.",
        explanation: "1000 kg = 1 tonne. (100 confuses it with a percentage-style jump, and 10,000 is ten times too large.)",
      };
    }

    if (branch === "kg-to-tonne") {
      const kgVal = randInt(rng, 2, 48) * 500;
      const tonnes = kgVal / 1000;
      const ctx = randChoice(rng, CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `${ctx[0].toUpperCase()}${ctx.slice(1)} has a mass of ${kgVal.toLocaleString()} kg. Convert this to tonnes.`,
        before: "",
        after: "tonnes",
        correctAnswer: fmt(tonnes),
        inputMode: "numeric",
        hint: "1000 kg = 1 tonne, so divide the number of kg by 1000.",
        explanation: `${kgVal.toLocaleString()} kg ÷ 1000 = ${fmt(tonnes)} tonnes.`,
      };
    }

    if (branch === "tonne-to-kg") {
      const tonnes = roundTo2(randInt(rng, 2, 90) / 2);
      const kgVal = tonnes * 1000;
      const ctx = randChoice(rng, CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `${ctx[0].toUpperCase()}${ctx.slice(1)} has a mass of ${tonnesLabel(tonnes)}. Convert this to kilogrammes.`,
        before: "",
        after: "kg",
        correctAnswer: fmt(kgVal),
        inputMode: "numeric",
        hint: "1 tonne = 1000 kg, so multiply the number of tonnes by 1000.",
        explanation: `${tonnesLabel(tonnes)} × 1000 = ${fmt(kgVal)} kg.`,
      };
    }

    if (branch === "classical-convert") {
      const direction = randChoice(rng, ["kg-to-t", "t-to-kg"] as const);
      if (direction === "kg-to-t") {
        const kgVal = randInt(rng, 2, 60) * 500;
        const tonnes = kgVal / 1000;
        return {
          kind: "fill-blank",
          prompt: `Convert ${kgVal.toLocaleString()} kg to tonnes.`,
          before: "",
          after: "tonnes",
          correctAnswer: fmt(tonnes),
          inputMode: "numeric",
          hint: "Divide by 1000.",
          explanation: `${kgVal.toLocaleString()} kg ÷ 1000 = ${fmt(tonnes)} tonnes.`,
        };
      }
      const tonnes = roundTo2(randInt(rng, 2, 100) / 2);
      const kgVal = tonnes * 1000;
      return {
        kind: "fill-blank",
        prompt: `Convert ${tonnesLabel(tonnes)} to kilogrammes.`,
        before: "",
        after: "kg",
        correctAnswer: fmt(kgVal),
        inputMode: "numeric",
        hint: "Multiply by 1000.",
        explanation: `${tonnesLabel(tonnes)} × 1000 = ${fmt(kgVal)} kg.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctTonnes(rng, 4);
      const tokens = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: tonnesLabel(t) })));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: `${fmt(t * 1000)} kg` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each mass in tonnes to its equivalent in kilogrammes.",
        tokens,
        targets,
        correctMap,
        hint: "Multiply the number of tonnes by 1000.",
        explanation: chosen.map((t) => `${tonnesLabel(t)} = ${fmt(t * 1000)} kg`).join("; ") + ".",
      };
    }

    if (branch === "categorize") {
      const values = pickDistinctKg(rng, 6);
      const items = values.map((v, i) => ({ id: `v${i}`, label: `${v.toLocaleString()} kg` }));
      const buckets = [
        { id: "over", label: "1 tonne (1000 kg) or more" },
        { id: "under", label: "Less than 1 tonne" },
      ];
      const correctBucket: Record<string, string> = {};
      values.forEach((v, i) => (correctBucket[`v${i}`] = v >= 1000 ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: "Sort each mass by whether it is 1 tonne (1000 kg) or more, or less than 1 tonne.",
        items,
        buckets,
        correctBucket,
        hint: "Compare each value directly to 1000 kg.",
        explanation: values.map((v) => `${v.toLocaleString()} kg is ${v >= 1000 ? "at least" : "less than"} 1 tonne`).join("; ") + ".",
      };
    }

    // order-mass
    const raw = pickMixedMasses(rng, 4);
    const items = raw.map((r, i) => ({ id: `m${i}`, label: r.label }));
    const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].kg - raw[b].kg);
    return {
      kind: "ordering",
      prompt: "Arrange these masses from smallest to largest.",
      instruction: "Click them in order, smallest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `m${i}`),
      hint: "Convert every mass to kilogrammes before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${raw[i].kg.toLocaleString()} kg)`).join(", ")}.`,
    };
  },
};

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}
function pickDistinctTonnes(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 2, 40) / 2);
  return shuffle(rng, Array.from(seen));
}
function pickDistinctKg(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 2, 60) * 100);
  return shuffle(rng, Array.from(seen));
}
function pickMixedMasses(rng: RNG, count: number): { label: string; kg: number }[] {
  const options: { label: string; kg: number }[] = [];
  const used = new Set<number>();
  while (options.length < count) {
    const unit = randChoice(rng, ["kg", "tonnes"] as const);
    let kg: number;
    let label: string;
    if (unit === "kg") {
      const v = randInt(rng, 50, 4500);
      kg = v;
      label = `${v.toLocaleString()} kg`;
    } else {
      const v = roundTo2(randInt(rng, 2, 40) / 2);
      kg = v * 1000;
      label = tonnesLabel(v);
    }
    if (!used.has(kg)) {
      used.add(kg);
      options.push({ label, kg });
    }
  }
  return options;
}
