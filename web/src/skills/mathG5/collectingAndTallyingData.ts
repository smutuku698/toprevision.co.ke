import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { DATA_COLLECTION_TOPICS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

function tallyMarks(count: number): string {
  const groups = Math.floor(count / 5);
  const rem = count % 5;
  const bundle = "||||̸"; // 4 verticals with a diagonal strike, a common tally-of-5 rendering
  return `${Array(groups).fill(bundle).join(" ")} ${"|".repeat(rem)}`.trim();
}

export const collectingAndTallyingData: Skill = {
  id: "g5-math-d-collecting-tallying",
  code: "D.1",
  subjectId: "math",
  strandId: "g5-math-data",
  grade: 5,
  title: "Collecting data and reading tally marks",
  description: "Collect real-life data (around 30 items), and draw and read tally marks representing that data.",
  generate(rng) {
    const branch = randChoice(rng, ["tally-to-count-fill", "count-to-tally-mc", "collect-total-fill", "click-match", "categorize"] as const);

    if (branch === "tally-to-count-fill") {
      const count = randInt(rng, 3, 28);
      const topic = randChoice(rng, DATA_COLLECTION_TOPICS);
      const topicText = topic.topic.replace("{place}", place(rng));
      const value = randChoice(rng, topic.values as readonly (string | number)[]);
      const openers = [
        `A tally count of ${topicText} shows: ${tallyMarks(count)} for ${value}.`,
        `Counting ${topicText}, the tally marks for ${value} are: ${tallyMarks(count)}.`,
        `A survey of ${topicText} recorded these tally marks for ${value}: ${tallyMarks(count)}.`,
      ];
      const closers = [" How many is this in total?", " What is the total count?", " Find the total number shown.", " How many does this tally represent?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "",
        correctAnswer: String(count),
        inputMode: "numeric",
        hint: "Each bundle of 4 verticals with a diagonal strike represents 5 — count the bundles, then add any extra single marks.",
        explanation: `${Math.floor(count / 5)} full bundle${Math.floor(count / 5) === 1 ? "" : "s"} of 5 (${Math.floor(count / 5) * 5}) plus ${count % 5} extra mark${count % 5 === 1 ? "" : "s"} = ${count}.`,
      };
    }

    if (branch === "count-to-tally-mc") {
      const count = randInt(rng, 4, 22);
      const correct = tallyMarks(count);
      const wrongOffByOne = tallyMarks(count + 1);
      const wrongOffByFive = tallyMarks(Math.max(1, count - 5));
      const wrongMisgrouped = tallyMarks(count + 3);
      const candidates = [wrongOffByOne, wrongOffByFive, wrongMisgrouped].filter((v) => v !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, candidates, Math.min(3, candidates.length));
      const topic = randChoice(rng, DATA_COLLECTION_TOPICS);
      const topicText = topic.topic.replace("{place}", place(rng));
      const openers = [
        `A count of ${count} was recorded while collecting data on ${topicText}.`,
        `While surveying ${topicText}, a count of ${count} was noted for one category.`,
        `A tally must be drawn for a count of ${count}, taken from data on ${topicText}.`,
      ];
      const closers = [" Which tally correctly represents this count?", " Which set of tally marks matches this count?", " Choose the correct tally representation.", " Which tally marks show this count correctly?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "list",
        hint: "Group tally marks in bundles of 5 (four verticals with one diagonal strike), then any leftover single marks.",
        explanation: `${count} is shown correctly as ${correct} — ${Math.floor(count / 5)} bundle(s) of 5 plus ${count % 5} single mark(s).`,
      };
    }

    if (branch === "collect-total-fill") {
      const topic = randChoice(rng, DATA_COLLECTION_TOPICS);
      const topicText = topic.topic.replace("{place}", place(rng));
      const counts = topic.values.map(() => randInt(rng, 2, 9));
      const total = counts.reduce((a, b) => a + b, 0);
      const list = topic.values.map((v, i) => `${v}: ${counts[i]}`).join(", ");
      const openers = [
        `Data was collected on ${topicText}, giving these counts — ${list}.`,
        `A survey of ${topicText} produced these category counts: ${list}.`,
        `While collecting data on ${topicText}, these totals were recorded per category: ${list}.`,
      ];
      const closers = [" How many items were collected in total?", " Find the total number of items collected.", " What is the overall total?", " How many were surveyed altogether?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total collected =",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up the counts from every category to find the overall total.",
        explanation: `${counts.join(" + ")} = ${total}.`,
      };
    }

    if (branch === "click-match") {
      const counts = shuffle(rng, [3, 6, 8, 11, 14, 17, 19, 22]).slice(0, 4);
      const tokens = counts.map((c, i) => ({ id: `c${i}`, label: String(c) }));
      const targets = shuffle(rng, counts.map((c, i) => ({ id: `c${i}`, label: tallyMarks(c) })));
      const correctMap: Record<string, string> = {};
      counts.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      const prompts = [
        "Match each number to its tally marks.",
        "Pair each count with its correct tally.",
        "Match each number to how it's shown in tally marks.",
        "Connect each count to its tally representation.",
        "Match each number card to its tally marks.",
        "Pair up each count with its correct tally.",
        "Match each number to its correct tally.",
        "Link each count to its tally mark representation.",
        "Match every number to its correct tally marks.",
        "Connect each count with its tally.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Every 5 is shown as a bundle of 4 verticals with a diagonal strike; the rest are single marks.",
        explanation: counts.map((c) => `${c} = ${tallyMarks(c)}`).join("; ") + ".",
      };
    }

    // categorize: sort tally-mark counts by whether they are exact multiples of 5 (full bundles only).
    const counts6 = Array.from({ length: 6 }, () => randInt(rng, 3, 25));
    const items = counts6.map((c, i) => ({ id: `c${i}`, label: tallyMarks(c) }));
    const buckets = [
      { id: "exact", label: "Exact bundles of 5 (no leftover marks)" },
      { id: "leftover", label: "Has leftover single marks" },
    ];
    const correctBucket: Record<string, string> = {};
    counts6.forEach((c, i) => (correctBucket[`c${i}`] = c % 5 === 0 ? "exact" : "leftover"));
    const catPrompts = [
      "Sort each tally by whether it forms exact bundles of 5.",
      "Group each tally as exact bundles, or with leftover marks.",
      "Classify each tally: no leftover marks, or some leftover marks.",
      "Sort these tallies into 'exact bundles' and 'has leftovers'.",
      "Check each tally for leftover marks, then sort it.",
      "Sort each tally by whether every mark fits into a bundle of 5.",
      "Group these tallies by whether they have single leftover marks.",
      "Classify each tally by whether its count is a multiple of 5.",
      "Sort each tally based on whether it has leftover single marks.",
      "Which tallies are exact bundles of 5? Sort them all.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Count each tally's total, then check whether it divides evenly by 5.",
      explanation: counts6.map((c, i) => `${items[i].label} = ${c} (${c % 5 === 0 ? "exact bundles" : "has leftover marks"})`).join("; ") + ".",
    };
  },
};
