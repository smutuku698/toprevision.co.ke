import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to its general description.",
  "Pair each term with its general description.",
  "Connect each term below to what it means.",
  "Match each term to the description that fits it.",
  "Link each term with the correct description.",
  "Choose the correct description for each term below.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a cause or an effect of deviant sexual behaviour in society.",
  "Group each statement under a cause or an effect.",
  "Decide whether each statement is a cause or an effect, and sort it there.",
  "Sort each statement into the correct category: cause, or effect.",
  "Place each statement into the right bucket — cause, or effect.",
  "Categorise each statement as a cause or an effect of deviant sexual behaviour.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const BEHAVIOUR_TERMS: { term: string; description: string }[] = [
  { term: "Incest", description: "Sexual relations between close blood relatives, forbidden because of the family and social harm it causes" },
  { term: "Bestiality", description: "Sexual relations between a human and an animal, a violation of human dignity" },
  { term: "Prostitution", description: "Exchanging sexual acts for payment, which undermines family life and social morality" },
  { term: "Homosexuality", description: "Sexual relations between people of the same sex, prohibited in Islamic teaching" },
];

const SORT_ITEMS = [
  { text: "Exposure to harmful or immoral content", bucket: "cause" },
  { text: "Weak moral upbringing at home", bucket: "cause" },
  { text: "Negative peer pressure", bucket: "cause" },
  { text: "Idleness and lack of purposeful activity", bucket: "cause" },
  { text: "Breakdown of family structure", bucket: "effect" },
  { text: "Spread of disease in society", bucket: "effect" },
  { text: "Moral decay and loss of trust in the community", bucket: "effect" },
] as const;
const SORT_LABEL: Record<string, string> = { cause: "A cause of deviant sexual behaviour", effect: "An effect of deviant sexual behaviour on society" };

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is one cause of deviant sexual behaviour identified in Islamic teaching?",
    correct: "Exposure to harmful content and weak moral upbringing",
    distractors: ["Regular attendance at the mosque", "Strong family guidance", "Following the teachings of the Qur'an"],
  },
  {
    q: "What is one effect of deviant sexual behaviour on society?",
    correct: "Breakdown of family structure and spread of disease",
    distractors: ["Stronger family bonds", "Improved public trust", "Greater social stability"],
  },
  {
    q: "What is the Islamic rationale for prohibiting deviant sexual behaviour?",
    correct: "To protect lineage, family, and public morality, and to uphold human dignity as created by Allah",
    distractors: ["To limit population growth only", "To punish people with no other purpose", "Because it has no connection to family or society"],
  },
  {
    q: "Why does Islam link the prohibition of deviant sexual behaviour to human dignity?",
    correct: "Because every human being is honoured as a creation of Allah, and such behaviour undermines that dignity",
    distractors: ["Because dignity is unrelated to personal conduct", "Because only some people are considered to have dignity in Islam", "Because the concept of dignity does not apply to this topic"],
  },
];

export const prohibitionsInIslam: Skill = {
  id: "g8-ire-ak-prohibitions-in-islam",
  code: "AK.3",
  subjectId: "ire",
  strandId: "g8-ire-ak",
  grade: 8,
  title: "Prohibitions in Islam: Deviant Sexual Behaviour",
  description: "The causes, effects, and Islamic rationale for the prohibition of deviant sexual behaviour.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, BEHAVIOUR_TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These are all forms of sexual behaviour that Islam prohibits to protect the family and society.",
        explanation: chosen.map((t) => `${t.term} — ${t.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SORT_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: SORT_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "A cause leads to the behaviour; an effect is the harm it produces afterward.",
        explanation: chosen.map((c) => `"${c.text}" — ${SORT_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "Islam prohibits deviant sexual behaviour partly to protect lineage,",
        after: ", and public morality.",
        correctAnswer: "family",
        inputMode: "text",
        hint: "This word refers to the household unit that Islam places great importance on protecting.",
        explanation: "Islam prohibits deviant sexual behaviour to protect lineage, family, and public morality, and to uphold human dignity.",
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
      hint: "Islam prohibits deviant sexual behaviour to protect lineage, family, and the moral fabric of society.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
