import { gcd, randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COLORS = ["red", "blue", "green", "yellow", "white"];

function reduceFraction(numerator: number, denominator: number): string {
  const g = gcd(Math.max(1, Math.abs(numerator)), denominator) || 1;
  return `$\\frac{${numerator / g}}{${denominator / g}}$`;
}

function reduceFractionPlain(numerator: number, denominator: number): string {
  const g = gcd(Math.max(1, Math.abs(numerator)), denominator) || 1;
  return `${numerator / g}/${denominator / g}`;
}

/** Build 4 distinct fraction-string choices (1 correct + 3 distractors) over a shared denominator. */
function buildFractionChoices(rng: RNG, favourable: number, total: number) {
  const correctText = reduceFraction(favourable, total);
  const seen = new Set([correctText]);
  const distractors: string[] = [];
  let offset = 1;
  while (distractors.length < 3 && offset <= total + 5) {
    for (const n of [favourable + offset, favourable - offset]) {
      if (distractors.length >= 3) break;
      if (n <= 0 || n >= total) continue;
      const text = reduceFraction(n, total);
      if (!seen.has(text)) {
        seen.add(text);
        distractors.push(text);
      }
    }
    offset++;
  }
  const choices = shuffle(rng, [correctText, ...distractors]);
  return { choices, correctIndex: choices.indexOf(correctText), correctText };
}

export const simpleProbability: Skill = {
  id: "math-d-simple-probability",
  code: "D.2",
  subjectId: "math",
  strandId: "math-data",
  grade: 9,
  title: "Simple probability",
  description: "Find the probability of a single event, its complement, or a combined event from a described sample space.",
  generate(rng) {
    const colors = shuffle(rng, COLORS).slice(0, 3);
    const counts = sampleDistinctInts(rng, 2, 9, 3);
    const total = counts.reduce((a, b) => a + b, 0);
    const description = colors.map((c, i) => `${counts[i]} ${c}`).join(", ");

    if (rng() < 0.35) {
      const tokens = shuffle(rng, colors.map((c) => ({ id: c, label: c })));
      const targets = shuffle(rng, colors.map((c, i) => ({ id: c, label: reduceFractionPlain(counts[i], total) })));
      const correctMap: Record<string, string> = {};
      for (const c of colors) correctMap[c] = c;

      return {
        kind: "click-match",
        prompt: `A bag contains ${description} counters. Match each colour to the probability of picking it at random.`,
        tokens,
        targets,
        correctMap,
        hint: "Probability = favourable outcomes ÷ total outcomes, for each colour.",
        explanation: colors.map((c, i) => `P(${c}) = ${counts[i]}/${total} = ${reduceFractionPlain(counts[i], total)}.`).join(" "),
      };
    }

    const mode = randChoice(rng, ["single", "complement", "combined"] as const);

    if (mode === "complement") {
      const targetIdx = randInt(rng, 0, 2);
      const favourable = total - counts[targetIdx];
      const { choices, correctIndex, correctText } = buildFractionChoices(rng, favourable, total);
      const g = gcd(favourable, total);

      return {
        kind: "multiple-choice",
        prompt: `A bag contains ${description} counters. What is the probability of NOT picking a ${colors[targetIdx]} counter at random?`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Counters that are NOT ${colors[targetIdx]} = total − ${colors[targetIdx]} counters.`,
        explanation: `There are ${counts[targetIdx]} ${colors[targetIdx]} counters out of ${total} total, so counters that are NOT ${colors[targetIdx]} number ${total} − ${counts[targetIdx]} = ${favourable}. P(not ${colors[targetIdx]}) = $\\frac{${favourable}}{${total}}$${
          g > 1 ? ` = ${correctText} (dividing both by ${g})` : ""
        }.`,
      };
    }

    if (mode === "combined") {
      const [i, j] = shuffle(rng, [0, 1, 2]).slice(0, 2).sort((a, b) => a - b);
      const favourable = counts[i] + counts[j];
      const { choices, correctIndex, correctText } = buildFractionChoices(rng, favourable, total);
      const g = gcd(favourable, total);

      return {
        kind: "multiple-choice",
        prompt: `A bag contains ${description} counters. What is the probability of picking a ${colors[i]} OR a ${colors[j]} counter at random?`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Add the favourable counts for ${colors[i]} and ${colors[j]}, then divide by the total.`,
        explanation: `${colors[i]} or ${colors[j]} counters = ${counts[i]} + ${counts[j]} = ${favourable} out of ${total} total. P(${colors[i]} or ${colors[j]}) = $\\frac{${favourable}}{${total}}$${
          g > 1 ? ` = ${correctText} (dividing both by ${g})` : ""
        }.`,
      };
    }

    const targetIdx = 0;
    const favourable = counts[targetIdx];
    const { choices, correctIndex, correctText } = buildFractionChoices(rng, favourable, total);
    const g = gcd(favourable, total);

    return {
      kind: "multiple-choice",
      prompt: `A bag contains ${description} counters. What is the probability of picking a ${colors[targetIdx]} counter at random?`,
      choices,
      correctIndex,
      layout: "row",
      hint: "Probability = $\\frac{\\text{favourable outcomes}}{\\text{total outcomes}}$.",
      explanation: `There are ${favourable} ${colors[targetIdx]} counters out of ${total} total. P(${colors[targetIdx]}) = $\\frac{${favourable}}{${total}}$${
        g > 1 ? ` = ${correctText} (dividing both by ${g})` : ""
      }.`,
    };
  },
};
