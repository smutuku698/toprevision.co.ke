import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

type RelativeKey = "that" | "which" | "who" | "whom" | "whose";
const RELATIVE_SENTENCES: { word: RelativeKey; sentence: (n: string, p: string) => string }[] = [
  { word: "who", sentence: (n) => `The paramedic ___ arrived first treated the injured casualty.` },
  { word: "who", sentence: (n) => `${n} is the pupil ___ won the spelling contest.` },
  { word: "which", sentence: (n, p) => `The ambulance ___ raced to ${p} arrived just in time.` },
  { word: "which", sentence: () => `The road sign ___ warns of a sharp bend was newly installed.` },
  { word: "that", sentence: () => `The guard rails ___ protect drivers were repaired last week.` },
  { word: "that", sentence: (n) => `${n} found the reflectors ___ had fallen off the culvert.` },
  { word: "whom", sentence: (n) => `The officer ___ ${n} spoke to gave clear directions.` },
  { word: "whom", sentence: () => `The rescue worker to ___ the family is grateful saved two lives.` },
  { word: "whose", sentence: (n) => `${n} is the driver ___ car broke down near the culvert.` },
  { word: "whose", sentence: () => `The child ___ parents called the ambulance was very brave.` },
  { word: "who", sentence: (n, p) => `The warden ___ works in ${p} rescued the stranded hikers.` },
  { word: "which", sentence: () => `The dual carriage way ___ was recently built reduced accidents.` },
];

type IndefiniteKey = "anyone" | "anything" | "everybody" | "everyone" | "everything" | "nobody" | "somebody" | "someone";
const INDEFINITE_SENTENCES: { word: IndefiniteKey; sentence: (n: string) => string }[] = [
  { word: "anyone", sentence: () => `Did ___ see the ambulance pass this way?` },
  { word: "anything", sentence: (n) => `${n} did not have ___ to report about the accident.` },
  { word: "everybody", sentence: () => `___ must watch out for oncoming traffic near the school.` },
  { word: "everyone", sentence: (n) => `${n} made sure ___ crossed the road safely.` },
  { word: "everything", sentence: () => `The paramedics checked ___ before moving the casualty.` },
  { word: "nobody", sentence: () => `___ was hurt because the driver used the guard rails correctly.` },
  { word: "somebody", sentence: (n) => `${n} heard ___ shouting for help near the culvert.` },
  { word: "someone", sentence: () => `___ needs to call the Red Cross immediately.` },
  { word: "anyone", sentence: (n) => `${n} asked if ___ had a first aid kit.` },
  { word: "everybody", sentence: () => `___ at the school knows the emergency assembly point.` },
  { word: "nobody", sentence: (n) => `${n} said ___ else was near the road median at the time.` },
  { word: "somebody", sentence: () => `The security guard said ___ had reported the missing reflector.` },
];

export const relativeIndefinitePronouns: Skill = {
  id: "g6-eng-grammar-relative-indefinite-pronouns",
  code: "G.4",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Relative and Indefinite Pronouns",
  description: "Identify and use relative pronouns (that, which, who, whom, whose) and indefinite pronouns (anyone, anything, everybody, everyone, everything, nobody, somebody, someone) correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["relative-mc", "relative-fill", "indefinite-fill", "categorize", "click-match"] as const);

    if (branch === "relative-mc") {
      const item = randChoice(rng, RELATIVE_SENTENCES);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const wrongPool = (["that", "which", "who", "whom", "whose"] as RelativeKey[]).filter((w) => w !== item.word);
      const distractors = shuffle(rng, wrongPool).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which relative pronoun correctly completes this sentence?\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "who/whom refer to people, which refers to things, that can refer to either, whose shows possession.",
        explanation: `"${item.word}" is correct here.`,
      };
    }

    if (branch === "relative-fill") {
      const item = randChoice(rng, RELATIVE_SENTENCES);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: "Fill in the correct relative pronoun (that / which / who / whom / whose).",
        before,
        after,
        correctAnswer: item.word,
        inputMode: "text",
        hint: "who/whom refer to people, which refers to things, whose shows possession.",
        explanation: `The complete sentence is: "${cap(before + item.word + after)}"`,
      };
    }

    if (branch === "indefinite-fill") {
      const item = randChoice(rng, INDEFINITE_SENTENCES);
      const name = randChoice(rng, KENYAN_NAMES);
      const full = item.sentence(name);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: "Fill in the correct indefinite pronoun.",
        before,
        after,
        correctAnswer: item.word,
        inputMode: "text",
        hint: "Indefinite pronouns refer to unspecified people or things (anyone, everybody, nobody, someone, etc.).",
        explanation: `The complete sentence is: "${cap(before + item.word + after)}"`,
      };
    }

    if (branch === "categorize") {
      const relPool = shuffle(rng, RELATIVE_SENTENCES).slice(0, 4).map((r) => r.word) as string[];
      const indefPool = shuffle(rng, INDEFINITE_SENTENCES).slice(0, 4).map((r) => r.word) as string[];
      const pool = shuffle(rng, [
        ...relPool.map((w) => ({ id: w, label: w, bucket: "relative" })),
        ...indefPool.map((w) => ({ id: w, label: w, bucket: "indefinite" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these pronouns: is it a RELATIVE pronoun (connects a clause to a noun), or an INDEFINITE pronoun (refers to an unspecified person/thing)?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "relative", label: "Relative Pronoun" },
          { id: "indefinite", label: "Indefinite Pronoun" },
        ],
        correctBucket,
        hint: "Relative pronouns introduce extra information about a specific noun; indefinite pronouns don't name anyone/anything specific.",
        explanation: "Relative pronouns: that, which, who, whom, whose. Indefinite pronouns: anyone, anything, everybody, everyone, everything, nobody, somebody, someone.",
      };
    }

    const pool = shuffle(rng, INDEFINITE_SENTENCES).slice(0, 6);
    const meanings: Record<IndefiniteKey, string> = {
      anyone: "any person, in a question or negative sentence",
      anything: "any thing, in a question or negative sentence",
      everybody: "every single person",
      everyone: "every single person",
      everything: "every single thing",
      nobody: "no person at all",
      somebody: "an unspecified person",
      someone: "an unspecified person",
    };
    const tokens = shuffle(rng, pool.map((p) => ({ id: p.word, label: p.word })));
    const targets = shuffle(rng, pool.map((p) => ({ id: p.word, label: meanings[p.word] })));
    const correctMap: Record<string, string> = {};
    for (const p of pool) correctMap[p.word] = p.word;
    return {
      kind: "click-match",
      prompt: "Match each indefinite pronoun to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Some refer to people, some to things, some are positive and some negative.",
      explanation: pool.map((p) => `"${p.word}" means ${meanings[p.word]}.`).join(" "),
    };
  },
};
