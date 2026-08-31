import { randChoice, randInt, shuffle } from "@/lib/rng";
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

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie ", after: " ist es?", answer: "spät" },
  { before: "Es ist ", after: " nach neun.", answer: "Viertel" },
  { before: "Es ist ", after: " zehn.", answer: "halb" },
  { before: "Es ist Viertel ", after: " zehn.", answer: "vor" },
  { before: "Um wie viel Uhr haben wir ", after: "?", answer: "Deutsch" },
  { before: "Wir haben Deutsch um neun ", after: ".", answer: "Uhr" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie spät", "ist es", "?"], sentence: "Wie spät ist es?" },
  { chunks: ["Es ist", "Viertel nach neun", "."], sentence: "Es ist Viertel nach neun." },
  { chunks: ["Um wie viel Uhr", "haben wir", "Deutsch", "?"], sentence: "Um wie viel Uhr haben wir Deutsch?" },
  { chunks: ["Wir haben Deutsch", "um neun Uhr", "."], sentence: "Wir haben Deutsch um neun Uhr." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct way to say 'It is half past nine' in German.",
    correct: "Es ist halb zehn.",
    distractors: ["Es ist halb neun.", "Es ist Viertel zehn.", "Es ist neun halb."],
    explanation: "German 'halb zehn' names the *next* hour (ten), not the previous one — so 'half past nine' is 'halb zehn', not 'halb neun'.",
  },
  {
    prompt: "Choose the correct time expression for 'a quarter to ten'.",
    correct: "Viertel vor zehn",
    distractors: ["Viertel nach zehn", "halb zehn", "Viertel vor neun"],
    explanation: "'Vor' means 'before/to', so 'a quarter to ten' is 'Viertel vor zehn'; 'nach' would mean 'quarter past'.",
  },
  {
    prompt: "Choose the correct formal question for 'At what time do we have German?'",
    correct: "Um wie viel Uhr haben wir Deutsch?",
    distractors: ["Wie viel Uhr haben wir Deutsch?", "Um wie viel Uhr wir haben Deutsch?", "Haben wir Deutsch um wie viel Uhr wir?"],
    explanation: "The correct word order places 'Um wie viel Uhr' first, followed by verb-subject 'haben wir', then 'Deutsch'.",
  },
  {
    prompt: "Which subject name is spelled correctly?",
    correct: "Naturwissenschaften",
    distractors: ["Naturwissenschaft", "Naturwisenschaften", "Naturwissenshaften"],
    explanation: "The correct spelling is 'Naturwissenschaften' (Science) — note the double 's' in 'wissen' and the 'sch' combination.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "Deutsch", meaning: "German" },
  { term: "Mathematik", meaning: "Maths" },
  { term: "Englisch", meaning: "English" },
  { term: "Sport", meaning: "PE" },
  { term: "Kunst", meaning: "Art" },
  { term: "Musik", meaning: "Music" },
  { term: "Naturwissenschaften", meaning: "Science" },
  { term: "Geschichte", meaning: "History" },
  { term: "Montag", meaning: "Monday" },
  { term: "Freitag", meaning: "Friday" },
];

export const timeWriting: Skill = {
  id: "g8-de-w-time",
  code: "W.4",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing about time and the school timetable",
  description: "Write formal sentences telling the time and describing the school timetable.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "order", "choice", "match"] as const);

    if (branch === "clock") {
      const hour = randInt(rng, 1, 11);
      const minute = randChoice(rng, [0, 15, 30, 45] as const);
      const body = timeBody(hour, minute);

      return {
        kind: "fill-blank",
        prompt: "Look at the clock and complete the German sentence for the time shown.",
        visual: { type: "clock", hour, minute },
        before: "Es ist ",
        after: ".",
        correctAnswer: body,
        acceptedAnswers: umlautAccepted(body),
        inputMode: "text",
        hint: "Read the hour hand first, then check the minute hand for 'Viertel nach', 'halb', or 'Viertel vor'.",
        explanation: `The clock shows ${hour}:${String(minute).padStart(2, "0")}, which in German is "Es ist ${body}."`,
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
        hint: "Question words like 'Wie spät' or 'Um wie viel Uhr' come first.",
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
        hint: "Remember: German half-hours name the upcoming hour, not the previous one.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each German timetable word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'Sport' looks like English, but 'Kunst' and 'Musik' need translating.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal German sentence about time.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about how the sentence tells or asks for the time.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
