import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ELEMENTS: { name: string; protons: number; neutrons: number; metal: boolean }[] = [
  { name: "Hydrogen", protons: 1, neutrons: 0, metal: false },
  { name: "Helium", protons: 2, neutrons: 2, metal: false },
  { name: "Lithium", protons: 3, neutrons: 4, metal: true },
  { name: "Beryllium", protons: 4, neutrons: 5, metal: true },
  { name: "Boron", protons: 5, neutrons: 6, metal: false },
  { name: "Carbon", protons: 6, neutrons: 6, metal: false },
  { name: "Nitrogen", protons: 7, neutrons: 7, metal: false },
  { name: "Oxygen", protons: 8, neutrons: 8, metal: false },
  { name: "Fluorine", protons: 9, neutrons: 10, metal: false },
  { name: "Neon", protons: 10, neutrons: 10, metal: false },
  { name: "Sodium", protons: 11, neutrons: 12, metal: true },
  { name: "Magnesium", protons: 12, neutrons: 12, metal: true },
  { name: "Aluminium", protons: 13, neutrons: 14, metal: true },
  { name: "Silicon", protons: 14, neutrons: 14, metal: false },
  { name: "Phosphorus", protons: 15, neutrons: 16, metal: false },
  { name: "Sulfur", protons: 16, neutrons: 16, metal: false },
  { name: "Chlorine", protons: 17, neutrons: 18, metal: false },
  { name: "Argon", protons: 18, neutrons: 22, metal: false },
  { name: "Potassium", protons: 19, neutrons: 20, metal: true },
  { name: "Calcium", protons: 20, neutrons: 20, metal: true },
];

function shellArrangement(protons: number): number[] {
  const capacities = [2, 8, 8, 8, 8];
  const shells: number[] = [];
  let remaining = protons;
  for (const cap of capacities) {
    if (remaining <= 0) break;
    const take = Math.min(cap, remaining);
    shells.push(take);
    remaining -= take;
  }
  return shells;
}

const STRUCTURE_LAYERS = [
  { id: "nucleus", label: "Nucleus — contains the protons and neutrons" },
  { id: "first", label: "First electron shell — holds up to 2 electrons" },
  { id: "second", label: "Second electron shell — holds up to 8 electrons" },
  { id: "third", label: "Third electron shell — holds up to 8 electrons" },
] as const;

const PARTICLE_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which subatomic particle carries a positive charge?",
    choices: ["Proton", "Neutron", "Electron", "None of them carry a charge"],
    correctIndex: 0,
    explanation: "The proton carries a positive charge and is found in the nucleus, alongside the neutral neutron.",
  },
  {
    prompt: "Which subatomic particle carries a negative charge?",
    choices: ["Electron", "Proton", "Neutron", "None of them carry a charge"],
    correctIndex: 0,
    explanation: "The electron carries a negative charge and moves in shells around the nucleus.",
  },
  {
    prompt: "Which subatomic particle has no electric charge at all?",
    choices: ["Neutron", "Proton", "Electron", "All particles in an atom are charged"],
    correctIndex: 0,
    explanation: "The neutron is electrically neutral (no charge) and is found in the nucleus alongside the proton.",
  },
  {
    prompt: "Where are protons and neutrons located within an atom?",
    choices: ["In the nucleus, at the centre of the atom", "In shells orbiting far from the centre", "Spread evenly throughout the whole atom", "Outside the atom entirely"],
    correctIndex: 0,
    explanation: "Protons and neutrons are found together in the nucleus, the dense centre of the atom.",
  },
  {
    prompt: "A learner says electrons are found inside the nucleus alongside protons. Is this correct?",
    choices: ["No — electrons occupy shells around the nucleus, not inside it", "Yes — all three particles are in the nucleus", "Yes — but only in atoms with an even atomic number", "No — electrons are not part of an atom at all"],
    correctIndex: 0,
    explanation: "Electrons occupy shells (energy levels) around the nucleus — only protons and neutrons are inside the nucleus itself.",
  },
];

export const atomStructure: Skill = {
  id: "sci-mec-atom-structure",
  code: "MEC.1",
  subjectId: "science",
  strandId: "sci-mec",
  grade: 9,
  title: "Structure of the atom",
  description: "Mass number, electron count, and metal/non-metal classification for the first 20 elements.",
  generate(rng) {
    const branch = randChoice(rng, ["mass", "electrons", "classify", "arrangement", "structure-order", "particles"] as const);

    if (branch === "arrangement") {
      const chosen = shuffle(rng, ELEMENTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.name, label: e.name })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.name, label: shellArrangement(e.protons).join(", ") })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.name] = e.name;
      return {
        kind: "click-match",
        prompt: "Match each element to its electron arrangement (electrons per shell, from innermost outward).",
        tokens,
        targets,
        correctMap,
        hint: "Shells fill up in order: 2 in the first shell, then up to 8 in the next, then up to 8 in the next.",
        explanation: chosen.map((e) => `${e.name} (atomic number ${e.protons}) has electron arrangement ${shellArrangement(e.protons).join(", ")}.`).join(" "),
      };
    }

    if (branch === "structure-order") {
      const items = shuffle(rng, STRUCTURE_LAYERS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the parts of an atom's structure from the centre outward.",
        instruction: "Drag to reorder from the centre of the atom outward.",
        items,
        correctOrder: STRUCTURE_LAYERS.map((s) => s.id),
        hint: "The nucleus sits at the centre; electron shells surround it, filling from innermost to outermost.",
        explanation: STRUCTURE_LAYERS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
        visual: { type: "atom-structure", shells: [2, 8, 1] },
      };
    }

    if (branch === "particles") {
      const q = randChoice(rng, PARTICLE_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Remember: protons are positive, neutrons are neutral, and electrons are negative.",
        explanation: q.explanation,
      };
    }

    if (branch === "mass") {
      const el = randChoice(rng, ELEMENTS);
      return {
        kind: "fill-blank",
        prompt: `An atom of ${el.name} has ${el.protons} protons and ${el.neutrons} neutrons.`,
        before: "Its mass number is",
        after: ".",
        correctAnswer: String(el.protons + el.neutrons),
        inputMode: "numeric",
        hint: "Mass number = number of protons + number of neutrons.",
        explanation: `Mass number = protons + neutrons = ${el.protons} + ${el.neutrons} = ${el.protons + el.neutrons}.`,
        visual: { type: "atom-structure", shells: shellArrangement(el.protons) },
      };
    }

    if (branch === "electrons") {
      const el = randChoice(rng, ELEMENTS);
      return {
        kind: "fill-blank",
        prompt: `A neutral atom of ${el.name} has atomic number ${el.protons}.`,
        before: "The number of electrons in this atom is",
        after: ".",
        correctAnswer: String(el.protons),
        inputMode: "numeric",
        hint: "In a neutral atom, the number of electrons equals the number of protons (the atomic number).",
        explanation: `In a neutral atom, electrons = protons = atomic number = ${el.protons}.`,
        visual: { type: "atom-structure", shells: shellArrangement(el.protons) },
      };
    }

    const chosen = shuffle(rng, ELEMENTS).slice(0, 6);
    const items = shuffle(rng, chosen.map((e) => ({ id: e.name, label: e.name })));
    const correctBucket: Record<string, string> = {};
    for (const e of chosen) correctBucket[e.name] = e.metal ? "metal" : "non-metal";

    return {
      kind: "categorize",
      prompt: "Sort each of these elements (from the first 20 in the periodic table) into metals and non-metals.",
      items,
      buckets: [
        { id: "metal", label: "Metal" },
        { id: "non-metal", label: "Non-metal" },
      ],
      correctBucket,
      hint: "Metals tend to be shiny, conduct electricity, and lose electrons easily.",
      explanation: chosen.map((e) => `${e.name} is a ${e.metal ? "metal" : "non-metal"}.`).join(" "),
    };
  },
};
