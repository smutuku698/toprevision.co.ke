import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ENERGY_SOURCES = [
  { name: "Sunlight (solar)", type: "renewable" },
  { name: "Wind", type: "renewable" },
  { name: "Flowing water (hydro)", type: "renewable" },
  { name: "Geothermal steam", type: "renewable" },
  { name: "Biomass (firewood, crop waste)", type: "renewable" },
  { name: "Coal", type: "non-renewable" },
  { name: "Petroleum (crude oil)", type: "non-renewable" },
  { name: "Natural gas", type: "non-renewable" },
] as const;

const TRANSFORMATIONS = [
  { device: "Solar panel", change: "Light energy to electrical energy" },
  { device: "Torch (flashlight)", change: "Chemical energy to electrical energy to light energy" },
  { device: "Hydroelectric turbine", change: "Kinetic energy of flowing water to electrical energy" },
  { device: "Burning firewood", change: "Chemical energy to heat energy and light energy" },
  { device: "A stone falling off a cliff", change: "Potential energy to kinetic energy" },
  { device: "An electric bulb", change: "Electrical energy to light energy and heat energy" },
  { device: "A moving vehicle burning fuel", change: "Chemical energy to kinetic energy" },
  { device: "A wind turbine", change: "Kinetic energy of wind to electrical energy" },
] as const;

const SAFETY_QUESTIONS = [
  { prompt: "Which is a safety measure when using electrical energy at home?", correct: "Switching off appliances that are not in use", wrong: ["Overloading a single socket with many plugs", "Using appliances with damaged wires", "Leaving a hot jiko unattended"] },
  { prompt: "Why should sockets not be overloaded with too many appliances?", correct: "It can cause overheating and start an electrical fire", wrong: ["It makes the appliances run faster", "It saves electricity", "It has no effect at all"] },
  { prompt: "What is a safe practice when handling fuels like petrol or paraffin?", correct: "Keeping them away from naked flames and storing them in proper containers", wrong: ["Storing them near a cooking fire for convenience", "Mixing different fuels together", "Leaving containers open to the air"] },
  { prompt: "Which is a benefit of using energy-saving equipment such as LED bulbs?", correct: "It transforms more of the electrical energy into light and wastes less as heat", wrong: ["It uses more electrical energy than ordinary bulbs", "It cannot be switched off", "It only works with solar power"] },
] as const;

const ENERGY_CHAIN = [
  { id: "potential", label: "Water stored behind the dam has potential energy" },
  { id: "kinetic", label: "The water is released and flows downhill, gaining kinetic energy" },
  { id: "mechanical", label: "The flowing water turns the turbine blades, giving mechanical energy" },
  { id: "electrical", label: "The turning turbine drives a generator, producing electrical energy" },
];

export const transformationOfEnergy: Skill = {
  id: "g8-sci-fe-transformation-of-energy",
  code: "FE.1",
  subjectId: "science",
  strandId: "g8-sci-fe",
  grade: 8,
  title: "Transformation of energy",
  description: "Renewable and non-renewable energy sources, energy transformations, safety measures, and an energy chain in a hydroelectric station.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "transform-match", "safety", "chain-order"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, [...ENERGY_SOURCES]).slice(0, 6);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.type));
      return {
        kind: "categorize",
        prompt: "Sort each energy source as renewable or non-renewable.",
        items,
        buckets: [
          { id: "renewable", label: "Renewable" },
          { id: "non-renewable", label: "Non-renewable" },
        ],
        correctBucket,
        hint: "A renewable source is naturally replaced faster than we use it up. A non-renewable source takes millions of years to form and will eventually run out.",
        explanation: chosen.map((e) => `${e.name} is ${e.type === "renewable" ? "a renewable" : "a non-renewable"} energy source.`).join(" "),
      };
    }

    if (branch === "transform-match") {
      const chosen = shuffle(rng, [...TRANSFORMATIONS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.device, label: t.device })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.device, label: t.change })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.device] = t.device;
      return {
        kind: "click-match",
        prompt: "Match each device or process to the energy transformation it involves.",
        tokens,
        targets,
        correctMap,
        hint: "Trace the energy from its starting form to what the device produces.",
        explanation: chosen.map((t) => `${t.device}: ${t.change}.`).join(" "),
      };
    }

    if (branch === "safety") {
      const q = randChoice(rng, SAFETY_QUESTIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        explanation: q.correct,
      };
    }

    // chain-order
    const items = shuffle(rng, ENERGY_CHAIN);
    return {
      kind: "ordering",
      prompt: "Arrange these stages of energy transformation at a hydroelectric power station in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: ENERGY_CHAIN.map((s) => s.id),
      hint: "Follow the energy from stored water to the electricity that finally reaches homes.",
      explanation: ENERGY_CHAIN.map((s) => s.label).join(" → "),
    };
  },
};
