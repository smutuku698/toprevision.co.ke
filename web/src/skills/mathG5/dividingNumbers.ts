import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt, fmtDec } from "./mathUtils";
import { SHARING_CONTEXTS } from "./contexts";
import type { Skill } from "@/lib/types";

export const dividingNumbers: Skill = {
  id: "g5-math-n-division",
  code: "N.11",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Dividing whole numbers",
  description: "Divide up to a 3-digit number by up to a 2-digit number, apply the multiplication-division relationship, and divide a number by 1000.",
  generate(rng) {
    const branch = randChoice(rng, ["classical", "real-world", "inverse-relationship", "divide-by-1000", "click-match", "categorize", "quotient-mc", "ordering"] as const);

    if (branch === "classical") {
      const divisor = randInt(rng, 2, 90);
      const quotient = randInt(rng, 2, Math.floor(999 / divisor));
      const dividend = divisor * quotient;
      const openers = [
        `Work out ${dividend} ÷ ${divisor}.`,
        `Divide ${dividend} by ${divisor}.`,
        `Find ${dividend} divided by ${divisor}.`,
        `Calculate ${dividend} ÷ ${divisor}.`,
        `What is ${dividend} shared equally into ${divisor} groups?`,
      ];
      const closers = ["", "Find the answer.", "What is the quotient?", "Work out the quotient."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Quotient =",
        after: "",
        correctAnswer: String(quotient),
        inputMode: "numeric",
        hint: "Use the long-division or short-division method: how many times does the divisor fit into the dividend?",
        explanation: `${dividend} ÷ ${divisor} = ${quotient}, since ${divisor} × ${quotient} = ${dividend}.`,
      };
    }

    if (branch === "real-world") {
      const ctx = randChoice(rng, SHARING_CONTEXTS);
      const groups = randInt(rng, 2, 90);
      const each = randInt(rng, 2, Math.floor(999 / groups));
      const total = groups * each;
      const openers = [
        `A total of ${fmt(total)} ${ctx.totalLabel} is shared equally among ${groups} ${ctx.groupLabel}.`,
        `There are ${fmt(total)} ${ctx.totalLabel}, shared out equally into ${groups} ${ctx.groupLabel}.`,
        `${fmt(total)} ${ctx.totalLabel} must be divided equally among ${groups} ${ctx.groupLabel}.`,
        `A total of ${fmt(total)} ${ctx.totalLabel} is split evenly between ${groups} ${ctx.groupLabel}.`,
      ];
      const closers = [
        " How many does each group get?",
        " How many go to each one?",
        " Find the amount each group receives.",
        " What is the equal share for each group?",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Each group gets:",
        after: "",
        correctAnswer: String(each),
        inputMode: "numeric",
        hint: "Divide the total by the number of equal groups.",
        explanation: `${fmt(total)} ÷ ${groups} = ${each}.`,
      };
    }

    if (branch === "inverse-relationship") {
      const a = randInt(rng, 3, 90);
      const b = randInt(rng, 3, Math.floor(999 / a));
      const product = a * b;
      const prompts = [
        `Given that ${a} × ${b} = ${product}, what is ${product} ÷ ${a}?`,
        `Since ${a} × ${b} = ${product}, find ${product} ÷ ${a} without dividing from scratch.`,
        `Use the fact ${a} × ${b} = ${product} to work out ${product} ÷ ${a}.`,
        `Knowing ${a} × ${b} = ${product}, what must ${product} ÷ ${a} equal?`,
        `Because ${a} × ${b} = ${product}, find the value of ${product} ÷ ${a}.`,
        `${a} × ${b} = ${product}. Use this to find ${product} ÷ ${a}.`,
        `Multiplication fact: ${a} × ${b} = ${product}. What is ${product} ÷ ${a}?`,
        `You already know ${a} × ${b} = ${product}. What is ${product} ÷ ${a}?`,
        `From ${a} × ${b} = ${product}, work out ${product} ÷ ${a} directly.`,
        `Division undoes multiplication: given ${a} × ${b} = ${product}, find ${product} ÷ ${a}.`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, prompts),
        before: `${product} ÷ ${a} =`,
        after: "",
        correctAnswer: String(b),
        inputMode: "numeric",
        hint: "Division is the opposite of multiplication — since a × b = product, product ÷ a always equals b.",
        explanation: `${a} × ${b} = ${product}, so ${product} ÷ ${a} = ${b} — division undoes multiplication.`,
      };
    }

    if (branch === "divide-by-1000") {
      const dividend = randInt(rng, 100, 999);
      const answer = dividend / 1000;
      const openers = [
        `Work out ${dividend} ÷ 1000.`,
        `Divide ${dividend} by 1000.`,
        `Find ${dividend} ÷ 1000.`,
        `Calculate ${dividend} divided by 1000.`,
        `What is ${dividend} ÷ 1000?`,
      ];
      const closers = ["", "Give your answer as a decimal.", "Write the answer as a decimal.", "Find the decimal answer."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Answer =",
        after: "",
        correctAnswer: fmtDec(answer, 3),
        inputMode: "numeric",
        hint: "Dividing by 1000 shifts the decimal point three places to the left.",
        explanation: `${dividend} ÷ 1000 = ${fmtDec(answer, 3)} — the decimal point moves three places left.`,
      };
    }

    if (branch === "quotient-mc") {
      const divisor = randInt(rng, 2, 90);
      const quotient = randInt(rng, 2, Math.floor(999 / divisor));
      const dividend = divisor * quotient;
      // Misconceptions: multiplying instead of dividing, and swapping dividend/divisor.
      const wrongMultiply = dividend * divisor;
      const wrongSwap = divisor > quotient ? Math.round(divisor / dividend) || 1 : Math.round(divisor / quotient) || 1;
      const candidates = [...new Set([wrongMultiply, wrongSwap])].filter((v) => v !== quotient && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(quotient), candidates.map(String), Math.min(2, candidates.length));
      const openers = [
        `${dividend} is divided by ${divisor}.`,
        `Find the result of dividing ${dividend} by ${divisor}.`,
        `${dividend} ÷ ${divisor} is being calculated.`,
        `Work out the quotient when ${dividend} is divided by ${divisor}.`,
      ];
      const closers = [" What is the answer?", " Which quotient is correct?", " Find the correct result.", " What is the correct quotient?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Divide, don't multiply — and keep the dividend and divisor in the right order.",
        explanation: `${dividend} ÷ ${divisor} = ${quotient}. Multiplying instead of dividing, or swapping the two numbers, gives the wrong distractors.`,
      };
    }

    if (branch === "ordering") {
      const pairs = pickDistinctPairs(rng, 4);
      const items = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.dividend} ÷ ${p.divisor}` }));
      const sortedIdx = pairs.map((_, i) => i).sort((a, b) => pairs[a].quotient - pairs[b].quotient);
      const prompts = [
        "Work out each quotient, then order them from smallest to largest.",
        "Order these quotients from smallest to largest.",
        "Arrange these divisions by quotient, smallest first.",
        "Put these divisions in order of their quotient.",
        "Rank these divisions by quotient, smallest to largest.",
        "Sequence these divisions by their result.",
        "Order these quotients, starting with the smallest.",
        "Arrange these calculations from smallest quotient to largest.",
        "Sort these divisions by result, smallest first.",
        "Put these expressions in increasing order of quotient.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest quotient first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `p${i}`),
        hint: "Work out each quotient before comparing.",
        explanation: sortedIdx.map((i) => `${pairs[i].dividend} ÷ ${pairs[i].divisor} = ${pairs[i].quotient}`).join(", ") + ".",
      };
    }

    if (branch === "click-match") {
      const pairs = pickDistinctPairs(rng, 4);
      const tokens = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.dividend} ÷ ${p.divisor}` }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: String(p.quotient) })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      const prompts = [
        "Match each division to its quotient.",
        "Pair each expression with its correct quotient.",
        "Match each calculation to its answer.",
        "Connect each division to its result.",
        "Match each division sum to its quotient.",
        "Pair each division with the correct answer.",
        "Match each expression to its quotient.",
        "Link each division sum to its result.",
        "Match every division to its correct quotient.",
        "Connect each calculation with its answer.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Work out each quotient before matching.",
        explanation: pairs.map((p) => `${p.dividend} ÷ ${p.divisor} = ${p.quotient}`).join("; ") + ".",
      };
    }

    // categorize: sort divisions by whether the quotient is even or odd.
    const pairs = pickDistinctPairs(rng, 6);
    const items = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.dividend} ÷ ${p.divisor}` }));
    const buckets = [
      { id: "even", label: "Quotient is even" },
      { id: "odd", label: "Quotient is odd" },
    ];
    const correctBucket: Record<string, string> = {};
    pairs.forEach((p, i) => (correctBucket[`p${i}`] = p.quotient % 2 === 0 ? "even" : "odd"));
    const catPrompts = [
      "Sort each division by whether its quotient is even or odd.",
      "Group each expression by whether the answer is even or odd.",
      "Classify each division: even quotient, or odd quotient.",
      "Sort these divisions into 'even quotient' and 'odd quotient'.",
      "Work out each quotient, then sort it as even or odd.",
      "Check each quotient's parity and sort it.",
      "Sort each calculation by whether the result is even or odd.",
      "Group these divisions by the parity of their quotient.",
      "Classify each problem by whether its answer is even or odd.",
      "Sort each division based on whether the quotient is even.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Work out each quotient first, then check its last digit for even/odd.",
      explanation: pairs.map((p) => `${p.dividend} ÷ ${p.divisor} = ${p.quotient} (${p.quotient % 2 === 0 ? "even" : "odd"})`).join("; ") + ".",
    };
  },
};

function pickDistinctPairs(rng: RNG, count: number): { dividend: number; divisor: number; quotient: number }[] {
  const seen = new Set<string>();
  const result: { dividend: number; divisor: number; quotient: number }[] = [];
  while (result.length < count) {
    const divisor = randInt(rng, 3, 30);
    const quotient = randInt(rng, 3, Math.floor(999 / divisor));
    const dividend = divisor * quotient;
    const key = `${dividend}/${divisor}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ dividend, divisor, quotient });
    }
  }
  return result;
}
