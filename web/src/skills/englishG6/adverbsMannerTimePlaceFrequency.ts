import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

type AdverbType = "manner" | "time" | "place" | "frequency";
const ADVERBS: { word: string; type: AdverbType }[] = [
  { word: "carefully", type: "manner" }, { word: "quickly", type: "manner" }, { word: "slowly", type: "manner" },
  { word: "quietly", type: "manner" }, { word: "happily", type: "manner" }, { word: "gently", type: "manner" },
  { word: "honestly", type: "manner" }, { word: "loudly", type: "manner" },
  { word: "yesterday", type: "time" }, { word: "tomorrow", type: "time" }, { word: "today", type: "time" },
  { word: "soon", type: "time" }, { word: "now", type: "time" }, { word: "later", type: "time" },
  { word: "recently", type: "time" }, { word: "immediately", type: "time" },
  { word: "here", type: "place" }, { word: "there", type: "place" }, { word: "everywhere", type: "place" },
  { word: "nearby", type: "place" }, { word: "outside", type: "place" }, { word: "inside", type: "place" },
  { word: "upstairs", type: "place" }, { word: "abroad", type: "place" },
  { word: "always", type: "frequency" }, { word: "never", type: "frequency" }, { word: "sometimes", type: "frequency" },
  { word: "often", type: "frequency" }, { word: "rarely", type: "frequency" }, { word: "usually", type: "frequency" },
  { word: "daily", type: "frequency" }, { word: "occasionally", type: "frequency" },
];

// 32 lifestyle-diseases-themed sentence templates, each keyed to a specific adverb.
type Item = { word: string; type: AdverbType; sentence: (n: string, p: string) => string };
const ITEMS: Item[] = [
  { word: "carefully", type: "manner", sentence: (n) => `${n} ___ read the doctor's instructions about the new medicine.` },
  { word: "quickly", type: "manner", sentence: () => `The nurse responded ___ when the patient felt dizzy.` },
  { word: "slowly", type: "manner", sentence: (n) => `${n} recovered ___ after the long illness.` },
  { word: "honestly", type: "manner", sentence: () => `The patient ___ described all of her symptoms.` },
  { word: "gently", type: "manner", sentence: () => `The doctor ___ examined the patient's swollen leg.` },
  { word: "quietly", type: "manner", sentence: (n) => `${n} sat ___ in the waiting room before the check-up.` },
  { word: "happily", type: "manner", sentence: () => `The patients left the clinic ___ after their good news.` },
  { word: "loudly", type: "manner", sentence: (n) => `${n} coughed ___ during the health talk.` },
  { word: "yesterday", type: "time", sentence: (n) => `${n} visited the clinic ___ for a blood pressure check.` },
  { word: "tomorrow", type: "time", sentence: () => `The health talk on diabetes will be held ___.` },
  { word: "today", type: "time", sentence: (n) => `${n} plans to start a healthier diet ___.` },
  { word: "soon", type: "time", sentence: () => `The doctor said the test results would arrive ___.` },
  { word: "now", type: "time", sentence: (n) => `${n} understands the risks of obesity ___.` },
  { word: "recently", type: "time", sentence: () => `The hospital ___ opened a new heart clinic.` },
  { word: "immediately", type: "time", sentence: () => `Anyone with chest pain should see a doctor ___.` },
  { word: "later", type: "time", sentence: (n) => `${n} will exercise ___ after finishing homework.` },
  { word: "here", type: "place", sentence: () => `The blood pressure machine is kept right ___.` },
  { word: "there", type: "place", sentence: (n, p) => `${n} went ___ to the hospital in ${p}.` },
  { word: "everywhere", type: "place", sentence: () => `Posters about healthy eating were displayed ___ in the clinic.` },
  { word: "nearby", type: "place", sentence: (n, p) => `A pharmacy is located ___ the health centre in ${p}.` },
  { word: "outside", type: "place", sentence: () => `Patients waited ___ under the shade for their turn.` },
  { word: "inside", type: "place", sentence: () => `The doctor's office is ___ the main building.` },
  { word: "upstairs", type: "place", sentence: () => `The diabetes clinic is located ___.` },
  { word: "abroad", type: "place", sentence: (n) => `${n}'s uncle received specialised heart treatment ___.` },
  { word: "always", type: "frequency", sentence: (n) => `${n} ___ checks his blood sugar before meals.` },
  { word: "never", type: "frequency", sentence: () => `The doctor ___ skips washing her hands before a check-up.` },
  { word: "sometimes", type: "frequency", sentence: (n) => `${n} ___ forgets to take the prescribed medicine.` },
  { word: "often", type: "frequency", sentence: () => `People with high blood pressure ___ need regular check-ups.` },
  { word: "rarely", type: "frequency", sentence: (n) => `${n} ___ eats sugary snacks since the diabetes diagnosis.` },
  { word: "usually", type: "frequency", sentence: () => `The clinic is ___ busiest on Monday mornings.` },
  { word: "daily", type: "frequency", sentence: (n) => `${n} takes a short walk ___ to stay healthy.` },
  { word: "occasionally", type: "frequency", sentence: () => `The nutritionist ___ visits the school to talk about diet.` },
];

export const adverbsMannerTimePlaceFrequency: Skill = {
  id: "g6-eng-grammar-adverbs",
  code: "G.9",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Adverbs of Manner, Time, Place and Frequency",
  description: "Identify and use adverbs of manner, time, place and frequency correctly in sentences about lifestyle diseases and health.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-identify-type", "mc-choose-word", "categorize", "click-match"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence with an adverb of ${item.type}.`,
        before,
        after,
        correctAnswer: item.word,
        inputMode: "text",
        hint: `An adverb of ${item.type} tells us ${item.type === "manner" ? "how" : item.type === "time" ? "when" : item.type === "place" ? "where" : "how often"} something happens.`,
        explanation: `"${item.word}" is an adverb of ${item.type} — it tells us ${item.type === "manner" ? "how" : item.type === "time" ? "when" : item.type === "place" ? "where" : "how often"} the action happens.`,
      };
    }

    if (branch === "mc-identify-type") {
      const item = randChoice(rng, ADVERBS);
      const choices = shuffle(rng, ["manner", "time", "place", "frequency"]);
      return {
        kind: "multiple-choice",
        prompt: `What type of adverb is "${item.word}"?`,
        choices,
        correctIndex: choices.indexOf(item.type),
        layout: "row",
        hint: "Manner = how, time = when, place = where, frequency = how often.",
        explanation: `"${item.word}" is an adverb of ${item.type}.`,
      };
    }

    if (branch === "mc-choose-word") {
      const item = randChoice(rng, ITEMS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const sameTypeDistractors = shuffle(rng, ADVERBS.filter((a) => a.type === item.type && a.word !== item.word)).slice(0, 3).map((a) => a.word);
      const choices = shuffle(rng, [item.word, ...sameTypeDistractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which adverb of ${item.type} correctly completes this sentence?\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "All the options are the same type of adverb — pick the one that fits the meaning of the sentence.",
        explanation: `"${item.word}" fits best here.`,
      };
    }

    if (branch === "categorize") {
      const pool = shuffle(rng, ADVERBS).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const a of pool) correctBucket[a.word] = a.type;
      return {
        kind: "categorize",
        prompt: "Sort these adverbs by type: MANNER, TIME, PLACE, or FREQUENCY.",
        items: pool.map((a) => ({ id: a.word, label: a.word })),
        buckets: [
          { id: "manner", label: "Manner (how)" },
          { id: "time", label: "Time (when)" },
          { id: "place", label: "Place (where)" },
          { id: "frequency", label: "Frequency (how often)" },
        ],
        correctBucket,
        hint: "Ask what question each adverb answers: how? when? where? how often?",
        explanation: pool.map((a) => `"${a.word}" is an adverb of ${a.type}.`).join(" "),
      };
    }

    const questionMap: Record<AdverbType, string> = { manner: "How?", time: "When?", place: "Where?", frequency: "How often?" };
    const pool = shuffle(rng, ADVERBS).slice(0, 6);
    const tokens = shuffle(rng, pool.map((a) => ({ id: a.word, label: a.word })));
    const targets = shuffle(rng, pool.map((a) => ({ id: a.word, label: questionMap[a.type] })));
    const correctMap: Record<string, string> = {};
    for (const a of pool) correctMap[a.word] = a.word;
    return {
      kind: "click-match",
      prompt: "Match each adverb to the question it answers.",
      tokens,
      targets,
      correctMap,
      hint: "Manner answers 'how?', time answers 'when?', place answers 'where?', frequency answers 'how often?'.",
      explanation: pool.map((a) => `"${a.word}" answers "${questionMap[a.type]}" (adverb of ${a.type}).`).join(" "),
    };
  },
};
