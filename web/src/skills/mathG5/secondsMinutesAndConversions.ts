import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { TIMED_ACTIVITY_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// 1 minute = 60 seconds.

export const secondsMinutesAndConversions: Skill = {
  id: "g5-math-m-time-conversions",
  code: "M.9",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Seconds, minutes and conversions",
  description: "Identify the second as a unit of time, and convert between minutes and seconds.",
  generate(rng) {
    const branch = randChoice(rng, ["relationship-mc", "min-to-sec", "sec-to-min", "estimate-mc", "click-match", "ordering", "categorize"] as const);

    if (branch === "relationship-mc") {
      const prompts = [
        "How many seconds (s) make up 1 minute?",
        "What is the number of seconds in 1 minute?",
        "1 minute is equal to how many seconds?",
        "Fill in the relationship: 1 minute = ___ seconds.",
        "How many seconds does it take to make 1 minute?",
        "A minute is made up of how many seconds?",
        "To measure very short amounts of time, we use seconds. How many seconds equal 1 minute?",
        "How many seconds are there in a single minute?",
        "1 minute equals how many seconds?",
        "What number of seconds is the same length of time as 1 minute?",
        "Complete this fact: 1 minute is the same as ___ seconds.",
        "How many ticks of a clock's second hand make up 1 minute?",
      ];
      const wrong = ["100", "10", "1,000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "60", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "This is the basic relationship between minutes and seconds — think of a clock's second hand going all the way round.",
        explanation: "1 minute = 60 seconds. (100 and 1,000 mistakenly apply a metric-style ×10/×100 relationship, which doesn't apply to time.)",
      };
    }

    if (branch === "min-to-sec") {
      const activity = randChoice(rng, TIMED_ACTIVITY_CONTEXTS).replace("{place}", place(rng));
      const min = randInt(rng, 1, 15);
      const sec = min * 60;
      const openers = [
        `${activity[0].toUpperCase()}${activity.slice(1)} takes ${min} minute${min > 1 ? "s" : ""}.`,
        `A timer shows that ${activity} lasts ${min} minute${min > 1 ? "s" : ""}.`,
        `It takes ${min} minute${min > 1 ? "s" : ""} for ${activity}.`,
      ];
      const closers = [" How many seconds is this?", " Express this time in seconds.", " Convert this time to seconds.", " What is this in seconds?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "seconds",
        correctAnswer: String(sec),
        inputMode: "numeric",
        hint: "1 minute = 60 seconds, so multiply the number of minutes by 60.",
        explanation: `${min} minute${min > 1 ? "s" : ""} × 60 = ${sec} seconds.`,
      };
    }

    if (branch === "sec-to-min") {
      const activity = randChoice(rng, TIMED_ACTIVITY_CONTEXTS).replace("{place}", place(rng));
      const min = randInt(rng, 1, 15);
      const sec = min * 60;
      const openers = [
        `${activity[0].toUpperCase()}${activity.slice(1)} takes ${sec} seconds.`,
        `A stopwatch shows that ${activity} lasts ${sec} seconds.`,
        `It takes ${sec} seconds for ${activity}.`,
      ];
      const closers = [" How many minutes is this?", " Express this time in minutes.", " Convert this time to minutes.", " What is this in minutes?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "minutes",
        correctAnswer: String(min),
        inputMode: "numeric",
        hint: "60 seconds = 1 minute, so divide the number of seconds by 60.",
        explanation: `${sec} seconds ÷ 60 = ${min} minute${min > 1 ? "s" : ""}.`,
      };
    }

    if (branch === "estimate-mc") {
      const activity = randChoice(rng, TIMED_ACTIVITY_CONTEXTS).replace("{place}", place(rng));
      const correctSec = randChoice(rng, [5, 10, 15, 20, 30, 45, 60, 90] as const);
      const wrongScale = correctSec * 10;
      const wrongTiny = Math.max(1, Math.round(correctSec / 10));
      const wrongOffset = correctSec + 40;
      const wrong = [`about ${wrongScale} seconds`, `about ${wrongTiny} seconds`, `about ${wrongOffset} seconds`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `about ${correctSec} seconds`, wrong, 3);
      const prompts = [
        `About how long does ${activity} take?`,
        `Estimate the time taken for ${activity}.`,
        `Which time estimate best fits ${activity}?`,
        `Which of these is closest to the real time for ${activity}?`,
        `Choose the most sensible time estimate for ${activity}.`,
        `A learner estimates the time for ${activity}. Which answer makes sense?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "list",
        hint: "Picture the activity happening and think about how many seconds it would realistically take.",
        explanation: `${activity[0].toUpperCase()}${activity.slice(1)} takes about ${correctSec} seconds. Multiplying or dividing the real time by 10, or adding an unrealistic offset, gives the wrong options.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctMinutes(rng, 4);
      const tokens = shuffle(rng, chosen.map((m, i) => ({ id: `m${i}`, label: `${m} minute${m > 1 ? "s" : ""}` })));
      const targets = shuffle(rng, chosen.map((m, i) => ({ id: `m${i}`, label: `${m * 60} seconds` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
      const prompts = [
        "Match each time in minutes to its equivalent in seconds.",
        "Pair each minute value with its equal time in seconds.",
        "Match each minute amount to the same time shown in seconds.",
        "Click to match each time to its equivalent in seconds.",
        "Line up each minute value with the matching second value.",
        "Find the equivalent second value for each minute amount.",
        "Match each time card to its equal value in seconds.",
        "Pair up the equivalent times — minutes with seconds.",
        "Connect each minute amount to the same time in seconds.",
        "Match every minute measurement to its second equivalent.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the number of minutes by 60 to get seconds.",
        explanation: chosen.map((m) => `${m} minute${m > 1 ? "s" : ""} = ${m * 60} seconds`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const raw = pickMixedTimes(rng, 4);
      const items = raw.map((r, i) => ({ id: `t${i}`, label: r.label }));
      const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].sec - raw[b].sec);
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
        explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${raw[i].sec} seconds)`).join(", ")}.`,
      };
    }

    // categorize
    const threshold = randChoice(rng, [60, 120, 300, 600] as const);
    const chosen = pickDistinctMinutes(rng, 6).map((m) => m * 60);
    const items = chosen.map((sec, i) => ({ id: `t${i}`, label: `${sec} seconds` }));
    const buckets = [
      { id: "under", label: `Less than ${threshold} seconds` },
      { id: "over", label: `${threshold} seconds or more` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((sec, i) => (correctBucket[`t${i}`] = sec < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each time by whether it is less than ${threshold} seconds.`,
      `Group each time as under ${threshold} seconds, or ${threshold} seconds and above.`,
      `Classify each time: below ${threshold} seconds, or ${threshold} seconds and up.`,
      `Sort these times into two groups using ${threshold} seconds as the cut-off.`,
      `Organise each time by whether it is under ${threshold} seconds.`,
      `Decide whether each time is less than ${threshold} seconds, or not.`,
      `Place each time in the correct group based on the ${threshold}-second cut-off.`,
      `Sort these times by length, using ${threshold} seconds as the dividing line.`,
      `Which times are under ${threshold} seconds? Sort them all.`,
      `Categorise each time as under ${threshold} seconds, or ${threshold} seconds or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each time directly to the threshold in seconds.",
      explanation: chosen.map((sec) => `${sec} seconds is ${sec < threshold ? "less than" : "at least"} ${threshold} seconds`).join("; ") + ".",
    };
  },
};

function pickDistinctMinutes(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 1, 15));
  return shuffle(rng, Array.from(seen));
}

function pickMixedTimes(rng: RNG, count: number): { label: string; sec: number }[] {
  const options: { label: string; sec: number }[] = [];
  const used = new Set<number>();
  while (options.length < count) {
    const unit = randChoice(rng, ["min", "sec"] as const);
    let sec: number;
    let label: string;
    if (unit === "min") {
      const v = randInt(rng, 1, 10);
      sec = v * 60;
      label = `${v} minute${v > 1 ? "s" : ""}`;
    } else {
      const v = randInt(rng, 5, 590);
      sec = v;
      label = `${v} seconds`;
    }
    if (!used.has(sec)) {
      used.add(sec);
      options.push({ label, sec });
    }
  }
  return options;
}
