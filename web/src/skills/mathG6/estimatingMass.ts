import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
function massLabel(kg: number): string {
  if (kg < 1000) return `${kg.toLocaleString()} kg`;
  return `${fmt(kg / 1000)} tonne${kg === 1000 ? "" : "s"}`;
}

// 34 real-world items with a defensible typical mass in kg.
const ITEMS = [
  { label: "a newborn baby", kg: 3 },
  { label: "a Grade 6 pupil", kg: 30 },
  { label: "an adult person", kg: 65 },
  { label: "a 2 kg packet of sugar", kg: 2 },
  { label: "a packet of maize flour", kg: 2 },
  { label: "a 90 kg sack of maize", kg: 90 },
  { label: "a bag of cement", kg: 50 },
  { label: "a goat", kg: 30 },
  { label: "a sheep", kg: 45 },
  { label: "a dairy cow", kg: 500 },
  { label: "a bull", kg: 700 },
  { label: "a donkey", kg: 130 },
  { label: "a pig", kg: 90 },
  { label: "a large dog", kg: 30 },
  { label: "an ostrich", kg: 100 },
  { label: "an elephant", kg: 5000 },
  { label: "a boda boda motorbike", kg: 110 },
  { label: "a bicycle", kg: 15 },
  { label: "a small car", kg: 1200 },
  { label: "a 14-seater matatu", kg: 2500 },
  { label: "a fully loaded delivery lorry", kg: 10000 },
  { label: "a loaded shipping container", kg: 20000 },
  { label: "a school desk", kg: 10 },
  { label: "a sack of potatoes", kg: 50 },
  { label: "a bunch of bananas", kg: 15 },
  { label: "a large watermelon", kg: 5 },
  { label: "a hen", kg: 2 },
  { label: "a rabbit", kg: 2 },
  { label: "a sack of charcoal", kg: 35 },
  { label: "a wheelbarrow full of sand", kg: 80 },
  { label: "a small aeroplane", kg: 5000 },
  { label: "a train locomotive", kg: 100000 },
  { label: "a household fridge", kg: 60 },
  { label: "a three-seater sofa", kg: 80 },
] as const;

export const estimatingMass: Skill = {
  id: "g6-math-m-estimating-mass",
  code: "M.9",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Estimating mass in kg and tonnes",
  description: "Estimate the mass of real objects in kilogrammes or tonnes, choose the sensible unit, and compare masses.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "estimate-mc",
        "unit-choice-mc",
        "categorize-best-unit",
        "click-match",
        "order-mass",
        "estimate-tonnes-fill",
      ] as const
    );

    if (branch === "estimate-mc") {
      const target = randChoice(rng, ITEMS);
      const correct = massLabel(target.kg);
      const wrongRaw = [target.kg / 10, target.kg * 10, target.kg * 100].filter((v) => v !== target.kg);
      const wrong = Array.from(new Set(wrongRaw.map((v) => massLabel(v)))).filter((w) => w !== correct);
      while (wrong.length < 3) wrong.push(massLabel(target.kg + 5000));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which is the most reasonable mass for ${target.label}?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about how this compares to things you know the mass of, like a bag of sugar (2 kg) or an adult (about 65 kg).",
        explanation: `${target.label[0].toUpperCase()}${target.label.slice(1)} has a mass of about ${correct}. The other options are off by a factor of 10 or 100.`,
      };
    }

    if (branch === "unit-choice-mc") {
      const target = randChoice(rng, ITEMS);
      const correctUnit = target.kg >= 1000 ? "Tonnes" : "Kilogrammes";
      const wrong = target.kg >= 1000 ? ["Kilogrammes", "Grams", "Litres"] : ["Tonnes", "Grams", "Litres"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctUnit, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which unit would you use to sensibly state the mass of ${target.label}?`,
        choices,
        correctIndex,
        layout: "row",
        hint: target.kg >= 1000 ? "This is far too heavy for kilogrammes to be a convenient unit." : "This is far too light to sensibly need tonnes.",
        explanation: `${target.label[0].toUpperCase()}${target.label.slice(1)} has a mass of about ${massLabel(target.kg)}, so ${correctUnit.toLowerCase()} is the sensible unit. Litres measure volume, not mass, so that can never be correct.`,
      };
    }

    if (branch === "categorize-best-unit") {
      const chosen = shuffle(rng, [...ITEMS]).slice(0, 7);
      const items = chosen.map((it, i) => ({ id: `i${i}`, label: it.label }));
      const buckets = [
        { id: "kg", label: "Best measured in kilogrammes" },
        { id: "t", label: "Best measured in tonnes" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`i${i}`] = it.kg >= 1000 ? "t" : "kg"));
      return {
        kind: "categorize",
        prompt: "Sort each item by which unit best describes its typical mass.",
        items,
        buckets,
        correctBucket,
        hint: "Items with a typical mass of 1000 kg or more are usually stated in tonnes.",
        explanation: chosen.map((it) => `${it.label}: about ${massLabel(it.kg)}`).join("; ") + ".",
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...ITEMS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((it, i) => ({ id: `i${i}`, label: it.label })));
      const targets = shuffle(rng, chosen.map((it, i) => ({ id: `i${i}`, label: massLabel(it.kg) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`i${i}`] = `i${i}`));
      return {
        kind: "click-match",
        prompt: "Match each item to its approximate mass.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the real-world size and weight of each item.",
        explanation: chosen.map((it) => `${it.label}: about ${massLabel(it.kg)}`).join("; ") + ".",
      };
    }

    if (branch === "order-mass") {
      const chosen = shuffle(rng, [...ITEMS]).slice(0, 4);
      const items = chosen.map((it, i) => ({ id: `i${i}`, label: it.label }));
      const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].kg - chosen[b].kg);
      return {
        kind: "ordering",
        prompt: "Arrange these items from lightest to heaviest.",
        instruction: "Click them in order, lightest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `i${i}`),
        hint: "Think about the typical mass of each item.",
        explanation: `In order: ${sortedIdx.map((i) => `${chosen[i].label} (about ${massLabel(chosen[i].kg)})`).join(", ")}.`,
      };
    }

    // estimate-tonnes-fill
    const target = randChoice(rng, ITEMS.filter((it) => it.kg >= 900));
    const tonnesRounded = Math.round(target.kg / 1000);
    return {
      kind: "fill-blank",
      prompt: `${target.label[0].toUpperCase()}${target.label.slice(1)} has a mass of about ${target.kg.toLocaleString()} kg. To the nearest whole tonne, what is this mass in tonnes?`,
      before: "About",
      after: "tonne(s)",
      correctAnswer: String(tonnesRounded),
      inputMode: "numeric",
      hint: "Divide by 1000, then round to the nearest whole number.",
      explanation: `${target.kg.toLocaleString()} kg ÷ 1000 = ${fmt(target.kg / 1000)} tonnes, which rounds to ${tonnesRounded} tonne${tonnesRounded === 1 ? "" : "s"}.`,
    };
  },
};
