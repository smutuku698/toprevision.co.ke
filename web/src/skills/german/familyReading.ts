import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { trueFalsePrompts } from "./germanPromptPools";

const TRUE_FALSE_PROMPTS = trueFalsePrompts("text");

const PASSAGE =
  "Das ist meine Familie. Mein Vater heißt Otieno. Er ist Lehrer und arbeitet in Nairobi.\n" +
  "Meine Mutter heißt Wanjiru. Sie ist Ärztin und arbeitet in Maralal.\n" +
  "Mein Bruder heißt Kevin. Er ist zwölf Jahre alt.\n" +
  "Meine Oma heißt Nyambura. Sie ist siebzig Jahre alt.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Was ist der Beruf von Otieno?",
    correct: "Lehrer",
    distractors: ["Arzt", "Bauer", "Verkäufer"],
    explanation: "Der Text sagt \"Er ist Lehrer und arbeitet in Nairobi.\"",
  },
  {
    q: "Wo arbeitet Wanjiru?",
    correct: "In Maralal",
    distractors: ["In Nairobi", "In Kisumu", "In Mombasa"],
    explanation: "Der Text sagt \"Sie ist Ärztin und arbeitet in Maralal.\"",
  },
  {
    q: "Wie alt ist Kevin?",
    correct: "Zwölf Jahre alt",
    distractors: ["Zehn Jahre alt", "Vierzehn Jahre alt", "Acht Jahre alt"],
    explanation: "Der Text sagt \"Mein Bruder heißt Kevin. Er ist zwölf Jahre alt.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno ist Lehrer.", isTrue: true },
  { text: "Wanjiru ist Bäuerin.", isTrue: false },
  { text: "Die Oma heißt Nyambura.", isTrue: true },
  { text: "Kevin ist der Vater.", isTrue: false },
];

export const familyReading: Skill = {
  id: "de-r-family",
  code: "R.2",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: nuclear and extended family",
  description: "Read a short German text about a family and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: randChoice(rng, TRUE_FALSE_PROMPTS),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread each family member's profession and age carefully.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
      hint: "Match each name in the text to their profession and place of work.",
      explanation: q.explanation,
    };
  },
};
