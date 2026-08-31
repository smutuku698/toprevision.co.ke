import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { NumberLineQuestion, Skill } from "@/lib/types";

export const solvingInequalities: Skill = {
  id: "g6-math-n-solving-inequalities",
  code: "N.16",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Solving inequalities",
  description: "Simplify and solve simple inequalities in one unknown, using the symbols > and < only, and illustrate solutions on a number line.",
  generate(rng) {
    const branch = randChoice(rng, ["solve-add", "solve-classical", "plot-number-line", "test-value", "simplify-inequality", "match-terms", "classify-solution"] as const);

    if (branch === "solve-add") {
      const boundary = randInt(rng, 5, 60);
      const a = randInt(rng, 2, 15);
      const isGreater = rng() < 0.5;
      const symbol = isGreater ? ">" : "<";
      const rhs = boundary + a;
      return {
        kind: "fill-blank",
        prompt: `Solve for x: $x + ${a} ${symbol} ${rhs}$ (give the boundary value only).`,
        before: "x is bounded by",
        after: "",
        correctAnswer: String(boundary),
        inputMode: "numeric",
        hint: `Subtract ${a} from both sides.`,
        explanation: `Subtracting ${a} from both sides: $x ${symbol} ${boundary}$.`,
      };
    }

    if (branch === "solve-classical") {
      const boundary = randInt(rng, 3, 40);
      const a = randInt(rng, 2, 9);
      const isGreater = rng() < 0.5;
      const symbol = isGreater ? ">" : "<";
      const rhs = a * boundary;
      return {
        kind: "fill-blank",
        prompt: `Solve for x: $${a}x ${symbol} ${rhs}$ (give the boundary value only).`,
        before: "x is bounded by",
        after: "",
        correctAnswer: String(boundary),
        inputMode: "numeric",
        hint: `Divide both sides by ${a}.`,
        explanation: `Dividing both sides by ${a}: $x ${symbol} ${boundary}$.`,
      };
    }

    if (branch === "plot-number-line") {
      const boundary = randInt(rng, -8, 15);
      const isGreater = rng() < 0.5;
      const mode: NumberLineQuestion["mode"] = isGreater ? "inequality-gt" : "inequality-lt";
      return {
        kind: "number-line",
        prompt: `Illustrate the inequality $x ${isGreater ? ">" : "<"} ${boundary}$ on the number line by clicking a point that satisfies it.`,
        hint: isGreater ? "Click any point to the right of the boundary." : "Click any point to the left of the boundary.",
        min: -15,
        max: 20,
        step: 1,
        correctValue: boundary,
        mode,
        explanation: `$x ${isGreater ? ">" : "<"} ${boundary}$ means x can be any value strictly ${isGreater ? "more than" : "less than"} ${boundary}.`,
      };
    }

    if (branch === "test-value") {
      const boundary = randInt(rng, -5, 20);
      const isGreater = rng() < 0.5;
      const correct = isGreater ? boundary + randInt(rng, 1, 5) : boundary - randInt(rng, 1, 5);
      const wrong = isGreater
        ? [String(boundary - randInt(rng, 1, 5)), String(boundary), String(boundary - randInt(rng, 6, 9))]
        : [String(boundary + randInt(rng, 1, 5)), String(boundary), String(boundary + randInt(rng, 6, 9))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correct), wrong);
      return {
        kind: "multiple-choice",
        prompt: `Which of these values satisfies $x ${isGreater ? ">" : "<"} ${boundary}$?`,
        choices,
        correctIndex,
        layout: "row",
        hint: isGreater ? "It must be strictly bigger than the boundary." : "It must be strictly smaller than the boundary.",
        explanation: `${correct} is ${isGreater ? "greater" : "less"} than ${boundary}, so it satisfies $x ${isGreater ? ">" : "<"} ${boundary}$. The boundary value itself never satisfies a strict inequality.`,
      };
    }

    if (branch === "simplify-inequality") {
      const boundary = randInt(rng, 4, 30);
      const a = randInt(rng, 2, 12);
      const isGreater = rng() < 0.5;
      const symbol = isGreater ? ">" : "<";
      const rhs = boundary + a; // both sides carry +a, so simplifying cancels it, leaving x (symbol) boundary
      const correctText = `x ${symbol} ${boundary}`;
      const wrong = [`x ${isGreater ? "<" : ">"} ${boundary}`, `x ${symbol} ${rhs}`, `x ${symbol} ${Math.max(0, boundary - a)}`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Simplify: $x + ${a} ${symbol} ${rhs}$.`,
        choices,
        correctIndex,
        layout: "list",
        hint: `Subtract ${a} from both sides to isolate x.`,
        explanation: `Subtracting ${a} from both sides of $x + ${a} ${symbol} ${rhs}$ gives $x ${symbol} ${boundary}$.`,
      };
    }

    if (branch === "match-terms") {
      const pairs = [
        { term: "Solve", meaning: "Find the value(s) of the unknown that make the inequality true" },
        { term: "Simplify", meaning: "Rearrange an inequality into its simplest form without changing what it means" },
        { term: "Boundary value", meaning: "The number the unknown is being compared to" },
        { term: "Satisfies", meaning: "Makes the inequality a true statement when substituted in" },
      ] as const;
      const tokens = pairs.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each inequality-solving term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about each step of solving an inequality like x + 3 > 10.",
        explanation: pairs.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // classify-solution: sort candidate x-values by whether they solve a given inequality
    const boundary = randInt(rng, -5, 25);
    const isGreater = rng() < 0.5;
    const candidatesSet = new Set<number>();
    while (candidatesSet.size < 5) candidatesSet.add(randInt(rng, boundary - 8, boundary + 8));
    const candidates = [...candidatesSet];
    const items = candidates.map((v) => ({ id: String(v), label: String(v) }));
    const buckets = [
      { id: "yes", label: `Satisfies $x ${isGreater ? ">" : "<"} ${boundary}$` },
      { id: "no", label: "Does not satisfy it" },
    ];
    const correctBucket: Record<string, string> = {};
    candidates.forEach((v) => (correctBucket[String(v)] = (isGreater ? v > boundary : v < boundary) ? "yes" : "no"));
    return {
      kind: "categorize",
      prompt: `Sort each value by whether it satisfies $x ${isGreater ? ">" : "<"} ${boundary}$.`,
      items,
      buckets,
      correctBucket,
      hint: isGreater ? "It must be strictly bigger than the boundary." : "It must be strictly smaller than the boundary.",
      explanation: candidates.map((v) => `${v} ${(isGreater ? v > boundary : v < boundary) ? "satisfies" : "does not satisfy"} x ${isGreater ? ">" : "<"} ${boundary}`).join("; ") + ".",
    };
  },
};
