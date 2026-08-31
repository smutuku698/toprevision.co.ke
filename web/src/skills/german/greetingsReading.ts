import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { trueFalsePrompts } from "./germanPromptPools";

const TRUE_FALSE_PROMPTS = trueFalsePrompts("dialogue");

const PASSAGE =
  "Amina: Guten Tag! Ich heiße Amina. Wie heißt du?\n" +
  "Otieno: Hallo Amina! Ich heiße Otieno. Ich bin vierzehn Jahre alt.\n" +
  "Amina: Ich bin auch vierzehn. Woher kommst du?\n" +
  "Otieno: Ich komme aus Kisumu. Und du?\n" +
  "Amina: Ich komme aus Nairobi. Bis bald, Otieno!\n" +
  "Otieno: Tschüss, Amina!";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wie heißt das Mädchen im Dialog?",
    correct: "Amina",
    distractors: ["Otieno", "Aisha", "Wanjiru"],
    explanation: "Sie sagt \"Ich heiße Amina.\"",
  },
  {
    q: "Wie alt ist Otieno?",
    correct: "Vierzehn Jahre alt",
    distractors: ["Dreizehn Jahre alt", "Fünfzehn Jahre alt", "Zwölf Jahre alt"],
    explanation: "Otieno sagt \"Ich bin vierzehn Jahre alt.\"",
  },
  {
    q: "Woher kommt Amina?",
    correct: "Aus Nairobi",
    distractors: ["Aus Kisumu", "Aus Mombasa", "Aus Nakuru"],
    explanation: "Amina sagt \"Ich komme aus Nairobi.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina und Otieno sind beide vierzehn Jahre alt.", isTrue: true },
  { text: "Otieno kommt aus Nairobi.", isTrue: false },
  { text: "Amina und Otieno treffen sich zum ersten Mal.", isTrue: true },
  { text: "Otieno sagt \"Auf Wiedersehen\" am Ende.", isTrue: false },
];

export const greetingsReading: Skill = {
  id: "de-r-greetings",
  code: "R.1",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: greetings and introductions",
  description: "Read a short German dialogue of two people introducing themselves and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what each speaker actually says.",
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
      hint: "Look at what each speaker says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
