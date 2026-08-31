import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./g6AgShared";

// KICD Grade 6 Agriculture F.1 "Rearing Small Domestic Animals" names rabbits or guinea pigs
// as example animals and five routine practices — housing, feeding, watering, sanitation, and
// parasite control — all five are implemented below with real content for each. No dedicated
// VisualSpec exists for this sub-strand and the generic "icon-set" type has no animal/husbandry
// icon (only apple/ball/coin/cube/book/pencil — see Visual.tsx's ICON_PATHS), so no visual
// genuinely fits here; this is a deliberate, documented skip, not an oversight. Text-based
// branches carry the skill instead, which the content supports well (categorize, click-match,
// ordering, scenario reasoning, and fill-blank all have a genuine natural fit).

type PracticeId = "housing" | "feeding" | "watering" | "sanitation" | "parasite-control";

const PRACTICES: { id: PracticeId; label: string; definition: string }[] = [
  { id: "housing", label: "Housing", definition: "Providing a clean, secure, well-ventilated hutch or cage that shelters the animals from weather and predators" },
  { id: "feeding", label: "Feeding", definition: "Providing a balanced, regular supply of fresh forage and, where needed, concentrate feed" },
  { id: "watering", label: "Watering", definition: "Providing clean, fresh drinking water at all times, checked and changed regularly" },
  { id: "sanitation", label: "Sanitation", definition: "Keeping the housing and equipment clean to prevent disease" },
  { id: "parasite-control", label: "Parasite control", definition: "Preventing, checking for, and treating both external and internal parasites" },
];

function practiceOf(id: PracticeId) {
  return PRACTICES.find((p) => p.id === id)!;
}

const PRACTICE_MATCH_PROMPTS = [
  "Match each routine practice to what it involves.",
  "Pair each care routine with the description that explains it.",
  "Connect each of the five routines to what it actually means in practice.",
  "Match each part of daily animal care to its correct explanation.",
  "Link each husbandry routine to the description that fits it.",
  "Match each practice below to the statement that describes it.",
  "Work out which description belongs to which routine, then match them up.",
  "Pair each of the five practices with its correct meaning.",
  "For each routine below, find the description that explains it.",
  "Match each care task to the explanation of what it involves.",
  "Which description goes with which routine? Match them correctly.",
  "Line up each routine practice with what it actually means.",
  "Connect each husbandry task to its correct definition.",
  "Match the five practices to their descriptions below.",
  "Figure out what each routine involves, then match it to its description.",
  "Pair up every practice with the statement that correctly describes it.",
  "Match each item on the left to the routine it describes on the right.",
  "Sort out which explanation belongs to which care practice, by matching them.",
  "Correctly match every routine to the description that fits it.",
  "Match each of the five care routines to what a keeper actually does for it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the routine practice it describes.",
  "Group these facts under the correct care routine.",
  "Decide which routine practice each fact below belongs to, and sort it there.",
  "Sort each statement into the routine it best fits.",
  "Place each fact into the bucket for the practice it is describing.",
  "Read each fact and sort it under the matching routine.",
  "Work out which practice each fact is about, then sort it there.",
  "Classify each fact by the care routine it belongs to.",
  "Organize these facts into the correct routine practice.",
  "Which practice does each fact describe? Sort it accordingly.",
  "Sort each statement below into housing, feeding, watering, sanitation, or parasite control.",
  "Drop each fact into the routine practice it's really about.",
  "Group each statement with the practice it correctly belongs to.",
  "Decide where each fact fits among the five routine practices.",
  "Sort these facts into their correct care-routine groups.",
  "For each fact, work out the routine it belongs to and sort it in.",
  "Place these statements under the routine practice each one matches.",
  "Sort each fact correctly among the five care routines.",
  "Read each statement and file it under the right routine practice.",
  "Assign each fact to the routine practice it best describes.",
];

const CARE_ORDER_PROMPTS = [
  "Arrange a sensible daily care routine for small domestic animals in the correct order.",
  "Put these daily care steps into a sensible order.",
  "Sequence the steps of a typical day of animal care correctly.",
  "Arrange these actions into the order a careful keeper would follow them.",
  "Order these daily tasks the way a rabbit or guinea pig keeper should carry them out.",
  "Sort these steps into the order they should happen during a day of care.",
  "Put these care steps in the order a responsible keeper would do them.",
  "Work out the sensible order for these daily animal-care tasks.",
  "Arrange these daily tasks into a logical care routine.",
  "Which order should these care steps happen in? Arrange them correctly.",
  "Build a sensible daily routine by ordering these steps correctly.",
  "Sequence a keeper's daily tasks in the order they should be done.",
  "Order these actions the way they'd happen in a well-run daily routine.",
  "Arrange the steps of a good daily care routine, in the right order.",
  "Put these tasks into the order a careful keeper would complete them.",
  "Sequence these steps to build a sensible daily animal-care routine.",
  "Work out the correct order for a day's worth of animal care.",
  "Arrange these steps as a keeper would carry them out during the day.",
  "Order the tasks below the way a sensible daily routine would run.",
  "Sequence these daily care actions correctly, from first to last.",
];

const FILL_BLANK_PROMPTS = [
  "Which routine practice does this fact belong to?",
  "Which of the five routines does this fact describe?",
  "Name the routine practice this fact is part of.",
  "Identify which care routine this fact fits under.",
  "This fact fits under which routine practice?",
  "Work out which of the five practices this fact belongs to.",
  "Which care routine is this fact describing?",
  "Fill in the routine practice this fact is part of.",
  "This statement belongs to which of the five routines?",
  "Which practice does the fact below fall under?",
  "Complete the sentence with the routine practice this fact describes.",
  "Which of housing, feeding, watering, sanitation, or parasite control fits this fact?",
  "Work out and fill in which practice this fact is about.",
  "Name the correct routine practice for this fact.",
  "Which routine best fits the fact given below?",
  "Fill in which of the five practices this statement belongs to.",
  "Identify the routine practice being described here.",
  "This fact is an example of which routine practice?",
  "Work out which practice this piece of care advice belongs to.",
  "Which routine does this fact fall under? Fill in your answer.",
];

const CARE_ORDER_STEPS = [
  { id: "check", label: "Check the housing each morning for damage or safety issues overnight" },
  { id: "water", label: "Provide fresh, clean water for the day" },
  { id: "feed", label: "Provide fresh feed appropriate for the animal" },
  { id: "clean", label: "Remove droppings and soiled bedding from the housing" },
  { id: "inspect", label: "Inspect the animals briefly for any signs of illness or parasites" },
  { id: "record", label: "Record any observations or concerns for the day" },
];

// ---- Fact bank: 35 facts (7 per routine practice) — feeds categorize and fill-blank
// branches, well above the Grade-6 30-item pool floor. ----
const ROUTINE_FACTS: { text: string; type: PracticeId }[] = [
  // housing
  { text: "Providing a hutch or cage raised off the ground to protect the animals from dampness and predators", type: "housing" },
  { text: "Making sure the housing has enough space so the animals are not overcrowded", type: "housing" },
  { text: "Using clean, dry bedding such as straw or wood shavings inside the housing", type: "housing" },
  { text: "Ensuring good ventilation in the housing so it does not become stuffy or damp", type: "housing" },
  { text: "Providing shelter from direct sun, rain and strong wind", type: "housing" },
  { text: "Fitting a secure door or latch so predators cannot get in at night", type: "housing" },
  { text: "Setting aside a separate, quieter compartment for a doe (female) about to give birth", type: "housing" },
  // feeding
  { text: "Providing fresh, clean forage such as grass, hay, and vegetable scraps", type: "feeding" },
  { text: "Feeding a balanced ration that includes both forage and a small amount of concentrate or pellets", type: "feeding" },
  { text: "Feeding at regular times each day so the animals develop a routine", type: "feeding" },
  { text: "Giving guinea pigs fresh vegetables or fruit rich in vitamin C, since guinea pigs cannot produce their own", type: "feeding" },
  { text: "Introducing new types of feed gradually to avoid upsetting digestion", type: "feeding" },
  { text: "Avoiding spoiled, mouldy, or wilted feed, which can make the animals sick", type: "feeding" },
  { text: "Removing uneaten fresh feed after a few hours so it does not rot in the housing", type: "feeding" },
  // watering
  { text: "Providing clean, fresh drinking water at all times", type: "watering" },
  { text: "Using a water container that cannot be easily tipped over or fouled with droppings", type: "watering" },
  { text: "Changing the water daily, even if the container still looks full", type: "watering" },
  { text: "Checking the water supply at least twice a day, especially in hot weather", type: "watering" },
  { text: "Washing the water container regularly to prevent a build-up of algae or slime", type: "watering" },
  { text: "Making sure every animal in the housing can reach the water container", type: "watering" },
  { text: "Increasing how often water is checked and topped up during very hot weather", type: "watering" },
  // sanitation
  { text: "Removing droppings and soiled bedding from the housing regularly", type: "sanitation" },
  { text: "Disinfecting the hutch or cage periodically to reduce the build-up of germs", type: "sanitation" },
  { text: "Keeping the housing floor dry, since damp bedding encourages disease", type: "sanitation" },
  { text: "Washing feeding and watering containers with clean water regularly", type: "sanitation" },
  { text: "Composting or properly disposing of manure and soiled bedding instead of letting it pile up nearby", type: "sanitation" },
  { text: "Ensuring good airflow in the housing to reduce the build-up of ammonia smell from waste", type: "sanitation" },
  { text: "Cleaning the housing on a fixed schedule rather than only when it looks very dirty", type: "sanitation" },
  // parasite-control
  { text: "Inspecting the animals' fur and skin regularly for external parasites such as mites or fleas", type: "parasite-control" },
  { text: "Following a deworming schedule to control internal parasites", type: "parasite-control" },
  { text: "Keeping the housing clean, since a dirty environment lets parasites breed and spread more easily", type: "parasite-control" },
  { text: "Isolating a sick or infested animal from the rest to stop parasites spreading", type: "parasite-control" },
  { text: "Consulting an animal health worker or veterinarian for the correct parasite treatment and dosage", type: "parasite-control" },
  { text: "Avoiding overcrowding, since parasites spread faster when animals are housed too closely together", type: "parasite-control" },
  { text: "Treating new animals for parasites before introducing them to the rest of the group", type: "parasite-control" },
];

// ---- Reasoning (Apply) pool: 12 situation facts x 24 frames (6 openers x 4 closers) = 288 templates. ----
interface RoutineFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: RoutineFact[] = [
  {
    situation: "a guinea pig has been fed only grass and pellets for weeks with no fresh vegetables or fruit at all",
    correct: "The guinea pig risks vitamin C deficiency, since guinea pigs cannot make their own vitamin C the way rabbits can",
    wrong: [
      "The guinea pig is at no extra risk, since pellets alone always contain enough vitamin C",
      "Rabbits face the same vitamin C risk as guinea pigs from this diet",
      "Grass alone provides all the vitamin C a guinea pig needs",
    ],
  },
  {
    situation: "a rabbit hutch has been left with damp, unchanged bedding for over a week",
    correct: "The damp bedding increases the risk of disease and discomfort, since a dry, clean housing environment is essential for rabbit health",
    wrong: [
      "Damp bedding has no effect on a rabbit's health as long as feed is provided",
      "Rabbits prefer damp bedding over dry bedding",
      "Bedding only needs changing once a month regardless of dampness",
    ],
  },
  {
    situation: "a rabbit's water container was found empty for most of a hot afternoon",
    correct: "The rabbit is at risk of dehydration, since fresh water must be available at all times, especially in hot weather",
    wrong: [
      "Rabbits get all the water they need from fresh grass alone",
      "Water only needs checking once a day regardless of the weather",
      "An empty water container for a few hours has no real effect on a rabbit",
    ],
  },
  {
    situation: "new feed was introduced to a group of guinea pigs suddenly, replacing their usual diet overnight",
    correct: "Sudden feed changes can upset the animals' digestion, so new feed should be introduced gradually",
    wrong: [
      "Sudden feed changes always improve an animal's appetite",
      "Guinea pigs' digestion is not affected by how feed is introduced",
      "Feed should always be changed suddenly to keep animals interested",
    ],
  },
  {
    situation: "several rabbits are being kept in a hutch far smaller than what their number requires",
    correct: "Overcrowding increases stress and makes it easier for parasites and disease to spread between the animals",
    wrong: [
      "Overcrowding has no effect on parasite spread among rabbits",
      "Smaller housing is always cheaper to clean, so overcrowding is not a real concern",
      "Rabbits are naturally more comfortable in extremely small spaces",
    ],
  },
  {
    situation: "a farmer notices a rabbit scratching itself frequently and has patches of thinning fur",
    correct: "These are signs of possible external parasites, and the animal should be inspected and treated promptly",
    wrong: [
      "This behaviour is always just normal grooming with no cause for concern",
      "Thinning fur only happens naturally with age and needs no attention",
      "Frequent scratching only indicates the rabbit is unusually happy",
    ],
  },
  {
    situation: "a sick rabbit is left in the same hutch as several healthy rabbits without being separated",
    correct: "Keeping a sick animal with healthy ones risks spreading disease or parasites to the whole group",
    wrong: [
      "Sick animals recover faster when kept with healthy ones",
      "Separating sick animals has no effect on disease spread",
      "Only guinea pigs, not rabbits, need to be isolated when sick",
    ],
  },
  {
    situation: "a family cleans their rabbit hutch thoroughly only once every few months, when it looks very dirty",
    correct: "Waiting until the housing looks very dirty lets waste and dampness build up, increasing disease risk in the meantime",
    wrong: [
      "Cleaning less often is always better since it disturbs the animals less",
      "Rabbit housing only needs cleaning when visibly dirty, regardless of how long that takes",
      "Waste build-up between cleanings has no effect on the animals' health",
    ],
  },
  {
    situation: "a guinea pig's water bottle has not been washed in weeks and has a slimy film inside",
    correct: "The slimy build-up can contaminate the drinking water, so containers need regular washing, not just refilling",
    wrong: [
      "Refilling a water container is enough on its own, without ever washing it",
      "A slimy film inside a water container has no effect on the animal's health",
      "Water containers only need washing if the water inside looks visibly dirty",
    ],
  },
  {
    situation: "a new rabbit is added directly to an established group without any parasite check beforehand",
    correct: "The new rabbit could introduce parasites to the whole group, so new animals should be checked and treated first",
    wrong: [
      "New animals never carry parasites that established animals do not already have",
      "Parasite checks are only necessary for guinea pigs, not rabbits",
      "Introducing a new animal has no effect on the parasite risk for the group",
    ],
  },
  {
    situation: "a rabbit hutch is positioned in direct afternoon sun with no shade all day",
    correct: "Rabbits can overheat without shade, so housing should be positioned to provide shelter from direct sun",
    wrong: [
      "Rabbits regulate their temperature the same way regardless of shade",
      "Direct sun all day has no effect on a rabbit's comfort or health",
      "Shade is only necessary for guinea pigs, not rabbits",
    ],
  },
  {
    situation: "a farmer keeps detailed daily notes on feeding times, water checks, and any signs of illness in their rabbits",
    correct: "Keeping consistent records builds the farmer's confidence and skill in noticing problems early and caring for the animals well",
    wrong: [
      "Keeping records has no real benefit if the animals appear healthy",
      "Only large commercial farms benefit from keeping care records",
      "Daily records are only useful for guinea pigs, not rabbits",
    ],
  },
];

// 6 openers x 4 closers = 24 distinct prompt skeletons, authored as 10 short pieces instead of
// 20+ full sentences — see g6AgShared.ts's combineFrames doc comment. Anchor phrasing is
// deliberately varied across openers (some say "small domestic animals", some "rabbits and
// guinea pigs", some name no animal noun phrase at all) so no single keyword dominates 100% of
// this branch's output the way "animal care routine" once did.
const REASONING_OPENERS: ((rng: RNG, fact: RoutineFact) => string)[] = [
  (rng, fact) => `${name(rng)} rears small domestic animals near ${place(rng)}, where ${fact.situation}`,
  (rng, fact) => `On a smallholding near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} keeps rabbits and guinea pigs at home, where ${fact.situation}`,
  (rng, fact) => `While checking on the animals near ${place(rng)}, ${name(rng)} finds that ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `${name(rng)} is looking after some animals, and ${fact.situation}`,
];

const REASONING_CLOSERS = [
  "What is the correct conclusion?",
  "What does this mean for the animals' care?",
  "What should this tell you?",
  "Which conclusion follows correctly from this?",
];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);

const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

// ---- Evaluate pool (mandatory per F.1's explicit PCI, "Animal welfare in the handling and
// caring for small domestic animals"): 12 welfare facts x 24 frames (6 openers x 4 closers) = 288 templates. ----
const WELFARE_FACTS: RoutineFact[] = [
  {
    situation: "a family notices their rabbit has stopped eating and seems lethargic",
    correct: "Isolate the rabbit from others, check it closely, and seek advice from an animal health worker if it does not improve",
    wrong: [
      "Ignore it since rabbits often skip meals for no reason",
      "Immediately sell or give away the rabbit instead of caring for it",
      "Assume it will recover on its own with no monitoring at all",
    ],
  },
  {
    situation: "children in a household enjoy playing with the family's guinea pigs by picking them up roughly and often",
    correct: "Teach the children to handle the guinea pigs gently and calmly, supporting their body properly",
    wrong: [
      "Rough handling is harmless as long as the guinea pig does not visibly cry out",
      "Guinea pigs should be handled by the ears to keep them still",
      "Handling method does not matter as long as children enjoy playing",
    ],
  },
  {
    situation: "a rabbit's hutch has not been cleaned in over three weeks and smells strongly of ammonia",
    correct: "Clean the hutch immediately and set a regular cleaning schedule going forward, since the smell shows waste has built up",
    wrong: [
      "A strong smell is normal and does not need any action",
      "Only clean the hutch once the animal shows signs of illness",
      "Ammonia smell only matters if a person notices it, not the animal",
    ],
  },
  {
    situation: "a farmer plans to breed rabbits but has not set aside a separate space for a doe about to give birth",
    correct: "Prepare a separate, quieter compartment for the doe before she gives birth, for her comfort and the safety of the young",
    wrong: [
      "Breeding rabbits does not require any special housing preparation",
      "The doe should give birth in the same crowded space as the other rabbits",
      "Special preparation is only needed for guinea pigs, not rabbits",
    ],
  },
  {
    situation: "a guinea pig has been eating only pellets for a long period with no fresh vegetables",
    correct: "Add fresh vegetables or fruit rich in vitamin C to prevent deficiency, since guinea pigs cannot produce their own",
    wrong: [
      "Pellets alone are always sufficient for a guinea pig's full diet",
      "Vitamin C only matters for rabbits, not guinea pigs",
      "Fresh vegetables are optional extras with no real health benefit",
    ],
  },
  {
    situation: "a rabbit has visible fur loss and is scratching constantly, but the owner has not checked for parasites",
    correct: "Inspect the rabbit for external parasites and treat it promptly, consulting an animal health worker if needed",
    wrong: [
      "Ignore the scratching since it usually resolves on its own without any cause",
      "Assume the fur loss is just normal shedding with no need to check further",
      "Only treat the rabbit if it stops eating completely",
    ],
  },
  {
    situation: "several rabbits are kept in a hutch that is clearly too small for their number",
    correct: "Provide more space or reduce the number of rabbits in that hutch to prevent overcrowding and stress",
    wrong: [
      "Keep the same hutch size since rabbits adjust to any space given time",
      "Overcrowding is only a concern for guinea pigs, not rabbits",
      "Add more rabbits, since a fuller hutch keeps them warmer",
    ],
  },
  {
    situation: "a guinea pig owner wants to introduce a new type of vegetable to the diet",
    correct: "Introduce the new vegetable gradually alongside the usual diet to avoid upsetting digestion",
    wrong: [
      "Replace the entire diet with the new vegetable immediately",
      "New vegetables should never be introduced at all, regardless of benefit",
      "How feed is introduced makes no difference to a guinea pig's digestion",
    ],
  },
  {
    situation: "a rabbit is showing signs of illness, and one family member suggests simply not feeding it until it improves",
    correct: "Continue providing food and water while seeking advice from an animal health worker, since withholding food does not treat illness",
    wrong: [
      "Withholding food is a recommended way to treat sick rabbits",
      "Sick animals should be left with no food or water until they recover naturally",
      "Feeding a sick rabbit will make its condition worse",
    ],
  },
  {
    situation: "a family is proud that their well-cared-for rabbits have never fallen sick, crediting their consistent daily routine",
    correct: "Consistent housing, feeding, watering, sanitation and parasite control routines genuinely reduce the risk of illness in small domestic animals",
    wrong: [
      "Their rabbits' good health is only due to luck, not their care routine",
      "A consistent care routine has no real effect on animal health",
      "Only expensive commercial feed, not routine care, prevents illness",
    ],
  },
  {
    situation: "a farmer is deciding whether to buy cheap, unbalanced feed to save money or a more balanced ration for their rabbits",
    correct: "Choose the balanced ration, since proper nutrition supports the animals' health even if it costs a little more",
    wrong: [
      "Cheap, unbalanced feed is always just as good as balanced feed",
      "Saving money should always come before the animals' nutritional needs",
      "Rabbits do not need a balanced diet as long as they are eating something",
    ],
  },
  {
    situation: "a new animal health worker visiting a farm recommends checking every new rabbit for parasites before adding it to the group",
    correct: "This recommendation protects the whole group's welfare by preventing parasites from spreading from a newly introduced animal",
    wrong: [
      "The recommendation is unnecessary since new animals are always parasite-free",
      "Checking new animals only matters for large commercial farms",
      "Parasite checks should only be done after animals show symptoms, never before",
    ],
  },
];

// Same 6-opener x 4-closer composition as REASONING_FRAMES above (24 skeletons from 10 pieces).
const WELFARE_OPENERS: ((rng: RNG, fact: RoutineFact) => string)[] = [
  (rng, fact) => `${name(rng)} keeps small domestic animals near ${place(rng)}. ${cap(fact.situation)}`,
  (rng, fact) => `On a smallholding near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} looks after rabbits and guinea pigs at home, where ${fact.situation}`,
  (rng, fact) => `Near ${place(rng)}, a keeper notices that ${fact.situation}`,
  (rng, fact) => `${cap(fact.situation)}, near ${place(rng)}`,
  (rng, fact) => `${name(rng)} must decide how to respond, given that ${fact.situation}`,
];

const WELFARE_CLOSERS = [
  "What is the best welfare-focused response?",
  "Which response best protects the animals' welfare?",
  "What is the kindest and most responsible response?",
  "What is the right way to respond, for the animals' sake?",
];

const WELFARE_FRAMES = combineFrames(WELFARE_OPENERS, WELFARE_CLOSERS);

const WELFARE_TEMPLATES = expandScenarios(WELFARE_FACTS, WELFARE_FRAMES);

export const rearingSmallDomesticAnimals: Skill = {
  id: "g6-ag-f-rearing-small-domestic-animals",
  code: "F.1",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-food-production",
  grade: 6,
  title: "Rearing Small Domestic Animals",
  description: "Routine practices in rearing small domestic animals such as rabbits or guinea pigs — housing, feeding, watering, sanitation and parasite control — and the animal welfare responsibilities of raising them as a source of food.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["practice-match", "categorize-facts", "care-order", "reasoning", "welfare-evaluate", "fill-blank"] as const
    );
    const hint = "The five routine practices are housing, feeding, watering, sanitation and parasite control — each protects the animals in a different way.";

    if (branch === "practice-match") {
      const tokens = shuffle(rng, PRACTICES.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PRACTICES.map((p) => ({ id: p.id, label: p.definition })));
      const correctMap: Record<string, string> = {};
      for (const p of PRACTICES) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, PRACTICE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PRACTICES.map((p) => `${p.label}: ${p.definition}.`).join(" "),
      };
    }

    if (branch === "categorize-facts") {
      const chosen = shuffle(rng, ROUTINE_FACTS).slice(0, 12);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: PRACTICES.map((p) => ({ id: p.id, label: p.label })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is part of ${practiceOf(c.type).label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "care-order") {
      const shuffled = shuffle(rng, CARE_ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, CARE_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: CARE_ORDER_STEPS.map((s) => s.id),
        hint: "Check safety first, then provide water and feed, clean up, inspect the animals, and record what you noticed.",
        explanation: CARE_ORDER_STEPS.map((s) => s.label).join(" → "),
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

    if (branch === "welfare-evaluate") {
      const q = randChoice(rng, WELFARE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what genuinely protects the animal's welfare, not just what is quickest or easiest for the owner.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, ROUTINE_FACTS);
    const p = practiceOf(fb.type);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: `"${fb.text}" — this is part of `,
      after: ".",
      correctAnswer: p.label.toLowerCase(),
      acceptedAnswers: [p.label.toLowerCase(), fb.type],
      inputMode: "text",
      hint,
      explanation: `This is part of ${p.label.toLowerCase()} — ${p.definition.toLowerCase()}.`,
    };
  },
};
