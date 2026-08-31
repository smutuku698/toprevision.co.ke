import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CONTEXTS = [
  { subject: "a shop's daily sales (in KES thousands)", unit: "" },
  { subject: "the number of matatus passing a stage each hour", unit: "" },
  { subject: "a farm's daily milk yield (litres)", unit: "" },
  { subject: "a class's daily rainfall readings (mm)", unit: "" },
];

function computeMode(data: number[]): number {
  const counts = new Map<number, number>();
  for (const v of data) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = data[0];
  let bestCount = 0;
  for (const [v, c] of counts) if (c > bestCount) { best = v; bestCount = c; }
  return best;
}

export const dataPresentation: Skill = {
  id: "g8-math-d-data-presentation",
  code: "D.1",
  subjectId: "math",
  strandId: "g8-math-data-probability",
  grade: 8,
  title: "Data presentation and interpretation",
  description: "Read and interpret bar graphs and line graphs, and find the mean, median, and mode of discrete data.",
  generate(rng) {
    const branch = randChoice(rng, ["mean", "median", "mode", "bar-interpret", "line-interpret", "above-below-mean", "order-values"] as const);
    const ctx = randChoice(rng, CONTEXTS);
    const size = randChoice(rng, [5, 6, 7] as const);
    const data = Array.from({ length: size }, () => randInt(rng, 12, 95));
    data[1] = data[0]; // guarantee a clean mode
    const labels = DAY_LABELS.slice(0, size);

    if (branch === "mean") {
      const sum = data.reduce((a, b) => a + b, 0);
      const meanExact = sum / data.length;
      const answer = Number.isInteger(meanExact) ? String(meanExact) : meanExact.toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `This chart shows ${ctx.subject}. Find the mean.`,
        visual: { type: "bar-chart", data: labels.map((l, i) => ({ label: l, value: data[i] })) },
        before: "Mean =",
        after: "",
        correctAnswer: answer,
        inputMode: "numeric",
        hint: "Add all the values, then divide by how many there are.",
        explanation: `Sum $= ${data.join(" + ")} = ${sum}$. Mean $= ${sum} \\div ${data.length} = ${answer}$.`,
      };
    }

    if (branch === "median") {
      const sorted = [...data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      return {
        kind: "fill-blank",
        prompt: `This chart shows ${ctx.subject}. Find the median.`,
        visual: { type: "bar-chart", data: labels.map((l, i) => ({ label: l, value: data[i] })) },
        before: "Median =",
        after: "",
        correctAnswer: Number.isInteger(median) ? String(median) : median.toFixed(1),
        inputMode: "numeric",
        hint: "Sort the values first, then find the middle one (or average the middle two).",
        explanation: `Sorted: ${sorted.join(", ")}. Median $= ${Number.isInteger(median) ? median : median.toFixed(1)}$.`,
      };
    }

    if (branch === "mode") {
      const mode = computeMode(data);
      return {
        kind: "fill-blank",
        prompt: `This chart shows ${ctx.subject}. Find the mode.`,
        visual: { type: "bar-chart", data: labels.map((l, i) => ({ label: l, value: data[i] })) },
        before: "Mode =",
        after: "",
        correctAnswer: String(mode),
        inputMode: "numeric",
        hint: "Find the value that appears most often.",
        explanation: `The value ${mode} appears more often than any other, so the mode is ${mode}.`,
      };
    }

    if (branch === "bar-interpret") {
      const maxVal = Math.max(...data);
      const maxIdx = data.indexOf(maxVal);
      const minVal = Math.min(...data);
      const diff = maxVal - minVal;
      const askDiff = rng() < 0.5;
      if (askDiff) {
        const wrong = [String(diff + 1), String(diff + 2), String(diff + 3), String(Math.max(0, diff - 1)), String(maxVal), String(minVal)];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, String(diff), wrong);
        return {
          kind: "multiple-choice",
          prompt: `This chart shows ${ctx.subject}. What is the difference between the highest and lowest values?`,
          visual: { type: "bar-chart", data: labels.map((l, i) => ({ label: l, value: data[i] })) },
          choices,
          correctIndex,
          layout: "row",
          hint: "Subtract the smallest bar's value from the tallest bar's value.",
          explanation: `Highest = ${maxVal}, lowest = ${minVal}. Difference $= ${maxVal} - ${minVal} = ${diff}$.`,
        };
      }
      const choices = shuffle(rng, labels);
      return {
        kind: "multiple-choice",
        prompt: `This chart shows ${ctx.subject}. Which day/category has the highest value?`,
        visual: { type: "bar-chart", data: labels.map((l, i) => ({ label: l, value: data[i] })) },
        choices,
        correctIndex: choices.indexOf(labels[maxIdx]),
        layout: "row",
        hint: "Find the tallest bar.",
        explanation: `The tallest bar is ${labels[maxIdx]} with a value of ${maxVal}.`,
      };
    }

    if (branch === "line-interpret") {
      const points = labels.map((l, i) => ({ label: l, value: data[i] }));
      let biggestRiseIdx = 0;
      let biggestRise = -Infinity;
      for (let i = 1; i < data.length; i++) {
        if (data[i] - data[i - 1] > biggestRise) {
          biggestRise = data[i] - data[i - 1];
          biggestRiseIdx = i;
        }
      }
      const transitionLabels = labels.slice(1).map((l, idx) => `${labels[idx]} → ${l}`);
      const correctText = `${labels[biggestRiseIdx - 1]} → ${labels[biggestRiseIdx]}`;
      const choices = shuffle(rng, transitionLabels);
      return {
        kind: "multiple-choice",
        prompt: `This line graph shows ${ctx.subject}. Between which two consecutive points did the value increase the most?`,
        visual: { type: "line-graph", points },
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Look for the steepest upward slope between two neighboring points.",
        explanation: `The value rose the most (by ${biggestRise}) from ${labels[biggestRiseIdx - 1]} to ${labels[biggestRiseIdx]}.`,
      };
    }

    if (branch === "above-below-mean") {
      const sum = data.reduce((a, b) => a + b, 0);
      const mean = sum / data.length;
      const items = labels.map((l, i) => ({ id: `${l}${i}`, label: `${l}: ${data[i]}` }));
      const buckets = [
        { id: "above", label: "Above the mean" },
        { id: "below", label: "At or below the mean" },
      ];
      const correctBucket: Record<string, string> = {};
      labels.forEach((l, i) => (correctBucket[`${l}${i}`] = data[i] > mean ? "above" : "below"));
      return {
        kind: "categorize",
        prompt: `This data shows ${ctx.subject}: ${labels.map((l, i) => `${l}=${data[i]}`).join(", ")}. The mean is ${mean.toFixed(1)}. Sort each value.`,
        items,
        buckets,
        correctBucket,
        hint: `Compare each value to the mean (${mean.toFixed(1)}).`,
        explanation: labels.map((l, i) => `${l} (${data[i]}) is ${data[i] > mean ? "above" : "at or below"} the mean`).join("; ") + ".",
      };
    }

    // order-values
    const items = labels.map((l, i) => ({ id: `${l}${i}`, label: `${l}: ${data[i]}` }));
    const order = [...labels.keys()].sort((a, b) => data[a] - data[b]);
    return {
      kind: "ordering",
      prompt: `This data shows ${ctx.subject}. Order the days from lowest to highest value.`,
      instruction: "Click them in order, lowest first.",
      items: shuffle(rng, items),
      correctOrder: order.map((i) => `${labels[i]}${i}`),
      hint: "Compare the values directly.",
      explanation: `In order: ${order.map((i) => `${labels[i]} (${data[i]})`).join(", ")}.`,
    };
  },
};
