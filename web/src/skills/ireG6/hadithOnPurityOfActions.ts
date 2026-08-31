import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand (unlike a surah's verse order), so the
// ordering branch uses a curriculum-reasonable real-world sequence: the steps a Muslim takes to
// keep a good deed sincere, drawn directly from the Hadith's own emphasis on the heart over
// outward appearance.
const ORDER_PROMPTS = [
  "Arrange these steps for keeping a good deed sincere in the order they should happen.",
  "Put these steps for checking your intention into the correct order.",
  "Sequence these steps for keeping a deed sincere, from first to last.",
  "Order these steps for making sure a good deed is done for Allah's sake.",
  "Sort these steps for purifying an intention into the order they occur.",
  "Arrange these steps for checking sincerity in the order they should be taken.",
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
  "Choose the correct meaning for each term about sincerity of actions.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const SINCERITY_STEPS = [
  { id: "notice-motive", label: "Before starting, ask yourself honestly why you want to do this good deed" },
  { id: "check-audience", label: "Check whether you would still do it even if nobody else were watching or would ever find out" },
  { id: "renew-niyyah", label: "Renew your intention (niyyah) to do it purely to please Allah, not to impress people" },
  { id: "do-deed", label: "Carry out the good deed itself, whether it is prayer, charity, helping someone, or any other action" },
  { id: "avoid-boasting", label: "Avoid boasting about it afterwards or seeking praise, since Allah already knows what was in your heart" },
];

interface TopicFact {
  text: string;
  topic: "meaning" | "sincerity" | "conduct";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  meaning: "What the Hadith teaches about how Allah judges people",
  sincerity: "Sincerity (ikhlas) of the heart and intention",
  conduct: "Not judging or valuing others by appearance or wealth",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Allah does not look at outward appearance or wealth when judging a person", topic: "meaning" },
  { text: "Allah looks at a person's heart and actions", topic: "meaning" },
  { text: "This Hadith on the purity of actions was narrated by Muslim", topic: "meaning" },
  { text: "A person's true worth before Allah is not measured by how expensive their clothes are", topic: "meaning" },
  { text: "Sincerity (ikhlas) means doing a good deed purely to please Allah, not to be praised by people", topic: "sincerity" },
  { text: "A good deed done only for show, to impress others, loses its true value with Allah", topic: "sincerity" },
  { text: "Checking your intention before and during a deed helps keep it sincere", topic: "sincerity" },
  { text: "Even a small deed done with a sincere heart is valuable to Allah", topic: "sincerity" },
  { text: "A Muslim should not judge a poor or ordinary-looking person as less worthy than a rich or good-looking one", topic: "conduct" },
  { text: "A rich person with a corrupt heart is not favoured by Allah over a poor person with a sincere heart", topic: "conduct" },
  { text: "True character and intention matter more than status, fame or physical appearance", topic: "conduct" },
  { text: "This Hadith teaches Muslims to look inward at their own hearts rather than compare themselves to others' wealth or looks", topic: "conduct" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Ikhlas", meaning: "Sincerity — doing a deed purely to please Allah, without seeking praise or show" },
  { term: "Niyyah", meaning: "Intention — the inner purpose behind an action, which Allah judges along with the deed itself" },
  { term: "Riya", meaning: "Showing off — doing a good deed to be seen and praised by people rather than for Allah's sake" },
  { term: "Qalb", meaning: "The heart — in this Hadith, what Allah looks at rather than a person's outward appearance" },
  { term: "Amal", meaning: "Actions/deeds — what a person actually does, which Allah looks at together with the heart" },
  { term: "Muslim (the narrator)", meaning: "The collector of Hadith who recorded this saying of the Prophet (S.A.W.)" },
  { term: "Zahir", meaning: "Outward appearance — looks, clothing and physical features, which the Hadith says Allah does not judge by" },
  { term: "Maal", meaning: "Wealth/possessions — material riches, which the Hadith says do not make a person favoured by Allah" },
  { term: "Taqwa", meaning: "God-consciousness — an inward quality connected to sincerity, valued far above outward status" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, donates money to a school fundraiser but only after making sure the head teacher announces their name to the whole assembly. Applying this Hadith, what is the concern with this?`,
    correct: "The visible act of giving may be undermined if the true motive is public praise rather than pleasing Allah",
    wrong: [
      "There is no concern at all, since the Hadith only applies to prayer, not to charity",
      "The concern is that the amount given was too small to matter",
      "The concern is that donations should never be announced under any circumstance",
    ],
    explanation: "The Hadith teaches that Allah looks at the heart behind an action — giving mainly to be praised, rather than to please Allah, is exactly the kind of motive this Hadith warns against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a classmate wearing a worn, patched-up uniform and assumes the classmate must not be a serious or "good" student. Applying this Hadith, what is wrong with this assumption?`,
      correct: "The Hadith teaches that Allah judges people by their heart and actions, not by outward appearance such as clothing",
      wrong: [
        "Nothing is wrong — neat appearance is exactly what this Hadith says matters most",
        "The assumption is correct because wealth always reflects a person's character",
        "The Hadith only applies to adults, so it says nothing about how learners judge classmates",
      ],
      explanation: "This Hadith directly warns against valuing people by appearance — a worn uniform says nothing about a learner's heart or character.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} compares two classmates: one who dresses expensively but frequently cheats and lies, and another who dresses simply but is always honest. Based on this Hadith, who does Allah's judgement favour?`,
    correct: "The honest classmate, since Allah looks at a person's heart and actions rather than their appearance or wealth",
    wrong: [
      "The expensively dressed classmate, because wealth is a sign of Allah's favour",
      "Neither, since appearance always outweighs actions in Islamic teaching",
      "It cannot be judged at all, since only actions matter and honesty is not an action",
    ],
    explanation: "The Hadith explicitly places heart and actions above appearance and wealth — honesty is exactly the kind of action this teaching values.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} quietly helps an elderly neighbour in ${place(rng)} carry groceries every week, never mentioning it to anyone. Applying this Hadith, how should ${who} think about the fact that no one has ever recognised this kindness?`,
      correct: "Trust that Allah, who looks at the heart and actions, is fully aware of the deed even without human recognition",
      wrong: [
        "Feel discouraged and stop helping, since good deeds are worthless without recognition",
        "Start telling people about it so the deed is not wasted",
        "Assume the deed does not count with Allah because no one else witnessed it",
      ],
      explanation: "Since Allah looks at the heart and actions, not at whether others notice, quiet unrecognised good deeds still hold full value with Him.",
    };
  },
  (rng) => ({
    prompt: `Before doing homework, ${name(rng)} in ${place(rng)} pauses and honestly asks: "Am I doing this to actually learn, or just so my parents stop nagging me?" Which step in keeping an action sincere does this pause represent?`,
    correct: "Checking one's own motive before starting the task",
    wrong: [
      "Boasting about the task once it is finished",
      "Deciding whether the task is difficult enough to be worthwhile",
      "Asking a friend to confirm the task was done correctly",
    ],
    explanation: "Honestly examining why you are about to do something, before you start, is the first step in keeping a deed's intention sincere.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues: "Since Allah only cares about wealth and appearance don't matter, it's fine to be dishonest as long as I look respectable." Evaluate this reasoning against the Hadith.`,
    correct: "Flawed — the Hadith says appearance does not matter precisely because Allah instead judges the heart and actions, including honesty",
    wrong: [
      "Sound — since appearance doesn't matter, actions like honesty don't matter either",
      "Sound — the Hadith means only rich, well-dressed people are judged by Allah",
      "Flawed — the Hadith actually says appearance is the only thing that matters to Allah",
    ],
    explanation: "The Hadith redirects judgement away from appearance and toward the heart and actions — it raises the importance of honest conduct, it does not excuse dishonesty.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A visiting relative in ${place(rng)} treats ${who} kindly only after learning ${who}'s family recently became wealthier. Which teaching from this Hadith does the relative's behaviour go against?`,
      correct: "That a person's worth is not measured by wealth or outward status",
      wrong: [
        "That wealthy families deserve more respect than others",
        "That kindness should always depend on a person's financial situation",
        "That relatives are exempt from this Hadith's teaching",
      ],
      explanation: "Valuing someone differently because of new wealth directly contradicts the Hadith's teaching that Allah — and by extension a sincere Muslim — does not judge worth by wealth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plans to volunteer at a mosque clean-up but changes plans once told the event will not be photographed for social media. What does this reveal about the intention behind the planned deed?`,
    correct: "The intention may have been more about public recognition than about pleasing Allah, which this Hadith warns against",
    wrong: [
      "It reveals nothing, since photography has no connection to sincerity",
      "It shows the deed would have been sincere regardless of the reason for cancelling",
      "It proves volunteering only counts as a good deed when documented",
    ],
    explanation: "Losing interest once there is no recognition suggests the original motive leaned toward being seen rather than toward Allah — exactly what ikhlas guards against.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says: "This Hadith means looking neat and tidy for school is pointless." Is this a correct application of the Hadith's teaching?`,
    correct: "No — the Hadith is about how Allah judges a person's ultimate worth, not a rule against ordinary neatness or hygiene",
    wrong: [
      "Yes — since Allah ignores appearance, being neat and tidy has no value at all",
      "Yes — the Hadith directly forbids learners from wearing clean uniforms",
      "No — the Hadith says appearance is actually the most important thing to Allah",
    ],
    explanation: "The Hadith addresses how Allah measures a person's true worth — sincerity of heart and actions — not everyday practical matters like neatness or hygiene.",
  }),
];

export const hadithOnPurityOfActions: Skill = {
  id: "g6-ire-ha-purity-of-actions",
  code: "HA.1",
  subjectId: "ire",
  strandId: "g6-ire-hadith",
  grade: 6,
  title: "Hadith on Purity of Actions",
  description: "The Hadith 'Allah does not look at your appearance or wealth, but rather He looks at your heart and actions' (Muslim): sincerity of intention and not judging others by appearance or wealth.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, SINCERITY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from first check to final step.",
        items,
        correctOrder: SINCERITY_STEPS.map((s) => s.id),
        hint: "Sincerity starts with honestly checking your motive, and ends with avoiding boasting once the deed is done.",
        explanation: SINCERITY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const sincerity = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "sincerity")).slice(0, 3);
      const conduct = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "conduct")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...sincerity, ...conduct]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["meaning", "sincerity", "conduct"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements describe what the Hadith says about Allah's judgement, some are about sincerity itself, and some are about how Muslims should treat others.",
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
        hint: "Think about what each term refers to in the Hadith's teaching on sincerity.",
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
        hint: "Think about whether the situation is judging by the heart/actions or by appearance/wealth.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Allah does not look at your appearance or", after: ", but rather He looks at your heart and actions.", answer: "wealth", accepted: ["wealth"] },
      { before: "Allah does not look at your appearance or wealth, but rather He looks at your heart and", after: ".", answer: "actions", accepted: ["actions"] },
      { before: "Allah does not look at your appearance or wealth, but rather He looks at your", after: "and actions.", answer: "heart", accepted: ["heart"] },
      { before: "This Hadith on the purity of actions was narrated by", after: ".", answer: "Muslim", accepted: ["muslim"] },
      { before: "Doing a good deed purely to please Allah, without seeking praise, is called", after: "(sincerity).", answer: "ikhlas", accepted: ["ikhlas"] },
      { before: "The inner purpose behind an action, which Allah judges along with the deed itself, is called", after: "(intention).", answer: "niyyah", accepted: ["niyyah"] },
      { before: "Doing a good deed to be seen and praised by people rather than for Allah's sake is called", after: "(showing off).", answer: "riya", accepted: ["riya"] },
      { before: "According to this Hadith, a rich person with a corrupt heart is", after: "favoured by Allah over a poor person with a sincere heart.", answer: "not", accepted: ["not"] },
      { before: "This Hadith teaches that a person's true", after: "matters more than their appearance or wealth.", answer: "heart", accepted: ["heart", "character"] },
      { before: "Even a small deed done with a", after: "heart is valuable to Allah.", answer: "sincere", accepted: ["sincere"] },
      { before: "A good deed done only for show, to impress others, loses its true", after: "with Allah.", answer: "value", accepted: ["value"] },
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
      hint: "Recall exactly what this Hadith says Allah looks at, and what it teaches about sincerity.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
