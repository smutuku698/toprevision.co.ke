import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 3.1 Light — the shadows/eclipses/rainbow half, split from
// lightTravelAndReflection.ts. The Suggested Assessment Rubric has a dedicated row for "ability to illustrate
// the formation of shadows and eclipses in nature" with labelled diagrams expected at the Exceeds tier — the
// multiple-choice branches lean on the shadow-eclipse VisualSpec throughout, and shadow-diagram-hotspot is the
// genuine labelled-diagram Interpretation-tier item this rubric row calls for (light source / opaque object /
// umbra), added 2026-08-16 per the content-depth audit and RIGOR-STANDARDS.md's knowledge-dimension checklist.

// Coordinates match the "shadow" mode SVG in Visual.tsx's ShadowEclipse renderer (viewBox 0 0 260 140): the
// sun circle at (30,40) r16, the opaque rect at x110-126 y22-82, and the dark shadow polygon centred roughly
// on (157,71). Added so the shadow diagram can be a genuine labelled-hotspot item (light source / opaque
// object / umbra), matching the assessmentSignal's "labels correctly" requirement — see RIGOR-STANDARDS.md's
// knowledge-dimension checklist: a diagram that is only ever shown passively is an Interpretation-angle gap.
const SHADOW_DIAGRAM_SPOTS = [
  { id: "light-source", xPercent: 11.5, yPercent: 28.6, label: "Light source" },
  { id: "opaque-object", xPercent: 45.4, yPercent: 37.1, label: "Opaque object" },
  { id: "umbra", xPercent: 60.5, yPercent: 50.9, label: "Umbra (the full, dark shadow)" },
] as const;

const SHADOW_FACTS = [
  { text: "A shadow forms when an opaque object blocks light from reaching a surface behind it", isTrue: true },
  { text: "A shadow always points towards the light source, not away from it", isTrue: false },
  { text: "Moving the light source closer to an object usually makes its shadow longer", isTrue: true },
  { text: "A transparent object cannot cast a proper shadow, because light passes through it", isTrue: true },
  { text: "Shadows can only form outdoors in sunlight, never indoors", isTrue: false },
  { text: "A shadow is always exactly the same shape as the object that casts it", isTrue: false },
  { text: "A translucent object can cast a partial, lighter shadow because it only blocks some of the light", isTrue: true },
  { text: "The umbra is the complete, dark region of a shadow where light is fully blocked", isTrue: true },
  { text: "Shining two separate light sources on the same object can create two overlapping shadows", isTrue: true },
  { text: "A shadow never changes size, no matter how close or far the light source is", isTrue: false },
] as const;

const RAINBOW_COLOURS = [
  { id: "red", label: "Red" },
  { id: "orange", label: "Orange" },
  { id: "yellow", label: "Yellow" },
  { id: "green", label: "Green" },
  { id: "blue", label: "Blue" },
  { id: "indigo", label: "Indigo" },
  { id: "violet", label: "Violet" },
] as const;

const EVENT_DEFINITIONS = [
  { id: "shadow", label: "Shadow", def: "Forms when an opaque object blocks light from reaching a surface behind it" },
  { id: "solar-eclipse", label: "Solar eclipse", def: "Happens when the moon passes between the sun and the earth, blocking sunlight from part of the earth" },
  { id: "lunar-eclipse", label: "Lunar eclipse", def: "Happens when the earth passes between the sun and the moon, casting the earth's shadow onto the moon" },
  { id: "rainbow", label: "Rainbow", def: "Forms when sunlight passes through raindrops and splits into its different colours" },
] as const;

const ECLIPSE_SAFETY = [
  { desc: "A learner looks directly at the sun with bare eyes during a solar eclipse to see it better.", isSafe: false, why: "Looking directly at the sun, even during an eclipse, can permanently damage the eyes — special eclipse glasses or an indirect method should always be used instead." },
  { desc: "A learner uses a pinhole projector to view a solar eclipse indirectly, watching the image on a piece of card instead of looking at the sun.", isSafe: true, why: "A pinhole projector safely shows an image of the eclipse without anyone needing to look directly at the sun." },
  { desc: "A learner uses proper certified eclipse glasses to briefly view a solar eclipse.", isSafe: true, why: "Certified eclipse glasses are specially designed to block harmful sunlight and are a safe way to view a solar eclipse directly." },
  { desc: "A learner assumes it is safe to look at the sun through ordinary sunglasses during an eclipse.", isSafe: false, why: "Ordinary sunglasses do not block enough harmful light and are not safe for viewing the sun, even during an eclipse." },
] as const;

const KENYAN_PLACES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Thika", "Meru", "Kericho", "Machakos", "Kitale", "Malindi"] as const;
const KENYAN_NAMES = ["Everlyn", "Boaz", "Nafula", "Cyrus", "Rachael", "Mwaura", "Judith", "Baraka", "Consolate", "Kevo", "Miriam", "Wycliffe"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches the moon slowly move directly between the sun and the earth in ${place(rng)}, briefly blocking sunlight over part of the earth. What is this event called?`,
      correct: "A solar eclipse",
      wrong: ["A lunar eclipse", "A rainbow", "A sunset"],
      explanation: "A solar eclipse happens when the moon passes between the sun and the earth, blocking sunlight from reaching part of the earth's surface.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} watches the earth pass directly between the sun and the moon, and the moon appears to darken as the earth's shadow falls on it. What is this event called?`,
    correct: "A lunar eclipse",
    wrong: ["A solar eclipse", "A shadow puppet show", "A rainbow"],
    explanation: "A lunar eclipse happens when the earth passes between the sun and the moon, casting the earth's own shadow onto the moon.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices that a flagpole's shadow in ${place(rng)} is much longer in the early morning than at midday. Why does the shadow's length change?`,
      correct: "The angle and position of the sun changes through the day, changing how the shadow falls",
      wrong: ["The flagpole itself physically grows taller during the day", "Shadows are always the same length no matter the time of day", "The ground absorbs the shadow at midday"],
      explanation: "As the sun's position in the sky changes through the day, the angle of light striking an object changes too, which changes the length of the shadow it casts.",
    };
  },
  (rng) => ({
    prompt: `Right after a rain shower in ${place(rng)}, the sun comes out behind ${name(rng)}, and an arc of colours appears in the sky ahead. What is happening?`,
    correct: "Sunlight is passing through raindrops and splitting into its different colours, forming a rainbow",
    wrong: ["The raindrops themselves are naturally coloured", "The sun is projecting a painted pattern onto the clouds", "This is actually a type of eclipse"],
    explanation: "A rainbow forms when sunlight passes through raindrops and splits (disperses) into its different colours, which appear as an arc in the sky.",
  }),
  (rng) => ({
    prompt: `${name(rng)} wants to safely watch a solar eclipse in ${place(rng)} without damaging their eyes. What is the safest method?`,
    correct: "Use certified eclipse glasses or view it indirectly with a pinhole projector",
    wrong: ["Stare directly at the sun with bare eyes for as long as needed", "Look at the sun through ordinary sunglasses", "Look at the sun's reflection in a puddle of water for as long as needed"],
    explanation: "The sun should never be viewed directly with bare eyes or ordinary sunglasses — certified eclipse glasses or an indirect method like a pinhole projector are the safe way to observe a solar eclipse.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked to name the colours of a rainbow, in order, starting from the outer edge. What is the correct order?`,
      correct: "Red, orange, yellow, green, blue, indigo, violet",
      wrong: ["Violet, indigo, blue, green, yellow, orange, red only when it rains at night", "Red, yellow, blue, green, orange, indigo, violet", "Blue, green, yellow, red, orange, violet, indigo"],
      explanation: "A rainbow's colours always appear in the same order, from the outer edge: red, orange, yellow, green, blue, indigo, violet.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} places an opaque ball between a torch and a wall in a darkened room in ${place(rng)} and sees a dark shape on the wall. What is this dark shape called, and why does it form?`,
    correct: "A shadow — it forms because the opaque ball blocks light from reaching the wall behind it",
    wrong: ["A reflection — because the wall is acting like a mirror", "A rainbow — because the torch splits light into colours", "An eclipse — because it involves a light source and a round object"],
    explanation: "A shadow forms when an opaque object blocks light from reaching a surface behind it — exactly what happens with the ball, torch and wall.",
  }),
];

export const shadowsEclipsesRainbow: Skill = {
  id: "g6-sci-fe-shadows-eclipses-rainbow",
  code: "FE.1b",
  subjectId: "science",
  strandId: "g6-sci-fe",
  grade: 6,
  title: "Shadows, eclipses and rainbows",
  description: "How shadows form, how solar and lunar eclipses happen, how rainbows form, and how to safely view a solar eclipse.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-eclipse", "shadow-diagram-hotspot", "shadow-fact-sort", "rainbow-order", "definition-match", "eclipse-safety", "reasoning", "fill-blank"] as const);

    if (branch === "shadow-diagram-hotspot") {
      const ask = randChoice(rng, SHADOW_DIAGRAM_SPOTS);
      const wrongLabels = shuffle(rng, SHADOW_DIAGRAM_SPOTS.filter((s) => s.id !== ask.id).map((s) => s.label));
      const choices = shuffle(rng, [ask.label, ...wrongLabels]);
      const explanations: Record<string, string> = {
        "light-source": "The light source shines light toward the opaque object, which is what makes a shadow possible at all.",
        "opaque-object": "An opaque object blocks light completely, so no light reaches the surface directly behind it — this is what casts a shadow.",
        umbra: "The umbra is the darkest, complete-shadow region formed directly behind an opaque object, where the light source is fully blocked.",
      };
      return {
        kind: "hotspot",
        prompt: `On this shadow diagram, click where the ${ask.label.toLowerCase()} is, then confirm below.`,
        diagram: { type: "shadow-eclipse", mode: "shadow" },
        spots: SHADOW_DIAGRAM_SPOTS.map((s) => ({ id: s.id, xPercent: s.xPercent, yPercent: s.yPercent, label: s.label })),
        askId: ask.id,
        choices,
        correctLabel: ask.label,
        hint: "The light source shines toward the opaque object; the umbra is the dark full-shadow region formed behind it.",
        explanation: explanations[ask.id],
      };
    }

    if (branch === "identify-eclipse") {
      const options = [
        { mode: "shadow" as const, label: "A shadow" },
        { mode: "solar-eclipse" as const, label: "A solar eclipse" },
        { mode: "lunar-eclipse" as const, label: "A lunar eclipse" },
      ];
      const target = randChoice(rng, options);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, options.filter((o) => o.mode !== target.mode).map((o) => o.label), 2);
      const IDENTIFY_EVENT_PROMPTS = [
        "Look at the diagram. What does it show?",
        "What is happening in this diagram?",
        "Which event of light does this diagram show?",
        "Study this diagram. What does it represent?",
        "What is this diagram illustrating?",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_EVENT_PROMPTS),
        visual: { type: "shadow-eclipse", mode: target.mode },
        choices,
        correctIndex,
        layout: "list",
        explanation:
          target.mode === "shadow"
            ? "An opaque object blocking light forms a shadow behind it."
            : target.mode === "solar-eclipse"
              ? "A solar eclipse happens when the moon passes between the sun and the earth, blocking sunlight from part of the earth."
              : "A lunar eclipse happens when the earth passes between the sun and the moon, casting its shadow onto the moon.",
      };
    }

    if (branch === "shadow-fact-sort") {
      const chosen = shuffle(rng, SHADOW_FACTS).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `s${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`s${i}`] = f.isTrue ? "true" : "false"));
      const SHADOW_SORT_PROMPTS = [
        "Sort each statement about shadows as true or false.",
        "Decide whether each statement about shadows is true or false.",
        "Read each claim about shadows, then sort it as true or false.",
        "Which of these statements about shadows are true, and which are false?",
        "Sort these ideas about shadows into True and False.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, SHADOW_SORT_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Shadows point away from the light source, opposite to it.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
        visual: { type: "shadow-eclipse", mode: "shadow" },
      };
    }

    if (branch === "rainbow-order") {
      const shuffled = shuffle(rng, RAINBOW_COLOURS);
      const RAINBOW_ORDER_PROMPTS = [
        "Arrange the colours of a rainbow in the correct order, starting from the outer edge.",
        "Order the colours of a rainbow, from the outer edge to the inner edge.",
        "Place these rainbow colours in the correct order, starting from the outside.",
        "Sort these rainbow colours into the correct sequence, outer edge first.",
        "Arrange these colours as they appear in a rainbow, starting from the outside.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, RAINBOW_ORDER_PROMPTS),
        items: shuffled.map((c) => ({ id: c.id, label: c.label })),
        correctOrder: RAINBOW_COLOURS.map((c) => c.id),
        instruction: "Drag to arrange from the outer edge of the rainbow to the inner edge.",
        hint: "Remember: red, orange, yellow, green, blue, indigo, violet.",
        explanation: "The correct order is: " + RAINBOW_COLOURS.map((c) => c.label).join(", ") + ".",
      };
    }

    if (branch === "definition-match") {
      const tokens = shuffle(rng, EVENT_DEFINITIONS.map((e) => ({ id: e.id, label: e.label })));
      const targets = shuffle(rng, EVENT_DEFINITIONS.map((e) => ({ id: e.id, label: e.def })));
      const correctMap: Record<string, string> = {};
      for (const e of EVENT_DEFINITIONS) correctMap[e.id] = e.id;
      const EVENT_DEFINITION_PROMPTS = [
        "Match each event of light to its definition.",
        "Which definition belongs to each event below? Match them up.",
        "Pair each light event with what actually causes it.",
        "Match each event to its correct definition.",
        "Connect each event of light with its definition.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, EVENT_DEFINITION_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what blocks or bends the light in each case.",
        explanation: EVENT_DEFINITIONS.map((e) => `${e.label} — ${e.def}.`).join(" "),
      };
    }

    if (branch === "eclipse-safety") {
      const s = randChoice(rng, ECLIPSE_SAFETY);
      const safeLabel = "Yes, this is safe";
      const unsafeLabel = "No, this is not safe";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.desc} Is this a safe way to observe a solar eclipse?`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        explanation: s.why,
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A shadow forms when an opaque object ", after: " light from reaching a surface behind it.", correctAnswer: "blocks" },
      { before: "An eclipse where the moon passes between the sun and the earth is a ", after: ".", correctAnswer: "solar eclipse" },
      { before: "An eclipse where the earth passes between the sun and the moon is a ", after: ".", correctAnswer: "lunar eclipse" },
      { before: "A rainbow forms when sunlight passes through raindrops and ", after: " into different colours.", correctAnswer: "splits" },
      { before: "The first colour at the outer edge of a rainbow is ", after: ".", correctAnswer: "red" },
      { before: "The colour at the inner edge of a rainbow is ", after: ".", correctAnswer: "violet" },
      { before: "It is never safe to look directly at the ", after: " during a solar eclipse without proper eye protection.", correctAnswer: "sun" },
      { before: "A safe indirect way to view a solar eclipse is to use a ", after: ".", correctAnswer: "pinhole projector" },
      { before: "Certified eclipse ", after: " safely block harmful sunlight for direct viewing.", correctAnswer: "glasses" },
      { before: "During a lunar eclipse, the earth's ", after: " falls on the moon.", correctAnswer: "shadow" },
      { before: "The darkest, complete-shadow region directly behind an opaque object, where light is fully blocked, is called the ", after: ".", correctAnswer: "umbra" },
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
      hint: "Think about shadows, eclipses and rainbows.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
