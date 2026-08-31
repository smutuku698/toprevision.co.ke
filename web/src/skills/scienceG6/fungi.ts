import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 1.1 Fungi — names exactly 5 common fungi (mushroom,
// toadstool, puff ball, yeast, mould) and 4 categories of economic importance (food, fermentation, health,
// medicine). Scientific names and food-processing mechanism detail are explicitly excluded by the design.

const FUNGI = [
  { id: "mushroom", label: "Mushroom", desc: "An edible fungus with a soft cap and gills underneath, often found growing in grass or on decaying wood" },
  { id: "toadstool", label: "Toadstool", desc: "A cap-and-stem fungus that looks like a mushroom but is often brightly coloured and poisonous if eaten" },
  { id: "puffball", label: "Puff ball", desc: "A round, ball-shaped fungus that releases a cloud of powdery spores from a hole when squeezed or hit by rain" },
  { id: "yeast", label: "Yeast", desc: "A microscopic, single-celled fungus too small to see without a microscope, used to make bread rise" },
  { id: "mould", label: "Mould", desc: "A fuzzy, often green, black or white fungus that grows in fluffy patches on old bread, fruit or other damp food" },
] as const;

const IMPORTANCE_FACTS = [
  { text: "Mushrooms are cooked and eaten as a source of food in many Kenyan households", category: "food" },
  { text: "Some wild mushrooms are collected and sold fresh in local markets as a food crop", category: "food" },
  { text: "Edible mushrooms are grown commercially in mushroom farms as a business", category: "food" },
  { text: "Mushrooms add flavour and nutrients to soups, stews and vegetable dishes", category: "food" },
  { text: "Yeast is added to dough so that bread and mandazi rise before baking", category: "fermentation" },
  { text: "Yeast ferments sugar in grapes and other fruit to produce wine", category: "fermentation" },
  { text: "Yeast is used in brewing to ferment grain into beer and traditional brews such as busaa", category: "fermentation" },
  { text: "Fermentation by yeast produces the gas that makes chapati and mandazi dough puffy and light", category: "fermentation" },
  { text: "Yeast is grown and sold commercially as an ingredient for bakeries and home bakers", category: "fermentation" },
  { text: "Some fungi are grown to produce antibiotics that treat bacterial infections", category: "health" },
  { text: "Penicillin, one of the first antibiotic medicines, was discovered from a mould", category: "medicine" },
  { text: "Certain fungi are used by pharmaceutical companies to manufacture life-saving medicines", category: "medicine" },
  { text: "Scientists study fungi to discover new medicines that fight disease-causing microorganisms", category: "medicine" },
  { text: "Some traditional healers use extracts from certain fungi in herbal remedies", category: "health" },
  { text: "Selling cultivated mushrooms and yeast products creates income and jobs for farmers and traders", category: "economy" },
  { text: "Mushroom farming is a growing small-business opportunity in many parts of Kenya", category: "economy" },
  { text: "Fungi help break down dead plants and animals, recycling nutrients back into the soil", category: "nature" },
  { text: "Fungi living on plant roots help many trees and crops absorb water and nutrients more easily", category: "nature" },
] as const;

const SAFETY_SCENARIOS = [
  { desc: "A learner finds a wild mushroom in the school compound and eats it straight away to see what it tastes like.", isSafe: false, why: "Never eat a wild fungus without an expert confirming it is safe — many toadstools look similar to edible mushrooms but are poisonous." },
  { desc: "A learner sees green mould growing on a piece of bread and throws the whole loaf away instead of eating around it.", isSafe: true, why: "Mouldy food should be discarded completely and safely, since the fungus can spread invisible threads through food that looks unaffected." },
  { desc: "A learner grows mould on a piece of bread for a class activity, then opens the container and sniffs it closely to compare smells.", isSafe: false, why: "Mould spores can be breathed in and irritate the airways — a covered container should only be observed through its side or lid, not opened and sniffed directly." },
  { desc: "After finishing the mould-growing activity, a learner disposes of the food sample in a sealed bag in the bin rather than leaving it open on a desk.", isSafe: true, why: "Sealing and safely disposing of fungus samples after an activity stops spores from spreading around the classroom." },
  { desc: "A learner picks up a puffball fungus outdoors and squeezes it hard right next to a friend's face to watch the spore cloud burst out.", isSafe: false, why: "Puffball spore clouds should not be aimed at another person or breathed in directly — spores can irritate the eyes and airway." },
  { desc: "A learner washes their hands thoroughly with soap after handling wild fungi found during a nature walk.", isSafe: true, why: "Washing hands after touching wild fungi removes spores and any substances that could be irritating or harmful." },
] as const;

const MOULD_EXPERIMENT_STEPS = [
  { id: "s1", label: "Choose a food material, such as a slice of bread" },
  { id: "s2", label: "Dampen the food slightly and place it inside a clear, clean container" },
  { id: "s3", label: "Cover the container loosely and leave it in a warm place for several days" },
  { id: "s4", label: "Observe the container daily without opening it, and record any changes" },
  { id: "s5", label: "Once mould has grown, share and discuss the findings with peers" },
  { id: "s6", label: "Safely dispose of the mouldy sample in a sealed bag without touching the mould" },
] as const;

const KENYAN_PLACES = ["Kisumu", "Nakuru", "Meru", "Kakamega", "Eldoret", "Nyeri", "Kitale", "Nairobi", "Machakos", "Kericho", "Bungoma", "Kiambu"] as const;
const KENYAN_NAMES = ["Achieng", "Brian", "Cherono", "Diana", "Erick", "Fauzia", "Gideon", "Halima", "Ian", "Joyce", "Kiptoo", "Lucy"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s mother is baking bread in ${place(rng)} and adds a small packet of yeast to the dough before leaving it to rest. Why does she do this?`,
      correct: "Yeast ferments sugar in the dough and produces gas, which makes the dough rise",
      wrong: ["Yeast makes the dough taste sweeter without changing its size", "Yeast kills bacteria in the flour", "Yeast changes the colour of the bread from white to brown"],
      explanation: "As yeast ferments the sugars in dough, it releases gas bubbles that get trapped inside, making the dough rise and become light and soft when baked.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} sells fresh mushrooms at the local market every week. Which named importance of fungi does this best show?`,
    correct: "Fungi as a source of food and income",
    wrong: ["Fungi used in making antibiotics", "Fungi breaking down dead plants in the soil", "Fungi helping tree roots absorb water"],
    explanation: "Selling mushrooms as food shows fungi's importance both as a food source and as a way of earning income — an economic importance of fungi.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} opens the fridge in ${place(rng)} and finds a orange left over from last week now covered in fuzzy blue-green patches. What should ${who} do, and why?`,
      correct: "Throw the whole orange away, because mould can spread unseen threads through food even where it doesn't look affected",
      wrong: ["Cut off only the fuzzy patch and eat the rest, since the inside is unaffected", "Wash the orange well and eat it as normal", "Leave it in the fridge, since cold air will kill the mould completely"],
      explanation: "Mould sends fine threads through food that are often invisible, so food showing visible mould should be discarded entirely rather than trimmed and eaten.",
    };
  },
  (rng) => ({
    prompt: `A doctor in ${place(rng)} prescribes an antibiotic medicine to treat a patient's bacterial infection. What does this medicine's discovery owe to fungi?`,
    correct: "The first antibiotic, penicillin, was discovered from a mould, and fungi are still used today to help produce medicines",
    wrong: ["Antibiotics are made entirely from mushroom caps eaten as food", "Fungi have no connection to how antibiotic medicines are made", "Antibiotics come only from yeast used in baking"],
    explanation: "Penicillin — one of the first and most important antibiotics — was discovered from a mould, showing how fungi contribute to modern medicine.",
  }),
  (rng) => ({
    prompt: `A farmer near ${place(rng)} notices that fallen leaves and dead branches in the forest slowly disappear over many months. Fungi growing on this decaying material are playing what role?`,
    correct: "Breaking down dead plant material and returning nutrients to the soil",
    wrong: ["Producing oxygen for the surrounding trees", "Attracting insects that pollinate nearby flowers", "Storing rainwater for the dry season"],
    explanation: "Fungi help decompose dead plant and animal matter, recycling nutrients back into the soil so new plants can use them — an important role in nature.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is setting up a mould-growing activity for class in ${place(rng)}, using a slice of damp bread in a covered, clear container. Why does ${who} cover the container instead of leaving it open?`,
      correct: "Covering the container keeps mould spores from spreading into the classroom while still letting the class observe growth through the clear sides",
      wrong: ["Covering the container speeds up how the bread dries out", "Covering the container stops mould from growing at all", "Covering the container makes the bread taste better afterwards"],
      explanation: "A loosely covered, clear container lets learners safely watch mould develop over several days without spores escaping into the air.",
    };
  },
  (rng) => ({
    prompt: `A small business in ${place(rng)} grows oyster mushrooms in bags of treated sawdust and sells them weekly. Which two importances of fungi does this business rely on together?`,
    correct: "Fungi as food and fungi as a source of income",
    wrong: ["Fungi as medicine and fungi as fermentation agents", "Fungi decomposing waste and fungi helping tree roots", "Fungi causing disease and fungi spoiling food"],
    explanation: "A mushroom farm relies on fungi being edible (food) and being sellable for profit (economic importance/income) at the same time.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is making traditional busaa in ${place(rng)} by fermenting cooked grain. Which fungus is doing the essential work in this process?`,
      correct: "Yeast",
      wrong: ["Mushroom", "Puff ball", "Toadstool"],
      explanation: "Yeast ferments the sugars in grain, producing alcohol and gas — the fungus responsible for fermenting traditional brews such as busaa.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} sees a bright red, spotted fungus growing under a tree and remembers being warned never to touch or eat unfamiliar wild fungi. What kind of fungus is this warning most likely about?`,
    correct: "Toadstool",
    wrong: ["Mushroom", "Yeast", "Puff ball"],
    explanation: "Toadstools often have bright, eye-catching colours and can be poisonous — the classic 'do not touch or eat' warning about wild fungi.",
  }),
  (rng) => ({
    prompt: `${name(rng)} kicks a round, white ball-shaped fungus in a field near ${place(rng)} and a cloud of fine brown dust puffs out of a hole at its top. What is this dust?`,
    correct: "Spores, which the puff ball releases to reproduce",
    wrong: ["Pollen collected from nearby flowers", "Soil dust that got trapped inside the fungus", "Smoke from the fungus decaying"],
    explanation: "A puff ball fungus releases a cloud of tiny spores through an opening when disturbed — this is how it reproduces and spreads.",
  }),
  (rng) => ({
    prompt: `A school in ${place(rng)} plants a hospital tree seedling and later finds pale threads of fungus wrapped closely around its roots. What is this fungus most likely doing?`,
    correct: "Helping the roots absorb water and nutrients from the soil more easily",
    wrong: ["Slowly poisoning the tree so it eventually dies", "Producing extra oxygen that the tree breathes at night", "Turning the tree's roots into a food source for pests"],
    explanation: "Many fungi form a close, helpful relationship with plant roots, helping the plant take up water and nutrients — one of fungi's roles in nature.",
  }),
];

export const fungi: Skill = {
  id: "g6-sci-lte-fungi",
  code: "LTE.1",
  subjectId: "science",
  strandId: "g6-sci-lte",
  grade: 6,
  title: "Fungi",
  description: "Identifying common fungi (mushroom, toadstool, puff ball, yeast, mould) and their importance in nature and the economy (food, fermentation, health and medicine), including safe handling and disposal.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify-fungus", "type-description-match", "importance-categorize", "mould-experiment-order", "safety-evaluate", "reasoning", "fill-blank"] as const
    );

    if (branch === "identify-fungus") {
      const target = randChoice(rng, FUNGI);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, FUNGI.filter((f) => f.id !== target.id).map((f) => f.label), 3);
      const IDENTIFY_PROMPTS = [
        "Identify this common fungus.",
        "Which fungus is shown here?",
        "What is the name of this fungus?",
        "Look at this fungus. What is it called?",
        "Name this common fungus.",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "fungus", kind: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label}. ${target.desc}.`,
      };
    }

    if (branch === "type-description-match") {
      const tokens = shuffle(rng, FUNGI.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FUNGI.map((f) => ({ id: f.id, label: f.desc })));
      const correctMap: Record<string, string> = {};
      for (const f of FUNGI) correctMap[f.id] = f.id;
      const TYPE_MATCH_PROMPTS = [
        "Match each fungus to its description.",
        "Which description belongs to each fungus below? Match them up.",
        "Pair each fungus with the description that fits it.",
        "Match each fungus to how it looks or behaves.",
        "Connect each fungus with its correct description.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TYPE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about size, shape and where each fungus is usually found.",
        explanation: FUNGI.map((f) => `${f.label} — ${f.desc}.`).join(" "),
      };
    }

    if (branch === "importance-categorize") {
      const chosen = shuffle(rng, IMPORTANCE_FACTS).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      const IMPORTANCE_PROMPTS = [
        "Sort each fact by the kind of importance of fungi it describes.",
        "Decide which kind of importance each fact below is describing, then sort it.",
        "Read each fact about fungi and sort it by the kind of importance it shows.",
        "Group these facts about fungi by the kind of importance each one describes.",
        "For each fact, decide whether it's about food, fermentation, health, medicine, economy or nature, then sort it.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, IMPORTANCE_PROMPTS),
        items,
        buckets: [
          { id: "food", label: "Food" },
          { id: "fermentation", label: "Fermentation" },
          { id: "health", label: "Health" },
          { id: "medicine", label: "Medicine" },
          { id: "economy", label: "Economy" },
          { id: "nature", label: "Role in nature" },
        ],
        correctBucket,
        hint: "Think about whether the fact is about eating, brewing/baking, treating illness, earning money, or recycling nutrients.",
        explanation: chosen.map((f) => `"${f.text}" is about ${f.category}.`).join(" "),
      };
    }

    if (branch === "mould-experiment-order") {
      const shuffled = shuffle(rng, MOULD_EXPERIMENT_STEPS);
      const MOULD_ORDER_PROMPTS = [
        "Put the steps of a safe mould-growing class activity in the correct order.",
        "Arrange these steps for a safe mould-growing activity in the right order.",
        "Place these mould-growing steps in the order you would actually carry them out.",
        "Order these steps for growing mould safely, from first to last.",
        "Sort these mould-growing activity steps into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, MOULD_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MOULD_EXPERIMENT_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Start with choosing and preparing the food, and finish with safe disposal.",
        explanation: "Correct order: " + MOULD_EXPERIMENT_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "safety-evaluate") {
      const s = randChoice(rng, SAFETY_SCENARIOS);
      const safeLabel = "Yes, this is safe practice";
      const unsafeLabel = "No, this is not safe practice";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.desc} Is this safe practice when handling fungi?`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        explanation: s.why,
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The single-celled fungus, too small to see without a microscope, that makes bread dough rise is ", after: ".", correctAnswer: "yeast", hint: "Think about what bakers add to dough." },
      { before: "A round, ball-shaped fungus that releases a cloud of spores when disturbed is a ", after: ".", correctAnswer: "puff ball", hint: "Think about the fungus that 'puffs' dust when squeezed." },
      { before: "A fuzzy fungus that grows in green, black or white patches on old bread or fruit is called ", after: ".", correctAnswer: "mould", hint: "Think about what grows on food left too long." },
      { before: "An edible cap-and-stem fungus commonly cooked and eaten as food is a ", after: ".", correctAnswer: "mushroom", hint: "Think about the fungus sold in markets for cooking." },
      { before: "A cap-and-stem fungus that looks like a mushroom but is often poisonous is a ", after: ".", correctAnswer: "toadstool", hint: "Think about the fungus you should never eat without an expert's advice." },
      { before: "The process by which yeast turns sugar into gas and alcohol is called ", after: ".", correctAnswer: "fermentation", hint: "This is the same process used to brew and to make dough rise." },
      { before: "The first antibiotic medicine, discovered from a mould, is called ", after: ".", correctAnswer: "penicillin", hint: "This medicine's name is closely linked to a mould genus." },
      { before: "Fungi that break down dead plants and animals help recycle ", after: " back into the soil.", correctAnswer: "nutrients", hint: "Think about what decomposition returns to the ground." },
      { before: "Mouldy food should always be ", after: " rather than eaten, because mould spreads unseen threads through food.", correctAnswer: "discarded", hint: "Think about the safe thing to do with spoiled food." },
      { before: "The economic importance of fungi includes selling mushrooms for food and yeast for ", after: ".", correctAnswer: "baking", hint: "Think about what yeast is used for in a bakery." },
      { before: "Learners are advised to observe a mould-growing container without ", after: " it, to avoid breathing in spores.", correctAnswer: "opening", hint: "Think about how the container should stay while mould grows." },
      { before: "A fungus should never be eaten from the wild unless it has been confirmed ", after: " by an expert.", correctAnswer: "safe", hint: "Think about the precaution taken before eating any wild fungus." },
      { before: "Yeast is used to ferment grain into traditional brews and also to ferment fruit into ", after: ".", correctAnswer: "wine", hint: "Think about a fermented fruit drink." },
      { before: "Fungi that grow closely around plant roots can help the plant absorb water and ", after: " more easily.", correctAnswer: "nutrients", hint: "Think about what roots take up from the soil." },
      { before: "Scientific names of fungi and the detailed steps of food processing are ", after: " for this level of study.", correctAnswer: "not required", hint: "Think about what the curriculum explicitly excludes at this grade." },
      { before: "Growing mushrooms in bags of treated material as a small business shows fungi's importance to the ", after: ".", correctAnswer: "economy", hint: "Think about income and jobs." },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: fb.hint,
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
