import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "month" | "event";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "janvier", meaning: "January", tag: "month" },
  { word: "février", meaning: "February", tag: "month" },
  { word: "mars", meaning: "March", tag: "month" },
  { word: "avril", meaning: "April", tag: "month" },
  { word: "mai", meaning: "May", tag: "month" },
  { word: "juin", meaning: "June", tag: "month" },
  { word: "juillet", meaning: "July", tag: "month" },
  { word: "août", meaning: "August", tag: "month" },
  { word: "septembre", meaning: "September", tag: "month" },
  { word: "octobre", meaning: "October", tag: "month" },
  { word: "novembre", meaning: "November", tag: "month" },
  { word: "décembre", meaning: "December", tag: "month" },
  { word: "le nouvel an", meaning: "New Year", tag: "event" },
  { word: "Pâques", meaning: "Easter", tag: "event" },
  { word: "Noël", meaning: "Christmas", tag: "event" },
  { word: "mon anniversaire", meaning: "my birthday", tag: "event" },
  { word: "une fête nationale", meaning: "a national holiday", tag: "event" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Le nouvel an, c'est le premier ", after: ".", answer: "janvier", gloss: "Le nouvel an, c'est le premier janvier. — New Year is on the 1st of January." },
  { before: "Noël, c'est le vingt-cinq ", after: ".", answer: "décembre", gloss: "Noël, c'est le vingt-cinq décembre. — Christmas is on the 25th of December." },
  { before: "", after: ", c'est en mars ou en avril.", answer: "Pâques", gloss: "Pâques, c'est en mars ou en avril. — Easter is in March or April." },
  { before: "Mon anniversaire est au mois de ", after: ".", answer: "juillet", gloss: "Mon anniversaire est au mois de juillet. — My birthday is in the month of July." },
  { before: "", after: " est le premier mois de l'année.", answer: "Janvier", gloss: "Janvier est le premier mois de l'année. — January is the first month of the year." },
  { before: "", after: " est le dernier mois de l'année.", answer: "Décembre", gloss: "Décembre est le dernier mois de l'année. — December is the last month of the year." },
  { before: "Après janvier vient le mois de ", after: ".", answer: "février", gloss: "Après janvier vient le mois de février. — After January comes February." },
  { before: "Après juin vient le mois de ", after: ".", answer: "juillet", gloss: "Après juin vient le mois de juillet. — After June comes July." },
  { before: "Le mois de ", after: " vient avant octobre.", answer: "septembre", gloss: "Le mois de septembre vient avant octobre. — September comes before October." },
  { before: "Le mois de ", after: " vient après avril.", answer: "mai", gloss: "Le mois de mai vient après avril. — May comes after April." },
  { before: "On fête le ", after: " le premier janvier.", answer: "nouvel an", gloss: "On fête le nouvel an le premier janvier. — We celebrate New Year on the 1st of January." },
  { before: "On fête ", after: " le vingt-cinq décembre.", answer: "Noël", gloss: "On fête Noël le vingt-cinq décembre. — We celebrate Christmas on the 25th of December." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Quelle", "est", "la", "date", "aujourd'hui", "?"], sentence: "Quelle est la date aujourd'hui ?" },
  { chunks: ["Le", "nouvel", "an,", "c'est", "le", "premier", "janvier", "."], sentence: "Le nouvel an, c'est le premier janvier." },
  { chunks: ["Noël,", "c'est", "le", "vingt-cinq", "décembre", "."], sentence: "Noël, c'est le vingt-cinq décembre." },
  { chunks: ["Mon", "anniversaire", "est", "en", "juillet", "."], sentence: "Mon anniversaire est en juillet." },
  { chunks: ["Pâques", "arrive", "au", "printemps", "."], sentence: "Pâques arrive au printemps." },
  { chunks: ["Décembre", "est", "le", "dernier", "mois", "de", "l'année", "."], sentence: "Décembre est le dernier mois de l'année." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks when New Year is celebrated.`,
    correct: "Le nouvel an, c'est le premier janvier.",
    distractors: ["Noël, c'est le premier janvier.", "Mon anniversaire est le premier janvier.", "Pâques, c'est le premier janvier."],
    explanation: "'Le nouvel an' names New Year specifically, on the 1st of January — the others swap in a different event that isn't celebrated that day.",
  },
  {
    situation: (n) => `${n} asks when Christmas is celebrated.`,
    correct: "Noël, c'est le vingt-cinq décembre.",
    distractors: ["Le nouvel an, c'est le vingt-cinq décembre.", "Pâques, c'est le vingt-cinq décembre.", "Mon anniversaire est le vingt-cinq décembre."],
    explanation: "'Noël' is celebrated on the 25th of December — the others name an event that falls on a different date.",
  },
  {
    situation: (n) => `${n} asks which month starts the year.`,
    correct: "Janvier est le premier mois de l'année.",
    distractors: ["Décembre est le premier mois de l'année.", "Février est le premier mois de l'année.", "Juillet est le premier mois de l'année."],
    explanation: "'Janvier' (January) is the first month — 'Décembre' (December) is actually the last month of the year, not the first.",
  },
  {
    situation: (n) => `${n} asks which month ends the year.`,
    correct: "Décembre est le dernier mois de l'année.",
    distractors: ["Janvier est le dernier mois de l'année.", "Novembre est le dernier mois de l'année.", "Octobre est le dernier mois de l'année."],
    explanation: "'Décembre' (December) is the last month — 'Novembre' (November) comes right before it, not after.",
  },
  {
    situation: (n) => `${n} tells you it's June and asks what month comes right after it.`,
    correct: "Juillet vient après juin.",
    distractors: ["Mai vient après juin.", "Août vient après juin.", "Juin vient après juin."],
    explanation: "'Juillet' (July) directly follows June — 'Mai' (May) actually comes before June, not after.",
  },
  {
    situation: (n) => `${n} tells you it's October and asks what month comes right before it.`,
    correct: "Septembre vient avant octobre.",
    distractors: ["Novembre vient avant octobre.", "Août vient avant octobre.", "Octobre vient avant octobre."],
    explanation: "'Septembre' (September) directly precedes October — 'Novembre' (November) actually comes right after October, not before.",
  },
  {
    situation: (n) => `${n} tells you it's March and asks what month came right before it.`,
    correct: "Février vient avant mars.",
    distractors: ["Avril vient avant mars.", "Janvier vient avant mars.", "Mai vient avant mars."],
    explanation: "'Février' (February) directly precedes March — 'Avril' (April) actually comes right after March, not before.",
  },
  {
    situation: (n) => `${n} tells you it's April and asks what month comes right after it.`,
    correct: "Mai vient après avril.",
    distractors: ["Mars vient après avril.", "Juin vient après avril.", "Avril vient après avril."],
    explanation: "'Mai' (May) directly follows April — 'Mars' (March) actually comes right before April, not after.",
  },
  {
    situation: (n) => `${n} asks roughly which season Pâques (Easter) falls in.`,
    correct: "Pâques arrive au printemps.",
    distractors: ["Pâques arrive en hiver.", "Noël arrive au printemps.", "Le nouvel an arrive au printemps."],
    explanation: "Easter falls in March or April, during spring ('le printemps') — Christmas and New Year both fall in December/January, not spring.",
  },
  {
    situation: (n) => `${n} asks what event happens on the 25th of December.`,
    correct: "Noël a lieu le vingt-cinq décembre.",
    distractors: ["Le nouvel an a lieu le vingt-cinq décembre.", "Pâques a lieu le vingt-cinq décembre.", "Mon anniversaire a lieu le vingt-cinq décembre."],
    explanation: "'Noël' (Christmas) is the event on the 25th of December — the others are different events tied to different dates.",
  },
  {
    situation: (n) => `${n} asks what event happens on the 1st of January.`,
    correct: "Le nouvel an a lieu le premier janvier.",
    distractors: ["Noël a lieu le premier janvier.", "Pâques a lieu le premier janvier.", "Une fête nationale a lieu le premier janvier."],
    explanation: "'Le nouvel an' (New Year) is the event on the 1st of January — Noël falls in December, not January.",
  },
  {
    situation: (n) => `${n} tells you their birthday is in May and asks about yours — yours is in July.`,
    correct: "Mon anniversaire est en juillet.",
    distractors: ["Mon anniversaire est en mai.", "Mon anniversaire est en décembre.", "Mon anniversaire est en janvier."],
    explanation: "The sentence must give the specific month asked about (July) — repeating 'mai' would wrongly copy the other person's birthday month.",
  },
  {
    situation: (n) => `${n} asks you to name a day when the whole country celebrates together, like an independence day.`,
    correct: "C'est une fête nationale.",
    distractors: ["C'est mon anniversaire.", "C'est le nouvel an.", "C'est Noël."],
    explanation: "'Une fête nationale' means 'a national holiday', celebrated by a whole country — a birthday is personal, and New Year/Christmas are specific, fixed-date events, not the general category asked about.",
  },
];

export const timeSpeaking: Skill = {
  id: "g6-fr-ls-time",
  code: "LS.4",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "Months and important dates",
  description: "Months of the year and seasonal events — le nouvel an, Pâques, Noël — and telling the dates when they happen, in informal French.",
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
        prompt: "Match each French month or event word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Month names refer to the twelve months of the year; event names refer to specific celebrations.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const months = shuffle(rng, WORDS.filter((p) => p.tag === "month")).slice(0, 4);
      const events = shuffle(rng, WORDS.filter((p) => p.tag === "event")).slice(0, 4);
      const items = shuffle(rng, [...months, ...events]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Month of the Year or a Seasonal Event.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "month", label: "Month of the Year" },
          { id: "event", label: "Seasonal Event" },
        ],
        correctBucket,
        hint: "Months repeat every year in the same order; events are specific celebrations that happen on or around a date.",
        explanation: [...months, ...events]
          .map((p) => `"${p.word}" is ${p.tag === "month" ? "a month of the year" : "a seasonal event"}.`)
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
        hint: "Think about which month or event word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about a date or event.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "A date sentence names the event, then 'c'est', then the day and month.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check which month or event actually matches what's being asked.",
      explanation: s.explanation,
    };
  },
};
