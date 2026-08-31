import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type FunctionId = "continuous" | "perfect" | "passive" | "do-support";

const FUNCTIONS: { id: FunctionId; label: string; desc: string }[] = [
  { id: "continuous", label: "Forms the continuous tense", desc: "be + a main verb ending in -ing, showing an action in progress" },
  { id: "perfect", label: "Forms the perfect tense", desc: "have + the past participle of the main verb, showing a completed action" },
  { id: "passive", label: "Forms the passive voice", desc: "be + the past participle, showing the subject receives the action" },
  { id: "do-support", label: "Forms questions and negatives", desc: "do / does / did + the base verb, used to ask questions or make negative statements" },
] as const;

const AUX_EXAMPLES: { sentence: string; aux: string; functionId: FunctionId }[] = [
  { sentence: "She is reading about pollution levels in the lake.", aux: "is", functionId: "continuous" },
  { sentence: "The workers were cleaning the riverbank yesterday.", aux: "were", functionId: "continuous" },
  { sentence: "They have finished the recycling project.", aux: "have", functionId: "perfect" },
  { sentence: "The factory had dumped waste before the inspection.", aux: "had", functionId: "perfect" },
  { sentence: "Plastic bottles are recycled every week at the centre.", aux: "are", functionId: "passive" },
  { sentence: "The river was polluted by chemical waste.", aux: "was", functionId: "passive" },
  { sentence: "Do you separate your rubbish for recycling?", aux: "Do", functionId: "do-support" },
  { sentence: "He does not litter in public places.", aux: "does", functionId: "do-support" },
  { sentence: "Did the factory report the chemical spill?", aux: "Did", functionId: "do-support" },
] as const;

const PRIMARY_VS_MODAL: { word: string; type: "primary" | "modal" }[] = [
  { word: "is", type: "primary" },
  { word: "are", type: "primary" },
  { word: "was", type: "primary" },
  { word: "were", type: "primary" },
  { word: "have", type: "primary" },
  { word: "has", type: "primary" },
  { word: "had", type: "primary" },
  { word: "do", type: "primary" },
  { word: "does", type: "primary" },
  { word: "did", type: "primary" },
  { word: "can", type: "modal" },
  { word: "could", type: "modal" },
  { word: "will", type: "modal" },
  { word: "would", type: "modal" },
  { word: "shall", type: "modal" },
  { word: "should", type: "modal" },
  { word: "must", type: "modal" },
  { word: "may", type: "modal" },
  { word: "might", type: "modal" },
] as const;

const FILL_SENTENCES: { before: string; after: string; answer: string; functionId: FunctionId }[] = [
  { before: "Workers ", after: " cleaning the polluted riverbank all morning.", answer: "were", functionId: "continuous" },
  { before: "The new recycling law ", after: " passed by parliament last year.", answer: "was", functionId: "passive" },
  { before: "", after: " you know how factories treat waste water?", answer: "Do", functionId: "do-support" },
  { before: "She ", after: " not throw litter into the drainage system.", answer: "does", functionId: "do-support" },
  { before: "The residents ", after: " already reported three cases of illegal dumping.", answer: "have", functionId: "perfect" },
  { before: "Fresh air ", after: " being restored slowly around the cleaned-up factory.", answer: "is", functionId: "continuous" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these is a primary auxiliary verb, not a modal auxiliary verb?",
    correct: "has",
    distractors: ["must", "should", "might"],
  },
  {
    q: "What is the role of a primary auxiliary verb in a sentence?",
    correct: "It combines with a main verb to help show tense, form questions or negatives, or build the passive voice",
    distractors: [
      "It always replaces the main verb completely",
      "It only appears in sentences about the future",
      "It changes a noun into a verb",
    ],
  },
  {
    q: "Which family of primary auxiliary verbs is used to form the perfect tense?",
    correct: "have (have / has / had)",
    distractors: ["be (am / is / are)", "do (do / does / did)", "modal verbs (can / will / must)"],
  },
  {
    q: "Which of these words is a modal auxiliary rather than a primary auxiliary?",
    correct: "will",
    distractors: ["was", "did", "having"],
  },
];

export const primaryAuxiliaries: Skill = {
  id: "g8-eng-g-primary-auxiliaries",
  code: "G.3",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Primary Auxiliaries",
  description: "Identify the primary auxiliary verbs be, have, and do, and use them correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "function-mc", "fill", "concept"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FUNCTIONS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FUNCTIONS.map((f) => ({ id: f.id, label: f.desc })));
      const correctMap: Record<string, string> = {};
      for (const f of FUNCTIONS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each function of a primary auxiliary verb to how it is formed.",
        tokens,
        targets,
        correctMap,
        hint: "The three primary auxiliaries are be, have, and do — each has its own job alongside a main verb.",
        explanation: FUNCTIONS.map((f) => `${f.label}: ${f.desc}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const primaries = shuffle(rng, PRIMARY_VS_MODAL.filter((p) => p.type === "primary")).slice(0, 4);
      const modals = shuffle(rng, PRIMARY_VS_MODAL.filter((p) => p.type === "modal")).slice(0, 3);
      const chosen = shuffle(rng, [...primaries, ...modals]);
      const buckets = [
        { id: "primary", label: "Primary auxiliary (be, have, do)" },
        { id: "modal", label: "Modal auxiliary (can, will, must...)" },
      ];
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each verb by whether it is a primary auxiliary or a modal auxiliary.",
        items,
        buckets,
        correctBucket,
        hint: "The primary auxiliaries are forms of be, have, and do. Modal auxiliaries express ability, permission, possibility, or obligation.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.type} auxiliary.`).join(" "),
      };
    }

    if (branch === "function-mc") {
      const entry = randChoice(rng, AUX_EXAMPLES);
      const correctFn = FUNCTIONS.find((f) => f.id === entry.functionId)!;
      const choices = shuffle(rng, FUNCTIONS.map((f) => f.label));
      return {
        kind: "multiple-choice",
        prompt: `In the sentence "${entry.sentence}", what function does the primary auxiliary "${entry.aux}" perform?`,
        choices,
        correctIndex: choices.indexOf(correctFn.label),
        layout: "list",
        hint: "Look at what comes after the auxiliary verb: an -ing form, a past participle, or the base verb in a question or negative.",
        explanation: `"${entry.aux}" ${correctFn.desc.charAt(0).toLowerCase()}${correctFn.desc.slice(1)}, so it ${correctFn.label.toLowerCase()}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: "Fill in the correct primary auxiliary verb to complete the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        inputMode: "text",
        hint: "Check the subject of the sentence and whether the main verb needs an -ing form, a past participle, or its base form.",
        explanation: `"${entry.answer}" is the correct primary auxiliary here: "${entry.before}${entry.answer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Remember: be, have, and do are the primary auxiliaries; can, will, must, and similar words are modal auxiliaries.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
