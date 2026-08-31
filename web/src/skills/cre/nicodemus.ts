import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this teaching.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this teaching of Jesus with the right word.",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Who was Nicodemus?",
    correct: "A Pharisee and a member of the Jewish ruling council",
    distractors: ["A Roman soldier", "A fisherman from Galilee", "A tax collector"],
  },
  {
    q: "When did Nicodemus come to speak with Jesus?",
    correct: "At night",
    distractors: ["At dawn", "During a public festival", "While Jesus was teaching in the temple"],
  },
  {
    q: "What key teaching did Jesus give Nicodemus about entering the Kingdom of God?",
    correct: "A person must be born again, of water and the Spirit",
    distractors: ["A person must give away all their possessions", "A person must be born into a priestly family", "A person must travel to Jerusalem every year"],
  },
  {
    q: "What Old Testament event did Jesus compare to his own coming death?",
    correct: "Moses lifting up the bronze serpent in the wilderness",
    distractors: ["The parting of the Red Sea", "The fall of the walls of Jericho", "The flood in the days of Noah"],
  },
  {
    q: "Which well-known verse comes from Jesus' conversation with Nicodemus?",
    correct: "John 3:16 — \"For God so loved the world that he gave his one and only Son...\"",
    distractors: ["Psalm 23 — \"The Lord is my shepherd...\"", "Matthew 5:3 — \"Blessed are the poor in spirit...\"", "1 Corinthians 13 — \"Love is patient, love is kind...\""],
  },
];

export const nicodemus: Skill = {
  id: "cre-jc-nicodemus",
  code: "JC.4",
  subjectId: "cre",
  strandId: "cre-jesus",
  grade: 9,
  title: "Nicodemus' encounter with Jesus Christ",
  description: "Answer questions about Nicodemus' encounter with Jesus Christ (John 3:1-21).",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "mc", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "Jesus taught Nicodemus that a person must be born",
        after: "to enter the Kingdom of God.",
        correctAnswer: "again",
        inputMode: "text",
        hint: "This teaching about a spiritual rebirth is central to Jesus' conversation with Nicodemus.",
        explanation: "Jesus taught that a person must be 'born again' — born of water and the Spirit — to enter the Kingdom of God.",
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
      hint: "Nicodemus came to Jesus by night, and their conversation about being 'born again' changed his life.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
