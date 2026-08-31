import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const CLOCK_TIMES: { hour: number; minute: 0 | 15 | 30 | 45; text: string }[] = [
  { hour: 1, minute: 0, text: "Il est une heure" },
  { hour: 6, minute: 0, text: "Il est six heures" },
  { hour: 2, minute: 30, text: "Il est deux heures et demie" },
  { hour: 7, minute: 30, text: "Il est sept heures et demie" },
  { hour: 3, minute: 15, text: "Il est trois heures et quart" },
  { hour: 9, minute: 15, text: "Il est neuf heures et quart" },
  { hour: 3, minute: 45, text: "Il est quatre heures moins le quart" },
  { hour: 9, minute: 45, text: "Il est dix heures moins le quart" },
  { hour: 12, minute: 0, text: "Il est midi" },
];

const DAY_MONTH_WORDS: { word: string; meaning: string }[] = [
  { word: "lundi", meaning: "Monday" },
  { word: "mardi", meaning: "Tuesday" },
  { word: "mercredi", meaning: "Wednesday" },
  { word: "jeudi", meaning: "Thursday" },
  { word: "vendredi", meaning: "Friday" },
  { word: "samedi", meaning: "Saturday" },
  { word: "dimanche", meaning: "Sunday" },
  { word: "janvier", meaning: "January" },
  { word: "février", meaning: "February" },
  { word: "mars", meaning: "March" },
  { word: "juillet", meaning: "July" },
  { word: "décembre", meaning: "December" },
];

const WEEKDAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
const WEEKEND = ["samedi", "dimanche"];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Il est trois heures et ", after: ".", answer: "quart" },
  { before: "Il est quatre heures moins le ", after: ".", answer: "quart" },
  { before: "Il est deux heures et ", after: ".", answer: "demie" },
  { before: "Il est cinq heures du ", after: ".", answer: "matin" },
  { before: "Il est huit heures du ", after: ".", answer: "soir" },
  { before: "Il est deux heures de l'", after: ".", answer: "après-midi" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il est", "trois heures", "et quart", "."], sentence: "Il est trois heures et quart." },
  { chunks: ["Il est", "quatre heures", "moins le quart", "."], sentence: "Il est quatre heures moins le quart." },
  { chunks: ["Quelle heure", "est-il", "?"], sentence: "Quelle heure est-il ?" },
  { chunks: ["Il est", "deux heures", "et demie", "."], sentence: "Il est deux heures et demie." },
];

export const timeSpeaking: Skill = {
  id: "g8-fr-ls-time",
  code: "LS.4",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Telling time",
  description: "Tell the time in French from a clock face, and practise days, months, and time-of-day expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "match", "categorize", "order"] as const);

    if (branch === "clock") {
      const correct = randChoice(rng, CLOCK_TIMES);
      const distractors = shuffle(rng, CLOCK_TIMES.filter((t) => t.text !== correct.text)).slice(0, 3);
      const choices = shuffle(rng, [correct.text, ...distractors.map((d) => d.text)]);

      return {
        kind: "multiple-choice",
        prompt: "Regardez l'horloge. Quelle heure est-il ?",
        visual: { type: "clock", hour: correct.hour, minute: correct.minute },
        choices,
        correctIndex: choices.indexOf(correct.text),
        layout: "list",
        hint: "Look at where the short (hour) hand and long (minute) hand are pointing.",
        explanation: `The clock shows ${correct.hour}:${String(correct.minute).padStart(2, "0")}, which in French is "${correct.text}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French time expression.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about how the French express quarter past, half past, quarter to, or a time of day.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "categorize") {
      const weekdayItems = shuffle(rng, WEEKDAYS).slice(0, 3);
      const weekendItems = [...WEEKEND];
      const items = shuffle(rng, [...weekdayItems, ...weekendItems]);
      const correctBucket: Record<string, string> = {};
      for (const d of weekdayItems) correctBucket[d] = "weekday";
      for (const d of weekendItems) correctBucket[d] = "weekend";

      return {
        kind: "categorize",
        prompt: "Sort each day as a weekday (jour de semaine) or a weekend day (week-end).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "weekday", label: "Jour de semaine" },
          { id: "weekend", label: "Week-end" },
        ],
        correctBucket,
        hint: "In France, the school/work week runs lundi to vendredi; samedi and dimanche are the weekend.",
        explanation: `Weekdays: ${weekdayItems.join(", ")}. Weekend: ${weekendItems.join(", ")}.`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about time.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Time sentences usually start with 'Il est' or 'Quelle heure'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const chosen = shuffle(rng, DAY_MONTH_WORDS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
    const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
    const correctMap: Record<string, string> = {};
    for (const w of chosen) correctMap[w.word] = w.word;

    return {
      kind: "click-match",
      prompt: "Match each French day or month to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Days of the week and months are not capitalized in French, unlike in English.",
      explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
    };
  },
};
