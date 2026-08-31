import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Question, Skill } from "@/lib/types";

function finish(rng: RNG, opts: { fillPrompt: string; mcPrompt: string; before: string; correctAnswer: number; hint: string; explanation: string }): Question {
  if (rng() < 0.5) {
    const wrong = [opts.correctAnswer * 2, Math.round(opts.correctAnswer / 2), opts.correctAnswer + 1, -opts.correctAnswer].filter((v) => v !== opts.correctAnswer);
    const distractors = Array.from(new Set(wrong)).slice(0, 3);
    while (distractors.length < 3) distractors.push(opts.correctAnswer + distractors.length + 5);
    const choices = shuffle(rng, [opts.correctAnswer, ...distractors]).map(String);

    return {
      kind: "multiple-choice",
      prompt: opts.mcPrompt,
      choices,
      correctIndex: choices.indexOf(String(opts.correctAnswer)),
      layout: "row",
      hint: opts.hint,
      explanation: opts.explanation,
    };
  }

  return {
    kind: "fill-blank",
    prompt: opts.fillPrompt,
    before: opts.before,
    after: "",
    correctAnswer: String(opts.correctAnswer),
    inputMode: "numeric",
    hint: opts.hint,
    explanation: opts.explanation,
  };
}

export const cubesAndCubeRoots: Skill = {
  id: "math-n-cubes-cube-roots",
  code: "N.1",
  subjectId: "math",
  strandId: "math-numbers",
  grade: 9,
  title: "Cubes and cube roots",
  description: "Find the cube of a number, or the cube root of a perfect cube.",
  generate(rng) {
    const mode = randChoice(rng, ["cube-positive", "cube-root", "cube-negative"] as const);

    if (mode === "cube-positive") {
      const n = randInt(rng, 2, 12);
      const answer = n ** 3;
      const prompt = randChoice(rng, [
        "Find the value.",
        `What is ${n} cubed?`,
        `Evaluate $${n}^3$.`,
      ]);
      return finish(rng, {
        fillPrompt: prompt,
        mcPrompt: `What is $${n}^3$?`,
        before: `$${n}^3 =$`,
        correctAnswer: answer,
        hint: "Multiply the number by itself, then multiply the result by the number one more time.",
        explanation: `$${n}^3$ means $${n} \\times ${n} \\times ${n} = ${answer}$.`,
      });
    }

    if (mode === "cube-root") {
      const base = randInt(rng, 2, 12);
      const cube = base ** 3;
      const prompt = randChoice(rng, [
        "Find the cube root.",
        `What is the cube root of ${cube}?`,
        `Evaluate $\\sqrt[3]{${cube}}$.`,
      ]);
      return finish(rng, {
        fillPrompt: prompt,
        mcPrompt: `What is $\\sqrt[3]{${cube}}$?`,
        before: `$\\sqrt[3]{${cube}} =$`,
        correctAnswer: base,
        hint: "Ask: what number multiplied by itself three times gives this result?",
        explanation: `Since $${base}^3 = ${base} \\times ${base} \\times ${base} = ${cube}$, the cube root of ${cube} is ${base}.`,
      });
    }

    // mode === "cube-negative"
    const n = randInt(rng, -12, -2);
    const answer = n ** 3;
    const squareStep = n * n;
    const prompt = randChoice(rng, [
      "Find the value.",
      `What is ${n} cubed?`,
      `Evaluate $(${n})^3$.`,
    ]);
    return finish(rng, {
      fillPrompt: prompt,
      mcPrompt: `What is $(${n})^3$?`,
      before: `$(${n})^3 =$`,
      correctAnswer: answer,
      hint: "A negative number cubed stays negative: negative × negative × negative = negative.",
      explanation: `$(${n})^3$ means $(${n}) \\times (${n}) \\times (${n})$. First $(${n}) \\times (${n}) = ${squareStep}$ (a negative times a negative is positive), then $${squareStep} \\times (${n}) = ${answer}$ (a positive times a negative is negative). So the answer stays negative.`,
    });
  },
};
