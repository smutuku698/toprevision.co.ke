import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { MONTHS, name, place, umlautAccepted } from "./shared";

// LS.4 Time (months of the year) and holidays — oral month vocabulary and school-holiday terms
// practised through matching, sorting, fill-in, a narrated-year ordering task, reasoning about
// seasons/holidays, and a dedicated chronological month-ordering drill for saying months aloud in order.

const MATCH_OPENERS = ["Match each German month", "Pair every month word", "Connect each vocabulary item", "Link each month below", "Match the German term", "Join each month word"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each word", "Group these German words", "Classify each holiday term", "Decide where each word belongs", "Organise the words below", "Put each word"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the year's events", "Order the sentences", "Sequence this year", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally happen.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const MONTH_ORDER_OPENERS = ["Arrange these German months", "Order these month words", "Put these months", "Sequence these German months", "Sort these month words", "Line up these months"];
const MONTH_ORDER_CLOSERS = ["in the order they appear in the year.", "from earliest to latest in the year.", "the way you would say them in order.", "in calendar order.", "in the correct calendar sequence."];

type Bucket = "Festival or celebration" | "School holiday period";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "Weihnachten", bucket: "Festival or celebration" },
  { word: "Ostern", bucket: "Festival or celebration" },
  { word: "Neujahr", bucket: "Festival or celebration" },
  { word: "der Geburtstag", bucket: "Festival or celebration" },
  { word: "Schulferien", bucket: "School holiday period" },
  { word: "Osterferien", bucket: "School holiday period" },
  { word: "Sommerferien", bucket: "School holiday period" },
  { word: "Weihnachtsferien", bucket: "School holiday period" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'January' in German is ", after: ".", correct: "Januar" },
  { before: "'February' in German is ", after: ".", correct: "Februar" },
  { before: "'March' in German is ", after: ".", correct: "März" },
  { before: "'June' in German is ", after: ".", correct: "Juni" },
  { before: "'August' in German is ", after: ".", correct: "August" },
  { before: "'December' in German is ", after: ".", correct: "Dezember" },
  { before: "'Christmas' in German is ", after: ".", correct: "Weihnachten" },
  { before: "'Easter' in German is ", after: ".", correct: "Ostern" },
  { before: "'School holidays' in German is ", after: ".", correct: "Schulferien" },
  { before: "'Easter holidays' in German is ", after: ".", correct: "Osterferien" },
  { before: "'Summer holidays' in German is ", after: ".", correct: "Sommerferien" },
  { before: "'Birthday' in German is ", after: ".", correct: "der Geburtstag" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Neujahr ist im Januar. (New Year is in January)", "Mein Geburtstag ist im Juni. (my birthday is in June)", "Die Sommerferien beginnen im August. (summer holidays start in August)", "Weihnachten ist im Dezember. (Christmas is in December)"] },
  { lines: ["Die Schule beginnt im Januar. (school starts in January)", "Die Osterferien sind im April. (Easter holidays are in April)", "Die Sommerferien sind im August. (summer holidays are in August)", "Die Weihnachtsferien sind im Dezember. (Christmas holidays are in December)"] },
  { lines: ["Ostern ist im März oder April. (Easter is in March or April)", "Die Osterferien folgen danach. (the Easter holidays follow after)", "Die Sommerferien kommen im August. (summer holidays come in August)", "Weihnachten kommt am Ende des Jahres. (Christmas comes at the end of the year)"] },
  { lines: ["Der erste Monat ist Januar. (the first month is January)", "Der sechste Monat ist Juni. (the sixth month is June)", "Der zehnte Monat ist Oktober. (the tenth month is October)", "Der letzte Monat ist Dezember. (the last month is December)"] },
  { lines: ["Mein Geburtstag ist im Mai. (my birthday is in May)", "Meine Schwester hat im September Geburtstag. (my sister's birthday is in September)", "Wir feiern Weihnachten im Dezember. (we celebrate Christmas in December)", "Wir feiern Neujahr im Januar. (we celebrate New Year in January)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} says "Mein Geburtstag ist im August." What is ${n} doing?`,
    correct: "stating when their birthday is",
    distractors: ["stating a school holiday", "asking about a friend's birthday", "naming a festival"],
    explanation: `"Mein Geburtstag ist im ..." states when the speaker's own birthday falls, not a holiday or festival.`,
  }),
  (n, p) => ({
    prompt: `A classmate in ${p} asks ${n}, "Wann sind die Schulferien?" What is being asked?`,
    correct: "when the school holidays are",
    distractors: ["what month it is now", "when Christmas is", "when someone's birthday is"],
    explanation: `"Wann sind die Schulferien?" specifically asks about school holidays in general, not a specific date or festival.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Die Sommerferien sind im August." What is ${n} describing?`,
    correct: "when the summer holidays fall",
    distractors: ["when the Easter holidays fall", "when Christmas falls", "when school starts"],
    explanation: `"Sommerferien" specifically means summer holidays, distinct from "Osterferien" (Easter holidays).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Weihnachten ist im Dezember." What festival is being placed in December?`,
    correct: "Christmas",
    distractors: ["Easter", "New Year", "a birthday"],
    explanation: `"Weihnachten" means Christmas — "Neujahr" (New Year) would be a different word for a different date.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Ostern ist im März oder April." What festival is being described?`,
    correct: "Easter",
    distractors: ["Christmas", "New Year", "the school holidays in general"],
    explanation: `"Ostern" means Easter — it falls around March or April, unlike "Weihnachten" (Christmas) in December.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} asks a friend "Welcher Monat ist es?" What is ${n} asking?`,
    correct: "what month it currently is",
    distractors: ["what the friend's birthday month is", "when the holidays start", "what the friend's name is"],
    explanation: `"Welcher Monat ist es?" asks for the current month, not a birthday or holiday.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Mein Lieblingsmonat ist Dezember, wegen Weihnachten." What is ${n} explaining?`,
    correct: "their favourite month, and why",
    distractors: ["the coldest month of the year", "when school ends", "a friend's birthday"],
    explanation: `"Mein Lieblingsmonat ist ..., wegen ..." gives a favourite month and the reason for it.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Die Osterferien sind kurz, aber die Sommerferien sind lang." What is being compared?`,
    correct: "the length of two different holiday periods",
    distractors: ["two different birthdays", "two different months", "two different festivals"],
    explanation: `This compares "Osterferien" (Easter holidays) and "Sommerferien" (summer holidays) by length, not two festivals.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Neujahr ist am ersten Januar." What is ${n} stating?`,
    correct: "when New Year falls",
    distractors: ["when Christmas falls", "when the school year starts", "when their birthday is"],
    explanation: `"Neujahr ist am ersten Januar" means "New Year is on the first of January" — a specific festival date.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Nach den Sommerferien beginnt die Schule wieder." What is ${n} describing?`,
    correct: "school restarting after the summer holidays",
    distractors: ["a birthday happening after summer", "Christmas happening after summer", "the Easter holidays starting"],
    explanation: `"Nach den Sommerferien beginnt die Schule wieder" means school starts again after the summer holidays.`,
  }),
];

export const timeSpeaking: Skill = {
  id: "g6-de-ls-time",
  code: "LS.4",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Time (Months of the Year) and Holidays",
  description: "Speak and recognise German months of the year and holiday vocabulary — matching, sorting, fill-in, a narrated-year ordering task, reasoning about seasons and school holidays, and saying the months aloud in chronological order.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "monthOrder"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, MONTHS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Many German month names look similar to their English equivalents.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Festival or celebration", label: "Festival or celebration" },
          { id: "School holiday period", label: "School holiday period" },
        ],
        correctBucket,
        hint: "Festivals are single-day celebrations; 'ferien' words are stretches of time off school.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Recall the German month or holiday word with this meaning.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Think about which month or event happens earlier in the year.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Check whether the sentence names a festival, a holiday period, or a specific date.",
        explanation: q.explanation,
      };
    }

    const windowSize = randChoice(rng, [4, 5] as const);
    const start = randInt(rng, 0, MONTHS.length - windowSize);
    const windowMonths = MONTHS.slice(start, start + windowSize);
    const items = shuffle(rng, windowMonths.map((v) => ({ id: `m${v.order}`, label: v.word })));
    return {
      kind: "ordering",
      prompt: `${randChoice(rng, MONTH_ORDER_OPENERS)} ${randChoice(rng, MONTH_ORDER_CLOSERS)}`,
      instruction: "Click the months in calendar order.",
      items,
      correctOrder: windowMonths.map((v) => `m${v.order}`),
      hint: "Say the months aloud in order, starting from Januar.",
      explanation: `In calendar order: ${windowMonths.map((v) => v.word).join(", ")}.`,
    };
  },
};
