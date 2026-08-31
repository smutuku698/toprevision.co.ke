import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FAMILY_VOCAB, name, place } from "./shared";

// Sub-strand 2.2 Reading for Comprehension — Theme: Family.
// Content: picking out target vocabulary from a reading text, inferring meaning of words from
// context, building a vocabulary bank on nuclear family members.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `Usratii kabeera. (My family is big.)`,
      `Abi muhandis fi ${p}. (My father is an engineer in ${p}.)`,
      `Ummi tudarrisu fi madrasa. (My mother teaches at a school.)`,
      `Li akh wahid wa ukht wahida. (I have one brother and one sister.)`,
      `${n} yuhibbu usratahu jiddan. (${n} loves his/her family very much.)`,
    ],
    qa: [
      { q: "What does 'usratii' mean, based on the passage?", correct: "my family", distractors: ["my school", "my brother", "my job"], explanation: "'usratii kabeera' means 'my family is big' — 'usratii' means 'my family'." },
      { q: `Where does the father work, according to the passage?`, correct: p, distractors: ["Nairobi", "the school", "the passage does not say"], explanation: `The passage says "abi muhandis fi ${p}" — my father is an engineer in ${p}.` },
      { q: "How many siblings does the narrator have?", correct: "two (one brother, one sister)", distractors: ["one", "three", "none"], explanation: "'Li akh wahid wa ukht wahida' means 'I have one brother and one sister' — two siblings total." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaskunu maa jaddihi wa jaddatihi fi ${p}. (${n} lives with his grandfather and grandmother in ${p}.)`,
      `Jadduhu fallah, wa jaddatuhu tatbakhu jayyidan. (His grandfather is a farmer, and his grandmother cooks well.)`,
      `Ammuhu yazuruhum kulla usbou'. (His paternal uncle visits them every week.)`,
      `Al-usra tajtami'u maa'an fi al-masaa. (The family gathers together in the evening.)`,
    ],
    qa: [
      { q: `Who does ${n} live with, based on the passage?`, correct: "grandfather and grandmother", distractors: ["mother and father", "brother and sister", "an uncle only"], explanation: `"yaskunu maa jaddihi wa jaddatihi" means "lives with his grandfather and grandmother".` },
      { q: "What is the grandfather's occupation?", correct: "farmer", distractors: ["engineer", "teacher", "cook"], explanation: "'Jadduhu fallah' means 'his grandfather is a farmer'." },
      { q: "How often does the uncle visit, according to the passage?", correct: "every week", distractors: ["every day", "once a year", "the passage does not say"], explanation: "'kulla usbou'' means 'every week'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Usrat ${n} taskunu fi ${p}. (${n}'s family lives in ${p}.)`,
      `Lahu khaal yaskunu ba'eedan, wa khaala taskunu qareeban. (He has a maternal uncle living far away, and a maternal aunt living nearby.)`,
      `Ibnuhu al-sagheer yuhibbu al-li'b maa ${n}. (His young son loves playing with ${n}.)`,
      `Al-usra tatajamma'u fi 'utla nihayat al-usbou'. (The family gathers on weekend holidays.)`,
    ],
    qa: [
      { q: `Which relative of ${n}'s family lives far away?`, correct: "the maternal uncle (khaal)", distractors: ["the maternal aunt (khaala)", "the young son", "nobody — everyone lives nearby"], explanation: "'Lahu khaal yaskunu ba'eedan' means 'he has a maternal uncle living far away'." },
      { q: "Who lives nearby, according to the passage?", correct: "the maternal aunt (khaala)", distractors: ["the maternal uncle (khaal)", "the grandfather", "the passage does not say"], explanation: "'wa khaala taskunu qareeban' means 'and a maternal aunt lives nearby'." },
      { q: "When does the family gather, based on the passage?", correct: "on weekend holidays", distractors: ["every morning", "on Mondays", "only once a year"], explanation: "'fi 'utla nihayat al-usbou'' means 'on weekend holidays'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} lahu bint wahida wa ibn wahid. (${n} has one daughter and one son.)`,
      `Bintuhu tadrusu fi ${p}, wa ibnuhu saghir jiddan. (His daughter studies in ${p}, and his son is very young.)`,
      `Jaddatuhum tazuruhum kulla shahr. (Their grandmother visits them every month.)`,
      `Al-atfaal yuhibbuna jaddatahum kathiran. (The children love their grandmother a lot.)`,
    ],
    qa: [
      { q: `Where does ${n}'s daughter study, based on the passage?`, correct: p, distractors: ["at home", "the passage does not say", "with her grandmother"], explanation: `"Bintuhu tadrusu fi ${p}" means "his daughter studies in ${p}".` },
      { q: "How often does the grandmother visit, according to the passage?", correct: "every month", distractors: ["every day", "every week", "once a year"], explanation: "'kulla shahr' means 'every month'." },
      { q: "How do the children feel about their grandmother?", correct: "they love her a lot", distractors: ["they rarely see her", "they are afraid of her", "the passage does not say"], explanation: "'Al-atfaal yuhibbuna jaddatahum kathiran' means 'the children love their grandmother a lot'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Usrat ${n} kabeera wa sa'eeda. (${n}'s family is big and happy.)`,
      `Ammatuhu tadrusu al-tibb fi ${p}. (His paternal aunt studies medicine in ${p}.)`,
      `Akhuhu al-akbar ya'malu ma'a abihim. (His older brother works with their father.)`,
      `Kull usbou', al-usra tajtami'u li tanawul al-ta'am. (Every week, the family gathers to eat together.)`,
    ],
    qa: [
      { q: "What does the paternal aunt study, based on the passage?", correct: "medicine", distractors: ["engineering", "teaching", "farming"], explanation: "'Ammatuhu tadrusu al-tibb' means 'his paternal aunt studies medicine'." },
      { q: "Who does the older brother work with?", correct: "their father", distractors: ["their grandfather", "their uncle", "he works alone"], explanation: "'Akhuhu al-akbar ya'malu ma'a abihim' means 'his older brother works with their father'." },
      { q: "How often does the family gather to eat, according to the passage?", correct: "every week", distractors: ["every day", "once a year", "the passage does not say"], explanation: "'Kull usbou'' means 'every week'." },
    ],
  }),
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a family reading text, 'my family' is written as ", after: ".", correct: "usratii" },
  { before: "'His family' in a reading text appears as ", after: ".", correct: "usratuhu" },
  { before: "The reading-context word for 'they gather' is ", after: ".", correct: "yajtami'una" },
  { before: "'Every week' appears in family texts as ", after: ".", correct: "kulla usbou'" },
  { before: "'Every month' appears in family texts as ", after: ".", correct: "kulla shahr" },
  { before: "'Far away' appears in family texts as ", after: ".", correct: "ba'eedan" },
  { before: "'Nearby' appears in family texts as ", after: ".", correct: "qareeban" },
  { before: "'The children' appears in family texts as ", after: ".", correct: "al-atfaal" },
  { before: "'Big' (describing a family) appears as ", after: ".", correct: "kabeera" },
  { before: "'Happy' (describing a family) appears as ", after: ".", correct: "sa'eeda" },
];

export const familyReading: Skill = {
  id: "g6-ar-r-family",
  code: "R.2",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Reading for comprehension: family",
  description: "Read short passages about families, pick out family vocabulary, and infer meaning of new words from context.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, FAMILY_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p2) => ({ id: p2.word, label: p2.word })));
      const targets = shuffle(rng, chosen.map((p2) => ({ id: p2.word, label: p2.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p2 of chosen) correctMap[p2.word] = p2.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Match each family word to its meaning.",
          "From the vocabulary bank, match each word to its meaning.",
          "Which meaning goes with which family word?",
          "Pair each family term with its correct meaning.",
          "Match each word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Some of these words also appear in the passage above — use context to help.",
        explanation: chosen.map((p2) => `"${p2.word}" means "${p2.meaning}".`).join(" "),
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
          "Complete this vocabulary fact from the passage above.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the context words used to describe families in the passage.",
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
        hint: "The passage introduces the family first, then adds more detail.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const nuclear = new Set(["ab", "umm", "akh", "ukht", "ibn", "bint"]);
      const chosen2 = shuffle(rng, FAMILY_VOCAB).slice(0, 8);
      const items = chosen2.map((p2, i) => ({ id: `${i}-${p2.word}`, label: p2.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((p2, i) => (correctBucket[`${i}-${p2.word}`] = nuclear.has(p2.word) ? "Nuclear" : "Extended"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "While building your vocabulary bank, sort each word: Nuclear or Extended family?",
          "Group these family words by nuclear vs extended family.",
          "Which family group does each word belong to?",
          "Sort each family term into the correct category.",
          "Classify each vocabulary-bank word below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Nuclear", label: "Nuclear family" },
          { id: "Extended", label: "Extended family" },
        ],
        correctBucket,
        hint: "Nuclear family = parents, siblings, children. Extended family = grandparents, uncles, aunts.",
        explanation: chosen2.map((p2) => `"${p2.word}" (${p2.meaning}) is ${nuclear.has(p2.word) ? "nuclear" : "extended"} family.`).join(" "),
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
      hint: "Use context clues from the passage — infer meaning even if a word looks unfamiliar.",
      explanation: qa.explanation,
    };
  },
};
