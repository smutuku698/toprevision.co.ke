import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Doctor: Good morning! Where does it hurt today?",
  "Otieno: My ra's hurts a little.",
  "Doctor: Does your fam hurt too?",
  "Otieno: No, but my zahr hurts when I sit.",
  "Doctor: Are your yad and rijl okay?",
  "Otieno: Yes, they feel fine. Only my udhun feels strange.",
  "Doctor: What about your anf?",
  "Otieno: My anf is fine too!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to the doctor's visit. Which body part hurts Otieno a little, first?",
    correct: "His ra's (head)",
    distractors: ["His fam (mouth)", "His zahr (back)", "His udhun (ear)"],
    explanation: "Otieno says, \"My ra's hurts a little.\"",
  },
  {
    q: "Does Otieno say his fam hurts?",
    correct: "No",
    distractors: ["Yes, a lot", "Yes, a little", "He does not say"],
    explanation: "Otieno replies \"No\" when the doctor asks about his fam.",
  },
  {
    q: "When does Otieno say his zahr hurts?",
    correct: "When he sits",
    distractors: ["When he walks", "When he wakes up", "It never hurts"],
    explanation: "Otieno says, \"my zahr hurts when I sit.\"",
  },
  {
    q: "Which part does Otieno say feels strange today?",
    correct: "His udhun (ear)",
    distractors: ["His anf (nose)", "His yad (hand)", "His rijl (leg)"],
    explanation: "Otieno says, \"Only my udhun feels strange.\"",
  },
];

const ORDER_SETS: { chunks: string[]; description: string }[] = [
  { chunks: ["ra's", "udhun", "anf", "fam"], description: "head, ear, nose, mouth (top to bottom)" },
  { chunks: ["ra's", "yad", "zahr", "rijl"], description: "head, hand, back, leg (top to bottom)" },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "ra's", meaning: "head" },
  { term: "yad", meaning: "hand" },
  { term: "rijl", meaning: "leg / foot" },
  { term: "udhun", meaning: "ear" },
  { term: "anf", meaning: "nose" },
  { term: "fam", meaning: "mouth" },
  { term: "zahr", meaning: "back" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "If your head hurts, you would say aloud: my ", after: " hurts.", answer: "ra's" },
  { before: "If your ear feels strange, you would say aloud: my ", after: " feels strange.", answer: "udhun" },
  { before: "The word you'd say for 'hand' is ", after: ".", answer: "yad" },
  { before: "The word you'd say for 'back' is ", after: ".", answer: "zahr" },
];

export const bodySpeaking: Skill = {
  id: "g8-ar-ls-body",
  code: "LS.7",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: describing how you feel",
  description: "Listen to a spoken doctor's visit, answer comprehension questions, and practise saying body-part words aloud to describe how you feel.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "click-match", "ordering", "fill"] as const);

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        speakable: true,
        prompt: "Match each spoken body-part word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each body-part word aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        speakable: true,
        prompt: `When describing yourself aloud, say these body-part words in this order: ${set.description}.`,
        instruction: "Click the words in the correct order.",
        items,
        correctOrder,
        hint: "Picture yourself from head to toe as you order the words.",
        explanation: `The correct order is: ${set.chunks.join(", ")} (${set.description}).`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        speakable: true,
        prompt: "Fill in what you would say aloud to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the body-part words you've learned.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      speakable: true,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Listen for which body part Otieno mentions in each line.",
      explanation: q.explanation,
    };
  },
};
