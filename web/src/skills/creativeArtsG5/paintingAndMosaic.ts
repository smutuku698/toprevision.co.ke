import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  FILL_BLANK_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.4 "Painting
// and Mosaic" (12 lessons).
//
// Mined verbatim: Colour wheel (primary and secondary colours); Painting — wash techniques
// (flat and graded wash, focus on colour value); Materials for mosaic (recyclable coloured
// paper or banana fibres, suitable adhesives and supports); Making mosaic (mono media and
// spacing of the materials; paint the support one colour to contrast the pasted material;
// sketch one form — a fruit/bird/animal). Key inquiry: how do we use pictures in our daily
// lives? Core competencies: Creativity and Imagination; **Critical Thinking and Problem
// solving** (analyses and evaluates choices in colour and technique) — so this skill carries
// at least one Evaluate-tier branch, per RIGOR-STANDARDS.md. Links: Science and Technology
// (colour classification), Mathematics (geometric patterns in mosaic).
//
// Visual coverage: uses the registered { type: "color-wheel" } VisualSpec. No mosaic or
// wash-gradient VisualSpec exists; that omission is a deliberate scope call for this pass.

const SECONDARY = [
  { colour: "orange", from: ["red", "yellow"] },
  { colour: "green", from: ["blue", "yellow"] },
  { colour: "purple", from: ["red", "blue"] },
] as const;

const COLOUR_FACTS = [
  { text: "Red is a colour you cannot make by mixing other colours", group: "primary" },
  { text: "Yellow is a colour you cannot make by mixing other colours", group: "primary" },
  { text: "Blue is a colour you cannot make by mixing other colours", group: "primary" },
  { text: "Orange is made by mixing red and yellow", group: "secondary" },
  { text: "Green is made by mixing blue and yellow", group: "secondary" },
  { text: "Purple is made by mixing red and blue", group: "secondary" },
  { text: "This colour sits between two primary colours on the colour wheel", group: "secondary" },
  { text: "There are exactly three of these, and all other colours are mixed from them", group: "primary" },
  { text: "You get this by combining two primary colours in roughly equal amounts", group: "secondary" },
  { text: "Painters keep tubes of these three because every other colour starts from them", group: "primary" },
] as const;

const WASH_FACTS = [
  { text: "One even layer of colour, the same tone all over the area", technique: "flat" },
  { text: "Colour that changes gradually from dark to light across the area", technique: "graded" },
  { text: "Used to fill a clear, calm sky that is the same blue everywhere", technique: "flat" },
  { text: "Used to paint a sky that fades from deep blue at the top to pale near the horizon", technique: "graded" },
  { text: "Made by keeping the same amount of water and pigment as you work across", technique: "flat" },
  { text: "Made by adding a little more water (or more pigment) as you work across", technique: "graded" },
  { text: "Shows no change in colour value from one side to the other", technique: "flat" },
  { text: "Shows a smooth change in colour value from one side to the other", technique: "graded" },
] as const;

const MOSAIC_MATERIAL_FACTS = [
  { text: "Small pieces of recyclable coloured paper", ok: true },
  { text: "Short lengths of dried banana fibre", ok: true },
  { text: "A suitable adhesive to stick the pieces down", ok: true },
  { text: "A firm support or board to build the mosaic on", ok: true },
  { text: "A single type of material used all through the picture (mono media)", ok: true },
  { text: "A large wet brush loaded with runny paint to wash over the whole picture", ok: false },
  { text: "A bottle of ink for writing in calligraphy", ok: false },
  { text: "A rounders bat for pressing the pieces flat", ok: false },
  { text: "Even, small gaps left between the pasted pieces", ok: true },
  { text: "A football to roll across the finished mosaic", ok: false },
] as const;

const MOSAIC_STEPS = [
  { id: "m1", label: "Look at real or pictured mosaics to see how the small pieces and spacing work" },
  { id: "m2", label: "Collect and prepare the materials — coloured paper or banana fibre, adhesive and a support" },
  { id: "m3", label: "Paint the support one colour that will contrast with the pieces you will paste" },
  { id: "m4", label: "Sketch one simple form on the support — a fruit, a bird or an animal" },
  { id: "m5", label: "Cut or tear the material into small, even pieces" },
  { id: "m6", label: "Paste the pieces inside the sketched shape, keeping small even gaps between them" },
  { id: "m7", label: "Let it dry, then display it and talk about your own and others' work" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants a clear midday sky that is exactly the same blue from edge to edge. Which wash technique fits, and why?`,
      correct: "A flat wash — it lays one even tone with no change in colour value across the area",
      wrong: [
        "A graded wash — but that deliberately changes from dark to light, which is not what an even sky needs",
        "A graded wash — because any sky must always fade towards the horizon",
        "Neither — an even sky can only be made by leaving the paper white",
      ],
      explanation: "A flat wash keeps the same water-to-pigment mix right across, so the tone does not change — exactly what an even, single-colour sky needs. A graded wash is for a deliberate light-to-dark change.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} paints an evening sky that should be deep blue high up and pale near the horizon. Which technique is right?`,
    correct: "A graded wash — the colour value changes smoothly from dark at the top to light at the bottom",
    wrong: [
      "A flat wash — but that keeps one tone everywhere and cannot show the fade",
      "A flat wash applied twice — repeating an even layer still gives one flat tone",
      "No wash at all — a sky like this cannot be painted",
    ],
    explanation: "A graded wash is made by gradually adding more water (or more pigment) as you move across, giving the smooth dark-to-light change an evening sky needs. A flat wash gives only one even tone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is starting a paper mosaic of a bird and paints the whole support dark before pasting light-coloured pieces. Why paint the support a contrasting colour first?`,
      correct: "So the small gaps between the pasted pieces show up and the bird shape reads clearly",
      wrong: [
        "So the mosaic pieces will not need any adhesive to stay on",
        "So the support becomes heavy enough to hang on a wall",
        "So the pieces change colour to match the support",
      ],
      explanation: "A contrasting support colour makes the even gaps between the tesserae visible, which is what gives a mosaic its clear pattern and outline. It does not replace the adhesive.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} pastes the mosaic pieces so tightly that no gaps show at all, and the picture looks like a flat painted patch. What was the mistake?`,
    correct: "Leaving no spacing — a mosaic needs small even gaps between pieces to look like a mosaic",
    wrong: [
      "Using paper pieces — a mosaic can only be made from stone",
      "Using one type of material — a mosaic must always mix many materials",
      "Painting the support first — the support should be left blank",
    ],
    explanation: "Even spacing between the pieces is a defining feature of a mosaic; with no gaps it just reads as a flat coloured shape. Mono media (one material) and a painted contrasting support are both correct.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} is told a mosaic should use "mono media". Two learners disagree. Learner A uses only banana fibre; Learner B mixes paper, fibre, seeds and bottle tops. Who has followed the instruction?`,
      correct: "Learner A — mono media means using one single type of material throughout the mosaic",
      wrong: [
        "Learner B — mono media means using as many different materials as possible",
        "Both — mono media has nothing to do with the number of materials",
        "Neither — mono media means using no material at all, only paint",
      ],
      explanation: "'Mono' means one, so mono media is one type of material used all through the piece. Learner A (only banana fibre) has followed the brief; Learner B has used mixed media.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} mixes red paint with yellow paint. Which colour results, and what kind of colour is it?`,
    correct: "Orange — a secondary colour, because it is made by mixing two primary colours",
    wrong: [
      "Orange — a primary colour, because it comes straight from the paint tube",
      "Green — a secondary colour made from red and yellow",
      "Purple — a primary colour that cannot be mixed",
    ],
    explanation: "Red + yellow = orange, and orange is a secondary colour because it is made by mixing two primaries. Primary colours (red, yellow, blue) cannot themselves be mixed from others.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} needs green paint but has run out of the tube. Which two colours should ${who} mix?`,
      correct: "Blue and yellow",
      wrong: ["Red and yellow", "Red and blue", "Blue and black"],
      explanation: "Green is a secondary colour made from the primaries blue and yellow. Red and yellow make orange; red and blue make purple.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the class studies how pictures are used in daily life. Which is a real everyday use of pictures?`,
    correct: "Signs, posters, packaging and storybooks all use pictures to share information and ideas quickly",
    wrong: [
      "Pictures are only ever used inside art museums",
      "Pictures have no use outside a Creative Arts lesson",
      "Pictures are only used to fill empty wall space and mean nothing",
    ],
    explanation: "Pictures carry meaning fast — road signs, adverts, food packaging, textbooks and story illustrations all use images to communicate, which is why the sub-strand asks how we use pictures in daily life.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} paints a colour wheel and is asked which subject explains why colours are grouped as primary and secondary. Which learning area does the design link this to?`,
      correct: "Science and Technology — understanding colour classification into primary and secondary colours",
      wrong: [
        "Kiswahili — because colours have names in Kiswahili",
        "It links to no other subject",
        "Physical Health Education — because painting is active",
      ],
      explanation: "The design links the colour-wheel work to Science and Technology through the classification of colours into primary and secondary groups.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} arranges the mosaic pieces of a fruit in neat rows with equal gaps. Which subject does the design link this arranging of shapes and patterns to?`,
    correct: "Mathematics — exploring geometric patterns in mosaic compositions",
    wrong: [
      "Music — because mosaics have rhythm like a song",
      "It links to no other subject",
      "CRE — because the fruit could be a symbol",
    ],
    explanation: "The design links mosaic-making to Mathematics through the geometric patterns formed by arranging the pieces with regular spacing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} paints a graded wash but keeps exactly the same water-and-paint mix the whole way across. What will the result actually look like?`,
      correct: "A flat wash — with no change in the mix, the tone stays the same and there is no gradation",
      wrong: [
        "A perfect graded wash — the gradation appears on its own as the paint dries",
        "A mosaic pattern — because even washes form small squares",
        "Nothing — the paint will not stick without a change in mix",
      ],
      explanation: "A graded wash needs the water-to-pigment ratio to change gradually as you move across. Keeping it constant simply produces a flat wash — one even tone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says "colour value" means the name of a colour, like 'red' or 'blue'. Is that right?`,
    correct: "No — colour value means how light or dark a colour is, not which colour it is",
    wrong: [
      "Yes — colour value is just another word for the colour's name",
      "No — colour value means how expensive the paint is",
      "Yes — but only for primary colours",
    ],
    explanation: "Colour value describes lightness or darkness. A graded wash works by changing the value of one colour smoothly across the area; the colour's name stays the same.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The three colours that cannot be made by mixing others — red, yellow and blue — are called the ", after: " colours.", correctAnswer: "primary" },
  { before: "A colour made by mixing two primary colours, such as orange, green or purple, is called a ", after: " colour.", correctAnswer: "secondary" },
  { before: "Red mixed with yellow makes ", after: ".", correctAnswer: "orange" },
  { before: "Blue mixed with yellow makes ", after: ".", correctAnswer: "green" },
  { before: "Red mixed with blue makes ", after: ".", correctAnswer: "purple", acceptedAnswers: ["purple", "violet"] },
  { before: "A painting technique that lays one even layer of colour, the same tone all over, is called a ", after: " wash.", correctAnswer: "flat" },
  { before: "A painting technique in which the colour changes gradually from dark to light across the area is called a ", after: " wash.", correctAnswer: "graded" },
  { before: "How light or dark a colour is, is called its colour ", after: ".", correctAnswer: "value" },
  { before: "In a mosaic, using only one type of material all through the picture is called ", after: " media.", correctAnswer: "mono" },
  { before: "In a mosaic, small even gaps are left between the pieces; this is called the ", after: " of the materials.", correctAnswer: "spacing" },
  { before: "The board or surface a mosaic is built on is called the ", after: ".", correctAnswer: "support" },
  { before: "The support is painted a colour that will ", after: " with the pasted pieces so the design shows clearly.", correctAnswer: "contrast" },
] as const;

const COLOUR_WHEEL_PROMPTS = [
  "Look at the colour wheel. Which colours are the primary colours?",
  "On the colour wheel, which three are the primary colours?",
  "Which colours on this wheel are primary colours?",
  "Study the colour wheel and choose the set of primary colours.",
  "Which of these is the correct set of primary colours?",
  "From the colour wheel, pick out the primary colours.",
  "Which three colours are the primaries?",
  "Choose the primary colours shown on the wheel.",
  "Which option lists only primary colours?",
  "Identify the primary colours on the colour wheel.",
] as const;

export const paintingAndMosaic: Skill = {
  id: "g5-cas-painting-and-mosaic",
  code: "C.4",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-creating-executing",
  grade: 5,
  title: "Painting and mosaic",
  description:
    "Primary and secondary colours on the colour wheel; the flat wash and graded wash painting techniques and colour value; the materials for a mosaic (recyclable coloured paper or banana fibre, adhesive, support); and making a mosaic with mono media, even spacing and a contrasting support.",
  generate(rng) {
    const branch = randChoice(rng, [
      "colour-wheel-primary",
      "colour-fact-sort",
      "secondary-from-match",
      "wash-sort",
      "mosaic-material-sort",
      "mosaic-order",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "colour-wheel-primary") {
      const highlight = randChoice(rng, ["primary", "secondary"] as const);
      const visual: VisualSpec = { type: "color-wheel", highlight };
      if (highlight === "primary") {
        const correct = "Red, yellow and blue";
        const choices = shuffle(rng, [correct, "Orange, green and purple", "Red, orange and green", "Blue, purple and yellow"]);
        return {
          kind: "multiple-choice",
          prompt: pickPrompt(rng, COLOUR_WHEEL_PROMPTS),
          choices,
          correctIndex: choices.indexOf(correct),
          layout: "list",
          visual,
          hint: "Primary colours cannot be mixed from other colours.",
          explanation: "The primary colours are red, yellow and blue — every other colour is mixed from these.",
        };
      }
      const correct = "Orange, green and purple";
      const choices = shuffle(rng, [correct, "Red, yellow and blue", "Red, green and blue", "Yellow, orange and blue"]);
      return {
        kind: "multiple-choice",
        prompt: "Look at the colour wheel. Which colours are the secondary colours?",
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        visual,
        hint: "Secondary colours are each made by mixing two primary colours.",
        explanation: "The secondary colours are orange (red+yellow), green (blue+yellow) and purple (red+blue).",
      };
    }

    if (branch === "colour-fact-sort") {
      const chosen = shuffle(rng, COLOUR_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `cf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`cf${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "primary", label: "Primary colours" },
          { id: "secondary", label: "Secondary colours" },
        ],
        correctBucket,
        hint: "Primary = cannot be mixed (red, yellow, blue). Secondary = mixed from two primaries (orange, green, purple).",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group} colour.`).join(" "),
      };
    }

    if (branch === "secondary-from-match") {
      const tokens = shuffle(rng, SECONDARY.map((s) => ({ id: s.colour, label: s.colour })));
      const targets = shuffle(rng, SECONDARY.map((s) => ({ id: s.colour, label: `${s.from[0]} + ${s.from[1]}` })));
      const correctMap: Record<string, string> = {};
      SECONDARY.forEach((s) => (correctMap[s.colour] = s.colour));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each secondary colour is made from two primary colours.",
        explanation: SECONDARY.map((s) => `${s.colour} = ${s.from[0]} + ${s.from[1]}.`).join(" "),
      };
    }

    if (branch === "wash-sort") {
      const chosen = shuffle(rng, WASH_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `w${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`w${i}`] = f.technique));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "flat", label: "Flat wash" },
          { id: "graded", label: "Graded wash" },
        ],
        correctBucket,
        hint: "Flat wash = one even tone throughout. Graded wash = a smooth change in colour value across the area.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.technique} wash.`).join(" "),
      };
    }

    if (branch === "mosaic-material-sort") {
      const chosen = shuffle(rng, MOSAIC_MATERIAL_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `mm${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`mm${i}`] = f.ok ? "yes" : "no"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "yes", label: "Belongs in mosaic-making" },
          { id: "no", label: "Does not belong" },
        ],
        correctBucket,
        hint: "A mosaic needs small pieces (paper or banana fibre), an adhesive, a support, mono media, and even spacing — not washes, ink, bats or balls.",
        explanation: chosen.map((f) => `"${f.text}" ${f.ok ? "belongs in mosaic-making" : "does not belong"}.`).join(" "),
      };
    }

    if (branch === "mosaic-order") {
      const shuffled = shuffle(rng, MOSAIC_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making a paper or banana-fibre mosaic)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MOSAIC_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Study examples, prepare materials, paint the support, sketch the form, cut the pieces, paste with even gaps, then display.",
        explanation: "Correct order: " + MOSAIC_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Match the wash to the effect wanted, remember mono media = one material and spacing = even gaps, and how primaries mix into secondaries.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about primary vs secondary colours, flat vs graded wash, colour value, and the mosaic terms mono media, spacing and support.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
