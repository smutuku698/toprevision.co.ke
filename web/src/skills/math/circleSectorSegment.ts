import { randChoice, randInt, roundTo, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Question, Skill, VisualSpec } from "@/lib/types";

const ANGLES = [30, 45, 60, 90, 120, 135, 150, 180, 270] as const;

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
  opts: { promptText: string; visual: VisualSpec; unit: string; before: string; correctAnswer: string; acceptedAnswers?: string[]; hint: string; explanation: string }
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
    before: opts.before,
    after: "",
    unit: opts.unit,
    correctAnswer: opts.correctAnswer,
    acceptedAnswers: opts.acceptedAnswers,
    inputMode: "numeric",
    hint: opts.hint,
    explanation: opts.explanation,
  };
}

export const circleSectorSegment: Skill = {
  id: "math-m-circle-sector-segment",
  code: "M.5",
  subjectId: "math",
  strandId: "math-measurement",
  grade: 9,
  title: "Sector, arc length, and segment of a circle",
  description: "Find the area of a sector, the length of an arc, or the area of a segment of a circle.",
  generate(rng) {
    const mode = randChoice(rng, ["sector-area", "arc-length", "segment-area"] as const);

    if (mode === "segment-area") {
      // Restricted to a 90° sector, where the segment = sector − a right triangle
      // with legs equal to the radius — the only case that stays exact without trig.
      const radius = randInt(rng, 4, 12);
      const sectorArea = (90 / 360) * 3.14 * radius * radius;
      const triangleArea = 0.5 * radius * radius;
      const precise = sectorArea - triangleArea;
      const rounded = roundTo(precise, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
      );
      return finish(rng, {
        promptText: `A circle has radius ${radius} cm. Find the area of the segment cut off by a 90° sector (the region between the chord and the arc). Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-sector", radius, angleDeg: 90, showChord: true },
        unit: "cm²",
        before: "Segment area =",
        correctAnswer,
        acceptedAnswers,
        hint: "Segment area = sector area − triangle area. For a 90° sector, the triangle formed by the two radii is right-angled, with area $\\frac{1}{2} \\times r \\times r$.",
        explanation: `Sector area $= \\frac{90}{360}\\times\\pi r^2 \\approx 0.25\\times3.14\\times${radius}^2 = ${sectorArea.toFixed(
          2
        )}$ cm². Triangle area $= \\frac{1}{2}\\times r \\times r = \\frac{1}{2}\\times${radius}\\times${radius} = ${triangleArea.toFixed(
          2
        )}$ cm². Segment area $= ${sectorArea.toFixed(2)} - ${triangleArea.toFixed(2)} = ${precise.toFixed(
          2
        )} \\approx ${correctAnswer}$ cm².`,
      });
    }

    const radius = randInt(rng, 3, 10);
    const angle = randChoice(rng, ANGLES);

    if (mode === "sector-area") {
      const precise = (angle / 360) * 3.14 * radius * radius;
      const rounded = roundTo(precise, 1);
      const correctAnswer = rounded.toFixed(1);
      const acceptedAnswers = Array.from(
        new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
      );
      return finish(rng, {
        promptText: `A circle has radius ${radius} cm. Find the area of a sector with angle ${angle}°. Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-sector", radius, angleDeg: angle },
        unit: "cm²",
        before: "Sector area =",
        correctAnswer,
        acceptedAnswers,
        hint: "Sector area = $\\frac{\\theta}{360} \\times \\pi \\times r^2$.",
        explanation: `$\\text{Sector area} = \\frac{${angle}}{360}\\times\\pi r^2 \\approx \\frac{${angle}}{360}\\times3.14\\times${radius}^2 = \\frac{${angle}}{360}\\times3.14\\times${
          radius * radius
        } = ${precise.toFixed(2)} \\approx ${correctAnswer}$ cm².`,
      });
    }

    // arc-length
    const precise = (angle / 360) * 2 * 3.14 * radius;
    const rounded = roundTo(precise, 1);
    const correctAnswer = rounded.toFixed(1);
    const acceptedAnswers = Array.from(
      new Set([correctAnswer, precise.toFixed(2), roundTo(rounded - 0.1, 1).toFixed(1), roundTo(rounded + 0.1, 1).toFixed(1)])
    );
    return finish(rng, {
      promptText: `A circle has radius ${radius} cm. Find the length of an arc with angle ${angle}°. Use $\\pi \\approx 3.14$.`,
      visual: { type: "circle-sector", radius, angleDeg: angle },
      unit: "cm",
      before: "Arc length =",
      correctAnswer,
      acceptedAnswers,
      hint: "Arc length = $\\frac{\\theta}{360} \\times 2 \\times \\pi \\times r$.",
      explanation: `$\\text{Arc length} = \\frac{${angle}}{360}\\times2\\pi r \\approx \\frac{${angle}}{360}\\times2\\times3.14\\times${radius} = ${precise.toFixed(
        2
      )} \\approx ${correctAnswer}$ cm.`,
    });
  },
};
