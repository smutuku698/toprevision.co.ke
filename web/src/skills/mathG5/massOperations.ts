import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { MASS_OBJECT_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

function formatKgG(kg: number, g: number): string {
  return `${kg} kg ${g} g`;
}
function totalG(kg: number, g: number): number {
  return kg * 1000 + g;
}
function fromTotalG(x: number): { kg: number; g: number } {
  return { kg: Math.floor(x / 1000), g: x % 1000 };
}

export const massOperations: Skill = {
  id: "g5-math-m-mass-operations",
  code: "M.8",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Adding, subtracting, multiplying and dividing masses",
  description: "Add, subtract, multiply and divide masses given in grammes and kilogrammes, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add", "subtract", "multiply", "divide", "reverse-mc", "click-match", "ordering"] as const);
    const obj = randChoice(rng, MASS_OBJECT_CONTEXTS);
    const useCase = obj.useCase.replace("{place}", place(rng));

    if (branch === "add") {
      const kg1 = randInt(rng, 1, 10);
      const g1 = randInt(rng, 0, 999);
      const kg2 = randInt(rng, 1, 10);
      const g2 = randInt(rng, 0, 999);
      const sum = totalG(kg1, g1) + totalG(kg2, g2);
      const openers = [
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)}, ${useCase}, weighs ${formatKgG(kg1, g1)}, and a second one weighs ${formatKgG(kg2, g2)}.`,
        `Two items are weighed: one at ${formatKgG(kg1, g1)} and another at ${formatKgG(kg2, g2)}, both like ${obj.object} (${useCase}).`,
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)} (${useCase}) weighs ${formatKgG(kg1, g1)}; a similar item weighs ${formatKgG(kg2, g2)}.`,
      ];
      const closers = [" What is their combined mass? Give your answer in g.", " Find the total mass, in g.", " What is the combined mass, in g?", " How heavy are both together? Give your answer in g."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "g",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Convert each mass to g first (1 kg = 1000 g), then add.",
        explanation: `${formatKgG(kg1, g1)} = ${totalG(kg1, g1)} g. ${formatKgG(kg2, g2)} = ${totalG(kg2, g2)} g. Total = ${totalG(kg1, g1)} + ${totalG(kg2, g2)} = ${sum} g.`,
      };
    }

    if (branch === "subtract") {
      const kg1 = randInt(rng, 5, 15);
      const g1 = randInt(rng, 0, 999);
      const kg2 = randInt(rng, 1, kg1 - 1);
      const g2 = randInt(rng, 0, 999);
      const t1 = totalG(kg1, g1);
      const t2 = totalG(kg2, g2);
      if (t1 <= t2) return this.generate(rng);
      const diff = t1 - t2;
      const openers = [
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)}, ${useCase}, has a mass of ${formatKgG(kg1, g1)}, and ${formatKgG(kg2, g2)} of it is removed.`,
        `Starting at ${formatKgG(kg1, g1)}, an item like ${obj.object} (${useCase}) loses ${formatKgG(kg2, g2)} of its mass.`,
        `${obj.object[0].toUpperCase()}${obj.object.slice(1)} weighs ${formatKgG(kg1, g1)}; after some is taken away, ${formatKgG(kg2, g2)} is gone.`,
      ];
      const closers = [" What mass remains? Give your answer in g.", " Find the remaining mass, in g.", " What is left, in g?", " How much mass is left? Give your answer in g."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Remaining =",
        after: "g",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Convert both masses to g first, then subtract the smaller from the larger.",
        explanation: `${formatKgG(kg1, g1)} = ${t1} g. ${formatKgG(kg2, g2)} = ${t2} g. Remaining = ${t1} − ${t2} = ${diff} g.`,
      };
    }

    if (branch === "multiply") {
      const kg = randInt(rng, 1, 5);
      const g = randInt(rng, 0, 999);
      const n = randInt(rng, 3, 9);
      const t = totalG(kg, g);
      const product = t * n;
      const openers = [
        `${n} identical items, each like ${obj.object} (${useCase}), weigh ${formatKgG(kg, g)} each.`,
        `Each of ${n} items weighs ${formatKgG(kg, g)}, similar to ${obj.object} (${useCase}).`,
        `A batch of ${n} items, each weighing ${formatKgG(kg, g)}, is delivered — similar to ${obj.object} (${useCase}).`,
      ];
      const closers = [" What is their total mass? Give your answer in g.", " Find the total mass of all of them, in g.", " How much do they weigh altogether? Give your answer in g.", " What is the combined mass, in g?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "g",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Convert one item's mass to g, then multiply by the number of items.",
        explanation: `${formatKgG(kg, g)} = ${t} g. Total = ${t} × ${n} = ${product} g.`,
      };
    }

    if (branch === "divide") {
      const n = randInt(rng, 2, 8);
      const partKg = randInt(rng, 0, 3);
      const partG = randInt(rng, 0, 999);
      const partT = totalG(partKg, partG);
      const totalT = partT * n;
      const total = fromTotalG(totalT);
      const openers = [
        `A total mass of ${formatKgG(total.kg, total.g)}, similar to ${obj.object} (${useCase}), is shared equally among ${n} portions.`,
        `${formatKgG(total.kg, total.g)} of a substance like ${obj.object} (${useCase}) is divided equally into ${n} equal parts.`,
        `A ${formatKgG(total.kg, total.g)} batch, similar to ${obj.object} (${useCase}), is split into ${n} equal shares.`,
      ];
      const closers = [" How much is in each equal share? Give your answer in g.", " Find the mass of each part, in g.", " What does each equal portion weigh, in g?", " How much does each share weigh, in g?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Each part =",
        after: "g",
        correctAnswer: String(partT),
        inputMode: "numeric",
        hint: "Convert the total mass to g first, then divide by the number of equal parts.",
        explanation: `${formatKgG(total.kg, total.g)} = ${totalT} g. Each part = ${totalT} ÷ ${n} = ${partT} g.`,
      };
    }

    if (branch === "reverse-mc") {
      const kg1 = randInt(rng, 5, 12);
      const g1 = randInt(rng, 0, 999);
      const kg2 = randInt(rng, 1, kg1 - 1);
      const g2 = randInt(rng, 0, 999);
      const combined = totalG(kg1, g1);
      const first = totalG(kg2, g2);
      if (combined <= first) return this.generate(rng);
      const other = combined - first;
      const wrong = [String(combined + first), String(Math.abs(first - combined) + 100), String(first)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(other), wrong, 3);
      const prompts = [
        `Two sacks together weigh ${formatKgG(kg1, g1)}, similar to ${obj.object} (${useCase}). One sack weighs ${formatKgG(kg2, g2)}. How much, in g, does the other sack weigh?`,
        `A combined mass of ${formatKgG(kg1, g1)} is split between two items; one weighs ${formatKgG(kg2, g2)}. What is the other item's mass, in g?`,
        `Out of a total of ${formatKgG(kg1, g1)}, one part weighs ${formatKgG(kg2, g2)}. Find the mass of the other part, in g.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices: choices.map((c) => `${c} g`),
        correctIndex,
        layout: "row",
        hint: "Convert the combined mass and the known part to g, then subtract.",
        explanation: `Combined = ${combined} g. First part = ${first} g. Second part = ${combined} − ${first} = ${other} g. (Adding instead of subtracting, or repeating the known part, gives the wrong distractors.)`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctMasses(rng, 4);
      const tokens = shuffle(rng, chosen.map((m, i) => ({ id: `m${i}`, label: formatKgG(m.kg, m.g) })));
      const targets = shuffle(rng, chosen.map((m, i) => ({ id: `m${i}`, label: `${totalG(m.kg, m.g)} g` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
      const prompts = [
        "Match each mass to its equivalent in grammes.",
        "Pair each kg-and-g mass with its total in grammes.",
        "Match each mass to the same mass shown in grammes.",
        "Click to match each mass to its gramme total.",
        "Line up each mass with its equal value in grammes.",
        "Find the matching gramme total for each mass.",
        "Match each mass card to its equal value in grammes.",
        "Pair up the equivalent masses — kg/g with total grammes.",
        "Connect each mass to the same amount in grammes.",
        "Match every mass to its equivalent number of grammes.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the kg part by 1000, then add the g part.",
        explanation: chosen.map((m) => `${formatKgG(m.kg, m.g)} = ${totalG(m.kg, m.g)} g`).join("; ") + ".",
      };
    }

    // ordering
    const chosen = pickDistinctMasses(rng, 4);
    const items = chosen.map((m, i) => ({ id: `m${i}`, label: formatKgG(m.kg, m.g) }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => totalG(chosen[a].kg, chosen[a].g) - totalG(chosen[b].kg, chosen[b].g));
    const prompts = [
      "Arrange these masses from lightest to heaviest.",
      "Order these masses, starting with the lightest.",
      "Put these masses in order from lightest to heaviest.",
      "Rank these masses from lightest to heaviest.",
      "Sort these masses into order, lightest first.",
      "Sequence these masses from lightest to heaviest.",
      "Line up these masses from the lightest to the heaviest.",
      "Place these masses in order, beginning with the lightest.",
      "Which mass is lightest? Order them all from there.",
      "Arrange these weights from lightest to heaviest.",
    ];
    return {
      kind: "ordering",
      prompt: randChoice(rng, prompts),
      instruction: "Click them in order, lightest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `m${i}`),
      hint: "Convert every mass to g before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `${formatKgG(chosen[i].kg, chosen[i].g)} (${totalG(chosen[i].kg, chosen[i].g)} g)`).join(", ")}.`,
    };
  },
};

function pickDistinctMasses(rng: RNG, count: number): { kg: number; g: number }[] {
  const seen = new Set<number>();
  const result: { kg: number; g: number }[] = [];
  while (result.length < count) {
    const kg = randInt(rng, 1, 12);
    const g = randInt(rng, 0, 999);
    const t = totalG(kg, g);
    if (!seen.has(t)) {
      seen.add(t);
      result.push({ kg, g });
    }
  }
  return result;
}
