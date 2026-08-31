import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmtDec } from "./mathUtils";
import { CAPACITY_CONTAINER_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// 1 litre = 1000 millilitres. Estimation is framed in multiples of 5 ml per the source's own assessment rubric.

export const millilitresLitresAndConversions: Skill = {
  id: "g5-math-m-capacity-conversions",
  code: "M.5",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Millilitres, litres and conversions",
  description: "Identify the millilitre as a unit of capacity, estimate capacity in multiples of 5 millilitres, and convert between litres and millilitres.",
  generate(rng) {
    const branch = randChoice(rng, ["relationship-mc", "estimate-5ml-mc", "l-to-ml", "ml-to-l", "click-match", "ordering", "categorize"] as const);

    if (branch === "relationship-mc") {
      const prompts = [
        "How many millilitres (ml) make up 1 litre (L)?",
        "What is the number of millilitres in 1 litre?",
        "1 litre is equal to how many millilitres?",
        "Fill in the relationship: 1 L = ___ ml.",
        "How many millilitres does it take to make 1 litre?",
        "A litre is made up of how many millilitres?",
        "To measure small amounts of liquid, we use ml. How many ml equal 1 L?",
        "How many millilitres are there in a single litre?",
        "1 L equals how many millilitres?",
        "What number of millilitres is the same amount as 1 L?",
        "Complete this fact: 1 litre is the same as ___ millilitres.",
        "How many millilitres, poured together, make up 1 litre?",
      ];
      const wrong = ["100", "10", "10,000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "1,000", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "This is the basic relationship between litres and millilitres.",
        explanation: "1 L = 1,000 ml. (100 confuses it with a different unit relationship, and 10,000 overshoots.)",
      };
    }

    if (branch === "estimate-5ml-mc") {
      const container = randChoice(rng, CAPACITY_CONTAINER_CONTEXTS);
      const useCase = container.useCase.replace("{place}", place(rng));
      const correct = randInt(rng, 1, 40) * 5;
      const wrongOff5 = correct + randChoice(rng, [5, -5] as const);
      const wrongOff10 = correct + randChoice(rng, [10, -10] as const);
      const wrongNotMultOf5 = correct + randChoice(rng, [2, 3, -2, -3] as const);
      const candidates = [...new Set([wrongOff5, wrongOff10, wrongNotMultOf5])].filter((v) => v !== correct && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `${correct} ml`, candidates.map((v) => `${v} ml`), Math.min(3, candidates.length));
      const openers = [
        `A learner estimates the capacity of ${container.container}, ${useCase}, to the nearest 5 millilitres.`,
        `Estimating the capacity of ${container.container} (${useCase}) to the nearest 5 ml.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, is measured to the nearest 5 ml.`,
        `A small container — ${container.container}, ${useCase} — needs its capacity estimated to the nearest 5 ml.`,
      ];
      const closers = [" Which is a sensible estimate?", " Which reading fits the nearest-5-ml rule?", " Which estimate is correctly rounded to the nearest 5 ml?", " Choose the best estimate."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "When measuring to the nearest 5 ml, every valid reading must be a multiple of 5.",
        explanation: `${correct} ml is a multiple of 5, matching the nearest-5-ml measuring rule. The other readings are off by a small amount or aren't multiples of 5.`,
      };
    }

    if (branch === "l-to-ml") {
      const container = randChoice(rng, CAPACITY_CONTAINER_CONTEXTS);
      const useCase = container.useCase.replace("{place}", place(rng));
      const l = randInt(rng, 1, 20) + randChoice(rng, [0, 0, 0, 0.5] as const);
      const ml = l * 1000;
      const openers = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, holds ${fmtDec(l)} L.`,
        `A capacity of ${fmtDec(l)} L is recorded for ${container.container}, ${useCase}.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)} (${useCase}) has a capacity of ${fmtDec(l)} L.`,
      ];
      const closers = [" How many millilitres is this?", " Express this capacity in millilitres.", " Convert this capacity to millilitres.", " What is this capacity in ml?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "ml",
        correctAnswer: fmtDec(ml),
        inputMode: "numeric",
        hint: "1 L = 1000 ml, so multiply the number of litres by 1000.",
        explanation: `${fmtDec(l)} L × 1000 = ${fmtDec(ml)} ml.`,
      };
    }

    if (branch === "ml-to-l") {
      const container = randChoice(rng, CAPACITY_CONTAINER_CONTEXTS);
      const useCase = container.useCase.replace("{place}", place(rng));
      const ml = randInt(rng, 1, 20) * 100;
      const l = ml / 1000;
      const openers = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, holds ${fmtDec(ml)} ml.`,
        `A capacity of ${fmtDec(ml)} ml is recorded for ${container.container}, ${useCase}.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)} (${useCase}) has a capacity of ${fmtDec(ml)} ml.`,
      ];
      const closers = [" How many litres is this?", " Express this capacity in litres.", " Convert this capacity to litres.", " What is this capacity in L?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "L",
        correctAnswer: fmtDec(l),
        inputMode: "numeric",
        hint: "1000 ml = 1 L, so divide the number of ml by 1000.",
        explanation: `${fmtDec(ml)} ml ÷ 1000 = ${fmtDec(l)} L.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctLitres(rng, 4);
      const tokens = shuffle(rng, chosen.map((l, i) => ({ id: `l${i}`, label: `${fmtDec(l)} L` })));
      const targets = shuffle(rng, chosen.map((l, i) => ({ id: `l${i}`, label: `${fmtDec(l * 1000)} ml` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`l${i}`] = `l${i}`));
      const prompts = [
        "Match each capacity in litres to its equivalent in millilitres.",
        "Pair each litre value with its equal amount in millilitres.",
        "Match each L amount to the same capacity shown in ml.",
        "Click to match each capacity to its equivalent in millilitres.",
        "Line up each litre value with the matching millilitre value.",
        "Find the equivalent millilitre value for each litre amount.",
        "Match each capacity card to its equal value in millilitres.",
        "Pair up the equivalent capacities — litres with millilitres.",
        "Connect each litre amount to the same capacity in millilitres.",
        "Match every L measurement to its ml equivalent.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the number of litres by 1000 to get millilitres.",
        explanation: chosen.map((l) => `${fmtDec(l)} L = ${fmtDec(l * 1000)} ml`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const raw = pickMixedCapacities(rng, 4);
      const items = raw.map((r, i) => ({ id: `c${i}`, label: r.label }));
      const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].ml - raw[b].ml);
      const prompts = [
        "Arrange these capacities from smallest to largest.",
        "Order these capacities, starting with the smallest.",
        "Put these capacities in order from smallest to largest.",
        "Rank these capacities from smallest to largest.",
        "Sort these capacities into order, smallest first.",
        "Sequence these capacities from smallest to largest.",
        "Line up these capacities from the smallest to the largest.",
        "Place these capacities in order, beginning with the smallest.",
        "Which capacity is smallest? Order them all from there.",
        "Arrange these amounts from smallest to largest.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `c${i}`),
        hint: "Convert every capacity to ml before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${fmtDec(raw[i].ml)} ml)`).join(", ")}.`,
      };
    }

    // categorize
    const threshold = randChoice(rng, [500, 1000, 2000, 5000] as const);
    const chosen = pickDistinctLitres(rng, 6).map((l) => l * 1000);
    const items = chosen.map((ml, i) => ({ id: `c${i}`, label: `${fmtDec(ml)} ml` }));
    const buckets = [
      { id: "under", label: `Less than ${fmtDec(threshold)} ml` },
      { id: "over", label: `${fmtDec(threshold)} ml or more` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((ml, i) => (correctBucket[`c${i}`] = ml < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each capacity by whether it is less than ${fmtDec(threshold)} ml.`,
      `Group each capacity as under ${fmtDec(threshold)} ml, or ${fmtDec(threshold)} ml and above.`,
      `Classify each capacity: below ${fmtDec(threshold)} ml, or ${fmtDec(threshold)} ml and up.`,
      `Sort these capacities into two groups using ${fmtDec(threshold)} ml as the cut-off.`,
      `Organise each capacity by whether it is under ${fmtDec(threshold)} ml.`,
      `Decide whether each capacity is less than ${fmtDec(threshold)} ml, or not.`,
      `Place each capacity in the correct group based on the ${fmtDec(threshold)} ml cut-off.`,
      `Sort these capacities by size, using ${fmtDec(threshold)} ml as the dividing line.`,
      `Which capacities are under ${fmtDec(threshold)} ml? Sort them all.`,
      `Categorise each capacity as under ${fmtDec(threshold)} ml, or ${fmtDec(threshold)} ml or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each capacity directly to the threshold in ml.",
      explanation: chosen.map((ml) => `${fmtDec(ml)} ml is ${ml < threshold ? "less than" : "at least"} ${fmtDec(threshold)} ml`).join("; ") + ".",
    };
  },
};

function pickDistinctLitres(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 1, 15));
  return shuffle(rng, Array.from(seen));
}

function pickMixedCapacities(rng: RNG, count: number): { label: string; ml: number }[] {
  const options: { label: string; ml: number }[] = [];
  const usedMl = new Set<number>();
  while (options.length < count) {
    const unit = randChoice(rng, ["L", "ml"] as const);
    let ml: number;
    let label: string;
    if (unit === "L") {
      const v = randInt(rng, 1, 10);
      ml = v * 1000;
      label = `${v} L`;
    } else {
      const v = randInt(rng, 20, 950) * 5; // multiples of 5, per the sub-strand's own estimation scope
      ml = v;
      label = `${v} ml`;
    }
    if (!usedMl.has(ml)) {
      usedMl.add(ml);
      options.push({ label, ml });
    }
  }
  return options;
}
