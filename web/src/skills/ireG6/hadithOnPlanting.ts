import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No verse-by-verse sequence exists for this sub-strand, but the Hadith's own subject — planting —
// genuinely supports a real-world sequence: the steps someone takes to plant and care for a tree,
// which is exactly how the ongoing charity described in the Hadith comes about.
const ORDER_PROMPTS = [
  "Arrange these steps for planting and caring for a tree in the order they should happen.",
  "Put these steps for growing a tree into the correct order.",
  "Sequence these steps for planting a tree, from first to last.",
  "Order these steps for planting and caring for a tree correctly.",
  "Sort these steps for growing a tree into the order they occur.",
  "Arrange these steps for planting a tree in the order they should be taken.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of this Hadith it describes.",
  "Group each statement under the aspect of the Hadith it describes.",
  "Decide which aspect of the Hadith each statement describes, and sort it there.",
  "Sort each fact into the aspect of the Hadith it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of the Hadith.",
];

const MATCH_PROMPTS = [
  "Match each term about this Hadith to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about planting and charity.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const PLANTING_STEPS = [
  { id: "choose-spot", label: "Choose a good spot to plant, with enough sunlight, space and access to water" },
  { id: "prepare-soil", label: "Prepare the soil and dig a hole for the seedling or seed" },
  { id: "plant-tree", label: "Plant the tree or sow the seeds into the ground" },
  { id: "water-care", label: "Water and care for the young tree or crop regularly as it grows" },
  { id: "let-benefit", label: "Let people, animals and birds benefit from what it produces as it matures, which the Hadith counts as ongoing charity" },
];

interface TopicFact {
  text: string;
  topic: "charity" | "stewardship" | "beneficiaries";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  charity: "How planting counts as charity (sadaqa)",
  stewardship: "Caring for the environment as an act of worship",
  beneficiaries: "Who the Hadith says may benefit from what is planted",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Planting a tree or sowing a field is counted as an act of charity (sadaqa) in Islam", topic: "charity" },
  { text: "The reward continues even after the person who planted it can no longer tend it", topic: "charity" },
  { text: "This Hadith on planting was narrated by Muslim", topic: "charity" },
  { text: "Every time something eats from what was planted, the planter continues to earn reward", topic: "charity" },
  { text: "Caring for the environment through planting is treated as an act of worship, not just a practical task", topic: "stewardship" },
  { text: "Needlessly cutting down trees goes against the spirit of this Hadith's teaching", topic: "stewardship" },
  { text: "Muslims are encouraged to actively plant and care for trees and crops, not merely avoid harming them", topic: "stewardship" },
  { text: "This teaching connects environmental care directly with a Muslim's worship and reward", topic: "stewardship" },
  { text: "The Hadith names men (people) as one group who may benefit from what is planted", topic: "beneficiaries" },
  { text: "The Hadith names animals as a group who may benefit from what is planted", topic: "beneficiaries" },
  { text: "The Hadith names birds as a group who may benefit from what is planted", topic: "beneficiaries" },
  { text: "A single act of planting can benefit many different creatures over a long period of time", topic: "beneficiaries" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Sadaqa", meaning: "Charity — a voluntary good deed, which this Hadith says continues from a planted tree or field" },
  { term: "Sadaqa jariyah", meaning: "Ongoing/continuous charity — reward that keeps flowing even after the giver can no longer act, as with a mature tree" },
  { term: "Stewardship", meaning: "Responsible care of the environment, which this Hadith treats as a rewarded form of worship" },
  { term: "Muslim (the narrator)", meaning: "The collector of Hadith who recorded this saying of the Prophet (S.A.W.) on planting" },
  { term: "Sowing", meaning: "Planting seeds into the ground, named alongside tree-planting in this Hadith" },
  { term: "Beneficiaries (in this Hadith)", meaning: "Men, animals and birds — the three groups named as able to benefit from what is planted" },
  { term: "Reward (ajr)", meaning: "The spiritual benefit a Muslim earns for a good deed, which keeps accumulating from a planted tree" },
  { term: "Deforestation", meaning: "Needless cutting down of trees, which conflicts with this Hadith's encouragement to plant and preserve" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, plants a mango tree at school during a tree-planting day but wonders why this counts as charity when no money was given. Applying this Hadith, what is the best explanation?`,
    correct: "The tree will continue producing fruit that people, animals and birds eat, and each time that happens it counts as ongoing charity from the planter",
    wrong: [
      "It does not actually count as charity, since only money donations qualify",
      "It counts as charity only on the day it is planted, and never again after that",
      "It only counts as charity if the school later sells the fruit for profit",
    ],
    explanation: "This Hadith explicitly says that whatever people, animals or birds eat from a planted tree or field is charity from the planter — it is not limited to money and continues over time.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s grandmother in ${place(rng)} planted a large mango tree decades ago; today, neighbours, birds and even stray goats eat its fruit. Applying this Hadith, what continues to happen for the grandmother?`,
      correct: "She continues to earn reward from Allah every time anyone or anything eats from the tree, even now",
      wrong: [
        "Nothing further happens, since her reward ended the moment the tree matured",
        "The reward only applies while she was alive to personally hand out the fruit",
        "The reward transfers entirely to whoever currently owns the land, not to her",
      ],
      explanation: "The Hadith describes this as an ongoing act of charity — the person who planted it keeps earning reward for as long as people, animals or birds continue to benefit.",
    };
  },
  (rng) => ({
    prompt: `A community group in ${place(rng)} cuts down several large trees for firewood without planting any replacements. Applying the spirit of this Hadith, what is the concern with this?`,
    correct: "It goes against the Hadith's encouragement to plant and preserve trees, removing a source of ongoing benefit for people, animals and birds",
    wrong: [
      "There is no concern, since this Hadith only discusses planting and says nothing about cutting trees",
      "The concern is only financial, since firewood earns less money than fruit",
      "The concern applies only if the trees were planted by a Muslim originally",
    ],
    explanation: "While the Hadith's direct wording is about planting, its spirit — rewarding what benefits creation — is undermined by needlessly removing trees that already provide that benefit.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A farmer in ${place(rng)} complains that birds keep eating grain from the family's maize field. Applying this Hadith, how should ${who} help the farmer see this differently?`,
      correct: "Point out that grain eaten by birds from a sown field is described in this Hadith as charity from the one who sowed it",
      wrong: [
        "Agree that the birds are simply causing pure loss with no religious significance",
        "Suggest the farmer should have kept the field completely sealed off from all animals",
        "Explain that only losses to other humans count as charity, not losses to birds",
      ],
      explanation: "This Hadith specifically names birds, alongside men and animals, as beneficiaries whose eating from a sown field counts as charity for the farmer.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} believes that only handing money directly to a poor person counts as charity in Islam. Evaluate this belief using this Hadith.`,
    correct: "Too narrow — this Hadith shows that planting a tree or sowing a field, which indirectly benefits people, animals and birds over time, also counts as charity",
    wrong: [
      "Correct — this Hadith only discusses trees and does not relate to charity at all",
      "Correct — planting is a completely separate category from charity in Islam",
      "Too narrow — but only because charity must always involve farm produce, never money",
    ],
    explanation: "This Hadith broadens the idea of charity beyond direct money-giving to include indirect, ongoing benefit such as food from a planted tree or field.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks whether planting a tree still earns reward for a person even after that person has passed away. Based on this Hadith, what is the correct answer?`,
      correct: "Yes — the reward continues as long as people, animals or birds continue to benefit from what was planted",
      wrong: [
        "No — all reward for a good deed ends the moment the person passes away",
        "Yes, but only for exactly one year after the person passes away",
        "No — this Hadith only applies to trees planted by prophets",
      ],
      explanation: "The Hadith describes this as ongoing charity (sadaqa jariyah in spirit) — the benefit, and the reward, continues beyond the planter's own ability to act, even after death.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says growing vegetables at home is "just a hobby" with no religious value. Applying this Hadith, what is the flaw in this view?`,
    correct: "Growing food that others, animals or birds eventually eat from can itself count as an act of charity and worship, not merely a hobby",
    wrong: [
      "There is no flaw, since gardening is never connected to worship in Islam",
      "The flaw is that only large-scale farming, not home gardens, can count as charity",
      "The flaw is that vegetables specifically are excluded from this Hadith, unlike trees",
    ],
    explanation: "This Hadith applies to sowing a field generally, meaning even small-scale growing that benefits others can carry the same charitable reward it describes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that planting only benefits the environment and has nothing to do with worship or reward. Is this reasoning accurate?`,
    correct: "No — this Hadith directly ties planting to spiritual reward, treating it as an act of charity, not only an environmental benefit",
    wrong: [
      "Yes — Islamic teaching keeps environmental actions completely separate from worship",
      "Yes — reward in Islam only comes from prayer, fasting and direct almsgiving",
      "No — but only because planting is described as more important than prayer",
    ],
    explanation: "The Hadith explicitly frames planting as charity, connecting an environmentally beneficial act directly to spiritual reward.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} plants a single tree at home in ${place(rng)}; years later it has fed several families, many birds, and passing livestock. What does this situation best illustrate about generosity in Islam, based on this Hadith?`,
      correct: "One act of generosity can be indirect and ongoing, benefiting many over a long period, rather than needing to be repeated each time",
      wrong: [
        "Generosity in Islam only counts when it is repeated identically every single day",
        "Generosity must always be given directly, face-to-face, to be counted at all",
        "This situation shows generosity has no lasting effect once the original act is done",
      ],
      explanation: "The Hadith shows that a single act — planting — can generate ongoing, wide-reaching benefit and reward, illustrating that generosity does not need to be direct or repeated to keep counting.",
    };
  },
];

export const hadithOnPlanting: Skill = {
  id: "g6-ire-ha-planting",
  code: "HA.3",
  subjectId: "ire",
  strandId: "g6-ire-hadith",
  grade: 6,
  title: "Hadith on Planting",
  description: "The Hadith 'If a Muslim plants a tree or sows a field and men, animals and birds eat from it, all of it is charity from him' (Muslim): planting as ongoing charity and environmental stewardship as worship.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, PLANTING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from choosing a spot to the tree benefiting others.",
        items,
        correctOrder: PLANTING_STEPS.map((s) => s.id),
        hint: "It begins with choosing where to plant, and ends with people, animals and birds benefiting from what grows.",
        explanation: PLANTING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const charity = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "charity")).slice(0, 3);
      const stewardship = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "stewardship")).slice(0, 3);
      const beneficiaries = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "beneficiaries")).slice(0, 3);
      const chosen = shuffle(rng, [...charity, ...stewardship, ...beneficiaries]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["charity", "stewardship", "beneficiaries"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about planting as charity, some about caring for the environment as worship, and some about who benefits.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term refers to in the Hadith's teaching on planting as charity.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what this Hadith says counts as charity, and who it says can benefit from it.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "If a Muslim plants a tree or sows a field and men, animals and birds eat from it, all of it is", after: "from him.", answer: "charity", accepted: ["charity", "sadaqa"] },
      { before: "If a Muslim plants a tree or", after: "a field and men, animals and birds eat from it, all of it is charity from him.", answer: "sows", accepted: ["sows"] },
      { before: "If a Muslim plants a tree or sows a field and men, animals and", after: "eat from it, all of it is charity from him.", answer: "birds", accepted: ["birds"] },
      { before: "This Hadith on planting was narrated by", after: ".", answer: "Muslim", accepted: ["muslim"] },
      { before: "Charity — a voluntary good deed that continues from a planted tree — is called", after: "in Arabic.", answer: "sadaqa", accepted: ["sadaqa"] },
      { before: "The reward from planting a tree continues even after the person who planted it can no longer", after: "it.", answer: "tend", accepted: ["tend", "care for"] },
      { before: "Caring for the environment through planting is treated in Islam as an act of", after: ".", answer: "worship", accepted: ["worship", "ibadah"] },
      { before: "Needlessly cutting down trees goes against the", after: "of this Hadith's teaching.", answer: "spirit", accepted: ["spirit"] },
      { before: "Muslims are encouraged to actively plant and care for trees and crops, not merely", after: "harming them.", answer: "avoid", accepted: ["avoid"] },
      { before: "A single act of planting can benefit many different", after: "over a long period of time.", answer: "creatures", accepted: ["creatures", "animals"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall exactly what this Hadith says happens when men, animals and birds eat from a planted tree or field.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
