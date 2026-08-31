import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture F.4 "Cooking Food — Baking (rubbing-in method)" (the second half of
// source sub-strand "2.3 Cooking Food — Stewing, Baking (rubbing-in method)", split per the
// Grade-6 "split into deeper skills" rule; see cookingByStewing.ts for the stewing half). The
// source's "Link to other learning area" explicitly connects measuring ingredients for baking to
// measurement of weights in Mathematics — the "scale-recipe" branch below is that sanctioned
// cross-link, using simple whole-number ratios appropriate to Grade 6 numeracy.

const RUBBING_IN_STEPS = [
  { id: "measure-sieve", label: "Measure and sieve the dry ingredients", detail: "Measure the flour and sieve it with the baking powder and a pinch of salt into a mixing bowl, to remove lumps and add air" },
  { id: "cut-fat", label: "Cut the fat into small pieces", detail: "Cut the margarine or butter into small pieces so it mixes into the flour more easily" },
  { id: "add-fat", label: "Add the fat to the flour", detail: "Add the small pieces of fat into the bowl of sieved flour" },
  { id: "rub-in", label: "Rub the fat into the flour", detail: "Using the fingertips, lightly rub the fat into the flour, lifting the hands to add air, until the mixture looks like fine breadcrumbs" },
  { id: "add-sugar", label: "Add sugar, if needed", detail: "Stir in sugar for a sweet item such as scones, mixing it evenly through the crumb-like mixture" },
  { id: "add-liquid", label: "Add liquid gradually", detail: "Add milk or beaten egg a little at a time, mixing gently until the ingredients just come together into a soft dough" },
  { id: "knead-lightly", label: "Knead lightly", detail: "Knead the dough briefly and lightly — overworking it makes the baked item tough rather than light" },
  { id: "shape-roll", label: "Shape or roll out the dough", detail: "Roll or pat the dough out to the right thickness and cut it into the desired shapes" },
  { id: "place-tray", label: "Place on a greased tray", detail: "Place the shaped dough onto a lightly greased baking tray, spaced apart" },
  { id: "bake", label: "Bake in a preheated oven", detail: "Bake in an oven that has already been heated to the correct temperature" },
  { id: "test-cooked", label: "Test that it is cooked", detail: "Check that the item is golden brown and a skewer inserted into it comes out clean" },
  { id: "cool-rack", label: "Cool on a wire rack", detail: "Remove from the oven and let the baked item cool on a wire rack before serving" },
] as const;

const SAFE_PRACTICES = [
  "Using oven gloves or a thick cloth to remove a hot tray from the oven",
  "Washing hands thoroughly before rubbing fat into flour with the fingertips",
  "Keeping the oven door closed as much as possible while baking to keep the heat even",
  "Placing a hot baking tray on a heatproof surface, not directly on a bare table",
  "Checking that the oven is fully preheated before placing the dough inside",
  "Keeping loose sleeves rolled up and hair tied back while working with dough",
  "Spacing items apart on the tray so they do not stick together as they bake",
  "Using a clean, dry cloth to wipe up any spilled flour on the floor promptly",
  "Letting a baked item cool on a rack before touching it with bare hands",
  "Cleaning the mixing bowl and utensils before they are used for a different ingredient",
  "Not overcrowding the oven, so hot air can circulate evenly around each item",
  "Checking a recipe's measurements carefully before starting to bake",
  "Turning off the oven once baking is finished, rather than leaving it on",
  "Keeping young children away from the open oven door while it is hot",
  "Testing doneness with a skewer instead of cutting into the item while still very hot",
  "Storing the cooled baked items in a clean, covered container",
] as const;

const UNSAFE_PRACTICES = [
  "Removing a hot tray from the oven with bare hands instead of oven gloves",
  "Leaving the oven door open for a long time while baking, letting heat escape unevenly",
  "Placing a very hot tray directly onto a plastic tablecloth",
  "Putting dough into an oven that has not been preheated at all",
  "Rubbing fat into flour with dirty, unwashed hands",
  "Overcrowding the tray so items merge together and bake unevenly",
  "Leaving spilled flour on the kitchen floor, creating a slipping hazard",
  "Touching a freshly baked item straight from the oven with bare fingers",
  "Guessing the flour and fat amounts instead of measuring them",
  "Leaving the oven switched on and unattended long after baking has finished",
  "Letting a young child stand right at an open, hot oven door",
  "Cutting into a hot baked item immediately to check if it is cooked, risking a burn",
  "Reusing the same unwashed bowl for raw dough and then a completely different food",
  "Wearing loose, dangling sleeves while reaching into a hot oven",
  "Stacking hot trays directly on top of each other straight out of the oven",
  "Ignoring a recipe's stated oven temperature and guessing instead",
] as const;

const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "fat rubbed lightly into flour with the fingertips produces a soft, crumbly baked item, while fat that is overworked or melted into the flour produces a tough, heavy one",
    correct: "Light rubbing keeps tiny pockets of fat coating the flour, which melt during baking and create a soft, crumbly texture, while overworking melts the fat too early and loses that effect",
    wrong: [
      "The type of flour used is the only thing that affects texture",
      "Overworking the fat always makes a baked item lighter",
      "How the fat is mixed in has no effect on the final texture",
    ],
  },
  {
    situation: "dough kneaded briefly and lightly bakes into a soft item, while the same dough kneaded for a long time bakes into something noticeably tougher",
    correct: "Overworking a rubbed-in dough develops it too much, which makes the finished baked item dense and tough instead of light",
    wrong: [
      "Kneading longer always makes a baked item softer",
      "Kneading time has no effect on a rubbed-in dough",
      "Tougher baked items always come from using too much sugar",
    ],
  },
  {
    situation: "a baking tray placed in a fully preheated oven bakes evenly, while the same tray placed in a cold oven that is still heating up bakes unevenly",
    correct: "A preheated oven gives a steady, correct temperature from the very start, while a still-heating oven changes temperature partway through baking",
    wrong: [
      "Oven temperature has no real effect on how evenly food bakes",
      "A cold, still-heating oven always bakes food faster",
      "Preheating only matters for very large ovens, never small ones",
    ],
  },
  {
    situation: "items spaced apart on a baking tray come out with an evenly browned surface all around, while items crowded close together stick and brown unevenly",
    correct: "Spacing lets hot air circulate freely around each piece, while crowded items block air from reaching each other's sides",
    wrong: [
      "Spacing on the tray has no effect on browning",
      "Crowding items together always bakes them faster and better",
      "Only the oven's temperature setting affects browning, never spacing",
    ],
  },
  {
    situation: "a recipe followed with carefully measured flour and fat produces a consistent result each time, while guessing the amounts produces a different result every time",
    correct: "Baking depends on a fairly precise balance of flour, fat and liquid, so accurate measuring gives a consistent, reliable result",
    wrong: [
      "Measuring ingredients for baking is only a matter of habit, not necessity",
      "Guessing amounts always produces the same result as measuring",
      "Only the oven temperature affects consistency, never the measured amounts",
    ],
  },
  {
    situation: "a tray removed from a hot oven with bare hands results in a burn, while the same tray removed with oven gloves does not",
    correct: "A hot metal tray transfers heat straight into bare skin, while oven gloves insulate the hand from that heat",
    wrong: [
      "Oven gloves make no real difference to how much heat reaches the hand",
      "Bare hands are actually safer because they grip better",
      "Burns from hot trays only happen if the oven was set too high",
    ],
  },
  {
    situation: "a baked item tested with a clean skewer that comes out clean is ready, while one tested with a skewer that comes out with wet dough on it is not yet fully baked",
    correct: "Wet dough clinging to the skewer shows the inside is still uncooked, even if the outside already looks golden brown",
    wrong: [
      "A skewer test only checks colour, never doneness inside",
      "Wet dough on a skewer means the item is baked perfectly",
      "The outside colour alone is always a reliable sign the inside is cooked too",
    ],
  },
  {
    situation: "flour sieved with the baking powder before mixing produces a lighter baked item than flour that is not sieved at all",
    correct: "Sieving breaks up lumps and mixes the baking powder evenly through the flour, and also adds air, both of which help the item rise more evenly",
    wrong: [
      "Sieving flour has no effect on how a baked item turns out",
      "Sieving only matters for how the flour looks, never how it bakes",
      "Baking powder works the same whether or not it is mixed in evenly",
    ],
  },
  {
    situation: "a baked scone cooled on a wire rack keeps a crisp base, while one left to cool directly on a flat plate goes soft and slightly damp underneath",
    correct: "A wire rack lets air circulate underneath the item so steam escapes, while a flat plate traps steam against the base and softens it",
    wrong: [
      "Cooling location never affects the texture of a baked item",
      "A flat plate always keeps a baked item crisper than a wire rack",
      "Only the baking time affects whether the base stays crisp",
    ],
  },
  {
    situation: "a scone recipe doubled in quantity needs the flour and fat amounts doubled too, or the item does not turn out right",
    correct: "Baking relies on a balanced ratio between ingredients, so scaling a recipe up or down means scaling every measured ingredient by the same amount",
    wrong: [
      "Only the flour amount needs to change when a recipe is scaled",
      "Recipe amounts do not matter as long as the oven temperature stays the same",
      "Scaling a recipe up never changes how much of each ingredient is needed",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who}, baking scones at home in ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `In a Home Science lesson near ${p}, learners notice that ${fact.situation}. What explains this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `While using the rubbing-in method to bake, ${who} observes that ${fact.situation}. What is the best explanation?`,
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
      prompt: `While comparing two baking trays near ${p}, ${who} works out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "The rubbing-in method involves rubbing fat into flour with the ", after: " until it resembles breadcrumbs.", correctAnswer: "fingertips", acceptedAnswers: ["fingertips", "fingers"] },
  { before: "Before rubbing in the fat, flour is usually ", after: " with the baking powder to remove lumps and add air.", correctAnswer: "sieved", acceptedAnswers: ["sieved"] },
  { before: "Rubbed-in flour and fat should look like fine ", after: " before liquid is added.", correctAnswer: "breadcrumbs", acceptedAnswers: ["breadcrumbs"] },
  { before: "Liquid such as milk or egg should be added ", after: " rather than all at once, until a soft dough forms.", correctAnswer: "gradually", acceptedAnswers: ["gradually", "little by little"] },
  { before: "A rubbed-in dough should be kneaded lightly, since overworking it makes the baked item ", after: " instead of soft.", correctAnswer: "tough", acceptedAnswers: ["tough", "heavy"] },
  { before: "Baked items should be placed on a lightly ", after: " tray before going into the oven.", correctAnswer: "greased", acceptedAnswers: ["greased"] },
  { before: "An oven should be fully ", after: " before dough is placed inside for baking.", correctAnswer: "preheated", acceptedAnswers: ["preheated"] },
  { before: "Spacing items apart on the tray lets hot air ", after: " evenly around each one.", correctAnswer: "circulate", acceptedAnswers: ["circulate"] },
  { before: "A clean skewer coming out of a baked item shows that it is fully ", after: ".", correctAnswer: "cooked", acceptedAnswers: ["cooked", "done"] },
  { before: "Baked items should cool on a wire ", after: " so steam can escape from underneath.", correctAnswer: "rack", acceptedAnswers: ["rack"] },
  { before: "A hot baking tray should always be removed from the oven using oven ", after: ", never bare hands.", correctAnswer: "gloves", acceptedAnswers: ["gloves"] },
  { before: "Measuring ingredients for baking accurately connects directly to the measurement of ", after: " learnt in Mathematics.", correctAnswer: "weights", acceptedAnswers: ["weights", "weight"] },
  { before: "Baking depends on a fairly precise balance between flour, fat and ", after: ".", correctAnswer: "liquid", acceptedAnswers: ["liquid"] },
  { before: "Fat should be cut into small ", after: " before being added to the flour.", correctAnswer: "pieces", acceptedAnswers: ["pieces"] },
  { before: "If a recipe is doubled, every measured ingredient should also be ", after: " to keep the same balance.", correctAnswer: "doubled", acceptedAnswers: ["doubled"] },
  { before: "Sugar is stirred into the rubbed-in mixture only when making a ", after: " item, such as scones.", correctAnswer: "sweet", acceptedAnswers: ["sweet"] },
  { before: "A hot tray should be placed on a heatproof surface, never directly on a ", after: " table.", correctAnswer: "bare", acceptedAnswers: ["bare", "plastic"] },
  { before: "Baked goods left to cool on a flat plate can go soft underneath because trapped ", after: " softens the base.", correctAnswer: "steam", acceptedAnswers: ["steam"] },
  { before: "Overcrowding an oven blocks hot air from reaching each item ", after: ".", correctAnswer: "evenly", acceptedAnswers: ["evenly"] },
  { before: "Hands should be washed before rubbing fat into flour to keep the process ", after: ".", correctAnswer: "hygienic", acceptedAnswers: ["hygienic"] },
  { before: "Common items made using the rubbing-in method include scones and ", after: ".", correctAnswer: "biscuits", acceptedAnswers: ["biscuits"] },
  { before: "The oven should be switched ", after: " once baking is finished, rather than left running.", correctAnswer: "off", acceptedAnswers: ["off"] },
  { before: "A dough that is not overworked keeps small pockets of fat that melt while baking and make the item ", after: ".", correctAnswer: "light", acceptedAnswers: ["light", "crumbly", "soft"] },
  { before: "Baking uses dry heat inside an oven, while stewing cooks food slowly in ", after: ".", correctAnswer: "liquid", acceptedAnswers: ["liquid"] },
  { before: "Cutting into a very hot baked item straight away risks a ", after: ".", correctAnswer: "burn", acceptedAnswers: ["burn"] },
  { before: "Reading a recipe's stated oven temperature carefully, rather than guessing, gives a more reliable ", after: ".", correctAnswer: "result", acceptedAnswers: ["result"] },
  { before: "Rolling or patting the dough out to the right thickness comes before it is cut into ", after: ".", correctAnswer: "shapes", acceptedAnswers: ["shapes"] },
  { before: "Loose sleeves should be rolled up before reaching into a hot ", after: ".", correctAnswer: "oven", acceptedAnswers: ["oven"] },
  { before: "Utensils and bowls used for raw dough should be cleaned before use with a different ", after: ".", correctAnswer: "ingredient", acceptedAnswers: ["ingredient", "food"] },
  { before: "Careful measuring and following the correct baking sequence together make the rubbing-in method ", after: " and safe.", correctAnswer: "reliable", acceptedAnswers: ["reliable", "consistent"] },
];

const STEPS_MATCH_PROMPTS = [
  "Match each rubbing-in baking step to what it involves.",
  "Pair each baking step with what it actually means to do.",
  "Connect each step of the rubbing-in method to its description.",
  "Match each stage of the baking process to what it involves.",
  "Link each rubbing-in step to the description that fits it.",
  "Match each step below to the correct explanation of what it involves.",
];

const STEPS_ORDER_PROMPTS = [
  "Arrange the steps of the rubbing-in baking method in the correct order.",
  "Put these rubbing-in baking steps into the right sequence.",
  "Sequence the steps of the rubbing-in method correctly.",
  "Arrange these steps in the order a baker would actually carry them out.",
  "Order these baking steps from first to last.",
  "Sort these steps into the correct order for baking by the rubbing-in method.",
];

const SAFETY_SORT_PROMPTS = [
  "Sort each kitchen practice as safe or unsafe while baking.",
  "Decide whether each practice is safe or unsafe while baking, and sort it.",
  "Group these kitchen practices under whether they are safe or unsafe.",
  "Read each practice and sort it as safe or unsafe while baking.",
  "Place each practice into the correct bucket: safe or unsafe.",
  "Sort these baking-time practices by whether they are safe or risky.",
];

const SCALE_RECIPE_PROMPT_TEMPLATES = [
  (flourPer: number, baseServings: number, newServings: number) =>
    `A scone recipe uses ${flourPer}g of flour to make ${baseServings} scones. How many grams of flour are needed to make ${newServings} scones, keeping the same ratio?`,
  (flourPer: number, baseServings: number, newServings: number) =>
    `${flourPer}g of flour makes ${baseServings} scones in a recipe. Keeping the same ratio, how many grams of flour are needed for ${newServings} scones?`,
  (flourPer: number, baseServings: number, newServings: number) =>
    `A recipe needs ${flourPer}g of flour for ${baseServings} scones. Scaling up to ${newServings} scones, how many grams of flour are needed?`,
  (flourPer: number, baseServings: number, newServings: number) =>
    `To make ${baseServings} scones, a recipe uses ${flourPer}g of flour. How much flour, in grams, is needed to make ${newServings} scones at the same ratio?`,
  (flourPer: number, baseServings: number, newServings: number) =>
    `Work out the flour needed: a recipe uses ${flourPer}g for ${baseServings} scones, and you want to make ${newServings} scones at the same ratio.`,
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about baking by the rubbing-in method.",
  "Fill in the missing word about baking by the rubbing-in method.",
  "Complete this sentence about the rubbing-in baking method.",
  "Supply the missing word in this sentence about baking.",
  "Fill in the blank to complete the fact about the rubbing-in method.",
  "Complete the missing word in this statement about baking.",
];

export const cookingByBaking: Skill = {
  id: "g6-ag-f-cooking-by-baking",
  code: "F.4",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-food-production",
  grade: 6,
  title: "Cooking Food — Baking (Rubbing-In Method)",
  description: "Baking using the rubbing-in method — the sequence of steps, oven safety and hygiene, and measuring ingredients accurately (linked to weight measurement in Mathematics).",
  generate(rng) {
    const branch = randChoice(rng, ["steps-match", "steps-order", "safety-sort", "reasoning", "scale-recipe", "fill-blank"] as const);
    const hint = "The rubbing-in method means working fat into flour with the fingertips until it looks like breadcrumbs, before adding liquid to form a dough.";

    if (branch === "steps-match") {
      const tokens = shuffle(rng, RUBBING_IN_STEPS.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, RUBBING_IN_STEPS.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of RUBBING_IN_STEPS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, STEPS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: RUBBING_IN_STEPS.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, RUBBING_IN_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: RUBBING_IN_STEPS.map((s) => s.id),
        hint: "Prepare and rub in the dry ingredients first, then add liquid, shape the dough, bake, test, and finally cool it.",
        explanation: RUBBING_IN_STEPS.map((s) => s.label).join(" → "),
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

    if (branch === "scale-recipe") {
      // Sanctioned cross-link: measuring ingredients for baking relates to weight measurement
      // in Mathematics. A simple whole-number ratio, appropriate to Grade 6 numeracy.
      const baseServings = randChoice(rng, [4, 6, 8] as const);
      const flourPer = randChoice(rng, [50, 60, 75, 100] as const);
      const multiplier = randInt(rng, 2, 4);
      const newServings = baseServings * multiplier;
      const newFlour = flourPer * multiplier;
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, SCALE_RECIPE_PROMPT_TEMPLATES)(flourPer, baseServings, newServings),
        before: "",
        after: "g of flour.",
        correctAnswer: String(newFlour),
        acceptedAnswers: [String(newFlour)],
        inputMode: "numeric",
        hint: `${newServings} scones is ${multiplier} times as many as ${baseServings}, so the flour must also be scaled up by ${multiplier} times.`,
        explanation: `${flourPer}g makes ${baseServings} scones, so for ${newServings} scones (${multiplier} times as many) you need ${flourPer} × ${multiplier} = ${newFlour}g of flour — every ingredient must scale by the same amount, matching weight measurement learnt in Mathematics.`,
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
