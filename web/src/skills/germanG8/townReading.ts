import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Herr Otieno: Guten Tag, Frau Njeri! Wohin gehen Sie?",
  "Frau Njeri: Ich gehe zur Bibliothek. Und Sie, wohin gehen Sie?",
  "Herr Otieno: Ich gehe zum Supermarkt. Ich brauche Brot und Milch.",
  "Frau Njeri: Danach gehe ich zur Post und dann zur Bank.",
  "Herr Otieno: Gut. Bis später, Frau Njeri!",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Where is Frau Njeri going first?",
    correct: "Ich gehe zur Bibliothek.",
    distractors: ["Ich gehe zum Supermarkt.", "Ich gehe zur Post.", "Ich gehe zur Bank."],
    explanation: "Frau Njeri says \"Ich gehe zur Bibliothek\" — she is going to the library.",
  },
  {
    q: "Why is Herr Otieno going to the supermarket?",
    correct: "Er braucht Brot und Milch.",
    distractors: ["Er braucht Salz und Zucker.", "Er braucht ein Buch.", "Er braucht Geld."],
    explanation: "Herr Otieno says \"Ich brauche Brot und Milch\" — he needs bread and milk.",
  },
  {
    q: "Where does Frau Njeri go after the library?",
    correct: "Zur Post und dann zur Bank.",
    distractors: ["Zum Supermarkt und dann zur Kirche.", "Zum Park und dann zum Rathaus.", "Zur Schule und dann zum Krankenhaus."],
    explanation: "Frau Njeri says \"Danach gehe ich zur Post und dann zur Bank.\"",
  },
  {
    q: "How does Herr Otieno end the conversation?",
    correct: "Bis später, Frau Njeri!",
    distractors: ["Auf Wiedersehen, für immer!", "Guten Tag, Frau Njeri!", "Wie geht es Ihnen?"],
    explanation: "Herr Otieno closes with \"Gut. Bis später, Frau Njeri!\" — see you later.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Frau Njeri is going to the library first.", isTrue: true },
  { text: "Herr Otieno is going to the church.", isTrue: false },
  { text: "Herr Otieno needs bread and milk.", isTrue: true },
  { text: "Frau Njeri's last stop is the town hall.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Wohin gehen Sie?", meaning: "Where are you going? (formal)" },
  { phrase: "die Bibliothek", meaning: "the library" },
  { phrase: "der Supermarkt", meaning: "the supermarket" },
  { phrase: "die Post", meaning: "the post office" },
  { phrase: "die Bank", meaning: "the bank" },
  { phrase: "Ich brauche...", meaning: "I need..." },
  { phrase: "danach", meaning: "afterwards" },
  { phrase: "Bis später!", meaning: "See you later!" },
];

export const townReading: Skill = {
  id: "g8-de-r-town",
  code: "R.3",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: around town",
  description: "Read a formal German dialogue about running errands in town using 'zum'/'zur', then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check each place the speakers mention.",
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
        hint: "The dialogue opens by asking where Frau Njeri is going and ends with a farewell.",
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
      hint: "Look at what each speaker says about where they are going.",
      explanation: q.explanation,
    };
  },
};
