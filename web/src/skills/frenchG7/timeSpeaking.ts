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
  { before: "Le nouvel an, c'est le premier ", after: ".", answer: "janvier", gloss: "Le nouvel an, c'est le premier janvier. — New Year is on the 1st of January." },
  { before: "Mon anniversaire est en ", after: ".", answer: "mai", gloss: "Mon anniversaire est en mai. — My birthday is in May." },
  { before: "", after: " est le premier jour de la semaine scolaire.", answer: "Lundi", gloss: "Lundi est le premier jour de la semaine scolaire. — Monday is the first day of the school week." },
  { before: "", after: " est le dernier jour de la semaine.", answer: "Dimanche", gloss: "Dimanche est le dernier jour de la semaine. — Sunday is the last day of the week." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Quelle", "est", "la", "date", "aujourd'hui", "?"], sentence: "Quelle est la date aujourd'hui ?" },
  { chunks: ["C'est", "lundi", "le", "quatre", "janvier", "."], sentence: "C'est lundi le quatre janvier." },
  { chunks: ["Mon", "anniversaire", "est", "en", "mai", "."], sentence: "Mon anniversaire est en mai." },
];

const SCENARIOS: { situation: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: "Someone asks you the date today, and you want to ask it back.",
    correct: "Quelle est la date aujourd'hui ?",
    distractors: ["C'est lundi le quatre janvier.", "Mon anniversaire est en mai.", "Noël, c'est en décembre."],
    explanation: "'Quelle est la date aujourd'hui ?' is the question form — the others are statements answering a date question.",
  },
  {
    situation: "You want to say Christmas falls in December.",
    correct: "Noël, c'est en décembre.",
    distractors: ["Le nouvel an, c'est en décembre.", "Mon anniversaire est en décembre.", "C'est lundi en décembre."],
    explanation: "'Noël, c'est en décembre' names Christmas specifically — the others name a different event or don't mention Christmas.",
  },
  {
    situation: "You want to say New Year falls on the first of January.",
    correct: "Le nouvel an, c'est le premier janvier.",
    distractors: ["Noël, c'est le premier janvier.", "Mon anniversaire est le premier janvier.", "C'est dimanche le premier janvier."],
    explanation: "'Le nouvel an, c'est le premier janvier' correctly names New Year — the others name a different event.",
  },
  {
    situation: "You want to tell a friend the first day of the school week.",
    correct: "Lundi est le premier jour de la semaine scolaire.",
    distractors: ["Dimanche est le premier jour de la semaine scolaire.", "Vendredi est le dernier jour.", "Samedi est le premier jour."],
    explanation: "'Lundi' (Monday) is the correct first school day — the school week in Kenya starts on Monday, not Sunday or Saturday.",
  },
  {
    situation: "You want to tell a friend the last day of the week (before the new week starts).",
    correct: "Dimanche est le dernier jour de la semaine.",
    distractors: ["Lundi est le dernier jour de la semaine.", "Samedi est le premier jour.", "Vendredi est le dernier jour."],
    explanation: "'Dimanche' (Sunday) is the last day of the standard week — Monday begins a new week, and Friday/Saturday are not the last day.",
  },
];

export const timeSpeaking: Skill = {
  id: "g7-fr-ls-time",
  code: "LS.4",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "Important dates",
  description: "Days of the week, months, and vocabulary for important dates like birthdays, New Year, and Christmas.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French day or event word to its English meaning.",
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
        prompt: "Sort each word as a Day of the Week or an Important Date/Event.",
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
        prompt: "Fill in the missing word to complete the sentence about dates.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which day, month, or date word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about a date.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "A date sentence names the day, then 'le', then the number and month.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check which day, month, or event actually matches what's being asked.",
      explanation: s.explanation,
    };
  },
};
