import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { SHARING_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
/** Numbers that round cleanly to a ten-multiple dividend/divisor whose rounded quotient is a whole number. */
function genEstimateDivision(rng: () => number) {
  const divisorRounded = randInt(rng, 2, 48) * 10; // 20..480
  const q = randInt(rng, 2, 20);
  const dividendRounded = divisorRounded * q;
  const a = dividendRounded + randInt(rng, -4, 4);
  const b = divisorRounded + randInt(rng, -4, 4);
  return { a, b, divisorRounded, dividendRounded, q };
}

export const estimatingQuotients: Skill = {
  id: "g6-math-n-estimating-quotients",
  code: "N.8",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Estimating quotients",
  description: "Estimate quotients by rounding off both the dividend and the divisor to the nearest ten.",
  generate(rng) {
    const branch = randChoice(rng, ["estimate-fill", "estimate-real-world", "estimate-mc", "match-estimates", "exact-vs-estimate", "order-estimates"] as const);

    if (branch === "estimate-fill") {
      const { a, b, divisorRounded, dividendRounded, q } = genEstimateDivision(rng);
      return {
        kind: "fill-blank",
        prompt: `Estimate $${fmt(a)} \\div ${fmt(b)}$ by first rounding each number to the nearest ten.`,
        before: "Estimate =",
        after: "",
        correctAnswer: String(q),
        inputMode: "numeric",
        hint: `Round ${fmt(a)} to ${fmt(dividendRounded)} and ${fmt(b)} to ${fmt(divisorRounded)}, then divide.`,
        explanation: `${fmt(a)} rounds to ${fmt(dividendRounded)}, and ${fmt(b)} rounds to ${fmt(divisorRounded)}: $${fmt(dividendRounded)} \\div ${fmt(divisorRounded)} = ${q}$.`,
      };
    }

    if (branch === "estimate-real-world") {
      const { a, b, divisorRounded, dividendRounded, q } = genEstimateDivision(rng);
      const ctx = randChoice(rng, SHARING_CONTEXTS);
      const pl = place(rng);
      return {
        kind: "fill-blank",
        prompt: `In ${pl}, about ${fmt(a)} ${ctx.totalLabel} need to be shared among about ${fmt(b)} ${ctx.groupLabel}. Estimate how many each will get, by rounding both numbers to the nearest ten first.`,
        before: "Estimate =",
        after: "",
        correctAnswer: String(q),
        inputMode: "numeric",
        hint: `Round ${fmt(a)} to the nearest ten and ${fmt(b)} to the nearest ten, then divide.`,
        explanation: `Rounded: ${fmt(dividendRounded)} ÷ ${fmt(divisorRounded)} = ${q}.`,
      };
    }

    if (branch === "estimate-mc") {
      const { a, b, dividendRounded, divisorRounded, q } = genEstimateDivision(rng);
      const wrongPlusOne = q + 1;
      const wrongMinusOne = q > 1 ? q - 1 : q + 2;
      const wrongTimesTen = q * 10;
      const candidates = [...new Set([wrongPlusOne, wrongMinusOne, wrongTimesTen])].filter((v) => v !== q && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(q), candidates.map(String), Math.min(3, candidates.length));
      return {
        kind: "multiple-choice",
        prompt: `Estimate $${fmt(a)} \\div ${fmt(b)}$ by rounding both numbers to the nearest ten.`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Round BOTH numbers to the nearest ten before dividing — don't divide the unrounded numbers.",
        explanation: `${fmt(a)} rounds to ${fmt(dividendRounded)}, and ${fmt(b)} rounds to ${fmt(divisorRounded)}: $${fmt(dividendRounded)} \\div ${fmt(divisorRounded)} = ${q}$.`,
      };
    }

    if (branch === "match-estimates") {
      const seen = new Set<string>();
      const divisions: ReturnType<typeof genEstimateDivision>[] = [];
      while (divisions.length < 4) {
        const d = genEstimateDivision(rng);
        const key = `${d.a}-${d.b}`;
        if (!seen.has(key)) {
          seen.add(key);
          divisions.push(d);
        }
      }
      const tokens = divisions.map((d, i) => ({ id: `e${i}`, label: `${fmt(d.a)} ÷ ${fmt(d.b)}` }));
      const targets = shuffle(rng, divisions.map((d, i) => ({ id: `q${i}`, label: String(d.q) })));
      const correctMap: Record<string, string> = {};
      divisions.forEach((d, i) => (correctMap[`q${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each division to its estimated quotient (round both numbers to the nearest ten first).",
        tokens,
        targets,
        correctMap,
        hint: "Round both numbers in each expression to the nearest ten before dividing.",
        explanation: divisions.map((d) => `${fmt(d.a)} ÷ ${fmt(d.b)} rounds to ${fmt(d.dividendRounded)} ÷ ${fmt(d.divisorRounded)} = ${d.q}`).join("; ") + ".",
      };
    }

    if (branch === "exact-vs-estimate") {
      const items: { id: string; a: number; b: number; q: number; exactRounded: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const d = genEstimateDivision(rng);
        const exactRounded = Math.round(d.a / d.b);
        items.push({ id: `x${i}`, a: d.a, b: d.b, q: d.q, exactRounded });
      }
      const buckets = [
        { id: "match", label: "Estimate matches the true quotient (rounded)" },
        { id: "differ", label: "Estimate differs from the true quotient" },
      ];
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.q === it.exactRounded ? "match" : "differ"));
      return {
        kind: "categorize",
        prompt: "For each division, sort it by whether the rounded-to-nearest-ten estimate matches the true quotient (also rounded to the nearest whole number).",
        items: items.map((it) => ({ id: it.id, label: `${fmt(it.a)} ÷ ${fmt(it.b)} ≈ ${it.q}` })),
        buckets,
        correctBucket,
        hint: "Work out the true quotient (rounded to a whole number) and compare it to the estimate.",
        explanation: items.map((it) => `${fmt(it.a)} ÷ ${fmt(it.b)}: estimate = ${it.q}, true quotient rounded = ${it.exactRounded} (${it.q === it.exactRounded ? "match" : "differ"})`).join("; ") + ".",
      };
    }

    // order-estimates: order estimated quotients from smallest to largest.
    const seen = new Set<string>();
    const divisions: (ReturnType<typeof genEstimateDivision> & { id: string })[] = [];
    let i = 0;
    while (divisions.length < 5) {
      const d = genEstimateDivision(rng);
      const key = `${d.a}-${d.b}`;
      if (!seen.has(key)) {
        seen.add(key);
        divisions.push({ id: `o${i}`, ...d });
        i++;
      }
    }
    const sorted = [...divisions].sort((a, b) => a.q - b.q);
    return {
      kind: "ordering",
      prompt: "Estimate each quotient (round to the nearest ten first), then order them from smallest to largest.",
      instruction: "Click them in order, smallest estimate first.",
      items: shuffle(rng, divisions).map((d) => ({ id: d.id, label: `${fmt(d.a)} ÷ ${fmt(d.b)}` })),
      correctOrder: sorted.map((d) => d.id),
      hint: "Round both numbers in each expression to the nearest ten before dividing.",
      explanation: sorted.map((d) => `${fmt(d.a)} ÷ ${fmt(d.b)} ≈ ${d.q}`).join("; ") + ".",
    };
  },
};
