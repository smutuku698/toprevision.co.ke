import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { ANGLE_ENVIRONMENT_EXAMPLES, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

const TURNS = [
  { name: "quarter turn", degrees: 90 },
  { name: "half turn", degrees: 180 },
  { name: "three-quarter turn", degrees: 270 },
  { name: "full turn", degrees: 360 },
] as const;

export const turnsAndMeasuringAngles: Skill = {
  id: "g5-math-g-angles",
  code: "G.2",
  subjectId: "math",
  strandId: "g5-math-geometry",
  grade: 5,
  title: "Turns and measuring angles with a protractor",
  description: "Relate turns to angles, read and use a protractor to measure angles in degrees, and identify angles used in the environment.",
  generate(rng) {
    const branch = randChoice(rng, ["protractor-measure", "turn-to-degree", "wrong-scale-mc", "turn-match", "environment-categorize"] as const);

    if (branch === "protractor-measure") {
      const angle = randInt(rng, 15, 165);
      const prompts = [
        "Drag the blue needle to line up exactly with the red ray, then submit your reading.",
        "Line up the needle with the red ray and read the angle in degrees.",
        "Move the protractor's needle to match the red ray, then give its reading.",
        "Align the needle with the red ray to measure this angle.",
      ];
      return {
        kind: "protractor",
        mode: "measure",
        rayBAngleDeg: angle,
        correctAngleDeg: angle,
        toleranceDeg: 3,
        prompt: randChoice(rng, prompts),
        hint: "Line the needle up on top of the red ray, then read the degree mark it points to on the scale.",
        explanation: `The red ray sits at ${angle}° on the protractor scale.`,
      };
    }

    if (branch === "turn-to-degree") {
      const t = randChoice(rng, TURNS);
      const openers = [
        `A clockwise ${t.name} is made.`,
        `Someone turns through a ${t.name}.`,
        `Consider a ${t.name}.`,
        `A ${t.name} is completed.`,
      ];
      const closers = [" How many degrees is this?", " Express this turn in degrees.", " How many degrees does this turn cover?", " What angle, in degrees, does this turn make?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "",
        after: "°",
        correctAnswer: String(t.degrees),
        inputMode: "numeric",
        hint: "A full turn is 360°. A quarter turn is a fourth of that, a half turn is half of it.",
        explanation: `A ${t.name} is ${t.degrees}°.`,
      };
    }

    if (branch === "wrong-scale-mc") {
      const correct = randInt(rng, 20, 160);
      const wrongScaleReading = 180 - correct;
      const wrongOff10 = correct + randChoice(rng, [10, -10] as const);
      const wrongDoubled = Math.min(179, correct * 2);
      const candidates = [...new Set([correct, wrongOff10, wrongDoubled])].filter((v) => v !== wrongScaleReading && v > 0 && v < 180);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `${wrongScaleReading}°`, candidates.map((v) => `${v}°`), Math.min(3, candidates.length));
      const openers = [
        `A protractor has two scales, one reading clockwise and one reading anticlockwise. A ray correctly measures ${correct}° on the proper scale.`,
        `An angle correctly measures ${correct}° when the correct protractor scale is used.`,
        `Using the correct scale, a ray is read as ${correct}°.`,
      ];
      const closers = [
        " If a learner accidentally reads the OTHER scale by mistake, what angle would they wrongly record?",
        " What wrong reading results from using the wrong scale by mistake?",
        " Which value would a learner mistakenly get by reading the wrong scale?",
      ];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "A protractor's two scales always add up to 180° at the same ray — reading the wrong one gives 180° minus the correct answer.",
        explanation: `Reading the wrong scale gives 180° − ${correct}° = ${wrongScaleReading}°. This is a real, common protractor mistake — always double-check which scale (inner or outer) starts from 0° at your baseline ray.`,
      };
    }

    if (branch === "turn-match") {
      const chosen = shuffle(rng, [...TURNS]);
      const tokens = chosen.map((t, i) => ({ id: `t${i}`, label: t.name }));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `d${i}`, label: `${t.degrees}°` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`d${i}`] = `t${i}`));
      const prompts = [
        "Match each turn to how many degrees it covers.",
        "Pair each turn with its correct number of degrees.",
        "Match each turn to its angle in degrees.",
        "Connect each turn to its degree measure.",
        "Match each type of turn to its correct degrees.",
        "Pair each turn with the correct angle.",
        "Match each turn word to its degree value.",
        "Link each turn to how far around it goes, in degrees.",
        "Match every turn to its correct degree measure.",
        "Connect each turn with its angle in degrees.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "A full turn is 360° — divide that by 4, 2, or use ¾ of it for the others.",
        explanation: chosen.map((t) => `${t.name} = ${t.degrees}°`).join("; ") + ".",
      };
    }

    // environment-categorize: sort real-life angle examples by an estimated degree threshold.
    const chosenExamples = shuffle(rng, [...ANGLE_ENVIRONMENT_EXAMPLES]).slice(0, 6);
    const withDegrees = chosenExamples.map((e) => ({ label: e.replace("{place}", place(rng)), deg: randInt(rng, 10, 350) }));
    const items = withDegrees.map((e, i) => ({ id: `a${i}`, label: `${e.label} (about ${e.deg}°)` }));
    const buckets = [
      { id: "under", label: "Less than 90°" },
      { id: "over", label: "90° or more" },
    ];
    const correctBucket: Record<string, string> = {};
    withDegrees.forEach((e, i) => (correctBucket[`a${i}`] = e.deg < 90 ? "under" : "over"));
    const catPrompts = [
      "Sort each real-life angle by whether it is less than 90°.",
      "Group each angle as under 90°, or 90° and above.",
      "Classify each angle: below 90°, or 90° and up.",
      "Sort these angles into two groups using 90° as the cut-off.",
      "Organise each angle by whether it is under 90°.",
      "Decide whether each angle is less than 90°, or not.",
      "Place each angle in the correct group based on the 90° cut-off.",
      "Sort these angles by size, using 90° as the dividing line.",
      "Which angles are under 90°? Sort them all.",
      "Categorise each angle as under 90°, or 90° or more.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each angle's stated degree value directly to 90°.",
      explanation: withDegrees.map((e) => `${e.label} at about ${e.deg}° is ${e.deg < 90 ? "less than" : "at least"} 90°`).join("; ") + ".",
    };
  },
};
