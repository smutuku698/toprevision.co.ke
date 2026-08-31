import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CONTEXTS = [
  { subject: "the number of customers a shop served each day", unit: "" },
  { subject: "a farm's daily egg collection", unit: "" },
  { subject: "the number of matatus passing a stage each hour", unit: "" },
  { subject: "a class's daily attendance", unit: "" },
  { subject: "the number of loaves a bakery sold each day", unit: "" },
  { subject: "a clinic's number of patients seen each day", unit: "" },
  { subject: "the number of fish caught by a fishing crew each day", unit: "" },
  { subject: "a water vendor's daily jerrycan sales", unit: "" },
  { subject: "the number of parcels a courier delivered each day", unit: "" },
  { subject: "a football team's goals scored each match this season", unit: "" },
];

export const dataHandling: Skill = {
  id: "g7-math-d-data-handling",
  code: "D.1",
  subjectId: "math",
  strandId: "g7-math-data",
  grade: 7,
  title: "Data handling",
  description: "Collect and organize data into a frequency distribution table, choose a suitable scale, and draw and interpret pictographs, bar graphs, pie charts, line graphs, and travel graphs.",
  generate(rng) {
    const branch = randChoice(rng, ["frequency-table", "scale-choice", "bar-interpret", "pie-interpret", "pictograph", "line-travel", "match-terms", "above-below", "table-steps"] as const);
    const ctx = randChoice(rng, CONTEXTS);
    const size = randChoice(rng, [5, 6, 7] as const);
    const data = Array.from({ length: size }, () => randInt(rng, 8, 60));
    const labels = DAY_LABELS.slice(0, size);

    if (branch === "frequency-table") {
      const values = Array.from({ length: 12 }, () => randInt(rng, 1, 5));
      const freq = new Map<number, number>();
      for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
      const target = randInt(rng, 1, 5);
      const answer = freq.get(target) ?? 0;
      return {
        kind: "fill-blank",
        prompt: `This raw data lists the number of siblings each of 12 learners has: ${values.join(", ")}. Using a frequency distribution table, how many learners have exactly ${target} sibling${target === 1 ? "" : "s"}?`,
        before: "Frequency =",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "Count how many times the value appears in the list.",
        explanation: `The value ${target} appears ${answer} time${answer === 1 ? "" : "s"} in the data, so its frequency is ${answer}.`,
      };
    }

    if (branch === "scale-choice") {
      const maxValue = randChoice(rng, [24, 36, 48, 60, 84, 96] as const);
      const gridlines = 12;
      const niceScales = [1, 2, 3, 5, 10];
      const bestScale = niceScales.find((s) => maxValue / s <= gridlines) ?? 10;
      const otherScales = niceScales.filter((s) => s !== bestScale);
      const choices = shuffle(rng, [bestScale, ...otherScales.slice(0, 3)]).map((s) => `${s} unit${s > 1 ? "s" : ""} per square`);
      const correctText = `${bestScale} unit${bestScale > 1 ? "s" : ""} per square`;
      return {
        kind: "multiple-choice",
        prompt: `A graph's axis needs to show values from 0 to ${maxValue}, and the grid has ${gridlines} squares along that axis. Which scale fits best?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: `Divide the maximum value by the number of squares available (${gridlines}), then round up to a sensible scale.`,
        explanation: `${maxValue} ÷ ${gridlines} ≈ ${(maxValue / gridlines).toFixed(1)}, so a scale of ${bestScale} unit${bestScale > 1 ? "s" : ""} per square fits all the values within ${gridlines} squares.`,
      };
    }

    if (branch === "bar-interpret") {
      const maxVal = Math.max(...data);
      const maxIdx = data.indexOf(maxVal);
      const minVal = Math.min(...data);
      const diff = maxVal - minVal;
      const askDiff = rng() < 0.5;
      if (askDiff) {
        const wrong = [String(diff + 1), String(diff + 2), String(Math.max(0, diff - 1)), String(maxVal)];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, String(diff), wrong);
        return {
          kind: "multiple-choice",
          prompt: `This bar graph shows ${ctx.subject}. What is the difference between the highest and lowest values?`,
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
        prompt: `This bar graph shows ${ctx.subject}. Which day/category has the highest value?`,
        visual: { type: "bar-chart", data: labels.map((l, i) => ({ label: l, value: data[i] })) },
        choices,
        correctIndex: choices.indexOf(labels[maxIdx]),
        layout: "row",
        hint: "Find the tallest bar.",
        explanation: `The tallest bar is ${labels[maxIdx]} with a value of ${maxVal}.`,
      };
    }

    if (branch === "pie-interpret") {
      const categories = [
        { label: "Maize", value: randInt(rng, 10, 40) },
        { label: "Beans", value: randInt(rng, 10, 40) },
        { label: "Vegetables", value: randInt(rng, 10, 40) },
        { label: "Fruit trees", value: randInt(rng, 10, 40) },
      ];
      const total = categories.reduce((s, c) => s + c.value, 0);
      const maxCat = categories.reduce((best, c) => (c.value > best.value ? c : best), categories[0]);
      const wrong = shuffle(rng, categories.filter((c) => c !== maxCat)).map((c) => c.label);
      const choices = shuffle(rng, [maxCat.label, ...wrong]);
      return {
        kind: "multiple-choice",
        prompt: `This pie chart shows how a ${total}-acre farm is divided among crops. Which crop takes up the LARGEST share of the farm?`,
        visual: { type: "pie-chart", slices: categories },
        choices,
        correctIndex: choices.indexOf(maxCat.label),
        layout: "list",
        hint: "The largest slice of the pie chart represents the largest share.",
        explanation: `${maxCat.label} occupies ${maxCat.value} out of ${total} acres — the largest slice.`,
      };
    }

    if (branch === "pictograph") {
      const keyValue = randChoice(rng, [5, 10, 20] as const);
      const iconCount = randInt(rng, 3, 8);
      const total = keyValue * iconCount;
      const askTotal = rng() < 0.6;
      if (askTotal) {
        return {
          kind: "fill-blank",
          prompt: `A pictograph shows the number of books donated to a school library, where each book icon represents ${keyValue} books. The pictograph below shows ${iconCount} icons. Find the total number of books donated.`,
          visual: { type: "icon-set", icon: "book", count: iconCount, color: "#0ea5e9" },
          before: "Total books =",
          after: "",
          correctAnswer: String(total),
          inputMode: "numeric",
          hint: "Multiply the number of icons by the value each icon represents.",
          explanation: `${iconCount} icons × ${keyValue} books each = ${total} books.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `A pictograph shows book donations, where each icon represents ${keyValue} books. A total of ${total} books were donated. How many icons should be drawn?`,
        before: "Number of icons =",
        after: "",
        correctAnswer: String(iconCount),
        inputMode: "numeric",
        hint: "Divide the total by the value each icon represents.",
        explanation: `${total} ÷ ${keyValue} = ${iconCount} icons.`,
      };
    }

    if (branch === "line-travel") {
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

    if (branch === "above-below") {
      const total = data.reduce((a, b) => a + b, 0);
      const mean = total / data.length;
      const items = labels.map((l, i) => ({ id: `${l}${i}`, label: `${l}: ${data[i]}` }));
      const buckets = [
        { id: "above", label: "Above the average" },
        { id: "below", label: "At or below the average" },
      ];
      const correctBucket: Record<string, string> = {};
      labels.forEach((l, i) => (correctBucket[`${l}${i}`] = data[i] > mean ? "above" : "below"));
      return {
        kind: "categorize",
        prompt: `This data shows ${ctx.subject}: ${labels.map((l, i) => `${l}=${data[i]}`).join(", ")}. The average is ${mean.toFixed(1)}. Sort each value.`,
        items,
        buckets,
        correctBucket,
        hint: `Compare each value to the average (${mean.toFixed(1)}).`,
        explanation: labels.map((l, i) => `${l} (${data[i]}) is ${data[i] > mean ? "above" : "at or below"} the average`).join("; ") + ".",
      };
    }

    if (branch === "table-steps") {
      const steps = [
        { id: "s1", label: "Collect the raw data" },
        { id: "s2", label: "List every distinct value that appears" },
        { id: "s3", label: "Tally how many times each value occurs" },
        { id: "s4", label: "Write the tally counts as frequencies in the table" },
      ];
      return {
        kind: "ordering",
        prompt: "Put these steps for building a frequency distribution table from raw data in the correct order.",
        instruction: "Click the steps in order.",
        items: shuffle(rng, steps),
        correctOrder: steps.map((s) => s.id),
        hint: "You must have the raw data and know the distinct values before you can tally them.",
        explanation: "Steps: (1) collect the raw data, (2) list distinct values, (3) tally occurrences, (4) record as frequencies.",
      };
    }

    // match-terms: match a data-handling term to its meaning
    const pairs = [
      { term: "Frequency", meaning: "How many times a value appears in the data" },
      { term: "Scale", meaning: "The value each square or unit on a graph's axis represents" },
      { term: "Pictograph", meaning: "A graph that uses repeated icons/pictures to show quantities" },
      { term: "Pie chart", meaning: "A circular graph that divides data into proportional slices" },
      { term: "Travel graph", meaning: "A line graph showing distance travelled against time" },
    ];
    const chosen = shuffle(rng, pairs).slice(0, 4);
    const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
    const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
    return {
      kind: "click-match",
      prompt: "Match each data-handling term to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Think about what each type of chart or table is used for.",
      explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
    };
  },
};
