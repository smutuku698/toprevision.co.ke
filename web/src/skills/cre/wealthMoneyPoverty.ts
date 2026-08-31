import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_CONCEPT_PROMPTS = [
  (teaching: string) => `Which concept: "${teaching}"?`,
  (teaching: string) => `Name the concept described here: "${teaching}"`,
  (teaching: string) => `This idea about wealth is which concept? "${teaching}"`,
  (teaching: string) => `Identify the term: "${teaching}"`,
  (teaching: string) => `Which concept fits this teaching? "${teaching}"`,
  (teaching: string) => `Read the teaching and name the concept: "${teaching}"`,
];

const MATCH_PROMPTS = [
  "Match each concept to what Christian teaching says about wealth, money, and poverty.",
  "Pair each concept below with the teaching it reflects.",
  "Connect each term to what Christian teaching says about it.",
  "Match each concept to the statement that explains it.",
  "Link each term about wealth and money to its meaning.",
  "Match each concept to the correct Christian teaching on wealth.",
];

const CONCEPTS: { term: string; teaching: string }[] = [
  { term: "Contentment", teaching: "Being satisfied with what you have instead of always craving more (1 Timothy 6:6-8)" },
  { term: "Love of money", teaching: "The Bible warns that the love of money is a root of many kinds of evil (1 Timothy 6:10)" },
  { term: "Diligence", teaching: "Working hard honestly is one of the ethical ways of acquiring wealth" },
  { term: "Generosity", teaching: "Sharing wealth to help the poor and needy is a Christian value" },
  { term: "Integrity", teaching: "Acquiring wealth honestly, not through corruption or theft" },
  { term: "Stewardship", teaching: "Managing money and wealth as resources entrusted by God, not owned outright" },
];

export const wealthMoneyPoverty: Skill = {
  id: "cre-cl-wealth-money-poverty",
  code: "CL.4",
  subjectId: "cre",
  strandId: "cre-living",
  grade: 9,
  title: "Wealth, money and poverty",
  description: "Match each Christian concept about wealth and money to what it teaches.",
  generate(rng) {
    const hint = "The Bible does not condemn wealth itself, but warns against loving money more than God and calls Christians to acquire and use it honestly and generously.";

    if (rng() < 0.5) {
      const target = randChoice(rng, CONCEPTS);
      const distractors = shuffle(rng, CONCEPTS.filter((c) => c.term !== target.term)).slice(0, 3);
      const choices = shuffle(rng, [target.term, ...distractors.map((d) => d.term)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_CONCEPT_PROMPTS)(target.teaching),
        choices,
        correctIndex: choices.indexOf(target.term),
        layout: "grid",
        hint,
        explanation: `${target.term} — ${target.teaching.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, CONCEPTS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((c) => ({ id: c.term, label: c.term })));
    const targets = shuffle(rng, chosen.map((c) => ({ id: c.term, label: c.teaching })));
    const correctMap: Record<string, string> = {};
    for (const c of chosen) correctMap[c.term] = c.term;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "The Bible does not condemn wealth itself, but warns against loving money more than God and calls Christians to acquire and use it honestly and generously.",
      explanation: chosen.map((c) => `${c.term} — ${c.teaching.toLowerCase()}.`).join(" "),
    };
  },
};
