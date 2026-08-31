import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// 3.2(d)-(f): sum of angles in a triangle (180°) and a rectangle (360°); identifying and
// measuring equilateral, right-angled, and isosceles triangles. 30 real-world triangle-shaped
// Kenyan objects (10 per type) — meets the 30+ floor for this round.
const TRIANGLE_OBJECTS = [
  { label: "A 'Yield' road warning sign", type: "equilateral" },
  { label: "A school badge's triangular logo", type: "equilateral" },
  { label: "A triangular bunting flag on a string of decorations", type: "equilateral" },
  { label: "A triangular road-works warning sign", type: "equilateral" },
  { label: "A triangular company logo sign outside a shop", type: "equilateral" },
  { label: "A triangular kite panel", type: "equilateral" },
  { label: "A percussion 'triangle' musical instrument", type: "equilateral" },
  { label: "A triangular caution sign placed behind a broken-down car", type: "equilateral" },
  { label: "A triangular pennant flag at a school sports day", type: "equilateral" },
  { label: "A triangular slice cut from a round cake into six equal pieces", type: "equilateral" },
  { label: "A carpenter's set square", type: "right-angled" },
  { label: "A dhow's triangular sail", type: "right-angled" },
  { label: "A wheelchair access ramp's side profile", type: "right-angled" },
  { label: "A doorstop wedge", type: "right-angled" },
  { label: "A triangular offcut sawn from the diagonal of a rectangular plank", type: "right-angled" },
  { label: "A roof rafter's end triangle against a vertical wall", type: "right-angled" },
  { label: "A triangular support bracket fixed under a shelf", type: "right-angled" },
  { label: "A technical-drawing set square used in a classroom", type: "right-angled" },
  { label: "A triangular flag-holder bracket on a wall", type: "right-angled" },
  { label: "A garden bed's corner cut at a right angle", type: "right-angled" },
  { label: "A traditional Maasai shield's pointed top", type: "isosceles" },
  { label: "A church roof's front gable", type: "isosceles" },
  { label: "A camping tent's front triangular flap", type: "isosceles" },
  { label: "A traditional thatched hut's roof triangle", type: "isosceles" },
  { label: "A samosa's triangular fold", type: "isosceles" },
  { label: "A steep-hill road warning sign", type: "isosceles" },
  { label: "A triangular bookend", type: "isosceles" },
  { label: "A triangular pendant on a necklace", type: "isosceles" },
  { label: "A roof truss over a church entrance porch", type: "isosceles" },
  { label: "A triangular flag on a sailing boat's mast", type: "isosceles" },
] as const;

type TriangleType = (typeof TRIANGLE_OBJECTS)[number]["type"];

const TYPE_LABEL: Record<TriangleType, string> = {
  equilateral: "Equilateral triangle",
  "right-angled": "Right-angled triangle",
  isosceles: "Isosceles triangle",
};

const TYPE_DESCRIPTION: Record<TriangleType, string> = {
  equilateral: "all three angles equal 60°",
  "right-angled": "one angle equals exactly 90°",
  isosceles: "two of the three angles are equal",
};

function angleSetFor(rng: RNG, type: TriangleType): [number, number, number] {
  if (type === "equilateral") return [60, 60, 60];
  if (type === "right-angled") {
    // Exclude 45° — a 45/45/90 triangle would be ambiguous (also isosceles).
    let a = randInt(rng, 20, 70);
    if (a === 45) a = 40;
    return [90, a, 90 - a];
  }
  // isosceles: two equal base angles, apex whatever remains — avoid 60 (equilateral) and 45 (would
  // make the apex 90°, ambiguous with right-angled).
  let base = randInt(rng, 20, 79);
  if (base === 60) base = 65;
  if (base === 45) base = 50;
  const apex = 180 - 2 * base;
  return [base, base, apex];
}

// Fixed 4-step procedure — a small procedural sequence, not a content pool.
const EQUILATERAL_STEPS = [
  { id: "s1", label: "Draw a straight base line of the required side length" },
  { id: "s2", label: "Open the compass to the length of that base line" },
  { id: "s3", label: "Place the compass point on each end of the base in turn and draw two arcs that cross above it" },
  { id: "s4", label: "Join each end of the base to the point where the arcs cross" },
] as const;

export const triangleTypesAndAngleSums: Skill = {
  id: "g6-math-g-triangle-types-angle-sums",
  code: "G.4",
  subjectId: "math",
  strandId: "g6-math-geometry",
  grade: 6,
  title: "Triangle types and angle sums",
  description: "Find the sum of angles in triangles and rectangles, construct and identify equilateral, right-angled, and isosceles triangles, and measure their interior angles.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["triangle-angle-sum", "rectangle-angle-sum", "identify-type", "match-object", "sort-objects", "measure-angle", "construct-steps"] as const
    );

    if (branch === "triangle-angle-sum") {
      const a = randInt(rng, 30, 100);
      const b = randInt(rng, 30, Math.min(100, 140 - a));
      const c = 180 - a - b;
      const askC = rng() < 0.7;
      if (askC) {
        return {
          kind: "fill-blank",
          prompt: `A triangle has two angles of ${a}° and ${b}°. Find the third angle.`,
          before: "Third angle =",
          after: "°",
          correctAnswer: String(c),
          inputMode: "numeric",
          hint: "The three angles in a triangle always add up to 180°.",
          explanation: `$180° - ${a}° - ${b}° = ${c}°$.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `A triangle has angles of ${a}°, ${b}°, and ${c}°. Find the sum of its interior angles.`,
        before: "Sum =",
        after: "°",
        correctAnswer: "180",
        inputMode: "numeric",
        hint: "The interior angles of any triangle always add up to the same total.",
        explanation: `$${a}° + ${b}° + ${c}° = 180°$ — the angle sum of any triangle.`,
      };
    }

    if (branch === "rectangle-angle-sum") {
      const askMissing = rng() < 0.5;
      if (askMissing) {
        return {
          kind: "fill-blank",
          prompt: "A rectangle has three of its four corner angles marked, each 90°. Find the fourth angle.",
          before: "Fourth angle =",
          after: "°",
          correctAnswer: "90",
          inputMode: "numeric",
          hint: "Every corner of a rectangle is a right angle.",
          explanation: "Every angle in a rectangle is exactly 90°, so the fourth angle is also 90°.",
        };
      }
      return {
        kind: "fill-blank",
        prompt: "A rectangle has four corner angles, each 90°. Find the sum of all four interior angles.",
        before: "Sum =",
        after: "°",
        correctAnswer: "360",
        inputMode: "numeric",
        hint: "Add up all four 90° corner angles.",
        explanation: "$90° \\times 4 = 360°$ — the angle sum of a rectangle.",
      };
    }

    if (branch === "identify-type") {
      const obj = randChoice(rng, TRIANGLE_OBJECTS);
      const angles = angleSetFor(rng, obj.type);
      const otherTypes = (["equilateral", "right-angled", "isosceles"] as const).filter((t) => t !== obj.type);
      const choices = shuffle(rng, [TYPE_LABEL[obj.type], ...otherTypes.map((t) => TYPE_LABEL[t])]);
      return {
        kind: "multiple-choice",
        prompt: `A triangle has interior angles ${angles[0]}°, ${angles[1]}°, and ${angles[2]}°. What type of triangle is it?`,
        choices,
        correctIndex: choices.indexOf(TYPE_LABEL[obj.type]),
        layout: "list",
        hint: "Check: are all three angles equal (equilateral)? Is one angle exactly 90° (right-angled)? Are exactly two angles equal (isosceles)?",
        explanation: `${angles.join("°, ")}° is a triangle where ${TYPE_DESCRIPTION[obj.type]} — a ${TYPE_LABEL[obj.type].toLowerCase()}.`,
      };
    }

    if (branch === "match-object") {
      // Pick exactly one object per type so the match stays strictly 1:1.
      const chosen = (["equilateral", "right-angled", "isosceles"] as const).map((t) => randChoice(rng, TRIANGLE_OBJECTS.filter((o) => o.type === t)));
      const tokens = chosen.map((o, i) => ({ id: `t${i}`, label: o.label }));
      const targets = shuffle(rng, chosen.map((o, i) => ({ id: `m${i}`, label: TYPE_LABEL[o.type] })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each real-world triangle to its type.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the shape's angles: all equal, one right angle, or two equal angles.",
        explanation: chosen.map((o) => `${o.label} — ${TYPE_LABEL[o.type]} (${TYPE_DESCRIPTION[o.type]}).`).join(" "),
      };
    }

    if (branch === "sort-objects") {
      const chosen = shuffle(rng, TRIANGLE_OBJECTS).slice(0, 6);
      const items = chosen.map((o, i) => ({ id: `o${i}`, label: o.label }));
      const buckets = (["equilateral", "right-angled", "isosceles"] as const).map((t) => ({ id: t, label: TYPE_LABEL[t] }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((o, i) => (correctBucket[`o${i}`] = o.type));
      return {
        kind: "categorize",
        prompt: "Sort each real-world triangle by its type.",
        items,
        buckets,
        correctBucket,
        hint: "Think about which of these triangle shapes has all sides/angles equal, a right angle, or just two equal angles.",
        explanation: chosen.map((o) => `${o.label} — ${TYPE_LABEL[o.type]}.`).join(" "),
      };
    }

    if (branch === "measure-angle") {
      const angle = randInt(rng, 30, 150);
      return {
        kind: "protractor",
        mode: "measure",
        rayBAngleDeg: angle,
        correctAngleDeg: angle,
        toleranceDeg: 3,
        prompt: "This is one interior angle of a triangle drawn on the baseline ray. Drag the needle to line up with the red ray and measure it.",
        hint: "Line the needle up on top of the red ray, then read the degree mark it points to.",
        explanation: `The marked interior angle measures ${angle}°.`,
      };
    }

    // construct-steps: order the steps for constructing an equilateral triangle
    return {
      kind: "ordering",
      prompt: "Put these steps for constructing an equilateral triangle with a ruler and compasses in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, EQUILATERAL_STEPS),
      correctOrder: EQUILATERAL_STEPS.map((s) => s.id),
      hint: "You need the base line drawn before you can swing arcs from its two ends.",
      explanation: "Steps: (1) draw the base line, (2) open the compass to the base's length, (3) draw crossing arcs from each end, (4) join the base's ends to the arcs' crossing point.",
    };
  },
};
