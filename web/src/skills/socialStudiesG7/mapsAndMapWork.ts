import { randChoice, sampleDistinctInts, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// Multiples of 15 (degrees) so time differences always work out to a whole number of hours.
// Values are signed: positive = degrees East, negative = degrees West.
const LONGITUDE_MULTIPLES = [-165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];

function formatLon(v: number): string {
  if (v === 0) return "0° (the Prime Meridian)";
  return v > 0 ? `${v}°E` : `${-v}°W`;
}

const MAP_TYPES = [
  { type: "Topographical map", desc: "A detailed map, precisely drawn to scale, that shows both physical and human features including relief shown by contour lines" },
  { type: "Sketch map", desc: "A simple, freehand map drawn quickly without an exact scale, showing only the main features of an area" },
  { type: "Atlas map", desc: "A map found in a bound book of maps, usually showing a whole country, continent, or the world at a small scale" },
] as const;

const AFRICA_FACTS = [
  { text: "Africa lies between about latitude 37°N and 35°S, so the Equator crosses roughly through its middle", bucket: "position" },
  { text: "The Prime Meridian (0° longitude) as well as the Equator both pass through Africa", bucket: "position" },
  { text: "Africa is bordered by the Mediterranean Sea to the north, the Atlantic Ocean to the west, and the Indian Ocean to the east", bucket: "position" },
  { text: "Africa is often described as roughly triangular or wedge-shaped — broad in the north and narrowing towards the south", bucket: "shape" },
  { text: "Africa is the second largest continent in the world after Asia, covering about 30 million square kilometres", bucket: "size" },
  { text: "Africa is large enough that several other continents' countries could fit within its total land area", bucket: "size" },
  { text: "Africa lies almost entirely within the tropics, between the Tropic of Cancer and the Tropic of Capricorn", bucket: "position" },
  { text: "Africa's coastline is relatively smooth, with fewer large bays and peninsulas than some other continents", bucket: "shape" },
] as const;

const BUCKET_LABEL: Record<string, string> = { position: "Position", shape: "Shape", size: "Size" };

const PLACE_NAME_PAIRS = [
  ["Nairobi", "Kakamega"],
  ["Mombasa", "Kisumu"],
  ["Nakuru", "Garissa"],
  ["Kilifi", "Machakos"],
  ["Nyeri", "Bungoma"],
  ["Kajiado", "Kericho"],
] as const;

const LOCATION_REASONS = [
  "They allow us to pinpoint the exact location of any place on Earth, no matter how remote",
  "They help in calculating the time difference between places in different parts of the world",
  "They allow accurate navigation for ships, aircraft, and GPS-based devices",
  "They provide a common reference system used consistently on maps and globes worldwide",
  "They allow scientists to track and compare weather or environmental data across exact locations",
  "They make it possible to describe a location precisely without relying on landmarks that might change",
  "They allow search and rescue teams to coordinate accurately during an emergency",
  "They support international agreements and treaties that need to define exact boundaries",
] as const;

export const mapsAndMapWork: Skill = {
  id: "g7-ss-nhbe-maps-and-map-work",
  code: "NHBE.3",
  subjectId: "social-studies",
  strandId: "g7-ss-nhbe",
  grade: 7,
  title: "Maps and map work",
  description: "The position, shape and size of Africa, locating places using latitude and longitude, calculating time differences using longitude, and the three types of maps used in Social Studies.",
  generate(rng) {
    const branch = randChoice(rng, ["time-calc", "map-types", "africa-facts", "why-locate"] as const);

    if (branch === "time-calc") {
      const [a, b] = sampleDistinctInts(rng, 0, LONGITUDE_MULTIPLES.length - 1, 2).map((i) => LONGITUDE_MULTIPLES[i]);
      const degreeDiff = Math.abs(a - b);
      const hours = degreeDiff / 15;
      const [townA, townB] = randChoice(rng, PLACE_NAME_PAIRS);
      return {
        kind: "fill-blank",
        prompt: `${townA} is located at longitude ${formatLon(a)}. ${townB} is located at longitude ${formatLon(b)}.`,
        before: "The time difference between the two places is",
        after: "hour(s).",
        correctAnswer: String(hours),
        inputMode: "numeric",
        hint: "Every 15° of longitude equals a 1-hour time difference. Find the total number of degrees separating the two places, then divide by 15.",
        explanation: `The total separation is ${degreeDiff}° of longitude (from ${formatLon(a)} to ${formatLon(b)}). Time difference = ${degreeDiff} \\div 15 = ${hours} hour(s).`,
      };
    }

    if (branch === "map-types") {
      const chosen = shuffle(rng, [...MAP_TYPES]);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.type, label: m.type })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.type, label: m.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((m) => (correctMap[m.type] = m.type));
      return {
        kind: "click-match",
        prompt: "Match each type of map used in Social Studies to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how detailed, accurate, and to-scale each type of map is.",
        explanation: chosen.map((m) => `${m.type}: ${m.desc}.`).join(" "),
      };
    }

    if (branch === "africa-facts") {
      const chosen = shuffle(rng, AFRICA_FACTS).slice(0, 6);
      const bucketIds = Array.from(new Set(chosen.map((f) => f.bucket)));
      const buckets = bucketIds.map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each fact about Africa into whether it describes the continent's position, shape, or size.",
        items,
        buckets,
        correctBucket,
        hint: "Position is about where Africa is located relative to lines of latitude/longitude and oceans; shape is about its outline; size is about how much area it covers.",
        explanation: chosen.map((f) => `"${f.text}" — describes Africa's ${BUCKET_LABEL[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    // why-locate
    const correct = randChoice(rng, LOCATION_REASONS);
    const others = LOCATION_REASONS.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Why is it useful to locate places and features using lines of latitude and longitude on a map?",
      choices,
      correctIndex,
      hint: "Think about what latitude and longitude give us that simply naming a place cannot.",
      explanation: `${correct} — this is why latitude and longitude are so useful for locating places.`,
    };
  },
};
