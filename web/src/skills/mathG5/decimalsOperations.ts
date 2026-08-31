import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmtDec } from "./mathUtils";
import { MEASUREMENT_DECIMAL_CONTEXTS, fillPlace } from "./contexts";
import type { Skill } from "@/lib/types";

function randDecimal(rng: RNG, maxWhole: number, places: number): number {
  const whole = randInt(rng, 0, maxWhole);
  const frac = randInt(rng, 0, 10 ** places - 1);
  return Number(`${whole}.${String(frac).padStart(places, "0")}`);
}

export const decimalsOperations: Skill = {
  id: "g5-math-n-decimals-operations",
  code: "N.16",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Adding, subtracting and multiplying decimals",
  description: "Add and subtract decimals up to thousandths, and multiply a decimal up to thousandths by 1000, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add", "subtract", "multiply-1000", "real-world-add", "real-world-subtract", "click-match", "sum-mc", "order-sums"] as const);

    if (branch === "add") {
      const places = randInt(rng, 1, 3);
      const a = randDecimal(rng, 80, places);
      const b = randDecimal(rng, 80, places);
      const sum = Number((a + b).toFixed(3));
      const openers = [
        `Add ${fmtDec(a, 3)} and ${fmtDec(b, 3)}.`,
        `Work out ${fmtDec(a, 3)} + ${fmtDec(b, 3)}.`,
        `Find the sum of ${fmtDec(a, 3)} and ${fmtDec(b, 3)}.`,
        `Calculate ${fmtDec(a, 3)} + ${fmtDec(b, 3)}.`,
        `What is ${fmtDec(a, 3)} plus ${fmtDec(b, 3)}?`,
      ];
      const closers = ["", "Find the total.", "What is the answer?", "Work out the sum."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Sum =",
        after: "",
        correctAnswer: fmtDec(sum, 3),
        inputMode: "numeric",
        hint: "Line up the decimal points, then add each column just like with whole numbers.",
        explanation: `${fmtDec(a, 3)} + ${fmtDec(b, 3)} = ${fmtDec(sum, 3)}.`,
      };
    }

    if (branch === "subtract") {
      const places = randInt(rng, 1, 3);
      const a = randDecimal(rng, 80, places) + randInt(rng, 1, 50);
      const b = randDecimal(rng, 40, places);
      if (a <= b) return this.generate(rng);
      const diff = Number((a - b).toFixed(3));
      const openers = [
        `Subtract ${fmtDec(b, 3)} from ${fmtDec(a, 3)}.`,
        `Work out ${fmtDec(a, 3)} − ${fmtDec(b, 3)}.`,
        `Find the difference between ${fmtDec(a, 3)} and ${fmtDec(b, 3)}.`,
        `Calculate ${fmtDec(a, 3)} − ${fmtDec(b, 3)}.`,
        `What is ${fmtDec(a, 3)} minus ${fmtDec(b, 3)}?`,
      ];
      const closers = ["", "Find the difference.", "What is the answer?", "Work out the difference."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Difference =",
        after: "",
        correctAnswer: fmtDec(diff, 3),
        inputMode: "numeric",
        hint: "Line up the decimal points, then subtract each column, borrowing where needed.",
        explanation: `${fmtDec(a, 3)} − ${fmtDec(b, 3)} = ${fmtDec(diff, 3)}.`,
      };
    }

    if (branch === "multiply-1000") {
      const places = randInt(rng, 1, 3);
      const a = randDecimal(rng, 9, places);
      const product = Number((a * 1000).toFixed(3));
      const openers = [
        `Multiply ${fmtDec(a, 3)} by 1000.`,
        `Work out ${fmtDec(a, 3)} × 1000.`,
        `Find ${fmtDec(a, 3)} × 1000.`,
        `Calculate ${fmtDec(a, 3)} multiplied by 1000.`,
        `What is ${fmtDec(a, 3)} × 1000?`,
      ];
      const closers = ["", "Find the answer.", "What is the product?", "Work out the product."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Product =",
        after: "",
        correctAnswer: fmtDec(product, 3),
        inputMode: "numeric",
        hint: "Multiplying by 1000 shifts the decimal point three places to the right.",
        explanation: `${fmtDec(a, 3)} × 1000 = ${fmtDec(product, 3)} — the decimal point moves three places right.`,
      };
    }

    if (branch === "real-world-add") {
      const ctx = randChoice(rng, MEASUREMENT_DECIMAL_CONTEXTS);
      const subj = fillPlace(ctx.subject, rng);
      const a = randDecimal(rng, 40, randInt(rng, 1, 2));
      const b = randDecimal(rng, 40, randInt(rng, 1, 2));
      const sum = Number((a + b).toFixed(3));
      const openers = [
        `On Monday, ${subj} was ${fmtDec(a, 3)} ${ctx.unit}. On Tuesday, a similar reading was ${fmtDec(b, 3)} ${ctx.unit}.`,
        `${subj[0].toUpperCase()}${subj.slice(1)} measured ${fmtDec(a, 3)} ${ctx.unit} on one day, and ${fmtDec(b, 3)} ${ctx.unit} the next.`,
        `Two readings were taken for ${subj}: ${fmtDec(a, 3)} ${ctx.unit} and ${fmtDec(b, 3)} ${ctx.unit}.`,
      ];
      const closers = [" What is the combined total?", " Find the total for both readings.", " What do the two readings add up to?", " Find the combined amount."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: `Total =`,
        after: ctx.unit,
        correctAnswer: fmtDec(sum, 3),
        inputMode: "numeric",
        hint: "Line up the decimal points, then add.",
        explanation: `${fmtDec(a, 3)} + ${fmtDec(b, 3)} = ${fmtDec(sum, 3)} ${ctx.unit}.`,
      };
    }

    if (branch === "real-world-subtract") {
      const ctx = randChoice(rng, MEASUREMENT_DECIMAL_CONTEXTS);
      const subj = fillPlace(ctx.subject, rng);
      const a = randDecimal(rng, 40, randInt(rng, 1, 2)) + randInt(rng, 5, 20);
      const b = randDecimal(rng, 15, randInt(rng, 1, 2));
      if (a <= b) return this.generate(rng);
      const diff = Number((a - b).toFixed(3));
      const openers = [
        `${subj[0].toUpperCase()}${subj.slice(1)} was measured at ${fmtDec(a, 3)} ${ctx.unit}, then a change of ${fmtDec(b, 3)} ${ctx.unit} was recorded.`,
        `A reading of ${fmtDec(a, 3)} ${ctx.unit} was taken for ${subj}, before ${fmtDec(b, 3)} ${ctx.unit} was later subtracted from it.`,
        `${subj[0].toUpperCase()}${subj.slice(1)} started at ${fmtDec(a, 3)} ${ctx.unit}, and decreased by ${fmtDec(b, 3)} ${ctx.unit}.`,
      ];
      const closers = [" What is the new value?", " Find the resulting value.", " What value remains?", " Find the value after the change."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: `New value =`,
        after: ctx.unit,
        correctAnswer: fmtDec(diff, 3),
        inputMode: "numeric",
        hint: "Line up the decimal points, then subtract.",
        explanation: `${fmtDec(a, 3)} − ${fmtDec(b, 3)} = ${fmtDec(diff, 3)} ${ctx.unit}.`,
      };
    }

    if (branch === "sum-mc") {
      const places = randInt(rng, 1, 2);
      const a = randDecimal(rng, 30, places);
      const b = randDecimal(rng, 30, places);
      const correctSum = Number((a + b).toFixed(3));
      // Misconception: adding digit-by-digit without lining up the decimal point (treating both numbers
      // as if they had the same number of decimal places, i.e. adding the raw digit strings).
      const wrongMisaligned = Number((a * 10 + b).toFixed(3));
      const wrongSubtract = Number(Math.abs(a - b).toFixed(3));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmtDec(correctSum, 3), [fmtDec(wrongMisaligned, 3), fmtDec(wrongSubtract, 3)], 2);
      const openers = [
        `Add ${fmtDec(a, 3)} and ${fmtDec(b, 3)}.`,
        `Work out ${fmtDec(a, 3)} + ${fmtDec(b, 3)}.`,
        `Find the sum of ${fmtDec(a, 3)} and ${fmtDec(b, 3)}.`,
        `What is ${fmtDec(a, 3)} plus ${fmtDec(b, 3)}?`,
      ];
      const closers = ["", "Which answer is correct?", "Choose the correct sum.", "Pick the correct answer."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers).trim(),
        choices,
        correctIndex,
        layout: "row",
        hint: "Line up the decimal points before adding — don't just add the digits as if both numbers had the same number of decimal places.",
        explanation: `${fmtDec(a, 3)} + ${fmtDec(b, 3)} = ${fmtDec(correctSum, 3)}. Adding without lining up the decimal points, or subtracting instead, gives the wrong distractors.`,
      };
    }

    if (branch === "order-sums") {
      const items = Array.from({ length: 4 }, (_, i) => {
        const places = randInt(rng, 1, 2);
        const a = randDecimal(rng, 40, places);
        const b = randDecimal(rng, 40, places);
        const sum = Number((a + b).toFixed(3));
        return { id: `s${i}`, label: `${fmtDec(a, 3)} + ${fmtDec(b, 3)}`, value: sum };
      });
      const sortedIdx = items.map((_, i) => i).sort((a, b) => items[a].value - items[b].value);
      const prompts = [
        "Work out each sum, then order them from smallest to largest.",
        "Order these decimal sums from smallest to largest.",
        "Arrange these addition results, starting with the smallest.",
        "Put these decimal sums in order from smallest to largest.",
        "Rank these sums from smallest to largest.",
        "Sort these decimal additions into order, smallest first.",
        "Sequence these sums from smallest to largest.",
        "Which sum is smallest? Order them all from there.",
        "Arrange these decimal sums from smallest to largest value.",
        "Work out and order these sums, smallest first.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest sum first.",
        items: shuffle(rng, items.map((it) => ({ id: it.id, label: it.label }))),
        correctOrder: sortedIdx.map((i) => items[i].id),
        hint: "Work out each sum before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${items[i].label} = ${fmtDec(items[i].value, 3)}`).join(", ")}.`,
      };
    }

    // click-match: match each decimal-times-1000 expression to its product.
    const problems = Array.from({ length: 4 }, () => {
      const places = randInt(rng, 1, 3);
      const a = randDecimal(rng, 9, places);
      return { label: `${fmtDec(a, 3)} × 1000`, answer: fmtDec(Number((a * 1000).toFixed(3)), 3) };
    });
    const tokens = problems.map((p, i) => ({ id: `p${i}`, label: p.label }));
    const targets = shuffle(rng, problems.map((p, i) => ({ id: `p${i}`, label: p.answer })));
    const correctMap: Record<string, string> = {};
    problems.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
    const prompts = [
      "Match each decimal multiplication to its product.",
      "Pair each expression with its correct product.",
      "Match each calculation to its answer.",
      "Connect each multiplication to its result.",
      "Match each decimal × 1000 to its product.",
      "Pair each multiplication with the correct answer.",
      "Match each expression to its product.",
      "Link each multiplication sum to its result.",
      "Match every multiplication to its correct product.",
      "Connect each calculation with its answer.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens: shuffle(rng, tokens),
      targets,
      correctMap,
      hint: "Multiplying by 1000 shifts the decimal point three places to the right.",
      explanation: problems.map((p) => `${p.label} = ${p.answer}`).join("; ") + ".",
    };
  },
};
