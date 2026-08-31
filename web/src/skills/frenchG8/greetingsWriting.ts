import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Bonjour Madame, comment ", after: "-vous ?", answer: "allez" },
  { before: "Bonjour Monsieur, je vais très bien, merci. Et ", after: " ?", answer: "vous" },
  { before: "Comment vous ", after: "-vous, Monsieur ?", answer: "appelez" },
  { before: "", after: ", Mademoiselle. Enchanté.", answer: "Bonjour" },
  { before: "Quel est ", after: " nom, s'il vous plaît ?", answer: "votre" },
  { before: "Je suis ", after: " de faire votre connaissance.", answer: "enchanté" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Bonjour Madame,", "comment allez-vous", "aujourd'hui", "?"], sentence: "Bonjour Madame, comment allez-vous aujourd'hui ?" },
  { chunks: ["Quel est", "votre nom,", "s'il vous plaît", "?"], sentence: "Quel est votre nom, s'il vous plaît ?" },
  { chunks: ["Enchanté", "de faire", "votre connaissance", "."], sentence: "Enchanté de faire votre connaissance." },
  { chunks: ["Au revoir,", "Monsieur,", "à bientôt", "!"], sentence: "Au revoir, Monsieur, à bientôt !" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the grammatically correct formal question for 'How are you?'",
    correct: "Comment allez-vous ?",
    distractors: ["Comment vous allez ?", "Comment tu vas ?", "Comment va vous ?"],
    explanation: "Formal questions invert the verb and 'vous': 'Comment allez-vous ?' The other options use the wrong word order or the informal 'tu'.",
  },
  {
    prompt: "Choose the correct formal verb form to complete: 'Comment ___-vous aujourd'hui ?'",
    correct: "allez",
    distractors: ["vas", "va", "allons"],
    explanation: "'Vous' takes the verb form 'allez': 'Comment allez-vous ?' — 'vas' and 'va' go with 'tu'/'il', and 'allons' goes with 'nous'.",
  },
  {
    prompt: "Which spelling is correct for formally addressing an unmarried woman?",
    correct: "Mademoiselle",
    distractors: ["Mademoisel", "Mademoiselle e", "Madmoiselle"],
    explanation: "The correct spelling is 'Mademoiselle' — note the double 'l' and the final silent 'e'.",
  },
  {
    prompt: "Which sentence correctly uses the formal register to ask someone's name?",
    correct: "Comment vous appelez-vous ?",
    distractors: ["Comment tu t'appelles ?", "Comment vous appelle ?", "Comment vous t'appelez ?"],
    explanation: "The formal question is 'Comment vous appelez-vous ?', using 'vous' consistently as both subject and reflexive pronoun.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "Comment allez-vous ?", meaning: "How are you? (formal)" },
  { term: "Je vais bien, merci. Et vous ?", meaning: "I am well, thank you. And you?" },
  { term: "Comment vous appelez-vous ?", meaning: "What is your name? (formal)" },
  { term: "Enchanté(e) de faire votre connaissance", meaning: "Pleased to meet you" },
  { term: "Au revoir, Monsieur", meaning: "Goodbye, Sir" },
  { term: "Quel est votre nom, s'il vous plaît ?", meaning: "What is your name, please?" },
  { term: "Ravi(e) de vous rencontrer", meaning: "Delighted to meet you" },
  { term: "Bonjour Mademoiselle", meaning: "Good day, Miss" },
];

export const greetingsWriting: Skill = {
  id: "g8-fr-w-greetings",
  code: "W.1",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing formal greetings and introductions",
  description: "Practise the formal 'vous' register: fill in verb forms, order words, and match formal greeting expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, formal French sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal greetings use 'vous' and titles like Monsieur/Madame/Mademoiselle.",
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
        hint: "Think about the formal 'vous' register — its verb endings and correct spelling.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each formal French greeting expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'Comment allez-vous ?' and 'Comment vous appelez-vous ?' both start with 'Comment' but ask very different things.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal French sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think about the formal 'vous' greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
