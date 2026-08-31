import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORDS: { correct: string; wrong: string; definition: string }[] = [
  { correct: "community", wrong: "comunity", definition: "a group of people living in the same area or sharing common interests" },
  { correct: "achievement", wrong: "acheivement", definition: "something accomplished successfully through effort" },
  { correct: "responsibility", wrong: "responsability", definition: "a duty that someone is required to deal with" },
  { correct: "generous", wrong: "generos", definition: "willing to give more of something than is strictly necessary" },
  { correct: "neighbor", wrong: "nieghbor", definition: "a person who lives near another" },
  { correct: "courageous", wrong: "courageos", definition: "not deterred by danger or pain; brave" },
  { correct: "recognize", wrong: "reconize", definition: "to acknowledge the existence, validity, or legality of something" },
  { correct: "grateful", wrong: "greatful", definition: "feeling or showing thanks" },
];

export const heroesSpelling: Skill = {
  id: "il-w-heroes-spelling",
  code: "W.1",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Community heroes: spelling for neat, legible writing",
  description: "Identify and correctly spell commonly misspelled words used when writing about community heroes.",
  generate(rng) {
    const hint = "Say the word slowly, syllable by syllable, and watch out for tricky letter pairs like 'ie'/'ei'.";

    if (rng() < 0.5) {
      const entry = randChoice(rng, WORDS);
      const choices = shuffle(rng, [entry.correct, entry.wrong]);

      return {
        kind: "multiple-choice",
        prompt: `Which spelling is correct for the word meaning "${entry.definition}"?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: `The correct spelling is "${entry.correct}", not "${entry.wrong}".`,
      };
    }

    const entry = randChoice(rng, WORDS);

    return {
      kind: "fill-blank",
      prompt: `Type the correctly spelled word meaning: "${entry.definition}"`,
      before: "",
      after: "",
      correctAnswer: entry.correct,
      acceptedAnswers: [entry.correct],
      inputMode: "text",
      hint,
      explanation: `The correct spelling is "${entry.correct}".`,
    };
  },
};
