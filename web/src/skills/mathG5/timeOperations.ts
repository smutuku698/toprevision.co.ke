import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { TIMED_ACTIVITY_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

function formatMinSec(min: number, sec: number): string {
  return `${min} min ${sec} sec`;
}
function totalSec(min: number, sec: number): number {
  return min * 60 + sec;
}
function fromTotalSec(x: number): { min: number; sec: number } {
  return { min: Math.floor(x / 60), sec: x % 60 };
}

export const timeOperations: Skill = {
  id: "g5-math-m-time-operations",
  code: "M.10",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Adding, subtracting, multiplying and dividing time",
  description: "Add, subtract, multiply and divide durations given in minutes and seconds, carrying and borrowing across the 60-second boundary where needed.",
  generate(rng) {
    const branch = randChoice(rng, ["add", "subtract", "multiply", "divide", "reverse-mc", "click-match", "ordering"] as const);
    const activity = randChoice(rng, TIMED_ACTIVITY_CONTEXTS).replace("{place}", place(rng));

    if (branch === "add") {
      const min1 = randInt(rng, 1, 10);
      const sec1 = randInt(rng, 0, 59);
      const min2 = randInt(rng, 1, 10);
      const sec2 = randInt(rng, 0, 59);
      const sum = totalSec(min1, sec1) + totalSec(min2, sec2);
      const openers = [
        `${activity[0].toUpperCase()}${activity.slice(1)} took ${formatMinSec(min1, sec1)} the first time, and ${formatMinSec(min2, sec2)} the second time.`,
        `Two attempts at ${activity} were timed: ${formatMinSec(min1, sec1)} and ${formatMinSec(min2, sec2)}.`,
        `${activity[0].toUpperCase()}${activity.slice(1)} was timed twice: ${formatMinSec(min1, sec1)} and ${formatMinSec(min2, sec2)}.`,
      ];
      const closers = [" What is the combined time? Give your answer in seconds.", " Find the total time, in seconds.", " What do the two times add up to, in seconds?", " Find the combined duration, in seconds."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "seconds",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Convert each time to seconds first (1 minute = 60 seconds), then add.",
        explanation: `${formatMinSec(min1, sec1)} = ${totalSec(min1, sec1)} sec. ${formatMinSec(min2, sec2)} = ${totalSec(min2, sec2)} sec. Total = ${totalSec(min1, sec1)} + ${totalSec(min2, sec2)} = ${sum} sec.`,
      };
    }

    if (branch === "subtract") {
      const min1 = randInt(rng, 5, 15);
      const sec1 = randInt(rng, 0, 59);
      const min2 = randInt(rng, 1, min1 - 1);
      const sec2 = randInt(rng, 0, 59);
      const t1 = totalSec(min1, sec1);
      const t2 = totalSec(min2, sec2);
      if (t1 <= t2) return this.generate(rng);
      const diff = t1 - t2;
      const openers = [
        `${activity[0].toUpperCase()}${activity.slice(1)} was allowed ${formatMinSec(min1, sec1)}, but only took ${formatMinSec(min2, sec2)}.`,
        `Out of an allowed ${formatMinSec(min1, sec1)}, ${activity} used up ${formatMinSec(min2, sec2)}.`,
        `${activity[0].toUpperCase()}${activity.slice(1)} was budgeted ${formatMinSec(min1, sec1)}; ${formatMinSec(min2, sec2)} has passed so far.`,
      ];
      const closers = [" How much time is left? Give your answer in seconds.", " Find the remaining time, in seconds.", " What time remains, in seconds?", " How much time is left over? Give your answer in seconds."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Remaining =",
        after: "seconds",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Convert both times to seconds first, then subtract the smaller from the larger.",
        explanation: `${formatMinSec(min1, sec1)} = ${t1} sec. ${formatMinSec(min2, sec2)} = ${t2} sec. Remaining = ${t1} − ${t2} = ${diff} sec.`,
      };
    }

    if (branch === "multiply") {
      const min = randInt(rng, 1, 5);
      const sec = randInt(rng, 0, 59);
      const n = randInt(rng, 3, 9);
      const t = totalSec(min, sec);
      const product = t * n;
      const openers = [
        `${activity[0].toUpperCase()}${activity.slice(1)} is repeated ${n} times, each time taking ${formatMinSec(min, sec)}.`,
        `Each of ${n} repeats of ${activity} takes ${formatMinSec(min, sec)}.`,
        `${activity[0].toUpperCase()}${activity.slice(1)} happens ${n} times in a row, each lasting ${formatMinSec(min, sec)}.`,
      ];
      const closers = [" What is the total time taken? Give your answer in seconds.", " Find the total time across all repeats, in seconds.", " How much time is used altogether? Give your answer in seconds.", " What is the combined duration, in seconds?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total =",
        after: "seconds",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Convert one repeat's time to seconds, then multiply by the number of repeats.",
        explanation: `${formatMinSec(min, sec)} = ${t} sec. Total = ${t} × ${n} = ${product} sec.`,
      };
    }

    if (branch === "divide") {
      const n = randInt(rng, 2, 8);
      const partMin = randInt(rng, 0, 3);
      const partSec = randInt(rng, 0, 59);
      const partT = totalSec(partMin, partSec);
      const totalT = partT * n;
      const total = fromTotalSec(totalT);
      const openers = [
        `${activity[0].toUpperCase()}${activity.slice(1)} takes ${formatMinSec(total.min, total.sec)} in total, split into ${n} equal stages.`,
        `A total time of ${formatMinSec(total.min, total.sec)} for ${activity} is divided equally into ${n} equal parts.`,
        `${activity[0].toUpperCase()}${activity.slice(1)} lasts ${formatMinSec(total.min, total.sec)}, shared out equally over ${n} equal sections.`,
      ];
      const closers = [" How long is each equal stage? Give your answer in seconds.", " Find the length of each equal part, in seconds.", " What is the time for each equal section, in seconds?", " How long is each equal part, in seconds?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Each part =",
        after: "seconds",
        correctAnswer: String(partT),
        inputMode: "numeric",
        hint: "Convert the total time to seconds first, then divide by the number of equal parts.",
        explanation: `${formatMinSec(total.min, total.sec)} = ${totalT} sec. Each part = ${totalT} ÷ ${n} = ${partT} sec.`,
      };
    }

    if (branch === "reverse-mc") {
      const min1 = randInt(rng, 5, 12);
      const sec1 = randInt(rng, 0, 59);
      const min2 = randInt(rng, 1, min1 - 1);
      const sec2 = randInt(rng, 0, 59);
      const combined = totalSec(min1, sec1);
      const first = totalSec(min2, sec2);
      if (combined <= first) return this.generate(rng);
      const other = combined - first;
      const wrong = [String(combined + first), String(Math.abs(first - combined) + 30), String(first)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(other), wrong, 3);
      const prompts = [
        `${activity[0].toUpperCase()}${activity.slice(1)} happens in two stages, taking ${formatMinSec(min1, sec1)} altogether. The first stage takes ${formatMinSec(min2, sec2)}. How long, in seconds, is the second stage?`,
        `A combined time of ${formatMinSec(min1, sec1)} for ${activity} is split into two stages; the first stage is ${formatMinSec(min2, sec2)}. What is the second stage, in seconds?`,
        `Out of a total ${formatMinSec(min1, sec1)} for ${activity}, the first stage takes ${formatMinSec(min2, sec2)}. Find the remaining stage's time, in seconds.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices: choices.map((c) => `${c} seconds`),
        correctIndex,
        layout: "row",
        hint: "Convert the combined time and the known stage to seconds, then subtract.",
        explanation: `Combined = ${combined} sec. First stage = ${first} sec. Second stage = ${combined} − ${first} = ${other} sec. (Adding instead of subtracting, or repeating the known stage, gives the wrong distractors.)`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctTimes(rng, 4);
      const tokens = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: formatMinSec(t.min, t.sec) })));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: `${totalSec(t.min, t.sec)} seconds` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      const prompts = [
        "Match each time to its equivalent in seconds.",
        "Pair each minute-and-second time with its total in seconds.",
        "Match each time to the same duration shown in seconds.",
        "Click to match each time to its second total.",
        "Line up each time with its equal value in seconds.",
        "Find the matching second total for each time.",
        "Match each time card to its equal value in seconds.",
        "Pair up the equivalent times — min/sec with total seconds.",
        "Connect each time to the same duration in seconds.",
        "Match every time to its equivalent number of seconds.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the minute part by 60, then add the second part.",
        explanation: chosen.map((t) => `${formatMinSec(t.min, t.sec)} = ${totalSec(t.min, t.sec)} sec`).join("; ") + ".",
      };
    }

    // ordering
    const chosen = pickDistinctTimes(rng, 4);
    const items = chosen.map((t, i) => ({ id: `t${i}`, label: formatMinSec(t.min, t.sec) }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => totalSec(chosen[a].min, chosen[a].sec) - totalSec(chosen[b].min, chosen[b].sec));
    const prompts = [
      "Arrange these times from shortest to longest.",
      "Order these times, starting with the shortest.",
      "Put these times in order from shortest to longest.",
      "Rank these times from shortest to longest.",
      "Sort these times into order, shortest first.",
      "Sequence these times from shortest to longest.",
      "Line up these times from the shortest to the longest.",
      "Place these times in order, beginning with the shortest.",
      "Which time is shortest? Order them all from there.",
      "Arrange these durations from shortest to longest.",
    ];
    return {
      kind: "ordering",
      prompt: randChoice(rng, prompts),
      instruction: "Click them in order, shortest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `t${i}`),
      hint: "Convert every time to seconds before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `${formatMinSec(chosen[i].min, chosen[i].sec)} (${totalSec(chosen[i].min, chosen[i].sec)} sec)`).join(", ")}.`,
    };
  },
};

function pickDistinctTimes(rng: RNG, count: number): { min: number; sec: number }[] {
  const seen = new Set<number>();
  const result: { min: number; sec: number }[] = [];
  while (result.length < count) {
    const min = randInt(rng, 1, 12);
    const sec = randInt(rng, 0, 59);
    const t = totalSec(min, sec);
    if (!seen.has(t)) {
      seen.add(t);
      result.push({ min, sec });
    }
  }
  return result;
}
