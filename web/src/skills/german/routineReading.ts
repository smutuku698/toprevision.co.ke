import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { trueFalsePrompts } from "./germanPromptPools";

const TRUE_FALSE_PROMPTS = trueFalsePrompts("text");

const PASSAGE =
  "Mein Name ist Amina. Ich stehe um 7 Uhr auf. Um 7.30 esse ich mein Frühstück.\n" +
  "Um 9.20 lerne ich Mathe in der Schule. Am Nachmittag spiele ich Fußball.\n" +
  "Am Samstag will ich lange schlafen. Am Sonntag gehe ich in die Kirche.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Um wie viel Uhr steht Amina auf?",
    correct: "Um 7 Uhr",
    distractors: ["Um 6 Uhr", "Um 8 Uhr", "Um 9 Uhr"],
    explanation: "Der Text sagt \"Ich stehe um 7 Uhr auf.\"",
  },
  {
    q: "Was macht Amina am Nachmittag?",
    correct: "Sie spielt Fußball",
    distractors: ["Sie schläft", "Sie lernt Mathe", "Sie isst Frühstück"],
    explanation: "Der Text sagt \"Am Nachmittag spiele ich Fußball.\"",
  },
  {
    q: "Was macht Amina am Sonntag?",
    correct: "Sie geht in die Kirche",
    distractors: ["Sie spielt Fußball", "Sie lernt Mathe", "Sie steht früh auf"],
    explanation: "Der Text sagt \"Am Sonntag gehe ich in die Kirche.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina steht um 7 Uhr auf.", isTrue: true },
  { text: "Amina lernt um 9.20 Uhr Mathe.", isTrue: true },
  { text: "Amina spielt am Sonntag Fußball.", isTrue: false },
  { text: "Amina schläft am Samstag lange.", isTrue: true },
];

export const routineReading: Skill = {
  id: "de-r-routine",
  code: "R.4",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: my daily routine",
  description: "Read a short German text about someone's daily routine and answer comprehension questions.",
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
        hint: "Reread the times and days mentioned for each activity.",
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
      hint: "Match each time or day mentioned in the text to the right activity.",
      explanation: q.explanation,
    };
  },
};
