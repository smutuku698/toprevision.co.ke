import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

function sampleThreeDistinct(rng: RNG): [number, number, number] {
  const a = randInt(rng, 1, 6);
  let b = randInt(rng, 1, 6);
  while (b === a) b = randInt(rng, 1, 6);
  let c = randInt(rng, 1, 6);
  while (c === a || c === b) c = randInt(rng, 1, 6);
  return [a, b, c];
}

const RATE_CONTEXTS = [
  { verb: "travels", quantity: "distance", qUnit: "km", per: "fuel used", perUnit: "litres", rateLabel: "km per litre" },
  { verb: "earns", quantity: "amount earned", qUnit: "KES", per: "hours worked", perUnit: "hours", rateLabel: "KES per hour" },
  { verb: "types", quantity: "words typed", qUnit: "words", per: "time taken", perUnit: "minutes", rateLabel: "words per minute" },
];

const SHARE_CONTEXTS = ["a business profit", "harvested maize sacks", "a farming cooperative's earnings", "a family inheritance"];

export const ratesRatiosProportions: Skill = {
  id: "g8-math-n-rates-ratios-proportions",
  code: "N.5",
  subjectId: "math",
  strandId: "g8-math-numbers",
  grade: 8,
  title: "Rates, ratios, proportions, and percentages",
  description: "Work out rates, share quantities in a ratio, apply percentage change, and solve direct and inverse proportion problems in real life.",
  generate(rng) {
    const branch = randChoice(rng, ["rate", "ratio-share", "percent-change", "direct-proportion", "inverse-proportion", "order-rates", "change-sort"] as const);

    if (branch === "rate") {
      const ctx = randChoice(rng, RATE_CONTEXTS);
      const per = randInt(rng, 5, 30);
      const rate = randInt(rng, 4, 45);
      const quantity = per * rate;
      return {
        kind: "fill-blank",
        prompt: `A vehicle ${ctx.verb} ${quantity} ${ctx.qUnit} using ${per} ${ctx.perUnit}. What is the rate in ${ctx.rateLabel}?`,
        before: "Rate =",
        after: ctx.rateLabel,
        correctAnswer: String(rate),
        inputMode: "numeric",
        hint: `Divide the ${ctx.quantity} by the ${ctx.per}.`,
        explanation: `Rate $= ${quantity} \\div ${per} = ${rate}$ ${ctx.rateLabel}.`,
      };
    }

    if (branch === "ratio-share") {
      const threeWay = rng() < 0.5;
      const context = randChoice(rng, SHARE_CONTEXTS);
      const unit = randInt(rng, 150, 1400);
      if (threeWay) {
        const parts = sampleThreeDistinct(rng);
        const [a, b, c] = parts;
        const total = unit * (a + b + c);
        const shares = [unit * a, unit * b, unit * c];
        const askIdx = randInt(rng, 0, 2);
        const ordinal = ["first", "second", "third"][askIdx];
        return {
          kind: "fill-blank",
          prompt: `KES ${total.toLocaleString()} from ${context} is shared among three people in the ratio ${a}:${b}:${c}. How much does the ${ordinal} person get?`,
          before: "Share = KES",
          after: "",
          correctAnswer: String(shares[askIdx]),
          inputMode: "numeric",
          hint: `Total parts = ${a} + ${b} + ${c} = ${a + b + c}. Find the value of one part, then multiply by that person's number of parts.`,
          explanation: `Total parts $= ${a}+${b}+${c} = ${a + b + c}$. One part $= ${total} \\div ${a + b + c} = ${unit}$. Shares: ${a}×${unit}=${shares[0]}, ${b}×${unit}=${shares[1]}, ${c}×${unit}=${shares[2]}.`,
        };
      }
      const a = randInt(rng, 2, 9);
      let b = randInt(rng, 2, 9);
      while (b === a) b = randInt(rng, 2, 9);
      const total = unit * (a + b);
      const shareA = unit * a;
      const shareB = unit * b;
      const askFor = randChoice(rng, ["first", "second"] as const);
      return {
        kind: "fill-blank",
        prompt: `KES ${total.toLocaleString()} from ${context} is shared in the ratio ${a}:${b}. How much does the ${askFor === "first" ? "first" : "second"} person get?`,
        before: "Share = KES",
        after: "",
        correctAnswer: String(askFor === "first" ? shareA : shareB),
        inputMode: "numeric",
        hint: `Total parts = ${a} + ${b} = ${a + b}. Find the value of one part, then multiply.`,
        explanation: `Total parts $= ${a} + ${b} = ${a + b}$. One part $= ${total} \\div ${a + b} = ${unit}$. First person: $${a} \\times ${unit} = ${shareA}$. Second person: $${b} \\times ${unit} = ${shareB}$.`,
      };
    }

    if (branch === "percent-change") {
      const original = randInt(rng, 200, 2000);
      const percent = randChoice(rng, [5, 10, 15, 20, 25] as const);
      const direction = randChoice(rng, ["increase", "decrease"] as const);
      const change = (original * percent) / 100;
      const result = direction === "increase" ? original + change : original - change;
      const scenario = direction === "increase" ? "The price of maize flour rises" : "A shop offers a discount, so the price of a jacket falls";
      const wrongCandidates = [String(original + change * (direction === "increase" ? -1 : 1)), String(original), String(result + percent), String(result - percent)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(result), wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `${scenario} by ${percent}% from KES ${original}. What is the new price?`,
        choices: choices.map((c) => `KES ${c}`),
        correctIndex,
        layout: "grid",
        hint: `Find ${percent}% of ${original}, then ${direction === "increase" ? "add" : "subtract"} it.`,
        explanation: `${percent}% of ${original} = ${change}. New price $= ${original} ${direction === "increase" ? "+" : "-"} ${change} = ${result}$.`,
      };
    }

    if (branch === "direct-proportion") {
      const unitCost = randInt(rng, 18, 95);
      const knownQty = randInt(rng, 3, 9);
      const askQty = randInt(rng, 11, 27);
      const knownCost = unitCost * knownQty;
      const askCost = unitCost * askQty;
      return {
        kind: "fill-blank",
        prompt: `${knownQty} exercise books cost KES ${knownCost}. At the same rate, how much would ${askQty} exercise books cost?`,
        before: "Cost = KES",
        after: "",
        correctAnswer: String(askCost),
        inputMode: "numeric",
        hint: "Find the cost of one book first, then multiply by the new quantity.",
        explanation: `One book costs $${knownCost} \\div ${knownQty} = ${unitCost}$. So ${askQty} books cost $${unitCost} \\times ${askQty} = ${askCost}$.`,
      };
    }

    if (branch === "inverse-proportion") {
      const workers1 = randChoice(rng, [2, 3, 4, 5, 6] as const);
      let workers2 = randChoice(rng, [2, 3, 4, 5, 6, 8] as const);
      while (workers2 === workers1) workers2 = randChoice(rng, [2, 3, 4, 5, 6, 8] as const);
      // Build totalWork as a multiple of both worker counts, so both day counts are exact by construction.
      const totalWork = workers1 * workers2 * randInt(rng, 1, 3);
      const days1 = totalWork / workers1;
      const days2 = totalWork / workers2;
      const wrongCandidates = [String(days1), String(days2 + 1), String(days2 - 1), String(Math.round((days1 * workers1) / workers2 + 1))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(days2), wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `${workers1} workers can build a fence in ${days1} days. Working at the same rate, how many days would ${workers2} workers take?`,
        choices: choices.map((c) => `${c} days`),
        correctIndex,
        layout: "row",
        hint: "More workers finish faster — this is inverse proportion, so workers × days stays constant.",
        explanation: `Total work $= ${workers1} \\times ${days1} = ${totalWork}$ worker-days. With ${workers2} workers: $${totalWork} \\div ${workers2} = ${days2}$ days.`,
      };
    }

    if (branch === "order-rates") {
      const count = 4;
      const rates = new Set<number>();
      while (rates.size < count) rates.add(randInt(rng, 25, 480));
      const values = Array.from(rates);
      const items = values.map((v) => ({ id: `v${v}`, label: `KES ${v} per kg` }));
      const sorted = [...values].sort((a, b) => a - b);
      return {
        kind: "ordering",
        prompt: "A shopper compares the unit price of sugar at four shops. Order them from cheapest to most expensive.",
        instruction: "Click them in order, cheapest first.",
        items: shuffle(rng, items),
        correctOrder: sorted.map((v) => `v${v}`),
        hint: "Compare the price-per-kg values directly.",
        explanation: `Ordered from cheapest to most expensive: ${sorted.map((v) => `KES ${v}`).join(", ")}.`,
      };
    }

    // change-sort: categorize price-change scenarios as increase or decrease
    const count = 5;
    const scenarios = Array.from({ length: count }, () => {
      const before = randInt(rng, 150, 3200);
      const isIncrease = rng() < 0.5;
      const pct = randChoice(rng, [5, 10, 15, 20] as const);
      const after = isIncrease ? before + (before * pct) / 100 : before - (before * pct) / 100;
      return { before, after: Math.round(after), isIncrease };
    });
    const items = scenarios.map((s, i) => ({ id: `s${i}`, label: `KES ${s.before} → KES ${s.after}` }));
    const buckets = [
      { id: "increase", label: "Percentage increase" },
      { id: "decrease", label: "Percentage decrease" },
    ];
    const correctBucket: Record<string, string> = {};
    scenarios.forEach((s, i) => (correctBucket[`s${i}`] = s.isIncrease ? "increase" : "decrease"));
    return {
      kind: "categorize",
      prompt: "For each price change, decide whether it is a percentage increase or a percentage decrease.",
      items,
      buckets,
      correctBucket,
      hint: "If the new value is bigger than the original, it's an increase; if smaller, it's a decrease.",
      explanation: scenarios.map((s) => `KES ${s.before} → KES ${s.after} is a ${s.isIncrease ? "increase" : "decrease"}`).join("; ") + ".",
    };
  },
};
