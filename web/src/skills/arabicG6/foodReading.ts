import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FOOD_VOCAB, name, place } from "./shared";

// Sub-strand 2.6 Reading Aloud: Fluency — Theme: Food and Drinks.
// Content: identify familiar phrases in a food-preference text, recite short poems on food/drinks
// with expression.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `${n} yuhibbu al-ruzz kathiran fi ${p}. (${n} likes rice a lot in ${p}.)`,
      `Yakuluhu ma'a al-khudra kulla yawm. (He eats it with vegetables every day.)`,
      `Laa yuhibbu al-samak kathiran. (He doesn't like fish very much.)`,
      `Yashrabu al-laban kulla sabah. (He drinks milk every morning.)`,
    ],
    qa: [
      { q: `What does ${n} eat rice with, according to the passage?`, correct: "vegetables", distractors: ["fish", "bread", "the passage does not say"], explanation: "'ma'a al-khudra' means 'with vegetables'." },
      { q: `How does ${n} feel about fish, based on the passage?`, correct: "doesn't like it very much", distractors: ["loves it", "has never tried it", "the passage does not say"], explanation: "'Laa yuhibbu al-samak kathiran' means 'he doesn't like fish very much'." },
      { q: `When does ${n} drink milk, according to the passage?`, correct: "every morning", distractors: ["every evening", "once a week", "the passage does not say"], explanation: "'kulla sabah' means 'every morning'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Sadeeqat ${n} tuhibbu al-fawakih fi ${p}. (${n}'s friend likes fruits in ${p}.)`,
      `Ta'kulu al-fawakih ba'da al-madrasa. (She eats fruits after school.)`,
      `Tuhibbu al-asal ma'a al-khubz. (She likes honey with bread.)`,
      `Laa tashrabu al-qahwa, tafdilu al-shay. (She doesn't drink coffee, she prefers tea.)`,
    ],
    qa: [
      { q: "When does the friend eat fruits, according to the passage?", correct: "after school", distractors: ["before school", "at midnight", "the passage does not say"], explanation: "'ba'da al-madrasa' means 'after school'." },
      { q: "What does she like to eat honey with, based on the passage?", correct: "bread", distractors: ["rice", "fish", "the passage does not say"], explanation: "'ma'a al-khubz' means 'with bread'." },
      { q: "What does she prefer to drink instead of coffee?", correct: "tea", distractors: ["water", "milk", "the passage does not say"], explanation: "'tafdilu al-shay' means 'she prefers tea'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} wa a'ilatuhu yatanawaluna al-'ashaa ma'an fi ${p}. (${n} and his family eat dinner together in ${p}.)`,
      `Yakuluna al-lahm wa al-khudra. (They eat meat and vegetables.)`,
      `Umm ${n} tatbakhu ta'aman ladhidhan kulla masaa'. (${n}'s mother cooks delicious food every evening.)`,
      `Ba'da al-akl, yashrabuna al-shay ma'an. (After eating, they drink tea together.)`,
    ],
    qa: [
      { q: "What do they eat for dinner, according to the passage?", correct: "meat and vegetables", distractors: ["only rice", "only fish", "the passage does not say"], explanation: "'Yakuluna al-lahm wa al-khudra' means 'they eat meat and vegetables'." },
      { q: `When does ${n}'s mother cook, according to the passage?`, correct: "every evening", distractors: ["every morning", "once a week", "the passage does not say"], explanation: "'kulla masaa'' means 'every evening'." },
      { q: "What do they drink after eating, based on the passage?", correct: "tea", distractors: ["coffee", "milk", "the passage does not say"], explanation: "'yashrabuna al-shay' means 'they drink tea'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaqra'u qasida qaseera 'an al-ta'aam fi ${p}. (${n} reads a short poem about food in ${p}.)`,
      `Al-qasida tatahaddathu 'an al-khubz wa al-asal. (The poem talks about bread and honey.)`,
      `${n} yulqi al-qasida bisawt waadih wa ta'beer jayyid. (${n} recites the poem with a clear voice and good expression.)`,
      `Al-talamidh yusaffiquna ba'da al-qasida. (The students clap after the poem.)`,
    ],
    qa: [
      { q: "What does the poem talk about, according to the passage?", correct: "bread and honey", distractors: ["rice and fish", "milk and tea", "the passage does not say"], explanation: "'Al-qasida tatahaddathu 'an al-khubz wa al-asal' means 'the poem talks about bread and honey'." },
      { q: `How does ${n} recite the poem, according to the text?`, correct: "with a clear voice and good expression", distractors: ["very quietly", "too fast to understand", "the passage does not say"], explanation: `"${n} yulqi al-qasida bisawt waadih wa ta'beer jayyid" means "${n} recites the poem with a clear voice and good expression".` },
      { q: "What do the students do after the poem, based on the passage?", correct: "clap", distractors: ["leave the room", "start eating", "the passage does not say"], explanation: "'Al-talamidh yusaffiquna ba'da al-qasida' means 'the students clap after the poem'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaktubu 'an wajbatihi al-mufadalla fi ${p}. (${n} writes about his favourite meal in ${p}.)`,
      `Yuhibbu al-ruzz akthar min al-khubz. (He likes rice more than bread.)`,
      `Laa yuhibbu al-chips kathiran. (He doesn't like chips very much.)`,
      `Yashrabu al-maa ba'da kulla wajba. (He drinks water after every meal.)`,
    ],
    qa: [
      { q: `What does ${n} prefer, according to the passage?`, correct: "rice over bread", distractors: ["bread over rice", "chips over everything", "the passage does not say"], explanation: "'Yuhibbu al-ruzz akthar min al-khubz' means 'he likes rice more than bread'." },
      { q: "How does the passage describe his feeling about chips?", correct: "he doesn't like them very much", distractors: ["he loves them", "he has never tried them", "the passage does not say"], explanation: "'Laa yuhibbu al-chips kathiran' means 'he doesn't like chips very much'." },
      { q: "When does he drink water, according to the passage?", correct: "after every meal", distractors: ["before every meal", "only at night", "the passage does not say"], explanation: "'ba'da kulla wajba' means 'after every meal'." },
    ],
  }),
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'They eat' in a food reading text is written as ", after: ".", correct: "yakuluna" },
  { before: "'Every morning' in a food reading text is written as ", after: ".", correct: "kulla sabah" },
  { before: "'A meal' in a food reading text is written as ", after: ".", correct: "wajba" },
  { before: "'Delicious' in a food reading text is written as ", after: ".", correct: "ladhidh" },
  { before: "'They drink' in a food reading text is written as ", after: ".", correct: "yashrabuna" },
  { before: "'After' in a food reading text is written as ", after: ".", correct: "ba'da" },
  { before: "'A poem' in a food reading text is written as ", after: ".", correct: "qasida" },
  { before: "'They prefer' in a food reading text is written as ", after: ".", correct: "yufaddiluna" },
];

const MEAL_CATEGORY: { word: string; type: "Drink" | "Solid food" }[] = [
  { word: "laban", type: "Drink" }, { word: "maa", type: "Drink" }, { word: "shay", type: "Drink" }, { word: "qahwa", type: "Drink" },
  { word: "ruzz", type: "Solid food" }, { word: "khubz", type: "Solid food" }, { word: "lahm", type: "Solid food" }, { word: "samak", type: "Solid food" }, { word: "khudra", type: "Solid food" }, { word: "fawakih", type: "Solid food" }, { word: "bayd", type: "Solid food" },
];

export const foodReading: Skill = {
  id: "g6-ar-r-food",
  code: "R.6",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Reading aloud: fluency (food and drinks)",
  description: "Read short food-preference passages fluently with expression, and recognise familiar food vocabulary and short poems.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, FOOD_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Match each food/drink word to its meaning.",
          "Match the word from the passage's theme to its meaning.",
          "Which meaning goes with which food word?",
          "Pair each food word with its correct meaning.",
          "Match each word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above for context clues.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence with the correct word.",
          "What word completes this reading fact?",
          "Fill the gap correctly.",
          "Complete this vocabulary fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the food vocabulary used in the passage above.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Put these lines from the passage in the order they were written.",
          "Arrange the passage's lines in the correct reading order.",
          "Sequence this passage correctly.",
          "Order the lines as they appear in the passage.",
          "Which order makes this passage make sense?",
        ]),
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Read the passage above carefully to recall its order.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen2 = shuffle(rng, MEAL_CATEGORY).slice(0, 7);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "As you read, sort each word: Drink, or Solid food?",
          "Group these words by drink vs solid food.",
          "Which category does each word belong to?",
          "Sort each food/drink word into the correct category.",
          "Classify each food or drink word from the reading text.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Drink", label: "Drink" },
          { id: "Solid food", label: "Solid food" },
        ],
        correctBucket,
        hint: "Milk, water, tea, and coffee are drinks; the rest are solid foods.",
        explanation: chosen2.map((c) => `"${c.word}" is a ${c.type.toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, [qa.correct, ...qa.distractors]);
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
