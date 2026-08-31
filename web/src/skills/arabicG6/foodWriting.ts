import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FOOD_VOCAB, name, place } from "./shared";

// Sub-strand 3.6 Guided Writing: Sentences — Theme: Food and Drinks.
// Content: construct simple sentences with descriptive food words, sentences from a substitution
// table, jumbled sentences rearranged into a paragraph.

const DESCRIPTIVE_WORDS: { word: string; meaning: string }[] = [
  { word: "ladhidh", meaning: "delicious" },
  { word: "taazij", meaning: "fresh" },
  { word: "haar", meaning: "spicy / hot" },
  { word: "hulw", meaning: "sweet" },
  { word: "haamid", meaning: "sour" },
  { word: "mumtaaz", meaning: "excellent" },
  { word: "saakhin", meaning: "hot (temperature)" },
  { word: "baarid", meaning: "cold (temperature)" },
];

const DESCRIPTIVE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "Which word would best describe honey when writing a sentence about it?", correct: "hulw (sweet)", distractors: ["haar (spicy)", "haamid (sour)", "baarid (cold)"], explanation: "'hulw' (sweet) accurately describes honey's taste." },
  { q: "Which descriptive word best fits a sentence about fresh mangoes?", correct: "taazij (fresh)", distractors: ["saakhin (hot)", "haamid (sour, when describing ripe mango)", "mumtaaz used without any food reference"], explanation: "'taazij' (fresh) is the natural descriptive word for describing produce like fruit." },
  { q: "A sentence says 'shurb al-shay ___ jiddan' (the tea is very ___). Which word fits if the tea just came off the stove?", correct: "saakhin (hot)", distractors: ["baarid (cold)", "hulw (sweet, ignoring temperature)", "taazij (fresh, which doesn't describe temperature)"], explanation: "'saakhin' describes temperature — the correct choice for tea that just came off the stove." },
  { q: "Why should you use a descriptive word like 'ladhidh' in a food sentence instead of leaving it out?", correct: "it adds detail that tells the reader how the food tastes or feels", distractors: ["it makes the sentence shorter", "it changes the food into a different food", "descriptive words are never needed in writing"], explanation: "Descriptive words give the reader more specific detail about the food being described." },
  { q: "Which pair of words could both correctly describe the SAME cup of tea at different points?", correct: "saakhin (hot) then baarid (cold), as it cools down", distractors: ["hulw (sweet) and haamid (sour) at the exact same moment", "taazij (fresh) and mumtaaz used to mean weight", "haar (spicy) used to mean the colour of tea"], explanation: "Temperature words can both apply to the same object over time, unlike contradictory taste words at once." },
];

const PARAGRAPH_SETS: ((n: string, p: string) => { sentences: string[] })[] = [
  (n, p) => ({
    sentences: [
      `${n} yuhibbu al-ta'aam al-ladhidh fi ${p}.`,
      `Kulla sabah, ya'kulu al-khubz ma'a al-asal.`,
      `Fi al-dhuhr, ya'kulu al-ruzz ma'a al-khudra.`,
      `Masaa'an, yashrabu kubbat shay saakhin.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Umm ${n} tatbakhu ta'aman taazijan fi ${p}.`,
      `Tashtari al-fawakih min al-suq kulla usbu'.`,
      `Tuhaddiru al-'ashaa ma'a al-lahm wa al-samak.`,
      `Al-'a'ila ta'kulu ma'an kulla masaa'.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `${n} yaktubu qa'imat al-ta'aam al-mufaddal fi ${p}.`,
      `Al-ruzz al-mumtaaz fi al-marataba al-oula.`,
      `Al-fawakih al-taazija fi al-marataba al-thaniya.`,
      `Al-chips laysa fi al-qa'ima abadan.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Madrasat ${n} fi ${p} tuqaddimu wajbat ghida' saha.`,
      `Al-talamidh ya'kuluna al-khudra wa al-fawakih.`,
      `Al-mu'allima tashjji'u al-akl al-saha.`,
      `${n} yuhibbu al-wajba al-jadida kulla yawm.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Fi ${p}, ${n} yasna'u 'asir fawakih taazij.`,
      `Yaqta'u al-fawakih al-hulwa awwalan.`,
      `Yakhlituha ma'a qaleel min al-maa al-baarid.`,
      `${n} yashrabu al-'asir ba'da al-riyada.`,
    ],
  }),
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'They eat' in a food-writing sentence is written as ", after: ".", correct: "ya'kuluna" },
  { before: "'Delicious' in Arabic is ", after: ".", correct: "ladhidh" },
  { before: "'Fresh' in Arabic is ", after: ".", correct: "taazij" },
  { before: "'Sweet' in Arabic is ", after: ".", correct: "hulw" },
  { before: "'A meal' in Arabic is ", after: ".", correct: "wajba" },
  { before: "'At noon' in Arabic is ", after: ".", correct: "fi al-dhuhr" },
  { before: "'In the evening' in Arabic is ", after: ".", correct: "masaa'an" },
  { before: "'They cook' in Arabic is ", after: ".", correct: "yatbakhuna" },
];

export const foodWriting: Skill = {
  id: "g6-ar-w-food",
  code: "W.6",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: sentences (food and drinks)",
  description: "Construct simple sentences using descriptive food words, and rearrange jumbled sentences into a coherent paragraph about food and drinks.",
  generate(rng) {
    const branch = randChoice(rng, ["ordering", "descriptive", "fill", "match", "categorize"] as const);

    if (branch === "ordering") {
      const n = name(rng);
      const p = place(rng);
      const set = randChoice(rng, PARAGRAPH_SETS)(n, p);
      const withIds = set.sentences.map((s, i) => ({ id: `${i}-${s}`, label: s }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange these jumbled sentences into a well-sequenced paragraph.",
          "Put these sentences in the order that makes a coherent paragraph.",
          "Sequence these sentences to form a logical paragraph about food.",
          "Rearrange the jumbled sentences into the correct paragraph order.",
          "Which order turns these sentences into a clear paragraph?",
        ]),
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Follow the natural order of a day: morning, noon, evening — or a list from first to last.",
        explanation: `A well-sequenced paragraph reads:\n${set.sentences.join("\n")}`,
      };
    }

    if (branch === "descriptive") {
      const q = randChoice(rng, DESCRIPTIVE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about taste, temperature, and freshness words separately.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing word for your sentence.",
          "Complete the sentence with the correct Arabic word.",
          "What word completes this sentence correctly?",
          "Fill the gap with the correctly spelled word.",
          "Complete this food-writing fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the food vocabulary and descriptive words you've practised writing.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, DESCRIPTIVE_WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each descriptive food word to its meaning before using it in your writing.",
          "Match the word to what it means.",
          "Which meaning goes with which descriptive word?",
          "Pair each descriptive word with its correct meaning.",
          "Match each word to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Recall the descriptive vocabulary you've practised.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    const FOOD_CATEGORY: { word: string; type: "Drink" | "Solid food" }[] = FOOD_VOCAB.map((f) => ({
      word: f.word,
      type: (["laban", "maa", "shay", "qahwa"].includes(f.word) ? "Drink" : "Solid food") as "Drink" | "Solid food",
    }));
    const chosen2 = shuffle(rng, FOOD_CATEGORY).slice(0, 7);
    const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing, sort each word: Drink, or Solid food?",
        "Group these words the way you would plan a paragraph.",
        "Sort each food/drink word into the correct category.",
        "Classify each word before using it in your writing.",
        "Which category does each word belong to?",
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
  },
};
