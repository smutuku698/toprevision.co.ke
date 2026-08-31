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
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Noël, c'est le vingt-cinq ", after: ".", answer: "décembre", gloss: "Noël, c'est le vingt-cinq décembre. — Christmas is on the 25th of December." },
  { before: "Le nouvel an commence le premier ", after: ".", answer: "janvier", gloss: "Le nouvel an commence le premier janvier. — New Year begins on the first of January." },
  { before: "Mon anniversaire est en ", after: ".", answer: "mai", gloss: "Mon anniversaire est en mai. — My birthday is in May." },
  { before: "", after: " est le deuxième mois de l'année.", answer: "Février", gloss: "Février est le deuxième mois de l'année. — February is the second month of the year." },
  { before: "Pâques tombe souvent au mois d'", after: ".", answer: "avril", gloss: "Pâques tombe souvent au mois d'avril. — Easter often falls in the month of April." },
  { before: "", after: " est le septième mois de l'année.", answer: "Juillet", gloss: "Juillet est le septième mois de l'année. — July is the seventh month of the year." },
  { before: "L'année scolaire en France commence en ", after: ".", answer: "septembre", gloss: "L'année scolaire en France commence en septembre. — The school year in France starts in September." },
  { before: "", after: " vient après septembre.", answer: "Octobre", gloss: "Octobre vient après septembre. — October comes after September." },
  { before: "Le mois avant décembre s'appelle ", after: ".", answer: "novembre", gloss: "Le mois avant décembre s'appelle novembre. — The month before December is called November." },
  { before: "", after: " est le troisième mois de l'année.", answer: "Mars", gloss: "Mars est le troisième mois de l'année. — March is the third month of the year." },
  { before: "L'école ferme souvent en ", after: " pour les vacances.", answer: "juin", gloss: "L'école ferme souvent en juin pour les vacances. — School often closes in June for the holidays." },
  { before: "", after: " est le huitième mois de l'année.", answer: "Août", gloss: "Août est le huitième mois de l'année. — August is the eighth month of the year." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Noël,", "c'est", "le", "vingt-cinq", "décembre", "."], sentence: "Noël, c'est le vingt-cinq décembre." },
  { chunks: ["Le", "nouvel", "an", "commence", "le", "premier", "janvier", "."], sentence: "Le nouvel an commence le premier janvier." },
  { chunks: ["Mon", "anniversaire", "est", "en", "mai", "."], sentence: "Mon anniversaire est en mai." },
  { chunks: ["Pâques", "tombe", "au", "mois", "d'avril", "."], sentence: "Pâques tombe au mois d'avril." },
  { chunks: ["L'année", "scolaire", "commence", "en", "septembre", "."], sentence: "L'année scolaire commence en septembre." },
  { chunks: ["Décembre", "est", "le", "dernier", "mois", "de", "l'année", "."], sentence: "Décembre est le dernier mois de l'année." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a card and want to note that your birthday is in May.",
    correct: "Mon anniversaire est en mai.",
    distractors: ["Mon anniversaire est en décembre.", "Noël est en mai.", "C'est le nouvel an en mai."],
    explanation: "'Mon anniversaire est en mai' correctly names your own birthday month — the others name a different month or a different event.",
  },
  {
    note: "You are writing that Christmas falls on the twenty-fifth of December.",
    correct: "Noël, c'est le vingt-cinq décembre.",
    distractors: ["Le nouvel an, c'est le vingt-cinq décembre.", "Noël, c'est le premier janvier.", "Pâques, c'est le vingt-cinq décembre."],
    explanation: "'Noël, c'est le vingt-cinq décembre' correctly names Christmas and its date — the others name a different event or a different date.",
  },
  {
    note: "You are writing that the New Year begins on the first of January.",
    correct: "Le nouvel an commence le premier janvier.",
    distractors: ["Noël commence le premier janvier.", "Le nouvel an commence le premier décembre.", "Pâques commence le premier janvier."],
    explanation: "'Le nouvel an commence le premier janvier' correctly names New Year and its date — the others name a different event or a different month.",
  },
  {
    note: "You are comparing how New Year is celebrated in Kenya and in France for a class project, and want to write that both countries celebrate it on the same date.",
    correct: "Le nouvel an est fêté le premier janvier au Kenya et en France.",
    distractors: ["Le nouvel an est fêté en décembre au Kenya et en janvier en France.", "Le nouvel an est fêté seulement en France.", "Le nouvel an est fêté le vingt-cinq décembre partout."],
    explanation: "New Year falls on January 1st in both Kenya and France — the same date everywhere — the distractors invent a false difference or the wrong date.",
  },
  {
    note: "You are writing that Easter often falls in the month of April.",
    correct: "Pâques tombe souvent au mois d'avril.",
    distractors: ["Pâques tombe souvent au mois de décembre.", "Noël tombe souvent au mois d'avril.", "Pâques tombe toujours le premier janvier."],
    explanation: "'Pâques tombe souvent au mois d'avril' correctly names Easter's usual month — the others name the wrong month or the wrong event.",
  },
  {
    note: "You are writing that the school year in France commonly starts in September, unlike in Kenya where it starts in January.",
    correct: "L'année scolaire en France commence en septembre.",
    distractors: ["L'année scolaire en France commence en janvier.", "L'année scolaire au Kenya commence en septembre.", "L'année scolaire en France commence en décembre."],
    explanation: "France's school year starts in September, while Kenya's starts in January — a real difference between the two countries, so swapping the country or the month is wrong.",
  },
  {
    note: "You are writing a poem line naming February as the second month of the year.",
    correct: "Février est le deuxième mois de l'année.",
    distractors: ["Janvier est le deuxième mois de l'année.", "Février est le douzième mois de l'année.", "Mars est le deuxième mois de l'année."],
    explanation: "February is the second month — the others name the wrong month or the wrong position in the year.",
  },
  {
    note: "You are writing that December is the last month of the year.",
    correct: "Décembre est le dernier mois de l'année.",
    distractors: ["Novembre est le dernier mois de l'année.", "Décembre est le premier mois de l'année.", "Janvier est le dernier mois de l'année."],
    explanation: "December is the last month of the year — the others name the wrong month or the wrong position.",
  },
  {
    note: "You are writing that school often closes in June for the holidays in Kenya.",
    correct: "L'école ferme souvent en juin pour les vacances.",
    distractors: ["L'école ferme souvent en septembre pour les vacances.", "L'école ouvre souvent en juin pour les vacances.", "L'école ferme souvent en janvier pour les vacances."],
    explanation: "'ferme' (closes) and 'juin' (June) both need to match the described situation — 'ouvre' means opens, the opposite action.",
  },
  {
    note: "You are writing that August is the eighth month of the year.",
    correct: "Août est le huitième mois de l'année.",
    distractors: ["Juillet est le huitième mois de l'année.", "Août est le septième mois de l'année.", "Août est le dixième mois de l'année."],
    explanation: "August is the eighth month — the others name the wrong month or the wrong position.",
  },
  {
    note: "You are writing a calendar caption stating that November comes right before December.",
    correct: "Novembre vient avant décembre.",
    distractors: ["Octobre vient avant décembre.", "Novembre vient après décembre.", "Novembre vient avant janvier."],
    explanation: "'avant' means before — 'après' means after, the opposite, and the other options name the wrong month.",
  },
  {
    note: "You are writing about a December holiday celebrated both in Kenya and in France, and you want to name it.",
    correct: "Nous célébrons Noël en décembre.",
    distractors: ["Nous célébrons le nouvel an en décembre.", "Nous célébrons Pâques en décembre.", "Nous célébrons Noël en avril."],
    explanation: "Noël (Christmas) is celebrated in December in both countries — the others name a different event or the wrong month.",
  },
];

export const timeWriting: Skill = {
  id: "g6-fr-w-time",
  code: "W.4",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Months and seasonal events",
  description: "Guided writing about the months of the year and seasonal events such as New Year, Easter, and Christmas, both in Kenya and France.",
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
        prompt: "Match each written French month or event to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Month names repeat every year in the same order; event names refer to specific celebrations.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const months = shuffle(rng, WORDS.filter((p) => p.tag === "month")).slice(0, 5);
      const events = shuffle(rng, WORDS.filter((p) => p.tag === "event"));
      const items = shuffle(rng, [...months, ...events]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Month of the Year or a Seasonal Event.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "month", label: "Month of the Year" },
          { id: "event", label: "Seasonal Event" },
        ],
        correctBucket,
        hint: "Months form the twelve-part calendar; events are specific celebrations that happen during certain months.",
        explanation: [...months, ...events]
          .map((p) => `"${p.word}" is ${p.tag === "month" ? "a month of the year" : "a seasonal event"}.`)
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
        hint: "Think about which month or event word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about a date or month.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "A date sentence names the event or subject first, then the verb, then the month or date.",
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
      hint: "Check which month, event, or country actually matches what's being written.",
      explanation: s.explanation,
    };
  },
};
