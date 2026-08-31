import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 3.1(b)/(c): bisecting a line segment (ruler and compasses) and constructing a perpendicular
// line. 34 real-world scenarios (17 bisecting, 17 perpendicular) — over the 30+ floor for this
// round, spread across the numeric word-problem branch, the categorize branch, and the
// reasoning multiple-choice branch.
const SCENARIOS = [
  { type: "bisect", object: "a length of ribbon", reason: "to find its exact midpoint for a bow", unit: "cm", min: 10, max: 150 },
  { type: "bisect", object: "a school banner", reason: "to mark its centre for a tie string", unit: "cm", min: 40, max: 200 },
  { type: "bisect", object: "a skipping rope", reason: "to find the middle point for the two handles", unit: "cm", min: 100, max: 250 },
  { type: "bisect", object: "a wooden plank", reason: "to mark the exact centre for a seesaw pivot", unit: "cm", min: 150, max: 300 },
  { type: "bisect", object: "a piece of string", reason: "to cut two equal lengths from it", unit: "cm", min: 10, max: 150 },
  { type: "bisect", object: "a fence line", reason: "to find the exact spot to place a middle gate post", unit: "m", min: 4, max: 40 },
  { type: "bisect", object: "a curtain rail", reason: "to find its centre before hanging curtains evenly", unit: "cm", min: 60, max: 250 },
  { type: "bisect", object: "a blackboard's length", reason: "to mark the centre before writing a heading", unit: "cm", min: 150, max: 300 },
  { type: "bisect", object: "a football pitch's halfway line", reason: "to mark the exact centre spot for kick-off", unit: "m", min: 30, max: 70 },
  { type: "bisect", object: "a running track's straight section", reason: "to place a marker exactly halfway", unit: "m", min: 20, max: 100 },
  { type: "bisect", object: "a tug-of-war rope", reason: "to mark the exact centre before the match begins", unit: "m", min: 8, max: 30 },
  { type: "bisect", object: "a classroom wall", reason: "to find the centre for hanging a wall chart evenly", unit: "m", min: 4, max: 10 },
  { type: "bisect", object: "a water pipe run", reason: "to find the midpoint for placing a joint", unit: "m", min: 4, max: 40 },
  { type: "bisect", object: "a wire fence span", reason: "to find the exact centre for an extra support post", unit: "m", min: 4, max: 40 },
  { type: "bisect", object: "a table's edge", reason: "to find the centre point for placing a vase", unit: "cm", min: 60, max: 180 },
  { type: "bisect", object: "a volleyball net's length", reason: "to mark the exact centre for the referee's post", unit: "m", min: 6, max: 12 },
  { type: "bisect", object: "a maize row", reason: "to find the midpoint for placing an irrigation outlet", unit: "m", min: 6, max: 50 },
  { type: "perpendicular", object: "a classroom wall", reason: "so it meets the floor at a right angle for a level room" },
  { type: "perpendicular", object: "a doorframe", reason: "so the door swings smoothly without scraping" },
  { type: "perpendicular", object: "a gate post", reason: "so the gate hangs straight and does not lean" },
  { type: "perpendicular", object: "a flagpole", reason: "so the flag stands upright from level ground" },
  { type: "perpendicular", object: "a shelf bracket", reason: "so the shelf sits level and does not tip over" },
  { type: "perpendicular", object: "a table leg", reason: "so the tabletop stays flat and stable" },
  { type: "perpendicular", object: "a boundary wall corner", reason: "so the two walls meet neatly at a right angle" },
  { type: "perpendicular", object: "a signpost", reason: "so the sign stands upright and is easy to read" },
  { type: "perpendicular", object: "a window frame", reason: "so the glass pane fits squarely without gaps" },
  { type: "perpendicular", object: "a staircase step", reason: "so each step is level and safe to walk on" },
  { type: "perpendicular", object: "a football goalpost", reason: "so the upright stands straight from the ground" },
  { type: "perpendicular", object: "a fence post", reason: "so the fence line stays straight and does not lean" },
  { type: "perpendicular", object: "a picture frame's corner", reason: "so the frame looks neat and square on the wall" },
  { type: "perpendicular", object: "a school notice board's stand", reason: "so the board stays upright and does not topple" },
  { type: "perpendicular", object: "a water tank stand's leg", reason: "so the tank sits level and does not spill" },
  { type: "perpendicular", object: "a bookshelf's side panel", reason: "so the shelves stay level for stacking books" },
  { type: "perpendicular", object: "a chalkboard easel's leg", reason: "so the board stands steady during a lesson" },
] as const;

type ScenarioItem = (typeof SCENARIOS)[number];
type BisectScenario = Extract<ScenarioItem, { type: "bisect" }>;
type PerpScenario = Extract<ScenarioItem, { type: "perpendicular" }>;

const BISECT_SCENARIOS = SCENARIOS.filter((s): s is BisectScenario => s.type === "bisect");
const PERP_SCENARIOS = SCENARIOS.filter((s): s is PerpScenario => s.type === "perpendicular");

// Fixed 5-step ruler-and-compass procedure — a procedural sequence, not a content pool.
const BISECT_STEPS = [
  { id: "s1", label: "Place the compass point on one end of the line segment" },
  { id: "s2", label: "Open the compass to more than half the line's length" },
  { id: "s3", label: "Draw an arc above and below the line" },
  { id: "s4", label: "Without changing the compass width, repeat from the other end to draw two more crossing arcs" },
  { id: "s5", label: "Draw a straight line through the two points where the arcs cross — this bisects the line" },
] as const;

export const bisectingAndConstructingLines: Skill = {
  id: "g6-math-g-bisecting-constructing-lines",
  code: "G.2",
  subjectId: "math",
  strandId: "g6-math-geometry",
  grade: 6,
  title: "Bisecting and constructing lines",
  description: "Bisect a line segment and construct a perpendicular line using geometrical instruments, and understand why these constructions matter in daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["bisect-length", "construct-perpendicular", "bisect-steps", "why-perpendicular", "sort-construction"] as const);

    if (branch === "bisect-length") {
      const sc = randChoice(rng, BISECT_SCENARIOS);
      const half = randInt(rng, Math.ceil(sc.min / 2), Math.floor(sc.max / 2));
      const total = half * 2; // always even, so the half is a whole number
      const reverse = rng() < 0.5;
      if (!reverse) {
        return {
          kind: "fill-blank",
          prompt: `A builder wants to bisect ${sc.object}, ${sc.reason}. The ${sc.object.replace(/^a /, "")} is ${total} ${sc.unit} long. Find the length of each half after bisecting it.`,
          before: "Each half =",
          after: sc.unit,
          correctAnswer: String(half),
          inputMode: "numeric",
          hint: "Bisecting means cutting exactly in half — divide the total length by 2.",
          explanation: `Bisecting divides the length equally: $${total} \\div 2 = ${half}$ ${sc.unit}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `${sc.object[0].toUpperCase()}${sc.object.slice(1)} is bisected, ${sc.reason}. Each half measures ${half} ${sc.unit}. Find the original total length before it was bisected.`,
        before: "Original length =",
        after: sc.unit,
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "If bisecting halves the length, the original length is double each half.",
        explanation: `Since bisecting halves the length: $${half} \\times 2 = ${total}$ ${sc.unit}.`,
      };
    }

    if (branch === "construct-perpendicular") {
      return {
        kind: "protractor",
        mode: "construct",
        correctAngleDeg: 90,
        toleranceDeg: 3,
        prompt: "Construct a perpendicular line: drag the needle so it forms an exact right angle (90°) with the fixed baseline ray, then submit.",
        hint: "A perpendicular line meets the baseline at exactly 90°.",
        explanation: "Two lines are perpendicular when they cross at exactly 90°, so the needle must line up on the 90° mark.",
      };
    }

    if (branch === "bisect-steps") {
      return {
        kind: "ordering",
        prompt: "Put these steps for bisecting a line segment with a ruler and compasses in the correct order.",
        instruction: "Click the steps in order.",
        items: shuffle(rng, BISECT_STEPS),
        correctOrder: BISECT_STEPS.map((s) => s.id),
        hint: "You need arcs from both ends of the line before you can find where they cross.",
        explanation: "Steps: (1) compass point on one end, (2) open past half the length, (3) draw arcs above and below, (4) repeat from the other end, (5) join the two crossing points — that line bisects the original.",
      };
    }

    if (branch === "why-perpendicular") {
      const sc = randChoice(rng, PERP_SCENARIOS);
      const correct = `Because a perpendicular line meets ${sc.object} at an exact right angle (90°), ${sc.reason}`;
      const wrong = [
        `Because perpendicular lines never meet, no matter how far they extend`,
        `Because perpendicular lines are always exactly the same length as each other`,
        `Because perpendicular lines can cross at any angle, as long as they cross at all`,
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Why is it important to construct ${sc.object} perpendicular to the surface it meets, ${sc.reason}?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Perpendicular means meeting at exactly 90° — think about what would go wrong if the angle were not a right angle.",
        explanation: `${correct}. Perpendicular lines are defined by meeting at exactly 90° — not by never meeting (that's parallel), and not by being equal in length or crossing at just any angle.`,
      };
    }

    // sort-construction: sort tasks by whether they need bisecting or a perpendicular construction
    const chosenBisect = shuffle(rng, BISECT_SCENARIOS).slice(0, 3);
    const chosenPerp = shuffle(rng, PERP_SCENARIOS).slice(0, 3);
    const items = shuffle(rng, [
      ...chosenBisect.map((s, i) => ({ id: `b${i}`, label: `Finding the exact midpoint of ${s.object}, ${s.reason}`, bucket: "bisect" as const })),
      ...chosenPerp.map((s, i) => ({ id: `p${i}`, label: `Making ${s.object} meet at a right angle, ${s.reason}`, bucket: "perpendicular" as const })),
    ]);
    const buckets = [
      { id: "bisect", label: "Needs bisecting (finding a midpoint)" },
      { id: "perpendicular", label: "Needs a perpendicular construction (a right angle)" },
    ];
    const correctBucket: Record<string, string> = {};
    items.forEach((it) => (correctBucket[it.id] = it.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each construction task by whether it needs bisecting a line, or constructing a perpendicular line.",
      items: items.map((it) => ({ id: it.id, label: it.label })),
      buckets,
      correctBucket,
      hint: "Bisecting is about finding a middle point. Constructing a perpendicular is about forming a right angle.",
      explanation: items.map((it) => `"${it.label}" — ${it.bucket === "bisect" ? "bisecting" : "perpendicular construction"}.`).join(" "),
    };
  },
};
