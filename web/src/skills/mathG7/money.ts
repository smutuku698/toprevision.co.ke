import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Grade 7 M.7 (Money) computes profit/loss/discount/commission from wide numeric ranges, so
// those computations are numeric-exempt from the pool-size floor. What needed widening was the
// surrounding scenario text: ITEMS was only 6 entries shared across three branches, the
// commission branch wrapped every generation in one fixed sentence with no scenario variation
// at all, and the categorize/click-match fact pools sat at 5-6 entries. All widened to 10+ per
// RIGOR-STANDARDS.md's minimum pool-size floor. Postal charges (KICD M.7 outcome (g)) was also
// entirely unaddressed by the original branch list, so a postal-charges branch was added to
// close that content-breadth gap while the file was open for this pass.

const ITEMS = [
  "a sack of maize",
  "a bicycle",
  "a solar lamp",
  "a cow",
  "a batch of school uniforms",
  "a delivery of bricks",
  "a goat",
  "a secondhand phone",
  "a sewing machine",
  "a batch of roofing sheets",
  "a motorbike",
  "a consignment of secondhand clothes (mitumba)",
  "a water pump",
  "a set of office chairs",
] as const;

const KENYAN_TOWNS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Machakos",
  "Nyeri",
  "Kitale",
  "Kericho",
  "Malindi",
  "Kitengela",
] as const;
function town(rng: RNG) {
  return randChoice(rng, KENYAN_TOWNS);
}

const COMMISSION_SCENARIOS = [
  { role: "mobile money agent", activity: "all transactions made through the agent" },
  { role: "real estate agent", activity: "the value of any plot or house sold" },
  { role: "insurance agent", activity: "the premiums collected from clients" },
  { role: "car sales agent", activity: "the value of vehicles sold" },
  { role: "seed and fertiliser sales agent", activity: "the value of farm inputs sold to farmers" },
  { role: "hardware store salesperson", activity: "the value of building materials sold" },
  { role: "matatu SACCO agent", activity: "the fares collected from the route" },
  { role: "land-buying company agent", activity: "the value of plots sold to members" },
  { role: "tour and travel booking agent", activity: "the value of trips booked for clients" },
  { role: "produce market broker", activity: "the value of farm produce sold on behalf of farmers" },
  { role: "electronics shop attendant", activity: "the value of electronics sold" },
  { role: "boda-boda SACCO membership agent", activity: "the membership fees collected" },
] as const;

const COURIER_SERVICES = [
  "Posta Kenya",
  "a G4S courier office",
  "a Wells Fargo courier desk",
  "a local courier company",
  "an EMS parcel counter",
  "a boda-boda courier service",
  "a matatu parcel service",
  "a Kenya Post office branch",
  "a courier counter at the bus station",
  "an online shop's delivery partner",
  "a rural sub-post office",
  "a town parcel drop-off point",
] as const;

const TRANSACTIONS = [
  { desc: "Bought a goat for KES 3000, sold it for KES 3600", isProfit: true },
  { desc: "Bought a bicycle for KES 8000, sold it for KES 7200", isProfit: false },
  { desc: "Bought maize for KES 2000, sold it for KES 2500", isProfit: true },
  { desc: "Bought a phone for KES 6000, sold it for KES 5400", isProfit: false },
  { desc: "Bought vegetables for KES 500, sold them for KES 450", isProfit: false },
  { desc: "Bought fish for KES 1200, sold it for KES 1500", isProfit: true },
  { desc: "Bought a solar lamp for KES 1500, sold it for KES 1800", isProfit: true },
  { desc: "Bought a batch of secondhand clothes for KES 4000, sold them for KES 3500", isProfit: false },
  { desc: "Bought a water pump for KES 12000, sold it for KES 14000", isProfit: true },
  { desc: "Bought a motorbike for KES 80000, sold it for KES 75000", isProfit: false },
  { desc: "Bought a sewing machine for KES 5000, sold it for KES 6200", isProfit: true },
  { desc: "Bought a set of chairs for KES 7000, sold them for KES 6300", isProfit: false },
] as const;

const TERM_PAIRS = [
  { term: "Profit", meaning: "Selling price is more than buying price" },
  { term: "Loss", meaning: "Selling price is less than buying price" },
  { term: "Discount", meaning: "An amount subtracted from the marked price" },
  { term: "Commission", meaning: "A percentage payment earned for making a sale or transaction" },
  { term: "Mobile money", meaning: "Sending, receiving, or saving money through a phone service like M-Pesa" },
  { term: "Marked price", meaning: "The price a seller first labels on an item, before any discount" },
  { term: "Bill", meaning: "A statement showing the amount owed for goods or services used" },
  { term: "Postal charges", meaning: "The fee paid to send a letter or parcel through a postal or courier service" },
  { term: "Percentage profit", meaning: "Profit expressed as a percentage of the buying price" },
  { term: "Percentage discount", meaning: "Discount expressed as a percentage of the marked price" },
  { term: "Buying price", meaning: "The amount a trader pays to acquire an item before selling it" },
  { term: "Selling price", meaning: "The amount a customer pays a trader for an item" },
] as const;

export const money: Skill = {
  id: "g7-math-m-money",
  code: "M.7",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Money",
  description: "Work out profit, loss, percentage profit/loss, discount, percentage discount, commission, bills, postal charges, and mobile money transactions.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["profit-loss", "percentage-profit-loss", "discount", "commission", "postal-charges", "classify-transaction", "match-terms", "bill-steps"] as const
    );

    if (branch === "profit-loss") {
      const item = randChoice(rng, ITEMS);
      const buyingPrice = randInt(rng, 500, 5000);
      const isProfit = rng() < 0.5;
      const change = randInt(rng, 50, 800);
      const sellingPrice = isProfit ? buyingPrice + change : buyingPrice - change;
      return {
        kind: "fill-blank",
        prompt: `A trader in ${town(rng)} bought ${item} for KES ${buyingPrice} and sold it for KES ${sellingPrice}. Find the ${isProfit ? "profit" : "loss"} made.`,
        before: `${isProfit ? "Profit" : "Loss"} = KES`,
        after: "",
        correctAnswer: String(change),
        inputMode: "numeric",
        hint: isProfit ? "Profit = selling price − buying price." : "Loss = buying price − selling price.",
        explanation: isProfit ? `Profit $= ${sellingPrice} - ${buyingPrice} = ${change}$ KES.` : `Loss $= ${buyingPrice} - ${sellingPrice} = ${change}$ KES.`,
      };
    }

    if (branch === "percentage-profit-loss") {
      const item = randChoice(rng, ITEMS);
      const buyingPrice = randChoice(rng, [400, 500, 800, 1000, 1200, 2000, 2500] as const);
      const percent = randChoice(rng, [5, 10, 15, 20, 25] as const);
      const isProfit = rng() < 0.5;
      const change = (buyingPrice * percent) / 100;
      const sellingPrice = isProfit ? buyingPrice + change : buyingPrice - change;
      return {
        kind: "fill-blank",
        prompt: `A shopkeeper in ${town(rng)} bought ${item} for KES ${buyingPrice} and sold it for KES ${sellingPrice}. Find the percentage ${isProfit ? "profit" : "loss"}.`,
        before: `Percentage ${isProfit ? "profit" : "loss"} =`,
        after: "%",
        correctAnswer: String(percent),
        inputMode: "numeric",
        hint: `Percentage ${isProfit ? "profit" : "loss"} = (${isProfit ? "profit" : "loss"} ÷ buying price) × 100.`,
        explanation: `${isProfit ? "Profit" : "Loss"} $= ${Math.abs(sellingPrice - buyingPrice)}$ KES. Percentage $= (${Math.abs(sellingPrice - buyingPrice)} \\div ${buyingPrice}) \\times 100 = ${percent}\\%$.`,
      };
    }

    if (branch === "discount") {
      const item = randChoice(rng, ITEMS);
      const markedPrice = randChoice(rng, [500, 800, 1000, 1500, 2000, 3000] as const);
      const percent = randChoice(rng, [5, 10, 15, 20, 25] as const);
      const discountAmount = (markedPrice * percent) / 100;
      const finalPrice = markedPrice - discountAmount;
      const askFinal = rng() < 0.6;
      if (askFinal) {
        return {
          kind: "fill-blank",
          prompt: `In ${town(rng)}, ${item} is marked at KES ${markedPrice}, with a ${percent}% discount offered. Find the price a customer actually pays.`,
          before: "Price paid = KES",
          after: "",
          correctAnswer: String(finalPrice),
          inputMode: "numeric",
          hint: "Discount amount = percentage × marked price. Price paid = marked price − discount.",
          explanation: `Discount $= ${percent}\\% \\times ${markedPrice} = ${discountAmount}$ KES. Price paid $= ${markedPrice} - ${discountAmount} = ${finalPrice}$ KES.`,
        };
      }
      const wrong = [String(percent + 5), String(percent - 5), String(Math.round((discountAmount / finalPrice) * 100))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(percent), wrong);
      return {
        kind: "multiple-choice",
        prompt: `In ${town(rng)}, ${item} is marked at KES ${markedPrice}. A customer pays KES ${finalPrice} after a discount. Find the percentage discount given.`,
        choices: choices.map((c) => `${c}%`),
        correctIndex,
        layout: "row",
        hint: "Percentage discount = (discount amount ÷ marked price) × 100.",
        explanation: `Discount amount $= ${markedPrice} - ${finalPrice} = ${discountAmount}$ KES. Percentage $= (${discountAmount} \\div ${markedPrice}) \\times 100 = ${percent}\\%$.`,
      };
    }

    if (branch === "commission") {
      const scenario = randChoice(rng, COMMISSION_SCENARIOS);
      const sales = randChoice(rng, [10000, 15000, 20000, 25000, 30000, 50000] as const);
      const rate = randChoice(rng, [2, 3, 5, 8, 10] as const);
      const commission = (sales * rate) / 100;
      return {
        kind: "fill-blank",
        prompt: `A ${scenario.role} in ${town(rng)} earns a commission of ${rate}% on ${scenario.activity}. In one week, this totals KES ${sales.toLocaleString()}. Find the agent's commission.`,
        before: "Commission = KES",
        after: "",
        correctAnswer: String(commission),
        inputMode: "numeric",
        hint: "Commission = rate × total sales.",
        explanation: `Commission $= ${rate}\\% \\times ${sales.toLocaleString()} = ${commission.toLocaleString()}$ KES.`,
      };
    }

    if (branch === "postal-charges") {
      const courier = randChoice(rng, COURIER_SERVICES);
      const base = randChoice(rng, [50, 80, 100, 120, 150] as const);
      const perKg = randChoice(rng, [20, 30, 40, 50] as const);
      const weight = randInt(rng, 1, 10);
      const total = base + perKg * weight;
      return {
        kind: "fill-blank",
        prompt: `${courier[0].toUpperCase()}${courier.slice(1)} charges a base fee of KES ${base} plus KES ${perKg} for every kilogram. Find the total charge for sending a parcel weighing ${weight} kg.`,
        before: "Total charge = KES",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Total charge = base fee + (rate per kilogram × weight).",
        explanation: `Total $= ${base} + (${perKg} \\times ${weight}) = ${base} + ${perKg * weight} = ${total}$ KES.`,
      };
    }

    if (branch === "classify-transaction") {
      const chosen = shuffle(rng, TRANSACTIONS).slice(0, 5);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.desc }));
      const buckets = [
        { id: "profit", label: "Made a profit" },
        { id: "loss", label: "Made a loss" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t, i) => (correctBucket[`t${i}`] = t.isProfit ? "profit" : "loss"));
      return {
        kind: "categorize",
        prompt: "Sort each transaction by whether it resulted in a profit or a loss.",
        items,
        buckets,
        correctBucket,
        hint: "Compare the selling price to the buying price.",
        explanation: chosen.map((t) => `"${t.desc}" is a ${t.isProfit ? "profit" : "loss"}`).join("; ") + ".",
      };
    }

    if (branch === "match-terms") {
      const chosen = shuffle(rng, TERM_PAIRS).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each money term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what happens to the seller in each situation.",
        explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // bill-steps: order the steps for working out and paying an electricity bill. This is a
    // single fixed real-world procedure (like the gold-standard file's density-order branch),
    // not a scenario pool, so one correct sequence is appropriate and not a pool-floor violation.
    const steps = [
      { id: "s1", label: "Read the previous and current meter readings" },
      { id: "s2", label: "Subtract to find the units consumed" },
      { id: "s3", label: "Multiply the units consumed by the cost per unit" },
      { id: "s4", label: "Add any fixed charges to get the total bill" },
      { id: "s5", label: "Pay the bill using cash, mobile money, or a bank" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps for working out and paying a household electricity bill in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You must know the units consumed before you can multiply by the cost per unit.",
      explanation: "Steps: (1) read the meter readings, (2) subtract to find units used, (3) multiply by cost per unit, (4) add fixed charges, (5) pay the bill.",
    };
  },
};
