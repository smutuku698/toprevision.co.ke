import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

type Tag = "moment" | "day";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le matin", meaning: "in the morning", tag: "moment" },
  { word: "à midi", meaning: "at noon", tag: "moment" },
  { word: "l'après-midi", meaning: "in the afternoon", tag: "moment" },
  { word: "le soir", meaning: "in the evening", tag: "moment" },
  { word: "la nuit", meaning: "at night", tag: "moment" },
  { word: "lundi", meaning: "Monday", tag: "day" },
  { word: "mardi", meaning: "Tuesday", tag: "day" },
  { word: "mercredi", meaning: "Wednesday", tag: "day" },
  { word: "jeudi", meaning: "Thursday", tag: "day" },
  { word: "vendredi", meaning: "Friday", tag: "day" },
  { word: "samedi", meaning: "Saturday", tag: "day" },
  { word: "dimanche", meaning: "Sunday", tag: "day" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "", after: " je me lève.", answer: "Le matin", gloss: "Le matin je me lève. — In the morning, I get up." },
  { before: "À ", after: " je prends le déjeuner.", answer: "midi", gloss: "À midi je prends le déjeuner. — At noon, I have lunch." },
  { before: "", after: " je joue.", answer: "Le soir", gloss: "Le soir je joue. — In the evening, I play." },
  { before: "", after: " je dors.", answer: "La nuit", gloss: "La nuit je dors. — At night, I sleep." },
  { before: "Le matin je me ", after: ".", answer: "lève", gloss: "Le matin je me lève. — In the morning, I get up." },
  { before: "À midi je prends le ", after: ".", answer: "déjeuner", gloss: "À midi je prends le déjeuner. — At noon, I have lunch." },
  { before: "Aujourd'hui, c'est ", after: ".", answer: "lundi", gloss: "Aujourd'hui, c'est lundi. — Today is Monday." },
  { before: "Demain, c'est ", after: ".", answer: "mardi", gloss: "Demain, c'est mardi. — Tomorrow is Tuesday." },
  { before: "", after: ", je vais à l'école.", answer: "Mercredi", gloss: "Mercredi, je vais à l'école. — On Wednesday, I go to school." },
  { before: "", after: ", je joue au football.", answer: "Vendredi", gloss: "Vendredi, je joue au football. — On Friday, I play football." },
  { before: "", after: ", je me repose.", answer: "Samedi", gloss: "Samedi, je me repose. — On Saturday, I rest." },
  { before: "", after: ", je regarde la télé.", answer: "Dimanche", gloss: "Dimanche, je regarde la télé. — On Sunday, I watch TV." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Le", "matin", "je", "me", "lève", "."], sentence: "Le matin je me lève." },
  { chunks: ["À", "midi", "je", "prends", "le", "déjeuner", "."], sentence: "À midi je prends le déjeuner." },
  { chunks: ["Le", "soir", "je", "joue", "."], sentence: "Le soir je joue." },
  { chunks: ["La", "nuit", "je", "dors", "."], sentence: "La nuit je dors." },
  { chunks: ["Aujourd'hui", ",", "c'est", "lundi", "."], sentence: "Aujourd'hui, c'est lundi." },
  { chunks: ["Mercredi", ",", "je", "vais", "à", "l'école", "."], sentence: "Mercredi, je vais à l'école." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing your morning routine in a diary entry, starting with the moment you get up.",
    correct: "Le matin je me lève.",
    distractors: ["Le soir je me lève.", "La nuit je me lève.", "Le matin je dors."],
    explanation: "'Le matin je me lève' correctly names the morning moment with the matching action — the other options swap the moment or the action.",
  },
  {
    note: "You are writing that you have lunch at noon, in your daily schedule.",
    correct: "À midi je prends le déjeuner.",
    distractors: ["Le soir je prends le déjeuner.", "À midi je joue.", "La nuit je prends le déjeuner."],
    explanation: "'À midi je prends le déjeuner' correctly pairs noon with the meal — the other options swap the moment or the activity.",
  },
  {
    note: "You are writing that you play in the evening, in your daily schedule.",
    correct: "Le soir je joue.",
    distractors: ["Le matin je joue.", "Le soir je dors.", "À midi je joue."],
    explanation: "'Le soir je joue' correctly pairs evening with playing — the other options swap in the wrong moment or the wrong activity.",
  },
  {
    note: "You are writing the last line of your daily schedule, about sleeping at night.",
    correct: "La nuit je dors.",
    distractors: ["Le matin je dors.", "La nuit je joue.", "Le soir je dors."],
    explanation: "'La nuit je dors' correctly pairs night with sleeping — the other options swap in the wrong moment or the wrong activity.",
  },
  {
    note: "You are writing a calendar caption stating today is Monday.",
    correct: "Aujourd'hui, c'est lundi.",
    distractors: ["Aujourd'hui, c'est mardi.", "Demain, c'est lundi.", "Aujourd'hui, c'est le matin."],
    explanation: "'Aujourd'hui, c'est lundi' correctly names Monday and uses 'Aujourd'hui' (today) — the other options name a different day or confuse a day with a moment of the day.",
  },
  {
    note: "You are writing a calendar caption stating tomorrow is Tuesday.",
    correct: "Demain, c'est mardi.",
    distractors: ["Aujourd'hui, c'est mardi.", "Demain, c'est lundi.", "Demain, c'est le soir."],
    explanation: "'Demain, c'est mardi' correctly names Tuesday and uses 'Demain' (tomorrow) — the other options mix up today/tomorrow or the day.",
  },
  {
    note: "You are writing your weekly school schedule, noting that you go to school on Wednesday.",
    correct: "Mercredi, je vais à l'école.",
    distractors: ["Vendredi, je vais à l'école.", "Mercredi, je me repose.", "Mercredi, je dors."],
    explanation: "'Mercredi, je vais à l'école' correctly names Wednesday and the school activity — the other options swap the day or the activity.",
  },
  {
    note: "You are writing your weekly schedule, noting that you play football on Friday.",
    correct: "Vendredi, je joue au football.",
    distractors: ["Samedi, je joue au football.", "Vendredi, je regarde la télé.", "Vendredi, je vais à l'école."],
    explanation: "'Vendredi, je joue au football' correctly names Friday and the football activity — the other options swap the day or the activity.",
  },
  {
    note: "You are writing your weekend schedule, noting that you rest on Saturday.",
    correct: "Samedi, je me repose.",
    distractors: ["Dimanche, je me repose.", "Samedi, je joue au football.", "Samedi, je vais à l'école."],
    explanation: "'Samedi, je me repose' correctly names Saturday and the resting activity — the other options swap the day or the activity.",
  },
  {
    note: "You are writing your weekend schedule, noting that you watch TV on Sunday.",
    correct: "Dimanche, je regarde la télé.",
    distractors: ["Samedi, je regarde la télé.", "Dimanche, je me lève.", "Dimanche, je vais à l'école."],
    explanation: "'Dimanche, je regarde la télé' correctly names Sunday and the TV activity — the other options swap the day or the activity.",
  },
  {
    note: "You are writing the moment of day word that means 'in the afternoon', for a schedule chart.",
    correct: "l'après-midi",
    distractors: ["le matin", "le soir", "la nuit"],
    explanation: "'l'après-midi' specifically means afternoon — the other written words name a different moment of the day.",
  },
  {
    note: "You are writing the moment of day word that means 'at night', for a schedule chart.",
    correct: "la nuit",
    distractors: ["le matin", "à midi", "l'après-midi"],
    explanation: "'la nuit' specifically means night — the other written words name a different, earlier moment of the day.",
  },
];

export const timeWriting: Skill = {
  id: "g5-fr-w-time",
  code: "W.4",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Moments of the day and days of the week",
  description: "Guided writing about moments of the day and days of the week, using the model pattern 'Le matin je me lève, à midi je prends le déjeuner, le soir je joue, la nuit je dors'.",
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
        prompt: matchPrompt(rng, "written French moment of the day or day of the week to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Some words name a moment within a day; others name a whole day of the week.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const moments = shuffle(rng, WORDS.filter((p) => p.tag === "moment")).slice(0, 3);
      const days = shuffle(rng, WORDS.filter((p) => p.tag === "day")).slice(0, 3);
      const items = shuffle(rng, [...moments, ...days]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each written word is a Moment of the Day or a Day of the Week"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "moment", label: "Moment of the Day" },
          { id: "day", label: "Day of the Week" },
        ],
        correctBucket,
        hint: "Moments repeat within every single day; days of the week each happen only once a week.",
        explanation: [...moments, ...days]
          .map((p) => `"${p.word}" is ${p.tag === "moment" ? "a moment of the day" : "a day of the week"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which moment of the day or day of the week fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words/phrases to write a correct sentence about a moment of the day or a day of the week"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The moment or day usually opens the sentence, followed by the subject and verb.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Match the moment or day named in the scenario to the matching activity, not just any schedule line.",
      explanation: s.explanation,
    };
  },
};
