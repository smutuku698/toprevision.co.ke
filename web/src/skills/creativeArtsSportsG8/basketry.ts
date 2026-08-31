import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATERIALS = [
  { id: "sisal", label: "Sisal", source: "From the long leaf fibres of the sisal plant" },
  { id: "banana-fibre", label: "Banana fibre", source: "From the stem of the banana plant" },
  { id: "raffia", label: "Raffia", source: "From the leaves of the raffia palm" },
  { id: "synthetic", label: "Recyclable synthetic fabric", source: "From recycled plastic or fabric waste" },
];

const ITEMS_MADE = ["Mat", "Tray", "Basket", "Hat"];

const COIL_STEPS = [
  { id: "prepare", label: "Prepare and soften the chosen fibre" },
  { id: "roll", label: "Roll the fibre into a long coil, or rope" },
  { id: "base", label: "Wind the coil into a tight, flat spiral to form the base" },
  { id: "stitch", label: "Stitch each new round to the previous round with a binding fibre" },
  { id: "sides", label: "Continue coiling and stitching upward to build the sides" },
  { id: "finish", label: "Finish and secure the end of the coil" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What does the coil technique in basketry involve?", correct: "Winding a rolled fibre into rounds and stitching each round to the one before it", distractors: ["Weaving fibres over and under each other on a loom", "Pouring liquid clay into a mould", "Carving the item from a solid block of wood"] },
  { q: "How does basket making contribute to the economic well-being of communities?", correct: "It provides income through selling handmade baskets, mats, and other woven items, including to tourists", distractors: ["It has no effect on household income", "It only provides items for personal use, never for sale", "It replaces the need for any other form of employment"] },
  { q: "Why might a basket maker choose recyclable synthetic fabric as a material?", correct: "It reuses waste material, reducing environmental impact while still being durable and colourful", distractors: ["It is the only material that can ever be coiled", "It has no advantage over natural fibres", "It cannot be dyed or coloured"] },
  { q: "Which of these is typically made using the coil technique?", correct: "A woven basket, mat, or tray", distractors: ["A painted canvas", "A carved wooden stool", "A metal cooking pot"] },
  { q: "Why is basketry considered an indigenous craft in Kenya?", correct: "It uses locally available natural materials and skills passed down through generations within communities", distractors: ["It was recently introduced from outside Kenya", "It uses only materials that cannot be found locally", "It has no connection to any particular community's traditions"] },
];

const SORT_PROMPTS = [
  "Sort each word into Material used in basketry or Item made through coiling.",
  "Which category does each word below belong to? Sort them.",
  "Classify each word as a material or an item made through coiling.",
  "Decide whether each word is a material or a finished item, and sort it.",
  "Sort these words by the category they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each basketry material to the plant or source it comes from.",
  "Pair each material below with its plant or source.",
  "Match each material to what it comes from.",
  "Connect each basketry material to its source.",
  "For each material below, choose its matching source.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the correct order for making a basketry item using the coil technique.",
  "Put these coil-technique steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these steps into the correct sequence for coiling a basket.",
  "Place these coiling steps in the order you would follow them.",
] as const;

export const basketry: Skill = {
  id: "g8-cas-basketry",
  code: "C.11",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Indigenous Kenyan Craft (Basketry)",
  description: "Basketry materials (sisal, banana fibre, raffia, recyclable synthetic fabric), the coil technique, and basketry's economic role.",
  generate(rng) {
    const branch = randChoice(rng, ["material-item-sort", "material-source-match", "coil-order", "theory-mc"] as const);

    if (branch === "material-item-sort") {
      const materialPicks = shuffle(rng, MATERIALS.map((m) => m.label)).slice(0, 3);
      const itemPicks = shuffle(rng, ITEMS_MADE).slice(0, 3);
      const items = shuffle(rng, [
        ...materialPicks.map((label) => ({ label, bucket: "material" })),
        ...itemPicks.map((label) => ({ label, bucket: "item" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.label] = it.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "material", label: "Material used in basketry" },
          { id: "item", label: "Item made through coiling" },
        ],
        correctBucket,
        hint: "Materials are the raw fibres a basket maker starts with; items are the finished coiled products.",
        explanation: items.map((it) => `"${it.label}" is ${it.bucket === "material" ? "a material used in basketry" : "an item made through coiling"}.`).join(" "),
      };
    }

    if (branch === "material-source-match") {
      const chosen = shuffle(rng, MATERIALS);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.source })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Sisal, banana fibre, and raffia all come from plants; synthetic fabric comes from recycled waste.",
        explanation: chosen.map((m) => `${m.label}: ${m.source}.`).join(" "),
      };
    }

    if (branch === "coil-order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, COIL_STEPS),
        correctOrder: COIL_STEPS.map((s) => s.id),
        hint: "The base is built first, from the centre outward, before the sides are added and the end is finished.",
        explanation: `The order is: ${COIL_STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "The coil technique winds and stitches fibre rounds; basketry can also generate income for communities.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
