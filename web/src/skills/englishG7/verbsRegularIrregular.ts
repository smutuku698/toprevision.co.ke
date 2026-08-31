import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VERB_TYPES: { base: string; past: string; type: "regular" | "irregular" }[] = [
  { base: "wash", past: "washed", type: "regular" },
  { base: "brush", past: "brushed", type: "regular" },
  { base: "clean", past: "cleaned", type: "regular" },
  { base: "scrub", past: "scrubbed", type: "regular" },
  { base: "rinse", past: "rinsed", type: "regular" },
  { base: "wipe", past: "wiped", type: "regular" },
  { base: "boil", past: "boiled", type: "regular" },
  { base: "trim", past: "trimmed", type: "regular" },
  { base: "disinfect", past: "disinfected", type: "regular" },
  { base: "comb", past: "combed", type: "regular" },
  { base: "sweep", past: "swept", type: "irregular" },
  { base: "keep", past: "kept", type: "irregular" },
  { base: "cut", past: "cut", type: "irregular" },
  { base: "put", past: "put", type: "irregular" },
  { base: "wear", past: "wore", type: "irregular" },
  { base: "take", past: "took", type: "irregular" },
  { base: "throw", past: "threw", type: "irregular" },
  { base: "choose", past: "chose", type: "irregular" },
  { base: "bring", past: "brought", type: "irregular" },
  { base: "buy", past: "bought", type: "irregular" },
  { base: "get", past: "got", type: "irregular" },
  { base: "give", past: "gave", type: "irregular" },
] as const;

const CONVERSION_FILL: { before: string; verb: string; after: string; past: string }[] = [
  { before: "Yesterday, Amina ", verb: "wash", after: " her hands with soap before breakfast.", past: "washed" },
  { before: "Last night, the nurse ", verb: "clean", after: " the wound carefully.", past: "cleaned" },
  { before: "Before school, Baraka ", verb: "brush", after: " his teeth for two full minutes.", past: "brushed" },
  { before: "The cleaner ", verb: "sweep", after: " the clinic floor before the visitors arrived.", past: "swept" },
  { before: "Mwangi ", verb: "get", after: " a new toothbrush from the health clinic last week.", past: "got" },
  { before: "The doctor ", verb: "put", after: " on clean gloves before the checkup yesterday.", past: "put" },
  { before: "She ", verb: "wear", after: " a clean uniform to the hospital yesterday.", past: "wore" },
  { before: "The children ", verb: "rinse", after: " their hands under clean running water this morning.", past: "rinsed" },
];

const CORRECT_CONJUGATION_MC: { before: string; verb: string; after: string; correct: string; distractors: string[] }[] = [
  { before: "Yesterday, Achieng ", verb: "sweep", after: " the clinic floor before the health talk began.", correct: "swept", distractors: ["sweeped", "sweep", "sweeping"] },
  { before: "This morning, the boys ", verb: "brush", after: " their teeth before breakfast.", correct: "brushed", distractors: ["brushs", "brush", "brushing"] },
  { before: "Last night, mother ", verb: "buy", after: " new soap from the shop.", correct: "bought", distractors: ["buyed", "buy", "buys"] },
  { before: "The health worker ", verb: "wear", after: " gloves during the vaccination drive.", correct: "wore", distractors: ["weared", "wear", "wearing"] },
  { before: "Last week, the boy ", verb: "cut", after: " his overgrown fingernails.", correct: "cut", distractors: ["cutted", "cuts", "cutting"] },
  { before: "The nurse ", verb: "throw", after: " away the used bandages after the treatment.", correct: "threw", distractors: ["throwed", "throw", "throwing"] },
];

const PAST_PARTICIPLE: { base: string; participle: string }[] = [
  { base: "wash", participle: "washed" },
  { base: "sweep", participle: "swept" },
  { base: "keep", participle: "kept" },
  { base: "cut", participle: "cut" },
  { base: "put", participle: "put" },
  { base: "wear", participle: "worn" },
  { base: "take", participle: "taken" },
  { base: "throw", participle: "thrown" },
  { base: "choose", participle: "chosen" },
  { base: "bring", participle: "brought" },
  { base: "buy", participle: "bought" },
  { base: "give", participle: "given" },
];

const TYPE_REASONING_MC: { sentence: string; verb: string; type: string }[] = [
  { sentence: "The nurse disinfected the wound before bandaging it.", verb: "disinfected", type: "Regular (formed by adding -ed)" },
  { sentence: "Baraka swept the compound before school started.", verb: "swept", type: "Irregular (does not simply add -ed)" },
  { sentence: "The children rinsed their plates after the meal.", verb: "rinsed", type: "Regular (formed by adding -ed)" },
  { sentence: "The doctor wore a fresh pair of gloves for every patient.", verb: "wore", type: "Irregular (does not simply add -ed)" },
  { sentence: "The health worker trimmed the patient's overgrown nails.", verb: "trimmed", type: "Regular (formed by adding -ed)" },
  { sentence: "Mother brought clean towels for the new baby.", verb: "brought", type: "Irregular (does not simply add -ed)" },
];

export const verbsRegularIrregular: Skill = {
  id: "g7-eng-g-verbs-regular-irregular",
  code: "G.3",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Verbs and Tense: Regular and Irregular Verbs",
  description: "Identify regular and irregular verbs and use their correct past-tense and past-participle forms in sentences about hygiene.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "fill", "conjugate-mc", "match", "type-mc"] as const);

    if (branch === "categorize") {
      const regularPick = shuffle(rng, VERB_TYPES.filter((v) => v.type === "regular")).slice(0, 3);
      const irregularPick = shuffle(rng, VERB_TYPES.filter((v) => v.type === "irregular")).slice(0, 3);
      const chosen = shuffle(rng, [...regularPick, ...irregularPick]);
      const buckets = [
        { id: "regular", label: "Regular verb (adds -ed for the past tense)" },
        { id: "irregular", label: "Irregular verb (past tense is a different form)" },
      ];
      const items = chosen.map((v, i) => ({ id: `v${i}`, label: v.base }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((v, i) => (correctBucket[`v${i}`] = v.type));
      return {
        kind: "categorize",
        prompt: "Sort each verb as regular or irregular.",
        items,
        buckets,
        correctBucket,
        hint: "A regular verb simply adds -ed to form its past tense. An irregular verb changes to a completely different form.",
        explanation: chosen.map((v) => `"${v.base}" is ${v.type} — its past tense is "${v.past}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, CONVERSION_FILL);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct past tense form of the verb "${entry.verb}".`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.past,
        inputMode: "text",
        hint: "Check whether this verb simply adds -ed, or whether it has a special irregular past form.",
        explanation: `The past tense of "${entry.verb}" is "${entry.past}": "${entry.before}${entry.past}${entry.after}"`,
      };
    }

    if (branch === "conjugate-mc") {
      const entry = randChoice(rng, CORRECT_CONJUGATION_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correct past tense form of "${entry.verb}" to complete this sentence? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Only one option is a real English past-tense form — watch out for endings that are never actually used.",
        explanation: `"${entry.correct}" is correct: "${entry.before}${entry.correct}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PAST_PARTICIPLE).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.base, label: p.base })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.base, label: `has ${p.participle}` })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.base] = p.base;
      return {
        kind: "click-match",
        prompt: "Match each verb to its correct past participle form.",
        tokens,
        targets,
        correctMap,
        hint: "The past participle is the form used after 'has' or 'have' — for irregular verbs it is often different from the simple past.",
        explanation: chosen.map((p) => `The past participle of "${p.base}" is "${p.participle}" (has ${p.participle}).`).join(" "),
      };
    }

    const entry = randChoice(rng, TYPE_REASONING_MC);
    const distractorTypes = ["Regular (formed by adding -ed)", "Irregular (does not simply add -ed)"].filter((t) => t !== entry.type);
    const choices = shuffle(rng, [entry.type, ...distractorTypes]);
    return {
      kind: "multiple-choice",
      prompt: `Is the verb "${entry.verb}" in this sentence regular or irregular? "${entry.sentence}"`,
      choices,
      correctIndex: choices.indexOf(entry.type),
      layout: "list",
      hint: "Think about the base form of the verb — does it simply take -ed, or does it change shape entirely?",
      explanation: `"${entry.verb}" is ${entry.type.toLowerCase()} in this sentence: "${entry.sentence}"`,
    };
  },
};
