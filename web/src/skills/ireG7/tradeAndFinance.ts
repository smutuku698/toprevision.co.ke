import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// Halal/haram earning and spending has no curriculum-stated sequence and no numeric/spatial content, so this
// branches across 4 QuestionKinds (categorize, click-match, multiple-choice, fill-blank) rather than 5 — the
// SKILL-QUALITY-STANDARDS.md floor case where a 5th kind (ordering/hotspot/number-line) would have to be
// invented rather than drawn from real content. Confirmed no relevant visual exists in Assests-svg/ either.
// The "reasoning" multiple-choice branch below carries the required Analyze-tier "effects of spending income
// in haram ways" outcome, not just recall of what counts as halal/haram (see RIGOR-STANDARDS.md).

const CATEGORIZE_PROMPTS = [
  "Sort each statement about earning and spending as halal (lawful) or haram (unlawful) in Islam.",
  "Group each statement under halal (lawful) or haram (unlawful).",
  "Decide whether each statement about earning and spending is halal or haram, and sort it there.",
  "Sort each statement into the correct category: halal, or haram.",
  "Place each statement into the right bucket — halal (lawful), or haram (unlawful).",
  "Categorise each statement about earning and spending as halal or haram.",
];

const MATCH_PROMPTS = [
  "Match each trade and finance term to its meaning.",
  "Pair each trade and finance term with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each trade and finance term to the definition that fits it.",
  "Choose the correct meaning for each trade and finance term.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

type Lawfulness = "halal" | "haram";
interface EarningFact {
  text: string;
  lawfulness: Lawfulness;
}
const LAWFULNESS_LABEL: Record<Lawfulness, string> = {
  halal: "Halal (lawful)",
  haram: "Haram (unlawful)",
};
const EARNING_FACTS: EarningFact[] = [
  { text: "Earning through honest trade or business", lawfulness: "halal" },
  { text: "Earning wages through lawful employment", lawfulness: "halal" },
  { text: "Earning a living through agriculture (farming)", lawfulness: "halal" },
  { text: "Earning through offering a legitimate service", lawfulness: "halal" },
  { text: "Spending part of one's income to support one's family", lawfulness: "halal" },
  { text: "Giving sadaqah (voluntary charity) from one's earnings", lawfulness: "halal" },
  { text: "Saving part of one's income for future needs", lawfulness: "halal" },
  { text: "Paying zakat on wealth that has reached the nisab threshold", lawfulness: "halal" },
  { text: "Investing income in a lawful business venture", lawfulness: "halal" },
  { text: "Earning through riba (charging or paying interest)", lawfulness: "haram" },
  { text: "Earning through gambling or games of chance", lawfulness: "haram" },
  { text: "Earning by selling prohibited items such as alcohol or pork", lawfulness: "haram" },
  { text: "Earning through bribery", lawfulness: "haram" },
  { text: "Earning through theft", lawfulness: "haram" },
  { text: "Earning through fraud or cheating customers in trade", lawfulness: "haram" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Riba", meaning: "Interest charged or paid on a loan, a haram source of earning" },
  { term: "Zakat", meaning: "The obligatory portion of wealth paid to those in need, a legitimate way of spending income" },
  { term: "Sadaqah", meaning: "Voluntary charity given from one's lawful earnings" },
  { term: "Barakah", meaning: "The blessing in wealth, which is lost when income is earned or spent in haram ways" },
  { term: "Halal", meaning: "Earning or spending that is lawful and permitted in Islam" },
  { term: "Haram", meaning: "Earning or spending that is unlawful and forbidden in Islam" },
];

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  // Analyze-tier: genuine effects of haram spending, not just labelling something haram.
  (rng) => {
    const who = name(rng);
    return {
    prompt: `${who} in ${place(rng)} earns extra money by accepting bribes at work and uses it to build a large house. Despite the new wealth, ${who}'s family feels tense and lacks peace at home. What does Islamic teaching say is the most likely explanation?`,
    correct: "Wealth gained and spent through haram means loses its barakah (blessing), which can show up as a lack of peace even amid material comfort",
    wrong: [
      "The family's tension has nothing to do with how the money was earned",
      "Bribery only affects the person who takes it, never their household",
      "More wealth always brings more peace, regardless of how it was earned",
    ],
    explanation: "One effect of haram earning and spending is the loss of barakah (blessing) in wealth — this can be experienced as a lack of peace, even when the family appears materially comfortable.",
  };
  },
  (rng) => ({
    prompt: `${name(rng)} is found selling counterfeit goods, a form of fraud in trade, and the local authorities shut down the business and impose a fine. Which effect of haram earning does this best illustrate?`,
    correct: "Haram earning can lead to real legal and social consequences, not just spiritual loss",
    wrong: [
      "Haram earning only ever causes spiritual harm, never any real-world consequence",
      "Fraud in trade is not actually considered a haram source of earning",
      "Legal consequences only apply to riba, not to fraud",
    ],
    explanation: "Beyond spiritual harm, spending or earning through haram means such as fraud can bring genuine legal and social consequences — this scenario shows that effect concretely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
    prompt: `${who} in ${place(rng)} secretly spends part of the family's income on gambling. Afterwards, ${who} feels troubled and struggles to focus during prayer. Which effect of spending income in haram ways does this describe?`,
    correct: "Guilt and spiritual harm — the wrongdoing weighs on the conscience and disturbs one's connection to Allah",
    wrong: [
      "This shows gambling has no real effect on a person's spiritual life",
      "This shows the money was actually spent in a halal way",
      "This is simply nervousness unrelated to how the money was spent",
    ],
    explanation: "Spending in haram ways such as gambling produces guilt and spiritual harm — a disturbed conscience that can even affect one's focus in worship.",
  };
  },
  (rng) => ({
    prompt: `${name(rng)}'s spouse discovers receipts showing money was secretly spent on prohibited items. Trust between them is damaged as a result. Which effect of spending income in haram ways does this show?`,
    correct: "Harm to family trust — the secrecy and unlawful spending damage the relationship's foundation of trust",
    wrong: [
      "This shows haram spending strengthens honesty between spouses",
      "This shows the effect is purely financial, with no impact on relationships",
      "This shows the spouse overreacted, since the spending was a private matter",
    ],
    explanation: "Spending income in haram ways, especially when hidden, damages family trust — one of the real effects of haram spending beyond the money itself.",
  }),
  // Apply-tier: identify halal vs haram in a concrete, new situation.
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} runs a shop and always tells customers honestly about any defects in the goods before selling them. What kind of source of earning is this?`,
    correct: "Halal — honest trade, including disclosing defects, is a legitimate source of earning",
    wrong: [
      "Haram — disclosing defects means less profit, so it counts as a loss of lawful earning",
      "Haram — any form of trade is considered unlawful in Islam",
      "Halal, but only if the customer does not ask about defects first",
    ],
    explanation: "Honest trade, including truthfully disclosing defects, is a halal source of earning — dishonesty in trade, not honesty, is what makes earning haram.",
  }),
  (rng) => ({
    prompt: `${name(rng)} works on the family farm during the week and repairs bicycles as a side service on weekends in ${place(rng)}. How would both of these sources of income be classified in Islam?`,
    correct: "Both are halal — agriculture and offering a legitimate service are lawful sources of earning",
    wrong: [
      "Only the farming income is halal; repairing bicycles is haram",
      "Both are haram, since income must come from a single lawful source",
      "Only the bicycle repair income is halal; farming is haram",
    ],
    explanation: "Agriculture and legitimate services are both named halal sources of earning — a person can lawfully combine more than one of them.",
  }),
  (rng) => ({
    prompt: `A lender in ${place(rng)} offers ${name(rng)} a loan that must be repaid with a fixed extra amount added on top, regardless of the borrower's circumstances. What kind of source of earning does this represent for the lender?`,
    correct: "Haram — this is riba (interest), a prohibited source of earning in Islam",
    wrong: [
      "Halal — any agreed loan arrangement is automatically lawful",
      "Halal — as long as both parties agree to the terms in advance",
      "Haram, but only if the borrower cannot repay on time",
    ],
    explanation: "Charging a fixed extra amount on a loan is riba (interest) — a haram source of earning regardless of whether both parties agreed to it.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is offered a promotion at work after quietly paying an official a sum of money to influence the decision. How should this source of advantage be classified?`,
    correct: "Haram — this is bribery, a prohibited way of gaining advantage or earning",
    wrong: [
      "Halal — the payment was made privately and did not harm anyone directly",
      "Halal — as long as the employee genuinely deserved the promotion anyway",
      "Haram, but only if the official later refuses the payment",
    ],
    explanation: "Paying to influence an official decision is bribery — a haram way of gaining advantage, regardless of whether the person might otherwise have deserved the outcome.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives a monthly income and divides it between supporting family, saving some, and paying zakat once the nisab threshold is reached. How would this pattern of spending be classified?`,
      correct: "Legitimate (halal) — supporting family, saving, and paying zakat are all named legitimate ways of spending income",
      wrong: [
        "Illegitimate — income should only ever be spent on immediate family needs",
        "Illegitimate — zakat is only required from wealthy business owners, not employees",
        "Legitimate, but only if none of the income is saved",
      ],
      explanation: "Supporting one's family, saving, and paying zakat are all named legitimate (halal) ways of spending income in this sub-strand.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why lawful earning is described in Islam as an act of ibadah (worship), not just a financial matter. What is the best explanation?`,
    correct: "Earning through halal means, done with the right intention, is itself a way of fulfilling Allah's command and pleasing Him",
    wrong: [
      "Earning has no connection to worship in Islam at all",
      "Only formal acts like prayer and fasting can ever count as ibadah",
      "Lawful earning only becomes ibadah once all the money is given away",
    ],
    explanation: "Earning through halal means is treated as an act of ibadah in Islam — obeying Allah's command on lawful livelihood is itself a form of worship, not separate from it.",
  }),
];

export const tradeAndFinance: Skill = {
  id: "g7-ire-mu-trade-finance",
  code: "MU.2",
  subjectId: "ire",
  strandId: "g7-ire-muamalat",
  grade: 7,
  title: "Trade and Finance in Islam",
  description: "Halal and haram sources of earning, legitimate ways of spending income, and the effects of spending income in haram ways.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const halal = shuffle(rng, EARNING_FACTS.filter((f) => f.lawfulness === "halal")).slice(0, 5);
      const haram = shuffle(rng, EARNING_FACTS.filter((f) => f.lawfulness === "haram")).slice(0, 5);
      const chosen = shuffle(rng, [...halal, ...haram]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.lawfulness));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["halal", "haram"] as const).map((l) => ({ id: l, label: LAWFULNESS_LABEL[l] })),
        correctBucket,
        hint: "Check whether the activity follows honest, lawful means, or involves interest, gambling, theft, bribery, or forbidden goods.",
        explanation: chosen.map((f) => `"${f.text}" — ${LAWFULNESS_LABEL[f.lawfulness].toLowerCase()}.`).join(" "),
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
        hint: "Think about which term relates to earning, spending, or the blessing in wealth.",
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
        hint: "Think about whether the source of earning is lawful, and what real effect haram spending has beyond just being 'wrong'.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Earning through", after: "(interest) is a haram source of income in Islam.", answer: "riba", accepted: ["riba"] },
      { before: "Selling", after: "or pork is a haram source of earning.", answer: "alcohol", accepted: ["alcohol"] },
      { before: "A Muslim who cheats customers in trade is committing", after: ".", answer: "fraud", accepted: ["fraud"] },
      { before: "Paying", after: "on wealth that reaches the nisab threshold is a legitimate way of spending income.", answer: "zakat", accepted: ["zakat"] },
      { before: "Giving voluntary charity from one's earnings is called", after: ".", answer: "sadaqah", accepted: ["sadaqah"] },
      { before: "Wealth earned or spent in haram ways loses its", after: ", or blessing.", answer: "barakah", accepted: ["barakah"] },
      { before: "Earning wages through lawful", after: "is a halal source of income.", answer: "employment", accepted: ["employment"] },
      { before: "Taking money or property that belongs to someone else is called", after: ", a haram source of earning.", answer: "theft", accepted: ["theft"] },
      { before: "Accepting money to unfairly influence a decision is called", after: ".", answer: "bribery", accepted: ["bribery"] },
      { before: "Earning a living by growing crops or rearing livestock is called", after: ".", answer: "agriculture", accepted: ["agriculture", "farming"] },
      { before: "Games of chance where money is won or lost, such as betting, are called", after: ".", answer: "gambling", accepted: ["gambling"] },
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
      hint: "Recall the halal and haram sources of earning and ways of spending income.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
