import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, formatFraction, simplifyFraction } from "./mathUtils";
import { FRACTION_SCENARIO_CONTEXTS } from "./contexts";
import type { Skill } from "@/lib/types";

/** Two fractions sharing denominator d, with a first numerator strictly greater than the second (for subtraction). */
function genSameDenom(rng: RNG): { n1: number; n2: number; d: number } {
  const d = randInt(rng, 4, 12);
  const n1 = randInt(rng, 2, d - 1);
  const n2 = randInt(rng, 1, n1 - 1);
  return { n1, n2, d };
}

/** A fraction n1/d1 and a second fraction n2/d2 where d2 is a simple multiple of d1 (one renaming only). */
function genOneRenaming(rng: RNG): { n1: number; d1: number; n2: number; d2: number } {
  const d1 = randInt(rng, 2, 6);
  const factor = randInt(rng, 2, Math.floor(12 / d1));
  const d2 = d1 * factor;
  const n1 = randInt(rng, 1, d1 - 1);
  const n2 = randInt(rng, 1, d2 - 1);
  return { n1, d1, n2, d2 };
}

export const addingSubtractingFractions: Skill = {
  id: "g5-math-n-fractions-add-subtract",
  code: "N.14",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Adding and subtracting fractions",
  description: "Add and subtract two fractions with the same denominator, and with one renaming, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add-same-denom", "subtract-same-denom", "add-renaming", "subtract-renaming", "real-world", "click-match", "sum-mc", "order-sums"] as const);

    if (branch === "add-same-denom") {
      const d = randInt(rng, 4, 12);
      const n1 = randInt(rng, 1, d - 1);
      const n2 = randInt(rng, 1, d - n1);
      const [rn, rd] = simplifyFraction(n1 + n2, d);
      const openers = [
        `Add ${n1}/${d} and ${n2}/${d}.`,
        `Work out ${n1}/${d} + ${n2}/${d}.`,
        `Find the sum of ${n1}/${d} and ${n2}/${d}.`,
        `Calculate ${n1}/${d} + ${n2}/${d}.`,
        `What is ${n1}/${d} plus ${n2}/${d}?`,
      ];
      const closers = ["", "Give your answer in simplest form.", "Simplify your answer.", "Write the answer in lowest terms."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Sum =",
        after: "",
        correctAnswer: formatFraction(n1 + n2, d),
        acceptedAnswers: [`${n1 + n2}/${d}`, formatFraction(n1 + n2, d)],
        inputMode: "text",
        hint: "With the same denominator, just add the numerators and keep the denominator the same.",
        explanation: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}${rd !== d ? ` = ${rn}/${rd}` : ""}.`,
      };
    }

    if (branch === "subtract-same-denom") {
      const { n1, n2, d } = genSameDenom(rng);
      const [rn, rd] = simplifyFraction(n1 - n2, d);
      const openers = [
        `Subtract ${n2}/${d} from ${n1}/${d}.`,
        `Work out ${n1}/${d} − ${n2}/${d}.`,
        `Find the difference between ${n1}/${d} and ${n2}/${d}.`,
        `Calculate ${n1}/${d} − ${n2}/${d}.`,
        `What is ${n1}/${d} minus ${n2}/${d}?`,
      ];
      const closers = ["", "Give your answer in simplest form.", "Simplify your answer.", "Write the answer in lowest terms."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Difference =",
        after: "",
        correctAnswer: formatFraction(n1 - n2, d),
        acceptedAnswers: [`${n1 - n2}/${d}`, formatFraction(n1 - n2, d)],
        inputMode: "text",
        hint: "With the same denominator, just subtract the numerators and keep the denominator the same.",
        explanation: `${n1}/${d} − ${n2}/${d} = ${n1 - n2}/${d}${rd !== d ? ` = ${rn}/${rd}` : ""}.`,
      };
    }

    if (branch === "add-renaming") {
      const { n1, d1, n2, d2 } = genOneRenaming(rng);
      const factor = d2 / d1;
      const renamedN1 = n1 * factor;
      const sumN = renamedN1 + n2;
      const [rn, rd] = simplifyFraction(sumN, d2);
      const openers = [
        `Add ${n1}/${d1} and ${n2}/${d2}.`,
        `Work out ${n1}/${d1} + ${n2}/${d2}.`,
        `Find the sum of ${n1}/${d1} and ${n2}/${d2}.`,
        `Calculate ${n1}/${d1} + ${n2}/${d2}.`,
        `What is ${n1}/${d1} plus ${n2}/${d2}?`,
      ];
      const closers = ["", "Give your answer in simplest form.", "Rename one fraction first.", "Simplify your final answer."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Sum =",
        after: "",
        correctAnswer: formatFraction(sumN, d2),
        acceptedAnswers: [`${sumN}/${d2}`, formatFraction(sumN, d2)],
        inputMode: "text",
        hint: `Rename ${n1}/${d1} to have denominator ${d2} (multiply top and bottom by ${factor}), then add.`,
        explanation: `${n1}/${d1} = ${renamedN1}/${d2}. ${renamedN1}/${d2} + ${n2}/${d2} = ${sumN}/${d2}${rd !== d2 ? ` = ${rn}/${rd}` : ""}.`,
      };
    }

    if (branch === "subtract-renaming") {
      const { n1, d1, n2, d2 } = genOneRenaming(rng);
      const factor = d2 / d1;
      const renamedN1 = n1 * factor;
      if (renamedN1 === n2) return this.generate(rng);
      const larger = renamedN1 > n2 ? { rn: renamedN1, on: n2, label1: `${n1}/${d1}`, label2: `${n2}/${d2}` } : { rn: n2, on: renamedN1, label1: `${n2}/${d2}`, label2: `${n1}/${d1}` };
      const diffN = larger.rn - larger.on;
      const [sn, sd] = simplifyFraction(diffN, d2);
      const openers = [
        `Subtract ${larger.label2} from ${larger.label1}.`,
        `Work out ${larger.label1} − ${larger.label2}.`,
        `Find the difference between ${larger.label1} and ${larger.label2}.`,
        `Calculate ${larger.label1} − ${larger.label2}.`,
        `What is ${larger.label1} minus ${larger.label2}?`,
      ];
      const closers = ["", "Give your answer in simplest form.", "Rename one fraction first.", "Simplify your final answer."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Difference =",
        after: "",
        correctAnswer: formatFraction(diffN, d2),
        acceptedAnswers: [`${diffN}/${d2}`, formatFraction(diffN, d2)],
        inputMode: "text",
        hint: "Rename the fraction with the smaller denominator so both fractions share the same denominator, then subtract.",
        explanation: `Renaming to a common denominator of ${d2}: ${n1}/${d1} = ${renamedN1}/${d2}. ${larger.rn}/${d2} − ${larger.on}/${d2} = ${diffN}/${d2}${sd !== d2 ? ` = ${sn}/${sd}` : ""}.`,
      };
    }

    if (branch === "real-world") {
      const ctx = randChoice(rng, FRACTION_SCENARIO_CONTEXTS);
      const d = randInt(rng, 4, 12);
      const n1 = randInt(rng, 1, d - 2);
      const n2 = randInt(rng, 1, d - n1 - 1);
      const [rn, rd] = simplifyFraction(n1 + n2, d);
      const openers = [
        `${ctx.subject[0].toUpperCase()}${ctx.subject.slice(1)} has ${ctx.item}. They ${ctx.act1} ${n1}/${d} of it, then ${ctx.act2} ${n2}/${d} of it.`,
        `Working with ${ctx.item}, ${ctx.subject} ${ctx.act1} ${n1}/${d} first, then ${ctx.act2} ${n2}/${d}.`,
        `${ctx.subject[0].toUpperCase()}${ctx.subject.slice(1)}'s ${ctx.item}: ${n1}/${d} was ${ctx.act1.replace(/^./, (c) => c.toLowerCase())}, and ${n2}/${d} was ${ctx.act2.replace(/^./, (c) => c.toLowerCase())}.`,
      ];
      const closers = [
        " In total, what fraction of it was used?",
        " What fraction was used altogether?",
        " Find the total fraction used.",
        " What total fraction does this add up to?",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total fraction used =",
        after: "",
        correctAnswer: formatFraction(n1 + n2, d),
        acceptedAnswers: [`${n1 + n2}/${d}`, formatFraction(n1 + n2, d)],
        inputMode: "text",
        hint: "Add the two fractions — since they share a denominator, just add the numerators.",
        explanation: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}${rd !== d ? ` = ${rn}/${rd}` : ""}.`,
      };
    }

    if (branch === "sum-mc") {
      const { n1, n2, d } = genSameDenom(rng);
      const correctSum = `${n1 + n2}/${d}`;
      // Misconceptions: adding the denominators too (a very common same-denominator mistake), and
      // subtracting instead of adding.
      const wrongAddDenom = `${n1 + n2}/${d + d}`;
      const wrongSubtract = `${Math.abs(n1 - n2)}/${d}`;
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctSum, [wrongAddDenom, wrongSubtract], 2);
      const openers = [
        `Add ${n1}/${d} and ${n2}/${d}.`,
        `Work out ${n1}/${d} + ${n2}/${d}.`,
        `Find the sum of ${n1}/${d} and ${n2}/${d}.`,
        `What is ${n1}/${d} plus ${n2}/${d}?`,
      ];
      const closers = ["", "Which answer is correct?", "Choose the correct sum.", "Pick the correct answer."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers).trim(),
        choices,
        correctIndex,
        layout: "row",
        hint: "With the same denominator, only the numerators are added — the denominator stays the same.",
        explanation: `${n1}/${d} + ${n2}/${d} = ${correctSum}. Adding the denominators too, or subtracting instead of adding, gives the wrong distractors.`,
      };
    }

    if (branch === "order-sums") {
      const items = Array.from({ length: 4 }, (_, i) => {
        const d = randInt(rng, 4, 12);
        const n1 = randInt(rng, 1, d - 1);
        const n2 = randInt(rng, 1, d - n1);
        return { id: `s${i}`, label: `${n1}/${d} + ${n2}/${d}`, value: (n1 + n2) / d };
      });
      const sortedIdx = items.map((_, i) => i).sort((a, b) => items[a].value - items[b].value);
      const prompts = [
        "Work out each sum, then order them from smallest to largest.",
        "Order these fraction sums from smallest to largest.",
        "Arrange these addition results, starting with the smallest.",
        "Put these fraction sums in order from smallest to largest.",
        "Rank these sums from smallest to largest.",
        "Sort these fraction additions into order, smallest first.",
        "Sequence these sums from smallest to largest.",
        "Which sum is smallest? Order them all from there.",
        "Arrange these fraction sums from smallest to largest value.",
        "Work out and order these sums, smallest first.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest sum first.",
        items: shuffle(rng, items.map((it) => ({ id: it.id, label: it.label }))),
        correctOrder: sortedIdx.map((i) => items[i].id),
        hint: "Work out each sum as a decimal before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${items[i].label} ≈ ${items[i].value.toFixed(3)}`).join(", ")}.`,
      };
    }

    // click-match: match each same-denominator addition to its (unsimplified) sum.
    const problems = Array.from({ length: 4 }, () => {
      const d = randInt(rng, 4, 12);
      const n1 = randInt(rng, 1, d - 1);
      const n2 = randInt(rng, 1, d - n1);
      return { label: `${n1}/${d} + ${n2}/${d}`, answer: `${n1 + n2}/${d}` };
    });
    const tokens = problems.map((p, i) => ({ id: `p${i}`, label: p.label }));
    const targets = shuffle(rng, problems.map((p, i) => ({ id: `p${i}`, label: p.answer })));
    const correctMap: Record<string, string> = {};
    problems.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
    const prompts = [
      "Match each addition to its sum.",
      "Pair each fraction addition with its answer.",
      "Match each expression to its correct sum.",
      "Connect each fraction sum to its result.",
      "Match each addition sum to its answer.",
      "Pair each fraction expression with the correct total.",
      "Match each expression to its sum.",
      "Link each fraction addition to its result.",
      "Match every addition to its correct sum.",
      "Connect each fraction calculation with its answer.",
    ];
    return {
      kind: "click-match",
      prompt: randChoice(rng, prompts),
      tokens: shuffle(rng, tokens),
      targets,
      correctMap,
      hint: "Since each pair shares a denominator, just add the numerators.",
      explanation: problems.map((p) => `${p.label} = ${p.answer}`).join("; ") + ".",
    };
  },
};
