import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VERBS: { base: string; past: string; ing: string; s: string }[] = [
  { base: "walk", past: "walked", ing: "walking", s: "walks" },
  { base: "study", past: "studied", ing: "studying", s: "studies" },
  { base: "play", past: "played", ing: "playing", s: "plays" },
  { base: "visit", past: "visited", ing: "visiting", s: "visits" },
  { base: "clean", past: "cleaned", ing: "cleaning", s: "cleans" },
  { base: "arrive", past: "arrived", ing: "arriving", s: "arrives" },
  { base: "cook", past: "cooked", ing: "cooking", s: "cooks" },
  { base: "jump", past: "jumped", ing: "jumping", s: "jumps" },
  { base: "watch", past: "watched", ing: "watching", s: "watches" },
  { base: "help", past: "helped", ing: "helping", s: "helps" },
];

const TIME_CLUES = [
  { clue: "Yesterday,", tense: "past" as const },
  { clue: "Right now,", tense: "present-continuous" as const },
  { clue: "Tomorrow,", tense: "future" as const },
  { clue: "Every morning,", tense: "present-simple" as const },
  { clue: "Last week,", tense: "past" as const },
  { clue: "Next month,", tense: "future" as const },
  { clue: "Usually,", tense: "present-simple" as const },
  { clue: "At this moment,", tense: "present-continuous" as const },
  { clue: "Last night,", tense: "past" as const },
  { clue: "Soon,", tense: "future" as const },
];

const TENSE_INFO: Record<(typeof TIME_CLUES)[number]["tense"], { name: string; reason: string }> = {
  past: { name: "simple past tense", reason: "the action already happened" },
  "present-continuous": { name: "present continuous tense", reason: "the action is happening right now" },
  future: { name: "future tense", reason: "the action will happen later" },
  "present-simple": { name: "simple present tense", reason: "the action happens regularly or as a habit" },
};

export const verbTense: Skill = {
  id: "eng-g-verb-tense",
  code: "G.2",
  subjectId: "english",
  strandId: "eng-grammar",
  grade: 9,
  title: "Choose the correct verb tense",
  description: "Pick the verb form that matches the time clue in the sentence.",
  generate(rng) {
    const verb = randChoice(rng, VERBS);
    const timeClue = randChoice(rng, TIME_CLUES);
    const subject = randChoice(rng, ["I", "She", "They", "We", "He"]);

    const forms: Record<typeof timeClue.tense, string> = {
      past: verb.past,
      "present-continuous": `${subject === "I" ? "am" : subject === "He" || subject === "She" ? "is" : "are"} ${verb.ing}`,
      future: `will ${verb.base}`,
      "present-simple": subject === "He" || subject === "She" ? verb.s : verb.base,
    };

    const correct = forms[timeClue.tense];
    const info = TENSE_INFO[timeClue.tense];
    const clueWord = timeClue.clue.replace(/,$/, "");

    const branch = randChoice(rng, ["mcq", "mcq", "fillblank"] as const);

    if (branch === "fillblank") {
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence with the correct form of "${verb.base}".`,
        before: `${timeClue.clue} ${subject} `,
        after: " to school.",
        correctAnswer: correct,
        inputMode: "text",
        hint: `"${clueWord}" tells you when the action happens.`,
        explanation: `"${clueWord}" signals the ${info.name} because ${info.reason}, so the correct form is "${correct}".`,
      };
    }

    const distractorPool = Array.from(new Set([verb.past, `will ${verb.base}`, verb.ing, verb.base, verb.s])).filter(
      (v) => v !== correct
    );
    const choices = shuffle(rng, [correct, ...shuffle(rng, distractorPool).slice(0, 3)]);
    const correctIndex = choices.indexOf(correct);

    return {
      kind: "multiple-choice",
      prompt: `${timeClue.clue} ${subject} ___ (${verb.base}) to school.`,
      choices,
      correctIndex,
      layout: "row",
      hint: `"${clueWord}" tells you when the action happens.`,
      explanation: `"${clueWord}" signals the ${info.name} because ${info.reason}, so the correct form is "${correct}".`,
    };
  },
};
