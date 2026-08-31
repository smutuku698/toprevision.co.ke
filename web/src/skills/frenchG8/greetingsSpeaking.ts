import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Bonjour Monsieur", meaning: "Good day, Sir (formal)" },
  { phrase: "Bonjour Madame", meaning: "Good day, Madam (formal)" },
  { phrase: "Bonjour Mademoiselle", meaning: "Good day, Miss (formal)" },
  { phrase: "Comment allez-vous ?", meaning: "How are you? (formal, vous)" },
  { phrase: "Je vais bien, merci. Et vous ?", meaning: "I am well, thank you. And you? (formal)" },
  { phrase: "Comment vous appelez-vous ?", meaning: "What is your name? (formal, vous)" },
  { phrase: "Quel est votre nom, s'il vous plaît ?", meaning: "What is your name, please? (formal)" },
  { phrase: "Enchanté de faire votre connaissance", meaning: "Pleased to make your acquaintance" },
  { phrase: "Ravi de vous rencontrer", meaning: "Delighted to meet you" },
  { phrase: "Au revoir, Monsieur", meaning: "Goodbye, Sir (formal)" },
];

const CONTRAST_PAIRS: { formal: string; informal: string; meaning: string }[] = [
  { formal: "Comment allez-vous ?", informal: "Comment tu vas ?", meaning: "How are you?" },
  { formal: "Comment vous appelez-vous ?", informal: "Tu t'appelles comment ?", meaning: "What is your name?" },
  { formal: "Bonjour Monsieur, comment allez-vous ?", informal: "Salut ! Ça va ?", meaning: "greeting someone and asking how they are" },
];

const SORT_ITEMS: { label: string; bucket: "formal" | "informal" }[] = [
  { label: "Bonjour Monsieur", bucket: "formal" },
  { label: "Comment allez-vous ?", bucket: "formal" },
  { label: "Quel est votre nom, s'il vous plaît ?", bucket: "formal" },
  { label: "Enchanté de faire votre connaissance", bucket: "formal" },
  { label: "Au revoir, Madame", bucket: "formal" },
  { label: "Ravi de vous rencontrer", bucket: "formal" },
  { label: "Salut !", bucket: "informal" },
  { label: "Ça va ?", bucket: "informal" },
  { label: "Tu t'appelles comment ?", bucket: "informal" },
  { label: "Comment tu vas ?", bucket: "informal" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Comment ", after: "-vous ?", answer: "allez" },
  { before: "Je vais bien, merci. Et ", after: " ?", answer: "vous" },
  { before: "Comment ", after: " appelez-vous ?", answer: "vous" },
  { before: "Quel est ", after: " nom, s'il vous plaît ?", answer: "votre" },
  { before: "Enchanté de faire votre ", after: ".", answer: "connaissance" },
  { before: "", after: " de vous rencontrer.", answer: "Ravi" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Bonjour Madame,", "comment allez-vous", "?"], sentence: "Bonjour Madame, comment allez-vous ?" },
  { chunks: ["Quel est votre nom,", "s'il vous plaît", "?"], sentence: "Quel est votre nom, s'il vous plaît ?" },
  { chunks: ["Enchanté", "de faire votre connaissance", "!"], sentence: "Enchanté de faire votre connaissance !" },
];

export const greetingsSpeaking: Skill = {
  id: "g8-fr-ls-greetings",
  code: "LS.1",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Formal greetings and introductions",
  description: "Practise the formal 'vous' register for greetings and introductions, and contrast it with informal 'tu' expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "contrast"] as const);

    if (branch === "categorize") {
      const formal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "formal")).slice(0, 4);
      const informal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "informal")).slice(0, 3);
      const items = shuffle(rng, [...formal, ...informal]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each greeting as Formal (vouvoiement, using 'vous') or Informal (tutoiement, using 'tu').",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "formal", label: "Formal (vous)" },
          { id: "informal", label: "Informal (tu)" },
        ],
        correctBucket,
        hint: "Formal expressions use 'vous' and titles like Monsieur/Madame; informal ones use 'tu' and short casual phrases.",
        explanation: `Formal: ${formal.map((f) => f.label).join(" / ")}. Informal: ${informal.map((f) => f.label).join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete this formal (vous) French sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Remember: the formal register uses 'vous' forms, not 'tu'.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

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
        hint: "Formal questions in French often end with '?', and titles come right after the greeting word.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "contrast") {
      const pair = randChoice(rng, CONTRAST_PAIRS);
      const choices = shuffle(rng, [pair.formal, pair.informal]);
      return {
        kind: "multiple-choice",
        prompt: `Which sentence uses the FORMAL (vous) register for ${pair.meaning}?`,
        choices,
        correctIndex: choices.indexOf(pair.formal),
        layout: "list",
        hint: "Look for 'vous' or a title such as Monsieur/Madame — that signals the formal register.",
        explanation: `"${pair.formal}" is formal (vous); "${pair.informal}" is informal (tu), used only with close friends, family, or peers.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each formal French greeting expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Comment allez-vous ?' and 'Comment vous appelez-vous ?' both start with 'Comment' but ask very different things.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
