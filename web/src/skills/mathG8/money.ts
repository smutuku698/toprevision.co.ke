import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ASSETS_APPRECIATE = ["a plot of land", "a residential house", "a piece of farmland"];
const ASSETS_DEPRECIATE = ["a motorbike", "a delivery van", "a laptop computer", "a milking machine"];

export const money: Skill = {
  id: "g8-math-me-money",
  code: "ME.3",
  subjectId: "math",
  strandId: "g8-math-measurements",
  grade: 8,
  title: "Money: interest, appreciation, depreciation, and hire purchase",
  description: "Calculate simple and compound interest, appreciation and depreciation over several years, and compare hire purchase with cash price.",
  generate(rng) {
    const branch = randChoice(rng, ["simple-interest", "find-rate", "compound-interest", "appreciation", "depreciation", "hire-purchase", "scenario-sort", "order-interest"] as const);

    if (branch === "find-rate") {
      // Reverse problem: given the interest earned, find the rate — requires
      // rearranging the simple-interest formula, not just plugging in.
      const principal = randInt(rng, 5, 60) * 1000;
      const rate = randChoice(rng, [4, 5, 6, 8, 10, 12, 15] as const);
      const time = randInt(rng, 1, 4);
      const interest = (principal * rate * time) / 100;
      return {
        kind: "fill-blank",
        prompt: `A principal of KES ${principal.toLocaleString()} earns simple interest of KES ${interest.toLocaleString()} over ${time} year${time > 1 ? "s" : ""}. Find the annual interest rate.`,
        before: "Rate =",
        after: "%",
        correctAnswer: String(rate),
        inputMode: "numeric",
        hint: "Rearrange $I = \\dfrac{P \\times R \\times T}{100}$ to get $R = \\dfrac{100 \\times I}{P \\times T}$.",
        explanation: `$R = \\dfrac{100 \\times ${interest.toLocaleString()}}{${principal.toLocaleString()} \\times ${time}} = ${rate}\\%$.`,
      };
    }

    if (branch === "simple-interest") {
      const principal = randInt(rng, 5, 50) * 1000;
      const rate = randChoice(rng, [4, 5, 6, 8, 10, 12] as const);
      const time = randInt(rng, 1, 5);
      const interest = (principal * rate * time) / 100;
      return {
        kind: "fill-blank",
        prompt: `A savings account holds a principal of KES ${principal.toLocaleString()} at a simple interest rate of ${rate}% per year for ${time} year${time > 1 ? "s" : ""}. Find the simple interest earned.`,
        before: "Interest = KES",
        after: "",
        correctAnswer: String(interest),
        inputMode: "numeric",
        hint: "Simple interest $= \\dfrac{P \\times R \\times T}{100}$.",
        explanation: `Interest $= \\dfrac{${principal} \\times ${rate} \\times ${time}}{100} = ${interest.toLocaleString()}$.`,
      };
    }

    if (branch === "compound-interest") {
      const principal = randInt(rng, 5, 30) * 1000;
      const rate = randChoice(rng, [5, 10] as const);
      const years = randChoice(rng, [2, 3] as const);
      let amount = principal;
      const yearly: number[] = [];
      for (let y = 0; y < years; y++) {
        amount = amount + (amount * rate) / 100;
        yearly.push(Math.round(amount));
      }
      const compoundInterest = Math.round(amount) - principal;
      const steps = yearly.map((a, i) => `Year ${i + 1}: KES ${a.toLocaleString()}`).join(", ");
      return {
        kind: "fill-blank",
        prompt: `KES ${principal.toLocaleString()} is invested at ${rate}% per annum compound interest for ${years} years. Find the total compound interest earned (step by step, year by year).`,
        before: "Compound interest = KES",
        after: "",
        correctAnswer: String(compoundInterest),
        inputMode: "numeric",
        hint: `Add ${rate}% to the amount at the end of each year, one year at a time — the interest is worked out on the new amount each year.`,
        explanation: `${steps}. Total amount after ${years} years = KES ${Math.round(amount).toLocaleString()}. Compound interest $= ${Math.round(amount).toLocaleString()} - ${principal.toLocaleString()} = ${compoundInterest.toLocaleString()}$.`,
      };
    }

    if (branch === "appreciation") {
      const asset = randChoice(rng, ASSETS_APPRECIATE);
      const value = randInt(rng, 300, 2000) * 1000;
      const rate = randChoice(rng, [5, 8, 10, 12] as const);
      const years = randChoice(rng, [2, 3] as const);
      const finalValue = Math.round(value * (1 + rate / 100) ** years);
      return {
        kind: "fill-blank",
        prompt: `${asset[0].toUpperCase()}${asset.slice(1)} valued at KES ${value.toLocaleString()} appreciates at ${rate}% per year. Find its value after ${years} years.`,
        before: "New value = KES",
        after: "",
        correctAnswer: String(finalValue),
        inputMode: "numeric",
        hint: "Appreciation increases the value by the rate each year, applied to the previous year's value.",
        explanation: `Value after ${years} years $= ${value.toLocaleString()} \\times (1 + \\frac{${rate}}{100})^{${years}} = ${finalValue.toLocaleString()}$.`,
      };
    }

    if (branch === "depreciation") {
      const asset = randChoice(rng, ASSETS_DEPRECIATE);
      const value = randInt(rng, 100, 1500) * 1000;
      const rate = randChoice(rng, [10, 15, 20, 25] as const);
      const years = randChoice(rng, [2, 3] as const);
      const finalValue = Math.round(value * (1 - rate / 100) ** years);
      return {
        kind: "fill-blank",
        prompt: `${asset[0].toUpperCase()}${asset.slice(1)} bought for KES ${value.toLocaleString()} depreciates at ${rate}% per year. Find its value after ${years} years.`,
        before: "New value = KES",
        after: "",
        correctAnswer: String(finalValue),
        inputMode: "numeric",
        hint: "Depreciation reduces the value by the rate each year, applied to the previous year's value.",
        explanation: `Value after ${years} years $= ${value.toLocaleString()} \\times (1 - \\frac{${rate}}{100})^{${years}} = ${finalValue.toLocaleString()}$.`,
      };
    }

    if (branch === "hire-purchase") {
      const cashPrice = randInt(rng, 20, 100) * 1000;
      const deposit = Math.round(cashPrice * (randChoice(rng, [10, 20, 25, 30] as const) / 100));
      const monthlyInstallment = Math.round(((cashPrice - deposit) * 1.2) / 12);
      const totalHP = deposit + monthlyInstallment * 12;
      const extra = totalHP - cashPrice;
      const correctText = `KES ${extra.toLocaleString()}`;
      const choices = shuffle(rng, [correctText, `KES ${(extra + monthlyInstallment).toLocaleString()}`, `KES ${Math.max(0, extra - monthlyInstallment).toLocaleString()}`, `KES 0 (same price)`]);
      return {
        kind: "multiple-choice",
        prompt: `A motorbike has a cash price of KES ${cashPrice.toLocaleString()}. On hire purchase, a buyer pays a deposit of KES ${deposit.toLocaleString()} plus 12 monthly installments of KES ${monthlyInstallment.toLocaleString()}. How much MORE does hire purchase cost compared to paying cash?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Total hire purchase cost = deposit + (installment × number of months). Compare that total to the cash price.",
        explanation: `Total hire purchase price $= ${deposit.toLocaleString()} + (${monthlyInstallment.toLocaleString()} \\times 12) = ${totalHP.toLocaleString()}$. This is KES ${extra.toLocaleString()} more than the cash price of KES ${cashPrice.toLocaleString()}.`,
      };
    }

    if (branch === "scenario-sort") {
      const scenarios = [
        { label: "A bank pays interest that is calculated fresh each year on the growing balance", type: "compound" },
        { label: "A savings club pays interest calculated only on the original amount saved, every year", type: "simple" },
        { label: "A plot of land in a growing town becomes more valuable each year", type: "appreciation" },
        { label: "A delivery motorbike loses value every year as it ages", type: "depreciation" },
      ];
      const items = scenarios.map((s, i) => ({ id: `s${i}`, label: s.label }));
      const buckets = [
        { id: "simple", label: "Simple interest" },
        { id: "compound", label: "Compound interest" },
        { id: "appreciation", label: "Appreciation" },
        { id: "depreciation", label: "Depreciation" },
      ];
      const correctBucket: Record<string, string> = {};
      scenarios.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Match each situation to the correct money concept.",
        items: shuffle(rng, items),
        buckets,
        correctBucket,
        hint: "Simple interest only grows from the original amount; compound interest grows from the previous year's total; appreciation is a value going up, depreciation is a value going down.",
        explanation: scenarios.map((s) => `"${s.label}" is ${s.type}`).join("; ") + ".",
      };
    }

    // order-interest: order principal amounts by resulting simple interest
    const rate = randChoice(rng, [5, 8, 10] as const);
    const time = randChoice(rng, [2, 3] as const);
    const principals = new Set<number>();
    while (principals.size < 4) principals.add(randInt(rng, 5, 60) * 1000);
    const values = Array.from(principals);
    const items = values.map((p) => ({ id: `p${p}`, label: `KES ${p.toLocaleString()}` }));
    const sorted = [...values].sort((a, b) => a - b);
    return {
      kind: "ordering",
      prompt: `Each amount below earns simple interest at ${rate}% per year for ${time} years. Order the principal amounts from least to most interest earned.`,
      instruction: "Click them in order, least interest first.",
      items: shuffle(rng, items),
      correctOrder: sorted.map((p) => `p${p}`),
      hint: "At the same rate and time, a bigger principal always earns more simple interest.",
      explanation: sorted.map((p) => `KES ${p.toLocaleString()} → interest = KES ${((p * rate * time) / 100).toLocaleString()}`).join("; ") + ".",
    };
  },
};
