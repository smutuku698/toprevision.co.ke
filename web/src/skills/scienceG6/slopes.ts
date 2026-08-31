import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 3.3 Slopes as simple machines — kept as a single skill (14
// lessons, narrower named-example list than levers). The sub-strand's Core Competencies box explicitly names
// "Critical thinking and problem solving," so per RIGOR-STANDARDS.md this skill requires at least one
// Analyze-or-Evaluate branch — here, weighing a steep-but-short slope against a gentle-but-long one.

const SLOPE_TYPES = [
  { id: "ramp", label: "Ramp", desc: "A straight sloped surface joining two different heights, used to move loads up or down more easily than lifting them straight up" },
  { id: "staircase", label: "Staircase", desc: "A series of small, even steps that break a climb into short, manageable stages" },
  { id: "wedge", label: "Wedge", desc: "A slope brought to a thin edge, used to split, cut or lift by concentrating force at that edge" },
  { id: "winding-road", label: "Road winding uphill", desc: "A road that zig-zags gradually up a hill instead of going straight up, making the climb gentler" },
] as const;

const SLOPE_EXAMPLES = [
  { text: "A wooden ramp used to load furniture into the back of a lorry", type: "ramp" },
  { text: "A wheelchair ramp beside a flight of steps at a building entrance", type: "ramp" },
  { text: "A gently sloped roof that lets rainwater run off instead of collecting", type: "ramp" },
  { text: "Stairs leading from the ground floor to the first floor of a building", type: "staircase" },
  { text: "An escalator (moving staircase) inside a shopping mall", type: "staircase" },
  { text: "An axe head used to split firewood", type: "wedge" },
  { text: "A doorstop wedged under a door to hold it open", type: "wedge" },
  { text: "A knife blade slicing through vegetables", type: "wedge" },
  { text: "A mountain road that curves back and forth as it climbs a steep hillside", type: "winding-road" },
  { text: "A hiking trail that zig-zags up a hill instead of going straight up", type: "winding-road" },
] as const;

const OTHER_SLOPE_USES = [
  { text: "A ladder leaning against a wall lets a person climb up gradually", type: "ramp" },
  { text: "A cableway carries loads up a steep hillside along a sloped path", type: "ramp" },
  { text: "Elevators and lifts move people vertically, using motors rather than a sloped surface, so they are not usually classed as a slope", type: "not-a-slope" },
] as const;

const SLOPE_BUILD_STEPS = [
  { id: "s1", label: "Decide the height that needs to be climbed and the space available" },
  { id: "s2", label: "Choose locally available materials, such as a wooden plank or packed soil" },
  { id: "s3", label: "Build the slope so it rises gradually from the ground to the required height" },
  { id: "s4", label: "Test the slope by moving a load up and down it" },
  { id: "s5", label: "Adjust the slope's steepness if it is still too difficult to use" },
] as const;

const KENYAN_PLACES = ["Nyeri", "Nakuru", "Kericho", "Kisumu", "Machakos", "Eldoret", "Kitale", "Mombasa", "Meru", "Nairobi", "Bomet", "Nanyuki"] as const;
const KENYAN_NAMES = ["Wanjala", "Mueni", "Kiptoo", "Achieng", "Bosire", "Njoki", "Yusuf", "Caren", "Mwangi", "Nasimiyu", "Tobias", "Wangui"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} needs to load a heavy sack of maize onto a lorry in ${place(rng)} and uses a wooden plank leaning from the ground to the lorry bed. What kind of simple machine is this plank, and why does it help?`,
      correct: "A ramp — it lets the sack be pushed up gradually instead of being lifted straight up all at once",
      wrong: ["A wedge — it splits the sack into smaller, lighter parts", "A staircase — it breaks the climb into small steps", "It is not a simple machine at all, just a plank"],
      explanation: "A ramp is a sloped simple machine that spreads the work of lifting over a longer distance, making it easier than lifting a load straight up.",
    };
  },
  (rng) => ({
    prompt: `A road up a steep hill near ${place(rng)} winds back and forth instead of going straight up. Why do road engineers design it this way?`,
    correct: "Winding the road gradually reduces the steepness travelled at any one point, making the climb easier for vehicles",
    wrong: ["Winding roads are only built to make the drive more scenic", "A winding road is always shorter in distance than a straight one", "Winding roads have nothing to do with the steepness of the climb"],
    explanation: "A winding road turns a very steep climb into a longer but gentler one, which is easier and safer for vehicles to travel — the same principle as a ramp.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} uses an axe to split a log for firewood in ${place(rng)}. What kind of slope-based simple machine is the axe head, and how does it work?`,
      correct: "A wedge — its sloped sides come to a thin edge that concentrates force to split the wood apart",
      wrong: ["A ramp — it lets the log be moved up gradually", "A staircase — it breaks the splitting into stages", "It is not a simple machine, just a sharp metal tool"],
      explanation: "A wedge is a slope brought to a thin edge; striking it concentrates force at that edge, which is exactly how an axe splits wood.",
    };
  },
  (rng) => ({
    prompt: `A building in ${place(rng)} has both a flight of steps and a separate wheelchair ramp leading to the entrance. Why might someone choose the ramp over the steps?`,
    correct: "A ramp lets a wheelchair, trolley or pushcart move up gradually along a continuous sloped surface, which steps cannot allow",
    wrong: ["A ramp is always shorter in distance than a staircase", "Ramps and staircases work in exactly the same way", "A ramp requires more effort than climbing steps"],
    explanation: "Unlike a staircase, a ramp provides a continuous sloped surface, which is essential for wheels (wheelchairs, trolleys, luggage) rather than feet.",
  }),
  (rng) => ({
    prompt: `${name(rng)} compares two ramps for loading the same heavy box onto a truck in ${place(rng)}: a short, steep ramp and a long, gently sloped ramp. Which ramp generally needs less effort to push the box up, and what is the trade-off?`,
    correct: "The long, gentle ramp needs less effort at any moment, but the box must be pushed a greater distance to reach the same height",
    wrong: ["The short, steep ramp always needs less effort and less distance at the same time", "Ramp steepness has no effect on how much effort is needed", "The long, gentle ramp needs more effort because it takes longer to push"],
    explanation: "A gentler slope spreads the same total lift over a longer distance, reducing the effort needed at any moment — but the load has to travel further to reach the same height, which is the essential trade-off of using a slope.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is choosing between building a very steep, short ramp or a long, gentle ramp for wheeling heavy sacks up to a raised store in ${place(rng)}. Space is limited, so the steep ramp is much shorter. What is the wisest choice, and why?`,
    correct: "It depends on the priority — the steep ramp saves space but needs more effort per push, while the gentle ramp needs less effort but requires more space; the right choice balances available space against how heavy the load is",
    wrong: ["The steep ramp is always the better choice regardless of the load's weight", "The gentle ramp is always the better choice regardless of available space", "Steepness makes no real difference to how easy the ramp is to use"],
    explanation: "Choosing a ramp's steepness is a genuine trade-off between effort and space/distance — critical thinking about the specific situation (how heavy the load is, how much space is available) is needed, not a single rule that always applies.",
  }),
  (rng) => ({
    prompt: `A furniture mover in ${place(rng)} weighs whether to carry a heavy wardrobe up a flight of steep steps or use a ramp instead. Why would the ramp likely make the job easier, even though the total height climbed is the same?`,
    correct: "A ramp spreads the same height gain over a longer, gentler path, needing less force at any one moment than lifting up steep steps",
    wrong: ["A ramp makes the wardrobe weigh less", "Steps always require less total effort than a ramp for the same height", "There is no real difference between using steps and a ramp"],
    explanation: "Even though the total height gained is identical, a ramp spreads that height gain over more distance, reducing how much force is needed at any single moment compared with lifting straight up steep steps.",
  }),
];

export const slopes: Skill = {
  id: "g6-sci-fe-slopes",
  code: "FE.3",
  subjectId: "science",
  strandId: "g6-sci-fe",
  grade: 6,
  title: "Slopes as simple machines",
  description: "Types of slopes (ramps, staircases, wedges, winding roads) and how they make work easier in everyday life, including weighing the trade-off between a steep, short slope and a gentle, long one.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-slope-type", "type-desc-match", "example-categorize", "not-a-slope-sort", "build-order", "reasoning", "fill-blank"] as const);

    if (branch === "identify-slope-type") {
      const target = randChoice(rng, SLOPE_TYPES);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, SLOPE_TYPES.filter((t) => t.id !== target.id).map((t) => t.label), 3);
      const IDENTIFY_SLOPE_PROMPTS = [
        "Identify this type of slope used as a simple machine.",
        "Which type of slope is shown here?",
        "What is the name of this type of slope?",
        "Look at this slope. What type is it?",
        "Name this type of slope.",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_SLOPE_PROMPTS),
        visual: { type: "inclined-plane", kind: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label}. ${target.desc}.`,
      };
    }

    if (branch === "type-desc-match") {
      const tokens = shuffle(rng, SLOPE_TYPES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, SLOPE_TYPES.map((t) => ({ id: t.id, label: t.desc })));
      const correctMap: Record<string, string> = {};
      for (const t of SLOPE_TYPES) correctMap[t.id] = t.id;
      const TYPE_DESC_PROMPTS = [
        "Match each type of slope to its description.",
        "Which description belongs to each type of slope below? Match them up.",
        "Pair each type of slope with the description that fits it.",
        "Match each slope type to how it looks or works.",
        "Connect each type of slope with its correct description.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TYPE_DESC_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether it's a straight surface, small steps, a thin edge, or a zig-zag path.",
        explanation: SLOPE_TYPES.map((t) => `${t.label} — ${t.desc}.`).join(" "),
      };
    }

    if (branch === "build-order") {
      const shuffled = shuffle(rng, SLOPE_BUILD_STEPS);
      const BUILD_ORDER_PROMPTS = [
        "Put the steps of building and testing a simple slope in the correct order.",
        "Arrange these steps for building and testing a simple slope in the right order.",
        "Place these slope-building steps in the order you'd actually carry them out.",
        "Order these steps for building a simple slope, from first to last.",
        "Sort these slope-building and testing steps into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, BUILD_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: SLOPE_BUILD_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Plan first, then build, then test, then adjust if needed.",
        explanation: "Correct order: " + SLOPE_BUILD_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "example-categorize") {
      const chosen = shuffle(rng, SLOPE_EXAMPLES).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `e${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`e${i}`] = f.type));
      const EXAMPLE_CATEGORIZE_PROMPTS = [
        "Sort each real-world example by the type of slope it uses.",
        "Which type of slope does each example below use? Sort them.",
        "Decide which type of slope each example uses, then sort it.",
        "Group these real-world examples by the type of slope involved.",
        "For each example, work out which type of slope it uses.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, EXAMPLE_CATEGORIZE_PROMPTS),
        items,
        buckets: SLOPE_TYPES.map((t) => ({ id: t.id, label: t.label })),
        correctBucket,
        hint: "Think about whether it's a straight ramp, small steps, a thin splitting edge, or a zig-zag path.",
        explanation: chosen.map((f) => `"${f.text}" uses a ${SLOPE_TYPES.find((t) => t.id === f.type)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "not-a-slope-sort") {
      const chosen = shuffle(rng, [...shuffle(rng, SLOPE_EXAMPLES).slice(0, 6), ...OTHER_SLOPE_USES]);
      const items = chosen.map((f, i) => ({ id: `n${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`n${i}`] = f.type === "not-a-slope" ? "not-a-slope" : "is-a-slope"));
      const NOT_A_SLOPE_PROMPTS = [
        "Sort each example as using a slope, or not being a slope-based simple machine.",
        "Which examples below use a slope, and which don't? Sort them.",
        "Decide whether each example is a slope-based machine or not, then sort it.",
        "Group these examples into ones that use a slope and ones that don't.",
        "For each example, work out whether it's actually a slope-based machine.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, NOT_A_SLOPE_PROMPTS),
        items,
        buckets: [
          { id: "is-a-slope", label: "Uses a slope" },
          { id: "not-a-slope", label: "Not a slope" },
        ],
        correctBucket,
        hint: "A slope is a continuous sloped surface — a motor-powered lift is not.",
        explanation: chosen.map((f) => `"${f.text}" ${f.type === "not-a-slope" ? "does not use a slope" : "uses a slope"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A straight sloped surface joining two heights, used to move a load up or down, is a ", after: ".", correctAnswer: "ramp" },
      { before: "A series of small, even steps that break a climb into stages is a ", after: ".", correctAnswer: "staircase" },
      { before: "A slope brought to a thin edge, used to split or cut, is a ", after: ".", correctAnswer: "wedge" },
      { before: "A road that zig-zags up a hill instead of going straight up is a ", after: ".", correctAnswer: "winding road" },
      { before: "An axe head is an everyday example of a ", after: ".", correctAnswer: "wedge" },
      { before: "A wheelchair ramp is an everyday example of a ", after: ".", correctAnswer: "ramp" },
      { before: "A gentler slope generally needs ", after: " effort but covers a greater distance.", correctAnswer: "less" },
      { before: "A steeper slope generally needs more effort but covers a ", after: " distance.", correctAnswer: "shorter" },
      { before: "Elevators and lifts use motors rather than a sloped surface, so they are ", after: " usually classed as a slope.", correctAnswer: "not" },
      { before: "Slopes, like levers, are a type of simple ", after: ".", correctAnswer: "machine" },
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
      hint: "Think about the different types of slopes and how they make work easier.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
