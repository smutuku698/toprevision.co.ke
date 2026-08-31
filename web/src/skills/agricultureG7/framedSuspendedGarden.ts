import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATERIAL_ITEMS = [
  { text: "Sturdy wooden planks or poles for the frame", bucket: "suitable" },
  { text: "Strong wire mesh to hold the growing medium in place", bucket: "suitable" },
  { text: "Metal bars to reinforce the frame's joints", bucket: "suitable" },
  { text: "A rotten, crumbling wooden plank", bucket: "unsuitable" },
  { text: "Thin, rusted wire that snaps when bent", bucket: "unsuitable" },
] as const;
const MATERIAL_LABEL: Record<string, string> = { suitable: "Suitable for building the frame", unsuitable: "Unsuitable for building the frame" };

const PURPOSE_ITEMS = [
  { id: "space-saving", label: "Saves space", detail: "Suspending the garden above ground level makes use of vertical space where floor space is limited" },
  { id: "pest-reduction", label: "Reduces pest access", detail: "Raising the garden off the ground makes it harder for some soil-based pests to reach the crop" },
  { id: "easier-tending", label: "Easier to tend", detail: "A raised frame at a convenient height reduces the need to bend down while weeding or harvesting" },
] as const;

const SCENARIOS = [
  {
    q: "A family living in a small urban compound wants to grow vegetables but has almost no ground space available. Why would a framed suspended garden suit them well?",
    correct: "It uses vertical space above the ground, letting them grow crops without needing more floor area",
    distractors: [
      "It requires more ground space than an ordinary garden bed",
      "It can only be used in rural areas with large farms",
      "Suspended gardens cannot support any real crop growth",
    ],
  },
  {
    q: "While constructing a framed suspended garden, a builder chooses a rotten wooden plank because it was the cheapest option available. What is the likely risk?",
    correct: "The rotten plank could weaken and collapse under the weight of the growing medium and crop",
    distractors: [
      "Rotten wood is always stronger than fresh wood",
      "The type of wood used has no effect on the frame's strength",
      "A frame never needs to support any real weight",
    ],
  },
];

const BUILD_STEPS = [
  { id: "design", label: "Design the frame and decide on its size and shape" },
  { id: "gather", label: "Gather suitable, sturdy materials such as planks, wire, or metal bars" },
  { id: "construct", label: "Construct and suspend the frame securely" },
  { id: "add-medium", label: "Add a suitable growing medium to the frame" },
  { id: "plant", label: "Establish a crop in the constructed frame" },
];

const SORT_PROMPTS = [
  "Sort each material as suitable or unsuitable for building a framed suspended garden.",
  "Decide whether each material below is suitable for the frame, and sort it there.",
  "Group these materials under suitable or unsuitable for the frame.",
  "Sort each material into the correct suitability bucket.",
  "Read each material and place it under whether it can safely be used for the frame.",
  "Classify each material as fit for building the frame, or not.",
];

const MATCH_PROMPTS = [
  "Match each benefit of a framed suspended garden to how it actually helps.",
  "Pair each benefit with the explanation of why it matters.",
  "Connect each advantage of a suspended garden to its correct explanation.",
  "Match each benefit below to the description that explains it.",
  "Link each reason a suspended garden helps to why it works.",
  "Match each advantage to its explanation.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for constructing a framed suspended garden and establishing a crop, in the correct order.",
  "Put these frame-construction and planting steps into a sensible order.",
  "Sequence the steps for building a suspended garden and starting a crop correctly.",
  "Arrange these actions into the order a careful builder would follow them.",
  "Order these construction tasks the way they should actually happen.",
  "Sort these steps into the order needed to build the frame and establish a crop.",
];

const PERIMETER_PROMPTS = (length: number, width: number) => [
  `A rectangular frame for a suspended garden measures ${length} m by ${width} m (shown below). Using Perimeter = 2 × (Length + Width), how many metres of framing material are needed to go around its edge?`,
  `A suspended garden's frame is ${length} m long and ${width} m wide (shown below). Using Perimeter = 2 × (Length + Width), how much framing material, in metres, is needed to go around it?`,
  `You are building a rectangular frame ${length} m by ${width} m for a suspended garden (shown below). How many metres of material does the edge require? Use Perimeter = 2 × (Length + Width).`,
  `A frame for a suspended garden measures ${length} m by ${width} m (shown below). Work out the metres of framing material needed for its perimeter, using Perimeter = 2 × (Length + Width).`,
  `To build a suspended garden frame ${length} m long and ${width} m wide (shown below), how many metres of edging material are needed? Use Perimeter = 2 × (Length + Width).`,
  `A rectangular suspended garden frame is planned at ${length} m by ${width} m (shown below). Using Perimeter = 2 × (Length + Width), calculate the metres of framing material required.`,
];

const REVERSE_PERIMETER_PROMPTS = (width: number, perimeter: number) => [
  `A rectangular garden frame is ${width} m wide and needs ${perimeter} m of framing material to go around its edge. Using Perimeter = 2 × (Length + Width), find the frame's length in metres.`,
  `A suspended garden frame ${width} m wide requires ${perimeter} m of material to edge it. Using Perimeter = 2 × (Length + Width), work out the frame's length.`,
  `Given a garden frame that is ${width} m wide and uses ${perimeter} m of framing material in total, find its length in metres using Perimeter = 2 × (Length + Width).`,
  `A frame ${width} m wide needs ${perimeter} m of edging to go all the way around. Rearranging Perimeter = 2 × (Length + Width), what is the frame's length?`,
  `How long, in metres, must a ${width} m wide suspended garden frame be if ${perimeter} m of framing material goes around its edge? Use Perimeter = 2 × (Length + Width).`,
  `A rectangular frame ${width} m wide has a perimeter of ${perimeter} m. Using Perimeter = 2 × (Length + Width), calculate its length.`,
];

export const framedSuspendedGarden: Skill = {
  id: "g7-ag-p-framed-suspended-garden",
  code: "P.2",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-production-techniques",
  grade: 7,
  title: "Constructing Framed Suspended Garden",
  description: "Constructing a framed suspended garden using locally available materials, its benefits, and calculating the amount of framing material a rectangular frame needs.",
  generate(rng) {
    const branch = randChoice(rng, ["sort", "match", "perimeter-calc", "reverse-perimeter", "order", "scenario"] as const);
    const hint = "A framed suspended garden must be built from strong, sound materials able to support the weight of soil and crops above the ground.";

    if (branch === "sort") {
      const chosen = shuffle(rng, MATERIAL_ITEMS);
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "suitable", label: MATERIAL_LABEL.suitable },
          { id: "unsuitable", label: MATERIAL_LABEL.unsuitable },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" — ${MATERIAL_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PURPOSE_ITEMS.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PURPOSE_ITEMS.map((p) => ({ id: p.id, label: p.detail })));
      const correctMap: Record<string, string> = {};
      for (const p of PURPOSE_ITEMS) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PURPOSE_ITEMS.map((p) => `${p.label}: ${p.detail}.`).join(" "),
      };
    }

    if (branch === "perimeter-calc") {
      const length = randInt(rng, 2, 5);
      const width = randInt(rng, 1, 3);
      const perimeter = 2 * (length + width);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, PERIMETER_PROMPTS(length, width)),
        before: "Perimeter =",
        after: "m",
        correctAnswer: String(perimeter),
        inputMode: "numeric",
        visual: { type: "rectangle", width: length, height: width, labelWidth: `${length} m`, labelHeight: `${width} m` },
        hint: "Add the length and width, then double the result.",
        explanation: `Perimeter $= 2 \\times (${length} + ${width}) = ${perimeter}$ m.`,
      };
    }

    if (branch === "reverse-perimeter") {
      const width = randInt(rng, 1, 3);
      const length = randInt(rng, 2, 5);
      const perimeter = 2 * (length + width);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, REVERSE_PERIMETER_PROMPTS(width, perimeter)),
        before: "Length =",
        after: "m",
        correctAnswer: String(length),
        inputMode: "numeric",
        hint: "Rearrange the formula: Length = (Perimeter ÷ 2) − Width.",
        explanation: `Length $= (${perimeter} \\div 2) - ${width} = ${length}$ m.`,
      };
    }

    if (branch === "scenario") {
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
    }

    const items = shuffle(rng, BUILD_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click them in order.",
      items,
      correctOrder: BUILD_STEPS.map((s) => s.id),
      hint: "You must design and gather materials before building, and a growing medium is needed before a crop is planted.",
      explanation: BUILD_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
