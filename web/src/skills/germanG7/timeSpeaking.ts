import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

type Country = "Kenia" | "Deutschland" | "international";

const DATES: { event: string; ordinal: string; month: string; monthIndex: number; country: Country }[] = [
  { event: "Jamhuri Day", ordinal: "zwölften", month: "Dezember", monthIndex: 12, country: "Kenia" },
  { event: "Mashujaa Day", ordinal: "zwanzigsten", month: "Oktober", monthIndex: 10, country: "Kenia" },
  { event: "Madaraka Day", ordinal: "ersten", month: "Juni", monthIndex: 6, country: "Kenia" },
  { event: "der Tag der deutschen Einheit", ordinal: "dritten", month: "Oktober", monthIndex: 10, country: "Deutschland" },
  { event: "der Nikolaustag", ordinal: "sechsten", month: "Dezember", monthIndex: 12, country: "Deutschland" },
  { event: "der Weltkindertag", ordinal: "zwanzigsten", month: "September", monthIndex: 9, country: "Deutschland" },
  { event: "Neujahr", ordinal: "ersten", month: "Januar", monthIndex: 1, country: "international" },
  { event: "Weihnachten", ordinal: "fünfundzwanzigsten", month: "Dezember", monthIndex: 12, country: "international" },
  { event: "der Valentinstag", ordinal: "vierzehnten", month: "Februar", monthIndex: 2, country: "international" },
  { event: "der Tag der Arbeit", ordinal: "ersten", month: "Mai", monthIndex: 5, country: "international" },
  { event: "Silvester", ordinal: "einunddreißigsten", month: "Dezember", monthIndex: 12, country: "international" },
];

const FILL_ITEMS = DATES.map((d) => ({
  before: `${d.event} ist am `,
  after: ` ${d.month}.`,
  answer: d.ordinal,
  gloss: `${d.event} ist am ${d.ordinal} ${d.month}.`,
}));

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Jamhuri Day", "ist", "am zwölften Dezember", "."], sentence: "Jamhuri Day ist am zwölften Dezember." },
  { chunks: ["Wann", "hast du", "Geburtstag", "?"], sentence: "Wann hast du Geburtstag?" },
  { chunks: ["Mein Geburtstag", "ist", "im März", "."], sentence: "Mein Geburtstag ist im März." },
  { chunks: ["Neujahr", "ist", "am ersten Januar", "."], sentence: "Neujahr ist am ersten Januar." },
  { chunks: ["Wie viele", "Monate", "hat ein Jahr", "?"], sentence: "Wie viele Monate hat ein Jahr?" },
  { chunks: ["Ein Jahr", "hat", "zwölf Monate", "."], sentence: "Ein Jahr hat zwölf Monate." },
];

function monthGapScenario(rng: () => number) {
  const a = randChoice(rng, DATES);
  let b = randChoice(rng, DATES);
  let guard = 0;
  while (b.event === a.event && guard < 10) {
    b = randChoice(rng, DATES);
    guard++;
  }
  const gap = Math.abs(a.monthIndex - b.monthIndex);
  const correct = `${gap} Monate`;
  const distractorGaps = [gap + 1, Math.max(gap - 1, 0), (gap + 6) % 12].filter((g) => g !== gap);
  const choices = shuffle(rng, [correct, ...distractorGaps.slice(0, 3).map((g) => `${g} Monate`)]);

  return {
    kind: "multiple-choice" as const,
    prompt: `${a.event} ist im ${MONTHS[a.monthIndex - 1]}. ${b.event} ist im ${MONTHS[b.monthIndex - 1]}. Wie viele Monate liegen zwischen den beiden Terminen?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "Zähle die Monate von einem Ereignis zum anderen.",
    explanation: `${a.event} ist im Monat ${a.monthIndex} (${MONTHS[a.monthIndex - 1]}), ${b.event} ist im Monat ${b.monthIndex} (${MONTHS[b.monthIndex - 1]}). Der Unterschied ist ${gap} Monate.`,
  };
}

export const timeSpeaking: Skill = {
  id: "g7-de-ls-time",
  code: "LS.4",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "Time: important dates",
  description: "Months, ordinal dates, and important Kenyan and German calendar dates in German.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "gap"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, DATES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((d) => ({ id: d.event, label: d.event })));
      const targets = shuffle(rng, chosen.map((d) => ({ id: d.event, label: `am ${d.ordinal} ${d.month}` })));
      const correctMap: Record<string, string> = {};
      for (const d of chosen) correctMap[d.event] = d.event;

      return {
        kind: "click-match",
        prompt: "Match each event to its German calendar date.",
        tokens,
        targets,
        correctMap,
        hint: "German dates use the pattern 'am [ordinal] [Monat]'.",
        explanation: chosen.map((d) => `${d.event} ist am ${d.ordinal} ${d.month}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const kenia = shuffle(rng, DATES.filter((d) => d.country === "Kenia"));
      const deutschland = shuffle(rng, DATES.filter((d) => d.country === "Deutschland"));
      const chosen = shuffle(rng, [...kenia, ...deutschland]);
      const correctBucket: Record<string, string> = {};
      for (const d of chosen) correctBucket[d.event] = d.country;

      return {
        kind: "categorize",
        prompt: "Sort each date as a Kenyan holiday or a German holiday.",
        items: chosen.map((d) => ({ id: d.event, label: d.event })),
        buckets: [
          { id: "Kenia", label: "Kenyan holiday" },
          { id: "Deutschland", label: "German holiday" },
        ],
        correctBucket,
        hint: "Jamhuri Day, Mashujaa Day, and Madaraka Day are Kenyan; the others named here are German.",
        explanation: chosen.map((d) => `${d.event} is a ${d.country === "Kenia" ? "Kenyan" : "German"} holiday.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing ordinal number to complete the German date.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "German ordinal dates after 'am' end in '-en' or '-sten'.",
        explanation: `The complete sentence is: "${item.gloss}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about dates.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Date questions in German usually start with 'Wann'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return monthGapScenario(rng);
  },
};
