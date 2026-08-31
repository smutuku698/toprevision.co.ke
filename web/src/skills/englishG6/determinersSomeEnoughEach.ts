import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

// Countable/uncountable nouns for scenario sentences, per the theme's own determiner set.
const COUNTABLE = ["mango", "book", "pencil", "goat", "chair", "orange", "chicken", "student", "cup", "basket"];
const UNCOUNTABLE = ["water", "milk", "sugar", "rice", "advice", "information", "flour", "sand", "maize", "porridge"];

type DeterminerKey = "some" | "enough" | "each" | "a lot of";
const DETERMINERS: { id: DeterminerKey; usage: "countable-plural" | "countable-singular" | "both" | "uncountable-or-plural"; explanation: string }[] = [
  { id: "some", usage: "both", explanation: "\"some\" is used with plural countable nouns or uncountable nouns to mean an unspecified amount." },
  { id: "enough", usage: "both", explanation: "\"enough\" is used with countable plural nouns or uncountable nouns to mean a sufficient amount." },
  { id: "each", usage: "countable-singular", explanation: "\"each\" is used with a singular countable noun to refer to every one individually." },
  { id: "a lot of", usage: "both", explanation: "\"a lot of\" is used with plural countable nouns or uncountable nouns to mean a large amount." },
];

// 30+ Kenyan-context sentence pairs, one per determiner-noun combination, covering countable and
// uncountable use — the theme's own core outcome ("identify/use determiners correctly").
type SentenceItem = { determiner: DeterminerKey; noun: string; nounForm: string; sentence: (n: string, p: string) => string };
const SENTENCES: SentenceItem[] = [
  { determiner: "some", noun: "water", nounForm: "water", sentence: (n) => `${n} poured ___ water into the jerrycan.` },
  { determiner: "some", noun: "mangoes", nounForm: "mangoes", sentence: (n) => `${n} picked ___ mangoes from the tree.` },
  { determiner: "some", noun: "milk", nounForm: "milk", sentence: (n) => `The farmer sold ___ milk at the market.` },
  { determiner: "some", noun: "books", nounForm: "books", sentence: (n) => `${n} borrowed ___ books from the school library.` },
  { determiner: "some", noun: "sugar", nounForm: "sugar", sentence: () => `Please add ___ sugar to the tea.` },
  { determiner: "some", noun: "goats", nounForm: "goats", sentence: (n, p) => `${n} keeps ___ goats on the farm near ${p}.` },
  { determiner: "some", noun: "rice", nounForm: "rice", sentence: () => `There is ___ rice left in the sack.` },
  { determiner: "some", noun: "chairs", nounForm: "chairs", sentence: () => `We need ___ chairs for the visitors.` },
  { determiner: "enough", noun: "water", nounForm: "water", sentence: () => `Is there ___ water for everyone in the family?` },
  { determiner: "enough", noun: "pencils", nounForm: "pencils", sentence: (n) => `${n} did not have ___ pencils for the whole class.` },
  { determiner: "enough", noun: "flour", nounForm: "flour", sentence: () => `We don't have ___ flour to bake the bread.` },
  { determiner: "enough", noun: "oranges", nounForm: "oranges", sentence: (n) => `${n} bought ___ oranges to share with friends.` },
  { determiner: "enough", noun: "information", nounForm: "information", sentence: () => `The report did not give ___ information about the project.` },
  { determiner: "enough", noun: "cups", nounForm: "cups", sentence: () => `There are not ___ cups for all the guests.` },
  { determiner: "enough", noun: "maize", nounForm: "maize", sentence: (n, p) => `Farmers near ${p} harvested ___ maize this season.` },
  { determiner: "each", noun: "student", nounForm: "student", sentence: () => `___ student received a new exercise book.` },
  { determiner: "each", noun: "chicken", nounForm: "chicken", sentence: () => `___ chicken in the coop was fed separately.` },
  { determiner: "each", noun: "basket", nounForm: "basket", sentence: () => `___ basket was checked for ripe mangoes before selling.` },
  { determiner: "each", noun: "goat", nounForm: "goat", sentence: (n) => `${n} named ___ goat on the farm.` },
  { determiner: "each", noun: "chair", nounForm: "chair", sentence: () => `___ chair in the hall was arranged neatly.` },
  { determiner: "each", noun: "pencil", nounForm: "pencil", sentence: () => `___ pencil was sharpened before the exam.` },
  { determiner: "each", noun: "book", nounForm: "book", sentence: () => `___ book on the shelf was labelled with its subject.` },
  { determiner: "a lot of", noun: "sand", nounForm: "sand", sentence: () => `The river carried ___ sand downstream after the rains.` },
  { determiner: "a lot of", noun: "students", nounForm: "students", sentence: (n, p) => `___ students from ${p} attended the science fair.` },
  { determiner: "a lot of", noun: "advice", nounForm: "advice", sentence: (n) => `${n} received ___ advice from the elders before the exam.` },
  { determiner: "a lot of", noun: "porridge", nounForm: "porridge", sentence: () => `The cook prepared ___ porridge for the whole class.` },
  { determiner: "a lot of", noun: "oranges", nounForm: "oranges", sentence: (n) => `${n} grows ___ oranges in the family orchard.` },
  { determiner: "a lot of", noun: "water", nounForm: "water", sentence: () => `The heavy rain left ___ water in the fields.` },
  { determiner: "a lot of", noun: "chairs", nounForm: "chairs", sentence: () => `There were ___ chairs stacked in the storeroom.` },
  { determiner: "some", noun: "cups", nounForm: "cups", sentence: () => `The host set out ___ cups for tea.` },
  { determiner: "enough", noun: "goats", nounForm: "goats", sentence: (n) => `${n} did not have ___ goats to sell at the market.` },
  { determiner: "a lot of", noun: "information", nounForm: "information", sentence: () => `The teacher gave ___ information about the new topic.` },
];

export const determinersSomeEnoughEach: Skill = {
  id: "g6-eng-grammar-determiners",
  code: "G.1",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Determiners: some, enough, each, a lot of",
  description: "Identify and use the determiners some, enough, each and a lot of correctly with countable and uncountable nouns.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-correct-sentence", "categorize-usage", "click-match-meaning", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, SENTENCES);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: "Fill in the blank with the correct determiner (some / enough / each / a lot of).",
        before,
        after,
        correctAnswer: item.determiner,
        inputMode: "text",
        hint: `The noun "${item.noun}" needs a determiner that fits its meaning in this sentence.`,
        explanation: `"${item.determiner}" is correct here — ${DETERMINERS.find((d) => d.id === item.determiner)!.explanation}`,
      };
    }

    if (branch === "mc-correct-sentence") {
      const item = randChoice(rng, SENTENCES);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const wrongOptions = DETERMINERS.filter((d) => d.id !== item.determiner).map((d) => d.id);
      const distractors = shuffle(rng, wrongOptions).slice(0, 3);
      const choices = shuffle(rng, [item.determiner, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which determiner correctly completes this sentence?\n"${full.replace("___", "____")}"`,
        choices,
        correctIndex: choices.indexOf(item.determiner),
        layout: "row",
        hint: "Check whether the noun is countable (singular/plural) or uncountable.",
        explanation: `"${item.determiner}" is correct — ${DETERMINERS.find((d) => d.id === item.determiner)!.explanation}`,
      };
    }

    if (branch === "categorize-usage") {
      const pool = shuffle(rng, SENTENCES).slice(0, 8);
      const items = pool.map((s, i) => ({ id: `n-${i}`, label: s.noun }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((s, i) => {
        correctBucket[`n-${i}`] = UNCOUNTABLE.includes(s.noun) ? "uncountable" : "countable";
      });
      return {
        kind: "categorize",
        prompt: "Sort each noun: is it COUNTABLE (can be counted, has a plural), or UNCOUNTABLE (cannot be counted individually)?",
        items,
        buckets: [
          { id: "countable", label: "Countable" },
          { id: "uncountable", label: "Uncountable" },
        ],
        correctBucket,
        hint: "Ask yourself: can you say 'one ___, two ___'? If yes, it's countable.",
        explanation: `Countable nouns like ${COUNTABLE.slice(0, 3).join(", ")} can be counted one by one. Uncountable nouns like ${UNCOUNTABLE.slice(0, 3).join(", ")} are measured, not counted.`,
      };
    }

    if (branch === "click-match-meaning") {
      const tokens = shuffle(rng, DETERMINERS.map((d) => ({ id: d.id, label: d.id })));
      const meanings: Record<DeterminerKey, string> = {
        some: "an unspecified amount of something",
        enough: "a sufficient amount for a need",
        each: "every one individually, one at a time",
        "a lot of": "a large amount of something",
      };
      const targets = shuffle(rng, DETERMINERS.map((d) => ({ id: d.id, label: meanings[d.id] })));
      const correctMap: Record<string, string> = {};
      for (const d of DETERMINERS) correctMap[d.id] = d.id;
      return {
        kind: "click-match",
        prompt: "Match each determiner to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what quantity each determiner suggests.",
        explanation: DETERMINERS.map((d) => `"${d.id}" means ${meanings[d.id]}.`).join(" "),
      };
    }

    const item = randChoice(rng, SENTENCES);
    const name = randChoice(rng, KENYAN_NAMES);
    const place = randChoice(rng, KENYAN_PLACES);
    const full = item.sentence(name, place).replace("___", item.determiner);
    const words = full.replace(".", "").split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct sentence with the determiner in the right place.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `The determiner "${item.determiner}" comes directly before the noun it describes.`,
      explanation: `The correct sentence is: "${cap(full)}"`,
    };
  },
};
