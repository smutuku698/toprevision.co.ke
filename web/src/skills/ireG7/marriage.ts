import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// This sub-strand (purpose / conditions / rights-responsibilities of marriage) has no curriculum-stated
// sequence of steps and no numeric/spatial content, so it branches across 4 QuestionKinds (categorize,
// click-match, multiple-choice, fill-blank) rather than 5 — the SKILL-QUALITY-STANDARDS.md floor case where
// a 5th kind (ordering/hotspot/number-line) would have to be invented rather than drawn from real content.
// Confirmed no relevant visual exists in Assests-svg/ for this topic either.

const CATEGORIZE_PROMPTS = [
  "Sort each statement about marriage in Islam into the correct category.",
  "Group each statement about marriage under the correct category.",
  "Decide which category each statement about marriage belongs to, and sort it there.",
  "Sort each statement into the correct category: purpose, conditions, or rights.",
  "Place each statement into the right bucket for marriage in Islam.",
  "Categorise each statement about marriage into its correct category.",
];

const MATCH_PROMPTS = [
  "Match each marriage-related term to its meaning.",
  "Pair each marriage-related term with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each marriage-related term to the definition that fits it.",
  "Choose the correct meaning for each marriage-related term.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

type MarriageCategory = "purpose" | "conditions" | "rights";
interface MarriageFact {
  text: string;
  category: MarriageCategory;
}
const CATEGORY_LABEL: Record<MarriageCategory, string> = {
  purpose: "Purpose of marriage",
  conditions: "Conditions for a valid marriage",
  rights: "Rights and responsibilities in marriage",
};
const MARRIAGE_FACTS: MarriageFact[] = [
  { text: "Marriage helps a Muslim fulfil half of their faith (deen)", category: "purpose" },
  { text: "Marriage provides companionship between husband and wife", category: "purpose" },
  { text: "Marriage establishes a lawful family within a sanctioned bond", category: "purpose" },
  { text: "Marriage allows procreation to take place within a lawful, sanctioned relationship", category: "purpose" },
  { text: "Both spouses must give their free consent — a marriage cannot be forced on either person", category: "conditions" },
  { text: "The groom must give the bride a mahr (dower) as part of the marriage", category: "conditions" },
  { text: "A valid marriage requires at least two witnesses", category: "conditions" },
  { text: "The bride requires a wali (guardian) to represent her in the marriage contract", category: "conditions" },
  { text: "The marriage contract (nikah) must be announced openly, not kept secret", category: "conditions" },
  { text: "The husband is responsible for nafaqah — providing financial maintenance for the family", category: "rights" },
  { text: "The husband must treat his wife with kindness and respect", category: "rights" },
  { text: "The husband is responsible for protecting the family", category: "rights" },
  { text: "The wife manages the household with dignity", category: "rights" },
  { text: "The wife is expected to be a supportive partner to her husband", category: "rights" },
  { text: "Both spouses owe each other mutual respect and honesty", category: "rights" },
  { text: "Both spouses are responsible for meeting each other's emotional and material needs", category: "rights" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Mahr", meaning: "The dower given by the groom to the bride as part of a valid marriage" },
  { term: "Wali", meaning: "The guardian who represents the bride in the marriage contract" },
  { term: "Nikah", meaning: "The Islamic marriage contract, which must be announced rather than kept secret" },
  { term: "Nafaqah", meaning: "The husband's obligation to provide financial maintenance for his family" },
  { term: "Shuhud (witnesses)", meaning: "At least two people who must be present for a marriage to be valid" },
  { term: "Consent", meaning: "The free agreement of both spouses, without which a marriage is not valid" },
  { term: "Deen", meaning: "A Muslim's faith and practice, half of which marriage is said to help fulfil" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

// Female-only subset, for templates whose scenario text uses "she/her" pronouns tied to the named person
// being the bride/wife — using the full mixed-gender KENYAN_NAMES pool there would produce a name/pronoun
// mismatch (caught by sampling; see RIGOR-STANDARDS.md's note on sampling catching bugs review alone misses).
const KENYAN_FEMALE_NAMES = ["Amina", "Halima", "Zainab", "Fatuma", "Khadija", "Mariam"] as const;
function femaleName(rng: RNG) { return randChoice(rng, KENYAN_FEMALE_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${femaleName(rng)}'s family in ${place(rng)} has arranged a marriage for her, but she says she does not agree to it. According to the conditions for a valid marriage in Islam, what should happen?`,
    correct: "The marriage cannot proceed without her free consent — a forced marriage is not valid",
    wrong: [
      "The family's decision is final regardless of her wishes",
      "Her consent is only needed after the wedding has taken place",
      "Consent is required from the groom only, not the bride",
    ],
    explanation: "Mutual consent from both spouses is a condition for a valid marriage in Islam — a marriage cannot be forced on either the bride or the groom.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that because the bride's family is wealthy, the groom does not need to give her a mahr. Is this correct?`,
      correct: "No — mahr is a condition for a valid marriage regardless of the bride's own wealth",
      wrong: [
        "Yes — mahr is only required when the bride's family is poor",
        "Yes — mahr becomes optional once the couple is engaged",
        "No — but only if the groom's family requests it",
      ],
      explanation: "The mahr (dower) is a condition of a valid marriage on its own terms — it is not waived because of the bride's or her family's financial status.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} and their partner in ${place(rng)} plan to complete their nikah quietly with no one else present, believing this keeps the marriage more sacred. What is the flaw in this plan, according to the conditions for a valid marriage?`,
    correct: "A valid marriage requires at least two witnesses and must be announced, not kept secret",
    wrong: [
      "There is no flaw — witnesses are only needed for the walima (wedding feast)",
      "The flaw is that only the wali needs to be present, not witnesses",
      "There is no flaw — secrecy makes a marriage more valid, not less",
    ],
    explanation: "Two witnesses and public announcement of the nikah are both conditions for a valid marriage — a secret union without them does not meet these conditions.",
  }),
  (rng) => ({
    prompt: `${femaleName(rng)} in ${place(rng)} is being married, and her wali (guardian) is required to be part of the process. What role does the wali play in the marriage?`,
    correct: "The wali represents the bride in the marriage contract, as one of the conditions for a valid marriage",
    wrong: [
      "The wali replaces the need for the bride's own consent",
      "The wali is only a ceremonial guest with no defined role",
      "The wali's role is to provide the mahr instead of the groom",
    ],
    explanation: "The wali (guardian) represents the bride in the marriage contract — this is a distinct condition from consent, not a replacement for it.",
  }),
  (rng) => ({
    prompt: `After the wedding, ${femaleName(rng)}'s husband tells her that since he pays nafaqah, her own salary from work belongs to him. Is this an accurate understanding of rights and responsibilities in marriage?`,
    correct: "No — nafaqah is the husband's own responsibility, and a wife's earnings remain her own property",
    wrong: [
      "Yes — nafaqah cancels out any right a wife has to her own earnings",
      "Yes — a wife's earnings automatically become joint family property",
      "No — but only if the wife earns more than the husband",
    ],
    explanation: "Nafaqah is the husband's independent duty to maintain the family financially; a wife's own earnings are not owed to him because of it.",
  }),
  (rng) => {
    const who = femaleName(rng);
    return {
      prompt: `${who} in ${place(rng)} works a full-time job in addition to running the household. A relative says this means her husband no longer has to provide nafaqah. Is the relative correct?`,
      correct: "No — nafaqah remains the husband's responsibility even if the wife also earns an income",
      wrong: [
        "Yes — nafaqah is only required when the wife does not work",
        "Yes — whichever spouse earns more becomes responsible for nafaqah",
        "No — but only until the wife's income exceeds the husband's",
      ],
      explanation: "A wife choosing to work does not remove the husband's responsibility for nafaqah — providing financial maintenance for the family remains his duty.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} tells a classmate that the only purpose of marriage in Islam is to have children. Is this a complete picture of the purpose of marriage?`,
    correct: "No — marriage also fulfils half of one's faith and provides companionship, alongside establishing a lawful family",
    wrong: [
      "Yes — companionship and faith have nothing to do with marriage's purpose",
      "No — procreation is actually not part of the purpose of marriage at all",
      "Yes — the purpose of marriage is defined only by having children",
    ],
    explanation: "The purpose of marriage in Islam is broader than procreation alone — it includes fulfilling half of one's faith, companionship, and establishing a lawful family.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a husband being kind and respectful to his wife is optional, as long as he provides nafaqah. What does Islamic teaching on rights and responsibilities say about this?`,
    correct: "Kindness and respect are expected of the husband alongside nafaqah, not a substitute for it",
    wrong: [
      "Providing nafaqah is enough on its own to fulfil a husband's responsibilities",
      "Kindness is only required from the wife toward the husband",
      "Neither kindness nor nafaqah is actually required in marriage",
    ],
    explanation: "A husband's responsibilities include both nafaqah and treating his wife with kindness and respect — one does not replace the other.",
  }),
  (rng) => ({
    prompt: `${name(rng)} describes a marriage where both spouses are honest with each other and support each other's emotional needs, but disagree about who is responsible for the household. According to Islamic teaching, whose responsibility is managing the household?`,
    correct: "The wife manages the household with dignity, while both spouses remain responsible for mutual respect and honesty",
    wrong: [
      "Household management is the husband's sole responsibility, not the wife's",
      "Neither spouse has any defined responsibility toward the household",
      "Household management is decided entirely by the couple's parents",
    ],
    explanation: "The wife is described as managing the household with dignity, while mutual respect, honesty, and meeting each other's needs remain shared responsibilities of both spouses.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Islam requires both consent and a wali for a woman's marriage, rather than just one or the other. What is the best explanation?`,
      correct: "They are separate conditions — consent protects the bride's own agreement, while the wali represents her in the formal contract",
      wrong: [
        "The wali's approval alone is enough, so requiring consent too is unnecessary",
        "Consent alone is enough, so involving a wali serves no real purpose",
        "Both exist only for wealthy families, not for ordinary marriages",
      ],
      explanation: "Consent and the wali serve different purposes — consent ensures the bride freely agrees, while the wali formally represents her in the marriage contract; neither one replaces the other.",
    };
  },
];

export const marriage: Skill = {
  id: "g7-ire-mu-marriage",
  code: "MU.1",
  subjectId: "ire",
  strandId: "g7-ire-muamalat",
  grade: 7,
  title: "Marriage",
  description: "The purpose of marriage in Islam, the conditions for a valid marriage, and the rights and responsibilities of husband and wife.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const purpose = shuffle(rng, MARRIAGE_FACTS.filter((f) => f.category === "purpose")).slice(0, 3);
      const conditions = shuffle(rng, MARRIAGE_FACTS.filter((f) => f.category === "conditions")).slice(0, 3);
      const rights = shuffle(rng, MARRIAGE_FACTS.filter((f) => f.category === "rights")).slice(0, 3);
      const chosen = shuffle(rng, [...purpose, ...conditions, ...rights]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["purpose", "conditions", "rights"] as const).map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
        correctBucket,
        hint: "Ask whether the statement explains why Islam values marriage, what makes a marriage valid, or what each spouse owes the other.",
        explanation: chosen.map((f) => `"${f.text}" — ${CATEGORY_LABEL[f.category].toLowerCase()}.`).join(" "),
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
        hint: "Think about which condition, role, or right each term refers to in a Muslim marriage.",
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
        hint: "Check the situation against the actual conditions and rights/responsibilities Islam sets out for marriage.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Marriage helps a Muslim fulfil half of their", after: ".", answer: "faith", accepted: ["faith", "deen"] },
      { before: "The dower a groom gives to his bride as part of a valid marriage is called the", after: ".", answer: "mahr", accepted: ["mahr"] },
      { before: "A marriage in Islam cannot be forced on either spouse — both must give their free", after: ".", answer: "consent", accepted: ["consent"] },
      { before: "A valid marriage requires at least two", after: ".", answer: "witnesses", accepted: ["witnesses"] },
      { before: "The guardian who represents the bride in the marriage contract is called the", after: ".", answer: "wali", accepted: ["wali"] },
      { before: "The Islamic marriage contract, known as the", after: ", must be announced rather than kept secret.", answer: "nikah", accepted: ["nikah"] },
      { before: "The husband's responsibility to provide financial maintenance for his family is called", after: ".", answer: "nafaqah", accepted: ["nafaqah"] },
      { before: "Alongside providing nafaqah, a husband must treat his wife with kindness and", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "The wife manages the household with", after: ".", answer: "dignity", accepted: ["dignity"] },
      { before: "Both spouses are expected to fulfil each other's emotional and", after: "needs.", answer: "material", accepted: ["material"] },
      { before: "Marriage in Islam validates the establishment of a", after: ".", answer: "family", accepted: ["family"] },
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
      hint: "Recall the purpose, conditions, or rights and responsibilities of marriage in Islam.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
