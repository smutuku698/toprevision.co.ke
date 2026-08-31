import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const INCOME_ITEMS = [
  { text: "A monthly salary paid by an employer", bucket: "income" },
  { text: "Profit earned from running a small business", bucket: "income" },
  { text: "Rent collected from a property you own", bucket: "income" },
  { text: "Interest earned on money kept in a savings account", bucket: "income" },
  { text: "A bank loan that must be repaid with interest", bucket: "not-income" },
  { text: "Money borrowed from a friend that you owe back", bucket: "not-income" },
] as const;

const INCOME_LABEL: Record<string, string> = { income: "A source of personal income", "not-income": "Not income — it must be repaid" };

const ETHICS_ITEMS = [
  { text: "Recording every expense honestly, even small ones", bucket: "ethical" },
  { text: "Saving a portion of income regularly for genuine future needs", bucket: "ethical" },
  { text: "Avoiding unnecessary debt just to fund a lifestyle you cannot afford", bucket: "ethical" },
  { text: "Falsifying expense claims to get extra money back", bucket: "unethical" },
  { text: "Borrowing heavily to buy items purely to impress others", bucket: "unethical" },
  { text: "Diverting money meant for rent or food into gambling", bucket: "unethical" },
] as const;

const ETHICS_LABEL: Record<string, string> = { ethical: "Ethical budgeting practice", unethical: "Unethical budgeting practice" };

const BUDGET_STEPS = [
  { id: "list-income", label: "List all expected sources of income" },
  { id: "list-expenses", label: "List all expected expenses" },
  { id: "categorize", label: "Categorize expenses as needs or wants" },
  { id: "compare", label: "Compare total income to total expenses" },
  { id: "adjust", label: "Adjust spending or savings so the budget balances" },
];

export const incomeAndBudgeting: Skill = {
  id: "g8-pt-e-income-budgeting",
  code: "E.2",
  subjectId: "pre-technical",
  strandId: "g8-pt-entrepreneurship",
  grade: 8,
  title: "Income and Budgeting",
  description: "Sources of personal income, the importance of budgeting, preparing a simple personal budget, and ethical practices in budgeting.",
  generate(rng) {
    const branch = randChoice(rng, ["income-sort", "budget-calc", "ethics-sort", "chart-read", "budget-order"] as const);

    if (branch === "income-sort") {
      const chosen = shuffle(rng, INCOME_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: INCOME_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `i${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`i${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each item into whether it is a source of personal income, or not.",
        items,
        buckets,
        correctBucket,
        hint: "Income is money you earn and keep; a loan is money you must eventually pay back.",
        explanation: chosen.map((c) => `"${c.text}" — ${INCOME_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "budget-calc") {
      const income = randInt(rng, 15, 80) * 1000;
      const expenses = randInt(rng, 8, income / 1000 - 2) * 1000;
      const balance = income - expenses;
      const solveFor = randChoice(rng, ["balance", "expenses", "income"] as const);
      if (solveFor === "balance") {
        return {
          kind: "fill-blank",
          prompt: `A person's monthly income is KES ${income.toLocaleString()} and their total monthly expenses are KES ${expenses.toLocaleString()}. Find their remaining balance (savings) for the month.`,
          before: "Balance = KES",
          after: "",
          correctAnswer: String(balance),
          inputMode: "numeric",
          hint: "Balance = income − expenses.",
          explanation: `Balance $= ${income.toLocaleString()} - ${expenses.toLocaleString()} = ${balance.toLocaleString()}$.`,
        };
      }
      if (solveFor === "expenses") {
        return {
          kind: "fill-blank",
          prompt: `A person's monthly income is KES ${income.toLocaleString()} and they end the month with a balance of KES ${balance.toLocaleString()}. Find their total monthly expenses.`,
          before: "Expenses = KES",
          after: "",
          correctAnswer: String(expenses),
          inputMode: "numeric",
          hint: "Expenses = income − balance.",
          explanation: `Expenses $= ${income.toLocaleString()} - ${balance.toLocaleString()} = ${expenses.toLocaleString()}$.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `A person's monthly expenses total KES ${expenses.toLocaleString()}, and they end the month with a balance of KES ${balance.toLocaleString()}. Find their monthly income.`,
        before: "Income = KES",
        after: "",
        correctAnswer: String(income),
        inputMode: "numeric",
        hint: "Income = expenses + balance.",
        explanation: `Income $= ${expenses.toLocaleString()} + ${balance.toLocaleString()} = ${income.toLocaleString()}$.`,
      };
    }

    if (branch === "ethics-sort") {
      const chosen = shuffle(rng, ETHICS_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: ETHICS_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each budgeting practice into ethical or unethical.",
        items,
        buckets,
        correctBucket,
        hint: "Ethical budgeting is honest and plans for genuine needs; unethical budgeting deceives or funds harmful habits.",
        explanation: chosen.map((c) => `"${c.text}" — ${ETHICS_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "chart-read") {
      const categories = ["Rent", "Food", "Transport", "Savings"];
      const data = categories.map((label) => ({ label, value: randInt(rng, 2, 25) }));
      const largest = data.reduce((a, b) => (a.value > b.value ? a : b));
      const others = data.filter((d) => d.label !== largest.label).map((d) => d.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, largest.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "This chart shows a person's monthly budget by category (in thousands of KES). Which category takes up the largest share of the budget?",
        visual: { type: "bar-chart", data },
        choices,
        correctIndex,
        hint: "Look for the tallest bar on the chart.",
        explanation: `${largest.label} has the tallest bar, taking the largest share of this month's budget.`,
      };
    }

    // budget-order
    const items = shuffle(rng, BUDGET_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the correct steps for preparing a simple personal budget.",
      instruction: "Click them in order.",
      items,
      correctOrder: BUDGET_STEPS.map((s) => s.id),
      hint: "List what comes in and what goes out first, then compare and adjust.",
      explanation: BUDGET_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
