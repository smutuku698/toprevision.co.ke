import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  TRUE_FALSE_PROMPTS,
  FILL_BLANK_PROMPTS,
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.6
// "Swimming" (OPTIONAL — chosen instead of Indigenous Kenyan Games) (15 lessons) — front
// crawl.
//
// Mined verbatim: describe / perform / apply the Front crawl technique (glide, body
// position, arm action, leg action and breathing) while inside the water; practise while
// ensuring smooth progression (leg, arm action, rhythm and tempo); swim in mini games while
// observing pool hygiene and safety; appreciate own and others' efforts. Key inquiry: why is
// hygiene and safety necessary in swimming? Core competencies: Digital literacy; Learning to
// learn. Link to other learning area: Science and Technology (the concept of floating).
//
// Visual coverage: no swimming-stroke VisualSpec exists in the shared set; building one is
// out of scope for this pass. Recorded so the omission is deliberate.

const COMPONENTS = [
  { id: "glide", label: "Glide", desc: "After pushing off the wall, stretching out long and streamlined and letting the water carry you, without moving the arms or legs" },
  { id: "body-position", label: "Body position", desc: "Lying flat and horizontal near the surface, face down, hips high, so the body slips through the water with little drag" },
  { id: "leg-action", label: "Leg action", desc: "A continuous flutter kick from the hips, legs long and ankles loose, making only a small splash" },
  { id: "arm-action", label: "Arm action", desc: "The arms take turns — one pulls back through the water from front to hip while the other reaches forward over the surface" },
  { id: "breathing", label: "Breathing", desc: "Turning the head to the side to breathe in, then face-down again to breathe out into the water, without lifting the head up" },
] as const;

const COMPONENT_FACTS = [
  { text: "Stretching out and coasting after the push-off, arms and legs still", id: "glide" },
  { text: "Keeping the body flat and level just under the surface", id: "body-position" },
  { text: "Holding the hips high so the legs do not sink", id: "body-position" },
  { text: "A fast, small flutter kick coming from the hips, not the knees", id: "leg-action" },
  { text: "Relaxed, floppy ankles so the feet whip the water", id: "leg-action" },
  { text: "One arm pulling underwater while the other swings forward above the water", id: "arm-action" },
  { text: "A continuous windmill action, so one arm is always pulling", id: "arm-action" },
  { text: "Rolling the head to the side in the wave to take a breath", id: "breathing" },
  { text: "Blowing the air out into the water while the face is down", id: "breathing" },
  { text: "Not lifting the head forward to breathe, which would drop the hips", id: "breathing" },
] as const;

const SAFETY_TF = [
  { text: "Showering before you get in washes off sweat, oils and dirt and keeps the pool water clean", isTrue: true },
  { text: "You should not swim if you are unwell or have an open wound", isTrue: true },
  { text: "Walk, do not run, on the wet poolside because it is slippery", isTrue: true },
  { text: "Only swim where a lifeguard or adult can see you, and never swim alone", isTrue: true },
  { text: "Get out of the water if you feel very tired or cold", isTrue: true },
  { text: "Enter feet first in water whose depth you do not know", isTrue: true },
  { text: "It is fine to push a friend into the deep end for a laugh", isTrue: false },
  { text: "Showering first is a waste of time and does nothing for pool hygiene", isTrue: false },
  { text: "Running on the poolside is safe as long as you are careful", isTrue: false },
  { text: "Swimming alone with nobody watching is fine once you can float", isTrue: false },
  { text: "Holding another swimmer under the water is a harmless game", isTrue: false },
  { text: "Obeying the pool rules and the instructor keeps everyone safe", isTrue: true },
] as const;

const CRAWL_STEPS = [
  { id: "c1", label: "Push off the wall and hold a long, streamlined glide" },
  { id: "c2", label: "Settle into a flat body position — face down, hips high, near the surface" },
  { id: "c3", label: "Start a steady flutter kick from the hips (leg action)" },
  { id: "c4", label: "Add the alternating arm pull (arm action), keeping one arm always working" },
  { id: "c5", label: "Add breathing — turn the head to the side to breathe in, face down to breathe out" },
  { id: "c6", label: "Combine kick, pull and breath into a smooth, even rhythm and tempo" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked the key inquiry question: why is hygiene and safety necessary in swimming? Which answer is best?`,
      correct: "Hygiene keeps the shared pool water clean for everyone, and safety rules prevent drowning, slips and injuries",
      wrong: [
        "They only matter in competitions, not in lessons",
        "They make the swimmer faster in the water",
        "They are traditions with no real effect",
      ],
      explanation: "Many people share pool water, so showering and not swimming when unwell protect everyone's health; safety rules (no running, never alone, know your depth) prevent accidents.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} lifts the head straight forward out of the water to breathe during front crawl, and the legs sink. What is the better way to breathe?`,
    correct: "Turn the head to the side to breathe in, keeping the face low, so the body stays flat",
    wrong: [
      "Lift the head even higher and further forward",
      "Stop kicking while breathing",
      "Hold the breath for the whole length and never breathe",
    ],
    explanation: "In front crawl you breathe by rolling the head to the side in the bow wave. Lifting the head forward pushes the hips and legs down and slows the swimmer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} swims front crawl with the head up and the body angled down like a tilted plank. Why is a flat body position better?`,
      correct: "A flat, horizontal body slips through the water with less drag, so it takes less effort to move forward",
      wrong: [
        "A flat body makes the swimmer heavier and sink faster",
        "Body position has no effect on how easily you move",
        "Tilting down helps you dive under other swimmers",
      ],
      explanation: "A flat body near the surface reduces drag (water resistance). A head-up, tilted position drags the hips low and makes swimming much harder.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} does a strong flutter kick but bends the knees a lot and makes a huge splash with little forward movement. What should change?`,
    correct: "Kick from the hips with long legs and relaxed ankles, making a small splash",
    wrong: [
      "Kick even harder from the knees",
      "Stop kicking and rely only on the arms",
      "Kick with stiff, pointed-up toes",
    ],
    explanation: "The front-crawl leg action is a flutter kick driven from the hips with fairly straight legs and loose ankles. Big knee-bent kicks waste energy and push water down, not back.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} learns that a person can stay up in the water without sinking. Which subject does the design link this to?`,
      correct: "Science and Technology — being exposed to the concept of floating",
      wrong: [
        "Mathematics — because laps are counted",
        "It links to no other subject",
        "English — because the instructor gives instructions",
      ],
      explanation: "The design links swimming to Science and Technology through the concept of floating — why the body stays up in water.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to add all the parts of front crawl at once on the first try. Why does the design suggest a smooth progression instead?`,
    correct: "Building up glide, then legs, then arms, then breathing, then rhythm lets each part be learned well before it is combined",
    wrong: [
      "Because learning everything at once is against the pool rules",
      "Because the parts must be learned in a random order each time",
      "Because only one part of front crawl can ever be used at a time",
    ],
    explanation: "Smooth progression means adding one element at a time — glide, leg action, arm action, breathing, then rhythm and tempo — so each is secure before the next is added.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} arrives at the pool sweaty from games and heads straight into the water without showering. Why is showering first important?`,
      correct: "It rinses off sweat, oils and dirt that would otherwise pollute the shared pool water",
      wrong: [
        "It makes the swimmer float better",
        "It is only for warming up the muscles",
        "It has no hygiene purpose; it is just a habit",
      ],
      explanation: "A pre-swim shower is a hygiene rule: it keeps sweat, sun cream, oils and dirt out of the pool so the water stays clean for everyone using it.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees a friend about to swim a length in the deep end while no adult is watching. What should ${name(rng)} say?`,
    correct: "Wait until a lifeguard or adult is watching — never swim alone, especially in deep water",
    wrong: [
      "Go ahead; swimming alone is fine once you can float",
      "Race them so at least two people are in the deep end unsupervised",
      "Push them in to get it over with",
    ],
    explanation: "A core safety rule is to swim only where a lifeguard or adult can see you, and never alone — if a swimmer gets into trouble, someone must be there to help.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} does front crawl but pauses both arms in front together between strokes, so the swim is jerky. What is the fix?`,
      correct: "Keep one arm always pulling — the arm action is continuous, so one arm works while the other recovers",
      wrong: [
        "Pause both arms out front for longer each time",
        "Only ever use one arm and tuck the other away",
        "Swap to kicking with the arms held stiff at the sides",
      ],
      explanation: "Front-crawl arm action is a continuous alternating windmill: one arm pulls underwater while the other swings forward, so there is always propulsion and the stroke stays smooth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} pushes off and immediately starts thrashing the arms before stretching out. Which part of the technique was skipped?`,
    correct: "The glide — after the push-off you stretch out long and streamlined before starting to stroke",
    wrong: [
      "The breathing — you must breathe before the push-off",
      "The body position — which only matters at the end of a length",
      "Nothing was skipped; thrashing straight away is correct",
    ],
    explanation: "The glide comes first: after pushing off the wall you hold a streamlined stretch and let the water carry you, then begin the kick and pull.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The swimming stroke taught in Grade 5, with an alternating arm pull and a flutter kick, is the front ", after: ".", correctAnswer: "crawl" },
  { before: "Stretching out long and streamlined after the push-off, without moving the arms or legs, is the ", after: ".", correctAnswer: "glide" },
  { before: "Lying flat and horizontal near the surface, face down and hips high, is a good body ", after: " for front crawl.", correctAnswer: "position" },
  { before: "The fast, small flutter kick of front crawl comes from the ", after: ", not the knees.", correctAnswer: "hips" },
  { before: "In the arm action, one arm pulls underwater while the other reaches forward over the ", after: ".", correctAnswer: "surface", acceptedAnswers: ["surface", "water"] },
  { before: "To breathe in front crawl, the swimmer turns the head to the ", after: " rather than lifting it forward.", correctAnswer: "side" },
  { before: "Air is breathed out into the water while the swimmer's face is ", after: ".", correctAnswer: "down" },
  { before: "Adding one part of the stroke at a time — glide, legs, arms, breathing, rhythm — is called a smooth ", after: ".", correctAnswer: "progression" },
  { before: "Showering before entering the pool is a rule of pool ", after: ".", correctAnswer: "hygiene" },
  { before: "You should never swim ", after: "; always swim where a lifeguard or adult can see you.", correctAnswer: "alone" },
  { before: "On the wet poolside you should ", after: ", not run, because it is slippery.", correctAnswer: "walk" },
  { before: "The design links swimming to Science and Technology through the concept of ", after: ".", correctAnswer: "floating" },
] as const;

const IDENTIFY_COMPONENT_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which part of the front crawl technique is described here?",
  "Name the front-crawl component described.",
  "Which front-crawl element fits the description?",
] as const;

export const swimming: Skill = {
  id: "g5-cas-swimming",
  code: "P.6",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Swimming (front crawl)",
  description:
    "The front crawl technique — glide, body position, leg action, arm action and breathing — and building it up through a smooth progression into an even rhythm; and pool hygiene and safety, including why they matter. (Optional sub-strand, chosen instead of Indigenous Kenyan Games.)",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-component",
      "component-fact-sort",
      "component-match",
      "crawl-order",
      "safety-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-component") {
      const target = randChoice(rng, COMPONENTS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        COMPONENTS.filter((c) => c.id !== target.id).map((c) => c.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_COMPONENT_PROMPTS)} ${target.desc}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Glide = coasting; body position = flat and level; leg action = flutter kick; arm action = alternating pull; breathing = head to the side.",
        explanation: `This is the ${target.label.toLowerCase()}: ${target.desc.toLowerCase()}.`,
      };
    }

    if (branch === "component-fact-sort") {
      const chosen = shuffle(rng, COMPONENT_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `cf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`cf${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: COMPONENTS.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint: "Decide whether each describes the coast (glide), the shape of the body, the kick, the arms, or the breathing.",
        explanation: chosen
          .map((f) => `"${f.text}" — ${COMPONENTS.find((c) => c.id === f.id)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "component-match") {
      const chosen = shuffle(rng, COMPONENTS);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c) => (correctMap[c.id] = c.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Match each of the five front-crawl elements to what the swimmer actually does.",
        explanation: chosen.map((c) => `${c.label} — ${c.desc}.`).join(" "),
      };
    }

    if (branch === "crawl-order") {
      const shuffled = shuffle(rng, CRAWL_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (building up the front crawl through a smooth progression)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CRAWL_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Glide first, then the flat body position, then legs, then arms, then breathing, then put it all into a smooth rhythm.",
        explanation: "Correct order: " + CRAWL_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "safety-tf") {
      const chosen = shuffle(rng, SAFETY_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `s${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`s${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True (good practice)" },
          { id: "false", label: "False (unsafe or unhygienic)" },
        ],
        correctBucket,
        hint: "Shower first, don't swim unwell or alone, walk on wet tiles, know your depth, get out when tired — and never push or hold others under.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
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
        hint: "Think about why a flat body and side breathing help, why glide comes first, and why hygiene and safety rules protect everyone.",
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
      hint: "Think about the five front-crawl elements (glide, body position, leg action, arm action, breathing) and the pool hygiene and safety rules.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
