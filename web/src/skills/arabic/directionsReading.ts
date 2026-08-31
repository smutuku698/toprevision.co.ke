import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Amina: 'Afwan, kayfa adhhabu ilaa al-maktaba?\n" +
  "Rajul: Idhhab mustaqeem, thumma in'atif yameenan 'inda al-masjid.\n" +
  "Amina: Yameen 'inda al-masjid, hasanan. Wa ba'da dhaalik?\n" +
  "Rajul: Al-maktaba amaamaka mubaasharatan, qif hunaaka.\n" +
  "Amina: Shukran jazeelan!";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Amina ask the man?",
    correct: "How to get to the library",
    distractors: ["Where the market is", "What time it is", "Where he lives"],
    explanation: "Amina asks \"kayfa adhhabu ilaa al-maktaba?\" — \"how do I go to the library?\"",
  },
  {
    q: "Where should Amina turn right, according to the man?",
    correct: "At the mosque",
    distractors: ["At the market", "At the school", "At the library"],
    explanation: "The man says \"in'atif yameenan 'inda al-masjid\" — \"turn right at the mosque.\"",
  },
  {
    q: "Where is the library located, according to the man?",
    correct: "Straight ahead, after turning right",
    distractors: ["On the left, before the mosque", "Behind the mosque", "Very far away"],
    explanation: "The man says \"Al-maktaba amaamaka mubaasharatan\" — \"the library is directly ahead of you.\"",
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
  { text: "Amina asks for directions to the library.", isTrue: true },
  { text: "The man tells Amina to turn left at the mosque.", isTrue: false },
  { text: "The library is directly ahead after the turn.", isTrue: true },
  { text: "Amina refuses to thank the man.", isTrue: false },
];

export const directionsReading: Skill = {
  id: "ar-r-directions",
  code: "R.9",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: giving and asking for directions",
  description: "Read a short Arabic dialogue about asking for directions and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and follow the directions step by step.",
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
      hint: "Follow the directions the man gives, one step at a time.",
      explanation: q.explanation,
    };
  },
};
