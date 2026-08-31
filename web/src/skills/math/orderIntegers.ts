import { randChoice, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

export const orderIntegers: Skill = {
  id: "math-n-order-integers",
  code: "N.4",
  subjectId: "math",
  strandId: "math-numbers",
  grade: 9,
  title: "Order integers",
  description: "Arrange a set of positive and negative integers from least to greatest, or greatest to least.",
  generate(rng) {
    const count = randChoice(rng, [4, 5, 6] as const);
    const direction = randChoice(rng, ["ascending", "descending"] as const);
    const values = sampleDistinctInts(rng, -20, 20, count);
    const items = values.map((v) => ({ id: `v${v}`, label: String(v) }));
    const sortedValues = [...values].sort((a, b) => (direction === "ascending" ? a - b : b - a));
    const correctOrder = sortedValues.map((v) => `v${v}`);

    const prompt =
      direction === "ascending"
        ? "Order these integers from least to greatest."
        : "Order these integers from greatest to least.";
    const instruction =
      direction === "ascending"
        ? "Click the numbers in order, smallest first."
        : "Click the numbers in order, largest first.";

    const kind = randChoice(rng, ["ordering", "multiple-choice"] as const);

    if (kind === "multiple-choice") {
      const extremeLabel = direction === "ascending" ? "smallest" : "largest";
      const correctValue = sortedValues[0];
      const choices = shuffle(rng, values).map(String);
      const correctIndex = choices.indexOf(String(correctValue));

      return {
        kind: "multiple-choice",
        prompt: `Which of these integers is the ${extremeLabel}?`,
        choices,
        correctIndex,
        layout: "row",
        hint:
          direction === "ascending"
            ? "The most negative number is the smallest."
            : "The number furthest to the right on the number line is the largest.",
        explanation: `Ordered from least to greatest: ${[...values].sort((a, b) => a - b).join(", ")}. The ${extremeLabel} value is ${correctValue}.`,
      };
    }

    return {
      kind: "ordering",
      prompt,
      instruction,
      items: shuffle(rng, items),
      correctOrder,
      hint: direction === "ascending" ? "The most negative number comes first." : "The largest number comes first.",
      explanation: `In order from ${direction === "ascending" ? "least to greatest" : "greatest to least"}: ${sortedValues.join(", ")}.`,
    };
  },
};
