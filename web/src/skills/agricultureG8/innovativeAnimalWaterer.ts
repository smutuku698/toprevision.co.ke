import { randChoice, randInt, roundTo, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CHALLENGES = [
  { id: "spillage", label: "Spillage", detail: "Open waterers are easily knocked over or splashed out by the animals themselves" },
  { id: "contamination", label: "Contamination", detail: "Animals can step in, defecate in, or drop feed/dirt into an open water container" },
  { id: "evaporation", label: "Evaporation", detail: "Water in an open, shallow container is lost quickly to the sun and heat" },
  { id: "frequent-refilling", label: "Frequent refilling", detail: "A small container needs to be topped up several times a day, which wastes the farmer's time" },
] as const;

const SOLUTIONS = [
  { id: "float-valve", label: "Float valve (automatic self-filling)", detail: "A floating valve that shuts off the water supply once the container is full, refilling itself as animals drink" },
  { id: "narrow-opening", label: "Narrow drinking opening", detail: "A small, animal-sized opening in a covered container stops animals from stepping in or spilling it" },
  { id: "covered-reservoir", label: "Covered reservoir", detail: "A closed main water store (e.g. a recycled drum) that only releases a small amount at a time reduces evaporation and contamination" },
  { id: "recycled-materials", label: "Using recycled materials (PVC pipe, plastic bottles/drums)", detail: "Building the waterer from low-cost recycled materials keeps the innovation affordable for the farmer" },
] as const;

const CHALLENGE_SOLUTION: Record<string, string> = {
  spillage: "narrow-opening",
  contamination: "covered-reservoir",
  evaporation: "covered-reservoir",
  "frequent-refilling": "float-valve",
};

const MATERIAL_ITEMS = [
  { text: "A large plastic drum with a tap fitted near the base", bucket: "suitable" },
  { text: "PVC pipe cut and fitted to guide water into a trough", bucket: "suitable" },
  { text: "A ball valve or float switch to control water flow", bucket: "suitable" },
  { text: "An old bucket with several holes and no way to control the flow", bucket: "unsuitable" },
  { text: "A cracked container that leaks water onto the ground", bucket: "unsuitable" },
] as const;
const MATERIAL_LABEL: Record<string, string> = { suitable: "Suitable for an innovative waterer", unsuitable: "Unsuitable for an innovative waterer" };

const DESIGN_STEPS = [
  { id: "identify", label: "Identify the specific problem with the current waterer being used" },
  { id: "sketch", label: "Sketch a design that solves that specific problem" },
  { id: "gather", label: "Gather suitable materials, reusing recycled containers where possible" },
  { id: "construct", label: "Construct the waterer following the design" },
  { id: "test", label: "Test it with the animals and adjust the design if needed" },
];

const CHALLENGE_MATCH_PROMPTS = [
  "Match each challenge with traditional animal waterers to what it means.",
  "Pair each waterer challenge below with its correct description.",
  "Connect each problem with traditional waterers to what it actually involves.",
  "Match each challenge to the explanation of what goes wrong.",
  "Link each waterer problem to what it means in practice.",
  "Match each challenge to the statement that describes it.",
];

const MATERIAL_SORT_PROMPTS = [
  "Sort each material or part as suitable or unsuitable for building an innovative animal waterer.",
  "Decide whether each material below is suitable or unsuitable for a waterer, and sort it.",
  "Group these materials under suitable or unsuitable for an innovative waterer.",
  "Read each material and sort it as fit or unfit for building a waterer.",
  "Sort these materials into suitable or unsuitable for constructing a waterer.",
  "Place each material into the correct bucket — suitable, or unsuitable, for a waterer.",
];

const CAPACITY_CALC_PROMPTS = [
  (radius: number, height: number) =>
    `An innovative waterer is built from a cylindrical drum with radius ${radius} cm and height ${height} cm (shown below). Using Volume = πr²h, and 1 litre = 1000 cm³, find the drum's capacity in litres. Use π ≈ 3.14 and round to 1 decimal place.`,
  (radius: number, height: number) =>
    `A cylindrical waterer drum has radius ${radius} cm and height ${height} cm (shown below). Using Volume = πr²h and 1 litre = 1000 cm³, work out its capacity in litres (π ≈ 3.14, round to 1 decimal place).`,
  (radius: number, height: number) =>
    `Given a cylindrical drum of radius ${radius} cm and height ${height} cm (shown below), calculate its capacity in litres using Volume = πr²h and 1 litre = 1000 cm³. Use π ≈ 3.14, rounded to 1 decimal place.`,
  (radius: number, height: number) =>
    `A farmer's cylindrical waterer measures radius ${radius} cm and height ${height} cm (shown below). Find its capacity in litres (Volume = πr²h, 1 litre = 1000 cm³, π ≈ 3.14, round to 1 decimal place).`,
  (radius: number, height: number) =>
    `Working out drum capacity: radius ${radius} cm, height ${height} cm (shown below). Using Volume = πr²h and 1 litre = 1000 cm³, what is the capacity in litres? Use π ≈ 3.14, round to 1 decimal place.`,
];

const REVERSE_CAPACITY_PROMPTS = [
  (radius: number, actualLitres: number) =>
    `A farmer wants a cylindrical waterer with radius ${radius} cm that holds about ${actualLitres} litres. Using Volume = πr²h (with π ≈ 3.14, 1 litre = 1000 cm³), what height, in cm, should the drum be? Round to the nearest whole number.`,
  (radius: number, actualLitres: number) =>
    `A cylindrical waterer needs radius ${radius} cm and a capacity of about ${actualLitres} litres. Using Volume = πr²h (π ≈ 3.14, 1 litre = 1000 cm³), find the required height in cm, rounded to the nearest whole number.`,
  (radius: number, actualLitres: number) =>
    `Given a drum radius of ${radius} cm and a target capacity of ${actualLitres} litres, find the height in cm using Volume = πr²h (π ≈ 3.14, 1 litre = 1000 cm³). Round to the nearest whole number.`,
  (radius: number, actualLitres: number) =>
    `A farmer needs a waterer holding ${actualLitres} litres with a radius of ${radius} cm. What height, in cm, should it be? Use Volume = πr²h (π ≈ 3.14, 1 litre = 1000 cm³), rounded to the nearest whole number.`,
  (radius: number, actualLitres: number) =>
    `To build a ${actualLitres}-litre cylindrical waterer with radius ${radius} cm, what height, in cm, is required? Use Volume = πr²h (π ≈ 3.14, 1 litre = 1000 cm³), rounded to the nearest whole number.`,
];

const SOLUTION_CHOICE_PROMPTS = [
  (label: string, detail: string) => `A traditional animal waterer suffers from ${label}: "${detail}." Which innovative feature best solves this problem?`,
  (label: string, detail: string) => `Traditional waterers face this problem — ${label}: "${detail}." Which innovative feature addresses it best?`,
  (label: string, detail: string) => `Given the problem of ${label} ("${detail}"), which innovative feature offers the best fix?`,
  (label: string, detail: string) => `"${detail}" describes the challenge of ${label} in a traditional waterer. Which feature solves it most directly?`,
  (label: string, detail: string) => `A waterer is affected by ${label}: "${detail}." Which design feature would fix this?`,
];

const DESIGN_ORDER_PROMPTS = [
  "Arrange the correct order for designing and constructing an innovative animal waterer.",
  "Put these steps for designing and building an innovative waterer into the right order.",
  "Sequence the process of designing and constructing an innovative waterer correctly.",
  "Arrange these steps in the order a builder should follow to design and build a waterer.",
  "Order these actions the way someone would carry them out when building an innovative waterer.",
  "Sort these steps into the order they should happen when designing an innovative animal waterer.",
];

export const innovativeAnimalWaterer: Skill = {
  id: "g8-ag-p-innovative-animal-waterer",
  code: "P.2",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-production-techniques",
  grade: 8,
  title: "Constructing Innovative Animal Waterer",
  description: "Challenges with community animal waterers, features of an innovative solution, suitable materials, the design process, and calculating the capacity of a cylindrical waterer.",
  generate(rng) {
    const branch = randChoice(rng, ["challenge-match", "material-sort", "capacity-calc", "reverse-capacity", "design-order", "solution-choice"] as const);

    if (branch === "challenge-match") {
      const tokens = shuffle(rng, CHALLENGES.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CHALLENGES.map((c) => ({ id: c.id, label: c.detail })));
      const correctMap: Record<string, string> = {};
      for (const c of CHALLENGES) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CHALLENGE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each challenge describes a specific way water, time, or hygiene is lost with a basic open waterer.",
        explanation: CHALLENGES.map((c) => `${c.label}: ${c.detail}.`).join(" "),
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
        hint: "A suitable part must hold water without leaking and, ideally, help control the flow.",
        explanation: chosen.map((c) => `"${c.text}" — ${MATERIAL_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "capacity-calc") {
      const radius = randInt(rng, 15, 35);
      const height = randInt(rng, 30, 70);
      const volumeCm3 = roundTo(3.14 * radius * radius * height, 0);
      const litres = roundTo(volumeCm3 / 1000, 1);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, CAPACITY_CALC_PROMPTS)(radius, height),
        before: "Capacity ≈",
        after: "litres",
        correctAnswer: String(litres),
        inputMode: "numeric",
        visual: { type: "solid", shape: "cylinder", radius, height },
        hint: "Find the volume in cm³ first (π × r² × h), then divide by 1000 to convert to litres.",
        explanation: `Volume $\\approx 3.14 \\times ${radius}^2 \\times ${height} = ${volumeCm3}$ cm³. In litres, that's $${volumeCm3} \\div 1000 \\approx ${litres}$ litres.`,
      };
    }

    if (branch === "reverse-capacity") {
      const radius = randInt(rng, 15, 30);
      const litres = randInt(rng, 20, 90);
      const volumeCm3 = litres * 1000;
      const height = Math.round(volumeCm3 / (3.14 * radius * radius));
      const actualLitres = roundTo((3.14 * radius * radius * height) / 1000, 1);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, REVERSE_CAPACITY_PROMPTS)(radius, actualLitres),
        before: "Height ≈",
        after: "cm",
        correctAnswer: String(height),
        inputMode: "numeric",
        hint: "Convert the target volume to cm³, then rearrange Volume = πr²h to h = Volume ÷ (πr²).",
        explanation: `Target volume $= ${actualLitres} \\times 1000 = ${roundTo(actualLitres * 1000, 0)}$ cm³. Height $\\approx ${roundTo(actualLitres * 1000, 0)} \\div (3.14 \\times ${radius}^2) \\approx ${height}$ cm.`,
      };
    }

    if (branch === "solution-choice") {
      const c = randChoice(rng, CHALLENGES);
      const correct = SOLUTIONS.find((s) => s.id === CHALLENGE_SOLUTION[c.id])!;
      const others = SOLUTIONS.filter((s) => s.id !== correct.id).map((s) => s.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, SOLUTION_CHOICE_PROMPTS)(c.label.toLowerCase(), c.detail),
        choices,
        correctIndex,
        hint: "Think about which specific design change removes the exact cause of the problem described.",
        explanation: `${correct.label} best addresses ${c.label.toLowerCase()}: ${correct.detail}.`,
      };
    }

    // design-order
    const items = shuffle(rng, DESIGN_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, DESIGN_ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: DESIGN_STEPS.map((s) => s.id),
      hint: "You must know the exact problem before you can design and build a fix for it, and testing comes last.",
      explanation: DESIGN_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
