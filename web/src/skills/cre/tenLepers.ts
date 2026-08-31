import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_PROMPTS = [
  "Fill in the missing number.",
  "Complete the sentence with the correct number.",
  "How many lepers came back to give thanks? Fill in the number.",
  "Fill in the blank with the right number.",
  "Supply the missing number below.",
  "Read the sentence and fill in the number that completes it.",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Where were the ten lepers healed by Jesus?",
    correct: "On the road between Samaria and Galilee",
    distractors: ["On the shores of the Sea of Galilee", "Inside the temple in Jerusalem", "In the wilderness near the Jordan River"],
  },
  {
    q: "What did the ten lepers do when they saw Jesus?",
    correct: "They stood at a distance and called out for him to have pity on them",
    distractors: ["They ran up and touched his robe", "They hid from him", "They asked him for money"],
  },
  {
    q: "What did Jesus instruct the ten lepers to do?",
    correct: "Go and show themselves to the priests",
    distractors: ["Go and wash in the Jordan River seven times", "Go and sell everything they owned", "Stay where they were and wait"],
  },
  {
    q: "How many of the ten healed lepers returned to thank Jesus?",
    correct: "Only one, a Samaritan",
    distractors: ["All ten of them", "Two of them", "None of them"],
  },
  {
    q: "What lesson does the healing of the ten lepers teach Christians today?",
    correct: "To show gratitude to God for his blessings",
    distractors: ["To always travel in groups", "To avoid speaking to strangers", "To build shelters for the sick"],
  },
];

export const tenLepers: Skill = {
  id: "cre-jc-ten-lepers",
  code: "JC.2",
  subjectId: "cre",
  strandId: "cre-jesus",
  grade: 9,
  title: "Jesus heals the ten lepers",
  description: "Answer questions about Jesus healing the ten lepers (Luke 17:11-19).",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "mc", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "Of the ten lepers Jesus healed, only",
        after: "returned to thank him.",
        correctAnswer: "1",
        acceptedAnswers: ["one"],
        inputMode: "numeric",
        hint: "Only one of the ten — a Samaritan — came back to give thanks.",
        explanation: "Only one of the ten healed lepers, a Samaritan, returned to thank Jesus (Luke 17:11-19).",
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
      hint: "Of the ten lepers Jesus healed, only one — a Samaritan — came back to thank him.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
