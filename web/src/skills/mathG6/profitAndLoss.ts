import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Profit = selling price − buying price (when selling > buying).
// Loss = buying price − selling price (when buying > selling).
// No percentages, discounts or commission at this grade — plain amounts only.

function ksh(n: number): string {
  return `KES ${n.toLocaleString()}`;
}

// Price tiers keep each item's randomly generated buying price at a realistic real-world
// scale (a goat and a phone case should never be drawn from the same price range).
const TIER_RANGES = {
  low: [30, 400],
  mid: [300, 2500],
  high: [2000, 9000],
} as const;
type Tier = keyof typeof TIER_RANGES;

function randBuy(rng: RNG, tier: Tier): number {
  const [min, max] = TIER_RANGES[tier];
  return randInt(rng, min, max);
}

function pickDistinctTransactions(rng: RNG, count: number): { buy: number; sell: number }[] {
  const seen = new Set<number>();
  const result: { buy: number; sell: number }[] = [];
  while (result.length < count) {
    const buy = randInt(rng, 100, 4000);
    const isProfit = rng() < 0.5;
    const diff = randInt(rng, 20, Math.max(30, Math.round(buy * 0.4)));
    const sell = isProfit ? buy + diff : buy - diff;
    const key = buy * 100000 + sell;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ buy, sell });
    }
  }
  return result;
}

// 32 real Kenyan trader + item trading contexts, each tagged with a realistic price tier.
const TRADES: { trader: string; item: string; tier: Tier }[] = [
  { trader: "a greengrocer", item: "a crate of tomatoes", tier: "mid" },
  { trader: "a livestock trader", item: "a goat", tier: "high" },
  { trader: "a mitumba (secondhand clothes) seller", item: "a jacket", tier: "mid" },
  { trader: "a shoe seller", item: "a pair of shoes", tier: "mid" },
  { trader: "an electronics dealer", item: "a radio", tier: "mid" },
  { trader: "a furniture maker", item: "a wooden chair", tier: "mid" },
  { trader: "a fish trader", item: "a basket of fish", tier: "mid" },
  { trader: "a grain trader", item: "a sack of maize", tier: "high" },
  { trader: "a charcoal seller", item: "a bag of charcoal", tier: "low" },
  { trader: "a hardware dealer", item: "a roll of wire", tier: "mid" },
  { trader: "a phone accessories seller", item: "a phone case", tier: "low" },
  { trader: "a bicycle dealer", item: "a bicycle", tier: "high" },
  { trader: "a stationery shop owner", item: "a school bag", tier: "mid" },
  { trader: "a poultry farmer", item: "a batch of chickens", tier: "high" },
  { trader: "a honey seller", item: "a jar of honey", tier: "mid" },
  { trader: "a basket weaver", item: "a woven basket", tier: "low" },
  { trader: "a potter", item: "a clay pot", tier: "low" },
  { trader: "a tailor", item: "a dress", tier: "mid" },
  { trader: "a shoemaker", item: "a pair of sandals", tier: "mid" },
  { trader: "a secondhand book seller", item: "a used textbook", tier: "low" },
  { trader: "a flower seller", item: "a bouquet of flowers", tier: "mid" },
  { trader: "a fruit vendor", item: "a box of mangoes", tier: "mid" },
  { trader: "a milk vendor", item: "20 litres of milk", tier: "mid" },
  { trader: "a scrap metal dealer", item: "a load of scrap metal", tier: "high" },
  { trader: "a timber merchant", item: "a plank of timber", tier: "mid" },
  { trader: "a spare-parts dealer", item: "a car spare part", tier: "high" },
  { trader: "a jewellery seller", item: "a beaded necklace", tier: "mid" },
  { trader: "a soap maker", item: "a batch of soap bars", tier: "mid" },
  { trader: "a bakery owner", item: "a batch of bread", tier: "mid" },
  { trader: "a welder", item: "a metal gate", tier: "high" },
  { trader: "a carpenter", item: "a wooden table", tier: "high" },
  { trader: "a cereals shop owner", item: "a sack of beans", tier: "high" },
];

export const profitAndLoss: Skill = {
  id: "g6-math-m-profit-loss",
  code: "M.13",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Profit and loss",
  description: "Work out profit and loss from buying and selling prices, classify a transaction as a profit or a loss, and find a missing price given the profit or loss.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "compute-profit",
        "compute-loss",
        "classify-mc",
        "reverse-buying",
        "reverse-selling",
        "classical-profit-loss",
        "click-match",
        "categorize-profit-loss",
        "order-profit",
      ] as const
    );

    if (branch === "compute-profit") {
      const t = randChoice(rng, TRADES);
      const buy = randBuy(rng, t.tier);
      const profit = randInt(rng, 20, Math.max(30, Math.round(buy * 0.5)));
      const sell = buy + profit;
      return {
        kind: "fill-blank",
        prompt: `${t.trader[0].toUpperCase()}${t.trader.slice(1)} buys ${t.item} for ${ksh(buy)} and sells it for ${ksh(sell)}. Find the profit made.`,
        before: "Profit =",
        after: "",
        correctAnswer: String(profit),
        inputMode: "numeric",
        hint: "Profit = selling price − buying price.",
        explanation: `Profit $= ${sell} - ${buy} = ${ksh(profit)}$.`,
      };
    }

    if (branch === "compute-loss") {
      const t = randChoice(rng, TRADES);
      const buy = randBuy(rng, t.tier);
      const loss = randInt(rng, 20, Math.max(30, Math.round(buy * 0.4)));
      const sell = buy - loss;
      return {
        kind: "fill-blank",
        prompt: `${t.trader[0].toUpperCase()}${t.trader.slice(1)} buys ${t.item} for ${ksh(buy)} but has to sell it for only ${ksh(sell)}. Find the loss incurred.`,
        before: "Loss =",
        after: "",
        correctAnswer: String(loss),
        inputMode: "numeric",
        hint: "Loss = buying price − selling price.",
        explanation: `Loss $= ${buy} - ${sell} = ${ksh(loss)}$.`,
      };
    }

    if (branch === "classify-mc") {
      const t = randChoice(rng, TRADES);
      const buy = randBuy(rng, t.tier);
      const isProfit = rng() < 0.5;
      const diff = randInt(rng, 20, Math.max(30, Math.round(buy * 0.4)));
      const sell = isProfit ? buy + diff : buy - diff;
      const correct = isProfit ? "A profit" : "A loss";
      const wrong = [isProfit ? "A loss" : "A profit", "Neither — the trader broke even", "Not enough information to tell"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${t.trader[0].toUpperCase()}${t.trader.slice(1)} buys ${t.item} for ${ksh(buy)} and sells it for ${ksh(sell)}. Did this result in a profit or a loss?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Compare the selling price to the buying price: selling higher means profit, selling lower means loss.",
        explanation: `Selling price ${ksh(sell)} is ${isProfit ? "higher" : "lower"} than buying price ${ksh(buy)}, so this is ${isProfit ? `a profit of ${ksh(diff)}` : `a loss of ${ksh(diff)}`}.`,
      };
    }

    if (branch === "reverse-buying") {
      const t = randChoice(rng, TRADES);
      const isProfit = rng() < 0.5;
      const buy = randBuy(rng, t.tier);
      const diff = randInt(rng, 20, Math.max(30, Math.round(buy * 0.4)));
      const sell = isProfit ? buy + diff : buy - diff;
      const word = isProfit ? "profit" : "loss";
      return {
        kind: "fill-blank",
        prompt: `${t.trader[0].toUpperCase()}${t.trader.slice(1)} sells ${t.item} for ${ksh(sell)}, making a ${word} of ${ksh(diff)}. What was the buying price?`,
        before: "Buying price =",
        after: "",
        correctAnswer: String(buy),
        inputMode: "numeric",
        hint: isProfit ? "If there was a profit, the buying price was lower than the selling price: buying = selling − profit." : "If there was a loss, the buying price was higher than the selling price: buying = selling + loss.",
        explanation: isProfit
          ? `Buying price $= ${sell} - ${diff} = ${ksh(buy)}$ (selling price minus profit).`
          : `Buying price $= ${sell} + ${diff} = ${ksh(buy)}$ (selling price plus loss).`,
      };
    }

    if (branch === "reverse-selling") {
      const t = randChoice(rng, TRADES);
      const isProfit = rng() < 0.5;
      const buy = randBuy(rng, t.tier);
      const diff = randInt(rng, 20, Math.max(30, Math.round(buy * 0.4)));
      const sell = isProfit ? buy + diff : buy - diff;
      const word = isProfit ? "profit" : "loss";
      return {
        kind: "fill-blank",
        prompt: `${t.trader[0].toUpperCase()}${t.trader.slice(1)} buys ${t.item} for ${ksh(buy)}, then sells it, making a ${word} of ${ksh(diff)}. What was the selling price?`,
        before: "Selling price =",
        after: "",
        correctAnswer: String(sell),
        inputMode: "numeric",
        hint: isProfit ? "If there was a profit, the selling price was higher: selling = buying + profit." : "If there was a loss, the selling price was lower: selling = buying − loss.",
        explanation: isProfit
          ? `Selling price $= ${buy} + ${diff} = ${ksh(sell)}$ (buying price plus profit).`
          : `Selling price $= ${buy} - ${diff} = ${ksh(sell)}$ (buying price minus loss).`,
      };
    }

    if (branch === "classical-profit-loss") {
      const isProfit = rng() < 0.5;
      const buy = randInt(rng, 100, 5000);
      const diff = randInt(rng, 20, Math.max(30, Math.round(buy * 0.5)));
      const sell = isProfit ? buy + diff : buy - diff;
      return {
        kind: "fill-blank",
        prompt: `A trader buys an item for ${ksh(buy)} and sells it for ${ksh(sell)}. Find the ${isProfit ? "profit" : "loss"}.`,
        before: `${isProfit ? "Profit" : "Loss"} =`,
        after: "",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: isProfit ? "Profit = selling price − buying price." : "Loss = buying price − selling price.",
        explanation: isProfit ? `${sell} − ${buy} = ${ksh(diff)} profit.` : `${buy} − ${sell} = ${ksh(diff)} loss.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctTransactions(rng, 4);
      const tokens = shuffle(rng, chosen.map((tr, i) => ({ id: `t${i}`, label: `Bought for ${ksh(tr.buy)}, sold for ${ksh(tr.sell)}` })));
      const targets = shuffle(rng, chosen.map((tr, i) => ({ id: `t${i}`, label: tr.sell > tr.buy ? `Profit of ${ksh(tr.sell - tr.buy)}` : `Loss of ${ksh(tr.buy - tr.sell)}` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each transaction to its correct profit or loss.",
        tokens,
        targets,
        correctMap,
        hint: "If selling price > buying price, it's a profit; if buying price > selling price, it's a loss.",
        explanation: chosen.map((tr) => `Bought for ${ksh(tr.buy)}, sold for ${ksh(tr.sell)}: ${tr.sell > tr.buy ? `profit of ${ksh(tr.sell - tr.buy)}` : `loss of ${ksh(tr.buy - tr.sell)}`}`).join("; ") + ".",
      };
    }

    if (branch === "categorize-profit-loss") {
      const chosen = pickDistinctTransactions(rng, 6);
      const items = chosen.map((tr, i) => ({ id: `t${i}`, label: `Bought for ${ksh(tr.buy)}, sold for ${ksh(tr.sell)}` }));
      const buckets = [
        { id: "profit", label: "Profit" },
        { id: "loss", label: "Loss" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((tr, i) => (correctBucket[`t${i}`] = tr.sell > tr.buy ? "profit" : "loss"));
      return {
        kind: "categorize",
        prompt: "Sort each transaction as a profit or a loss.",
        items,
        buckets,
        correctBucket,
        hint: "Compare the selling price to the buying price for each transaction.",
        explanation: chosen.map((tr) => `Bought for ${ksh(tr.buy)}, sold for ${ksh(tr.sell)}: ${tr.sell > tr.buy ? "profit" : "loss"}`).join("; ") + ".",
      };
    }

    // order-profit
    const chosen = pickDistinctTransactions(rng, 4);
    const items = chosen.map((tr, i) => ({ id: `t${i}`, label: `Bought for ${ksh(tr.buy)}, sold for ${ksh(tr.sell)}` }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => (chosen[a].sell - chosen[a].buy) - (chosen[b].sell - chosen[b].buy));
    return {
      kind: "ordering",
      prompt: "Arrange these transactions from the biggest loss to the biggest profit.",
      instruction: "Click them in order, biggest loss first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `t${i}`),
      hint: "Work out selling price minus buying price for each — the most negative is the biggest loss.",
      explanation: `In order: ${sortedIdx.map((i) => {
        const tr = chosen[i];
        const net = tr.sell - tr.buy;
        return `${tr.sell > tr.buy ? `profit of ${ksh(net)}` : `loss of ${ksh(-net)}`} (bought ${ksh(tr.buy)}, sold ${ksh(tr.sell)})`;
      }).join(", ")}.`,
    };
  },
};
