import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie alt ", after: " Sie?", answer: "sind" },
  { before: "Wie alt ist ", after: " Vater?", answer: "Ihr" },
  { before: "Was sind Sie von ", after: "?", answer: "Beruf" },
  { before: "Ich bin Lehrer von ", after: ".", answer: "Beruf" },
  { before: "Ist ", after: " Mutter Ärztin von Beruf?", answer: "Ihre" },
  { before: "Die ", after: " ist Bäuerin von Beruf.", answer: "Tante" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie alt", "ist Ihr Vater", "?"], sentence: "Wie alt ist Ihr Vater?" },
  { chunks: ["Was sind Sie", "von Beruf", "?"], sentence: "Was sind Sie von Beruf?" },
  { chunks: ["Ich bin", "Lehrerin", "von Beruf", "."], sentence: "Ich bin Lehrerin von Beruf." },
  { chunks: ["Ist Ihre Mutter", "Ärztin", "von Beruf", "?"], sentence: "Ist Ihre Mutter Ärztin von Beruf?" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal possessive to complete: '___ Vater ist Lehrer von Beruf.' (your father, formal, masculine noun)",
    correct: "Ihr",
    distractors: ["Ihre", "Ihres", "Sie"],
    explanation: "'Vater' is masculine, so the formal possessive is 'Ihr' — 'Ihre' is used with feminine/plural nouns, not masculine singular.",
  },
  {
    prompt: "Choose the correct formal possessive to complete: '___ Mutter ist Ärztin von Beruf.' (your mother, formal, feminine noun)",
    correct: "Ihre",
    distractors: ["Ihr", "Ihrer", "Sie"],
    explanation: "'Mutter' is feminine, so the formal possessive is 'Ihre' — 'Ihr' is used with masculine/neuter nouns.",
  },
  {
    prompt: "Which is the correctly gendered profession for a female cook?",
    correct: "die Köchin",
    distractors: ["der Köchin", "die Koch", "der Koch"],
    explanation: "Feminine professions add '-in' to the masculine form and take 'die': 'der Koch' → 'die Köchin'.",
  },
  {
    prompt: "Choose the correct formal question for 'How old are you?'",
    correct: "Wie alt sind Sie?",
    distractors: ["Wie alt bist du?", "Wie alt sind du?", "Wie alt ist Sie?"],
    explanation: "The formal pronoun 'Sie' takes the verb form 'sind': 'Wie alt sind Sie?' — 'bist' pairs with 'du', and 'ist' pairs with 'er/sie/es'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "der Vater", meaning: "father" },
  { term: "die Mutter", meaning: "mother" },
  { term: "die Großmutter", meaning: "grandmother" },
  { term: "der Großvater", meaning: "grandfather" },
  { term: "der Onkel", meaning: "uncle" },
  { term: "die Tante", meaning: "aunt" },
  { term: "der Bruder", meaning: "brother" },
  { term: "die Schwester", meaning: "sister" },
  { term: "der Lehrer", meaning: "teacher (male)" },
  { term: "die Ärztin", meaning: "doctor (female)" },
  { term: "der Ingenieur", meaning: "engineer (male)" },
  { term: "die Bäuerin", meaning: "farmer (female)" },
];

export const familyWriting: Skill = {
  id: "g8-de-w-family",
  code: "W.2",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing about family and professions",
  description: "Write formal sentences about family members and their professions using the correct gender and possessives.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, formal German sentence about family.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal questions about family use 'Ihr'/'Ihre' and the verb 'sind' or 'ist'.",
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
        hint: "Check whether the noun is masculine or feminine before choosing the possessive.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each German family or profession word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'der Onkel' and 'die Tante' are related by marriage or blood, but only one is male.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German sentence about family.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about whether the sentence needs a verb form, a possessive, or a noun.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
