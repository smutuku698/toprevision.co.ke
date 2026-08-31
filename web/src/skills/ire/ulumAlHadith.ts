import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each Hadith classification to what it means.",
  "Pair each classification with its correct meaning.",
  "Connect each Hadith classification to what it means.",
  "Link each classification below to its meaning.",
  "Match each term to the meaning that fits it.",
  "Choose the correct meaning for each Hadith classification.",
];

const FILL_PROMPTS = [
  "Fill in the missing number.",
  "Which number completes this fact?",
  "Work out the missing number below.",
  "Complete the sentence with the correct number.",
  "Fill in the blank with the correct number.",
  "Which number belongs in the blank?",
];

const CLASSIFICATIONS: { term: string; meaning: string }[] = [
  { term: "Sahih", meaning: "Authentic — has a strong, unbroken chain of reliable narrators" },
  { term: "Hasan", meaning: "Good — reliable, but with a slightly weaker chain than Sahih" },
  { term: "Da'if", meaning: "Weak — has a break or a doubted narrator in its chain" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is one of the six authentic Books of Hadith?",
    correct: "Sahih al-Bukhari",
    distractors: ["The Torah", "The Mishnah", "The Analects"],
  },
  {
    q: "What makes a Hadith classified as 'Sahih' (authentic)?",
    correct: "It has a strong, unbroken chain of reliable narrators",
    distractors: ["It is the longest Hadith in the collection", "It was written down by the Prophet himself", "It is repeated the most times in the Qur'an"],
  },
  {
    q: "Why was it necessary to collect and compile Hadith after the time of the Prophet's companions?",
    correct: "To preserve the Prophet's teachings accurately as those who witnessed them passed away",
    distractors: ["Because the Qur'an was being rewritten", "Because Hadith were no longer needed", "Because Arabic script had just been invented"],
  },
  {
    q: "What does classifying Hadith into sahih, hasan, and dhaif help Muslims do?",
    correct: "Distinguish between authentic and unauthentic reports of the Prophet's teachings",
    distractors: ["Decide which prayers to skip", "Choose which language to pray in", "Determine the calendar dates of festivals"],
  },
];

export const ulumAlHadith: Skill = {
  id: "ire-h-ulum-alhadith",
  code: "H.1",
  subjectId: "ire",
  strandId: "ire-hadith",
  grade: 9,
  title: "Ulum al-Hadith",
  description: "Answer questions about the books, classification, and compilation of Hadith.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, CLASSIFICATIONS.map((c) => ({ id: c.term, label: c.term })));
      const targets = shuffle(rng, CLASSIFICATIONS.map((c) => ({ id: c.term, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of CLASSIFICATIONS) correctMap[c.term] = c.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Hadith are classified by the strength of their chain of narrators.",
        explanation: CLASSIFICATIONS.map((c) => `${c.term} — ${c.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "There are",
        after: "authentic Books of Hadith (Kutub al-Sittah).",
        correctAnswer: "6",
        acceptedAnswers: ["six"],
        inputMode: "numeric",
        hint: "This collection is known as the 'six authentic books'.",
        explanation: "There are six authentic Books of Hadith, including Sahih al-Bukhari and Sahih Muslim.",
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
      hint: "Hadith are classified by the strength of their chain of narrators, and were carefully collected during the time of the Tabi'in to preserve their authenticity.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
