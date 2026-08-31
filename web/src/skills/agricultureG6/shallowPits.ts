import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture C.3 "Conserving Water — Shallow Pits" (the other half of the source
// sub-strand "1.2 Conserving Water — Sunken seedbed, Shallow pits", split per the Grade-6
// "split into deeper skills" rule; see sunkenSeedbeds.ts for the sunken-seedbed half). A shallow
// pit is an individual small planting pocket for one plant at a time — spacing, per-pit
// watering and thinning are the content that genuinely differs from a sunken seedbed's
// continuous trench-bed, so this file is authored separately, not copied with swapped nouns.

const CONSTRUCTION_STEPS = [
  { id: "mark", label: "Mark out pit spots", detail: "Mark where each pit is needed, spaced according to the crop — closer for vegetables, wider for trees" },
  { id: "dig", label: "Dig each pit", detail: "Dig a shallow pit at each spot, roughly 20 to 30 centimetres wide and about 15 centimetres deep" },
  { id: "setaside", label: "Set topsoil aside", detail: "Set the fertile topsoil aside separately from the deeper soil as you dig" },
  { id: "enrich", label: "Enrich the topsoil", detail: "Mix the excavated topsoil with well-decomposed manure or compost" },
  { id: "return", label: "Return the soil", detail: "Return the enriched soil mixture into the bottom of each pit" },
  { id: "firm", label: "Firm the soil", detail: "Firm the soil down lightly in each pit so it holds its shape" },
  { id: "plant", label: "Plant in the centre", detail: "Plant seeds or seedlings in the centre of each pit" },
  { id: "cover", label: "Cover lightly", detail: "Cover lightly with a thin layer of soil or mulch" },
  { id: "water", label: "Water each pit", detail: "Water each pit individually, directly at the base of the plant" },
  { id: "monitor", label: "Monitor and thin", detail: "Monitor and thin each pit as plants grow, keeping only the strongest if several germinate" },
] as const;

// ---- Practice pool (categorize): 32 practices across two buckets — content genuinely
// different from sunkenSeedbeds.ts (individual pockets, per-plant spacing/watering, thinning). ----
const GOOD_PRACTICES = [
  "Spacing pits appropriately so each plant has enough room without competing for the pit's moisture",
  "Digging each pit deep enough, about 15cm, to form a real water-holding pocket around the plant",
  "Mixing manure or compost into the soil returned to each pit before planting",
  "Watering directly into each pit so the water goes straight to the plant's roots instead of spreading over a wide area",
  "Firming the soil lightly in each pit so it holds its shape and does not collapse",
  "Mulching the top of each pit to slow evaporation from that single planting pocket",
  "Choosing pit spacing based on the specific crop being planted, closer for vegetables and wider for trees",
  "Setting topsoil aside separately when digging so it can be mixed with compost and returned on top",
  "Checking each pit individually, since pits can dry out at slightly different rates",
  "Thinning seedlings within a pit so only the strongest one uses the pocket's conserved moisture",
  "Digging pits in a dry, low-rainfall area specifically to concentrate the little available water at each plant",
  "Using shallow pits for isolated planting spots, such as filling a gap in a kitchen garden or planting individual tree seedlings",
  "Reinforcing the rim of each pit slightly so it keeps its shape after watering",
  "Digging each pit's sides straight rather than sloped, so water does not run off before soaking in",
  "Watering newly planted pits more frequently until the seedling is established",
  "Placing each pit where it will not be trampled or disturbed by people or animals passing by",
] as const;

const POOR_PRACTICES = [
  "Digging pits too close together so plants compete with each other for the same conserved moisture",
  "Digging a pit only a few centimetres deep, too shallow to form a real water-holding pocket",
  "Skipping the compost or manure step, leaving the returned soil poor at holding water",
  "Watering over a wide area instead of directly into each pit, wasting water on bare ground between plants",
  "Leaving the soil loose and unfirmed, so the pit collapses in on the plant after the first watering",
  "Leaving the top of each pit bare with no mulch, letting water evaporate quickly from its small exposed area",
  "Using the same spacing for every crop regardless of how much room each type of plant actually needs",
  "Mixing topsoil and subsoil together carelessly instead of keeping the fertile topsoil for the top layer",
  "Watering all the pits the same amount without checking whether some have dried out faster than others",
  "Leaving several crowded seedlings in one pit to compete for its limited moisture instead of thinning them",
  "Digging shallow pits in an already well-watered, high-rainfall area where they add little benefit",
  "Using shallow pits to raise a large batch of seedlings together, when a bed suited to many plants would work better",
  "Leaving a pit's rim loose and uneven so it washes away after the first heavy watering",
  "Digging pits with sloped, shallow sides that let water run off before it can soak in",
  "Watering a newly planted pit only occasionally, before the seedling has become established",
  "Placing pits along a busy footpath or animal path where they get trampled and disturbed",
] as const;

// ---- Reasoning (Analyze) pool: 10 observation facts x 3 frames = 30 templates. Core
// competency "Critical thinking and problem solving" makes this Analyze-tier branch mandatory. ----
const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "seedlings planted in individually spaced shallow pits survive a dry spell better than seedlings planted close together in one continuous row on flat ground",
    correct: "Each pit concentrates the little available water around a single plant instead of spreading it thinly over a whole row",
    wrong: [
      "Pits always receive more rainfall than flat rows",
      "Spacing has no effect on how much water each plant gets",
      "Individually spaced plants never need water at all",
    ],
  },
  {
    situation: "a shallow pit watered directly at its base keeps its plant healthier during a water shortage than a wider area watered with the same total amount",
    correct: "Watering directly into the pit sends the water straight to the roots instead of losing some to the bare soil around the plant",
    wrong: [
      "The total amount of water used does not matter, only how it looks when poured",
      "Wider watering always reaches roots faster",
      "Direct watering only helps because it is done more often, not because of where it goes",
    ],
  },
  {
    situation: "gaps in a kitchen garden filled with shallow pits establish new seedlings faster than gaps simply re-seeded on flat ground",
    correct: "Each pit's slight depression traps a pocket of extra moisture right where the new seedling needs it most",
    wrong: [
      "Filling a gap with any kind of hole always works the same regardless of depth",
      "Flat re-seeding always germinates faster than pit planting",
      "Gaps only need extra fertiliser, not extra water",
    ],
  },
  {
    situation: "a shallow pit dug with straight sides holds water for the plant longer than one dug with sloped, shallow sides",
    correct: "Straight sides stop the water from running off quickly, letting it soak down to the roots instead",
    wrong: [
      "Sloped sides always look neater, which has nothing to do with water retention",
      "Straight sides make the soil warmer, which conserves water",
      "Pit shape has no effect on how much water a plant receives",
    ],
  },
  {
    situation: "two tree seedlings planted in shallow pits of different depths grow very differently during a dry season",
    correct: "The deeper pit holds a larger pocket of moisture around its roots, giving that seedling more water to draw on between rains",
    wrong: [
      "Pit depth only affects how the pit looks, not how much water it holds",
      "Shallower pits always drain better and are therefore always preferred",
      "Tree seedlings do not need extra water regardless of pit depth",
    ],
  },
  {
    situation: "a mulched shallow pit stays moist for longer than an unmulched pit of the same size and depth",
    correct: "Mulch on top of the small pit slows evaporation from its limited exposed surface area",
    wrong: [
      "Mulch works by attracting extra rain to that spot",
      "Mulch replaces the need for watering completely",
      "Mulch only matters for larger beds, not individual pits",
    ],
  },
  {
    situation: "a farmer thins crowded seedlings within a single shallow pit down to just one plant",
    correct: "Thinning leaves only one plant to use the pit's limited conserved moisture, instead of several plants competing for it",
    wrong: [
      "Thinning is done only to make the garden look tidy",
      "More seedlings in one pit always share water equally with no downside",
      "Thinning has no effect on how much water each remaining plant gets",
    ],
  },
  {
    situation: "shallow pits spaced correctly for a crop perform better than pits spaced too close together for that same crop",
    correct: "Correct spacing means each plant's pit has its own moisture pocket, without roots from neighbouring pits competing for the same water",
    wrong: [
      "Spacing only affects how much sunlight each plant receives, not water",
      "Pits placed close together automatically share water evenly with no loss",
      "Any spacing works equally well regardless of the crop",
    ],
  },
  {
    situation: "a shallow pit in a low-rainfall area shows a much bigger benefit than an identical pit dug in a naturally wet area",
    correct: "In a dry area, concentrating the little available water in a pit around each plant makes a much bigger difference than where water is already plentiful",
    wrong: [
      "Shallow pits only work in wet areas, never in dry ones",
      "Rainfall amount has no effect on how useful a shallow pit is",
      "Pits are equally beneficial no matter the local rainfall",
    ],
  },
  {
    situation: "a firmly packed shallow pit keeps its shape and water-holding pocket longer than a loosely filled one",
    correct: "Firming the soil helps the pit hold its shape after watering, instead of collapsing and losing its ability to trap moisture",
    wrong: [
      "Loosely packed soil always holds more water than firm soil",
      "Firming the soil is only about appearance, not moisture retention",
      "Pit shape has no effect once the plant is established",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, tending a home garden near ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `On a tree nursery near ${p}, workers observe that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} compares planting spots in a shamba near ${p} and finds that ${fact.situation}. What explains this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} is curious to find that ${fact.situation}. What is the reason behind this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a garden near ${p}. What causes this difference?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `While inspecting plots near ${p}, ${who} works out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

// ---- Fill-blank pool: 30 distinct vocabulary/reasoning sentences. ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "A small, individual planting pocket dug below ground level for one plant at a time is called a shallow ", after: ".", correctAnswer: "pit", acceptedAnswers: ["pit"] },
  { before: "Shallow pits are typically spaced according to the needs of the specific ", after: " being planted.", correctAnswer: "crop", acceptedAnswers: ["crop"] },
  { before: "Watering directly into a shallow pit, rather than over a wide area, sends water straight to the plant's ", after: ".", correctAnswer: "roots", acceptedAnswers: ["roots"] },
  { before: "A shallow pit is usually dug about 20 to 30 centimetres wide and around 15 centimetres ", after: ".", correctAnswer: "deep", acceptedAnswers: ["deep"] },
  { before: "Digging a pit with straight sides, rather than sloped ones, helps stop water from running ", after: " before it soaks in.", correctAnswer: "off", acceptedAnswers: ["off"] },
  { before: "Excavated topsoil is set aside separately so it can later be mixed with manure or ", after: " before being returned to the pit.", correctAnswer: "compost", acceptedAnswers: ["compost"] },
  { before: "Firming the soil in a shallow pit helps it keep its ", after: " after watering.", correctAnswer: "shape", acceptedAnswers: ["shape"] },
  { before: "When several seedlings germinate in one shallow pit, removing the weaker ones is called ", after: ".", correctAnswer: "thinning", acceptedAnswers: ["thinning"] },
  { before: "Shallow pits are especially useful in areas of low or unreliable ", after: ".", correctAnswer: "rainfall", acceptedAnswers: ["rainfall"] },
  { before: "Mulching the top of a shallow pit slows down water loss through ", after: ".", correctAnswer: "evaporation", acceptedAnswers: ["evaporation"] },
  { before: "Using shallow pits to fill a gap left by a failed seedling in a kitchen garden is a common real-world ", after: ".", correctAnswer: "use", acceptedAnswers: ["use"] },
  { before: "Shallow pits concentrate the limited available water directly around a single ", after: ".", correctAnswer: "plant", acceptedAnswers: ["plant"] },
  { before: "A shallow pit dug too close to its neighbour causes the two plants to compete for the same conserved ", after: ".", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "Tree seedlings are often planted using individual shallow pits rather than one long, continuous ", after: ".", correctAnswer: "bed", acceptedAnswers: ["bed"] },
  { before: "Watering a newly planted shallow pit more often than an established one helps the seedling become ", after: ".", correctAnswer: "established", acceptedAnswers: ["established"] },
  { before: "A shallow pit with loose, unfirmed soil can collapse in on the young ", after: " after the first heavy watering.", correctAnswer: "plant", acceptedAnswers: ["plant"] },
  { before: "The main purpose of a shallow pit is to conserve ", after: " for a single plant rather than a whole bed.", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "Digging pits with the correct spacing for each crop prevents roots from different pits from competing for ", after: ".", correctAnswer: "water", acceptedAnswers: ["water"] },
  { before: "A shallow pit placed along a busy footpath risks being ", after: " by people or animals passing by.", correctAnswer: "trampled", acceptedAnswers: ["trampled"] },
  { before: "Returning enriched soil to the bottom of a shallow pit improves its ability to hold ", after: " for the plant.", correctAnswer: "water", acceptedAnswers: ["water"] },
  { before: "Checking each shallow pit individually matters because pits can dry out at different ", after: ".", correctAnswer: "rates", acceptedAnswers: ["rates"] },
  { before: "A shallow pit dug in an already well-watered area gives a smaller benefit than one dug in a ", after: " area.", correctAnswer: "dry", acceptedAnswers: ["dry"] },
  { before: "Covering a newly planted shallow pit with a thin layer of soil or mulch protects the seedling from drying ", after: ".", correctAnswer: "out", acceptedAnswers: ["out"] },
  { before: "Digging a shallow pit too shallow means it cannot form a real water-holding ", after: ".", correctAnswer: "pocket", acceptedAnswers: ["pocket"] },
  { before: "Unlike a sunken seedbed, which raises many seedlings together, a shallow pit is used for a single, ", after: " planting spot.", correctAnswer: "isolated", acceptedAnswers: ["isolated"] },
  { before: "Marking out shallow pit locations before digging helps keep the spacing ", after: " for the crop being planted.", correctAnswer: "consistent", acceptedAnswers: ["consistent"] },
  { before: "A shallow pit's rim should be kept firm so it does not wash away during ", after: ".", correctAnswer: "watering", acceptedAnswers: ["watering"] },
  { before: "Choosing wider spacing for tree seedlings than for vegetables reflects the different ", after: " needs of each plant.", correctAnswer: "space", acceptedAnswers: ["space", "spacing"] },
  { before: "The overall goal of preparing shallow pits is to increase each seedling's chance of successful ", after: ".", correctAnswer: "growth", acceptedAnswers: ["growth"] },
  { before: "Filling gaps with shallow pits instead of re-seeding on flat ground is a practical use of this moisture-", after: " technique.", correctAnswer: "conservation", acceptedAnswers: ["conservation"] },
];

const IDENTIFY_PROMPTS = [
  "Identify this water-conserving planting technique.",
  "Which planting technique is shown here?",
  "Name this method of preparing a planting spot.",
  "Look at the picture and identify this planting technique.",
  "What type of planting pocket does this picture show?",
  "Study the image and name this water-conserving technique.",
];

const STEPS_MATCH_PROMPTS = [
  "Match each shallow pit preparation step to what it involves.",
  "Pair each preparation step with what it actually means to do.",
  "Connect each step of preparing a shallow pit to its description.",
  "Match each stage of the process to what it involves.",
  "Link each preparation step to the description that fits it.",
  "Match each step below to the correct explanation of what it involves.",
];

const PRACTICE_SORT_PROMPTS = [
  "Sort each practice as one that conserves moisture well or one that wastes it in shallow pits.",
  "Decide whether each practice helps a shallow pit hold moisture or wastes it, and sort accordingly.",
  "Group these practices under whether they conserve moisture or waste it.",
  "Read each practice and sort it as moisture-conserving or moisture-wasting.",
  "Place each practice into the correct bucket: conserves moisture or wastes it.",
  "Sort these shallow-pit practices by whether they help or hurt moisture conservation.",
];

const CONSTRUCTION_ORDER_PROMPTS = [
  "Arrange the steps for preparing a shallow pit in the correct order.",
  "Put these shallow pit preparation steps in the right sequence.",
  "Sequence the steps for digging a shallow pit correctly.",
  "Arrange these steps in the order a gardener would actually carry them out.",
  "Order these preparation steps from first to last.",
  "Sort these steps into the correct order for preparing a shallow pit.",
];

const PRACTICE_CHOICE_PROMPTS = [
  "Which of these practices best helps a shallow pit conserve moisture for its plant?",
  "Which practice below does the most to keep a shallow pit moist for its plant?",
  "Choose the practice that best conserves moisture in a shallow pit.",
  "Which of these actions helps a shallow pit hold onto water for its plant the most?",
  "Pick the practice that best supports moisture conservation in a shallow pit.",
  "Which option here is the most effective at conserving moisture for the plant?",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about shallow pits.",
  "Fill in the missing word about shallow pits.",
  "Complete this sentence about preparing a shallow pit.",
  "Supply the missing word in this sentence about shallow pits.",
  "Fill in the blank to complete the fact about shallow pits.",
  "Complete the missing word in this statement about shallow pits.",
];

export const shallowPits: Skill = {
  id: "g6-ag-c-shallow-pits",
  code: "C.3",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-conservation",
  grade: 6,
  title: "Conserving Water — Shallow Pits",
  description: "Preparing individual shallow pits (small planting pockets that trap moisture around one plant at a time) step by step, and reasoning about why correct spacing, depth and per-pit watering conserve soil moisture.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify", "steps-match", "practice-sort", "construction-order", "reasoning", "practice-choice", "fill-blank"] as const
    );
    const hint = "A shallow pit is a small, individual planting pocket for one plant, spaced apart from other pits — different from a sunken seedbed's one continuous trench for many seedlings.";

    if (branch === "identify") {
      const choices = shuffle(rng, ["Shallow pit", "Sunken seedbed", "Raised bed", "Flat, unshaped seedbed"]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "garden-bed", kind: "shallow-pit" },
        choices,
        correctIndex: choices.indexOf("Shallow pit"),
        layout: "list",
        hint,
        explanation: "This is a shallow pit — a small, individual planting pocket dug for one plant at a time, unlike a sunken seedbed (one continuous trench for many seedlings) or a raised or flat bed.",
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
        hint: "Mark and dig each pit first, prepare and return the enriched soil, then plant, cover, water, and finally monitor and thin.",
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
        explanation: `"${correct}" is correct because it directly helps that single pit trap or keep the water its plant needs. The other options are practices that waste moisture or risk the pit failing.`,
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
