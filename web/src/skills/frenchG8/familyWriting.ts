import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Le père de mon père est mon ", after: ".", answer: "grand-père" },
  { before: "La sœur de ma mère est ma ", after: ".", answer: "tante" },
  { before: "Le fils de mon oncle est mon ", after: ".", answer: "cousin" },
  { before: "La fille de ma sœur est ma ", after: ".", answer: "nièce" },
  { before: "Les enfants de mes enfants sont mes ", after: ".", answer: "petits-enfants" },
  { before: "Le frère de mon père est mon ", after: ".", answer: "oncle" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon grand-père", "et ma grand-mère", "habitent", "à la campagne."], sentence: "Mon grand-père et ma grand-mère habitent à la campagne." },
  { chunks: ["Ma tante", "a", "deux enfants."], sentence: "Ma tante a deux enfants." },
  { chunks: ["Mes grands-parents", "ont", "sept petits-enfants."], sentence: "Mes grands-parents ont sept petits-enfants." },
  { chunks: ["Mon oncle", "est", "le frère de mon père."], sentence: "Mon oncle est le frère de mon père." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct possessive adjective: '___ tante habite à Nairobi.'",
    correct: "Ma",
    distractors: ["Mon", "Mes", "Ta"],
    explanation: "'Tante' is feminine singular, so the correct possessive is 'Ma tante'.",
  },
  {
    prompt: "Choose the correct possessive adjective: '___ grands-parents sont âgés.'",
    correct: "Mes",
    distractors: ["Mon", "Ma", "Ses"],
    explanation: "'Grands-parents' is plural, so the possessive is 'Mes grands-parents'.",
  },
  {
    prompt: "Choose the correct possessive adjective: '___ oncle travaille à la banque.'",
    correct: "Mon",
    distractors: ["Ma", "Mes", "Sa"],
    explanation: "'Oncle' is masculine singular, so the possessive is 'Mon oncle'.",
  },
  {
    prompt: "Which sentence correctly and formally asks who someone is?",
    correct: "Qui est-ce ?",
    distractors: ["Qui c'est ça ?", "Qui es-tu il ?", "Qui est ce que ?"],
    explanation: "The standard formal question is 'Qui est-ce ?', meaning 'Who is it/that?'",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "le grand-père", meaning: "the grandfather" },
  { term: "la grand-mère", meaning: "the grandmother" },
  { term: "l'oncle", meaning: "the uncle" },
  { term: "la tante", meaning: "the aunt" },
  { term: "le cousin", meaning: "the (male) cousin" },
  { term: "la cousine", meaning: "the (female) cousin" },
  { term: "le neveu", meaning: "the nephew" },
  { term: "la nièce", meaning: "the niece" },
  { term: "les petits-enfants", meaning: "the grandchildren" },
  { term: "le mari", meaning: "the husband" },
  { term: "la femme", meaning: "the wife" },
];

export const familyWriting: Skill = {
  id: "g8-fr-w-family",
  code: "W.2",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing about extended family",
  description: "Fill in extended-family vocabulary, order sentences, choose correct possessive adjectives, and match family words to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject usually comes first, then the verb, then the rest of the sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Check whether the family word is masculine, feminine, or plural before picking the possessive.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each French family word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Remember: 'le/la cousin(e)' changes ending for gender, but 'le/la petit(e)-enfant' becomes plural as 'les petits-enfants'.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Read the family relationship and fill in the missing word.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Work out the relationship logically, then give the matching French family word.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
