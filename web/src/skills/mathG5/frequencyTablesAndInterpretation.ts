import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { DATA_COLLECTION_TOPICS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

function genFrequencyTable(rng: import("@/lib/rng").RNG, topic: (typeof DATA_COLLECTION_TOPICS)[number]) {
  const categories = topic.values.map((v) => ({ label: String(v), count: randInt(rng, 2, 12) }));
  return categories;
}

export const frequencyTablesAndInterpretation: Skill = {
  id: "g5-math-d-frequency-interpretation",
  code: "D.2",
  subjectId: "math",
  strandId: "g5-math-data",
  grade: 5,
  title: "Preparing and interpreting frequency tables",
  description: "Prepare a frequency table from collected data, and interpret data shown in a frequency table.",
  generate(rng) {
    const branch = randChoice(rng, ["highest-mc", "difference-fill", "total-fill", "click-match", "ordering", "categorize"] as const);
    const topic = randChoice(rng, DATA_COLLECTION_TOPICS);
    const topicText = topic.topic.replace("{place}", place(rng));
    const table = genFrequencyTable(rng, topic);
    const tableStr = table.map((c) => `${c.label}: ${c.count}`).join(", ");

    if (branch === "highest-mc") {
      const maxCount = Math.max(...table.map((c) => c.count));
      const correct = table.find((c) => c.count === maxCount)!.label;
      const others = table.filter((c) => c.label !== correct).map((c) => c.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, Math.min(3, others.length));
      const openers = [
        `A frequency table for ${topicText} shows: ${tableStr}.`,
        `Data collected on ${topicText} was organised into this frequency table: ${tableStr}.`,
        `This frequency table records ${topicText}: ${tableStr}.`,
      ];
      const closers = [" Which category has the highest frequency?", " Which category appears most often?", " Find the category with the highest count.", " Which category has the largest frequency?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "list",
        hint: "Compare every frequency in the table and find the largest one.",
        explanation: `${correct} has the highest frequency (${maxCount}), compared to the other categories in the table.`,
      };
    }

    if (branch === "difference-fill") {
      const sorted = [...table].sort((a, b) => b.count - a.count);
      const top = sorted[0];
      const other = sorted[randInt(rng, 1, sorted.length - 1)];
      const diff = top.count - other.count;
      const openers = [
        `A frequency table for ${topicText} shows: ${tableStr}.`,
        `Data collected on ${topicText} was organised into this frequency table: ${tableStr}.`,
        `This frequency table records ${topicText}: ${tableStr}.`,
      ];
      const closers = [` How many more does "${top.label}" have than "${other.label}"?`, ` Find the difference between "${top.label}" and "${other.label}".`, ` What is the gap between "${top.label}" and "${other.label}"?`];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Difference =",
        after: "",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Subtract the smaller frequency from the larger one.",
        explanation: `${top.label} (${top.count}) − ${other.label} (${other.count}) = ${diff}.`,
      };
    }

    if (branch === "total-fill") {
      const total = table.reduce((a, c) => a + c.count, 0);
      const openers = [
        `A frequency table for ${topicText} shows: ${tableStr}.`,
        `Data collected on ${topicText} was organised into this frequency table: ${tableStr}.`,
        `This frequency table records ${topicText}: ${tableStr}.`,
      ];
      const closers = [" What is the total number of items recorded?", " Find the total across all categories.", " How many items were recorded in total?", " What is the grand total?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up every frequency in the table.",
        explanation: `${table.map((c) => c.count).join(" + ")} = ${total}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = table.map((c, i) => ({ id: `c${i}`, label: c.label }));
      const targets = shuffle(rng, table.map((c, i) => ({ id: `c${i}`, label: String(c.count) })));
      const correctMap: Record<string, string> = {};
      table.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      const prompts = [
        "Match each category to its frequency.",
        "Pair each category with its correct count.",
        "Match each category to its count in the table.",
        "Connect each category to its frequency.",
        "Match each category card to its frequency.",
        "Pair up each category with its correct frequency.",
        "Match every category to its correct count.",
        "Link each category to its frequency in the table.",
        "Match each category to how many were recorded.",
        "Connect each category with its frequency.",
      ];
      const openers = [`A frequency table for ${topicText} needs its categories matched to their counts.`, `Here is data on ${topicText} to match up.`, `Match this frequency data for ${topicText}.`];
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, openers)} ${randChoice(rng, prompts)}`,
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Each category has exactly one frequency — match them up carefully.",
        explanation: table.map((c) => `${c.label}: ${c.count}`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const sortedIdx = table.map((_, i) => i).sort((a, b) => table[a].count - table[b].count);
      const items = table.map((c, i) => ({ id: `c${i}`, label: c.label }));
      const openers = [`A frequency table for ${topicText} shows: ${tableStr}.`, `Data on ${topicText} was recorded as: ${tableStr}.`, `This frequency table shows ${topicText}: ${tableStr}.`];
      const closers = [" Order the categories from lowest to highest frequency.", " Arrange the categories by frequency, smallest first.", " Sort the categories from least to most frequent."];
      return {
        kind: "ordering",
        prompt: composePrompt(rng, openers, closers),
        instruction: "Click them in order, lowest frequency first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `c${i}`),
        hint: "Compare the frequency of each category before ordering.",
        explanation: `From lowest to highest: ${sortedIdx.map((i) => `${table[i].label} (${table[i].count})`).join(", ")}.`,
      };
    }

    // categorize: sort categories by whether they are above or below a threshold frequency.
    const threshold = Math.round(table.reduce((a, c) => a + c.count, 0) / table.length);
    const items = table.map((c, i) => ({ id: `c${i}`, label: `${c.label} (${c.count})` }));
    const buckets = [
      { id: "below", label: `Below ${threshold}` },
      { id: "at-above", label: `${threshold} or above` },
    ];
    const correctBucket: Record<string, string> = {};
    table.forEach((c, i) => (correctBucket[`c${i}`] = c.count < threshold ? "below" : "at-above"));
    const catOpeners = [`A frequency table for ${topicText} shows: ${tableStr}.`, `This frequency table records ${topicText}: ${tableStr}.`];
    const catClosers = [` Sort each category by whether its frequency is below ${threshold}.`, ` Group each category as below ${threshold}, or ${threshold} and above.`, ` Classify each category using ${threshold} as the cut-off.`];
    return {
      kind: "categorize",
      prompt: `${randChoice(rng, catOpeners)}${randChoice(rng, catClosers)}`,
      items,
      buckets,
      correctBucket,
      hint: "Compare each category's frequency directly to the threshold.",
      explanation: table.map((c) => `${c.label} (${c.count}) is ${c.count < threshold ? "below" : "at or above"} ${threshold}`).join("; ") + ".",
    };
  },
};
