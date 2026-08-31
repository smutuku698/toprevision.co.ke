import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 2.1 Mixtures — homogeneous vs heterogeneous mixtures, examples
// (solid-solid, solid-liquid, liquid-liquid), and 7 named separation methods (winnowing, picking, sieving,
// using a magnet, filtering, decanting, separating funnel). See curriculum-reference/grade-5/science-and-technology.json.

const MIXTURE_EXAMPLES = [
  { label: "Sand and small stones", type: "heterogeneous" as const, kind: "solid-solid" },
  { label: "Rice and small stones", type: "heterogeneous" as const, kind: "solid-solid" },
  { label: "Maize grains and chaff (husks)", type: "heterogeneous" as const, kind: "solid-solid" },
  { label: "Iron filings mixed with sand", type: "heterogeneous" as const, kind: "solid-solid" },
  { label: "Muddy (soil-mixed) water", type: "heterogeneous" as const, kind: "solid-liquid" },
  { label: "Tea leaves in water before straining", type: "heterogeneous" as const, kind: "solid-liquid" },
  { label: "Cooking oil and water shaken together", type: "heterogeneous" as const, kind: "liquid-liquid" },
  { label: "Petrol and water in the same container", type: "heterogeneous" as const, kind: "liquid-liquid" },
  { label: "Salt fully dissolved in water", type: "homogeneous" as const, kind: "solid-liquid" },
  { label: "Sugar fully dissolved in water", type: "homogeneous" as const, kind: "solid-liquid" },
  { label: "The air we breathe (a mixture of gases)", type: "homogeneous" as const, kind: "other" },
  { label: "A clear glass of well-mixed juice concentrate and water", type: "homogeneous" as const, kind: "liquid-liquid" },
] as const;

const METHODS = [
  { id: "winnowing", label: "Winnowing", def: "Using moving air or wind to blow away lighter husks or chaff, leaving heavier grain behind" },
  { id: "picking", label: "Picking", def: "Removing stones or unwanted particles from grain by hand, one piece at a time" },
  { id: "sieving", label: "Sieving", def: "Passing a mixture through a sieve so smaller particles fall through while larger ones stay behind" },
  { id: "magnet", label: "Using a magnet", def: "Using a magnet to pull out magnetic materials such as iron filings from a mixture" },
  { id: "filtering", label: "Filtering", def: "Passing a mixture through a filter so insoluble solid particles are trapped while the liquid passes through" },
  { id: "decanting", label: "Decanting", def: "Carefully pouring off a liquid from a container, leaving settled solid particles behind" },
  { id: "sep-funnel", label: "Using a separating funnel", def: "Using a special funnel with a tap to separate two liquids that do not mix, such as oil and water" },
] as const;

const SCENARIOS = [
  { scenario: "Separating maize grains from their lighter husks by tossing them in the wind", methodId: "winnowing" },
  { scenario: "Removing small stones from a heap of rice, one stone at a time, before cooking", methodId: "picking" },
  { scenario: "Shaking flour through a mesh so bran stays on top and fine flour passes through", methodId: "sieving" },
  { scenario: "Passing a strong magnet over spilled nails mixed with sawdust to pull the nails out", methodId: "magnet" },
  { scenario: "Pouring muddy water through a cloth or filter paper to trap the soil particles", methodId: "filtering" },
  { scenario: "Letting a jar of soil and water settle overnight, then gently pouring off the clear water on top", methodId: "decanting" },
  { scenario: "Using a funnel with a tap to run off the lower layer of water while keeping the oil above it", methodId: "sep-funnel" },
] as const;

const FILTER_STEPS = [
  { id: "s1", label: "Fold a piece of filter paper (or cloth) into a cone shape and place it in a funnel" },
  { id: "s2", label: "Position the funnel over a clean, empty container" },
  { id: "s3", label: "Pour the muddy water slowly into the funnel" },
  { id: "s4", label: "Let the water pass through the filter, leaving solid soil particles trapped on the paper" },
  { id: "s5", label: "Collect the clear filtered water from the container below" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has a basin of freshly harvested rice mixed with a few small stones. Which method would best separate the stones from the rice?`,
      correct: "Picking the stones out by hand",
      wrong: ["Using a magnet", "Decanting", "Using a separating funnel"],
      explanation: "Since stones and rice are similar in size and neither is magnetic, picking them out by hand is the most suitable method.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} has just threshed millet and needs to separate the heavier grains from the lighter husks. Which method is best suited here?`,
    correct: "Winnowing",
    wrong: ["Filtering", "Using a separating funnel", "Using a magnet"],
    explanation: "Winnowing uses moving air to blow away lighter husks while heavier grain falls straight down — ideal for grain and chaff.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} collects rainwater that looks muddy and wants clear water for washing. Which method would separate the soil particles from the water?`,
      correct: "Filtering",
      wrong: ["Winnowing", "Picking", "Using a magnet"],
      explanation: "Filtering passes the muddy water through a filter, trapping the solid soil particles while letting the water through.",
    };
  },
  (rng) => ({
    prompt: `A workshop in ${place(rng)} accidentally spills iron nails into a pile of sawdust. Which method would quickly separate the nails from the sawdust?`,
    correct: "Using a magnet",
    wrong: ["Winnowing", "Sieving", "Decanting"],
    explanation: "Iron nails are magnetic and sawdust is not, so a magnet can quickly pull the nails out of the mixture.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} mixes cooking oil and water in a bottle for a science activity, then lets it stand until it separates into two layers. Which method would best separate the two liquids afterwards?`,
      correct: "Using a separating funnel",
      wrong: ["Sieving", "Picking", "Winnowing"],
      explanation: "A separating funnel lets you run off the lower liquid layer through a tap while keeping the upper layer behind — ideal for two liquids that don't mix.",
    };
  },
  (rng) => ({
    prompt: `A miller in ${place(rng)} wants to separate fine flour from coarser bran after grinding maize. Which method suits this best?`,
    correct: "Sieving",
    wrong: ["Decanting", "Using a magnet", "Using a separating funnel"],
    explanation: "Sieving lets the finer flour particles pass through the mesh while the coarser bran is left behind.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} leaves a jar of soil and water to stand overnight, and by morning the soil has settled at the bottom leaving clear water on top. What should ${who} do to collect only the clear water?`,
      correct: "Carefully pour off (decant) the clear water without disturbing the settled soil",
      wrong: ["Shake the jar hard to mix everything again", "Pass the whole jar through a magnet", "Winnow the jar's contents outdoors"],
      explanation: "Decanting means carefully pouring off the liquid from above a settled solid, leaving the sediment undisturbed at the bottom.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} is asked how sugar fully dissolved in water is different from sand mixed into water. What is the key difference?`,
    correct: "Dissolved sugar in water forms a homogeneous (uniform) mixture, while sand in water is heterogeneous (non-uniform) since the sand settles and can be seen",
    wrong: ["There is no real difference between the two mixtures", "Both mixtures are always classified as heterogeneous", "Both mixtures are always classified as homogeneous"],
    explanation: "A dissolved substance like sugar blends completely and uniformly into water (homogeneous); undissolved sand remains visibly separate (heterogeneous).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to classify a mixture of petrol floating on top of water in a jar. Is this mixture homogeneous or heterogeneous, and why?`,
      correct: "Heterogeneous, because the two liquids remain visibly separate as distinct layers instead of blending uniformly",
      wrong: ["Homogeneous, because both substances are liquids", "Homogeneous, because the mixture looks the same throughout", "Neither — liquids can never form a heterogeneous mixture"],
      explanation: "Petrol and water do not mix; they form distinct layers, which makes this a heterogeneous (non-uniform) mixture.",
    };
  },
  (rng) => ({
    prompt: `A honey seller in ${place(rng)} strains freshly harvested honey through a cloth to remove pieces of wax and dead bees before bottling it. Which separation method is this?`,
    correct: "Filtering",
    wrong: ["Winnowing", "Using a magnet", "Using a separating funnel"],
    explanation: "Straining honey through a cloth to remove solid particles like wax is a form of filtering, mentioned directly in the curriculum's linked-subject example.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} needs to separate a mixture of dry beans and small pebbles that are roughly the same size and shape, in ${place(rng)}. Since sieving would not separate them well by size, what is the most practical method?`,
      correct: "Picking the pebbles out by hand",
      wrong: ["Using a separating funnel", "Decanting", "Using a magnet"],
      explanation: "When particles are similar in size and not magnetic, picking them out individually by hand is the most practical separation method.",
    };
  },
  (rng) => ({
    prompt: `A dairy farmer in ${place(rng)} pours fresh milk through a fine cloth before storing it, to catch any bits of grass or dirt that fell in during milking. Which method is being used, and why does it work here?`,
    correct: "Filtering, because the cloth traps solid particles while letting the liquid milk pass through",
    wrong: ["Winnowing, because milk is a solid mixture", "Using a separating funnel, because milk is two separate liquids", "Decanting, because the milk needs to settle first"],
    explanation: "Straining milk through a cloth to remove solid dirt particles is filtering — the same everyday application named directly in the curriculum.",
  }),
];

export const mixtures: Skill = {
  id: "g5-sci-matter-mixtures",
  code: "MAT.1",
  subjectId: "science",
  strandId: "g5-sci-matter",
  grade: 5,
  title: "Mixtures",
  description: "Classifying mixtures as homogeneous or heterogeneous, and applying the seven named methods (winnowing, picking, sieving, using a magnet, filtering, decanting, separating funnel) to separate heterogeneous mixtures.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["type-categorize", "scenario-method-match", "method-definition-match", "filter-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "type-categorize") {
      const chosen = shuffle(rng, MIXTURE_EXAMPLES).slice(0, 8);
      const items = chosen.map((m, i) => ({ id: `m${i}`, label: m.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m, i) => (correctBucket[`m${i}`] = m.type));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a homogeneous or heterogeneous mixture"),
        items,
        buckets: [
          { id: "homogeneous", label: "Homogeneous (uniform)" },
          { id: "heterogeneous", label: "Heterogeneous (non-uniform)" },
        ],
        correctBucket,
        hint: "A homogeneous mixture looks the same throughout, like fully dissolved sugar in water; a heterogeneous mixture has visibly different parts.",
        explanation: chosen.map((m) => `"${m.label}" is a ${m.type} mixture.`).join(" "),
      };
    }

    if (branch === "scenario-method-match") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.methodId, label: s.scenario })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.methodId, label: METHODS.find((m) => m.id === s.methodId)!.label })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.methodId] = s.methodId;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "situation to the separation method it describes"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what property (size, weight, magnetism, dissolving) each situation is using to separate the mixture.",
        explanation: chosen.map((s) => `"${s.scenario}" uses ${METHODS.find((m) => m.id === s.methodId)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "method-definition-match") {
      const chosen = shuffle(rng, METHODS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.def })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "separation method to what it actually does"),
        tokens,
        targets,
        correctMap,
        hint: "Think about the specific property each method uses to separate a mixture.",
        explanation: chosen.map((m) => `${m.label} — ${m.def}.`).join(" "),
      };
    }

    if (branch === "filter-order") {
      const shuffled = shuffle(rng, FILTER_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of filtering muddy water"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: FILTER_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Set up the filter first, then pour, then let it pass through, then collect.",
        explanation: "Correct order: " + FILTER_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A mixture that looks the same and uniform throughout, such as sugar fully dissolved in water, is called ", after: ".", correctAnswer: "homogeneous" },
      { before: "A mixture with visibly different parts, such as sand and stones, is called ", after: ".", correctAnswer: "heterogeneous" },
      { before: "Using moving air to blow away light husks from heavier grain is called ", after: ".", correctAnswer: "winnowing" },
      { before: "Removing stones from grain by hand, one piece at a time, is called ", after: ".", correctAnswer: "picking" },
      { before: "Passing a mixture through a mesh so smaller particles fall through is called ", after: ".", correctAnswer: "sieving" },
      { before: "Pulling iron filings out of a mixture using a magnet works because iron is ", after: ".", correctAnswer: "magnetic" },
      { before: "Passing muddy water through a filter to trap soil particles is called ", after: ".", correctAnswer: "filtering" },
      { before: "Carefully pouring off a liquid from a settled solid, without disturbing it, is called ", after: ".", correctAnswer: "decanting" },
      { before: "A special funnel with a tap, used to separate oil and water, is called a ", after: ".", correctAnswer: "separating funnel" },
      { before: "Straining tea leaves out of tea before drinking it is an everyday example of ", after: ".", correctAnswer: "filtering" },
      { before: "Straining freshly harvested honey to remove wax is another everyday example of ", after: ".", correctAnswer: "filtering" },
      { before: "A mixture of two liquids that do not mix, like oil and water, is best separated using a ", after: ".", correctAnswer: "separating funnel" },
      { before: "Removing chaff from millet using moving air is a farming example of ", after: ".", correctAnswer: "winnowing" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about the property (size, weight, magnetism, dissolving) each separation method relies on.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
