import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { trueFalsePrompts } from "./germanPromptPools";

const TRUE_FALSE_PROMPTS = trueFalsePrompts("text");

const PASSAGE =
  "Auf dem Bauernhof gibt es viele Tiere. Die Kuh ist braun und groß. Sie gibt Milch.\n" +
  "Das Huhn ist klein und legt Eier. Die Katze miaut und ist klein.\n" +
  "Im Wald leben wilde Tiere. Der Elefant hat eine lange Nase. Der Löwe ist stark und hat viele Haare.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Welches Tier gibt Milch?",
    correct: "Die Kuh",
    distractors: ["Das Huhn", "Die Katze", "Der Löwe"],
    explanation: "Der Text sagt \"Die Kuh ist braun und groß. Sie gibt Milch.\"",
  },
  {
    q: "Welches Tier hat eine lange Nase?",
    correct: "Der Elefant",
    distractors: ["Die Kuh", "Das Huhn", "Der Löwe"],
    explanation: "Der Text sagt \"Der Elefant hat eine lange Nase.\"",
  },
  {
    q: "Was macht die Katze?",
    correct: "Sie miaut",
    distractors: ["Sie legt Eier", "Sie gibt Milch", "Sie fliegt"],
    explanation: "Der Text sagt \"Die Katze miaut und ist klein.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Die Kuh gibt Milch.", isTrue: true },
  { text: "Das Huhn legt Eier.", isTrue: true },
  { text: "Der Löwe lebt auf dem Bauernhof.", isTrue: false },
  { text: "Der Elefant ist klein.", isTrue: false },
];

export const countrysideReading: Skill = {
  id: "de-r-countryside",
  code: "R.3",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: animals in the countryside",
  description: "Read a short German text about farm and wild animals and answer comprehension questions.",
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
        hint: "Reread which animals live on the farm and which live in the forest.",
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
      hint: "Match each description in the text to the right animal.",
      explanation: q.explanation,
    };
  },
};
