import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Herr Otieno: Entschuldigung, wie komme ich zum Bahnhof?",
  "Passantin: Gehen Sie geradeaus bis zur Ampel.",
  "Herr Otieno: Und dann?",
  "Passantin: Biegen Sie rechts ab und nehmen Sie die zweite Straße links.",
  "Herr Otieno: Vielen Dank! Halten Sie an der Kreuzung, sagten Sie?",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Herr Otieno ask the passer-by?",
    correct: "Wie komme ich zum Bahnhof?",
    distractors: ["Wo ist die Bibliothek?", "Wie spät ist es?", "Wohin gehen Sie?"],
    explanation: "Herr Otieno asks \"wie komme ich zum Bahnhof?\" — how do I get to the train station?",
  },
  {
    q: "What does the passer-by say to do first?",
    correct: "Geradeaus gehen bis zur Ampel.",
    distractors: ["Rechts abbiegen.", "Links abbiegen.", "An der Kreuzung halten."],
    explanation: "The passer-by says \"Gehen Sie geradeaus bis zur Ampel\" — go straight ahead to the traffic light.",
  },
  {
    q: "What should Herr Otieno do after the traffic light?",
    correct: "Rechts abbiegen und die zweite Straße links nehmen.",
    distractors: ["Links abbiegen und geradeaus gehen.", "An der Ampel halten.", "Zurück zum Bahnhof gehen."],
    explanation: "The passer-by says \"Biegen Sie rechts ab und nehmen Sie die zweite Straße links.\"",
  },
  {
    q: "What does Herr Otieno ask about at the end?",
    correct: "Ob er an der Kreuzung halten soll.",
    distractors: ["Ob er rechts abbiegen soll.", "Wie spät es ist.", "Wo die Bibliothek ist."],
    explanation: "Herr Otieno asks \"Halten Sie an der Kreuzung, sagten Sie?\" — checking whether he should stop at the intersection.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Herr Otieno is asking for directions to the train station.", isTrue: true },
  { text: "The passer-by tells him to turn left first.", isTrue: false },
  { text: "He should take the second street on the left.", isTrue: true },
  { text: "Herr Otieno already knows the way and does not need to ask.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Wie komme ich zum Bahnhof?", meaning: "How do I get to the train station?" },
  { phrase: "geradeaus", meaning: "straight ahead" },
  { phrase: "die Ampel", meaning: "the traffic light" },
  { phrase: "rechts abbiegen", meaning: "to turn right" },
  { phrase: "die zweite Straße links", meaning: "the second street on the left" },
  { phrase: "die Kreuzung", meaning: "the intersection" },
  { phrase: "Vielen Dank!", meaning: "Thank you very much!" },
];

export const transportReading: Skill = {
  id: "g8-de-r-transport",
  code: "R.9",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: asking for directions",
  description: "Read a formal German dialogue in which someone asks for and receives directions, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and follow the directions step by step.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
        prompt: "Match each German word or phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these exact expressions in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The dialogue opens with the question about the train station and ends with a check about the intersection.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Follow the directions given by the passer-by in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
