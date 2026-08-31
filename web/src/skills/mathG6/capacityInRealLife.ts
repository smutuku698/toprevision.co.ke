import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

// 32 real Kenyan containers with a defensible typical capacity in millilitres.
const CONTAINERS = [
  { label: "a teaspoon", mL: 5 },
  { label: "a tablespoon", mL: 15 },
  { label: "a drinking cup", mL: 250 },
  { label: "a mug", mL: 300 },
  { label: "a soda bottle", mL: 500 },
  { label: "a small water bottle", mL: 500 },
  { label: "a large bottle of drinking water", mL: 1000 },
  { label: "a thermos flask", mL: 1000 },
  { label: "a teapot", mL: 1000 },
  { label: "a cooking pot (sufuria)", mL: 3000 },
  { label: "a washing basin", mL: 5000 },
  { label: "a household bucket", mL: 10000 },
  { label: "a garden watering can", mL: 9000 },
  { label: "a 20-litre jerrycan", mL: 20000 },
  { label: "a milk churn", mL: 20000 },
  { label: "a bathtub", mL: 150000 },
  { label: "a household water storage tank", mL: 1000000 },
  { label: "a rainwater harvesting tank", mL: 5000000 },
  { label: "a car's fuel tank", mL: 45000 },
  { label: "a motorbike's fuel tank", mL: 10000 },
  { label: "a school swimming pool", mL: 50000000 },
  { label: "a medicine dosage spoon", mL: 5 },
  { label: "a syringe", mL: 10 },
  { label: "an eye-drop bottle", mL: 10 },
  { label: "a cough syrup bottle", mL: 100 },
  { label: "a cooking oil bottle", mL: 1000 },
  { label: "a paint tin", mL: 4000 },
  { label: "a fish tank", mL: 20000 },
  { label: "a hot water bottle", mL: 2000 },
  { label: "a fire extinguisher", mL: 9000 },
  { label: "a water dispenser bottle", mL: 19000 },
  { label: "a cattle water trough", mL: 200000 },
] as const;

export const capacityInRealLife: Skill = {
  id: "g6-math-m-capacity-real-life",
  code: "M.6",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Capacity in real life",
  description: "Add and subtract capacities in litres, work out how many fills a container needs, and recognise typical capacities of real Kenyan containers.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "add-capacities",
        "subtract-capacities",
        "how-many-fills",
        "classical-operation",
        "best-unit-categorize",
        "typical-capacity-mc",
        "click-match",
        "order-capacity",
      ] as const
    );

    if (branch === "add-capacities") {
      // Restricted to containers roughly 1-20 L so the poured amount can never exceed
      // what the container could plausibly hold.
      const pourable = CONTAINERS.filter((x) => x.mL >= 1000 && x.mL <= 20000);
      const c1 = randChoice(rng, pourable);
      const c2 = randChoice(rng, pourable);
      const v1 = fractionOfCapacity(rng, c1.mL);
      const v2 = fractionOfCapacity(rng, c2.mL);
      const total = roundTo2(v1 + v2);
      return {
        kind: "fill-blank",
        prompt: `A shopkeeper pours ${fmt(v1)} L of liquid from ${c1.label} and ${fmt(v2)} L from ${c2.label} into one large container. What is the total volume?`,
        before: "Total =",
        after: "L",
        correctAnswer: fmt(total),
        inputMode: "numeric",
        hint: "Add the two amounts of liquid together.",
        explanation: `${fmt(v1)} L + ${fmt(v2)} L = ${fmt(total)} L.`,
      };
    }

    if (branch === "subtract-capacities") {
      // Restricted to containers roughly 5-250 L, and the starting amount is always a
      // fraction of that specific container's own capacity, so it can never "contain"
      // more than it can physically hold.
      const holdable = CONTAINERS.filter((x) => x.mL >= 5000 && x.mL <= 250000);
      const c = randChoice(rng, holdable);
      const startL = fractionOfCapacity(rng, c.mL, 0.5, 0.95);
      const usedL = roundTo2(randInt(rng, Math.round(startL * 10 * 0.2), Math.round(startL * 10 * 0.8)) / 10);
      const remaining = roundTo2(startL - usedL);
      return {
        kind: "fill-blank",
        prompt: `${c.label[0].toUpperCase()}${c.label.slice(1)} (capacity ${fmt(c.mL / 1000)} L) currently contains ${fmt(startL)} L of water. ${fmt(usedL)} L is drawn off for use. How much water remains?`,
        before: "Remaining =",
        after: "L",
        correctAnswer: fmt(remaining),
        inputMode: "numeric",
        hint: "Subtract the amount used from the starting amount.",
        explanation: `${fmt(startL)} L − ${fmt(usedL)} L = ${fmt(remaining)} L.`,
      };
    }

    if (branch === "how-many-fills") {
      const jerryL = randChoice(rng, [2, 5, 10, 20, 25] as const);
      const fills = randInt(rng, 3, 12);
      const tankL = jerryL * fills;
      const small = randChoice(rng, CONTAINERS.filter((x) => x.mL <= 20000));
      const vessel = randChoice(rng, ["water storage tank", "rainwater collection drum", "livestock water trough", "irrigation storage tank"] as const);
      const article = /^[aeiou]/i.test(vessel) ? "An" : "A";
      return {
        kind: "fill-blank",
        prompt: `${article} ${vessel} needs ${tankL} L to be completely full. Water is carried to it using a container like ${small.label} that holds ${jerryL} L each trip. How many full trips are needed to fill it completely?`,
        before: "",
        after: "trips",
        correctAnswer: String(fills),
        inputMode: "numeric",
        hint: "Divide the total capacity by the amount carried each trip.",
        explanation: `${tankL} L ÷ ${jerryL} L per trip = ${fills} trips.`,
      };
    }

    if (branch === "classical-operation") {
      const op = randChoice(rng, ["add", "subtract"] as const);
      if (op === "add") {
        const v1 = roundTo2(randInt(rng, 5, 500) / 10);
        const v2 = roundTo2(randInt(rng, 5, 500) / 10);
        const total = roundTo2(v1 + v2);
        return {
          kind: "fill-blank",
          prompt: `Work out: ${fmt(v1)} L + ${fmt(v2)} L.`,
          before: "",
          after: "L",
          correctAnswer: fmt(total),
          inputMode: "numeric",
          hint: "Add the litres directly.",
          explanation: `${fmt(v1)} L + ${fmt(v2)} L = ${fmt(total)} L.`,
        };
      }
      const v1 = roundTo2(randInt(rng, 300, 900) / 10);
      const v2 = roundTo2(randInt(rng, 5, Math.floor(v1 * 10) - 20) / 10);
      const diff = roundTo2(v1 - v2);
      return {
        kind: "fill-blank",
        prompt: `Work out: ${fmt(v1)} L − ${fmt(v2)} L.`,
        before: "",
        after: "L",
        correctAnswer: fmt(diff),
        inputMode: "numeric",
        hint: "Subtract the litres directly.",
        explanation: `${fmt(v1)} L − ${fmt(v2)} L = ${fmt(diff)} L.`,
      };
    }

    if (branch === "best-unit-categorize") {
      const chosen = shuffle(rng, [...CONTAINERS]).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.label }));
      const buckets = [
        { id: "ml", label: "Best measured in millilitres (mL)" },
        { id: "l", label: "Best measured in litres (L)" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.mL < 1000 ? "ml" : "l"));
      return {
        kind: "categorize",
        prompt: "Sort each container by which unit best describes its typical capacity.",
        items,
        buckets,
        correctBucket,
        hint: "Very small amounts (under 1000 mL, i.e. under 1 L) are usually given in mL; larger amounts are usually given in L.",
        explanation: chosen.map((c) => `${c.label}: about ${c.mL >= 1000 ? `${fmt(c.mL / 1000)} L` : `${c.mL} mL`}`).join("; ") + ".",
      };
    }

    if (branch === "typical-capacity-mc") {
      const target = randChoice(rng, CONTAINERS);
      const correctLabel = capacityLabel(target.mL);
      const wrong = [capacityLabel(target.mL / 10), capacityLabel(target.mL * 10), capacityLabel(target.mL * 100)].filter((w) => w !== correctLabel);
      while (wrong.length < 3) wrong.push(capacityLabel(target.mL + 500));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctLabel, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which is the most reasonable capacity for ${target.label}?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Picture how much liquid the container would realistically hold.",
        explanation: `${target.label[0].toUpperCase()}${target.label.slice(1)} typically holds about ${correctLabel}. The other options are off by a factor of 10 or 100.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...CONTAINERS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `c${i}`, label: c.label })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `c${i}`, label: capacityLabel(c.mL) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      return {
        kind: "click-match",
        prompt: "Match each container to its typical capacity.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the real-world size of each container.",
        explanation: chosen.map((c) => `${c.label}: about ${capacityLabel(c.mL)}`).join("; ") + ".",
      };
    }

    // order-capacity
    const chosen = shuffle(rng, [...CONTAINERS]).slice(0, 4);
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.label }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].mL - chosen[b].mL);
    return {
      kind: "ordering",
      prompt: "Arrange these containers from smallest to largest typical capacity.",
      instruction: "Click them in order, smallest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `c${i}`),
      hint: "Think about how much liquid each container realistically holds.",
      explanation: `In order: ${sortedIdx.map((i) => `${chosen[i].label} (about ${capacityLabel(chosen[i].mL)})`).join(", ")}.`,
    };
  },
};

function capacityLabel(mL: number): string {
  if (mL < 1000) return `${fmt(Math.round(mL))} mL`;
  return `${fmt(mL / 1000)} L`;
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** A random amount (in L, to 1 decimal place) between the given fractions of a container's own capacity —
 * keeps generated amounts from ever exceeding what that specific container could physically hold. */
function fractionOfCapacity(rng: RNG, mL: number, minFrac = 0.15, maxFrac = 0.9): number {
  const litres = mL / 1000;
  const minTenths = Math.max(1, Math.round(litres * minFrac * 10));
  const maxTenths = Math.max(minTenths + 1, Math.round(litres * maxFrac * 10));
  return randInt(rng, minTenths, maxTenths) / 10;
}
