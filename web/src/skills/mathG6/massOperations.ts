import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 1 tonne = 1000 kg. Masses are written "X tonnes Y kg" and answers are given in kg.

function formatTKg(t: number, kg: number): string {
  return `${t} tonne${t === 1 ? "" : "s"} ${kg} kg`;
}
function article(word: string): "A" | "An" {
  return /^[aeiou]/i.test(word) ? "An" : "A";
}
function totalKg(t: number, kg: number): number {
  return t * 1000 + kg;
}
function fromTotalKg(x: number): { t: number; kg: number } {
  return { t: Math.floor(x / 1000), kg: x % 1000 };
}

// 30 real-world Kenyan mass-operation contexts — worker + material.
const CONTEXTS = [
  { worker: "lorry driver", material: "cement bags" },
  { worker: "quarry manager", material: "crushed stone" },
  { worker: "farmer", material: "a maize harvest" },
  { worker: "warehouse manager", material: "sacks of rice" },
  { worker: "shipping clerk", material: "cargo in containers" },
  { worker: "grain miller", material: "sacks of wheat" },
  { worker: "construction supervisor", material: "a delivery of river sand" },
  { worker: "livestock trader", material: "a herd of cattle" },
  { worker: "factory manager", material: "raw material deliveries" },
  { worker: "sugar factory clerk", material: "sugarcane deliveries" },
  { worker: "tea factory clerk", material: "tea leaf deliveries" },
  { worker: "coffee cooperative clerk", material: "coffee bean deliveries" },
  { worker: "fertiliser depot manager", material: "fertiliser bags" },
  { worker: "timber yard manager", material: "timber deliveries" },
  { worker: "scrap metal dealer", material: "scrap metal loads" },
  { worker: "flour miller", material: "flour sacks" },
  { worker: "potato trader", material: "potato sacks" },
  { worker: "onion trader", material: "onion sacks" },
  { worker: "banana trader", material: "banana bunches" },
  { worker: "charcoal trader", material: "charcoal sacks" },
  { worker: "brick maker", material: "brick deliveries" },
  { worker: "steel yard manager", material: "steel bar deliveries" },
  { worker: "dairy cooperative clerk", material: "the day's milk collection" },
  { worker: "bean trader", material: "bean sacks" },
  { worker: "hardware store manager", material: "cement deliveries" },
  { worker: "transporter", material: "a truckload of goods" },
  { worker: "port clerk", material: "shipping container cargo" },
  { worker: "mining company supervisor", material: "ore deliveries" },
  { worker: "quarry driver", material: "gravel deliveries" },
  { worker: "produce market trader", material: "mixed farm produce" },
] as const;

export const massOperations: Skill = {
  id: "g6-math-m-mass-operations",
  code: "M.8",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Operations with mass (tonnes and kg)",
  description: "Add, subtract, multiply and divide masses given in tonnes and kilogrammes, in real-life Kenyan contexts.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "add-mass",
        "subtract-mass",
        "multiply-mass",
        "divide-mass",
        "classical-mixed",
        "reverse-load-mc",
        "click-match",
        "order-mass",
        "categorize-mass",
      ] as const
    );

    if (branch === "add-mass") {
      const ctx = randChoice(rng, CONTEXTS);
      const t1 = randInt(rng, 1, 8);
      const kg1 = randInt(rng, 0, 999);
      const t2 = randInt(rng, 1, 8);
      const kg2 = randInt(rng, 0, 999);
      const sum = totalKg(t1, kg1) + totalKg(t2, kg2);
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} combines two loads of ${ctx.material}: one weighing ${formatTKg(t1, kg1)} and another weighing ${formatTKg(t2, kg2)}. What is the total mass? Give your answer in kg.`,
        before: "Total =",
        after: "kg",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Convert each mass to kg first (1 tonne = 1000 kg), then add.",
        explanation: `${formatTKg(t1, kg1)} = ${totalKg(t1, kg1)} kg. ${formatTKg(t2, kg2)} = ${totalKg(t2, kg2)} kg. Total = ${totalKg(t1, kg1)} + ${totalKg(t2, kg2)} = ${sum} kg.`,
      };
    }

    if (branch === "subtract-mass") {
      const ctx = randChoice(rng, CONTEXTS);
      const t1 = randInt(rng, 4, 12);
      const kg1 = randInt(rng, 0, 999);
      const t2 = randInt(rng, 1, t1 - 1);
      const kg2 = randInt(rng, 0, 999);
      const total1 = totalKg(t1, kg1);
      const total2 = totalKg(t2, kg2);
      const diff = Math.abs(total1 - total2);
      const bigger = total1 >= total2 ? { t: t1, kg: kg1 } : { t: t2, kg: kg2 };
      const smaller = total1 >= total2 ? { t: t2, kg: kg2 } : { t: t1, kg: kg1 };
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} has ${formatTKg(bigger.t, bigger.kg)} of ${ctx.material} and dispatches ${formatTKg(smaller.t, smaller.kg)} of it. What mass remains? Give your answer in kg.`,
        before: "Remaining =",
        after: "kg",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Convert each mass to kg first, then subtract.",
        explanation: `${formatTKg(bigger.t, bigger.kg)} = ${totalKg(bigger.t, bigger.kg)} kg. ${formatTKg(smaller.t, smaller.kg)} = ${totalKg(smaller.t, smaller.kg)} kg. Remaining = ${totalKg(bigger.t, bigger.kg)} - ${totalKg(smaller.t, smaller.kg)} = ${diff} kg.`,
      };
    }

    if (branch === "multiply-mass") {
      const ctx = randChoice(rng, CONTEXTS);
      const t = randInt(rng, 0, 3);
      const kg = randInt(rng, 50, 900);
      const n = randInt(rng, 3, 9);
      const t1 = totalKg(t, kg);
      const product = t1 * n;
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} loads ${n} identical trips of ${ctx.material}, each weighing ${formatTKg(t, kg)}. What is the total mass moved? Give your answer in kg.`,
        before: "Total =",
        after: "kg",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Convert one trip's mass to kg, then multiply by the number of trips.",
        explanation: `${formatTKg(t, kg)} = ${t1} kg. Total = ${t1} × ${n} = ${product} kg.`,
      };
    }

    if (branch === "divide-mass") {
      const ctx = randChoice(rng, CONTEXTS);
      const n = randInt(rng, 2, 8);
      const shareT = randInt(rng, 0, 2);
      const shareKg = randInt(rng, 20, 700);
      const shareTotal = totalKg(shareT, shareKg);
      const grandTotal = shareTotal * n;
      const grand = fromTotalKg(grandTotal);
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} has ${formatTKg(grand.t, grand.kg)} of ${ctx.material} in total and shares it equally across ${n} trips. What mass is carried on each trip? Give your answer in kg.`,
        before: "Each trip =",
        after: "kg",
        correctAnswer: String(shareTotal),
        inputMode: "numeric",
        hint: "Convert the total to kg first, then divide by the number of trips.",
        explanation: `${formatTKg(grand.t, grand.kg)} = ${grandTotal} kg. Each trip = ${grandTotal} ÷ ${n} = ${shareTotal} kg.`,
      };
    }

    if (branch === "classical-mixed") {
      const op = randChoice(rng, ["add", "subtract", "multiply", "divide"] as const);
      if (op === "add") {
        const t1 = randInt(rng, 1, 9);
        const kg1 = randInt(rng, 0, 999);
        const t2 = randInt(rng, 1, 9);
        const kg2 = randInt(rng, 0, 999);
        const sum = totalKg(t1, kg1) + totalKg(t2, kg2);
        return {
          kind: "fill-blank",
          prompt: `Work out: ${formatTKg(t1, kg1)} + ${formatTKg(t2, kg2)}. Give your answer in kg.`,
          before: "",
          after: "kg",
          correctAnswer: String(sum),
          inputMode: "numeric",
          hint: "Convert both masses to kg, then add.",
          explanation: `${formatTKg(t1, kg1)} = ${totalKg(t1, kg1)} kg, ${formatTKg(t2, kg2)} = ${totalKg(t2, kg2)} kg. Sum = ${sum} kg.`,
        };
      }
      if (op === "subtract") {
        const t1 = randInt(rng, 5, 12);
        const kg1 = randInt(rng, 0, 999);
        const t2 = randInt(rng, 1, t1 - 1);
        const kg2 = randInt(rng, 0, 999);
        const total1 = totalKg(t1, kg1);
        const total2 = totalKg(t2, kg2);
        const diff = Math.abs(total1 - total2);
        return {
          kind: "fill-blank",
          prompt: `Work out: ${formatTKg(t1, kg1)} − ${formatTKg(t2, kg2)}. Give your answer in kg.`,
          before: "",
          after: "kg",
          correctAnswer: String(diff),
          inputMode: "numeric",
          hint: "Convert both masses to kg, then subtract.",
          explanation: `${formatTKg(t1, kg1)} = ${total1} kg, ${formatTKg(t2, kg2)} = ${total2} kg. Difference = ${diff} kg.`,
        };
      }
      if (op === "multiply") {
        const t = randInt(rng, 0, 3);
        const kg = randInt(rng, 20, 900);
        const n = randInt(rng, 2, 9);
        const t1 = totalKg(t, kg);
        const product = t1 * n;
        return {
          kind: "fill-blank",
          prompt: `Work out: ${formatTKg(t, kg)} × ${n}. Give your answer in kg.`,
          before: "",
          after: "kg",
          correctAnswer: String(product),
          inputMode: "numeric",
          hint: "Convert to kg first, then multiply.",
          explanation: `${formatTKg(t, kg)} = ${t1} kg. ${t1} × ${n} = ${product} kg.`,
        };
      }
      const n = randInt(rng, 2, 9);
      const shareT = randInt(rng, 0, 2);
      const shareKg = randInt(rng, 20, 700);
      const shareTotal = totalKg(shareT, shareKg);
      const grand = fromTotalKg(shareTotal * n);
      return {
        kind: "fill-blank",
        prompt: `Work out: ${formatTKg(grand.t, grand.kg)} ÷ ${n}. Give your answer in kg.`,
        before: "",
        after: "kg",
        correctAnswer: String(shareTotal),
        inputMode: "numeric",
        hint: "Convert to kg first, then divide.",
        explanation: `${formatTKg(grand.t, grand.kg)} = ${shareTotal * n} kg. ${shareTotal * n} ÷ ${n} = ${shareTotal} kg.`,
      };
    }

    if (branch === "reverse-load-mc") {
      const ctx = randChoice(rng, CONTEXTS);
      const t1 = randInt(rng, 3, 10);
      const kg1 = randInt(rng, 0, 999);
      const t2 = randInt(rng, 1, t1 - 1);
      const kg2 = randInt(rng, 0, 999);
      const totalCombined = totalKg(t1, kg1);
      const first = totalKg(t2, kg2);
      const other = totalCombined - first;
      const wrong = [String(totalCombined + first), String(Math.abs(first - totalCombined) + 100), String(first)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(other), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${article(ctx.worker)} ${ctx.worker} splits a combined load of ${ctx.material} weighing ${formatTKg(t1, kg1)} into two parts. The first part weighs ${formatTKg(t2, kg2)}. What does the second part weigh, in kg?`,
        choices: choices.map((c) => `${c} kg`),
        correctIndex,
        layout: "row",
        hint: "Convert the combined mass and the known part to kg, then subtract.",
        explanation: `Combined = ${totalCombined} kg. First part = ${first} kg. Second part = ${totalCombined} − ${first} = ${other} kg. (Adding instead of subtracting, or repeating the known part, gives the wrong distractors.)`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctMasses(rng, 4);
      const tokens = shuffle(rng, chosen.map((m, i) => ({ id: `m${i}`, label: formatTKg(m.t, m.kg) })));
      const targets = shuffle(rng, chosen.map((m, i) => ({ id: `m${i}`, label: `${totalKg(m.t, m.kg)} kg` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each mass to its equivalent in kilogrammes.",
        tokens,
        targets,
        correctMap,
        hint: "Multiply the tonnes part by 1000, then add the kg part.",
        explanation: chosen.map((m) => `${formatTKg(m.t, m.kg)} = ${totalKg(m.t, m.kg)} kg`).join("; ") + ".",
      };
    }

    if (branch === "order-mass") {
      const chosen = pickDistinctMasses(rng, 4);
      const items = chosen.map((m, i) => ({ id: `m${i}`, label: formatTKg(m.t, m.kg) }));
      const sortedIdx = chosen.map((_, i) => i).sort((a, b) => totalKg(chosen[a].t, chosen[a].kg) - totalKg(chosen[b].t, chosen[b].kg));
      return {
        kind: "ordering",
        prompt: "Arrange these masses from lightest to heaviest.",
        instruction: "Click them in order, lightest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `m${i}`),
        hint: "Convert every mass to kg before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${formatTKg(chosen[i].t, chosen[i].kg)} (${totalKg(chosen[i].t, chosen[i].kg)} kg)`).join(", ")}.`,
      };
    }

    // categorize-mass
    const threshold = randChoice(rng, [3000, 5000, 8000] as const);
    const chosen = pickDistinctMasses(rng, 6);
    const items = chosen.map((m, i) => ({ id: `m${i}`, label: formatTKg(m.t, m.kg) }));
    const buckets = [
      { id: "over", label: `Over ${threshold.toLocaleString()} kg` },
      { id: "under", label: `${threshold.toLocaleString()} kg or under` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((m, i) => (correctBucket[`m${i}`] = totalKg(m.t, m.kg) > threshold ? "over" : "under"));
    return {
      kind: "categorize",
      prompt: `Sort each mass by whether it is over ${threshold.toLocaleString()} kg, or ${threshold.toLocaleString()} kg and under.`,
      items,
      buckets,
      correctBucket,
      hint: "Convert each mass to kg, then compare to the threshold.",
      explanation: chosen.map((m) => `${formatTKg(m.t, m.kg)} = ${totalKg(m.t, m.kg)} kg`).join("; ") + ".",
    };
  },
};

function pickDistinctMasses(rng: RNG, count: number): { t: number; kg: number }[] {
  const seen = new Set<number>();
  const result: { t: number; kg: number }[] = [];
  while (result.length < count) {
    const t = randInt(rng, 0, 9);
    const kg = randInt(rng, 0, 999);
    const total = totalKg(t, kg);
    if (!seen.has(total)) {
      seen.add(total);
      result.push({ t, kg });
    }
  }
  return result;
}
