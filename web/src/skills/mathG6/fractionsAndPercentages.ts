import { randChoice, randInt, shuffle } from "@/lib/rng";
import { formatFraction, buildChoicesFromStrings } from "./mathUtils";
import { FRACTION_SCENARIO_CONTEXTS } from "./contexts";
import type { Skill } from "@/lib/types";

const NICE_DENOMS = [4, 5, 10, 20, 25, 50] as const;

export const fractionsAndPercentages: Skill = {
  id: "g6-math-n-fractions-percentages",
  code: "N.12",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Fractions and percentages",
  description: "Express a fraction as a percentage and convert a percentage to a fraction, in real-life situations.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["fraction-to-percent", "fraction-to-percent-scenario", "percent-to-fraction", "reverse-percent", "classify-percent", "match-fraction-percent", "order-percent"] as const
    );

    if (branch === "fraction-to-percent") {
      const denom = randChoice(rng, NICE_DENOMS);
      const numer = randInt(rng, 1, denom - 1);
      const percent = (numer * 100) / denom;
      return {
        kind: "fill-blank",
        prompt: `Express $\\frac{${numer}}{${denom}}$ as a percentage.`,
        before: "",
        after: "%",
        correctAnswer: String(percent),
        inputMode: "numeric",
        hint: "Change the fraction to an equivalent fraction with denominator 100, or multiply by 100.",
        explanation: `$\\frac{${numer}}{${denom}} \\times 100 = ${percent}\\%$.`,
      };
    }

    if (branch === "fraction-to-percent-scenario") {
      const denom = randChoice(rng, NICE_DENOMS);
      const numer = randInt(rng, 1, denom - 1);
      const percent = (numer * 100) / denom;
      const ctx = randChoice(rng, FRACTION_SCENARIO_CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `${ctx.subject.charAt(0).toUpperCase()}${ctx.subject.slice(1)} ${ctx.act1} $\\frac{${numer}}{${denom}}$ of ${ctx.item}. Express this as a percentage.`,
        before: "",
        after: "%",
        correctAnswer: String(percent),
        inputMode: "numeric",
        hint: "Change the fraction to an equivalent fraction with denominator 100.",
        explanation: `$\\frac{${numer}}{${denom}} \\times 100 = ${percent}\\%$.`,
      };
    }

    if (branch === "percent-to-fraction") {
      const percent = randChoice(rng, [4, 5, 8, 10, 12, 15, 16, 20, 24, 25, 28, 30, 35, 36, 40, 44, 45, 50, 55, 60, 64, 65, 70, 75, 76, 80, 84, 85, 90, 95] as const);
      const answer = formatFraction(percent, 100);
      return {
        kind: "fill-blank",
        prompt: `Express ${percent}% as a fraction in its lowest terms.`,
        before: "",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: "Write the percentage over 100, then simplify.",
        explanation: `${percent}% $= \\frac{${percent}}{100} = ${answer}$.`,
      };
    }

    if (branch === "reverse-percent") {
      const denom = randChoice(rng, NICE_DENOMS);
      const numer = randInt(rng, 1, denom - 1);
      const percent = (numer * 100) / denom;
      const correctText = `${numer}/${denom}`;
      const wrong = [formatFraction(numer + 1, denom), formatFraction(numer, denom + 5), formatFraction(denom - numer, denom)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which fraction equals ${percent}%?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Write the percentage over 100, then simplify to find the matching fraction.",
        explanation: `${percent}% $= \\frac{${percent}}{100}$, which simplifies to $\\frac{${numer}}{${denom}}$.`,
      };
    }

    if (branch === "classify-percent") {
      const benchmark = 50;
      const items = Array.from({ length: 5 }, () => {
        const denom = randChoice(rng, NICE_DENOMS);
        const numer = randInt(rng, 1, denom - 1);
        const percent = (numer * 100) / denom;
        return { label: `${numer}/${denom}`, percent };
      });
      const dedup = items.filter((it, i) => items.findIndex((o) => o.label === it.label) === i);
      const finalItems = dedup.map((it, i) => ({ id: `p${i}`, label: it.label }));
      const buckets = [
        { id: "over", label: `More than ${benchmark}%` },
        { id: "under", label: `${benchmark}% or less` },
      ];
      const correctBucket: Record<string, string> = {};
      dedup.forEach((it, i) => (correctBucket[`p${i}`] = it.percent > benchmark ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: `Sort each fraction by whether it is more than ${benchmark}%, or ${benchmark}% or less, when written as a percentage.`,
        items: finalItems,
        buckets,
        correctBucket,
        hint: "Convert each fraction to a percentage, then compare it to the benchmark.",
        explanation: dedup.map((it) => `${it.label} = ${it.percent}%`).join("; ") + ".",
      };
    }

    if (branch === "match-fraction-percent") {
      const pool = [
        { frac: "1/4", pct: "25%" },
        { frac: "1/2", pct: "50%" },
        { frac: "3/4", pct: "75%" },
        { frac: "1/5", pct: "20%" },
        { frac: "1/10", pct: "10%" },
        { frac: "1/20", pct: "5%" },
        { frac: "1/25", pct: "4%" },
        { frac: "1/50", pct: "2%" },
      ] as const;
      const chosen = shuffle(rng, [...pool]).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.frac }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.pct })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each fraction to its percentage.",
        tokens,
        targets,
        correctMap,
        hint: "Change each fraction to an equivalent fraction with denominator 100.",
        explanation: chosen.map((p) => `${p.frac} = ${p.pct}`).join("; ") + ".",
      };
    }

    // order-percent: order fractions by their percentage value
    const count = 5;
    const itemsSet = Array.from({ length: count }, () => {
      const denom = randChoice(rng, NICE_DENOMS);
      const numer = randInt(rng, 1, denom - 1);
      return { numer, denom, percent: (numer * 100) / denom };
    });
    const ascending = rng() < 0.5;
    const withLabel = itemsSet.map((it, i) => ({ id: `o${i}`, label: `${it.numer}/${it.denom}`, percent: it.percent }));
    const sorted = [...withLabel].sort((a, b) => (ascending ? a.percent - b.percent : b.percent - a.percent));
    return {
      kind: "ordering",
      prompt: `Arrange these fractions in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order by their percentage value.`,
      instruction: "Drag to arrange in order.",
      items: shuffle(rng, withLabel.map((w) => ({ id: w.id, label: w.label }))),
      correctOrder: sorted.map((w) => w.id),
      hint: "Convert each fraction to a percentage before comparing them.",
      explanation: sorted.map((w) => `${w.label} = ${w.percent}%`).join("; ") + ".",
    };
  },
};
