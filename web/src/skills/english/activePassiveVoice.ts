import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SUBJECTS = [
  "The chef",
  "The teacher",
  "The mechanic",
  "The artist",
  "The farmer",
  "The children",
  "The gardener",
  "The nurse",
  "The students",
  "The baker",
];
const PLURAL_SUBJECTS = new Set(["The children", "The students"]);

const VERBS: { base: string; past: string }[] = [
  { base: "cook", past: "cooked" },
  { base: "clean", past: "cleaned" },
  { base: "paint", past: "painted" },
  { base: "watch", past: "watched" },
  { base: "wash", past: "washed" },
  { base: "fix", past: "fixed" },
  { base: "repair", past: "repaired" },
  { base: "polish", past: "polished" },
  { base: "design", past: "designed" },
  { base: "collect", past: "collected" },
];
const OBJECTS = [
  "the meal",
  "the classroom",
  "the fence",
  "the car",
  "the painting",
  "the field",
  "the garden",
  "the house",
  "the bicycle",
  "the report",
];

const PASSIVE_RULE =
  "In the passive voice, the object of the active sentence becomes the subject, and we add a form of 'to be' + the past participle, followed by 'by' + the original subject.";

export const activePassiveVoice: Skill = {
  id: "eng-g-active-passive-voice",
  code: "G.1",
  subjectId: "english",
  strandId: "eng-grammar",
  grade: 9,
  title: "Change active voice to passive voice",
  description: "Rewrite a sentence between the active and passive voice.",
  generate(rng) {
    const subject = randChoice(rng, SUBJECTS);
    const verb = randChoice(rng, VERBS);
    const object = randChoice(rng, OBJECTS);
    const isPlural = PLURAL_SUBJECTS.has(subject);
    const be = isPlural ? "were" : "was";

    const activeSentence = `${subject} ${verb.past} ${object}.`;
    const objectCap = object[0].toUpperCase() + object.slice(1);
    const subjectLower = subject.toLowerCase();
    const correctPassive = `${objectCap} ${be} ${verb.past} by ${subjectLower}.`;

    const branch = randChoice(rng, ["mcq", "mcq", "fillblank"] as const);

    if (branch === "fillblank") {
      return {
        kind: "fill-blank",
        prompt: `Complete the passive voice sentence for: "${activeSentence}"`,
        before: `${objectCap} `,
        after: ` by ${subjectLower}.`,
        correctAnswer: `${be} ${verb.past}`,
        inputMode: "text",
        hint: "Use a form of 'to be' that matches the new subject, followed by the past participle.",
        explanation: `${PASSIVE_RULE} Here, the object "${object}" becomes the subject "${objectCap}", and the verb becomes "${be} ${verb.past}": "${correctPassive}"`,
      };
    }

    const reverseDirection = rng() < 0.4;

    if (!reverseDirection) {
      const wrong1 = `${objectCap} ${isPlural ? "was" : "were"} ${verb.past} by ${subjectLower}.`; // wrong be-verb agreement
      const wrong2 = `${subject} ${be} ${verb.past} by ${object}.`; // subject/object not swapped
      const wrong3 = `${objectCap} ${be} ${verb.base} by ${subjectLower}.`; // wrong verb form

      const choices = shuffle(rng, [correctPassive, wrong1, wrong2, wrong3]);
      const correctIndex = choices.indexOf(correctPassive);

      return {
        kind: "multiple-choice",
        prompt: `Rewrite this sentence in the passive voice: "${activeSentence}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Find the object of the active sentence — it becomes the new subject.",
        explanation: `${PASSIVE_RULE} Here, "${object}" (the object) becomes the subject "${objectCap}", and "${subject}" (the original subject) moves after "by": "${correctPassive}"`,
      };
    }

    // Reverse direction: show the passive sentence, ask for the correct active rewrite.
    const wrongActive1 = `${objectCap} ${verb.past} ${subjectLower}.`; // subject/object left un-swapped
    const wrongActive2 = `${subject} ${verb.base} ${object}.`; // wrong verb tense
    const wrongActive3 = `${subject} ${be} ${verb.past} ${object}.`; // still keeps a "to be" passive form

    const choices = shuffle(rng, [activeSentence, wrongActive1, wrongActive2, wrongActive3]);
    const correctIndex = choices.indexOf(activeSentence);

    return {
      kind: "multiple-choice",
      prompt: `Rewrite this sentence in the active voice: "${correctPassive}"`,
      choices,
      correctIndex,
      layout: "list",
      hint: "Find who is doing the action after 'by' — that becomes the subject of the active sentence.",
      explanation: `${PASSIVE_RULE} To reverse it: the word after "by" ("${subjectLower}") becomes the subject again, and the subject of the passive sentence ("${objectCap}") becomes the object, with the verb changed back to its simple past form: "${activeSentence}"`,
    };
  },
};
