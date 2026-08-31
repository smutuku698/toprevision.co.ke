import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SPOTS = [
  { id: "petal", label: "Petal", xPercent: 50, yPercent: 32 },
  { id: "pistil", label: "Pistil", xPercent: 50, yPercent: 46 },
  { id: "stem", label: "Stem", xPercent: 50, yPercent: 79 },
  { id: "leaf", label: "Leaf", xPercent: 63, yPercent: 70 },
  { id: "root", label: "Root", xPercent: 50, yPercent: 97 },
];
const DECOYS = ["Seed", "Thorn", "Bud"];

const EXPLANATIONS: Record<string, string> = {
  petal: "Petals are often brightly coloured to attract insects, which helps with pollination.",
  pistil: "The pistil is the female reproductive part of the flower, where seeds develop after fertilisation.",
  stem: "The stem supports the flower and leaves, and carries water and nutrients between the roots and the rest of the plant.",
  leaf: "Leaves capture sunlight and carry out photosynthesis to make food for the plant.",
  root: "Roots anchor the plant in the soil and absorb water and nutrients that travel up through the stem.",
};

const PART_CATEGORY: Record<string, "reproductive" | "vegetative"> = {
  petal: "reproductive",
  pistil: "reproductive",
  stem: "vegetative",
  leaf: "vegetative",
  root: "vegetative",
};

const WHY_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Why are petals often brightly coloured and sometimes scented?",
    choices: ["To attract insects and other pollinators to the flower", "To absorb sunlight for photosynthesis", "To anchor the plant firmly in the soil", "To store the plant's main water supply"],
    correctIndex: 0,
    explanation: "Bright colours and scent attract insects and other pollinators, which helps transfer pollen and leads to successful pollination.",
  },
  {
    prompt: "Why is the pistil considered the female reproductive part of a flower?",
    choices: ["It is where seeds develop after the egg cell is fertilised", "It produces the pollen grains that fertilise other flowers", "It transports water up from the roots", "It is the part that opens to release pollen into the wind"],
    correctIndex: 0,
    explanation: "The pistil contains the ovary, where the egg cell is fertilised and seeds then develop — making it the flower's female reproductive part.",
  },
  {
    prompt: "Why do a plant's roots generally grow downward into the soil?",
    choices: ["To anchor the plant firmly and reach water and nutrients underground", "To carry out photosynthesis more efficiently", "To attract pollinating insects to the plant", "To protect the flower bud before it opens"],
    correctIndex: 0,
    explanation: "Roots grow downward to anchor the plant firmly in the soil and to reach the water and nutrients the plant needs to survive.",
  },
  {
    prompt: "Why do leaves typically have a broad, flat shape?",
    choices: ["To capture as much sunlight as possible for photosynthesis", "To absorb water directly from rain into the stem", "To attract insects for pollination", "To anchor the plant against strong wind"],
    correctIndex: 0,
    explanation: "A broad, flat shape maximises the surface area exposed to sunlight, helping the leaf capture more light for photosynthesis.",
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "The male part of a flower that produces pollen is called the ", after: ".", correctAnswer: "stamen", accepted: ["stamen"], explanation: "The stamen is the male part of a flower, producing pollen grains that carry the plant's male reproductive cells." },
  { before: "The leaf-like structures that protect a flower bud before it opens are called ", after: ".", correctAnswer: "sepals", accepted: ["sepals", "sepal"], explanation: "Sepals are leaf-like structures that protect a flower bud before it opens." },
  { before: "The part of the pistil that contains the ovules and becomes the fruit is called the ", after: ".", correctAnswer: "ovary", accepted: ["ovary"], explanation: "The ovary is the part of the pistil that contains the ovules and develops into the fruit after fertilisation." },
  { before: "The transfer of pollen from the male part of a flower to the female part is called ", after: ".", correctAnswer: "pollination", accepted: ["pollination"], explanation: "Pollination is the transfer of pollen from the stamen (male part) to the pistil (female part) of a flower." },
  { before: "The joining of a male sex cell and a female egg cell to form a new seed is called ", after: ".", correctAnswer: "fertilisation", accepted: ["fertilisation", "fertilization"], explanation: "Fertilisation is the joining of a male sex cell (from pollen) and a female egg cell, leading to seed formation." },
  { before: "The sugary liquid produced by flowers to attract pollinators such as bees is called ", after: ".", correctAnswer: "nectar", accepted: ["nectar"], explanation: "Nectar is a sugary liquid produced by flowers to attract pollinators such as bees and butterflies." },
  { before: "The process by which plants use sunlight to make their own food is called ", after: ".", correctAnswer: "photosynthesis", accepted: ["photosynthesis"], explanation: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to make their own food." },
] as const;

export const flowerParts: Skill = {
  id: "sci-lt-flower-parts",
  code: "LT.1",
  subjectId: "science",
  strandId: "sci-extra-practice",
  grade: 9,
  title: "Structure of a flowering plant",
  description: "Identify the parts of a flowering plant on a diagram.",
  generate(rng) {
    const hint = "Think about what each part does for the plant: attracting insects, reproducing, transporting water, photosynthesis, or anchoring in soil.";
    const branch = randChoice(rng, ["match", "hotspot", "categorize", "fill-blank", "why"] as const);

    if (branch === "categorize") {
      const items = SPOTS.map((s) => ({ id: s.id, label: s.label }));
      const correctBucket: Record<string, string> = {};
      for (const s of SPOTS) correctBucket[s.id] = PART_CATEGORY[s.id];
      return {
        kind: "categorize",
        prompt: "Sort each plant part as reproductive (involved in making seeds) or vegetative (growth and support).",
        items,
        buckets: [
          { id: "reproductive", label: "Reproductive part" },
          { id: "vegetative", label: "Vegetative part" },
        ],
        correctBucket,
        hint: "Reproductive parts are directly involved in pollination and seed production; vegetative parts support growth, water, and food-making.",
        explanation: SPOTS.map((s) => `${s.label} is a ${PART_CATEGORY[s.id]} part.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about the structure of a flowering plant.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe flower parts and reproduction.",
        explanation: fb.explanation,
      };
    }

    if (branch === "why") {
      const q = randChoice(rng, WHY_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SPOTS);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.id, label: EXPLANATIONS[s.id] })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.id] = s.id;

      return {
        kind: "click-match",
        prompt: "Match each plant part to its function.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.label} — ${EXPLANATIONS[s.id]}`).join(" "),
      };
    }

    const target = randChoice(rng, SPOTS);
    const otherLabels = SPOTS.filter((s) => s.id !== target.id).map((s) => s.label);
    const choices = shuffle(rng, [target.label, ...shuffle(rng, [...otherLabels, ...DECOYS]).slice(0, 3)]);

    return {
      kind: "hotspot",
      prompt: "Click the pin, then select the name of the labelled plant part.",
      diagram: { type: "flower" },
      spots: SPOTS.map(({ id, xPercent, yPercent, label }) => ({ id, xPercent, yPercent, label })),
      askId: target.id,
      choices,
      correctLabel: target.label,
      hint,
      explanation: EXPLANATIONS[target.id],
    };
  },
};
