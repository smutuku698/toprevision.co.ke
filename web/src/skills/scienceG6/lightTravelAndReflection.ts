import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 3.1 Light — the travel/materials/mirror half (movement of
// light through materials, reflection at plane surfaces, image formation and characteristics, and the
// mirrors/periscope/kaleidoscope/lens/hand-lens/mirage applications), split from shadowsEclipsesRainbow.ts for
// depth. 2026-08-16 content-depth audit found the design's full application list (periscope, kaleidoscope,
// lenses, magnifying glass, hand lens, mirage) was only half-covered and the "laws of reflection" learning
// experience was never taught beyond its downstream image-characteristic effects — both fixed per
// RIGOR-STANDARDS.md's knowledge-dimension checklist (a missing named item/angle is a content gap, not
// something more place(rng) variety would fix).

const MATERIALS = [
  { id: "transparent", label: "Transparent", desc: "Lets almost all light pass straight through, so objects behind it can be seen clearly", example: "clear window glass, clean water, clear plastic wrap" },
  { id: "translucent", label: "Translucent", desc: "Lets some light through but scatters it, so objects behind it look blurry rather than clear", example: "frosted glass, tracing paper, a thin curtain" },
  { id: "opaque", label: "Opaque", desc: "Does not let light pass through at all, so it blocks light completely and casts a shadow", example: "a wooden door, a brick wall, cardboard" },
] as const;

const MATERIAL_EXAMPLES = [
  { text: "A clean, clear drinking glass with water in it", material: "transparent" },
  { text: "A car's clear windscreen", material: "transparent" },
  { text: "A clean plastic sandwich bag", material: "transparent" },
  { text: "Frosted bathroom window glass", material: "translucent" },
  { text: "A thin white curtain with sunlight behind it", material: "translucent" },
  { text: "Greaseproof (tracing) paper", material: "translucent" },
  { text: "A wooden door", material: "opaque" },
  { text: "A metal cooking pot", material: "opaque" },
  { text: "A brick wall", material: "opaque" },
  { text: "A thick cardboard box", material: "opaque" },
] as const;

const IMAGE_CHARACTERISTICS = [
  { text: "The image appears the same size as the real object", isTrue: true },
  { text: "The image appears to be as far behind the mirror as the object is in front of it", isTrue: true },
  { text: "The image is laterally inverted — left and right appear swapped", isTrue: true },
  { text: "The image appears upright, not upside down", isTrue: true },
  { text: "The image is virtual — it cannot be captured on a screen the way a projected image can", isTrue: true },
  { text: "The image appears much larger than the real object", isTrue: false },
  { text: "The image appears upside down", isTrue: false },
  { text: "The image appears the same distance in front of the mirror as the object", isTrue: false },
  { text: "The angle of incidence is always equal to the angle of reflection at a plane mirror", isTrue: true },
  { text: "A ray of light reflects off a plane mirror at a random angle, unrelated to how it arrived", isTrue: false },
  { text: "The normal is an imaginary line drawn at right angles to the mirror's surface, used to measure angles", isTrue: true },
  { text: "Moving an object further from a plane mirror makes its image appear smaller", isTrue: false },
] as const;

const APPLICATIONS = [
  { id: "periscope", label: "Periscope", use: "Uses two mirrors to let a person see over an obstacle, such as over a crowd or out of a submarine" },
  { id: "kaleidoscope", label: "Kaleidoscope", use: "Uses several mirrors at angles to create repeating, symmetrical patterns from small coloured objects" },
  { id: "magnifying-glass", label: "Magnifying glass", use: "A handheld device with a curved lens, used to make small print or objects appear larger for everyday reading and close work" },
  { id: "mirror", label: "Plane mirror", use: "Reflects light to form an image of whatever is placed in front of it" },
  { id: "lens", label: "Lens", use: "A curved piece of clear glass or plastic that bends light to focus it — the optical part inside eyeglasses, cameras and telescopes" },
  { id: "hand-lens", label: "Hand lens", use: "A small magnifying lens carried in the field to look closely at tiny details on plants, insects or soil" },
  { id: "mirage", label: "Mirage", use: "An illusion where hot air just above the ground bends light, making a distant road or dry field look like it has a shimmering pool of water" },
] as const;

const PERISCOPE_STEPS = [
  { id: "p1", label: "Gather materials: a long box or tube, and two small flat mirrors" },
  { id: "p2", label: "Cut two viewing holes near the top and bottom of the tube, on opposite sides" },
  { id: "p3", label: "Fix one mirror inside at the top, angled at 45 degrees, facing the top opening" },
  { id: "p4", label: "Fix the second mirror inside at the bottom, angled at 45 degrees, facing the bottom opening" },
  { id: "p5", label: "Look through the bottom opening and check that light reflects down through both mirrors" },
] as const;

const KENYAN_PLACES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Thika", "Meru", "Kakamega", "Malindi", "Kitale", "Machakos"] as const;
const KENYAN_NAMES = ["Purity", "Ochieng", "Halimah", "George", "Nyokabi", "Mutua", "Sheila", "Kimani", "Aisha", "Barasa", "Winny", "Tonny"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} holds up a thin white curtain to a sunny window in ${place(rng)} and can tell there is a person standing outside, but cannot make out any details of their face. What kind of material is the curtain?`,
      correct: "Translucent",
      wrong: ["Transparent", "Opaque", "None of these — curtains block all light"],
      explanation: "A translucent material lets some light through and scatters it, which is why shapes can be sensed but not seen clearly — exactly what a thin curtain does.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} stands behind a thick wooden door in ${place(rng)} and no light or shape from the other side comes through at all. What kind of material is the door?`,
    correct: "Opaque",
    wrong: ["Transparent", "Translucent", "None of these — wood always lets some light through"],
    explanation: "A material that blocks light completely, letting nothing through, is opaque — like a solid wooden door.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} looks in a plane mirror in ${place(rng)} and raises their right hand — but the image in the mirror appears to raise its left hand instead. What property of a mirror image explains this?`,
      correct: "Lateral inversion — the mirror swaps left and right in the image it forms",
      wrong: ["The mirror is simply broken", "The image is smaller than the real object", "The image is upside down"],
      explanation: "A plane mirror image is laterally inverted — left and right appear swapped — which is exactly why a raised right hand looks like a raised left hand in the reflection.",
    };
  },
  (rng) => ({
    prompt: `A sailor on a submarine near ${place(rng)}'s coast uses a device with two angled mirrors inside a long tube to see the surface without exposing the whole submarine. What device is this?`,
    correct: "A periscope",
    wrong: ["A kaleidoscope", "A magnifying glass", "A single plane mirror"],
    explanation: "A periscope uses two mirrors, each angled to reflect light, letting the user see over or around an obstacle — a classic application of reflection.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} looks through a tube filled with small coloured beads and several angled mirrors in ${place(rng)}, seeing repeating symmetrical patterns as the tube turns. What is this toy called?`,
      correct: "A kaleidoscope",
      wrong: ["A periscope", "A magnifying glass", "A telescope"],
      explanation: "A kaleidoscope uses several mirrors at angles to reflect small objects repeatedly, creating symmetrical patterns — a fun application of reflection.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} uses a curved piece of glass in ${place(rng)} to make the tiny print in a newspaper look much bigger and easier to read. What tool is being used?`,
    correct: "A magnifying glass",
    wrong: ["A periscope", "A plane mirror", "A kaleidoscope"],
    explanation: "A magnifying glass uses a curved lens to make small objects or text appear larger, unlike a flat mirror which only reflects an image at the same size.",
  }),
  (rng) => ({
    prompt: `A learner in ${place(rng)} stands 2 metres in front of a plane mirror. How far behind the mirror will their image appear to be?`,
    correct: "2 metres — the image appears exactly as far behind the mirror as the object is in front of it",
    wrong: ["1 metre, half the real distance", "4 metres, double the real distance", "It depends on how bright the room is"],
    explanation: "A plane mirror image forms exactly as far behind the mirror as the real object is in front of it — one of the defining characteristics of a plane mirror image.",
  }),
  (rng) => ({
    prompt: `${name(rng)} tries to catch the image formed by a plane mirror on a piece of paper held behind the mirror, but the image never appears on the paper. Why not?`,
    correct: "The image is virtual — it only appears to exist behind the mirror and cannot be projected onto a screen",
    wrong: ["The mirror is not reflecting any light at all", "The image only exists at night", "The paper needs to be transparent for the image to appear on it"],
    explanation: "A plane mirror forms a virtual image, meaning it appears to be behind the mirror but cannot actually be captured or projected onto a screen — unlike a real image.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In a science lesson in ${place(rng)}, ${who} shines a ray of light onto a plane mirror so it strikes at 35° from the normal (the imaginary line drawn at right angles to the mirror's surface). At what angle does the reflected ray leave the mirror, measured from the normal?`,
      correct: "35°, because the law of reflection states the angle of incidence equals the angle of reflection",
      wrong: ["17.5°, half of the incoming angle", "70°, double the incoming angle", "55°, since the two angles must add up to 90°"],
      explanation: "The law of reflection states that the angle of incidence always equals the angle of reflection, both measured from the normal — so a 35° incoming ray reflects at exactly 35°.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} draws a ray-reflection diagram in ${place(rng)} and needs a dashed reference line at exactly 90° to the mirror's surface, from the point where the light ray strikes, before measuring any angles. What is this reference line called?`,
    correct: "The normal",
    wrong: ["The incident ray", "The reflected ray", "The horizon line"],
    explanation: "The normal is the imaginary line drawn at right angles to a mirror's surface at the point of reflection — the angle of incidence and angle of reflection are both measured from it, not from the mirror's surface itself.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} visits an optician in ${place(rng)}, who tests their eyesight and then fits them with glasses containing curved pieces of clear glass that bend light to help them see clearly. What are these curved pieces of glass called?`,
      correct: "Lenses",
      wrong: ["Mirrors", "Prisms", "Filters"],
      explanation: "A lens is a curved piece of clear glass or plastic that bends light to focus it — the same optical idea used in eyeglasses, cameras and magnifying tools.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is doing a nature study walk in ${place(rng)} and pulls out a small handheld magnifying lens to look closely at the tiny hairs on a caterpillar's back. What tool is ${who} using?`,
      correct: "A hand lens",
      wrong: ["A periscope", "A kaleidoscope", "A plane mirror"],
      explanation: "A hand lens is a small magnifying lens carried in the field to closely observe fine details on plants, insects or soil — a handy tool for nature study, distinct from a desk magnifying glass.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `Driving along a hot, straight road near ${p} at midday, ${who} sees what looks like a shimmering pool of water far ahead on the tarmac — but it disappears completely on getting closer. What is this?`,
      correct: "A mirage — hot air near the ground bends light, creating the illusion of water",
      wrong: ["An actual pool of water that evaporates as the car approaches", "A reflection from a nearby mirror", "A rainbow forming close to the ground"],
      explanation: "A mirage happens when hot air just above a road bends light, tricking the eye into seeing what looks like a shimmering pool of water that isn't really there.",
    };
  },
];

export const lightTravelAndReflection: Skill = {
  id: "g6-sci-fe-light-travel",
  code: "FE.1a",
  subjectId: "science",
  strandId: "g6-sci-fe",
  grade: 6,
  title: "Light: travel, materials and reflection",
  description: "How light moves through transparent, translucent and opaque materials; the law of reflection at plane mirrors; the characteristics of images formed in plane mirrors; and applications such as periscopes, kaleidoscopes, magnifying glasses, lenses, hand lenses and mirages.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-material", "material-categorize", "image-characteristics", "application-match", "periscope-order", "reasoning", "fill-blank"] as const);

    if (branch === "identify-material") {
      const target = randChoice(rng, MATERIALS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, MATERIALS.filter((m) => m.id !== target.id).map((m) => m.label), 2);
      const MATERIAL_ID_PROMPTS = [
        "Light rays are shown hitting this material. What kind of material is it?",
        "Look at how light behaves with this material. What kind is it?",
        "What kind of material is shown here, based on how light passes through it?",
        "Based on the light rays shown, identify this material.",
        "Which kind of material is this, given how the light behaves?",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MATERIAL_ID_PROMPTS),
        visual: { type: "light-material", material: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `${target.label}: ${target.desc} — for example, ${target.example}.`,
      };
    }

    if (branch === "material-categorize") {
      const chosen = shuffle(rng, MATERIAL_EXAMPLES).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `m${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`m${i}`] = f.material));
      const MATERIAL_CATEGORIZE_PROMPTS = [
        "Sort each everyday object as transparent, translucent or opaque.",
        "Is each object below transparent, translucent or opaque? Sort them.",
        "Decide which type of material each object is, then sort it.",
        "Group these everyday objects by whether they're transparent, translucent or opaque.",
        "For each object, work out whether light passes through it clearly, partly, or not at all.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, MATERIAL_CATEGORIZE_PROMPTS),
        items,
        buckets: MATERIALS.map((m) => ({ id: m.id, label: m.label })),
        correctBucket,
        hint: "Ask: can you see clearly through it, only sense a blurry shape, or nothing at all?",
        explanation: chosen.map((f) => `"${f.text}" is ${f.material}.`).join(" "),
      };
    }

    if (branch === "image-characteristics") {
      const chosen = shuffle(rng, IMAGE_CHARACTERISTICS).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `c${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`c${i}`] = f.isTrue ? "true" : "false"));
      const IMAGE_SORT_PROMPTS = [
        "Sort each statement about a plane mirror image as true or false.",
        "Decide whether each statement about a plane mirror image is true or false.",
        "Read each claim about mirror images, then sort it as true or false.",
        "Which of these statements about plane mirror images are true, and which are false?",
        "Sort these ideas about plane mirror images into True and False.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, IMAGE_SORT_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "A plane mirror image is the same size, upright, laterally inverted, virtual, and as far behind as the object is in front.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
        visual: { type: "plane-mirror", objectShape: "letter-f" },
      };
    }

    if (branch === "application-match") {
      const tokens = shuffle(rng, APPLICATIONS.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, APPLICATIONS.map((a) => ({ id: a.id, label: a.use })));
      const correctMap: Record<string, string> = {};
      for (const a of APPLICATIONS) correctMap[a.id] = a.id;
      const APPLICATION_MATCH_PROMPTS = [
        "Match each application of light to what it does.",
        "Which job or effect belongs to each application of light below? Match them up.",
        "Pair each application of light with what it actually does.",
        "Match each light-related device to its function.",
        "Connect each application of light with its effect.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, APPLICATION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about how many mirrors or lenses are involved, or whether hot air is bending the light, and what job or effect results.",
        explanation: APPLICATIONS.map((a) => `${a.label} — ${a.use}.`).join(" "),
      };
    }

    if (branch === "periscope-order") {
      const shuffled = shuffle(rng, PERISCOPE_STEPS);
      const PERISCOPE_ORDER_PROMPTS = [
        "Put the steps of making a simple working periscope in the correct order.",
        "Arrange these periscope-building steps in the right order.",
        "Place these steps for making a periscope in the order you'd carry them out.",
        "Order these periscope-making steps, from first to last.",
        "Sort these steps for building a periscope into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, PERISCOPE_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PERISCOPE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Gather materials first, then position and fix both mirrors, then test it.",
        explanation: "Correct order: " + PERISCOPE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A material that lets almost all light pass straight through it is ", after: ".", correctAnswer: "transparent" },
      { before: "A material that lets some light through but scatters it is ", after: ".", correctAnswer: "translucent" },
      { before: "A material that does not let any light pass through it is ", after: ".", correctAnswer: "opaque" },
      { before: "A plane mirror image is laterally inverted, meaning left and right appear ", after: ".", correctAnswer: "swapped" },
      { before: "A plane mirror image appears the same ", after: " as the real object.", correctAnswer: "size" },
      { before: "A plane mirror image cannot be projected onto a screen because it is a ", after: " image.", correctAnswer: "virtual" },
      { before: "A device that uses two mirrors to see over an obstacle is a ", after: ".", correctAnswer: "periscope" },
      { before: "A device that uses several mirrors to create repeating patterns is a ", after: ".", correctAnswer: "kaleidoscope" },
      { before: "A device that uses a curved lens to make small objects look bigger is a ", after: ".", correctAnswer: "magnifying glass" },
      { before: "Light bouncing off a surface is called ", after: ".", correctAnswer: "reflection" },
      { before: "A mirror image appears exactly as far behind the mirror as the object is ", after: " it.", correctAnswer: "in front of" },
      { before: "The law of reflection states that the angle of incidence equals the angle of ", after: ".", correctAnswer: "reflection" },
      { before: "The imaginary line drawn at right angles to a mirror's surface, used to measure angles of light, is called the ", after: ".", correctAnswer: "normal" },
      { before: "A curved piece of glass or plastic that bends light to focus it is called a ", after: ".", correctAnswer: "lens" },
      { before: "A small magnifying lens carried in the field to look closely at tiny objects is called a ", after: ".", correctAnswer: "hand lens" },
      { before: "A shimmering, water-like illusion caused by hot air bending light near a hot road is called a ", after: ".", correctAnswer: "mirage" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about materials, reflection and mirror images.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
