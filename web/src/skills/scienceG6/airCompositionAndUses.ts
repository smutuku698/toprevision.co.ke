import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 2.2 Composition of Air — the composition/uses half, split from
// airPollution.ts for depth. The design's own Suggested Learning Experiences explicitly ask learners to "draw a
// pie chart showing percentage composition of components of air" and name Mathematics as a linked learning
// area for exactly this — so a pie-chart VisualSpec here is curriculum-endorsed, not an invented visual.

const AIR_COMPONENTS = [
  { id: "nitrogen", label: "Nitrogen", percent: 78, use: "Used to make fertilisers that help plants grow, and to preserve packaged food by keeping other reactive gases out" },
  { id: "oxygen", label: "Oxygen", percent: 21, use: "Used by living things for breathing (respiration), and needed for burning fuels such as firewood or charcoal" },
  { id: "carbon-dioxide", label: "Carbon dioxide", percent: 0.9, use: "Used by green plants to make food during photosynthesis, and used to make fizzy drinks bubbly and in some fire extinguishers" },
  { id: "other-gases", label: "Other gases (argon, water vapour and more)", percent: 0.1, use: "Argon is used inside light bulbs, and water vapour in the air forms clouds and eventually rain" },
] as const;

const USE_FACTS = [
  { text: "Fertilisers made using nitrogen from the air help crops grow bigger and healthier", gas: "nitrogen" },
  { text: "Nitrogen gas is pumped into some packaged snack bags to keep the food fresh for longer", gas: "nitrogen" },
  { text: "Every breath a person takes draws in oxygen that the body needs to survive", gas: "oxygen" },
  { text: "A fire needs oxygen from the air to keep burning", gas: "oxygen" },
  { text: "Hospitals supply oxygen gas to patients who are having difficulty breathing", gas: "oxygen" },
  { text: "Green plants absorb carbon dioxide from the air to make their own food through photosynthesis", gas: "carbon-dioxide" },
  { text: "Carbon dioxide gas is what makes soft drinks fizzy when the bottle is opened", gas: "carbon-dioxide" },
  { text: "Some fire extinguishers release carbon dioxide to smother flames and cut off their oxygen supply", gas: "carbon-dioxide" },
  { text: "Argon gas is used inside some light bulbs to stop the hot filament from burning up too quickly", gas: "other-gases" },
  { text: "Water vapour in the air condenses high in the sky to form clouds, which can later bring rain", gas: "other-gases" },
] as const;

const CANDLE_EXPERIMENT_STEPS = [
  { id: "e1", label: "Light a candle and place it safely on a heat-proof surface" },
  { id: "e2", label: "Place a clear glass jar upside down over the burning candle" },
  { id: "e3", label: "Watch closely as the flame gets smaller and eventually goes out" },
  { id: "e4", label: "Discuss with peers why the flame went out once the jar's trapped air was used up" },
  { id: "e5", label: "Conclude that the oxygen inside the jar was needed to keep the candle burning" },
] as const;

const KENYAN_PLACES = ["Nakuru", "Thika", "Kisumu", "Kericho", "Machakos", "Kitale", "Eldoret", "Nyeri", "Mombasa", "Nairobi", "Meru", "Kakamega"] as const;
const KENYAN_NAMES = ["Lilian", "Dan", "Amina", "Enock", "Consolata", "Bramwell", "Winfred", "Kelly", "Josephine", "Alex", "Christine", "Vincent"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} traps a burning candle under a glass jar in a class experiment in ${place(rng)}. After a short while, the flame gets smaller and goes out completely, even though wax remains. Why?`,
      correct: "The oxygen trapped inside the jar was used up by the burning candle",
      wrong: ["The nitrogen inside the jar ran out", "The glass jar blocked all the carbon dioxide needed for burning", "The candle simply ran out of wick, not gas"],
      explanation: "A burning candle uses up the oxygen in its surroundings; once the limited oxygen trapped under the jar is used up, the flame can no longer burn and goes out.",
    };
  },
  (rng) => ({
    prompt: `A greenhouse farmer near ${place(rng)} notices that tomato plants grow especially well when there is plenty of a certain gas available during the day for photosynthesis. Which gas is this?`,
    correct: "Carbon dioxide",
    wrong: ["Nitrogen", "Argon", "Oxygen"],
    explanation: "Green plants use carbon dioxide from the air, together with sunlight and water, to make their own food through photosynthesis.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} opens a bottle of soda in ${place(rng)} and watches bubbles fizz up immediately. Which gas dissolved in the drink is responsible for the fizz?`,
      correct: "Carbon dioxide",
      wrong: ["Oxygen", "Nitrogen", "Water vapour"],
      explanation: "Carbon dioxide gas is dissolved under pressure in fizzy drinks; opening the bottle releases the pressure and lets the gas escape as bubbles.",
    };
  },
  (rng) => ({
    prompt: `A farmer near ${place(rng)} buys fertiliser to help boost crop growth. Which component of air is most closely linked to how many fertilisers are made?`,
    correct: "Nitrogen",
    wrong: ["Oxygen", "Argon", "Carbon dioxide"],
    explanation: "Nitrogen, the most abundant gas in air, is used to manufacture many fertilisers that supply plants with the nitrogen they need to grow.",
  }),
  (rng) => ({
    prompt: `A hospital in ${place(rng)} keeps oxygen cylinders ready for patients struggling to breathe. Roughly what fraction of ordinary air is made up of oxygen?`,
    correct: "About one fifth (around 21%)",
    wrong: ["About three quarters (around 78%)", "Almost all of it (around 99%)", "Barely any of it (under 1%)"],
    explanation: "Oxygen makes up about 21% of the air — roughly a fifth — while nitrogen makes up the largest share at about 78%.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked in ${place(rng)} to draw a pie chart of the air's composition and colours the largest slice for a single gas. Which gas should get the largest slice?`,
      correct: "Nitrogen",
      wrong: ["Oxygen", "Carbon dioxide", "Argon"],
      explanation: "Nitrogen makes up about 78% of the air, by far the largest single component — the biggest slice on a correctly drawn pie chart.",
    };
  },
  (rng) => ({
    prompt: `A factory in ${place(rng)} packages crisps in bags filled with a gas instead of ordinary air, to keep the crisps fresh for longer on the shelf. Which gas is commonly used for this?`,
    correct: "Nitrogen",
    wrong: ["Oxygen, because it keeps food fresher by reacting with it", "Carbon dioxide, because it makes the crisps fizzy", "Argon, because it makes the bag glow"],
    explanation: "Nitrogen is often used to fill packaged food bags because it does not react with the food the way oxygen can, helping keep it fresh for longer.",
  }),
  (rng) => ({
    prompt: `An engineer designing energy-saving light bulbs near ${place(rng)} fills the glass bulb with a gas to stop the hot filament from burning away too quickly. Which gas is this most likely to be?`,
    correct: "Argon",
    wrong: ["Oxygen, because it burns the filament faster and brighter", "Carbon dioxide, because it cools the bulb", "Nitrogen, because it colours the light blue"],
    explanation: "Argon, one of the 'other gases' in air, is commonly used inside light bulbs because it does not easily react with the hot filament.",
  }),
];

export const airCompositionAndUses: Skill = {
  id: "g6-sci-matter-air-composition",
  code: "MAT.2a",
  subjectId: "science",
  strandId: "g6-sci-matter",
  grade: 6,
  title: "Composition and uses of air",
  description: "The components of air (nitrogen, oxygen, carbon dioxide and other gases) and their percentage composition and everyday uses, including the candle experiment that shows air contains oxygen.",
  generate(rng) {
    const branch = randChoice(rng, ["composition-pie-read", "use-match", "use-categorize", "candle-experiment-order", "reasoning", "fill-blank"] as const);

    if (branch === "composition-pie-read") {
      const target = randChoice(rng, AIR_COMPONENTS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, AIR_COMPONENTS.filter((c) => c.id !== target.id).map((c) => c.label), 3);
      return {
        kind: "multiple-choice",
        prompt: `Look at the pie chart of the composition of air. Which component makes up about ${target.percent < 1 ? "less than 1%" : `${target.percent}%`} of the air?`,
        visual: { type: "pie-chart", slices: AIR_COMPONENTS.map((c) => ({ label: c.label.split(" ")[0], value: c.percent })) },
        choices,
        correctIndex,
        layout: "list",
        explanation: `${target.label} makes up about ${target.percent}% of the air.`,
      };
    }

    if (branch === "use-match") {
      const tokens = shuffle(rng, AIR_COMPONENTS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, AIR_COMPONENTS.map((c) => ({ id: c.id, label: c.use })));
      const correctMap: Record<string, string> = {};
      for (const c of AIR_COMPONENTS) correctMap[c.id] = c.id;
      const USE_MATCH_PROMPTS = [
        "Match each component of air to one of its uses.",
        "Which use belongs to each component of air below? Match them up.",
        "Pair each component of air with something it is used for.",
        "Match each gas in the air to one of its everyday uses.",
        "Connect each component of air with one of its uses.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, USE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about breathing, plant food, fertilisers and light bulbs.",
        explanation: AIR_COMPONENTS.map((c) => `${c.label} — ${c.use}.`).join(" "),
      };
    }

    if (branch === "use-categorize") {
      const chosen = shuffle(rng, USE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `u${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`u${i}`] = f.gas));
      const USE_CATEGORIZE_PROMPTS = [
        "Sort each use by the gas it describes.",
        "Which gas does each use below belong to? Sort them.",
        "Decide which gas each use describes, then sort it.",
        "Group these uses by the gas they belong to.",
        "For each use, work out which component of air it belongs to.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, USE_CATEGORIZE_PROMPTS),
        items,
        buckets: AIR_COMPONENTS.map((c) => ({ id: c.id, label: c.label.split(" (")[0] })),
        correctBucket,
        hint: "Think about breathing and burning, plant food and fizzy drinks, fertilisers and food packaging, and light bulbs and rain.",
        explanation: chosen.map((f) => `"${f.text}" is a use of ${AIR_COMPONENTS.find((c) => c.id === f.gas)!.label}.`).join(" "),
      };
    }

    if (branch === "candle-experiment-order") {
      const shuffled = shuffle(rng, CANDLE_EXPERIMENT_STEPS);
      const EXPERIMENT_ORDER_PROMPTS = [
        "Put the steps of the candle-and-jar experiment (which shows air contains oxygen) in the correct order.",
        "Arrange these steps of the candle-and-jar oxygen experiment in the right order.",
        "Place these candle-and-jar experiment steps in the order you'd carry them out.",
        "Order these steps for the candle-and-jar experiment, from first to last.",
        "Sort these candle-and-jar experiment steps into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, EXPERIMENT_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CANDLE_EXPERIMENT_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Start with lighting the candle and finish with the conclusion about oxygen.",
        explanation: "Correct order: " + CANDLE_EXPERIMENT_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The gas that makes up the largest percentage of air, about 78%, is ", after: ".", correctAnswer: "nitrogen" },
      { before: "The gas that living things need for breathing, making up about 21% of air, is ", after: ".", correctAnswer: "oxygen" },
      { before: "The gas that green plants use for photosynthesis is ", after: ".", correctAnswer: "carbon dioxide" },
      { before: "A burning candle trapped under a jar goes out once the ", after: " inside the jar is used up.", correctAnswer: "oxygen" },
      { before: "Fertilisers that help crops grow are made using the gas ", after: ".", correctAnswer: "nitrogen" },
      { before: "The gas that makes fizzy drinks bubbly is ", after: ".", correctAnswer: "carbon dioxide" },
      { before: "The gas commonly used inside light bulbs to protect the filament is ", after: ".", correctAnswer: "argon" },
      { before: "Water vapour in the air condenses to form clouds, which can later bring ", after: ".", correctAnswer: "rain" },
      { before: "Nitrogen gas is sometimes pumped into food packaging to keep the food ", after: ".", correctAnswer: "fresh" },
      { before: "A useful way to display the percentage composition of air is to draw a ", after: ".", correctAnswer: "pie chart" },
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
      hint: "Think about the components of air and what each is used for.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
