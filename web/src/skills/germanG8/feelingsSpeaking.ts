import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FEELINGS: { word: string; meaning: string }[] = [
  { word: "glücklich", meaning: "happy" },
  { word: "traurig", meaning: "sad" },
  { word: "müde", meaning: "tired" },
  { word: "hungrig", meaning: "hungry" },
  { word: "durstig", meaning: "thirsty" },
  { word: "wütend", meaning: "angry" },
  { word: "krank", meaning: "sick" },
  { word: "nervös", meaning: "nervous" },
  { word: "ängstlich", meaning: "scared" },
];

const FEELING_SENTENCES: string[] = ["Ich fühle mich glücklich.", "Ich fühle mich müde.", "Ich fühle mich krank.", "Ich fühle mich nervös."];
const NEED_SENTENCES: string[] = ["Ich habe Kopfschmerzen.", "Ich brauche Wasser.", "Ich brauche Hilfe."];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich fühle mich ", after: ".", answer: "glücklich" },
  { before: "Ich fühle mich ", after: ".", answer: "müde" },
  { before: "Ich habe ", after: ".", answer: "Kopfschmerzen" },
  { before: "Ich brauche ", after: ".", answer: "Wasser" },
  { before: "Ich ", after: " Hilfe.", answer: "brauche" },
  { before: "Wie ", after: " Sie sich?", answer: "fühlen" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie fühlen", "Sie sich", "?"], sentence: "Wie fühlen Sie sich?" },
  { chunks: ["Ich fühle mich", "glücklich", "."], sentence: "Ich fühle mich glücklich." },
  { chunks: ["Ich brauche", "Wasser", "."], sentence: "Ich brauche Wasser." },
  { chunks: ["Ich habe", "Kopfschmerzen", "."], sentence: "Ich habe Kopfschmerzen." },
];

export const feelingsSpeaking: Skill = {
  id: "g8-de-ls-feelings",
  code: "LS.7",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Feelings and needs",
  description: "Express feelings and basic needs in German using the formal 'Wie fühlen Sie sich?' pattern.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const feeling = shuffle(rng, FEELING_SENTENCES);
      const need = shuffle(rng, NEED_SENTENCES);
      const items = shuffle(rng, [...feeling, ...need]);
      const correctBucket: Record<string, string> = {};
      for (const s of feeling) correctBucket[s] = "feeling";
      for (const s of need) correctBucket[s] = "need";

      return {
        kind: "categorize",
        prompt: "Sort each sentence as expressing a Feeling or a Need/complaint.",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "feeling", label: "Feeling" },
          { id: "need", label: "Need/complaint" },
        ],
        correctBucket,
        hint: "'Ich fühle mich ...' expresses a feeling; 'Ich habe ...'/'Ich brauche ...' expresses a need or complaint.",
        explanation: `Feelings: ${feeling.join(" / ")}. Needs: ${need.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about feelings or needs.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the feeling word, or whether the sentence uses 'habe' or 'brauche'.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about feelings or needs.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The formal question 'Wie fühlen Sie sich?' places the verb 'fühlen' right after 'Wie'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const f = randChoice(rng, FEELINGS);
      const distractors = shuffle(rng, FEELINGS.filter((x) => x.word !== f.word)).slice(0, 3).map((x) => x.meaning);
      const choices = shuffle(rng, [f.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Was bedeutet "${f.word}" auf Englisch?`,
        choices,
        correctIndex: choices.indexOf(f.meaning),
        layout: "list",
        hint: "Think about which emotion or state this German word describes.",
        explanation: `"${f.word}" means "${f.meaning}".`,
      };
    }

    const chosen = shuffle(rng, FEELINGS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((f) => ({ id: f.word, label: f.word })));
    const targets = shuffle(rng, chosen.map((f) => ({ id: f.word, label: f.meaning })));
    const correctMap: Record<string, string> = {};
    for (const f of chosen) correctMap[f.word] = f.word;

    return {
      kind: "click-match",
      prompt: "Match each German feeling word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Müde' means tired, while 'wütend' means angry.",
      explanation: chosen.map((f) => `"${f.word}" means "${f.meaning}".`).join(" "),
    };
  },
};
