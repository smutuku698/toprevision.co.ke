import { randChoice, randInt, roundTo, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Question, Skill, VisualSpec } from "@/lib/types";

function buildNumericChoices(rng: RNG, correctText: string): { choices: string[]; correctIndex: number } {
  const correctNum = parseFloat(correctText);
  const decimals = correctText.includes(".") ? correctText.split(".")[1].length : 0;
  const format = (n: number) => (decimals > 0 ? n.toFixed(decimals) : String(Math.round(n)));
  const seen = new Set([correctText]);
  const distractors: string[] = [];
  for (const d of [correctNum * 2, correctNum / 2, correctNum + Math.max(1, Math.round(correctNum * 0.2)), correctNum - Math.max(1, Math.round(correctNum * 0.15))]) {
    if (d <= 0 || distractors.length >= 3) continue;
    const text = format(d);
    if (!seen.has(text)) {
      seen.add(text);
      distractors.push(text);
    }
  }
  let extra = 1;
  while (distractors.length < 3) {
    const text = format(correctNum + extra * (Math.max(1, Math.round(correctNum * 0.1)) + 2));
    if (!seen.has(text)) {
      seen.add(text);
      distractors.push(text);
    }
    extra++;
  }
  const choices = shuffle(rng, [correctText, ...distractors]);
  return { choices, correctIndex: choices.indexOf(correctText) };
}

function finish(
  rng: RNG,
  opts: { promptText: string; visual: VisualSpec; unit: string; correctAnswer: string; acceptedAnswers?: string[]; hint: string; explanation: string }
): Question {
  if (rng() < 0.5) {
    const { choices, correctIndex } = buildNumericChoices(rng, opts.correctAnswer);
    return {
      kind: "multiple-choice",
      prompt: `${opts.promptText} (answer in ${opts.unit})`,
      visual: opts.visual,
      choices: choices.map((c) => `${c} ${opts.unit}`),
      correctIndex,
      layout: "grid",
      hint: opts.hint,
      explanation: opts.explanation,
    };
  }

  return {
    kind: "fill-blank",
    prompt: opts.promptText,
    visual: opts.visual,
    before: "Surface area =",
    after: "",
    unit: opts.unit,
    correctAnswer: opts.correctAnswer,
    acceptedAnswers: opts.acceptedAnswers,
    inputMode: "numeric",
    hint: opts.hint,
    explanation: opts.explanation,
  };
}

// Legs + hypotenuse, so a cone's slant height (l = sqrt(r^2 + h^2)) always
// comes out as a whole number instead of an ugly root.
const CONE_TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [7, 24, 25],
  [12, 16, 20],
];

export const surfaceAreaOfSolids: Skill = {
  id: "math-m-surface-area-of-solids",
  code: "M.4",
  subjectId: "math",
  strandId: "math-measurement",
  grade: 9,
  title: "Surface area of solids",
  description: "Calculate the total surface area of a cube, cuboid, cylinder, or cone.",
  generate(rng) {
    const shape = randChoice(rng, ["cube", "cuboid", "cylinder", "cone"] as const);

    if (shape === "cube") {
      const side = randInt(rng, 2, 12);
      const area = 6 * side * side;
      return finish(rng, {
        promptText: "Find the total surface area of the cube.",
        visual: { type: "solid", shape: "cube", side },
        unit: "cm²",
        correctAnswer: String(area),
        hint: "Surface area of a cube = $6 \\times \\text{side}^2$ — 6 identical square faces.",
        explanation: `$\\text{Surface area} = 6 \\times \\text{side}^2 = 6 \\times ${side}^2 = 6 \\times ${side * side} = ${area}$ cm².`,
      });
    }

    if (shape === "cuboid") {
      const length = randInt(rng, 3, 12);
      const width = randInt(rng, 2, 10);
      const height = randInt(rng, 2, 9);
      const lw = length * width;
      const lh = length * height;
      const wh = width * height;
      const area = 2 * (lw + lh + wh);
      return finish(rng, {
        promptText: "Find the total surface area of the cuboid.",
        visual: { type: "solid", shape: "cuboid", length, width, height },
        unit: "cm²",
        correctAnswer: String(area),
        hint: "Surface area of a cuboid = $2(\\text{lw} + \\text{lh} + \\text{wh})$ — the sum of all 6 rectangular faces.",
        explanation: `$\\text{Surface area} = 2(\\text{lw} + \\text{lh} + \\text{wh}) = 2(${length}\\times${width} + ${length}\\times${height} + ${width}\\times${height}) = 2(${lw} + ${lh} + ${wh}) = 2 \\times ${
          lw + lh + wh
        } = ${area}$ cm².`,
      });
    }

    if (shape === "cylinder") {
      const radius = randInt(rng, 2, 7);
      const height = randInt(rng, 3, 12);
      const precise = 2 * 3.14 * radius * (radius + height);
      const rounded = roundTo(precise, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
      );
      return finish(rng, {
        promptText: "Find the total surface area of the cylinder (including both circular ends). Use $\\pi \\approx 3.14$.",
        visual: { type: "solid", shape: "cylinder", radius, height },
        unit: "cm²",
        correctAnswer,
        acceptedAnswers,
        hint: "Surface area of a cylinder = $2\\pi r^2 + 2\\pi r h = 2\\pi r(r+h)$.",
        explanation: `$\\text{Surface area} = 2\\pi r(r+h) \\approx 2 \\times 3.14 \\times ${radius} \\times (${radius}+${height}) = 2 \\times 3.14 \\times ${radius} \\times ${
          radius + height
        } = ${precise.toFixed(2)} \\approx ${correctAnswer}$ cm².`,
      });
    }

    // cone — pick a Pythagorean triple so the slant height comes out as a whole number.
    const triple = randChoice(rng, CONE_TRIPLES);
    const swap = rng() < 0.5;
    const radius = swap ? triple[0] : triple[1];
    const height = swap ? triple[1] : triple[0];
    const slant = triple[2];
    const precise = 3.14 * radius * (radius + slant);
    const rounded = roundTo(precise, 1);
    const correctAnswer = rounded.toFixed(1);
    const acceptedAnswers = Array.from(
      new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
    );
    return finish(rng, {
      promptText: "Find the total surface area of the cone (including the base). Use $\\pi \\approx 3.14$.",
      visual: { type: "solid", shape: "cone", radius, height },
      unit: "cm²",
      correctAnswer,
      acceptedAnswers,
      hint: "First find the slant height with $l = \\sqrt{r^2 + h^2}$, then use surface area $= \\pi r^2 + \\pi r l$.",
      explanation: `Slant height $l = \\sqrt{r^2+h^2} = \\sqrt{${radius}^2+${height}^2} = \\sqrt{${radius * radius}+${height * height}} = \\sqrt{${
        radius * radius + height * height
      }} = ${slant}$ cm. $\\text{Surface area} = \\pi r^2 + \\pi r l \\approx 3.14\\times${radius}^2 + 3.14\\times${radius}\\times${slant} = ${(
        3.14 *
        radius *
        radius
      ).toFixed(2)} + ${(3.14 * radius * slant).toFixed(2)} = ${precise.toFixed(2)} \\approx ${correctAnswer}$ cm².`,
    });
  },
};
