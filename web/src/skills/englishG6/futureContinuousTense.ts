import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

// Verbs used across future/past/present continuous scenario templates.
const VERBS = ["coding", "testing the app", "charging the device", "repairing the satellite dish", "writing the program", "presenting the invention", "building the robot", "downloading the update", "connecting the wireless router", "recording the experiment"];

type Tense = "future-continuous" | "past-continuous" | "present-continuous";
const TENSE_FORMS: Record<Tense, (subject: string, verbGerund: string) => string> = {
  "future-continuous": (s, v) => `${s} will be ${v}`,
  "past-continuous": (s, v) => `${s} was ${v}`,
  "present-continuous": (s, v) => `${s} is ${v}`,
};

const SUBJECTS = ["he", "she", "the engineer", "the scientist", "the class"] as const;

// 30+ Kenyan-context scenario sentence templates around tomorrow/yesterday/now, per the theme.
type FillItem = { subject: string; verb: string; tense: Tense; before: string; after: string };
const FILL_ITEMS: FillItem[] = [
  { subject: "she", verb: "coding", tense: "future-continuous", before: "This time tomorrow, ", after: " the new mobile app." },
  { subject: "he", verb: "testing the app", tense: "future-continuous", before: "At 4pm tomorrow, ", after: " on his tablet." },
  { subject: "the engineer", verb: "repairing the satellite dish", tense: "future-continuous", before: "By next week, ", after: "." },
  { subject: "the class", verb: "presenting the invention", tense: "future-continuous", before: "Tomorrow morning, ", after: " to the whole school." },
  { subject: "the scientist", verb: "recording the experiment", tense: "future-continuous", before: "At noon tomorrow, ", after: " in the laboratory." },
  { subject: "she", verb: "building the robot", tense: "future-continuous", before: "Next Saturday, ", after: " with her team." },
  { subject: "he", verb: "downloading the update", tense: "future-continuous", before: "At 9pm tonight, ", after: " onto his computer." },
  { subject: "she", verb: "coding", tense: "past-continuous", before: "Yesterday evening, ", after: " when the power went out." },
  { subject: "he", verb: "testing the app", tense: "past-continuous", before: "This time yesterday, ", after: " on his laptop." },
  { subject: "the engineer", verb: "connecting the wireless router", tense: "past-continuous", before: "At 2pm yesterday, ", after: "." },
  { subject: "she", verb: "coding", tense: "present-continuous", before: "Right now, ", after: " on the new project." },
  { subject: "he", verb: "downloading the update", tense: "present-continuous", before: "At this very moment, ", after: "." },
];

export const futureContinuousTense: Skill = {
  id: "g6-eng-grammar-future-continuous",
  code: "G.7",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Future Continuous Tense",
  description: "Identify and use the future continuous tense (will be + -ing) correctly, contrasted with past and present continuous.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-choose-tense", "categorize-time", "click-match", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_ITEMS);
      const correct = TENSE_FORMS[item.tense](cap(item.subject), item.verb);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence using the correct verb form (${item.tense.replace("-", " ")}).`,
        before: item.before,
        after: item.after,
        correctAnswer: correct,
        inputMode: "text",
        hint: item.tense === "future-continuous" ? "Use 'will be' + the -ing form of the verb." : item.tense === "past-continuous" ? "Use 'was/were' + the -ing form of the verb." : "Use 'is/are' + the -ing form of the verb.",
        explanation: `"${correct}" is correct — it uses the ${item.tense.replace("-", " ")} form to show an action ${item.tense === "future-continuous" ? "in progress at a specific time in the future" : item.tense === "past-continuous" ? "in progress at a specific time in the past" : "in progress right now"}.`,
      };
    }

    if (branch === "mc-choose-tense") {
      const item = randChoice(rng, FILL_ITEMS.filter((f) => f.tense === "future-continuous"));
      const correct = TENSE_FORMS["future-continuous"](cap(item.subject), item.verb);
      const wrongPast = TENSE_FORMS["past-continuous"](cap(item.subject), item.verb);
      const wrongPresent = TENSE_FORMS["present-continuous"](cap(item.subject), item.verb);
      const wrongSimple = `${cap(item.subject)} will ${item.verb.replace("ing", "")}`;
      const choices = shuffle(rng, [correct, wrongPast, wrongPresent, wrongSimple]);
      return {
        kind: "multiple-choice",
        prompt: `Which sentence correctly uses the future continuous tense?\n"${item.before}____${item.after}"`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "The future continuous tense uses 'will be' followed by the -ing form of the verb.",
        explanation: `"${correct}" is correct — it shows an action that will be in progress at a specific time in the future, using 'will be' + verb-ing.`,
      };
    }

    if (branch === "categorize-time") {
      const pool = shuffle(rng, FILL_ITEMS).slice(0, 6);
      const items = pool.map((f, i) => ({ id: `f-${i}`, label: TENSE_FORMS[f.tense](cap(f.subject), f.verb) }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f-${i}`] = f.tense === "future-continuous" ? "future" : f.tense === "past-continuous" ? "past" : "present"));
      return {
        kind: "categorize",
        prompt: "Sort these sentences: does the action happen in the PAST, PRESENT, or FUTURE?",
        items,
        buckets: [
          { id: "past", label: "Past" },
          { id: "present", label: "Present" },
          { id: "future", label: "Future" },
        ],
        correctBucket,
        hint: "'will be' = future, 'was/were' = past, 'is/are' = present, all followed by the -ing verb form.",
        explanation: "'will be + -ing' shows the future, 'was/were + -ing' shows the past, 'is/are + -ing' shows the present.",
      };
    }

    if (branch === "click-match") {
      const pool = shuffle(rng, SUBJECTS.map((s) => s));
      const helpingVerbs: Record<string, string> = { he: "will be", she: "will be", "the engineer": "will be", "the scientist": "will be", "the class": "will be" };
      const tokens = shuffle(rng, pool.map((s) => ({ id: s, label: cap(s) })));
      const targets = shuffle(rng, pool.map((s) => ({ id: s, label: `${helpingVerbs[s]} + verb-ing` })));
      const correctMap: Record<string, string> = {};
      for (const s of pool) correctMap[s] = s;
      return {
        kind: "click-match",
        prompt: "Match each subject to the correct future continuous helping-verb pattern.",
        tokens,
        targets,
        correctMap,
        hint: "The future continuous always uses 'will be' regardless of the subject.",
        explanation: "Every subject uses 'will be' + the -ing form to form the future continuous tense — it does not change with the subject like present tense does.",
      };
    }

    const item = randChoice(rng, FILL_ITEMS.filter((f) => f.tense === "future-continuous"));
    const full = (item.before + TENSE_FORMS["future-continuous"](item.subject, item.verb) + item.after).replace(".", "");
    const words = full.trim().split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct future continuous sentence.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: "The pattern is: time phrase + subject + will be + verb-ing.",
      explanation: `The correct sentence is: "${cap(full.trim())}."`,
    };
  },
};
