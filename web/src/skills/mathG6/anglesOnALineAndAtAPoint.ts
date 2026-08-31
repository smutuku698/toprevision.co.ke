import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 3.2(a)-(c): angles on a straight line (sum to 180°) and angles at a point (sum to 360°).
// 32 real-world scenarios (16 line, 16 point) — over the 30+ floor for this round. The
// underlying maths is a numeric formula (exempt), but the surrounding scenario wording needs
// the variety, and the same pool feeds the categorize branch below.
const LINE_SCENARIOS = [
  "A metal roof truss forms a straight beam, split into two sloped sections at the ridge",
  "A book lies open flat on a desk, split into two page-angles by the spine",
  "A pair of scissors is opened out flat on a table, blades forming a straight line split into two angles",
  "A straight fence has a bend where two sections meet, viewed along the straight base line",
  "A door swung fully open lies flat against the wall, with the doorway and door forming a straight line",
  "A ruler laid straight across a desk is crossed by a pencil, forming two angles on the straight edge",
  "A straight road has a signpost planted where it forms two angles with a side path",
  "An ironing board's straight edge is split by a folded cloth into two angles",
  "A cricket bat laid flat on the ground is split into two angles by a leaning stump",
  "A classroom ruler lying flat on the floor is crossed by a broom handle, forming two angles",
  "A straight clothesline is crossed by a supporting pole, forming two angles along the line",
  "A long straight roof beam is split by a supporting strut into two sloped angles",
  "A boda boda's straight handlebar is turned, forming two angles either side of straight-ahead",
  "A gate lies flat open against a straight fence line, forming two angles",
  "A straight chalk line on a football pitch is crossed by a corner flag's shadow, forming two angles",
  "A tailor's straight measuring tape on a table is crossed by a pair of shears, forming two angles",
] as const;

const POINT_SCENARIOS = [
  "The spokes of a bicycle wheel all meet at the central hub",
  "The ribs of an open umbrella all meet at the central point",
  "The blades of a ceiling fan all meet at the central motor",
  "Slices of a pizza all meet at the centre point",
  "The roads at a roundabout all meet at the central island point",
  "The hands and hour markers of a clock all radiate from the centre pin",
  "The threads of a spider's web radiate out from the centre point",
  "The ribs of a hand fan, fully spread, all meet at the pivot point",
  "Sections of a round maize-drying mat are marked out from the centre point",
  "Paths in a round roundabout garden radiate from a central flower bed",
  "The struts supporting a bicycle wheel's rim all meet at the hub",
  "The rays of a compass rose on a map all meet at the centre point",
  "The points of a star-shaped school badge all meet at the centre",
  "Slices of a round cake are cut from the centre point outward",
  "The legs of a round three-legged stool's brace meet underneath at a centre point",
  "The struts of a folded camping stool all meet at a single hinge point",
] as const;

// Fixed small vocabulary of angle facts — not a content pool, so it stays under 30.
const ANGLE_FACTS = [
  { term: "Angles on a straight line", meaning: "Always add up to 180°" },
  { term: "Angles at a point (full turn)", meaning: "Always add up to 360°" },
  { term: "A right angle", meaning: "Measures exactly 90°" },
  { term: "A straight angle", meaning: "Measures exactly 180°" },
] as const;

export const anglesOnALineAndAtAPoint: Skill = {
  id: "g6-math-g-angles-line-point",
  code: "G.3",
  subjectId: "math",
  strandId: "g6-math-geometry",
  grade: 6,
  title: "Angles on a line and at a point",
  description: "Identify and measure angles on a straight line at a point, and work out the sum of angles on a straight line and at a point.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["protractor-measure", "classical-line", "classical-point", "scenario-line", "scenario-point", "apply-reasoning", "angle-fact-match", "sort-scenario"] as const
    );

    if (branch === "protractor-measure") {
      const angle = randInt(rng, 15, 165);
      return {
        kind: "protractor",
        mode: "measure",
        rayBAngleDeg: angle,
        correctAngleDeg: angle,
        toleranceDeg: 3,
        prompt: "Drag the blue needle to line up exactly with the red ray, then submit your reading.",
        hint: "Line the needle up on top of the red ray, then read the degree mark it points to on the scale.",
        explanation: `The red ray sits at ${angle}° on the protractor scale.`,
      };
    }

    if (branch === "classical-line") {
      const a = randInt(rng, 20, 150);
      const b = 180 - a;
      return {
        kind: "fill-blank",
        prompt: `Two angles lie together on a straight line. One angle is ${a}°. Find the other angle.`,
        before: "Other angle =",
        after: "°",
        correctAnswer: String(b),
        inputMode: "numeric",
        hint: "Angles on a straight line add up to 180°.",
        explanation: `$180° - ${a}° = ${b}°$.`,
      };
    }

    if (branch === "classical-point") {
      const a = randInt(rng, 40, 150);
      const b = randInt(rng, 40, 150);
      const c = 360 - a - b;
      return {
        kind: "fill-blank",
        prompt: `Three angles meet at a single point. Two of them are ${a}° and ${b}°. Find the third angle.`,
        before: "Third angle =",
        after: "°",
        correctAnswer: String(c),
        inputMode: "numeric",
        hint: "Angles at a point add up to 360°.",
        explanation: `$360° - ${a}° - ${b}° = ${c}°$.`,
      };
    }

    if (branch === "scenario-line") {
      const scenario = randChoice(rng, LINE_SCENARIOS);
      const a = randInt(rng, 25, 155);
      const b = 180 - a;
      return {
        kind: "fill-blank",
        prompt: `${scenario}. The two angles formed lie on a straight line. One of them is ${a}°. Find the other.`,
        before: "Other angle =",
        after: "°",
        correctAnswer: String(b),
        inputMode: "numeric",
        hint: "Angles on a straight line always add up to 180°.",
        explanation: `Angles on a straight line sum to 180°: $180° - ${a}° = ${b}°$.`,
      };
    }

    if (branch === "scenario-point") {
      const scenario = randChoice(rng, POINT_SCENARIOS);
      const a = randInt(rng, 60, 140);
      const b = randInt(rng, 60, 140);
      const c = 360 - a - b;
      return {
        kind: "fill-blank",
        prompt: `${scenario}. Around that point, three angles are formed: two of them are ${a}° and ${b}°. Find the third angle.`,
        before: "Third angle =",
        after: "°",
        correctAnswer: String(c),
        inputMode: "numeric",
        hint: "Angles that meet at a point (a full turn) always add up to 360°.",
        explanation: `Angles at a point sum to 360°: $360° - ${a}° - ${b}° = ${c}°$.`,
      };
    }

    if (branch === "apply-reasoning") {
      const useLine = rng() < 0.5;
      if (useLine) {
        const scenario = randChoice(rng, LINE_SCENARIOS);
        const a = randInt(rng, 30, 150);
        const correct = 180 - a;
        const wrong = [String(360 - a), String(a), String(90 - Math.min(a, 89))];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correct), wrong, 3);
        return {
          kind: "multiple-choice",
          prompt: `${scenario}. The two angles formed lie on a straight line, and one of them is ${a}°. What is the other angle?`,
          choices: choices.map((c) => `${c}°`),
          correctIndex,
          layout: "row",
          hint: "Angles on a straight line add to 180° — a common mistake is using 360° (that's for angles at a point) instead.",
          explanation: `Angles on a straight line sum to 180°, not 360°: $180° - ${a}° = ${correct}°$.`,
        };
      }
      const scenario = randChoice(rng, POINT_SCENARIOS);
      const a = randInt(rng, 60, 140);
      const b = randInt(rng, 60, 140);
      const correct = 360 - a - b;
      const wrong = [String(180 - a - b < 0 ? a + b : 180 - a - b), String(360 - a), String(a + b)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correct), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${scenario}. Three angles meet at that point: ${a}°, ${b}°, and an unknown angle. Find the unknown angle.`,
        choices: choices.map((c) => `${c}°`),
        correctIndex,
        layout: "row",
        hint: "Angles that meet at a point add to 360° — a common mistake is using 180° (that's for angles on a straight line) instead.",
        explanation: `Angles at a point sum to 360°, not 180°: $360° - ${a}° - ${b}° = ${correct}°$.`,
      };
    }

    if (branch === "angle-fact-match") {
      const tokens = ANGLE_FACTS.map((f, i) => ({ id: `t${i}`, label: f.term }));
      const targets = shuffle(rng, ANGLE_FACTS.map((f, i) => ({ id: `m${i}`, label: f.meaning })));
      const correctMap: Record<string, string> = {};
      ANGLE_FACTS.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each angle fact to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about a full turn (360°) versus a straight line (180°).",
        explanation: ANGLE_FACTS.map((f) => `${f.term}: ${f.meaning}`).join("; ") + ".",
      };
    }

    // sort-scenario: sort scenario descriptions by whether they describe angles on a straight
    // line (180°) or angles at a point (360°).
    const chosenLine = shuffle(rng, LINE_SCENARIOS).slice(0, 3);
    const chosenPoint = shuffle(rng, POINT_SCENARIOS).slice(0, 3);
    const items = shuffle(rng, [
      ...chosenLine.map((s, i) => ({ id: `l${i}`, label: s, bucket: "line" as const })),
      ...chosenPoint.map((s, i) => ({ id: `p${i}`, label: s, bucket: "point" as const })),
    ]);
    const buckets = [
      { id: "line", label: "Angles on a straight line (sum to 180°)" },
      { id: "point", label: "Angles at a point (sum to 360°)" },
    ];
    const correctBucket: Record<string, string> = {};
    items.forEach((it) => (correctBucket[it.id] = it.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each scenario by whether it describes angles on a straight line, or angles meeting at a point.",
      items: items.map((it) => ({ id: it.id, label: it.label })),
      buckets,
      correctBucket,
      hint: "If the angles sit along one straight line, they sum to 180°. If they surround a single point (a full turn), they sum to 360°.",
      explanation: items.map((it) => `"${it.label}" — ${it.bucket === "line" ? "angles on a straight line (180°)" : "angles at a point (360°)"}.`).join(" "),
    };
  },
};
