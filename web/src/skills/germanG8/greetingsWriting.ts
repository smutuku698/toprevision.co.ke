import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Guten Tag! Wie geht es ", after: "?", answer: "Ihnen" },
  { before: "Mir geht es gut, danke. Und ", after: "?", answer: "Ihnen" },
  { before: "Wie ", after: " Sie?", answer: "heißen" },
  { before: "Freut mich, Sie ", after: ".", answer: "kennenzulernen" },
  { before: "Auf ", after: "!", answer: "Wiedersehen" },
  { before: "Wie alt ", after: " Sie?", answer: "sind" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Guten Tag!", "Wie geht es", "Ihnen", "?"], sentence: "Guten Tag! Wie geht es Ihnen?" },
  { chunks: ["Wie heißen Sie,", "bitte", "?"], sentence: "Wie heißen Sie, bitte?" },
  { chunks: ["Freut mich,", "Sie", "kennenzulernen", "."], sentence: "Freut mich, Sie kennenzulernen." },
  { chunks: ["Auf Wiedersehen,", "und", "danke", "!"], sentence: "Auf Wiedersehen, und danke!" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the grammatically correct formal question for 'What is your name?'",
    correct: "Wie heißen Sie?",
    distractors: ["Wie heißt du?", "Wie heißen du?", "Wie heißt Sie?"],
    explanation: "The formal pronoun 'Sie' pairs with the verb form 'heißen' (same as the infinitive): 'Wie heißen Sie?' — 'du' is informal, and 'heißt' is the 'du'-form, not the 'Sie'-form.",
  },
  {
    prompt: "Choose the correct formal pronoun to complete: 'Wie geht es ___?' (formal 'you')",
    correct: "Ihnen",
    distractors: ["dir", "du", "Sie"],
    explanation: "'Wie geht es Ihnen?' uses the formal dative pronoun 'Ihnen' — 'dir' is the informal dative, and 'Sie'/'du' are subject pronouns, not dative.",
  },
  {
    prompt: "Which is the correct formal way to say goodbye?",
    correct: "Auf Wiedersehen!",
    distractors: ["Tschüss!", "Auf Wiedersehen, du!", "Wiedersehen Auf!"],
    explanation: "'Auf Wiedersehen!' is the formal goodbye; 'Tschüss!' is informal, and the other options break the fixed word order.",
  },
  {
    prompt: "Choose the correctly spelled formal verb form to complete: 'Wie ___ Sie?' (to be named)",
    correct: "heißen",
    distractors: ["heisen", "heißt", "heißem"],
    explanation: "The correct spelling keeps the 'ß': 'heißen'. 'heißt' is the 'du'-form, and 'heißem'/'heisen' are not valid German verb forms.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "Guten Tag!", meaning: "Good day! / Hello!" },
  { term: "Wie geht es Ihnen?", meaning: "How are you? (formal)" },
  { term: "Mir geht es gut, danke. Und Ihnen?", meaning: "I'm doing well, thank you. And you? (formal)" },
  { term: "Wie heißen Sie?", meaning: "What is your name? (formal)" },
  { term: "Freut mich, Sie kennenzulernen.", meaning: "Pleased to meet you. (formal)" },
  { term: "Auf Wiedersehen!", meaning: "Goodbye! (formal)" },
  { term: "Wie alt sind Sie?", meaning: "How old are you? (formal)" },
  { term: "Tschüss!", meaning: "Goodbye! (informal)" },
];

export const greetingsWriting: Skill = {
  id: "g8-de-w-greetings",
  code: "W.1",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing formal greetings and introductions",
  description: "Practise the formal 'Sie' register: fill in verb forms, order words, and match formal greeting expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, formal German sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal greetings use 'Sie' and often the fixed phrases you've learned.",
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
        hint: "Think about the formal 'Sie' register — its verb endings and correct spelling.",
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
        prompt: "Match each German greeting expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'Wie geht es Ihnen?' and 'Wie heißen Sie?' both start with 'Wie' but ask very different things.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about the formal 'Sie' greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
