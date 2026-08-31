import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture F.2 "Preserving Crop Products" focuses on preserving fruits and
// vegetables using the sun-drying method to reduce food wastage. The sanctioned "Link to other
// learning area" (preserved parts of fruits/vegetables to parts of a plant, learnt in Science)
// is implemented as its own content pool below (PRODUCE_PARTS), not invented. "Critical thinking
// and problem solving" is F.2's named core competency, so the evaluate branch below is mandatory,
// not optional. A bar-chart VisualSpec (comparing shelf life fresh vs sun-dried) gives the
// data-hook branch a genuine Analyze-tier visual, as the task brief suggested for this skill.

const DRYING_STEPS = [
  { id: "select", label: "Select fresh, ripe, undamaged produce", detail: "Choose fruits or vegetables that are fresh, ripe and free from damage or rot" },
  { id: "wash", label: "Wash the produce", detail: "Wash thoroughly to remove dirt and any chemical residue" },
  { id: "cut", label: "Cut into thin, even slices", detail: "Peel and/or slice the produce thinly and evenly so it dries faster and more evenly" },
  { id: "spread", label: "Spread in a single layer", detail: "Spread the slices on a clean drying tray or mat without overlapping" },
  { id: "place", label: "Place in a sunny, ventilated spot", detail: "Place the tray in the sun, raised off the ground and covered with a fine net against insects and dust" },
  { id: "turn", label: "Turn the pieces regularly", detail: "Turn the drying pieces so all sides dry evenly" },
  { id: "protect", label: "Protect from rain and night moisture", detail: "Bring the produce indoors at night or during rain" },
  { id: "check", label: "Check for full dryness", detail: "Properly dried produce feels leathery or brittle, with no soft, moist spots" },
  { id: "store", label: "Store in an airtight container", detail: "Store the fully dried produce in a clean, airtight, labelled container" },
  { id: "keep", label: "Keep in a cool, dry place", detail: "Keep the stored container in a cool, dry place away from direct sunlight" },
] as const;

// ---- Cross-link pool (Link to other learning area: parts of fruits/vegetables <-> parts of a
// plant, Science): 33 items — well above the Grade-6 30-item pool floor. ----
type PlantPart = "fruit" | "leaf" | "root" | "tuber" | "bulb" | "seed" | "flower";
const PRODUCE_PARTS: { produce: string; part: PlantPart }[] = [
  { produce: "Tomato", part: "fruit" },
  { produce: "Mango", part: "fruit" },
  { produce: "Banana", part: "fruit" },
  { produce: "Pumpkin", part: "fruit" },
  { produce: "Green beans", part: "fruit" },
  { produce: "Watermelon", part: "fruit" },
  { produce: "Avocado", part: "fruit" },
  { produce: "Cucumber", part: "fruit" },
  { produce: "Eggplant (brinjal)", part: "fruit" },
  { produce: "Pepper (hoho)", part: "fruit" },
  { produce: "Passion fruit", part: "fruit" },
  { produce: "Pawpaw", part: "fruit" },
  { produce: "Orange", part: "fruit" },
  { produce: "Lemon", part: "fruit" },
  { produce: "Kale (sukuma wiki)", part: "leaf" },
  { produce: "Cabbage", part: "leaf" },
  { produce: "Spinach", part: "leaf" },
  { produce: "Lettuce", part: "leaf" },
  { produce: "Coriander (dhania)", part: "leaf" },
  { produce: "Amaranth (terere)", part: "leaf" },
  { produce: "Carrot", part: "root" },
  { produce: "Cassava", part: "root" },
  { produce: "Beetroot", part: "root" },
  { produce: "Radish", part: "root" },
  { produce: "Turnip", part: "root" },
  { produce: "Sweet potato", part: "root" },
  { produce: "Potato", part: "tuber" },
  { produce: "Yam", part: "tuber" },
  { produce: "Onion", part: "bulb" },
  { produce: "Garlic", part: "bulb" },
  { produce: "Groundnuts", part: "seed" },
  { produce: "Green peas", part: "seed" },
  { produce: "Cauliflower", part: "flower" },
];

const PART_LABELS: Record<PlantPart, string> = {
  fruit: "Fruit",
  leaf: "Leaf",
  root: "Root",
  tuber: "Tuber",
  bulb: "Bulb",
  seed: "Seed",
  flower: "Flower",
};

// ---- Hygiene practice pool (categorize; Value: Integrity — honest, hygienic, safe
// preservation methods): 32 practices across two buckets. ----
const GOOD_PRACTICES = [
  "Washing fruits and vegetables thoroughly before slicing them for drying",
  "Using a clean knife and clean cutting surface when preparing produce for drying",
  "Slicing produce into thin, even pieces so it dries quickly and evenly",
  "Drying produce on a raised tray or mat, off the bare ground",
  "Covering the drying produce with a fine net to keep off flies, dust and insects",
  "Turning the drying pieces regularly so all sides dry evenly",
  "Bringing the drying produce indoors at night or when it rains",
  "Checking that produce is fully dry, leathery or brittle, before storing it",
  "Storing dried produce in a clean, airtight container",
  "Labelling stored dried produce with the date it was dried",
  "Storing dried produce in a cool, dry place away from direct sunlight",
  "Checking stored dried produce occasionally for signs of mould or pests",
  "Drying only produce that is fresh and free from visible damage or rot",
  "Washing hands before handling produce for drying",
  "Keeping the drying area away from dust, smoke, or animals",
  "Using produce for drying soon after harvest, before it starts to spoil",
] as const;

const POOR_PRACTICES = [
  "Slicing produce with a dirty knife on an unwashed surface",
  "Drying produce directly on bare, dusty ground with no tray or mat",
  "Leaving drying produce uncovered where flies and insects can land on it",
  "Leaving drying produce outside overnight during rain",
  "Storing produce before it is fully dry, while it still feels slightly moist",
  "Storing dried produce in an open container that lets in moisture and pests",
  "Storing dried produce without any label, making it hard to know how old it is",
  "Storing dried produce in a warm, humid spot instead of a cool, dry place",
  "Ignoring visible mould on stored dried produce and using it anyway",
  "Drying produce that is already visibly damaged or starting to rot",
  "Handling produce for drying without washing hands first",
  "Drying produce in a dusty, smoky area near a cooking fire",
  "Leaving harvested produce to sit for a long time before starting to dry it",
  "Piling produce in thick, overlapping layers on the drying tray, so it dries unevenly and slowly",
  "Never turning the produce while it dries, leaving some sides still moist underneath",
  "Reusing a container for dried produce without cleaning it from a previous, spoiled batch",
] as const;

// ---- Reasoning (Apply/Analyze) pool: 10 observation facts x 3 frames = 30 templates. ----
interface PreserveFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: PreserveFact[] = [
  {
    situation: "fruit slices left to dry in the sun for several days become noticeably lighter in weight than when they were fresh",
    correct: "Drying removes much of the water content from the fruit, and water makes up most of a fresh fruit's weight",
    wrong: [
      "Drying adds extra material to the fruit, making it heavier at first before it lightens",
      "The fruit's weight has nothing to do with how much water it contains",
      "Sun exposure destroys most of the fruit's mass through heat alone",
    ],
  },
  {
    situation: "properly sun-dried vegetables can be stored for several months without spoiling, while the same fresh vegetables spoil within days",
    correct: "Removing moisture through drying takes away the water that mould, bacteria and other spoilage organisms need to grow",
    wrong: [
      "Sunlight itself kills all spoilage organisms permanently, regardless of moisture",
      "Dried vegetables spoil at exactly the same rate as fresh ones, just less noticeably",
      "Drying only changes the taste of vegetables, not how long they last",
    ],
  },
  {
    situation: "vegetables dried in thick, overlapping layers on a tray spoil faster after storage than vegetables dried in a thin, single layer",
    correct: "Thick, overlapping layers trap moisture and dry unevenly, leaving some parts still moist enough for spoilage organisms to grow",
    wrong: [
      "Layer thickness has no effect on how well produce dries",
      "Thicker layers always dry faster because there is more produce exposed to the sun",
      "Overlapping pieces protect each other from spoilage",
    ],
  },
  {
    situation: "dried produce stored in an airtight container lasts much longer than dried produce stored in an open basket",
    correct: "An airtight container keeps out moisture and pests that could reintroduce the conditions spoilage organisms need",
    wrong: [
      "Airtight containers have no real effect once the produce is already dried",
      "Open baskets always keep produce fresher because of better air circulation",
      "Storage container type only affects appearance, not shelf life",
    ],
  },
  {
    situation: "produce dried in a dusty, uncovered area develops a gritty texture and sometimes visible mould, more often than produce dried under a net",
    correct: "An uncovered drying area lets dust, insects and contaminants settle on the produce, which can introduce spoilage organisms",
    wrong: [
      "Dust has no effect on whether dried produce spoils",
      "Covering produce with a net actually slows down drying and increases spoilage risk",
      "Mould only grows on fresh produce, never on drying or dried produce",
    ],
  },
  {
    situation: "produce brought indoors during rain dries and stores better than produce left outside overnight during a rainstorm",
    correct: "Rain reintroduces moisture to partly dried produce, undoing the drying process and increasing the risk of spoilage",
    wrong: [
      "Rainwater has no effect on produce that is already partly dried",
      "Leaving produce out in rain speeds up the overall drying process",
      "Only fresh, undried produce is affected by rain, not partly dried produce",
    ],
  },
  {
    situation: "labelling dried produce with the date it was dried helps a household avoid food wastage",
    correct: "Knowing how long produce has been stored helps a household use older batches first, before they eventually spoil",
    wrong: [
      "Labelling only matters for produce sold commercially, not for home use",
      "Dried produce never needs to be used within any particular time frame",
      "Dates on stored produce have no effect on whether food gets wasted",
    ],
  },
  {
    situation: "a household that checks stored dried produce occasionally for mould wastes less food overall than one that never checks",
    correct: "Catching a small amount of spoilage early lets a household remove it before it spreads to the rest of the stored batch",
    wrong: [
      "Checking stored produce has no effect on how much food gets wasted",
      "Mould on dried produce is always harmless and does not need any action",
      "Once produce is dried, it can never develop mould again",
    ],
  },
  {
    situation: "vegetables that were already slightly damaged before drying spoil in storage faster than fully sound vegetables that were dried",
    correct: "Existing damage gives spoilage organisms an easier entry point, even after the produce has been dried",
    wrong: [
      "Drying repairs any existing damage in the produce completely",
      "Damaged produce always dries faster and lasts longer as a result",
      "Spoilage organisms cannot survive the drying process regardless of the produce's condition beforehand",
    ],
  },
  {
    situation: "fruit slices turned regularly while drying come out more evenly dried than slices left untouched on one side",
    correct: "Turning the slices exposes all sides evenly to the sun and air, preventing moist patches from being left underdried",
    wrong: [
      "Turning the slices has no effect on how evenly they dry",
      "Leaving slices untouched always produces more even drying",
      "Turning slices only affects their appearance, not their dryness",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: PreserveFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, preserving produce at home near ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `At a demonstration near ${p}, learners observe that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps notes on food preservation and records that ${fact.situation}. What explains this?`,
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
      prompt: `${situation}, in a household near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `While comparing batches of preserved produce near ${p}, ${who} finds that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

// ---- Evaluate pool (mandatory: "Critical thinking and problem solving" is F.2's named core
// competency): 10 constraint facts x 3 frames = 30 templates. ----
const EVALUATE_FACTS: PreserveFact[] = [
  {
    situation: "a family has a large harvest of tomatoes ripening all at once, more than they can eat or sell fresh before it spoils",
    correct: "Sun-dry the surplus tomatoes so they can be stored and used later instead of being wasted",
    wrong: [
      "Leave the surplus tomatoes to spoil since nothing can be done in time",
      "Sell all the tomatoes at a very low price immediately, even at a loss",
      "Throw away the surplus tomatoes to avoid the effort of preserving them",
    ],
  },
  {
    situation: "a household is deciding whether to invest time in properly drying vegetables now, during a good harvest, or risk having little preserved food later in the dry season",
    correct: "Invest the time now to dry and store vegetables properly, since preserved food reduces the risk of shortage later",
    wrong: [
      "Preserving food now has no effect on food security later in the year",
      "It is better to always buy fresh vegetables later rather than preserve any now",
      "Preservation only matters for large commercial farms, not households",
    ],
  },
  {
    situation: "a family dried vegetables quickly by leaving them in thick piles to save time, and much of the batch later went mouldy in storage",
    correct: "The vegetables should have been spread in a thin, single layer so they dried fully and evenly, avoiding the mould that formed",
    wrong: [
      "The mould happened by chance and has nothing to do with how the vegetables were dried",
      "Thick piles always dry the fastest and most evenly",
      "Mould only forms on fresh produce, so drying method is not the cause",
    ],
  },
  {
    situation: "a community is choosing between an open, uncovered drying area and a covered drying area protected by a net, with the same amount of sun exposure",
    correct: "Choose the covered drying area, since it protects the produce from dust, insects and contamination without blocking the sun needed to dry it",
    wrong: [
      "The open area is always better since covering it blocks the sun completely",
      "Covering produce during drying makes no difference to its final quality",
      "Insects and dust have no effect on how safely dried produce can be stored",
    ],
  },
  {
    situation: "a family stored their dried produce without labelling it, and later found an old, spoiled batch mixed in with a fresh one",
    correct: "Labelling dried produce with the date it was prepared would have let the family use older batches first and avoid this mix-up",
    wrong: [
      "Mixing old and new batches together has no real downside",
      "Labelling dried produce is unnecessary extra work with no real benefit",
      "The spoiled batch could not have been identified even with labelling",
    ],
  },
  {
    situation: "a household wants to reduce food wastage but is unsure whether preserving fruits and vegetables is worth the extra effort compared to just eating what can be used fresh",
    correct: "Preserving surplus fruits and vegetables by drying is worth the effort, since it turns produce that would otherwise be wasted into food that can be used later",
    wrong: [
      "Preserving food is never worth the extra time and effort involved",
      "Only fruits, not vegetables, are ever worth preserving by drying",
      "Food wastage cannot be reduced through home preservation methods",
    ],
  },
  {
    situation: "a family is deciding where to store their dried produce: a warm, slightly damp storeroom, or a cool, dry cupboard",
    correct: "Choose the cool, dry cupboard, since a warm, damp storeroom can reintroduce moisture and encourage spoilage even after proper drying",
    wrong: [
      "Storage location makes no difference once produce is fully dried",
      "A warm, damp storeroom is always the better choice for long-term storage",
      "Dried produce cannot spoil again no matter where it is stored",
    ],
  },
  {
    situation: "a farmer is deciding whether to dry produce that is already showing early signs of damage or rot, or only produce that is fully sound",
    correct: "Only dry fully sound, undamaged produce, since existing damage can let spoilage take hold even after drying",
    wrong: [
      "Damaged produce is just as safe to dry and store as sound produce",
      "Drying always fixes any existing damage or early rot completely",
      "It does not matter which produce is chosen for drying, only how it is dried",
    ],
  },
  {
    situation: "a household is choosing whether to check their stored dried produce occasionally or leave it untouched until it is needed",
    correct: "Check stored dried produce occasionally, so any early spoilage can be caught and removed before it spreads to the rest of the batch",
    wrong: [
      "Checking stored produce has no benefit once it has been properly dried",
      "Leaving produce completely untouched is always the safer storage choice",
      "Spoilage cannot occur in dried produce once it has been stored",
    ],
  },
  {
    situation: "a community group is training members on preserving crop produce and debating whether hygiene, such as clean hands and clean equipment, really matters once the produce will be dried anyway",
    correct: "Hygiene still matters, since contamination introduced before or during drying can survive the drying process and affect the stored produce",
    wrong: [
      "Hygiene is unnecessary since the drying process alone makes produce completely safe",
      "Dirty equipment only affects fresh produce, never produce being dried",
      "Handwashing and clean equipment only matter for cooked food, not dried produce",
    ],
  },
];

const EVALUATE_FRAMES: ((rng: RNG, fact: PreserveFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}'s family near ${p} faces this situation: ${fact.situation}. What is the best course of action?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `In a household near ${p}, ${fact.situation}. Which response is most appropriate?`,
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
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a community near ${p}. Which choice actually solves the problem?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `An extension officer visiting ${who}'s household near ${p} finds that ${fact.situation}. What advice fits best?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `Given that ${fact.situation}, what should ${who} prioritise?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const EVALUATE_TEMPLATES = expandScenarios(EVALUATE_FACTS, EVALUATE_FRAMES);

// ---- Fill-blank pool: 30 distinct vocabulary/reasoning sentences. ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "The method of preserving fruits and vegetables using the sun's heat to remove moisture is called ", after: " drying.", correctAnswer: "sun", acceptedAnswers: ["sun"] },
  { before: "Fully dried produce should feel leathery or ", after: ", with no soft, moist spots left.", correctAnswer: "brittle", acceptedAnswers: ["brittle"] },
  { before: "Storing dried produce in a clean, ", after: " container keeps out moisture and pests.", correctAnswer: "airtight", acceptedAnswers: ["airtight"] },
  { before: "A growth sometimes seen on spoiled or poorly stored produce is called ", after: ".", correctAnswer: "mould", acceptedAnswers: ["mould", "mold"] },
  { before: "Covering a drying tray with a fine net protects the produce from dust, flies and ", after: ".", correctAnswer: "insects", acceptedAnswers: ["insects"] },
  { before: "Reducing the amount of food that is thrown away because it spoiled is called reducing food ", after: ".", correctAnswer: "wastage", acceptedAnswers: ["wastage", "waste"] },
  { before: "Writing the date on a container of dried produce is called ", after: " it.", correctAnswer: "labelling", acceptedAnswers: ["labelling", "labeling"] },
  { before: "Drying produce in a thin, single layer helps it dry ", after: " instead of unevenly.", correctAnswer: "evenly", acceptedAnswers: ["evenly"] },
  { before: "The flat surface used to hold produce while it dries in the sun is called a drying ", after: ".", correctAnswer: "tray", acceptedAnswers: ["tray"] },
  { before: "Washing hands and equipment before handling produce for drying is an example of good ", after: ".", correctAnswer: "hygiene", acceptedAnswers: ["hygiene"] },
  { before: "Sun-dried produce can be stored for months because most of its ", after: " has been removed.", correctAnswer: "moisture", acceptedAnswers: ["moisture", "water"] },
  { before: "Produce brought indoors during rain is protected from regaining ", after: ".", correctAnswer: "moisture", acceptedAnswers: ["moisture", "water"] },
  { before: "A tomato that grows from a flower and contains seeds is classified, botanically, as a ", after: ".", correctAnswer: "fruit", acceptedAnswers: ["fruit"] },
  { before: "Kale (sukuma wiki) and cabbage are preserved crop produce that come from the ", after: " of the plant.", correctAnswer: "leaf", acceptedAnswers: ["leaf", "leaves"] },
  { before: "Carrots and beetroot are preserved crop produce that come from the ", after: " of the plant.", correctAnswer: "root", acceptedAnswers: ["root"] },
  { before: "A cauliflower is an unusual vegetable because the part eaten is actually the plant's ", after: ".", correctAnswer: "flower", acceptedAnswers: ["flower"] },
  { before: "Onions and garlic are preserved crop produce that grow as a ", after: ".", correctAnswer: "bulb", acceptedAnswers: ["bulb"] },
  { before: "Groundnuts and peas are preserved crop produce that develop as a ", after: " inside a pod.", correctAnswer: "seed", acceptedAnswers: ["seed"] },
  { before: "Storing dried produce in a cool, dry place instead of a warm, damp one helps prevent ", after: ".", correctAnswer: "spoilage", acceptedAnswers: ["spoilage"] },
  { before: "Dust or dirt introduced onto produce during drying is a form of ", after: ".", correctAnswer: "contamination", acceptedAnswers: ["contamination"] },
  { before: "The length of time stored dried produce stays safe to eat is called its shelf ", after: ".", correctAnswer: "life", acceptedAnswers: ["life"] },
  { before: "Turning drying produce regularly helps prevent moist patches from being left ", after: ".", correctAnswer: "underdried", acceptedAnswers: ["underdried", "moist"] },
  { before: "Checking stored dried produce occasionally for mould or pests is part of good food ", after: ".", correctAnswer: "storage", acceptedAnswers: ["storage"] },
  { before: "Only produce that is fresh and free from damage should be selected for ", after: ".", correctAnswer: "drying", acceptedAnswers: ["drying"] },
  { before: "A household that dries surplus vegetables instead of letting them spoil is practising food ", after: ".", correctAnswer: "security", acceptedAnswers: ["security"] },
  { before: "Honest, hygienic and safe preservation methods reflect the value of ", after: ".", correctAnswer: "integrity", acceptedAnswers: ["integrity"] },
  { before: "Piling produce in thick, overlapping layers on a tray causes it to dry ", after: " rather than evenly.", correctAnswer: "unevenly", acceptedAnswers: ["unevenly"] },
  { before: "Produce dried and then stored in an open basket is at greater risk from moisture and ", after: ".", correctAnswer: "pests", acceptedAnswers: ["pests"] },
  { before: "Slicing produce into thin, even pieces before drying helps it dry ", after: " and more evenly.", correctAnswer: "faster", acceptedAnswers: ["faster", "quicker"] },
  { before: "The overall goal of preserving crop produce at home is to reduce food wastage and improve food ", after: ".", correctAnswer: "security", acceptedAnswers: ["security"] },
];

const PARTS_MATCH_PROMPTS = [
  "Match each preserved crop produce to the part of the plant it comes from.",
  "Pair each crop produce with the plant part it comes from.",
  "Connect each produce item to the part of the plant it develops from.",
  "Match each item below to the correct plant part.",
  "Link each preserved crop produce to the plant part that produces it.",
  "Match each produce to its correct plant part.",
];

const PRACTICE_SORT_PROMPTS = [
  "Sort each practice as hygienic and safe or as poor practice when preserving crop produce.",
  "Decide whether each practice is hygienic and safe or poor when preserving produce, and sort it.",
  "Group these practices under whether they are hygienic/safe or poor practice.",
  "Read each practice and sort it as hygienic and safe or as poor practice.",
  "Place each practice into the correct bucket: hygienic and safe, or poor practice.",
  "Sort these preservation practices by whether they are hygienic and safe or risky.",
];

const DRYING_ORDER_PROMPTS = [
  "Arrange the steps for preserving fruits or vegetables by sun-drying in the correct order.",
  "Put these sun-drying steps into the right sequence.",
  "Sequence the steps for sun-drying produce correctly.",
  "Arrange these steps in the order a household would actually carry them out.",
  "Order these sun-drying steps from first to last.",
  "Sort these steps into the correct order for preserving crop produce by sun-drying.",
];

const PRACTICE_CHOICE_PROMPTS = [
  "Which of these practices is hygienic and safe when preserving crop produce?",
  "Which practice below is hygienic and safe when preserving crop produce?",
  "Choose the practice that is hygienic and safe for preserving produce.",
  "Which of these actions is the hygienic, safe choice when preserving crop produce?",
  "Pick the practice that is hygienic and safe when drying and storing produce.",
  "Which option here reflects hygienic and safe preservation?",
];

const DATA_HOOK_PROMPTS = [
  "Using the chart, roughly how many times longer does the sun-dried produce last compared to the fresh produce? (Give a whole number.)",
  "Look at the chart. About how many times longer does sun-dried produce last than fresh produce? (Give a whole number.)",
  "Based on the chart, roughly how many times longer is the shelf life of sun-dried produce than fresh produce? (Give a whole number.)",
  "Study the chart and work out roughly how many times longer sun-dried produce lasts compared to fresh. (Give a whole number.)",
  "From the chart, about how many times longer does sun-drying extend the produce's shelf life? (Give a whole number.)",
];

const VOCAB_FILL_BLANK_PROMPTS = [
  "Complete the sentence about preserving crop produce.",
  "Fill in the missing word about preserving crop produce.",
  "Complete this sentence about sun-drying and preservation.",
  "Supply the missing word in this sentence about preserving crop produce.",
  "Fill in the blank to complete the fact about preserving crop produce.",
  "Complete the missing word in this statement about crop preservation.",
];

export const preservingCropProducts: Skill = {
  id: "g6-ag-f-preserving-crop-products",
  code: "F.2",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-food-production",
  grade: 6,
  title: "Preserving Crop Products",
  description: "Preserving fruits and vegetables at home using the sun-drying method, hygienic and safe preservation practices, and how preservation reduces food wastage and improves food security.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["parts-match", "practice-sort", "drying-order", "reasoning", "evaluate", "practice-choice", "data-hook", "vocab-fill-blank"] as const
    );
    const hint = "Sun-drying removes the moisture that spoilage organisms need to grow, which is why properly dried, well-stored produce lasts so much longer than fresh produce.";

    if (branch === "parts-match") {
      const chosen = shuffle(rng, PRODUCE_PARTS).slice(0, 8);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `t${i}`, label: p.produce })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `t${i}`, label: PART_LABELS[p.part] })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: randChoice(rng, PARTS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what you learnt about parts of a plant in Science — fruit, leaf, root, tuber, bulb, seed or flower.",
        explanation: chosen.map((p) => `${p.produce} comes from the plant's ${PART_LABELS[p.part].toLowerCase()}.`).join(" "),
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
          { id: "good", label: "Hygienic and safe" },
          { id: "poor", label: "Poor practice" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "good" ? "hygienic and safe" : "poor practice"}.`).join(" "),
      };
    }

    if (branch === "drying-order") {
      const shuffled = shuffle(rng, DRYING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, DRYING_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: DRYING_STEPS.map((s) => s.id),
        hint: "Prepare and cut the produce first, dry it in the sun while turning and protecting it, then check, store and keep it properly.",
        explanation: DRYING_STEPS.map((s) => s.label).join(" → "),
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

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Weigh up which choice actually prevents spoilage and food wastage in this specific situation.",
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
        explanation: `"${correct}" is correct because it keeps the produce clean and properly dried. The other options risk contamination or spoilage.`,
      };
    }

    if (branch === "data-hook") {
      const freshSpoilDays = randInt(rng, 2, 5);
      const driedShelfMonths = randInt(rng, 4, 12);
      const driedShelfDays = driedShelfMonths * 30;
      const ratio = Math.round(driedShelfDays / freshSpoilDays);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, DATA_HOOK_PROMPTS),
        visual: {
          type: "bar-chart",
          data: [
            { label: "Fresh (undried)", value: freshSpoilDays },
            { label: "Sun-dried", value: driedShelfDays },
          ],
        },
        before: "",
        after: " times longer.",
        correctAnswer: String(ratio),
        acceptedAnswers: [String(ratio)],
        inputMode: "numeric",
        hint: `Fresh produce lasts about ${freshSpoilDays} days before spoiling. Sun-dried produce lasts about ${driedShelfMonths} months (${driedShelfDays} days). Divide the dried shelf life by the fresh shelf life.`,
        explanation: `Fresh produce spoils in about ${freshSpoilDays} days, while sun-dried produce lasts about ${driedShelfMonths} months (${driedShelfDays} days) — that is roughly ${ratio} times longer, because drying removes the moisture spoilage organisms need.`,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, VOCAB_FILL_BLANK_PROMPTS),
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
