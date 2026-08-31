import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SCALES: { denom: number; cmPerKm: number; kmOptions: number[] }[] = [
  { denom: 25000, cmPerKm: 4, kmOptions: [1, 2, 3, 4, 5] },
  { denom: 50000, cmPerKm: 2, kmOptions: [1, 2, 3, 4, 5] },
  { denom: 100000, cmPerKm: 1, kmOptions: [1, 2, 3, 4, 5, 6, 7, 8] },
  { denom: 200000, cmPerKm: 0.5, kmOptions: [2, 4, 6, 8, 10] },
  { denom: 500000, cmPerKm: 0.2, kmOptions: [5, 10, 15, 20, 25] },
];

const CONCEPT_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which of these is a 'large-scale' map, such as 1:25,000?",
    choices: ["A map that covers a small area but shows a lot of fine detail", "A map that covers a huge area but shows very little detail", "A map with no scale at all", "A map that cannot show any distances"],
    correctIndex: 0,
    explanation: "A large-scale map (a small denominator like 1:25,000) covers a small area but shows fine detail, since each cm on the map represents a shorter ground distance.",
  },
  {
    prompt: "Which of these is a 'small-scale' map, such as 1:500,000?",
    choices: ["A map that covers a large area but shows less fine detail", "A map that covers a tiny area with maximum detail", "A map that has no representative fraction", "A map that only shows administrative boundaries"],
    correctIndex: 0,
    explanation: "A small-scale map (a large denominator like 1:500,000) covers a large area but shows less detail, since each cm represents a much longer ground distance.",
  },
  {
    prompt: "A learner says a scale of 1:200,000 is 'larger' than 1:25,000 because 200,000 is a bigger number. Is this correct?",
    choices: ["No — a smaller denominator (1:25,000) means a larger scale, showing more detail", "Yes — a bigger denominator always means a larger scale", "Yes — scale size has nothing to do with the denominator", "No — scale size only depends on the map's paper size"],
    correctIndex: 0,
    explanation: "Scale size works in reverse: the smaller the denominator, the larger the scale (more detail, smaller area covered) — a common point of confusion.",
  },
  {
    prompt: "Why would a town planner prefer a large-scale map (e.g. 1:25,000) over a small-scale map (e.g. 1:500,000)?",
    choices: ["It shows individual buildings and roads in much finer detail", "It covers more of the country in a single sheet", "It requires less paper to print", "It removes the need for a scale altogether"],
    correctIndex: 0,
    explanation: "A large-scale map shows fine detail like individual buildings and roads, which a town planner needs — a small-scale map would show the same area far too vaguely.",
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "A representative fraction such as 1:50,000 is called the map's ", after: ".", correctAnswer: "scale", accepted: ["scale"], explanation: "A representative fraction like 1:50,000 is called the map's scale — it relates map distance to actual ground distance." },
  { before: "A map covering a small area with lots of fine detail, like 1:25,000, is called a ", after: "-scale map.", correctAnswer: "large", accepted: ["large"], explanation: "A large-scale map (small denominator) covers a small area with lots of detail." },
  { before: "A map covering a large area with less fine detail, like 1:500,000, is called a ", after: "-scale map.", correctAnswer: "small", accepted: ["small"], explanation: "A small-scale map (large denominator) covers a large area with less detail." },
] as const;

export const mapScale: Skill = {
  id: "ss-e-map-scale",
  code: "E.2",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Map scale and distance",
  description: "Use a map's representative fraction scale to find the actual ground distance between two places.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "plot", "concept", "size-order", "size-categorize"] as const);

    if (branch === "concept") {
      const q = randChoice(rng, CONCEPT_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Remember: a smaller denominator means a larger scale (more detail, smaller area).",
        explanation: q.explanation,
      };
    }

    if (branch === "size-order") {
      const count = randChoice(rng, [4, 5] as const);
      const selected = shuffle(rng, SCALES).slice(0, count);
      const correctOrder = [...selected].sort((a, b) => a.denom - b.denom).map((s) => `1:${s.denom.toLocaleString()}`);
      return {
        kind: "ordering",
        prompt: "Arrange these map scales from largest scale (most detail) to smallest scale (least detail).",
        instruction: "Drag to reorder from largest scale to smallest scale.",
        items: shuffle(rng, selected.map((s) => ({ id: `1:${s.denom.toLocaleString()}`, label: `1:${s.denom.toLocaleString()}` }))),
        correctOrder,
        hint: "The smaller the denominator, the larger the scale.",
        explanation: `From largest to smallest scale: ${correctOrder.join(" → ")}.`,
      };
    }

    if (branch === "size-categorize") {
      const chosen = shuffle(rng, SCALES).slice(0, 5);
      const median = 100000;
      const items = chosen.map((s) => ({ id: `1:${s.denom}`, label: `1:${s.denom.toLocaleString()}` }));
      const correctBucket: Record<string, string> = {};
      for (const s of chosen) correctBucket[`1:${s.denom}`] = s.denom < median ? "large" : s.denom > median ? "small" : "large";
      return {
        kind: "categorize",
        prompt: "Sort each map scale as large-scale (small denominator, more detail) or small-scale (large denominator, less detail).",
        items,
        buckets: [
          { id: "large", label: "Large-scale (more detail)" },
          { id: "small", label: "Small-scale (less detail)" },
        ],
        correctBucket,
        hint: "Compare each denominator to 1:100,000 — smaller denominators are large-scale, bigger denominators are small-scale.",
        explanation: chosen.map((s) => `1:${s.denom.toLocaleString()} is ${s.denom < median ? "large" : "small"}-scale.`).join(" "),
      };
    }

    if (branch === "fill" && rng() < 0.3) {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about map scale.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about what the representative fraction tells you about detail and area covered.",
        explanation: fb.explanation,
      };
    }

    const scale = randChoice(rng, SCALES);
    const km = randChoice(rng, scale.kmOptions);
    const mapDistanceCm = km * scale.cmPerKm;
    const actualCm = mapDistanceCm * scale.denom;
    const hint = "Actual distance (cm) = map distance × scale denominator. Then divide by 100,000 to convert centimeters to kilometers.";
    const explanation = `Actual distance = ${mapDistanceCm} cm × ${scale.denom.toLocaleString()} = ${actualCm.toLocaleString()} cm. Since 1 km = 100,000 cm, that is ${actualCm.toLocaleString()} ÷ 100,000 = ${km} km.`;

    if (branch === "plot") {
      const maxVal = Math.max(...scale.kmOptions) + 2;
      return {
        kind: "number-line",
        prompt: `A map has a scale of 1:${scale.denom.toLocaleString()}. The distance between two towns on the map is ${mapDistanceCm} cm. Plot the actual distance between the towns, in km, on the number line.`,
        min: 0,
        max: maxVal,
        step: 1,
        correctValue: km,
        mode: "point",
        hint,
        explanation,
      };
    }

    return {
      kind: "fill-blank",
      prompt: `A map has a scale of 1:${scale.denom.toLocaleString()}. The distance between two towns on the map is ${mapDistanceCm} cm. What is the actual distance between the towns?`,
      before: "Actual distance =",
      after: "",
      unit: "km",
      correctAnswer: String(km),
      inputMode: "numeric",
      hint,
      explanation,
    };
  },
};
