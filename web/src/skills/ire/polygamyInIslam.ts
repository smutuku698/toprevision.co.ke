import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_PROMPTS = [
  "Fill in the missing number.",
  "Which number completes this fact?",
  "Work out the missing number below.",
  "Complete the sentence with the correct number.",
  "Fill in the blank with the correct number.",
  "Which number belongs in the blank?",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "According to Islamic teaching, what condition must be met for a man to marry more than one wife?",
    correct: "He must be able to treat all his wives justly and equally",
    distractors: ["He must be married to exactly two wives at all times", "There is no condition at all", "He must obtain permission from a court in every case"],
  },
  {
    q: "What is the maximum number of wives permitted at one time in Islam?",
    correct: "Four",
    distractors: ["Two", "Six", "There is no limit"],
  },
  {
    q: "What social reason is commonly given for the permission of polygamy in Islam?",
    correct: "It can provide social and economic support for widows and orphans, especially after conflict",
    distractors: ["It has no social reasoning behind it", "It exists only for the economic gain of the husband", "It was created to reduce the number of unmarried men"],
  },
  {
    q: "What must a man do if he cannot treat multiple wives with justice, according to the Qur'an?",
    correct: "Marry only one wife",
    distractors: ["Marry as many as he wishes anyway", "Divorce all his wives immediately", "Seek a religious exemption from fairness"],
  },
];

export const polygamyInIslam: Skill = {
  id: "ire-mu-polygamy",
  code: "MU.4",
  subjectId: "ire",
  strandId: "ire-muamalat",
  grade: 9,
  title: "Polygamy in Islam",
  description: "Answer questions about the reasons for and conditions of polygamy in Islam.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "mc", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "In Islam, a man may marry up to",
        after: "wives at one time, provided he can treat them all justly.",
        correctAnswer: "4",
        acceptedAnswers: ["four"],
        inputMode: "numeric",
        hint: "This is the maximum permitted under the Qur'an's conditions of justice.",
        explanation: "The Qur'an permits marrying up to four wives, provided the man can treat them all justly and equally.",
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
      hint: "The Qur'an permits polygamy under strict conditions of justice, up to a maximum of four wives, and requires marrying only one if fairness cannot be guaranteed.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
