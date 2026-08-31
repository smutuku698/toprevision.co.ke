import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Amina: Assalamu alaykum, keyfa haaluka?\n" +
  "The teacher: Bikhayr, shukran. Wa anta?\n" +
  "Amina: Bikhayr aydan, shukran. Maa ismuka?\n" +
  "The teacher: Ismi Ustaadh Kamau. Anaa masruurun biliqaika!\n" +
  "Amina: Anaa aydan masruuratun biliqaika, Ustaadh Kamau!";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who is speaking in this dialogue?",
    correct: "Amina and her teacher, Ustaadh Kamau",
    distractors: ["Two strangers at a market", "Amina and her mother", "Ustaadh Kamau and a doctor"],
    explanation: "The dialogue is between Amina and her teacher, who introduces himself as Ustaadh Kamau.",
  },
  {
    q: "How does the teacher say he is feeling?",
    correct: "He is well (bikhayr)",
    distractors: ["He is sick", "He is tired", "He does not answer"],
    explanation: "The teacher replies \"Bikhayr, shukran\" — meaning \"well, thank you.\"",
  },
  {
    q: "What is the teacher's name?",
    correct: "Ustaadh Kamau",
    distractors: ["Ustaadh Otieno", "Ustaadha Kamau", "Ustaadh Amina"],
    explanation: "The teacher says \"Ismi Ustaadh Kamau\" — \"My name is Ustaadh Kamau.\"",
  },
];

const TRUE_FALSE_PROMPTS = [
  "Sort each statement as True or False, based on the dialogue.",
  "Decide whether each statement below is True or False, based on the dialogue.",
  "Read the dialogue again and sort each statement as True or False.",
  "Is each statement True or False according to the dialogue? Sort it.",
  "Using the dialogue above, sort each statement into True or False.",
  "Check the dialogue and sort each statement as True or False.",
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina asks the teacher how he is doing.", isTrue: true },
  { text: "The teacher says his name is Ustaadha Aisha.", isTrue: false },
  { text: "Amina and the teacher seem to be meeting for the first time.", isTrue: true },
  { text: "Amina refuses to say her name.", isTrue: false },
];

export const greetingsReading: Skill = {
  id: "ar-r-greetings",
  code: "R.1",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: formal greetings and introductions",
  description: "Read a short Arabic dialogue of a formal introduction and answer comprehension questions.",
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
