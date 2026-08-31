import { randChoice, randInt, roundTo, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const METHODS = [
  { id: "roof-catchment", label: "Roof catchment", detail: "Collecting rainwater that runs off a roof through gutters into a storage tank" },
  { id: "water-pans", label: "Water pans", detail: "Digging a shallow, wide basin to collect and hold surface runoff for livestock and irrigation" },
  { id: "check-dams", label: "Check dams", detail: "Small barriers built across a seasonal stream to slow and pool water for later use" },
  { id: "underground-tanks", label: "Underground tanks", detail: "Storing harvested water below ground level, where it stays cool and loses less water to evaporation" },
  { id: "first-flush-diverter", label: "First-flush diverter", detail: "A fitting that directs the dirty first rainfall off a roof away from the storage tank" },
] as const;

const STORAGE_ITEMS = [
  { text: "A raised plastic tank fed by roof gutters", bucket: "domestic" },
  { text: "A wide, shallow pan dug in an open field for cattle to drink from", bucket: "farm" },
  { text: "A small check dam built across a seasonal stream on the farm", bucket: "farm" },
  { text: "An underground ferrocement tank connected to the kitchen tap", bucket: "domestic" },
  { text: "A masonry tank at the corner of the house collecting roof runoff for household use", bucket: "domestic" },
] as const;
const STORAGE_LABEL: Record<string, string> = { domestic: "Mainly for domestic (household) use", farm: "Mainly for farm/livestock use" };

const HARVEST_STEPS = [
  { id: "clean-roof", label: "Keep the roof and gutters clean so debris does not enter the system" },
  { id: "first-flush", label: "Let the first, dirtiest rainfall run to waste through a first-flush diverter" },
  { id: "channel", label: "Channel the cleaner rainfall through gutters and downpipes into the tank" },
  { id: "filter", label: "Pass the water through a simple filter or mesh before it enters storage" },
  { id: "store-cover", label: "Store the water in a covered tank to keep out dust, insects, and sunlight" },
];

const METHOD_MATCH_PROMPTS = [
  "Match each water harvesting or storage method to what it involves.",
  "Pair each method below with what it actually involves.",
  "Connect each water harvesting or storage method to its correct description.",
  "Match each method to the explanation of how it works.",
  "Link each water harvesting or storage technique to what it does.",
  "Match each method to the statement that describes it.",
];

const USE_SORT_PROMPTS = [
  "Sort each water storage example as mainly for domestic use or mainly for farm/livestock use.",
  "Decide whether each example below is mainly domestic or farm/livestock use, and sort it.",
  "Group these water storage examples under domestic use or farm/livestock use.",
  "Read each example and sort it as mainly domestic or mainly farm/livestock use.",
  "Sort these storage examples into domestic use or farm/livestock use.",
  "Place each example into the correct bucket — mainly domestic, or mainly farm/livestock.",
];

const VOLUME_CALC_PROMPTS = [
  (length: number, width: number, rainfallMm: number, runoffCoefficient: number) =>
    `A house roof measures ${length} m by ${width} m (shown below). During a storm, ${rainfallMm} mm of rain falls, and the roof's runoff coefficient (the fraction of rain that actually reaches the tank, after losses) is ${runoffCoefficient}. Using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient, how many litres of water can the roof harvest?`,
  (length: number, width: number, rainfallMm: number, runoffCoefficient: number) =>
    `A roof ${length} m by ${width} m (shown below) receives ${rainfallMm} mm of rainfall in a storm, with a runoff coefficient of ${runoffCoefficient}. Using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient, find the litres harvested.`,
  (length: number, width: number, rainfallMm: number, runoffCoefficient: number) =>
    `Given a roof measuring ${length} m by ${width} m (shown below), ${rainfallMm} mm of rain, and a runoff coefficient of ${runoffCoefficient}, calculate the litres of water harvested using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient.`,
  (length: number, width: number, rainfallMm: number, runoffCoefficient: number) =>
    `A ${length} m by ${width} m roof (shown below) catches ${rainfallMm} mm of rain with a runoff coefficient of ${runoffCoefficient}. How many litres does the roof harvest? Use Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient.`,
  (length: number, width: number, rainfallMm: number, runoffCoefficient: number) =>
    `Working out harvested water: a roof ${length} m by ${width} m (shown below), ${rainfallMm} mm of rainfall, runoff coefficient ${runoffCoefficient}. Find the litres collected using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient.`,
];

const REVERSE_AREA_PROMPTS = [
  (runoffCoefficient: number, litres: number, rainfallMm: number) =>
    `A roof with a runoff coefficient of ${runoffCoefficient} harvested about ${litres} litres of water from ${rainfallMm} mm of rainfall. Using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient, find the roof's area in m².`,
  (runoffCoefficient: number, litres: number, rainfallMm: number) =>
    `From ${rainfallMm} mm of rain and a runoff coefficient of ${runoffCoefficient}, a roof collected about ${litres} litres. Using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient, work out the roof's area in m².`,
  (runoffCoefficient: number, litres: number, rainfallMm: number) =>
    `A roof harvested ${litres} litres from ${rainfallMm} mm of rain, with a runoff coefficient of ${runoffCoefficient}. Find its area in m² using Volume (litres) = Roof area (m²) × Rainfall (mm) × Runoff coefficient.`,
  (runoffCoefficient: number, litres: number, rainfallMm: number) =>
    `Given ${litres} litres harvested from ${rainfallMm} mm of rainfall at a runoff coefficient of ${runoffCoefficient}, calculate the roof area in m².`,
  (runoffCoefficient: number, litres: number, rainfallMm: number) =>
    `A rainstorm of ${rainfallMm} mm produced ${litres} litres from a roof with runoff coefficient ${runoffCoefficient}. What is the roof's area, in m²?`,
];

const HARVEST_ORDER_PROMPTS = [
  "Arrange the correct order for harvesting clean rainwater from a roof into a storage tank.",
  "Put these steps for harvesting rainwater from a roof into the right order.",
  "Sequence the process of collecting clean rainwater into a storage tank correctly.",
  "Arrange these steps in the order a household should follow to harvest rainwater.",
  "Order these actions the way someone would carry them out when harvesting roof water.",
  "Sort these steps into the order they should happen when harvesting rainwater into storage.",
];

export const waterHarvestingStorage: Skill = {
  id: "g8-ag-c-water-harvesting-storage",
  code: "C.2",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-conservation",
  grade: 8,
  title: "Water Harvesting and Storage",
  description: "Ways of harvesting and storing water for domestic use, storage structures, and the roof-catchment calculation used to estimate how much water a roof can collect.",
  generate(rng) {
    const branch = randChoice(rng, ["method-match", "use-sort", "volume-calc", "reverse-area", "harvest-order"] as const);

    if (branch === "method-match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.detail })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, METHOD_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Some methods are about collecting water, others are about keeping it clean or reducing loss once stored.",
        explanation: METHODS.map((m) => `${m.label}: ${m.detail}.`).join(" "),
      };
    }

    if (branch === "use-sort") {
      const chosen = shuffle(rng, STORAGE_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: STORAGE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, USE_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Think about who or what drinks or uses the water at the end — the household, or the animals and crops.",
        explanation: chosen.map((c) => `"${c.text}" — ${STORAGE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "volume-calc") {
      const length = randInt(rng, 6, 14);
      const width = randInt(rng, 4, 9);
      const roofArea = length * width;
      const rainfallMm = randInt(rng, 10, 45);
      const runoffCoefficient = randChoice(rng, [0.7, 0.8, 0.9] as const);
      const litres = roundTo(roofArea * rainfallMm * runoffCoefficient, 0);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, VOLUME_CALC_PROMPTS)(length, width, rainfallMm, runoffCoefficient),
        before: "Harvested water ≈",
        after: "litres",
        correctAnswer: String(litres),
        inputMode: "numeric",
        visual: { type: "rectangle", width: length, height: width, labelWidth: `${length} m`, labelHeight: `${width} m` },
        hint: "First find the roof area (length × width), then multiply by the rainfall and the runoff coefficient.",
        explanation: `Roof area $= ${length} \\times ${width} = ${roofArea}$ m². Harvested water $= ${roofArea} \\times ${rainfallMm} \\times ${runoffCoefficient} = ${litres}$ litres.`,
      };
    }

    if (branch === "reverse-area") {
      const roofArea = randInt(rng, 30, 90);
      const rainfallMm = randInt(rng, 12, 40);
      const runoffCoefficient = randChoice(rng, [0.7, 0.8, 0.9] as const);
      const litres = Math.round(roofArea * rainfallMm * runoffCoefficient);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, REVERSE_AREA_PROMPTS)(runoffCoefficient, litres, rainfallMm),
        before: "Roof area ≈",
        after: "m²",
        correctAnswer: String(roofArea),
        inputMode: "numeric",
        hint: "Rearrange the formula: Roof area = Volume ÷ (Rainfall × Runoff coefficient).",
        explanation: `Roof area $= ${litres} \\div (${rainfallMm} \\times ${runoffCoefficient}) = ${roofArea}$ m².`,
      };
    }

    // harvest-order
    const items = shuffle(rng, HARVEST_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, HARVEST_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: HARVEST_STEPS.map((s) => s.id),
      hint: "The dirtiest water needs to be diverted away before clean water is filtered and stored.",
      explanation: HARVEST_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
