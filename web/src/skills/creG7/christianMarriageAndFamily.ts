import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// CL.2 "Christian Marriage and Family" has no natural sequence, spatial layout, or numeric
// quantity in its source content (unordered biblical teachings and values) — so this skill
// genuinely supports only 4 QuestionKinds (multiple-choice, categorize, click-match,
// fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const CATEGORIZE_PROMPTS = [
  "Sort each action as something that stabilises a family or something that undermines it.",
  "Decide whether each action stabilises or undermines a family, and sort it there.",
  "Group these actions under stabilises the family or undermines the family.",
  "Sort each action below into the correct category.",
  "Place each action into the bucket for stabilises or undermines.",
  "Read each action and sort it under stabilises or undermines the family.",
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
  "Complete this fact about Christian marriage and family with the right word.",
];

const STABILISING = [
  "Communicating openly and honestly about problems as they arise",
  "Forgiving one another after a disagreement instead of holding a grudge",
  "Spending regular, intentional time together as a family",
  "Honouring and respecting one's parents, as Exodus 20:12 teaches",
  "Being faithful and committed to one's spouse",
  "Raising children with loving instruction rather than harshness (Ephesians 6:4)",
  "Managing family finances responsibly and honestly",
  "Sharing a common faith and praying together as a family",
] as const;

const UNDERMINING = [
  "Refusing to communicate honestly about problems in the family",
  "Holding onto bitterness and refusing to forgive a family member",
  "Consistently prioritising work or other interests over family time",
  "Disrespecting or dishonouring one's parents",
  "Being unfaithful or breaking trust with one's spouse",
  "Exasperating children through harsh, discouraging treatment (Ephesians 6:4)",
  "Mismanaging family finances carelessly or dishonestly",
  "Allowing constant unresolved conflict to go unaddressed",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Genesis 2:23-24", meaning: "Teaches that a man and woman leave their parents and become one flesh in marriage" },
  { term: "Ephesians 5:22-33", meaning: "Teaches mutual love and respect between husband and wife, likened to Christ and the Church" },
  { term: "Exodus 20:12", meaning: "Commands honouring one's father and mother" },
  { term: "Psalm 127:3-5", meaning: "Describes children as a heritage and reward from the Lord" },
  { term: "Ephesians 6:4", meaning: "Instructs fathers not to exasperate their children, but to raise them in the Lord's instruction" },
  { term: "One flesh", meaning: "Genesis 2:24's description of the union formed between a husband and wife" },
  { term: "Heritage", meaning: "Psalm 127's description of children as a valuable inheritance from God" },
  { term: "Commitment", meaning: "A steady, lasting dedication to one's spouse and family" },
  { term: "Mutual respect", meaning: "Both spouses honouring and valuing one another in marriage" },
  { term: "Stable family", meaning: "A family marked by love, honesty, forgiveness, and shared faith" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s parents in ${place(rng)} make time each evening to talk honestly about the day's challenges, even when it is uncomfortable. Which value for a stable family does this best show?`,
      correct: "Open, honest communication",
      wrong: ["Avoiding difficult conversations entirely", "Prioritising work over family time", "Holding onto unresolved bitterness"],
      explanation: "Making time to talk openly and honestly, even about difficult things, is a key value for a stable family — communication that many struggling families lack.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s parents in ${place(rng)} forgive each other quickly after a disagreement instead of holding a long-term grudge. Which Biblical value does this reflect?`,
    correct: "Forgiveness — letting go of resentment to restore the relationship",
    wrong: ["Financial responsibility, which is about managing money, not relationships", "Mutual respect alone, without addressing forgiveness specifically", "Commitment, which is about lasting dedication, not resolving a specific conflict"],
    explanation: "Quickly forgiving each other rather than holding onto a grudge directly reflects the value of forgiveness, which helps restore and stabilise family relationships.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is disrespectful and dismissive toward their parents' guidance, ignoring Exodus 20:12's teaching. What is the likely long-term effect on family stability?`,
      correct: "It weakens family relationships and undermines the honour the commandment calls for",
      wrong: ["It has no real effect on the family at all", "It automatically strengthens family bonds over time", "It only matters for very young children, not teenagers"],
      explanation: "Exodus 20:12's command to honour one's parents supports healthy family relationships; consistently disrespecting that guidance weakens the family, regardless of the child's age.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s father in ${place(rng)} disciplines his children through harsh, discouraging criticism rather than loving instruction. Which Biblical teaching is he failing to follow?`,
    correct: "Ephesians 6:4's instruction not to exasperate children but to raise them in loving instruction",
    wrong: ["Psalm 127:3-5's description of children as a heritage from the Lord", "Genesis 2:23-24's teaching on marriage as one flesh", "Exodus 20:12's command to honour one's parents"],
    explanation: "Ephesians 6:4 specifically instructs fathers not to exasperate their children but to raise them with loving instruction — harsh, discouraging criticism directly contradicts this teaching.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Genesis 2:23-24 teaches about the union formed in marriage. What is the correct answer?`,
    correct: "A husband and wife leave their parents and become 'one flesh'",
    wrong: ["Marriage requires no real change in a couple's relationship with their parents", "Genesis 2:23-24 focuses only on raising children, not marriage itself", "The passage describes marriage as a purely legal arrangement with no deeper meaning"],
    explanation: "Genesis 2:23-24 describes marriage as a union in which husband and wife leave their parents and become 'one flesh' — a foundational Biblical picture of marriage.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} regularly overspends and hides financial problems from each other, causing repeated stress. What value for a stable family is missing here?`,
      correct: "Managing family finances responsibly and honestly",
      wrong: ["Spending regular time together, unrelated to finances", "Honouring one's parents, unrelated to household budgeting", "Sharing a common faith, unrelated to money management"],
      explanation: "Responsible, honest financial management is a specific value for family stability, distinct from time together, respect for parents, or shared faith.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Ephesians 5:22-33 teaches about the relationship between husband and wife. What is the correct summary?`,
    correct: "Mutual love and respect between husband and wife, likened to Christ's relationship with the Church",
    wrong: ["That one spouse should have complete, unquestioned control over the other", "That marriage requires no love or respect at all, only formal duty", "That husbands and wives should live entirely separate lives"],
    explanation: "Ephesians 5:22-33 teaches mutual love and respect between husband and wife, comparing their relationship to Christ's sacrificial love for the Church.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Psalm 127:3-5 says about children. What is the correct teaching?`,
    correct: "Children are described as a heritage and reward from the Lord",
    wrong: ["Children are described as a burden to be avoided", "The Psalm says nothing at all about children", "Children are described only as a financial responsibility"],
    explanation: "Psalm 127:3-5 describes children as a heritage — a valuable gift and reward from the Lord — not a burden.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is preparing to counsel young people before marriage on what to look for in a future spouse. Which quality reflects the Biblical values discussed for Christian marriage?`,
    correct: "Faithfulness, commitment, and mutual respect",
    wrong: ["Wealth alone, regardless of character", "Physical appearance alone, regardless of values", "A guarantee that no disagreements will ever occur"],
    explanation: "Biblical teaching on Christian marriage highlights faithfulness, commitment, and mutual respect as core qualities, rather than wealth, appearance, or an unrealistic promise of no conflict.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)}'s family prays and worships together regularly, sharing the same core faith. Which value for a stable family does this reflect?`,
    correct: "Sharing a common faith as a family",
    wrong: ["Financial responsibility, unrelated to shared worship", "Honouring one's parents specifically, rather than shared faith broadly", "Forgiveness, which addresses conflict rather than shared belief"],
    explanation: "Praying and worshipping together as a family reflects the value of sharing a common faith, which the design highlights as contributing to stable families.",
  }),
];

export const christianMarriageAndFamily: Skill = {
  id: "g7-cre-cl-christian-marriage-and-family",
  code: "CL.2",
  subjectId: "cre",
  strandId: "g7-cre-living",
  grade: 7,
  title: "Christian Marriage and Family",
  description: "Biblical teachings on marriage and family (Genesis 2:23-24, Ephesians 5:22-33, Exodus 20:12, Psalm 127:3-5, Ephesians 6:4), and values needed for stable families.",
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
        hint: "Think about the Biblical teachings on marriage and family, and the values that make a family stable.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const good = shuffle(rng, STABILISING).slice(0, 4);
      const bad = shuffle(rng, UNDERMINING).slice(0, 4);
      const chosen = shuffle(rng, [...good.map((t) => ({ text: t, good: true })), ...bad.map((t) => ({ text: t, good: false }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.good ? "stabilises" : "undermines"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "stabilises", label: "Stabilises the family" },
          { id: "undermines", label: "Undermines the family" },
        ],
        correctBucket,
        hint: "Stabilising actions build trust, respect, and honesty; undermining actions break them down.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.good ? "stabilises the family" : "undermines the family"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
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
        hint: "Think about the Biblical teachings on marriage, children, and family life.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const facts = [
      { before: "Genesis 2:24 says a man leaves his parents and the two become one", after: ".", answer: "flesh", accepted: ["flesh"] },
      { before: "Exodus 20:12 commands honouring one's father and", after: ".", answer: "mother", accepted: ["mother"] },
      { before: "Psalm 127:3 describes children as a", after: "from the Lord.", answer: "heritage", accepted: ["heritage"] },
      { before: "Ephesians 6:4 tells fathers not to", after: "their children, but to raise them in the Lord's instruction.", answer: "exasperate", accepted: ["exasperate"] },
      { before: "Ephesians 5:22-33 compares the love between husband and wife to the love of Christ for the", after: ".", answer: "Church", accepted: ["church"] },
      { before: "A steady, lasting dedication to one's spouse and family is called", after: ".", answer: "commitment", accepted: ["commitment"] },
      { before: "Letting go of resentment against a family member is called", after: ".", answer: "forgiveness", accepted: ["forgiveness"] },
      { before: "Both spouses honouring and valuing one another in marriage is called mutual", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "A family marked by love, honesty, forgiveness, and shared faith is described as", after: ".", answer: "stable", accepted: ["stable"] },
      { before: "Talking openly and honestly about family problems as they arise is called open", after: ".", answer: "communication", accepted: ["communication"] },
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
      hint: "Think about the Biblical teachings on marriage and family.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
