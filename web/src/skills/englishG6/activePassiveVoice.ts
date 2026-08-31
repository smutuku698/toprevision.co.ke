import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./grammarSharedA";

// 16 active/passive sentence pairs, animal-safety themed per the source sub-strand.
type Pair = { active: (n: string) => string; passive: (n: string) => string; subject: string; object: string };
const PAIRS: Pair[] = [
  { active: (n) => `${n} feeds the goats every morning.`, passive: (n) => `The goats are fed by ${n} every morning.`, subject: "farmer", object: "goats" },
  { active: (n) => `${n} cleans the cage daily.`, passive: (n) => `The cage is cleaned by ${n} daily.`, subject: "keeper", object: "cage" },
  { active: (n) => `${n} rescued the injured dog.`, passive: (n) => `The injured dog was rescued by ${n}.`, subject: "vet", object: "dog" },
  { active: (n) => `${n} protects the endangered animals.`, passive: (n) => `The endangered animals are protected by ${n}.`, subject: "warden", object: "animals" },
  { active: (n) => `${n} inspects the sanctuary every week.`, passive: (n) => `The sanctuary is inspected by ${n} every week.`, subject: "officer", object: "sanctuary" },
  { active: (n) => `${n} tethers the cattle at night.`, passive: (n) => `The cattle are tethered by ${n} at night.`, subject: "herder", object: "cattle" },
  { active: (n) => `${n} adopted a stray puppy.`, passive: (n) => `A stray puppy was adopted by ${n}.`, subject: "family", object: "puppy" },
  { active: (n) => `${n} treats sick animals at the clinic.`, passive: (n) => `Sick animals are treated by ${n} at the clinic.`, subject: "vet", object: "animals" },
  { active: (n) => `${n} builds a shelter for the orphaned animals.`, passive: (n) => `A shelter is built by ${n} for the orphaned animals.`, subject: "volunteer", object: "shelter" },
  { active: (n) => `${n} reported the case of cruelty.`, passive: (n) => `The case of cruelty was reported by ${n}.`, subject: "neighbour", object: "case" },
  { active: (n) => `${n} vaccinates the farm animals yearly.`, passive: (n) => `The farm animals are vaccinated by ${n} yearly.`, subject: "vet", object: "animals" },
  { active: (n) => `${n} trains the new game keepers.`, passive: (n) => `The new game keepers are trained by ${n}.`, subject: "senior warden", object: "keepers" },
  { active: (n) => `${n} caught the poachers near the reserve.`, passive: (n) => `The poachers were caught by ${n} near the reserve.`, subject: "ranger", object: "poachers" },
  { active: (n) => `${n} feeds the orphaned lambs by hand.`, passive: (n) => `The orphaned lambs are fed by ${n} by hand.`, subject: "caretaker", object: "lambs" },
  { active: (n) => `${n} monitors the animals' health records.`, passive: (n) => `The animals' health records are monitored by ${n}.`, subject: "vet assistant", object: "records" },
  { active: (n) => `${n} donated blankets for the animal shelter.`, passive: (n) => `Blankets were donated by ${n} for the animal shelter.`, subject: "community group", object: "blankets" },
];

export const activePassiveVoice: Skill = {
  id: "g6-eng-grammar-active-passive-voice",
  code: "G.8",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Active and Passive Voice",
  description: "Distinguish and correctly use the active voice (subject performs the action) and passive voice (subject receives the action) in sentences about animal safety.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "convert-fill", "categorize", "ordering", "click-match-tense"] as const);

    if (branch === "identify-mc") {
      const pair = randChoice(rng, PAIRS);
      const name = randChoice(rng, KENYAN_NAMES);
      const isActive = rng() > 0.5;
      const shown = isActive ? pair.active(name) : pair.passive(name);
      const choices = shuffle(rng, ["active voice", "passive voice"]);
      return {
        kind: "multiple-choice",
        prompt: `Is this sentence in the active voice or passive voice?\n"${shown}"`,
        choices,
        correctIndex: choices.indexOf(isActive ? "active voice" : "passive voice"),
        layout: "row",
        hint: isActive ? `In this sentence, "${name}" performs the action directly.` : `In this sentence, the ${pair.object} receives the action — notice "by ${name}".`,
        explanation: isActive ? `This is active voice — the subject ("${name}") performs the action directly.` : `This is passive voice — the subject (the ${pair.object}) receives the action, and "by ${name}" shows who did it.`,
      };
    }

    if (branch === "convert-fill") {
      const pair = randChoice(rng, PAIRS);
      const name = randChoice(rng, KENYAN_NAMES);
      const toPassive = rng() > 0.5;
      const given = toPassive ? pair.active(name) : pair.passive(name);
      const correct = toPassive ? pair.passive(name) : pair.active(name);
      return {
        kind: "fill-blank",
        prompt: `Rewrite this sentence in the ${toPassive ? "passive" : "active"} voice.\n"${given}"`,
        before: "",
        after: "",
        correctAnswer: correct,
        acceptedAnswers: [correct, correct.replace(".", "")],
        inputMode: "text",
        hint: toPassive ? "Move the object to the front, use a form of 'to be' + past participle, then add 'by' + the original subject." : "Move the subject (after 'by') to the front, and use a normal action verb.",
        explanation: `The ${toPassive ? "passive" : "active"} form is: "${correct}"`,
      };
    }

    if (branch === "categorize") {
      const pool = shuffle(rng, PAIRS).slice(0, 4);
      const name = randChoice(rng, KENYAN_NAMES);
      const items = pool.flatMap((p, i) => [
        { id: `a-${i}`, label: p.active(name), voice: "active" },
        { id: `p-${i}`, label: p.passive(name), voice: "passive" },
      ]);
      const sample = shuffle(rng, items).slice(0, 6);
      const correctBucket: Record<string, string> = {};
      for (const item of sample) correctBucket[item.id] = item.voice;
      return {
        kind: "categorize",
        prompt: "Sort these sentences: is each one in the ACTIVE voice, or the PASSIVE voice?",
        items: sample.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "active", label: "Active Voice" },
          { id: "passive", label: "Passive Voice" },
        ],
        correctBucket,
        hint: "Passive voice sentences usually contain 'is/was/are/were' + a past participle, and often the word 'by'.",
        explanation: "Active voice sentences have the subject doing the action directly; passive voice sentences have the subject receiving the action.",
      };
    }

    if (branch === "click-match-tense") {
      const pool = shuffle(rng, PAIRS).slice(0, 5);
      const name = randChoice(rng, KENYAN_NAMES);
      const tokens = shuffle(rng, pool.map((p, i) => ({ id: `t-${i}`, label: p.active(name) })));
      const targets = shuffle(rng, pool.map((p, i) => ({ id: `t-${i}`, label: p.passive(name) })));
      const correctMap: Record<string, string> = {};
      pool.forEach((p, i) => (correctMap[`t-${i}`] = `t-${i}`));
      return {
        kind: "click-match",
        prompt: "Match each active-voice sentence to its correct passive-voice version.",
        tokens,
        targets,
        correctMap,
        hint: "In the passive version, the object of the active sentence becomes the subject.",
        explanation: "Each active sentence's object becomes the subject of its matching passive sentence, with 'by' introducing the original doer.",
      };
    }

    const pair = randChoice(rng, PAIRS);
    const name = randChoice(rng, KENYAN_NAMES);
    const full = pair.passive(name).replace(".", "");
    const words = full.split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct passive-voice sentence.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: "The passive pattern is: object + is/was/are/were + past participle + by + doer.",
      explanation: `The correct sentence is: "${cap(full)}."`,
    };
  },
};
