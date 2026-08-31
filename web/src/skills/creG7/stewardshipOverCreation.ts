import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each action as good stewardship or poor stewardship over animals, fish, and birds.",
  "Decide whether each action is good or poor stewardship, and sort it there.",
  "Group these actions under good stewardship or poor stewardship.",
  "Sort each action below into the correct stewardship category.",
  "Place each action into the bucket for good or poor stewardship.",
  "Read each action and sort it under good or poor stewardship.",
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
  "Supply the word that completes this fact about stewardship.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact with the right word.",
];

// CN.2 "Stewardship over Creation" (responsibility over animals, fish, and birds) has no
// natural sequence, spatial layout, or numeric quantity in its source content (unordered
// lists of responsible/irresponsible actions and one biblical basis) — so this skill
// genuinely supports only 4 QuestionKinds (multiple-choice, categorize, click-match,
// fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const GOOD_STEWARDSHIP = [
  "Reporting an injured wild animal to Kenya Wildlife Service or a local ranger",
  "Providing clean water and adequate shelter for livestock",
  "Supporting community conservancies that protect wildlife habitats",
  "Avoiding the hunting of protected wild animals for bushmeat",
  "Planting indigenous trees to restore habitats for birds and animals",
  "Taking part in clean-ups that stop plastic waste from harming lake or ocean life",
  "Reporting poachers or illegal wildlife trade to the authorities",
  "Supporting wildlife corridors that let animals move safely between protected areas",
  "Practising sustainable fishing that lets fish stocks recover",
  "Vaccinating and properly feeding domestic animals",
] as const;

const POOR_STEWARDSHIP = [
  "Dumping plastic waste into rivers and lakes where fish and birds live",
  "Poaching elephants for their ivory",
  "Overfishing a lake without allowing fish stocks to recover",
  "Clearing a forest that is a habitat for birds and animals with no replanting",
  "Neglecting to feed or water livestock left in an enclosure",
  "Setting illegal snares that trap and injure wild animals",
  "Killing wild snakes or birds out of fear instead of seeking safe removal",
  "Overgrazing land until it can no longer support animal life",
  "Buying jewellery or ornaments made from illegally poached ivory",
  "Abandoning an unwanted pet on the roadside",
] as const;

const BASIS: { term: string; meaning: string }[] = [
  { term: "Genesis 2:15", meaning: "God placed the man in the garden to till it and keep it" },
  { term: "Genesis 1:28", meaning: "God gave human beings dominion (responsibility) over every living creature" },
  { term: "James 3:7", meaning: "Human beings have been able to tame every kind of animal, bird, reptile, and sea creature" },
  { term: "Dominion", meaning: "A God-given responsibility to care for and manage creation, not a licence to misuse it" },
  { term: "Stewardship", meaning: "Responsibly managing something that ultimately belongs to God" },
  { term: "Poaching", meaning: "Illegally hunting or capturing protected wild animals" },
  { term: "Conservancy", meaning: "Land set aside and managed to protect wildlife habitats" },
  { term: "Overfishing", meaning: "Catching fish faster than their populations can naturally recover" },
  { term: "Wildlife corridor", meaning: "A protected route that lets animals move safely between habitats" },
  { term: "Habitat", meaning: "The natural environment where an animal, fish, or bird normally lives" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kajiado", "Kisumu", "Nakuru", "Turkana", "Mombasa", "Naivasha", "Nyeri", "Machakos", "Narok", "Samburu", "Taita", "Kwale"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family farm near ${place(rng)} keeps losing crops to elephants at night. What is the most responsible, Bible-guided response?`,
      correct: "Use safe deterrents such as a beehive fence and report the conflict to Kenya Wildlife Service",
      wrong: ["Poison the elephants so they never return", "Ignore the problem since elephants are wild and not the family's responsibility", "Hunt the elephants for ivory to recover some of the lost income"],
      explanation: "Genesis 2:15 calls human beings to till and keep the land responsibly, which includes protecting both crops and wildlife — poisoning or poaching elephants destroys the very creation humans are called to steward.",
    };
  },
  (rng) => ({
    prompt: `A fisherman near ${place(rng)} on Lake Victoria uses a very small-mesh net that catches young, immature fish. Why is this a poor stewardship practice?`,
    correct: "It prevents young fish from growing and reproducing, so the fish population cannot recover",
    wrong: ["It is illegal only because of the net's colour, not its mesh size", "Small-mesh nets are always the most environmentally friendly choice", "It has no long-term effect on fish stocks at all"],
    explanation: "Catching young fish before they can breed reduces future fish stocks — sustainable fishing, part of responsible stewardship, uses mesh sizes that let immature fish escape and grow.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds an injured stork near ${place(rng)} and wants to help it. What should ${who} do?`,
      correct: "Report it to Kenya Wildlife Service or a wildlife rescue centre for proper care",
      wrong: ["Keep the stork as a pet at home indefinitely", "Leave it exactly where it is and do nothing at all", "Sell the injured bird to a passer-by for quick money"],
      explanation: "Responsible stewardship over birds means getting an injured wild animal proper professional care, not keeping or selling it, which can further harm the bird and is often illegal.",
    };
  },
  (rng) => ({
    prompt: `A herder near ${place(rng)} keeps grazing the same small patch of land season after season, even during a drought. What effect does this have on stewardship over the land and its animals?`,
    correct: "Overgrazing strips the land of vegetation until it can no longer support animal life",
    wrong: ["It has no effect since grass always grows back the same day it is eaten", "It actually improves the soil every time it happens", "It only affects the herder's own animals and nothing else in the area"],
    explanation: "Overgrazing removes vegetation faster than it can regrow, degrading the land so it can no longer sustain animals — rotating grazing land is the responsible practice.",
  }),
  (rng) => ({
    prompt: `A trader in ${place(rng)} is offered jewellery made from ivory to resell in the market. What is the responsible, Bible-guided response?`,
    correct: "Refuse to buy or sell it, and report the trade to the authorities",
    wrong: ["Buy it since the elephant is already dead and cannot be helped now", "Buy it only if the price is very low", "Sell it quietly since ivory trade is only a problem outside Kenya"],
    explanation: "Buying or selling ivory sustains the demand that drives poaching, harming elephant populations — good stewardship means refusing to participate in and reporting illegal wildlife trade.",
  }),
  (rng) => ({
    prompt: `A community near Lake ${place(rng)} notices fish and water birds dying after plastic waste builds up along the shoreline. What is the most responsible community response?`,
    correct: "Organise a clean-up and set up proper waste disposal to stop plastic reaching the water",
    wrong: ["Wait for the plastic to naturally disappear on its own", "Move the fishing activity to a different lake instead", "Assume the deaths are unrelated to the plastic waste"],
    explanation: "Plastic waste harms fish and birds directly; taking responsibility for the community's own waste is part of the stewardship God gave human beings over creation.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s school in ${place(rng)} is starting a small poultry project. Which practice best reflects good stewardship over the birds?`,
      correct: "Building a proper coop and providing consistent clean water and feed",
      wrong: ["Leaving the birds to find their own food and water unsupervised", "Keeping far more birds than the coop can properly hold", "Selling the birds immediately without ever caring for them"],
      explanation: "Good stewardship over animals in one's care means meeting their basic needs consistently, not leaving them to fend for themselves or overcrowding them.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} regularly catches wild birds to sell as pets in the local market. Why does this go against good stewardship?`,
    correct: "It removes wild birds from their natural population and habitat, harming the species over time",
    wrong: ["It has no effect on wild bird populations at all", "It is only wrong if the birds are sold outside Kenya", "It is a form of conservation because it protects the birds from other threats"],
    explanation: "Repeatedly capturing wild birds for sale reduces their wild population and disrupts their habitat, which is the opposite of the responsible stewardship James 3:7 assumes human beings are capable of.",
  }),
  (rng) => ({
    prompt: `A county government near ${place(rng)} is deciding whether to allow farms to expand into a wildlife corridor bordering a national park. What is the stewardship-minded concern?`,
    correct: "Blocking the corridor would cut off animals' safe movement between habitats, increasing conflict and harm",
    wrong: ["Wildlife corridors have no real purpose and can be built over freely", "Animals do not need to move between habitats at all", "Farming and wildlife corridors never come into conflict"],
    explanation: "Wildlife corridors let animals move safely between habitats; blocking them for farmland increases human-wildlife conflict and harms the animals that depend on that movement.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s dog in ${place(rng)} regularly chases and kills wild birds in the neighbourhood. What is the responsible response?`,
    correct: "Control and supervise the dog so it cannot keep harming wild birds",
    wrong: ["Allow it to continue since dogs cannot really be controlled", "Encourage the dog since it reduces the number of birds around the compound", "Assume it is the birds' own responsibility to stay away"],
    explanation: "Being a good steward over creation includes controlling one's own domestic animals so they do not needlessly harm wildlife around them.",
  }),
];

export const stewardshipOverCreation: Skill = {
  id: "g7-cre-cn-stewardship-over-creation",
  code: "CN.2",
  subjectId: "cre",
  strandId: "g7-cre-creation",
  grade: 7,
  title: "Stewardship over Creation",
  description: "The biblical responsibility given to human beings over animals, fish, and birds (Genesis 2:15-20, James 3:7), and ways to practise good stewardship over them.",
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
        hint: "Think about what responsible, Bible-guided stewardship over animals, fish, and birds looks like in this situation.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const good = shuffle(rng, GOOD_STEWARDSHIP).slice(0, 4);
      const poor = shuffle(rng, POOR_STEWARDSHIP).slice(0, 4);
      const chosen = shuffle(rng, [...good.map((t) => ({ text: t, good: true })), ...poor.map((t) => ({ text: t, good: false }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "good", label: "Good stewardship" },
          { id: "poor", label: "Poor stewardship" },
        ],
        correctBucket,
        hint: "Good stewardship protects and cares for God's creation; poor stewardship harms or exploits it.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.good ? "good stewardship" : "poor stewardship"}.`).join(" "),
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
        hint: "Think about what the Bible teaches about human responsibility over animals, fish, and birds.",
        explanation: chosen.map((b) => `${b.term} — ${b.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const facts = [
      { before: "Genesis 2:15 says God placed the man in the garden to till it and", after: "it.", answer: "keep", accepted: ["keep"] },
      { before: "James 3:7 says human beings have been able to", after: "every kind of animal, bird, reptile, and sea creature.", answer: "tame", accepted: ["tame"] },
      { before: "Illegally hunting or capturing protected wild animals is called", after: ".", answer: "poaching", accepted: ["poaching"] },
      { before: "Catching fish faster than their populations can recover is called", after: ".", answer: "overfishing", accepted: ["overfishing"] },
      { before: "A protected route that lets animals move safely between habitats is a wildlife", after: ".", answer: "corridor", accepted: ["corridor"] },
      { before: "Land set aside and managed to protect wildlife habitats is called a", after: ".", answer: "conservancy", accepted: ["conservancy"] },
      { before: "Responsibly managing something that ultimately belongs to God is called", after: ".", answer: "stewardship", accepted: ["stewardship"] },
      { before: "God gave human beings", after: "(responsibility) over every living creature.", answer: "dominion", accepted: ["dominion"] },
      { before: "The natural environment where an animal normally lives is called its", after: ".", answer: "habitat", accepted: ["habitat"] },
      { before: "Injured wild animals should be reported to Kenya Wildlife Service instead of being kept as", after: ".", answer: "pets", accepted: ["pets"] },
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
      hint: "Think about responsible stewardship over animals, fish, and birds.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
