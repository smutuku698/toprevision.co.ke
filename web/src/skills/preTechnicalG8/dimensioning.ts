import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TYPES = [
  { id: "linear", label: "Linear dimensioning", measures: "A straight-line distance, such as the length or width of a part" },
  { id: "radial", label: "Radial dimensioning", measures: "The radius or diameter of a circular feature, such as a hole or a wheel" },
  { id: "angular", label: "Angular dimensioning", measures: "The size of an angle formed between two lines or surfaces" },
  { id: "arc", label: "Arc dimensioning", measures: "The length measured along a curved edge, rather than in a straight line" },
] as const;

const FORMS = [
  { id: "parallel", label: "Parallel form", description: "All dimensions are measured out from one common reference line or point" },
  { id: "chain", label: "Chain form", description: "Dimensions are placed one after another in a series, end to end" },
  { id: "combined", label: "Combined form", description: "Parallel and chain dimensioning are both used together on the same drawing" },
] as const;

const FORM_SCENARIOS = [
  { text: "Measuring the position of four holes, all taken from the same left-hand edge of a plate", best: "parallel" },
  { text: "Measuring a series of steps on a staircase, each one taken from the edge of the step before it", best: "chain" },
  { text: "A drawing needs some dimensions from a shared reference edge, plus a separate running series for a stepped section", best: "combined" },
] as const;

export const dimensioning: Skill = {
  id: "g8-pt-c-dimensioning",
  code: "C.2",
  subjectId: "pre-technical",
  strandId: "g8-pt-communication",
  grade: 8,
  title: "Dimensioning",
  description: "Types of dimensioning used in drawing, the lines used for dimensioning, and the parallel, chain, and combined forms used to lay them out.",
  generate(rng) {
    const branch = randChoice(rng, ["type-match", "form-sort", "radial-visual", "linear-visual", "form-scenario", "type-recall"] as const);

    if (branch === "type-match") {
      const tokens = shuffle(rng, TYPES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TYPES.map((t) => ({ id: t.id, label: t.measures })));
      const correctMap: Record<string, string> = {};
      for (const t of TYPES) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each type of dimensioning to what it measures on a drawing.",
        tokens,
        targets,
        correctMap,
        hint: "Straight features, round features, angles, and curves each need their own type of dimensioning.",
        explanation: TYPES.map((t) => `${t.label}: ${t.measures}.`).join(" "),
      };
    }

    if (branch === "form-sort") {
      const buckets = FORMS.map((f) => ({ id: f.id, label: f.label }));
      const items = shuffle(rng, FORMS.map((f) => ({ id: f.id, label: f.description })));
      const correctBucket: Record<string, string> = {};
      for (const f of FORMS) correctBucket[f.id] = f.id;
      return {
        kind: "categorize",
        prompt: "Sort each description into the form of dimensioning it describes: parallel, chain, or combined.",
        items,
        buckets,
        correctBucket,
        hint: "Parallel dimensions all share one starting point; chain dimensions run in a series; combined mixes both.",
        explanation: FORMS.map((f) => `${f.label}: ${f.description}.`).join(" "),
      };
    }

    if (branch === "radial-visual") {
      const radius = randInt(rng, 8, 40);
      const others = TYPES.filter((t) => t.id !== "radial").map((t) => t.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "Radial dimensioning", others, 3);
      return {
        kind: "multiple-choice",
        prompt: `This drawing shows a circular hole of radius ${radius} mm that needs to be dimensioned. Which type of dimensioning is used to specify the size of a circular feature like this?`,
        visual: { type: "circle-shape", radius },
        choices,
        correctIndex,
        hint: "Circular features are sized by their radius or diameter, not by a straight-line length.",
        explanation: "Radial dimensioning specifies the radius or diameter of circular features such as holes, shafts, or wheels.",
      };
    }

    if (branch === "linear-visual") {
      const width = randInt(rng, 20, 60);
      const height = randInt(rng, 15, 45);
      const others = TYPES.filter((t) => t.id !== "linear").map((t) => t.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "Linear dimensioning", others, 3);
      return {
        kind: "multiple-choice",
        prompt: `This rectangular plate is ${width} mm wide and ${height} mm high. Which type of dimensioning is used to specify these straight-line measurements?`,
        visual: { type: "rectangle", width, height },
        choices,
        correctIndex,
        hint: "A width or height measured along a straight edge is a straight-line distance.",
        explanation: "Linear dimensioning specifies straight-line distances such as the length, width, or height of a part.",
      };
    }

    if (branch === "form-scenario") {
      const s = randChoice(rng, FORM_SCENARIOS);
      const form = FORMS.find((f) => f.id === s.best)!;
      const others = FORMS.filter((f) => f.id !== s.best).map((f) => f.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, form.label, others, 2);
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. Which form of dimensioning is this?`,
        choices,
        correctIndex,
        hint: "Ask whether every measurement shares one starting point, runs in a series, or does both.",
        explanation: `${form.label}: ${form.description}.`,
      };
    }

    // type-recall
    const t = randChoice(rng, TYPES);
    return {
      kind: "fill-blank",
      prompt: `A type of dimensioning is used to measure: "${t.measures.toLowerCase()}"`,
      before: "This is called",
      after: "dimensioning.",
      correctAnswer: t.label.replace(" dimensioning", ""),
      acceptedAnswers: [t.id],
      inputMode: "text",
      hint: "Match the feature being measured — straight length, radius, angle, or curve — to its dimensioning type.",
      explanation: `${t.label}: ${t.measures}.`,
    };
  },
};
