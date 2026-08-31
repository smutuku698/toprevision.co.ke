import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmtDec } from "./mathUtils";
import { LENGTH_JOURNEY_CONTEXTS, fillLengthContext } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// 1 km = 1000 m.

// Real-life distance-scale scenarios for the "estimate distance in km" outcome (2.1's own outcome,
// distinct from the exact-conversion outcomes) — magnitudes are deliberately realistic ranges, not
// claimed exact facts about a named real place.
const DISTANCE_ESTIMATE_SCENARIOS = [
  { label: "walking from home to a nearby primary school", km: 2 },
  { label: "a matatu ride from one town centre to the next town", km: 18 },
  { label: "cycling from a village to the nearest market centre", km: 6 },
  { label: "a school bus trip to an inter-school sports tournament in a neighbouring sub-county", km: 45 },
  { label: "running a full marathon race route", km: 42 },
  { label: "driving from one county headquarters to a neighbouring one", km: 90 },
  { label: "a short walk to visit a neighbour's homestead", km: 1 },
  { label: "a lorry's delivery trip from a farm to a milling factory", km: 25 },
  { label: "an ambulance trip from a rural clinic to the nearest hospital", km: 35 },
  { label: "a hiker's climb from the base of a hill to its summit", km: 3 },
  { label: "a fisherman's walk from home to the lakeshore", km: 2 },
  { label: "a water bowser's trip from a borehole to a drought-hit village", km: 12 },
  { label: "a long-distance bus journey between two counties", km: 150 },
  { label: "a herder's walk from a homestead to a distant watering point", km: 4 },
] as const;

export const kilometreMetreAndConversions: Skill = {
  id: "g5-math-m-km-conversions",
  code: "M.1",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Kilometres, metres and conversions",
  description: "Identify the kilometre as a unit of length, estimate distance in kilometres, and convert between kilometres and metres in real-life Kenyan situations.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "relationship-mc",
        "km-to-m",
        "m-to-km",
        "estimate-distance-mc",
        "click-match",
        "ordering",
        "categorize",
      ] as const
    );

    if (branch === "relationship-mc") {
      const prompts = [
        "How many metres (m) make up 1 kilometre (km)?",
        "What is the number of metres in 1 kilometre?",
        "1 kilometre is equal to how many metres?",
        "Fill in the relationship: 1 km = ___ m.",
        "How many metres does it take to make 1 km?",
        "A kilometre is made up of how many metres?",
        "To measure long distances, we use km. How many m equal 1 km?",
        "How many metres are there in a single kilometre?",
        "1 km equals how many metres?",
        "What number of metres is the same length as 1 km?",
        "Complete this fact: 1 kilometre is the same distance as ___ metres.",
        "How many metres, laid end to end, make up 1 kilometre?",
      ];
      // Misconceptions: 100 confuses km/m with the m-to-cm-style ×100 relationship; 10 undershoots badly;
      // 10,000 overshoots by confusing it with a different unit pair.
      const wrong = ["100", "10", "10,000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "1,000", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "This is the basic relationship between kilometres and metres.",
        explanation: "1 km = 1,000 m. (100 confuses it with a different unit relationship, and 10,000 overshoots.)",
      };
    }

    if (branch === "km-to-m") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const km = randInt(rng, 2, 150) + randChoice(rng, [0, 0, 0, 0.5] as const);
      const kmStr = fmtDec(km);
      const m = km * 1000;
      const openers = [
        `${subject} travels from ${from} to ${to}, covering a distance of ${kmStr} km.`,
        `A journey takes ${subject} from ${from} to ${to}, a distance of ${kmStr} km.`,
        `${subject} covers ${kmStr} km travelling from ${from} to ${to}.`,
        `The route from ${from} to ${to} taken by ${subject} measures ${kmStr} km.`,
        `${subject} sets off from ${from} heading to ${to}, a trip of ${kmStr} km.`,
      ];
      const closers = [
        "How many metres is this distance?",
        "Express this distance in metres.",
        "Convert this distance to metres.",
        "What is this distance in metres?",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "m",
        correctAnswer: fmtDec(m),
        inputMode: "numeric",
        hint: "1 km = 1000 m, so multiply the number of km by 1000.",
        explanation: `${kmStr} km × 1000 = ${fmtDec(m)} m.`,
      };
    }

    if (branch === "m-to-km") {
      const entry = randChoice(rng, LENGTH_JOURNEY_CONTEXTS);
      const { subject, from, to } = fillLengthContext(entry, rng);
      const m = randInt(rng, 2, 150) * 100;
      const km = m / 1000;
      const openers = [
        `${subject} travels from ${from} to ${to}, covering ${fmtDec(m)} m.`,
        `A signboard shows that the distance ${subject} covers from ${from} to ${to} is ${fmtDec(m)} m.`,
        `${subject} measures the trip from ${from} to ${to} at ${fmtDec(m)} m.`,
        `The distance from ${from} to ${to} that ${subject} covers is ${fmtDec(m)} m.`,
        `${subject} records the route from ${from} to ${to} as ${fmtDec(m)} m long.`,
      ];
      const closers = [
        "How many kilometres is this?",
        "Express this distance in kilometres.",
        "Convert this distance to kilometres.",
        "What is this distance in kilometres?",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "km",
        correctAnswer: fmtDec(km),
        inputMode: "numeric",
        hint: "1000 m = 1 km, so divide the number of m by 1000.",
        explanation: `${fmtDec(m)} m ÷ 1000 = ${fmtDec(km)} km.`,
      };
    }

    if (branch === "estimate-distance-mc") {
      const target = randChoice(rng, DISTANCE_ESTIMATE_SCENARIOS);
      const correct = `about ${target.km} km`;
      const wrongScale = target.km * 10;
      const wrongUnit = target.km < 10 ? target.km * 1000 : Math.round(target.km / 10);
      const wrongOffset = target.km + (target.km < 10 ? 30 : 80);
      const wrong = [`about ${wrongScale} km`, `about ${wrongUnit} km`, `about ${wrongOffset} km`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      const prompts = [
        `Which is the most reasonable estimate for the distance covered by ${target.label}?`,
        `About how far is ${target.label}?`,
        `Estimate the distance for ${target.label}.`,
        `Which km estimate best fits ${target.label}?`,
        `Which of these is closest to the real distance for ${target.label}?`,
        `Choose the most sensible estimate in km for ${target.label}.`,
        `A learner is asked to estimate the distance for ${target.label}. Which answer makes sense?`,
        `Pick the most likely distance, in km, for ${target.label}.`,
        `Which km value best describes ${target.label}?`,
        `About how many kilometres would ${target.label} typically cover?`,
        `Which estimate is realistic for ${target.label}?`,
        `Select the most reasonable distance for ${target.label}.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about how long this kind of journey would realistically take, and picture the distance on a map.",
        explanation: `${target.label[0].toUpperCase()}${target.label.slice(1)} is about ${target.km} km. Multiplying or dividing the real distance by 10, or adding an unrealistic offset, gives the wrong options.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctKm(rng, 4);
      const tokens = shuffle(rng, chosen.map((km, i) => ({ id: `k${i}`, label: `${fmtDec(km)} km` })));
      const targets = shuffle(rng, chosen.map((km, i) => ({ id: `k${i}`, label: `${fmtDec(km * 1000)} m` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`k${i}`] = `k${i}`));
      const prompts = [
        "Match each distance in kilometres to its equivalent in metres.",
        "Pair each kilometre value with its equal length in metres.",
        "Match each km amount to the same distance shown in m.",
        "Click to match each distance to its equivalent in metres.",
        "Line up each km value with the matching metre value.",
        "Find the equivalent metre value for each kilometre distance.",
        "Match each distance card to its equal value in metres.",
        "Pair up the equivalent lengths — kilometres with metres.",
        "Connect each kilometre distance to the same distance in metres.",
        "Match every km measurement to its m equivalent.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the number of km by 1000 to get metres.",
        explanation: chosen.map((km) => `${fmtDec(km)} km = ${fmtDec(km * 1000)} m`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const raw = pickMixedDistances(rng, 4);
      const items = raw.map((r, i) => ({ id: `d${i}`, label: r.label }));
      const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].m - raw[b].m);
      const prompts = [
        "Arrange these distances from shortest to longest.",
        "Order these distances, starting with the shortest.",
        "Put these distances in order from shortest to longest.",
        "Rank these distances from shortest to longest.",
        "Sort these distances into order, shortest first.",
        "Arrange these journeys from shortest to longest.",
        "Which distance is shortest? Order them all from there.",
        "Sequence these distances from shortest to longest.",
        "Line up these distances from the shortest to the longest.",
        "Place these distances in order, beginning with the shortest.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, shortest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `d${i}`),
        hint: "Convert every distance to metres before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${fmtDec(raw[i].m)} m)`).join(", ")}.`,
      };
    }

    // categorize
    const threshold = randChoice(rng, [5, 10, 20, 50] as const);
    const chosenContexts = shuffle(rng, [...LENGTH_JOURNEY_CONTEXTS]).slice(0, 6);
    const journeys = chosenContexts.map((entry) => {
      const filled = fillLengthContext(entry, rng);
      return { ...filled, km: randInt(rng, 1, threshold * 2) };
    });
    const items = journeys.map((j, i) => ({ id: `j${i}`, label: `${j.subject}: ${fmtDec(j.km)} km (${j.from} to ${j.to})` }));
    const buckets = [
      { id: "under", label: `Shorter than ${threshold} km` },
      { id: "over", label: `${threshold} km or longer` },
    ];
    const correctBucket: Record<string, string> = {};
    journeys.forEach((j, i) => (correctBucket[`j${i}`] = j.km < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each journey by whether it is shorter than ${threshold} km, or ${threshold} km and longer.`,
      `Group each journey as shorter than ${threshold} km, or ${threshold} km and longer.`,
      `Classify each journey by its distance: under ${threshold} km, or ${threshold} km and above.`,
      `Sort these journeys into two groups using ${threshold} km as the cut-off.`,
      `Organise each journey by whether it covers less than ${threshold} km.`,
      `Decide whether each journey is shorter than ${threshold} km, or not.`,
      `Place each journey in the correct group based on the ${threshold} km cut-off.`,
      `Sort these trips by distance, using ${threshold} km as the dividing line.`,
      `Which journeys are shorter than ${threshold} km? Sort them all.`,
      `Categorise each journey as under ${threshold} km, or ${threshold} km or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each journey's km value directly to the cut-off.",
      explanation: journeys.map((j) => `${j.subject}'s ${fmtDec(j.km)} km trip is ${j.km < threshold ? "shorter than" : "at least"} ${threshold} km`).join("; ") + ".",
    };
  },
};

function pickDistinctKm(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 2, 99));
  return shuffle(rng, Array.from(seen));
}

function pickMixedDistances(rng: RNG, count: number): { label: string; m: number }[] {
  const options: { label: string; m: number }[] = [];
  const usedM = new Set<number>();
  while (options.length < count) {
    const unit = randChoice(rng, ["km", "m"] as const);
    let m: number;
    let label: string;
    if (unit === "km") {
      const v = randInt(rng, 1, 40);
      m = v * 1000;
      label = `${v} km`;
    } else {
      const v = randInt(rng, 100, 9500);
      m = v;
      label = `${v} m`;
    }
    if (!usedM.has(m)) {
      usedM.add(m);
      options.push({ label, m });
    }
  }
  return options;
}
