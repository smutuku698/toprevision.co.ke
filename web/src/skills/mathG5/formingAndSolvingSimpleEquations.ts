import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { EQUATION_SCENARIO_CONTEXTS, fillTemplate } from "./contexts";
import type { Skill } from "@/lib/types";

export const formingAndSolvingSimpleEquations: Skill = {
  id: "g5-math-n-simple-equations",
  code: "N.17",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Forming and solving simple equations",
  description: "Form and solve simple equations with one unknown from real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["solve-add", "solve-subtract", "solve-multiply", "form-equation-mc", "solve-two-step", "click-match", "categorize"] as const);

    if (branch === "solve-add") {
      const x = randInt(rng, 5, 200);
      const b = randInt(rng, 3, 150);
      const sum = x + b;
      const openers = [
        `Solve for x: x + ${b} = ${sum}.`,
        `Find x if x + ${b} = ${sum}.`,
        `What is x, given that x + ${b} = ${sum}?`,
        `Work out the value of x: x + ${b} = ${sum}.`,
        `In the equation x + ${b} = ${sum}, find x.`,
      ];
      const closers = ["", "Solve the equation.", "Find the unknown.", "What does x equal?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "x =",
        after: "",
        correctAnswer: String(x),
        inputMode: "numeric",
        hint: "To undo adding, subtract the same number from both sides.",
        explanation: `x + ${b} = ${sum}, so x = ${sum} − ${b} = ${x}.`,
      };
    }

    if (branch === "solve-subtract") {
      const x = randInt(rng, 20, 300);
      const b = randInt(rng, 3, x - 2);
      const diff = x - b;
      const openers = [
        `Solve for x: x − ${b} = ${diff}.`,
        `Find x if x − ${b} = ${diff}.`,
        `What is x, given that x − ${b} = ${diff}?`,
        `Work out the value of x: x − ${b} = ${diff}.`,
        `In the equation x − ${b} = ${diff}, find x.`,
      ];
      const closers = ["", "Solve the equation.", "Find the unknown.", "What does x equal?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "x =",
        after: "",
        correctAnswer: String(x),
        inputMode: "numeric",
        hint: "To undo subtracting, add the same number to both sides.",
        explanation: `x − ${b} = ${diff}, so x = ${diff} + ${b} = ${x}.`,
      };
    }

    if (branch === "solve-multiply") {
      const x = randInt(rng, 3, 60);
      const a = randInt(rng, 2, 12);
      const product = a * x;
      const openers = [
        `Solve for x: ${a}x = ${product}.`,
        `Find x if ${a} × x = ${product}.`,
        `What is x, given that ${a}x = ${product}?`,
        `Work out the value of x: ${a} × x = ${product}.`,
        `In the equation ${a}x = ${product}, find x.`,
      ];
      const closers = ["", "Solve the equation.", "Find the unknown.", "What does x equal?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "x =",
        after: "",
        correctAnswer: String(x),
        inputMode: "numeric",
        hint: "To undo multiplying, divide both sides by the same number.",
        explanation: `${a}x = ${product}, so x = ${product} ÷ ${a} = ${x}.`,
      };
    }

    if (branch === "form-equation-mc") {
      const ctx = randChoice(rng, EQUATION_SCENARIO_CONTEXTS);
      const scenario = fillTemplate(ctx.subject, rng);
      const change = randInt(rng, 3, 60);
      const result = randInt(rng, 5, 200);
      const useLose = rng() < 0.5;
      const correctEq = useLose ? `x − ${change} = ${result}` : `x + ${change} = ${result}`;
      const wrongFlippedOp = useLose ? `x + ${change} = ${result}` : `x − ${change} = ${result}`;
      const wrongSwap = useLose ? `${change} − x = ${result}` : `${result} − x = ${change}`;
      const candidates = [wrongFlippedOp, wrongSwap];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctEq, candidates, candidates.length);
      const verb = useLose ? ctx.verbLose : ctx.verbGain;
      const openers = [
        `${scenario} had an unknown number of ${ctx.item}. After ${verb} ${change}, ${useLose ? "they had" : "the total became"} ${result}.`,
        `${scenario} started with an unknown number of ${ctx.item}. They ${verb} ${change}, ending with ${result}.`,
        `Starting with an unknown amount of ${ctx.item}, ${scenario} ${verb} ${change}, leaving a total of ${result}.`,
      ];
      const closers = [
        " Which equation correctly represents this situation, using x for the starting number?",
        " Which equation matches this story, with x as the unknown starting amount?",
        " Choose the equation that correctly models this, using x for the starting number.",
      ];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "list",
        hint: `If the amount was ${useLose ? "taken away" : "added"}, that operation goes between x and the change amount, and the RESULT goes on the other side of the equals sign.`,
        explanation: `The starting amount is x. Since ${change} was ${useLose ? "taken away (subtracted)" : "added"}, the correct equation is ${correctEq}. Flipping the operation, or putting x on the wrong side, gives the wrong distractors.`,
      };
    }

    if (branch === "solve-two-step") {
      const x = randInt(rng, 4, 40);
      const a = randInt(rng, 2, 8);
      const b = randInt(rng, 3, 100);
      const result = a * x + b;
      const openers = [
        `Solve for x: ${a}x + ${b} = ${result}.`,
        `Find x if ${a} × x + ${b} = ${result}.`,
        `What is x, given that ${a}x + ${b} = ${result}?`,
        `Work out the value of x: ${a}x + ${b} = ${result}.`,
        `In the equation ${a}x + ${b} = ${result}, find x.`,
      ];
      const closers = ["", "Solve the equation.", "Find the unknown.", "What does x equal?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "x =",
        after: "",
        correctAnswer: String(x),
        inputMode: "numeric",
        hint: "First undo the addition (subtract from both sides), then undo the multiplication (divide both sides).",
        explanation: `${a}x + ${b} = ${result}. Subtract ${b}: ${a}x = ${result - b}. Divide by ${a}: x = ${x}.`,
      };
    }

    if (branch === "click-match") {
      const problems = Array.from({ length: 4 }, () => {
        const x = randInt(rng, 3, 90);
        const b = randInt(rng, 2, 60);
        return { label: `x + ${b} = ${x + b}`, answer: `x = ${x}` };
      });
      const tokens = problems.map((p, i) => ({ id: `p${i}`, label: p.label }));
      const targets = shuffle(rng, problems.map((p, i) => ({ id: `p${i}`, label: p.answer })));
      const correctMap: Record<string, string> = {};
      problems.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      const prompts = [
        "Match each equation to its solution.",
        "Pair each equation with the value of x.",
        "Match each equation to its correct answer.",
        "Connect each equation to its solution.",
        "Match each equation card to its solution.",
        "Pair each equation with the correct value of x.",
        "Match every equation to its correct x value.",
        "Link each equation to its solution.",
        "Match each equation to the value that solves it.",
        "Connect each equation with its solution.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Subtract the known number from both sides to isolate x.",
        explanation: problems.map((p) => `${p.label} → ${p.answer}`).join("; ") + ".",
      };
    }

    // categorize: sort equations by whether x is a two-digit or one-digit solution.
    const problems = Array.from({ length: 6 }, () => {
      const type = randChoice(rng, ["add", "subtract", "multiply"] as const);
      const x = randInt(rng, 2, 95);
      if (type === "add") {
        const b = randInt(rng, 2, 50);
        return { label: `x + ${b} = ${x + b}`, x };
      }
      if (type === "subtract") {
        const b = randInt(rng, 2, Math.max(2, x - 1));
        return { label: `x − ${b} = ${x - b}`, x };
      }
      const a = randInt(rng, 2, 9);
      return { label: `${a}x = ${a * x}`, x };
    });
    const items = problems.map((p, i) => ({ id: `p${i}`, label: p.label }));
    const buckets = [
      { id: "one-digit", label: "x is a one-digit number" },
      { id: "two-digit", label: "x is a two-digit number" },
    ];
    const correctBucket: Record<string, string> = {};
    problems.forEach((p, i) => (correctBucket[`p${i}`] = p.x < 10 ? "one-digit" : "two-digit"));
    const catPrompts = [
      "Solve each equation, then sort by whether x is one digit or two digits.",
      "Sort each equation by whether its solution is a one-digit or two-digit number.",
      "Group each equation by the size of its solution.",
      "Classify each equation: one-digit solution, or two-digit solution.",
      "Solve each equation and sort it by the number of digits in x.",
      "Sort these equations into 'one-digit x' and 'two-digit x'.",
      "Work out x for each equation, then sort by digit count.",
      "Group these equations by whether x has one digit or two.",
      "Classify each equation by whether x is under 10 or not.",
      "Sort each equation based on the size of its solution.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Solve each equation for x first, then check whether it's under 10 or 10 and above.",
      explanation: problems.map((p) => `${p.label} → x = ${p.x}`).join("; ") + ".",
    };
  },
};

