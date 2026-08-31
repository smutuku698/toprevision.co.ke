import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Bonjour Monsieur", meaning: "Good day, Sir (formal greeting)" },
  { phrase: "Bonjour Madame", meaning: "Good day, Madam (formal greeting)" },
  { phrase: "Comment allez-vous ?", meaning: "How are you? (formal)" },
  { phrase: "Je vais bien, merci", meaning: "I am doing well, thank you" },
  { phrase: "Comment vous appelez-vous ?", meaning: "What is your name? (formal)" },
  { phrase: "Enchanté(e)", meaning: "Pleased to meet you" },
  { phrase: "Au revoir", meaning: "Goodbye" },
  { phrase: "À bientôt", meaning: "See you soon" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each greeting as Formal (vouvoiement) or Informal (tutoiement).",
  "Decide whether each greeting below is Formal or Informal, then sort it.",
  "Group these greetings into Formal and Informal.",
  "Read each expression and place it under Formal or Informal.",
  "Which of these greetings are formal and which are informal? Sort them.",
  "Sort each expression by whether it uses formal or informal French.",
];

const MATCH_PROMPTS = [
  "Match each French greeting expression to its English meaning.",
  "Pair each French greeting with its correct English meaning.",
  "Connect each greeting phrase to what it means in English.",
  "Match each expression below to its English translation.",
  "Link each French greeting to the meaning that fits it.",
  "Match each phrase to its English equivalent.",
];

const SORT_ITEMS: { label: string; bucket: "formal" | "informal" }[] = [
  { label: "Bonjour Monsieur", bucket: "formal" },
  { label: "Comment allez-vous ?", bucket: "formal" },
  { label: "Comment vous appelez-vous, Monsieur ?", bucket: "formal" },
  { label: "Au revoir, à bientôt", bucket: "formal" },
  { label: "Enchanté, Madame", bucket: "formal" },
  { label: "Salut !", bucket: "informal" },
  { label: "Ça va ?", bucket: "informal" },
  { label: "À plus !", bucket: "informal" },
];

export const greetingsSpeaking: Skill = {
  id: "fr-ls-greetings",
  code: "LS.1",
  subjectId: "french",
  strandId: "fr-listening-speaking",
  grade: 9,
  title: "Formal greetings and introductions",
  description: "Match French greeting expressions to their meaning, and sort formal from informal greetings.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const formal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "formal")).slice(0, 3);
      const informal = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "informal")).slice(0, 3);
      const items = shuffle(rng, [...formal, ...informal]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "formal", label: "Formal" },
          { id: "informal", label: "Informal" },
        ],
        correctBucket,
        hint: "Formal French greetings use 'vous' and titles like Monsieur/Madame; informal ones use short, casual expressions.",
        explanation: `Formal: ${formal.map((f) => f.label).join(" / ")}. Informal: ${informal.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "'Comment allez-vous ?' and 'Comment vous appelez-vous ?' both start with 'Comment' but ask very different things.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
