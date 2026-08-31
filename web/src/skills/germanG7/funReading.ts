import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Kevin schreibt über sein Wochenende.",
  "Am Samstagmorgen geht er schwimmen. Er schwimmt sehr gern.",
  "Am Nachmittag spielt er Fußball mit Freunden.",
  "Er spielt lieber Fußball als er fernsieht.",
  "Am Abend hört Kevin Musik. Das ist seine liebste Aktivität.",
  "Am Sonntag geht die Familie spazieren.",
  "In den großen Ferien reist Kevins Familie oft nach Kisumu.",
  "Ein Freund fragt Kevin, ob er Alkohol probieren will.",
  "Kevin sagt: 'Nein danke, das ist nicht sicher. Lass uns lieber Musik hören.'",
  "Kevin findet, sichere Aktivitäten machen mehr Spaß.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kevin geht am Samstagmorgen schwimmen.", isTrue: true },
  { text: "Kevin spielt am Nachmittag Fußball.", isTrue: true },
  { text: "Kevin sieht lieber fern, als Fußball zu spielen.", isTrue: false },
  { text: "Kevins liebste Aktivität am Abend ist Musik hören.", isTrue: true },
  { text: "Die Familie geht am Sonntag spazieren.", isTrue: true },
  { text: "Kevins Familie reist in den Ferien nach Nairobi.", isTrue: false },
  { text: "Ein Freund fragt Kevin, ob er Alkohol probieren will.", isTrue: true },
  { text: "Kevin sagt Ja zum Alkohol.", isTrue: false },
  { text: "Kevin schlägt Musik hören als Alternative vor.", isTrue: true },
  { text: "Kevin findet sichere Aktivitäten machen mehr Spaß.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Kevin schreibt über sein Wochenende.", meaning: "Kevin writes about his weekend." },
  { phrase: "Er schwimmt sehr gern.", meaning: "He really likes swimming." },
  { phrase: "Er spielt Fußball mit Freunden.", meaning: "He plays football with friends." },
  { phrase: "Er spielt lieber Fußball als er fernsieht.", meaning: "He prefers playing football to watching TV." },
  { phrase: "Das ist seine liebste Aktivität.", meaning: "That is his favourite activity." },
  { phrase: "Die Familie geht spazieren.", meaning: "The family goes for a walk." },
  { phrase: "Ein Freund fragt Kevin.", meaning: "A friend asks Kevin." },
  { phrase: "Das ist nicht sicher.", meaning: "That is not safe." },
  { phrase: "Lass uns lieber Musik hören.", meaning: "Let's listen to music instead." },
  { phrase: "Sichere Aktivitäten machen mehr Spaß.", meaning: "Safe activities are more fun." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Was macht Kevin am Samstagmorgen?",
    correct: "Er geht schwimmen.",
    distractors: ["Er spielt Fußball.", "Er hört Musik.", "Er reist nach Kisumu."],
    explanation: "The passage says: \"Am Samstagmorgen geht er schwimmen.\"",
  },
  {
    q: "Was ist Kevins liebste Abendaktivität?",
    correct: "Musik hören",
    distractors: ["Fußball spielen", "Schwimmen", "Fernsehen"],
    explanation: "The passage says: \"Am Abend hört Kevin Musik. Das ist seine liebste Aktivität.\"",
  },
  {
    q: "Was antwortet Kevin, als ihn ein Freund nach Alkohol fragt?",
    correct: "'Nein danke, das ist nicht sicher.'",
    distractors: ["'Ja, klar!'", "Er sagt nichts.", "Er geht weg, ohne zu antworten."],
    explanation: "The passage says: \"Kevin sagt: 'Nein danke, das ist nicht sicher. Lass uns lieber Musik hören.'\"",
  },
  {
    q: "Wohin reist Kevins Familie in den großen Ferien?",
    correct: "Nach Kisumu",
    distractors: ["Nach Nairobi", "Nach Mombasa", "Nach Deutschland"],
    explanation: "The passage says: \"In den großen Ferien reist Kevins Familie oft nach Kisumu.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kevin schreibt über sein ", after: ".", answer: "Wochenende", gloss: "Kevin writes about his weekend." },
  { before: "Am Samstagmorgen geht er ", after: ".", answer: "schwimmen", gloss: "On Saturday morning he goes swimming." },
  { before: "Am Nachmittag spielt er ", after: " mit Freunden.", answer: "Fußball", gloss: "In the afternoon he plays football with friends." },
  { before: "Er spielt lieber Fußball, ", after: " er fernsieht.", answer: "als", gloss: "He prefers playing football over watching TV." },
  { before: "Am Abend hört Kevin ", after: ".", answer: "Musik", gloss: "In the evening Kevin listens to music." },
  { before: "Das ist seine ", after: " Aktivität.", answer: "liebste", gloss: "That is his favourite activity." },
  { before: "Am Sonntag geht die Familie ", after: ".", answer: "spazieren", gloss: "On Sunday the family goes for a walk." },
  { before: "Ein Freund fragt Kevin, ob er ", after: " probieren will.", answer: "Alkohol", gloss: "A friend asks Kevin if he wants to try alcohol." },
  { before: "Kevin sagt: 'Nein danke, das ist nicht ", after: ".'", answer: "sicher", gloss: "Kevin says that's not safe." },
  { before: "Sichere Aktivitäten machen mehr ", after: ".", answer: "Spaß", gloss: "Safe activities are more fun." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Kevin", "schreibt über", "sein Wochenende", "."], sentence: "Kevin schreibt über sein Wochenende." },
  { chunks: ["Sichere Aktivitäten", "machen", "mehr Spaß", "."], sentence: "Sichere Aktivitäten machen mehr Spaß." },
];

export const funReading: Skill = {
  id: "g7-de-r-fun",
  code: "R.5",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: fun and enjoyment",
  description: "Read a short German passage about a learner's weekend and how he handled peer pressure, and answer comprehension questions.",
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
        hint: "Reread the passage carefully and check exactly what Kevin does and says.",
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
      hint: "Look at exactly what the passage says about this moment.",
      explanation: q.explanation,
    };
  },
};
