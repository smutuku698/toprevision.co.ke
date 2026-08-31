import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const METHODS = [
  { id: "boiling", label: "Boiling milk", product: "milk", detail: "Heating milk to a high temperature kills most bacteria and extends how long it stays fresh" },
  { id: "refrigeration-milk", label: "Refrigerating milk", product: "milk", detail: "Keeping milk cold slows bacterial growth, keeping it fresh for longer" },
  { id: "fermentation", label: "Fermenting milk", product: "milk", detail: "Allowing milk to sour naturally (e.g. into mursik or maziwa lala) using beneficial bacteria that stop harmful ones from growing" },
  { id: "pasteurization", label: "Pasteurizing milk", product: "milk", detail: "Heating milk to a controlled temperature for a set time to kill harmful bacteria without fully cooking it" },
  { id: "salting", label: "Salting meat", product: "meat", detail: "Rubbing or soaking meat in salt to draw out moisture, which bacteria need to grow" },
  { id: "drying-meat", label: "Sun-drying meat", product: "meat", detail: "Removing moisture from meat by drying it in the sun, making it harder for bacteria to survive" },
  { id: "smoking", label: "Smoking meat", product: "meat", detail: "Exposing meat to smoke, which dries it and adds compounds that slow bacterial growth" },
  { id: "refrigeration-meat", label: "Refrigerating/freezing meat", product: "meat", detail: "Keeping meat cold or frozen slows down or stops the bacteria that cause spoilage" },
] as const;

const IMPORTANCE_FILLS = [
  { before: "Preserving milk and meat at household level prolongs their ", after: " so less food is wasted.", correctAnswer: "shelf life" },
  { before: "A key reason for preserving animal products is to prevent food ", after: " caused by bacteria growing in unpreserved food.", correctAnswer: "poisoning" },
  { before: "Preserving meat and milk lets a household buy or produce food in ", after: " and use it gradually over time.", correctAnswer: "bulk" },
  { before: "Preserving animal products reduces how much food is thrown away, saving the household ", after: ".", correctAnswer: "money" },
] as const;

const METHOD_LABEL: Record<string, string> = { milk: "Method for preserving milk", meat: "Method for preserving meat" };

const METHOD_MATCH_PROMPTS = [
  "Match each preservation method to how it works.",
  "Pair each preservation method below with the explanation of how it works.",
  "Connect each method of preserving milk or meat to how it actually works.",
  "Match each preservation technique to its correct description.",
  "Link each method to what it does to slow or stop spoilage.",
  "Match each preservation method to the statement explaining it.",
];

const PRODUCT_SORT_PROMPTS = [
  "Sort each method as mainly used to preserve milk or mainly used to preserve meat.",
  "Decide whether each method below mainly preserves milk or meat, and sort it.",
  "Group these preservation methods under milk or meat.",
  "Read each method and sort it as mainly for milk or mainly for meat.",
  "Sort these preservation techniques into milk preservation or meat preservation.",
  "Place each method into the correct bucket — mainly for milk, or mainly for meat.",
];

const SHELF_LIFE_CHART_PROMPTS = [
  "This chart shows how many days meat stays safe to eat under three conditions. Which condition keeps meat safe the longest?",
  "The bar chart compares how many days meat stays safe under three conditions. Which condition lasts the longest?",
  "Look at the chart of meat's safe shelf life under three conditions. Which one keeps it safe for the most days?",
  "This chart shows shelf life (in days) for meat under three different conditions. Which condition performed best?",
  "Based on the days-safe-to-eat shown for three conditions, which condition preserved the meat longest?",
  "The chart compares how long meat stays safe under three conditions. Which condition gives the longest shelf life?",
];

const SCENARIO_BEST_PROMPTS = [
  (scenario: string) => `${scenario}. Which preservation method suits this situation best?`,
  (scenario: string) => `Consider this situation: ${scenario}. Which preservation method fits it best?`,
  (scenario: string) => `${scenario}. Which method of preservation would work best here?`,
  (scenario: string) => `Here's the situation: ${scenario}. Which preservation method is the most suitable choice?`,
  (scenario: string) => `${scenario}. Given this, which preservation method makes the most sense?`,
];

const IMPORTANCE_FILL_PROMPTS = [
  "Fill in the missing word(s).",
  "Complete the sentence with the missing word(s).",
  "Fill in the blank to complete the statement.",
  "Supply the missing word(s) to finish the sentence.",
  "What word(s) belong in the blank?",
];

export const preservingAnimalProducts: Skill = {
  id: "g8-ag-f-preserving-animal-products",
  code: "F.5",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-food-production",
  grade: 8,
  title: "Preserving Animal Products",
  description: "Methods of preserving milk and meat at household level, why preservation matters, and comparing how long different methods extend shelf life.",
  generate(rng) {
    const branch = randChoice(rng, ["method-match", "product-sort", "shelf-life-chart", "scenario-best", "importance-fill"] as const);

    if (branch === "method-match") {
      const chosen = shuffle(rng, METHODS).slice(0, randInt(rng, 5, 6));
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.detail })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, METHOD_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Preservation methods work by either killing bacteria, slowing them down, or removing what they need to grow.",
        explanation: chosen.map((m) => `${m.label}: ${m.detail}.`).join(" "),
      };
    }

    if (branch === "product-sort") {
      const chosen = shuffle(rng, METHODS);
      const buckets = [
        { id: "milk", label: METHOD_LABEL.milk },
        { id: "meat", label: METHOD_LABEL.meat },
      ];
      const items = chosen.map((m) => ({ id: m.id, label: m.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m) => (correctBucket[m.id] = m.product));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PRODUCT_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Milk methods usually involve heat or fermentation of a liquid; meat methods usually involve removing or drying out moisture from a solid.",
        explanation: chosen.map((m) => `${m.label} preserves ${m.product}.`).join(" "),
      };
    }

    if (branch === "shelf-life-chart") {
      const unpreserved = randInt(rng, 1, 2);
      const salted = randInt(rng, 10, 20);
      const dried = randInt(rng, 25, 45);
      const data = shuffle(rng, [
        { label: "Fresh, unpreserved meat", value: unpreserved },
        { label: "Salted meat", value: salted },
        { label: "Sun-dried meat", value: dried },
      ]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, SHELF_LIFE_CHART_PROMPTS),
        visual: { type: "bar-chart", data },
        choices: ["Fresh, unpreserved meat", "Salted meat", "Sun-dried meat"],
        correctIndex: ["Fresh, unpreserved meat", "Salted meat", "Sun-dried meat"].indexOf("Sun-dried meat"),
        hint: "The tallest bar keeps the meat safe for the most days.",
        explanation: `Sun-dried meat lasts about ${dried} days, compared to ${salted} days salted and only ${unpreserved} day(s) unpreserved — removing the most moisture extends shelf life the most.`,
      };
    }

    if (branch === "scenario-best") {
      const noElectricity = randChoice(rng, [true, false]);
      const product = randChoice(rng, ["milk", "meat"] as const);
      const options = METHODS.filter((m) => m.product === product);
      let correct;
      let scenario;
      if (product === "milk") {
        correct = noElectricity ? METHODS.find((m) => m.id === "fermentation")! : METHODS.find((m) => m.id === "refrigeration-milk")!;
        scenario = noElectricity
          ? "A rural household with no electricity or fridge wants to preserve surplus milk for later use"
          : "A household with a working fridge wants the simplest way to keep milk fresh for a few extra days";
      } else {
        correct = noElectricity ? METHODS.find((m) => m.id === "salting")! : METHODS.find((m) => m.id === "refrigeration-meat")!;
        scenario = noElectricity
          ? "A household with no electricity needs to preserve meat from a recent slaughter for weeks"
          : "A household with a working freezer wants to preserve fresh meat for later use";
      }
      const others = options.filter((m) => m.id !== correct.id).map((m) => m.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct.label, others, Math.min(2, others.length));
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, SCENARIO_BEST_PROMPTS)(scenario),
        choices,
        correctIndex,
        hint: "Consider what resources (electricity, sun, salt) the household actually has available.",
        explanation: `${correct.label}: ${correct.detail}.`,
      };
    }

    // importance-fill
    const entry = randChoice(rng, IMPORTANCE_FILLS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, IMPORTANCE_FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Think about food safety, waste, and money.",
      explanation: `${entry.before}${entry.correctAnswer}${entry.after}`,
    };
  },
};
