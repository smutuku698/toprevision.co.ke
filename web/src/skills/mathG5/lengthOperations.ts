import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { LENGTH_JOURNEY_CONTEXTS, fillLengthContext } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// 1 km = 1000 m. Lengths are written "X km Y m" and answers are given in m.

function formatKmM(km: number, m: number): string {
  return `${km} km ${m} m`;
}
function totalM(km: number, m: number): number {
  return km * 1000 + m;
}
function fromTotalM(x: number): { km: number; m: number } {
  return { km: Math.floor(x / 1000), m: x % 1000 };
}

export const lengthOperations: Skill = {
  id: "g5-math-m-length-operations",
  code: "M.2",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Adding, subtracting, multiplying and dividing lengths",
  description: "Add, subtract, multiply and divide lengths given in kilometres and metres, in real-life Kenyan situations.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "add-lengths",
        "subtract-lengths",
        "multiply-lengths",
        "divide-lengths",
        "classical-mixed",
        "reverse-mc",
        "click-match",
        "ordering",
        "categorize",
      ] as const
    );

    if (branch === "add-lengths") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const km1 = randInt(rng, 1, 20);
      const m1 = randInt(rng, 0, 999);
      const km2 = randInt(rng, 1, 20);
      const m2 = randInt(rng, 0, 999);
      const sum = totalM(km1, m1) + totalM(km2, m2);
      const openers = [
        `${subject} travels from ${from} to a midpoint, a distance of ${formatKmM(km1, m1)}, then continues on to ${to}, another ${formatKmM(km2, m2)}.`,
        `On the way from ${from} to ${to}, ${subject} first covers ${formatKmM(km1, m1)}, then covers a further ${formatKmM(km2, m2)}.`,
        `${subject} splits the journey from ${from} to ${to} into two legs: ${formatKmM(km1, m1)} and ${formatKmM(km2, m2)}.`,
        `The first leg of ${subject}'s trip from ${from} to ${to} is ${formatKmM(km1, m1)}, and the second leg is ${formatKmM(km2, m2)}.`,
        `${subject} travels ${formatKmM(km1, m1)} then a further ${formatKmM(km2, m2)} on the way from ${from} to ${to}.`,
      ];
      const closers = [
        "What is the total distance travelled? Give your answer in m.",
        "Find the total distance covered, in m.",
        "What is the combined distance, in m?",
        "How far has this journey covered in total? Give your answer in m.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "m",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Convert each length to m first (1 km = 1000 m), then add.",
        explanation: `${formatKmM(km1, m1)} = ${totalM(km1, m1)} m. ${formatKmM(km2, m2)} = ${totalM(km2, m2)} m. Total = ${totalM(km1, m1)} + ${totalM(km2, m2)} = ${sum} m.`,
      };
    }

    if (branch === "subtract-lengths") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const km1 = randInt(rng, 10, 40);
      const m1 = randInt(rng, 0, 999);
      const km2 = randInt(rng, 1, km1 - 2);
      const m2 = randInt(rng, 0, 999);
      const t1 = totalM(km1, m1);
      const t2 = totalM(km2, m2);
      const diff = t1 - t2;
      const openers = [
        `${subject} plans a journey from ${from} to ${to} of ${formatKmM(km1, m1)}, but has already covered ${formatKmM(km2, m2)}.`,
        `Out of a planned ${formatKmM(km1, m1)} trip from ${from} to ${to}, ${subject} has already travelled ${formatKmM(km2, m2)}.`,
        `${subject}'s route from ${from} to ${to} measures ${formatKmM(km1, m1)} in total; ${formatKmM(km2, m2)} has been covered so far.`,
        `${subject} needs to travel ${formatKmM(km1, m1)} from ${from} to ${to}, and has already gone ${formatKmM(km2, m2)}.`,
        `A ${formatKmM(km1, m1)} journey from ${from} to ${to} is underway; ${subject} has covered ${formatKmM(km2, m2)} of it so far.`,
      ];
      const closers = [
        "How much further remains? Give your answer in m.",
        "What distance is left to travel, in m?",
        "Find the remaining distance, in m.",
        "How far is left of the journey? Give your answer in m.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Remaining distance =",
        after: "m",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Convert each length to m first, then subtract the smaller from the larger.",
        explanation: `${formatKmM(km1, m1)} = ${t1} m. ${formatKmM(km2, m2)} = ${t2} m. Remaining = ${t1} - ${t2} = ${diff} m.`,
      };
    }

    if (branch === "multiply-lengths") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const km = randInt(rng, 1, 10);
      const m = randInt(rng, 0, 999);
      const n = randInt(rng, 3, 9);
      const t = totalM(km, m);
      const product = t * n;
      const openers = [
        `${subject} makes ${n} identical trips between ${from} and ${to}, each one ${formatKmM(km, m)} long.`,
        `Each of ${subject}'s ${n} trips from ${from} to ${to} covers ${formatKmM(km, m)}.`,
        `${subject} repeats a ${formatKmM(km, m)} trip from ${from} to ${to} a total of ${n} times.`,
        `Travelling from ${from} to ${to} and back is repeated ${n} times by ${subject}, each leg ${formatKmM(km, m)}.`,
        `${subject} completes ${n} equal journeys, each ${formatKmM(km, m)}, between ${from} and ${to}.`,
      ];
      const closers = [
        "What is the total distance travelled? Give your answer in m.",
        "Find the total distance covered across all the trips, in m.",
        "How far has been travelled altogether? Give your answer in m.",
        "What is the combined distance of all the trips, in m?",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "m",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Convert one trip's length to m, then multiply by the number of trips.",
        explanation: `${formatKmM(km, m)} = ${t} m. Total = ${t} × ${n} = ${product} m.`,
      };
    }

    if (branch === "divide-lengths") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const n = randInt(rng, 2, 8);
      const legKm = randInt(rng, 1, 8);
      const legM = randInt(rng, 0, 999);
      const legT = totalM(legKm, legM);
      const totalT = legT * n;
      const total = fromTotalM(totalT);
      const openers = [
        `${subject} splits the ${formatKmM(total.km, total.m)} route from ${from} to ${to} into ${n} equal legs.`,
        `A ${formatKmM(total.km, total.m)} journey from ${from} to ${to} is divided into ${n} equal stages by ${subject}.`,
        `${subject} covers the ${formatKmM(total.km, total.m)} distance from ${from} to ${to} in ${n} equal parts.`,
        `The ${formatKmM(total.km, total.m)} trip from ${from} to ${to} is shared out into ${n} equal sections for ${subject}.`,
        `${subject} plans ${n} equal-length rest stops along the ${formatKmM(total.km, total.m)} route from ${from} to ${to}.`,
      ];
      const closers = [
        "How long is each equal leg? Give your answer in m.",
        "Find the length of each equal section, in m.",
        "What distance is covered in each equal stage? Give your answer in m.",
        "How far is each equal part of the journey, in m?",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Each leg =",
        after: "m",
        correctAnswer: String(legT),
        inputMode: "numeric",
        hint: "Convert the total length to m first, then divide by the number of equal parts.",
        explanation: `${formatKmM(total.km, total.m)} = ${totalT} m. Each leg = ${totalT} ÷ ${n} = ${legT} m.`,
      };
    }

    if (branch === "classical-mixed") {
      const op = randChoice(rng, ["add", "subtract", "multiply", "divide"] as const);
      const prompts = {
        add: [
          "Work out: {a} + {b}. Give your answer in m.",
          "Add these two lengths: {a} and {b}. Give your answer in m.",
          "Find the sum of {a} and {b}, in m.",
          "What is {a} plus {b}? Give your answer in m.",
          "Combine {a} and {b}. Give your answer in m.",
          "{a} + {b} = ? Give your answer in m.",
          "Total {a} and {b}. Give your answer in m.",
          "What do you get when you add {a} to {b}? Give your answer in m.",
          "Calculate {a} + {b} in m.",
          "Add {a} and {b} together, giving your answer in m.",
        ],
        subtract: [
          "Work out: {a} − {b}. Give your answer in m.",
          "Subtract {b} from {a}. Give your answer in m.",
          "Find the difference between {a} and {b}, in m.",
          "What is {a} minus {b}? Give your answer in m.",
          "Take {b} away from {a}. Give your answer in m.",
          "{a} − {b} = ? Give your answer in m.",
          "How much less than {a} is {b}? Give your answer in m.",
          "Calculate {a} − {b} in m.",
          "What remains when {b} is subtracted from {a}? Give your answer in m.",
          "Find {a} minus {b}, in m.",
        ],
        multiply: [
          "Work out: {a} × {n}. Give your answer in m.",
          "Multiply {a} by {n}. Give your answer in m.",
          "What is {a} times {n}? Give your answer in m.",
          "Find the product of {a} and {n}, in m.",
          "{a} × {n} = ? Give your answer in m.",
          "Calculate {a} multiplied by {n}, in m.",
          "What do you get when {a} is multiplied by {n}? Give your answer in m.",
          "Work out {n} lots of {a}, in m.",
          "Find {a} × {n} in m.",
          "Multiply {a} by {n}, giving your answer in m.",
        ],
        divide: [
          "Work out: {a} ÷ {n}. Give your answer in m.",
          "Divide {a} by {n}. Give your answer in m.",
          "What is {a} shared equally {n} ways? Give your answer in m.",
          "Find {a} divided by {n}, in m.",
          "{a} ÷ {n} = ? Give your answer in m.",
          "Calculate {a} divided by {n}, in m.",
          "Share {a} equally into {n} parts. Give your answer in m.",
          "What is one part when {a} is split {n} ways? Give your answer in m.",
          "Find the quotient of {a} and {n}, in m.",
          "Divide {a} into {n} equal parts. Give your answer in m.",
        ],
      };
      if (op === "add") {
        const km1 = randInt(rng, 2, 30);
        const m1 = randInt(rng, 0, 999);
        const km2 = randInt(rng, 2, 30);
        const m2 = randInt(rng, 0, 999);
        const sum = totalM(km1, m1) + totalM(km2, m2);
        const a = formatKmM(km1, m1);
        const b = formatKmM(km2, m2);
        return {
          kind: "fill-blank",
          prompt: randChoice(rng, prompts.add).replace("{a}", a).replace("{b}", b),
          before: "",
          after: "m",
          correctAnswer: String(sum),
          inputMode: "numeric",
          hint: "Convert both lengths to m, then add.",
          explanation: `${a} = ${totalM(km1, m1)} m, ${b} = ${totalM(km2, m2)} m. Sum = ${sum} m.`,
        };
      }
      if (op === "subtract") {
        const km1 = randInt(rng, 10, 40);
        const m1 = randInt(rng, 0, 999);
        const km2 = randInt(rng, 1, km1 - 2);
        const m2 = randInt(rng, 0, 999);
        const diff = totalM(km1, m1) - totalM(km2, m2);
        const a = formatKmM(km1, m1);
        const b = formatKmM(km2, m2);
        return {
          kind: "fill-blank",
          prompt: randChoice(rng, prompts.subtract).replace("{a}", a).replace("{b}", b),
          before: "",
          after: "m",
          correctAnswer: String(diff),
          inputMode: "numeric",
          hint: "Convert both lengths to m, then subtract.",
          explanation: `${a} = ${totalM(km1, m1)} m, ${b} = ${totalM(km2, m2)} m. Difference = ${diff} m.`,
        };
      }
      if (op === "multiply") {
        const km = randInt(rng, 1, 8);
        const m = randInt(rng, 0, 999);
        const n = randInt(rng, 2, 9);
        const product = totalM(km, m) * n;
        const a = formatKmM(km, m);
        return {
          kind: "fill-blank",
          prompt: randChoice(rng, prompts.multiply).replace("{a}", a).replace(/\{n\}/g, String(n)),
          before: "",
          after: "m",
          correctAnswer: String(product),
          inputMode: "numeric",
          hint: "Convert to m first, then multiply.",
          explanation: `${a} = ${totalM(km, m)} m. ${totalM(km, m)} × ${n} = ${product} m.`,
        };
      }
      const n = randInt(rng, 2, 9);
      const legKm = randInt(rng, 1, 7);
      const legM = randInt(rng, 0, 999);
      const legT = totalM(legKm, legM);
      const total = fromTotalM(legT * n);
      const a = formatKmM(total.km, total.m);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, prompts.divide).replace("{a}", a).replace(/\{n\}/g, String(n)),
        before: "",
        after: "m",
        correctAnswer: String(legT),
        inputMode: "numeric",
        hint: "Convert to m first, then divide.",
        explanation: `${a} = ${legT * n} m. ${legT * n} ÷ ${n} = ${legT} m.`,
      };
    }

    if (branch === "reverse-mc") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const km1 = randInt(rng, 10, 30);
      const m1 = randInt(rng, 0, 999);
      const km2 = randInt(rng, 1, km1 - 2);
      const m2 = randInt(rng, 0, 999);
      const combined = totalM(km1, m1);
      const first = totalM(km2, m2);
      const other = combined - first;
      const wrong = [String(combined + first), String(Math.abs(first - combined) + 100), String(first)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(other), wrong, 3);
      const prompts = [
        `${subject}'s ${formatKmM(km1, m1)} route from ${from} to ${to} is split into two unequal legs. The first leg is ${formatKmM(km2, m2)}. How long, in m, is the second leg?`,
        `A combined ${formatKmM(km1, m1)} trip from ${from} to ${to} taken by ${subject} is split into two parts; the first part is ${formatKmM(km2, m2)}. What is the second part, in m?`,
        `Out of a total ${formatKmM(km1, m1)} journey from ${from} to ${to}, ${subject} covers ${formatKmM(km2, m2)} on the first leg. How far, in m, is the remaining leg?`,
        `${subject} divides a ${formatKmM(km1, m1)} route from ${from} to ${to} into two legs; one leg measures ${formatKmM(km2, m2)}. Find the other leg's length in m.`,
        `The ${formatKmM(km1, m1)} distance from ${from} to ${to} is split by ${subject} into two parts, one being ${formatKmM(km2, m2)}. What is the other part in m?`,
        `${subject} travels ${formatKmM(km1, m1)} in total from ${from} to ${to}, in two legs. The first is ${formatKmM(km2, m2)}. What is the second leg's length, in m?`,
        `Given a total of ${formatKmM(km1, m1)} from ${from} to ${to} split into two legs by ${subject}, and one leg is ${formatKmM(km2, m2)}, find the other leg in m.`,
        `${subject}'s journey of ${formatKmM(km1, m1)} between ${from} and ${to} has two legs. If one leg is ${formatKmM(km2, m2)}, what is the other leg in m?`,
        `A ${formatKmM(km1, m1)} trip between ${from} and ${to} is broken into two legs by ${subject}. One leg is ${formatKmM(km2, m2)}; find the other, in m.`,
        `${subject} covers ${formatKmM(km1, m1)} between ${from} and ${to} in two stages. The first stage is ${formatKmM(km2, m2)}. What is the second stage, in m?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices: choices.map((c) => `${c} m`),
        correctIndex,
        layout: "row",
        hint: "Convert the combined distance and the known leg to m, then subtract.",
        explanation: `Combined = ${combined} m. First leg = ${first} m. Second leg = ${combined} − ${first} = ${other} m. (Adding instead of subtracting, or repeating the known leg, gives the wrong distractors.)`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctLengths(rng, 4);
      const tokens = shuffle(rng, chosen.map((l, i) => ({ id: `l${i}`, label: formatKmM(l.km, l.m) })));
      const targets = shuffle(rng, chosen.map((l, i) => ({ id: `l${i}`, label: `${totalM(l.km, l.m)} m` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`l${i}`] = `l${i}`));
      const prompts = [
        "Match each length to its equivalent in metres.",
        "Pair each km-and-m length with its total in metres.",
        "Match each distance to the same distance shown in metres.",
        "Click to match each length to its metre total.",
        "Line up each length with its equal value in metres.",
        "Find the matching metre total for each length.",
        "Match each length card to its equal value in metres.",
        "Pair up the equivalent lengths — km/m with total metres.",
        "Connect each length to the same distance in metres.",
        "Match every length to its equivalent number of metres.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the km part by 1000, then add the m part.",
        explanation: chosen.map((l) => `${formatKmM(l.km, l.m)} = ${totalM(l.km, l.m)} m`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const chosen = pickDistinctLengths(rng, 4);
      const items = chosen.map((l, i) => ({ id: `l${i}`, label: formatKmM(l.km, l.m) }));
      const sortedIdx = chosen.map((_, i) => i).sort((a, b) => totalM(chosen[a].km, chosen[a].m) - totalM(chosen[b].km, chosen[b].m));
      const prompts = [
        "Arrange these lengths from shortest to longest.",
        "Order these lengths, starting with the shortest.",
        "Put these lengths in order from shortest to longest.",
        "Rank these lengths from shortest to longest.",
        "Sort these lengths into order, shortest first.",
        "Sequence these lengths from shortest to longest.",
        "Line up these lengths from the shortest to the longest.",
        "Place these lengths in order, beginning with the shortest.",
        "Which length is shortest? Order them all from there.",
        "Arrange these distances from shortest to longest.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, shortest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `l${i}`),
        hint: "Convert every length to m before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${formatKmM(chosen[i].km, chosen[i].m)} (${totalM(chosen[i].km, chosen[i].m)} m)`).join(", ")}.`,
      };
    }

    // categorize
    const threshold = randChoice(rng, [5000, 10000, 20000] as const);
    const chosen = pickDistinctLengths(rng, 6);
    const items = chosen.map((l, i) => ({ id: `l${i}`, label: formatKmM(l.km, l.m) }));
    const buckets = [
      { id: "over", label: `Over ${threshold.toLocaleString()} m` },
      { id: "under", label: `${threshold.toLocaleString()} m or under` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((l, i) => (correctBucket[`l${i}`] = totalM(l.km, l.m) > threshold ? "over" : "under"));
    const catPrompts = [
      `Sort each length by whether it is over ${threshold.toLocaleString()} m, or ${threshold.toLocaleString()} m and under.`,
      `Group each length as over ${threshold.toLocaleString()} m, or ${threshold.toLocaleString()} m and under.`,
      `Classify each length: over the cut-off of ${threshold.toLocaleString()} m, or at/under it.`,
      `Sort these lengths into two groups using ${threshold.toLocaleString()} m as the cut-off.`,
      `Organise each length by whether it exceeds ${threshold.toLocaleString()} m.`,
      `Decide whether each length is over ${threshold.toLocaleString()} m, or not.`,
      `Place each length in the correct group based on the ${threshold.toLocaleString()} m cut-off.`,
      `Sort these lengths by size, using ${threshold.toLocaleString()} m as the dividing line.`,
      `Which lengths are over ${threshold.toLocaleString()} m? Sort them all.`,
      `Categorise each length as over ${threshold.toLocaleString()} m, or ${threshold.toLocaleString()} m or under.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Convert each length to m, then compare to the threshold.",
      explanation: chosen.map((l) => `${formatKmM(l.km, l.m)} = ${totalM(l.km, l.m)} m`).join("; ") + ".",
    };
  },
};

function pickDistinctLengths(rng: RNG, count: number): { km: number; m: number }[] {
  const seen = new Set<number>();
  const result: { km: number; m: number }[] = [];
  while (result.length < count) {
    const km = randInt(rng, 1, 25);
    const m = randInt(rng, 0, 999);
    const t = totalM(km, m);
    if (!seen.has(t)) {
      seen.add(t);
      result.push({ km, m });
    }
  }
  return result;
}
