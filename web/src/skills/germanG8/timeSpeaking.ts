import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const HOUR_WORDS = ["", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];

function hourWord(h: number): string {
  return HOUR_WORDS[((h - 1) % 12) + 1];
}

function timeBody(hour: number, minute: 0 | 15 | 30 | 45): string {
  if (minute === 0) return `${hour === 1 ? "ein" : hourWord(hour)} Uhr`;
  if (minute === 15) return `Viertel nach ${hourWord(hour)}`;
  const nextHour = (hour % 12) + 1;
  if (minute === 30) return `halb ${hourWord(nextHour)}`;
  return `Viertel vor ${hourWord(nextHour)}`;
}

const CLOCK_TIMES: { hour: number; minute: 0 | 15 | 30 | 45 }[] = [
  { hour: 9, minute: 0 },
  { hour: 9, minute: 15 },
  { hour: 9, minute: 30 },
  { hour: 9, minute: 45 },
  { hour: 6, minute: 0 },
  { hour: 3, minute: 15 },
  { hour: 7, minute: 30 },
  { hour: 10, minute: 45 },
];

const SUBJECTS: { word: string; meaning: string }[] = [
  { word: "Deutsch", meaning: "German" },
  { word: "Mathematik", meaning: "Maths" },
  { word: "Englisch", meaning: "English" },
  { word: "Sport", meaning: "PE" },
  { word: "Kunst", meaning: "Art" },
  { word: "Musik", meaning: "Music" },
  { word: "Naturwissenschaften", meaning: "Science" },
  { word: "Geschichte", meaning: "History" },
];

const DAYS: string[] = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Es ist Viertel nach ", after: ".", answer: "neun" },
  { before: "Es ist ", after: " zehn.", answer: "halb" },
  { before: "Es ist Viertel vor ", after: ".", answer: "zehn" },
  { before: "Um wie viel Uhr haben wir ", after: "?", answer: "Deutsch" },
  { before: "Wir haben Deutsch um neun ", after: ".", answer: "Uhr" },
  { before: "Wie ", after: " ist es?", answer: "spät" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie spät", "ist es", "?"], sentence: "Wie spät ist es?" },
  { chunks: ["Um wie viel Uhr", "haben wir", "Deutsch", "?"], sentence: "Um wie viel Uhr haben wir Deutsch?" },
  { chunks: ["Wir haben Deutsch", "um neun Uhr", "."], sentence: "Wir haben Deutsch um neun Uhr." },
  { chunks: ["Es ist", "Viertel nach", "neun", "."], sentence: "Es ist Viertel nach neun." },
];

export const timeSpeaking: Skill = {
  id: "g8-de-ls-time",
  code: "LS.4",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Telling time and the Stundenplan",
  description: "Tell the time in German, ask formally about the school timetable, and sort weekdays from subjects.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "match", "categorize", "order"] as const);

    if (branch === "clock") {
      const correct = randChoice(rng, CLOCK_TIMES);
      const correctText = `Es ist ${timeBody(correct.hour, correct.minute)}.`;
      const distractors = shuffle(rng, CLOCK_TIMES.filter((t) => t.hour !== correct.hour || t.minute !== correct.minute)).slice(0, 3);
      const choices = shuffle(rng, [correctText, ...distractors.map((d) => `Es ist ${timeBody(d.hour, d.minute)}.`)]);

      return {
        kind: "multiple-choice",
        prompt: "Schauen Sie auf die Uhr. Wie spät ist es?",
        visual: { type: "clock", hour: correct.hour, minute: correct.minute },
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Look at where the short (hour) hand and long (minute) hand are pointing. Remember: German half-hours name the coming hour.",
        explanation: `The clock shows ${correct.hour}:${String(correct.minute).padStart(2, "0")}, which in German is "${correctText}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about time or the timetable.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about how German tells time (Viertel nach/vor, halb) or asks about the Stundenplan.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "categorize") {
      const subjects = shuffle(rng, SUBJECTS).slice(0, 4).map((s) => s.word);
      const days = shuffle(rng, DAYS).slice(0, 4);
      const items = shuffle(rng, [...subjects, ...days]);
      const correctBucket: Record<string, string> = {};
      for (const s of subjects) correctBucket[s] = "subject";
      for (const d of days) correctBucket[d] = "day";

      return {
        kind: "categorize",
        prompt: "Sort each word as a School subject or a Day of the week.",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "subject", label: "School subject" },
          { id: "day", label: "Day of the week" },
        ],
        correctBucket,
        hint: "Subjects are things you study, like Deutsch or Sport; days are Montag through Freitag.",
        explanation: `Subjects: ${subjects.join(", ")}. Days: ${days.join(", ")}.`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about time.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Time questions usually start with 'Wie spät' or 'Um wie viel Uhr'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const chosen = shuffle(rng, SUBJECTS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
    const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
    const correctMap: Record<string, string> = {};
    for (const s of chosen) correctMap[s.word] = s.word;

    return {
      kind: "click-match",
      prompt: "Match each German school subject to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Naturwissenschaften' is Science, while 'Geschichte' is History.",
      explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
    };
  },
};
