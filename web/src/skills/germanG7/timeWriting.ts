import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

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
  { chunks: ["Mein Geburtstag", "ist", "im März", "."], sentence: "Mein Geburtstag ist im März." },
  { chunks: ["Jamhuri Day", "ist", "am zwölften Dezember", "."], sentence: "Jamhuri Day ist am zwölften Dezember." },
  { chunks: ["Neujahr", "ist", "am ersten Januar", "."], sentence: "Neujahr ist am ersten Januar." },
  { chunks: ["Ein Jahr", "hat", "zwölf Monate", "."], sentence: "Ein Jahr hat zwölf Monate." },
];

function birthdayCardScenario(rng: () => number) {
  const d = randChoice(rng, DATES);
  const correct = `${d.event} ist am ${d.ordinal} ${d.month}.`;
  const others = shuffle(rng, DATES.filter((x) => x.event !== d.event));
  const wrongA = others[0];
  const wrongB = others.find((x) => x.month !== wrongA.month) ?? others[1] ?? wrongA;

  const candidateSet = new Set<string>();
  for (const eventSrc of [d, wrongA]) {
    for (const ordinalSrc of [d, wrongA, wrongB]) {
      for (const monthSrc of [d, wrongA, wrongB]) {
        const text = `${eventSrc.event} ist am ${ordinalSrc.ordinal} ${monthSrc.month}.`;
        if (text !== correct) candidateSet.add(text);
      }
    }
  }
  const distractors = shuffle(rng, [...candidateSet]).slice(0, 3);
  const choices = shuffle(rng, [correct, ...distractors]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Du schreibst eine Karte zum Thema "${d.event}". Welcher Satz gibt das richtige Datum an?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "Check both the ordinal number and the month name carefully.",
    explanation: `${correct} — the other sentences swap in a wrong month, a wrong day, or a wrong event name.`,
  };
}

export const timeWriting: Skill = {
  id: "g7-de-w-time",
  code: "W.4",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "Time: important dates",
  description: "Guided writing — spelling ordinal dates and important Kenyan and German calendar dates in German.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "card"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, DATES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((d) => ({ id: d.event, label: d.event })));
      const targets = shuffle(rng, chosen.map((d) => ({ id: d.event, label: `am ${d.ordinal} ${d.month}` })));
      const correctMap: Record<string, string> = {};
      for (const d of chosen) correctMap[d.event] = d.event;

      return {
        kind: "click-match",
        prompt: "Match each event to its written German calendar date.",
        tokens,
        targets,
        correctMap,
        hint: "German written dates use the pattern 'am [ordinal] [Monat]'.",
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
        prompt: "Sort each written date as a Kenyan holiday or a German holiday.",
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
        prompt: "Fill in the missing ordinal number to complete the written German date.",
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
        prompt: "Arrange the words/phrases to write a correct German sentence about dates.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "German sentences usually put the verb as the second element.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return birthdayCardScenario(rng);
  },
};
