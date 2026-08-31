import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { NumberLineQuestion, Question, Skill } from "@/lib/types";

const SATISFIES: Record<NumberLineQuestion["mode"], (v: number, target: number) => boolean> = {
  point: (v, target) => v === target,
  "inequality-gt": (v, target) => v > target,
  "inequality-gte": (v, target) => v >= target,
  "inequality-lt": (v, target) => v < target,
  "inequality-lte": (v, target) => v <= target,
};

function finish(
  rng: RNG,
  opts: { promptExpr: string; hint: string; explanation: string; correctValue: number; mode: NumberLineQuestion["mode"] }
): Question {
  if (rng() < 0.5) {
    const satisfies = (v: number) => SATISFIES[opts.mode](v, opts.correctValue);
    const candidates = [-9, -6, -4, -2, -1, 0, 1, 2, 4, 6, 9].filter((v) => v >= -10 && v <= 10);
    const satisfying = candidates.filter(satisfies);
    const notSatisfying = candidates.filter((v) => !satisfies(v));
    const correct = randChoice(rng, satisfying.length ? satisfying : [opts.correctValue]);
    const distractors = shuffle(rng, notSatisfying).slice(0, 3);
    const choices = shuffle(rng, [correct, ...distractors]).map(String);

    return {
      kind: "multiple-choice",
      prompt: `Solve for x: $${opts.promptExpr}$. Which value of x is part of the solution?`,
      choices,
      correctIndex: choices.indexOf(String(correct)),
      layout: "row",
      hint: opts.hint,
      explanation: opts.explanation,
    };
  }

  return {
    kind: "number-line",
    prompt: `Solve for x, then click a point on the number line that satisfies the solution: $${opts.promptExpr}$`,
    hint: opts.hint,
    min: -10,
    max: 10,
    step: 1,
    correctValue: opts.correctValue,
    mode: opts.mode,
    explanation: opts.explanation,
  };
}

const OPS = [
  { op: ">", mode: "inequality-gt" as const, flipped: "inequality-lt" as const },
  { op: "\\geq", mode: "inequality-gte" as const, flipped: "inequality-lte" as const },
  { op: "<", mode: "inequality-lt" as const, flipped: "inequality-gt" as const },
  { op: "\\leq", mode: "inequality-lte" as const, flipped: "inequality-gte" as const },
];

export const linearInequalities: Skill = {
  id: "math-a-linear-inequalities",
  code: "A.1",
  subjectId: "math",
  strandId: "math-algebra",
  grade: 9,
  title: "Solve linear inequalities",
  description: "Solve a one-step linear inequality and plot the solution on a number line.",
  generate(rng): Question {
    const form = randChoice(rng, ["simple", "coefficient", "negative"] as const);
    const chosen = randChoice(rng, OPS);

    if (form === "coefficient") {
      // ax op b, a positive so the direction never flips — pick the true boundary
      // first, then build b so it divides evenly.
      const x = randInt(rng, -6, 6);
      const a = randInt(rng, 2, 5);
      const b = a * x;

      return finish(rng, {
        promptExpr: `${a}x ${chosen.op} ${b}`,
        hint: `Divide both sides by ${a}.`,
        correctValue: x,
        mode: chosen.mode,
        explanation: `Divide both sides by ${a}: $x ${chosen.op} ${b} \\div ${a} = x ${chosen.op} ${x}$. Since ${a} is positive, the inequality direction stays the same.`,
      });
    }

    if (form === "negative") {
      // -x + a op b, coefficient of x is -1 so solving REQUIRES flipping the
      // direction. Pick the true final boundary first, then derive b.
      const x = randInt(rng, -6, 6);
      const a = randInt(rng, 1, 8);
      const b = a - x;
      const flippedOp = OPS.find((o) => o.mode === chosen.flipped)!.op;

      return finish(rng, {
        promptExpr: `-x + ${a} ${chosen.op} ${b}`,
        hint: "Isolate x, then divide by -1 — remember this flips the inequality sign.",
        correctValue: x,
        mode: chosen.flipped,
        explanation: `Subtract ${a} from both sides: $-x ${chosen.op} ${b - a}$. Dividing both sides by a negative number (-1) flips the inequality sign: $x ${flippedOp} ${x}$.`,
      });
    }

    // "simple" form: x + a op b
    const x = randInt(rng, -6, 6);
    const a = randInt(rng, 1, 8);
    const rhs = x + a;

    return finish(rng, {
      promptExpr: `x + ${a} ${chosen.op} ${rhs}`,
      hint: `Subtract ${a} from both sides.`,
      correctValue: x,
      mode: chosen.mode,
      explanation: `Subtract ${a} from both sides: $x ${chosen.op} ${rhs} - ${a} = ${x}$.`,
    });
  },
};
