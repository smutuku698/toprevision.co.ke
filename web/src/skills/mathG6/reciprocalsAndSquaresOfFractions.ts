import { randChoice, randInt, shuffle, gcd } from "@/lib/rng";
import { formatFraction, buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 32 real-life "why would you square/invert a fraction" framing hooks — the underlying maths
// (reciprocal/square of a fraction) is purely numeric, so this pool exists to vary the sentence
// wrapper around the same computation, per the 30+ pool-size floor for this round.
const FRACTION_HOOKS = [
  "A recipe uses a fraction of a bag of flour.",
  "A farmer irrigates a fraction of a plot each day.",
  "A tailor cuts a fraction of a roll of cloth for one garment.",
  "A tank is filled to a certain fraction each hour.",
  "A painter mixes a fraction of a tin of paint for one coat.",
  "A cyclist covers a fraction of a route in one stage.",
  "A shopkeeper sells a fraction of a sack of rice each day.",
  "A student completes a fraction of an assignment each evening.",
  "A driver uses a fraction of a fuel tank on one trip.",
  "A carpenter cuts a fraction of a plank for one shelf.",
  "A nurse dispenses a fraction of a bottle of medicine per dose.",
  "A caterer uses a fraction of a sack of rice for one event.",
  "A beekeeper harvests a fraction of a hive's honeycomb.",
  "A mechanic uses a fraction of a can of oil per service.",
  "A librarian lends out a fraction of the library's storybooks.",
  "A milkman delivers a fraction of a can of milk per stop.",
  "A fisherman sells a fraction of the day's catch at one stall.",
  "A plumber uses a fraction of a coil of pipe for one job.",
  "A teacher covers a fraction of the syllabus each week.",
  "A gardener waters a fraction of the seedbed each morning.",
  "A weaver uses a fraction of a basket of reeds for one mat.",
  "A potter uses a fraction of a bag of clay for one pot.",
  "A trader packs a fraction of a crate of eggs per customer.",
  "A miller grinds a fraction of a sack of maize per batch.",
  "A cobbler uses a fraction of a hide of leather per pair of shoes.",
  "A florist uses a fraction of a bundle of flowers per bouquet.",
  "A blacksmith uses a fraction of a bar of metal per tool.",
  "A brewer uses a fraction of a sack of malt per batch.",
  "A tanner treats a fraction of a hide at a time.",
  "A charcoal burner fills a fraction of a sack per session.",
  "A grocer weighs out a fraction of a sack of beans per order.",
  "A seamstress uses a fraction of a spool of thread per garment.",
] as const;

export const reciprocalsAndSquaresOfFractions: Skill = {
  id: "g6-math-n-reciprocals-squares-fractions",
  code: "N.11",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Reciprocals and squares of fractions",
  description: "Find the reciprocal of proper fractions (2-digit denominator) and the square of fractions (1-digit numerator, 2-digit denominator).",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["reciprocal", "reciprocal-whole", "square-fraction", "reverse-reciprocal", "classify-reciprocal", "order-squares", "match-reciprocal"] as const
    );

    if (branch === "reciprocal") {
      const denom = randInt(rng, 11, 99);
      let numer = randInt(rng, 2, Math.min(denom - 1, 9));
      while (gcd(numer, denom) !== 1) numer = randInt(rng, 2, Math.min(denom - 1, 9));
      const answer = `${denom}/${numer}`;
      const hook = randChoice(rng, FRACTION_HOOKS);
      return {
        kind: "fill-blank",
        prompt: `${hook} Find the reciprocal of $\\frac{${numer}}{${denom}}$.`,
        before: "Reciprocal =",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [answer, formatFraction(denom, numer)],
        inputMode: "text",
        hint: "The reciprocal of a fraction is found by swapping (flipping) the numerator and denominator.",
        explanation: `The reciprocal of $\\frac{${numer}}{${denom}}$ is $\\frac{${denom}}{${numer}}$, since $\\frac{${numer}}{${denom}} \\times \\frac{${denom}}{${numer}} = 1$.`,
      };
    }

    if (branch === "reciprocal-whole") {
      const n = randInt(rng, 2, 12);
      return {
        kind: "fill-blank",
        prompt: `Find the reciprocal of the whole number ${n}.`,
        before: "Reciprocal =",
        after: "",
        correctAnswer: `1/${n}`,
        inputMode: "text",
        hint: "Any whole number n can be written as the fraction n/1 — its reciprocal is 1/n.",
        explanation: `${n} is the same as $\\frac{${n}}{1}$, so its reciprocal is $\\frac{1}{${n}}$.`,
      };
    }

    if (branch === "square-fraction") {
      const denom = randInt(rng, 11, 99);
      let numer = randInt(rng, 1, 9);
      while (gcd(numer, denom) !== 1) numer = randInt(rng, 1, 9);
      const sqNum = numer * numer;
      const sqDenom = denom * denom;
      const answer = formatFraction(sqNum, sqDenom);
      const hook = randChoice(rng, FRACTION_HOOKS);
      return {
        kind: "fill-blank",
        prompt: `${hook} Find the square of $\\frac{${numer}}{${denom}}$.`,
        before: "Square =",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: "Square the numerator and square the denominator separately.",
        explanation: `$\\left(\\frac{${numer}}{${denom}}\\right)^2 = \\frac{${numer}^2}{${denom}^2} = \\frac{${sqNum}}{${sqDenom}} = ${answer}$.`,
      };
    }

    if (branch === "reverse-reciprocal") {
      const denom = randInt(rng, 11, 99);
      let numer = randInt(rng, 2, Math.min(denom - 1, 9));
      while (gcd(numer, denom) !== 1) numer = randInt(rng, 2, Math.min(denom - 1, 9));
      const correctText = `${numer}/${denom}`;
      const wrong = [`${denom}/${numer}`, `${numer + 1}/${denom}`, `${numer}/${denom + 1}`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `The reciprocal of a fraction is $\\frac{${denom}}{${numer}}$. What was the original fraction?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "If you know the reciprocal, flip it back to find the original fraction.",
        explanation: `Flipping $\\frac{${denom}}{${numer}}$ back gives the original fraction $\\frac{${numer}}{${denom}}$.`,
      };
    }

    if (branch === "classify-reciprocal") {
      const items = Array.from({ length: 5 }, () => {
        const denom = randInt(rng, 11, 60);
        let numer = randInt(rng, 2, Math.min(denom - 1, 20));
        while (gcd(numer, denom) !== 1) numer = randInt(rng, 2, Math.min(denom - 1, 20));
        return { numer, denom, label: `${numer}/${denom}` };
      });
      const dedup = items.filter((it, i) => items.findIndex((o) => o.label === it.label) === i);
      const finalItems = dedup.map((it, i) => ({ id: `f${i}`, label: it.label }));
      const buckets = [
        { id: "big", label: "Reciprocal is greater than 10" },
        { id: "small", label: "Reciprocal is 10 or less" },
      ];
      const correctBucket: Record<string, string> = {};
      dedup.forEach((it, i) => (correctBucket[`f${i}`] = it.denom / it.numer > 10 ? "big" : "small"));
      return {
        kind: "categorize",
        prompt: "Sort each fraction by whether its reciprocal is greater than 10, or 10 or less.",
        items: finalItems,
        buckets,
        correctBucket,
        hint: "Work out the reciprocal (flip the fraction) for each, then compare it to 10.",
        explanation: dedup.map((it) => `Reciprocal of ${it.label} is ${it.denom}/${it.numer} ≈ ${(it.denom / it.numer).toFixed(1)}`).join("; ") + ".",
      };
    }

    if (branch === "order-squares") {
      const count = 5;
      const denomsSet = new Set<number>();
      while (denomsSet.size < count) denomsSet.add(randInt(rng, 11, 40));
      const items = [...denomsSet].map((denom) => {
        let numer = randInt(rng, 1, Math.min(denom - 1, 5));
        while (gcd(numer, denom) !== 1) numer = randInt(rng, 1, Math.min(denom - 1, 5));
        const sqValue = (numer * numer) / (denom * denom);
        return { id: `${numer}-${denom}`, label: `(${numer}/${denom})²`, value: sqValue };
      });
      const ascending = rng() < 0.5;
      const sorted = [...items].sort((a, b) => (ascending ? a.value - b.value : b.value - a.value));
      return {
        kind: "ordering",
        prompt: `Arrange these squared fractions in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order.`,
        instruction: "Drag to arrange in order.",
        items: shuffle(rng, items.map((it) => ({ id: it.id, label: it.label }))),
        correctOrder: sorted.map((it) => it.id),
        hint: "Work out each square, then compare the values.",
        explanation: sorted.map((it) => `${it.label} ≈ ${it.value.toFixed(4)}`).join("; ") + ".",
      };
    }

    // match-reciprocal: click-match a fraction to its reciprocal
    const pairsSet: { numer: number; denom: number }[] = [];
    while (pairsSet.length < 4) {
      const denom = randInt(rng, 12, 90);
      let numer = randInt(rng, 2, Math.min(denom - 1, 9));
      while (gcd(numer, denom) !== 1) numer = randInt(rng, 2, Math.min(denom - 1, 9));
      if (!pairsSet.some((p) => p.numer === numer && p.denom === denom)) pairsSet.push({ numer, denom });
    }
    const tokens = pairsSet.map((p, i) => ({ id: `t${i}`, label: `${p.numer}/${p.denom}` }));
    const targets = shuffle(rng, pairsSet.map((p, i) => ({ id: `m${i}`, label: `${p.denom}/${p.numer}` })));
    const correctMap: Record<string, string> = {};
    pairsSet.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
    return {
      kind: "click-match",
      prompt: "Match each fraction to its reciprocal.",
      tokens,
      targets,
      correctMap,
      hint: "The reciprocal swaps the numerator and denominator.",
      explanation: pairsSet.map((p) => `${p.numer}/${p.denom} ↔ ${p.denom}/${p.numer}`).join("; ") + ".",
    };
  },
};
