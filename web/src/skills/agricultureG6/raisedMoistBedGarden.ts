import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { g6Name, g6Place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./sharedG6Ag";

// KICD Grade 6 Agriculture P.4 "Constructing a Raised Moist Bed Garden" (the other half of
// source sub-strand "4.2 Constructing Moist Bed Garden — sunken or raised", split per the
// Grade-6 "split into deeper skills" rule; see sunkenMoistBedGarden.ts for the sunken half). A
// raised bed is built ABOVE ground level, improving drainage and aeration — the opposite
// mechanism to a sunken bed's water-trapping — so this file's construction and reasoning content
// is authored separately for that genuinely different purpose (waterlogged-prone soils), not
// copied from the sunken-bed file with swapped nouns.

const CONSTRUCTION_STEPS = [
  { id: "select-site", label: "Select a suitable site", detail: "Choose a level or gently sloping site, ideally one where the soil tends to stay wet or waterlogged after rain" },
  { id: "gather-materials", label: "Gather edging materials", detail: "Gather locally available materials to edge the bed, such as timber offcuts, stones, bricks or old sacks" },
  { id: "mark-out", label: "Mark out the bed", detail: "Mark the outline of the raised bed using pegs and string, to the size needed for the chosen crop" },
  { id: "build-frame", label: "Build the raised frame", detail: "Arrange the edging materials into a frame that will hold soil above the surrounding ground level" },
  { id: "add-base-layer", label: "Add a base layer", detail: "Add a loose base layer of coarse material, such as twigs or gravel, to help excess water drain away" },
  { id: "fill-enriched-soil", label: "Fill with enriched soil", detail: "Fill the frame with topsoil mixed with compost or well-rotted manure, up to a suitable height above ground level" },
  { id: "level-firm", label: "Level and firm the bed", detail: "Level the surface of the filled bed and firm it gently, without compacting it too hard" },
  { id: "plant-crop", label: "Plant the chosen crop", detail: "Plant seeds or seedlings of the selected crop into the raised bed" },
  { id: "mulch", label: "Mulch the surface", detail: "Cover the surface with mulch to reduce evaporation from the raised bed's more exposed surface" },
  { id: "water-monitor", label: "Water and monitor", detail: "Water the bed as needed, since a raised bed drains and dries faster than a sunken one, and monitor the growing crop regularly" },
] as const;

const GOOD_PRACTICES = [
  "Building the raised frame high enough that the soil inside genuinely sits above the surrounding ground level",
  "Choosing sturdy edging materials, such as timber or stone, that will hold the soil in place without collapsing",
  "Adding a loose base layer to help excess water drain out of the bed rather than pooling inside it",
  "Filling the frame with soil enriched with compost or manure for good fertility and structure",
  "Choosing this method specifically for a site where the soil tends to become waterlogged after rain",
  "Watering the bed regularly, since a raised bed drains and dries out faster than a sunken one",
  "Mulching the surface of a raised bed to slow the extra evaporation caused by its more exposed position",
  "Using locally available materials, such as offcuts or old sacks, to edge the bed at low cost",
  "Sizing the bed to suit the specific crop being grown",
  "Checking that the edging is stable and unlikely to collapse under the weight of the filled soil",
  "Levelling the top surface of the filled bed so water and roots spread evenly",
  "Firming the soil gently rather than compacting it so hard that roots cannot spread",
] as const;

const POOR_PRACTICES = [
  "Building the frame only a few centimetres above ground level, too shallow to really improve drainage",
  "Using weak, flimsy edging material that collapses once the bed is filled with soil",
  "Skipping the base drainage layer, leaving water with nowhere to escape inside the frame",
  "Filling the bed with poor soil and no compost or manure at all",
  "Choosing a raised bed for a site that is already very dry and well-drained, where it gives little extra benefit",
  "Assuming a raised bed never needs watering because it looks well drained",
  "Leaving the surface of a raised bed completely unmulched in hot, dry weather",
  "Ignoring the crop's actual spacing needs when sizing the raised bed",
  "Using materials that will rot or rust quickly, weakening the edging soon after building it",
  "Overfilling the frame so soil constantly spills over the edges",
  "Packing the soil down so hard that roots cannot spread through it",
  "Building the bed on a very steep slope where the frame is likely to slump or collapse",
] as const;

const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "crops planted in a raised bed on a waterlogged-prone site grow much healthier roots than the same crops planted directly on the surrounding flooded ground",
    correct: "Raising the soil above ground level lifts the roots clear of standing water, improving drainage and letting air reach the roots",
    wrong: [
      "A raised bed always collects more water than the surrounding ground",
      "Raising a bed above ground level has no effect on drainage",
      "Roots grow the same whether they are in standing water or well-drained soil",
    ],
  },
  {
    situation: "a raised bed with a loose base layer of gravel drains excess water faster than an identical raised bed built with no base layer at all",
    correct: "A loose base layer gives excess water a clear path to drain away, instead of collecting inside the frame with nowhere to go",
    wrong: [
      "A base layer has no effect on how a raised bed drains",
      "Blocking drainage at the base always helps a raised bed's crop",
      "Only the height of the frame affects drainage, never the base layer",
    ],
  },
  {
    situation: "a raised bed dries out faster after watering than a sunken bed of the same size, needing more frequent watering to keep the crop healthy",
    correct: "A raised bed's soil sits above ground level and is more exposed to air and sun, so it loses moisture through evaporation and drainage faster than a sunken bed",
    wrong: [
      "A raised bed always holds water longer than a sunken bed",
      "The height of a bed above ground has no effect on how quickly it dries out",
      "Raised beds never need watering once they are built",
    ],
  },
  {
    situation: "a raised bed edged with sturdy timber holds its shape for years, while one edged with weak, flimsy material collapses within weeks of being filled with soil",
    correct: "Sturdy edging material can support the weight and pressure of the filled soil, while weak material cannot hold that same weight over time",
    wrong: [
      "The type of edging material used has no effect on how long a raised bed lasts",
      "Weak edging material is always just as durable as sturdy material",
      "Only the type of crop grown affects how long a raised bed's frame lasts",
    ],
  },
  {
    situation: "a mulched raised bed needs watering less often than an identical unmulched raised bed in the same hot, sunny spot",
    correct: "Mulch on the more exposed surface of a raised bed slows down the extra evaporation caused by its height and drainage",
    wrong: [
      "Mulch has no effect on evaporation from a raised bed",
      "An unmulched raised bed always retains more moisture than a mulched one",
      "Mulching only matters for sunken beds, never raised ones",
    ],
  },
  {
    situation: "a raised bed built on a very steep slope slumps and partly collapses after heavy rain, while an identical bed built on level ground stays intact",
    correct: "A steep slope puts uneven pressure on the frame and its filled soil, making it more likely to slump or give way than a level site",
    wrong: [
      "Site slope has no effect on how stable a raised bed's frame is",
      "A steep slope always makes a raised bed frame more stable",
      "Only the crop grown in a raised bed affects whether its frame collapses",
    ],
  },
  {
    situation: "a farmer chooses to build a raised bed rather than a sunken bed on a plot where water regularly pools after rain",
    correct: "A raised bed lifts the growing crop's roots above the waterlogged ground, while a sunken bed on the same plot would only collect even more standing water",
    wrong: [
      "A sunken bed always works better than a raised bed on waterlogged ground",
      "The choice between a sunken and raised bed makes no difference on a waterlogged plot",
      "Raised beds are only useful on already very dry land, never on wet land",
    ],
  },
  {
    situation: "soil enriched with compost inside a raised bed's frame supports a healthier crop than plain, unenriched soil filled into an identical frame",
    correct: "Compost improves the soil's fertility and structure, giving the crop better nutrients and moisture-holding ability even though the bed already drains well",
    wrong: [
      "Soil quality makes no difference once a bed is raised above ground level",
      "Plain, unenriched soil always grows a crop just as well as enriched soil",
      "Compost is only useful in sunken beds, never in raised ones",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `${who}, gardening on a plot near ${p}, notices that ${fact.situation}. Why?`,
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
      prompt: `${who} compares a raised bed to the surrounding ground and finds that ${fact.situation}. Why does this happen?`,
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
  { before: "A raised moist bed garden is built ", after: " the surrounding ground level.", correctAnswer: "above", acceptedAnswers: ["above"] },
  { before: "Raising the soil above ground level improves ", after: " and lets air reach the roots.", correctAnswer: "drainage", acceptedAnswers: ["drainage"] },
  { before: "A raised bed is especially useful on soil that tends to become ", after: " after rain.", correctAnswer: "waterlogged", acceptedAnswers: ["waterlogged"] },
  { before: "A raised bed's frame can be built from locally available materials such as timber, stones or old ", after: ".", correctAnswer: "sacks", acceptedAnswers: ["sacks"] },
  { before: "A loose base layer of coarse material, such as gravel, helps excess water ", after: " out of a raised bed.", correctAnswer: "drain", acceptedAnswers: ["drain"] },
  { before: "Because it drains well, a raised bed dries out ", after: " than a sunken bed and needs more frequent watering.", correctAnswer: "faster", acceptedAnswers: ["faster"] },
  { before: "Mulching a raised bed's surface helps slow the extra ", after: " caused by its exposed, raised position.", correctAnswer: "evaporation", acceptedAnswers: ["evaporation"] },
  { before: "Sturdy edging materials are needed so the raised frame does not ", after: " under the weight of the filled soil.", correctAnswer: "collapse", acceptedAnswers: ["collapse"] },
  { before: "Filling a raised bed with soil enriched with compost improves its ", after: " and moisture-holding ability.", correctAnswer: "fertility", acceptedAnswers: ["fertility"] },
  { before: "A raised bed built on a steep ", after: " is more likely to slump or partly collapse after heavy rain.", correctAnswer: "slope", acceptedAnswers: ["slope"] },
  { before: "A raised bed lifts a crop's roots clear of standing ", after: " on a waterlogged plot.", correctAnswer: "water", acceptedAnswers: ["water"] },
  { before: "The size of a raised bed should be matched to the specific ", after: " being grown.", correctAnswer: "crop", acceptedAnswers: ["crop"] },
  { before: "Choosing between a sunken and a raised bed depends mainly on how well the site's soil already ", after: ".", correctAnswer: "drains", acceptedAnswers: ["drains"] },
  { before: "Constructing a moist bed garden relates to craft skills learnt in ", after: ".", correctAnswer: "Creative Arts", acceptedAnswers: ["Creative Arts"] },
  { before: "Sharing information and tasks while building a raised bed develops the core competency of communication and ", after: ".", correctAnswer: "collaboration", acceptedAnswers: ["collaboration"] },
  { before: "Using materials already available locally to build a raised bed reflects the pertinent issue of environmental ", after: ".", correctAnswer: "conservation", acceptedAnswers: ["conservation"] },
  { before: "The overall meaning of a moist bed garden is a bed shaped specifically to conserve moisture and support ", after: " growth.", correctAnswer: "crop", acceptedAnswers: ["crop"] },
  { before: "A raised bed's soil should be firmed gently, without ", after: " it so hard that roots cannot spread.", correctAnswer: "compacting", acceptedAnswers: ["compacting"] },
  { before: "Marking out a raised bed with pegs and ", after: " helps keep its shape accurate before building begins.", correctAnswer: "string", acceptedAnswers: ["string"] },
  { before: "A raised bed's edging should be checked for ", after: " so it does not give way once filled.", correctAnswer: "stability", acceptedAnswers: ["stability"] },
  { before: "Unlike a sunken bed, which traps water, a raised bed's main benefit is improved ", after: " and aeration.", correctAnswer: "drainage", acceptedAnswers: ["drainage"] },
  { before: "A raised bed built too shallow above ground level gives too little benefit for ", after: "-prone soil.", correctAnswer: "waterlogging", acceptedAnswers: ["waterlogging", "waterlogged"] },
  { before: "Levelling the top surface of a filled raised bed helps water and roots spread ", after: ".", correctAnswer: "evenly", acceptedAnswers: ["evenly"] },
  { before: "Choosing weak edging material that rots or rusts quickly shortens a raised bed's ", after: ".", correctAnswer: "lifespan", acceptedAnswers: ["lifespan", "life"] },
  { before: "A raised bed's crop is planted after the enriched soil has been levelled and ", after: " gently.", correctAnswer: "firmed", acceptedAnswers: ["firmed"] },
  { before: "Monitoring a growing crop regularly is part of the final stage of constructing a raised moist bed ", after: ".", correctAnswer: "garden", acceptedAnswers: ["garden"] },
  { before: "The value named alongside constructing a moist bed garden in the source curriculum is ", after: ", shown through appreciating diverse opinions while sharing information.", correctAnswer: "respect", acceptedAnswers: ["respect", "Respect"] },
  { before: "A raised bed's base drainage layer is typically made of coarse material such as twigs or ", after: ".", correctAnswer: "gravel", acceptedAnswers: ["gravel"] },
  { before: "Choosing appropriate materials for the site helps a raised bed succeed, according to KICD's suggested learning experiences involving locally available ", after: ".", correctAnswer: "materials", acceptedAnswers: ["materials"] },
  { before: "A raised bed's success depends on both sturdy construction and the ", after: " chosen for the site.", correctAnswer: "site", acceptedAnswers: ["site"] },
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
  "Match each raised moist bed construction step to what it involves.",
  "Pair each construction step with what it actually means to do.",
  "Connect each step of building a raised moist bed to its description.",
  "Match each stage of the process to what it involves.",
  "Link each construction step to the description that fits it.",
  "Match each step below to the correct explanation of what it involves.",
];

const STEPS_ORDER_PROMPTS = [
  "Arrange the steps for constructing a raised moist bed garden in the correct order.",
  "Put these raised moist bed construction steps in the right sequence.",
  "Sequence the steps for building a raised moist bed correctly.",
  "Arrange these steps in the order a gardener would actually carry them out.",
  "Order these construction steps from first to last.",
  "Sort these steps into the correct order for building a raised moist bed garden.",
];

const PRACTICE_SORT_PROMPTS = [
  "Sort each practice as one that helps or one that harms a raised moist bed's success.",
  "Decide whether each practice helps or harms a raised moist bed's success, and sort it.",
  "Group these practices under whether they help or harm the bed's success.",
  "Read each practice and sort it as helping or harming the raised bed.",
  "Place each practice into the correct bucket: helps the bed succeed or harms it.",
  "Sort these raised-bed practices by whether they help or hurt its success.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about the raised moist bed garden.",
  "Fill in the missing word about the raised moist bed garden.",
  "Complete this sentence about constructing a raised moist bed.",
  "Supply the missing word in this sentence about the raised moist bed garden.",
  "Fill in the blank to complete the fact about the raised moist bed garden.",
  "Complete the missing word in this statement about the raised moist bed garden.",
];

export const raisedMoistBedGarden: Skill = {
  id: "g6-ag-p-raised-moist-bed-garden",
  code: "P.4",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-production-techniques",
  grade: 6,
  title: "Constructing a Raised Moist Bed Garden",
  description: "Constructing a moist bed garden built above ground level to improve drainage and aeration on waterlogged-prone soil — construction steps, edging materials, and why the raised shape suits a different site than a sunken bed.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "steps-match", "steps-order", "practice-sort", "reasoning", "fill-blank"] as const);
    const hint = "A raised moist bed is built above the surrounding ground level to improve drainage — best suited to waterlogged-prone soil, the opposite site to where a sunken bed helps most.";

    if (branch === "identify") {
      const choices = shuffle(rng, ["Raised moist bed", "Sunken moist bed", "Sunken seedbed", "Shallow pit"]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "garden-bed", kind: "raised-moist-bed" },
        choices,
        correctIndex: choices.indexOf("Raised moist bed"),
        layout: "list",
        hint,
        explanation: "This is a raised moist bed — built above ground level with an edged frame, improving drainage and aeration (different from a sunken bed dug below ground to trap water, or a smaller seedbed/pit used for germinating seeds).",
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
        hint: "Select the site and gather materials first, mark out and build the frame, add drainage and enriched soil, then plant, mulch, and finally water and monitor.",
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
          { id: "good", label: "Helps the bed succeed" },
          { id: "poor", label: "Harms the bed's success" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" ${c.bucket === "good" ? "helps the bed succeed" : "harms the bed's success"}.`).join(" "),
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
