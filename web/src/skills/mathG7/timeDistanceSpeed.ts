import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Grade 7 M.5 (Time, Distance and Speed) computes speed/distance/time from wide numeric
// ranges, so those computations are numeric-exempt from the pool-size floor. What needed
// widening was the surrounding scenario text: several branches previously wrapped their
// numbers in a single fixed sentence (e.g. always "A matatu travels..."), which repeats
// verbatim every time that branch is drawn. SPEED_SUBJECTS, DURATION_CONTEXTS,
// DISTANCE_CONTEXTS, ROAD_USERS, BUS_DESTINATIONS and TERM_PAIRS below fix that: 10+ entry
// pools layered under the numeric templates so the scenario wording varies too (per
// RIGOR-STANDARDS.md's minimum pool-size floor).

const SPEED_SUBJECTS = [
  "A matatu",
  "A long-distance bus",
  "A boda-boda rider",
  "A cyclist",
  "A lorry driver",
  "A tuk-tuk",
  "A school bus",
  "A trader's pick-up truck",
  "A motorbike courier",
  "A marathon runner",
  "A cheetah",
  "A racehorse",
] as const;
function subject(rng: RNG) {
  return randChoice(rng, SPEED_SUBJECTS);
}

const DURATION_CONTEXTS = [
  "A church service",
  "A wedding ceremony",
  "A school day",
  "A market day in Gikomba",
  "A football match at the county stadium",
  "A long matatu journey to Kisumu",
  "A harvest work session on the shamba",
  "A power outage",
  "A road trip to Nakuru",
  "A community fundraiser (harambee)",
  "A camping trip on the coast",
  "A radio talk show",
] as const;
function duration(rng: RNG) {
  return randChoice(rng, DURATION_CONTEXTS);
}

const DISTANCE_CONTEXTS = [
  "The distance from home to school",
  "The distance from the estate gate to the shopping centre",
  "The length of the school running track",
  "The distance a delivery van covers around town",
  "The distance from the farm to the collection centre",
  "The distance of a charity walk",
  "The distance covered during a nature walk",
  "The distance from the bus stage to church",
  "The distance of a cross-country race",
  "The distance between two matatu stages",
  "The distance from the borehole to the homestead",
  "The distance from the market to the main road",
] as const;
function distanceContext(rng: RNG) {
  return randChoice(rng, DISTANCE_CONTEXTS);
}

const ROAD_USERS = [
  { name: "matatu on an estate road", min: 30, max: 75 },
  { name: "boda-boda near a school", min: 15, max: 65 },
  { name: "lorry on a residential street", min: 20, max: 70 },
  { name: "cyclist on the same road", min: 10, max: 30 },
  { name: "private car near the market", min: 25, max: 80 },
  { name: "tuk-tuk along the estate road", min: 15, max: 45 },
  { name: "school bus dropping off learners", min: 20, max: 55 },
  { name: "pick-up truck delivering goods", min: 20, max: 65 },
  { name: "motorbike courier", min: 20, max: 70 },
  { name: "water bowser truck", min: 15, max: 50 },
  { name: "ambulance responding to a call", min: 30, max: 90 },
  { name: "garbage collection truck", min: 10, max: 35 },
] as const;

const BUS_DESTINATIONS = [
  { name: "Nakuru", dMin: 100, dMax: 160, sMin: 60, sMax: 90 },
  { name: "Naivasha", dMin: 60, dMax: 100, sMin: 50, sMax: 80 },
  { name: "Nyeri", dMin: 120, dMax: 180, sMin: 70, sMax: 100 },
  { name: "Thika", dMin: 30, dMax: 60, sMin: 40, sMax: 70 },
  { name: "Kisumu", dMin: 280, dMax: 350, sMin: 70, sMax: 100 },
  { name: "Eldoret", dMin: 280, dMax: 320, sMin: 70, sMax: 100 },
  { name: "Nyahururu", dMin: 150, dMax: 200, sMin: 60, sMax: 90 },
  { name: "Machakos", dMin: 50, dMax: 90, sMin: 50, sMax: 80 },
  { name: "Kericho", dMin: 240, dMax: 280, sMin: 65, sMax: 95 },
  { name: "Meru", dMin: 200, dMax: 260, sMin: 65, sMax: 95 },
  { name: "Kitale", dMin: 350, dMax: 400, sMin: 70, sMax: 100 },
  { name: "Voi", dMin: 300, dMax: 350, sMin: 70, sMax: 100 },
] as const;

const TERM_PAIRS = [
  { term: "Speed", meaning: "Distance covered per unit of time" },
  { term: "km/h", meaning: "A speed unit meaning kilometres travelled every hour" },
  { term: "m/s", meaning: "A speed unit meaning metres travelled every second" },
  { term: "Distance ÷ Time", meaning: "The formula for finding speed" },
  { term: "Speed × Time", meaning: "The formula for finding distance" },
  { term: "Distance ÷ Speed", meaning: "The formula for finding time taken" },
  { term: "5/18", meaning: "The factor used to convert a speed from km/h to m/s" },
  { term: "18/5", meaning: "The factor used to convert a speed from m/s to km/h" },
  { term: "Steady speed", meaning: "Speed that stays the same throughout a journey" },
  { term: "Speedometer", meaning: "The instrument in a vehicle that shows its current speed" },
  { term: "Average speed", meaning: "Total distance travelled divided by total time taken" },
  { term: "Speed limit", meaning: "The maximum legal speed allowed on a stretch of road" },
] as const;

export const timeDistanceSpeed: Skill = {
  id: "g7-math-m-time-distance-speed",
  code: "M.5",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Time, distance and speed",
  description: "Convert units of time and distance, identify speed as distance covered per unit time, and convert between km/h and m/s.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["find-speed", "find-distance-or-time", "convert-speed-mc", "convert-units", "sort-speeds", "order-arrival", "match-terms"] as const
    );

    if (branch === "find-speed") {
      const time = randInt(rng, 2, 8);
      const speed = randInt(rng, 40, 110);
      const distance = time * speed;
      return {
        kind: "fill-blank",
        prompt: `${subject(rng)} travels ${distance} km in ${time} hours at a steady speed. Find its speed.`,
        before: "Speed =",
        after: "km/h",
        correctAnswer: String(speed),
        inputMode: "numeric",
        hint: "Speed = distance ÷ time.",
        explanation: `Speed $= ${distance} \\div ${time} = ${speed}$ km/h.`,
      };
    }

    if (branch === "find-distance-or-time") {
      const speed = randInt(rng, 40, 100);
      const askDistance = rng() < 0.5;
      if (askDistance) {
        const time = randInt(rng, 2, 7);
        const distance = speed * time;
        return {
          kind: "fill-blank",
          prompt: `${subject(rng)} travels at a steady ${speed} km/h for ${time} hours. Find the distance covered.`,
          before: "Distance =",
          after: "km",
          correctAnswer: String(distance),
          inputMode: "numeric",
          hint: "Distance = speed × time.",
          explanation: `Distance $= ${speed} \\times ${time} = ${distance}$ km.`,
        };
      }
      const time = randInt(rng, 2, 8);
      const distance = speed * time;
      return {
        kind: "fill-blank",
        prompt: `${subject(rng)} covers ${distance} km at a steady speed of ${speed} km/h. Find how long the journey took.`,
        before: "Time =",
        after: "hours",
        correctAnswer: String(time),
        inputMode: "numeric",
        hint: "Time = distance ÷ speed.",
        explanation: `Time $= ${distance} \\div ${speed} = ${time}$ hours.`,
      };
    }

    if (branch === "convert-speed-mc") {
      // km/h -> m/s: multiply by 1000/3600 = 5/18; use multiples of 18 for exact results
      const kmh = randChoice(rng, [18, 36, 54, 72, 90, 108, 126] as const);
      const ms = (kmh * 5) / 18;
      const direction = rng() < 0.5;
      if (direction) {
        const wrong = [String(kmh * 5), String(kmh / 5), String(ms + 2)];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, String(ms), wrong);
        return {
          kind: "multiple-choice",
          prompt: `${subject(rng)} travels at ${kmh} km/h. Convert this speed to m/s.`,
          choices: choices.map((c) => `${c} m/s`),
          correctIndex,
          layout: "row",
          hint: "To convert km/h to m/s, multiply by 5/18.",
          explanation: `${kmh} km/h × 5/18 = ${ms} m/s.`,
        };
      }
      const wrong = [String(kmh + 18), String(kmh - 18), String(Math.round(ms * 5))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(kmh), wrong);
      return {
        kind: "multiple-choice",
        prompt: `${subject(rng)} moves at ${ms} m/s. Convert this speed to km/h.`,
        choices: choices.map((c) => `${c} km/h`),
        correctIndex,
        layout: "row",
        hint: "To convert m/s to km/h, multiply by 18/5.",
        explanation: `${ms} m/s × 18/5 = ${kmh} km/h.`,
      };
    }

    if (branch === "convert-units") {
      // Covers KICD M.5 outcomes (b) time-unit conversion and (c) distance-unit conversion.
      const unit = randChoice(rng, ["hours-to-min", "min-to-sec", "hours-to-sec", "km-to-m", "m-to-km"] as const);
      if (unit === "hours-to-min") {
        const hrs = randInt(rng, 2, 8);
        const min = hrs * 60;
        return {
          kind: "fill-blank",
          prompt: `${duration(rng)} takes ${hrs} hours. How many minutes is this?`,
          before: "",
          after: "minutes",
          correctAnswer: String(min),
          inputMode: "numeric",
          hint: "Multiply the number of hours by 60.",
          explanation: `${hrs} hours × 60 = ${min} minutes.`,
        };
      }
      if (unit === "min-to-sec") {
        const min = randInt(rng, 2, 20);
        const sec = min * 60;
        return {
          kind: "fill-blank",
          prompt: `${duration(rng)} lasts ${min} minutes. How many seconds is this?`,
          before: "",
          after: "seconds",
          correctAnswer: String(sec),
          inputMode: "numeric",
          hint: "Multiply the number of minutes by 60.",
          explanation: `${min} minutes × 60 = ${sec} seconds.`,
        };
      }
      if (unit === "hours-to-sec") {
        const hrs = randInt(rng, 1, 4);
        const sec = hrs * 3600;
        return {
          kind: "fill-blank",
          prompt: `${duration(rng)} runs for ${hrs} hours. How many seconds is this?`,
          before: "",
          after: "seconds",
          correctAnswer: String(sec),
          inputMode: "numeric",
          hint: "Multiply the number of hours by 3600 (60 × 60).",
          explanation: `${hrs} hours × 3600 = ${sec} seconds.`,
        };
      }
      if (unit === "km-to-m") {
        const km = randInt(rng, 2, 15);
        const m = km * 1000;
        return {
          kind: "fill-blank",
          prompt: `${distanceContext(rng)} is ${km} km. How many metres is this?`,
          before: "",
          after: "m",
          correctAnswer: String(m),
          inputMode: "numeric",
          hint: "Multiply the number of kilometres by 1000.",
          explanation: `${km} km × 1000 = ${m} m.`,
        };
      }
      const km = randInt(rng, 2, 15);
      const m = km * 1000;
      return {
        kind: "fill-blank",
        prompt: `${distanceContext(rng)} is ${m} m. How many kilometres is this?`,
        before: "",
        after: "km",
        correctAnswer: String(km),
        inputMode: "numeric",
        hint: "Divide the number of metres by 1000.",
        explanation: `${m} m ÷ 1000 = ${km} km.`,
      };
    }

    if (branch === "sort-speeds") {
      const speedLimit = 50;
      const chosen = shuffle(rng, ROAD_USERS)
        .slice(0, 4)
        .map((r) => ({ name: r.name, speed: randInt(rng, r.min, r.max) }));
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: `${r.name}: ${r.speed} km/h` }));
      const buckets = [
        { id: "over", label: `Over the ${speedLimit} km/h estate-road limit` },
        { id: "under", label: `Within the ${speedLimit} km/h estate-road limit` },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.speed > speedLimit ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: `An estate road has a speed limit of ${speedLimit} km/h. Sort each road user by whether they are speeding.`,
        items,
        buckets,
        correctBucket,
        hint: `Compare each speed directly to ${speedLimit} km/h.`,
        explanation: chosen.map((r) => `${r.name} at ${r.speed} km/h is ${r.speed > speedLimit ? "over" : "within"} the limit`).join("; ") + ".",
      };
    }

    if (branch === "match-terms") {
      const chosen = shuffle(rng, TERM_PAIRS).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each speed-related term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Speed relates how far something travels to how long it takes.",
        explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // order-arrival: order journeys by which arrives soonest (same start time, different speed/distance)
    const chosenDest = shuffle(rng, BUS_DESTINATIONS).slice(0, 4);
    const withTime = chosenDest.map((d) => {
      const distance = randInt(rng, d.dMin, d.dMax);
      const speed = randInt(rng, d.sMin, d.sMax);
      return { name: `Bus to ${d.name}`, distance, speed, time: distance / speed };
    });
    const items = withTime.map((j, i) => ({ id: `j${i}`, label: `${j.name}: ${j.distance} km at ${j.speed} km/h` }));
    const sortedIdx = withTime.map((_, i) => i).sort((a, b) => withTime[a].time - withTime[b].time);
    return {
      kind: "ordering",
      prompt: "All these buses leave the stage at the same time. Order them from the one that arrives SOONEST to the one that arrives LAST.",
      instruction: "Click them in order, soonest arrival first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `j${i}`),
      hint: "Time taken = distance ÷ speed. The shortest time arrives first.",
      explanation: sortedIdx.map((i) => `${withTime[i].name}: ${withTime[i].distance} ÷ ${withTime[i].speed} = ${withTime[i].time.toFixed(2)} h`).join("; ") + ".",
    };
  },
};
