import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to its meaning in Islamic trade and finance.",
  "Pair each term with its meaning in Islamic trade and finance.",
  "Connect each term below to what it means.",
  "Match each term to the meaning that fits it.",
  "Link each term with the correct definition in Islamic finance.",
  "Choose the correct meaning for each term below.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each practice as allowed or prohibited in Islamic trade.",
  "Group each practice under allowed or prohibited in Islamic trade.",
  "Decide whether each practice is allowed or prohibited, and sort it there.",
  "Sort each practice into the correct category: allowed, or prohibited.",
  "Place each practice into the right bucket — allowed, or prohibited.",
  "Categorise each practice as allowed or prohibited in Islamic trade.",
];

const ORDER_PROMPTS = [
  "Arrange the steps of making a valid Islamic business agreement in the correct order.",
  "Put the steps of making a valid Islamic business agreement into the correct order.",
  "Sequence these steps of an Islamic business agreement correctly.",
  "Order these steps of a valid Islamic agreement as they actually happen.",
  "Sort these steps of making an Islamic business agreement into order.",
  "Arrange these steps of a valid Islamic agreement from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Riba", meaning: "Interest charged on a loan, forbidden in Islamic trade and finance" },
  { term: "Gharar", meaning: "Excessive uncertainty or ambiguity about the terms of a contract, forbidden in Islamic trade" },
  { term: "Mutual consent", meaning: "Both parties freely and willingly agreeing to the terms of a contract" },
  { term: "Clarity of terms", meaning: "The price, goods, and conditions of an agreement being clearly stated to both parties" },
];

const RULE_ITEMS = [
  { text: "Clearly stating the price before selling an item", bucket: "allowed" },
  { text: "Both parties agreeing willingly to the terms", bucket: "allowed" },
  { text: "Writing down the terms of the agreement", bucket: "allowed" },
  { text: "Charging interest on a loan (riba)", bucket: "prohibited" },
  { text: "Selling something while hiding a major defect", bucket: "prohibited" },
  { text: "Making an agreement with unclear or uncertain terms (gharar)", bucket: "prohibited" },
] as const;
const RULE_LABEL: Record<string, string> = { allowed: "Allowed in Islamic trade", prohibited: "Prohibited in Islamic trade" };

const ORDER_ITEMS = [
  { id: "state", label: "Both parties clearly state the goods or service and the price" },
  { id: "consent", label: "Both parties give free and mutual consent" },
  { id: "record", label: "The agreement is written down or witnessed" },
  { id: "exchange", label: "The exchange or transaction is completed honestly" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does Islam prohibit in lending and borrowing money?",
    correct: "Riba — charging interest on a loan",
    distractors: ["Writing down the terms of a loan", "Repaying a loan on time", "Agreeing on a fair price"],
  },
  {
    q: "What is 'gharar' in Islamic trade?",
    correct: "Excessive uncertainty or ambiguity about the terms of a contract",
    distractors: ["A fair price agreed by both parties", "A written record of a transaction", "A form of charity in business"],
  },
  {
    q: "Why does Islam require mutual consent in a contract?",
    correct: "So that both parties freely agree to the terms, without pressure or deception",
    distractors: ["So that only the seller's opinion matters", "Because contracts do not need agreement from both sides", "To allow one party to change the terms secretly"],
  },
  {
    q: "Why are agreements and contracts important in Islamic business transactions?",
    correct: "They ensure fairness, clarity, and trust between the parties involved",
    distractors: ["They are only needed for very large transactions", "They remove the need for honesty between traders", "They are optional and rarely followed in Islamic teaching"],
  },
];

export const tradeAndFinance: Skill = {
  id: "g8-ire-mu-trade-and-finance",
  code: "MU.3",
  subjectId: "ire",
  strandId: "g8-ire-mu",
  grade: 8,
  title: "Trade and Finance in Islam",
  description: "Islamic rules on agreements and contracts: mutual consent, clarity, fairness, and the prohibition of riba and gharar.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS);
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
        hint: "Islam prohibits riba and gharar, and requires mutual consent and clarity in every contract.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, RULE_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: RULE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `r${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`r${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Fair, clear, and consenting agreements are allowed; interest and hidden uncertainty are prohibited.",
        explanation: chosen.map((c) => `"${c.text}" — ${RULE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_ITEMS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_ITEMS.map((s) => s.id),
        hint: "Start with stating the terms clearly, then agreement, then a record, then honest completion.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "In Islamic finance, charging interest on a loan is called",
        after: "and is forbidden.",
        correctAnswer: "riba",
        inputMode: "text",
        hint: "This Arabic term refers to interest or usury.",
        explanation: "Charging interest on a loan is called riba and is forbidden in Islamic finance.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Islamic contracts require mutual consent, clarity, and fairness, and forbid riba (interest) and gharar (excessive uncertainty).",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
