import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the steps of responsibly growing an income-generating crop in the correct order.",
  "Put these crop-growing steps into the correct order.",
  "Sequence the steps of growing a crop responsibly, from start to finish.",
  "Arrange these farming steps into the order a responsible farmer would follow them.",
  "Order the steps of growing an income-generating crop correctly.",
  "Sort these steps into the order they happen when growing a crop responsibly.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each action as responsible use of plants or misuse of plants.",
  "Decide whether each action is responsible use or misuse of plants, and sort it there.",
  "Group these actions under responsible use of plants or misuse of plants.",
  "Sort each action below into the correct category.",
  "Place each action into the bucket for responsible use or misuse.",
  "Read each action and sort it under responsible use or misuse of plants.",
];

const MATCH_PROMPTS = [
  "Match each term or Bible reference to its meaning.",
  "Pair each term or reference below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each Bible reference or term to what it means.",
  "Link each term below to its correct definition.",
  "Match each term or reference to the statement that explains it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about responsible plant use with the right word.",
];

const GROWING_STEPS = [
  { id: "s1", label: "Choose an income-generating crop suited to the land available" },
  { id: "s2", label: "Prepare the planting site by clearing and tilling the soil" },
  { id: "s3", label: "Plant the crop at the right time and spacing" },
  { id: "s4", label: "Water, weed, and protect the crop from pests as it grows" },
  { id: "s5", label: "Harvest the crop once it matures" },
  { id: "s6", label: "Sell or use the harvest, gaining economic benefit from the crop" },
];

const RESPONSIBLE_USE = [
  "Watering and weeding a crop consistently until it matures",
  "Rotating crops each season to keep the soil fertile",
  "Mulching around plants to conserve soil moisture",
  "Planting indigenous trees alongside crops (agroforestry) to protect the soil",
  "Harvesting only mature crops, leaving room for others to grow",
  "Using organic manure instead of overusing chemical fertiliser",
  "Protecting young seedlings from pests without destroying nearby wild plants",
  "Planting a variety of crops instead of relying on one alone",
  "Pruning fruit trees properly to keep them healthy and productive",
  "Replanting trees after clearing a small section of land for farming",
] as const;

const MISUSE_OF_PLANTS = [
  "Cutting down forests for charcoal without replanting any trees",
  "Overharvesting wild medicinal plants until they disappear from an area",
  "Burning large areas of vegetation to clear land (slash-and-burn) every season",
  "Growing the same crop on the same land every season until the soil is exhausted",
  "Overusing chemical fertiliser and pesticides until the soil and water are polluted",
  "Uprooting young trees for firewood before they mature",
  "Allowing livestock to overgraze newly planted crops",
  "Harvesting a crop before it has matured, wasting most of its yield",
  "Clearing riverbank vegetation for farming, causing soil erosion into the river",
  "Ignoring pest infestations until an entire crop is destroyed",
] as const;

const BASIS: { term: string; meaning: string }[] = [
  { term: "Genesis 1:29", meaning: "God gives every plant yielding seed to human beings as food" },
  { term: "Genesis 2:15", meaning: "The man is placed in the garden to till it and keep it" },
  { term: "Psalm 104:14", meaning: "God causes grass to grow for cattle and plants for people to cultivate, bringing food from the earth" },
  { term: "Cultivate", meaning: "To prepare and use land for growing crops" },
  { term: "Agroforestry", meaning: "Growing trees and crops together on the same land" },
  { term: "Crop rotation", meaning: "Changing the type of crop grown on a piece of land each season" },
  { term: "Soil fertility", meaning: "The soil's ability to support healthy plant growth" },
  { term: "Deforestation", meaning: "Clearing forests without replanting trees" },
  { term: "Food security", meaning: "Having reliable access to enough food for a community" },
  { term: "Horticulture", meaning: "Growing fruits, vegetables, and flowers, often for export income" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kericho", "Meru", "Murang'a", "Kiambu", "Nyandarua", "Kakamega", "Bungoma", "Kajiado", "Kitui", "Machakos", "Nandi", "Uasin Gishu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} has grown maize on the same plot every season for ten years, and yields keep falling. What responsible plant-use practice would most likely help?`,
      correct: "Rotating crops each season to restore the soil's fertility",
      wrong: ["Planting maize even more densely to increase yield", "Burning the field before every planting season", "Using no fertiliser or soil care at all"],
      explanation: "Growing the same crop repeatedly exhausts specific soil nutrients; rotating crops helps restore soil fertility, which Genesis 2:15's call to 'keep' the land reflects.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} wants quick firewood and clears a hillside of trees without replanting any. What is the biggest long-term problem with this?`,
    correct: "The exposed hillside becomes prone to soil erosion, and the habitat for plants and animals is lost",
    wrong: ["There is no real long-term problem since trees always grow back on their own", "It only affects the farmer's own land and nothing beyond it", "It immediately improves the fertility of the soil"],
    explanation: "Clearing trees without replanting removes the root systems that hold soil in place, leading to erosion — responsible use requires replanting after clearing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is choosing between growing tea, an established cash crop in ${place(rng)}, and continuing to plant only subsistence maize. What is a genuine economic benefit of adding an income-generating crop like tea?`,
      correct: "It provides a reliable source of income beyond food for the family's own use",
      wrong: ["It requires no care or maintenance once planted", "It guarantees the family will never need to grow food crops again", "It has no connection to Kenya's national economy at all"],
      explanation: "Cash crops like tea generate income for households and contribute to Kenya's export earnings, which is the economic-growth aspect of responsible plant use the design highlights.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} notices pests attacking a vegetable plot in ${place(rng)} and sprays a very large amount of chemical pesticide, far more than recommended. What is the responsible concern here?`,
    correct: "Overusing pesticide can harm the soil, nearby plants, and water sources, even as it kills the pests",
    wrong: ["More pesticide always means completely safe, faster results with no downsides", "Pesticide amount never affects the environment at all", "Only the exact pest targeted is ever affected by pesticide use"],
    explanation: "Excessive pesticide use pollutes soil and water and can harm beneficial insects and nearby plants — responsible use follows recommended amounts, not maximum amounts.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plants trees alongside food crops on the same farm instead of a single crop covering the whole plot. What is this practice called, and why does it help?`,
    correct: "Agroforestry — the trees protect the soil and provide extra benefits like shade, fruit, or firewood alongside the crop",
    wrong: ["Deforestation — it removes trees from the land entirely", "Overgrazing — it involves livestock eating all the vegetation", "Slash-and-burn — it involves burning land to clear it"],
    explanation: "Agroforestry combines trees and crops on the same land, protecting the soil while adding extra value — the opposite of practices that strip land of vegetation.",
  }),
  (rng) => ({
    prompt: `A community group in ${place(rng)} wants both quick charcoal income and long-term food security from their forested land. What is the wisest, most responsible balance?`,
    correct: "Harvest only a limited amount of wood sustainably and replant trees to keep the forest productive long-term",
    wrong: ["Clear the whole forest immediately for the largest possible one-time profit", "Avoid using the forest for any purpose at all, even sustainably", "Sell the land rather than manage the forest at all"],
    explanation: "Sustainable harvesting paired with replanting lets a community benefit from a forest's resources without destroying its long-term ability to keep producing them.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is harvesting bananas and picks every single bunch while some are still unripe, to sell quickly. What is the concern with this practice?`,
      correct: "Harvesting before crops mature wastes much of their potential yield and value",
      wrong: ["Harvesting early always produces a better-tasting crop", "There is no downside since bananas can never be harvested too early", "It has no effect on the amount of food or income produced"],
      explanation: "Harvesting before maturity reduces both the quantity and quality of the crop, wasting potential food and income — responsible use means harvesting at the right time.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s neighbour in ${place(rng)} lets goats graze freely through a newly planted vegetable garden. What is the responsible response?`,
    correct: "Fence or supervise the livestock so it does not destroy the young crops",
    wrong: ["Allow it to continue since goats cannot really be controlled", "Blame the crops for growing in the wrong place", "Ignore it since it will not affect the harvest at all"],
    explanation: "Protecting a growing crop from being destroyed by uncontrolled livestock is part of responsibly caring for what has been planted, as Genesis 2:15's 'keep it' implies.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is clearing land right up to the edge of a river to plant more crops. What is the environmental concern with this?`,
    correct: "Removing riverbank vegetation increases soil erosion into the river and can pollute the water",
    wrong: ["Planting right up to a riverbank always improves crop yield with no downside", "Riverbank vegetation has no connection to soil erosion", "It only affects fish, not the farmer's own land"],
    explanation: "Vegetation along a riverbank holds soil in place; clearing it right to the water's edge speeds up erosion and can silt or pollute the river.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is deciding what to plant on a small plot: only maize for the family, or maize plus a cash crop like sukuma wiki (kale) for both food and market sale. Which choice best reflects responsible, balanced use of the land?`,
    correct: "Planting both — meeting the family's food needs while also generating income from the surplus",
    wrong: ["Growing only maize, since selling any crop is always irresponsible", "Growing only the cash crop, ignoring the family's own food needs", "Leaving the plot unplanted to avoid any responsibility over it"],
    explanation: "Responsible use of plants balances food security for the family with income-generating opportunity, reflecting both Genesis 1:29's provision of plants as food and the design's emphasis on economic benefit.",
  }),
];

export const responsibilityOverPlants: Skill = {
  id: "g7-cre-cn-responsibility-over-plants",
  code: "CN.3",
  subjectId: "cre",
  strandId: "g7-cre-creation",
  grade: 7,
  title: "Responsibility over Plants",
  description: "The biblical responsibility given to human beings over plants (Genesis 1:29, Genesis 2:15, Psalm 104:14), and how responsible use of plants contributes to economic growth.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "reasoning", "categorize", "match", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, GROWING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: GROWING_STEPS.map((s) => s.id),
        hint: "Start with choosing the crop and end with gaining economic benefit from the harvest.",
        explanation: GROWING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what responsible, sustainable use of plants looks like in this situation.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const good = shuffle(rng, RESPONSIBLE_USE).slice(0, 4);
      const bad = shuffle(rng, MISUSE_OF_PLANTS).slice(0, 4);
      const chosen = shuffle(rng, [...good.map((t) => ({ text: t, good: true })), ...bad.map((t) => ({ text: t, good: false }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.good ? "responsible" : "misuse"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "responsible", label: "Responsible use of plants" },
          { id: "misuse", label: "Misuse of plants" },
        ],
        correctBucket,
        hint: "Responsible use cares for plants and the soil long-term; misuse exhausts or destroys them for short-term gain.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.good ? "responsible use" : "misuse"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, BASIS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((b) => ({ id: b.term, label: b.term })));
      const targets = shuffle(rng, chosen.map((b) => ({ id: b.term, label: b.meaning })));
      const correctMap: Record<string, string> = {};
      for (const b of chosen) correctMap[b.term] = b.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what the Bible teaches about human responsibility over plants, and the terms used to describe responsible farming.",
        explanation: chosen.map((b) => `${b.term} — ${b.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const facts = [
      { before: "Genesis 1:29 says God gave every plant yielding", after: "to human beings as food.", answer: "seed", accepted: ["seed"] },
      { before: "Psalm 104:14 says God causes grass to grow for cattle and plants for people to", after: ".", answer: "cultivate", accepted: ["cultivate"] },
      { before: "Growing trees and crops together on the same land is called", after: ".", answer: "agroforestry", accepted: ["agroforestry"] },
      { before: "Changing the type of crop grown on a plot each season is called crop", after: ".", answer: "rotation", accepted: ["rotation"] },
      { before: "Clearing forests without replanting trees is called", after: ".", answer: "deforestation", accepted: ["deforestation"] },
      { before: "Having reliable access to enough food for a community is called food", after: ".", answer: "security", accepted: ["security"] },
      { before: "Growing fruits, vegetables, and flowers, often for export income, is called", after: ".", answer: "horticulture", accepted: ["horticulture"] },
      { before: "The soil's ability to support healthy plant growth is called soil", after: ".", answer: "fertility", accepted: ["fertility"] },
      { before: "Genesis 2:15 says the man was placed in the garden to till it and", after: "it.", answer: "keep", accepted: ["keep"] },
      { before: "Covering soil around plants to conserve moisture is called", after: ".", answer: "mulching", accepted: ["mulching"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about responsible plant use and Biblical teachings on plants.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
