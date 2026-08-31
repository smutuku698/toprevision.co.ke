import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 2.2 Uses of Domestic Animals — an explicit, closed 8-animal list (bees,
// rabbits, camels, fish, pigs, donkeys, dogs, cats) and their DIRECT (food product) or INDIRECT (support role)
// contribution to food production; the rubric/learning-experience explicitly requires relating contributions
// of ALL 8 named animals, not a sample. See curriculum-reference/grade-5/agriculture.json.
//
// Kind-variety note: this sub-strand's content is a closed 8-item use/relate list with no genuine sequence or
// spatial/diagram angle, so it caps at 4 QuestionKinds (categorize, click-match, multiple-choice, fill-blank) —
// inventing an "ordering" sequence for this content would violate the project's own rule against inventing an
// order the curriculum doesn't state (see SKILL-QUALITY-STANDARDS.md's ordering guidance).

const ANIMALS = [
  { id: "bees", label: "Bees", use: "Produce honey, a valuable food and source of income", role: "direct" },
  { id: "rabbits", label: "Rabbits", use: "Reared for their meat, a source of protein", role: "direct" },
  { id: "camels", label: "Camels", use: "Provide milk and meat, especially in drier parts of Kenya", role: "direct" },
  { id: "fish", label: "Fish", use: "A major direct source of food and protein from fish farming", role: "direct" },
  { id: "pigs", label: "Pigs", use: "Reared for their meat (pork), a source of protein and income", role: "direct" },
  { id: "donkeys", label: "Donkeys", use: "Provide draught power, carrying farm produce and water to support food production", role: "indirect" },
  { id: "dogs", label: "Dogs", use: "Guard farms, livestock and stored food from thieves and predators", role: "indirect" },
  { id: "cats", label: "Cats", use: "Control rats and mice that would otherwise damage stored grain and food", role: "indirect" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps a beehive at the edge of the family farm. What food-production benefit does this bring?`,
      correct: "Honey, a valuable food that can also be sold for income",
      wrong: ["Milk, since bees are milked like cattle", "Draught labour for pulling farm carts", "Guarding the farm against thieves"],
      explanation: "Bees produce honey — a direct food product and a source of income, one of the 8 named domestic animals' contributions.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} rears camels in a dry part of ${place(rng)} because they cope well with limited water. What do the camels directly provide for food production?`,
    correct: "Milk and meat",
    wrong: ["Wool for clothing only", "Eggs for the family table", "Guarding services for the homestead"],
    explanation: "Camels provide milk and meat, making them especially valuable in drier areas where other livestock struggle.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps a cat in the store where maize is kept after harvest. How does the cat support food production, even though it produces no food itself?`,
      correct: "It controls rats and mice that would otherwise damage or eat the stored grain",
      wrong: ["The cat produces milk that is added to the family's diet", "The cat pulls a cart to transport the maize to market", "The cat has no real connection to food production at all"],
      explanation: "Cats support food production indirectly by controlling pests that would otherwise damage stored food — not every useful animal produces food directly.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} uses a donkey to carry harvested produce from a distant field back to the homestead. Is this a direct or indirect contribution to food production?`,
    correct: "Indirect — the donkey doesn't produce food itself, but its labour supports getting food from field to home",
    wrong: ["Direct — the donkey itself is eaten as food", "Direct — the donkey produces milk used as food", "Neither — this has no connection to food production"],
    explanation: "A donkey's draught labour supports food production indirectly, by helping move produce, rather than by being a food product itself.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} rears pigs on a small farm and later sells some for meat. What kind of contribution to food production is this?`,
      correct: "Direct — pigs are reared and sold as a source of meat (protein)",
      wrong: ["Indirect — pigs only guard the farm", "Indirect — pigs only pull carts", "Neither — pigs have no food production use"],
      explanation: "Pigs are reared directly as a source of meat, a direct food-production contribution, distinct from a support-role animal like a dog or donkey.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} keeps a dog that barks and alerts them whenever someone approaches their chicken coop at night. How does this support food production?`,
    correct: "It helps protect livestock and stored food from theft or predators, an indirect support role",
    wrong: ["The dog is a direct source of food itself", "The dog produces eggs that the family eats", "This has no connection to food production"],
    explanation: "A guard dog's role is an indirect support to food production — protecting food resources rather than being one.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} runs a small fish pond in ${place(rng)}, harvesting fish regularly to eat and sell. Which of the 8 named domestic animals is being used here, and how?`,
      correct: "Fish, providing a direct source of food and protein through fish farming",
      wrong: ["Rabbits, providing wool for the family", "Camels, providing draught labour for the pond", "Dogs, guarding the fish pond only"],
      explanation: "Fish farming is a direct source of food and protein — one of the 8 explicitly named domestic animals in this sub-strand.",
    };
  },
  (rng) => ({
    prompt: `A household in ${place(rng)} rears rabbits in hutches behind the house, mainly to eat the meat and occasionally sell extra rabbits. What kind of contribution is this?`,
    correct: "Direct — rabbits are reared specifically for meat, a source of protein",
    wrong: ["Indirect — rabbits only guard the compound", "Indirect — rabbits only control pests", "Neither — rabbits have no food-production role"],
    explanation: "Rabbits are reared directly for meat, making this a direct contribution to food production, just like pigs, camels and fish.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} explains in a class presentation in ${place(rng)} that some of the 8 named domestic animals give food directly, while others help food production happen without being food themselves. Which pair correctly matches one of each kind?`,
      correct: "Bees (direct — honey) and donkeys (indirect — draught labour)",
      wrong: ["Bees (indirect) and pigs (indirect)", "Dogs (direct) and cats (direct)", "Camels (indirect) and fish (indirect)"],
      explanation: "Bees produce honey directly, while donkeys support food production indirectly through labour — one correct example of each kind of contribution.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} is asked to relate the contributions of ALL 8 named domestic animals to food production, not just a few. Why does the sub-strand emphasise covering every one?`,
    correct: "Because each of the 8 animals contributes in a genuinely different way, some directly and some indirectly, and missing any leaves the picture incomplete",
    wrong: ["Because only the animals that produce food directly actually matter", "Because all 8 animals contribute in exactly the same way", "Because the specific animals named don't actually matter, only the general idea does"],
    explanation: "The design explicitly asks learners to relate contributions of ALL the scoped animals — bees, rabbits, camels, fish, pigs, donkeys, dogs and cats each contribute differently, directly or indirectly.",
  }),
];

export const usesOfDomesticAnimals: Skill = {
  id: "g5-ag-food-production-uses-of-domestic-animals",
  code: "FPP.2",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-food-production",
  grade: 5,
  title: "Uses of domestic animals",
  description: "The direct (food-producing) and indirect (support-role) contributions of 8 named domestic animals — bees, rabbits, camels, fish, pigs, donkeys, dogs and cats — to food production.",
  generate(rng) {
    const branch = randChoice(rng, ["animal-use-match", "direct-indirect-categorize", "reasoning", "fill-blank"] as const);

    if (branch === "animal-use-match") {
      const chosen = shuffle(rng, ANIMALS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.use })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "domestic animal to its use in food production"),
        tokens,
        targets,
        correctMap,
        hint: "Some animals give food directly; others support food production without being food themselves.",
        explanation: chosen.map((a) => `${a.label} — ${a.use}.`).join(" "),
      };
    }

    if (branch === "direct-indirect-categorize") {
      const items = ANIMALS.map((a) => ({ id: a.id, label: a.label }));
      const correctBucket: Record<string, string> = {};
      for (const a of ANIMALS) correctBucket[a.id] = a.role;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the animal contributes directly (as food) or indirectly (supporting food production)"),
        items: shuffle(rng, items),
        buckets: [
          { id: "direct", label: "Direct — a food product" },
          { id: "indirect", label: "Indirect — supports food production" },
        ],
        correctBucket,
        hint: "Ask: is the animal itself eaten or does it give milk/eggs/honey, or does it help in another way (labour, guarding, pest control)?",
        explanation: ANIMALS.map((a) => `${a.label} contributes ${a.role === "direct" ? "directly, as a food product" : "indirectly, supporting food production"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Bees are kept mainly for the ", after: " they produce.", correctAnswer: "honey" },
      { before: "Camels provide milk and meat, especially in ", after: " parts of Kenya.", correctAnswer: "drier", alsoAccept: ["dry"] },
      { before: "Fish farming is a direct source of food and ", after: ".", correctAnswer: "protein" },
      { before: "Rabbits and pigs are both reared mainly for their ", after: ".", correctAnswer: "meat" },
      { before: "Donkeys support food production indirectly by providing draught ", after: ".", correctAnswer: "labour", alsoAccept: ["power"] },
      { before: "Dogs support food production indirectly by ", after: " farms, livestock and stored food.", correctAnswer: "guarding", alsoAccept: ["protecting"] },
      { before: "Cats support food production indirectly by controlling rats and ", after: " that damage stored grain.", correctAnswer: "mice" },
      { before: "The 8 named domestic animals in this sub-strand are bees, rabbits, camels, fish, pigs, donkeys, dogs and ", after: ".", correctAnswer: "cats" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about all 8 named domestic animals and whether each gives food directly or helps indirectly.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
