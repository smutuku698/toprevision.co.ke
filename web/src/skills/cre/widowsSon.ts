import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the missing word.",
  "Type the missing word to complete the sentence.",
  "Fill in the blank correctly.",
  "Supply the missing word below.",
  "What word belongs in the blank?",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "In which town did Jesus raise the widow's son to life?",
    correct: "Nain",
    distractors: ["Nazareth", "Bethlehem", "Capernaum"],
  },
  {
    q: "What did Jesus do before speaking to the dead man?",
    correct: "He touched the funeral coffin, and the bearers stood still",
    distractors: ["He asked the crowd to leave", "He wept for a whole day", "He went to the temple to pray"],
  },
  {
    q: "What did Jesus say to raise the widow's son?",
    correct: "\"Young man, I say to you, arise\"",
    distractors: ["\"Peace, be still\"", "\"Lazarus, come out\"", "\"Talitha koum\""],
  },
  {
    q: "How did the crowd react after witnessing the miracle?",
    correct: "They glorified God, saying a great prophet had risen among them",
    distractors: ["They ran away in fear", "They demanded Jesus leave the town", "They ignored what had happened"],
  },
  {
    q: "What Christian belief does the raising of the widow's son encourage today?",
    correct: "Belief in the resurrection of the dead",
    distractors: ["The importance of paying taxes", "The value of fasting during Lent", "The need to build bigger churches"],
  },
];

export const widowsSon: Skill = {
  id: "cre-jc-widows-son",
  code: "JC.1",
  subjectId: "cre",
  strandId: "cre-jesus",
  grade: 9,
  title: "Jesus raises the widow's son",
  description: "Answer questions about Jesus raising the widow of Nain's son to life (Luke 7:11-17).",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "mc", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: "Jesus raised the widow's son to life at the town of",
        after: ".",
        correctAnswer: "Nain",
        inputMode: "text",
        hint: "This miracle happened at the town gate, as Jesus met a funeral procession for a widow's only son.",
        explanation: "Jesus raised the widow's son to life at the town of Nain (Luke 7:11-17).",
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
      hint: "This miracle happened at the town gate of Nain, as Jesus met a funeral procession for a widow's only son.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
