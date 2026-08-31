import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No single fixed sequence exists for this sub-strand, so the ordering branch uses a
// curriculum-reasonable real-world sequence: how a person who is exempted should decide their
// way of compensating.
const ORDER_PROMPTS = [
  "Arrange these steps for deciding how to compensate for a missed fast in a sensible order.",
  "Put these steps for handling a missed fast into a sensible order.",
  "Sequence these steps for compensating for a missed fast, from first to last.",
  "Order these steps for deciding between Qadha and Fidya.",
  "Sort these steps for compensating a missed fast into a sensible order.",
  "Arrange these steps for a person exempted from fasting in a sensible order.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of Saum exemptions it describes.",
  "Group each statement under the aspect it describes.",
  "Decide which aspect each statement describes, and sort it there.",
  "Sort each fact into the aspect of fasting exemptions it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of Saum.",
];

const MATCH_PROMPTS = [
  "Match each category of exempted person to their way of compensating.",
  "Pair each category with the way of compensating that fits it.",
  "Connect each category below to how they compensate.",
  "Match each category to its correct way of compensating.",
  "Link each category to the compensation method that fits it.",
  "Choose the correct compensation method for each exempted category.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const DECISION_STEPS = [
  { id: "identify-reason", label: "Identify the genuine reason fasting is not possible (illness, travel, old age, pregnancy/breastfeeding)" },
  { id: "check-temporary", label: "Check whether the reason is temporary (like a short illness or a journey) or long-term/permanent" },
  { id: "choose-method", label: "Choose the matching way of compensating — Qadha (making up the days later) or Fidya (feeding a needy person)" },
  { id: "fulfil", label: "Fulfil the compensation once able, or as appropriate to the situation" },
];

const CATEGORY_COMPENSATION = [
  { name: "The sick (temporary illness)", meaning: "Makes up the missed days later, once recovered (Qadha)" },
  { name: "The traveller", meaning: "Makes up the missed days later, once the journey ends (Qadha)" },
  { name: "The elderly / permanently/chronically ill", meaning: "Pays Fidya — feeding a needy person for each day missed, since they cannot fast later" },
  { name: "Pregnant or breastfeeding women (if fasting risks health)", meaning: "May make up the days later or pay Fidya, depending on their situation" },
];

interface TopicFact {
  text: string;
  topic: "exempted" | "compensation" | "why";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  exempted: "Who is exempted from fasting",
  compensation: "How the exempted compensate",
  why: "Why Islam allows these exemptions",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Fasting during Ramadan is obligatory for adult, healthy Muslims", topic: "exempted" },
  { text: "The sick (with a temporary illness) are exempted from fasting", topic: "exempted" },
  { text: "A traveller on a genuine journey is exempted from fasting", topic: "exempted" },
  { text: "The elderly or those with a chronic/permanent illness are exempted from fasting", topic: "exempted" },
  { text: "Pregnant or breastfeeding women may be exempted if fasting risks their or the baby's health", topic: "exempted" },
  { text: "The sick and travellers make up missed days later through Qadha, once able", topic: "compensation" },
  { text: "The elderly and chronically/permanently ill pay Fidya, since they cannot fast later at all", topic: "compensation" },
  { text: "Fidya generally means feeding a needy person for each day of fasting missed", topic: "compensation" },
  { text: "The categories of people exempted from fasting are mentioned in the Qur'an (Q2:184-185)", topic: "compensation" },
  { text: "Islam shows mercy by exempting people for whom fasting would be genuinely harmful", topic: "why" },
  { text: "The exemptions are not a way to escape all responsibility, but a fair accommodation with an appropriate alternative", topic: "why" },
  { text: "Different categories have different appropriate ways to compensate, matching their situation", topic: "why" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Saum", meaning: "Fasting, obligatory for adult, healthy Muslims during the month of Ramadan" },
  { term: "Qadha", meaning: "Making up missed fasting days later, once able" },
  { term: "Fidya", meaning: "Feeding a needy person for each day of fasting missed, for those who cannot fast later" },
  { term: "Q2:184-185", meaning: "The Qur'an verses naming the categories of people exempted from fasting" },
  { term: "The sick", meaning: "A category exempted from fasting temporarily, who make up missed days through Qadha" },
  { term: "The traveller", meaning: "A category exempted from fasting during a genuine journey, who make up missed days through Qadha" },
  { term: "The elderly", meaning: "A category exempted from fasting permanently, who compensate through Fidya" },
  { term: "Ramadhan", meaning: "The month during which fasting (Saum) is obligatory for adult, healthy Muslims" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, has a grandparent who is elderly and permanently unable to fast due to a long-term illness. How should the grandparent compensate for the missed fasting days?`,
      correct: "By paying Fidya — feeding a needy person for each day missed, since they cannot make up the fast later",
      wrong: [
        "By making up every missed day once they eventually recover, since Qadha applies to everyone equally",
        "By doing nothing at all, since permanent illness removes any responsibility to compensate",
        "By fasting extra days the following year to make up for it",
      ],
      explanation: "For someone permanently unable to fast, Fidya (feeding a needy person for each missed day) is the appropriate compensation, since Qadha assumes future ability to fast.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s relative in ${place(rng)} falls sick for one week during Ramadan but fully recovers a month later. How should this relative handle the missed days?`,
      correct: "Make up the missed days later through Qadha, once recovered",
      wrong: [
        "Pay Fidya permanently instead, since any illness during Ramadan requires Fidya",
        "Ignore the missed days entirely, since temporary illness removes all responsibility",
        "Fast for double the number of days missed as a penalty",
      ],
      explanation: "A temporary illness means the person can make up the missed days later through Qadha once they recover — Fidya is for those unable to fast at all, not temporary cases.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that anyone who skips fasting for any reason at all should simply be excused with no compensation required. Evaluate this reasoning.`,
    correct: "Flawed — the exemptions apply to specific genuine categories, and even those exempted are expected to compensate through Qadha or Fidya as appropriate",
    wrong: [
      "Sound — no compensation is ever required for a missed fast, regardless of the reason",
      "Sound — the Qur'an states that fasting is entirely optional for every Muslim",
      "Flawed — actually, no exemptions exist at all in Islamic teaching",
    ],
    explanation: "Exemptions are specific and each comes with an appropriate compensation method (Qadha or Fidya) — they are not a blanket excuse with no responsibility at all.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} travels a long distance for a family emergency during Ramadan and misses several days of fasting. What is the correct way to handle this?`,
      correct: "Make up the missed days later through Qadha, once the journey is over",
      wrong: [
        "Pay Fidya permanently, since travel always requires Fidya rather than Qadha",
        "Do nothing at all, since travel completely removes any need to compensate",
        "Fast without break for the rest of the year to make up for it",
      ],
      explanation: "A traveller on a genuine journey is exempted temporarily, and compensates by making up the missed days later through Qadha, similar to the sick.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that exemptions from fasting exist because Islam does not really value fasting as important. Is this a fair conclusion?`,
    correct: "No — the exemptions show mercy for situations where fasting would cause genuine harm, not that fasting itself is unimportant",
    wrong: [
      "Yes — the existence of any exemption proves fasting has no real value",
      "Yes — exemptions mean fasting is optional for every Muslim at all times",
      "No — exemptions actually show Islam does not care about anyone's wellbeing",
    ],
    explanation: "The exemptions reflect Allah's mercy for genuine hardship, while still requiring appropriate compensation — this shows care for wellbeing without dismissing fasting's importance.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Qadha and Fidya are different, rather than everyone simply making up missed days later. What is the best explanation?`,
      correct: "Because some people (like the elderly or chronically ill) genuinely cannot fast later at all, so a different, fair alternative (Fidya) is provided for them",
      wrong: [
        "Because Fidya is simply an easier option any exempted person may pick for convenience",
        "Because Qadha and Fidya actually mean the same thing under different names",
        "Because only wealthy people are allowed to use Fidya",
      ],
      explanation: "Fidya exists specifically for those who cannot realistically fast later at all, distinguishing their situation fairly from those who can eventually make up the fast through Qadha.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a pregnant woman who fears fasting could harm her health has no religiously acceptable option except to fast anyway. Is this correct?`,
    correct: "No — she may compensate by making up the days later or through Fidya, depending on her situation, rather than being forced to fast if it risks health",
    wrong: [
      "Yes — pregnancy provides no exemption of any kind under Islamic teaching",
      "Yes — the only acceptable option is to fast regardless of health risk",
      "No — but she has no way to compensate at all, only a permanent exemption",
    ],
    explanation: "A pregnant or breastfeeding woman whose health (or her baby's) would be at risk may compensate through Qadha or Fidya depending on her circumstances, rather than being forced to fast.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that Fidya means simply skipping the fast with no further action needed. Evaluate this claim.`,
    correct: "Flawed — Fidya specifically requires feeding a needy person for each day missed, it is not simply skipping with no action taken",
    wrong: [
      "Sound — Fidya requires no action beyond skipping the fast",
      "Sound — Fidya and doing nothing at all mean exactly the same thing",
      "Flawed — Fidya actually requires fasting extra days instead of any payment",
    ],
    explanation: "Fidya is a specific act of compensation — feeding a needy person for each missed day — not simply an excuse to skip the fast with no further responsibility.",
  }),
];

export const saum: Skill = {
  id: "g6-ire-da-saum",
  code: "DA.3",
  subjectId: "ire",
  strandId: "g6-ire-devotional",
  grade: 6,
  title: "Saum (Fasting) — Exemptions and Fidya",
  description: "Categories of people exempted from obligatory fasting during Ramadan (the sick, travellers, the elderly, and pregnant/breastfeeding women), and the two ways of compensating: Qadha and Fidya.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, DECISION_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from identifying the reason to fulfilling the compensation.",
        items,
        correctOrder: DECISION_STEPS.map((s) => s.id),
        hint: "Start by identifying the reason for exemption, then decide the right way to compensate.",
        explanation: DECISION_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const exempted = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "exempted")).slice(0, 3);
      const compensation = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "compensation")).slice(0, 3);
      const why = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "why")).slice(0, 3);
      const chosen = shuffle(rng, [...exempted, ...compensation, ...why]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["exempted", "compensation", "why"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about who is exempted, some about how they compensate, and some about why the exemptions exist.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CATEGORY_COMPENSATION);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each category makes up the fast later (Qadha) or compensates through Fidya.",
        explanation: chosen.map((t) => `${t.name} — ${t.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about whether the situation is temporary (Qadha) or long-term/permanent (Fidya).",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Fasting during Ramadan is obligatory for adult, healthy", after: ".", answer: "Muslims", accepted: ["muslims"] },
      { before: "The categories of people exempted from fasting are mentioned in", after: ".", answer: "Q2:184-185", accepted: ["q2:184-185", "2:184-185"] },
      { before: "The sick and travellers make up missed fasting days later through", after: ".", answer: "Qadha", accepted: ["qadha"] },
      { before: "The elderly or chronically ill compensate through", after: ", feeding a needy person for each day missed.", answer: "Fidya", accepted: ["fidya"] },
      { before: "A traveller on a genuine journey is", after: "from fasting.", answer: "exempted", accepted: ["exempted"] },
      { before: "Fidya means feeding a needy person for each day of fasting", after: ".", answer: "missed", accepted: ["missed"] },
      { before: "Pregnant or breastfeeding women may be exempted if fasting risks their or the baby's", after: ".", answer: "health", accepted: ["health"] },
      { before: "Islam's exemptions from fasting reflect Allah's", after: "for genuine hardship.", answer: "mercy", accepted: ["mercy"] },
      { before: "Someone who cannot fast later at all compensates through", after: "rather than Qadha.", answer: "Fidya", accepted: ["fidya"] },
      { before: "A person recovering from a temporary illness makes up the missed days once they", after: ".", answer: "recover", accepted: ["recover", "recovers"] },
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
      hint: "Recall the categories of people exempted from fasting and how each compensates.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
