import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 1.2 Invertebrates — the economic-importance half (food,
// pollination, soil aeration, pests, transmission of diseases), split from invertebrateIdentification.ts for
// depth. The sub-strand's Core Competencies box names "Critical thinking and problem solving" explicitly, so
// per RIGOR-STANDARDS.md this skill must include at least one Analyze-or-Evaluate-tier branch, not just recall.

const IMPORTANCE_FACTS = [
  { text: "Bees carry pollen from flower to flower, helping crops such as sunflowers and beans produce more seed and fruit", category: "pollination" },
  { text: "Butterflies visit flowers for nectar and help pollinate many wild and garden plants along the way", category: "pollination" },
  { text: "Without pollinating insects, many fruit trees would produce far less fruit each season", category: "pollination" },
  { text: "Earthworms burrow through soil, creating tiny tunnels that let air and water reach plant roots", category: "soil-aeration" },
  { text: "Termites tunnel through soil and dead wood, which helps mix and aerate the earth in some ecosystems", category: "soil-aeration" },
  { text: "Millipedes help break down and mix decaying leaves into the topsoil as they feed and burrow", category: "soil-aeration" },
  { text: "Edible insects such as termites and grasshoppers are eaten as a source of protein in parts of Kenya", category: "food" },
  { text: "Crabs, prawns and other sea invertebrates are caught and sold as seafood in coastal markets", category: "food" },
  { text: "Snails are farmed and eaten as a food source in some regions", category: "food" },
  { text: "Locusts can swarm in huge numbers and strip a farmer's entire crop of leaves within hours", category: "pest" },
  { text: "Aphids suck sap from young plants, weakening growth and reducing crop yields", category: "pest" },
  { text: "Termites that invade wooden furniture or house frames can cause serious structural damage", category: "pest" },
  { text: "Weevils can destroy stored grain such as maize and beans in a granary", category: "pest" },
  { text: "Mosquitoes can transmit malaria-causing parasites when they bite a person", category: "disease" },
  { text: "Houseflies can carry disease-causing germs from waste onto food they land on", category: "disease" },
  { text: "Ticks can transmit disease-causing organisms to both livestock and people when they bite", category: "disease" },
] as const;

const ROLE_PAIRS = [
  { id: "bee", label: "Bee", role: "Pollinates flowers, helping crops produce more seed and fruit" },
  { id: "earthworm", label: "Earthworm", role: "Aerates the soil by burrowing tunnels through it" },
  { id: "locust", label: "Locust", role: "Acts as a pest by swarming and stripping crops of their leaves" },
  { id: "mosquito", label: "Mosquito", role: "Transmits the parasite that causes malaria through its bite" },
  { id: "termite-food", label: "Edible termite", role: "Provides a source of food and protein for people" },
  { id: "silkworm", label: "Silkworm", role: "Produces silk thread, an economically valuable material" },
  { id: "tick", label: "Tick", role: "Transmits disease-causing organisms to livestock and people through its bite" },
  { id: "weevil", label: "Weevil", role: "Destroys stored grain such as maize and beans in a granary" },
  { id: "aphid", label: "Aphid", role: "Weakens crops by sucking sap from young plants" },
  { id: "housefly", label: "Housefly", role: "Carries disease-causing germs from waste onto food it lands on" },
  { id: "crab", label: "Crab", role: "Is caught and sold as a food source in coastal markets" },
  { id: "millipede", label: "Millipede", role: "Helps break down and mix decaying leaves into the topsoil" },
] as const;

// Visual-bearing recall/apply facts, reusing the "invertebrate" VisualSpec drawn for invertebrateIdentification.ts
// so this skill (which is about economic importance, not identification) still carries genuine SVG coverage.
const VISUAL_ROLE_FACTS = [
  { kind: "worm" as const, label: "Earthworm", correct: "Aerating the soil as it burrows through it", wrong: ["Pollinating nearby flowers", "Transmitting disease when it bites", "Producing silk thread for income"] },
  { kind: "crab" as const, label: "Crab", correct: "Being caught and sold as a food source in coastal markets", wrong: ["Aerating soil on farmland", "Transmitting malaria to people", "Pollinating coastal plants"] },
  { kind: "spider" as const, label: "A close relative of ticks and mites", correct: "Ticks in this group can transmit disease-causing organisms to livestock and people", wrong: ["This whole group only pollinates flowers", "This whole group is farmed only for food", "This whole group only aerates soil"] },
  { kind: "millipede-centipede" as const, label: "Millipede", correct: "Helping break down and mix decaying leaves into the topsoil", wrong: ["Transmitting malaria through its bite", "Producing silk thread for income", "Being farmed as seafood"] },
  { kind: "snail-slug" as const, label: "Snail", correct: "Being farmed and eaten as a food source in some regions", wrong: ["Aerating soil as its main role", "Pollinating flowers as it moves", "Transmitting disease through its shell"] },
] as const;

const RESPONSE_STEPS = [
  { id: "d1", label: "Identify which invertebrate is present and what it is doing" },
  { id: "d2", label: "Check whether it is a helpful invertebrate (like a pollinator) as well as a possible pest" },
  { id: "d3", label: "Choose a response that targets only the harmful invertebrate, not helpful ones nearby" },
  { id: "d4", label: "Carry out the chosen response carefully and safely" },
  { id: "d5", label: "Monitor the results and adjust the response if needed" },
] as const;

const KENYAN_PLACES = ["Kitui", "Bomet", "Siaya", "Marsabit", "Lamu", "Nyamira", "Kilifi", "Vihiga", "Migori", "Turkana", "Baringo", "Embu"] as const;
const KENYAN_NAMES = ["Wafula", "Chepkoech", "Njeri", "Abdi", "Loise", "Kimutai", "Sarah", "Otieno", "Mumbi", "Hassan", "Purity", "Wekesa"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps beehives beside a bean farm near ${place(rng)}. Why does having bees nearby often increase how much bean crop the farm produces?`,
      correct: "Bees pollinate the bean flowers as they collect nectar, helping more pods and seeds form",
      wrong: ["Bees add nutrients to the soil through their honey", "Bees frighten away birds that would otherwise eat the seeds", "Bees loosen the soil around the bean plants as they fly"],
      explanation: "Bees pollinate flowers while feeding on nectar, and this pollination is essential for many crops — including beans — to produce a good yield of seed.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} notices that soil under a compost heap full of earthworms is looser and drains water better than the hard soil nearby. What are the earthworms doing to cause this?`,
    correct: "Burrowing through the soil, creating tiny air and water channels as they move",
    wrong: ["Releasing a chemical that dissolves soil particles", "Eating the soil completely and leaving empty space behind", "Attracting rainfall to that specific spot"],
    explanation: "As earthworms tunnel through soil, they physically loosen and aerate it, letting air and water reach plant roots more easily.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} stores harvested maize in a granary in ${place(rng)} but finds weevils have damaged much of it months later. What kind of economic importance of invertebrates does this show?`,
      correct: "A harmful one — weevils acting as pests that destroy stored food and reduce farm income",
      wrong: ["A helpful one — weevils pollinating the stored maize", "A helpful one — weevils aerating the maize store", "A neutral one — weevils have no economic effect on stored grain"],
      explanation: "Weevils damaging stored grain is a clear example of invertebrates acting as pests, causing economic loss rather than benefit.",
    };
  },
  (rng) => ({
    prompt: `A health worker in ${place(rng)} teaches families to sleep under mosquito nets. Which economic and health importance of invertebrates is this precaution addressing?`,
    correct: "Mosquitoes transmitting malaria-causing parasites through their bites",
    wrong: ["Mosquitoes pollinating night-blooming flowers", "Mosquitoes helping aerate damp soil near water", "Mosquitoes being farmed as a food source"],
    explanation: "Mosquito nets are used specifically to prevent mosquito bites, which can transmit the parasites that cause malaria.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} regularly eats roasted termites and grasshoppers during the rainy season. What economic importance of invertebrates does this show?`,
      correct: "Invertebrates as a source of food and protein",
      wrong: ["Invertebrates as pollinators of crops", "Invertebrates transmitting disease", "Invertebrates aerating the soil"],
      explanation: "Eating termites and grasshoppers is a direct example of invertebrates being used as a food source.",
    };
  },
  (rng) => ({
    prompt: `A swarm of locusts sweeps across farmland near ${place(rng)} and strips crops bare within a few hours. Why are locusts considered one of the most damaging invertebrate pests?`,
    correct: "They gather in huge swarms and can destroy an entire season's crop very quickly",
    wrong: ["They only eat a few leaves before moving on, causing little damage", "They mainly damage soil rather than crops", "They transmit diseases to humans but do not harm crops"],
    explanation: "Locust swarms can contain enormous numbers of insects that strip fields of vegetation extremely quickly, making them a severe economic threat to farmers.",
  }),
  (rng) => ({
    prompt: `A carpenter in ${place(rng)} discovers termites have hollowed out a wooden roof beam in a house. What kind of importance of invertebrates does this show?`,
    correct: "A harmful one — termites acting as pests that damage buildings and property",
    wrong: ["A helpful one — termites aerating the wood for better strength", "A helpful one — termites pollinating the roof structure", "A neutral one — termites eating wood has no economic cost"],
    explanation: "While termites can be helpful for aerating soil, termites that attack wooden structures cause real economic damage as pests.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} runs a small silk-production business near ${place(rng)}, farming silkworms to harvest silk thread. What economic importance of invertebrates does this rely on?`,
      correct: "Invertebrates providing a valuable raw material that can be sold for income",
      wrong: ["Invertebrates pollinating mulberry flowers", "Invertebrates transmitting disease to silkworms", "Invertebrates aerating the soil around mulberry trees"],
      explanation: "Silkworms are farmed specifically because they produce silk thread, a material with real economic value once harvested and sold.",
    };
  },
  (rng) => ({
    prompt: `A tick attaches itself to a cow grazing near ${place(rng)} and the farmer notices the cow becomes unwell soon after. What is the most likely explanation?`,
    correct: "The tick transmitted a disease-causing organism to the cow through its bite",
    wrong: ["The tick pollinated the cow's skin, causing irritation", "The tick aerated the cow's skin, which weakened it", "Ticks cannot make animals unwell at all"],
    explanation: "Ticks are known to transmit disease-causing organisms to the animals and people they bite, which can make the host unwell.",
  }),
  (rng) => ({
    prompt: `${name(rng)} notices aphids clustered on the young shoots of a vegetable crop near ${place(rng)}, and the plants begin to wilt. What are the aphids doing to the crop?`,
    correct: "Sucking sap from the young plants, which weakens growth and can reduce yield",
    wrong: ["Pollinating the young shoots, which should help the crop grow faster", "Aerating the stem, which should strengthen the plant", "Nothing — aphids do not affect plant growth"],
    explanation: "Aphids feed by sucking sap directly from plants, which weakens growth and can significantly reduce a farmer's harvest if left unmanaged.",
  }),
];

const EVALUATE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `A farmer near ${place(rng)} sees locusts damaging a maize crop and wants to spray a strong pesticide across the whole farm immediately, including the flowering bean patch nearby where bees are actively pollinating. What is the wiser decision, and why?`,
    correct: "Target the pesticide only at the locust-affected area and avoid spraying the flowering beans, protecting the pollinating bees the farm also depends on",
    wrong: ["Spray the whole farm at once, since killing more insects is always better for the crop", "Do nothing at all, since pesticide use is never justified", "Only spray the bean patch, since bees are more dangerous than locusts"],
    explanation: "Invertebrates are not all pests — bees provide essential pollination the farm also depends on. A careful farmer weighs the harm from locusts against the benefit of pollinators before deciding where and how to act.",
  }),
  (rng) => ({
    prompt: `A community in ${place(rng)} wants to reduce mosquito-borne disease. One group suggests draining every pond and wetland in the area to remove mosquito breeding sites; another warns this would also destroy habitats many other useful invertebrates and animals depend on. What is the better balanced approach?`,
    correct: "Target mosquito breeding sites specifically (e.g. covering stagnant water, using nets) rather than destroying whole wetland ecosystems",
    wrong: ["Drain all wetlands regardless of other effects, since stopping disease matters more than anything else", "Ignore mosquito control completely to protect the wetland", "Fill in only wetlands that produce no mosquitoes at all, since none can be identified this way"],
    explanation: "Effective pest and disease control targets the specific problem (mosquito breeding) rather than destroying entire ecosystems that also support pollinators, food sources and soil-improving invertebrates.",
  }),
  (rng) => ({
    prompt: `A grain store owner in ${place(rng)} finds weevils damaging stored maize. Fumigating with chemicals will kill the weevils but is costly and must be done carefully to keep the grain safe to eat. What is the most sensible first step?`,
    correct: "Properly dry and seal the grain in weevil-proof storage, using chemical treatment only if needed and by a trained handler",
    wrong: ["Immediately burn the entire store of grain to be safe", "Ignore the weevils, since a few pests never really affect stored food", "Add more moisture to the grain to discourage the weevils"],
    explanation: "Good storage practice (drying and sealing grain properly) prevents most weevil damage in the first place; chemical treatment, when genuinely needed, should be handled carefully and by someone trained, since it affects food safety.",
  }),
  (rng) => ({
    prompt: `A school garden club in ${place(rng)} debates whether to remove all earthworms and millipedes they find while digging new beds, believing all invertebrates found in soil are harmful pests. Is this belief correct?`,
    correct: "No — earthworms and millipedes actually help aerate soil and break down decaying matter, which benefits the garden rather than harming it",
    wrong: ["Yes — every invertebrate found in garden soil is harmful and should be removed", "Yes, but only millipedes are harmful; earthworms should also be removed as a precaution", "No, because no invertebrate found in soil can ever be harmful under any circumstances"],
    explanation: "Not all invertebrates are pests — earthworms and millipedes genuinely improve soil health, so a wise gardener distinguishes helpful soil invertebrates from crop-damaging ones instead of removing everything found.",
  }),
  (rng) => ({
    prompt: `A vegetable farmer near ${place(rng)} sees a small number of ladybird-like insects near an aphid outbreak on the crop and wants to spray pesticide immediately to kill everything. A neighbour points out that some insects actually eat aphids and could help control them naturally. What is the smarter first step?`,
    correct: "Identify whether the insects are natural aphid predators before spraying, since killing them could remove a free, ongoing form of pest control",
    wrong: ["Spray immediately regardless of what the insects are, since all insects near a pest outbreak are harmful", "Wait and do nothing at all, even if the aphids are clearly damaging the crop", "Assume all small insects near aphids must also be pests without checking"],
    explanation: "Some invertebrates naturally prey on crop pests. A farmer who checks first, rather than spraying indiscriminately, can protect helpful predator insects that provide pest control for free.",
  }),
];

export const invertebrateImportance: Skill = {
  id: "g6-sci-lte-invertebrate-importance",
  code: "LTE.2b",
  subjectId: "science",
  strandId: "g6-sci-lte",
  grade: 6,
  title: "Economic importance of invertebrates",
  description: "The economic importance of invertebrates — food, pollination, soil aeration, pests and transmission of diseases — including weighing harm against benefit when deciding how to respond to invertebrates in real farming and community situations.",
  generate(rng) {
    const branch = randChoice(rng, ["importance-categorize", "helpful-harmful-sort", "role-match", "visual-role-identify", "response-order", "reasoning", "evaluate", "fill-blank"] as const);

    if (branch === "importance-categorize") {
      const chosen = shuffle(rng, IMPORTANCE_FACTS).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      const IMPORTANCE_PROMPTS = [
        "Sort each fact by the kind of economic importance of invertebrates it describes.",
        "Decide which kind of importance each fact below is describing, then sort it.",
        "Read each fact about invertebrates and sort it by the kind of importance it shows.",
        "Group these facts about invertebrates by the kind of importance each one describes.",
        "For each fact, decide whether it's about food, pollination, soil, pests or disease, then sort it.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, IMPORTANCE_PROMPTS),
        items,
        buckets: [
          { id: "food", label: "Food" },
          { id: "pollination", label: "Pollination" },
          { id: "soil-aeration", label: "Soil aeration" },
          { id: "pest", label: "Pest damage" },
          { id: "disease", label: "Disease transmission" },
        ],
        correctBucket,
        hint: "Ask: does this fact describe eating, pollinating flowers, loosening soil, damaging crops/property, or spreading illness?",
        explanation: chosen.map((f) => `"${f.text}" is about ${f.category.replace("-", " ")}.`).join(" "),
      };
    }

    if (branch === "helpful-harmful-sort") {
      const chosen = shuffle(rng, IMPORTANCE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `h${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`h${i}`] = f.category === "pest" || f.category === "disease" ? "harmful" : "helpful"));
      const HELPFUL_HARMFUL_PROMPTS = [
        "Sort each fact as describing a helpful or a harmful effect of invertebrates.",
        "Decide whether each fact below describes a helpful or a harmful invertebrate effect.",
        "Is each fact about a helpful invertebrate effect or a harmful one? Sort it below.",
        "Read each fact and sort it as either helpful or harmful.",
        "Group these invertebrate facts into helpful effects and harmful effects.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, HELPFUL_HARMFUL_PROMPTS),
        items,
        buckets: [
          { id: "helpful", label: "Helpful" },
          { id: "harmful", label: "Harmful" },
        ],
        correctBucket,
        hint: "Pollination, food and soil aeration are helpful; pests and disease transmission are harmful.",
        explanation: chosen
          .map((f) => `"${f.text}" is ${f.category === "pest" || f.category === "disease" ? "harmful" : "helpful"}.`)
          .join(" "),
      };
    }

    if (branch === "role-match") {
      const chosen = shuffle(rng, ROLE_PAIRS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.label })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.role })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      const ROLE_MATCH_PROMPTS = [
        "Match each invertebrate to its main economic role.",
        "Which economic role does each invertebrate below play? Match them up.",
        "Pair each invertebrate with the role it plays for people or crops.",
        "Match each invertebrate to how it affects people, crops or animals.",
        "Connect each invertebrate below with its main economic importance.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, ROLE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about food, pollination, soil aeration, pests and disease.",
        explanation: chosen.map((r) => `${r.label} — ${r.role}.`).join(" "),
      };
    }

    if (branch === "visual-role-identify") {
      const f = randChoice(rng, VISUAL_ROLE_FACTS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, f.correct, [...f.wrong], 3);
      return {
        kind: "multiple-choice",
        prompt: `Look at this invertebrate (${f.label}). What is one of its most important economic roles?`,
        visual: { type: "invertebrate", kind: f.kind },
        choices,
        correctIndex,
        layout: "list",
        explanation: `${f.label}: ${f.correct}.`,
      };
    }

    if (branch === "response-order") {
      const shuffled = shuffle(rng, RESPONSE_STEPS);
      const RESPONSE_ORDER_PROMPTS = [
        "Put these steps for responsibly responding to an invertebrate pest problem in the correct order.",
        "Arrange these steps for dealing responsibly with an invertebrate pest problem in the right order.",
        "Place these pest-response steps in the order you would actually carry them out.",
        "Order these steps for responding to an invertebrate pest problem, from first to last.",
        "Sort these pest-response steps into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, RESPONSE_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: RESPONSE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Identify first, check for helpful invertebrates nearby, then act carefully and monitor.",
        explanation: "Correct order: " + RESPONSE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Bees and butterflies help crops produce more fruit and seed through ", after: ".", correctAnswer: "pollination" },
      { before: "Earthworms improve soil by creating tunnels that let in air and ", after: ".", correctAnswer: "water" },
      { before: "Termites, grasshoppers and other edible insects can be eaten as a source of ", after: " in some communities.", correctAnswer: "protein" },
      { before: "A large swarm of crop-eating invertebrates that can destroy a whole field quickly is a ", after: ".", correctAnswer: "locust swarm" },
      { before: "Weevils that destroy stored maize and beans are considered ", after: " of stored grain.", correctAnswer: "pests" },
      { before: "Mosquitoes can transmit the parasite that causes ", after: " through their bite.", correctAnswer: "malaria" },
      { before: "Ticks can transmit disease-causing organisms to both livestock and ", after: ".", correctAnswer: "people" },
      { before: "Silkworms are farmed to produce silk thread, an economically valuable ", after: ".", correctAnswer: "material" },
      { before: "Aphids weaken plants by sucking ", after: " from young shoots.", correctAnswer: "sap" },
      { before: "Not every invertebrate found in soil is harmful — earthworms and millipedes actually ", after: " the soil.", correctAnswer: "aerate" },
      { before: "Before spraying pesticide widely, a careful farmer checks whether nearby insects are pests or helpful ", after: ".", correctAnswer: "pollinators" },
      { before: "Houseflies can spread disease-causing germs after landing on ", after: ".", correctAnswer: "waste" },
      { before: "Crabs and prawns caught and sold in coastal markets show invertebrates' importance as ", after: ".", correctAnswer: "food" },
      { before: "Termites damaging a wooden roof beam show invertebrates acting as ", after: " rather than helpers.", correctAnswer: "pests" },
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
      hint: "Think about food, pollination, soil aeration, pests and disease transmission.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
