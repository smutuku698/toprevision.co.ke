import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { CAPACITY_CONTAINER_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

function formatLMl(l: number, ml: number): string {
  return `${l} L ${ml} ml`;
}
function totalMl(l: number, ml: number): number {
  return l * 1000 + ml;
}
function fromTotalMl(x: number): { l: number; ml: number } {
  return { l: Math.floor(x / 1000), ml: x % 1000 };
}

export const capacityOperations: Skill = {
  id: "g5-math-m-capacity-operations",
  code: "M.6",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Adding, subtracting, multiplying and dividing capacities",
  description: "Add, subtract, multiply and divide capacities given in litres and millilitres, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add", "subtract", "multiply", "divide", "reverse-mc", "click-match", "ordering"] as const);
    const container = randChoice(rng, CAPACITY_CONTAINER_CONTEXTS);
    const useCase = container.useCase.replace("{place}", place(rng));

    if (branch === "add") {
      const l1 = randInt(rng, 1, 10);
      const ml1 = randInt(rng, 0, 999);
      const l2 = randInt(rng, 1, 10);
      const ml2 = randInt(rng, 0, 999);
      const sum = totalMl(l1, ml1) + totalMl(l2, ml2);
      const openers = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, is filled with ${formatLMl(l1, ml1)}, then topped up with a further ${formatLMl(l2, ml2)}.`,
        `First ${formatLMl(l1, ml1)} is poured into ${container.container} (${useCase}), then another ${formatLMl(l2, ml2)} is added.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)} receives ${formatLMl(l1, ml1)} and then ${formatLMl(l2, ml2)} more.`,
      ];
      const closers = [" What is the total amount? Give your answer in ml.", " Find the total, in ml.", " What is the combined amount, in ml?", " How much liquid is there in total? Give your answer in ml."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "ml",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Convert each amount to ml first (1 L = 1000 ml), then add.",
        explanation: `${formatLMl(l1, ml1)} = ${totalMl(l1, ml1)} ml. ${formatLMl(l2, ml2)} = ${totalMl(l2, ml2)} ml. Total = ${totalMl(l1, ml1)} + ${totalMl(l2, ml2)} = ${sum} ml.`,
      };
    }

    if (branch === "subtract") {
      const l1 = randInt(rng, 5, 15);
      const ml1 = randInt(rng, 0, 999);
      const l2 = randInt(rng, 1, l1 - 1);
      const ml2 = randInt(rng, 0, 999);
      const t1 = totalMl(l1, ml1);
      const t2 = totalMl(l2, ml2);
      if (t1 <= t2) return this.generate(rng);
      const diff = t1 - t2;
      const openers = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, starts with ${formatLMl(l1, ml1)}, and ${formatLMl(l2, ml2)} is used up.`,
        `Out of ${formatLMl(l1, ml1)} in ${container.container} (${useCase}), ${formatLMl(l2, ml2)} has been poured out.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)} holds ${formatLMl(l1, ml1)}; ${formatLMl(l2, ml2)} is removed.`,
      ];
      const closers = [" How much remains? Give your answer in ml.", " What is left, in ml?", " Find the remaining amount, in ml.", " How much is left over? Give your answer in ml."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Remaining =",
        after: "ml",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Convert both amounts to ml first, then subtract the smaller from the larger.",
        explanation: `${formatLMl(l1, ml1)} = ${t1} ml. ${formatLMl(l2, ml2)} = ${t2} ml. Remaining = ${t1} − ${t2} = ${diff} ml.`,
      };
    }

    if (branch === "multiply") {
      const l = randInt(rng, 1, 5);
      const ml = randInt(rng, 0, 999);
      const n = randInt(rng, 3, 9);
      const t = totalMl(l, ml);
      const product = t * n;
      const openers = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, is filled ${n} times, each time with ${formatLMl(l, ml)}.`,
        `Each of ${n} identical fillings of ${container.container} (${useCase}) uses ${formatLMl(l, ml)}.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)} is refilled ${n} times with ${formatLMl(l, ml)} each time.`,
      ];
      const closers = [" What is the total amount used? Give your answer in ml.", " Find the total used across all fillings, in ml.", " How much liquid has been used altogether? Give your answer in ml.", " What is the combined amount, in ml?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "ml",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Convert one filling's amount to ml, then multiply by the number of fillings.",
        explanation: `${formatLMl(l, ml)} = ${t} ml. Total = ${t} × ${n} = ${product} ml.`,
      };
    }

    if (branch === "divide") {
      const n = randInt(rng, 2, 8);
      const partL = randInt(rng, 0, 3);
      const partMl = randInt(rng, 0, 999);
      const partT = totalMl(partL, partMl);
      const totalT = partT * n;
      const total = fromTotalMl(totalT);
      const openers = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)}, ${useCase}, holds ${formatLMl(total.l, total.ml)}, shared equally into ${n} smaller containers.`,
        `A total of ${formatLMl(total.l, total.ml)} in ${container.container} (${useCase}) is divided equally among ${n} portions.`,
        `${container.container[0].toUpperCase()}${container.container.slice(1)} contains ${formatLMl(total.l, total.ml)}, split into ${n} equal parts.`,
      ];
      const closers = [" How much is in each equal part? Give your answer in ml.", " Find the amount in each part, in ml.", " What does each equal share hold, in ml?", " How much does each portion contain, in ml?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Each part =",
        after: "ml",
        correctAnswer: String(partT),
        inputMode: "numeric",
        hint: "Convert the total to ml first, then divide by the number of equal parts.",
        explanation: `${formatLMl(total.l, total.ml)} = ${totalT} ml. Each part = ${totalT} ÷ ${n} = ${partT} ml.`,
      };
    }

    if (branch === "reverse-mc") {
      const l1 = randInt(rng, 5, 12);
      const ml1 = randInt(rng, 0, 999);
      const l2 = randInt(rng, 1, l1 - 1);
      const ml2 = randInt(rng, 0, 999);
      const combined = totalMl(l1, ml1);
      const first = totalMl(l2, ml2);
      if (combined <= first) return this.generate(rng);
      const other = combined - first;
      const wrong = [String(combined + first), String(Math.abs(first - combined) + 100), String(first)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(other), wrong, 3);
      const prompts = [
        `${container.container[0].toUpperCase()}${container.container.slice(1)} (${useCase}) holds ${formatLMl(l1, ml1)} in total, poured in two parts. The first part is ${formatLMl(l2, ml2)}. How much, in ml, is the second part?`,
        `A total of ${formatLMl(l1, ml1)} in ${container.container} (${useCase}) is split into two parts; the first is ${formatLMl(l2, ml2)}. What is the second part, in ml?`,
        `Out of ${formatLMl(l1, ml1)} in ${container.container}, ${formatLMl(l2, ml2)} was poured first. How much, in ml, was poured second?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices: choices.map((c) => `${c} ml`),
        correctIndex,
        layout: "row",
        hint: "Convert the combined amount and the known part to ml, then subtract.",
        explanation: `Combined = ${combined} ml. First part = ${first} ml. Second part = ${combined} − ${first} = ${other} ml. (Adding instead of subtracting, or repeating the known part, gives the wrong distractors.)`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctCapacities(rng, 4);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `c${i}`, label: formatLMl(c.l, c.ml) })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `c${i}`, label: `${totalMl(c.l, c.ml)} ml` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      const prompts = [
        "Match each capacity to its equivalent in millilitres.",
        "Pair each L-and-ml amount with its total in millilitres.",
        "Match each capacity to the same amount shown in millilitres.",
        "Click to match each capacity to its millilitre total.",
        "Line up each capacity with its equal value in millilitres.",
        "Find the matching millilitre total for each capacity.",
        "Match each capacity card to its equal value in millilitres.",
        "Pair up the equivalent capacities — L/ml with total millilitres.",
        "Connect each capacity to the same amount in millilitres.",
        "Match every capacity to its equivalent number of millilitres.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the litre part by 1000, then add the ml part.",
        explanation: chosen.map((c) => `${formatLMl(c.l, c.ml)} = ${totalMl(c.l, c.ml)} ml`).join("; ") + ".",
      };
    }

    // ordering
    const chosen = pickDistinctCapacities(rng, 4);
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: formatLMl(c.l, c.ml) }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => totalMl(chosen[a].l, chosen[a].ml) - totalMl(chosen[b].l, chosen[b].ml));
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
      explanation: `In order: ${sortedIdx.map((i) => `${formatLMl(chosen[i].l, chosen[i].ml)} (${totalMl(chosen[i].l, chosen[i].ml)} ml)`).join(", ")}.`,
    };
  },
};

function pickDistinctCapacities(rng: RNG, count: number): { l: number; ml: number }[] {
  const seen = new Set<number>();
  const result: { l: number; ml: number }[] = [];
  while (result.length < count) {
    const l = randInt(rng, 1, 12);
    const ml = randInt(rng, 0, 999);
    const t = totalMl(l, ml);
    if (!seen.has(t)) {
      seen.add(t);
      result.push({ l, ml });
    }
  }
  return result;
}
