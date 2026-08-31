import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FEELINGS: { word: string; meaning: string }[] = [
  { word: "content(e)", meaning: "happy/pleased" },
  { word: "triste", meaning: "sad" },
  { word: "fatigué(e)", meaning: "tired" },
  { word: "en colère", meaning: "angry" },
  { word: "inquiet/inquiète", meaning: "worried" },
  { word: "surpris(e)", meaning: "surprised" },
  { word: "heureux/heureuse", meaning: "happy" },
  { word: "effrayé(e)", meaning: "afraid/scared" },
];

const BODY_PARTS: { word: string; meaning: string }[] = [
  { word: "la tête", meaning: "the head" },
  { word: "les yeux", meaning: "the eyes" },
  { word: "le nez", meaning: "the nose" },
  { word: "la bouche", meaning: "the mouth" },
  { word: "les mains", meaning: "the hands" },
  { word: "les pieds", meaning: "the feet" },
  { word: "le cœur", meaning: "the heart" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Comment te sens-tu aujourd'hui ? — Je me sens ", after: ".", answer: "triste" },
  { before: "Je suis très ", after: " parce que j'ai beaucoup travaillé.", answer: "fatigué" },
  { before: "Il a mal à la ", after: ".", answer: "tête" },
  { before: "Elle est très ", after: ".", answer: "contente" },
  { before: "Il est très ", after: ".", answer: "content" },
  { before: "Il a mal aux ", after: " après avoir couru.", answer: "pieds" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il a mal", "à la tête", "."], sentence: "Il a mal à la tête." },
  { chunks: ["Elle est", "très contente", "."], sentence: "Elle est très contente." },
  { chunks: ["Comment te sens-tu", "aujourd'hui", "?"], sentence: "Comment te sens-tu aujourd'hui ?" },
];

export const feelingsSpeaking: Skill = {
  id: "g8-fr-ls-feelings",
  code: "LS.7",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Feelings and emotions",
  description: "Express feelings and describe aches using body-part vocabulary in French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const feelings = shuffle(rng, FEELINGS).slice(0, 4).map((f) => f.word);
      const bodyParts = shuffle(rng, BODY_PARTS).slice(0, 3).map((b) => b.word);
      const items = shuffle(rng, [...feelings, ...bodyParts]);
      const correctBucket: Record<string, string> = {};
      for (const f of feelings) correctBucket[f] = "feeling";
      for (const b of bodyParts) correctBucket[b] = "body";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Feeling or a Body part.",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "feeling", label: "Feeling" },
          { id: "body", label: "Body part" },
        ],
        correctBucket,
        hint: "Feelings describe an emotion; body parts name something on your body.",
        explanation: `Feelings: ${feelings.join(", ")}. Body parts: ${bodyParts.join(", ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French sentence about feelings.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the feeling or body part being described, and match the gender of the subject.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about feelings.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Read the pieces aloud in different orders until the sentence sounds right.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const f = randChoice(rng, FEELINGS);
      const distractors = shuffle(rng, FEELINGS.filter((x) => x.word !== f.word)).slice(0, 3).map((x) => x.meaning);
      const choices = shuffle(rng, [f.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Que veut dire "${f.word}" en anglais ?`,
        choices,
        correctIndex: choices.indexOf(f.meaning),
        layout: "list",
        hint: "Think about which emotion this French word describes.",
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
      prompt: "Match each French feeling word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Content(e)' and 'heureux/heureuse' both mean happy, but they're different adjectives.",
      explanation: chosen.map((f) => `"${f.word}" means "${f.meaning}".`).join(" "),
    };
  },
};
