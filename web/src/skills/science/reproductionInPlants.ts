import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FLOWER_PARTS: { name: string; role: string }[] = [
  { name: "Stamen", role: "The male reproductive part of the flower, made of the anther and filament" },
  { name: "Anther", role: "The tip of the stamen where pollen grains are produced" },
  { name: "Ovary", role: "The base of the pistil that contains ovules and develops into the fruit after fertilisation" },
  { name: "Ovule", role: "The structure inside the ovary that develops into a seed after fertilisation" },
  { name: "Stigma", role: "The sticky tip of the pistil that receives pollen grains" },
  { name: "Petal", role: "Often brightly coloured or scented to attract pollinating insects" },
];

const DISPERSAL: { fruitOrSeed: string; mode: "wind" | "water" | "animal" | "self" }[] = [
  { fruitOrSeed: "Dandelion seed (with fluffy parachute)", mode: "wind" },
  { fruitOrSeed: "Sycamore seed (with wing)", mode: "wind" },
  { fruitOrSeed: "Coconut", mode: "water" },
  { fruitOrSeed: "Water lily seed", mode: "water" },
  { fruitOrSeed: "Burr (with hooks that cling to fur)", mode: "animal" },
  { fruitOrSeed: "Berry (eaten and seeds passed out in droppings)", mode: "animal" },
  { fruitOrSeed: "Pea pod (bursts open when dry)", mode: "self" },
  { fruitOrSeed: "Balsam seed pod (explodes to fling out seeds)", mode: "self" },
];

const LIFE_CYCLE_STEPS = [
  { id: "pollination", label: "Pollination — pollen is transferred from the anther to a compatible stigma" },
  { id: "tube", label: "A pollen tube grows down through the style toward the ovary" },
  { id: "fertilisation", label: "Fertilisation — the male nucleus fuses with the egg cell inside an ovule" },
  { id: "develop", label: "The ovule develops into a seed, and the ovary develops into a fruit" },
  { id: "dispersal", label: "Seed dispersal — the seed is carried away from the parent plant" },
  { id: "germination", label: "Germination — the seed begins to grow into a new plant" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The transfer of pollen from the anther to a compatible stigma is called ", after: ".", correctAnswer: "pollination", accepted: ["pollination"], explanation: "Pollination is the transfer of pollen from the anther (male part) to a compatible stigma (female part)." },
  { before: "The joining of a male nucleus and a female egg cell inside an ovule is called ", after: ".", correctAnswer: "fertilisation", accepted: ["fertilisation", "fertilization"], explanation: "Fertilisation is the joining of a male nucleus and a female egg cell inside an ovule, leading to seed formation." },
  { before: "The scattering of seeds away from the parent plant is called seed ", after: ".", correctAnswer: "dispersal", accepted: ["dispersal"], explanation: "Seed dispersal is the scattering of seeds away from the parent plant, reducing competition for resources." },
  { before: "The process by which a seed begins to grow into a new plant is called ", after: ".", correctAnswer: "germination", accepted: ["germination"], explanation: "Germination is the process by which a seed begins to grow into a new plant." },
  { before: "The female reproductive part of a flower, made up of the stigma, style, and ovary, is called the ", after: ".", correctAnswer: "pistil", accepted: ["pistil"], explanation: "The pistil is the female reproductive part of a flower, made up of the stigma, style, and ovary." },
  { before: "A slender stalk connecting the stigma to the ovary, through which the pollen tube grows, is called the ", after: ".", correctAnswer: "style", accepted: ["style"], explanation: "The style is the slender stalk connecting the stigma to the ovary, through which the pollen tube grows." },
] as const;

const POLLINATION_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which is an adaptation of an insect-pollinated flower?",
    choices: ["Brightly coloured, scented petals with nectar", "Small, dull petals with no scent", "Long feathery stigma hanging outside the flower", "Light, powdery pollen produced in huge amounts"],
    correctIndex: 0,
    explanation: "Insect-pollinated flowers attract insects with bright colours, scent, and nectar rewards, then dust the visiting insect with sticky pollen.",
  },
  {
    prompt: "Which is an adaptation of a wind-pollinated flower?",
    choices: ["Light, powdery pollen produced in large amounts", "Bright petals to attract insects", "Sweet nectar to reward visitors", "Strong scent"],
    correctIndex: 0,
    explanation: "Wind-pollinated flowers produce large amounts of light pollen that can be carried by the wind, since they don't rely on insect visitors.",
  },
  {
    prompt: "What happens immediately after a pollen grain lands on a compatible stigma and fertilisation occurs?",
    choices: ["The ovule develops into a seed and the ovary develops into a fruit", "The petals immediately fall off", "The stigma turns into a new flower", "The plant stops growing"],
    correctIndex: 0,
    explanation: "After fertilisation, each fertilised ovule develops into a seed, and the ovary around it develops into a fruit.",
  },
];

export const reproductionInPlants: Skill = {
  id: "sci-lte-reproduction-plants",
  code: "LTE.3",
  subjectId: "science",
  strandId: "sci-lte",
  grade: 9,
  title: "Reproduction in plants",
  description: "Flower parts, pollination adaptations, fertilisation, and fruit/seed dispersal.",
  generate(rng) {
    const branch = randChoice(rng, ["parts", "dispersal", "pollination", "fill-blank", "life-cycle-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about reproduction in plants.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe pollination, fertilisation, and seed dispersal.",
        explanation: fb.explanation,
      };
    }

    if (branch === "life-cycle-order") {
      const items = shuffle(rng, LIFE_CYCLE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the stages of plant sexual reproduction, from pollination to germination, in order.",
        instruction: "Drag to reorder from the first stage to the last stage.",
        items,
        correctOrder: LIFE_CYCLE_STEPS.map((s) => s.id),
        hint: "Pollination must happen before fertilisation, which must happen before a seed can form, disperse, and germinate.",
        explanation: LIFE_CYCLE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "parts") {
      const chosen = shuffle(rng, FLOWER_PARTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.role })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.name] = p.name;

      return {
        kind: "click-match",
        prompt: "Match each part of the flower to its function in reproduction.",
        tokens,
        targets,
        correctMap,
        hint: "The stamen is the male part; the pistil (stigma, style, ovary, ovule) is the female part.",
        explanation: chosen.map((p) => `${p.name} — ${p.role.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "dispersal") {
      const chosen = shuffle(rng, DISPERSAL).slice(0, 6);
      const items = chosen.map((d, i) => ({ id: `d${i}`, label: d.fruitOrSeed }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((d, i) => (correctBucket[`d${i}`] = d.mode));

      return {
        kind: "categorize",
        prompt: "Sort each fruit or seed by how it is mainly dispersed.",
        items,
        buckets: [
          { id: "wind", label: "Wind" },
          { id: "water", label: "Water" },
          { id: "animal", label: "Animal" },
          { id: "self", label: "Self (explosive)" },
        ],
        correctBucket,
        hint: "Look at the fruit or seed's shape — a parachute, wing, hook, or floating shell are all clues.",
        explanation: chosen.map((d) => `${d.fruitOrSeed} is dispersed by ${d.mode}.`).join(" "),
      };
    }

    const q = randChoice(rng, POLLINATION_QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about whether the flower relies on insects or wind, and what happens right after fertilisation.",
      explanation: q.explanation,
    };
  },
};
