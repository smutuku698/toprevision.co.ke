import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Celsius to Kelvin: K = C + 273
// KENYAN_PLACES was only 6 entries in the original build — enough for content breadth (M.6 only
// asks for real-life temperature readings; any set of places satisfies that) but too thin a pool
// per RIGOR-STANDARDS.md's minimum pool-size floor: with only 6 fixed facts shared across 4
// branches, the same reading resurfaces constantly in a real practice session. Widened to 16 real
// Kenyan locations spanning cold highlands to hot lowlands/coast/north.
const KENYAN_PLACES = [
  { place: "Mombasa (coastal, midday)", celsius: 32 },
  { place: "Nairobi (an average afternoon)", celsius: 22 },
  { place: "Mount Kenya's summit", celsius: -5 },
  { place: "Lodwar (Turkana, hot season)", celsius: 38 },
  { place: "Nyahururu (a cool highland morning)", celsius: 12 },
  { place: "Kisumu (near the lake, midday)", celsius: 29 },
  { place: "Malindi (coastal, midday)", celsius: 31 },
  { place: "Garissa (a hot semi-arid afternoon)", celsius: 36 },
  { place: "Nanyuki (a highland evening)", celsius: 14 },
  { place: "Eldoret (a cool highland morning)", celsius: 13 },
  { place: "Naivasha (lakeside, afternoon)", celsius: 24 },
  { place: "Wajir (peak hot-season afternoon)", celsius: 39 },
  { place: "Kericho (the tea highlands, misty morning)", celsius: 11 },
  { place: "Voi (a dry lowland afternoon)", celsius: 33 },
  { place: "Nakuru (an average afternoon)", celsius: 21 },
  { place: "Marsabit (a highland desert town, cool night)", celsius: 9 },
] as const;

const INSTRUMENT_CONTEXTS = [
  "A laboratory thermometer",
  "A school science experiment's thermometer",
  "A weather station's sensor",
  "An industrial furnace gauge",
  "A digital kitchen thermometer",
  "A greenhouse temperature sensor",
  "A hospital's clinical reading device",
  "A dairy cooling-room gauge",
  "A car engine's temperature gauge",
  "A meteorologist's field instrument",
  "A food-storage cold room sensor",
  "A physics classroom probe",
] as const;
function instrument(rng: RNG) {
  return randChoice(rng, INSTRUMENT_CONTEXTS);
}

const TERM_PAIRS = [
  { term: "Degree Celsius (°C)", meaning: "The everyday temperature unit, where water freezes at 0° and boils at 100°" },
  { term: "Kelvin (K)", meaning: "The scientific temperature unit, where 0 K is absolute zero (−273°C)" },
  { term: "Thermometer", meaning: "The instrument used to measure temperature" },
  { term: "273", meaning: "The number added to Celsius to convert it to Kelvin" },
  { term: "Absolute zero", meaning: "The lowest possible temperature, 0 K or −273°C, where particles have minimum energy" },
  { term: "Boiling point of water", meaning: "100°C, the temperature at which water changes from liquid to steam at sea level" },
  { term: "Freezing point of water", meaning: "0°C, the temperature at which water changes from liquid to ice" },
  { term: "Average body temperature", meaning: "About 37°C for a healthy human body" },
  { term: "Degree symbol (°)", meaning: "The symbol written before C to show a Celsius temperature reading" },
  { term: "Room temperature", meaning: "A comfortable indoor temperature, roughly 20°C to 25°C" },
  { term: "Weather forecast", meaning: "A prediction of the expected temperature and conditions for a place" },
  { term: "Celsius–Kelvin conversion", meaning: "Adding or subtracting 273 to switch between the two temperature scales" },
] as const;

export const temperature: Skill = {
  id: "g7-math-m-temperature",
  code: "M.6",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Temperature",
  description: "Describe and compare temperature conditions, identify degrees Celsius and Kelvin as units, and convert between them.",
  generate(rng) {
    const branch = randChoice(rng, ["celsius-to-kelvin", "kelvin-to-celsius", "compare", "classify-condition", "match-scale", "order-temps"] as const);

    if (branch === "celsius-to-kelvin") {
      const place = randChoice(rng, KENYAN_PLACES);
      const kelvin = place.celsius + 273;
      return {
        kind: "fill-blank",
        prompt: `The temperature in ${place.place} is measured at ${place.celsius}°C. Convert this to Kelvin.`,
        before: "Temperature =",
        after: "K",
        correctAnswer: String(kelvin),
        inputMode: "numeric",
        hint: "Kelvin = Celsius + 273.",
        explanation: `${place.celsius}°C + 273 = ${kelvin} K.`,
      };
    }

    if (branch === "kelvin-to-celsius") {
      const celsius = randInt(rng, -10, 40);
      const kelvin = celsius + 273;
      const wrong = [String(kelvin), String(celsius - 273), String(celsius + 273 + 10)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(celsius), wrong);
      return {
        kind: "multiple-choice",
        prompt: `${instrument(rng)} reads ${kelvin} K. What is this in degrees Celsius?`,
        choices: choices.map((c) => `${c}°C`),
        correctIndex,
        layout: "row",
        hint: "Celsius = Kelvin − 273.",
        explanation: `${kelvin} K − 273 = ${celsius}°C.`,
      };
    }

    if (branch === "compare") {
      const a = randChoice(rng, KENYAN_PLACES);
      let b = randChoice(rng, KENYAN_PLACES);
      while (b.place === a.place) b = randChoice(rng, KENYAN_PLACES);
      const askColder = rng() < 0.5;
      const aWins = askColder ? a.celsius < b.celsius : a.celsius > b.celsius;
      const choices = shuffle(rng, [a.place, b.place]);
      const correctText = aWins ? a.place : b.place;
      const word = askColder ? "COLDER" : "HOTTER";
      const compareWord = askColder ? "colder" : "hotter";
      return {
        kind: "multiple-choice",
        prompt: `${a.place} is at ${a.celsius}°C, and ${b.place} is at ${b.celsius}°C. Which place is ${word}?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: `The ${compareWord} place has the ${askColder ? "lower" : "higher"} temperature reading.`,
        explanation: `${a.place} (${a.celsius}°C) vs ${b.place} (${b.celsius}°C): ${correctText} is ${compareWord}.`,
      };
    }

    if (branch === "classify-condition") {
      const classify = (c: number) => (c < 15 ? "cold" : c < 27 ? "warm" : "hot");
      const chosen = shuffle(rng, KENYAN_PLACES).slice(0, 5);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: `${p.place}: ${p.celsius}°C` }));
      const buckets = [
        { id: "cold", label: "Cold (below 15°C)" },
        { id: "warm", label: "Warm (15°C–26°C)" },
        { id: "hot", label: "Hot (27°C and above)" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = classify(p.celsius)));
      return {
        kind: "categorize",
        prompt: "Sort each place's temperature as cold, warm, or hot.",
        items,
        buckets,
        correctBucket,
        hint: "Cold: below 15°C. Warm: 15°C–26°C. Hot: 27°C and above.",
        explanation: chosen.map((p) => `${p.place} at ${p.celsius}°C is ${classify(p.celsius)}`).join("; ") + ".",
      };
    }

    if (branch === "match-scale") {
      const chosen = shuffle(rng, TERM_PAIRS).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each temperature term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Celsius is used day to day; Kelvin is used in science.",
        explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // order-temps
    const chosen = shuffle(rng, KENYAN_PLACES).slice(0, 4);
    const items = chosen.map((p, i) => ({ id: `p${i}`, label: `${p.place}: ${p.celsius}°C` }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].celsius - chosen[b].celsius);
    return {
      kind: "ordering",
      prompt: "Order these places from COLDEST to HOTTEST.",
      instruction: "Click them in order, coldest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `p${i}`),
      hint: "Compare the Celsius readings directly.",
      explanation: sortedIdx.map((i) => `${chosen[i].place}: ${chosen[i].celsius}°C`).join(", ") + ".",
    };
  },
};
