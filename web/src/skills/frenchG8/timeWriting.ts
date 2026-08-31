import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const HOUR_WORDS = ["un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze"];

function hourWord(h: number): string {
  return HOUR_WORDS[(h - 1) % 12];
}

/** The part of the French time sentence between "Il est " and the final period, for an hour (1-11) and minute (0/15/30/45). */
function timeBody(hour: number, minute: number): string {
  if (minute === 45) {
    const nextH = (hour % 12) + 1;
    const word = nextH === 1 ? "une" : hourWord(nextH);
    return `${word} heure${nextH === 1 ? "" : "s"} moins le quart`;
  }
  const word = hour === 1 ? "une" : hourWord(hour);
  const heures = `${word} heure${hour === 1 ? "" : "s"}`;
  if (minute === 0) return heures;
  if (minute === 15) return `${heures} et quart`;
  return `${heures} et demie`; // minute === 30
}

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " est-il ?", answer: "Quelle heure" },
  { before: "Il est trois heures ", after: ", c'est-à-dire trois heures et quinze minutes.", answer: "et quart" },
  { before: "Il est six heures ", after: ", c'est-à-dire six heures et trente minutes.", answer: "et demie" },
  { before: "Il est quatre heures ", after: ", c'est-à-dire trois heures et quarante-cinq minutes.", answer: "moins le quart" },
  { before: "Aujourd'hui, nous sommes ", after: ", le jour après mardi.", answer: "mercredi" },
  { before: "Le dernier mois de l'année est ", after: ".", answer: "décembre" },
  { before: "Le premier mois de l'année est ", after: ".", answer: "janvier" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Quelle heure", "est-il", "?"], sentence: "Quelle heure est-il ?" },
  { chunks: ["Il est", "trois heures", "et quart."], sentence: "Il est trois heures et quart." },
  { chunks: ["Il est", "quatre heures", "moins le quart."], sentence: "Il est quatre heures moins le quart." },
  { chunks: ["Nous sommes", "le lundi", "12 mars."], sentence: "Nous sommes le lundi 12 mars." },
  { chunks: ["Quelle est", "la date", "aujourd'hui", "?"], sentence: "Quelle est la date aujourd'hui ?" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal question to ask the time.",
    correct: "Quelle heure est-il ?",
    distractors: ["Quelle heure il est ?", "Quelle heure es-tu ?", "Quelle heure êtes-vous ?"],
    explanation: "The standard question is 'Quelle heure est-il ?', using inversion with the impersonal 'il'.",
  },
  {
    prompt: "Which is the correctly spelled way to say 'a quarter to four'?",
    correct: "quatre heures moins le quart",
    distractors: ["quatre heures moin le quart", "quatre heure moins le quart", "quatres heures moins le quart"],
    explanation: "'Heures' takes an 's' when plural, and 'moins' is spelled with an 's'; the correct form is 'quatre heures moins le quart'.",
  },
  {
    prompt: "Choose the correct way to say 'It is one o'clock' — remember, 'heure' is feminine.",
    correct: "Il est une heure",
    distractors: ["Il est un heure", "Il est une heures", "Il est un heures"],
    explanation: "'Heure' is feminine, so it takes 'une' not 'un', and stays singular for one o'clock: 'Il est une heure'.",
  },
  {
    prompt: "Which day comes immediately after 'jeudi'?",
    correct: "vendredi",
    distractors: ["mercredi", "samedi", "lundi"],
    explanation: "The days in order are lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche — vendredi follows jeudi.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "Il est une heure", meaning: "It is one o'clock" },
  { term: "Il est deux heures et demie", meaning: "It is half past two" },
  { term: "Il est trois heures et quart", meaning: "It is a quarter past three" },
  { term: "Il est quatre heures moins le quart", meaning: "It is a quarter to four" },
  { term: "Il est midi", meaning: "It is noon" },
  { term: "Il est minuit", meaning: "It is midnight" },
  { term: "du matin", meaning: "in the morning (a.m.)" },
  { term: "de l'après-midi", meaning: "in the afternoon (p.m.)" },
  { term: "du soir", meaning: "in the evening (p.m.)" },
];

export const timeWriting: Skill = {
  id: "g8-fr-w-time",
  code: "W.4",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing the time",
  description: "Write French time and date expressions: read an analog clock, fill in missing words, order sentences, and match time phrases to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "order", "choice", "match"] as const);

    if (branch === "clock") {
      const hour = randInt(rng, 1, 11);
      const minute = randChoice(rng, [0, 15, 30, 45] as const);
      const body = timeBody(hour, minute);

      return {
        kind: "fill-blank",
        prompt: "Look at the clock and complete the French sentence for the time shown.",
        visual: { type: "clock", hour, minute },
        before: "Il est ",
        after: ".",
        correctAnswer: body,
        acceptedAnswers: accentAccepted(body),
        inputMode: "text",
        hint: "Read the hour hand first, then check the minute hand for 'et quart', 'et demie', or 'moins le quart'.",
        explanation: `The clock shows ${hour}:${String(minute).padStart(2, "0")}, which in French is "Il est ${body}."`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about time or date.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Questions about time usually start with 'Quelle heure' or 'Quelle est'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Watch the agreement of 'heure(s)' and the exact spelling of time expressions.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each French time expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'et quart' adds 15 minutes, 'et demie' adds 30, and 'moins le quart' subtracts 15 from the next hour.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word(s) to complete the French sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think carefully about time and date expressions.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
