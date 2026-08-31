import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: Zakatul Maal vs Zakatul Fitr is a contrast between two categories of
// obligation, not a process/sequence of steps — the curriculum gives no step-by-step procedure
// to arrange, so a 5th QuestionKind is not manufactured here (4 kinds is the floor per
// SKILL-QUALITY-STANDARDS.md, used deliberately rather than by default).

const CATEGORIZE_PROMPTS = [
  "Sort each statement as describing Zakatul Maal or Zakatul Fitr.",
  "Group each statement under Zakatul Maal or Zakatul Fitr.",
  "Decide whether each statement describes Zakatul Maal or Zakatul Fitr, and sort it there.",
  "Sort each statement into the correct category: Zakatul Maal, or Zakatul Fitr.",
  "Place each statement into the right bucket — Zakatul Maal, or Zakatul Fitr.",
  "Categorise each statement as describing Zakatul Maal or Zakatul Fitr.",
];

const MATCH_PROMPTS = [
  "Match each term about Zakat to its meaning.",
  "Pair each term about Zakat with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about Zakat to the definition that fits it.",
  "Choose the correct meaning for each term about Zakat.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or term.",
  "Which word or term completes this sentence?",
  "Complete the sentence with the correct word or term.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface TopicFact {
  text: string;
  topic: "maal" | "fitr";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  maal: "About Zakatul Maal",
  fitr: "About Zakatul Fitr",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Paid annually on wealth, savings, and business assets once they reach the nisab threshold", topic: "maal" },
  { text: "The standard rate is about 2.5% of qualifying wealth", topic: "maal" },
  { text: "Wealth must be held for a full lunar year before Zakatul Maal becomes due on it", topic: "maal" },
  { text: "Personal-use items like one's home and clothing are exempt from Zakatul Maal", topic: "maal" },
  { text: "A vehicle used for personal transport or work, not trade, is exempt from Zakatul Maal", topic: "maal" },
  { text: "Zakatul Fitr is a smaller, fixed amount of staple food or its cash equivalent", topic: "fitr" },
  { text: "Zakatul Fitr must be given before the Eid al-Fitr prayer", topic: "fitr" },
  { text: "Zakatul Fitr is given by every Muslim, including on behalf of dependents", topic: "fitr" },
  { text: "Zakatul Fitr purifies the fast of Ramadan from any shortcomings", topic: "fitr" },
  { text: "Zakatul Fitr lets the poor also celebrate Eid", topic: "fitr" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Zakatul Maal", meaning: "The annual obligatory charity of about 2.5% on wealth, savings, or business assets that reach the nisab threshold" },
  { term: "Zakatul Fitr", meaning: "The fixed charity of staple food, or its cash value, given before the Eid al-Fitr prayer" },
  { term: "Nisab", meaning: "The minimum threshold of wealth a Muslim must have before Zakatul Maal becomes due" },
  { term: "Exempted personal home", meaning: "A personal-use item excluded from Zakatul Maal calculations" },
  { term: "Exempted personal vehicle", meaning: "A vehicle used for personal transport or work, not trade, excluded from Zakatul Maal" },
  { term: "Wealth below nisab", meaning: "Wealth that has not reached the minimum threshold, so no Zakat is due on it" },
  { term: "Wealth redistribution", meaning: "One way Zakat benefits society — moving resources from the wealthy to the needy" },
  { term: "Purifying wealth", meaning: "How Zakat is described as cleansing a Muslim's remaining wealth and character" },
  { term: "Full lunar year", meaning: "The length of time wealth must be held before Zakatul Maal is due on it" },
  { term: "Eid al-Fitr", meaning: "The festival before whose prayer Zakatul Fitr must be paid" },
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
      prompt: `${who} runs a successful shop in ${place(rng)}; her savings and stock have stayed above the nisab threshold for over a year. Which zakat is due on this wealth?`,
      correct: "Zakatul Maal — because it is wealth that has reached the nisab threshold and been held for a full lunar year",
      wrong: ["Zakatul Fitr — because all charity paid before Eid is called this", "No zakat is due since it is business stock, not cash", "Zakatul Fitr — because shop wealth is always exempt"],
      explanation: "Zakatul Maal applies to wealth, savings, and business assets that reach nisab and are held for a full lunar year — exactly this situation.",
    };
  },
  (rng) => ({
    prompt: `Just before the Eid al-Fitr prayer in ${place(rng)}, ${name(rng)}'s family sets aside a fixed amount of maize flour for each family member, including the children. Which zakat is this?`,
    correct: "Zakatul Fitr — a fixed charity of staple food given before the Eid al-Fitr prayer",
    wrong: ["Zakatul Maal — because any charity involving food counts as this", "Zakatul Fitr does not apply to children at all", "This is not a form of zakat, just a personal gift"],
    explanation: "Zakatul Fitr is the smaller, fixed charity of staple food given for every family member before the Eid al-Fitr prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} owns the house he lives in with his family in ${place(rng)}, along with furniture and clothing for daily use, but has no savings above the nisab. Is Zakatul Maal due on his house?`,
    correct: "No — a personal home, along with clothing and furniture for personal use, is exempt from Zakatul Maal",
    wrong: ["Yes — all property a person owns is subject to Zakatul Maal", "Yes — but only if the house has more than one room", "No — but only because he has no furniture at all"],
    explanation: "Personal-use items like one's own home, clothing, and furniture are exempt from Zakatul Maal, regardless of how many rooms or furnishings there are.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} uses her car daily to ferry farm produce to the local market for her own business, never to sell the car itself. Is this vehicle included when calculating her Zakatul Maal?`,
    correct: "No — a vehicle used for personal transport or work rather than trade is exempt from Zakatul Maal",
    wrong: ["Yes — every vehicle a Muslim owns is included in Zakatul Maal", "Yes — because it is used to support a business", "No — but only because it carries farm produce specifically"],
    explanation: "A vehicle used for personal transport or work, not held for trade, is exempt — the use, not the produce it carries, is what matters.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s total savings in ${place(rng)} have never reached the minimum threshold required for Zakat to become due, even though he saves consistently. Is Zakatul Maal due on his savings?`,
    correct: "No — wealth below the nisab threshold is exempt from Zakatul Maal",
    wrong: ["Yes — Zakat is due on any amount of savings, however small", "Yes — but only during Ramadan", "No — but only because he saves consistently, not because of the amount"],
    explanation: "Wealth below the nisab threshold is exempt, regardless of how consistently or for how long it has been saved.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that Zakat is just a personal act of worship with no wider benefit to society. What is the flaw in this claim?`,
    correct: "Zakat redistributes wealth and directly supports the poor and needy — its benefit reaches beyond the individual giver",
    wrong: ["There is no flaw — Zakat truly has no effect beyond the giver", "Zakat only benefits the government, not ordinary people", "Zakat is optional charity with no defined social role"],
    explanation: "Zakat redistributes wealth and supports the poor and needy in society — a clear benefit beyond the individual who gives it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders why Zakatul Fitr is required even for Muslims who already pay Zakatul Maal regularly. What is the best explanation?`,
      correct: "Zakatul Fitr serves a different purpose — it purifies the fast of Ramadan and lets even the poor celebrate Eid, which Zakatul Maal does not specifically address",
      wrong: ["Zakatul Fitr replaces Zakatul Maal entirely once it is paid", "Zakatul Fitr is only required for those who have never paid Zakatul Maal", "There is no real difference in purpose between the two"],
      explanation: "Zakatul Fitr and Zakatul Maal serve different purposes — Fitr purifies the fast and lets the poor celebrate Eid, a role Maal does not fill.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plans to pay her Zakatul Fitr the day after the Eid al-Fitr prayer, once the celebrations are over. Why might this timing be a problem?`,
    correct: "Zakatul Fitr should be given before the Eid al-Fitr prayer, so paying it late misses the purpose of letting the poor celebrate Eid together with everyone else",
    wrong: ["There is no problem — Zakatul Fitr can be paid at any time of year", "It is a problem only because it must be paid in cash, never in food", "Zakatul Fitr does not need to be linked to Eid at all"],
    explanation: "Zakatul Fitr must be given before the Eid al-Fitr prayer — paying it late defeats its purpose of letting the poor celebrate alongside everyone else.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that Zakat's only benefit is financial help for the poor, with no effect on the giver at all. What is the flaw in this reasoning?`,
    correct: "Zakat is also described as purifying the giver's own wealth and character, not only benefiting the recipients",
    wrong: ["There is no flaw — Zakat has no effect on the giver whatsoever", "Zakat is only meant to make the giver feel good, nothing more", "Zakat purifies the recipient's character, not the giver's"],
    explanation: "Zakat purifies the giver's wealth and character, not just the recipient's circumstances — a benefit to the giver, not only the receiver.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to calculate roughly how much Zakatul Maal she owes on her qualifying savings this year. Roughly what proportion of that wealth is typically due?`,
    correct: "About 2.5% of the qualifying wealth",
    wrong: ["About 10% of the qualifying wealth", "A fixed amount of food, regardless of the wealth's value", "Exactly half of all savings held during the year"],
    explanation: "Zakatul Maal is calculated at about 2.5% of qualifying wealth — a fixed amount of food describes Zakatul Fitr, not Zakatul Maal.",
  }),
];

export const zakat: Skill = {
  id: "g7-ire-da-zakat",
  code: "DA.2",
  subjectId: "ire",
  strandId: "g7-ire-devotional",
  grade: 7,
  title: "Zakat",
  description: "Zakatul Maal and Zakatul Fitr, items exempted from Zakat, and the importance of Zakat to a Muslim society.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const maal = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "maal")).slice(0, 5);
      const fitr = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "fitr")).slice(0, 5);
      const chosen = shuffle(rng, [...maal, ...fitr]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["maal", "fitr"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Zakatul Maal is about annual wealth above a threshold; Zakatul Fitr is a fixed charity tied to Eid al-Fitr.",
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
        hint: "Think about which term names an amount, a threshold, an exemption, or a benefit to society.",
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
        hint: "Check whether the situation involves annual wealth above a threshold, or a fixed charity tied to Eid.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Zakatul Maal is calculated at about", after: "% of qualifying wealth.", answer: "2.5", accepted: ["2.5", "2.5%"] },
      { before: "Zakatul Fitr must be paid before the", after: "prayer, at the end of Ramadan.", answer: "Eid al-Fitr", accepted: ["eid al-fitr", "eid al fitr", "eid"] },
      { before: "The minimum threshold of wealth before Zakatul Maal becomes due is called the", after: ".", answer: "nisab", accepted: ["nisab"] },
      { before: "Wealth must be held for a full", after: "before Zakatul Maal is due on it.", answer: "lunar year", accepted: ["lunar year", "year"] },
      { before: "A personal", after: "used for transport or work, not trade, is exempt from Zakatul Maal.", answer: "vehicle", accepted: ["vehicle", "car"] },
      { before: "Zakatul Fitr is typically paid using", after: "food or its cash equivalent.", answer: "staple", accepted: ["staple"] },
      { before: "Zakat helps", after: "wealth between the wealthy and the poor in society.", answer: "redistribute", accepted: ["redistribute", "redistribute wealth"] },
      { before: "Paying Zakat is believed to", after: "a Muslim's remaining wealth and character.", answer: "purify", accepted: ["purify"] },
      { before: "One's own", after: "used for personal living is exempt from Zakatul Maal.", answer: "home", accepted: ["home", "house"] },
      { before: "Zakatul Fitr allows even the poor to also", after: "Eid.", answer: "celebrate", accepted: ["celebrate"] },
      { before: "", after: "is the larger, annual form of Zakat paid on wealth, savings, and business assets.", answer: "Zakatul Maal", accepted: ["zakatul maal"] },
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
      hint: "Recall the difference between Zakatul Maal and Zakatul Fitr, and what is exempted from each.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`.trim(),
    };
  },
};
