import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture F.3 "Cooking Food — Stewing" (the first half of source sub-strand
// "2.3 Cooking Food — Stewing, Baking (rubbing-in method)", split per the Grade-6 "split into
// deeper skills" rule; see cookingByBaking.ts for the baking half). PCI "Safety of self and
// others while cooking food" is explicitly named in the source, so at least one Evaluate-tier
// safety-judgement branch is mandatory here, not optional.

const STEWING_STEPS = [
  { id: "gather", label: "Gather and prepare ingredients", detail: "Wash the meat, fish or vegetables and cut them into suitable pieces before cooking begins" },
  { id: "heat-oil", label: "Heat a little oil or fat", detail: "Heat a small amount of oil or fat in the sufuria over a moderate flame" },
  { id: "fry-aromatics", label: "Fry onions and tomatoes first", detail: "Fry chopped onions and tomatoes briefly to build the base flavour of the stew" },
  { id: "add-main", label: "Add the main ingredient", detail: "Add the meat, fish or vegetables to the sufuria and stir to coat them in the fried base" },
  { id: "add-liquid", label: "Add liquid", detail: "Add enough water or stock to partly cover the food" },
  { id: "bring-to-boil", label: "Bring to the boil", detail: "Bring the mixture to a boil over a higher flame" },
  { id: "reduce-simmer", label: "Reduce to a simmer", detail: "Lower the heat so the stew simmers gently rather than boiling hard" },
  { id: "cover-cook", label: "Cover and cook slowly", detail: "Cover the sufuria and let the stew cook slowly, stirring occasionally so it does not stick or burn" },
  { id: "season", label: "Season to taste", detail: "Add salt and any spices, tasting and adjusting as the stew nears readiness" },
  { id: "test-serve", label: "Test and serve", detail: "Check that the meat or vegetables are tender and fully cooked, then serve the stew hot" },
] as const;

const SAFE_PRACTICES = [
  "Tying back long hair and rolling up loose sleeves before cooking",
  "Using a dry pot holder or cloth to lift a hot sufuria lid, never a wet one",
  "Keeping the sufuria handle turned inward, away from the edge of the stove",
  "Cutting vegetables and meat on a clean board with the fingers curled away from the blade",
  "Washing hands with soap before starting to cook",
  "Lowering food gently into hot liquid to avoid splashing",
  "Keeping the cooking flame at a steady, controlled height rather than very high",
  "Staying near the stove and checking on a simmering stew regularly rather than leaving it unattended",
  "Turning off the source of heat immediately once the stew is fully cooked",
  "Washing the chopping board and knife separately after cutting raw meat, before using them for anything else",
  "Making sure meat is cooked all the way through before serving, to avoid foodborne illness",
  "Keeping children and pets away from a hot stove while cooking is in progress",
  "Using a separate spoon for tasting rather than the one stirring the pot",
  "Letting a very hot sufuria cool slightly before carrying it to the table",
  "Storing leftover stew in a covered container once it has cooled",
  "Wiping up any spilled liquid on the floor immediately to prevent a slip",
] as const;

const UNSAFE_PRACTICES = [
  "Leaving a pot of simmering stew completely unattended for a long time",
  "Lifting a hot lid with a wet cloth, which can turn to scalding steam instantly",
  "Cutting vegetables while holding them loosely in the air instead of on a board",
  "Leaving the sufuria handle sticking out over the edge of the stove where it can be knocked",
  "Tasting food straight from the main cooking spoon and putting it back in the pot",
  "Serving meat that still looks pink and undercooked in the middle",
  "Using the same board and knife for raw meat and then for ready-to-eat vegetables without washing them",
  "Cooking with long, loose sleeves hanging near an open flame",
  "Rushing to lift a full, very hot sufuria without a pot holder",
  "Letting young children stand right next to a hot, simmering pot unsupervised",
  "Pouring hot liquid from a high distance so it splashes upward",
  "Leaving spilled cooking oil or water on the floor near the stove",
  "Cooking on a flame turned up far higher than needed, causing the stew to spit and splash",
  "Storing hot stew in a sealed container while it is still steaming hot",
  "Walking away from the kitchen with the stove still burning under an empty pot",
  "Adding cold water suddenly to a very hot, nearly-dry sufuria, which can cause dangerous spitting",
] as const;

const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "a stew simmered gently on low heat for a long time comes out with tender meat, while the same meat boiled hard and fast for a short time stays tough",
    correct: "Slow, gentle simmering gives the tough fibres in meat time to soften, while fast hard boiling does not give the same time for tenderising",
    wrong: [
      "Boiling hard always cooks meat faster and more tender than simmering",
      "The type of pot used is the only thing that affects tenderness",
      "Meat tenderness has nothing to do with how it is cooked",
    ],
  },
  {
    situation: "a covered sufuria of stew cooks faster than the same stew left uncovered on the same flame",
    correct: "A cover traps heat and steam inside the pot, keeping the temperature more even and speeding up cooking",
    wrong: [
      "A lid has no effect on cooking speed at all",
      "Covering a pot always makes food cook more slowly",
      "Only the size of the sufuria affects cooking speed, never the lid",
    ],
  },
  {
    situation: "frying onions and tomatoes first, before adding meat, gives the finished stew more flavour than adding everything to cold liquid all at once",
    correct: "Frying the onions and tomatoes first builds a flavourful base that spreads through the stew as the liquid is added",
    wrong: [
      "Frying first has no effect on flavour, only on colour",
      "Adding everything at once always produces the strongest flavour",
      "Flavour in a stew comes only from the salt added at the end",
    ],
  },
  {
    situation: "meat that is not fully cooked through in the middle can make someone who eats it sick, even though the outside looks well cooked",
    correct: "Harmful bacteria inside raw meat are only killed by reaching a high enough temperature all the way through, not just on the surface",
    wrong: [
      "A cooked-looking outside always means the whole piece is safe to eat",
      "Undercooked meat is only a problem for very small children",
      "Cooking meat has no connection to food safety at all",
    ],
  },
  {
    situation: "using the same board and knife for raw meat and then immediately for ready-to-eat vegetables, without washing in between, can make someone sick even though the vegetables were never near the stove",
    correct: "Bacteria from raw meat can transfer onto the board and knife and then onto food that will not be cooked afterwards, a problem called cross-contamination",
    wrong: [
      "Bacteria die instantly once meat is removed from the board",
      "Only meat itself can ever cause food poisoning, never vegetables that touched the same tools",
      "Washing hands is enough on its own, boards and knives never matter",
    ],
  },
  {
    situation: "a pot of stew left simmering unattended boils over and spills liquid onto a hot stove",
    correct: "Nobody was present to notice the liquid rising and lower the heat or stir it in time",
    wrong: [
      "Stews always boil over regardless of whether anyone is watching",
      "Boiling over only happens with very large sufurias",
      "Leaving a pot unattended has no connection to it boiling over",
    ],
  },
  {
    situation: "a cook lifts a hot lid using a dry cloth without injury, while another cook is scalded lifting a similar lid with a wet cloth",
    correct: "A wet cloth conducts heat through to the skin far faster than a dry one, and can also flash into scalding steam",
    wrong: [
      "A wet cloth always protects the hand better than a dry one",
      "The type of cloth used makes no real difference either way",
      "Only the temperature of the lid matters, never the cloth",
    ],
  },
  {
    situation: "stew cooked with the sufuria handle turned inward, away from the stove's edge, is much less likely to be knocked over than one with the handle sticking out",
    correct: "A handle sticking out over the edge is easy to bump into by accident, which can tip the hot pot",
    wrong: [
      "Handle direction has no effect on how easily a pot tips",
      "A handle sticking out actually makes a pot more stable",
      "Only the weight of the stew affects how easily a pot tips",
    ],
  },
  {
    situation: "food left uncovered in the open air for a long time after cooking is more likely to attract flies and dust than food covered soon after cooking",
    correct: "A cover physically blocks flies and dust from settling on the cooked food while it cools or waits to be served",
    wrong: [
      "Flies are never attracted to cooked food, only raw food",
      "Covering food has no effect on hygiene once it is already cooked",
      "Cooked food cannot become contaminated after it leaves the stove",
    ],
  },
  {
    situation: "a stew tasted with the same spoon used for stirring, dipped back into the pot each time, ends up less hygienic than one tasted with a separate spoon each time",
    correct: "Saliva from the mouth transfers onto the tasting spoon and then back into the whole pot of food when it is dipped in again",
    wrong: [
      "Saliva has no effect on food once it returns to a hot pot",
      "Using the same spoon is always the more hygienic choice",
      "Tasting method has nothing to do with hygiene",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, cooking a family meal in ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `In a home kitchen near ${p}, ${fact.situation}. What explains this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `While preparing a stew, ${who} observes that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} is curious to find that ${fact.situation}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a kitchen near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `While comparing two pots of stew near ${p}, ${who} works out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "Stewing is a method of cooking food slowly in a small amount of ", after: ".", correctAnswer: "liquid", acceptedAnswers: ["liquid", "water"] },
  { before: "After bringing a stew to the boil, the heat should be lowered so it ", after: " gently rather than boils hard.", correctAnswer: "simmers", acceptedAnswers: ["simmers"] },
  { before: "Frying onions and tomatoes before adding meat builds up the ", after: " of the finished stew.", correctAnswer: "flavour", acceptedAnswers: ["flavour", "flavor"] },
  { before: "A sufuria of stew should be ", after: " so it traps heat and cooks more evenly.", correctAnswer: "covered", acceptedAnswers: ["covered"] },
  { before: "Meat must be cooked all the way ", after: " to be safe to eat.", correctAnswer: "through", acceptedAnswers: ["through"] },
  { before: "Using the same knife for raw meat and then uncooked vegetables without washing it risks spreading bacteria, a problem called cross-", after: ".", correctAnswer: "contamination", acceptedAnswers: ["contamination"] },
  { before: "A hot sufuria lid should always be lifted with a dry cloth or pot ", after: ", never a wet one.", correctAnswer: "holder", acceptedAnswers: ["holder", "holder or cloth"] },
  { before: "The sufuria handle should be turned inward, away from the stove's ", after: ", so it cannot be knocked.", correctAnswer: "edge", acceptedAnswers: ["edge"] },
  { before: "A simmering stew should never be left completely ", after: " for a long time.", correctAnswer: "unattended", acceptedAnswers: ["unattended"] },
  { before: "Tasting a stew with a separate spoon, rather than the stirring spoon, keeps the pot more ", after: ".", correctAnswer: "hygienic", acceptedAnswers: ["hygienic"] },
  { before: "Stewed foods common in a Kenyan kitchen include meat, beans, and ", after: ".", correctAnswer: "vegetables", acceptedAnswers: ["vegetables"] },
  { before: "Before cutting vegetables or meat, a cook should wash their ", after: " with soap.", correctAnswer: "hands", acceptedAnswers: ["hands"] },
  { before: "Cooking oil or fat is usually heated in the sufuria ", after: " the other ingredients are added.", correctAnswer: "before", acceptedAnswers: ["before"] },
  { before: "Long hair should be tied back and loose sleeves rolled up ", after: " cooking begins.", correctAnswer: "before", acceptedAnswers: ["before"] },
  { before: "Covering cooked stew soon after cooking helps keep out flies and ", after: ".", correctAnswer: "dust", acceptedAnswers: ["dust"] },
  { before: "Salt and spices are usually added and adjusted for taste as the stew nears ", after: ".", correctAnswer: "readiness", acceptedAnswers: ["readiness", "the end", "finished"] },
  { before: "A stew left to boil over onto a hot stove usually happens because it was left ", after: ".", correctAnswer: "unattended", acceptedAnswers: ["unattended", "unwatched"] },
  { before: "Meat that is undercooked in the middle can contain harmful ", after: " even if the outside looks cooked.", correctAnswer: "bacteria", acceptedAnswers: ["bacteria"] },
  { before: "Chopping boards used for raw meat should be washed separately before being used for ", after: " food.", correctAnswer: "ready-to-eat", acceptedAnswers: ["ready-to-eat", "cooked", "other"] },
  { before: "Once a stew is fully cooked, the source of heat should be turned ", after: ".", correctAnswer: "off", acceptedAnswers: ["off"] },
  { before: "A dangerously hot lid conducts heat fastest through a cloth that is ", after: " rather than dry.", correctAnswer: "wet", acceptedAnswers: ["wet"] },
  { before: "Leftover stew should be stored in a covered container once it has ", after: ".", correctAnswer: "cooled", acceptedAnswers: ["cooled"] },
  { before: "Children and pets should be kept away from a hot ", after: " while cooking is in progress.", correctAnswer: "stove", acceptedAnswers: ["stove"] },
  { before: "Pouring hot liquid from too great a height can make it ", after: " upward dangerously.", correctAnswer: "splash", acceptedAnswers: ["splash"] },
  { before: "Stewing typically takes ", after: " to cook than quickly frying the same ingredients.", correctAnswer: "longer", acceptedAnswers: ["longer"] },
  { before: "A very hot, full sufuria should be lifted carefully using a pot holder, never lifted in a ", after: ".", correctAnswer: "rush", acceptedAnswers: ["rush", "hurry"] },
  { before: "Spilled water or oil near the stove should be wiped up immediately to prevent a ", after: ".", correctAnswer: "slip", acceptedAnswers: ["slip", "fall"] },
  { before: "Stirring a simmering stew occasionally helps prevent it from sticking and ", after: " at the bottom of the sufuria.", correctAnswer: "burning", acceptedAnswers: ["burning"] },
  { before: "Serving meat that still looks pink in the middle is a food ", after: " risk.", correctAnswer: "safety", acceptedAnswers: ["safety"] },
  { before: "Good kitchen hygiene and careful handling of heat together make cooking a stew ", after: " for everyone involved.", correctAnswer: "safe", acceptedAnswers: ["safe"] },
];

const STEPS_MATCH_PROMPTS = [
  "Match each stewing step to what it involves.",
  "Pair each stewing step with what it actually means to do.",
  "Connect each step of cooking a stew to its description.",
  "Match each stage of the stewing process to what it involves.",
  "Link each stewing step to the description that fits it.",
  "Match each step below to the correct explanation of what it involves.",
];

const STEPS_ORDER_PROMPTS = [
  "Arrange the steps for cooking a stew in the correct order.",
  "Put these stewing steps into the right sequence.",
  "Sequence the steps for cooking a stew correctly.",
  "Arrange these steps in the order a cook would actually carry them out.",
  "Order these stewing steps from first to last.",
  "Sort these steps into the correct order for cooking a stew.",
];

const SAFETY_SORT_PROMPTS = [
  "Sort each kitchen practice as safe or unsafe while cooking a stew.",
  "Decide whether each practice is safe or unsafe while cooking a stew, and sort it.",
  "Group these kitchen practices under whether they are safe or unsafe.",
  "Read each practice and sort it as safe or unsafe while stewing.",
  "Place each practice into the correct bucket: safe or unsafe.",
  "Sort these stewing-time practices by whether they are safe or risky.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about cooking by stewing.",
  "Fill in the missing word about cooking by stewing.",
  "Complete this sentence about stewing food.",
  "Supply the missing word in this sentence about stewing.",
  "Fill in the blank to complete the fact about cooking by stewing.",
  "Complete the missing word in this statement about stewing.",
];

export const cookingByStewing: Skill = {
  id: "g6-ag-f-cooking-by-stewing",
  code: "F.3",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-food-production",
  grade: 6,
  title: "Cooking Food — Stewing",
  description: "Stewing as a method of cooking food slowly in liquid — the sequence of steps, foods commonly stewed, and safety and hygiene practices while cooking.",
  generate(rng) {
    const branch = randChoice(rng, ["steps-match", "steps-order", "safety-sort", "reasoning", "fill-blank"] as const);
    const hint = "Stewing means cooking food slowly in liquid at a gentle simmer, not a hard boil — safety and hygiene matter at every step.";

    if (branch === "steps-match") {
      const tokens = shuffle(rng, STEWING_STEPS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, STEWING_STEPS.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of STEWING_STEPS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, STEPS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STEWING_STEPS.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, STEWING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: STEWING_STEPS.map((s) => s.id),
        hint: "Prepare ingredients first, build flavour by frying, then add liquid, bring to the boil, simmer slowly, season, and test before serving.",
        explanation: STEWING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "safety-sort") {
      const safe = shuffle(rng, SAFE_PRACTICES).slice(0, 5);
      const unsafe = shuffle(rng, UNSAFE_PRACTICES).slice(0, 5);
      const chosen = shuffle(rng, [
        ...safe.map((text) => ({ text, bucket: "safe" as const })),
        ...unsafe.map((text) => ({ text, bucket: "unsafe" as const })),
      ]);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SAFETY_SORT_PROMPTS),
        items,
        buckets: [
          { id: "safe", label: "Safe practice" },
          { id: "unsafe", label: "Unsafe practice" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "safe" ? "safe" : "unsafe"}.`).join(" "),
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
