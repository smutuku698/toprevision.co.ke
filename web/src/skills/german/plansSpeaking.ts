import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Ich treffe am Sonntag meine Freundin.", meaning: "I am meeting my friend on Sunday." },
  { phrase: "Ich spiele heute Nachmittag Fußball.", meaning: "I am playing football this afternoon." },
  { phrase: "Ich möchte heute Abend tanzen.", meaning: "I would like to dance tonight." },
  { phrase: "Ich möchte später mein Buch lesen.", meaning: "I would like to read my book later." },
  { phrase: "Ich möchte Musik hören.", meaning: "I would like to listen to music." },
];

const QUESTION_ITEMS: { label: string; bucket: "was" | "wann" | "wo" }[] = [
  { label: "Was machst du heute Abend?", bucket: "was" },
  { label: "Was möchtest du heute Abend machen?", bucket: "was" },
  { label: "Wann spielst du Fußball?", bucket: "wann" },
  { label: "Wann möchtest du Musik hören?", bucket: "wann" },
  { label: "Wo möchtest du heute tanzen?", bucket: "wo" },
  { label: "Wo spielst du heute Nachmittag Fußball?", bucket: "wo" },
];

export const plansSpeaking: Skill = {
  id: "de-ls-plans",
  code: "LS.5",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Fun and enjoyment: making plans and dates",
  description: "Match German plans expressions to their meaning, and sort questions by what/when/where they ask.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, QUESTION_ITEMS);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each question by whether it asks Was (what), Wann (when), or Wo (where).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "was", label: "Was (what)" },
          { id: "wann", label: "Wann (when)" },
          { id: "wo", label: "Wo (where)" },
        ],
        correctBucket,
        hint: "The question word at the start of the sentence tells you what kind of answer it wants.",
        explanation: QUESTION_ITEMS.map((it) => `"${it.label}" asks ${it.bucket}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each German plans expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'möchte' means 'would like to' — look for the verb at the end of the sentence.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
