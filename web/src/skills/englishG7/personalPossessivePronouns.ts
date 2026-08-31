import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASE_TYPE: { phrase: string; type: "personal" | "possessive" }[] = [
  { phrase: "he planted", type: "personal" },
  { phrase: "his seedlings", type: "possessive" },
  { phrase: "we protect", type: "personal" },
  { phrase: "our forest", type: "possessive" },
  { phrase: "they cut", type: "personal" },
  { phrase: "their charcoal", type: "possessive" },
  { phrase: "she guards", type: "personal" },
  { phrase: "her woodlot", type: "possessive" },
  { phrase: "it grows", type: "personal" },
  { phrase: "its roots", type: "possessive" },
  { phrase: "I planted", type: "personal" },
  { phrase: "my saplings", type: "possessive" },
  { phrase: "you replant", type: "personal" },
  { phrase: "your trees", type: "possessive" },
  { phrase: "the rangers helped us", type: "personal" },
  { phrase: "the rangers guard them", type: "personal" },
] as const;

const NUMBER_PRONOUNS: { word: string; number: "singular" | "plural" }[] = [
  { word: "I", number: "singular" },
  { word: "me", number: "singular" },
  { word: "he", number: "singular" },
  { word: "him", number: "singular" },
  { word: "she", number: "singular" },
  { word: "her", number: "singular" },
  { word: "it", number: "singular" },
  { word: "we", number: "plural" },
  { word: "us", number: "plural" },
  { word: "they", number: "plural" },
  { word: "them", number: "plural" },
] as const;

const IDENTIFY_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  { sentence: "Forest rangers reminded us to protect the water catchment.", target: "us", correct: "Personal pronoun", distractors: ["Possessive pronoun", "Proper noun", "Common noun"] },
  { sentence: "Community members planted their own trees near the river.", target: "their", correct: "Possessive pronoun", distractors: ["Personal pronoun", "Proper noun", "Common noun"] },
  { sentence: "The Mau Forest is vast; it covers thousands of hectares.", target: "it", correct: "Personal pronoun", distractors: ["Possessive pronoun", "Proper noun", "Common noun"] },
  { sentence: "Every household in the area guards its own woodlot.", target: "its", correct: "Possessive pronoun", distractors: ["Personal pronoun", "Proper noun", "Common noun"] },
  { sentence: "The forester showed her the newly planted seedlings.", target: "her", correct: "Personal pronoun", distractors: ["Possessive pronoun", "Proper noun", "Common noun"] },
  { sentence: "My grandfather always says the forest is our shared inheritance.", target: "our", correct: "Possessive pronoun", distractors: ["Personal pronoun", "Proper noun", "Common noun"] },
];

const REPETITION_FILL: { before: string; after: string; correctAnswer: string; clue: string }[] = [
  { before: "The Mau Forest is vast. ", after: " covers thousands of hectares of Kenya.", correctAnswer: "It", clue: "Replace the repeated noun 'The Mau Forest' with a personal pronoun." },
  { before: "Wanjiru and Kamau planted trees together. ", after: " worked all morning without resting.", correctAnswer: "They", clue: "Replace the repeated names 'Wanjiru and Kamau' with a personal pronoun." },
  { before: "The forest gives the community firewood, water, and clean air. Every family depends on ", after: " for survival.", correctAnswer: "it", clue: "Replace the repeated noun 'the forest' with a personal pronoun." },
  { before: "The rangers patrol the forest daily. The community trusts ", after: " to stop illegal logging.", correctAnswer: "them", clue: "Replace the repeated noun 'the rangers' with a personal pronoun." },
  { before: "Every homestead should protect ", after: " own trees from charcoal burners.", correctAnswer: "its", clue: "Fill in the possessive pronoun that shows the homestead owns the trees." },
  { before: "Aoko and I replanted seedlings after the fire. This is ", after: " small way of restoring the forest.", correctAnswer: "our", clue: "Fill in the possessive pronoun that shows Aoko and the speaker share ownership." },
];

const MATCH_POOL: { word: string; label: string }[] = [
  { word: "we", label: "Personal pronoun (subject form, plural)" },
  { word: "us", label: "Personal pronoun (object form, plural)" },
  { word: "she", label: "Personal pronoun (subject form, singular)" },
  { word: "him", label: "Personal pronoun (object form, singular)" },
  { word: "our", label: "Possessive pronoun (shows plural ownership)" },
  { word: "his", label: "Possessive pronoun (shows singular ownership)" },
  { word: "their", label: "Possessive pronoun (shows plural ownership)" },
  { word: "its", label: "Possessive pronoun (shows ownership by a thing)" },
];

export const personalPossessivePronouns: Skill = {
  id: "g7-eng-g-personal-possessive-pronouns",
  code: "G.7",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Personal and Possessive Pronouns",
  description: "Distinguish personal and possessive pronouns and use them to avoid unnecessary repetition in texts about forests and natural resources.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-type", "categorize-number", "identify-mc", "fill", "match"] as const);

    if (branch === "categorize-type") {
      const chosen = shuffle(rng, PHRASE_TYPE).slice(0, 6);
      const buckets = [
        { id: "personal", label: "Personal pronoun (stands for a person/thing)" },
        { id: "possessive", label: "Possessive pronoun (shows ownership)" },
      ];
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.phrase }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each phrase by whether it uses a personal pronoun or a possessive pronoun.",
        items,
        buckets,
        correctBucket,
        hint: "A personal pronoun (I, you, he, she, it, we, they, me, him, her, us, them) replaces a name. A possessive pronoun (my, your, his, her, its, our, their) shows who something belongs to.",
        explanation: chosen.map((c) => `"${c.phrase}" uses a ${c.type} pronoun.`).join(" "),
      };
    }

    if (branch === "categorize-number") {
      const chosen = shuffle(rng, NUMBER_PRONOUNS).slice(0, 6);
      const buckets = [
        { id: "singular", label: "Singular (one person/thing)" },
        { id: "plural", label: "Plural (more than one)" },
      ];
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.number));
      return {
        kind: "categorize",
        prompt: "Sort each personal pronoun as singular or plural.",
        items,
        buckets,
        correctBucket,
        hint: "Singular pronouns stand for one person or thing. Plural pronouns stand for more than one.",
        explanation: chosen.map((c) => `"${c.word}" is ${c.number}.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What type of word is "${entry.target}" in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Ask: does this word replace a name/thing directly, or does it show that something belongs to someone?",
        explanation: `"${entry.target}" is a ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.word })));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `w${i}`, label: c.label })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each pronoun to what it is and how it is used.",
        tokens,
        targets,
        correctMap,
        hint: "Check whether the word replaces a subject, an object, or shows ownership, and whether it is singular or plural.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.label.split(" (")[0].toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, REPETITION_FILL);
    return {
      kind: "fill-blank",
      prompt: entry.clue,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Using a pronoun instead of repeating the noun makes the writing smoother to read.",
      explanation: `"${entry.correctAnswer}" avoids repeating the noun: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
