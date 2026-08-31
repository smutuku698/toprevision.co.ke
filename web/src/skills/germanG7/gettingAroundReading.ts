import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Wafula ist neu in der Nachbarschaft und fragt nach dem Weg.",
  "Er fragt: 'Wie komme ich zur Bibliothek?'",
  "Eine Frau antwortet: 'Geh geradeaus und dann nach rechts.'",
  "Die Bibliothek ist neben der Bäckerei.",
  "Wafula findet die Bibliothek und leiht ein Buch aus.",
  "Danach fragt er: 'Wo finde ich das Postamt?'",
  "Ein Mann sagt: 'Das Postamt ist gegenüber der Schule.'",
  "Wafula geht zum Postamt und sendet einen Brief.",
  "Zum Schluss sucht er den Park.",
  "Der Park ist zwischen der Kirche und dem Krankenhaus.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Wafula ist neu in der Nachbarschaft.", isTrue: true },
  { text: "Wafula fragt zuerst nach dem Weg zum Park.", isTrue: false },
  { text: "Die Frau sagt: 'Geh geradeaus und dann nach rechts.'", isTrue: true },
  { text: "Die Bibliothek ist neben der Bäckerei.", isTrue: true },
  { text: "Wafula leiht kein Buch aus.", isTrue: false },
  { text: "Wafula fragt nach dem Postamt.", isTrue: true },
  { text: "Das Postamt ist neben der Schule.", isTrue: false },
  { text: "Das Postamt ist gegenüber der Schule.", isTrue: true },
  { text: "Wafula sendet einen Brief.", isTrue: true },
  { text: "Der Park ist zwischen der Kirche und dem Krankenhaus.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Wafula ist neu in der Nachbarschaft.", meaning: "Wafula is new in the neighbourhood." },
  { phrase: "Wie komme ich zur Bibliothek?", meaning: "How do I get to the library?" },
  { phrase: "Geh geradeaus und dann nach rechts.", meaning: "Go straight ahead and then to the right." },
  { phrase: "Die Bibliothek ist neben der Bäckerei.", meaning: "The library is next to the bakery." },
  { phrase: "Wo finde ich das Postamt?", meaning: "Where do I find the post office?" },
  { phrase: "Das Postamt ist gegenüber der Schule.", meaning: "The post office is across from the school." },
  { phrase: "Er sendet einen Brief.", meaning: "He sends a letter." },
  { phrase: "Der Park ist zwischen der Kirche und dem Krankenhaus.", meaning: "The park is between the church and the hospital." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wie kommt Wafula zur Bibliothek?",
    correct: "Geradeaus und dann rechts",
    distractors: ["Links und dann geradeaus", "Nur rechts", "Nur geradeaus"],
    explanation: "The passage says: \"Geh geradeaus und dann nach rechts.\"",
  },
  {
    q: "Wo ist die Bibliothek?",
    correct: "Neben der Bäckerei",
    distractors: ["Gegenüber der Schule", "Zwischen der Kirche und dem Krankenhaus", "Neben dem Postamt"],
    explanation: "The passage says: \"Die Bibliothek ist neben der Bäckerei.\"",
  },
  {
    q: "Wo ist das Postamt?",
    correct: "Gegenüber der Schule",
    distractors: ["Neben der Bäckerei", "Zwischen der Kirche und dem Krankenhaus", "Neben der Bibliothek"],
    explanation: "The passage says: \"Das Postamt ist gegenüber der Schule.\"",
  },
  {
    q: "Wo ist der Park?",
    correct: "Zwischen der Kirche und dem Krankenhaus",
    distractors: ["Neben der Bäckerei", "Gegenüber der Schule", "Neben dem Postamt"],
    explanation: "The passage says: \"Der Park ist zwischen der Kirche und dem Krankenhaus.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wafula ist neu in der ", after: ".", answer: "Nachbarschaft", gloss: "Wafula is new in the neighbourhood." },
  { before: "Er fragt: 'Wie komme ich zur ", after: "?'", answer: "Bibliothek", gloss: "He asks how to get to the library." },
  { before: "Eine Frau antwortet: 'Geh geradeaus und dann nach ", after: ".'", answer: "rechts", gloss: "A woman answers: go straight ahead and then to the right." },
  { before: "Die Bibliothek ist ", after: " der Bäckerei.", answer: "neben", gloss: "The library is next to the bakery." },
  { before: "Wafula findet die Bibliothek und ", after: " ein Buch aus.", answer: "leiht", gloss: "Wafula finds the library and borrows a book." },
  { before: "Danach fragt er: 'Wo finde ich das ", after: "?'", answer: "Postamt", gloss: "Then he asks where to find the post office." },
  { before: "Ein Mann sagt: 'Das Postamt ist ", after: " der Schule.'", answer: "gegenüber", gloss: "A man says the post office is across from the school." },
  { before: "Wafula geht zum Postamt und sendet einen ", after: ".", answer: "Brief", gloss: "Wafula goes to the post office and sends a letter." },
  { before: "Zum Schluss sucht er den ", after: ".", answer: "Park", gloss: "Finally, he looks for the park." },
  { before: "Der Park ist ", after: " der Kirche und dem Krankenhaus.", answer: "zwischen", gloss: "The park is between the church and the hospital." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wafula", "ist neu", "in der Nachbarschaft", "."], sentence: "Wafula ist neu in der Nachbarschaft." },
  { chunks: ["Der Park", "ist", "zwischen der Kirche und dem Krankenhaus", "."], sentence: "Der Park ist zwischen der Kirche und dem Krankenhaus." },
];

export const gettingAroundReading: Skill = {
  id: "g7-de-r-getting-around",
  code: "R.9",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: getting around the neighbourhood",
  description: "Read a short German passage about someone asking for directions around a neighbourhood, and answer comprehension questions.",
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
        hint: "Reread the passage carefully and track the location of each place.",
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
      hint: "Look at exactly where the passage places each location.",
      explanation: q.explanation,
    };
  },
};
