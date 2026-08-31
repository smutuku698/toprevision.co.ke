import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { BODY_VOCAB, name, place } from "./shared";

// Sub-strand 3.7 Guided Writing: Sentences — Theme: Body Parts.
// Content: vocabulary bank / mind map of body-part words, construct simple sentences expressing
// feeling (explicit example: "I brush my teeth every morning"), jumbled words into sentences,
// jumbled sentences into a paragraph.

const FEELING_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} writes "Anaa unaddifu asnaani kulla sabah." What is ${n} describing?`,
    correct: "brushing their teeth every morning",
    distractors: ["washing their hair every morning", "walking to school every morning", "eating breakfast every morning"],
    explanation: `"Anaa unaddifu asnaani kulla sabah" means "I brush my teeth every morning" — the source's explicit example sentence.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} writes "Yadaya nazifatan ba'da al-ghasl." What is ${n} expressing?`,
    correct: "that their hands are clean after washing",
    distractors: ["that their hands hurt", "that they are hungry", "that they are tired"],
    explanation: `"Yadaya nazifatan ba'da al-ghasl" means "my hands are clean after washing".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} writes "Rijlaya mut'ibatan ba'da al-jary." What is ${n} feeling?`,
    correct: "tired legs after running",
    distractors: ["happy legs after running", "clean legs after running", "cold legs after running"],
    explanation: `"Rijlaya mut'ibatan ba'da al-jary" means "my legs are tired after running".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} writes "Aynaya ta'lamani ba'da al-qira'a al-tawila." What is ${n} expressing?`,
    correct: "eyes hurting after long reading",
    distractors: ["eyes feeling great after reading", "ears hurting after reading", "no discomfort at all"],
    explanation: `"Aynaya ta'lamani ba'da al-qira'a al-tawila" means "my eyes hurt after long reading".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} writes "Sha'ri tawil wa jameel." What is ${n} describing?`,
    correct: "long, beautiful hair",
    distractors: ["short, messy hair", "no hair at all", "curly, short hair"],
    explanation: `"Sha'ri tawil wa jameel" means "my hair is long and beautiful".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} writes "Fami jaaf ba'da al-riyada." What is ${n} feeling?`,
    correct: "a dry mouth after exercise",
    distractors: ["a full stomach after exercise", "cold hands after exercise", "sore ears after exercise"],
    explanation: `"Fami jaaf ba'da al-riyada" means "my mouth is dry after exercise".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} writes "Wajhi mubtasim al-yawm." What is ${n} expressing?`,
    correct: "a smiling face today",
    distractors: ["a sad face today", "a tired face today", "an injured face today"],
    explanation: `"Wajhi mubtasim al-yawm" means "my face is smiling today".`,
  }),
];

const MIND_MAP_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "What is the purpose of building a vocabulary bank or mind map before writing sentences about the body?", correct: "to gather and organise body-part words you can use in your sentences", distractors: ["to avoid writing any sentences at all", "to replace reading a passage entirely", "to only practise spelling numbers"], explanation: "A vocabulary bank/mind map collects the words a writer will draw on when constructing sentences." },
  { q: "In a mind map about the body, which word would branch off the centre alongside 'yad' (hand)?", correct: "rijl (leg) — another body part", distractors: ["shukran (thank you) — a greeting word", "sabah al-khair (good morning) — a greeting", "kurat al-qadam (football) — a sport"], explanation: "A body-parts mind map groups body-part words together, not unrelated greeting or sport words." },
  { q: "Why is grouping related words (like all body parts) together useful before writing?", correct: "it makes it easier to find and use the right word while writing sentences", distractors: ["it makes the words harder to find", "it is required by no writing process", "it changes the meaning of the words"], explanation: "Grouping related vocabulary together is a planning step that speeds up sentence construction." },
];

const JUMBLED_WORD_SETS: { words: string[]; correct: string }[] = [
  { words: ["asnaani", "unaddifu", "kulla", "sabah", "anaa"], correct: "anaa unaddifu asnaani kulla sabah" },
  { words: ["nazifatan", "yadaya", "al-ghasl", "ba'da"], correct: "yadaya nazifatan ba'da al-ghasl" },
  { words: ["mut'ibatan", "al-jary", "rijlaya", "ba'da"], correct: "rijlaya mut'ibatan ba'da al-jary" },
  { words: ["jameel", "tawil", "wa", "sha'ri"], correct: "sha'ri tawil wa jameel" },
  { words: ["al-yawm", "mubtasim", "wajhi"], correct: "wajhi mubtasim al-yawm" },
];

const PARAGRAPH_SETS: ((n: string, p: string) => { sentences: string[] })[] = [
  (n, p) => ({
    sentences: [
      `${n} yastayqizu mubakkiran fi ${p}.`,
      `Yaghsilu wajhahu wa yadayhi awwalan.`,
      `Anaa unaddifu asnaani kulla sabah, yaqulu ${n}.`,
      `Ba'da dhalika, yartadi malabisahu li al-madrasa.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Ba'da al-riyada fi ${p}, ${n} yash'uru bi ta'ab.`,
      `Rijlaya mut'ibatan, yaqulu ${n}.`,
      `Yashrabu maa'an kathiran li yartaha.`,
      `Ba'da qaleel, yash'uru bitahsun.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `${n} yaqra'u kitaban tawilan fi ${p}.`,
      `Ba'da sa'a, aynaya ta'lamani, yaqulu ${n}.`,
      `Yartahu qaleelan 'an al-qira'a.`,
      `Thumma yakmulu al-kitab bihaman akbar.`,
    ],
  }),
];

export const bodyWriting: Skill = {
  id: "g6-ar-w-body",
  code: "W.7",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: sentences (body parts)",
  description: "Build a vocabulary bank of body-part words, construct sentences expressing feeling, and arrange jumbled words and sentences correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["feeling", "mindmap", "jumbledWords", "match", "ordering"] as const);

    if (branch === "feeling") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, FEELING_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          "Read the sentence and choose what it expresses.",
          "What feeling or action is being described?",
          "Work out what this sentence means.",
          "Choose the meaning that matches this written sentence.",
          "What is being expressed in this sentence?",
        ]) + " " + q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Look for the body-part word and the feeling/action word around it.",
        explanation: q.explanation,
      };
    }

    if (branch === "mindmap") {
      const q = randChoice(rng, MIND_MAP_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "A mind map/vocabulary bank groups words by topic before you write with them.",
        explanation: q.explanation,
      };
    }

    if (branch === "jumbledWords") {
      const set = randChoice(rng, JUMBLED_WORD_SETS);
      const shuffled = shuffle(rng, set.words);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          `Unscramble these words into a correct sentence: ${shuffled.join(" / ")}`,
          `Rearrange these jumbled words into a correct sentence: ${shuffled.join(" / ")}`,
          `Put these words in order to form a correct sentence: ${shuffled.join(" / ")}`,
          `What sentence do these jumbled words form? ${shuffled.join(" / ")}`,
          `Reorder these words into a correct sentence: ${shuffled.join(" / ")}`,
        ]),
        before: "",
        after: "",
        correctAnswer: set.correct,
        inputMode: "text",
        hint: "Start with the subject (e.g. 'anaa'/'yadaya'/'rijlaya'), then the verb or description, then any time phrase.",
        explanation: `The correct sentence is: "${set.correct}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, BODY_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Build your vocabulary bank: match each body-part word to its meaning.",
          "Match the word to what it means.",
          "Which meaning goes with which body-part word?",
          "Pair each body-part word with its correct meaning.",
          "Match each word to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Recall the body-part vocabulary you've practised writing.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    const n = name(rng);
    const p = place(rng);
    const set = randChoice(rng, PARAGRAPH_SETS)(n, p);
    const withIds = set.sentences.map((s, i) => ({ id: `${i}-${s}`, label: s }));
    const items = shuffle(rng, withIds);
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        "Arrange these jumbled sentences into a well-sequenced paragraph.",
        "Put these sentences in the order that makes a coherent paragraph.",
        "Sequence these sentences to form a logical paragraph about a daily routine.",
        "Rearrange the jumbled sentences into the correct paragraph order.",
        "Which order turns these sentences into a clear paragraph?",
      ]),
      instruction: "Click the sentences in the correct order.",
      items,
      correctOrder: withIds.map((w) => w.id),
      hint: "Follow the natural order of a routine, from waking up or starting an activity to how it ends.",
      explanation: `A well-sequenced paragraph reads:\n${set.sentences.join("\n")}`,
    };
  },
};
