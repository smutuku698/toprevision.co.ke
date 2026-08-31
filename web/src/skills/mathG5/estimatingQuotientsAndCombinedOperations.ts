import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import type { Skill } from "@/lib/types";

function roundToNearestTen(n: number): number {
  return Math.round(n / 10) * 10;
}

export const estimatingQuotientsAndCombinedOperations: Skill = {
  id: "g5-math-n-estimating-quotients-combined",
  code: "N.12",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Estimating quotients and combined operations",
  description: "Estimate quotients by rounding to the nearest ten, and perform combined operations with addition, subtraction, multiplication and division.",
  generate(rng) {
    const branch = randChoice(rng, ["round-estimate", "estimate-mc", "combined-2op", "combined-3op", "combined-mc", "click-match", "ordering"] as const);

    if (branch === "round-estimate") {
      const divisor = randInt(rng, 12, 88);
      const quotient = randInt(rng, 2, 9);
      const dividend = divisor * quotient + randInt(rng, 0, 9);
      const rDivisor = roundToNearestTen(divisor);
      const rDividend = roundToNearestTen(dividend);
      const estimate = Math.round(rDividend / rDivisor);
      const openers = [
        `Round ${dividend} and ${divisor} to the nearest ten before dividing.`,
        `To estimate, round both ${dividend} and ${divisor} to the nearest ten.`,
        `First round ${dividend} and ${divisor} to the nearest ten.`,
        `Round each of ${dividend} and ${divisor} to the nearest ten.`,
        `Use rounding to the nearest ten on ${dividend} and ${divisor}.`,
      ];
      const closers = ["What is the estimated quotient?", "Find the estimated quotient.", "What estimate do you get?", "Work out the estimated quotient."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Estimated quotient =",
        after: "",
        correctAnswer: String(estimate),
        inputMode: "numeric",
        hint: "Round the dividend and divisor to the nearest ten, then divide the rounded numbers.",
        explanation: `${dividend} rounds to ${rDividend}; ${divisor} rounds to ${rDivisor}. ${rDividend} ÷ ${rDivisor} ≈ ${estimate}.`,
      };
    }

    if (branch === "estimate-mc") {
      const divisor = randInt(rng, 12, 88);
      const quotient = randInt(rng, 2, 9);
      const dividend = divisor * quotient + randInt(rng, 0, 9);
      const correct = Math.round(roundToNearestTen(dividend) / roundToNearestTen(divisor));
      const roundOneOnly = Math.round(roundToNearestTen(dividend) / divisor);
      const exact = Math.round(dividend / divisor);
      const wrongOrder = Math.round(roundToNearestTen(divisor) / roundToNearestTen(dividend));
      const candidates = [...new Set([roundOneOnly, exact, wrongOrder])].filter((v) => v !== correct && v >= 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correct), candidates.map(String), Math.min(3, candidates.length));
      const openers = [
        `A learner estimates ${dividend} ÷ ${divisor} by rounding both numbers to the nearest ten first.`,
        `To estimate ${dividend} ÷ ${divisor}, round both numbers to the nearest ten.`,
        `Estimate ${dividend} ÷ ${divisor} by rounding both to the nearest ten.`,
        `Which estimate correctly rounds BOTH ${dividend} and ${divisor} to the nearest ten?`,
      ];
      const closers = [" What is the estimated quotient?", " Which is the correct estimate?", " Find the best estimate.", " Pick the correctly-rounded estimate."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Round BOTH the dividend and divisor before dividing — not just one, and not the unrounded (exact) values.",
        explanation: `${dividend} rounds to ${roundToNearestTen(dividend)}; ${divisor} rounds to ${roundToNearestTen(divisor)}. Estimated quotient ≈ ${correct}. Rounding only one number, or dividing the exact numbers, gives the wrong distractors.`,
      };
    }

    if (branch === "combined-2op") {
      const type = randChoice(rng, ["mult-add", "div-sub", "mult-sub", "div-add"] as const);
      let expr = "";
      let result = 0;
      if (type === "mult-add") {
        const a = randInt(rng, 10, 80);
        const b = randInt(rng, 3, 9);
        const c = randInt(rng, 10, 500);
        result = a * b + c;
        expr = `${a} × ${b} + ${c}`;
      } else if (type === "div-sub") {
        const divisor = randInt(rng, 3, 12);
        const q = randInt(rng, 5, 80);
        const dividend = divisor * q;
        const c = randInt(rng, 5, Math.max(5, q - 3));
        result = q - c;
        expr = `${dividend} ÷ ${divisor} − ${c}`;
      } else if (type === "mult-sub") {
        const a = randInt(rng, 10, 70);
        const b = randInt(rng, 3, 9);
        const c = randInt(rng, 5, a * b - 1);
        result = a * b - c;
        expr = `${a} × ${b} − ${c}`;
      } else {
        const divisor = randInt(rng, 3, 12);
        const q = randInt(rng, 5, 80);
        const dividend = divisor * q;
        const c = randInt(rng, 5, 300);
        result = q + c;
        expr = `${dividend} ÷ ${divisor} + ${c}`;
      }
      const openers = [
        `Work out: ${expr}.`,
        `Calculate ${expr}.`,
        `Find the answer to ${expr}.`,
        `What is ${expr}?`,
        `Evaluate ${expr}, doing multiplication or division first.`,
        `Solve: ${expr}.`,
      ];
      const closers = ["", "Give your final answer.", "What is the result?", "Find the final value."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Answer =",
        after: "",
        correctAnswer: String(result),
        inputMode: "numeric",
        hint: "Do the multiplication or division first, then the addition or subtraction.",
        explanation: `${expr} = ${result} (multiply/divide before you add or subtract).`,
      };
    }

    if (branch === "combined-3op") {
      const a = randInt(rng, 5, 50);
      const b = randInt(rng, 2, 8);
      const c = randInt(rng, 10, 200);
      const divisor = randInt(rng, 2, 6);
      const dividendPart = divisor * randInt(rng, 2, 20);
      const step1 = a * b;
      const step2 = step1 + c;
      const step3 = dividendPart / divisor;
      const result = step2 - step3;
      const expr = `${a} × ${b} + ${c} − ${dividendPart} ÷ ${divisor}`;
      const openers = [`Work out: ${expr}.`, `Calculate ${expr}.`, `Find the answer to ${expr}.`, `What is ${expr}?`, `Solve: ${expr}, using the order of operations.`];
      const closers = ["", "Give your final answer.", "What is the result?", "Find the final value."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Answer =",
        after: "",
        correctAnswer: String(result),
        inputMode: "numeric",
        hint: "Do all multiplication and division first (left to right), then all addition and subtraction (left to right).",
        explanation: `${a} × ${b} = ${step1}. ${dividendPart} ÷ ${divisor} = ${step3}. ${step1} + ${c} − ${step3} = ${result}.`,
      };
    }

    if (branch === "combined-mc") {
      const a = randInt(rng, 5, 40);
      const b = randInt(rng, 2, 9);
      const c = randInt(rng, 10, 200);
      const correct = a * b + c;
      // Misconception distractors: doing the operations strictly left-to-right ignoring order of operations,
      // and adding the wrong pair.
      const leftToRight = a * (b + c);
      const addFirst = a + b * c;
      const candidates = [...new Set([leftToRight, addFirst])].filter((v) => v !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correct), candidates.map(String), Math.min(3, candidates.length));
      const expr = `${a} × ${b} + ${c}`;
      const openers = [
        `A learner works out ${expr} but is unsure what order to do the operations in.`,
        `Consider the expression ${expr}.`,
        `Look at ${expr}.`,
        `Which of these is the CORRECT value of ${expr}, following the proper order of operations?`,
      ];
      const closers = [" What is the correct answer?", " Which value is correct?", " Find the correct result.", " What should the answer be?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices: choices.map(String),
        correctIndex,
        layout: "row",
        hint: "Multiplication and division always come before addition and subtraction, no matter the order they're written in.",
        explanation: `${a} × ${b} = ${a * b}. ${a * b} + ${c} = ${correct}. Adding before multiplying, or multiplying the wrong pair of numbers, gives the wrong distractors.`,
      };
    }

    if (branch === "ordering") {
      const problems = Array.from({ length: 4 }, () => {
        const divisor = randInt(rng, 3, 30);
        const quotient = randInt(rng, 3, Math.floor(999 / divisor));
        return { id: "", label: `${divisor * quotient} ÷ ${divisor}`, value: quotient };
      }).map((p, i) => ({ ...p, id: `q${i}` }));
      const sortedIdx = problems.map((_, i) => i).sort((a, b) => problems[a].value - problems[b].value);
      const prompts = [
        "Work out each quotient, then order them from smallest to largest.",
        "Order these divisions by their quotient, smallest to largest.",
        "Arrange these divisions by result, smallest first.",
        "Put these divisions in order of their quotient.",
        "Rank these divisions by quotient, smallest to largest.",
        "Sequence these divisions by their result.",
        "Order these quotients, starting with the smallest.",
        "Sort these divisions by quotient, smallest first.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest quotient first.",
        items: shuffle(rng, problems.map((p) => ({ id: p.id, label: p.label }))),
        correctOrder: sortedIdx.map((i) => problems[i].id),
        hint: "Work out each quotient before comparing.",
        explanation: sortedIdx.map((i) => `${problems[i].label} = ${problems[i].value}`).join(", ") + ".",
      };
    }

    // click-match: match each combined expression to its correct value.
    const problems = Array.from({ length: 4 }, () => {
      const a = randInt(rng, 5, 30);
      const b = randInt(rng, 2, 8);
      const c = randInt(rng, 5, 100);
      return { expr: `${a} × ${b} + ${c}`, value: a * b + c };
    });
    const tokens = problems.map((p, i) => ({ id: `e${i}`, label: p.expr }));
    const targets = shuffle(rng, problems.map((p, i) => ({ id: `e${i}`, label: String(p.value) })));
    const correctMap: Record<string, string> = {};
    problems.forEach((_, i) => (correctMap[`e${i}`] = `e${i}`));
    const prompts = [
      "Match each combined expression to its value.",
      "Pair each expression with its correct answer.",
      "Match each calculation to its result.",
      "Connect each combined operation to its value.",
      "Match each expression to the correct total.",
      "Pair each combined expression with its answer.",
      "Match each expression card to its value.",
      "Link each combined calculation to its result.",
      "Match every expression to its correct value.",
      "Connect each combined operation with its answer.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens: shuffle(rng, tokens),
      targets,
      correctMap,
      hint: "Multiply first, then add, for each expression.",
      explanation: problems.map((p) => `${p.expr} = ${p.value}`).join("; ") + ".",
    };
  },
};
