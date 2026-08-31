import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ROLES = [
  { id: "fresh-veg", label: "Fresh vegetables year-round", detail: "A kitchen garden lets a household harvest vegetables close to the kitchen whenever needed, instead of buying them" },
  { id: "save-money", label: "Reduces household food spending", detail: "Growing vegetables at home cuts down how much a family spends buying them at the market" },
  { id: "nutrition", label: "Improves household nutrition", detail: "Easy access to fresh vegetables encourages a family to eat a more balanced diet" },
  { id: "surplus-income", label: "A source of extra income", detail: "Surplus vegetables beyond what the household needs can be sold to neighbours or at a local market" },
  { id: "waste-reuse", label: "Reuses household waste", detail: "Kitchen and garden waste can be composted and returned to the garden as manure" },
] as const;

const SITE_ITEMS = [
  { text: "A spot close to the kitchen door for easy daily access", bucket: "good" },
  { text: "Land that receives good sunlight for most of the day", bucket: "good" },
  { text: "Soil that drains well after rain instead of waterlogging", bucket: "good" },
  { text: "A spot near a water source for easy watering", bucket: "good" },
  { text: "A shaded corner permanently blocked from sunlight by a wall", bucket: "poor" },
  { text: "Low ground where rainwater always collects and stagnates", bucket: "poor" },
  { text: "Land far from the house that is hard to visit and monitor daily", bucket: "poor" },
] as const;
const SITE_LABEL: Record<string, string> = { good: "Good site for a kitchen garden", poor: "Poor site for a kitchen garden" };

const ROLE_MATCH_PROMPTS = [
  "Match each role of a kitchen/backyard garden to what it means for the household.",
  "Pair each garden role below with what it actually gives the household.",
  "Connect each benefit of a kitchen garden to its explanation.",
  "Match each role of a home garden to the correct description.",
  "Link each way a kitchen garden helps a household to what it means in practice.",
  "Match each garden benefit to the statement that explains it.",
];

const SITE_SORT_PROMPTS = [
  "Sort each description as a good or poor site for a kitchen garden.",
  "Decide whether each spot described is good or poor for a kitchen garden, and sort it.",
  "Group these site descriptions under good site or poor site for a kitchen garden.",
  "Read each description and sort it as a good or poor location for growing vegetables at home.",
  "Sort these possible garden locations into good site or poor site.",
  "Place each description into the correct bucket — a good garden site, or a poor one.",
];

const SPACING_CALC_PROMPTS = [
  (bedLength: number, bedWidth: number, spacing: number) =>
    `A kitchen garden bed measures ${bedLength} m by ${bedWidth} m (shown below). Seedlings are planted ${spacing} m apart in each direction, including along the edges. How many seedlings fit in the bed in total (rows × seedlings per row)?`,
  (bedLength: number, bedWidth: number, spacing: number) =>
    `A gardener lays out a bed ${bedLength} m by ${bedWidth} m (shown below) and plants seedlings ${spacing} m apart in every direction, including along the edges. What is the total number of seedlings that fit?`,
  (bedLength: number, bedWidth: number, spacing: number) =>
    `Seedlings are spaced ${spacing} m apart in both directions, including at the edges, across a bed measuring ${bedLength} m by ${bedWidth} m (shown below). Find the total number of seedlings that fit.`,
  (bedLength: number, bedWidth: number, spacing: number) =>
    `A ${bedLength} m by ${bedWidth} m garden bed (shown below) is planted with seedlings ${spacing} m apart in both directions, edges included. How many seedlings fit altogether?`,
  (bedLength: number, bedWidth: number, spacing: number) =>
    `Working out planting capacity: a bed ${bedLength} m by ${bedWidth} m (shown below) takes seedlings spaced ${spacing} m apart each way, including the edges. What's the total seedling count?`,
];

const ROLE_RECALL_PROMPTS = [
  (detail: string) => `Which role of a kitchen garden matches: "${detail}"?`,
  (detail: string) => `"${detail}" — which garden role does this describe?`,
  (detail: string) => `Which benefit of a kitchen garden is being described here: "${detail}"?`,
  (detail: string) => `Read this description: "${detail}." Which role of a kitchen garden is it?`,
  (detail: string) => `This describes one role of a kitchen garden: "${detail}." Which one is it?`,
];

const ESTABLISH_ORDER_PROMPTS = [
  "Arrange the correct order for establishing a kitchen or backyard garden.",
  "Put these steps for setting up a kitchen or backyard garden into the right order.",
  "Sequence the process of establishing a kitchen or backyard garden correctly.",
  "Arrange these steps in the order a gardener should follow to set up a garden.",
  "Order these actions the way someone would carry them out when starting a kitchen garden.",
  "Sort these steps into the order they should happen when establishing a backyard garden.",
];

const ESTABLISH_STEPS = [
  { id: "select", label: "Select a suitable site close to the house with good sunlight and drainage" },
  { id: "clear", label: "Clear the site of weeds, stones, and debris" },
  { id: "prepare", label: "Dig and prepare the soil, adding manure or compost" },
  { id: "layout", label: "Mark out beds or rows with correct spacing for the crops chosen" },
  { id: "plant", label: "Plant seeds or seedlings at the recommended spacing and depth" },
  { id: "maintain", label: "Water, weed, and monitor the garden regularly" },
];

export const kitchenBackyardGardening: Skill = {
  id: "g8-ag-f-kitchen-backyard-gardening",
  code: "F.1",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-food-production",
  grade: 8,
  title: "Kitchen and Backyard Gardening",
  description: "The role of a kitchen and backyard garden in food production, choosing a good site, establishing a garden, and spacing calculations for planting beds.",
  generate(rng) {
    const branch = randChoice(rng, ["role-match", "site-sort", "spacing-calc", "role-recall", "establish-order"] as const);

    if (branch === "role-match") {
      const tokens = shuffle(rng, ROLES.map((r) => ({ id: r.id, label: r.label })));
      const targets = shuffle(rng, ROLES.map((r) => ({ id: r.id, label: r.detail })));
      const correctMap: Record<string, string> = {};
      for (const r of ROLES) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, ROLE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each role connects the garden to a different household benefit — food, money, health, or waste.",
        explanation: ROLES.map((r) => `${r.label}: ${r.detail}.`).join(" "),
      };
    }

    if (branch === "site-sort") {
      const chosen = shuffle(rng, SITE_ITEMS).slice(0, randInt(rng, 5, 7));
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: SITE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SITE_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "A good site is convenient, sunny, and well-drained.",
        explanation: chosen.map((c) => `"${c.text}" — ${SITE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "spacing-calc") {
      const bedLength = randInt(rng, 4, 10);
      const bedWidth = randInt(rng, 2, 5);
      const spacing = randChoice(rng, [0.5, 1] as const);
      const rows = Math.floor(bedWidth / spacing) + 1;
      const perRow = Math.floor(bedLength / spacing) + 1;
      const totalPlants = rows * perRow;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, SPACING_CALC_PROMPTS)(bedLength, bedWidth, spacing),
        before: "Total seedlings =",
        after: "",
        correctAnswer: String(totalPlants),
        inputMode: "numeric",
        visual: { type: "rectangle", width: bedLength, height: bedWidth, labelWidth: `${bedLength} m`, labelHeight: `${bedWidth} m` },
        hint: `Rows across the width = (width ÷ spacing) + 1. Seedlings per row = (length ÷ spacing) + 1. Multiply the two.`,
        explanation: `Rows $= (${bedWidth} \\div ${spacing}) + 1 = ${rows}$. Seedlings per row $= (${bedLength} \\div ${spacing}) + 1 = ${perRow}$. Total $= ${rows} \\times ${perRow} = ${totalPlants}$ seedlings.`,
      };
    }

    if (branch === "role-recall") {
      const r = randChoice(rng, ROLES);
      const others = ROLES.filter((x) => x.id !== r.id).map((x) => x.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, r.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, ROLE_RECALL_PROMPTS)(r.detail),
        choices,
        correctIndex,
        hint: "Match the explanation to the benefit it's describing.",
        explanation: `${r.label}: ${r.detail}.`,
      };
    }

    // establish-order
    const items = shuffle(rng, ESTABLISH_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, ESTABLISH_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: ESTABLISH_STEPS.map((s) => s.id),
      hint: "Choose the site before preparing it, and prepare the soil before planting.",
      explanation: ESTABLISH_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
