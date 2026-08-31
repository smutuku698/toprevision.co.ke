import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function ksh(n: number): string {
  return `KES ${n.toLocaleString()}`;
}

// 32 real Kenyan shopping items with a defensible typical price in KES.
const ITEMS = [
  { label: "a loaf of bread", price: 60 },
  { label: "a 500 mL packet of milk", price: 60 },
  { label: "a bar of bathing soap", price: 50 },
  { label: "a kg of sugar", price: 130 },
  { label: "a kg of rice", price: 150 },
  { label: "a 2 kg packet of maize flour", price: 150 },
  { label: "a tray of eggs", price: 420 },
  { label: "an exercise book", price: 50 },
  { label: "a ballpoint pen", price: 20 },
  { label: "a bag of charcoal", price: 700 },
  { label: "a litre of cooking oil", price: 300 },
  { label: "a tin of beans", price: 100 },
  { label: "a packet of tea leaves", price: 100 },
  { label: "a box of matches", price: 10 },
  { label: "a tube of toothpaste", price: 150 },
  { label: "a bar of chocolate", price: 100 },
  { label: "a 500 mL soda", price: 60 },
  { label: "a matatu fare across town", price: 100 },
  { label: "a school uniform shirt", price: 500 },
  { label: "a pair of school shoes", price: 1000 },
  { label: "an umbrella", price: 300 },
  { label: "a torch", price: 250 },
  { label: "a bag of cement", price: 750 },
  { label: "a roll of toilet paper", price: 50 },
  { label: "a packet of biscuits", price: 50 },
  { label: "a litre bottle of drinking water", price: 50 },
  { label: "a kg of tomatoes", price: 80 },
  { label: "a kg of onions", price: 100 },
  { label: "a kg of potatoes", price: 70 },
  { label: "a bunch of bananas", price: 150 },
  { label: "a watermelon", price: 200 },
  { label: "a live chicken", price: 600 },
] as const;

export const simpleBudgetsAndPrices: Skill = {
  id: "g6-math-m-budgets-prices",
  code: "M.12",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Simple budgets and prices",
  description: "Prepare a simple budget by totalling item costs, compare it to money available to find a balance or shortfall, and identify buying and selling prices.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "budget-total",
        "budget-balance",
        "budget-shortfall",
        "buying-selling-mc",
        "classical-budget",
        "click-match",
        "categorize-budget",
        "order-price",
      ] as const
    );

    if (branch === "budget-total") {
      const list = pickShoppingList(rng, 3, 5);
      const total = list.reduce((s, it) => s + it.price, 0);
      return {
        kind: "fill-blank",
        prompt: `A shopper's list is: ${list.map((it) => `${it.label} (${ksh(it.price)})`).join(", ")}. What is the total cost of the budget?`,
        before: "Total =",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up the price of every item on the list.",
        explanation: `Total = ${list.map((it) => it.price).join(" + ")} = ${ksh(total)}.`,
      };
    }

    if (branch === "budget-balance") {
      const list = pickShoppingList(rng, 3, 5);
      const total = list.reduce((s, it) => s + it.price, 0);
      const available = total + randInt(rng, 20, 500);
      const balance = available - total;
      return {
        kind: "fill-blank",
        prompt: `A shopper has a budget of ${ksh(available)}. Their shopping list is: ${list.map((it) => `${it.label} (${ksh(it.price)})`).join(", ")}, totalling ${ksh(total)}. How much money is left over after buying everything on the list?`,
        before: "Balance =",
        after: "",
        correctAnswer: String(balance),
        inputMode: "numeric",
        hint: "Subtract the total cost from the money available.",
        explanation: `${ksh(available)} − ${ksh(total)} = ${ksh(balance)} left over.`,
      };
    }

    if (branch === "budget-shortfall") {
      const list = pickShoppingList(rng, 3, 5);
      const total = list.reduce((s, it) => s + it.price, 0);
      const available = Math.max(50, total - randInt(rng, 20, Math.min(400, total - 20)));
      const shortfall = total - available;
      return {
        kind: "fill-blank",
        prompt: `A shopper has only ${ksh(available)}. Their shopping list is: ${list.map((it) => `${it.label} (${ksh(it.price)})`).join(", ")}, totalling ${ksh(total)}. How much more money do they need to afford the whole list?`,
        before: "Extra money needed =",
        after: "",
        correctAnswer: String(shortfall),
        inputMode: "numeric",
        hint: "Subtract the money available from the total cost.",
        explanation: `${ksh(total)} − ${ksh(available)} = ${ksh(shortfall)} more is needed.`,
      };
    }

    if (branch === "buying-selling-mc") {
      const item = randChoice(rng, ITEMS);
      const buy = item.price;
      const sell = buy + randInt(rng, 10, Math.max(20, Math.round(buy * 0.4)));
      const askBuying = rng() < 0.5;
      if (askBuying) {
        const wrong = [ksh(sell), ksh(buy + sell), ksh(sell - buy)];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, ksh(buy), wrong, 3);
        return {
          kind: "multiple-choice",
          prompt: `A trader buys ${item.label} for ${ksh(buy)} from a supplier, then sells it in the shop for ${ksh(sell)}. Which amount is the buying price?`,
          choices,
          correctIndex,
          layout: "row",
          hint: "The buying price is what the trader pays to get the item, before selling it on.",
          explanation: `The buying price — what the trader pays to acquire ${item.label} — is ${ksh(buy)}. The selling price, ${ksh(sell)}, is what the customer pays.`,
        };
      }
      const wrong = [ksh(buy), ksh(buy + sell), ksh(sell - buy)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, ksh(sell), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `A trader buys ${item.label} for ${ksh(buy)} from a supplier, then sells it in the shop for ${ksh(sell)}. Which amount is the selling price?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "The selling price is what the customer pays to buy the item from the trader.",
        explanation: `The selling price — what the customer pays for ${item.label} — is ${ksh(sell)}. The buying price, ${ksh(buy)}, is what the trader paid the supplier.`,
      };
    }

    if (branch === "classical-budget") {
      const values = Array.from({ length: randInt(rng, 3, 6) }, () => randInt(rng, 20, 900));
      const total = values.reduce((a, b) => a + b, 0);
      return {
        kind: "fill-blank",
        prompt: `Work out the total of this budget: ${values.map((v) => ksh(v)).join(" + ")}.`,
        before: "Total =",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add all the amounts together.",
        explanation: `${values.join(" + ")} = ${total}, so the total is ${ksh(total)}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...ITEMS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((it, i) => ({ id: `i${i}`, label: it.label })));
      const targets = shuffle(rng, chosen.map((it, i) => ({ id: `i${i}`, label: ksh(it.price) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`i${i}`] = `i${i}`));
      return {
        kind: "click-match",
        prompt: "Match each item to its typical price.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the everyday cost of each item.",
        explanation: chosen.map((it) => `${it.label}: ${ksh(it.price)}`).join("; ") + ".",
      };
    }

    if (branch === "categorize-budget") {
      const threshold = randChoice(rng, [100, 200, 500] as const);
      const chosen = shuffle(rng, [...ITEMS]).slice(0, 7);
      const items = chosen.map((it, i) => ({ id: `i${i}`, label: `${it.label} (${ksh(it.price)})` }));
      const buckets = [
        { id: "over", label: `Costs more than ${ksh(threshold)}` },
        { id: "under", label: `Costs ${ksh(threshold)} or less` },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`i${i}`] = it.price > threshold ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: `Sort each item by whether it costs more than ${ksh(threshold)}, or ${ksh(threshold)} and less.`,
        items,
        buckets,
        correctBucket,
        hint: "Compare each item's price directly to the threshold.",
        explanation: chosen.map((it) => `${it.label}: ${ksh(it.price)}`).join("; ") + ".",
      };
    }

    // order-price
    const chosen = shuffle(rng, [...ITEMS]).slice(0, 4);
    const items = chosen.map((it, i) => ({ id: `i${i}`, label: it.label }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].price - chosen[b].price);
    return {
      kind: "ordering",
      prompt: "Arrange these items from cheapest to most expensive.",
      instruction: "Click them in order, cheapest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `i${i}`),
      hint: "Think about the typical price of each item.",
      explanation: `In order: ${sortedIdx.map((i) => `${chosen[i].label} (${ksh(chosen[i].price)})`).join(", ")}.`,
    };
  },
};

function pickShoppingList(rng: RNG, min: number, max: number): { label: string; price: number }[] {
  const count = randInt(rng, min, max);
  return shuffle(rng, [...ITEMS]).slice(0, count);
}
