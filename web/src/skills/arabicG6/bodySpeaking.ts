import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { POLITE_VOCAB, name, place } from "./shared";

// Sub-strand 1.7 Conversational Skills — Theme: Body Parts.
// Content: identify polite words used to interrupt politely, apply etiquette/turn-taking in
// conversation, practise pronunciation focusing on makhariju huruf (articulation points).
// Key inquiry (source): "How do you take care of your body?" / "Why should we observe etiquette
// in conversations?"

const ETIQUETTE_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} wants to speak while a classmate is talking, so ${n} raises a hand and says "min fadlik, mumkin atadakhal?" What is ${n} doing?`,
    correct: "politely asking permission to interrupt",
    distractors: ["interrupting rudely without asking", "ending the conversation", "greeting the classmate for the first time"],
    explanation: `"min fadlik, mumkin atadakhal?" means "please, may I interrupt?" — a polite way to enter a conversation.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} accidentally speaks over a friend and quickly says "asif." What is ${n} doing?`,
    correct: "apologising",
    distractors: ["asking a question", "thanking the friend", "changing the subject"],
    explanation: `"asif" means "sorry" — used here to apologise for speaking over someone.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} wants to pass by while two people are talking and says "law samaht." What is ${n} doing?`,
    correct: "politely asking to be excused",
    distractors: ["asking someone's name", "thanking someone", "saying goodbye"],
    explanation: `"law samaht" means "excuse me" (formal) — used to politely ask to pass or interrupt.`,
  }),
  (n, p) => ({
    prompt: `A classmate helps ${n} in ${p}, and ${n} replies "shukran." What is ${n} doing?`,
    correct: "thanking the classmate",
    distractors: ["apologising", "interrupting", "greeting"],
    explanation: `"shukran" means "thank you" — an expression of gratitude, not an interruption word.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} bumps into a friend by accident during a group discussion and says "afwan." What is ${n} doing?`,
    correct: "excusing themselves / apologising",
    distractors: ["asking to interrupt", "thanking someone", "asking a question"],
    explanation: `"afwan" means "excuse me / pardon" — used here as a quick apology for the accidental bump.`,
  }),
  (n, p) => ({
    prompt: `Why does ${n} in ${p} say "min fadlik" before asking to speak in a group discussion?`,
    correct: "to be polite and show respect for others speaking",
    distractors: ["because it means goodbye", "because it means thank you", "because it is required grammar with no meaning"],
    explanation: `"min fadlik" means "please" — it softens the request to speak, showing respect for turn-taking.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} waits for a pause, then politely says "mumkin atadakhal?" before sharing an idea. What conversational skill is ${n} showing?`,
    correct: "turn-taking etiquette",
    distractors: ["ignoring the group", "interrupting without waiting", "ending the discussion"],
    explanation: `Waiting for a pause and asking permission to interrupt shows good turn-taking etiquette.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} interrupts a friend without saying any polite word first. What etiquette rule is ${n} breaking?`,
    correct: "not asking permission before interrupting",
    distractors: ["speaking too quietly", "using too many greeting words", "speaking in the wrong language"],
    explanation: `Politely interrupting requires a phrase like "min fadlik, mumkin atadakhal?" first — skipping this breaks etiquette.`,
  }),
];

const MAKHARIJ_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "What does 'makhariju huruf' refer to in Arabic pronunciation practice?", correct: "the exact points in the mouth/throat where each letter's sound is produced", distractors: ["the meaning of a word", "the spelling of a word", "the order of words in a sentence"], explanation: "Makhariju huruf are the articulation points — where in the mouth/throat each Arabic letter sound is produced." },
  { q: "Why do learners practise makhariju huruf while learning polite conversation phrases?", correct: "to pronounce each letter's sound accurately and clearly", distractors: ["to memorise grammar rules", "to write faster", "to translate into English"], explanation: "Focusing on articulation points (makhariju huruf) helps produce each sound accurately." },
  { q: "If a learner mispronounces the articulation point of a letter, what is most affected?", correct: "how clearly the word is understood by a listener", distractors: ["the spelling of the written word", "the meaning always stays exactly the same", "nothing at all changes"], explanation: "Getting an articulation point wrong can make a word unclear or hard to understand." },
  { q: "Practising pronunciation while focusing on makhariju huruf is paired with which conversational skill in this sub-strand?", correct: "identifying and using polite interruption words correctly", distractors: ["writing a long essay", "drawing a diagram", "solving a maths problem"], explanation: "The sub-strand links accurate pronunciation practice with polite conversational etiquette." },
];

const CATEGORY_ITEMS: { word: string; bucket: "Asking permission" | "Apologising" | "Thanking" }[] = [
  { word: "min fadlik", bucket: "Asking permission" },
  { word: "mumkin atadakhal", bucket: "Asking permission" },
  { word: "law samaht", bucket: "Asking permission" },
  { word: "asif", bucket: "Apologising" },
  { word: "afwan", bucket: "Apologising" },
  { word: "shukran", bucket: "Thanking" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["A classmate is speaking (wait for a pause)", "min fadlik (say please)", "mumkin atadakhal? (ask may I interrupt)", "share your idea only after being allowed"] },
  { lines: ["You accidentally speak over someone", "asif (say sorry)", "let them finish their point", "then wait for your turn"] },
  { lines: ["You need to pass by two people talking", "law samaht (say excuse me)", "wait for them to notice you", "pass by politely"] },
  { lines: ["A friend helps you during a discussion", "shukran (say thank you)", "afwan (they reply you're welcome)", "the discussion continues"] },
];

export const bodySpeaking: Skill = {
  id: "g6-ar-ls-body",
  code: "LS.7",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Conversational skills: polite interruption and etiquette",
  description: "Identify and use polite words for interrupting a conversation, practise turn-taking etiquette, and pronounce phrases accurately.",
  generate(rng) {
    const branch = randChoice(rng, ["etiquette", "makharij", "match", "categorize", "ordering"] as const);

    if (branch === "etiquette") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, ETIQUETTE_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          "Read the situation and choose what is happening.",
          "What conversational skill is being shown here?",
          "Work out what is being expressed in this exchange.",
          "Choose the meaning that fits this situation.",
          "What is this phrase being used for here?",
        ]) + " " + q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Match the phrase to its etiquette purpose: asking permission, apologising, or thanking.",
        explanation: q.explanation,
      };
    }

    if (branch === "makharij") {
      const q = randChoice(rng, MAKHARIJ_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Makhariju huruf = the mouth/throat points where each letter sound is produced.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, POLITE_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each polite phrase to its meaning.",
          "Match the etiquette phrase to what it means.",
          "Which meaning goes with which polite phrase?",
          "Pair each polite phrase with its correct meaning.",
          "Match each phrase to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each phrase aloud to yourself before matching it.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen2 = shuffle(rng, CATEGORY_ITEMS).slice(0, 5);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each phrase: Asking permission, Apologising, or Thanking?",
          "Group these phrases by what they are used for.",
          "Sort each polite phrase into the correct category.",
          "Which category does each phrase belong to?",
          "Classify each etiquette phrase below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Asking permission", label: "Asking permission" },
          { id: "Apologising", label: "Apologising" },
          { id: "Thanking", label: "Thanking" },
        ],
        correctBucket,
        hint: "'min fadlik'/'mumkin atadakhal'/'law samaht' ask permission; 'asif'/'afwan' apologise; 'shukran' thanks.",
        explanation: chosen2.map((c) => `"${c.word}" is used for ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
    const items = shuffle(rng, withIds);
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        "Put these steps of a polite conversation exchange in order.",
        "Arrange this etiquette exchange in a sensible order.",
        "Order the steps as they would naturally happen.",
        "Sequence this polite exchange correctly.",
        "Which order makes this exchange make sense?",
      ]),
      instruction: "Click the steps in the correct order.",
      items,
      correctOrder: withIds.map((w) => w.id),
      hint: "Wait for the right moment, use the polite phrase, then continue the conversation respectfully.",
      explanation: `A natural order is:\n${set.lines.join("\n")}`,
    };
  },
};
