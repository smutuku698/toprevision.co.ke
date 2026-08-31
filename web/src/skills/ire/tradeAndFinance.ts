import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to what it means in Islamic trade and finance.",
  "Pair each term with its correct meaning in Islamic trade and finance.",
  "Connect each term below to what it means.",
  "Match each term to the meaning that fits it.",
  "Link each term with the correct definition in Islamic finance.",
  "Choose the correct meaning for each term below.",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Riba", meaning: "Interest or usury charged on a loan — forbidden in Islam" },
  { term: "Writing down debts", meaning: "A practice Islam encourages so the terms of a loan are clear and honest" },
  { term: "Consumer protection agencies", meaning: "Bodies that safeguard buyers and sellers from fraud and unfair trade practices" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does Islam prohibit in lending and borrowing money?",
    correct: "Riba — charging interest or usury on a loan",
    distractors: ["Writing down the terms of a loan", "Repaying a loan on time", "Lending money to family members"],
  },
  {
    q: "What does Islamic teaching encourage when money is borrowed or lent?",
    correct: "Fairness, honesty, and clearly recording the terms of the debt",
    distractors: ["Keeping the loan terms secret from everyone", "Charging as much interest as possible", "Avoiding any written agreement"],
  },
  {
    q: "What is the role of consumer protection agencies in trade?",
    correct: "To safeguard buyers and sellers from fraud and unfair practices",
    distractors: ["To set religious holidays", "To collect taxes only", "To replace the need for honesty in business"],
  },
  {
    q: "Why does Islam emphasise equity in borrowing and lending money?",
    correct: "To prevent exploitation and protect fairness between the lender and borrower",
    distractors: ["To make lending money illegal altogether", "To ensure only the wealthy can borrow", "To eliminate the need for repayment"],
  },
];

export const tradeAndFinance: Skill = {
  id: "ire-mu-trade-finance",
  code: "MU.5",
  subjectId: "ire",
  strandId: "ire-muamalat",
  grade: 9,
  title: "Trade and finance in Islam",
  description: "Answer questions about Islamic rules on borrowing and lending money.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Islam prohibits interest (riba) and instead calls for fairness, honesty, and clear terms in all borrowing and lending.",
        explanation: TERMS.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
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
      hint: "Islam prohibits interest (riba) and instead calls for fairness, honesty, and clear terms in all borrowing and lending.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
