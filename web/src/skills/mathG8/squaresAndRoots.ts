import { numericDistractors, randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

export const squaresAndRoots: Skill = {
  id: "g8-math-n-squares-roots",
  code: "N.4",
  subjectId: "math",
  strandId: "g8-math-numbers",
  grade: 8,
  title: "Squares and square roots",
  description: "Find squares and square roots of numbers, estimate roots of non-perfect squares, and recognize perfect squares.",
  generate(rng) {
    const branch = randChoice(rng, ["square", "root", "estimate", "sum-diff", "match", "perfect-sort"] as const);

    if (branch === "square") {
      const n = randInt(rng, 8, 40);
      const answer = n * n;
      const distractors = numericDistractors(rng, answer, [n * 2, (n + 1) * (n + 1), (n - 1) * (n - 1), answer + n, answer - n], 3);
      const choices = shuffle(rng, [answer, ...distractors]).map(String);
      return {
        kind: "multiple-choice",
        prompt: `What is $${n}^2$?`,
        choices,
        correctIndex: choices.indexOf(String(answer)),
        layout: "row",
        hint: "Multiply the number by itself.",
        explanation: `$${n}^2 = ${n} \\times ${n} = ${answer}$.`,
      };
    }

    if (branch === "root") {
      const n = randInt(rng, 8, 40);
      const square = n * n;
      return {
        kind: "fill-blank",
        prompt: `Find $\\sqrt{${square}}$.`,
        before: "",
        after: "",
        correctAnswer: String(n),
        inputMode: "numeric",
        hint: `Find a number which, multiplied by itself, gives ${square}.`,
        explanation: `$\\sqrt{${square}} = ${n}$ because $${n} \\times ${n} = ${square}$.`,
      };
    }

    if (branch === "sum-diff") {
      // A genuine two-step calculation, not just a single square/root lookup.
      const a = randInt(rng, 4, 20);
      const b = randInt(rng, 4, 20);
      const op = randChoice(rng, ["sum", "diff"] as const);
      const aSq = a * a;
      const bSq = b * b;
      const answer = op === "sum" ? aSq + bSq : Math.abs(aSq - bSq);
      const opSym = op === "sum" ? "+" : "-";
      const first = op === "diff" && aSq < bSq ? b : a;
      const second = op === "diff" && aSq < bSq ? a : b;
      return {
        kind: "fill-blank",
        prompt: `Work out: $${first}^2 ${opSym} ${second}^2$`,
        before: "",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "Square each number first, then add or subtract the results.",
        explanation: `$${first}^2 = ${first * first}$ and $${second}^2 = ${second * second}$. $${first * first} ${opSym} ${second * second} = ${answer}$.`,
      };
    }

    if (branch === "estimate") {
      const n = randInt(rng, 10, 40);
      const target = n * n + randInt(rng, 1, 2 * n); // strictly between n^2 and (n+1)^2
      const lower = n;
      const upper = n + 1;
      const choices = shuffle(rng, [
        `Between ${lower} and ${upper}`,
        `Between ${lower - 1} and ${lower}`,
        `Between ${upper} and ${upper + 1}`,
        `Between ${lower - 2} and ${lower - 1}`,
      ]);
      const correctText = `Between ${lower} and ${upper}`;
      return {
        kind: "multiple-choice",
        prompt: `Without a calculator: $\\sqrt{${target}}$ lies between which two whole numbers?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: `Find the two perfect squares on either side of ${target} (like from a table of squares).`,
        explanation: `$${lower}^2 = ${lower * lower}$ and $${upper}^2 = ${upper * upper}$. Since $${lower * lower} < ${target} < ${upper * upper}$, $\\sqrt{${target}}$ is between ${lower} and ${upper}.`,
      };
    }

    if (branch === "match") {
      const pairCount = randChoice(rng, [3, 4] as const);
      const bases = sampleDistinctInts(rng, 6, 35, pairCount);
      const tokens = bases.map((b) => ({ id: `n${b}`, label: String(b) }));
      const targets = shuffle(rng, bases.map((b) => ({ id: `t${b}`, label: String(b * b) })));
      const correctMap: Record<string, string> = {};
      for (const b of bases) correctMap[`t${b}`] = `n${b}`;
      return {
        kind: "click-match",
        prompt: "Match each number to its square.",
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Multiply each number by itself.",
        explanation: bases.map((b) => `${b}² = ${b * b}`).join(", ") + ".",
      };
    }

    // perfect-sort: categorize numbers as perfect square or not
    const perfectBases = sampleDistinctInts(rng, 8, 30, 3);
    const perfects = perfectBases.map((b) => b * b);
    const nonPerfects: number[] = [];
    while (nonPerfects.length < 3) {
      const candidate = randInt(rng, 60, 850);
      if (!Number.isInteger(Math.sqrt(candidate)) && !nonPerfects.includes(candidate)) nonPerfects.push(candidate);
    }
    const items = shuffle(rng, [...perfects, ...nonPerfects]).map((v) => ({ id: `v${v}`, label: String(v) }));
    const buckets = [
      { id: "perfect", label: "Perfect square" },
      { id: "not", label: "Not a perfect square" },
    ];
    const correctBucket: Record<string, string> = {};
    for (const v of perfects) correctBucket[`v${v}`] = "perfect";
    for (const v of nonPerfects) correctBucket[`v${v}`] = "not";
    return {
      kind: "categorize",
      prompt: "Sort each number by whether it is a perfect square.",
      items,
      buckets,
      correctBucket,
      hint: "A perfect square is the result of a whole number multiplied by itself.",
      explanation: `Perfect squares: ${perfects.map((v, i) => `${v} (${perfectBases[i]}²)`).join(", ")}. Not perfect squares: ${nonPerfects.join(", ")}.`,
    };
  },
};
