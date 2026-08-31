import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 32 distinct real-world Kenyan data-context subjects for bar-graph representation/interpretation.
const CONTEXTS = [
  "the number of learners absent from a Grade 6 class each day",
  "matatus passing a stage in a town each hour",
  "eggs collected on a poultry farm each day",
  "customers served at a shop each day",
  "goals scored by a school football team across matches",
  "litres of milk delivered to a dairy cooperative each day",
  "bags of maize sold at a market each day",
  "patients seen at a health centre each day",
  "books borrowed from a school library each day",
  "text messages sent by learners in a survey week",
  "trees planted by a school each day during tree week",
  "fish caught by a fishing crew each day",
  "parcels delivered by a courier each day",
  "loaves of bread baked by a bakery each day",
  "buses arriving at a terminus each hour",
  "water jerrycans sold by a vendor each day",
  "cows milked on a dairy farm each day",
  "bicycles repaired at a shop each day",
  "sim cards sold at a kiosk each day",
  "avocados exported from a farm each day",
  "attendance recorded at a church each Sunday over a month",
  "footballs sold at a sports shop each week",
  "solar lamps distributed to villages each month",
  "goats sold at a livestock market each day",
  "harambee contributions collected each week",
  "national exam candidates registered at centres in a county",
  "vehicles crossing a weighbridge each hour",
  "trees cut for timber near a forest each month",
  "beehives harvested by a beekeeper each month",
  "coffee bags exported from a factory each month",
  "SIM registrations completed at a shop each day",
  "road accidents recorded on a highway each month",
] as const;

export const barGraphsAndInterpretation: Skill = {
  id: "g6-math-d-bar-graphs-interpretation",
  code: "D.2",
  subjectId: "math",
  strandId: "g6-math-data",
  grade: 6,
  title: "Bar graphs and interpretation",
  description: "Represent real-life data using a bar graph and interpret information shown on a bar graph.",
  generate(rng) {
    const branch = randChoice(rng, ["read-value", "highest-lowest", "difference", "total", "compare-two", "above-average", "match-terms", "order-bars"] as const);
    const ctx = randChoice(rng, CONTEXTS);
    const size = randChoice(rng, [5, 6, 7] as const);
    const data = Array.from({ length: size }, () => randInt(rng, 8, 60));
    const labels = DAY_LABELS.slice(0, size);
    const visual = { type: "bar-chart" as const, data: labels.map((l, i) => ({ label: l, value: data[i] })) };

    if (branch === "read-value") {
      const idx = randInt(rng, 0, size - 1);
      const wrong = [String(data[idx] + randInt(rng, 3, 9)), String(Math.max(0, data[idx] - randInt(rng, 3, 9))), String(data[(idx + 1) % size])];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(data[idx]), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `This bar graph shows ${ctx}. What value does the bar for ${labels[idx]} show?`,
        visual,
        choices,
        correctIndex,
        layout: "row",
        hint: `Find the ${labels[idx]} bar and read its height against the scale.`,
        explanation: `The bar for ${labels[idx]} shows a value of ${data[idx]}.`,
      };
    }

    if (branch === "highest-lowest") {
      const askHighest = rng() < 0.5;
      const maxVal = Math.max(...data);
      const minVal = Math.min(...data);
      const targetVal = askHighest ? maxVal : minVal;
      const targetIdx = data.indexOf(targetVal);
      const choices = shuffle(rng, labels);
      return {
        kind: "multiple-choice",
        prompt: `This bar graph shows ${ctx}. Which day/category has the ${askHighest ? "HIGHEST" : "LOWEST"} value?`,
        visual,
        choices,
        correctIndex: choices.indexOf(labels[targetIdx]),
        layout: "row",
        hint: `Find the ${askHighest ? "tallest" : "shortest"} bar.`,
        explanation: `The ${askHighest ? "tallest" : "shortest"} bar is ${labels[targetIdx]} with a value of ${targetVal}.`,
      };
    }

    if (branch === "difference") {
      const maxVal = Math.max(...data);
      const minVal = Math.min(...data);
      const diff = maxVal - minVal;
      return {
        kind: "fill-blank",
        prompt: `This bar graph shows ${ctx}. Find the difference between the highest and lowest bars.`,
        visual,
        before: "Difference =",
        after: "",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Subtract the smallest bar's value from the tallest bar's value.",
        explanation: `Highest = ${maxVal}, lowest = ${minVal}. Difference $= ${maxVal} - ${minVal} = ${diff}$.`,
      };
    }

    if (branch === "total") {
      const total = data.reduce((a, b) => a + b, 0);
      return {
        kind: "fill-blank",
        prompt: `This bar graph shows ${ctx}. Find the total across all bars.`,
        visual,
        before: "Total =",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up the value of every bar.",
        explanation: `${data.join(" + ")} = ${total}.`,
      };
    }

    if (branch === "compare-two") {
      const idx1 = randInt(rng, 0, size - 1);
      let idx2 = randInt(rng, 0, size - 1);
      while (idx2 === idx1 || data[idx2] === data[idx1]) idx2 = randInt(rng, 0, size - 1);
      const bigger = data[idx1] > data[idx2] ? labels[idx1] : labels[idx2];
      const wrong = [data[idx1] > data[idx2] ? labels[idx2] : labels[idx1], labels[(idx1 + 2) % size], labels[(idx2 + 3) % size]];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, bigger, wrong, 2);
      return {
        kind: "multiple-choice",
        prompt: `This bar graph shows ${ctx}. Between ${labels[idx1]} and ${labels[idx2]}, which has the greater value?`,
        visual,
        choices,
        correctIndex,
        layout: "row",
        hint: `Compare the heights of the ${labels[idx1]} and ${labels[idx2]} bars.`,
        explanation: `${labels[idx1]} = ${data[idx1]}, ${labels[idx2]} = ${data[idx2]}. ${bigger} is greater.`,
      };
    }

    if (branch === "above-average") {
      const total = data.reduce((a, b) => a + b, 0);
      const mean = Math.round((total / data.length) * 10) / 10;
      const items = labels.map((l, i) => ({ id: `${l}${i}`, label: `${l}: ${data[i]}` }));
      const buckets = [
        { id: "above", label: "Above the average" },
        { id: "below", label: "At or below the average" },
      ];
      const correctBucket: Record<string, string> = {};
      labels.forEach((l, i) => (correctBucket[`${l}${i}`] = data[i] > mean ? "above" : "below"));
      return {
        kind: "categorize",
        prompt: `This bar graph shows ${ctx}. The average value is ${mean}. Sort each bar.`,
        visual,
        items,
        buckets,
        correctBucket,
        hint: `Compare each bar's value to the average (${mean}).`,
        explanation: labels.map((l, i) => `${l} (${data[i]}) is ${data[i] > mean ? "above" : "at or below"} the average`).join("; ") + ".",
      };
    }

    if (branch === "match-terms") {
      const pairs = [
        { term: "Bar graph", meaning: "A graph that uses bars of different heights to show quantities" },
        { term: "Scale", meaning: "The value each gridline or unit on a bar graph's axis represents" },
        { term: "Axis", meaning: "The horizontal or vertical line labelled with categories or values" },
        { term: "Highest value", meaning: "Shown by the tallest bar in the graph" },
        { term: "Lowest value", meaning: "Shown by the shortest bar in the graph" },
      ] as const;
      const chosen = shuffle(rng, pairs).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each bar-graph term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the parts of a bar graph you can see and read.",
        explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // order-bars: order the bar values from smallest to largest / largest to smallest
    const ascending = rng() < 0.5;
    const withLabel = labels.map((l, i) => ({ id: l, label: `${l} (${data[i]})`, value: data[i] }));
    const sorted = [...withLabel].sort((a, b) => (ascending ? a.value - b.value : b.value - a.value));
    return {
      kind: "ordering",
      prompt: `This bar graph shows ${ctx}. Arrange the days/categories in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order of their value.`,
      visual,
      instruction: "Drag to arrange in order.",
      items: shuffle(rng, withLabel.map((w) => ({ id: w.id, label: w.label }))),
      correctOrder: sorted.map((w) => w.id),
      hint: "Compare each bar's height against the scale.",
      explanation: `In ${ascending ? "ascending" : "descending"} order: ${sorted.map((w) => w.label).join(", ")}.`,
    };
  },
};
