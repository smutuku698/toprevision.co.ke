import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CHANGES = [
  { text: "Melting an ice cube into water", bucket: "physical" },
  { text: "Boiling water to make steam", bucket: "physical" },
  { text: "Dissolving sugar in tea", bucket: "physical" },
  { text: "Crushing an empty soda can", bucket: "physical" },
  { text: "Cutting a sheet of paper into pieces", bucket: "physical" },
  { text: "Burning firewood in a jiko", bucket: "chemical" },
  { text: "Rusting of an iron sheet left in the rain", bucket: "chemical" },
  { text: "Frying an egg", bucket: "chemical" },
  { text: "Milk turning sour after a few days", bucket: "chemical" },
  { text: "Digesting food in the stomach", bucket: "chemical" },
] as const;

const STATE_FACTS = [
  { state: "solid" as const, label: "Solid", fact: "Particles are packed tightly in a fixed, orderly pattern and only vibrate in place." },
  { state: "liquid" as const, label: "Liquid", fact: "Particles are close together but can slide past each other, so a liquid flows and takes the shape of its container." },
  { state: "gas" as const, label: "Gas", fact: "Particles are far apart and move freely and quickly in all directions, so a gas spreads to fill its container." },
];

const IMPURITY_FACTS = [
  { prompt: "Adding salt to water before boiling it makes the water's boiling point...", correct: "rise above 100°C", wrong: ["fall below 100°C", "stay exactly at 100°C", "become impossible to reach"], explanation: "Dissolved impurities like salt raise the boiling point of water above its normal 100°C." },
  { prompt: "Adding salt to ice makes the ice melt at a temperature that is...", correct: "below 0°C", wrong: ["above 0°C", "exactly 0°C", "above 100°C"], explanation: "Impurities lower the melting point, which is why salt is spread on icy roads — it makes the ice melt even below 0°C." },
  { prompt: "Which process is used to obtain salt from seawater by leaving it in shallow pans in the sun?", correct: "Evaporation", wrong: ["Condensation", "Sublimation", "Freezing"], explanation: "The sun's heat evaporates the water, leaving the dissolved salt behind as a solid." },
  { prompt: "Water vapour turning into tiny water droplets to form clouds is an example of...", correct: "Condensation", wrong: ["Evaporation", "Sublimation", "Melting"], explanation: "Condensation is the change of state from gas (water vapour) to liquid (water droplets)." },
  { prompt: "Mothballs slowly disappearing into a gas without first turning into a liquid is called...", correct: "Sublimation", wrong: ["Evaporation", "Condensation", "Freezing"], explanation: "Sublimation is the direct change from solid to gas, skipping the liquid state." },
];

const HEATING_STAGES = [
  { id: "solid", label: "Solid — particles vibrate in fixed positions" },
  { id: "melting", label: "Melting — particles gain enough energy to break free of fixed positions" },
  { id: "liquid", label: "Liquid — particles can slide past each other" },
  { id: "boiling", label: "Boiling — particles gain enough energy to escape each other completely" },
  { id: "gas", label: "Gas — particles move freely, far apart" },
];

const EVIDENCE_OF_CHANGE: { sign: string; example: string }[] = [
  { sign: "Colour change", example: "Iron rusting turns reddish-brown" },
  { sign: "Gas produced (bubbling/fizzing)", example: "Vinegar and baking soda fizzing when mixed" },
  { sign: "Temperature change", example: "Burning firewood releases heat energy" },
  { sign: "New smell produced", example: "Sour milk smells noticeably different from fresh milk" },
  { sign: "A solid forms from two liquids (precipitate)", example: "Mixing certain clear solutions produces a cloudy solid" },
  { sign: "Difficult or impossible to reverse", example: "A fried egg cannot be turned back into a raw egg" },
];

const FILL_BLANK_TEMPLATES = [
  { before: "A change that does not form a new substance, and is often reversible, is called a ", after: " change.", correctAnswer: "physical", accepted: ["physical"], explanation: "A physical change does not form a new substance and is often reversible, such as melting or cutting." },
  { before: "A change that forms a new substance, and is usually hard to reverse, is called a ", after: " change.", correctAnswer: "chemical", accepted: ["chemical"], explanation: "A chemical change forms a new substance and is usually hard to reverse, such as burning or rusting." },
  { before: "A change that can be undone to return to the original substance is described as ", after: ".", correctAnswer: "reversible", accepted: ["reversible"], explanation: "A reversible change, like freezing water, can be undone to return to the original substance." },
  { before: "A change that cannot be undone to return to the original substance is described as ", after: ".", correctAnswer: "irreversible", accepted: ["irreversible"], explanation: "An irreversible change, like burning paper, cannot be undone to return to the original substance." },
  { before: "A solid that forms when two liquid solutions react together is called a ", after: ".", correctAnswer: "precipitate", accepted: ["precipitate"], explanation: "A precipitate is a solid that forms when two liquid solutions react together, a sign of a chemical change." },
  { before: "A substance mixed into another that changes its normal boiling or melting point is called an ", after: ".", correctAnswer: "impurity", accepted: ["impurity"], explanation: "An impurity is a substance mixed into another that changes its normal boiling or melting point." },
] as const;

export const physicalAndChemicalChanges: Skill = {
  id: "g8-sci-mec-physical-chemical-changes",
  code: "MEC.2",
  subjectId: "science",
  strandId: "g8-sci-mec",
  grade: 8,
  title: "Physical and chemical changes",
  description: "Particle behaviour in the three states of matter, effects of impurities on boiling/melting point, physical vs chemical changes, and applications of change of state.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "particle-state", "impurities", "heating-order", "evidence-match", "fill-blank"] as const);

    if (branch === "evidence-match") {
      const chosen = shuffle(rng, EVIDENCE_OF_CHANGE).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((e, i) => ({ id: `e${i}`, label: e.sign })));
      const targets = shuffle(rng, chosen.map((e, i) => ({ id: `e${i}`, label: e.example })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((e, i) => (correctMap[`e${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each sign of a chemical change to a real example of it.",
        tokens,
        targets,
        correctMap,
        hint: "A chemical change often produces a new colour, smell, gas, temperature change, or a hard-to-reverse result.",
        explanation: chosen.map((e) => `${e.sign}: ${e.example}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about physical and chemical changes.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe physical changes, chemical changes, and states of matter.",
        explanation: fb.explanation,
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, CHANGES).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each event into a physical change or a chemical change.",
        items,
        buckets: [
          { id: "physical", label: "Physical change" },
          { id: "chemical", label: "Chemical change" },
        ],
        correctBucket,
        hint: "A physical change does not form a new substance and is often reversible. A chemical change forms a new substance and is usually hard to reverse.",
        explanation: chosen.map((c) => `"${c.text}" is a ${c.bucket} change.`).join(" "),
      };
    }

    if (branch === "particle-state") {
      const target = randChoice(rng, STATE_FACTS);
      const others = STATE_FACTS.filter((s) => s.state !== target.state);
      const choices = shuffle(rng, [target.label, ...others.map((o) => o.label)]);
      return {
        kind: "multiple-choice",
        prompt: "Look at how the particles are arranged and moving in the diagram. Which state of matter does it show?",
        visual: { type: "particle-diagram", state: target.state },
        choices,
        correctIndex: choices.indexOf(target.label),
        hint: "Tightly packed and ordered = solid. Close together but jumbled = liquid. Spread far apart = gas.",
        explanation: `${target.label}: ${target.fact}`,
      };
    }

    if (branch === "impurities") {
      const q = randChoice(rng, IMPURITY_FACTS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about whether impurities make a change of state easier or harder, and match the process to its description.",
        explanation: q.explanation,
      };
    }

    // heating-order
    const items = shuffle(rng, HEATING_STAGES.map((s) => ({ id: s.id, label: s.label })));
    return {
      kind: "ordering",
      prompt: "A block of ice is heated steadily until it becomes steam. Arrange the stages in the correct order.",
      instruction: "Click them in order, from solid to gas.",
      items,
      correctOrder: HEATING_STAGES.map((s) => s.id),
      hint: "Heating adds energy to particles step by step: fixed positions → able to slide past each other → able to move freely apart.",
      explanation: HEATING_STAGES.map((s) => s.label).join(" → "),
    };
  },
};
