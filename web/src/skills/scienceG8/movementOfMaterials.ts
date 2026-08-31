import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const EXAMPLES = [
  { text: "The smell of cooking food spreading through the whole house", bucket: "diffusion" },
  { text: "Oxygen moving from the alveoli in the lungs into the blood", bucket: "diffusion" },
  { text: "Digested food particles moving from the intestine into the bloodstream", bucket: "diffusion" },
  { text: "Carbon dioxide moving from the blood into the alveoli to be breathed out", bucket: "diffusion" },
  { text: "A drop of ink spreading out evenly when placed in a glass of water", bucket: "diffusion" },
  { text: "A root hair cell absorbing water from moist soil", bucket: "osmosis" },
  { text: "A plant cell placed in salty water losing water and becoming limp", bucket: "osmosis" },
  { text: "A red blood cell placed in pure water swelling up", bucket: "osmosis" },
  { text: "Water moving from the soil into a plant's roots and up the stem", bucket: "osmosis" },
] as const;

const TERMS = [
  { term: "Diffusion", meaning: "The movement of particles from a region of high concentration to a region of low concentration" },
  { term: "Osmosis", meaning: "The movement of water molecules from a region of high water concentration to a region of low water concentration through a partially permeable membrane" },
  { term: "Partially permeable membrane", meaning: "A membrane that allows some particles, such as water, to pass through but not others" },
  { term: "Concentration gradient", meaning: "The difference in concentration of a substance between two regions" },
  { term: "Turgidity", meaning: "The firm, swollen state of a plant cell when it has absorbed water by osmosis" },
  { term: "Plasmolysis", meaning: "The shrinking of a plant cell's contents away from its cell wall after losing water by osmosis" },
] as const;

const PREDICTIONS = [
  { prompt: "A plant cell is placed in a solution with a lower water concentration than the cell (very salty water). What happens to the cell?", correct: "It loses water and becomes limp (plasmolysed)", wrong: ["It gains water and becomes turgid", "It stays exactly the same", "It immediately bursts"] },
  { prompt: "A plant cell is placed in a solution with a higher water concentration than the cell (almost pure water). What happens to the cell?", correct: "It gains water and becomes firm (turgid)", wrong: ["It loses water and becomes limp", "It stays exactly the same", "It shrinks and dies"] },
  { prompt: "An animal cell, such as a red blood cell, is placed in a solution with a much higher water concentration than the cell. What is likely to happen?", correct: "It gains water and may burst, since it has no cell wall to resist swelling", wrong: ["It loses water and shrivels", "It stays exactly the same, protected by its cell wall", "It immediately dissolves"] },
  { prompt: "Why do root hair cells keep absorbing water from the soil by osmosis, even after rain has stopped for a few days?", correct: "Because the soil water still has a higher water concentration than the cell sap inside the root hair cell", wrong: ["Because root hair cells actively pump water in using energy", "Because roots are always drier than the surrounding soil", "Because osmosis only happens when it is raining"] },
] as const;

const EXPERIMENT_STEPS = [
  { id: "fill", label: "Fill a beaker with clean water and let it settle" },
  { id: "drop", label: "Gently drop a single crystal of potassium permanganate into the beaker" },
  { id: "wait", label: "Leave the beaker undisturbed, without stirring" },
  { id: "observe", label: "Observe the purple colour spreading evenly through the water over time" },
];

export const movementOfMaterials: Skill = {
  id: "g8-sci-lte-movement-of-materials",
  code: "LTE.2",
  subjectId: "science",
  strandId: "g8-sci-lte",
  grade: 8,
  title: "Movement of materials in and out of the cell",
  description: "Diffusion and osmosis, their role in living things, and predicting what happens to cells in different solutions.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "terms", "predict", "experiment"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, EXAMPLES).slice(0, 6);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example into diffusion or osmosis.",
        items,
        buckets: [
          { id: "diffusion", label: "Diffusion" },
          { id: "osmosis", label: "Osmosis" },
        ],
        correctBucket,
        hint: "Osmosis is specifically about water moving through a partially permeable membrane. Diffusion covers any particle spreading from high to low concentration.",
        explanation: chosen.map((e) => `"${e.text}" is an example of ${e.bucket}.`).join(" "),
      };
    }

    if (branch === "terms") {
      const chosen = shuffle(rng, [...TERMS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each term to its correct meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Read each meaning carefully — some terms sound similar but describe different things.",
        explanation: chosen.map((t) => `${t.term}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "predict") {
      const q = randChoice(rng, PREDICTIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Water moves from where there is more water (dilute) to where there is less water (concentrated), across a partially permeable membrane.",
        explanation: q.correct,
      };
    }

    // experiment
    const items = shuffle(rng, EXPERIMENT_STEPS);
    return {
      kind: "ordering",
      prompt: "A student wants to demonstrate diffusion using a crystal of potassium permanganate. Arrange the steps in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: EXPERIMENT_STEPS.map((s) => s.id),
      hint: "Set up first, introduce the substance, then observe without disturbing it — diffusion happens on its own.",
      explanation: EXPERIMENT_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
