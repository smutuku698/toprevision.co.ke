import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function buildMcChoices(rng: RNG, correct: number, candidates: number[]): { choices: string[]; correctIndex: number } {
  const correctText = formatNum(correct);
  const seen = new Set([correctText]);
  const distractors: string[] = [];
  for (const c of shuffle(rng, candidates.filter((v) => Number.isFinite(v)))) {
    if (distractors.length >= 3) break;
    const text = formatNum(c);
    if (!seen.has(text)) {
      seen.add(text);
      distractors.push(text);
    }
  }
  let offset = 1;
  while (distractors.length < 3) {
    const candidate = correct + offset * (offset % 2 === 0 ? 1 : -1);
    const text = formatNum(candidate);
    if (!seen.has(text)) {
      seen.add(text);
      distractors.push(text);
    }
    offset++;
  }
  const choices = shuffle(rng, [correctText, ...distractors]);
  return { choices, correctIndex: choices.indexOf(correctText) };
}

function computeModeWithCount(data: number[]): [number, number] {
  const counts = new Map<number, number>();
  for (const v of data) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = data[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return [best, bestCount];
}

export const meanMedianMode: Skill = {
  id: "math-d-mean-median-mode",
  code: "D.1",
  subjectId: "math",
  strandId: "math-data",
  grade: 9,
  title: "Mean, median, mode and range",
  description: "Calculate a measure of central tendency for a small data set.",
  generate(rng) {
    const size = randChoice(rng, [5, 6, 7, 8, 9]);
    const includeNegative = rng() < 0.3;
    let data = Array.from({ length: size }, () =>
      includeNegative && rng() < 0.35 ? randInt(rng, -12, -1) : randInt(rng, 2, 30)
    );
    // Force a repeated value so "mode" always has a clean, well-defined answer.
    data[1] = data[0];
    data = shuffle(rng, data);

    const measure = randChoice(rng, ["mean", "median", "mode", "range"] as const);
    let answer: number;
    let label: string;
    let explanation: string;
    let hint: string;

    switch (measure) {
      case "mean": {
        const sum = data.reduce((a, b) => a + b, 0);
        answer = sum / data.length;
        label = "mean";
        hint = "Add all the values, then divide by how many there are.";
        explanation = `Sum = ${data.join(" + ")} = ${sum}. Mean = ${sum} ÷ ${data.length} = ${
          Number.isInteger(answer) ? answer : answer.toFixed(1)
        }.`;
        break;
      }
      case "median": {
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        answer = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
        label = "median";
        hint = "Sort the values first, then find the middle.";
        explanation =
          sorted.length % 2 === 0
            ? `Sorted: ${sorted.join(", ")}. The two middle values are ${sorted[mid - 1]} and ${sorted[mid]}, so median = (${sorted[mid - 1]} + ${sorted[mid]}) ÷ 2 = ${answer}.`
            : `Sorted: ${sorted.join(", ")}. The middle value is ${sorted[mid]}, so the median is ${sorted[mid]}.`;
        break;
      }
      case "mode": {
        const [best, bestCount] = computeModeWithCount(data);
        answer = best;
        label = "mode";
        hint = "Find the value that appears most often.";
        explanation = `The value ${best} appears ${bestCount} times, more often than any other value in the data set, so the mode is ${best}.`;
        break;
      }
      case "range": {
        const max = Math.max(...data);
        const min = Math.min(...data);
        answer = max - min;
        label = "range";
        hint = "Subtract the smallest value from the largest.";
        explanation = `Range = highest value − lowest value = ${max} − ${min} = ${answer}.`;
        break;
      }
    }

    const sum = data.reduce((a, b) => a + b, 0);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const wrongCandidates =
      measure === "mean"
        ? [sum / (data.length - 1), sum / (data.length + 1), max, min, answer + 1, answer - 1]
        : measure === "median"
        ? [sum / data.length, max, min, answer + 1, answer - 1]
        : measure === "mode"
        ? [max, min, data[0], answer + 1, answer - 1]
        : [max, min, max + min, answer + 1, answer - 1];

    const kind = randChoice(rng, ["fill-blank", "multiple-choice"] as const);

    if (kind === "multiple-choice") {
      const { choices, correctIndex } = buildMcChoices(rng, answer, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `Find the ${label} of this data set: ${data.join(", ")}`,
        visual: { type: "bar-chart", data: data.map((v, i) => ({ label: `#${i + 1}`, value: v })) },
        choices,
        correctIndex,
        layout: "row",
        hint,
        explanation,
      };
    }

    return {
      kind: "fill-blank",
      prompt: `Find the ${label} of this data set: ${data.join(", ")}`,
      visual: { type: "bar-chart", data: data.map((v, i) => ({ label: `#${i + 1}`, value: v })) },
      before: `${label[0].toUpperCase()}${label.slice(1)} =`,
      after: "",
      correctAnswer: Number.isInteger(answer) ? String(answer) : answer.toFixed(1),
      acceptedAnswers: Number.isInteger(answer) ? [answer.toFixed(1)] : [String(answer)],
      inputMode: "numeric",
      hint,
      explanation,
    };
  },
};
