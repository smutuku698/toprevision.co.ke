import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRODUCTS = [
  { id: "cassava", label: "Cassava", processed: "Dried cassava chips or flour", method: "drying" },
  { id: "groundnuts", label: "Groundnuts", processed: "Roasted groundnuts or peanut butter", method: "frying" },
  { id: "simsim", label: "Simsim (sesame)", processed: "Roasted simsim bars or simsim oil", method: "frying" },
  { id: "sweet-potato", label: "Sweet potatoes", processed: "Dried sweet potato crisps", method: "drying" },
  { id: "pumpkin", label: "Pumpkin", processed: "Dried pumpkin flour", method: "drying" },
] as const;

const METHOD_ITEMS = [
  { text: "Slicing cassava thinly and leaving it in the sun until it hardens", bucket: "drying" },
  { text: "Cooking groundnuts in a little oil over heat until golden", bucket: "frying" },
  { text: "Slicing sweet potatoes and spreading them out to dehydrate in the sun", bucket: "drying" },
  { text: "Cooking simsim seeds in hot oil until they turn golden and crunchy", bucket: "frying" },
] as const;
const METHOD_LABEL: Record<string, string> = { drying: "Value addition by drying", frying: "Value addition by frying" };

const REASON_SCENARIOS = [
  {
    q: "A farmer has a surplus of fresh cassava that will spoil within a week if left unprocessed. Why should she consider adding value to it, such as drying it into flour?",
    correct: "Processing extends the produce's storage life and can increase its monetary value compared to selling it raw",
    distractors: [
      "Adding value always reduces both the storage life and the value of the produce",
      "Fresh produce always sells for more than any processed form",
      "Value addition has no real effect on how long produce can be stored",
    ],
  },
  {
    q: "Comparing raw groundnuts to roasted groundnuts sold at the market, what is generally true?",
    correct: "Roasted groundnuts are usually processed and packaged, so they can be sold at a higher price than raw groundnuts",
    distractors: [
      "Raw groundnuts always sell for more money than roasted groundnuts",
      "Processing groundnuts never changes their selling price",
      "Roasting groundnuts always decreases their market value",
    ],
  },
];

const VALUE_STEPS = [
  { id: "harvest", label: "Harvest the crop produce at the right maturity" },
  { id: "clean", label: "Clean and sort the produce" },
  { id: "process", label: "Process it using a method such as drying or frying" },
  { id: "package", label: "Package the processed produce appropriately" },
  { id: "sell", label: "Sell or store the value-added produce" },
];

const FILL_ITEMS = [
  { before: "Processing raw produce, such as drying or frying it, to increase its worth or storage life is called ", after: ".", correctAnswer: "value addition" },
];

const MATCH_PROMPTS = [
  "Match each raw crop produce to a value-added product it can be turned into.",
  "Pair each raw produce with the processed product it becomes.",
  "Connect each crop to the value-added form it can be processed into.",
  "Match each produce below to the product it can be turned into.",
  "Link each raw crop produce to its correct processed form.",
  "Match each crop to the value-added product it yields.",
];

const SORT_PROMPTS = [
  "Sort each processing description by the value-addition method it describes.",
  "Decide which method each description below uses, and sort it there.",
  "Group these processing descriptions under drying or frying.",
  "Sort each description into the correct value-addition bucket.",
  "Read each processing description and place it under the method it describes.",
  "Classify each description as an example of drying or frying.",
];

const VALUE_COMPARE_PROMPTS = (rawLabel: string, processed: string, rawPrice: number, processedPrice: number) => [
  `Raw ${rawLabel} sells for KSh ${rawPrice} per kg, while its processed form (${processed}) sells for KSh ${processedPrice} per kg (shown below). How much extra value, in KSh per kg, does processing add?`,
  `A trader sells raw ${rawLabel} at KSh ${rawPrice} per kg and the processed form (${processed}) at KSh ${processedPrice} per kg (shown below). What is the extra value added per kg, in KSh?`,
  `Comparing prices (shown below): raw ${rawLabel} goes for KSh ${rawPrice} per kg, while ${processed} goes for KSh ${processedPrice} per kg. What is the value added per kg, in KSh?`,
  `Raw ${rawLabel} fetches KSh ${rawPrice} per kg at market, but once processed into ${processed} it fetches KSh ${processedPrice} per kg (shown below). Work out the value added, in KSh per kg.`,
  `The price per kg rises from KSh ${rawPrice} for raw ${rawLabel} to KSh ${processedPrice} for ${processed} (shown below). How much value, in KSh per kg, does processing add?`,
  `Using the prices shown below — raw ${rawLabel} at KSh ${rawPrice} per kg and ${processed} at KSh ${processedPrice} per kg — calculate the value added per kg in KSh.`,
];

const ORDER_PROMPTS = [
  "Arrange the steps for adding value to a crop produce, in the correct order.",
  "Put these value-addition steps into a sensible order.",
  "Sequence the steps for processing raw produce into a value-added product correctly.",
  "Arrange these actions into the order a careful processor would follow them.",
  "Order these value-addition tasks the way they should actually happen.",
  "Sort these steps into the order needed to add value to crop produce.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Complete the sentence with the correct term.",
  "Which term correctly completes this sentence?",
  "Supply the missing term to finish the sentence.",
  "Work out the missing term in this sentence.",
  "Type the term that correctly fills the gap.",
];

export const addingValueToCropProduce: Skill = {
  id: "g7-ag-p-adding-value-crop-produce",
  code: "P.3",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-production-techniques",
  grade: 7,
  title: "Adding Value to Crop Produce",
  description: "Adding value to crop produce such as cassava, groundnuts, simsim, sweet potatoes, and pumpkin using methods like drying and frying, and comparing raw and processed produce.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "value-compare", "reason", "order", "fill"] as const);
    const hint = "Value addition changes raw produce into a processed form that usually stores longer and can be sold for more.";

    if (branch === "match") {
      const chosen = shuffle(rng, PRODUCTS);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.processed })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `${p.label} → ${p.processed}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, METHOD_ITEMS);
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "drying", label: METHOD_LABEL.drying },
          { id: "frying", label: METHOD_LABEL.frying },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" — ${METHOD_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "value-compare") {
      const product = randChoice(rng, PRODUCTS);
      const rawPrice = randInt(rng, 20, 40);
      const processedPrice = rawPrice + randInt(rng, 30, 70);
      const increase = processedPrice - rawPrice;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, VALUE_COMPARE_PROMPTS(product.label.toLowerCase(), product.processed.toLowerCase(), rawPrice, processedPrice)),
        before: "Value added ≈ KSh",
        after: "per kg",
        correctAnswer: String(increase),
        inputMode: "numeric",
        visual: { type: "bar-chart", data: [{ label: "Raw", value: rawPrice }, { label: "Processed", value: processedPrice }] },
        hint: "Subtract the raw price from the processed price.",
        explanation: `Value added $= ${processedPrice} - ${rawPrice} = ${increase}$ KSh per kg.`,
      };
    }

    if (branch === "reason") {
      const entry = randChoice(rng, REASON_SCENARIOS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, VALUE_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: VALUE_STEPS.map((s) => s.id),
        hint: "Produce must be harvested and cleaned before it can be processed, packaged, and sold.",
        explanation: VALUE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
