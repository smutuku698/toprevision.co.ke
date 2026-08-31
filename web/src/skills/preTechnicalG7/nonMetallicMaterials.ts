import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const MATERIALS = [
  { id: "wood", label: "Wood", material: "wood" as const, use: "Making furniture, doors and roof frames", cluster: "organic" },
  { id: "stone", label: "Stone", material: "stone" as const, use: "Building foundations and walls", cluster: "rigid" },
  { id: "plastic", label: "Plastic", material: "plastic" as const, use: "Making containers, pipes and packaging", cluster: "organic" },
  { id: "glass", label: "Glass", material: "glass" as const, use: "Making windows, bottles and mirrors", cluster: "rigid" },
  { id: "cement", label: "Cement", material: "cement" as const, use: "Making concrete for construction", cluster: "rigid" },
  { id: "ceramic", label: "Ceramic", material: "ceramic" as const, use: "Making floor tiles and pottery", cluster: "rigid" },
  { id: "rubber", label: "Rubber", material: "rubber" as const, use: "Making tyres and shoe soles", cluster: "organic" },
  { id: "paper", label: "Paper", material: "paper" as const, use: "Making books and packaging", cluster: "organic" },
] as const;

const ORIGIN_ITEMS = [
  { text: "Timber cut directly from trees", bucket: "natural" },
  { text: "Stone quarried straight from rock", bucket: "natural" },
  { text: "Natural rubber latex tapped from a rubber tree", bucket: "natural" },
  { text: "Clay dug directly from the ground before firing", bucket: "natural" },
  { text: "Sand collected from a riverbed before it is processed", bucket: "natural" },
  { text: "Plastic moulded from petroleum-based polymers", bucket: "synthetic" },
  { text: "Glass made by melting sand at a very high temperature", bucket: "synthetic" },
  { text: "Cement manufactured by heating limestone and clay together", bucket: "synthetic" },
  { text: "Ceramic tiles made by firing clay in a kiln at high temperature", bucket: "synthetic" },
  { text: "Paper manufactured by processing and pressing wood pulp", bucket: "synthetic" },
] as const;

const FIRE_RESISTANCE_SETS = [
  { least: "wood", others: ["stone", "glass", "cement"] },
  { least: "paper", others: ["stone", "glass", "ceramic"] },
  { least: "rubber", others: ["stone", "cement", "ceramic"] },
  { least: "plastic", others: ["stone", "glass", "cement"] },
  { least: "wood", others: ["glass", "ceramic", "cement"] },
  { least: "paper", others: ["glass", "cement", "stone"] },
  { least: "plastic", others: ["ceramic", "stone", "glass"] },
] as const;

const APPEARANCE_FACTS = [
  { id: "wood", label: "Wood", fact: "Brown in colour, with a natural grainy texture showing the wood grain" },
  { id: "glass", label: "Glass", fact: "Usually transparent or clear, with a smooth, shiny texture" },
  { id: "ceramic", label: "Ceramic", fact: "Often white or cream, with a smooth, glossy texture after glazing" },
  { id: "rubber", label: "Rubber", fact: "Commonly black, with a soft, flexible texture" },
  { id: "stone", label: "Stone", fact: "Usually grey, with a rough, hard texture" },
  { id: "plastic", label: "Plastic", fact: "Comes in many colours, with a smooth, lightweight texture" },
  { id: "cement", label: "Cement", fact: "Grey in colour, with a dull, powdery-to-hard texture once set" },
  { id: "paper", label: "Paper", fact: "Usually white or cream, with a thin, smooth or slightly rough texture" },
] as const;

const HARDNESS_ORDER = [
  { id: "rubber", label: "Rubber" },
  { id: "wood", label: "Wood" },
  { id: "glass", label: "Glass" },
] as const;

export const nonMetallicMaterials: Skill = {
  id: "g7-pt-mat-non-metallic-materials",
  code: "MAT.3",
  subjectId: "pre-technical",
  strandId: "g7-pt-materials",
  grade: 7,
  title: "Non-metallic materials",
  description: "Identifying non-metallic materials (wood, stone, plastics, glass, cement, ceramics, rubber, paper); categorising them as natural or synthetic; comparing physical properties such as hardness and fire resistance; and relating each to its use.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-material", "origin-sort", "use-match", "fire-resistance", "hardness-order", "appearance-match", "fill-ceramic"] as const);

    if (branch === "identify-material") {
      const target = randChoice(rng, MATERIALS);
      // Distractors come from the same cluster (rigid/brittle vs organic/flexible) — a learner
      // is never offered an obviously-unrelated wrong answer like "paper" next to a stone swatch.
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        MATERIALS.filter((m) => m.id !== target.id && m.cluster === target.cluster).map((m) => m.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Identify this non-metallic material.",
        visual: { type: "material-swatch", material: target.material },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is ${target.label.toLowerCase()}. It is commonly used for ${target.use.toLowerCase()}.`,
      };
    }

    if (branch === "origin-sort") {
      const chosen = shuffle(rng, ORIGIN_ITEMS);
      const items = chosen.map((o, i) => ({ id: `o${i}`, label: o.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((o, i) => (correctBucket[`o${i}`] = o.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each non-metallic material as natural or synthetic (man-made).",
        items,
        buckets: [
          { id: "natural", label: "Natural" },
          { id: "synthetic", label: "Synthetic" },
        ],
        correctBucket,
        hint: "A natural material occurs as it is in nature; a synthetic material is manufactured through a process.",
        explanation: chosen.map((o) => `"${o.text}" is ${o.bucket === "natural" ? "a natural" : "a synthetic (man-made)"} material.`).join(" "),
      };
    }

    if (branch === "use-match") {
      const chosen = shuffle(rng, MATERIALS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.use })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each non-metallic material to its common use.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the physical properties that make each material suited to that job.",
        explanation: chosen.map((m) => `${m.label} — used for ${m.use.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fire-resistance") {
      const set = randChoice(rng, FIRE_RESISTANCE_SETS);
      const leastMaterial = MATERIALS.find((m) => m.id === set.least)!;
      const optionMaterials = shuffle(rng, [leastMaterial, ...set.others.map((id) => MATERIALS.find((m) => m.id === id)!)]);
      const choices = optionMaterials.map((m) => m.label);
      return {
        kind: "multiple-choice",
        prompt: "Which of these non-metallic materials is LEAST fire resistant (burns most easily)?",
        choices,
        correctIndex: choices.indexOf(leastMaterial.label),
        layout: "list",
        explanation: `${leastMaterial.label} is least fire resistant among these — it burns easily, while ${set.others.map((id) => MATERIALS.find((m) => m.id === id)!.label).join(", ")} resist fire much better.`,
      };
    }

    if (branch === "hardness-order") {
      const shuffled = shuffle(rng, HARDNESS_ORDER);
      return {
        kind: "ordering",
        prompt: "Arrange these non-metallic materials from softest/most flexible to hardest.",
        items: shuffled.map((m) => ({ id: m.id, label: m.label })),
        correctOrder: HARDNESS_ORDER.map((m) => m.id),
        instruction: "Drag to arrange from softest to hardest.",
        hint: "Rubber bends easily, wood is moderately hard, and glass is very hard (though brittle).",
        explanation: "From softest/most flexible to hardest: Rubber, Wood, Glass.",
      };
    }

    if (branch === "appearance-match") {
      const chosen = shuffle(rng, APPEARANCE_FACTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.fact })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: "Match each non-metallic material to its colour and texture.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each material typically looks and feels like.",
        explanation: chosen.map((a) => `${a.label} — ${a.fact}.`).join(" "),
      };
    }

    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: "A material that is hard, brittle, and made by firing clay at a high temperature is called ",
      after: ".",
      correctAnswer: "ceramic",
      acceptedAnswers: ["ceramic", "ceramics"],
      inputMode: "text",
      hint: "This material is used to make floor tiles and pottery.",
      explanation: "Ceramic is made by firing clay at high temperature, producing a hard but brittle material.",
    };
  },
};
