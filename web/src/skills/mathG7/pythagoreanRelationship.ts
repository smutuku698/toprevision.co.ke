import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Pythagorean triples so every "missing side" comes out as a whole number.
const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
  [10, 24, 26],
  [20, 21, 29],
];

// The ladder-against-a-wall scenario (KICD's own example for this sub-strand) is a
// single fixed template with numbers varying via TRIPLES. Pool-size floor:
// RIGOR-STANDARDS.md requires either 10+ scenario templates or a wide place/actor pool
// layered on top when scenario wording is otherwise thin — these two pools (12 places,
// 12 actors) are threaded through find-leg and ladder-word so the ladder problem reads
// differently across sessions instead of the same fixed sentence every time.
const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Mombasa", "Nyeri", "Machakos",
  "Kitale", "Thika", "Kericho", "Malindi", "Nyahururu", "Garissa",
] as const;

const LADDER_USERS = [
  "painter", "electrician", "window cleaner", "firefighter", "roofer",
  "house mover", "builder", "handyman", "cable installer", "fruit picker",
  "signwriter", "TV aerial technician",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function ladderUser(rng: RNG) {
  return randChoice(rng, LADDER_USERS);
}

export const pythagoreanRelationship: Skill = {
  id: "g7-math-m-pythagorean-relationship",
  code: "M.1",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Pythagorean relationship",
  description: "Recognize the sides of a right-angled triangle, and identify and apply the Pythagorean relationship in real-life situations such as a ladder leaning on a wall.",
  generate(rng) {
    const branch = randChoice(rng, ["find-hypotenuse", "find-leg", "identify-hypotenuse", "check-right-angled", "ladder-word", "match-side-roles", "verify-steps"] as const);

    if (branch === "find-hypotenuse") {
      const [base, height, hyp] = randChoice(rng, TRIPLES);
      return {
        kind: "fill-blank",
        prompt: `A right-angled triangle has a base of ${base} cm and a height of ${height} cm. Find the length of the hypotenuse.`,
        visual: { type: "right-triangle", base, height, showHypotenuse: true, labelBase: `${base} cm`, labelHeight: `${height} cm` },
        before: "Hypotenuse =",
        after: "cm",
        correctAnswer: String(hyp),
        inputMode: "numeric",
        hint: "Pythagorean relationship: hypotenuse² = base² + height².",
        explanation: `$\\text{hyp}^2 = ${base}^2 + ${height}^2 = ${base * base} + ${height * height} = ${hyp * hyp}$, so hypotenuse $= \\sqrt{${hyp * hyp}} = ${hyp}$ cm.`,
      };
    }

    if (branch === "find-leg") {
      const [base, height, hyp] = randChoice(rng, TRIPLES);
      const askBase = rng() < 0.5;
      const known = askBase ? height : base;
      const missing = askBase ? base : height;
      const user = ladderUser(rng);
      const town = place(rng);
      return {
        kind: "fill-blank",
        prompt: `A ${user}'s ladder in ${town} is ${hyp} m long and leans against a wall. The ${askBase ? "height it reaches up the wall" : "distance from the wall to the ladder's foot"} is ${known} m. Find the ${askBase ? "distance from the wall to the ladder's foot" : "height it reaches up the wall"}.`,
        visual: {
          type: "right-triangle",
          base,
          height,
          showHypotenuse: true,
          labelBase: askBase ? "?" : `${base} m`,
          labelHeight: askBase ? `${height} m` : "?",
          labelHypotenuse: `${hyp} m`,
        },
        before: "Missing side =",
        after: "m",
        correctAnswer: String(missing),
        inputMode: "numeric",
        hint: "Rearrange: (missing side)² = hypotenuse² - (known side)².",
        explanation: `$\\text{missing}^2 = ${hyp}^2 - ${known}^2 = ${hyp * hyp} - ${known * known} = ${missing * missing}$, so missing side $= \\sqrt{${missing * missing}} = ${missing}$ m.`,
      };
    }

    if (branch === "identify-hypotenuse") {
      const [base, height, hyp] = randChoice(rng, TRIPLES);
      const choices = shuffle(rng, [`${base} cm (the base)`, `${height} cm (the height)`, `${hyp} cm (the longest side)`]);
      return {
        kind: "multiple-choice",
        prompt: "In a right-angled triangle formed by a ladder leaning against a wall, which side is the hypotenuse?",
        visual: { type: "right-triangle", base, height, showHypotenuse: true, labelBase: `${base} cm`, labelHeight: `${height} cm`, labelHypotenuse: `${hyp} cm` },
        choices,
        correctIndex: choices.indexOf(`${hyp} cm (the longest side)`),
        layout: "list",
        hint: "The hypotenuse is always the longest side, opposite the right angle — here, the ladder itself.",
        explanation: `The hypotenuse is the ladder, the longest side, opposite the right angle: ${hyp} cm.`,
      };
    }

    if (branch === "check-right-angled") {
      const trueTriples = shuffle(rng, TRIPLES).slice(0, 3);
      const fakeSets: [number, number, number][] = [
        [4, 5, 8],
        [6, 7, 11],
        [5, 9, 12],
        [7, 10, 15],
      ];
      const falseTriples = shuffle(rng, fakeSets).slice(0, 3);
      const items = shuffle(rng, [
        ...trueTriples.map((t, i) => ({ id: `t${i}`, label: `${t[0]}, ${t[1]}, ${t[2]}` })),
        ...falseTriples.map((t, i) => ({ id: `f${i}`, label: `${t[0]}, ${t[1]}, ${t[2]}` })),
      ]);
      const buckets = [
        { id: "right", label: "Forms a right-angled triangle" },
        { id: "not", label: "Does not form a right-angled triangle" },
      ];
      const correctBucket: Record<string, string> = {};
      trueTriples.forEach((_, i) => (correctBucket[`t${i}`] = "right"));
      falseTriples.forEach((_, i) => (correctBucket[`f${i}`] = "not"));
      return {
        kind: "categorize",
        prompt: "Sort each set of three side lengths by whether they form a right-angled triangle (check: does the sum of the squares of the two shorter sides equal the square of the longest?).",
        items,
        buckets,
        correctBucket,
        hint: "Square the two shortest sides, add them, and compare to the square of the longest side.",
        explanation: [...trueTriples, ...falseTriples]
          .map((t) => {
            const [a, b, c] = t;
            const works = a * a + b * b === c * c;
            return `${a}, ${b}, ${c}: ${a}² + ${b}² = ${a * a + b * b}, ${c}² = ${c * c} → ${works ? "right-angled" : "not right-angled"}`;
          })
          .join("; ") + ".",
      };
    }

    if (branch === "ladder-word") {
      const [base, height, hyp] = randChoice(rng, TRIPLES);
      const wrong = [String(hyp + 2), String(hyp - 1), String(base + height), String(Math.round(Math.sqrt(base * base + height * height + 4)))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(hyp), wrong);
      const user = ladderUser(rng);
      const town = place(rng);
      return {
        kind: "multiple-choice",
        prompt: `A ${user} in ${town} places the foot of a ladder ${base} m from the base of a wall. The ladder reaches ${height} m up the wall. What is the length of the ladder?`,
        visual: { type: "right-triangle", base, height, showHypotenuse: true, labelBase: `${base} m`, labelHeight: `${height} m` },
        choices,
        correctIndex,
        layout: "row",
        hint: "The ladder is the hypotenuse: use hyp² = base² + height².",
        explanation: `Ladder length $= \\sqrt{${base}^2 + ${height}^2} = \\sqrt{${base * base + height * height}} = ${hyp}$ m.`,
      };
    }

    if (branch === "match-side-roles") {
      const tokens = shuffle(rng, [
        { id: "base", label: "Base" },
        { id: "height", label: "Height" },
        { id: "hypotenuse", label: "Hypotenuse" },
      ]);
      const targets = shuffle(rng, [
        { id: "d-base", label: "One of the two shorter sides that form the right angle" },
        { id: "d-height", label: "The other shorter side that forms the right angle, perpendicular to the base" },
        { id: "d-hyp", label: "The longest side, opposite the right angle" },
      ]);
      const correctMap: Record<string, string> = { "d-base": "base", "d-height": "height", "d-hyp": "hypotenuse" };
      return {
        kind: "click-match",
        prompt: "Match each side of a right-angled triangle to its correct description.",
        tokens,
        targets,
        correctMap,
        hint: "The hypotenuse is always the longest side and is opposite the right angle.",
        explanation: "Base and height are the two shorter sides forming the right angle; the hypotenuse is the longest side, opposite the right angle.",
      };
    }

    // verify-steps: order the steps for verifying the Pythagorean relationship by counting squares
    const steps = [
      { id: "s1", label: "Draw a square on each of the three sides of the right-angled triangle" },
      { id: "s2", label: "Count the number of unit squares inside each of the two smaller squares" },
      { id: "s3", label: "Add the two smaller squares' unit-square counts together" },
      { id: "s4", label: "Compare that total to the number of unit squares inside the largest square" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps for verifying the Pythagorean relationship by counting squares in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You draw the squares first, then count, then add the two smaller totals, then compare to the largest.",
      explanation: "Steps: (1) draw a square on each side, (2) count unit squares in the two smaller squares, (3) add those two counts, (4) compare the total to the largest square's count — they will match.",
    };
  },
};
