import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { g6Name, g6Place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./sharedG6Ag";

// KICD Grade 6 Agriculture P.3 "Constructing a Sunken Moist Bed Garden" (one half of source
// sub-strand "4.2 Constructing Moist Bed Garden — sunken or raised", split per the Grade-6
// "split into deeper skills" rule; see raisedMoistBedGarden.ts for the raised half). A sunken
// moist bed is dug BELOW ground level so it traps water near the roots — the opposite mechanism
// to a raised bed's improved drainage, so this file's reasoning content is genuinely distinct,
// not the raised-bed file with swapped nouns.

const CONSTRUCTION_STEPS = [
  { id: "select-site", label: "Select a suitable site", detail: "Choose a level, sunny spot with soil that drains reasonably well, away from standing floodwater" },
  { id: "mark-out", label: "Mark out the bed", detail: "Mark the outline of the bed using pegs and string, to the size needed for the chosen crop" },
  { id: "dig-down", label: "Dig the bed down", detail: "Dig the marked area down below the surrounding ground level, setting the topsoil aside separately" },
  { id: "loosen-base", label: "Loosen the base", detail: "Loosen the soil at the bottom of the dug bed so roots and water can penetrate more easily" },
  { id: "add-organic", label: "Add organic matter", detail: "Mix compost or well-rotted manure into the excavated topsoil to improve its fertility and water-holding ability" },
  { id: "return-soil", label: "Return the enriched soil", detail: "Return the enriched topsoil into the bottom of the sunken bed, filling it to just below the surrounding ground level" },
  { id: "level-firm", label: "Level and firm the bed", detail: "Level the soil surface inside the bed and firm it gently, without compacting it too hard" },
  { id: "plant-crop", label: "Plant the chosen crop", detail: "Plant seeds or seedlings of the selected crop into the prepared, sunken bed" },
  { id: "mulch", label: "Mulch the surface", detail: "Cover the surface with a layer of mulch to further reduce evaporation from the sunken bed" },
  { id: "water-monitor", label: "Water and monitor", detail: "Water the bed as needed and monitor the growing crop regularly" },
] as const;

const GOOD_PRACTICES = [
  "Digging the bed genuinely below the surrounding ground level, not just marking its outline on flat ground",
  "Loosening the soil at the base of the bed so water can soak in rather than pool uselessly on a hard layer",
  "Mixing compost or manure into the soil before returning it to the bed",
  "Choosing a site that is not already prone to flooding or waterlogging",
  "Levelling the inside of the bed so water collects evenly rather than running to one side",
  "Mulching the surface of the sunken bed to further slow evaporation",
  "Sizing the bed to suit the specific crop being grown",
  "Using locally available materials, such as hand tools already owned, to dig and shape the bed",
  "Checking the bed's moisture regularly rather than assuming it never needs watering",
  "Firming the soil gently rather than compacting it so hard that roots cannot spread",
  "Choosing a level site so the sunken bed holds water evenly across its whole area",
  "Keeping the surrounding ground slightly higher than the bed so runoff drains into it",
] as const;

const POOR_PRACTICES = [
  "Digging the bed only a shallow scrape below ground level, too little to trap meaningful moisture",
  "Skipping the compost or manure step, leaving the returned soil poor at holding water",
  "Choosing a site in a natural low point that already floods after heavy rain",
  "Leaving the base of the bed hard and unloosened, so water cannot soak in properly",
  "Building the bed on a sloped site so water runs off to one side instead of collecting evenly",
  "Never mulching the surface, letting water evaporate quickly from the exposed soil",
  "Digging one large bed sized for a completely different crop than the one actually being planted",
  "Assuming a sunken bed never needs watering at all once it is built",
  "Packing the soil down so hard that roots cannot spread through it",
  "Digging the bed right where surrounding runoff constantly overflows it during heavy rain",
  "Failing to set the topsoil aside separately, mixing it carelessly with poorer subsoil",
  "Ignoring the crop's actual size and spacing needs when marking out the bed",
] as const;

const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "vegetables planted in a sunken moist bed survive a short dry spell noticeably better than the same vegetables planted on flat, ungraded ground nearby",
    correct: "The sunken bed sits below ground level, so water naturally collects and stays near the roots instead of running off across flat ground",
    wrong: [
      "A sunken bed always receives more rainfall than flat ground",
      "The depth of a bed has no effect on how much moisture reaches its plants",
      "Flat ground always holds water better than a dug-down bed",
    ],
  },
  {
    situation: "a sunken bed with its base soil loosened before planting grows a healthier crop than one where the base was left hard and compacted",
    correct: "Loosened soil lets water soak downward to the roots instead of pooling uselessly on a hard, compacted surface",
    wrong: [
      "Loosening the base soil has no effect on how water moves through a sunken bed",
      "A hard, compacted base always holds more water for the plant",
      "Only the top layer of soil in a bed matters, never the base",
    ],
  },
  {
    situation: "a sunken bed built on a sloped site loses water unevenly, while the same bed built on level ground holds water evenly across its whole area",
    correct: "On a slope, water collected in the bed runs toward the lower side instead of staying spread evenly, so a level site keeps moisture even for every plant",
    wrong: [
      "Site slope has no effect on how water is distributed in a sunken bed",
      "A sloped site always distributes water more evenly than a level one",
      "Only rainfall amount matters for a sunken bed, never the slope of the site",
    ],
  },
  {
    situation: "a sunken bed built in a spot that already floods after heavy rain drowns its crop, while an identical bed built on a well-chosen, well-drained site nearby thrives",
    correct: "A site already prone to flooding adds far too much water to an already water-retaining sunken bed, waterlogging and damaging the roots",
    wrong: [
      "A sunken bed can never hold too much water, no matter where it is dug",
      "Site selection makes no difference once a bed is dug below ground level",
      "Flooding only affects raised beds, never sunken ones",
    ],
  },
  {
    situation: "a mulched sunken bed stays visibly moister for longer after watering than an identical unmulched sunken bed",
    correct: "Mulch on top of the sunken bed slows evaporation from its already-collected moisture, adding a second layer of water conservation on top of the bed's shape",
    wrong: [
      "Mulch has no additional effect once a bed is already sunken",
      "Mulch works by attracting extra rainfall to the bed",
      "Mulching only matters for raised beds, never sunken ones",
    ],
  },
  {
    situation: "soil enriched with compost and returned to a sunken bed holds moisture for longer than soil returned to the bed without any compost added",
    correct: "Compost improves the soil's structure and ability to hold water, adding to the moisture the sunken shape already traps",
    wrong: [
      "Compost has no effect on how well soil holds water",
      "Only the depth of a bed affects moisture retention, never the soil quality inside it",
      "Adding compost actually makes soil drain faster and hold less water",
    ],
  },
  {
    situation: "a farmer sizes a sunken bed correctly for the specific crop being grown, while a neighbouring bed dug the same generic size struggles to support a much larger crop planted in it",
    correct: "Matching the bed's size to the crop's actual spacing and root needs gives each plant enough room and moisture, while an ill-fitting size leaves plants competing",
    wrong: [
      "Bed size has no connection to how well a crop grows inside it",
      "A larger bed always works equally well for any crop regardless of its needs",
      "Only watering frequency matters, never the size of the bed itself",
    ],
  },
  {
    situation: "a sunken bed still needs occasional watering during a long dry season, even though it was built specifically to conserve moisture",
    correct: "A sunken bed conserves and traps moisture better than flat ground, but it does not eliminate the need for water entirely during a genuinely long dry period",
    wrong: [
      "A properly built sunken bed never needs any watering once it is established",
      "Sunken beds are only useful during the rainy season, never the dry season",
      "Watering a sunken bed is unnecessary and wastes the water it has already trapped",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `${who}, tending a kitchen garden near ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    return {
      prompt: `On a school garden project near ${p}, learners observe that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} compares two garden beds and finds that ${fact.situation}. Why does this happen?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} is puzzled to find that ${fact.situation}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a garden near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `While inspecting garden plots near ${p}, ${who} works out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "A sunken moist bed garden is dug ", after: " the surrounding ground level.", correctAnswer: "below", acceptedAnswers: ["below"] },
  { before: "Digging a bed below ground level helps trap and hold ", after: " near the plant roots.", correctAnswer: "water", acceptedAnswers: ["water", "moisture"] },
  { before: "The base of a sunken bed should be ", after: " so water can soak down to the roots.", correctAnswer: "loosened", acceptedAnswers: ["loosened"] },
  { before: "Mixing compost or manure into the returned soil improves its ability to hold ", after: ".", correctAnswer: "water", acceptedAnswers: ["water", "moisture"] },
  { before: "A sunken bed should be built on a ", after: " site so water collects evenly rather than running to one side.", correctAnswer: "level", acceptedAnswers: ["level", "flat"] },
  { before: "A site already prone to ", after: " should be avoided, since it can waterlog a sunken bed's crop.", correctAnswer: "flooding", acceptedAnswers: ["flooding"] },
  { before: "Mulching the surface of a sunken bed further slows down water loss through ", after: ".", correctAnswer: "evaporation", acceptedAnswers: ["evaporation"] },
  { before: "The size of a sunken bed should be matched to the needs of the specific ", after: " being grown.", correctAnswer: "crop", acceptedAnswers: ["crop"] },
  { before: "Topsoil dug out while making a sunken bed is usually set aside so it can be enriched with ", after: " before being returned.", correctAnswer: "compost", acceptedAnswers: ["compost", "manure"] },
  { before: "Even a well-built sunken bed still needs occasional ", after: " during a long dry season.", correctAnswer: "watering", acceptedAnswers: ["watering"] },
  { before: "A sunken bed traps moisture through its shape, unlike a raised bed, which improves ", after: " instead.", correctAnswer: "drainage", acceptedAnswers: ["drainage"] },
  { before: "Firming the soil in a sunken bed should be done gently, without ", after: " it too hard for roots to spread.", correctAnswer: "compacting", acceptedAnswers: ["compacting"] },
  { before: "Marking out a bed with pegs and ", after: " helps keep its shape accurate before digging begins.", correctAnswer: "string", acceptedAnswers: ["string"] },
  { before: "A moist bed garden's main purpose, according to the source curriculum, is growing a selected ", after: ".", correctAnswer: "crop", acceptedAnswers: ["crop"] },
  { before: "Constructing a moist bed garden relates to craft skills learnt in ", after: ".", correctAnswer: "Creative Arts", acceptedAnswers: ["Creative Arts"] },
  { before: "Sharing information and tasks while building a moist bed garden develops the core competency of communication and ", after: ".", correctAnswer: "collaboration", acceptedAnswers: ["collaboration"] },
  { before: "Using materials already available locally to build the bed reflects the pertinent issue of environmental ", after: ".", correctAnswer: "conservation", acceptedAnswers: ["conservation"] },
  { before: "A sunken bed built in a spot that floods can end up ", after: " its crop instead of helping it.", correctAnswer: "drowning", acceptedAnswers: ["drowning", "waterlogging"] },
  { before: "Levelling the inside surface of the bed helps water spread ", after: " across the whole planting area.", correctAnswer: "evenly", acceptedAnswers: ["evenly"] },
  { before: "The overall meaning of a moist bed garden is a bed shaped specifically to conserve ", after: " for the crop growing in it.", correctAnswer: "moisture", acceptedAnswers: ["moisture", "water"] },
  { before: "A sunken bed's base should never be left hard and ", after: ", since that stops water soaking through.", correctAnswer: "compacted", acceptedAnswers: ["compacted"] },
  { before: "Choosing a site that is not sloped keeps a sunken bed from losing water to one ", after: ".", correctAnswer: "side", acceptedAnswers: ["side"] },
  { before: "A sunken bed's crop is planted after the enriched soil has been levelled and ", after: " gently.", correctAnswer: "firmed", acceptedAnswers: ["firmed"] },
  { before: "Comparing a sunken bed to flat, ungraded ground shows that the sunken shape holds ", after: " closer to the roots.", correctAnswer: "water", acceptedAnswers: ["water", "moisture"] },
  { before: "A sunken moist bed and a shallow pit both conserve water, but a bed serves many plants together while a pit serves a ", after: " plant.", correctAnswer: "single", acceptedAnswers: ["single", "one"] },
  { before: "Adding mulch on top of a sunken bed is an extra step beyond simply digging it ", after: " ground level.", correctAnswer: "below", acceptedAnswers: ["below"] },
  { before: "Monitoring a growing crop regularly is part of the final stage of constructing a moist bed ", after: ".", correctAnswer: "garden", acceptedAnswers: ["garden"] },
  { before: "Choosing appropriate ", after: " for the site helps a sunken bed succeed, according to KICD's suggested learning experiences.", correctAnswer: "materials", acceptedAnswers: ["materials"] },
  { before: "A sunken bed's success depends on both its construction and the ", after: " chosen for it.", correctAnswer: "site", acceptedAnswers: ["site"] },
  { before: "The value named alongside constructing a moist bed garden in the source curriculum is ", after: ", shown through appreciating diverse opinions while sharing information.", correctAnswer: "respect", acceptedAnswers: ["respect", "Respect"] },
];

const IDENTIFY_PROMPTS = [
  "Identify this way of constructing a moist bed garden.",
  "Which moist bed construction is shown here?",
  "Name this method of constructing a moist bed garden.",
  "Look at the picture and identify this moist bed technique.",
  "What kind of moist bed garden does this picture show?",
  "Study the image and name this construction method.",
];

const STEPS_MATCH_PROMPTS = [
  "Match each sunken moist bed construction step to what it involves.",
  "Pair each construction step with what it actually means to do.",
  "Connect each step of building a sunken moist bed to its description.",
  "Match each stage of the process to what it involves.",
  "Link each construction step to the description that fits it.",
  "Match each step below to the correct explanation of what it involves.",
];

const STEPS_ORDER_PROMPTS = [
  "Arrange the steps for constructing a sunken moist bed garden in the correct order.",
  "Put these sunken moist bed construction steps in the right sequence.",
  "Sequence the steps for building a sunken moist bed correctly.",
  "Arrange these steps in the order a gardener would actually carry them out.",
  "Order these construction steps from first to last.",
  "Sort these steps into the correct order for building a sunken moist bed garden.",
];

const PRACTICE_SORT_PROMPTS = [
  "Sort each practice as one that helps or one that harms a sunken moist bed's ability to conserve water for its crop.",
  "Decide whether each practice helps or harms a sunken moist bed's moisture conservation, and sort it.",
  "Group these practices under whether they help or harm the bed's water conservation.",
  "Read each practice and sort it as helping or harming the bed's moisture.",
  "Place each practice into the correct bucket: helps conserve moisture or harms it.",
  "Sort these sunken-bed practices by whether they help or hurt moisture conservation.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about the sunken moist bed garden.",
  "Fill in the missing word about the sunken moist bed garden.",
  "Complete this sentence about constructing a sunken moist bed.",
  "Supply the missing word in this sentence about the sunken moist bed garden.",
  "Fill in the blank to complete the fact about the sunken moist bed garden.",
  "Complete the missing word in this statement about the sunken moist bed garden.",
];

export const sunkenMoistBedGarden: Skill = {
  id: "g6-ag-p-sunken-moist-bed-garden",
  code: "P.3",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-production-techniques",
  grade: 6,
  title: "Constructing a Sunken Moist Bed Garden",
  description: "Constructing a moist bed garden dug below ground level to trap water near a crop's roots — construction steps, site selection, and why the sunken shape conserves moisture.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "steps-match", "steps-order", "practice-sort", "reasoning", "fill-blank"] as const);
    const hint = "A sunken moist bed is dug below the surrounding ground level so it traps and holds water near the roots — site, base, and soil quality all affect how well it works.";

    if (branch === "identify") {
      const choices = shuffle(rng, ["Sunken moist bed", "Raised moist bed", "Sunken seedbed", "Shallow pit"]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "garden-bed", kind: "sunken-moist-bed" },
        choices,
        correctIndex: choices.indexOf("Sunken moist bed"),
        layout: "list",
        hint,
        explanation: "This is a sunken moist bed — dug below ground level to grow a crop, trapping water near the roots (different from a raised bed built above ground, or a smaller seedbed/pit used for germinating seeds).",
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

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, CONSTRUCTION_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CONSTRUCTION_STEPS.map((s) => s.id),
        hint: "Select the site and mark it out first, dig down and prepare the soil, then plant, mulch, and finally water and monitor.",
        explanation: CONSTRUCTION_STEPS.map((s) => s.label).join(" → "),
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
          { id: "good", label: "Helps conserve moisture" },
          { id: "poor", label: "Harms moisture conservation" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" ${c.bucket === "good" ? "helps conserve moisture" : "harms moisture conservation"}.`).join(" "),
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
