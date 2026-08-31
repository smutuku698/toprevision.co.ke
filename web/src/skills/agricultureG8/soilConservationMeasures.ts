import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const METHODS = [
  { id: "terracing", label: "Terracing", detail: "Cutting a steep slope into a series of flat steps to slow water flow and reduce soil loss" },
  { id: "contour-ploughing", label: "Contour ploughing", detail: "Ploughing and planting across the slope, along the contour, instead of up and down it" },
  { id: "cover-cropping", label: "Cover cropping", detail: "Planting a fast-growing crop to cover bare soil and protect it from rain and wind" },
  { id: "crop-rotation", label: "Crop rotation", detail: "Growing different crops in sequence on the same land to keep the soil structure and fertility healthy" },
  { id: "agroforestry", label: "Agroforestry", detail: "Planting trees together with crops so tree roots bind the soil and reduce erosion" },
  { id: "mulching", label: "Mulching", detail: "Covering the soil surface with straw, grass, or crop residue to reduce the impact of rain and evaporation" },
  { id: "strip-cropping", label: "Strip cropping", detail: "Planting crops in alternating strips across a slope so one strip's roots slow runoff from the next" },
  { id: "gabions", label: "Gabions", detail: "Wire cages filled with stones placed across a gully to slow water and trap eroding soil" },
] as const;

const SITUATIONS = [
  { text: "A steep hillside farm losing topsoil every rainy season", best: "terracing" },
  { text: "A gently sloping field where ploughing up and down the slope channels water straight down it", best: "contour-ploughing" },
  { text: "Bare soil left exposed between planting seasons", best: "cover-cropping" },
  { text: "A field that has grown the same crop for many seasons and is losing fertility", best: "crop-rotation" },
  { text: "An open field with strong winds blowing loose topsoil away", best: "agroforestry" },
  { text: "Dry soil around growing vegetables losing moisture quickly in the sun", best: "mulching" },
  { text: "A gully that keeps widening every time it rains heavily", best: "gabions" },
] as const;

const CAUSE_ITEMS = [
  { text: "Water erosion — soil washed away by running rainwater", bucket: "water" },
  { text: "Wind erosion — loose, dry topsoil blown away by strong wind", bucket: "wind" },
  { text: "Gully erosion — deep channels cut into the land by concentrated runoff", bucket: "water" },
  { text: "Sheet erosion — a thin, even layer of topsoil washed off a slope", bucket: "water" },
  { text: "Bare, dry, ploughed soil with no vegetation cover in an open, breezy area", bucket: "wind" },
] as const;
const CAUSE_LABEL: Record<string, string> = { water: "Mainly a water erosion problem", wind: "Mainly a wind erosion problem" };

const METHOD_MATCH_PROMPTS = [
  "Match each soil conservation method to what it involves.",
  "Match each measure below to the description of what it actually does.",
  "Pair each soil conservation method with its correct description.",
  "Connect each conservation method to how it works in the field.",
  "Link each method to the explanation that matches it.",
  "Match each conservation technique to what it involves on the ground.",
];

const EROSION_SORT_PROMPTS = [
  "Sort each description as mainly a water erosion problem or a wind erosion problem.",
  "Decide whether each description below is mainly caused by water or by wind, and sort it.",
  "Group these erosion descriptions under water erosion or wind erosion.",
  "Read each description and sort it under the type of erosion it mainly shows.",
  "Sort these erosion examples into water erosion or wind erosion.",
  "Place each description into the correct erosion category — water or wind.",
];

const SCENARIO_BEST_PROMPTS: ((s: string) => string)[] = [
  (s) => `A farmer describes this situation: "${s}." Which soil conservation measure would best address it?`,
  (s) => `Consider this situation on a farm: "${s}." Which conservation measure fits it best?`,
  (s) => `A farmer is dealing with this problem: "${s}." Which measure would solve it most directly?`,
  (s) => `Here's what's happening on one farm: "${s}." Which soil conservation method is the best response?`,
  (s) => `"${s}." Given this situation, which conservation measure should the farmer choose?`,
  (s) => `A farm is facing this challenge: "${s}." Which method addresses it most effectively?`,
];

const CHART_COMPARE_PROMPTS = [
  "This chart shows tonnes of topsoil lost per hectare per season under three conditions on the same slope. Which condition lost the least soil?",
  "The bar chart compares topsoil lost (tonnes/hectare/season) under three conditions on the same slope. Which condition lost the least?",
  "Look at the chart of topsoil loss under three conditions on the same slope. Which one lost the least soil overall?",
  "This chart compares soil loss on the same slope under three different conditions. Which condition kept the most soil in place?",
  "Based on the topsoil loss shown in the chart for three conditions on one slope, which condition performed best?",
  "The chart shows how much topsoil was lost per hectare each season under three conditions. Which condition had the smallest loss?",
];

const CARE_ORDER_PROMPTS = [
  "Arrange the correct order for planning and maintaining soil conservation measures on a farm.",
  "Put these steps for planning and maintaining soil conservation measures into the right order.",
  "Sequence the process of choosing and maintaining soil conservation measures correctly.",
  "Arrange these steps in the order a farmer should follow when setting up soil conservation.",
  "Order these actions the way a farmer would carry them out when conserving soil.",
  "Sort these steps into the order they should happen when planning soil conservation.",
];

const CARE_STEPS = [
  { id: "assess", label: "Walk the field and identify where soil is being lost fastest" },
  { id: "choose", label: "Choose conservation measures suited to the slope and rainfall pattern" },
  { id: "construct", label: "Construct or plant the chosen measures, such as terraces or contour lines" },
  { id: "maintain", label: "Maintain the measures regularly, repairing breaks after heavy rain" },
  { id: "monitor", label: "Monitor the land over seasons to check whether soil loss has reduced" },
];

export const soilConservationMeasures: Skill = {
  id: "g8-ag-c-soil-conservation-measures",
  code: "C.1",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-conservation",
  grade: 8,
  title: "Soil Conservation Measures",
  description: "Methods of conserving soil in an agricultural environment, why they matter, and which measure suits a given situation.",
  generate(rng) {
    const branch = randChoice(rng, ["method-match", "erosion-sort", "scenario-best", "chart-compare", "care-order"] as const);

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
        hint: "Think about what physically stops soil from being carried away — a barrier, a cover, or a change in planting pattern.",
        explanation: chosen.map((m) => `${m.label}: ${m.detail}.`).join(" "),
      };
    }

    if (branch === "erosion-sort") {
      const chosen = shuffle(rng, CAUSE_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: CAUSE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, EROSION_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Water erosion involves running water; wind erosion involves dry, loose, exposed soil.",
        explanation: chosen.map((c) => `"${c.text}" — ${CAUSE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario-best") {
      const s = randChoice(rng, SITUATIONS);
      const correct = METHODS.find((m) => m.id === s.best)!;
      const others = METHODS.filter((m) => m.id !== s.best).map((m) => m.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, SCENARIO_BEST_PROMPTS)(s.text),
        choices,
        correctIndex,
        hint: "Match the specific cause of soil loss described to the measure designed for that exact problem.",
        explanation: `${correct.label} is the best fit: ${correct.detail}.`,
      };
    }

    if (branch === "chart-compare") {
      const baselineLoss = randInt(rng, 18, 30);
      const methodA = randChoice(rng, METHODS);
      const methodB = randChoice(rng, METHODS.filter((m) => m.id !== methodA.id));
      const lossA = randInt(rng, 4, 10);
      const lossB = randInt(rng, 11, 17);
      const data = shuffle(rng, [
        { label: "No conservation", value: baselineLoss },
        { label: methodA.label, value: lossA },
        { label: methodB.label, value: lossB },
      ]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, CHART_COMPARE_PROMPTS),
        visual: { type: "bar-chart", data },
        choices: ["No conservation", methodA.label, methodB.label],
        correctIndex: ["No conservation", methodA.label, methodB.label].indexOf(lossA < lossB ? methodA.label : methodB.label),
        hint: "The shortest bar lost the least soil.",
        explanation: `${lossA < lossB ? methodA.label : methodB.label} lost the least soil (${Math.min(lossA, lossB)} tonnes/ha), compared to ${baselineLoss} tonnes/ha with no conservation measure at all — showing why conservation measures matter.`,
      };
    }

    // care-order
    const items = shuffle(rng, CARE_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, CARE_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: CARE_STEPS.map((s) => s.id),
      hint: "You must understand the problem before choosing a fix, and a fix needs upkeep after it's built.",
      explanation: CARE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
