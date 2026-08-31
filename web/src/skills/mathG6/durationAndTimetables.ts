import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function fmtTime(h: number, m: number): string {
  return `${pad2(h)}:${pad2(m)}`;
}
function totalMinutes(h: number, m: number): number {
  return h * 60 + m;
}
function fromMinutes(t: number): { h: number; m: number } {
  return { h: Math.floor(t / 60) % 24, m: t % 60 };
}
function formatDuration(totalMin: number): string {
  const hours = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  if (hours === 0) return `${min} minutes`;
  if (min === 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"} ${min} minutes`;
}
/** Strips a leading "a "/"an " so a trip-type phrase can follow "the" without a double article. */
function noArticle(phrase: string): string {
  return phrase.replace(/^(a|an)\s+/i, "");
}

const TOWNS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri", "Meru",
  "Machakos", "Kitale", "Kericho", "Kakamega", "Malindi", "Naivasha", "Kitui",
  "Garissa", "Isiolo", "Voi", "Bungoma", "Embu",
] as const;

// 32 real-world trip-type framings ("a ___ travelling from X to Y") for scenario variety.
const TRIP_TYPES = [
  "a matatu", "an intercity bus", "a night bus", "a school trip bus", "a cargo lorry",
  "an SGR passenger train", "a matatu on its daily route", "a farmer's produce truck",
  "a tour van", "a fuel tanker", "an ambulance on a referral trip", "a milk collection truck",
  "a parcel delivery van", "a church group's hired bus", "a wedding convoy vehicle",
  "a football team's bus", "a postal delivery van", "a safari tour bus",
  "a coach hired for a conference", "a relief-supplies truck", "an election-materials van",
  "a livestock transport truck", "a newspaper delivery van", "a construction-materials lorry",
  "a coastal passenger ferry", "a cargo ship", "an inter-county bus",
  "a cash-in-transit van", "a hospital referral ambulance", "a students' exchange trip bus",
  "a long-distance shuttle", "a company staff bus",
] as const;

function randTime(rng: RNG): { h: number; m: number } {
  return { h: randInt(rng, 4, 21), m: randChoice(rng, [0, 15, 30, 45] as const) };
}
function distinctTowns(rng: RNG, count: number): string[] {
  return shuffle(rng, [...TOWNS]).slice(0, count);
}

export const durationAndTimetables: Skill = {
  id: "g6-math-m-duration-timetables",
  code: "M.11",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Duration and travel timetables",
  description: "Find the duration between two times, work out an arrival or departure time, and interpret a simple travel timetable.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "duration-forward",
        "duration-reverse-arrival",
        "duration-reverse-departure",
        "timetable-interpret",
        "classical-duration",
        "click-match",
        "categorize-duration",
        "order-duration",
      ] as const
    );

    if (branch === "duration-forward") {
      const [from, to] = distinctTowns(rng, 2);
      const trip = randChoice(rng, TRIP_TYPES);
      const dep = randTime(rng);
      const durMin = randInt(rng, 20, 8 * 60) - (randInt(rng, 20, 8 * 60) % 5);
      const arr = fromMinutes(totalMinutes(dep.h, dep.m) + durMin);
      return {
        kind: "fill-blank",
        prompt: `${trip[0].toUpperCase()}${trip.slice(1)} leaves ${from} at ${fmtTime(dep.h, dep.m)} and arrives in ${to} at ${fmtTime(arr.h, arr.m)}. How long did the journey take? Give your answer in minutes.`,
        before: "Journey time =",
        after: "minutes",
        correctAnswer: String(durMin),
        inputMode: "numeric",
        hint: "Convert both times to minutes past midnight, then subtract.",
        explanation: `Departure = ${totalMinutes(dep.h, dep.m)} min past midnight. Arrival = ${totalMinutes(arr.h, arr.m)} min past midnight. Duration = ${totalMinutes(arr.h, arr.m)} − ${totalMinutes(dep.h, dep.m)} = ${durMin} minutes (${formatDuration(durMin)}).`,
      };
    }

    if (branch === "duration-reverse-arrival") {
      const [from, to] = distinctTowns(rng, 2);
      const trip = randChoice(rng, TRIP_TYPES);
      const dep = randTime(rng);
      const durMin = randChoice(rng, [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240] as const);
      const arr = fromMinutes(totalMinutes(dep.h, dep.m) + durMin);
      return {
        kind: "fill-blank",
        prompt: `${trip[0].toUpperCase()}${trip.slice(1)} leaves ${from} at ${fmtTime(dep.h, dep.m)} for ${to}. The journey takes ${formatDuration(durMin)}. What time does it arrive? Give your answer as HH:MM (24-hour clock).`,
        before: "",
        after: "",
        correctAnswer: fmtTime(arr.h, arr.m),
        acceptedAnswers: [fmtTime(arr.h, arr.m), fmtTime(arr.h, arr.m).replace(":", "")],
        inputMode: "text",
        hint: "Add the journey time to the departure time.",
        explanation: `${fmtTime(dep.h, dep.m)} + ${formatDuration(durMin)} = ${fmtTime(arr.h, arr.m)}.`,
      };
    }

    if (branch === "duration-reverse-departure") {
      const [from, to] = distinctTowns(rng, 2);
      const trip = randChoice(rng, TRIP_TYPES);
      const durMin = randChoice(rng, [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240] as const);
      const arr = randTime(rng);
      const dep = fromMinutes(totalMinutes(arr.h, arr.m) - durMin);
      return {
        kind: "fill-blank",
        prompt: `${trip[0].toUpperCase()}${trip.slice(1)} must arrive in ${to} at ${fmtTime(arr.h, arr.m)}. The journey from ${from} takes ${formatDuration(durMin)}. What time must it depart? Give your answer as HH:MM (24-hour clock).`,
        before: "",
        after: "",
        correctAnswer: fmtTime(dep.h, dep.m),
        acceptedAnswers: [fmtTime(dep.h, dep.m), fmtTime(dep.h, dep.m).replace(":", "")],
        inputMode: "text",
        hint: "Subtract the journey time from the arrival time.",
        explanation: `${fmtTime(arr.h, arr.m)} − ${formatDuration(durMin)} = ${fmtTime(dep.h, dep.m)}.`,
      };
    }

    if (branch === "timetable-interpret") {
      const [townA, townB, townC] = distinctTowns(rng, 3);
      const trip = randChoice(rng, TRIP_TYPES);
      const dep = randTime(rng);
      const leg1 = randInt(rng, 30, 150) - (randInt(rng, 30, 150) % 5);
      const arriveB = fromMinutes(totalMinutes(dep.h, dep.m) + leg1);
      const layover = randChoice(rng, [5, 10, 15, 20] as const);
      const departB = fromMinutes(totalMinutes(arriveB.h, arriveB.m) + layover);
      const leg2 = randInt(rng, 30, 150) - (randInt(rng, 30, 150) % 5);
      const arriveC = fromMinutes(totalMinutes(departB.h, departB.m) + leg2);
      const passage = `Timetable for ${trip} from ${townA} to ${townC}:\nDeparts ${townA}: ${fmtTime(dep.h, dep.m)}\nArrives ${townB}: ${fmtTime(arriveB.h, arriveB.m)}\nDeparts ${townB}: ${fmtTime(departB.h, departB.m)}\nArrives ${townC}: ${fmtTime(arriveC.h, arriveC.m)}`;

      const questionType = randChoice(rng, ["depart-b", "total-time", "layover"] as const);
      if (questionType === "depart-b") {
        const wrong = [fmtTime(arriveB.h, arriveB.m), fmtTime(dep.h, dep.m), fmtTime(arriveC.h, arriveC.m)];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, fmtTime(departB.h, departB.m), wrong, 3);
        return {
          kind: "multiple-choice",
          prompt: `Using the timetable above, what time does the ${noArticle(trip)} depart from ${townB}?`,
          passage,
          choices,
          correctIndex,
          layout: "row",
          hint: "Find the 'Departs' line for that town in the timetable.",
          explanation: `The timetable shows "Departs ${townB}: ${fmtTime(departB.h, departB.m)}".`,
        };
      }
      if (questionType === "total-time") {
        const totalMin = totalMinutes(arriveC.h, arriveC.m) - totalMinutes(dep.h, dep.m);
        return {
          kind: "fill-blank",
          prompt: `Using the timetable above, how long does the whole trip from ${townA} to ${townC} take, including the stop at ${townB}? Give your answer in minutes.`,
          passage,
          before: "Total time =",
          after: "minutes",
          correctAnswer: String(totalMin),
          inputMode: "numeric",
          hint: "Subtract the departure time at the start from the final arrival time.",
          explanation: `${fmtTime(arriveC.h, arriveC.m)} − ${fmtTime(dep.h, dep.m)} = ${totalMin} minutes (${formatDuration(totalMin)}), including the stop at ${townB}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `Using the timetable above, how many minutes does the ${noArticle(trip)} spend stopped at ${townB}?`,
        passage,
        before: "Stop time =",
        after: "minutes",
        correctAnswer: String(layover),
        inputMode: "numeric",
        hint: "Subtract the arrival time at that town from its departure time.",
        explanation: `${fmtTime(departB.h, departB.m)} − ${fmtTime(arriveB.h, arriveB.m)} = ${layover} minutes.`,
      };
    }

    if (branch === "classical-duration") {
      const dep = randTime(rng);
      const durMin = randInt(rng, 20, 6 * 60) - (randInt(rng, 20, 6 * 60) % 5);
      const arr = fromMinutes(totalMinutes(dep.h, dep.m) + durMin);
      return {
        kind: "fill-blank",
        prompt: `Find the time elapsed between ${fmtTime(dep.h, dep.m)} and ${fmtTime(arr.h, arr.m)}. Give your answer in minutes.`,
        before: "",
        after: "minutes",
        correctAnswer: String(durMin),
        inputMode: "numeric",
        hint: "Convert both times to minutes past midnight, then subtract.",
        explanation: `${fmtTime(arr.h, arr.m)} − ${fmtTime(dep.h, dep.m)} = ${durMin} minutes.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctJourneys(rng, 4);
      const tokens = shuffle(rng, chosen.map((j, i) => ({ id: `j${i}`, label: `Departs ${fmtTime(j.dep.h, j.dep.m)}, arrives ${fmtTime(j.arr.h, j.arr.m)}` })));
      const targets = shuffle(rng, chosen.map((j, i) => ({ id: `j${i}`, label: formatDuration(j.durMin) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`j${i}`] = `j${i}`));
      return {
        kind: "click-match",
        prompt: "Match each journey to its correct duration.",
        tokens,
        targets,
        correctMap,
        hint: "Subtract the departure time from the arrival time.",
        explanation: chosen.map((j) => `Departs ${fmtTime(j.dep.h, j.dep.m)}, arrives ${fmtTime(j.arr.h, j.arr.m)} → ${formatDuration(j.durMin)}`).join("; ") + ".",
      };
    }

    if (branch === "categorize-duration") {
      const threshold = randChoice(rng, [60, 90, 120, 180] as const);
      const chosen = pickDistinctJourneys(rng, 6);
      const items = chosen.map((j, i) => ({ id: `j${i}`, label: `Departs ${fmtTime(j.dep.h, j.dep.m)}, arrives ${fmtTime(j.arr.h, j.arr.m)}` }));
      const buckets = [
        { id: "over", label: `Longer than ${formatDuration(threshold)}` },
        { id: "under", label: `${formatDuration(threshold)} or less` },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((j, i) => (correctBucket[`j${i}`] = j.durMin > threshold ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: `Sort each journey by whether it takes longer than ${formatDuration(threshold)}, or ${formatDuration(threshold)} and less.`,
        items,
        buckets,
        correctBucket,
        hint: "Work out each journey's duration, then compare it to the threshold.",
        explanation: chosen.map((j) => `Departs ${fmtTime(j.dep.h, j.dep.m)}, arrives ${fmtTime(j.arr.h, j.arr.m)}: duration = ${formatDuration(j.durMin)}`).join("; ") + ".",
      };
    }

    // order-duration
    const chosen = pickDistinctJourneys(rng, 4);
    const items = chosen.map((j, i) => ({ id: `j${i}`, label: `Departs ${fmtTime(j.dep.h, j.dep.m)}, arrives ${fmtTime(j.arr.h, j.arr.m)}` }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].durMin - chosen[b].durMin);
    return {
      kind: "ordering",
      prompt: "Arrange these journeys from shortest to longest duration.",
      instruction: "Click them in order, shortest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `j${i}`),
      hint: "Work out each journey's duration before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `departs ${fmtTime(chosen[i].dep.h, chosen[i].dep.m)}, arrives ${fmtTime(chosen[i].arr.h, chosen[i].arr.m)} (${formatDuration(chosen[i].durMin)})`).join(", ")}.`,
    };
  },
};

function pickDistinctJourneys(rng: RNG, count: number): { dep: { h: number; m: number }; arr: { h: number; m: number }; durMin: number }[] {
  const seen = new Set<number>();
  const result: { dep: { h: number; m: number }; arr: { h: number; m: number }; durMin: number }[] = [];
  while (result.length < count) {
    const dep = randTime(rng);
    const durMin = randInt(rng, 4, 40) * 15;
    if (seen.has(durMin)) continue;
    seen.add(durMin);
    const arr = fromMinutes(totalMinutes(dep.h, dep.m) + durMin);
    result.push({ dep, arr, durMin });
  }
  return result;
}
