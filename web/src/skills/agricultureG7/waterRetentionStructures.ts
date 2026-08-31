import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STRUCTURES = [
  { id: "retention-ditch", label: "Retention ditch", detail: "A long, narrow channel dug along a slope to catch and hold surface run-off" },
  { id: "retention-pit", label: "Retention pit", detail: "A dug-out hole that collects surface run-off in one spot, often for a single plant" },
  { id: "check-structure", label: "Cut-off drain", detail: "A shallow channel that intercepts run-off before it reaches and erodes a planting area" },
] as const;

const CROP_ITEMS = [
  { text: "Banana sucker", bucket: "suited" },
  { text: "Sugarcane", bucket: "suited" },
  { text: "Napier grass", bucket: "suited" },
  { text: "Arrowroot", bucket: "suited" },
  { text: "Cactus", bucket: "not-suited" },
  { text: "Sisal", bucket: "not-suited" },
] as const;
const CROP_LABEL: Record<string, string> = {
  suited: "Grows well with extra moisture from a retention structure",
  "not-suited": "A drought-tolerant crop that does not need extra retained water",
};

const CONSTRUCT_STEPS = [
  { id: "site", label: "Identify a suitable site where run-off naturally collects or flows" },
  { id: "mark", label: "Mark out the size and shape of the ditch or pit" },
  { id: "dig", label: "Dig the retention structure to the planned length, width, and depth" },
  { id: "plant", label: "Establish a crop, such as a banana sucker or arrowroot, in the structure" },
  { id: "maintain", label: "Maintain the structure by clearing silt so it keeps holding water" },
];

const MATCH_PROMPTS = [
  "Match each water conservation structure to its description.",
  "Pair each structure with the description that explains it.",
  "Connect each water retention structure to what it actually is.",
  "Match each structure below to the statement that describes it.",
  "Link each conservation structure to its correct description.",
  "Match each structure to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each crop by whether it is well suited to being planted in a water retention structure.",
  "Decide whether each crop below benefits from a retention structure, and sort it there.",
  "Group these crops under suited or not-suited to retained water.",
  "Sort each crop into the correct moisture-need bucket.",
  "Read each crop and place it under whether it needs the extra retained moisture.",
  "Classify each crop as needing extra moisture from a retention structure, or not.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for constructing a water retention structure and establishing a crop, in the correct order.",
  "Put these construction and planting steps into a sensible order.",
  "Sequence the steps for building a retention structure and starting a crop correctly.",
  "Arrange these actions into the order a careful farmer would follow them.",
  "Order these construction tasks the way they should actually happen.",
  "Sort these steps into the order needed to build the structure and establish a crop.",
];

const VOLUME_PROMPTS = (length: number, width: number, depth: number) => [
  `A farmer digs a rectangular retention pit ${length} m long, ${width} m wide, and ${depth} m deep (shown below). Using Volume = Length × Width × Depth, how much water, in cubic metres, can the pit hold when full?`,
  `A retention pit measures ${length} m by ${width} m by ${depth} m deep (shown below). Using Volume = Length × Width × Depth, what is its capacity in cubic metres?`,
  `You dig a pit ${length} m long, ${width} m wide, and ${depth} m deep to retain run-off (shown below). How many cubic metres of water can it hold? Use Volume = Length × Width × Depth.`,
  `A rectangular water retention pit is planned at ${length} m by ${width} m by ${depth} m deep (shown below). Work out its volume in cubic metres, using Volume = Length × Width × Depth.`,
  `To hold run-off, a pit ${length} m long, ${width} m wide, and ${depth} m deep is dug (shown below). Using Volume = Length × Width × Depth, calculate how much water it holds in cubic metres.`,
  `A retention pit's dimensions are ${length} m by ${width} m by ${depth} m deep (shown below). How many cubic metres of water can it hold, using Volume = Length × Width × Depth?`,
];

const REVERSE_VOLUME_PROMPTS = (length: number, width: number, volume: number) => [
  `A retention pit ${length} m long and ${width} m wide needs to hold ${volume} m³ of water. Using Volume = Length × Width × Depth, how deep, in metres, must the pit be dug?`,
  `A pit measuring ${length} m by ${width} m must hold ${volume} m³ of run-off. Using Volume = Length × Width × Depth, work out how deep it must be.`,
  `Given a retention pit ${length} m long and ${width} m wide with a target capacity of ${volume} m³, find its required depth using Volume = Length × Width × Depth.`,
  `A pit ${length} m long and ${width} m wide is being dug to hold ${volume} m³ of water. Rearranging Volume = Length × Width × Depth, what depth is needed?`,
  `How deep, in metres, must a ${length} m by ${width} m retention pit be dug to hold ${volume} m³ of water? Use Volume = Length × Width × Depth.`,
  `A rectangular pit ${length} m long and ${width} m wide has a target volume of ${volume} m³. Using Volume = Length × Width × Depth, calculate its depth.`,
];

const SCENARIOS = [
  {
    q: "A steep field loses most of its rainwater to run-off before crops can use it. Which structure would most directly capture that water for later use?",
    correct: "A retention ditch dug along the slope, since it catches run-off as it flows down",
    distractors: [
      "A single retention pit dug at the very top of the slope, above where run-off begins",
      "No structure is needed, since run-off always soaks into steep soil anyway",
      "A structure built only after the rainy season has already ended",
    ],
  },
  {
    q: "A farmer wants to establish one banana sucker where extra moisture will collect. Which structure suits a single plant best?",
    correct: "A retention pit, since it is a dug-out hole that collects water in one spot for a single plant",
    distractors: [
      "A long retention ditch running the length of the whole field",
      "A cut-off drain built to carry water away from the planting area",
      "Any structure works equally well for a single plant",
    ],
  },
];

export const waterRetentionStructures: Skill = {
  id: "g7-ag-c-water-retention-structures",
  code: "C.2",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-conservation",
  grade: 7,
  title: "Constructing Water Retention Structures",
  description: "Conserving surface run-off using retention ditches and pits, suitable crops for the extra moisture, and calculating the volume of water a retention pit can hold.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "volume-calc", "reverse-volume", "order", "scenario"] as const);
    const hint = "A retention structure is dug to catch surface run-off before it is lost, so a crop planted in or near it gets extra moisture.";

    if (branch === "match") {
      const tokens = shuffle(rng, STRUCTURES.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STRUCTURES.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of STRUCTURES) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STRUCTURES.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, CROP_ITEMS);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "suited", label: CROP_LABEL.suited },
          { id: "not-suited", label: CROP_LABEL["not-suited"] },
        ],
        correctBucket,
        hint: "Crops that need plenty of moisture benefit most from retained water; drought-tolerant crops already cope well without it.",
        explanation: chosen.map((c) => `"${c.text}" — ${CROP_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "volume-calc") {
      const length = randInt(rng, 2, 6);
      const width = randInt(rng, 1, 3);
      const depth = randInt(rng, 1, 2);
      const volume = length * width * depth;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, VOLUME_PROMPTS(length, width, depth)),
        before: "Volume =",
        after: "m³",
        correctAnswer: String(volume),
        inputMode: "numeric",
        visual: { type: "solid", shape: "cuboid", length, width, height: depth },
        hint: "Multiply all three dimensions together: length × width × depth.",
        explanation: `Volume $= ${length} \\times ${width} \\times ${depth} = ${volume}$ m³.`,
      };
    }

    if (branch === "reverse-volume") {
      const length = randInt(rng, 3, 7);
      const width = randInt(rng, 1, 3);
      const volume = randInt(rng, 2, 6) * length * width;
      const depth = volume / (length * width);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, REVERSE_VOLUME_PROMPTS(length, width, volume)),
        before: "Depth =",
        after: "m",
        correctAnswer: String(depth),
        inputMode: "numeric",
        hint: "Rearrange the formula: Depth = Volume ÷ (Length × Width).",
        explanation: `Depth $= ${volume} \\div (${length} \\times ${width}) = ${depth}$ m.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CONSTRUCT_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: CONSTRUCT_STEPS.map((s) => s.id),
        hint: "You must find and mark the site before digging, and plant only once the structure is ready.",
        explanation: CONSTRUCT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, SCENARIOS);
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
  },
};
