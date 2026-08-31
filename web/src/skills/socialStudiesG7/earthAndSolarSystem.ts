import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const THEORIES = [
  {
    name: "The passing star theory",
    desc: "A star is believed to have passed very close to the sun, pulling out hot material that later cooled and condensed to form the planets",
  },
  {
    name: "The nebula cloud theory",
    desc: "The solar system is believed to have formed from a huge, slowly rotating cloud of gas and dust (a nebula) that contracted under gravity, forming the sun at the centre and the planets from the remaining material",
  },
] as const;

const EFFECTS = [
  { text: "Day turns into night and night turns into day", cause: "rotation" },
  { text: "The sun appears to rise in the east and set in the west each day", cause: "rotation" },
  { text: "There is a difference in local time between places in different parts of the world", cause: "rotation" },
  { text: "One complete turn of the earth on its axis takes approximately 24 hours", cause: "rotation" },
  { text: "The four seasons occur over the course of a year in many parts of the world", cause: "revolution" },
  { text: "One complete journey of the earth around the sun takes approximately 365¼ days, giving us one year", cause: "revolution" },
  { text: "A leap year with an extra day is added every four years to account for the extra quarter-day built up during each orbit", cause: "revolution" },
  { text: "The length of daytime and night-time varies at different times of the year away from the Equator", cause: "revolution" },
  { text: "Stars visible in the night sky gradually appear to shift position over the year", cause: "revolution" },
  { text: "Different constellations become visible at different times of the year", cause: "revolution" },
] as const;

const CAUSE_LABEL: Record<string, string> = { rotation: "Caused by the earth's rotation", revolution: "Caused by the earth's revolution" };

const LAYERS = [
  { id: "core", label: "Core" },
  { id: "mantle", label: "Mantle" },
  { id: "crust", label: "Crust" },
] as const;

export const earthAndSolarSystem: Skill = {
  id: "g7-ss-nhbe-earth-and-solar-system",
  code: "NHBE.4",
  subjectId: "social-studies",
  strandId: "g7-ss-nhbe",
  grade: 7,
  title: "Earth and the solar system",
  description: "Theories on the origin of the earth, the earth's size, shape and position in the solar system, effects of rotation and revolution, and the earth's internal structure.",
  generate(rng) {
    const branch = randChoice(rng, ["theories", "rotation-revolution-sort", "layers-order", "effect-mc"] as const);

    if (branch === "theories") {
      const chosen = shuffle(rng, [...THEORIES]);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.name] = t.name));
      return {
        kind: "click-match",
        prompt: "Match each theory explaining the origin of the earth to its description.",
        tokens,
        targets,
        correctMap,
        hint: "One theory involves a passing star pulling material from the sun; the other involves a slowly rotating cloud of gas and dust.",
        explanation: chosen.map((t) => `${t.name}: ${t.desc}.`).join(" "),
      };
    }

    if (branch === "rotation-revolution-sort") {
      const chosen = shuffle(rng, EFFECTS).slice(0, 6);
      const causeIds = Array.from(new Set(chosen.map((e) => e.cause)));
      const buckets = causeIds.map((c) => ({ id: c, label: CAUSE_LABEL[c] }));
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.cause));
      return {
        kind: "categorize",
        prompt: "Sort each effect into whether it is mainly caused by the earth's rotation (spinning on its axis) or its revolution (orbiting the sun).",
        items,
        buckets,
        correctBucket,
        hint: "Rotation happens roughly every 24 hours and gives us day and night. Revolution takes about 365¼ days and gives us the seasons and the year.",
        explanation: chosen.map((e) => `"${e.text}" — ${CAUSE_LABEL[e.cause].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "layers-order") {
      const direction = randChoice(rng, ["centre-out", "surface-in"] as const);
      const orderedLayers = direction === "centre-out" ? LAYERS : [...LAYERS].reverse();
      const items = shuffle(rng, orderedLayers.map((l) => ({ id: l.id, label: l.label })));
      const instruction =
        direction === "centre-out"
          ? "Arrange the earth's internal layers starting from the centre of the earth and moving outward."
          : "Arrange the earth's internal layers starting from the surface and moving toward the centre.";
      return {
        kind: "ordering",
        prompt: "The earth's internal structure is made up of three main layers: the core, the mantle, and the crust.",
        instruction,
        items,
        correctOrder: orderedLayers.map((l) => l.id),
        hint: direction === "centre-out" ? "The core is at the very centre; the crust is the thin outer layer we live on." : "The crust is the thin outer layer we live on; the core is at the very centre.",
        explanation:
          direction === "centre-out"
            ? "From the centre outward: 1. Core (the innermost, hottest layer). 2. Mantle (the thick middle layer). 3. Crust (the thin outer layer we live on)."
            : "From the surface inward: 1. Crust (the thin outer layer we live on). 2. Mantle (the thick middle layer). 3. Core (the innermost, hottest layer).",
      };
    }

    // effect-mc
    const cause = randChoice(rng, ["rotation", "revolution"] as const);
    const matching = EFFECTS.filter((e) => e.cause === cause);
    const nonMatching = EFFECTS.filter((e) => e.cause !== cause).map((e) => e.text);
    const correct = randChoice(rng, matching);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct.text, nonMatching, 3);
    return {
      kind: "multiple-choice",
      prompt: `Which of the following is an effect of the earth's ${cause} (${cause === "rotation" ? "spinning on its axis, taking about 24 hours" : "orbiting the sun, taking about 365¼ days"})?`,
      choices,
      correctIndex,
      hint: cause === "rotation" ? "Rotation effects happen on a daily cycle." : "Revolution effects happen over the course of a year.",
      explanation: `${correct.text} — this is an effect of the earth's ${cause}.`,
    };
  },
};
