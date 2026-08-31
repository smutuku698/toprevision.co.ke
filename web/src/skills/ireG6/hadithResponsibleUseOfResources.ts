import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The Hadith itself names five paired bounties in a fixed list — a genuine, curriculum-endorsed
// sequence, not an invented order.
const ORDER_PROMPTS = [
  "Arrange the five bounties named in this Hadith in the order they are listed.",
  "Put these five bounties into the order the Hadith names them.",
  "Sequence these five bounties correctly, as the Hadith lists them.",
  "Order these bounties as they appear in the Hadith.",
  "Sort these five bounties into the order the Hadith gives them.",
  "Arrange these bounties in the order the Prophet (S.A.W.) named them.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which bounty from this Hadith it describes.",
  "Group each statement under the bounty it describes.",
  "Decide which bounty each statement describes, and sort it there.",
  "Sort each fact into the bounty it belongs to.",
  "Place each statement under the bounty it describes.",
  "Read each statement and sort it under the matching bounty.",
];

const MATCH_PROMPTS = [
  "Match each bounty from this Hadith to its 'before' warning.",
  "Pair each bounty with the warning that fits it.",
  "Connect each bounty below to what it warns against.",
  "Match each bounty to its correct warning.",
  "Link each bounty to the warning that fits it.",
  "Choose the correct warning for each bounty named in the Hadith.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const BOUNTY_SEQUENCE = [
  { id: "youth", label: "Your youth, before you become old" },
  { id: "health", label: "Your health, before you fall sick" },
  { id: "wealth", label: "Your wealth, before you become poor" },
  { id: "free-time", label: "Your free time, before you become busy" },
  { id: "life", label: "Your life, before your death" },
];

interface TopicFact {
  text: string;
  topic: "the-hadith" | "wasting" | "stewardship";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "the-hadith": "What the Hadith itself says",
  wasting: "Ways these bounties can be wasted",
  stewardship: "Using bounties responsibly",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Hadith names five bounties: youth, health, wealth, free time, and life", topic: "the-hadith" },
  { text: "Each bounty is paired with a warning about what comes before it ends", topic: "the-hadith" },
  { text: "This Hadith on responsible use of capabilities and resources was narrated by Ahmad", topic: "the-hadith" },
  { text: "The Hadith is framed as advice to 'take advantage' of these five matters before they change", topic: "the-hadith" },
  { text: "Spending all of one's youth on idle distractions, with no thought for the future, wastes that bounty", topic: "wasting" },
  { text: "Ignoring good health by neglecting exercise or eating poorly can waste the bounty of health", topic: "wasting" },
  { text: "Spending wealth carelessly with nothing saved or given in charity wastes that bounty", topic: "wasting" },
  { text: "Filling all free time with nothing productive or beneficial wastes that bounty", topic: "wasting" },
  { text: "Studying hard and building good habits while young is a responsible use of youth", topic: "stewardship" },
  { text: "Taking care of one's body through exercise and rest is a responsible use of health", topic: "stewardship" },
  { text: "Saving, budgeting and giving charity are responsible uses of wealth", topic: "stewardship" },
  { text: "Using free time for learning, worship, or helping others is a responsible use of that bounty", topic: "stewardship" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Youth", meaning: "The first of the five bounties — to be used well before old age arrives" },
  { term: "Health", meaning: "The second bounty named — to be used well before sickness comes" },
  { term: "Wealth", meaning: "The third bounty named — to be used well before poverty comes" },
  { term: "Free time", meaning: "The fourth bounty named — to be used well before becoming busy" },
  { term: "Life", meaning: "The fifth bounty named — to be used well before death" },
  { term: "Ahmad", meaning: "The collector of Hadith who recorded this saying of the Prophet (S.A.W.)" },
  { term: "Stewardship", meaning: "Using something responsibly and purposefully, as this Hadith calls for with each bounty" },
  { term: "Bounty", meaning: "A blessing or gift from Allah (S.W.T.), such as youth, health, wealth, time, or life itself" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, keeps postponing studying because "there is always tomorrow." Applying this Hadith's lesson about youth, what is the concern with this thinking?`,
      correct: "Youth is a temporary bounty that should be used well now, since it will not last forever",
      wrong: [
        "There is no concern, since this Hadith only applies to adults, not learners",
        "The concern is only about physical health, not about studying",
        "Postponing is fine as long as the learner eventually studies before old age",
      ],
      explanation: "The Hadith specifically names youth as a bounty to take advantage of before it ends — postponing effort indefinitely goes against that lesson.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives a small amount of pocket money each week and spends all of it immediately on sweets, with nothing saved or shared. Applying this Hadith's lesson about wealth, what would be a better approach?`,
      correct: "Use some of the money thoughtfully — saving or giving part of it — rather than spending all of it carelessly",
      wrong: [
        "Spend everything immediately, since wealth has no real value until it is spent",
        "Refuse to spend any money at all, since the Hadith forbids all spending",
        "Give away all the money immediately, since saving contradicts this Hadith",
      ],
      explanation: "The Hadith warns against taking wealth for granted — responsible use means thoughtful spending, saving, and giving, not careless use of all of it at once.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} ignores a persistent cough for weeks, saying "I'll deal with my health later." Applying this Hadith, what does this attitude overlook?`,
    correct: "Health is a temporary bounty that should be cared for before it is lost, not delayed indefinitely",
    wrong: [
      "Nothing is overlooked, since health always returns eventually on its own",
      "The Hadith only discusses wealth, not physical health",
      "Delaying is fine as long as the cough is minor",
    ],
    explanation: "The Hadith names health as a bounty to use well before sickness comes — ignoring warning signs goes directly against that advice.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `During the school holidays, ${who} in ${place(rng)} spends every single day doing nothing productive at all, saying free time exists just to be wasted. Applying this Hadith, how should ${who} reconsider this?`,
      correct: "Free time is a bounty to use well — for learning, worship, or helping others — before it disappears into busy schedules",
      wrong: [
        "Free time has no value until adulthood, so wasting it now does not matter",
        "The Hadith actually recommends spending all free time resting and nothing else",
        "Free time should be filled with activity only if a reward is promised",
      ],
      explanation: "The Hadith specifically names free time as a bounty to take advantage of before becoming busy — treating it as worthless contradicts that teaching.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since life eventually ends anyway, there is no point making any effort now. Evaluate this reasoning against the Hadith.`,
    correct: "Flawed — the Hadith's point is the opposite: because life is limited, it should be used purposefully now, not wasted",
    wrong: [
      "Sound — since life ends anyway, effort is pointless",
      "Sound — this Hadith teaches that only the Hereafter matters, so daily effort is unnecessary",
      "Flawed — the Hadith actually says life should be spent avoiding all responsibility",
    ],
    explanation: "The Hadith's warning that life comes 'before death' is meant to motivate purposeful use of the time available, not to justify giving up effort.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why this Hadith lists five separate bounties instead of just saying "use your time well." What is the best explanation?`,
      correct: "Each bounty — youth, health, wealth, free time, and life — can be wasted in its own distinct way, so naming them separately makes the advice more specific and useful",
      wrong: [
        "The five bounties are actually the same thing repeated for emphasis",
        "Naming five things was only meant to make the Hadith longer",
        "Only one of the five bounties named actually matters in practice",
      ],
      explanation: "Naming five distinct bounties highlights that each — youth, health, wealth, free time, life — needs its own kind of responsible use, not a single generic reminder.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} works hard in class but never rests, believing that resting wastes the bounty of free time. Is this the correct lesson from the Hadith?`,
    correct: "No — using time well includes rest and self-care, not just constant activity; the Hadith warns against wasting time, not against resting altogether",
    wrong: [
      "Yes — the Hadith requires every free moment to be filled with visible work",
      "Yes — resting at any time directly contradicts this Hadith",
      "No — the Hadith actually says free time should never be used for anything productive",
    ],
    explanation: "Using a bounty responsibly is about purposeful use, which can include rest — the Hadith warns against carelessly wasting time, not against ever resting.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the five bounties in this Hadith only matter to adults with jobs and families. Is this an accurate reading of the Hadith's lesson?`,
      correct: "No — youth, health, free time, and life apply to a Grade 6 learner just as much as to an adult, even before wealth becomes a major concern",
      wrong: [
        "Yes — none of the five bounties apply to children at all",
        "Yes — only wealth applies to learners, and the other four apply only to adults",
        "No — the Hadith explicitly states it applies only to working adults",
      ],
      explanation: "Youth, health, free time, and life are all bounties a Grade 6 learner already has and can use responsibly now, not only once they become adults.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} decides to spend an entire free afternoon in ${place(rng)} helping a neighbour and reviewing schoolwork, rather than only relaxing. Which lesson from this Hadith does this choice best reflect?`,
    correct: "Using free time purposefully before it becomes scarce due to busier responsibilities later",
    wrong: [
      "Avoiding all forms of rest, which the Hadith requires at all times",
      "Spending wealth wisely, since helping a neighbour always involves money",
      "Preparing for old age specifically, which is the Hadith's only real concern",
    ],
    explanation: "Choosing to use free time for learning and helping others, rather than letting it pass by unused, directly reflects the Hadith's advice about free time.",
  }),
];

export const hadithResponsibleUseOfResources: Skill = {
  id: "g6-ire-ha-responsible-use-of-resources",
  code: "HA.4",
  subjectId: "ire",
  strandId: "g6-ire-hadith",
  grade: 6,
  title: "Hadith on Responsible Use of Capabilities and Resources",
  description: "The Hadith naming five bounties — youth, health, wealth, free time, and life — each to be used well before it ends, and what this teaches about responsible stewardship of Allah's (S.W.T.) blessings.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, BOUNTY_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in the order the Hadith lists them.",
        items,
        correctOrder: BOUNTY_SEQUENCE.map((d) => d.id),
        hint: "The Hadith lists youth, then health, then wealth, then free time, then life.",
        explanation: BOUNTY_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const hadith = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-hadith")).slice(0, 3);
      const wasting = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "wasting")).slice(0, 3);
      const stewardship = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "stewardship")).slice(0, 3);
      const chosen = shuffle(rng, [...hadith, ...wasting, ...stewardship]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["the-hadith", "wasting", "stewardship"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the Hadith itself, some about wasting a bounty, and some about using a bounty responsibly.",
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
        hint: "Think about what each term refers to in this Hadith about the five bounties.",
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
        hint: "Think about which of the five named bounties the situation involves, and whether it is being used responsibly.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Hadith names five matters: your youth, your health, your wealth, your free time, and your", after: ".", answer: "life", accepted: ["life"] },
      { before: "The Hadith says to take advantage of your youth before you become", after: ".", answer: "old", accepted: ["old"] },
      { before: "The Hadith says to take advantage of your health before you fall", after: ".", answer: "sick", accepted: ["sick"] },
      { before: "The Hadith says to take advantage of your wealth before you become", after: ".", answer: "poor", accepted: ["poor"] },
      { before: "The Hadith says to take advantage of your free time before you become", after: ".", answer: "busy", accepted: ["busy"] },
      { before: "The Hadith says to take advantage of your life before your", after: ".", answer: "death", accepted: ["death"] },
      { before: "This Hadith on responsible use of capabilities and resources was narrated by", after: ".", answer: "Ahmad", accepted: ["ahmad"] },
      { before: "The Hadith names", after: "separate bounties in total.", answer: "five", accepted: ["five", "5"] },
      { before: "Saving, budgeting, and giving charity are responsible uses of the bounty of", after: ".", answer: "wealth", accepted: ["wealth"] },
      { before: "Studying and building good habits while young is a responsible use of the bounty of", after: ".", answer: "youth", accepted: ["youth"] },
      { before: "Using free time for learning, worship, or helping others is responsible use of the bounty of", after: ".", answer: "free time", accepted: ["free time", "time"] },
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
      hint: "Recall the five bounties this Hadith names and their 'before' warnings.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
