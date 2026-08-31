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
    before: "Volume =",
    after: "",
    unit: opts.unit,
    correctAnswer: opts.correctAnswer,
    acceptedAnswers: opts.acceptedAnswers,
    inputMode: "numeric",
    hint: opts.hint,
    explanation: opts.explanation,
  };
}

export const volumeOfSolids: Skill = {
  id: "math-m-volume-of-solids",
  code: "M.3",
  subjectId: "math",
  strandId: "math-measurement",
  grade: 9,
  title: "Volume of solids",
  description: "Calculate the volume of a cube, cuboid, cylinder, cone, sphere, or pyramid.",
  generate(rng) {
    const shape = randChoice(rng, ["cube", "cuboid", "cylinder", "cone", "sphere", "pyramid"] as const);

    if (shape === "cube") {
      const side = randInt(rng, 2, 9);
      const volume = side ** 3;
      return finish(rng, {
        promptText: "Find the volume of the cube.",
        visual: { type: "solid", shape: "cube", side },
        unit: "cm³",
        correctAnswer: String(volume),
        hint: "Volume of a cube = $\\text{side}^3$.",
        explanation: `$\\text{Volume} = \\text{side}^3 = ${side}^3 = ${side} \\times ${side} \\times ${side} = ${volume}$ cm³.`,
      });
    }

    if (shape === "cuboid") {
      const length = randInt(rng, 3, 10);
      const width = randInt(rng, 2, 9);
      const height = randInt(rng, 2, 8);
      const volume = length * width * height;
      return finish(rng, {
        promptText: "Find the volume of the cuboid.",
        visual: { type: "solid", shape: "cuboid", length, width, height },
        unit: "cm³",
        correctAnswer: String(volume),
        hint: "Volume of a cuboid = $\\text{length} \\times \\text{width} \\times \\text{height}$.",
        explanation: `$\\text{Volume} = \\text{length} \\times \\text{width} \\times \\text{height} = ${length} \\times ${width} \\times ${height} = ${volume}$ cm³.`,
      });
    }

    if (shape === "cylinder") {
      const radius = randInt(rng, 2, 6);
      const height = randInt(rng, 3, 10);
      const precise = 3.14 * radius * radius * height;
      const rounded = roundTo(precise, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
      );
      return finish(rng, {
        promptText: "Find the volume of the cylinder. Use $\\pi \\approx 3.14$.",
        visual: { type: "solid", shape: "cylinder", radius, height },
        unit: "cm³",
        correctAnswer,
        acceptedAnswers,
        hint: "Volume of a cylinder = $\\pi \\times r^2 \\times h$.",
        explanation: `$\\text{Volume} = \\pi \\times r^2 \\times h \\approx 3.14 \\times ${radius}^2 \\times ${height} = 3.14 \\times ${
          radius * radius
        } \\times ${height} = ${precise.toFixed(2)} \\approx ${correctAnswer}$ cm³.`,
      });
    }

    if (shape === "cone") {
      const radius = randInt(rng, 3, 9);
      const height = randInt(rng, 3, 12);
      const precise = (1 / 3) * 3.14 * radius * radius * height;
      const rounded = roundTo(precise, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
      );
      return finish(rng, {
        promptText: "Find the volume of the cone. Use $\\pi \\approx 3.14$.",
        visual: { type: "solid", shape: "cone", radius, height },
        unit: "cm³",
        correctAnswer,
        acceptedAnswers,
        hint: "Volume of a cone = $\\frac{1}{3} \\times \\pi \\times r^2 \\times h$.",
        explanation: `$\\text{Volume} = \\frac{1}{3} \\times \\pi \\times r^2 \\times h \\approx \\frac{1}{3} \\times 3.14 \\times ${radius}^2 \\times ${height} = \\frac{1}{3} \\times 3.14 \\times ${
          radius * radius
        } \\times ${height} = ${precise.toFixed(2)} \\approx ${correctAnswer}$ cm³.`,
      });
    }

    if (shape === "sphere") {
      const radius = randInt(rng, 2, 8);
      const precise = (4 / 3) * 3.14 * radius ** 3;
      const rounded = roundTo(precise, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
      );
      return finish(rng, {
        promptText: "Find the volume of the sphere. Use $\\pi \\approx 3.14$.",
        visual: { type: "solid", shape: "sphere", radius },
        unit: "cm³",
        correctAnswer,
        acceptedAnswers,
        hint: "Volume of a sphere = $\\frac{4}{3} \\times \\pi \\times r^3$.",
        explanation: `$\\text{Volume} = \\frac{4}{3} \\times \\pi \\times r^3 \\approx \\frac{4}{3} \\times 3.14 \\times ${radius}^3 = \\frac{4}{3} \\times 3.14 \\times ${
          radius ** 3
        } = ${precise.toFixed(2)} \\approx ${correctAnswer}$ cm³.`,
      });
    }

    // pyramid — square base, height chosen as a multiple of 3 so (1/3) always divides cleanly.
    const baseSide = randInt(rng, 2, 10);
    const height = randChoice(rng, [3, 6, 9, 12] as const);
    const baseArea = baseSide * baseSide;
    const volume = (baseArea * height) / 3;
    return finish(rng, {
      promptText: "Find the volume of the square-based pyramid.",
      visual: { type: "solid", shape: "pyramid", baseSide, height },
      unit: "cm³",
      correctAnswer: String(volume),
      hint: "Volume of a pyramid = $\\frac{1}{3} \\times \\text{base area} \\times \\text{height}$.",
      explanation: `Base area $= \\text{side}^2 = ${baseSide}^2 = ${baseArea}$ cm². $\\text{Volume} = \\frac{1}{3} \\times \\text{base area} \\times \\text{height} = \\frac{1}{3} \\times ${baseArea} \\times ${height} = ${volume}$ cm³.`,
    });
  },
};
