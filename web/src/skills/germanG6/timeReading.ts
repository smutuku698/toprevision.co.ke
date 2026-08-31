import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { HOLIDAY_VOCAB, MONTHS, name, umlautAccepted } from "./shared";

// Reading strand, Theme 4: Time (months of the year) — guided reading/comprehension of short texts
// about the school calendar, seasons, and holidays, drawn from MONTHS and HOLIDAY_VOCAB.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string, m1: { word: string; meaning: string }, m2: { word: string; meaning: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, m1, m2) => ({
    lines: [`${a}: Wann sind die Schulferien?`, `${b}: Die Sommerferien beginnen im ${m1.word}.`, `${a}: Und wann beginnt die Schule wieder?`, `${b}: Die Schule beginnt wieder im ${m2.word}.`, `${a}: Danke! Ich freue mich auf die Ferien.`, `${b}: Ich auch!`],
    qa: [
      { q: `When do the summer holidays begin, according to ${b}?`, correct: m1.word, distractors: [m2.word, "Januar", "Der Text sagt es nicht"], explanation: `${b} says "Die Sommerferien beginnen im ${m1.word}."` },
      { q: "When does school start again?", correct: m2.word, distractors: [m1.word, "Dezember", "Der Text sagt es nicht"], explanation: `${b} says "Die Schule beginnt wieder im ${m2.word}."` },
      { q: `How does ${a} feel about the holidays?`, correct: "Excited / looking forward to them (freut sich)", distractors: ["Worried", "Bored", "The passage does not say"], explanation: `${a} says "Ich freue mich auf die Ferien."` },
    ],
  }),
  (a, b, m1, m2) => ({
    lines: [`${a}: Wann ist Weihnachten?`, `${b}: Weihnachten ist im Dezember.`, `${a}: Und wann sind die Osterferien?`, `${b}: Die Osterferien sind im ${m1.word}.`, `${a}: Mein Geburtstag ist im ${m2.word}.`, `${b}: Alles Gute im Voraus!`],
    qa: [
      { q: "In which month is Christmas, according to the passage?", correct: "Dezember", distractors: [m1.word, m2.word, "Der Text sagt es nicht"], explanation: `${b} says "Weihnachten ist im Dezember."` },
      { q: "When are the Easter holidays?", correct: m1.word, distractors: ["Dezember", m2.word, "Der Text sagt es nicht"], explanation: `${b} says "Die Osterferien sind im ${m1.word}."` },
      { q: `In which month is ${a}'s birthday?`, correct: m2.word, distractors: ["Dezember", m1.word, "Der Text sagt es nicht"], explanation: `${a} says "Mein Geburtstag ist im ${m2.word}."` },
    ],
  }),
  (a, b, m1, m2) => ({
    lines: [`${a}: Welcher Monat ist das erste Schulterm?`, `${b}: Das erste Schulterm beginnt im ${m1.word}.`, `${a}: Und der zweite Monat des Jahres?`, `${b}: Das ist Februar.`, `${a}: Wann feiern wir Neujahr?`, `${b}: Neujahr ist im Januar.`],
    qa: [
      { q: "When does the first school term begin, according to the passage?", correct: m1.word, distractors: ["Februar", "Januar", "Der Text sagt es nicht"], explanation: `${b} says "Das erste Schulterm beginnt im ${m1.word}."` },
      { q: "Which month is named as the second month of the year?", correct: "Februar", distractors: ["Januar", m1.word, "März"], explanation: `${b} says "Das ist Februar."` },
      { q: "In which month is New Year celebrated?", correct: "Januar", distractors: ["Dezember", "Februar", m2.word], explanation: `${b} says "Neujahr ist im Januar."` },
    ],
  }),
  (a, b, m1, m2) => ({
    lines: [`${a}: Wie viele Monate hat ein Jahr?`, `${b}: Ein Jahr hat zwölf Monate.`, `${a}: Welcher Monat kommt nach ${m1.word}?`, `${b}: Nach ${m1.word} kommt ${m2.word}.`, `${a}: Und wann sind die Weihnachtsferien?`, `${b}: Die Weihnachtsferien sind im Dezember.`],
    qa: [
      { q: "How many months does a year have, according to the passage?", correct: "Twelve (zwölf)", distractors: ["Ten (zehn)", "Eleven (elf)", "The passage does not say"], explanation: `${b} says "Ein Jahr hat zwölf Monate."` },
      { q: `Which month comes right after ${m1.word}, according to the passage?`, correct: m2.word, distractors: [m1.word, "Dezember", "Januar"], explanation: `${b} says "Nach ${m1.word} kommt ${m2.word}."` },
      { q: "When are the Christmas holidays?", correct: "Dezember", distractors: [m1.word, m2.word, "Januar"], explanation: `${b} says "Die Weihnachtsferien sind im Dezember."` },
    ],
  }),
  (a, b, m1, m2) => ({
    lines: [`${a}: Was ist dein Lieblingsmonat?`, `${b}: Mein Lieblingsmonat ist ${m1.word}, wegen der Ferien.`, `${a}: Meiner ist ${m2.word}, wegen meines Geburtstags.`, `${b}: Wann sind die Osterferien genau?`, `${a}: Ostern und die Osterferien sind im April.`, `${b}: Ich mag den Frühling!`],
    qa: [
      { q: `Why does ${b} like ${m1.word}, according to the passage?`, correct: "Because of the holidays (wegen der Ferien)", distractors: ["Because of a birthday", "Because of Christmas", "The passage does not say"], explanation: `${b} says "Mein Lieblingsmonat ist ${m1.word}, wegen der Ferien."` },
      { q: `Why does ${a} like ${m2.word}?`, correct: "Because of their birthday (wegen des Geburtstags)", distractors: ["Because of the holidays", "Because of Christmas", "The passage does not say"], explanation: `${a} says "Meiner ist ${m2.word}, wegen meines Geburtstags."` },
      { q: "In which month are Easter and the Easter holidays, according to the passage?", correct: "April", distractors: ["Dezember", m1.word, m2.word], explanation: `${a} says "Ostern und die Osterferien sind im April."` },
    ],
  }),
];

const MATCH_POOL = MONTHS.map((m) => ({ word: m.word, meaning: m.meaning }));

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  ...MONTHS.slice(0, 6).map((m) => ({ before: `In a reading text, month number ${m.order} of the year is written as `, after: ".", correct: m.word })),
  { before: "In a reading text, 'Christmas' is written as ", after: ".", correct: "Weihnachten" },
  { before: "'Easter' appears in reading texts as ", after: ".", correct: "Ostern" },
  { before: "The general word for 'school holidays' reads as ", after: ".", correct: "Schulferien" },
  { before: "'Easter holidays' is written as ", after: " in the passage.", correct: "Osterferien" },
  { before: "'Summer holidays' reads as ", after: " in a time passage.", correct: "Sommerferien" },
  { before: "'Christmas holidays' is written as ", after: " in the reading text.", correct: "Weihnachtsferien" },
  { before: "'New Year' reads as ", after: " in the passage.", correct: "Neujahr" },
  { before: "'Birthday' appears in the passage as ", after: ".", correct: "der Geburtstag" },
];

const MATCH_OPENERS = [
  "Match each time word from the passage to its meaning.",
  "Which meaning goes with which German month or holiday word?",
  "Pair each time word with its correct English meaning.",
  "Match the German word to what it means.",
  "Connect each month or holiday word to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about the order months fall in.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing time word.",
  "Complete the sentence with the correct German word.",
  "What word completes this sentence about time?",
  "Fill the gap correctly.",
  "Complete this reading fact about months and holidays.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the time passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this conversation about time correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " One question about dates is asked after another.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each word: Month or Holiday/Celebration?",
  "Group these time words by what kind of word they are.",
  "Sort each word into the category it belongs to.",
  "Classify each word from the reading text.",
  "Which category best fits each time word?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about whether the word names a month or a celebration.",
  " Reread the passage above if you need a reminder.",
  " Months name a time of year; holidays name a celebration.",
];

export const timeReading: Skill = {
  id: "g6-de-r-time",
  code: "R.4",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Guided reading: time (months of the year)",
  description: "Read and comprehend short German passages about months, seasons, and school holidays, recognise time vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const m1 = randChoice(rng, MONTHS);
    let m2 = randChoice(rng, MONTHS);
    while (m2.word === m1.word) m2 = randChoice(rng, MONTHS);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, m1, m2);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        passage,
        prompt: `${randChoice(rng, MATCH_OPENERS)}${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above — each word appears in context there.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: `${randChoice(rng, FILL_OPENERS)}${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Use the passage above as a reminder of how each word is used.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)}${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "The passage moves from one question about dates to the next.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const monthItems = shuffle(rng, [...MONTHS]).slice(0, 3).map((m) => ({ word: m.word, kind: "Month" as const }));
      const holidayItems = shuffle(rng, [...HOLIDAY_VOCAB]).slice(0, 3).map((h) => ({ word: h.word, kind: "Holiday/Celebration" as const }));
      const chosen = shuffle(rng, [...monthItems, ...holidayItems]);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.kind));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Month", label: "Month" },
          { id: "Holiday/Celebration", label: "Holiday/Celebration" },
        ],
        correctBucket,
        hint: "Months name a time of the year; holidays name a celebration or break.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.kind.toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, Array.from(new Set([qa.correct, ...qa.distractors])));
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
