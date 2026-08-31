import { numericDistractors, randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

export const matchSquares: Skill = {
  id: "math-n-match-squares",
  code: "N.3",
  subjectId: "math",
  strandId: "math-numbers",
  grade: 9,
  title: "Match numbers to their squares",
  description: "Match each integer to its square value.",
  generate(rng) {
    const kind = randChoice(rng, ["click-match", "multiple-choice"] as const);

    if (kind === "multiple-choice") {
      const n = randInt(rng, 3, 20);
      const answer = n * n;
      const distractors = numericDistractors(
        rng,
        answer,
        [n * 2, (n + 1) * (n + 1), (n - 1) * (n - 1), answer + n, answer - n, answer + 1, answer - 1],
        3
      );
      const choices = shuffle(rng, [answer, ...distractors]).map(String);
      const correctIndex = choices.indexOf(String(answer));

      return {
        kind: "multiple-choice",
        prompt: `What is ${n}² (${n} squared)?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Multiply the number by itself.",
        explanation: `${n}² = ${n} × ${n} = ${answer}.`,
      };
    }

    const pairCount = randChoice(rng, [3, 4] as const);
    const bases = sampleDistinctInts(rng, 3, 20, pairCount);
    const tokens = bases.map((b) => ({ id: `n${b}`, label: String(b) }));
    const targets = shuffle(
      rng,
      bases.map((b) => ({ id: `t${b}`, label: String(b * b) }))
    );
    const correctMap: Record<string, string> = {};
    for (const b of bases) correctMap[`t${b}`] = `n${b}`;

    return {
      kind: "click-match",
      prompt: "Match each number to its square.",
      tokens: shuffle(rng, tokens),
      targets,
      correctMap,
      hint: "Multiply each number by itself to find its square.",
      explanation: bases.map((b) => `${b}² = ${b * b}`).join(", ") + ".",
    };
  },
};
