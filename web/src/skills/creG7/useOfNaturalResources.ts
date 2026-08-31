import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// CN.4 "Use of Natural Resources" has no natural sequence, spatial layout, or continuous
// numeric quantity in its source content (unordered lists of uses/misuses and two biblical
// teachings) — so this skill genuinely supports only 4 QuestionKinds (multiple-choice,
// categorize, click-match, fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const CATEGORIZE_PROMPTS = [
  "Sort each action as responsible use of natural resources or misuse of natural resources.",
  "Decide whether each action is responsible use or misuse, and sort it there.",
  "Group these actions under responsible use or misuse of resources.",
  "Sort each action below into the correct category.",
  "Place each action into the bucket for responsible use or misuse.",
  "Read each action and sort it under responsible use or misuse of natural resources.",
];

const MATCH_PROMPTS = [
  "Match each term or Bible reference to its meaning.",
  "Pair each term or reference below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each Bible reference or term to what it means.",
  "Link each term below to its correct definition.",
  "Match each term or reference to the statement that explains it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about natural resources with the right word.",
];

const RESPONSIBLE_USE = [
  "Harvesting timber only from a managed plantation, replanting as trees are cut",
  "Treating wastewater before it is released back into a river",
  "Using solar or geothermal energy instead of relying only on firewood",
  "Quarrying stone or sand under a permit that requires site rehabilitation afterward",
  "Recycling scrap metal instead of mining new ore unnecessarily",
  "Fishing within the legal season and size limits set to protect fish stocks",
  "Letting a piece of farmland lie fallow (rest) for a season to restore its fertility",
  "Using water-saving irrigation methods on a farm during a dry season",
  "Reporting illegal charcoal burning inside a protected forest",
  "Rehabilitating an old quarry site by replanting vegetation on it",
] as const;

const MISUSE_OF_RESOURCES = [
  "Dumping industrial waste directly into a river without treatment",
  "Harvesting river sand far beyond legal limits, destroying the riverbed",
  "Burning charcoal inside a protected forest reserve without a licence",
  "Overpumping a borehole until the water table drops sharply",
  "Quarrying stone and abandoning the pit without any rehabilitation",
  "Burning large amounts of fossil fuel unnecessarily, worsening air pollution",
  "Draining a wetland for construction without considering its role in flood control",
  "Mining minerals without any concern for the resulting land degradation",
  "Overgrazing communal land until it turns to bare, eroded soil",
  "Clearing a catchment forest that feeds a major river system",
] as const;

const BASIS: { term: string; meaning: string }[] = [
  { term: "Exodus 23:10-11", meaning: "The Israelites were to let their land rest and lie fallow every seventh year" },
  { term: "Deuteronomy 20:19", meaning: "Fruit trees were not to be destroyed, even when laying siege to a city" },
  { term: "Genesis 2:15", meaning: "The man was placed in the garden to till it and keep it" },
  { term: "Sabbatical year", meaning: "A year in which land is deliberately left to rest and recover" },
  { term: "Fallow", meaning: "Land that is deliberately left unplanted so it can regain fertility" },
  { term: "Renewable resource", meaning: "A natural resource that can replenish itself over time, such as water or forests" },
  { term: "Non-renewable resource", meaning: "A natural resource that cannot be replaced once it is used up, such as minerals" },
  { term: "Rehabilitation", meaning: "Restoring land or a site to a healthy state after it has been used" },
  { term: "Degradation", meaning: "The gradual damage or loss of quality in land or an ecosystem" },
  { term: "Catchment", meaning: "An area of land that collects rainwater and feeds it into a river or lake" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Mau Forest", "Turkana", "Nakuru", "Kwale", "Machakos", "Kericho", "Kajiado", "Nandi", "Kisumu", "Taita Taveta", "Baringo", "Kitui"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} learns that Exodus 23:10-11 instructed the Israelites to let their land rest every seventh year. What modern farming practice reflects this same principle?`,
      correct: "Leaving a plot fallow for a season so the soil can regain its fertility",
      wrong: ["Planting the same crop on the same land every single season without rest", "Clearing more forest every year to keep expanding farmland", "Using the maximum possible amount of fertiliser every season instead of resting the land"],
      explanation: "The sabbatical-year principle of letting land rest to recover is reflected today in practices like fallowing and crop rotation, which restore soil fertility rather than exhausting it.",
    };
  },
  (rng) => ({
    prompt: `A construction company near ${place(rng)} is harvesting sand from a riverbed far beyond the legal limit. What is the main environmental concern?`,
    correct: "Excessive sand harvesting destroys the riverbed, causing erosion and disrupting the river's ecosystem",
    wrong: ["Sand harvesting has no effect on a river no matter how much is taken", "Rivers automatically refill their sand supply within days", "Only the construction company's profits are affected by this, not the environment"],
    explanation: "Riverbeds take a long time to naturally replenish sand; harvesting far beyond legal limits destroys the riverbed structure and disrupts the wider river ecosystem.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} runs a quarry and, after extracting all the stone from a site, simply abandons the pit without doing anything further. What is missing from this practice?`,
      correct: "Rehabilitating the site, such as by refilling or replanting it, so the land can be useful again",
      wrong: ["Nothing is missing — quarry sites do not need any further action after use", "Digging the pit even deeper before leaving it", "Selling the abandoned pit as a swimming pool without any safety measures"],
      explanation: "Responsible resource use includes rehabilitating land after extraction, restoring it to a safer and more useful state rather than leaving it degraded.",
    };
  },
  (rng) => ({
    prompt: `A factory near ${place(rng)} releases untreated wastewater directly into a nearby stream. What is the responsible alternative?`,
    correct: "Treat the wastewater to remove harmful substances before releasing it",
    wrong: ["Release even more wastewater since the stream is large enough to absorb it", "Move the factory closer to the stream to save on pipe costs", "Ignore the wastewater since streams naturally clean themselves instantly"],
    explanation: "Untreated wastewater pollutes rivers and harms both people and wildlife who depend on them; treating it before release is the responsible practice.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps overpumping a borehole for irrigation, even as the water table visibly drops each year. What is the long-term risk of continuing this?`,
    correct: "The borehole could eventually run dry, leaving the community without that water source",
    wrong: ["Groundwater always refills instantly no matter how much is pumped", "There is no connection between pumping rate and water table levels", "Overpumping only affects the borehole owner and no one else nearby"],
    explanation: "Groundwater takes time to naturally recharge; pumping faster than it can refill risks depleting the source for the whole community that depends on it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} learns that Deuteronomy 20:19 forbade destroying fruit trees even during a siege of war. What underlying principle does this teach about natural resources?`,
      correct: "Even in urgent or difficult circumstances, resources that sustain future life should be protected, not destroyed",
      wrong: ["Fruit trees were the only resource the Bible ever protects", "Destroying resources is always acceptable during any conflict", "The instruction applied only to trees inside the city walls"],
      explanation: "Protecting fruit trees even in wartime shows that long-term, life-sustaining resources should not be destroyed for short-term advantage — a principle that still applies to environmental decisions today.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} notices that a catchment forest feeding a major river near ${place(rng)} is being cleared for settlement. What is the wider concern beyond the immediate loss of trees?`,
    correct: "Clearing a catchment area reduces the river's water supply and increases the risk of drought downstream",
    wrong: ["Clearing a catchment area has no effect on rivers fed by it", "Rivers are entirely unaffected by the condition of the land around them", "The concern is only aesthetic, with no impact on water supply"],
    explanation: "Catchment areas collect rainwater that feeds rivers; clearing this vegetation reduces water retention and can worsen drought and flooding downstream.",
  }),
  (rng) => ({
    prompt: `A community near ${place(rng)} debates whether to keep burning charcoal inside a protected forest reserve for quick income. What is the responsible, stewardship-minded concern?`,
    correct: "Unlicensed charcoal burning in a protected forest destroys a shared resource that many people depend on long-term",
    wrong: ["Protected forests exist only to look attractive and serve no practical purpose", "Charcoal burning inside a protected forest has no lasting effect on the ecosystem", "The forest will always regrow instantly no matter how much is cut"],
    explanation: "Protected forests provide water catchment, biodiversity, and climate benefits for a much wider community; unlicensed charcoal burning there sacrifices long-term shared benefit for short-term individual gain.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is comparing a renewable resource with a non-renewable one for a class assignment in ${place(rng)}. Which pair correctly matches each type?`,
    correct: "Forests are renewable (they can regrow); minerals are non-renewable (once mined, they cannot be replaced)",
    wrong: ["Forests are non-renewable; minerals are renewable", "Both forests and minerals are renewable in the same way", "Neither forests nor minerals can ever be considered resources"],
    explanation: "Renewable resources like forests can regenerate over time if managed well, while non-renewable resources like minerals cannot be replaced once extracted — a key distinction in responsible resource use.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that a wetland should be drained for new housing, while an environmental officer objects. What is the officer's strongest, stewardship-based concern?`,
    correct: "Wetlands help control flooding and support biodiversity, so draining one removes benefits shared by the whole area",
    wrong: ["Wetlands serve no purpose besides looking like unused land", "Draining a wetland always improves the local water supply", "Wetlands only matter in countries outside Kenya"],
    explanation: "Wetlands play an important role in flood control and supporting wildlife; draining them for construction sacrifices a shared environmental benefit for a single development project.",
  }),
];

export const useOfNaturalResources: Skill = {
  id: "g7-cre-cn-use-of-natural-resources",
  code: "CN.4",
  subjectId: "cre",
  strandId: "g7-cre-creation",
  grade: 7,
  title: "Use of Natural Resources",
  description: "Ways human beings use and misuse natural resources, the effects of misuse, and biblical teachings on the good use of God's creation (Genesis 2:15, Exodus 23:10-11, Deuteronomy 20:19).",
  generate(rng) {
    const branch = randChoice(rng, ["reasoning", "categorize", "match", "fill-blank"] as const);

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what responsible, sustainable use of natural resources looks like in this situation.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const good = shuffle(rng, RESPONSIBLE_USE).slice(0, 4);
      const bad = shuffle(rng, MISUSE_OF_RESOURCES).slice(0, 4);
      const chosen = shuffle(rng, [...good.map((t) => ({ text: t, good: true })), ...bad.map((t) => ({ text: t, good: false }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.good ? "responsible" : "misuse"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "responsible", label: "Responsible use" },
          { id: "misuse", label: "Misuse" },
        ],
        correctBucket,
        hint: "Responsible use protects a resource's ability to keep providing benefit long-term; misuse sacrifices that for short-term gain.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.good ? "responsible use" : "misuse"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, BASIS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((b) => ({ id: b.term, label: b.term })));
      const targets = shuffle(rng, chosen.map((b) => ({ id: b.term, label: b.meaning })));
      const correctMap: Record<string, string> = {};
      for (const b of chosen) correctMap[b.term] = b.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what the Bible teaches on good use of natural resources, and the terms used to describe them.",
        explanation: chosen.map((b) => `${b.term} — ${b.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const facts = [
      { before: "Exodus 23:10-11 taught that the Israelites should let their land rest every", after: "year.", answer: "seventh", accepted: ["seventh", "7th"] },
      { before: "Deuteronomy 20:19 forbade destroying", after: "trees, even during a siege of war.", answer: "fruit", accepted: ["fruit"] },
      { before: "A year in which land is deliberately left to rest and recover is called a", after: "year.", answer: "sabbatical", accepted: ["sabbatical"] },
      { before: "A resource that can replenish itself over time, such as water or forests, is called a", after: "resource.", answer: "renewable", accepted: ["renewable"] },
      { before: "A resource that cannot be replaced once it is used up, such as minerals, is called a", after: "resource.", answer: "non-renewable", accepted: ["non-renewable", "nonrenewable"] },
      { before: "Restoring land or a site to a healthy state after it has been used is called", after: ".", answer: "rehabilitation", accepted: ["rehabilitation"] },
      { before: "The gradual damage or loss of quality in land or an ecosystem is called", after: ".", answer: "degradation", accepted: ["degradation"] },
      { before: "An area of land that collects rainwater and feeds it into a river or lake is called a", after: ".", answer: "catchment", accepted: ["catchment"] },
      { before: "Land that is deliberately left unplanted so it can regain fertility is described as", after: ".", answer: "fallow", accepted: ["fallow"] },
      { before: "Genesis 2:15 says the man was placed in the garden to till it and", after: "it.", answer: "keep", accepted: ["keep"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the biblical teachings on good use of natural resources.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
