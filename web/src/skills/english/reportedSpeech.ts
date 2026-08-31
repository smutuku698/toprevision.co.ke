import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SPEAKERS: { name: string; subj: string }[] = [
  { name: "Amina", subj: "she" },
  { name: "Kevin", subj: "he" },
  { name: "Grace", subj: "she" },
  { name: "Peter", subj: "he" },
  { name: "My mother", subj: "she" },
  { name: "The teacher", subj: "they" },
  { name: "The doctor", subj: "they" },
  { name: "The manager", subj: "they" },
];

const VERBS: { base: string; past: string }[] = [
  { base: "clean", past: "cleaned" },
  { base: "finish", past: "finished" },
  { base: "watch", past: "watched" },
  { base: "cook", past: "cooked" },
  { base: "study", past: "studied" },
  { base: "play", past: "played" },
  { base: "visit", past: "visited" },
  { base: "wash", past: "washed" },
];

const OBJECTS = [
  "the house",
  "the report",
  "her homework",
  "the garden",
  "the car",
  "the letter",
  "the project",
  "the dishes",
];

const RULE = "When reporting speech, the verb 'backshifts' one tense into the past, pronouns change to match who is speaking, and time words shift too (e.g. 'tomorrow' becomes 'the next day').";

export const reportedSpeech: Skill = {
  id: "eng-g-reported-speech",
  code: "G.3",
  subjectId: "english",
  strandId: "eng-grammar",
  grade: 9,
  title: "Direct speech to reported speech",
  description: "Rewrite statements, future plans, and questions from direct into reported (indirect) speech.",
  generate(rng) {
    const speaker = randChoice(rng, SPEAKERS);
    const verb = randChoice(rng, VERBS);
    const object = randChoice(rng, OBJECTS);
    const branch = randChoice(rng, ["statement", "future", "question"] as const);

    if (branch === "statement") {
      const direct = `${speaker.name} said, "I ${verb.base} ${object} every day."`;
      const correct = `${speaker.name} said (that) ${speaker.subj} ${verb.past} ${object} every day.`;
      const hint = "The verb moves one tense back, and 'I' changes to match who said it.";
      const explanation = `${RULE} Here, present simple "${verb.base}" backshifts to past simple "${verb.past}", and "I" becomes "${speaker.subj}": "${correct}"`;

      if (rng() < 0.5) {
        return {
          kind: "fill-blank",
          prompt: `Complete the reported speech for: ${direct}`,
          before: `${speaker.name} said (that) ${speaker.subj}`,
          after: `${object} every day.`,
          correctAnswer: verb.past,
          inputMode: "text",
          hint,
          explanation,
        };
      }

      const wrong1 = `${speaker.name} said (that) ${speaker.subj} ${verb.base} ${object} every day.`; // no backshift
      const wrong2 = `${speaker.name} said (that) I ${verb.past} ${object} every day.`; // pronoun not changed
      const wrong3 = `${speaker.name} told (that) ${speaker.subj} ${verb.past} ${object} every day.`; // "told that" is ungrammatical without an object

      const choices = shuffle(rng, [correct, wrong1, wrong2, wrong3]);
      return {
        kind: "multiple-choice",
        prompt: `Rewrite this in reported speech: ${direct}`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint,
        explanation,
      };
    }

    if (branch === "future") {
      const direct = `${speaker.name} said, "I will ${verb.base} ${object} tomorrow."`;
      const correct = `${speaker.name} said (that) ${speaker.subj} would ${verb.base} ${object} the next day.`;
      const wrong1 = `${speaker.name} said (that) ${speaker.subj} will ${verb.base} ${object} the next day.`; // "will" not backshifted
      const wrong2 = `${speaker.name} said (that) ${speaker.subj} would ${verb.base} ${object} tomorrow.`; // time word not shifted
      const wrong3 = `${speaker.name} said (that) I would ${verb.base} ${object} the next day.`; // pronoun not changed

      const choices = shuffle(rng, [correct, wrong1, wrong2, wrong3]);
      return {
        kind: "multiple-choice",
        prompt: `Rewrite this in reported speech: ${direct}`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "'Will' backshifts to 'would', and 'tomorrow' becomes 'the next day'.",
        explanation: `${RULE} Here, "will" backshifts to "would" and "tomorrow" shifts to "the next day": "${correct}"`,
      };
    }

    // Yes/No question
    const direct = `${speaker.name} asked, "Do you ${verb.base} ${object}?"`;
    const correct = `${speaker.name} asked whether I ${verb.past} ${object}.`;
    const wrong1 = `${speaker.name} asked whether do I ${verb.base} ${object}.`; // kept question word order
    const wrong2 = `${speaker.name} asked I ${verb.past} ${object}.`; // missing "whether/if"
    const wrong3 = `${speaker.name} asked whether I ${verb.base} ${object}.`; // no backshift

    const choices = shuffle(rng, [correct, wrong1, wrong2, wrong3]);
    return {
      kind: "multiple-choice",
      prompt: `Rewrite this in reported speech: ${direct}`,
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "list",
      hint: "Reported yes/no questions use 'whether' or 'if', normal statement word order, and no question mark.",
      explanation: `A reported yes/no question uses "whether" or "if" instead of "do/does", drops the question word order, and backshifts the verb: "${correct}"`,
    };
  },
};
