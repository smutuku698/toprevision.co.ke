import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 1.1 Soil Conservation — identifying poor-soil sites, constructing an
// organic waste pit, and using plant remains/organic waste to improve soil. See
// curriculum-reference/grade-5/agriculture.json.

const POOR_SOIL_SIGNS = [
  { text: "Crops planted in the area consistently grow small and weak", isPoorSoilSign: true },
  { text: "The soil looks pale, cracked and has almost no dark organic matter in it", isPoorSoilSign: true },
  { text: "Very few weeds or plants grow naturally on the bare patch", isPoorSoilSign: true },
  { text: "Water runs off the surface quickly instead of soaking in", isPoorSoilSign: true },
  { text: "The soil is dark, crumbly and full of earthworms", isPoorSoilSign: false },
  { text: "Crops planted nearby grow tall, green and healthy every season", isPoorSoilSign: false },
  { text: "The area has a thick layer of composted plant matter mixed into it", isPoorSoilSign: false },
  { text: "Rainwater soaks in easily and the ground stays moist for days", isPoorSoilSign: false },
] as const;

const ORGANIC_WASTE_TYPES = [
  "Slashed grass and weeds from the compound",
  "Vegetable peelings and food remains from the kitchen",
  "Dry fallen leaves swept from under trees",
  "Crop residue left over after harvesting maize or beans",
  "Manure and other animal waste from the livestock pen",
  "Wilted or spoiled vegetables from the garden",
] as const;

const WASTE_SOURCE_PAIRS = [
  { id: "grass", item: "Slashed grass and weeds", source: "The compound" },
  { id: "peelings", item: "Vegetable peelings and food remains", source: "The kitchen" },
  { id: "leaves", item: "Dry fallen leaves", source: "Under the trees in the yard" },
  { id: "residue", item: "Crop residue left after harvest", source: "The farm or garden" },
  { id: "manure", item: "Manure and animal waste", source: "The livestock pen" },
  { id: "wilted", item: "Wilted or spoiled vegetables", source: "The garden" },
] as const;

const PIT_STEPS = [
  { id: "s1", label: "Identify and mark a suitable site away from the house and water sources" },
  { id: "s2", label: "Dig a pit or build a simple structure of a suitable depth" },
  { id: "s3", label: "Add layers of plant residue, food remains and organic kitchen waste into the pit" },
  { id: "s4", label: "Leave the organic waste to decompose over time" },
  { id: "s5", label: "Mix or spread the decomposed material into the poor soil site" },
  { id: "s6", label: "Plant a crop in the improved soil and observe its growth" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices a patch of ground near the school in ${place(rng)} where crops always grow small and weak, and the soil looks pale with almost no dark matter. What should ${who} do first?`,
      correct: "Identify the patch as a site needing soil improvement, and plan to add organic waste there",
      wrong: ["Plant even more crops there without changing anything", "Assume nothing can be done and avoid the site permanently", "Water the area more heavily without adding any organic matter"],
      explanation: "Pale, poor-looking soil with weak crop growth is a sign the site needs soil improvement — the first step is identifying it, then adding organic waste.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} digs a pit away from the house and regularly adds vegetable peelings, dry leaves and slashed grass to it. What are they doing?`,
    correct: "Constructing and using an organic waste pit to improve poor soil",
    wrong: ["Digging a rubbish pit with no further use", "Building a water storage tank", "Preparing a pit for burning waste"],
    explanation: "Collecting plant residue, food remains and organic kitchen waste in a pit is exactly how an organic waste pit for soil improvement is built and used.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} plants a crop directly into an old organic waste pit in ${place(rng)} that has had decomposed plant matter added to it for months. What result would ${who} most likely observe?`,
      correct: "Better crop growth, since the decomposed organic waste has improved the soil there",
      wrong: ["No difference at all compared to untreated poor soil", "Worse crop growth than in untreated poor soil", "The crop would fail to grow at all in any improved soil"],
      explanation: "Accumulated organic waste that has decomposed improves soil fertility, which is why crops planted in a residue pit tend to grow better.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} chooses to site an organic waste pit far from the house and any water source, rather than right next to them. Why is this a sensible choice?`,
    correct: "Keeping the decomposing waste away from living areas and water sources avoids bad smells and possible contamination",
    wrong: ["Distance from the house has no effect on how well the pit works", "Placing it near water actually speeds up decomposition safely", "It should always be placed as close to the house as possible for convenience"],
    explanation: "Siting a waste pit away from the house and water sources avoids odour problems and the risk of contaminating drinking water.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} compares two patches of ground: one where organic waste has been added and left to decompose for a season, and one bare patch that never received any waste. Which patch would likely support healthier crops?`,
      correct: "The patch where organic waste was added and left to decompose",
      wrong: ["Both patches would grow crops equally well", "The untreated bare patch, since it has not been disturbed", "Neither patch could ever support crop growth"],
      explanation: "Adding and decomposing organic waste improves soil fertility, so the treated patch would typically support healthier crop growth than untreated poor soil.",
    };
  },
  (rng) => ({
    prompt: `A school garden club in ${place(rng)} collects only dry leaves and slashed grass for their organic waste pit, ignoring kitchen food remains. What could they add to make the pit more effective, based on the curriculum's own examples?`,
    correct: "Suitable food remains and organic kitchen wastes, alongside the plant residue they already collect",
    wrong: ["Only more of the same dry leaves and grass, nothing else", "Plastic waste and other non-organic materials", "Nothing more — dry leaves and grass alone are the only material ever used"],
    explanation: "The curriculum names plant residue, suitable food remains AND organic kitchen wastes together as material for the pit — kitchen waste is just as valid a contribution as plant residue.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} observes that a compound in ${place(rng)} has crops growing tall and green in one corner, right where the family has been dumping organic kitchen waste for over a year. What is the most likely explanation?`,
      correct: "The accumulated organic waste has broken down and improved the soil's fertility in that spot",
      wrong: ["The healthy growth is completely unrelated to the waste dumping", "Dumping waste always harms crop growth regardless of the material", "The crops there receive extra sunlight that other areas lack"],
      explanation: "Where organic waste accumulates and decomposes over time, soil fertility tends to improve, supporting healthier crop growth — exactly the outcome this sub-strand's activity demonstrates.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} wants to identify a site in the school compound that most needs soil improvement. Which observation would be the strongest evidence that a site needs improving?`,
    correct: "Crops planted there consistently grow small and weak, and the soil looks pale with little organic matter",
    wrong: ["The site receives plenty of sunlight throughout the day", "The site is located close to the classroom block", "The site is flat and easy to walk across"],
    explanation: "Weak crop growth and pale, organic-matter-poor soil are the clearest signs that a site needs soil improvement — sunlight, location and flatness don't indicate soil quality.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is assigned to help construct an organic waste pit for a class project in ${place(rng)}. After digging the pit and adding organic waste, what should happen next before the soil can actually be used?`,
      correct: "The organic waste needs time to decompose before it can be used to improve the soil",
      wrong: ["The soil can be used to plant crops immediately after adding fresh waste", "The pit should be emptied out again right away", "Nothing further needs to happen — decomposition is not necessary"],
      explanation: "Organic waste must be left to decompose before it becomes useful for improving soil — this is a necessary step, not an optional one.",
    };
  },
  (rng) => ({
    prompt: `A community group in ${place(rng)} sets up a shared organic waste pit that any household nearby can contribute food scraps and plant waste to. What environmental benefit does this bring, beyond just improving one family's soil?`,
    correct: "It recycles organic waste that would otherwise be thrown away, reducing waste while improving soil across the community",
    wrong: ["It has no environmental benefit beyond convenience", "It increases the total amount of waste produced in the community", "It only benefits the environment if the waste is burned instead"],
    explanation: "A shared organic waste pit recycles waste that would otherwise be discarded, which is both a soil-improvement practice and an environmental conservation benefit.",
  }),
];

export const soilConservation: Skill = {
  id: "g5-ag-conservation-soil-conservation",
  code: "CR.1",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-conservation",
  grade: 5,
  title: "Soil conservation",
  description: "Identifying sites needing soil improvement, constructing an organic waste pit, and using plant remains and organic waste to improve soil fertility.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["soil-sign-categorize", "waste-type-categorize", "waste-source-match", "pit-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "soil-sign-categorize") {
      const chosen = shuffle(rng, POOR_SOIL_SIGNS).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.isPoorSoilSign ? "poor" : "good"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a sign of poor soil or a sign of good, healthy soil"),
        items,
        buckets: [
          { id: "poor", label: "Sign of poor soil" },
          { id: "good", label: "Sign of good, healthy soil" },
        ],
        correctBucket,
        hint: "Think about crop growth, soil colour, organic matter, and how water behaves on the surface.",
        explanation: chosen.map((s) => `"${s.text}" is a sign of ${s.isPoorSoilSign ? "poor" : "good, healthy"} soil.`).join(" "),
      };
    }

    if (branch === "waste-type-categorize") {
      const good = shuffle(rng, [...ORGANIC_WASTE_TYPES]).slice(0, 5);
      const notOrganic = ["Plastic bottles and wrappers", "Broken glass pieces", "Metal scrap and tin cans", "Old batteries"];
      const chosenBad = shuffle(rng, notOrganic).slice(0, 3);
      const items = shuffle(rng, [
        ...good.map((g, i) => ({ id: `g${i}`, label: g })),
        ...chosenBad.map((b, i) => ({ id: `b${i}`, label: b })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.id.startsWith("g") ? "suitable" : "unsuitable";
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is suitable organic waste for the pit, or not suitable at all"),
        items,
        buckets: [
          { id: "suitable", label: "Suitable for the organic waste pit" },
          { id: "unsuitable", label: "Not suitable — not organic" },
        ],
        correctBucket,
        hint: "The pit is for organic (plant/food) material that decomposes — not plastic, glass or metal.",
        explanation: items.map((it) => `"${it.label}" is ${correctBucket[it.id] === "suitable" ? "suitable organic waste" : "not suitable, since it is not organic and won't decompose"}.`).join(" "),
      };
    }

    if (branch === "waste-source-match") {
      const chosen = shuffle(rng, WASTE_SOURCE_PAIRS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.item })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.source })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "type of organic waste to where it typically comes from"),
        tokens,
        targets,
        correctMap,
        hint: "Think about which part of a home or farm each kind of organic waste usually comes from.",
        explanation: chosen.map((p) => `${p.item} typically comes from ${p.source.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "pit-order") {
      const shuffled = shuffle(rng, PIT_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of building and using an organic waste pit for soil improvement"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PIT_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Choose the site first, then dig, then add waste, then wait for decomposition before using the soil.",
        explanation: "Correct order: " + PIT_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A pit dug to collect plant residue, food remains and kitchen waste for soil improvement is called an ", after: ".", correctAnswer: "organic waste pit" },
      { before: "Crops that consistently grow small and weak in pale soil are a sign the site needs soil ", after: ".", correctAnswer: "improvement" },
      { before: "Organic waste added to a pit must be left to ", after: " before it can improve the soil.", correctAnswer: "decompose" },
      { before: "An organic waste pit should be sited away from the house and any ", after: " to avoid contamination.", correctAnswer: "water source", alsoAccept: ["water sources"] },
      { before: "Suitable material for an organic waste pit includes plant residue, food remains and organic kitchen ", after: ".", correctAnswer: "waste", alsoAccept: ["wastes"] },
      { before: "Plastic, glass and metal are ", after: " material for an organic waste pit, since they do not decompose.", correctAnswer: "unsuitable", alsoAccept: ["not suitable"] },
      { before: "After a residue pit's waste has decomposed, it can be used to plant a ", after: " and observe soil improvement.", correctAnswer: "crop" },
      { before: "Soil that is dark, crumbly and full of earthworms is a sign of ", after: " soil.", correctAnswer: "good", alsoAccept: ["healthy"] },
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
      hint: "Think about identifying poor soil, building the pit, and what makes waste suitable for it.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
