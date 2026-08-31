import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STATEMENTS = [
  { id: "position", label: "Statement of financial position", shows: "What a business owns (assets), owes (liabilities), and the owner's capital, at one point in time" },
  { id: "cashflow", label: "Cash flow statement", shows: "The cash flowing into and out of a business over a period of time" },
  { id: "income", label: "Income statement", shows: "The revenue earned minus the expenses incurred, to find the profit or loss over a period of time" },
] as const;

const TRANSACTION_ITEMS = [
  { text: "Cash held in the business bank account", bucket: "asset" },
  { text: "Furniture and equipment owned by the business", bucket: "asset" },
  { text: "Stock of goods ready to be sold", bucket: "asset" },
  { text: "A bank loan the business still owes", bucket: "liability" },
  { text: "An unpaid invoice owed to a supplier", bucket: "liability" },
  { text: "Money the owner personally invested into the business", bucket: "capital" },
] as const;

const BUCKET_LABEL: Record<string, string> = { asset: "Asset", liability: "Liability", capital: "Capital" };

const CYCLE_STEPS = [
  { id: "record", label: "Record each transaction in a cash book or journal as it happens" },
  { id: "post", label: "Post the entries from the journal into the ledger accounts" },
  { id: "trial", label: "Prepare a trial balance to check the ledger balances" },
  { id: "income-stmt", label: "Prepare the income statement to find the profit or loss" },
  { id: "position-stmt", label: "Prepare the statement of financial position" },
];

export const bookkeeping: Skill = {
  id: "g8-pt-e-bookkeeping",
  code: "E.1",
  subjectId: "pre-technical",
  strandId: "g8-pt-entrepreneurship",
  grade: 8,
  title: "Bookkeeping",
  description: "The importance of bookkeeping, classifying business transactions, preparing simple financial statements, and the bookkeeping equation.",
  generate(rng) {
    const branch = randChoice(rng, ["statement-match", "transaction-sort", "equation-calc", "chart-read", "cycle-order"] as const);

    if (branch === "statement-match") {
      const tokens = shuffle(rng, STATEMENTS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STATEMENTS.map((s) => ({ id: s.id, label: s.shows })));
      const correctMap: Record<string, string> = {};
      for (const s of STATEMENTS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: "Match each financial statement to what it shows about a business.",
        tokens,
        targets,
        correctMap,
        hint: "One statement is a snapshot at a moment in time; the other two cover a period.",
        explanation: STATEMENTS.map((s) => `${s.label}: ${s.shows}.`).join(" "),
      };
    }

    if (branch === "transaction-sort") {
      const chosen = shuffle(rng, TRANSACTION_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Classify each business transaction as an asset, a liability, or capital.",
        items,
        buckets,
        correctBucket,
        hint: "Assets are what the business owns; liabilities are what it owes; capital is the owner's investment.",
        explanation: chosen.map((c) => `"${c.text}" is ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "equation-calc") {
      const liabilities = randInt(rng, 20, 400) * 1000;
      const capital = randInt(rng, 50, 900) * 1000;
      const assets = liabilities + capital;
      const solveFor = randChoice(rng, ["assets", "liabilities", "capital"] as const);
      if (solveFor === "assets") {
        return {
          kind: "fill-blank",
          prompt: `A business has liabilities of KES ${liabilities.toLocaleString()} and capital of KES ${capital.toLocaleString()}. Using the bookkeeping equation, find its total assets.`,
          before: "Assets = KES",
          after: "",
          correctAnswer: String(assets),
          inputMode: "numeric",
          hint: "The bookkeeping equation: Assets = Liabilities + Capital.",
          explanation: `Assets $= ${liabilities.toLocaleString()} + ${capital.toLocaleString()} = ${assets.toLocaleString()}$.`,
        };
      }
      if (solveFor === "liabilities") {
        return {
          kind: "fill-blank",
          prompt: `A business has total assets of KES ${assets.toLocaleString()} and capital of KES ${capital.toLocaleString()}. Using the bookkeeping equation, find its liabilities.`,
          before: "Liabilities = KES",
          after: "",
          correctAnswer: String(liabilities),
          inputMode: "numeric",
          hint: "Rearrange Assets = Liabilities + Capital to get Liabilities = Assets − Capital.",
          explanation: `Liabilities $= ${assets.toLocaleString()} - ${capital.toLocaleString()} = ${liabilities.toLocaleString()}$.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `A business has total assets of KES ${assets.toLocaleString()} and liabilities of KES ${liabilities.toLocaleString()}. Using the bookkeeping equation, find the owner's capital.`,
        before: "Capital = KES",
        after: "",
        correctAnswer: String(capital),
        inputMode: "numeric",
        hint: "Rearrange Assets = Liabilities + Capital to get Capital = Assets − Liabilities.",
        explanation: `Capital $= ${assets.toLocaleString()} - ${liabilities.toLocaleString()} = ${capital.toLocaleString()}$.`,
      };
    }

    if (branch === "chart-read") {
      const liabilities = randInt(rng, 20, 300);
      const capital = randInt(rng, 50, 500);
      const assets = liabilities + capital;
      const data = [
        { label: "Assets", value: assets },
        { label: "Liabilities", value: liabilities },
        { label: "Capital", value: capital },
      ];
      const askAbout = randChoice(rng, ["Liabilities", "Capital", "Assets"] as const);
      const desc: Record<string, string> = {
        Liabilities: "the amount the business still owes to others, such as loans and unpaid bills",
        Capital: "the amount the owner has personally invested in the business",
        Assets: "everything of value the business owns",
      };
      return {
        kind: "multiple-choice",
        prompt: `This chart shows a business's assets, liabilities, and capital (in thousands of KES). Which bar represents ${desc[askAbout]}?`,
        visual: { type: "bar-chart", data: shuffle(rng, data) },
        choices: ["Assets", "Liabilities", "Capital"],
        correctIndex: ["Assets", "Liabilities", "Capital"].indexOf(askAbout),
        hint: "Read the bar labels carefully — each one is a different part of the bookkeeping equation.",
        explanation: `${askAbout} represents ${desc[askAbout]}.`,
      };
    }

    // cycle-order
    const items = shuffle(rng, CYCLE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the correct order of the basic bookkeeping cycle, from recording a transaction to preparing the final statements.",
      instruction: "Click them in order.",
      items,
      correctOrder: CYCLE_STEPS.map((s) => s.id),
      hint: "Every transaction is recorded first, then organised, checked, and finally summarised into statements.",
      explanation: CYCLE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
