import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

type PrepCategory = "time" | "direction" | "agent" | "instrument";
const CATEGORY_LABEL: Record<PrepCategory, string> = { time: "Time", direction: "Direction/Place", agent: "Agent (who did it)", instrument: "Instrument (what it was done with)" };

// 30 money/trade-themed sentences (time, direction, agent, instrument prepositions), per the source sub-strand.
type Item = { prep: string; category: PrepCategory; sentence: (n: string, p: string) => string };
const ITEMS: Item[] = [
  { prep: "since", category: "time", sentence: (n) => `${n} has traded at the market ___ last year.` },
  { prep: "before", category: "time", sentence: () => `The shopkeeper counted the stock ___ opening the shop.` },
  { prep: "until", category: "time", sentence: (n) => `${n} negotiated with the buyer ___ they agreed on a fair price.` },
  { prep: "about", category: "time", sentence: () => `The traders arrive at the market ___ six in the morning.` },
  { prep: "during", category: "time", sentence: (n) => `${n} sold the most goods ___ the festive season.` },
  { prep: "past", category: "time", sentence: () => `The bank closes at half ___ four every day.` },
  { prep: "above", category: "direction", sentence: () => `The exchange rate rose ___ the previous week's value.` },
  { prep: "across", category: "direction", sentence: (n) => `${n} carried the goods ___ the market to the new stall.` },
  { prep: "below", category: "direction", sentence: () => `The wholesale price fell ___ the usual rate this month.` },
  { prep: "after", category: "direction", sentence: (n, p) => `${n} opened a new boutique right ___ the bank in ${p}.` },
  { prep: "between", category: "direction", sentence: () => `The currency exchange counter is ___ the two shops.` },
  { prep: "through", category: "direction", sentence: (n) => `${n} walked ___ the crowded market to reach the stall.` },
  { prep: "by", category: "agent", sentence: () => `The imported goods were inspected ___ the customs officer.` },
  { prep: "by", category: "agent", sentence: (n) => `The profit was calculated ___ ${n}, the shop's accountant.` },
  { prep: "by", category: "agent", sentence: () => `The trade agreement was signed ___ both wholesalers.` },
  { prep: "with", category: "agent", sentence: (n) => `${n} negotiated the deal ___ the help of a translator.` },
  { prep: "with", category: "instrument", sentence: () => `The trader weighed the maize ___ an old balance scale.` },
  { prep: "with", category: "instrument", sentence: (n) => `${n} sealed the sack of grain ___ a length of string.` },
  { prep: "by", category: "instrument", sentence: () => `The hawker transported the goods ___ handcart.` },
  { prep: "by", category: "instrument", sentence: (n) => `${n} paid for the imported stock ___ bank transfer.` },
  { prep: "since", category: "time", sentence: (n, p) => `${n} has run a boutique in ${p} ___ 2019.` },
  { prep: "during", category: "time", sentence: () => `Profits usually increase ___ the harvest season.` },
  { prep: "about", category: "time", sentence: (n) => `${n} closes the stall ___ seven every evening.` },
  { prep: "below", category: "direction", sentence: (n) => `${n}'s stall is just ___ the currency exchange office.` },
  { prep: "across", category: "direction", sentence: () => `The goods were shipped ___ the border for export.` },
  { prep: "by", category: "agent", sentence: (n, p) => `The new tax policy was announced ___ the county government of ${p}.` },
  { prep: "with", category: "instrument", sentence: () => `The trader recorded each sale ___ a notebook and pen.` },
  { prep: "before", category: "time", sentence: (n) => `${n} checked the exchange rate ___ making the purchase.` },
  { prep: "until", category: "time", sentence: () => `The shop stayed open ___ the last customer had left.` },
  { prep: "through", category: "direction", sentence: (n) => `${n} sent the payment ___ a mobile money service.` },
];

const FILL_PROMPTS = [
  "Complete the sentence with the correct preposition.",
  "Fill in the blank with the preposition that best fits this sentence.",
  "Which preposition correctly completes this sentence?",
  "Choose the right preposition to complete the sentence below.",
  "Supply the missing preposition in this sentence.",
];

const MC_PROMPTS = [
  "Which preposition correctly completes this sentence?",
  "Pick the preposition that best fits this sentence.",
  "Select the correct preposition for this sentence.",
  "Which of these prepositions belongs in the blank below?",
  "Choose the preposition that makes this sentence correct.",
];

export const prepositions: Skill = {
  id: "g6-eng-grammar-prepositions",
  code: "G.13",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Prepositions",
  description: "Identify and use prepositions of time, direction, agent, and instrument correctly in sentences about money and trade.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-choose", "categorize-function", "click-match", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before,
        after,
        correctAnswer: item.prep,
        inputMode: "text",
        hint: `This is a preposition of ${CATEGORY_LABEL[item.category].toLowerCase()}.`,
        explanation: `"${item.prep}" is correct — it is a preposition of ${CATEGORY_LABEL[item.category].toLowerCase()}.`,
      };
    }

    if (branch === "mc-choose") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const wrongPool = shuffle(rng, ITEMS.filter((i) => i.prep !== item.prep)).slice(0, 3).map((i) => i.prep);
      const choices = shuffle(rng, [item.prep, ...new Set(wrongPool)]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_PROMPTS)}\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.prep),
        layout: "row",
        hint: `Think about whether the sentence needs a preposition of time, place, agent, or instrument.`,
        explanation: `"${item.prep}" is correct here — it shows ${CATEGORY_LABEL[item.category].toLowerCase()}.`,
      };
    }

    if (branch === "categorize-function") {
      const pool = shuffle(rng, ITEMS).slice(0, 8);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const items = pool.map((it, i) => ({ id: `c-${i}`, label: it.sentence(name, place).replace("___", it.prep.toUpperCase()) }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((it, i) => (correctBucket[`c-${i}`] = it.category));
      return {
        kind: "categorize",
        prompt: "Sort these sentences by what the highlighted preposition shows: TIME, DIRECTION, AGENT, or INSTRUMENT.",
        items,
        buckets: [
          { id: "time", label: "Time" },
          { id: "direction", label: "Direction/Place" },
          { id: "agent", label: "Agent (Who)" },
          { id: "instrument", label: "Instrument (With What)" },
        ],
        correctBucket,
        hint: "Time = when; direction/place = where; agent = who performed the action; instrument = what tool or means was used.",
        explanation: "Prepositions of time answer 'when', direction/place answer 'where', agent answers 'by whom', and instrument answers 'with what'.",
      };
    }

    if (branch === "click-match") {
      const pool = shuffle(rng, [
        { prep: "since", category: "time" as PrepCategory },
        { prep: "during", category: "time" as PrepCategory },
        { prep: "across", category: "direction" as PrepCategory },
        { prep: "between", category: "direction" as PrepCategory },
        { prep: "by", category: "agent" as PrepCategory },
        { prep: "with", category: "instrument" as PrepCategory },
      ]);
      const tokens = shuffle(rng, pool.map((p) => ({ id: p.prep + p.category, label: p.prep })));
      const targets = shuffle(rng, pool.map((p) => ({ id: p.prep + p.category, label: CATEGORY_LABEL[p.category] })));
      const correctMap: Record<string, string> = {};
      for (const p of pool) correctMap[p.prep + p.category] = p.prep + p.category;
      return {
        kind: "click-match",
        prompt: "Match each preposition to the type of relationship it shows.",
        tokens,
        targets,
        correctMap,
        hint: "Ask yourself: does this word show when, where, by whom, or with what?",
        explanation: pool.map((p) => `"${p.prep}" shows ${CATEGORY_LABEL[p.category].toLowerCase()}.`).join(" "),
      };
    }

    const item = randChoice(rng, ITEMS);
    const name = randChoice(rng, KENYAN_NAMES);
    const place = randChoice(rng, KENYAN_PLACES);
    const full = item.sentence(name, place).replace("___", item.prep).replace(".", "");
    const words = full.trim().split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct sentence with a preposition.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `"${item.prep}" shows ${CATEGORY_LABEL[item.category].toLowerCase()} in this sentence.`,
      explanation: `The correct sentence is: "${cap(full.trim())}."`,
    };
  },
};
