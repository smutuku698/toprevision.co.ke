import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PACKING_ITEMS: { item: string; category: "clothing" | "toiletries" | "documents" }[] = [
  { item: "school uniform", category: "clothing" },
  { item: "warm sweater", category: "clothing" },
  { item: "sports kit", category: "clothing" },
  { item: "extra pair of socks", category: "clothing" },
  { item: "toothbrush and toothpaste", category: "toiletries" },
  { item: "bar of soap", category: "toiletries" },
  { item: "bath towel", category: "toiletries" },
  { item: "comb", category: "toiletries" },
  { item: "student ID card", category: "documents" },
  { item: "festival entry permission letter", category: "documents" },
  { item: "torch", category: "documents" },
  { item: "water bottle", category: "documents" },
];

const SHOPPING_ITEMS: { item: string; category: "produce" | "dairy" | "household" }[] = [
  { item: "bananas", category: "produce" },
  { item: "oranges", category: "produce" },
  { item: "tomatoes", category: "produce" },
  { item: "onions", category: "produce" },
  { item: "milk", category: "dairy" },
  { item: "yoghurt", category: "dairy" },
  { item: "cheese", category: "dairy" },
  { item: "dish soap", category: "household" },
  { item: "serviettes", category: "household" },
  { item: "matches", category: "household" },
];

const CATEGORY_LABELS: Record<string, string> = {
  clothing: "Clothing",
  toiletries: "Toiletries",
  documents: "Documents & essentials",
  produce: "Produce",
  dairy: "Dairy",
  household: "Household items",
};

const EVENT_LISTS: { event: string; listType: "packing" | "shopping"; shown: string[]; missing: string; distractors: string[] }[] = [
  {
    event: "a 3-day trip to the Kenya Music Festival in Nakuru",
    listType: "packing",
    shown: ["school uniform", "warm sweater", "toothbrush and toothpaste", "bar of soap"],
    missing: "festival entry permission letter",
    distractors: ["sports kit", "extra pair of socks", "bath towel"],
  },
  {
    event: "a weekend choir camp in Nyeri",
    listType: "packing",
    shown: ["sports kit", "bath towel", "comb", "student ID card"],
    missing: "toothbrush and toothpaste",
    distractors: ["school uniform", "warm sweater", "torch"],
  },
  {
    event: "preparing refreshments for the music club's fundraising concert",
    listType: "shopping",
    shown: ["bananas", "oranges", "milk", "dish soap"],
    missing: "serviettes",
    distractors: ["tomatoes", "onions", "yoghurt"],
  },
  {
    event: "shopping for the school band's end-of-term picnic",
    listType: "shopping",
    shown: ["yoghurt", "cheese", "serviettes", "matches"],
    missing: "bananas",
    distractors: ["milk", "dish soap", "onions"],
  },
];

const BUDGET_SCENARIOS: { before: string; after: string; correctAnswer: string }[] = [
  {
    before: "The choir is shopping for their trip snack list: 3 mandazi at KSh 10 each and a bottle of juice at KSh 50. If Byron has KSh 100, how much money will he have left after buying these items?",
    after: "",
    correctAnswer: "20",
  },
  {
    before: "The music club is buying supplies for the festival: 2 loaves of bread at KSh 60 each and a packet of biscuits at KSh 50. If Amani has KSh 200, how much money will she have left after buying these items?",
    after: "",
    correctAnswer: "30",
  },
  {
    before: "For the band's picnic, Naliaka buys 4 oranges at KSh 15 each and a carton of milk at KSh 90. If she has KSh 200, how much money will she have left after buying these items?",
    after: "",
    correctAnswer: "50",
  },
  {
    before: "The concert committee buys 5 packets of serviettes at KSh 20 each and a box of matches at KSh 10. If they have a budget of KSh 150, how much money is left after buying these items?",
    after: "",
    correctAnswer: "40",
  },
];

export const packingShoppingLists: Skill = {
  id: "g7-eng-w-packing-shopping-lists",
  code: "W.10",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Functional Writing: Packing and Shopping Lists",
  description: "Group items logically in packing and shopping lists for a music event or trip, and check a simple shopping list against a budget.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-missing", "match", "fill-budget"] as const);
    const hint = "Group packing-list items by clothing, toiletries, and documents/essentials, and group shopping-list items by produce, dairy, and household items.";

    if (branch === "categorize") {
      const usePacking = rng() < 0.5;
      if (usePacking) {
        const clothing = shuffle(rng, PACKING_ITEMS.filter((p) => p.category === "clothing")).slice(0, 2);
        const toiletries = shuffle(rng, PACKING_ITEMS.filter((p) => p.category === "toiletries")).slice(0, 2);
        const documents = shuffle(rng, PACKING_ITEMS.filter((p) => p.category === "documents")).slice(0, 2);
        const chosen = shuffle(rng, [...clothing, ...toiletries, ...documents]);
        const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.item }));
        const correctBucket: Record<string, string> = {};
        chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.category));
        return {
          kind: "categorize",
          prompt: "Sort each item for a music festival trip into the correct packing-list group.",
          items,
          buckets: ["clothing", "toiletries", "documents"].map((id) => ({ id, label: CATEGORY_LABELS[id] })),
          correctBucket,
          hint,
          explanation: chosen.map((c) => `"${c.item}" belongs under ${CATEGORY_LABELS[c.category]}.`).join(" "),
        };
      }
      const produce = shuffle(rng, SHOPPING_ITEMS.filter((p) => p.category === "produce")).slice(0, 2);
      const dairy = shuffle(rng, SHOPPING_ITEMS.filter((p) => p.category === "dairy")).slice(0, 2);
      const household = shuffle(rng, SHOPPING_ITEMS.filter((p) => p.category === "household")).slice(0, 2);
      const chosen = shuffle(rng, [...produce, ...dairy, ...household]);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.item }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each item for the music club's shopping list into the correct group.",
        items,
        buckets: ["produce", "dairy", "household"].map((id) => ({ id, label: CATEGORY_LABELS[id] })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.item}" belongs under ${CATEGORY_LABELS[c.category]}.`).join(" "),
      };
    }

    if (branch === "mc-missing") {
      const entry = randChoice(rng, EVENT_LISTS);
      const choices = shuffle(rng, [entry.missing, ...entry.distractors]);
      const listName = entry.listType === "packing" ? "packing list" : "shopping list";
      return {
        kind: "multiple-choice",
        prompt: `Here is a ${listName} for ${entry.event}: ${entry.shown.join(", ")}. Which important item is missing from this list?`,
        choices,
        correctIndex: choices.indexOf(entry.missing),
        layout: "list",
        hint: "Think about what category of items the list is missing, given the purpose of the trip or event.",
        explanation: `"${entry.missing}" is missing — a well-planned ${listName} for ${entry.event} should include it alongside the items already listed.`,
      };
    }

    if (branch === "match") {
      const mixed = shuffle(rng, [...PACKING_ITEMS, ...SHOPPING_ITEMS]).slice(0, 5);
      const tokens = shuffle(rng, mixed.map((m, i) => ({ id: `m${i}`, label: m.item })));
      const targets = shuffle(rng, mixed.map((m, i) => ({ id: `m${i}`, label: CATEGORY_LABELS[m.category] })));
      const correctMap: Record<string, string> = {};
      mixed.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each item to the packing-list or shopping-list group it belongs to.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: mixed.map((m) => `"${m.item}" belongs under ${CATEGORY_LABELS[m.category]}.`).join(" "),
      };
    }

    const entry = randChoice(rng, BUDGET_SCENARIOS);
    return {
      kind: "fill-blank",
      prompt: "Read the shopping list and work out the answer.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "numeric",
      unit: "KSh",
      hint: "Add up the cost of every item on the list first, then subtract that total from the amount of money available.",
      explanation: `After adding up the items and subtracting from the budget, KSh ${entry.correctAnswer} is left.`,
    };
  },
};
