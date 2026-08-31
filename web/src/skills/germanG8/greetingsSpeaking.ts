import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Guten Tag!", meaning: "Good day! / Hello!" },
  { phrase: "Wie geht es Ihnen?", meaning: "How are you? (formal)" },
  { phrase: "Mir geht es gut, danke. Und Ihnen?", meaning: "I'm doing well, thank you. And you? (formal)" },
  { phrase: "Wie heißen Sie?", meaning: "What is your name? (formal)" },
  { phrase: "Freut mich, Sie kennenzulernen.", meaning: "Pleased to meet you. (formal)" },
  { phrase: "Auf Wiedersehen!", meaning: "Goodbye! (formal)" },
];

const CONTRAST_PAIRS: { formal: string; informal: string; meaning: string }[] = [
  { formal: "Wie heißen Sie?", informal: "Wie heißt du?", meaning: "What is your name?" },
  { formal: "Wie geht es Ihnen?", informal: "Wie geht's dir?", meaning: "How are you?" },
  { formal: "Auf Wiedersehen!", informal: "Tschüss!", meaning: "Goodbye!" },
  { formal: "Wie alt sind Sie?", informal: "Wie alt bist du?", meaning: "How old are you?" },
];

const SORT_ITEMS: { label: string; bucket: "formal" | "informal" }[] = [
  { label: "Guten Tag!", bucket: "formal" },
  { label: "Wie geht es Ihnen?", bucket: "formal" },
  { label: "Wie heißen Sie?", bucket: "formal" },
  { label: "Freut mich, Sie kennenzulernen.", bucket: "formal" },
  { label: "Auf Wiedersehen!", bucket: "formal" },
  { label: "Wie alt sind Sie?", bucket: "formal" },
  { label: "Wie heißt du?", bucket: "informal" },
  { label: "Wie geht's dir?", bucket: "informal" },
  { label: "Tschüss!", bucket: "informal" },
  { label: "Wie alt bist du?", bucket: "informal" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie geht es ", after: "?", answer: "Ihnen" },
  { before: "Mir geht es gut, danke. Und ", after: "?", answer: "Ihnen" },
  { before: "Wie ", after: " Sie?", answer: "heißen" },
  { before: "Freut mich, Sie ", after: ".", answer: "kennenzulernen" },
  { before: "Auf ", after: "!", answer: "Wiedersehen" },
  { before: "", after: " Tag!", answer: "Guten" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie", "geht es", "Ihnen", "?"], sentence: "Wie geht es Ihnen?" },
  { chunks: ["Freut mich,", "Sie kennenzulernen", "."], sentence: "Freut mich, Sie kennenzulernen." },
  { chunks: ["Wie", "heißen", "Sie", "?"], sentence: "Wie heißen Sie?" },
  { chunks: ["Mir geht es gut,", "danke.", "Und Ihnen", "?"], sentence: "Mir geht es gut, danke. Und Ihnen?" },
];

export const greetingsSpeaking: Skill = {
  id: "g8-de-ls-greetings",
  code: "LS.1",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Formal greetings and introductions",
  description: "Practise the formal Sie-Form register for greetings and introductions, and contrast it with informal du expressions.",
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
        prompt: "Sort each greeting as Formal (Sie-Form) or Informal (du-Form).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "formal", label: "Formal (Sie)" },
          { id: "informal", label: "Informal (du)" },
        ],
        correctBucket,
        hint: "Formal expressions use 'Sie' and often 'Ihnen'; informal ones use 'du' or 'dir'.",
        explanation: `Formal: ${formal.map((f) => f.label).join(" / ")}. Informal: ${informal.map((f) => f.label).join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete this formal (Sie) German sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Remember: the formal register uses 'Sie'/'Ihnen' forms, not 'du'.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

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
        hint: "Formal questions in German often start with a question word like 'Wie', and the verb comes second.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "contrast") {
      const pair = randChoice(rng, CONTRAST_PAIRS);
      const choices = shuffle(rng, [pair.formal, pair.informal]);
      return {
        kind: "multiple-choice",
        prompt: `Which sentence uses the FORMAL (Sie) register for "${pair.meaning}"?`,
        choices,
        correctIndex: choices.indexOf(pair.formal),
        layout: "list",
        hint: "Look for 'Sie' or 'Ihnen' — that signals the formal register.",
        explanation: `"${pair.formal}" is formal (Sie); "${pair.informal}" is informal (du), used only with close friends, family, or peers.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each formal German greeting expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Wie geht es Ihnen?' and 'Wie heißen Sie?' both start with 'Wie' but ask very different things.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
