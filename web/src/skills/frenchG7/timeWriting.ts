import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "day" | "event";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "lundi", meaning: "Monday", tag: "day" },
  { word: "mardi", meaning: "Tuesday", tag: "day" },
  { word: "mercredi", meaning: "Wednesday", tag: "day" },
  { word: "jeudi", meaning: "Thursday", tag: "day" },
  { word: "vendredi", meaning: "Friday", tag: "day" },
  { word: "samedi", meaning: "Saturday", tag: "day" },
  { word: "dimanche", meaning: "Sunday", tag: "day" },
  { word: "la date d'anniversaire", meaning: "the birthday", tag: "event" },
  { word: "le nouvel an", meaning: "New Year", tag: "event" },
  { word: "Noël", meaning: "Christmas", tag: "event" },
  { word: "les fêtes nationales", meaning: "national holidays", tag: "event" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Quelle est la ", after: " aujourd'hui ?", answer: "date", gloss: "Quelle est la date aujourd'hui ? — What is the date today?" },
  { before: "C'est ", after: " le quatre janvier.", answer: "lundi", gloss: "C'est lundi le quatre janvier. — It's Monday the fourth of January." },
  { before: "Noël, c'est le vingt-cinq ", after: ".", answer: "décembre", gloss: "Noël, c'est le vingt-cinq décembre. — Christmas is on the 25th of December." },
  { before: "Mon anniversaire est en ", after: ".", answer: "mai", gloss: "Mon anniversaire est en mai. — My birthday is in May." },
  { before: "Le nouvel ", after: " commence le premier janvier.", answer: "an", gloss: "Le nouvel an commence le premier janvier. — New Year begins on the first of January." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["C'est", "lundi,", "le", "quatre", "janvier", "."], sentence: "C'est lundi, le quatre janvier." },
  { chunks: ["Mon", "anniversaire", "est", "en", "mai", "."], sentence: "Mon anniversaire est en mai." },
  { chunks: ["Noël,", "c'est", "le", "vingt-cinq", "décembre", "."], sentence: "Noël, c'est le vingt-cinq décembre." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are filling in a calendar and want to write that today is Monday, the fourth of January.",
    correct: "C'est lundi, le quatre janvier.",
    distractors: ["C'est dimanche, le quatre janvier.", "C'est lundi, le quatre décembre.", "C'est lundi, mon anniversaire."],
    explanation: "'C'est lundi, le quatre janvier' correctly states both the day and the date — the other options change the day or the month.",
  },
  {
    note: "You are writing a card and want to note that your birthday is in May.",
    correct: "Mon anniversaire est en mai.",
    distractors: ["Mon anniversaire est en décembre.", "Noël est en mai.", "C'est le nouvel an en mai."],
    explanation: "'Mon anniversaire est en mai' correctly names your own birthday month — the others name a different event or month.",
  },
  {
    note: "You are writing that Christmas falls on the twenty-fifth of December.",
    correct: "Noël, c'est le vingt-cinq décembre.",
    distractors: ["Le nouvel an, c'est le vingt-cinq décembre.", "Noël, c'est le premier janvier.", "Mon anniversaire, c'est le vingt-cinq décembre."],
    explanation: "'Noël, c'est le vingt-cinq décembre' correctly names Christmas and its date — the others name a different event or a different date.",
  },
  {
    note: "You are writing a list of national holidays and want to label this category.",
    correct: "les fêtes nationales",
    distractors: ["les jours de la semaine", "la date d'anniversaire", "le nouvel an"],
    explanation: "'les fêtes nationales' means 'national holidays', the correct general category label for a holiday list.",
  },
];

export const timeWriting: Skill = {
  id: "g7-fr-w-time",
  code: "W.4",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Important dates",
  description: "Guided writing about days of the week, months, and important dates like birthdays, New Year, and Christmas.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French day or event word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Day names refer to the seven days of the week; event names refer to important dates.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const days = shuffle(rng, WORDS.filter((p) => p.tag === "day")).slice(0, 4);
      const events = shuffle(rng, WORDS.filter((p) => p.tag === "event"));
      const items = shuffle(rng, [...days, ...events]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Day of the Week or an Important Date/Event.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "day", label: "Day of the Week" },
          { id: "event", label: "Important Date/Event" },
        ],
        correctBucket,
        hint: "Days of the week repeat every seven days; events happen once a year.",
        explanation: [...days, ...events]
          .map((p) => `"${p.word}" is ${p.tag === "day" ? "a day of the week" : "an important date/event"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about dates.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which day, month, or date word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about a date.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "A date sentence names the day, then 'le', then the number and month.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check which day, month, or event actually matches what's being written.",
      explanation: s.explanation,
    };
  },
};
