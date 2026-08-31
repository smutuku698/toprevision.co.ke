import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const FEATURES = [
  { id: "movable", label: "Movable / portable design", detail: "The fold can be shifted to fresh ground regularly, spreading manure and reducing disease build-up" },
  { id: "raised-floor", label: "Raised slatted floor", detail: "A slatted floor lets droppings fall through, keeping birds away from their own waste" },
  { id: "predator-proof", label: "Predator-proof enclosure", detail: "Strong wire mesh on all sides keeps out predators such as dogs, cats, and birds of prey" },
  { id: "ventilation", label: "Good ventilation", detail: "Gaps or mesh sides let fresh air circulate, preventing heat build-up and respiratory disease" },
  { id: "feeder-waterer", label: "Built-in feeder and waterer space", detail: "Space set aside inside or attached to the fold for clean feed and water, away from droppings" },
] as const;

const MATERIAL_ITEMS = [
  { text: "Timber offcuts for the frame", bucket: "suitable" },
  { text: "Wire mesh for the walls and roof", bucket: "suitable" },
  { text: "Iron sheets or thatch for a shaded roof section", bucket: "suitable" },
  { text: "Nails, hinges, and a simple door latch", bucket: "suitable" },
  { text: "Cardboard boxes as the main wall material", bucket: "unsuitable" },
  { text: "Loose polythene sheeting as the only floor", bucket: "unsuitable" },
] as const;
const MATERIAL_LABEL: Record<string, string> = { suitable: "Suitable material for a poultry fold", unsuitable: "Unsuitable material for a poultry fold" };

const FEATURE_MATCH_PROMPTS = [
  "Match each feature of a poultry fold to why it matters.",
  "Pair each fold feature below with the reason it's included.",
  "Connect each design feature of a poultry fold to what it achieves.",
  "Match each feature to the explanation of why it's needed.",
  "Link each part of a poultry fold's design to its purpose.",
  "Match each fold feature to the statement that explains its importance.",
];

const MATERIAL_SORT_PROMPTS = [
  "Sort each material as suitable or unsuitable for constructing a poultry fold.",
  "Decide whether each material below is suitable or unsuitable for building a fold, and sort it.",
  "Group these materials under suitable or unsuitable for a poultry fold.",
  "Read each material and sort it as fit or unfit for constructing a fold.",
  "Sort these building materials into suitable or unsuitable for a poultry fold.",
  "Place each material into the correct bucket — suitable, or unsuitable, for a fold.",
];

const CAPACITY_CALC_PROMPTS = [
  (length: number, width: number, spacePerBird: number) =>
    `A poultry fold measures ${length} m by ${width} m (shown below). The recommended floor space is ${spacePerBird} m² per bird. What is the maximum number of birds this fold can hold?`,
  (length: number, width: number, spacePerBird: number) =>
    `A farmer builds a fold ${length} m by ${width} m (shown below), allowing ${spacePerBird} m² of floor space per bird. How many birds can it hold at most?`,
  (length: number, width: number, spacePerBird: number) =>
    `Given a fold ${length} m by ${width} m (shown below) and a recommended ${spacePerBird} m² per bird, find the maximum number of birds it can house.`,
  (length: number, width: number, spacePerBird: number) =>
    `A ${length} m by ${width} m poultry fold (shown below) needs ${spacePerBird} m² of space for each bird. What's the largest number of birds that fits?`,
  (length: number, width: number, spacePerBird: number) =>
    `Working out fold capacity: with ${spacePerBird} m² per bird required and a fold measuring ${length} m by ${width} m (shown below), how many birds is the maximum?`,
];

const REVERSE_CAPACITY_PROMPTS = [
  (capacity: number, spacePerBird: number) =>
    `A farmer wants to keep ${capacity} birds in a fold, allowing ${spacePerBird} m² of floor space per bird. What total floor area, in m², does the fold need?`,
  (capacity: number, spacePerBird: number) =>
    `To house ${capacity} birds at ${spacePerBird} m² each, what total floor area, in m², must the fold provide?`,
  (capacity: number, spacePerBird: number) =>
    `A fold is being planned for ${capacity} birds, with ${spacePerBird} m² of space allowed per bird. Find the required floor area in m².`,
  (capacity: number, spacePerBird: number) =>
    `If ${capacity} birds each need ${spacePerBird} m² of floor space, what total area, in m², is required for the fold?`,
  (capacity: number, spacePerBird: number) =>
    `Given a target of ${capacity} birds and ${spacePerBird} m² per bird, work out the total floor area needed, in m².`,
];

const CONSTRUCT_ORDER_PROMPTS = [
  "Arrange the correct order for constructing a fold for rearing poultry.",
  "Put these steps for building a poultry fold into the right order.",
  "Sequence the process of constructing a poultry fold correctly.",
  "Arrange these steps in the order a builder should follow to construct a fold.",
  "Order these actions the way someone would carry them out when building a fold.",
  "Sort these steps into the order they should happen when constructing a poultry fold.",
];

const FEATURE_RECALL_PROMPTS = [
  (detail: string) => `Which feature of a poultry fold matches: "${detail}"?`,
  (detail: string) => `"${detail}" — which fold feature does this describe?`,
  (detail: string) => `Which design feature of a poultry fold is being described here: "${detail}"?`,
  (detail: string) => `Read this description: "${detail}." Which feature of a poultry fold is it?`,
  (detail: string) => `This describes one feature of a poultry fold: "${detail}." Which one is it?`,
];

const CONSTRUCT_STEPS = [
  { id: "frame", label: "Build a strong, lightweight timber frame" },
  { id: "mesh", label: "Cover the sides and roof with predator-proof wire mesh" },
  { id: "floor", label: "Fit a raised, slatted floor so droppings fall through" },
  { id: "feeder", label: "Fix feeder and waterer holders inside, away from the droppings" },
  { id: "door", label: "Attach a secure, easy-to-open door for daily access" },
];

export const poultryRearingFold: Skill = {
  id: "g8-ag-f-poultry-rearing-fold",
  code: "F.2",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-food-production",
  grade: 8,
  title: "Poultry Rearing in a Fold",
  description: "What a fold is, its key features, suitable construction materials, and calculating how many birds a fold of a given size can hold.",
  generate(rng) {
    const branch = randChoice(rng, ["feature-match", "material-sort", "capacity-calc", "reverse-capacity", "construct-order", "feature-recall"] as const);

    if (branch === "feature-match") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.id, label: f.detail })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, FEATURE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "A fold's design has to protect the birds, keep them healthy, and stay easy to manage.",
        explanation: FEATURES.map((f) => `${f.label}: ${f.detail}.`).join(" "),
      };
    }

    if (branch === "material-sort") {
      const chosen = shuffle(rng, MATERIAL_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: MATERIAL_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, MATERIAL_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "A suitable material must be strong, weatherproof, and safe for the birds.",
        explanation: chosen.map((c) => `"${c.text}" — ${MATERIAL_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "capacity-calc") {
      const length = randInt(rng, 2, 5);
      const width = randInt(rng, 1, 3);
      const area = length * width;
      const spacePerBird = randChoice(rng, [0.2, 0.25, 0.5] as const);
      const capacity = Math.floor(area / spacePerBird);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, CAPACITY_CALC_PROMPTS)(length, width, spacePerBird),
        before: "Maximum birds =",
        after: "",
        correctAnswer: String(capacity),
        inputMode: "numeric",
        visual: { type: "rectangle", width: length, height: width, labelWidth: `${length} m`, labelHeight: `${width} m` },
        hint: "Find the floor area first, then divide by the space needed per bird.",
        explanation: `Floor area $= ${length} \\times ${width} = ${area}$ m². Maximum birds $= ${area} \\div ${spacePerBird} = ${capacity}$ (rounded down, since a fraction of a bird can't fit).`,
      };
    }

    if (branch === "reverse-capacity") {
      const spacePerBird = randChoice(rng, [0.2, 0.25, 0.5] as const);
      const capacity = randInt(rng, 10, 40);
      const area = capacity * spacePerBird;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, REVERSE_CAPACITY_PROMPTS)(capacity, spacePerBird),
        before: "Required floor area =",
        after: "m²",
        correctAnswer: String(area),
        inputMode: "numeric",
        hint: "Total area needed = number of birds × space per bird.",
        explanation: `Required area $= ${capacity} \\times ${spacePerBird} = ${area}$ m².`,
      };
    }

    if (branch === "construct-order") {
      const items = shuffle(rng, CONSTRUCT_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, CONSTRUCT_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: CONSTRUCT_STEPS.map((s) => s.id),
        hint: "The frame comes first, then the covering, floor, and fittings, and the door last.",
        explanation: CONSTRUCT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    // feature-recall
    const f = randChoice(rng, FEATURES);
    const others = FEATURES.filter((x) => x.id !== f.id).map((x) => x.label);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, f.label, others, 3);
    return {
      kind: "multiple-choice",
      prompt: randChoice(rng, FEATURE_RECALL_PROMPTS)(f.detail),
      choices,
      correctIndex,
      hint: "Match the explanation to the design feature it describes.",
      explanation: `${f.label}: ${f.detail}.`,
    };
  },
};
