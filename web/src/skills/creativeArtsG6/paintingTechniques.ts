import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.2 "Painting and Collage" — the painting half.
// The collage half of this same sub-strand ships separately as collage.ts (C.4), per
// curriculum-reference/grade-6/creative-arts.json's split note. Source content: classify colour
// categories on the colour wheel (primary/secondary/tertiary); mix and paint tonal gradation
// (thinning same tone / adding dark tone); brush stroke technique (position/angle, load, strokes)
// for texture; paint two overlapping objects inspired by a football game (tone and texture);
// mount the painting using mat technique (measure and cut, centre the picture). Core
// competencies name "Critical thinking and problem solving" — at least one Analyze/Evaluate
// branch is required, not just recall.

const COLOURS = [
  { name: "Red", category: "primary" },
  { name: "Yellow", category: "primary" },
  { name: "Blue", category: "primary" },
  { name: "Orange", category: "secondary" },
  { name: "Green", category: "secondary" },
  { name: "Violet", category: "secondary" },
  { name: "Yellow-orange", category: "tertiary" },
  { name: "Red-orange", category: "tertiary" },
  { name: "Red-violet", category: "tertiary" },
  { name: "Blue-violet", category: "tertiary" },
  { name: "Blue-green", category: "tertiary" },
  { name: "Yellow-green", category: "tertiary" },
] as const;

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "primary",
    label: "Primary colours",
    meaning: "Red, yellow and blue — the colours all other colours on the wheel are mixed from",
    blank: { before: "Red, yellow and blue are called the ", after: " colours, because all other colours are mixed from them.", correctAnswer: "primary" },
  },
  {
    id: "secondary",
    label: "Secondary colours",
    meaning: "Orange, green and violet — made by mixing two primary colours together",
    blank: { before: "Orange, green and violet are called ", after: " colours, made by mixing two primary colours.", correctAnswer: "secondary" },
  },
  {
    id: "tertiary",
    label: "Tertiary colours",
    meaning: "Colours like yellow-orange or blue-green, made by mixing a primary with a neighbouring secondary colour",
    blank: { before: "A colour like yellow-orange, made by mixing a primary with a neighbouring secondary colour, is called a ", after: " colour.", correctAnswer: "tertiary" },
  },
  {
    id: "tonal-gradation",
    label: "Tonal gradation",
    meaning: "A smooth change from light to dark across a painted surface, made by thinning the same tone or adding a darker tone",
    blank: { before: "A smooth change from light to dark across a painted surface is called ", after: ".", correctAnswer: "tonal gradation", acceptedAnswers: ["tonal gradation", "gradation"] },
  },
  {
    id: "brush-load",
    label: "Brush load",
    meaning: "How much paint is picked up on the brush before applying a stroke",
    blank: { before: "How much paint is picked up on the brush before a stroke is called brush ", after: ".", correctAnswer: "load" },
  },
  {
    id: "brush-angle",
    label: "Brush position/angle",
    meaning: "The direction and tilt the brush is held at, which changes the width and texture of a stroke",
    blank: { before: "The direction and tilt a brush is held at, which changes a stroke's width and texture, is the brush ", after: ".", correctAnswer: "angle", acceptedAnswers: ["angle", "position", "position/angle"] },
  },
  {
    id: "overlapping",
    label: "Overlapping",
    meaning: "Painting one object partly in front of another to show it is nearer",
    blank: { before: "Painting one object partly in front of another to show it is nearer is called ", after: ".", correctAnswer: "overlapping" },
  },
  {
    id: "mounting",
    label: "Mounting",
    meaning: "Attaching a finished picture, centred, onto a mat surface for display",
    blank: { before: "Attaching a finished picture, centred, onto a mat surface for display is called ", after: ".", correctAnswer: "mounting" },
  },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is painting a football scene in ${place(rng)} and wants to show that the ball is resting just in front of a player's boot, not floating beside it. Which technique should ${who} use?`,
      correct: "Overlapping — paint the ball partly covering the boot, so it clearly reads as nearer",
      wrong: [
        "Tonal gradation — this only changes light and dark, not which object is nearer",
        "Mounting — this is about displaying the finished picture, not painting depth",
        "Using only primary colours — colour choice alone does not show which object is nearer",
      ],
      explanation: "Overlapping — placing one shape partly in front of another — is specifically what shows a viewer which object is nearer, unlike tonal gradation, mounting, or colour choice alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} mixes green paint and wants to check it was made correctly. Which two colours should have been mixed to get green?`,
    correct: "Yellow and blue — two primary colours mixed to make the secondary colour green",
    wrong: [
      "Red and orange — orange is already a secondary colour, not one of the two primaries used for green",
      "Violet and yellow — violet is a secondary colour, not one of the two primaries used for green",
      "Green cannot be mixed — it must be bought as a ready-made paint",
    ],
    explanation: "Green is a secondary colour, made by mixing the two primary colours yellow and blue — it does not require another secondary colour or come only pre-made.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is painting a football overlapping a boot in ${place(rng)} and wants the ball's shaded underside to look darker than its lit top. Which method achieves this smooth change in tone?`,
      correct: "Tonal gradation — thinning the same tone or adding a darker tone as the paint moves from light to shadow",
      wrong: [
        "Overlapping — this shows which object is nearer, not how tone changes across one object",
        "Using only tertiary colours — colour category does not by itself create a smooth tonal change",
        "Mounting the picture on a dark mat — the mat colour does not change the tone painted on the picture itself",
      ],
      explanation: "Tonal gradation — smoothly thinning the same tone or adding a darker tone — is what creates the light-to-shadow effect, not overlapping, colour category, or mat choice.",
    };
  },
  (rng) => ({
    prompt: `Two learners in ${place(rng)} paint the same football scene. One presses the brush flat and drags it slowly, loaded with plenty of paint; the other tilts the brush on its edge with a lighter load. What is the most likely difference between their two strokes?`,
    correct: "The flat, heavily loaded brush makes a wide, solid stroke; the tilted, lightly loaded brush makes a thinner, more textured stroke",
    wrong: [
      "There is no real difference — brush position and load never affect a stroke's appearance",
      "The lightly loaded brush will always produce a darker stroke than the heavily loaded one",
      "Brush angle only matters when painting straight lines, never for texture",
    ],
    explanation: "Brush position/angle and brush load directly change a stroke's width and texture — a flat, heavily loaded brush gives a wide, solid stroke, while a tilted, lightly loaded brush gives a thinner, more textured one.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finishes a painting in ${place(rng)} and cuts a mat surface, but glues the picture off to one side instead of in the centre. Judged against the mounting technique taught in class, is this correct?`,
      correct: "No — mounting requires attaching the picture in a centred position on the mat surface",
      wrong: [
        "Yes — mat position never matters as long as the picture is glued down somewhere",
        "Yes — mounting only requires the mat to be cut to the right size, not centred attachment",
        "No — but only because the glue used was the wrong type, not because of the position",
      ],
      explanation: "Mounting specifically calls for measuring, cutting, and attaching the picture in a centred position on the mat — an off-centre picture does not meet the technique as taught, regardless of the glue used.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} wants to paint a bright yellow-orange border on a football-themed picture in ${place(rng)}, matching the colour wheel exactly. Which two colours should be mixed to get yellow-orange?`,
    correct: "Yellow (a primary) and orange (its neighbouring secondary colour)",
    wrong: [
      "Red and blue — mixing these two primaries gives violet, not yellow-orange",
      "Green and violet — mixing two secondary colours does not reliably give a named tertiary colour",
      "Yellow-orange cannot be mixed; it only exists as a pre-made paint",
    ],
    explanation: "A tertiary colour like yellow-orange is made by mixing a primary colour with its neighbouring secondary colour on the wheel — here, yellow and orange — not by mixing two primaries or two secondaries.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} paints a still, flat wash of exactly one tone across an entire football, with no lighter or darker areas at all. Compared to using tonal gradation, what is lost?`,
      correct: "The sense of light and shadow — the ball will look flat instead of rounded",
      wrong: [
        "Nothing is lost — a single flat tone shows form just as well as gradation does",
        "The colour category (primary/secondary/tertiary) of the paint used",
        "The ability to overlap the ball with another object",
      ],
      explanation: "A flat, single tone removes the light-to-shadow variation that suggests a rounded, three-dimensional form — this is exactly what tonal gradation is used to create.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} measures a mat surface carefully before cutting, in ${place(rng)}'s art class. Which subject's skills does this step in mounting draw on?`,
    correct: "Mathematics — measuring and cutting to prepare the mat surface",
    wrong: [
      "Music — mounting a painting has no connection to musical skills",
      "Physical Education — mounting is a still, seated activity, not a physical skill",
      "It draws on no other subject's skills at all",
    ],
    explanation: "Preparing and cutting a mat surface to the right size is explicitly linked to Mathematics — measuring and cutting are mathematical skills applied here for a Creative Arts purpose.",
  }),
];

const CATEGORISE_PROMPTS = ["Sort each colour by its category on the colour wheel.", "Which category does each colour belong to? Sort them.", "Sort these colours into primary, secondary, or tertiary.", "Match each colour to its wheel category by sorting.", "Classify each colour on the colour wheel."] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each painting term with its definition.", "Match each word to what it means in painting technique.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const WHEEL_PROMPTS = ["Which colour category is highlighted on this colour wheel?", "Name the highlighted category on the wheel.", "Identify the highlighted colour category.", "Look at the wheel — which category is highlighted?", "Which category do the highlighted segments belong to?"] as const;
const STEPS_PROMPTS = ["Put these mounting steps in the correct order.", "Arrange the steps for mounting a painting.", "Order these steps, from first to last.", "Sort these mounting steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about painting technique.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const MOUNTING_STEPS = [
  { id: "m1", label: "Finish and dry the painting completely" },
  { id: "m2", label: "Source mounting materials and tools — mat paper, glue, cutting tools" },
  { id: "m3", label: "Measure the mat surface to the right size" },
  { id: "m4", label: "Cut the mat surface" },
  { id: "m5", label: "Attach the picture in a centred position on the mat" },
] as const;

export const paintingTechniques: Skill = {
  id: "g6-cas-painting-techniques",
  code: "C.3",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Painting techniques",
  description: "Classifying colours on the colour wheel (primary, secondary, tertiary), creating tonal gradation and brush-stroke texture, painting overlapping objects, and mounting a painting using mat technique.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "wheel-highlight", "term-match", "reasoning", "mounting-steps", "fill-blank"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, COLOURS).slice(0, 8);
      const items = chosen.map((c, i) => ({ id: `col${i}`, label: c.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`col${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORISE_PROMPTS),
        items,
        buckets: [
          { id: "primary", label: "Primary" },
          { id: "secondary", label: "Secondary" },
          { id: "tertiary", label: "Tertiary" },
        ],
        correctBucket,
        hint: "Primary colours mix into secondary colours; a primary mixed with a neighbouring secondary makes a tertiary colour.",
        explanation: chosen.map((c) => `${c.name} is a ${c.category} colour.`).join(" "),
      };
    }

    if (branch === "wheel-highlight") {
      const category = randChoice(rng, ["primary", "secondary", "tertiary"] as const);
      const others = (["primary", "secondary", "tertiary"] as const).filter((c) => c !== category);
      const choices = shuffle(rng, [category, ...others]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHEEL_PROMPTS),
        choices: choices.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
        correctIndex: choices.indexOf(category),
        layout: "list",
        visual: { type: "color-wheel", highlight: category },
        hint: "Primary colours sit evenly spaced around the wheel; secondary colours sit between them; tertiary colours sit between a primary and its neighbouring secondary.",
        explanation: `The highlighted segments are the ${category} colours.`,
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about colours, tone, brush handling, and how a finished painting is displayed.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about which technique — colour mixing, tone, brush handling, overlapping, or mounting — the situation is really about.", explanation: q.explanation };
    }

    if (branch === "mounting-steps") {
      const shuffled = shuffle(rng, MOUNTING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MOUNTING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Finish the painting first, then gather materials, then measure, cut, and finally attach.",
        explanation: "Correct order: " + MOUNTING_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about the colour wheel, tone, brush technique, and mounting.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
