import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CHANGES = [
  {
    from: "solid",
    to: "liquid",
    process: "melting",
    heat: true,
    direct: false,
    substances: ["ice", "candle wax", "solid butter", "chocolate"],
  },
  {
    from: "liquid",
    to: "gas",
    process: "evaporation",
    heat: true,
    direct: false,
    substances: ["water", "petrol", "perfume", "wet clothes"],
  },
  {
    from: "gas",
    to: "liquid",
    process: "condensation",
    heat: false,
    direct: false,
    substances: ["water vapour", "steam"],
  },
  {
    from: "liquid",
    to: "solid",
    process: "freezing",
    heat: false,
    direct: false,
    substances: ["water", "melted candle wax", "melted butter"],
  },
  {
    from: "solid",
    to: "gas",
    process: "sublimation",
    heat: true,
    direct: true,
    substances: ["dry ice", "mothballs", "iodine crystals"],
  },
  {
    from: "gas",
    to: "solid",
    process: "deposition",
    heat: false,
    direct: true,
    substances: ["water vapour", "carbon dioxide gas"],
  },
] as const;

const EXPLANATIONS: Record<string, string> = {
  melting:
    "Melting is when heat energy overcomes the forces holding a solid's particles in fixed positions, so they break free and flow as a liquid.",
  evaporation:
    "Evaporation is when particles at the surface of a liquid gain enough heat energy to escape and become a gas, even below boiling point.",
  condensation:
    "Condensation is when a gas loses heat energy, so its particles slow down and pack closer together to form a liquid.",
  freezing:
    "Freezing is when a liquid loses heat energy until its particles lock into fixed positions, forming a solid.",
  sublimation:
    "Sublimation is when a solid gains enough heat energy to change directly into a gas, skipping the liquid state entirely.",
  deposition:
    "Deposition is when a gas loses heat energy and changes directly into a solid, skipping the liquid state entirely.",
};

const PARTICLE_ORDER = [
  { id: "solid", label: "Solid — particles tightly packed, vibrating in fixed positions" },
  { id: "liquid", label: "Liquid — particles close together but able to move past one another" },
  { id: "gas", label: "Gas — particles far apart, moving freely and quickly" },
] as const;

export const statesOfMatter: Skill = {
  id: "sci-mfm-states-of-matter",
  code: "MFM.1",
  subjectId: "science",
  strandId: "sci-extra-practice",
  grade: 9,
  title: "Changes in state of matter",
  description: "Identify the process when a substance is heated or cooled.",
  generate(rng) {
    const change = randChoice(rng, CHANGES);
    const substance = randChoice(rng, change.substances);
    const correct = change.process;
    const directNote = change.direct ? ", without turning into a liquid first," : "";
    const hint = "Match the starting and ending states to melting, evaporation, condensation, freezing, sublimation, or deposition.";
    const situation = `${substance[0].toUpperCase()}${substance.slice(1)} changes from a ${change.from} to a ${change.to}${directNote} when it is ${change.heat ? "heated" : "cooled"}`;
    const branch = randChoice(rng, ["mc", "fb", "match", "categorize", "particle-order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CHANGES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.process, label: c.process.charAt(0).toUpperCase() + c.process.slice(1) })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.process, label: EXPLANATIONS[c.process] })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.process] = c.process;
      return {
        kind: "click-match",
        prompt: "Match each change of state to its definition.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `${c.process} — ${EXPLANATIONS[c.process]}`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CHANGES);
      const items = chosen.map((c) => ({ id: c.process, label: c.process.charAt(0).toUpperCase() + c.process.slice(1) }));
      const correctBucket: Record<string, string> = {};
      for (const c of chosen) correctBucket[c.process] = c.heat ? "heating" : "cooling";
      return {
        kind: "categorize",
        prompt: "Sort each change of state as something that happens on heating or on cooling.",
        items,
        buckets: [
          { id: "heating", label: "Happens on heating" },
          { id: "cooling", label: "Happens on cooling" },
        ],
        correctBucket,
        hint: "Heating gives particles more energy to break free; cooling takes energy away so particles settle closer together.",
        explanation: chosen.map((c) => `${c.process} happens on ${c.heat ? "heating" : "cooling"}.`).join(" "),
      };
    }

    if (branch === "particle-order") {
      const items = shuffle(rng, PARTICLE_ORDER.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these states of matter from least to most particle movement/energy.",
        instruction: "Drag to reorder from least to most particle movement.",
        items,
        correctOrder: PARTICLE_ORDER.map((s) => s.id),
        hint: "Particles gain more energy and spread further apart as a substance goes from solid to liquid to gas.",
        explanation: PARTICLE_ORDER.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const distractors = CHANGES.map((c) => c.process).filter((p) => p !== correct);
      const choices = shuffle(rng, [correct, ...shuffle(rng, distractors).slice(0, 3)]);

      return {
        kind: "multiple-choice",
        prompt: `${situation}. What is this process called?`,
        visual: { type: "particle-diagram", state: change.from },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "grid",
        hint,
        explanation: EXPLANATIONS[correct],
      };
    }

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word.",
      before: `${situation}. This process is called`,
      after: ".",
      correctAnswer: correct,
      inputMode: "text",
      visual: { type: "particle-diagram", state: change.from },
      hint,
      explanation: EXPLANATIONS[correct],
    };
  },
};
