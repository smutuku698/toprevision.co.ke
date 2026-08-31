import { numericDistractors, randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

export const indices: Skill = {
  id: "math-n-indices",
  code: "N.2",
  subjectId: "math",
  strandId: "math-numbers",
  grade: 9,
  title: "Laws of indices",
  description: "Simplify expressions using the laws of indices (multiplication, division, power-of-a-power, and the zero power).",
  generate(rng) {
    const mode = randChoice(rng, ["mul", "div", "power-of-power", "zero-power"] as const);

    if (mode === "mul" || mode === "div") {
      const base = randChoice(rng, [2, 3, 4, 5]);
      const m = randInt(rng, 2, 7);
      const n = randInt(rng, 1, m - 1);

      const resultExp = mode === "mul" ? m + n : m - n;
      const prompt =
        mode === "mul"
          ? `Simplify: $${base}^{${m}} \\times ${base}^{${n}}$`
          : `Simplify: $${base}^{${m}} \\div ${base}^{${n}}$`;
      const correctChoiceText = `$${base}^{${resultExp}}$`;

      const distractExps = numericDistractors(
        rng,
        resultExp,
        [m * n, m + n + 1, Math.abs(m - n - 1), resultExp + 1, resultExp - 1].filter((v) => v !== resultExp),
        3
      );
      const choices = shuffle(rng, [
        correctChoiceText,
        ...distractExps.map((e) => `$${base}^{${e}}$`),
      ]);
      const correctIndex = choices.indexOf(correctChoiceText);

      const explanation =
        mode === "mul"
          ? `By the multiplication law of indices, when multiplying powers with the same base you add the exponents: $${base}^{${m}} \\times ${base}^{${n}} = ${base}^{${m}+${n}} = ${base}^{${resultExp}}$.`
          : `By the division law of indices, when dividing powers with the same base you subtract the exponents: $${base}^{${m}} \\div ${base}^{${n}} = ${base}^{${m}-${n}} = ${base}^{${resultExp}}$.`;
      const hint = mode === "mul" ? "Same base, multiplying: add the exponents." : "Same base, dividing: subtract the exponents.";

      if (rng() < 0.5) {
        return {
          kind: "fill-blank",
          prompt: `${prompt}, written as $${base}^n$. What is n?`,
          before: "n =",
          after: "",
          correctAnswer: String(resultExp),
          inputMode: "numeric",
          hint,
          explanation,
        };
      }

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex,
        layout: "grid",
        hint,
        explanation,
      };
    }

    if (mode === "power-of-power") {
      const base = randChoice(rng, [2, 3, 4, 5]);
      const m = randInt(rng, 2, 4);
      const n = randInt(rng, 2, 3);
      const resultExp = m * n;
      const prompt = `Simplify: $(${base}^{${m}})^{${n}}$`;
      const correctChoiceText = `$${base}^{${resultExp}}$`;

      const distractExps = numericDistractors(
        rng,
        resultExp,
        [m + n, m * n + 1, Math.abs(m * n - 1), resultExp + 2, resultExp - 2].filter((v) => v !== resultExp && v > 0),
        3
      );
      const choices = shuffle(rng, [
        correctChoiceText,
        ...distractExps.map((e) => `$${base}^{${e}}$`),
      ]);
      const correctIndex = choices.indexOf(correctChoiceText);

      const hint = "Power of a power: multiply the exponents.";
      const explanation = `By the power-of-a-power law, $(${base}^{${m}})^{${n}} = ${base}^{${m} \\times ${n}} = ${base}^{${resultExp}}$.`;

      if (rng() < 0.5) {
        return {
          kind: "fill-blank",
          prompt: `${prompt}, written as $${base}^n$. What is n?`,
          before: "n =",
          after: "",
          correctAnswer: String(resultExp),
          inputMode: "numeric",
          hint,
          explanation,
        };
      }

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex,
        layout: "grid",
        hint,
        explanation,
      };
    }

    // mode === "zero-power"
    const base = randInt(rng, 2, 9);
    const prompt = `Simplify: $${base}^0$`;
    const hint = "Any nonzero base raised to the power 0 is always 1.";
    const explanation = `Any nonzero number raised to the power 0 equals 1, so $${base}^0 = 1$.`;

    if (rng() < 0.5) {
      return {
        kind: "fill-blank",
        prompt,
        before: `$${base}^0 =$`,
        after: "",
        correctAnswer: "1",
        inputMode: "numeric",
        hint,
        explanation,
      };
    }

    const choices = shuffle(rng, ["1", "0", String(base), String(base * base)]);
    const correctIndex = choices.indexOf("1");

    return {
      kind: "multiple-choice",
      prompt,
      choices,
      correctIndex,
      layout: "grid",
      hint,
      explanation,
    };
  },
};
