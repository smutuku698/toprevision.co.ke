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
    before: "Area =",
    after: "",
    unit: opts.unit,
    correctAnswer: opts.correctAnswer,
    acceptedAnswers: opts.acceptedAnswers,
    inputMode: "numeric",
    hint: opts.hint,
    explanation: opts.explanation,
  };
}

export const areaOfShapes: Skill = {
  id: "math-m-area-of-shapes",
  code: "M.1",
  subjectId: "math",
  strandId: "math-measurement",
  grade: 9,
  title: "Area of triangles and rectangles",
  description: "Calculate the area of a rectangle, square, right-angled triangle, or circle.",
  generate(rng) {
    const shape = randChoice(rng, ["rectangle", "triangle", "circle", "square"] as const);

    if (shape === "rectangle") {
      const width = randInt(rng, 4, 16);
      const height = randInt(rng, 3, 12);
      const area = width * height;
      return finish(rng, {
        promptText: "Find the area of the rectangle.",
        visual: { type: "rectangle", width, height },
        unit: "cm²",
        correctAnswer: String(area),
        hint: "Area of a rectangle = $\\text{width} \\times \\text{height}$.",
        explanation: `$\\text{Area} = \\text{width} \\times \\text{height} = ${width} \\times ${height} = ${area}$ cm².`,
      });
    }

    if (shape === "square") {
      const side = randInt(rng, 3, 15);
      const area = side * side;
      return finish(rng, {
        promptText: "Find the area of the square.",
        visual: { type: "rectangle", width: side, height: side },
        unit: "cm²",
        correctAnswer: String(area),
        hint: "Area of a square = $\\text{side} \\times \\text{side}$.",
        explanation: `$\\text{Area} = \\text{side} \\times \\text{side} = ${side} \\times ${side} = ${area}$ cm².`,
      });
    }

    if (shape === "circle") {
      const radius = randInt(rng, 3, 10);
      const preciseArea = 3.14 * radius * radius;
      const rounded = roundTo(preciseArea, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([
          correctAnswer,
          preciseArea.toFixed(2),
          roundTo(rounded - 0.1, 1).toFixed(1),
          roundTo(rounded + 0.1, 1).toFixed(1),
        ])
      );
      return finish(rng, {
        promptText: "Find the area of the circle. Use $\\pi \\approx 3.14$.",
        visual: { type: "circle-shape", radius },
        unit: "cm²",
        correctAnswer,
        acceptedAnswers,
        hint: "Area of a circle = $\\pi \\times r^2$.",
        explanation: `$\\text{Area} = \\pi \\times r^2 \\approx 3.14 \\times ${radius}^2 = 3.14 \\times ${radius * radius} = ${preciseArea.toFixed(
          2
        )} \\approx ${correctAnswer}$ cm².`,
      });
    }

    const base = randInt(rng, 4, 16) * 2; // keep even so /2 is a clean integer
    const height = randInt(rng, 3, 12);
    const area = (base * height) / 2;
    return finish(rng, {
      promptText: "Find the area of the right-angled triangle.",
      visual: { type: "right-triangle", base, height, showHypotenuse: false },
      unit: "cm²",
      correctAnswer: String(area),
      hint: "Area of a triangle = $\\frac{1}{2} \\times \\text{base} \\times \\text{height}$.",
      explanation: `$\\text{Area} = \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times ${base} \\times ${height} = ${area}$ cm².`,
    });
  },
};
