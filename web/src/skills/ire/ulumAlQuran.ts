import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each aspect of the Qur'an to what it means.",
  "Pair each aspect of the Qur'an with its meaning.",
  "Connect each term below to what it means.",
  "Match each aspect to the meaning that fits it.",
  "Link each term to its correct meaning.",
  "Choose the correct meaning for each aspect of the Qur'an.",
];

const STYLE_TERMS: { term: string; meaning: string }[] = [
  { term: "Miraculous nature (I'jaz)", meaning: "Its literary style has never been matched, despite the Qur'an's own challenge to try" },
  { term: "Language", meaning: "Revealed in Classical Arabic" },
  { term: "Parables (Amthal)", meaning: "Illustrating moral lessons through comparisons and stories" },
  { term: "Narrative style (Qasas)", meaning: "Recounting the stories of earlier prophets and nations" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is the Qur'an considered a miracle?",
    correct: "Because its unmatched literary style has never been reproduced, despite the challenge given in the Qur'an itself",
    distractors: ["Because it was written entirely in poetry", "Because it was translated into every language immediately after revelation", "Because it contains illustrations of the Prophet"],
  },
  {
    q: "In what language was the Qur'an revealed?",
    correct: "Classical Arabic",
    distractors: ["Persian", "Urdu", "Turkish"],
  },
  {
    q: "Which of these is one of the styles found in the Qur'an?",
    correct: "Parables (amthal) that illustrate moral lessons",
    distractors: ["Musical verses set to specific instruments", "Rhymed couplets written by later poets", "Illustrated stories with images"],
  },
  {
    q: "What helps a reader interpret the meaning of the Qur'an correctly?",
    correct: "Understanding its language and its different literary styles",
    distractors: ["Only reading a single translation", "Ignoring the context of each verse", "Memorising it without seeking to understand it"],
  },
];

export const ulumAlQuran: Skill = {
  id: "ire-q-ulum-alquran",
  code: "Q.1",
  subjectId: "ire",
  strandId: "ire-quran",
  grade: 9,
  title: "Ulum al-Qur'an",
  description: "Answer questions about the miraculous nature, language, and styles of the Qur'an.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, STYLE_TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The Qur'an is regarded as miraculous for its inimitable style, and understanding its language and styles helps in interpreting it correctly.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
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
      hint: "The Qur'an is regarded as miraculous for its inimitable style, and understanding its language and styles helps in interpreting it correctly.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
