import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 2.1 Change of State — the applications half (everyday uses of
// melting/freezing/evaporation/condensation/sublimation/deposition), split from changeOfStateProcesses.ts. The
// design's two named projects (making candles from waste wax, repairing broken plastic containers) and its
// safety note (avoid fires and burns while heating) are both folded in here as curriculum-sanctioned content.

const APPLICATION_FACTS = [
  { text: "Melting waste candle wax or beeswax and pouring it into a mould makes a new candle", process: "melting" },
  { text: "Melting the edges of a cracked plastic container and pressing them together can repair it", process: "melting" },
  { text: "A welder melts metal to join two pieces together, which then cools and hardens", process: "melting" },
  { text: "Melting ice in a cooler box keeps drinks and food cold while it slowly turns to water", process: "melting" },
  { text: "Water is frozen in trays to make ice cubes for cooling drinks", process: "freezing" },
  { text: "Meat, fish and vegetables are frozen to preserve them for longer storage", process: "freezing" },
  { text: "Wet clothes hung on a line dry as the water in them evaporates into the air", process: "evaporation" },
  { text: "Farmers spread harvested cereals and grains out in the sun so that evaporation dries them for storage", process: "evaporation" },
  { text: "Sweat evaporating from the skin helps cool the body down on a hot day", process: "evaporation" },
  { text: "Boiling water for tea produces steam as the water evaporates into vapour", process: "evaporation" },
  { text: "Water vapour in the air condenses into clouds, which can later fall as rain", process: "condensation" },
  { text: "Breath condensing into tiny droplets on a cold window on a chilly morning shows condensation", process: "condensation" },
  { text: "Water droplets forming on the outside of a cold glass of juice are caused by condensation", process: "condensation" },
  { text: "Deodorant blocks (solid air fresheners) slowly disappear into the air through sublimation", process: "sublimation" },
  { text: "Mothballs used to protect stored clothes gradually shrink away through sublimation", process: "sublimation" },
  { text: "Frost forming directly on car windscreens or grass on a cold night is caused by deposition", process: "deposition" },
] as const;

const SAFETY_SCENARIOS = [
  { desc: "A learner heats candle wax over an open flame without adult supervision and leaves the flame unattended to answer the door.", isSafe: false, why: "An open flame should never be left unattended, especially near flammable wax — this risks fire and burns." },
  { desc: "A learner uses oven gloves or tongs to handle a container of just-melted wax while making a candle.", isSafe: true, why: "Using gloves or tongs to handle hot, melted material protects the skin from burns." },
  { desc: "A learner melts the edges of a broken plastic container using a heat source, with an adult supervising the whole activity.", isSafe: true, why: "Heating activities that need caution should be carried out with proper supervision, exactly as the safety note for this sub-strand advises." },
  { desc: "A learner touches a pot of recently boiled water with bare hands to check if it is still hot.", isSafe: false, why: "Very hot containers and liquids should never be touched with bare hands — use a cloth, gloves or tongs, or wait for it to cool." },
  { desc: "A learner keeps flammable materials, such as paper, well away from the flame while melting wax for a candle project.", isSafe: true, why: "Keeping flammable materials away from an open flame is a basic fire-safety precaution during any heating activity." },
] as const;

const PROCESS_EXAMPLE_MATCH = [
  { id: "melting", label: "Melting", example: "Melting old candle stubs to pour into a new candle mould", endState: "liquid" as const },
  { id: "freezing", label: "Freezing", example: "Freezing meat and fish to preserve them for longer", endState: "solid" as const },
  { id: "evaporation", label: "Evaporation", example: "Drying wet clothes on a line in the sun", endState: "gas" as const },
  { id: "condensation", label: "Condensation", example: "Water droplets forming on a cold glass of juice", endState: "liquid" as const },
  { id: "sublimation", label: "Sublimation", example: "A mothball shrinking away without ever forming a puddle", endState: "gas" as const },
  { id: "deposition", label: "Deposition", example: "Frost forming directly on grass on a cold night", endState: "solid" as const },
] as const;

const CANDLE_MAKING_STEPS = [
  { id: "cm1", label: "Collect leftover candle stubs or beeswax" },
  { id: "cm2", label: "Melt the wax carefully, with an adult supervising, away from anything flammable" },
  { id: "cm3", label: "Prepare a small mould and position a wick upright in the centre" },
  { id: "cm4", label: "Carefully pour the melted wax into the mould around the wick" },
  { id: "cm5", label: "Let the wax cool and freeze solid before removing it from the mould" },
] as const;

const KENYAN_PLACES = ["Nakuru", "Kisii", "Mombasa", "Nyeri", "Kitale", "Machakos", "Kericho", "Kisumu", "Nairobi", "Meru", "Nyahururu", "Bungoma"] as const;
const KENYAN_NAMES = ["Cynthia", "Robert", "Zainabu", "Felix", "Mary", "Kiprotich", "Halima", "Nicholas", "Everlyne", "Suleiman", "Doreen", "Patrick"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} collects leftover candle stubs in ${place(rng)}, melts them carefully, and pours the melted wax into a small mould to make a brand-new candle. Which change of state, and which everyday application, is this?`,
      correct: "Melting — reusing waste wax to make a new candle instead of throwing it away",
      wrong: ["Evaporation — the wax escapes into the air as gas", "Freezing — the wax hardens because it is cooled below normal room temperature only", "Sublimation — the wax turns directly into gas"],
      explanation: "Melting old wax and reshaping it into a new candle is a direct, money-saving application of the melting change of state — one of this sub-strand's own suggested class projects.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} notices a jagged crack in a plastic water container at home in ${place(rng)} and carefully melts the edges of the crack together to seal it. What change of state makes this repair possible?`,
    correct: "Melting",
    wrong: ["Evaporation", "Sublimation", "Deposition"],
    explanation: "Carefully melting the plastic edges lets them fuse back together as they re-solidify — a practical repair application of melting, also one of this sub-strand's suggested projects.",
  }),
  (rng) => {
    return {
      prompt: `A farmer near ${place(rng)} spreads freshly harvested maize out in the sun for several days before storing it. Which change of state is helping to dry the maize, and why does this matter for storage?`,
      correct: "Evaporation removes moisture from the grain, and drier grain stores for longer without spoiling",
      wrong: ["Condensation adds moisture to the grain to help it stay fresh", "Freezing preserves the grain without any drying needed", "Sublimation removes the grain's colour so it stores better"],
      explanation: "Sunlight evaporates moisture out of the grain; dry grain resists mould and pests far better than damp grain during long storage.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} keeps meat in a freezer in ${place(rng)} instead of leaving it out on the counter. Which change of state is being used here, and what is its main benefit?`,
    correct: "Freezing — it slows spoilage, letting the meat be stored safely for much longer",
    wrong: ["Evaporation — it removes water so the meat weighs less", "Sublimation — it removes the meat's smell completely", "Condensation — it adds moisture that preserves the meat"],
    explanation: "Freezing meat and other perishable food is a common everyday application of the freezing change of state, allowing longer, safer storage.",
  }),
  (rng) => ({
    prompt: `A doctor in ${place(rng)} explains that sweating on a hot afternoon actually helps cool the body down. Which change of state explains this cooling effect?`,
    correct: "Evaporation — sweat evaporating from the skin carries heat away from the body",
    wrong: ["Condensation — sweat condensing on the skin traps heat", "Freezing — sweat freezing on the skin removes heat", "Deposition — sweat turning directly into a solid removes heat"],
    explanation: "As sweat evaporates from the skin, it carries heat energy away with it, which is why evaporating sweat has a cooling effect on the body.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is melting candle wax for a class project in ${place(rng)} and is told never to leave the flame unattended, even for a moment. Why is this safety rule so important?`,
      correct: "An unattended open flame near flammable wax could start a fire or cause burns if something goes wrong",
      wrong: ["Leaving a flame unattended makes the wax melt more slowly", "The rule only matters if the wax is a dark colour", "There is no real safety risk, it is just a general suggestion"],
      explanation: "Heating activities involving an open flame carry a real fire and burn risk, which is exactly why the curriculum's safety note insists on care while heating substances.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} watches morning mist form near a lake in ${place(rng)} as the cool night air meets water vapour rising off the warm lake surface. Which change of state produces the mist?`,
    correct: "Condensation — water vapour cools and turns into tiny liquid droplets that form the mist",
    wrong: ["Evaporation — the mist is water vapour that has not condensed at all", "Sublimation — the mist is solid ice particles floating in the air", "Melting — the mist forms as solid ice melts in the warm air"],
    explanation: "Mist and clouds form when water vapour cools and condenses into fine liquid droplets suspended in the air.",
  }),
  (rng) => ({
    prompt: `A shop in ${place(rng)} places small solid deodorant blocks in a wardrobe, and weeks later the blocks have visibly shrunk without leaving any liquid residue. What change of state explains this?`,
    correct: "Sublimation — the solid block changes directly into a gas that spreads its scent through the air",
    wrong: ["Evaporation — the block was actually a liquid the whole time", "Freezing — the block loses mass as it gets colder", "Condensation — the block absorbs gas from the air and grows smaller"],
    explanation: "Solid air fresheners and mothballs work by sublimation, slowly turning from solid directly into gas without ever forming a liquid.",
  }),
];

export const changeOfStateApplications: Skill = {
  id: "g6-sci-matter-state-applications",
  code: "MAT.1b",
  subjectId: "science",
  strandId: "g6-sci-matter",
  grade: 6,
  title: "Applications of change of state",
  description: "Everyday applications of changes of state — melting, freezing, evaporation, condensation, sublimation and deposition — including candle-making, plastic repair, food preservation and drying, plus safety while heating substances.",
  generate(rng) {
    const branch = randChoice(rng, ["application-categorize", "process-example-match", "end-state-identify", "candle-order", "safety-evaluate", "reasoning", "fill-blank"] as const);

    if (branch === "application-categorize") {
      const chosen = shuffle(rng, APPLICATION_FACTS).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `a${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`a${i}`] = f.process));
      const APPLICATION_PROMPTS = [
        "Sort each everyday example by the change of state it demonstrates.",
        "Which change of state does each everyday example below show? Sort them.",
        "Decide which change of state each example demonstrates, then sort it.",
        "Group these everyday examples by the change of state they demonstrate.",
        "For each example, work out which change of state it belongs to.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, APPLICATION_PROMPTS),
        items,
        buckets: [
          { id: "melting", label: "Melting" },
          { id: "freezing", label: "Freezing" },
          { id: "evaporation", label: "Evaporation" },
          { id: "condensation", label: "Condensation" },
          { id: "sublimation", label: "Sublimation" },
          { id: "deposition", label: "Deposition" },
        ],
        correctBucket,
        hint: "Think about which state each example starts in, and whether heat or cold is involved.",
        explanation: chosen.map((f) => `"${f.text}" is an example of ${f.process}.`).join(" "),
      };
    }

    if (branch === "process-example-match") {
      const tokens = shuffle(rng, PROCESS_EXAMPLE_MATCH.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PROCESS_EXAMPLE_MATCH.map((p) => ({ id: p.id, label: p.example })));
      const correctMap: Record<string, string> = {};
      for (const p of PROCESS_EXAMPLE_MATCH) correctMap[p.id] = p.id;
      const PROCESS_MATCH_PROMPTS = [
        "Match each change of state to an everyday example of it.",
        "Which everyday example belongs to each change of state below? Match them up.",
        "Pair each change of state with an example you'd see in real life.",
        "Match each change of state to a real-world example of it.",
        "Connect each change of state with an everyday example.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, PROCESS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which state each example starts and ends in.",
        explanation: PROCESS_EXAMPLE_MATCH.map((p) => `${p.label} — ${p.example}.`).join(" "),
      };
    }

    if (branch === "end-state-identify") {
      const p = randChoice(rng, PROCESS_EXAMPLE_MATCH);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, p.example, PROCESS_EXAMPLE_MATCH.filter((x) => x.id !== p.id).map((x) => x.example), 3);
      return {
        kind: "multiple-choice",
        prompt: `The diagram shows matter in its ${p.endState} state after ${p.label.toLowerCase()}. Which everyday example matches this change of state?`,
        visual: { type: "particle-diagram", state: p.endState },
        choices,
        correctIndex,
        layout: "list",
        explanation: `${p.label} ends with matter in the ${p.endState} state — for example, ${p.example.toLowerCase()}.`,
      };
    }

    if (branch === "candle-order") {
      const shuffled = shuffle(rng, CANDLE_MAKING_STEPS);
      const CANDLE_ORDER_PROMPTS = [
        "Put the steps of making a candle from waste wax in the correct order.",
        "Arrange these candle-making steps in the right order.",
        "Place these steps for making a candle from waste wax in the order you'd carry them out.",
        "Order these candle-making steps from first to last.",
        "Sort these steps for making a candle from waste wax into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, CANDLE_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CANDLE_MAKING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Collect wax first, melt it safely, prepare the mould, pour, then let it cool.",
        explanation: "Correct order: " + CANDLE_MAKING_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "safety-evaluate") {
      const s = randChoice(rng, SAFETY_SCENARIOS);
      const safeLabel = "Yes, this is safe practice";
      const unsafeLabel = "No, this is not safe practice";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.desc} Is this safe practice while heating or cooling substances?`,
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
      { before: "Melting old candle stubs and remoulding them makes a new ", after: ".", correctAnswer: "candle" },
      { before: "Melting and rejoining the edges of a crack is a way to repair a broken plastic ", after: ".", correctAnswer: "container" },
      { before: "Farmers use evaporation to dry harvested cereals and ", after: " for storage.", correctAnswer: "grains" },
      { before: "Sweat evaporating from the skin helps ", after: " the body on a hot day.", correctAnswer: "cool" },
      { before: "Meat and fish are often preserved for longer by ", after: " them.", correctAnswer: "freezing" },
      { before: "Water vapour condensing high in the sky forms ", after: ", which can later fall as rain.", correctAnswer: "clouds" },
      { before: "Deodorant blocks and mothballs slowly disappear through ", after: ".", correctAnswer: "sublimation" },
      { before: "While heating substances in an activity, learners should always observe safety to avoid fires and ", after: ".", correctAnswer: "burns" },
      { before: "A welder joins two pieces of metal by first ", after: " the metal.", correctAnswer: "melting" },
      { before: "Ice cubes are made by ", after: " water in a tray.", correctAnswer: "freezing" },
      { before: "Steam rising from boiling water is caused by ", after: ".", correctAnswer: "evaporation" },
      { before: "Reusing waste wax to make candles is a way of saving money and conserving the ", after: ".", correctAnswer: "environment" },
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
      hint: "Think about how changes of state are used in everyday life.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
