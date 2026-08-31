import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { GRADE7_PHOTO_IMAGES } from "@/lib/photoImages";
import type { Skill } from "@/lib/types";

const APPARATUS = [
  { id: "beaker", label: "Beaker", use: "Mixing, stirring and heating liquids in approximate volumes" },
  { id: "test-tube", label: "Test tube", use: "Holding small samples of liquid or solid for a reaction or heating" },
  { id: "measuring-cylinder", label: "Measuring cylinder", use: "Measuring the exact volume of a liquid" },
  { id: "bunsen-burner", label: "Bunsen burner", use: "Providing a controlled flame for heating substances" },
  { id: "microscope", label: "Microscope", use: "Magnifying very small specimens so fine details can be seen" },
  { id: "conical-flask", label: "Conical flask", use: "Swirling and mixing liquids without spilling, or collecting a distillate" },
  { id: "evaporating-dish", label: "Evaporating dish", use: "Heating a solution so the liquid evaporates, leaving the dissolved solid behind" },
  { id: "test-tube-rack", label: "Test tube rack", use: "Holding several test tubes upright and safely during an experiment" },
] as const;

// 7 SI base quantities + 4 derived — full curriculum list (was previously missing amount of substance and
// light intensity; see curriculum-reference/CURRICULUM-MINING-GUIDE.md, this skill is the case study it cites).
const SI_UNITS = [
  { quantity: "Length", unit: "metre (m)", type: "basic", confusedWith: ["Area", "Volume"] },
  { quantity: "Mass", unit: "kilogram (kg)", type: "basic", confusedWith: ["Density"] },
  { quantity: "Time", unit: "second (s)", type: "basic", confusedWith: ["Speed"] },
  { quantity: "Electric current", unit: "ampere (A)", type: "basic", confusedWith: ["Voltage (not a basic quantity here)", "Speed", "Mass"] },
  { quantity: "Temperature", unit: "kelvin (K)", type: "basic", confusedWith: ["Mass", "Length"] },
  { quantity: "Amount of substance", unit: "mole (mol)", type: "basic", confusedWith: ["Mass", "Volume"] },
  { quantity: "Light intensity", unit: "candela (cd)", type: "basic", confusedWith: ["Temperature", "Electric current"] },
  { quantity: "Area", unit: "square metre (m²)", type: "derived", confusedWith: ["Length", "Volume"] },
  { quantity: "Volume", unit: "cubic metre (m³)", type: "derived", confusedWith: ["Area", "Mass"] },
  { quantity: "Speed", unit: "metre per second (m/s)", type: "derived", confusedWith: ["Time", "Length"] },
  { quantity: "Density", unit: "kilogram per cubic metre (kg/m³)", type: "derived", confusedWith: ["Mass", "Volume"] },
] as const;

// All 7 basic science process skills named in the curriculum (was previously missing manipulative,
// measurement, communication and conclusion — only observation, classification and prediction were covered).
const SKILL_QUESTIONS = [
  {
    prompt: "A learner watches a candle burn and writes down what they notice happening. Which basic science skill are they using?",
    correct: "Observation",
    wrong: ["Classification", "Prediction", "Measurement"],
    explanation: "Observation is the skill of carefully watching and noting what happens during an investigation.",
  },
  {
    prompt: "A learner sorts a collection of rocks into groups based on colour and texture. Which basic science skill are they using?",
    correct: "Classification",
    wrong: ["Communication", "Manipulation", "Observation"],
    explanation: "Classification is the skill of grouping objects or organisms based on shared characteristics.",
  },
  {
    prompt: "Before mixing two chemicals, a learner says what they think will happen. Which basic science skill are they using?",
    correct: "Prediction",
    wrong: ["Measurement", "Conclusion", "Manipulation"],
    explanation: "Prediction is the skill of stating what you expect to happen, based on what you already know, before testing it.",
  },
  {
    prompt: "A learner carefully adjusts the focus knob and moves the slide into position on a microscope. Which basic science skill are they using?",
    correct: "Manipulation",
    wrong: ["Observation", "Conclusion", "Communication"],
    explanation: "Manipulation is the skill of skilfully handling apparatus and instruments to carry out an investigation.",
  },
  {
    prompt: "A learner uses a measuring cylinder to record that a liquid has a volume of exactly 35 cm³. Which basic science skill are they using?",
    correct: "Measurement",
    wrong: ["Prediction", "Classification", "Manipulation"],
    explanation: "Measurement is the skill of using instruments to record quantities as numbers with units.",
  },
  {
    prompt: "After finishing an experiment, a learner presents their results to the rest of the class as a short talk. Which basic science skill are they using?",
    correct: "Communication",
    wrong: ["Conclusion", "Observation", "Prediction"],
    explanation: "Communication is the skill of sharing findings clearly with others, in speech, writing or diagrams.",
  },
  {
    prompt: "After collecting and studying all their results, a learner states what the investigation shows overall. Which basic science skill are they using?",
    correct: "Conclusion",
    wrong: ["Prediction", "Manipulation", "Classification"],
    explanation: "Conclusion is the skill of interpreting results to state what an investigation has shown.",
  },
] as const;

// --- Photo-diagram content ---------------------------------------------------------------------
// Image + part data now lives in the cross-skill/cross-subject shared registry (web/src/lib/photoImages.ts)
// rather than being duplicated here — see that file's header comment for why: the same labelled photo is
// meant to be reusable by any skill in any subject that has a genuine curriculum reason to reference it, all
// drawing from one verified letter→part mapping instead of each skill re-deriving its own.
const { labApparatus: LAB_APPARATUS_IMG, microscope: MICROSCOPE_IMG, bunsenBurner: BUNSEN_IMG } = GRADE7_PHOTO_IMAGES;

const APPARATUS_APPLY_SCENARIOS = [
  { need: "measure exactly 25 cm³ of a solution before mixing it with an acid", answer: "Measuring cylinder", wrong: ["Beaker", "Conical flask", "Evaporating dish"] },
  { need: "heat a salt solution until the water evaporates and crystals are left behind", answer: "Evaporating dish", wrong: ["Beaker", "Test tube", "Conical flask"] },
  { need: "safely swirl a liquid during an experiment without it splashing out", answer: "Conical flask", wrong: ["Beaker", "Measuring cylinder", "Test tube rack"] },
  { need: "hold several test tubes upright while their reactions finish", answer: "Test tube rack", wrong: ["Test tube", "Beaker", "Evaporating dish"] },
  { need: "look closely at a thin slice of onion skin to see its individual cells", answer: "Microscope", wrong: ["Measuring cylinder", "Evaporating dish", "Conical flask"] },
] as const;

const APPARATUS_CARE_SCENARIOS = [
  { desc: "A learner picks up a hot evaporating dish straight off the bunsen burner using their bare hand.", isSafe: false, why: "Ceramic dishes stay very hot after heating — always use tongs or let it cool, never pick it up bare-handed." },
  { desc: "A learner washes a used test tube and places it upside down in the rack to dry.", isSafe: true, why: "Washing apparatus after use and drying it properly is correct care, and prevents contaminating the next experiment." },
  { desc: "A learner reads the volume in a measuring cylinder by looking down at it from above at an angle.", isSafe: false, why: "Reading from an angle causes parallax error — a measuring cylinder should be read at eye level, at the bottom of the liquid's curve (the meniscus)." },
  { desc: "A learner stores the microscope with a dust cover over it after use.", isSafe: true, why: "This is correct care — a dust cover protects the lenses and keeps the instrument ready for the next use." },
] as const;

const MICROSCOPE_APPLY_SCENARIOS = [
  { q: "A learner's slide looks too dark to see anything clearly. Which part should they adjust first?", answer: "Diaphragm", wrong: ["Base", "Body tube", "Stage"] },
  { q: "A learner wants to switch from a lower magnification to a higher one. Which part do they turn?", answer: "Revolving nosepiece", wrong: ["Stage", "Base", "Mirror / light source"] },
  { q: "A learner has placed a slide on the microscope but the image is blurry. Which part should they turn to bring it into focus?", answer: "Adjustment knob", wrong: ["Diaphragm", "Mirror / light source", "Eyepiece (ocular lens)"] },
  { q: "Which part firmly holds the glass slide in place while it is being viewed?", answer: "Stage", wrong: ["Base", "Body tube", "Revolving nosepiece"] },
] as const;

const BUNSEN_SAFETY_SCENARIOS = [
  { desc: "the air hole is fully open", flame: "a hot, roaring blue flame that is almost invisible", isSafe: true, why: "A fully-open air hole gives a hotter, cleaner, complete-combustion blue flame — the correct setting for heating, though its near-invisibility is itself something to stay alert for." },
  { desc: "the air hole is fully closed", flame: "a cooler, yellow, flickering, smoky flame", isSafe: false, why: "A closed air hole starves the flame of oxygen, producing an unsafe, sooty yellow flame that does not heat efficiently — never leave a bunsen burner on this setting while working." },
] as const;

export const labApparatusUnits: Skill = {
  id: "g7-sci-si-apparatus",
  code: "SI.3",
  subjectId: "science",
  strandId: "g7-sci-si",
  grade: 7,
  title: "Laboratory apparatus, instruments and SI units",
  description: "Identifying and using common laboratory apparatus, basic science process skills, and SI units for basic and derived quantities.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-apparatus",
        "apparatus-use-match",
        "unit-sort",
        "unit-fill",
        "skill-knowledge",
        "photo-apparatus-identify",
        "photo-apparatus-scenario",
        "photo-apparatus-care-evaluate",
        "photo-microscope-identify",
        "photo-microscope-apply",
        "photo-bunsen-identify",
        "photo-bunsen-safety-evaluate",
      ] as const
    );

    if (branch === "identify-apparatus") {
      const target = randChoice(rng, APPARATUS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        APPARATUS.filter((a) => a.id !== target.id).map((a) => a.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Identify this piece of laboratory apparatus.",
        visual: { type: "lab-apparatus", item: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label}. It is used for: ${target.use.toLowerCase()}.`,
      };
    }

    if (branch === "apparatus-use-match") {
      const chosen = shuffle(rng, APPARATUS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.use })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: "Match each apparatus to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what job each piece of apparatus is designed to do.",
        explanation: chosen.map((a) => `${a.label} — ${a.use}.`).join(" "),
      };
    }

    if (branch === "unit-sort") {
      const chosen = shuffle(rng, SI_UNITS).slice(0, 6);
      const items = chosen.map((u, i) => ({ id: `u${i}`, label: u.quantity }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((u, i) => (correctBucket[`u${i}`] = u.type));
      return {
        kind: "categorize",
        prompt: "Sort each quantity as basic or derived.",
        items,
        buckets: [
          { id: "basic", label: "Basic quantity" },
          { id: "derived", label: "Derived quantity" },
        ],
        correctBucket,
        hint: "A derived quantity is calculated by combining two or more basic quantities (for example, speed = distance ÷ time).",
        explanation: chosen.map((u) => `${u.quantity} (${u.unit}) is a ${u.type} quantity.`).join(" "),
      };
    }

    if (branch === "unit-fill") {
      const u = randChoice(rng, SI_UNITS);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence with the correct SI unit.",
        before: `The SI unit of ${u.quantity.toLowerCase()} is the `,
        after: ".",
        correctAnswer: u.unit.replace(/\s*\([^)]*\)/, ""),
        acceptedAnswers: [u.unit, u.unit.replace(/\s*\([^)]*\)/, "")],
        inputMode: "text",
        hint: `Its symbol is written as ${u.unit.match(/\(([^)]*)\)/)?.[1] ?? ""}.`,
        explanation: `The SI unit of ${u.quantity.toLowerCase()} is the ${u.unit}.`,
      };
    }

    if (branch === "photo-apparatus-identify") {
      const target = randChoice(rng, LAB_APPARATUS_IMG.parts);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.name, target.confusedWith, 3);
      return {
        kind: "multiple-choice",
        prompt: `Look at the labelled photo of laboratory apparatus. What is the apparatus labelled ${target.letter}?`,
        visual: LAB_APPARATUS_IMG.visual,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${target.letter} is a ${target.name}, used for: ${target.detail.toLowerCase()}.`,
      };
    }

    if (branch === "photo-apparatus-scenario") {
      const s = randChoice(rng, APPARATUS_APPLY_SCENARIOS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.answer, s.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `A learner needs to ${s.need}. Looking at the apparatus in the photo, which one should they choose?`,
        visual: LAB_APPARATUS_IMG.visual,
        choices,
        correctIndex,
        layout: "list",
        hint: "Match the job described to what each piece of apparatus is actually designed to do, not just what it looks like.",
        explanation: `${s.answer} is designed for exactly this job.`,
      };
    }

    if (branch === "photo-apparatus-care-evaluate") {
      const s = randChoice(rng, APPARATUS_CARE_SCENARIOS);
      const safeLabel = "Yes, this is good practice";
      const unsafeLabel = "No, this is not good practice";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.desc} Is this good practice for using and caring for laboratory apparatus?`,
        visual: LAB_APPARATUS_IMG.visual,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        explanation: s.why,
      };
    }

    if (branch === "photo-microscope-identify") {
      const target = randChoice(rng, MICROSCOPE_IMG.parts);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.name, target.confusedWith, 3);
      return {
        kind: "multiple-choice",
        prompt: `Look at the labelled diagram of a light microscope. What part is labelled ${target.letter}?`,
        visual: MICROSCOPE_IMG.visual,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${target.letter} is the ${target.name} — ${target.detail}.`,
      };
    }

    if (branch === "photo-microscope-apply") {
      const s = randChoice(rng, MICROSCOPE_APPLY_SCENARIOS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.answer, s.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: s.q,
        visual: MICROSCOPE_IMG.visual,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what job each part of the microscope actually does.",
        explanation: `${s.answer} is the part responsible for this.`,
      };
    }

    if (branch === "photo-bunsen-identify") {
      const target = randChoice(rng, BUNSEN_IMG.parts);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.name, target.confusedWith, 3);
      return {
        kind: "multiple-choice",
        prompt: `Look at the labelled diagram of a bunsen burner. What part is labelled ${target.letter}?`,
        visual: BUNSEN_IMG.visual,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${target.letter} is the ${target.name} — ${target.detail}.`,
      };
    }

    if (branch === "photo-bunsen-safety-evaluate") {
      const s = randChoice(rng, BUNSEN_SAFETY_SCENARIOS);
      const safeLabel = `${s.flame} — this is the correct working flame`;
      const unsafeLabel = `${s.flame} — this should be adjusted before working`;
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `On the bunsen burner shown, ${s.desc}. What flame does this produce?`,
        visual: BUNSEN_IMG.visual,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        hint: "The air hole controls how much oxygen mixes with the gas before it burns.",
        explanation: s.why,
      };
    }

    const q = randChoice(rng, SKILL_QUESTIONS);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      explanation: q.explanation,
    };
  },
};
