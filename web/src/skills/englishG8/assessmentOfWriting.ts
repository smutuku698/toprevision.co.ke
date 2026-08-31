import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ERROR_TYPES: { id: string; label: string; description: string }[] = [
  { id: "spelling", label: "Spelling", description: "A word is spelt incorrectly" },
  { id: "sva", label: "Subject-verb agreement", description: "The subject and verb do not match in number" },
  { id: "runon", label: "Run-on sentence", description: "Two complete sentences are joined with no punctuation or conjunction" },
  { id: "wordchoice", label: "Wrong word choice", description: "A word is used that does not fit the intended meaning" },
];

const ERROR_EXAMPLES: {
  wrong: string;
  correct: string;
  type: string;
  fixWord: { before: string; after: string; correctAnswer: string };
  badCorrections: string[];
}[] = [
  {
    wrong: "Many familys visit the Maasai Mara every holiday season.",
    correct: "Many families visit the Maasai Mara every holiday season.",
    type: "spelling",
    fixWord: { before: "Many", after: "visit the Maasai Mara every holiday season.", correctAnswer: "families" },
    badCorrections: [
      "Many familys visit the Maasai Mara every holiday season.",
      "many families visit the Maasai Mara every holiday season.",
      "Many families visits the Maasai Mara every holiday season.",
    ],
  },
  {
    wrong: "The tour guide were very knowledgeable about the park.",
    correct: "The tour guide was very knowledgeable about the park.",
    type: "sva",
    fixWord: { before: "The tour guide", after: "very knowledgeable about the park.", correctAnswer: "was" },
    badCorrections: [
      "The tour guide were very knowledgeable about the park.",
      "The tour guide was very knowledgable about the park.",
      "the tour guide was very knowledgeable about the park.",
    ],
  },
  {
    wrong: "We visited Lake Nakuru we saw thousands of flamingos.",
    correct: "We visited Lake Nakuru, and we saw thousands of flamingos.",
    type: "runon",
    fixWord: { before: "We visited Lake Nakuru,", after: "we saw thousands of flamingos.", correctAnswer: "and" },
    badCorrections: [
      "We visited Lake Nakuru we saw thousands of flamingos.",
      "We visited Lake Nakuru, we saw thousands of flamingos.",
      "We visited Lake Nakuru. and we saw thousands of flamingos.",
    ],
  },
  {
    wrong: "The hotel staff was very polite and hopeful to the tourists.",
    correct: "The hotel staff was very polite and helpful to the tourists.",
    type: "wordchoice",
    fixWord: { before: "The hotel staff was very polite and", after: "to the tourists.", correctAnswer: "helpful" },
    badCorrections: [
      "The hotel staff was very polite and hopeful to the tourists.",
      "The hotel staff were very polite and helpful to the tourists.",
      "The hotel staff was very polite, and helpful, to the tourists.",
    ],
  },
];

const CORRECT_SENTENCES = [
  "Many tourists enjoy camping near the coast during the holidays.",
  "The park ranger explained the migration patterns of the wildebeest.",
  "Domestic tourism supports local hotels, guides, and craft sellers.",
];

export const assessmentOfWriting: Skill = {
  id: "g8-eng-w-assessment-of-writing",
  code: "W.8",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Assessment of Writing",
  description: "Identify errors in a composition about domestic tourism, classify the error type, and choose the correct fix.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "spot-mc", "correct-mc", "fill"] as const);
    const hint = "Common writing errors include misspelt words, subject-verb mismatches, run-on sentences with no joining word, and words that don't fit the meaning.";

    if (branch === "match") {
      const tokens = shuffle(rng, ERROR_TYPES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, ERROR_TYPES.map((t) => ({ id: t.id, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of ERROR_TYPES) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each type of writing error to its definition.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ERROR_TYPES.map((t) => `${t.label}: ${t.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ERROR_EXAMPLES);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.wrong }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.type));
      const usedTypes = Array.from(new Set(chosen.map((e) => e.type)));
      return {
        kind: "categorize",
        prompt: "Sort each sentence about domestic tourism by the type of error it contains.",
        items,
        buckets: ERROR_TYPES.filter((t) => usedTypes.includes(t.id)).map((t) => ({ id: t.id, label: t.label })),
        correctBucket,
        hint,
        explanation: chosen.map((e) => `"${e.wrong}" — ${ERROR_TYPES.find((t) => t.id === e.type)!.label} error.`).join(" "),
      };
    }

    if (branch === "spot-mc") {
      const wrongEntry = randChoice(rng, ERROR_EXAMPLES);
      const correctChoices = shuffle(rng, CORRECT_SENTENCES).slice(0, 3);
      const choices = shuffle(rng, [wrongEntry.wrong, ...correctChoices]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence contains a writing error?",
        choices,
        correctIndex: choices.indexOf(wrongEntry.wrong),
        layout: "list",
        hint,
        explanation: `"${wrongEntry.wrong}" has a ${ERROR_TYPES.find((t) => t.id === wrongEntry.type)!.label.toLowerCase()} error. The correct version is: "${wrongEntry.correct}"`,
      };
    }

    if (branch === "correct-mc") {
      const entry = randChoice(rng, ERROR_EXAMPLES);
      const choices = shuffle(rng, [entry.correct, ...entry.badCorrections]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correctly corrected version of: "${entry.wrong}"?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct version is: "${entry.correct}" — the original had a ${ERROR_TYPES.find((t) => t.id === entry.type)!.label.toLowerCase()} error.`,
      };
    }

    const entry = randChoice(rng, ERROR_EXAMPLES);
    return {
      kind: "fill-blank",
      prompt: "Fill in the correct word to fix the error in this sentence about domestic tourism.",
      before: entry.fixWord.before,
      after: entry.fixWord.after,
      correctAnswer: entry.fixWord.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The corrected sentence reads: "${entry.correct}" — the original had a ${ERROR_TYPES.find((t) => t.id === entry.type)!.label.toLowerCase()} error.`,
    };
  },
};
