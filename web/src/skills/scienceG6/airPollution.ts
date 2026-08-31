import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 2.2 Composition of Air — the pollution half (effects and
// reduction of air pollution), split from airCompositionAndUses.ts. The design's safety note explicitly names
// dust masks, goggles and overcoats as precautions in air-polluted environments, and its project asks learners
// to make posters on pollutants, dangers and solutions — both folded in as curriculum-sanctioned content.

const POLLUTANTS = [
  { text: "Smoke from vehicle exhausts on busy roads", source: "vehicles" },
  { text: "Smoke and fumes released from factory chimneys", source: "industry" },
  { text: "Smoke from burning garbage or plastic waste in the open", source: "burning-waste" },
  { text: "Dust thrown up from unpaved roads and construction sites", source: "dust" },
  { text: "Smoke from cooking fires in poorly ventilated kitchens", source: "cooking-smoke" },
  { text: "Fumes from certain sprays and chemicals used carelessly", source: "chemicals" },
] as const;

const EFFECTS_FACTS = [
  { text: "Polluted air can cause coughing and breathing difficulties in people", category: "health" },
  { text: "Long-term exposure to polluted air can trigger or worsen asthma", category: "health" },
  { text: "Air pollution can irritate the eyes and throat", category: "health" },
  { text: "Polluted air can damage the leaves of plants, reducing crop growth", category: "environment" },
  { text: "Some air pollutants dissolve into rain, making it more acidic and harmful to plants and buildings", category: "environment" },
  { text: "Heavy air pollution can reduce visibility, making roads more dangerous", category: "environment" },
  { text: "Certain gases released by pollution build up in the atmosphere and contribute to climate change", category: "environment" },
  { text: "Air pollution can harm wild animals that breathe the same polluted air", category: "environment" },
  { text: "Breathing polluted air over many years can cause permanent lung damage", category: "health" },
  { text: "Children and elderly people are often more sensitive to the effects of polluted air", category: "health" },
  { text: "Air pollution can leave a layer of grime or soot on buildings and washing lines", category: "environment" },
  { text: "Thick, hazy smog caused by pollution can settle over a city and reduce how far people can see", category: "environment" },
] as const;

const POLLUTANT_SOLUTION_PAIRS = [
  { id: "vehicles", pollutant: "Smoke from heavy vehicle traffic on busy roads", solution: "Walking, cycling or using public transport instead of many single trips" },
  { id: "industry", pollutant: "Smoke and fumes from factory chimneys", solution: "Factories controlling and treating their smoke and fumes before releasing them" },
  { id: "burning-waste", pollutant: "Smoke from burning garbage or plastic in the open", solution: "Disposing of waste properly instead of burning it" },
  { id: "dust", pollutant: "Dust from unpaved roads and construction sites", solution: "Wearing a dust mask and damping down dusty ground with water" },
  { id: "cooking-smoke", pollutant: "Smoke from cooking fires in a poorly ventilated kitchen", solution: "Using a cleaner-burning stove with proper ventilation" },
  { id: "chemicals", pollutant: "Fumes from chemical sprays used carelessly", solution: "Using chemical sprays carefully and only as directed, with good ventilation" },
] as const;

const POSTER_STEPS = [
  { id: "p1", label: "Research and list the common sources of air pollution in the local area" },
  { id: "p2", label: "Note down the dangers and effects of air pollution on health and the environment" },
  { id: "p3", label: "List practical ways of reducing air pollution" },
  { id: "p4", label: "Sketch and design a clear, eye-catching poster layout" },
  { id: "p5", label: "Share and display the finished poster to educate others in the community" },
] as const;

const REDUCTION_METHODS = [
  { text: "Planting more trees, which help clean the air", category: "prevention" },
  { text: "Using public transport, walking or cycling instead of many single-occupant vehicle trips", category: "prevention" },
  { text: "Avoiding burning garbage or plastic waste in the open", category: "prevention" },
  { text: "Using cleaner-burning cookstoves and ensuring good ventilation while cooking", category: "prevention" },
  { text: "Disposing of waste properly instead of burning it", category: "prevention" },
  { text: "Wearing a dust mask when working or travelling in a dusty or smoky environment", category: "protection" },
  { text: "Wearing goggles to protect the eyes in a heavily polluted or dusty area", category: "protection" },
  { text: "Wearing an overcoat to reduce skin contact with polluted air or dust", category: "protection" },
] as const;

const KENYAN_PLACES = ["Nairobi", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Thika", "Naivasha", "Ruiru", "Athi River", "Kericho", "Nyeri", "Machakos"] as const;
const KENYAN_NAMES = ["Peris", "Charles", "Fatma", "Michael", "Esther", "Duncan", "Rehema", "Titus", "Caroline", "Simon", "Immaculate", "Geoffrey"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} walks to school along a busy road in ${place(rng)} every day, next to heavy traffic. What air-quality risk is ${who} most exposed to?`,
      correct: "Vehicle exhaust smoke, a common source of air pollution near busy roads",
      wrong: ["Smoke from cooking fires only, since traffic produces no pollution", "No risk at all, since roads do not affect air quality", "Only dust, since vehicles never release smoke"],
      explanation: "Vehicle exhaust is one of the most common sources of air pollution, especially along busy roads with heavy traffic.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} switches from cooking over an open fire indoors to using a cleaner-burning stove with proper ventilation. Why is this change good for their health?`,
    correct: "It reduces the amount of smoke they breathe in while cooking, which lowers the risk of breathing problems",
    wrong: ["It makes their food cook more slowly, which is healthier", "It has no effect on air quality inside the home", "It increases the smoke produced, which is actually beneficial"],
    explanation: "Poorly ventilated cooking fires can fill a home with smoke; cleaner stoves and good ventilation reduce indoor air pollution and related health risks.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees thick black smoke rising from a pile of burning plastic waste near a market in ${place(rng)}. What should ${who} understand about this practice?`,
      correct: "Burning plastic waste releases harmful pollutants into the air and should be avoided",
      wrong: ["Burning plastic waste is a safe and recommended way to dispose of it", "Burning plastic waste actually cleans the surrounding air", "Burning plastic has no effect on air quality at all"],
      explanation: "Burning plastic and other garbage in the open releases harmful smoke and pollutants into the air — a practice that should be avoided in favour of proper waste disposal.",
    };
  },
  (rng) => ({
    prompt: `A construction site in ${place(rng)} produces a lot of dust that spreads over a nearby school. What precaution should learners at the school take on especially dusty days?`,
    correct: "Wear a dust mask if outdoors for long periods in the dusty air",
    wrong: ["Take no precaution at all, since dust cannot affect health", "Remove their shoes to avoid tracking dust indoors", "Drink extra water, which fully cancels out any effect of dust in the air"],
    explanation: "The curriculum's own safety note recommends wearing a dust mask (among other precautions like goggles and overcoats) when in a heavily dust- or smoke-polluted environment.",
  }),
  (rng) => ({
    prompt: `A city council in ${place(rng)} plants thousands of trees along major roads as part of a clean-air campaign. How does this help reduce air pollution?`,
    correct: "Trees help clean the air, making tree-planting a genuine way to reduce the effects of air pollution",
    wrong: ["Trees have no effect on air quality at all", "Trees only block sunlight and do nothing for air pollution", "Trees increase air pollution by releasing smoke"],
    explanation: "Planting more trees is one of the curriculum's own named methods for reducing air pollution, since trees help clean the surrounding air.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} makes a poster for a class project in ${place(rng)}, listing 'car exhaust,' 'factory smoke' and 'burning garbage' under one heading, and 'plant more trees' and 'use public transport' under another. What are the two correct headings?`,
      correct: "Sources of air pollution, and ways to reduce air pollution",
      wrong: ["Uses of air, and components of air", "Health effects, and safety precautions only", "Weather conditions, and types of clouds"],
      explanation: "Sources of air pollution (like vehicle exhaust, factory smoke, burning garbage) are distinct from the methods used to reduce pollution (like tree-planting and cleaner transport) — exactly the poster project this sub-strand suggests.",
    };
  },
  (rng) => ({
    prompt: `A doctor in ${place(rng)} notices more patients with breathing difficulties during weeks with especially heavy traffic smoke. What is the most likely explanation?`,
    correct: "Higher levels of air pollution from traffic smoke can trigger or worsen breathing problems such as asthma",
    wrong: ["Traffic smoke has no connection to breathing problems", "The patients are unrelated cases with no shared cause", "Breathing problems are always caused by cold weather alone"],
    explanation: "Air pollution, including vehicle exhaust smoke, is a well-known trigger for breathing difficulties and can worsen conditions such as asthma.",
  }),
  (rng) => ({
    prompt: `${name(rng)} notices that rainwater collected near a heavily industrial part of ${place(rng)} seems to damage some plants more than rainwater collected in a cleaner rural area. What might explain this?`,
    correct: "Air pollutants from industry can dissolve into rain, making it more acidic and more harmful to plants",
    wrong: ["Rainwater near industry always contains more nutrients for plants", "Industrial areas always receive less rainfall", "Rainwater composition never varies between locations"],
    explanation: "Pollutants released into the air, especially near industrial sites, can dissolve into rain and make it more acidic, which can harm plants and other living things.",
  }),
];

export const airPollution: Skill = {
  id: "g6-sci-matter-air-pollution",
  code: "MAT.2b",
  subjectId: "science",
  strandId: "g6-sci-matter",
  grade: 6,
  title: "Air pollution",
  description: "Causes and effects of air pollution on the environment, methods of reducing it, and safety precautions (dust masks, goggles, overcoats) in polluted environments.",
  generate(rng) {
    const branch = randChoice(rng, ["pollutant-sort", "effect-vs-reduction", "effect-categorize", "poster-order", "ppe-identify", "reasoning", "fill-blank"] as const);

    if (branch === "pollutant-sort") {
      const chosen = shuffle(rng, POLLUTANTS);
      const items: { id: string; label: string }[] = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const isPollutant: Record<string, boolean> = {};
      chosen.forEach((_, i) => (isPollutant[`p${i}`] = true));
      const extraGood = shuffle(rng, REDUCTION_METHODS).slice(0, 3);
      extraGood.forEach((g, i) => {
        items.push({ id: `g${i}`, label: g.text });
        isPollutant[`g${i}`] = false;
      });
      const shuffledItems = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const it of shuffledItems) correctBucket[it.id] = isPollutant[it.id] ? "pollutant" : "reduction";
      const POLLUTANT_SORT_PROMPTS = [
        "Sort each item as a source of air pollution or a way of reducing air pollution.",
        "Is each item below a source of pollution or a way to reduce it? Sort them.",
        "Decide whether each item causes air pollution or helps reduce it, then sort it.",
        "Group these items into sources of pollution and ways to reduce it.",
        "For each item, work out whether it pollutes the air or helps clean it.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, POLLUTANT_SORT_PROMPTS),
        items: shuffledItems,
        buckets: [
          { id: "pollutant", label: "Source of pollution" },
          { id: "reduction", label: "Way to reduce pollution" },
        ],
        correctBucket,
        hint: "Ask whether the item adds pollutants to the air or helps remove/prevent them.",
        explanation: shuffledItems.map((it) => `"${it.label}" is a ${correctBucket[it.id] === "pollutant" ? "source of pollution" : "way to reduce pollution"}.`).join(" "),
      };
    }

    if (branch === "effect-vs-reduction") {
      const chosen = shuffle(rng, POLLUTANT_SOLUTION_PAIRS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.pollutant })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.solution })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      const EFFECT_REDUCTION_PROMPTS = [
        "Match each source of air pollution to the best way of addressing it.",
        "Which solution best addresses each source of pollution below? Match them up.",
        "Pair each source of air pollution with the best way to reduce it.",
        "Match each pollution source to the action that best tackles it.",
        "Connect each source of air pollution with its best solution.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, EFFECT_REDUCTION_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what would specifically reduce that source of pollution.",
        explanation: chosen.map((p) => `${p.pollutant} → ${p.solution}.`).join(" "),
      };
    }

    if (branch === "effect-categorize") {
      const chosen = shuffle(rng, EFFECTS_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `x${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`x${i}`] = f.category));
      const EFFECT_CATEGORIZE_PROMPTS = [
        "Sort each effect of air pollution as mainly affecting human health or the wider environment.",
        "Is each effect below mainly about human health or the wider environment? Sort them.",
        "Decide whether each effect of air pollution is a health effect or an environmental one, then sort it.",
        "Group these effects of air pollution into human health and wider environment.",
        "For each effect, work out whether it mainly harms health or the environment.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, EFFECT_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "health", label: "Human health" },
          { id: "environment", label: "Wider environment" },
        ],
        correctBucket,
        hint: "Coughing and breathing problems are health effects; damage to plants, rain, visibility and climate are environmental effects.",
        explanation: chosen.map((f) => `"${f.text}" is mainly a ${f.category === "health" ? "human health" : "wider environment"} effect.`).join(" "),
      };
    }

    if (branch === "poster-order") {
      const shuffled = shuffle(rng, POSTER_STEPS);
      const POSTER_ORDER_PROMPTS = [
        "Put the steps of making a class poster about air pollution in the correct order.",
        "Arrange these poster-making steps about air pollution in the right order.",
        "Place these steps for making an air pollution poster in the order you'd carry them out.",
        "Order these poster-making steps, from first to last.",
        "Sort these air-pollution poster steps into the correct sequence.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, POSTER_ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: POSTER_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Research pollutants and effects first, then solutions, then design and share.",
        explanation: "Correct order: " + POSTER_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "ppe-identify") {
      const items = [
        { item: "mask" as const, label: "Dust mask" },
        { item: "goggles" as const, label: "Goggles" },
        { item: "overalls" as const, label: "Overcoat / overalls" },
      ];
      const target = randChoice(rng, items);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, items.filter((i) => i.item !== target.item).map((i) => i.label), 2);
      const PPE_PROMPTS = [
        "Identify this safety precaution used in an air-polluted environment.",
        "Which safety precaution is shown here?",
        "What is this piece of safety equipment called?",
        "Look at this precaution used in polluted air. What is it?",
        "Name this safety precaution.",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, PPE_PROMPTS),
        visual: { type: "ppe-icon", item: target.item },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label} — one of the precautions recommended when working or travelling in polluted or dusty air.`,
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Smoke released from vehicle exhausts is a common source of air ", after: ".", correctAnswer: "pollution" },
      { before: "Burning garbage or plastic waste in the open releases harmful ", after: " into the air.", correctAnswer: "smoke" },
      { before: "Polluted air can trigger or worsen breathing conditions such as ", after: ".", correctAnswer: "asthma" },
      { before: "Planting more trees is one way to help ", after: " the air.", correctAnswer: "clean" },
      { before: "Using public transport instead of many private trips can help reduce air ", after: ".", correctAnswer: "pollution" },
      { before: "A dust mask, goggles and an overcoat are all examples of safety ", after: " in polluted environments.", correctAnswer: "precautions" },
      { before: "Some air pollutants dissolve into rain, making it more ", after: ".", correctAnswer: "acidic" },
      { before: "Proper waste disposal, instead of burning waste, helps reduce air ", after: ".", correctAnswer: "pollution" },
      { before: "Wearing a dust mask helps protect the ", after: " from breathing in polluted air.", correctAnswer: "lungs" },
      { before: "A useful class project on this topic is making a ", after: " about pollutants, dangers and solutions.", correctAnswer: "poster" },
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
      hint: "Think about the causes, effects and prevention of air pollution.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
