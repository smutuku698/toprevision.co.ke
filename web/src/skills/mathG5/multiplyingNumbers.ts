import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt } from "./mathUtils";
import { ITEM_PRICE_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

export const multiplyingNumbers: Skill = {
  id: "g5-math-n-multiplication",
  code: "N.9",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Multiplying whole numbers",
  description: "Multiply up to a 3-digit number by up to a 2-digit number, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["classical", "real-world", "missing-factor-mc", "click-match", "ordering", "categorize"] as const);

    if (branch === "classical") {
      const a = randInt(rng, 100, 999);
      const b = randInt(rng, 11, 99);
      const product = a * b;
      const openers = [
        `Work out ${a} × ${b}.`,
        `Multiply ${a} by ${b}.`,
        `Find the product of ${a} and ${b}.`,
        `Calculate ${a} × ${b}.`,
        `What is ${a} multiplied by ${b}?`,
      ];
      const closers = ["", "Find the answer.", "What is the product?", "Work out the product."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Product =",
        after: "",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Break the 2-digit number into tens and ones, multiply each part, then add.",
        explanation: `${a} × ${b} = ${fmt(product)}.`,
      };
    }

    if (branch === "real-world") {
      const ctx = randChoice(rng, ITEM_PRICE_CONTEXTS);
      const price = randInt(rng, ctx.priceRange[0], ctx.priceRange[1]);
      const qty = randInt(rng, 11, 90);
      const total = price * qty;
      const p = place(rng);
      const openers = [
        `A shop in ${p} sells ${ctx.item} at KES ${price} per ${ctx.unit}.`,
        `${ctx.item[0].toUpperCase()}${ctx.item.slice(1)} cost KES ${price} each at a shop in ${p}.`,
        `A trader in ${p} charges KES ${price} for each ${ctx.unit}.`,
        `At a market stall in ${p}, ${ctx.item} sell for KES ${price} per ${ctx.unit}.`,
        `A customer buys ${ctx.item} from a shop in ${p}, priced at KES ${price} each.`,
      ];
      const closers = [
        ` How much would ${qty} of them cost in total?`,
        ` What is the total cost of ${qty}?`,
        ` Find the total price for ${qty}.`,
        ` How much does buying ${qty} of them cost altogether?`,
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total cost = KES",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Multiply the price per item by the number of items bought.",
        explanation: `KES ${price} × ${qty} = KES ${fmt(total)}.`,
      };
    }

    if (branch === "missing-factor-mc") {
      const a = randInt(rng, 100, 900);
      const b = randInt(rng, 12, 80);
      const product = a * b;
      // Misconceptions: adding instead of multiplying, dividing instead, and an off-by-a-digit slip.
      const wrongAdd = a + b;
      const wrongDivide = Math.round(a / b) || a;
      const wrongSlip = product + randChoice(rng, [a, b, 10] as const);
      const candidates = [...new Set([wrongAdd, wrongDivide, wrongSlip])].filter((v) => v !== product && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(product), candidates.map(fmt), Math.min(3, candidates.length));
      const openers = [
        `${a} is multiplied by ${b}.`,
        `Find the result of multiplying ${a} and ${b}.`,
        `${a} × ${b} is being calculated.`,
        `Work out the product when ${a} is multiplied by ${b}.`,
      ];
      const closers = [" What is the answer?", " Which product is correct?", " Find the correct result.", " What is the correct product?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Multiply, don't add or divide the two numbers.",
        explanation: `${a} × ${b} = ${fmt(product)}. Adding or dividing the two numbers instead gives the wrong distractors.`,
      };
    }

    if (branch === "click-match") {
      const pairs = pickDistinctPairs(rng, 4);
      const tokens = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.a} × ${p.b}` }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: fmt(p.a * p.b) })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      const prompts = [
        "Match each multiplication to its product.",
        "Pair each expression with its correct product.",
        "Match each calculation to its answer.",
        "Connect each multiplication to its result.",
        "Match each pair of numbers to their product.",
        "Pair each multiplication with the correct answer.",
        "Match each expression to its product.",
        "Link each multiplication sum to its result.",
        "Match every multiplication to its correct product.",
        "Connect each calculation with its answer.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Work out each product before matching.",
        explanation: pairs.map((p) => `${p.a} × ${p.b} = ${fmt(p.a * p.b)}`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const pairs = pickDistinctPairs(rng, 4);
      const items = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.a} × ${p.b}` }));
      const sortedIdx = pairs.map((_, i) => i).sort((x, y) => pairs[x].a * pairs[x].b - pairs[y].a * pairs[y].b);
      const prompts = [
        "Order these products from smallest to largest.",
        "Arrange these multiplications by product, smallest first.",
        "Sort these expressions by their product, smallest to largest.",
        "Put these multiplications in order of their product.",
        "Rank these expressions by product, smallest to largest.",
        "Sequence these multiplications by their result.",
        "Order these products, starting with the smallest.",
        "Arrange these calculations from smallest product to largest.",
        "Sort these multiplications by result, smallest first.",
        "Put these expressions in increasing order of product.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest product first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `p${i}`),
        hint: "Work out each product before comparing.",
        explanation: sortedIdx.map((i) => `${pairs[i].a} × ${pairs[i].b} = ${fmt(pairs[i].a * pairs[i].b)}`).join(", ") + ".",
      };
    }

    // categorize: sort products by whether they exceed a threshold.
    const threshold = randChoice(rng, [5000, 10000, 20000, 40000] as const);
    const pairs = pickDistinctPairs(rng, 6);
    const items = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.a} × ${p.b}` }));
    const buckets = [
      { id: "under", label: `Product under ${fmt(threshold)}` },
      { id: "over", label: `Product ${fmt(threshold)} or more` },
    ];
    const correctBucket: Record<string, string> = {};
    pairs.forEach((p, i) => (correctBucket[`p${i}`] = p.a * p.b < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each multiplication by whether its product is under ${fmt(threshold)}.`,
      `Group each expression as under ${fmt(threshold)}, or ${fmt(threshold)} and above.`,
      `Classify each multiplication by its product, using ${fmt(threshold)} as the cut-off.`,
      `Sort these multiplications into two groups using ${fmt(threshold)} as the cut-off.`,
      `Organise each expression by whether its product is under ${fmt(threshold)}.`,
      `Decide whether each product is under ${fmt(threshold)}, then sort it.`,
      `Place each multiplication in the correct group based on the ${fmt(threshold)} cut-off.`,
      `Sort these expressions by product size, using ${fmt(threshold)} as the dividing line.`,
      `Which products are under ${fmt(threshold)}? Sort them all.`,
      `Categorise each multiplication as under ${fmt(threshold)}, or ${fmt(threshold)} or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Work out each product, then compare it to the threshold.",
      explanation: pairs.map((p) => `${p.a} × ${p.b} = ${fmt(p.a * p.b)}`).join("; ") + ".",
    };
  },
};

function pickDistinctPairs(rng: RNG, count: number): { a: number; b: number }[] {
  const seen = new Set<string>();
  const result: { a: number; b: number }[] = [];
  while (result.length < count) {
    const a = randInt(rng, 100, 500);
    const b = randInt(rng, 11, 60);
    const key = `${a}x${b}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ a, b });
    }
  }
  return result;
}
