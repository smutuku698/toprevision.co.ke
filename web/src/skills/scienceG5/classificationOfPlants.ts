import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, hotspotPrompt, orderPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 1.1 Classification of Plants — flowering vs non-flowering
// plants, and the parts and functions of a flower. See curriculum-reference/grade-5/science-and-technology.json.

const FLOWERING_PLANTS = [
  "Hibiscus", "Rose", "Bougainvillea", "Sunflower", "Maize", "Bean plant", "Passion fruit vine",
  "Orange tree", "Mango tree", "Tomato plant", "Pumpkin plant", "Coffee plant",
] as const;

const NON_FLOWERING_PLANTS = [
  "Fern", "Moss", "Pine tree", "Cypress tree", "Spike moss", "Algae",
] as const;

const FLOWER_PARTS = [
  { id: "petal", label: "Petal", func: "Attracts insects to the flower with its bright colour and shape, helping pollination happen" },
  { id: "sepal", label: "Sepal", func: "Protects the flower bud before it opens" },
  { id: "stamen", label: "Stamen", func: "The male part of the flower; produces pollen" },
  { id: "pistil", label: "Pistil", func: "The female part of the flower; receives pollen and later develops into fruit holding seeds" },
  { id: "stem", label: "Stem", func: "Supports the flower and carries water and nutrients up from the roots" },
  { id: "leaf", label: "Leaf", func: "Makes food for the whole plant using sunlight" },
  { id: "root", label: "Root", func: "Anchors the plant in the soil and absorbs water and nutrients" },
] as const;

const IMPORTANCE_FACTS = [
  { text: "Colourful, scented flowers attract bees, butterflies and birds that carry pollen from flower to flower", category: "pollination" },
  { text: "After pollination, a flower's pistil can develop into a fruit that holds seeds", category: "reproduction" },
  { text: "Seeds formed inside fruit allow a plant species to reproduce and spread to new places", category: "reproduction" },
  { text: "Bees collect nectar from flowers and use it to make honey", category: "food-chain" },
  { text: "Many insects and birds depend on flower nectar as a major source of food", category: "food-chain" },
  { text: "Flower farms in Kenya grow roses and other flowers for export, earning the country income", category: "economy" },
  { text: "Selling cut flowers at local markets provides income for many small-scale farmers", category: "economy" },
  { text: "Some flowers, such as hibiscus, are dried and used to make herbal tea", category: "human-use" },
  { text: "Certain flowers are used to make perfumes because of their pleasant scent", category: "human-use" },
  { text: "People plant flowers in gardens and compounds simply to make the surroundings more beautiful", category: "beauty" },
  { text: "Flowers are commonly used to decorate churches, homes and event venues for celebrations", category: "beauty" },
  { text: "Without pollination happening at the flower, many food crops such as beans and pumpkins would not produce fruit", category: "pollination" },
] as const;

const DRAW_LABEL_STEPS = [
  { id: "d1", label: "Observe a real flower or a clear picture of one closely" },
  { id: "d2", label: "Draw the outline of the flower's parts" },
  { id: "d3", label: "Label each part of the flower correctly" },
  { id: "d4", label: "Discuss the function of each labelled part with a peer" },
  { id: "d5", label: "Discuss the importance of flowers in nature with peers" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices bees visiting the bright red hibiscus flowers in a garden in ${place(rng)} throughout the morning. What are the bees most likely doing?`,
      correct: "Collecting nectar and, in the process, carrying pollen from flower to flower",
      wrong: ["Eating the flower's petals for food", "Building a nest inside the flower's stem", "Removing the flower's roots from the soil"],
      explanation: "Bees visit colourful flowers to collect nectar, and as they move between flowers they carry pollen with them — this is pollination.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} notices that a field of bean plants produces very few pods this season, and mentions that very few bees were seen visiting the flowers. What is the most likely explanation?`,
    correct: "Fewer bees visiting the flowers meant less pollination, so fewer flowers developed into bean pods",
    wrong: ["Bean plants do not need pollination to form pods at all", "The bean plants simply did not need any water this season", "Bees have no connection to how many pods a bean plant produces"],
    explanation: "Pollination by insects such as bees is often needed before a flower can develop into fruit — fewer visiting bees can mean fewer pods.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked to draw and label a flower for a class project in ${place(rng)}, and pauses to look closely at a real flower first before starting to draw. Why is this a good first step?`,
      correct: "Observing the real flower closely helps ensure the drawing and labels are accurate",
      wrong: ["It has no real benefit — any imagined flower shape would do just as well", "It only helps decide what colour of pencil to use", "It is unnecessary since all flowers look exactly the same"],
      explanation: "The suggested learning sequence for this topic begins with close observation, since an accurate drawing and correct labelling depend on it.",
    };
  },
  (rng) => ({
    prompt: `A flower farm near ${place(rng)} grows thousands of roses and sells them for export to other countries. Which importance of flowers does this best show?`,
    correct: "Flowers as a source of income and economic activity",
    wrong: ["Flowers as a source of drinking water", "Flowers used only for classifying plants", "Flowers used to build houses"],
    explanation: "Growing and selling flowers for export is an economic importance of flowers — a real source of income for many people in Kenya.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} dries hibiscus petals collected from the garden in ${place(rng)} and later steeps them in hot water. What is ${who} most likely making?`,
      correct: "A herbal tea made from dried hibiscus petals",
      wrong: ["A type of fertiliser for the garden", "A dye for colouring clothes only", "A type of soap"],
      explanation: "Dried hibiscus petals are commonly used to make a herbal tea — one of the practical human uses of flowers.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} finds a plant with no flowers at all, but with green fern-like fronds. Into which group should this plant be classified?`,
    correct: "Non-flowering plant",
    wrong: ["Flowering plant", "Neither a flowering nor a non-flowering plant", "Both a flowering and a non-flowering plant"],
    explanation: "A plant that never produces flowers, such as a fern, is classified as a non-flowering plant.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} carefully removes a hibiscus flower's petals one by one in ${place(rng)} to see what remains at the very centre. Which flower part is ${who} most likely left looking at?`,
      correct: "The stamen and pistil, the reproductive parts at the flower's centre",
      wrong: ["The roots, since they are always found at a flower's centre", "The leaves, which grow from the very middle of every flower", "Nothing — flowers have no parts left once petals are removed"],
      explanation: "The reproductive parts of a flower — the stamen (male) and pistil (female) — sit at its centre, inside the ring of petals.",
    };
  },
  (rng) => ({
    prompt: `A church in ${place(rng)} is decorated with fresh flower arrangements for a wedding ceremony. Which importance of flowers does this use best represent?`,
    correct: "Flowers used for beauty and decoration",
    wrong: ["Flowers used purely for food", "Flowers used only in scientific classification", "Flowers used to filter drinking water"],
    explanation: "Decorating a venue with fresh flowers is a beauty/decorative use of flowers, distinct from their role in pollination or food.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is labelling a diagram of a flower in ${place(rng)} and correctly writes 'protects the bud before it opens' next to one part. Which part is ${who} describing?`,
      correct: "Sepal",
      wrong: ["Petal", "Stamen", "Root"],
      explanation: "The sepal's job is to protect the flower bud before it opens — a function distinct from the petal's role of attracting pollinators.",
    };
  },
  (rng) => ({
    prompt: `A beekeeper in ${place(rng)} places hives near a large field of sunflowers in bloom. Why would the beekeeper choose this location?`,
    correct: "The many flowers provide a rich source of nectar for the bees to turn into honey",
    wrong: ["Sunflowers repel bees, keeping the hives safer", "Sunflowers provide shade but no food value to bees", "Flowers have no connection to honey production at all"],
    explanation: "Bees rely on nectar from flowers such as sunflowers to make honey, so placing hives near a large bloom benefits honey production.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees a pumpkin plant with many yellow flowers in ${place(rng)}, but only some of the flowers eventually turn into pumpkins. What most likely determines which flowers become pumpkins?`,
      correct: "Only the flowers that get successfully pollinated go on to develop into pumpkins",
      wrong: ["Every single flower on the plant always becomes a pumpkin", "The colour of each flower decides which becomes a pumpkin", "Flowers have no connection to which parts of the plant become pumpkins"],
      explanation: "A flower must be pollinated before its pistil can develop into fruit — unpollinated flowers on a pumpkin plant do not become pumpkins.",
    };
  },
  (rng) => ({
    prompt: `A cypress tree near a school compound in ${place(rng)} has never once been seen with a flower, even though it produces small cones. How should this tree be classified?`,
    correct: "Non-flowering plant",
    wrong: ["Flowering plant", "It cannot be classified at all", "It changes classification depending on the season"],
    explanation: "A cypress tree, like a pine tree, is a non-flowering plant — it never produces true flowers, even though it does produce cones.",
  }),
];

export const classificationOfPlants: Skill = {
  id: "g5-sci-lte-classification-of-plants",
  code: "LTE.1",
  subjectId: "science",
  strandId: "g5-sci-lte",
  grade: 5,
  title: "Classification of plants",
  description: "Classifying plants into flowering and non-flowering, the parts and functions of a flower, and the importance of flowers in nature and everyday life.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["flowering-categorize", "part-function-match", "part-hotspot", "importance-categorize", "draw-label-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "flowering-categorize") {
      const flowering = shuffle(rng, FLOWERING_PLANTS).slice(0, 6);
      const nonFlowering = shuffle(rng, NON_FLOWERING_PLANTS).slice(0, 4);
      const items = shuffle(rng, [
        ...flowering.map((p, i) => ({ id: `f${i}`, label: p })),
        ...nonFlowering.map((p, i) => ({ id: `n${i}`, label: p })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.id.startsWith("f") ? "flowering" : "non-flowering";
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the plant is flowering or non-flowering"),
        items,
        buckets: [
          { id: "flowering", label: "Flowering plant" },
          { id: "non-flowering", label: "Non-flowering plant" },
        ],
        correctBucket,
        hint: "A flowering plant produces flowers as part of its life cycle; a non-flowering plant, like a fern or moss, never does.",
        explanation: items.map((it) => `${it.label} is a ${correctBucket[it.id] === "flowering" ? "flowering" : "non-flowering"} plant.`).join(" "),
      };
    }

    if (branch === "part-function-match") {
      const chosen = shuffle(rng, FLOWER_PARTS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.func })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "flower part to its function"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what job each part does for the whole flower and plant.",
        explanation: chosen.map((p) => `${p.label} — ${p.func}.`).join(" "),
      };
    }

    if (branch === "part-hotspot") {
      const spots = [
        { id: "petal", xPercent: 50, yPercent: 17, label: "Petal" },
        { id: "stamen", xPercent: 50, yPercent: 45, label: "Stamen" },
        { id: "stem", xPercent: 50, yPercent: 78, label: "Stem" },
        { id: "leaf", xPercent: 66, yPercent: 66, label: "Leaf" },
        { id: "root", xPercent: 50, yPercent: 97, label: "Root" },
      ] as const;
      const target = randChoice(rng, spots);
      const others = spots.filter((s) => s.id !== target.id).map((s) => s.label);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, others).slice(0, 3)]);
      return {
        kind: "hotspot",
        prompt: hotspotPrompt(rng, "this flower"),
        diagram: { type: "flower" },
        spots: spots.map((s) => ({ id: s.id, xPercent: s.xPercent, yPercent: s.yPercent, label: s.label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: "Look at where the marked spot sits on the flower and stem.",
        explanation: `The marked spot is the ${target.label.toLowerCase()}.`,
      };
    }

    if (branch === "importance-categorize") {
      const chosen = shuffle(rng, IMPORTANCE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `i${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`i${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "the kind of importance of flowers it describes"),
        items,
        buckets: [
          { id: "pollination", label: "Pollination" },
          { id: "reproduction", label: "Reproduction (seeds/fruit)" },
          { id: "food-chain", label: "Food for insects/bees" },
          { id: "economy", label: "Economy/income" },
          { id: "human-use", label: "Human use (tea, perfume)" },
          { id: "beauty", label: "Beauty/decoration" },
        ],
        correctBucket,
        hint: "Think about whether the fact is about attracting insects, forming seeds, feeding bees, earning money, everyday human use, or looking nice.",
        explanation: chosen.map((f) => `"${f.text}" is about ${f.category.replace("-", " ")}.`).join(" "),
      };
    }

    if (branch === "draw-label-order") {
      const shuffled = shuffle(rng, DRAW_LABEL_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of observing, drawing and labelling a flower"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: DRAW_LABEL_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Start by observing the real flower, and finish by discussing its importance.",
        explanation: "Correct order: " + DRAW_LABEL_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A plant that produces flowers as part of its life cycle is called a ", after: " plant.", correctAnswer: "flowering" },
      { before: "A fern or a moss never produces flowers, so it is classified as a ", after: " plant.", correctAnswer: "non-flowering" },
      { before: "The part of a flower that attracts insects with its bright colour is the ", after: ".", correctAnswer: "petal" },
      { before: "The part of a flower that protects the bud before it opens is the ", after: ".", correctAnswer: "sepal" },
      { before: "The male part of a flower, which produces pollen, is the ", after: ".", correctAnswer: "stamen" },
      { before: "The female part of a flower, which later develops into fruit, is the ", after: ".", correctAnswer: "pistil" },
      { before: "The part of a flower that supports it and carries water up from the roots is the ", after: ".", correctAnswer: "stem" },
      { before: "Bees collect nectar from flowers and use it to make ", after: ".", correctAnswer: "honey" },
      { before: "After a flower is pollinated, its pistil can develop into a fruit holding ", after: ".", correctAnswer: "seeds" },
      { before: "Kenyan flower farms grow and export roses, which is an example of the ", after: " importance of flowers.", correctAnswer: "economic" },
      { before: "Dried hibiscus petals are commonly used to make a herbal ", after: ".", correctAnswer: "tea" },
      { before: "Planting flowers in a compound just to make it look nicer shows their ", after: " importance.", correctAnswer: "beauty", alsoAccept: ["decorative"] },
      { before: "Colourful flowers attract insects that carry ", after: " from one flower to another.", correctAnswer: "pollen" },
      { before: "The green part of a plant that makes food using sunlight is the ", after: ".", correctAnswer: "leaf" },
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
      hint: "Think about the parts of a flower and why flowers matter in nature.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
