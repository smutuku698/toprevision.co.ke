import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./grammarSharedA";

type Quantifier = { phrase: string; usage: "countable" | "uncountable" };
const QUANTIFIERS: Quantifier[] = [
  { phrase: "a lot of", usage: "countable" }, // also works uncountable, listed separately below
  { phrase: "plenty of", usage: "countable" },
  { phrase: "a number of", usage: "countable" },
  { phrase: "a crate of", usage: "countable" },
  { phrase: "a pinch of", usage: "uncountable" },
  { phrase: "a bag of", usage: "countable" },
];

// Countable/uncountable nouns for quantifier scenarios.
const COUNTABLE_NOUNS = ["mangoes", "workers", "chairs", "bottles", "goats", "employees", "eggs", "customers"];
const UNCOUNTABLE_NOUNS = ["salt", "flour", "water", "advice", "sugar", "rice", "milk", "patience"];

type Item = { phrase: string; noun: string; countable: boolean; sentence: (n: string) => string };
// 30+ Kenyan-context sentence pairs — work-ethics themed, per the source sub-strand.
const ITEMS: Item[] = [
  { phrase: "a pinch of", noun: "salt", countable: false, sentence: () => `The cook added ___ salt to the stew.` },
  { phrase: "a pinch of", noun: "patience", countable: false, sentence: (n) => `${n} needed just ___ patience to finish the difficult report.` },
  { phrase: "plenty of", noun: "advice", countable: false, sentence: (n) => `The supervisor gave ${n} ___ advice on work ethics.` },
  { phrase: "plenty of", noun: "workers", countable: true, sentence: () => `The factory hired ___ workers during the busy season.` },
  { phrase: "a number of", noun: "employees", countable: true, sentence: () => `___ employees were promoted for their integrity this year.` },
  { phrase: "a number of", noun: "customers", countable: true, sentence: () => `___ customers complained about the poor service.` },
  { phrase: "a crate of", noun: "eggs", countable: true, sentence: (n) => `${n} delivered ___ eggs to the market before dawn.` },
  { phrase: "a crate of", noun: "bottles", countable: true, sentence: () => `The hardworking porter carried ___ bottles to the shop.` },
  { phrase: "a bag of", noun: "flour", countable: false, sentence: () => `The baker bought ___ flour for the week's orders.` },
  { phrase: "a bag of", noun: "rice", countable: false, sentence: (n) => `${n} carried ___ rice to the storeroom.` },
  { phrase: "a lot of", noun: "goats", countable: true, sentence: () => `The loyal herder looked after ___ goats.` },
  { phrase: "a lot of", noun: "water", countable: false, sentence: () => `Building the road required ___ water for mixing cement.` },
  { phrase: "a pinch of", noun: "sugar", countable: false, sentence: () => `Just ___ sugar was enough to sweeten the tea.` },
  { phrase: "plenty of", noun: "mangoes", countable: true, sentence: (n) => `${n}'s farm produced ___ mangoes this season.` },
  { phrase: "a number of", noun: "chairs", countable: true, sentence: () => `The office manager ordered ___ chairs for the new staff.` },
  { phrase: "a crate of", noun: "mangoes", countable: true, sentence: (n) => `${n} sold ___ mangoes to the wholesaler for a fair price.` },
  { phrase: "a bag of", noun: "sugar", countable: false, sentence: () => `The honest shopkeeper weighed out ___ sugar carefully.` },
  { phrase: "a lot of", noun: "employees", countable: true, sentence: () => `The company trained ___ employees in workplace safety.` },
  { phrase: "plenty of", noun: "water", countable: false, sentence: () => `The reservoir held ___ water for the whole town.` },
  { phrase: "a number of", noun: "goats", countable: true, sentence: (n) => `${n} sold ___ goats at a fair price during the market day.` },
];

export const phrasalQuantifiers: Skill = {
  id: "g6-eng-grammar-phrasal-quantifiers",
  code: "G.6",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Phrasal Quantifiers",
  description: "Use phrasal quantifiers (a lot of, a pinch of, plenty of, a number of, a crate of, a bag of) correctly with countable and uncountable nouns.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-choose", "categorize-noun-type", "categorize-quantifier-type", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence with a suitable phrasal quantifier for "${item.noun}" (a ${item.countable ? "countable" : "uncountable"} noun).`,
        before,
        after,
        correctAnswer: item.phrase,
        acceptedAnswers: item.countable ? ["a lot of", "plenty of", "a number of", item.phrase] : ["a lot of", "plenty of", item.phrase],
        inputMode: "text",
        hint: item.countable ? "This noun can be counted individually." : "This noun is measured, not counted one by one.",
        explanation: `"${item.phrase}" fits "${item.noun}" — ${item.countable ? "quantifiers like a number of/a crate of work with countable nouns" : "quantifiers like a pinch of/a bag of work with uncountable nouns"}.`,
      };
    }

    if (branch === "mc-choose") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const wrongPool = ITEMS.filter((i) => i.countable !== item.countable && i.phrase !== item.phrase).map((i) => i.phrase);
      const distractors = shuffle(rng, Array.from(new Set(wrongPool))).slice(0, 3);
      const choices = shuffle(rng, [item.phrase, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which phrasal quantifier correctly completes this sentence?\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.phrase),
        layout: "row",
        hint: `"${item.noun}" is ${item.countable ? "countable" : "uncountable"}.`,
        explanation: `"${item.phrase}" is correct for "${item.noun}", a ${item.countable ? "countable" : "uncountable"} noun.`,
      };
    }

    if (branch === "categorize-noun-type") {
      const pool = shuffle(rng, [...COUNTABLE_NOUNS.map((n) => ({ id: n, label: n, countable: true })), ...UNCOUNTABLE_NOUNS.map((n) => ({ id: n, label: n, countable: false }))]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.countable ? "countable" : "uncountable";
      return {
        kind: "categorize",
        prompt: "Sort these nouns: is it COUNTABLE, or UNCOUNTABLE?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "countable", label: "Countable" },
          { id: "uncountable", label: "Uncountable" },
        ],
        correctBucket,
        hint: "Ask: can you say 'one ___, two ___'?",
        explanation: `Countable: ${COUNTABLE_NOUNS.join(", ")}. Uncountable: ${UNCOUNTABLE_NOUNS.join(", ")}.`,
      };
    }

    if (branch === "categorize-quantifier-type") {
      const pool = shuffle(rng, QUANTIFIERS);
      const usages: Record<string, "countable" | "uncountable" | "both"> = {
        "a lot of": "both",
        "plenty of": "both",
        "a number of": "countable",
        "a crate of": "countable",
        "a bag of": "both",
        "a pinch of": "uncountable",
      };
      const correctBucket: Record<string, string> = {};
      for (const q of pool) correctBucket[q.phrase] = usages[q.phrase];
      return {
        kind: "categorize",
        prompt: "Sort these phrasal quantifiers by which type of noun they can be used with.",
        items: pool.map((q) => ({ id: q.phrase, label: q.phrase })),
        buckets: [
          { id: "countable", label: "Countable Nouns Only" },
          { id: "uncountable", label: "Uncountable Nouns Only" },
          { id: "both", label: "Both Types" },
        ],
        correctBucket,
        hint: "'a number of' and 'a crate of' only work with things you can count individually; 'a pinch of' only works with things you measure.",
        explanation: "'a number of'/'a crate of' → countable only. 'a pinch of' → uncountable only. 'a lot of'/'plenty of'/'a bag of' → both.",
      };
    }

    const item = randChoice(rng, ITEMS);
    const name = randChoice(rng, KENYAN_NAMES);
    const full = item.sentence(name).replace("___", item.phrase).replace(".", "");
    const words = full.split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct sentence with a phrasal quantifier.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `"${item.phrase}" comes directly before the noun "${item.noun}".`,
      explanation: `The correct sentence is: "${cap(full)}."`,
    };
  },
};
