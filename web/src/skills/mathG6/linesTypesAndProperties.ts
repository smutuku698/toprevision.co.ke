import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// 3.1(a)/(d): identify/distinguish parallel, perpendicular and intersecting lines from
// real-world Kenyan examples. 36 entries (12 per type) — well over the 30+ floor for this round.
const LINE_EXAMPLES = [
  { label: "The two rails of a railway track", type: "parallel" },
  { label: "The opposite edges of a wooden ruler", type: "parallel" },
  { label: "The rungs of a ladder leaning against a wall", type: "parallel" },
  { label: "The ruled lines on a page of an exercise book", type: "parallel" },
  { label: "The touchlines running along the length of a football pitch", type: "parallel" },
  { label: "Rows of maize planted in straight lines on a shamba", type: "parallel" },
  { label: "The strings stretched across a guitar", type: "parallel" },
  { label: "The horizontal bars of a window security grille", type: "parallel" },
  { label: "The two edges of a matatu's luggage rail", type: "parallel" },
  { label: "The lane markings running along a highway", type: "parallel" },
  { label: "The rails of a staircase banister", type: "parallel" },
  { label: "Electricity wires strung between two poles along a road", type: "parallel" },
  { label: "The corner where two edges of an exercise book page meet", type: "perpendicular" },
  { label: "The corner where two walls of a classroom meet", type: "perpendicular" },
  { label: "The hands of a clock showing exactly 3 o'clock", type: "perpendicular" },
  { label: "The blade and handle of a carpenter's try square", type: "perpendicular" },
  { label: "The corner where a wall meets the floor", type: "perpendicular" },
  { label: "The vertical and horizontal strokes forming the capital letter T", type: "perpendicular" },
  { label: "The corner of a wooden table", type: "perpendicular" },
  { label: "The upright post and crossbar of a football goalpost", type: "perpendicular" },
  { label: "The spine and top edge of a closed exercise book", type: "perpendicular" },
  { label: "The corner of a window frame", type: "perpendicular" },
  { label: "A flagpole standing straight up from level ground", type: "perpendicular" },
  { label: "The corner of a classroom door frame", type: "perpendicular" },
  { label: "Two roads crossing diagonally at a slanted junction", type: "intersecting" },
  { label: "The blades of an open pair of scissors", type: "intersecting" },
  { label: "The strokes forming the letter X", type: "intersecting" },
  { label: "Two shoelaces crossing over each other", type: "intersecting" },
  { label: "The crossed sticks of a kite frame", type: "intersecting" },
  { label: "A knife and fork placed crossed on a plate", type: "intersecting" },
  { label: "The ribs of a folding hand fan, partly opened", type: "intersecting" },
  { label: "Two footpaths crossing at a slant across a field", type: "intersecting" },
  { label: "The strokes forming the letter K", type: "intersecting" },
  { label: "Overhead power lines crossing a road at a slant", type: "intersecting" },
  { label: "Two tree branches crossing each other at an angle", type: "intersecting" },
  { label: "Two strips of masking tape stuck across each other at a slant", type: "intersecting" },
] as const;

type LineType = (typeof LINE_EXAMPLES)[number]["type"];

const TYPE_LABEL: Record<LineType, string> = {
  parallel: "Parallel lines",
  perpendicular: "Perpendicular lines",
  intersecting: "Intersecting lines (crossing, not at a right angle)",
};

const TYPE_DEFINITION: Record<LineType, string> = {
  parallel: "lines that stay the same distance apart and never meet, however far they are extended",
  perpendicular: "lines that cross each other at an exact right angle (90°)",
  intersecting: "lines that cross each other at a point, at an angle that is not a right angle",
};

// Fixed 4-step procedure — a small procedural sequence, not a content pool, so it stays under 30.
const PARALLEL_TEST_STEPS = [
  { id: "s1", label: "Place a set square against one of the lines" },
  { id: "s2", label: "Slide a ruler up against the other edge of the set square" },
  { id: "s3", label: "Hold the ruler firmly and slide the set square along it to the second line" },
  { id: "s4", label: "If the set square's edge lies flush against the second line too, the lines are parallel" },
] as const;

export const linesTypesAndProperties: Skill = {
  id: "g6-math-g-lines-types-properties",
  code: "G.1",
  subjectId: "math",
  strandId: "g6-math-geometry",
  grade: 6,
  title: "Types and properties of lines",
  description: "Identify and distinguish parallel, perpendicular, and intersecting lines from descriptions and real-world Kenyan examples, and appreciate their everyday uses.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-type", "match-one-of-each", "sort-examples", "name-the-type", "test-steps"] as const);

    if (branch === "identify-type") {
      const ex = randChoice(rng, LINE_EXAMPLES);
      const otherTypes = (["parallel", "perpendicular", "intersecting"] as const).filter((t) => t !== ex.type);
      const choices = shuffle(rng, [TYPE_LABEL[ex.type], ...otherTypes.map((t) => TYPE_LABEL[t])]);
      return {
        kind: "multiple-choice",
        prompt: `${ex.label} is an everyday example of which type of lines?`,
        choices,
        correctIndex: choices.indexOf(TYPE_LABEL[ex.type]),
        layout: "list",
        hint: "Ask: do the lines stay the same distance apart forever (parallel), cross at exactly 90° (perpendicular), or cross at some other angle (intersecting)?",
        explanation: `${ex.label} shows ${TYPE_DEFINITION[ex.type]} — this is an example of ${TYPE_LABEL[ex.type].toLowerCase()}.`,
      };
    }

    if (branch === "match-one-of-each") {
      // Pick exactly one example per type so the match stays strictly 1:1.
      const chosen = (["parallel", "perpendicular", "intersecting"] as const).map((t) => randChoice(rng, LINE_EXAMPLES.filter((e) => e.type === t)));
      const tokens = chosen.map((e, i) => ({ id: `t${i}`, label: e.label }));
      const targets = shuffle(rng, chosen.map((e, i) => ({ id: `m${i}`, label: TYPE_LABEL[e.type] })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each everyday example to the type of lines it shows.",
        tokens,
        targets,
        correctMap,
        hint: "Picture the two lines in each example, then decide how they relate to each other.",
        explanation: chosen.map((e) => `${e.label} — ${TYPE_LABEL[e.type]}.`).join(" "),
      };
    }

    if (branch === "sort-examples") {
      const chosen = shuffle(rng, LINE_EXAMPLES).slice(0, 6);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.label }));
      const buckets = (["parallel", "perpendicular", "intersecting"] as const).map((t) => ({ id: t, label: TYPE_LABEL[t] }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.type));
      return {
        kind: "categorize",
        prompt: "Sort each everyday example by the type of lines it shows.",
        items,
        buckets,
        correctBucket,
        hint: "Parallel lines never meet; perpendicular lines cross at 90°; intersecting lines cross at some other angle.",
        explanation: chosen.map((e) => `${e.label} — ${TYPE_LABEL[e.type]}.`).join(" "),
      };
    }

    if (branch === "name-the-type") {
      const ex = randChoice(rng, LINE_EXAMPLES);
      return {
        kind: "fill-blank",
        prompt: `${ex.label} shows lines that are: parallel, perpendicular, or intersecting?`,
        before: "Type of lines:",
        after: "",
        correctAnswer: ex.type,
        acceptedAnswers: [ex.type, TYPE_LABEL[ex.type].toLowerCase()],
        inputMode: "text",
        hint: "Think about whether the lines stay apart forever, cross at a right angle, or cross at some other angle.",
        explanation: `${ex.label} shows ${TYPE_DEFINITION[ex.type]} — the answer is "${ex.type}".`,
      };
    }

    // test-steps: order the steps for testing whether two lines are parallel with a set square and ruler
    return {
      kind: "ordering",
      prompt: "Put these steps for testing whether two lines are parallel, using a ruler and set square, in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, PARALLEL_TEST_STEPS),
      correctOrder: PARALLEL_TEST_STEPS.map((s) => s.id),
      hint: "You need the set square against the first line before you can slide it along a ruler to check the second line.",
      explanation: "Steps: (1) set square against the first line, (2) slide a ruler against the set square's other edge, (3) slide the set square along the ruler to the second line, (4) check the set square's edge lies flush against it.",
    };
  },
};
