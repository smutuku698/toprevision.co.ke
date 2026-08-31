import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 2.1 Change of State — the identification half (all 6 named
// transitions: melting, evaporation, sublimation, deposition, condensation, freezing), split from
// changeOfStateApplications.ts for depth. Per CURRICULUM-MINING-GUIDE.md, the Meets-Expectations rubric row
// requires "at least four" of the six — sublimation and deposition (the two least everyday-obvious ones) get
// equal weight here, not dropped in favour of the four more familiar transitions.

const TRANSITIONS = [
  { id: "melting", label: "Melting", from: "solid" as const, to: "liquid" as const, action: "heated", example: "an ice cube turning into water on a warm day" },
  { id: "freezing", label: "Freezing", from: "liquid" as const, to: "solid" as const, action: "cooled", example: "water turning into ice in a freezer" },
  { id: "evaporation", label: "Evaporation", from: "liquid" as const, to: "gas" as const, action: "heated", example: "wet clothes drying on a line in the sun" },
  { id: "condensation", label: "Condensation", from: "gas" as const, to: "liquid" as const, action: "cooled", example: "water droplets forming on the outside of a cold soda bottle" },
  { id: "sublimation", label: "Sublimation", from: "solid" as const, to: "gas" as const, action: "heated", example: "mothballs slowly disappearing directly into the air without ever forming a puddle" },
  { id: "deposition", label: "Deposition", from: "gas" as const, to: "solid" as const, action: "cooled", example: "frost forming directly on a very cold surface overnight" },
] as const;

const CYCLE_STEPS = [
  { id: "c1", label: "A block of ice is heated and melts into liquid water" },
  { id: "c2", label: "The liquid water is heated further and evaporates into water vapour (a gas)" },
  { id: "c3", label: "The water vapour touches a cold surface and condenses back into liquid water" },
  { id: "c4", label: "The liquid water is cooled further and freezes back into solid ice" },
] as const;

const KENYAN_PLACES = ["Nyahururu", "Mombasa", "Naivasha", "Kitale", "Nakuru", "Kisumu", "Meru", "Machakos", "Voi", "Eldoret", "Nyeri", "Kericho"] as const;
const KENYAN_NAMES = ["Mercy", "Job", "Rehema", "Elias", "Nasra", "Boniface", "Winnie", "Kiplagat", "Alice", "Nixon", "Tabitha", "Erick"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} leaves an ice cube out on a hot afternoon in ${place(rng)} and it slowly turns into a puddle of water. What change of state is happening?`,
      correct: "Melting",
      wrong: ["Evaporation", "Condensation", "Sublimation"],
      explanation: "A solid (ice) turning into a liquid (water) when heated is melting.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} hangs wet school uniforms on a line in ${place(rng)} and by evening they are completely dry. What change of state caused the water to leave the clothes?`,
    correct: "Evaporation",
    wrong: ["Freezing", "Deposition", "Melting"],
    explanation: "Liquid water on the clothes turned into water vapour (a gas) and escaped into the air — evaporation, sped up by heat and moving air.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} pulls a cold soda bottle out of a fridge in ${place(rng)} and notices tiny water droplets forming on the outside within minutes. Where did this water come from, and what change of state produced it?`,
      correct: "Water vapour in the warm air touched the cold bottle and condensation turned it back into liquid water",
      wrong: ["The bottle itself was leaking soda from inside", "The cold caused the plastic to sweat its own liquid", "Evaporation pulled water out of the bottle's surface"],
      explanation: "Condensation happens when a gas (water vapour in the air) touches a cold surface and turns back into a liquid — the droplets on the bottle.",
    };
  },
  (rng) => ({
    prompt: `A shopkeeper in ${place(rng)} keeps mothballs in a clothing drawer, and weeks later notices they have become much smaller without ever leaving a wet puddle. What change of state explains this?`,
    correct: "Sublimation — the solid mothball turned directly into a gas without becoming a liquid first",
    wrong: ["Melting — the mothball turned into a liquid that evaporated instantly", "Evaporation — mothballs are actually liquids to begin with", "Freezing — the mothball became colder and shrank"],
    explanation: "Sublimation is when a solid changes directly into a gas without passing through a liquid stage — exactly why a shrinking mothball leaves no puddle behind.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `On a very cold morning in highland ${place(rng)}, ${who} notices a thin white layer of frost has formed directly on the grass overnight, with no sign of dew turning to ice first. What change of state is this?`,
      correct: "Deposition — water vapour in the cold air turned directly into solid frost",
      wrong: ["Freezing — liquid dew froze into ice", "Sublimation — solid ice turned into gas", "Condensation — gas turned into liquid only"],
      explanation: "When water vapour in very cold air changes directly into a solid (frost) without first becoming liquid, that change of state is called deposition.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} pours water into an ice tray and places it in a freezer in ${place(rng)}. A few hours later, the water has become solid ice. What change of state took place?`,
    correct: "Freezing",
    wrong: ["Melting", "Sublimation", "Evaporation"],
    explanation: "A liquid (water) turning into a solid (ice) when cooled is freezing.",
  }),
  (rng) => ({
    prompt: `A cook in ${place(rng)} notices steam rising from a boiling pot condensing into water droplets on the underside of the pot's lid. What change of state formed those droplets?`,
    correct: "Condensation",
    wrong: ["Evaporation", "Sublimation", "Deposition"],
    explanation: "Steam (a gas) touching the cooler lid changes back into liquid water droplets — condensation.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked in class in ${place(rng)} to name the change of state that is the exact opposite of evaporation. What is the answer?`,
      correct: "Condensation",
      wrong: ["Freezing", "Melting", "Sublimation"],
      explanation: "Evaporation turns liquid into gas; condensation is its opposite, turning gas back into liquid.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is asked to name the change of state that is the exact opposite of melting. What is the answer?`,
    correct: "Freezing",
    wrong: ["Evaporation", "Deposition", "Sublimation"],
    explanation: "Melting turns solid into liquid; freezing is its opposite, turning liquid back into solid.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked to name the change of state that is the exact opposite of sublimation. What is the answer?`,
    correct: "Deposition",
    wrong: ["Freezing", "Melting", "Evaporation"],
    explanation: "Sublimation turns solid directly into gas; deposition is its opposite, turning gas directly into solid.",
  }),
];

export const changeOfStateProcesses: Skill = {
  id: "g6-sci-matter-state-processes",
  code: "MAT.1a",
  subjectId: "science",
  strandId: "g6-sci-matter",
  grade: 6,
  title: "Changes of state",
  description: "Identifying the six changes of state of matter — melting, evaporation, sublimation, deposition, condensation and freezing — when substances are heated or cooled.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-particle-state", "transition-name-match", "heat-cool-categorize", "cycle-order", "reasoning", "fill-blank"] as const);

    if (branch === "identify-particle-state") {
      const t = randChoice(rng, TRANSITIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, t.label, TRANSITIONS.filter((x) => x.id !== t.id).map((x) => x.label), 3);
      return {
        kind: "multiple-choice",
        prompt: `A substance starts as a ${t.from} and is ${t.action} until it becomes a ${t.to}. What is this change of state called?`,
        visual: { type: "particle-diagram", state: t.to },
        choices,
        correctIndex,
        layout: "list",
        explanation: `${t.label}: a ${t.from} changes into a ${t.to} when ${t.action} — for example, ${t.example}.`,
      };
    }

    if (branch === "transition-name-match") {
      const chosen = shuffle(rng, TRANSITIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: `${t.from} → ${t.to} (${t.action})` })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      const TRANSITION_MATCH_PROMPTS = [
        "Match each change of state to its correct before/after description.",
        "Which before/after description belongs to each change of state below? Match them up.",
        "Pair each change of state with what happens to the substance.",
        "Match each change of state to its correct starting and ending state.",
        "Connect each change of state with its before/after description.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TRANSITION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which state comes first and whether the substance is heated or cooled.",
        explanation: chosen.map((t) => `${t.label}: ${t.from} → ${t.to} when ${t.action}.`).join(" "),
      };
    }

    if (branch === "heat-cool-categorize") {
      const items = TRANSITIONS.map((t) => ({ id: t.id, label: t.label }));
      const correctBucket: Record<string, string> = {};
      for (const t of TRANSITIONS) correctBucket[t.id] = t.action === "heated" ? "heating" : "cooling";
      const HEAT_COOL_PROMPTS = [
        "Sort each change of state as caused by heating or by cooling.",
        "Is each change of state below caused by heating or by cooling? Sort them.",
        "Decide whether each change of state needs heating or cooling, then sort it.",
        "Group these changes of state into heating-caused and cooling-caused.",
        "For each change of state, work out if it happens through heating or cooling.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, HEAT_COOL_PROMPTS),
        items: shuffle(rng, items),
        buckets: [
          { id: "heating", label: "Caused by heating" },
          { id: "cooling", label: "Caused by cooling" },
        ],
        correctBucket,
        hint: "Melting, evaporation and sublimation all need heat; freezing, condensation and deposition all need cooling.",
        explanation: TRANSITIONS.map((t) => `${t.label} is caused by ${t.action === "heated" ? "heating" : "cooling"}.`).join(" "),
      };
    }

    if (branch === "cycle-order") {
      const shuffled = shuffle(rng, CYCLE_STEPS);
      const CYCLE_ORDER_PROMPTS = [
        "Put these changes of state in order as ice is heated, then the resulting water vapour is cooled again.",
        "Arrange these changes of state in the order they happen as ice is heated, then cooled again.",
        "Place these steps in the order they occur, from heating solid ice to cooling the vapour back down.",
        "Order these changes of state from first to last, starting with heating ice.",
        "Sort these changes of state into the correct sequence, from heating to cooling.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, CYCLE_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CYCLE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange in the order the changes happen.",
        hint: "Start from solid ice being heated, and end with liquid water freezing again.",
        explanation: "Correct order: " + CYCLE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A solid changing into a liquid when heated is called ", after: ".", correctAnswer: "melting" },
      { before: "A liquid changing into a solid when cooled is called ", after: ".", correctAnswer: "freezing" },
      { before: "A liquid changing into a gas when heated is called ", after: ".", correctAnswer: "evaporation" },
      { before: "A gas changing into a liquid when cooled is called ", after: ".", correctAnswer: "condensation" },
      { before: "A solid changing directly into a gas, without becoming liquid first, is called ", after: ".", correctAnswer: "sublimation" },
      { before: "A gas changing directly into a solid, without becoming liquid first, is called ", after: ".", correctAnswer: "deposition" },
      { before: "Frost forming directly on a cold surface overnight is an example of ", after: ".", correctAnswer: "deposition" },
      { before: "Mothballs slowly shrinking without ever forming a puddle is an example of ", after: ".", correctAnswer: "sublimation" },
      { before: "Wet clothes drying on a line is an everyday example of ", after: ".", correctAnswer: "evaporation" },
      { before: "Water droplets forming on a cold drink bottle is an everyday example of ", after: ".", correctAnswer: "condensation" },
      { before: "Water placed in a freezer undergoes ", after: " to become ice.", correctAnswer: "freezing" },
      { before: "Ice left in the sun undergoes ", after: " to become water.", correctAnswer: "melting" },
      { before: "Changes of state happen when a substance is heated or ", after: ".", correctAnswer: "cooled" },
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
      hint: "Think about whether the substance is heated or cooled, and which state it starts and ends in.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
