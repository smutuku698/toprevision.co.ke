import { randChoice, randInt, shuffle } from "@/lib/rng";
import { formatFraction, lcm } from "./mathUtils";
import { FRACTION_SCENARIO_CONTEXTS } from "./contexts";
import type { Skill } from "@/lib/types";

const DENOMS = [3, 4, 5, 6, 7, 8, 9, 10, 12] as const;

export const addingSubtractingFractions: Skill = {
  id: "g6-math-n-adding-subtracting-fractions",
  code: "N.10",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Adding and subtracting fractions",
  description: "Add and subtract fractions and mixed numbers using the LCM of their denominators, in real-life situations.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["add-sub-fraction", "add-sub-fraction-classical", "add-sub-mixed", "reverse-missing", "classify-mixed", "match-terms", "order-mixed"] as const
    );

    if (branch === "add-sub-fraction") {
      const d1 = randChoice(rng, DENOMS);
      let d2 = randChoice(rng, DENOMS);
      while (d2 === d1) d2 = randChoice(rng, DENOMS);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const commonD = lcm(d1, d2);
      const ctx = randChoice(rng, FRACTION_SCENARIO_CONTEXTS);
      const scaled1 = n1 * (commonD / d1);
      const scaled2 = n2 * (commonD / d2);
      const isAdd = scaled1 <= scaled2 ? true : rng() < 0.5;
      const capSubject = ctx.subject.charAt(0).toUpperCase() + ctx.subject.slice(1);
      if (isAdd) {
        const answer = formatFraction(scaled1 + scaled2, commonD);
        return {
          kind: "fill-blank",
          prompt: `${capSubject} ${ctx.act1} $\\frac{${n1}}{${d1}}$ of ${ctx.item}, and ${ctx.act2} $\\frac{${n2}}{${d2}}$ of it. Find the total fraction of ${ctx.item} used.`,
          before: "",
          after: "",
          correctAnswer: answer,
          inputMode: "text",
          hint: `Find the LCM of ${d1} and ${d2} (which is ${commonD}), convert both fractions, then add.`,
          explanation: `LCM of ${d1} and ${d2} is ${commonD}. Converting: $\\frac{${n1}}{${d1}} = \\frac{${scaled1}}{${commonD}}$ and $\\frac{${n2}}{${d2}} = \\frac{${scaled2}}{${commonD}}$. Adding gives $${answer}$.`,
        };
      }
      // scaled1 is guaranteed > scaled2 here, so the first activity used strictly more.
      const answer = formatFraction(scaled1 - scaled2, commonD);
      return {
        kind: "fill-blank",
        prompt: `${capSubject} ${ctx.act1} $\\frac{${n1}}{${d1}}$ of ${ctx.item}, and ${ctx.act2} $\\frac{${n2}}{${d2}}$ of it. Find how much more fraction was used in the first activity than the second.`,
        before: "",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: `Find the LCM of ${d1} and ${d2} (which is ${commonD}), convert both fractions, then subtract.`,
        explanation: `LCM of ${d1} and ${d2} is ${commonD}. Converting: $\\frac{${n1}}{${d1}} = \\frac{${scaled1}}{${commonD}}$ and $\\frac{${n2}}{${d2}} = \\frac{${scaled2}}{${commonD}}$. Subtracting gives $${answer}$.`,
      };
    }

    if (branch === "add-sub-fraction-classical") {
      const d1 = randChoice(rng, DENOMS);
      let d2 = randChoice(rng, DENOMS);
      while (d2 === d1) d2 = randChoice(rng, DENOMS);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const isAdd = rng() < 0.6;
      const commonD = lcm(d1, d2);
      const num = isAdd ? n1 * (commonD / d1) + n2 * (commonD / d2) : n1 * (commonD / d1) - n2 * (commonD / d2);
      if (!isAdd && num <= 0) {
        const answer = formatFraction(n2 * (commonD / d2) - n1 * (commonD / d1), commonD);
        return {
          kind: "fill-blank",
          prompt: `Work out $\\frac{${n2}}{${d2}} - \\frac{${n1}}{${d1}}$.`,
          before: "",
          after: "",
          correctAnswer: answer,
          inputMode: "text",
          hint: `Find the LCM of ${d1} and ${d2}, which is ${commonD}.`,
          explanation: `$\\frac{${n2}}{${d2}} - \\frac{${n1}}{${d1}} = \\frac{${n2 * (commonD / d2)}}{${commonD}} - \\frac{${n1 * (commonD / d1)}}{${commonD}} = ${answer}$.`,
        };
      }
      const answer = formatFraction(num, commonD);
      return {
        kind: "fill-blank",
        prompt: `Work out $\\frac{${n1}}{${d1}} ${isAdd ? "+" : "-"} \\frac{${n2}}{${d2}}$.`,
        before: "",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: `Find the LCM of ${d1} and ${d2}, which is ${commonD}.`,
        explanation: `$\\frac{${n1}}{${d1}} ${isAdd ? "+" : "-"} \\frac{${n2}}{${d2}} = \\frac{${n1 * (commonD / d1)}}{${commonD}} ${isAdd ? "+" : "-"} \\frac{${n2 * (commonD / d2)}}{${commonD}} = ${answer}$.`,
      };
    }

    if (branch === "add-sub-mixed") {
      const w1 = randInt(rng, 2, 12);
      const w2 = randInt(rng, 1, 9);
      const d = randChoice(rng, DENOMS);
      const n1 = randInt(rng, 1, d - 1);
      const n2 = randInt(rng, 1, d - 1);
      const isAdd = rng() < 0.55;
      let wholePart = isAdd ? w1 + w2 : w1 - w2;
      let numPart = isAdd ? n1 + n2 : n1 - n2;
      if (isAdd && numPart >= d) {
        numPart -= d;
        wholePart += 1;
      }
      if (!isAdd && numPart < 0) {
        numPart += d;
        wholePart -= 1;
      }
      const fracPart = numPart === 0 ? "" : formatFraction(numPart, d);
      const answer = fracPart ? `${wholePart} ${fracPart}` : String(wholePart);
      return {
        kind: "fill-blank",
        prompt: `Work out $${w1}\\frac{${n1}}{${d}} ${isAdd ? "+" : "-"} ${w2}\\frac{${n2}}{${d}}$. Give your answer as a mixed number (e.g. "3 1/2") or whole number.`,
        before: "",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: `${isAdd ? "Add" : "Subtract"} the whole-number parts and the fraction parts separately, then simplify.`,
        explanation: `Whole parts: $${w1} ${isAdd ? "+" : "-"} ${w2} = ${isAdd ? w1 + w2 : w1 - w2}$. Fraction parts: $\\frac{${n1}}{${d}} ${isAdd ? "+" : "-"} \\frac{${n2}}{${d}} = \\frac{${isAdd ? n1 + n2 : n1 - n2}}{${d}}$. Combined and simplified: $${answer}$.`,
      };
    }

    if (branch === "reverse-missing") {
      const d = randChoice(rng, DENOMS);
      const known = randInt(rng, 1, d - 2);
      const total = randInt(rng, known + 1, d - 1);
      const missing = total - known;
      const wrong = [String(missing + 1), String(missing - 1 < 1 ? missing + 2 : missing - 1), String(d - missing)].map((n) => `${n}/${d}`);
      const correctText = `${missing}/${d}`;
      const choicesSet = new Set<string>([correctText, ...wrong]);
      const choices = shuffle(rng, [...choicesSet]);
      return {
        kind: "multiple-choice",
        prompt: `$\\frac{${known}}{${d}} + x = \\frac{${total}}{${d}}$. Find the missing fraction x.`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "row",
        hint: "Subtract the known fraction from the total to find x.",
        explanation: `$x = \\frac{${total}}{${d}} - \\frac{${known}}{${d}} = \\frac{${missing}}{${d}}$.`,
      };
    }

    if (branch === "classify-mixed") {
      const items = Array.from({ length: 5 }, () => {
        const isMixed = rng() < 0.5;
        const d = randInt(rng, 4, 12);
        if (isMixed) {
          const w = randInt(rng, 1, 8);
          const n = randInt(rng, 1, d - 1);
          return { label: `${w} ${n}/${d}`, isMixed: true };
        }
        const n = randInt(rng, 1, d - 1);
        return { label: `${n}/${d}`, isMixed: false };
      });
      const dedup = items.filter((it, i) => items.findIndex((o) => o.label === it.label) === i);
      const finalItems = dedup.map((it, i) => ({ id: `x${i}`, label: it.label }));
      const buckets = [
        { id: "mixed", label: "Mixed number (whole number + fraction)" },
        { id: "fraction", label: "Fraction only (no whole-number part)" },
      ];
      const correctBucket: Record<string, string> = {};
      dedup.forEach((it, i) => (correctBucket[`x${i}`] = it.isMixed ? "mixed" : "fraction"));
      return {
        kind: "categorize",
        prompt: "Sort each number by whether it is a mixed number or a fraction only.",
        items: finalItems,
        buckets,
        correctBucket,
        hint: "A mixed number has a whole-number part written before the fraction.",
        explanation: dedup.map((it) => `${it.label} is ${it.isMixed ? "a mixed number" : "a fraction only"}`).join("; ") + ".",
      };
    }

    if (branch === "match-terms") {
      const pairs = [
        { term: "LCM", meaning: "Lowest common multiple — the smallest number both denominators divide into" },
        { term: "Mixed number", meaning: "A whole number combined with a proper fraction" },
        { term: "Improper fraction", meaning: "A fraction where the numerator is greater than or equal to the denominator" },
        { term: "Like fractions", meaning: "Fractions that already share the same denominator" },
      ] as const;
      const tokens = pairs.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each fraction-addition term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what you need before adding fractions with different denominators.",
        explanation: pairs.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // order-mixed: order mixed numbers/fractions sharing a common denominator
    const d = randChoice(rng, DENOMS);
    const count = 5;
    const wholeSet = new Set<number>();
    while (wholeSet.size < count) wholeSet.add(randInt(rng, 1, 9));
    const wholes = [...wholeSet];
    const fracs = wholes.map((w) => ({ w, n: randInt(rng, 1, d - 1) }));
    const ascending = rng() < 0.5;
    const withLabel = fracs.map((f) => ({ id: `${f.w}-${f.n}`, label: `${f.w} ${f.n}/${d}`, value: f.w + f.n / d }));
    const sorted = [...withLabel].sort((a, b) => (ascending ? a.value - b.value : b.value - a.value));
    return {
      kind: "ordering",
      prompt: `Arrange these mixed numbers in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order.`,
      instruction: "Drag to arrange in order.",
      items: shuffle(rng, withLabel.map((w) => ({ id: w.id, label: w.label }))),
      correctOrder: sorted.map((w) => w.id),
      hint: "Compare the whole-number parts first; if they're equal, compare the fraction parts.",
      explanation: `In ${ascending ? "ascending" : "descending"} order: ${sorted.map((w) => w.label).join(", ")}.`,
    };
  },
};
