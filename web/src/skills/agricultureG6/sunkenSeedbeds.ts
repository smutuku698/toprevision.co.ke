import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture C.2 "Conserving Water — Sunken Seedbeds" (split from the source
// sub-strand "1.2 Conserving Water — Sunken seedbed, Shallow pits" per the Grade-6 "split into
// deeper skills" rule; the shallow-pit half lives in shallowPits.ts). A sunken seedbed is one
// continuous dug trench-bed used for raising a batch of seedlings together — its construction
// sequence and moisture-conservation reasoning are genuinely different from the individual
// planting-pocket shallow pit technique, so this file's content is authored separately, not
// copied with swapped nouns.

const CONSTRUCTION_STEPS = [
  { id: "site", label: "Select a well-drained site", detail: "Choose a site with good topsoil, near a reliable water source, that will not become waterlogged" },
  { id: "mark", label: "Mark out the bed", detail: "Mark the seedbed dimensions, typically about one metre wide and a convenient length" },
  { id: "dig", label: "Dig the trench", detail: "Dig the bed down about 15 to 20 centimetres below the surrounding ground level" },
  { id: "loosen", label: "Loosen the soil", detail: "Break up and loosen the soil at the bottom of the sunken bed" },
  { id: "enrich", label: "Enrich with compost", detail: "Mix in well-decomposed manure or compost to improve the soil's fertility and moisture-holding ability" },
  { id: "level", label: "Level the surface", detail: "Rake the surface smooth and level so water spreads evenly instead of pooling in one corner" },
  { id: "sow", label: "Sow the seeds", detail: "Sow the seeds in shallow drills or scatter them evenly across the bed" },
  { id: "cover", label: "Cover the seeds", detail: "Cover the seeds lightly with a thin layer of fine soil" },
  { id: "mulch", label: "Mulch the surface", detail: "Mulch with dry grass or straw to slow down evaporation" },
  { id: "water", label: "Water regularly", detail: "Water the bed gently and regularly until the seeds germinate" },
] as const;

// ---- Practice pool (categorize): 32 practices across two buckets — well above the Grade-6
// 30-item pool floor. ----
const GOOD_PRACTICES = [
  "Digging the bed below the surrounding ground level so rainwater collects inside it instead of running off",
  "Mulching the surface with dry grass to slow down evaporation",
  "Watering gently so the water soaks in rather than running off the raised edges",
  "Choosing a site that is naturally well-drained so the bed does not become waterlogged",
  "Enriching the dug-out soil with compost, which also helps it hold moisture",
  "Keeping the sunken bed's edges firm so collected water does not simply spill out",
  "Watering early in the morning or late in the evening to reduce evaporation loss",
  "Levelling the bottom of the bed so water spreads evenly instead of pooling in one corner",
  "Positioning the bed where it will catch run-off from slightly higher ground nearby",
  "Checking the bed regularly and topping up mulch as it decomposes or blows away",
  "Digging the bed deep enough, about 15 to 20 centimetres, to make a real difference to moisture retention",
  "Covering seeds lightly with fine soil so they do not dry out before germinating",
  "Sharing the task of preparing the seedbed fairly among the group working on it",
  "Choosing a partly shaded spot where evaporation is naturally slower",
  "Using well-decomposed manure, which improves the soil's ability to hold water compared to raw soil",
  "Reinforcing the sunken bed's rim with stones or timber so it keeps its water-holding shape",
] as const;

const POOR_PRACTICES = [
  "Digging the bed on a slope so collected water simply drains away downhill",
  "Leaving the bed's surface completely bare with no mulch at all",
  "Watering heavily in the middle of a hot afternoon, when most water evaporates before it soaks in",
  "Choosing a waterlogged, poorly drained site where seeds will rot instead of germinate",
  "Digging the bed only a few centimetres below ground level, too shallow to trap much extra water",
  "Leaving the bed's edges loose and crumbling so water runs straight back out",
  "Sowing seeds too deep, so the moisture never reaches them properly",
  "Skipping the compost or manure step, leaving the soil poor at holding water",
  "Placing the bed where it will not catch any extra run-off from surrounding ground",
  "Forgetting to check on the bed, letting the mulch disappear and the soil dry out",
  "Digging the bed in full, unbroken sunlight with no shade at all, maximising evaporation",
  "Using unbroken, compacted soil at the bottom of the bed instead of loosening it first",
  "Over-watering so much that the bed becomes waterlogged and seeds rot",
  "Placing the bed right next to a footpath where it gets trampled and its edges break down",
  "Ignoring weeds that compete with the seedlings for the conserved moisture",
  "Digging the bed far from any water source, making regular watering difficult to keep up",
] as const;

// ---- Reasoning (Analyze) pool: 10 observation facts x 3 frames = 30 templates. Core
// competency "Critical thinking and problem solving" (open-mindedness/creativity in finding
// ways to conserve moisture) makes this Analyze-tier branch mandatory, not optional. ----
const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "a sunken seedbed dug 15cm below ground level holds visibly more moisture after rain than the surrounding flat ground",
    correct: "The dug-out trench collects and holds rainwater that would otherwise run off across the flat surrounding ground",
    wrong: [
      "The sunken shape makes the soil naturally cooler regardless of any water collected",
      "Digging soil out always increases its fertility, which is unrelated to moisture",
      "The lower area blocks sunlight completely, so no evaporation happens at all",
    ],
  },
  {
    situation: "seeds sown in a sunken bed germinate faster during a dry spell than seeds sown on flat, unshaped ground nearby",
    correct: "The sunken bed traps the limited available water close to the seeds instead of letting it spread out or run off",
    wrong: [
      "Sunken beds always receive more rainfall than flat ground",
      "Seeds germinate faster in any soil that has been dug up, regardless of shape",
      "The digging process itself makes seeds germinate faster",
    ],
  },
  {
    situation: "a mulched sunken seedbed stays visibly moist for several days longer than an unmulched one dug to the same depth",
    correct: "Mulch on top of the sunken bed slows evaporation from the soil surface, keeping the trapped water available for longer",
    wrong: [
      "Mulch adds its own water to the soil",
      "Mulch blocks seeds from germinating, which conserves water by delaying growth",
      "Mulch only matters for weed control, not moisture",
    ],
  },
  {
    situation: "on a slightly sloping plot, a sunken bed placed below a higher patch of ground stays moist even without extra watering",
    correct: "The bed is positioned to catch and hold run-off water flowing down from the higher ground nearby",
    wrong: [
      "Sloping land always has more rainfall than flat land",
      "The higher ground blocks wind, which is why the bed stays moist",
      "Any bed on a slope automatically conserves more water",
    ],
  },
  {
    situation: "two sunken seedbeds of the same depth, one on well-drained soil and one on waterlogged soil, perform very differently",
    correct: "The well-drained site lets excess water pass through slowly, while the waterlogged site can cause seeds to rot from too much standing water",
    wrong: [
      "Waterlogged soil is always better for seed germination",
      "Soil drainage has no effect on how a sunken bed performs",
      "A sunken bed cannot be affected by the type of soil beneath it",
    ],
  },
  {
    situation: "a sunken seedbed with firm, compact edges retains water noticeably better than one with loose, crumbling edges",
    correct: "Firm edges hold their shape and prevent the collected water from simply spilling back out onto the surrounding ground",
    wrong: [
      "Firm edges make the soil warmer, which conserves water",
      "Loose edges actually help water soak in faster, so they should be preferred",
      "Edge firmness only affects how the bed looks, not how it functions",
    ],
  },
  {
    situation: "watering a sunken seedbed early in the morning conserves more moisture than watering it in the heat of midday",
    correct: "Cooler morning conditions mean less water is lost to evaporation before it soaks into the soil",
    wrong: [
      "Plants only absorb water in the morning, never during the day",
      "Midday watering makes seeds germinate faster despite the heat",
      "The time of day has no effect on how much water evaporates",
    ],
  },
  {
    situation: "a sunken seedbed enriched with compost holds moisture longer than one dug in plain, unimproved soil",
    correct: "Compost improves the soil's structure and its ability to hold onto water between waterings",
    wrong: [
      "Compost only affects the smell of the soil, not its moisture",
      "Plain soil always holds more water than soil mixed with compost",
      "Compost works by blocking rainwater from reaching the seeds",
    ],
  },
  {
    situation: "a group tending a shared sunken seedbed decides to top up the mulch every week during the dry season",
    correct: "Mulch breaks down and thins out over time, so replacing it keeps the evaporation-slowing layer effective",
    wrong: [
      "Mulch never needs replacing once it is first applied",
      "Adding more mulch each week is only about tidiness, not moisture",
      "Weekly mulching is done to add nutrients, not to conserve moisture",
    ],
  },
  {
    situation: "a sunken seedbed placed in light afternoon shade stays moist longer than an identical bed left in full sun all day",
    correct: "Shade reduces the amount of direct heat reaching the soil surface, which slows evaporation",
    wrong: [
      "Shaded soil always has poorer drainage than sunny soil",
      "Shade prevents seeds from germinating at all",
      "Full sun always improves how much moisture a bed holds",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, tending a school garden near ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `At a demonstration plot near ${p}, learners observe that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} keeps a record of a home garden near ${p} and writes down that ${fact.situation}. What explains this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} is puzzled to find that ${fact.situation}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a garden near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `While comparing plots near ${p}, ${who} figures out that ${fact.situation}. What is happening here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

// ---- Fill-blank pool: 30 distinct vocabulary/reasoning sentences. ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "A seedbed dug below the surrounding ground level to trap and hold rainwater is called a ", after: " seedbed.", correctAnswer: "sunken", acceptedAnswers: ["sunken"] },
  { before: "Covering the surface of a sunken seedbed with dry grass or straw to slow down water loss is called ", after: ".", correctAnswer: "mulching", acceptedAnswers: ["mulching", "mulch"] },
  { before: "Mixing well-decomposed manure or ", after: " into the soil at the bottom of a sunken bed improves its ability to hold moisture.", correctAnswer: "compost", acceptedAnswers: ["compost"] },
  { before: "A sunken seedbed should be dug on a site with good ", after: " so it does not become waterlogged.", correctAnswer: "drainage", acceptedAnswers: ["drainage"] },
  { before: "The loss of water from the soil surface into the air is called ", after: ".", correctAnswer: "evaporation", acceptedAnswers: ["evaporation"] },
  { before: "Seeds begin to sprout, or ", after: ", faster when there is enough moisture around them.", correctAnswer: "germinate", acceptedAnswers: ["germinate", "germinating"] },
  { before: "A sunken seedbed is typically dug about 15 to 20 centimetres below the surrounding ", after: " level.", correctAnswer: "ground", acceptedAnswers: ["ground"] },
  { before: "Watering a sunken seedbed early in the morning reduces how much water is lost to ", after: ".", correctAnswer: "evaporation", acceptedAnswers: ["evaporation"] },
  { before: "The firm outer edge of a sunken seedbed that keeps collected water from spilling out is called its ", after: ".", correctAnswer: "rim", acceptedAnswers: ["rim", "edge"] },
  { before: "A sunken seedbed placed in light shade loses less water to evaporation than one left in full ", after: ".", correctAnswer: "sun", acceptedAnswers: ["sun", "sunlight"] },
  { before: "Digging the bed below ground level allows it to collect rainwater instead of letting it ", after: " away.", correctAnswer: "run", acceptedAnswers: ["run", "flow"] },
  { before: "The moisture held in the soil, available for seeds and roots to use, is called soil ", after: ".", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "Breaking up and loosening the soil at the bottom of a sunken bed is done before adding ", after: ".", correctAnswer: "compost", acceptedAnswers: ["compost", "manure"] },
  { before: "Seeds in a sunken seedbed are sown in shallow drills and then covered lightly with fine ", after: ".", correctAnswer: "soil", acceptedAnswers: ["soil"] },
  { before: "A group preparing a shared sunken seedbed should top up the ", after: " regularly during the dry season, since it breaks down over time.", correctAnswer: "mulch", acceptedAnswers: ["mulch"] },
  { before: "A sunken seedbed dug on waterlogged soil can cause seeds to ", after: " instead of germinating.", correctAnswer: "rot", acceptedAnswers: ["rot"] },
  { before: "The narrow dug-out channel that forms the base of a sunken seedbed is sometimes called a ", after: ".", correctAnswer: "trench", acceptedAnswers: ["trench"] },
  { before: "Choosing a site near a reliable water ", after: " makes it easier to keep watering a sunken seedbed regularly.", correctAnswer: "source", acceptedAnswers: ["source"] },
  { before: "Rainwater collects inside a sunken seedbed because the bed sits below the surrounding ground ", after: ".", correctAnswer: "level", acceptedAnswers: ["level"] },
  { before: "Loose, crumbling edges on a sunken seedbed let collected water simply ", after: " back out onto the surrounding ground.", correctAnswer: "spill", acceptedAnswers: ["spill"] },
  { before: "A sunken seedbed conserves ", after: " so that seeds have a better chance of germinating even in dry conditions.", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "Levelling the bottom of a sunken seedbed helps water spread ", after: " instead of pooling in one corner.", correctAnswer: "evenly", acceptedAnswers: ["evenly"] },
  { before: "Weeds growing in a sunken seedbed compete with the seedlings for the conserved ", after: ".", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "Manure or compost mixed into a sunken seedbed also improves the soil's ability to hold ", after: ".", correctAnswer: "water", acceptedAnswers: ["water"] },
  { before: "A sunken seedbed dug on a slope, positioned below higher ground, can catch extra ", after: " flowing down from above.", correctAnswer: "run-off", acceptedAnswers: ["run-off", "runoff"] },
  { before: "Preparing a sunken seedbed as a shared task, dividing the work fairly, reflects the value of social ", after: ".", correctAnswer: "justice", acceptedAnswers: ["justice"] },
  { before: "The main reason for digging a seedbed below ground level, rather than on the flat, is to conserve ", after: " for the germinating seeds.", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "A sunken seedbed dug too shallow will trap only a little extra ", after: " compared to flat ground.", correctAnswer: "water", acceptedAnswers: ["water"] },
  { before: "After sowing, seeds in a sunken seedbed are covered with a thin layer of fine soil to stop them from drying ", after: ".", correctAnswer: "out", acceptedAnswers: ["out"] },
  { before: "The overall purpose of preparing a sunken seedbed is to increase a seedling's chances of successful ", after: ".", correctAnswer: "growth", acceptedAnswers: ["growth"] },
];

const IDENTIFY_PROMPTS = [
  "Identify this water-conserving seedbed technique.",
  "Which seedbed technique is shown here?",
  "Name this method of preparing a seedbed.",
  "Look at the picture and identify this seedbed technique.",
  "What type of seedbed does this picture show?",
  "Study the image and name this water-conserving technique.",
];

const STEPS_MATCH_PROMPTS = [
  "Match each sunken seedbed preparation step to what it involves.",
  "Pair each seedbed preparation step with what it actually means to do.",
  "Connect each step of preparing a sunken seedbed to its description.",
  "Match each stage of the process to what it involves.",
  "Link each preparation step to the description that fits it.",
  "Match each step below to the correct explanation of what it involves.",
];

const PRACTICE_SORT_PROMPTS = [
  "Sort each practice as one that conserves moisture well or one that wastes it in a sunken seedbed.",
  "Decide whether each practice helps a sunken seedbed hold moisture or wastes it, and sort accordingly.",
  "Group these practices under whether they conserve moisture or waste it.",
  "Read each practice and sort it as moisture-conserving or moisture-wasting.",
  "Place each practice into the correct bucket: conserves moisture or wastes it.",
  "Sort these seedbed practices by whether they help or hurt moisture conservation.",
];

const CONSTRUCTION_ORDER_PROMPTS = [
  "Arrange the steps for preparing a sunken seedbed in the correct order.",
  "Put these sunken seedbed preparation steps in the right sequence.",
  "Sequence the steps for building a sunken seedbed correctly.",
  "Arrange these steps in the order a gardener would actually carry them out.",
  "Order these preparation steps from first to last.",
  "Sort these steps into the correct order for preparing a sunken seedbed.",
];

const PRACTICE_CHOICE_PROMPTS = [
  "Which of these practices best helps a sunken seedbed conserve moisture?",
  "Which practice below does the most to keep a sunken seedbed moist?",
  "Choose the practice that best conserves moisture in a sunken seedbed.",
  "Which of these actions helps a sunken seedbed hold onto water the most?",
  "Pick the practice that best supports moisture conservation in a sunken seedbed.",
  "Which option here is the most effective at conserving moisture?",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about sunken seedbeds.",
  "Fill in the missing word about sunken seedbeds.",
  "Complete this sentence about preparing a sunken seedbed.",
  "Supply the missing word in this sentence about sunken seedbeds.",
  "Fill in the blank to complete the fact about sunken seedbeds.",
  "Complete the missing word in this statement about sunken seedbeds.",
];

export const sunkenSeedbeds: Skill = {
  id: "g6-ag-c-sunken-seedbeds",
  code: "C.2",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-conservation",
  grade: 6,
  title: "Conserving Water — Sunken Seedbeds",
  description: "Preparing a sunken seedbed (dug below ground level to trap rainwater) step by step, and reasoning about why it conserves soil moisture to increase seed germination and plant growth.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify", "steps-match", "practice-sort", "construction-order", "reasoning", "practice-choice", "fill-blank"] as const
    );
    const hint = "A sunken seedbed is dug below ground level so it traps rainwater in one continuous trench-bed, instead of letting it run off flat ground.";

    if (branch === "identify") {
      const choices = shuffle(rng, ["Sunken seedbed", "Shallow pit", "Raised bed", "Flat, unshaped seedbed"]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "garden-bed", kind: "sunken-seedbed" },
        choices,
        correctIndex: choices.indexOf("Sunken seedbed"),
        layout: "list",
        hint,
        explanation: "This is a sunken seedbed — dug below the surrounding ground level so rainwater collects and stays close to the germinating seeds, unlike a shallow pit (individual small planting pockets) or a raised or flat bed.",
      };
    }

    if (branch === "steps-match") {
      const tokens = shuffle(rng, CONSTRUCTION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, CONSTRUCTION_STEPS.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of CONSTRUCTION_STEPS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, STEPS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CONSTRUCTION_STEPS.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "practice-sort") {
      const good = shuffle(rng, GOOD_PRACTICES).slice(0, 5);
      const poor = shuffle(rng, POOR_PRACTICES).slice(0, 5);
      const chosen = shuffle(rng, [
        ...good.map((text) => ({ text, bucket: "good" as const })),
        ...poor.map((text) => ({ text, bucket: "poor" as const })),
      ]);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PRACTICE_SORT_PROMPTS),
        items,
        buckets: [
          { id: "good", label: "Conserves moisture well" },
          { id: "poor", label: "Wastes moisture" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" ${c.bucket === "good" ? "conserves moisture well" : "wastes moisture"}.`).join(" "),
      };
    }

    if (branch === "construction-order") {
      const shuffled = shuffle(rng, CONSTRUCTION_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, CONSTRUCTION_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CONSTRUCTION_STEPS.map((s) => s.id),
        hint: "Prepare the site and trench first, enrich and level the soil, then sow, cover, mulch, and finally water.",
        explanation: CONSTRUCTION_STEPS.map((s) => s.label).join(" → "),
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
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "practice-choice") {
      const correct = randChoice(rng, GOOD_PRACTICES);
      const wrong = shuffle(rng, POOR_PRACTICES).slice(0, 3);
      const choices = shuffle(rng, [correct, ...wrong]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, PRACTICE_CHOICE_PROMPTS),
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint,
        explanation: `"${correct}" is correct because it directly helps the bed trap or keep the water it needs. The other options are practices that waste moisture or risk the seedbed failing.`,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${fb.before}${fb.correctAnswer}${fb.after}"`,
    };
  },
};
