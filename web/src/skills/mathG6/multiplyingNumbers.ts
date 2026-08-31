import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { ITEM_PRICE_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export const multiplyingNumbers: Skill = {
  id: "g6-math-n-multiplying-numbers",
  code: "N.5",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Multiplying numbers",
  description: "Multiply up to a 4-digit number by a 2-digit number, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["classical", "real-world-total", "real-world-mc", "match-products", "magnitude-sort", "order-products"] as const);

    if (branch === "classical") {
      const a = randInt(rng, 1000, 9999);
      const b = randInt(rng, 10, 99);
      const product = a * b;
      return {
        kind: "fill-blank",
        prompt: `Find $${fmt(a)} \\times ${b}$.`,
        before: "Answer =",
        after: "",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: `Multiply ${fmt(a)} by the ones digit of ${b}, then by the tens digit, then add the two partial products.`,
        explanation: `$${fmt(a)} \\times ${b} = ${fmt(product)}$.`,
      };
    }

    if (branch === "real-world-total") {
      const ctx = randChoice(rng, ITEM_PRICE_CONTEXTS);
      const price = randInt(rng, ctx.priceRange[0], ctx.priceRange[1]);
      const qty = randInt(rng, 10, 99);
      const total = price * qty;
      const pl = place(rng);
      return {
        kind: "fill-blank",
        prompt: `A shop in ${pl} sells ${ctx.item} at KES ${fmt(price)} each. Find the total cost of ${qty} ${ctx.item}.`,
        before: "Total cost = KES",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: `Multiply the price by the quantity: ${fmt(price)} × ${qty}.`,
        explanation: `Total cost $= ${fmt(price)} \\times ${qty} = KES\\ ${fmt(total)}$.`,
      };
    }

    if (branch === "real-world-mc") {
      const ctx = randChoice(rng, ITEM_PRICE_CONTEXTS);
      const price = randInt(rng, ctx.priceRange[0], ctx.priceRange[1]);
      const qty = randInt(rng, 12, 89);
      const pl = place(rng);
      const tens = Math.floor(qty / 10);
      const ones = qty % 10;
      const correct = price * qty;
      const noShift = price * ones + price * tens; // forgot to shift the tens partial product left by one place
      const onlyOnes = price * ones; // forgot the tens digit of the multiplier entirely
      const addedInstead = price + qty; // used addition instead of multiplication
      const candidates = [...new Set([noShift, onlyOnes, addedInstead])].filter((v) => v !== correct && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), candidates.map(fmt), Math.min(3, candidates.length));
      return {
        kind: "multiple-choice",
        prompt: `A trader in ${pl} buys ${ctx.item} at KES ${fmt(price)} each, for ${qty} ${ctx.item}. What is the total cost?`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Multiply by both the tens digit AND the ones digit of ${qty}, remembering to shift the tens partial product one place left before adding.`,
        explanation: `Total cost $= ${fmt(price)} \\times ${qty} = KES\\ ${fmt(correct)}$. A common mistake is multiplying by only one digit of ${qty}, or forgetting to shift the tens partial product before adding.`,
      };
    }

    if (branch === "match-products") {
      const seenProducts = new Set<number>();
      const pairs: { a: number; b: number }[] = [];
      while (pairs.length < 4) {
        const a = randInt(rng, 100, 9999);
        const b = randInt(rng, 10, 99);
        const p = a * b;
        if (!seenProducts.has(p)) {
          seenProducts.add(p);
          pairs.push({ a, b });
        }
      }
      const tokens = pairs.map((p, i) => ({ id: `e${i}`, label: `${fmt(p.a)} × ${p.b}` }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `r${i}`, label: fmt(p.a * p.b) })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`r${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each multiplication to its product.",
        tokens,
        targets,
        correctMap,
        hint: "Work out each product, or estimate first to narrow down the match.",
        explanation: pairs.map((p) => `${fmt(p.a)} × ${p.b} = ${fmt(p.a * p.b)}`).join("; ") + ".",
      };
    }

    if (branch === "magnitude-sort") {
      const exprs = Array.from({ length: 6 }, () => {
        const a = randInt(rng, 500, 9999);
        const b = randInt(rng, 10, 99);
        return { a, b, product: a * b };
      });
      const items = exprs.map((e, i) => ({ id: `x${i}`, label: `${fmt(e.a)} × ${e.b}` }));
      const buckets = [
        { id: "under", label: "Less than 100,000" },
        { id: "over", label: "100,000 or more" },
      ];
      const correctBucket: Record<string, string> = {};
      exprs.forEach((e, i) => (correctBucket[`x${i}`] = e.product < 100000 ? "under" : "over"));
      return {
        kind: "categorize",
        prompt: "Without necessarily working out the exact answer, sort each multiplication by whether its product is less than 100,000, or 100,000 and above.",
        items,
        buckets,
        correctBucket,
        hint: "Round each number first to estimate the size of the product.",
        explanation: exprs.map((e) => `${fmt(e.a)} × ${e.b} = ${fmt(e.product)}, which is ${e.product < 100000 ? "less than" : "at least"} 100,000`).join("; ") + ".",
      };
    }

    // order-products: order multiplication expressions by their product, smallest to largest.
    const exprs = Array.from({ length: 5 }, (_, i) => {
      const a = randInt(rng, 200, 9999);
      const b = randInt(rng, 10, 99);
      return { id: `p${i}`, a, b, product: a * b };
    });
    const sorted = [...exprs].sort((x, y) => x.product - y.product);
    return {
      kind: "ordering",
      prompt: "Order these multiplications from smallest to largest product.",
      instruction: "Click them in order, smallest product first.",
      items: shuffle(rng, exprs).map((e) => ({ id: e.id, label: `${fmt(e.a)} × ${e.b}` })),
      correctOrder: sorted.map((e) => e.id),
      hint: "Estimate each product by rounding, then compare.",
      explanation: sorted.map((e) => `${fmt(e.a)} × ${e.b} = ${fmt(e.product)}`).join("; ") + ".",
    };
  },
};
