import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill, VisualSpec } from "@/lib/types";

const DIMENSION_METHODS = [
  { id: "linear", label: "Linear dimensioning", meaning: "Shows a straight-line length or distance" },
  { id: "radial", label: "Radial dimensioning", meaning: "Shows the radius of a circle or curve" },
  { id: "angular", label: "Angular dimensioning", meaning: "Shows the size of an angle in degrees" },
  { id: "arc", label: "Arc dimensioning", meaning: "Shows the length measured along a curved arc" },
] as const;

// 12 facts, 4 per form (parallel/chain/combined) — expanded from the original 5 so the categorize
// pool clears the "10+ facts across the whole pool" floor rather than resurfacing the same 5.
const DIMENSION_FORMS = [
  { text: "All dimensions are measured from one common starting point (a datum)", bucket: "parallel" },
  { text: "Dimension lines run side by side, all starting from the same edge", bucket: "parallel" },
  { text: "Every dimension line begins at the same reference point rather than continuing from the last measurement", bucket: "parallel" },
  { text: "Reduces the risk of errors building up, because every measurement is taken from the same datum rather than from the previous measurement", bucket: "parallel" },
  { text: "Each dimension is measured from the end of the one before it, forming a series", bucket: "chain" },
  { text: "Dimension lines follow one another end to end, like links in a chain", bucket: "chain" },
  { text: "If one dimension in the series is measured wrongly, every dimension after it in the chain is also thrown off", bucket: "chain" },
  { text: "Useful when the exact spacing between consecutive features matters more than each one's distance from a fixed edge", bucket: "chain" },
  { text: "Uses both a common datum and a running series in the same drawing", bucket: "combined" },
  { text: "Combines the datum-based approach with a running series so a drawing can show both overall and step-by-step measurements", bucket: "combined" },
  { text: "Chosen when a drawing needs to show both the overall size of a part and the size of each individual feature within it", bucket: "combined" },
  { text: "Mixes parallel dimensioning for the overall size with chain dimensioning for the individual features within it", bucket: "combined" },
] as const;

const FORM_LABELS: Record<string, string> = {
  parallel: "Parallel dimensioning",
  chain: "Chain dimensioning",
  combined: "Combined dimensioning",
};

// 13 distinct fill-blank facts: 2 phrasings each for the 4 dimensioning methods, plus 5 phrasings
// across the 3 dimensioning forms — the original branch only produced 4 distinct outputs (one
// randChoice over DIMENSION_METHODS with no other variation), well under the 10+ floor.
const FILL_BLANK_TEMPLATES = [
  { before: "The dimensioning method used to show a straight-line length or distance is called ", after: " dimensioning.", correctAnswer: "linear", acceptedAnswers: ["linear"] },
  { before: "The dimensioning method that labels a measurement in millimetres along a straight edge of a drawing is called ", after: " dimensioning.", correctAnswer: "linear", acceptedAnswers: ["linear"] },
  { before: "The dimensioning method used to show the radius of a circle or curve is called ", after: " dimensioning.", correctAnswer: "radial", acceptedAnswers: ["radial"] },
  { before: "The dimensioning method that uses the symbol 'R' before a number on a drawing is called ", after: " dimensioning.", correctAnswer: "radial", acceptedAnswers: ["radial"] },
  { before: "The dimensioning method used to show the size of an angle in degrees is called ", after: " dimensioning.", correctAnswer: "angular", acceptedAnswers: ["angular"] },
  { before: "The dimensioning method used wherever two lines meet at a slope, to show the angle between them in degrees, is called ", after: " dimensioning.", correctAnswer: "angular", acceptedAnswers: ["angular"] },
  { before: "The dimensioning method used to show a length measured along a curved arc, rather than a straight line, is called ", after: " dimensioning.", correctAnswer: "arc", acceptedAnswers: ["arc"] },
  { before: "The dimensioning method that measures distance following the curve of a rounded edge is called ", after: " dimensioning.", correctAnswer: "arc", acceptedAnswers: ["arc"] },
  { before: "The form of dimensioning in which all dimensions are measured from one common starting point (a datum) is called ", after: " dimensioning.", correctAnswer: "parallel", acceptedAnswers: ["parallel"] },
  { before: "The form of dimensioning where dimension lines run side by side, all starting from the same edge, is called ", after: " dimensioning.", correctAnswer: "parallel", acceptedAnswers: ["parallel"] },
  { before: "The form of dimensioning in which each dimension is measured from the end of the one before it, forming a series, is called ", after: " dimensioning.", correctAnswer: "chain", acceptedAnswers: ["chain"] },
  { before: "The form of dimensioning where dimension lines follow one another end to end, like links in a chain, is called ", after: " dimensioning.", correctAnswer: "chain", acceptedAnswers: ["chain"] },
  { before: "The form of dimensioning that uses both a common datum and a running series in the same drawing is called ", after: " dimensioning.", correctAnswer: "combined", acceptedAnswers: ["combined"] },
] as const;

export const planeGeometry: Skill = {
  id: "g7-pt-com-plane-geometry",
  code: "COM.3",
  subjectId: "pre-technical",
  strandId: "g7-pt-communication",
  grade: 7,
  title: "Plane geometry",
  description: "Methods of dimensioning drawings (linear, radial, angular, arc), forms of dimensioning combined shapes (parallel, chain, combined), and constructing/measuring combined shapes.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-visual", "method-match", "form-sort", "protractor-measure", "fill-method"] as const);

    if (branch === "identify-visual") {
      const kind = randChoice(rng, ["linear", "radial", "angular"] as const);
      let visual: VisualSpec;
      let correctLabel: string;
      if (kind === "linear") {
        const width = randInt(rng, 40, 90);
        const height = randInt(rng, 30, 70);
        visual = { type: "rectangle", width, height, labelWidth: `${width} mm`, labelHeight: `${height} mm` };
        correctLabel = "Linear dimensioning";
      } else if (kind === "radial") {
        const radius = randInt(rng, 15, 45);
        visual = { type: "circle-shape", radius, label: `R${radius}` };
        correctLabel = "Radial dimensioning";
      } else {
        const angle = randInt(rng, 30, 150);
        visual = { type: "circle-sector", radius: 50, angleDeg: angle };
        correctLabel = "Angular dimensioning";
      }
      const others = DIMENSION_METHODS.filter((m) => m.label !== correctLabel).map((m) => m.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctLabel, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which method of dimensioning would be used to label the measurement shown in this drawing?",
        visual,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${correctLabel} is used here — it ${DIMENSION_METHODS.find((m) => m.label === correctLabel)!.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "method-match") {
      const tokens = shuffle(rng, DIMENSION_METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, DIMENSION_METHODS.map((m) => ({ id: m.id, label: m.meaning })));
      const correctMap: Record<string, string> = {};
      for (const m of DIMENSION_METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each method of dimensioning to what it shows.",
        tokens,
        targets,
        correctMap,
        hint: "Think about lengths, radii, angles and curved arcs.",
        explanation: DIMENSION_METHODS.map((m) => `${m.label} — ${m.meaning}.`).join(" "),
      };
    }

    if (branch === "form-sort") {
      const chosen = shuffle(rng, DIMENSION_FORMS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each description as parallel, chain, or combined dimensioning.",
        items,
        buckets: [
          { id: "parallel", label: "Parallel dimensioning" },
          { id: "chain", label: "Chain dimensioning" },
          { id: "combined", label: "Combined dimensioning" },
        ],
        correctBucket,
        hint: "Parallel starts every dimension from one datum; chain runs dimensions end to end; combined uses both.",
        explanation: chosen.map((f) => `"${f.text}" describes ${FORM_LABELS[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "protractor-measure") {
      const angle = randInt(rng, 15, 165);
      return {
        kind: "protractor",
        mode: "measure",
        rayBAngleDeg: angle,
        correctAngleDeg: angle,
        toleranceDeg: 3,
        prompt: "Angular dimensioning is used to show the size of an angle on a drawing. Drag the needle to line up with the red ray, then submit your reading.",
        hint: "Line the needle up on top of the red ray, then read the degree mark it points to on the scale.",
        explanation: `The red ray sits at ${angle}° on the protractor scale — this is the angular dimension.`,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const method = DIMENSION_METHODS.find((m) => m.id === fb.correctAnswer);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint: "Match the description to linear, radial, angular, or arc dimensioning, or to parallel, chain, or combined dimensioning.",
      explanation: method
        ? `${method.label} ${method.meaning.toLowerCase()}.`
        : `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
