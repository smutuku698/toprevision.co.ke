import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Wanjiru schreibt einen Text über wichtige Termine.",
  "Ihr Geburtstag ist am zweiten März.",
  "Jamhuri Day ist ein wichtiger Feiertag in Kenia. Er ist am zwölften Dezember.",
  "Mashujaa Day ist auch ein Feiertag in Kenia. Er ist am zwanzigsten Oktober.",
  "Madaraka Day ist am ersten Juni.",
  "In Deutschland ist der Tag der deutschen Einheit am dritten Oktober.",
  "Weihnachten ist am fünfundzwanzigsten Dezember. Das feiert man in Kenia und in Deutschland.",
  "Wanjirus Familie feiert auch Neujahr. Das ist am ersten Januar.",
  "Ein Jahr hat zwölf Monate.",
  "Wanjiru findet Feiertage sehr interessant.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Wanjirus Geburtstag ist am zweiten März.", isTrue: true },
  { text: "Jamhuri Day ist am zwölften Dezember.", isTrue: true },
  { text: "Mashujaa Day ist am ersten Juni.", isTrue: false },
  { text: "Madaraka Day ist am ersten Juni.", isTrue: true },
  { text: "Der Tag der deutschen Einheit ist am dritten Oktober.", isTrue: true },
  { text: "Weihnachten ist am ersten Januar.", isTrue: false },
  { text: "Neujahr ist am ersten Januar.", isTrue: true },
  { text: "Ein Jahr hat zehn Monate.", isTrue: false },
  { text: "Mashujaa Day ist am zwanzigsten Oktober.", isTrue: true },
  { text: "Wanjiru findet Feiertage langweilig.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Ihr Geburtstag ist am zweiten März.", meaning: "Her birthday is on the second of March." },
  { phrase: "Jamhuri Day ist ein wichtiger Feiertag.", meaning: "Jamhuri Day is an important holiday." },
  { phrase: "Er ist am zwölften Dezember.", meaning: "It is on the twelfth of December." },
  { phrase: "Mashujaa Day ist auch ein Feiertag.", meaning: "Mashujaa Day is also a holiday." },
  { phrase: "Madaraka Day ist am ersten Juni.", meaning: "Madaraka Day is on the first of June." },
  { phrase: "Der Tag der deutschen Einheit", meaning: "German Unity Day" },
  { phrase: "Weihnachten ist am fünfundzwanzigsten Dezember.", meaning: "Christmas is on the twenty-fifth of December." },
  { phrase: "Neujahr ist am ersten Januar.", meaning: "New Year's Day is on the first of January." },
  { phrase: "Ein Jahr hat zwölf Monate.", meaning: "A year has twelve months." },
  { phrase: "Wanjiru findet Feiertage sehr interessant.", meaning: "Wanjiru finds holidays very interesting." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wann ist Wanjirus Geburtstag?",
    correct: "Am zweiten März",
    distractors: ["Am zwölften Dezember", "Am ersten Juni", "Am ersten Januar"],
    explanation: "The passage says: \"Ihr Geburtstag ist am zweiten März.\" — Her birthday is on the second of March.",
  },
  {
    q: "Wann ist Jamhuri Day?",
    correct: "Am zwölften Dezember",
    distractors: ["Am zwanzigsten Oktober", "Am dritten Oktober", "Am ersten Juni"],
    explanation: "The passage says: \"Jamhuri Day... ist am zwölften Dezember.\"",
  },
  {
    q: "Wann ist der Tag der deutschen Einheit?",
    correct: "Am dritten Oktober",
    distractors: ["Am zwölften Dezember", "Am ersten Januar", "Am zwanzigsten Oktober"],
    explanation: "The passage says: \"der Tag der deutschen Einheit [ist] am dritten Oktober.\"",
  },
  {
    q: "Welche Feiertage feiert man in Kenia und in Deutschland zusammen, laut dem Text?",
    correct: "Weihnachten",
    distractors: ["Jamhuri Day", "Madaraka Day", "Der Tag der deutschen Einheit"],
    explanation: "The passage says: \"Weihnachten... Das feiert man in Kenia und in Deutschland.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wanjiru schreibt einen Text über wichtige ", after: ".", answer: "Termine", gloss: "Wanjiru writes a text about important dates." },
  { before: "Ihr Geburtstag ist am zweiten ", after: ".", answer: "März", gloss: "Her birthday is on the second of March." },
  { before: "Jamhuri Day ist ein wichtiger ", after: " in Kenia.", answer: "Feiertag", gloss: "Jamhuri Day is an important holiday in Kenya." },
  { before: "Mashujaa Day ist am zwanzigsten ", after: ".", answer: "Oktober", gloss: "Mashujaa Day is on the twentieth of October." },
  { before: "Madaraka Day ist am ersten ", after: ".", answer: "Juni", gloss: "Madaraka Day is on the first of June." },
  { before: "In Deutschland ist der Tag der deutschen Einheit am ", after: " Oktober.", answer: "dritten", gloss: "German Unity Day is on the third of October." },
  { before: "Weihnachten ist am fünfundzwanzigsten ", after: ".", answer: "Dezember", gloss: "Christmas is on the twenty-fifth of December." },
  { before: "Wanjirus Familie feiert auch ", after: ".", answer: "Neujahr", gloss: "Wanjiru's family also celebrates New Year." },
  { before: "Ein Jahr hat zwölf ", after: ".", answer: "Monate", gloss: "A year has twelve months." },
  { before: "Wanjiru findet Feiertage sehr ", after: ".", answer: "interessant", gloss: "Wanjiru finds holidays very interesting." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Jamhuri Day", "ist", "am zwölften Dezember", "."], sentence: "Jamhuri Day ist am zwölften Dezember." },
  { chunks: ["Ein Jahr", "hat", "zwölf Monate", "."], sentence: "Ein Jahr hat zwölf Monate." },
];

export const timeReading: Skill = {
  id: "g7-de-r-time",
  code: "R.4",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: important dates",
  description: "Read a short German passage about birthdays and Kenyan and German holidays, and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage carefully and check each date exactly.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each sentence from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each sentence is used in the passage above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put the pieces in order to rebuild this line from the passage.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the passage above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from this line of the passage.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the passage above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at exactly what date the passage gives for this event.",
      explanation: q.explanation,
    };
  },
};
