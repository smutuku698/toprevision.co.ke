import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

// KICD Grade 9 Agriculture & Nutrition, strand "2.0 Food Production Processes", sub-strand
// "2.2 Storage of Crop Produce" (10 lessons). Source content mined in full from
// curriculum-reference/grade-9/agriculture-and-nutrition.json:
//  - 4 named storage structures/facilities: container, store room, granary, storage bags.
//  - 6 named preparation practices (source's own listed order, reused verbatim for the ordering
//    branch per CURRICULUM-MINING-GUIDE.md — never invent a sequence the design doesn't state):
//    cleaning, dusting, sealing cracks, repairing leakages, emptying previous crop produce,
//    controlling rodents.
//  - 5 named management practices (again source order): checking moisture content in cereals and
//    pulses, ensuring ventilation, controlling rodents, turning the stored crop produce, disposing
//    of spoilt produce. Note "controlling rodents" is named in BOTH the prep list and the
//    management list in the source — a genuine content nuance (rodent control must continue
//    through storage, not just before it), kept as two distinct TERMS entries and used as its own
//    Analyze-tier reasoning fact below rather than collapsed into one.
//  - Core competency named: "Critical thinking and Problem-solving" (open-mindedness and
//    creativity as learners prepare structures and manage produce) — per RIGOR-STANDARDS.md this
//    makes an Analyze/Evaluate branch mandatory, not optional; the "evaluate" branch below exists
//    to satisfy that, and "reasoning" covers Analyze.
//  - assessmentSignal: "Responsibility: engaging in assigned roles... in the school food store" —
//    folded into one reasoning fact and one evaluate fact (school food store / assigned roles).
//  - linkedLearningAreas: Social Studies — storage management relates to farming as an economic
//    activity — folded into one reasoning fact and one evaluate fact (harvest value / income).
//  - Visual: no dedicated storage-structure VisualSpec exists (granary/store-room/sack diagrams
//    are a genuine "needs new engine type" gap — flagged in the build report, not invented here
//    per the hard constraint against touching types.ts/Visual.tsx). The existing generic
//    "wildlife-deterrent" (kind: "trap") type IS a reasonable fit for the rodent-control content
//    specifically — its render is a generic wire box/cage trap, not tied to a crop-guarding-only
//    context — so it is attached to the two rodent-control TERMS entries in the "identify" branch.

const KENYAN_NAMES = [
  "Amina",
  "Baraka",
  "Chebet",
  "Denis",
  "Fatuma",
  "Juma",
  "Kevin",
  "Lilian",
  "Mwangi",
  "Naliaka",
  "Otieno",
  "Wanjiru",
  "Achieng",
  "Kamau",
  "Njeri",
  "Wafula",
] as const;

const KENYAN_PLACES = [
  "Nyeri",
  "Nakuru",
  "Kisumu",
  "Eldoret",
  "Machakos",
  "Kitale",
  "Kericho",
  "Kakamega",
  "Bungoma",
  "Meru",
  "Embu",
  "Kitui",
  "Narok",
  "Kajiado",
  "Homa Bay",
  "Baringo",
] as const;

function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}

function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---- TERMS pool (identify / click-match): 15 entries across 3 confusable clusters — 4 storage
// structures, 6 preparation practices, 5 management practices. Distractors for the "identify"
// branch are drawn only from within a term's own cluster (plausible-distractor rule). ----
type TermCategory = "structure" | "prep" | "mgmt";
interface Term {
  name: string;
  description: string;
  category: TermCategory;
  visual?: VisualSpec;
}

const TERMS: Term[] = [
  { name: "Container", description: "a small, movable storage vessel such as a bin or tin, used to keep produce like flour or pulses at home", category: "structure" },
  { name: "Store room", description: "a room set aside in a house, used to hold larger amounts of stored crop produce", category: "structure" },
  { name: "Granary", description: "a structure built specifically for storing bulk grain such as maize, often separate from the house", category: "structure" },
  { name: "Storage bags", description: "bags or sacks used to hold and stack cereals or pulses for storage", category: "structure" },
  { name: "Cleaning", description: "removing dirt, pests and old grain residue from a storage structure before use", category: "prep" },
  { name: "Dusting", description: "wiping away dust that could contaminate produce or attract pests", category: "prep" },
  { name: "Sealing cracks", description: "closing up cracks and gaps in the walls or floor of a structure so pests cannot enter", category: "prep" },
  { name: "Repairing leakages", description: "fixing a leaking roof or wall so rain or damp cannot reach the stored produce", category: "prep" },
  { name: "Emptying previous crop produce", description: "removing any old produce left over from the last storage cycle before restocking", category: "prep" },
  { name: "Controlling rodents (before storing)", description: "clearing rats and mice from a storage structure before new produce is placed inside", category: "prep", visual: { type: "wildlife-deterrent", kind: "trap" } },
  { name: "Checking moisture content", description: "testing cereals and pulses to confirm they are dry enough not to develop mould in storage", category: "mgmt" },
  { name: "Ensuring ventilation", description: "allowing air to circulate through stored produce so damp air does not build up", category: "mgmt" },
  { name: "Controlling rodents (during storage)", description: "continuing to guard against rats and mice while produce is already in storage", category: "mgmt", visual: { type: "wildlife-deterrent", kind: "trap" } },
  { name: "Turning stored crop produce", description: "periodically moving or mixing stored produce so no part stays damp or overheats", category: "mgmt" },
  { name: "Disposing of spoilt produce", description: "removing and discarding any spoilt portion promptly so it does not spoil the rest of the batch", category: "mgmt" },
];

const IDENTIFY_PROMPTS: ((description: string) => string)[] = [
  (d) => `Which term describes ${d}?`,
  (d) => `Which storage-related term means ${d}?`,
  (d) => `Can you name the term for ${d}?`,
  (d) => `Which of these fits the description: ${d}?`,
  (d) => `Identify the term that means ${d}.`,
  (d) => `Which word or phrase below describes ${d}?`,
  (d) => `What is the correct term for ${d}?`,
  (d) => `Pick the term that matches: ${d}.`,
  (d) => `Which option correctly names ${d}?`,
  (d) => `Work out which term fits this description: ${d}.`,
  (d) => `Choose the term that describes ${d}.`,
  (d) => `Which term below is defined as ${d}?`,
  (d) => `Name the correct term for ${d}.`,
  (d) => `Select the term that matches this description: ${d}.`,
  (d) => `Which of the following means ${d}?`,
  (d) => `Find the term that correctly describes ${d}.`,
  (d) => `Which storage term is being described here: ${d}?`,
  (d) => `Work out and select the term for ${d}.`,
  (d) => `Which choice below correctly names ${d}?`,
  (d) => `Read the description, then pick the matching term: ${d}.`,
];

const MATCH_PROMPTS = [
  "Match each term to its correct description.",
  "Pair each term with the description that explains it.",
  "Connect each storage-related term to its meaning.",
  "Link each term below to the description that fits it.",
  "Match each item to the statement that correctly describes it.",
  "Pair each term with its correct meaning.",
  "Work out which description belongs to which term, then match them.",
  "Connect each term to its correct explanation.",
  "Match each of these terms to what it actually means.",
  "For each term below, find the description that explains it.",
  "Which description goes with which term? Match them correctly.",
  "Line up each term with what it actually means.",
  "Match the terms to their descriptions below.",
  "Figure out what each term means, then match it to its description.",
  "Pair up every term with the statement that correctly describes it.",
  "Match each item on the left to the term it describes on the right.",
  "Sort out which description belongs to which term, by matching them.",
  "Correctly match every term to the description that fits it.",
  "Match each storage-related term to what it means in practice.",
  "Connect each term with the description that best explains it.",
];

// ---- Categorize pool: 11 actions (6 prep + 5 management) — well above the 10-fact floor.
// A random 8-of-11 subset is sampled each generation (never the full pool) per the categorize
// full-pool-repeat rule. ----
interface ActionItem {
  text: string;
  bucket: "prep" | "mgmt";
}

const PREP_ACTIONS: ActionItem[] = [
  { text: "Cleaning the storage structure before use", bucket: "prep" },
  { text: "Dusting the storage structure before use", bucket: "prep" },
  { text: "Sealing cracks in the walls or floor of the structure", bucket: "prep" },
  { text: "Repairing leakages in the roof or walls before storing produce", bucket: "prep" },
  { text: "Emptying any produce left over from the previous storage cycle", bucket: "prep" },
  { text: "Clearing rodents from the structure before storing new produce", bucket: "prep" },
];

const MGMT_ACTIONS: ActionItem[] = [
  { text: "Checking the moisture content of cereals and pulses", bucket: "mgmt" },
  { text: "Ensuring the storage structure stays well ventilated", bucket: "mgmt" },
  { text: "Continuing to guard against rodents while produce is in storage", bucket: "mgmt" },
  { text: "Turning the stored crop produce periodically", bucket: "mgmt" },
  { text: "Disposing of any spoilt produce promptly", bucket: "mgmt" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each action as preparing a storage structure (before storing) or managing stored produce (during storage).",
  "Group each action under before storing or during storage.",
  "Decide whether each action happens before storing or during storage, and sort it there.",
  "Place each action into the correct stage: before storing, or during storage.",
  "Read each action and sort it under before storing or during storage.",
  "Classify each action as happening before storing or during storage.",
  "Work out which stage each action belongs to, then sort it there.",
  "Sort each action into preparing the structure or managing the stored produce.",
  "Which stage does each action belong to? Sort it accordingly.",
  "Organize these actions into before storing or during storage.",
  "Sort each action below into before storing or during storage.",
  "Drop each action into the storage stage it's really about.",
  "Group each action with the stage it correctly belongs to.",
  "Decide where each action fits: preparing the structure, or managing stored produce.",
  "Sort these actions into their correct storage-stage groups.",
  "For each action, work out the stage it belongs to and sort it in.",
  "Place these actions under the stage each one matches.",
  "Sort each action correctly between the two storage stages.",
  "Read each action and file it under the right storage stage.",
  "Assign each action to the stage it best fits: before storing, or during storage.",
];

// ---- Ordering pools: the two named sequences from the source, kept in the source's own listed
// order (never an invented order) per CURRICULUM-MINING-GUIDE.md. ----
const PREP_STEPS = [
  { id: "clean", label: "Clean the storage structure" },
  { id: "dust", label: "Dust the storage structure" },
  { id: "seal", label: "Seal cracks in the walls or floor" },
  { id: "repair", label: "Repair leakages in the roof or walls" },
  { id: "empty", label: "Empty any previous crop produce left inside" },
  { id: "rodents-prep", label: "Control rodents inside the structure" },
] as const;

const MGMT_STEPS = [
  { id: "moisture", label: "Check the moisture content of the cereals and pulses" },
  { id: "ventilate", label: "Ensure the storage structure is well ventilated" },
  { id: "rodents-mgmt", label: "Continue controlling rodents" },
  { id: "turn", label: "Turn the stored crop produce" },
  { id: "dispose", label: "Dispose of any spoilt produce" },
] as const;

const ORDER_PROMPTS: ((activity: string) => string)[] = [
  (a) => `Arrange the steps for ${a} in the correct order.`,
  (a) => `Put these steps for ${a} into a sensible order.`,
  (a) => `Sequence the steps for ${a} correctly.`,
  (a) => `Arrange these actions into the order a careful farmer would follow when ${a}.`,
  (a) => `Order these steps the way someone ${a} would actually carry them out.`,
  (a) => `Sort these steps into the order they should happen when ${a}.`,
  (a) => `Put these steps in the order a responsible farmer would follow when ${a}.`,
  (a) => `Work out the sensible order for these steps involved in ${a}.`,
  (a) => `Arrange these actions into a logical sequence for ${a}.`,
  (a) => `Which order should these steps happen in when ${a}? Arrange them correctly.`,
  (a) => `Build a sensible routine by ordering these steps for ${a} correctly.`,
  (a) => `Sequence a farmer's steps for ${a} in the order they should be done.`,
  (a) => `Order these actions the way they'd happen in a well-run process of ${a}.`,
  (a) => `Arrange the steps of good practice for ${a}, in the right order.`,
  (a) => `Put these steps into the order a careful farmer would complete them when ${a}.`,
  (a) => `Sequence these steps to build a sensible approach to ${a}.`,
  (a) => `Work out the correct order for these steps involved in ${a}.`,
  (a) => `Arrange these steps as a farmer would carry them out when ${a}.`,
  (a) => `Order the steps below the way a sensible process of ${a} would run.`,
  (a) => `Sequence these steps correctly, from first to last, for ${a}.`,
];

// ---- Reasoning (Apply/Analyze) pool: 10 facts x 4 frames = 40 distinct scenario templates.
// Mandatory per RIGOR-STANDARDS.md since this sub-strand's Core Competency names "Critical
// thinking and Problem-solving." Facts 9 and 10 fold in the linkedLearningAreas (economic
// activity) and assessmentSignal (responsibility, school food store) content respectively; fact 7
// tests the prep-vs-management rodent-control nuance directly. ----
interface StoreFact {
  situation: string;
  correct: string;
  wrong: string[];
}

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const REASON_FACTS: StoreFact[] = [
  {
    situation: "maize stored in a granary with several unsealed cracks in the wall is found riddled with rat droppings within weeks, while maize in a neighbour's well-sealed granary stays clean",
    correct: "Unsealed cracks give rodents an easy way into the granary, so sealing cracks before storing produce is an essential part of preparing the structure",
    wrong: [
      "Rats can enter a granary no matter how well it is sealed, so sealing cracks makes no real difference",
      "Cracks only affect how much air reaches the grain, not whether pests can get in",
      "Rat droppings appear on stored grain regardless of the condition of the storage structure",
    ],
  },
  {
    situation: "a farmer stores new beans in a store room without first removing the mouldy remains of last season's beans, and the new batch develops mould within a month",
    correct: "Old, spoilt produce left behind can carry mould and pests that spread to the freshly stored batch, which is why emptying previous crop produce is a required preparation step",
    wrong: [
      "Mould only affects the produce that was already spoilt, never a fresh batch stored nearby",
      "The new beans would have developed mould regardless of what was left in the store room",
      "Emptying old produce is only about making space, not about preventing contamination",
    ],
  },
  {
    situation: "cereals placed in storage bags without their moisture content being checked first develop mould within weeks, while a batch that was tested and confirmed dry stays sound for months",
    correct: "Grain that is not dry enough encourages mould growth in storage, so checking moisture content in cereals and pulses before storage is essential",
    wrong: [
      "Moisture content has no effect on whether stored grain develops mould",
      "Mould only grows on grain that is too dry, never on damp grain",
      "Checking moisture content only matters for pulses, not cereals",
    ],
  },
  {
    situation: "grain stored in a well-ventilated granary stays in better condition than the same type of grain stored in a sealed, airless container",
    correct: "Ventilation lets damp air escape from the stored produce; without it, moisture builds up and creates conditions for spoilage",
    wrong: [
      "Sealed, airless containers always keep produce safer than ventilated ones",
      "Ventilation only matters for fresh produce, not produce already in storage",
      "Air circulation has no connection to whether grain develops mould",
    ],
  },
  {
    situation: "produce that is never turned during storage develops damp patches and hot spots, while produce that is turned regularly stays evenly conditioned",
    correct: "Turning the stored produce mixes it so no single part stays damp or overheats, which is why turning is part of ongoing storage management",
    wrong: [
      "Turning stored produce has no effect on how evenly it stores",
      "Damp patches form no matter how often produce is turned",
      "Turning produce only changes its appearance, not its condition",
    ],
  },
  {
    situation: "a small patch of spoilt beans is left inside a full sack instead of being removed, and within days a much larger portion of the sack has spoiled",
    correct: "Spoilt produce left in contact with sound produce spreads mould and decay to it, so disposing of spoilt produce promptly protects the rest of the batch",
    wrong: [
      "Spoilt produce cannot affect the sound produce around it",
      "A small spoilt patch always stays exactly the same size until it is removed",
      "Removing spoilt produce is only about appearance, not about preventing further spoilage",
    ],
  },
  {
    situation: "a granary that had rodents cleared out before storage began still develops a fresh rodent problem two months into storage",
    correct: "Controlling rodents is needed both before storing produce and throughout the storage period, since rodents can find a way in again after storage has already started",
    wrong: [
      "Once rodents are cleared before storage, they can never return during storage",
      "Rodent control before storage makes ongoing checks during storage unnecessary",
      "Rodents only target grain that has already started to spoil",
    ],
  },
  {
    situation: "a farmer dusts and cleans a store room thoroughly but does not repair a leaking section of the roof, and rain later damages a large part of the stored maize",
    correct: "Cleaning and dusting alone are not enough — repairing leakages is a separate, necessary preparation step, since damp entering through a leaking roof can spoil produce regardless of how clean the structure is",
    wrong: [
      "A store room that has been cleaned and dusted cannot be damaged by a leaking roof",
      "Leakages only affect the outside of a structure, never the produce stored inside",
      "Repairing leakages matters less than cleaning when preparing a storage structure",
    ],
  },
  {
    situation: "two farmers each harvest the same amount of maize; one stores it properly and sells it months later at a good price, while the other loses much of the harvest to spoilage and has little left to sell",
    correct: "Proper storage management protects the value of a harvest, which is why storing crop produce well matters to farming as an economic activity, not just as a technical task",
    wrong: [
      "How produce is stored has no real effect on how much of it can eventually be sold",
      "Spoilage during storage never affects a farmer's income",
      "Storage practices only matter for produce that will be eaten at home, not sold",
    ],
  },
  {
    situation: "at a school food store, learners assigned to check the stored produce each week catch and remove a small mouldy patch before it spreads, keeping the whole store in good condition",
    correct: "Taking responsibility for an assigned storage-checking role lets problems like early spoilage be caught and dealt with before they affect the rest of the stored produce",
    wrong: [
      "Assigning learners to check stored produce has no effect on how well it is preserved",
      "Mouldy patches always spread through a whole store no matter how quickly they are found",
      "Checking stored produce is only useful if it is done by an adult, not learners",
    ],
  },
];

const REASON_FRAMES: ((rng: RNG, fact: StoreFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, who helps manage crop storage near ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `At a storage facility near ${p}, learners observe that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps notes on crop storage and records that ${fact.situation}. What explains this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = cap(fact.situation);
    return {
      prompt: `${situation}, on a farm near ${p}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

// ---- Evaluate pool: 10 facts x 4 frames = 40 distinct scenario templates. Mandatory alongside
// "reasoning" per the same Critical-thinking-and-problem-solving core competency. ----
const EVALUATE_FACTS: StoreFact[] = [
  {
    situation: "a farmer is about to restock a granary but notices old, mouldy maize still sitting in one corner from the previous season",
    correct: "Remove and dispose of the old mouldy maize before restocking, since leaving it in place risks contaminating the fresh batch",
    wrong: [
      "Store the new maize right on top of the old mouldy maize to save time",
      "Leave the old maize where it is — it will not affect the new batch",
      "Only remove the old maize if the new batch is beans instead of maize",
    ],
  },
  {
    situation: "a store room has several small cracks in its walls, and the farmer must decide whether to seal them before storing this season's beans or deal with it later",
    correct: "Seal the cracks before storing the beans, since unsealed cracks let rodents and pests enter the produce during storage",
    wrong: [
      "Wait until after storage to seal the cracks, since it will not matter either way",
      "Only seal cracks if rodents have already been seen inside the structure",
      "Cracks in the walls only need sealing if the structure is a granary, not a store room",
    ],
  },
  {
    situation: "cereals harvested this week feel slightly damp, and the farmer must decide whether to store them immediately or check their moisture content first",
    correct: "Check the moisture content first, and only store the cereals once they are confirmed dry enough, since damp grain is at high risk of developing mould in storage",
    wrong: [
      "Store the damp cereals immediately — moisture content will sort itself out later",
      "Moisture only matters for pulses, so damp cereals can be stored without checking",
      "Checking moisture content is unnecessary if the storage bags look clean",
    ],
  },
  {
    situation: "a household is choosing between an airtight, sealed storage container with no airflow and a container that allows some ventilation, for storing grain",
    correct: "Choose the container that allows ventilation, since air circulation helps stop damp air building up around the stored grain",
    wrong: [
      "Choose the fully airtight container, since no airflow always means better protection",
      "Ventilation makes no difference once grain has already been dried",
      "The airtight container is always better for pulses, and the ventilated one only for cereals",
    ],
  },
  {
    situation: "a farmer notices a small mouldy section in a large sack of stored beans and must decide what to do",
    correct: "Remove and dispose of the spoilt portion right away, so the mould does not spread to the rest of the sound beans in the sack",
    wrong: [
      "Leave the mouldy section in place, since it cannot affect the rest of the sack",
      "Mix the mouldy beans back into the rest of the sack to save the ones that are still good",
      "Only remove the spoilt beans once the whole sack has gone mouldy",
    ],
  },
  {
    situation: "at a school food store, learners must decide whether to check and turn the stored produce on a regular schedule or only when something looks obviously wrong",
    correct: "Check and turn the stored produce on a regular schedule, since problems like damp patches and early spoilage are easier to catch and manage before they spread",
    wrong: [
      "Only check the produce once it already looks visibly spoilt",
      "Turning stored produce regularly has no real benefit over leaving it untouched",
      "Checking on a schedule is unnecessary once produce has been stored correctly",
    ],
  },
  {
    situation: "a farmer cleared rodents from a granary before storing maize, and two months later must decide whether ongoing rodent checks are still worthwhile",
    correct: "Continue with ongoing rodent checks, since rodents can find their way back into a granary even after it was cleared before storage began",
    wrong: [
      "Stop checking for rodents completely, since clearing them before storage is enough on its own",
      "Rodents cannot re-enter a granary once produce has been stored inside it",
      "Ongoing rodent checks are only necessary for storage bags, never for a granary",
    ],
  },
  {
    situation: "a farmer is deciding how much effort to put into properly storing this season's surplus maize instead of selling all of it immediately at a low price",
    correct: "Store the surplus maize properly, since good storage protects the harvest's value and can allow the farmer to sell it later, supporting farming as a reliable economic activity",
    wrong: [
      "Sell all of the maize immediately regardless of price, since storage never protects a harvest's value",
      "Storage decisions have no connection to a farmer's income from farming",
      "It is always better to let surplus maize spoil than to spend effort storing it",
    ],
  },
  {
    situation: "a store room roof has started leaking slightly, and the farmer must decide whether repairing it before the next harvest is worth the effort",
    correct: "Repair the leaking roof before the next harvest, since damp entering through even a small leak can spoil a large amount of stored produce",
    wrong: [
      "Leave the small leak unrepaired, since it will not affect the produce stored below it",
      "Repairing a leaking roof is only necessary if the store room is completely flooded",
      "A leaking roof only matters for storage bags, not for produce stored loose in a room",
    ],
  },
  {
    situation: "a group of learners assigned to manage the school food store must decide how to handle a batch of produce that is starting to show early signs of spoilage",
    correct: "Take responsibility for the assigned role by removing the spoiling produce promptly and reporting it, rather than ignoring the problem",
    wrong: [
      "Ignore the early signs of spoilage since it is not fully spoilt yet",
      "Wait for someone else to notice and deal with the spoiling produce",
      "Mix the spoiling produce with the rest of the batch so it is less noticeable",
    ],
  },
];

const EVALUATE_FRAMES: ((rng: RNG, fact: StoreFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, managing crop storage near ${p}, faces this situation: ${fact.situation}. What is the best course of action?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `In a storage facility near ${p}, ${fact.situation}. Which response is most appropriate?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} must decide what to do, given that ${fact.situation}. Which choice is correct?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = cap(fact.situation);
    return {
      prompt: `${situation}, near ${p}. Which choice actually protects the produce?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

// ---- Fill-blank pool: 17 distinct vocabulary/reasoning sentences (above the 10-template floor). ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "A structure built specifically for storing bulk grain such as maize is called a ", after: ".", correctAnswer: "granary", acceptedAnswers: ["granary"] },
  { before: "A room set aside in a house for holding stored crop produce is called a store ", after: ".", correctAnswer: "room", acceptedAnswers: ["room"] },
  { before: "Bags used to hold and stack cereals or pulses for storage are called storage ", after: ".", correctAnswer: "bags", acceptedAnswers: ["bags", "sacks"] },
  { before: "Closing up gaps in the walls or floor of a storage structure so pests cannot enter is called sealing ", after: ".", correctAnswer: "cracks", acceptedAnswers: ["cracks"] },
  { before: "Fixing a leaking roof or wall before storing produce is called repairing ", after: ".", correctAnswer: "leakages", acceptedAnswers: ["leakages", "leaks"] },
  { before: "Removing old produce left over from the previous storage cycle before restocking is called ", after: " the structure.", correctAnswer: "emptying", acceptedAnswers: ["emptying"] },
  { before: "Testing cereals and pulses to confirm they are dry enough for storage means checking their ", after: " content.", correctAnswer: "moisture", acceptedAnswers: ["moisture"] },
  { before: "Allowing air to circulate through stored produce so damp air does not build up is called ", after: ".", correctAnswer: "ventilation", acceptedAnswers: ["ventilation"] },
  { before: "Periodically moving or mixing stored produce so no part stays damp is called ", after: " it.", correctAnswer: "turning", acceptedAnswers: ["turning"] },
  { before: "Removing and discarding any spoilt portion of stored produce promptly is called disposing of ", after: " produce.", correctAnswer: "spoilt", acceptedAnswers: ["spoilt", "spoiled"] },
  { before: "Getting rid of and guarding against rats and mice in a storage structure, both before and during storage, is called controlling ", after: ".", correctAnswer: "rodents", acceptedAnswers: ["rodents"] },
  { before: "Grain that is not dry enough when stored is at high risk of developing ", after: ".", correctAnswer: "mould", acceptedAnswers: ["mould", "mold"] },
  { before: "Wheat, maize and rice are examples of ", after: " commonly checked for moisture before storage.", correctAnswer: "cereals", acceptedAnswers: ["cereals"] },
  { before: "Beans, peas and lentils are examples of ", after: " commonly checked for moisture before storage.", correctAnswer: "pulses", acceptedAnswers: ["pulses"] },
  { before: "Good storage protects a harvest's value, which is why storage management matters to farming as an ", after: " activity.", correctAnswer: "economic", acceptedAnswers: ["economic"] },
  { before: "Taking ownership of an assigned storage-checking role, such as in a school food store, is an example of showing ", after: ".", correctAnswer: "responsibility", acceptedAnswers: ["responsibility"] },
  { before: "A small, movable storage vessel such as a bin or tin, used to keep produce like flour at home, is called a ", after: ".", correctAnswer: "container", acceptedAnswers: ["container"] },
];

const FILL_PROMPTS = [
  "Complete the sentence about storing crop produce.",
  "Fill in the missing word about storing crop produce.",
  "Complete this sentence about preparing or managing crop storage.",
  "Supply the missing word in this sentence about crop storage.",
  "Fill in the blank to complete the fact about storing crop produce.",
  "Complete the missing word in this statement about crop storage.",
  "Which word correctly completes this sentence about crop storage?",
  "Work out the missing word in this sentence.",
  "Fill in the term that completes this fact about storing produce.",
  "Complete this storage-related sentence with the correct word.",
  "Supply the correct word to finish this sentence about crop storage.",
  "What word belongs in the blank below?",
  "Fill in the blank with the correct storage term.",
  "Complete the sentence correctly.",
  "Which term fills the gap in this sentence about crop storage?",
  "Work out and fill in the missing word.",
  "Type the word that correctly completes this sentence.",
  "Fill in the missing term about preparing or managing stored produce.",
  "Complete this fact about crop storage with the right word.",
  "Supply the missing word to finish this storage-related sentence.",
];

function expandScenarios<F>(
  facts: readonly F[],
  frames: readonly ((rng: RNG, fact: F) => ScenarioMC)[]
): ((rng: RNG) => ScenarioMC)[] {
  const out: ((rng: RNG) => ScenarioMC)[] = [];
  for (const fact of facts) {
    for (const frame of frames) {
      out.push((rng: RNG) => frame(rng, fact));
    }
  }
  return out;
}

function buildChoices(rng: RNG, correct: string, wrong: string[]): { choices: string[]; correctIndex: number } {
  const choices = shuffle(rng, [correct, ...wrong]);
  return { choices, correctIndex: choices.indexOf(correct) };
}

const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASON_FRAMES);
const EVALUATE_TEMPLATES = expandScenarios(EVALUATE_FACTS, EVALUATE_FRAMES);

const HINT =
  "Preparing a storage structure — cleaning, dusting, sealing cracks, repairing leakages, emptying old produce, and controlling rodents — happens before storing. Managing stored produce — checking moisture, ensuring ventilation, continuing rodent control, turning the produce, and disposing of spoilt produce — happens throughout storage.";

export const storageOfCropProduce: Skill = {
  id: "ag-f-storage-of-crop-produce",
  code: "F.3",
  subjectId: "agriculture-nutrition",
  strandId: "ag-food-production",
  grade: 9,
  title: "Storage of crop produce",
  description: "Preparing a storage structure (container, store room, granary, storage bags) before storing crop produce, and managing stored produce to reduce spoilage.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify", "match", "categorize", "prep-order", "mgmt-order", "reasoning", "evaluate", "fill"] as const
    );

    if (branch === "identify") {
      const correct = randChoice(rng, TERMS);
      const cluster = TERMS.filter((t) => t.category === correct.category && t.name !== correct.name);
      const distractors = shuffle(rng, cluster).slice(0, 3);
      const choices = shuffle(rng, [correct.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS)(correct.description),
        choices,
        correctIndex: choices.indexOf(correct.name),
        layout: "list",
        visual: correct.visual,
        hint: HINT,
        explanation: `${correct.name} — ${correct.description}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: chosen.map((t) => `${t.name} — ${t.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...PREP_ACTIONS, ...MGMT_ACTIONS]).slice(0, 8);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.bucket));

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "prep", label: "Before storing (preparing the structure)" },
          { id: "mgmt", label: "During storage (managing the produce)" },
        ],
        correctBucket,
        hint: HINT,
        explanation: chosen
          .map((a) => `"${a.text}" happens ${a.bucket === "prep" ? "before storing, while preparing the structure" : "during storage, while managing the produce"}.`)
          .join(" "),
      };
    }

    if (branch === "prep-order") {
      const shuffled = shuffle(rng, PREP_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS)("preparing a storage structure for crop produce"),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PREP_STEPS.map((s) => s.id),
        hint: HINT,
        explanation: PREP_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "mgmt-order") {
      const shuffled = shuffle(rng, MGMT_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS)("managing crop produce that is already in storage"),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MGMT_STEPS.map((s) => s.id),
        hint: HINT,
        explanation: MGMT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoices(rng, q.correct, q.wrong);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: HINT,
        explanation: q.explanation,
      };
    }

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoices(rng, q.correct, q.wrong);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Weigh up which choice actually protects the stored produce and prevents spoilage in this specific situation.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers,
      inputMode: "text",
      hint: HINT,
      explanation: `The sentence reads: "${fb.before}${fb.correctAnswer}${fb.after}"`,
    };
  },
};
