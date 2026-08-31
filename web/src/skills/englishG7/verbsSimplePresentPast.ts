import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TENSE_SENTENCES: { text: string; tense: "present" | "past" }[] = [
  { text: "The chairperson listens to every member's opinion.", tense: "present" },
  { text: "The elders chose a new village leader last year.", tense: "past" },
  { text: "Good leaders inspire their community every day.", tense: "present" },
  { text: "She organized a clean-up exercise last weekend.", tense: "past" },
  { text: "The captain encourages her teammates before every match.", tense: "present" },
  { text: "He served as head boy for two years.", tense: "past" },
  { text: "Wise leaders consult their advisors before deciding.", tense: "present" },
  { text: "The committee elected a new chairperson yesterday.", tense: "past" },
  { text: "Leaders often unite people from different backgrounds.", tense: "present" },
  { text: "The prefect settled the dispute fairly last week.", tense: "past" },
];

const PRESENT_FILL: { before: string; verb: string; after: string; form: string }[] = [
  { before: "A good leader always ", verb: "listen", after: " to the views of others.", form: "listens" },
  { before: "The class captain ", verb: "organize", after: " the morning assembly every day.", form: "organizes" },
  { before: "Our chief ", verb: "settle", after: " land disputes fairly.", form: "settles" },
  { before: "She ", verb: "encourage", after: " her classmates before every exam.", form: "encourages" },
  { before: "The prefect ", verb: "carry", after: " out her duties responsibly.", form: "carries" },
  { before: "He rarely ", verb: "worry", after: " about criticism.", form: "worries" },
];

const PAST_FILL: { before: string; verb: string; after: string; past: string; rule: string }[] = [
  { before: "Last year, Wangari Maathai ", verb: "plant", after: " thousands of trees across the country.", past: "planted", rule: "add -ed to the base verb" },
  { before: "The elders ", verb: "choose", after: " a new village leader during the meeting.", past: "chose", rule: "use the irregular past form" },
  { before: "Yesterday, the head girl ", verb: "organize", after: " a fundraiser for the needy.", past: "organized", rule: "add -d, since the verb already ends in 'e'" },
  { before: "The captain ", verb: "lead", after: " the team to victory last season.", past: "led", rule: "use the irregular past form" },
  { before: "Two years ago, the committee ", verb: "elect", after: " her as chairperson.", past: "elected", rule: "add -ed to the base verb" },
  { before: "The mentor ", verb: "guide", after: " the young leaders through the project last term.", past: "guided", rule: "add -d, since the verb already ends in 'e'" },
];

const IDENTIFY_TENSE_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  { sentence: "The chairperson explains the rules before every meeting.", target: "explains", correct: "Simple present tense", distractors: ["Simple past tense", "Present continuous tense", "Future tense"] },
  { sentence: "The youth leader organized a peace walk last month.", target: "organized", correct: "Simple past tense", distractors: ["Simple present tense", "Present continuous tense", "Future tense"] },
  { sentence: "Wangari Maathai founded the Green Belt Movement in 1977.", target: "founded", correct: "Simple past tense", distractors: ["Simple present tense", "Present continuous tense", "Future tense"] },
  { sentence: "Every prefect reports to the deputy head teacher weekly.", target: "reports", correct: "Simple present tense", distractors: ["Simple past tense", "Present continuous tense", "Future tense"] },
  { sentence: "The class monitor collected the exercise books yesterday.", target: "collected", correct: "Simple past tense", distractors: ["Simple present tense", "Present continuous tense", "Future tense"] },
  { sentence: "Our leaders unite people from different communities.", target: "unite", correct: "Simple present tense", distractors: ["Simple past tense", "Present continuous tense", "Future tense"] },
];

const VERB_FORM_PAIRS: { present: string; past: string }[] = [
  { present: "leads", past: "led" },
  { present: "organizes", past: "organized" },
  { present: "chooses", past: "chose" },
  { present: "unites", past: "united" },
  { present: "inspires", past: "inspired" },
  { present: "settles", past: "settled" },
  { present: "guides", past: "guided" },
  { present: "serves", past: "served" },
];

export const verbsSimplePresentPast: Skill = {
  id: "g7-eng-g-verbs-simple-present-past",
  code: "G.4",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Verbs and Tense: Simple Present and Simple Past",
  description: "Identify and correctly use verbs in the simple present and simple past tense in sentences about leadership.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify-mc", "present-fill", "past-fill", "match"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TENSE_SENTENCES).slice(0, 6);
      const buckets = [
        { id: "present", label: "Simple present tense" },
        { id: "past", label: "Simple past tense" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.tense));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by its tense: simple present or simple past.",
        items,
        buckets,
        correctBucket,
        hint: "Simple present describes habits or facts happening now; simple past describes completed actions, often with clues like 'yesterday' or 'last year'.",
        explanation: chosen.map((s) => `"${s.text}" is in the simple ${s.tense} tense.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_TENSE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What tense is the verb "${entry.target}" in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check whether the action is happening as a habit/fact now, or whether it already finished in the past.",
        explanation: `"${entry.target}" is in the ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "present-fill") {
      const entry = randChoice(rng, PRESENT_FILL);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct simple present tense form of the verb "${entry.verb}".`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.form,
        inputMode: "text",
        hint: "With he, she, it, or a singular subject, the simple present verb usually ends in -s or -es.",
        explanation: `With a singular subject, "${entry.verb}" becomes "${entry.form}" in the simple present tense: "${entry.before}${entry.form}${entry.after}"`,
      };
    }

    if (branch === "past-fill") {
      const entry = randChoice(rng, PAST_FILL);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct simple past tense form of the verb "${entry.verb}".`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.past,
        inputMode: "text",
        hint: `To form the past tense here, ${entry.rule}.`,
        explanation: `The simple past of "${entry.verb}" is "${entry.past}" — to form it, ${entry.rule}: "${entry.before}${entry.past}${entry.after}"`,
      };
    }

    const chosen = shuffle(rng, VERB_FORM_PAIRS).slice(0, 6);
    const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `v${i}`, label: v.present })));
    const targets = shuffle(rng, chosen.map((v, i) => ({ id: `v${i}`, label: v.past })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((v, i) => (correctMap[`v${i}`] = `v${i}`));
    return {
      kind: "click-match",
      prompt: "Match each simple present tense verb to its simple past tense form.",
      tokens,
      targets,
      correctMap,
      hint: "Read each present-tense verb and think about how a leader's action would be described if it already happened.",
      explanation: chosen.map((v) => `"${v.present}" in the simple present becomes "${v.past}" in the simple past.`).join(" "),
    };
  },
};
