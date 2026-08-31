import { randChoice, randInt, shuffle } from "@/lib/rng";
import { formatFraction, simplifyFraction } from "./mathUtils";
import type { Skill } from "@/lib/types";

const COLORS = ["red", "blue", "green", "yellow"] as const;

function makeBag(rng: import("@/lib/rng").RNG) {
  const colorCount = randChoice(rng, [2, 3, 4] as const);
  const chosenColors = shuffle(rng, [...COLORS]).slice(0, colorCount);
  const counts = chosenColors.map(() => randInt(rng, 3, 16));
  const total = counts.reduce((a, b) => a + b, 0);
  const targetIdx = randInt(rng, 0, colorCount - 1);
  return { chosenColors, counts, total, targetIdx };
}

const CERTAIN_EVENTS = ["The sun will rise tomorrow", "A dropped stone will fall downward", "December will come after November", "A newborn calf will eventually grow older"];
const IMPOSSIBLE_EVENTS = ["Rolling a 7 on a standard die", "A chicken hatching from a fish egg", "Ice staying frozen in boiling water", "Drawing a green ball from a bag with only red balls"];
const CHANCE_EVENTS = ["It will rain in Nairobi tomorrow", "A tossed coin lands on heads", "A matatu arrives within 5 minutes", "A student picked at random is left-handed"];

export const probability: Skill = {
  id: "g8-math-d-probability",
  code: "D.2",
  subjectId: "math",
  strandId: "g8-math-data-probability",
  grade: 8,
  title: "Probability",
  description: "Identify chance events, perform simple chance experiments, and express experimental probability as a fraction, decimal, or percentage.",
  generate(rng) {
    const branch = randChoice(rng, ["prob-fraction", "prob-decimal-percent", "likelihood-word", "event-classify", "order-likelihood"] as const);

    if (branch === "prob-fraction") {
      const { chosenColors, counts, total, targetIdx } = makeBag(rng);
      const favorable = counts[targetIdx];
      const [n, d] = simplifyFraction(favorable, total);
      const answer = formatFraction(favorable, total);
      const description = chosenColors.map((c, i) => `${counts[i]} ${c}`).join(", ");
      return {
        kind: "fill-blank",
        prompt: `A bag contains ${description} balls (${total} in total). One ball is picked at random. What is the probability it is ${chosenColors[targetIdx]}?`,
        visual: { type: "fraction-bar", numerator: favorable, denominator: total },
        before: "P =",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [`${n}/${d}`, `${favorable}/${total}`],
        inputMode: "text",
        hint: "Probability = number of favorable outcomes ÷ total number of outcomes.",
        explanation: `P(${chosenColors[targetIdx]}) $= \\frac{${favorable}}{${total}}$, which simplifies to $\\frac{${n}}{${d}}$.`,
      };
    }

    if (branch === "prob-decimal-percent") {
      const { chosenColors, counts, total, targetIdx } = makeBag(rng);
      const favorable = counts[targetIdx];
      const asPercent = rng() < 0.5;
      const description = chosenColors.map((c, i) => `${counts[i]} ${c}`).join(", ");
      const decimal = favorable / total;
      const answer = asPercent ? (decimal * 100).toFixed(1).replace(/\.0$/, "") : decimal.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
      return {
        kind: "fill-blank",
        prompt: `A bag contains ${description} balls (${total} in total). One ball is picked at random. Express the probability of picking ${chosenColors[targetIdx]} as a ${asPercent ? "percentage" : "decimal"}.`,
        visual: { type: "fraction-bar", numerator: favorable, denominator: total },
        before: "P =",
        after: asPercent ? "%" : "",
        correctAnswer: answer,
        inputMode: "text",
        hint: asPercent ? "Divide favorable by total, then multiply by 100." : "Divide the number of favorable outcomes by the total.",
        explanation: `P(${chosenColors[targetIdx]}) $= ${favorable} \\div ${total} = ${decimal.toFixed(3)}$${asPercent ? ` = ${(decimal * 100).toFixed(1)}\\%` : ""}.`,
      };
    }

    if (branch === "likelihood-word") {
      const scenarios = [
        { label: "Rolling a number less than 7 on a standard die", word: "Certain" },
        { label: "Rolling a 6 on a standard die", word: "Unlikely" },
        { label: "Tossing a fair coin and it landing on heads", word: "Even chance" },
        { label: "Picking a red ball from a bag of only blue balls", word: "Impossible" },
        { label: "A student in Form 2 being taller than a Grade 1 pupil", word: "Likely" },
      ];
      const s = randChoice(rng, scenarios);
      const words = ["Impossible", "Unlikely", "Even chance", "Likely", "Certain"];
      const choices = shuffle(rng, words);
      return {
        kind: "multiple-choice",
        prompt: `How likely is this event: "${s.label}"?`,
        choices,
        correctIndex: choices.indexOf(s.word),
        layout: "row",
        hint: "Think about how often this would really happen: never, rarely, half the time, often, or always.",
        explanation: `"${s.label}" is ${s.word.toLowerCase()}.`,
      };
    }

    if (branch === "event-classify") {
      const chosenCertain = shuffle(rng, CERTAIN_EVENTS).slice(0, 2);
      const chosenImpossible = shuffle(rng, IMPOSSIBLE_EVENTS).slice(0, 2);
      const chosenChance = shuffle(rng, CHANCE_EVENTS).slice(0, 2);
      const items = shuffle(rng, [...chosenCertain, ...chosenImpossible, ...chosenChance]).map((label, i) => ({ id: `e${i}-${label}`, label }));
      const buckets = [
        { id: "certain", label: "Certain" },
        { id: "impossible", label: "Impossible" },
        { id: "chance", label: "Involves chance" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const item of items) {
        if (chosenCertain.includes(item.label)) correctBucket[item.id] = "certain";
        else if (chosenImpossible.includes(item.label)) correctBucket[item.id] = "impossible";
        else correctBucket[item.id] = "chance";
      }
      return {
        kind: "categorize",
        prompt: "Sort each event by whether it is certain, impossible, or involves chance.",
        items,
        buckets,
        correctBucket,
        hint: "Certain events always happen; impossible events never happen; chance events might or might not happen.",
        explanation: `Certain: ${chosenCertain.join("; ")}. Impossible: ${chosenImpossible.join("; ")}. Involves chance: ${chosenChance.join("; ")}.`,
      };
    }

    // order-likelihood
    const events = [
      { label: "Drawing a red ball from a bag of 1 red and 9 blue balls", p: 0.1 },
      { label: "Rolling an even number on a standard die", p: 0.5 },
      { label: "Drawing a red ball from a bag of 8 red and 2 blue balls", p: 0.8 },
      { label: "Rolling a 6 on a standard die", p: 1 / 6 },
      { label: "Tossing a coin and it landing on heads", p: 0.5 },
    ];
    const chosen = shuffle(rng, events).slice(0, 4);
    const items = chosen.map((e, i) => ({ id: `ev${i}`, label: e.label }));
    const sorted = [...chosen].sort((a, b) => a.p - b.p);
    return {
      kind: "ordering",
      prompt: "Order these events from least likely to most likely.",
      instruction: "Click them in order, least likely first.",
      items: shuffle(rng, items),
      correctOrder: sorted.map((e) => `ev${chosen.indexOf(e)}`),
      hint: "Work out (or estimate) the probability of each event, then compare.",
      explanation: sorted.map((e) => `${e.label} (P ≈ ${e.p.toFixed(2)})`).join("; ") + ".",
    };
  },
};
