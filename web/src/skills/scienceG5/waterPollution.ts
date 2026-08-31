import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 2.2 Water Pollution — pollutants, effects, methods of
// reducing pollution, and 4 named basic water-treatment methods (boiling, filtration, chemical treatment,
// solar treatment). Common pollutants are not a closed list in the source design (an open "brainstorm"), so
// the implemented pool draws on standard Kenyan-context pollutants — see the JSON's notes.

const POLLUTANTS = [
  { text: "Untreated sewage and human waste released into rivers", source: "sewage" },
  { text: "Chemical waste released from factories", source: "industry" },
  { text: "Fertiliser and pesticide runoff washed off farmland by rain", source: "agriculture" },
  { text: "Oil spills from vehicles, boats or machinery", source: "oil" },
  { text: "Plastic bottles, bags and other litter dumped into rivers and lakes", source: "litter" },
  { text: "Soil washed into rivers from bare, eroded land", source: "silt" },
] as const;

const REDUCTION_METHODS = [
  { text: "Building and using proper latrines instead of open defecation near water sources", category: "sanitation" },
  { text: "Treating factory waste before it is released into rivers", category: "industry" },
  { text: "Avoiding dumping litter and plastic waste into rivers and lakes", category: "litter" },
  { text: "Planting trees and grass along riverbanks to reduce soil runoff into the water", category: "erosion" },
  { text: "Using fertilisers and pesticides carefully and in the correct amounts", category: "agriculture" },
  { text: "Educating the community about the dangers of polluting water sources", category: "awareness" },
] as const;

const EFFECTS_FACTS = [
  { text: "Drinking polluted water can cause diseases such as cholera and typhoid", category: "health" },
  { text: "Polluted water can cause diarrhoea, especially in young children", category: "health" },
  { text: "Polluted water is often unsafe to use for cooking or drinking without treatment", category: "health" },
  { text: "Chemicals in polluted water can poison and kill fish and other aquatic animals", category: "environment" },
  { text: "Litter such as plastic bags can choke or trap fish and other water animals", category: "environment" },
  { text: "Excess nutrients from fertiliser runoff can cause algae to grow rapidly, using up oxygen in the water", category: "environment" },
  { text: "Silt washed into rivers can cloud the water, making it harder for water plants to get sunlight", category: "environment" },
  { text: "Skin infections and rashes can result from contact with polluted water", category: "health" },
] as const;

const TREATMENT_METHODS = [
  { id: "boiling", label: "Boiling", def: "Heating water until it boils, which kills most disease-causing germs" },
  { id: "filtration", label: "Filtration", def: "Passing water through a filter (such as sand, charcoal and cloth layers) to trap solid particles" },
  { id: "chemical", label: "Chemical treatment", def: "Adding a water-treatment chemical, such as chlorine or a water guard, to kill germs" },
  { id: "solar", label: "Solar treatment", def: "Placing water in a clear bottle in strong sunlight for several hours so the sun's heat and UV rays kill germs" },
] as const;

const FILTER_MAKING_STEPS = [
  { id: "f1", label: "Cut a plastic bottle in half and turn the top half upside down inside the bottom half" },
  { id: "f2", label: "Place a layer of cloth or cotton at the neck of the bottle" },
  { id: "f3", label: "Add a layer of clean charcoal above the cloth" },
  { id: "f4", label: "Add a layer of sand above the charcoal, then a layer of small gravel or stones on top" },
  { id: "f5", label: "Slowly pour the dirty water in at the top and let it pass through the layers" },
  { id: "f6", label: "Collect the filtered water from the bottom container" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} collects water from a river and, since there is no electricity or chemicals available, decides to place the water in a clear bottle out in strong sunlight for several hours. Which water treatment method is ${who} using?`,
      correct: "Solar treatment",
      wrong: ["Boiling", "Chemical treatment", "Filtration"],
      explanation: "Placing water in a clear bottle in strong sunlight to kill germs using heat and UV rays is solar treatment (sometimes called SODIS).",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} has no clean water source nearby and their river water looks cloudy with visible soil particles. Which method should they use FIRST, before any germ-killing treatment, to remove the visible particles?`,
    correct: "Filtration, to remove the solid particles before further treatment",
    wrong: ["Chemical treatment alone, since it removes solid particles too", "Boiling alone, since heat removes solid particles", "No treatment is needed if the water only looks cloudy"],
    explanation: "Filtration removes visible solid particles first; boiling or chemical treatment can then kill germs in the now-clearer water.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices a factory near a river in ${place(rng)} releasing waste directly into the water, and afterwards many dead fish are found downstream. What does this best illustrate?`,
      correct: "Untreated chemical waste from industry can poison and kill aquatic animals such as fish",
      wrong: ["Fish always die naturally regardless of water quality", "Factory waste always improves water quality for fish", "There is no connection between factory waste and fish health"],
      explanation: "Chemical waste released untreated into rivers can poison fish and other aquatic animals — a direct environmental effect of water pollution.",
    };
  },
  (rng) => ({
    prompt: `A village council in ${place(rng)} plants grass and trees along a riverbank that had been left bare and eroding. How does this help reduce water pollution?`,
    correct: "Plant roots hold the soil in place, reducing the amount of silt washed into the river when it rains",
    wrong: ["Plants have no effect on how much soil enters a river", "Planting trees increases how much soil washes into rivers", "Grass and trees only affect air quality, not water quality"],
    explanation: "Vegetation along a riverbank reduces soil erosion, which in turn reduces the silt that would otherwise cloud and pollute the water.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} drinks water directly from an unprotected river without treating it first, and later develops diarrhoea. What is the most likely explanation?`,
      correct: "The untreated water likely contained disease-causing germs from pollution",
      wrong: ["Drinking any river water always causes diarrhoea, treated or not", "Diarrhoea is completely unrelated to water quality", "River water is always safer than tap water"],
      explanation: "Untreated, polluted water can carry disease-causing germs that lead to illnesses such as diarrhoea when consumed.",
    };
  },
  (rng) => ({
    prompt: `A health worker in ${place(rng)} advises villagers to boil their drinking water for at least a few minutes before use. What does boiling actually achieve?`,
    correct: "The heat from boiling kills most disease-causing germs in the water",
    wrong: ["Boiling removes all dissolved chemicals from the water", "Boiling adds oxygen back into the water", "Boiling has no real effect on water safety"],
    explanation: "Boiling water kills most disease-causing germs, making it one of the simplest and most reliable basic water treatment methods.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees a large amount of green algae covering the surface of a pond in ${place(rng)} shortly after fertiliser was spread on a nearby farm during heavy rain. What most likely caused this?`,
      correct: "Fertiliser runoff washed into the pond added extra nutrients that caused the algae to grow rapidly",
      wrong: ["Algae growth is completely unrelated to fertiliser use nearby", "Fertiliser always kills algae rather than helping it grow", "The green colour is caused by sunlight alone, not pollution"],
      explanation: "Fertiliser runoff adds excess nutrients to water, which can cause algae to grow rapidly — a known effect of agricultural water pollution.",
    };
  },
  (rng) => ({
    prompt: `A school in ${place(rng)} builds a simple water filter using a plastic bottle, gravel, sand, charcoal and cloth for a class project. What is the correct order of layers from top (where water is poured in) to bottom?`,
    correct: "Gravel, then sand, then charcoal, then cloth",
    wrong: ["Cloth, then charcoal, then sand, then gravel", "Sand, then gravel, then cloth, then charcoal", "Charcoal, then cloth, then gravel, then sand"],
    explanation: "A simple bottle filter is layered gravel on top, then sand, then charcoal, with cloth at the very bottom near the neck — water passes through largest to finest material.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} works clearing rubbish from a polluted riverbank in ${place(rng)} and wears gumboots and gloves throughout the activity. Why is this precaution important?`,
      correct: "Gumboots and gloves protect the skin from direct contact with polluted, possibly disease-carrying water and waste",
      wrong: ["Gumboots and gloves are only for keeping clothes clean, with no health benefit", "This precaution is unnecessary since polluted water cannot affect skin", "Gumboots and gloves make the work faster but have no safety purpose"],
      explanation: "Safety gear such as gumboots and gloves protects the skin from contact with polluted water, which can carry disease-causing germs.",
    };
  },
  (rng) => ({
    prompt: `A community in ${place(rng)} switches from open defecation near the river to using proper latrines. Which effect on water pollution should this have?`,
    correct: "It should reduce sewage pollution entering the river, lowering the risk of waterborne disease",
    wrong: ["It has no effect on water pollution at all", "It would increase pollution in the river", "It only affects air quality, not water quality"],
    explanation: "Proper latrines keep human waste out of water sources, directly reducing sewage-related water pollution and disease risk.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has access to a small supply of water-treatment chemical (chlorine) but no electricity or firewood to boil water. Which method should ${who} use?`,
      correct: "Chemical treatment",
      wrong: ["Boiling", "Solar treatment only, since chemicals are unnecessary", "None — untreated water is safe to drink as is"],
      explanation: "Chemical treatment, such as adding chlorine or a water guard product, is a practical option when boiling isn't possible.",
    };
  },
  (rng) => ({
    prompt: `Plastic litter dumped into a lake near ${place(rng)} is later found wrapped around the fins of several fish. What effect of water pollution does this best illustrate?`,
    correct: "Solid litter such as plastic can physically harm or trap aquatic animals",
    wrong: ["Plastic litter always dissolves harmlessly in water", "Plastic litter has no effect on aquatic animals", "This shows a health effect on humans, not the environment"],
    explanation: "Solid waste such as plastic bags can choke, trap or otherwise physically harm fish and other aquatic life — an environmental effect of pollution.",
  }),
];

export const waterPollution: Skill = {
  id: "g5-sci-matter-water-pollution",
  code: "MAT.2",
  subjectId: "science",
  strandId: "g5-sci-matter",
  grade: 5,
  title: "Water pollution",
  description: "Identifying water pollutants, effects of water pollution on living things, methods of reducing pollution, and 4 named basic water-treatment methods (boiling, filtration, chemical treatment, solar treatment).",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["pollutant-vs-reduction", "treatment-method-match", "effect-categorize", "filter-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "pollutant-vs-reduction") {
      const pollutants = shuffle(rng, POLLUTANTS).slice(0, 5);
      const reductions = shuffle(rng, REDUCTION_METHODS).slice(0, 5);
      const items = shuffle(rng, [
        ...pollutants.map((p, i) => ({ id: `p${i}`, label: p.text })),
        ...reductions.map((r, i) => ({ id: `r${i}`, label: r.text })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.id.startsWith("p") ? "pollutant" : "reduction";
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it pollutes water or helps reduce water pollution"),
        items,
        buckets: [
          { id: "pollutant", label: "Causes water pollution" },
          { id: "reduction", label: "Helps reduce water pollution" },
        ],
        correctBucket,
        hint: "Ask whether the action adds harmful substances to water, or helps keep them out.",
        explanation: items.map((it) => `"${it.label}" ${correctBucket[it.id] === "pollutant" ? "causes water pollution" : "helps reduce water pollution"}.`).join(" "),
      };
    }

    if (branch === "treatment-method-match") {
      const tokens = shuffle(rng, TREATMENT_METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, TREATMENT_METHODS.map((m) => ({ id: m.id, label: m.def })));
      const correctMap: Record<string, string> = {};
      for (const m of TREATMENT_METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "water treatment method to how it works"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each method actually does to make water safer.",
        explanation: TREATMENT_METHODS.map((m) => `${m.label} — ${m.def}.`).join(" "),
      };
    }

    if (branch === "effect-categorize") {
      const chosen = shuffle(rng, EFFECTS_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `e${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`e${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is mainly a human health effect or an environmental effect"),
        items,
        buckets: [
          { id: "health", label: "Human health" },
          { id: "environment", label: "Wider environment" },
        ],
        correctBucket,
        hint: "Diseases and skin problems are health effects; harm to fish, algae and water clarity are environmental effects.",
        explanation: chosen.map((f) => `"${f.text}" is mainly a ${f.category === "health" ? "human health" : "wider environment"} effect.`).join(" "),
      };
    }

    if (branch === "filter-order") {
      const shuffled = shuffle(rng, FILTER_MAKING_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of making a simple bottle water filter"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: FILTER_MAKING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Prepare the bottle and layers first (cloth, charcoal, sand, gravel), then pour and collect.",
        explanation: "Correct order: " + FILTER_MAKING_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Heating water until it boils, which kills most germs, is called ", after: ".", correctAnswer: "boiling" },
      { before: "Passing water through sand, charcoal and cloth layers to trap particles is called ", after: ".", correctAnswer: "filtration", alsoAccept: ["filtering"] },
      { before: "Adding chlorine or a water guard product to kill germs is called ", after: ".", correctAnswer: "chemical treatment" },
      { before: "Placing water in a clear bottle in strong sunlight to kill germs is called ", after: ".", correctAnswer: "solar treatment" },
      { before: "Drinking polluted water can cause diseases such as cholera and ", after: ".", correctAnswer: "typhoid" },
      { before: "Chemical waste from factories can poison and kill ", after: " in rivers and lakes.", correctAnswer: "fish", alsoAccept: ["fish and other aquatic animals"] },
      { before: "Planting trees and grass along riverbanks helps reduce ", after: " washing into the water.", correctAnswer: "soil", alsoAccept: ["silt"] },
      { before: "Using proper latrines instead of open defecation helps reduce ", after: " pollution of water sources.", correctAnswer: "sewage" },
      { before: "Excess nutrients from fertiliser runoff can cause ", after: " to grow rapidly in water.", correctAnswer: "algae" },
      { before: "Wearing gumboots and gloves is a safety precaution when working in a ", after: " environment.", correctAnswer: "water-polluted", alsoAccept: ["polluted"] },
      { before: "Plastic litter dumped into rivers can choke or trap ", after: ".", correctAnswer: "fish", alsoAccept: ["aquatic animals"] },
      { before: "Treating factory waste before release helps prevent ", after: " pollution.", correctAnswer: "water" },
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
      hint: "Think about pollutants, their effects, and the 4 named basic water treatment methods.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
