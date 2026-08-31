import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Grade 6 money terms in scope: budget, profit, loss, buying price, selling price, balance,
// and (definitional only, no calculation) two tax types — income tax and VAT.
const TERMS = [
  { id: "budget", label: "Budget", definition: "A plan listing the items to buy and their costs, checked against the money available" },
  { id: "profit", label: "Profit", definition: "The extra money made when the selling price is higher than the buying price" },
  { id: "loss", label: "Loss", definition: "The money lost when the selling price is lower than the buying price" },
  { id: "buying-price", label: "Buying price", definition: "The amount a trader pays to acquire an item before selling it on" },
  { id: "selling-price", label: "Selling price", definition: "The amount a customer pays to buy an item from a trader" },
  { id: "balance", label: "Balance", definition: "The money left over after expenses are subtracted from the amount available" },
  { id: "income-tax", label: "Income tax", definition: "A tax deducted from a person's earnings or salary, paid to the government" },
  { id: "vat", label: "VAT (Value Added Tax)", definition: "A tax added to the price of most goods and services bought, shown on a receipt" },
] as const;

type TermId = (typeof TERMS)[number]["id"];

// 32 real Kenyan receipt/purchase/earning scenarios, each illustrating exactly one money term.
const SCENARIOS: { text: string; term: TermId }[] = [
  { text: "Jane lists the cost of books, uniform and bus fare before going shopping, and compares it to the KES 2,000 her mother gave her.", term: "budget" },
  { text: "A supermarket receipt shows an extra amount added on top of the goods' prices, going to the government.", term: "vat" },
  { text: "A civil servant's payslip shows a deduction sent to the Kenya Revenue Authority from their monthly salary.", term: "income-tax" },
  { text: "A trader bought a sack of maize for KES 3,000 and sold it for KES 3,600, gaining KES 600.", term: "profit" },
  { text: "A trader bought a bicycle for KES 5,000 but had to sell it for KES 4,200, losing KES 800.", term: "loss" },
  { text: "The amount a shopkeeper pays a supplier to stock an item, before it goes on the shelf.", term: "buying-price" },
  { text: "The amount a customer pays at the till for an item.", term: "selling-price" },
  { text: "After buying everything on her shopping list, Amina counts what remains of the money she started with.", term: "balance" },
  { text: "Every employee at a factory has a portion of their pay withheld each month for the government, based on how much they earn.", term: "income-tax" },
  { text: "A printed till slip shows the goods' cost plus a charge already included in the final total paid.", term: "vat" },
  { text: "Before a school trip, the teacher writes down the cost of transport, food and entry fees, then checks it against the funds collected.", term: "budget" },
  { text: "A greengrocer paid KES 50 for a crate of tomatoes and sold it for KES 70.", term: "profit" },
  { text: "A fishmonger bought fish for KES 2,000 but sold the catch for only KES 1,700 because it started to spoil.", term: "loss" },
  { text: "The KES 3,500 a livestock trader pays a farmer for a goat, before reselling it at the market.", term: "buying-price" },
  { text: "The KES 4,000 a customer pays a livestock trader for a goat at the market.", term: "selling-price" },
  { text: "After settling a bill of KES 850 with a KES 1,000 note, the cashier hands back the difference.", term: "balance" },
  { text: "A government department deducts money directly from a teacher's salary every month before it is paid out.", term: "income-tax" },
  { text: "A shop displays prices that already include a tax charged on nearly everything sold in the country.", term: "vat" },
  { text: "A family writes down expected costs for rent, food and school fees for the month, then checks it against their income.", term: "budget" },
  { text: "A tailor spent KES 300 on fabric and thread but sold the finished dress for KES 900.", term: "profit" },
  { text: "A phone seller bought a used phone for KES 8,000 but could only sell it for KES 6,500 after it stayed unsold for months.", term: "loss" },
  { text: "The amount a bookshop pays a distributor for each textbook, before selling it to students.", term: "buying-price" },
  { text: "The amount a student pays the bookshop for a textbook.", term: "selling-price" },
  { text: "After paying for fuel and snacks on a road trip, the driver checks how much of the trip allowance is left.", term: "balance" },
  { text: "A portion of a nurse's monthly earnings is automatically sent to the government as part of her taxes.", term: "income-tax" },
  { text: "A receipt for a new radio shows the listed price already includes a tax added by the government on the sale.", term: "vat" },
  { text: "A church committee plans how much will be spent on building materials against the harambee funds raised.", term: "budget" },
  { text: "A carpenter spent KES 1,200 on timber and nails, then sold the finished table for KES 2,000.", term: "profit" },
  { text: "A farmer spent KES 4,000 rearing chickens but the market price crashed, and he sold them for only KES 3,200 total.", term: "loss" },
  { text: "The amount a hardware shop pays a manufacturer for each roll of wire, before it's sold to customers.", term: "buying-price" },
  { text: "The amount a customer pays the hardware shop for a roll of wire.", term: "selling-price" },
  { text: "After spending part of her pocket money on snacks, a student checks how much money she has left.", term: "balance" },
];

function termLabel(id: TermId): string {
  return TERMS.find((t) => t.id === id)!.label;
}

export const taxesAndMoneyTerms: Skill = {
  id: "g6-math-m-taxes-money-terms",
  code: "M.14",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Taxes and money terms",
  description: "Identify income tax and VAT, and other money terms (budget, profit, loss, buying price, selling price, balance), from real receipt and purchase scenarios.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-term-mc",
        "tax-type-mc",
        "click-match",
        "categorize-is-tax",
        "order-budget-steps",
        "fill-blank",
      ] as const
    );

    if (branch === "identify-term-mc") {
      const s = randChoice(rng, SCENARIOS);
      const correct = termLabel(s.term);
      const wrongPool = TERMS.filter((t) => t.id !== s.term).map((t) => t.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, shuffle(rng, wrongPool), 3);
      return {
        kind: "multiple-choice",
        prompt: `Which term best describes this situation? "${s.text}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about whether money is being planned, earned, taxed, or paid/received in a sale.",
        explanation: `This describes ${correct}: ${TERMS.find((t) => t.id === s.term)!.definition}.`,
      };
    }

    if (branch === "tax-type-mc") {
      const taxScenarios = SCENARIOS.filter((s) => s.term === "income-tax" || s.term === "vat");
      const s = randChoice(rng, taxScenarios);
      const correct = termLabel(s.term);
      const otherTax = s.term === "income-tax" ? "VAT (Value Added Tax)" : "Income tax";
      const wrong = [otherTax, "Import duty", "Excise duty"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which tax applies in this situation? "${s.text}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Income tax is deducted from earnings/salary. VAT is added to the price of goods and services when they are bought.",
        explanation: `This is ${correct}. ${s.term === "income-tax" ? "It comes from a person's earnings or salary." : "It is added to the price of goods or services being purchased."}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...TERMS]).slice(0, 4);
      const tokens = chosen.map((t, i) => ({ id: `t${i}`, label: t.label }));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: t.definition })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each money term to its correct meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think carefully about who pays whom, and when, for each term.",
        explanation: chosen.map((t) => `${t.label}: ${t.definition}`).join(" "),
      };
    }

    if (branch === "categorize-is-tax") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 7);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const buckets = [
        { id: "tax", label: "A tax" },
        { id: "not-tax", label: "Not a tax" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.term === "income-tax" || s.term === "vat" ? "tax" : "not-tax"));
      return {
        kind: "categorize",
        prompt: "Sort each situation by whether it describes a tax or not.",
        items,
        buckets,
        correctBucket,
        hint: "Only income tax and VAT are taxes — budget, profit, loss, buying price, selling price and balance are not.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.term === "income-tax" || s.term === "vat" ? termLabel(s.term) : `an example of ${termLabel(s.term).toLowerCase()}, not a tax`}`).join(" "),
      };
    }

    if (branch === "order-budget-steps") {
      const steps = [
        { id: "b1", label: "List every item you plan to buy" },
        { id: "b2", label: "Write down (or find out) the price of each item" },
        { id: "b3", label: "Add up the prices to find the total cost" },
        { id: "b4", label: "Compare the total cost to the money available" },
        { id: "b5", label: "Work out the balance — what is left over, or how much more is needed" },
      ];
      return {
        kind: "ordering",
        prompt: "Put these steps for preparing a simple budget in the correct order.",
        instruction: "Click the steps in order.",
        items: shuffle(rng, steps),
        correctOrder: steps.map((s) => s.id),
        hint: "You need the full list and its total before you can compare it to what you have.",
        explanation: "Steps: (1) list the items, (2) find each price, (3) add up the total cost, (4) compare to money available, (5) work out the balance.",
      };
    }

    // fill-blank
    const s = randChoice(rng, SCENARIOS);
    const correct = termLabel(s.term);
    return {
      kind: "fill-blank",
      prompt: `Complete the sentence about this situation: "${s.text}"`,
      before: "This is an example of: ",
      after: "",
      correctAnswer: correct,
      acceptedAnswers: [correct, s.term === "vat" ? "vat" : correct, s.term === "vat" ? "value added tax" : correct],
      inputMode: "text",
      hint: "Think about whether money is being planned, earned, taxed, or paid/received in a sale.",
      explanation: `This describes ${correct}: ${TERMS.find((t) => t.id === s.term)!.definition}.`,
    };
  },
};
