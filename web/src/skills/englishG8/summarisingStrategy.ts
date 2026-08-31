import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Fatuma's new radio crackled once, then went silent, just two days after she bought it, and she almost threw it away, thinking she had wasted her money. Her older sister reminded her that under consumer protection rules, a shop must repair, replace, or refund a faulty item bought recently, as long as the customer has proof of purchase. Fatuma dug out her receipt and returned to the electronics shop the next morning, her hands trembling slightly as she pulled it from her bag. The shop smelled faintly of new plastic and dust. At first, the shopkeeper frowned and hesitated, but when Fatuma calmly explained her rights and showed the receipt, he agreed to exchange the radio for a working one. Fatuma later told her friends to always keep receipts, since proof of purchase is often the first thing a shop will ask for when something goes wrong.";

const KEY_POINTS = [
  "Fatuma's new radio stopped working two days after purchase",
  "Consumer protection rules require faulty items to be repaired, replaced, or refunded",
  "Proof of purchase, such as a receipt, is necessary to claim this right",
  "The shopkeeper exchanged the radio after Fatuma explained her rights",
];

const MINOR_DETAILS = [
  "Fatuma almost threw the radio away at first",
  "Her older sister reminded her of her consumer rights",
  "The shopkeeper frowned and hesitated at first",
  "Fatuma told her friends to always keep receipts",
];

const SUMMARY_OPTIONS = {
  correct: "When Fatuma's new radio broke, she used her receipt and knowledge of consumer rights to get it exchanged",
  distractors: [
    "Fatuma kept her receipt",
    "Shops in Kenya never honour consumer rights",
    "Fatuma's sister repaired the radio herself",
  ],
};

const SENSE_PHRASES: { sense: string; phrase: string }[] = [
  { sense: "Sound", phrase: "the radio crackled once, then went silent" },
  { sense: "Touch", phrase: "her hands trembling slightly as she pulled it from her bag" },
  { sense: "Smell", phrase: "the shop smelled faintly of new plastic and dust" },
  { sense: "Sight", phrase: "the shopkeeper frowned and hesitated" },
];

const EVENTS = [
  { id: "e1", label: "Fatuma's new radio crackles once, then goes silent" },
  { id: "e2", label: "Her sister reminds her of her consumer rights" },
  { id: "e3", label: "Fatuma finds her receipt and returns to the shop" },
  { id: "e4", label: "The shopkeeper hesitates, then agrees to exchange the radio" },
  { id: "e5", label: "Fatuma tells her friends to always keep receipts" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How do you identify the key points while reading a text?",
    correct: "By looking for the ideas that the rest of the text is built around, and setting aside minor illustrative details",
    distractors: ["By counting how many times the letter 'a' appears", "By only reading the very first sentence of the text", "By memorising the text word for word"],
  },
  {
    q: "Which words can bring out the five senses in a text?",
    correct: "Descriptive words about sounds, smells, sights, tastes, or textures, such as 'crackled' or 'smelled faintly'",
    distractors: ["Only numbers and dates", "Only the names of people mentioned", "Only punctuation marks like commas"],
  },
];

export const summarisingStrategy: Skill = {
  id: "g8-eng-r-summarising-strategy",
  code: "R.25",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Comprehension Strategies - Summarising",
  description: "Identify key points, sensory language, and events in a passage about consumer protection, then choose the best summary of its meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-summary", "match", "fill", "order"] as const);
    const hint = "A key point captures an important idea; supporting details add colour. A good summary keeps only the key points, in your own words.";

    if (branch === "categorize") {
      const chosenMinor = shuffle(rng, MINOR_DETAILS).slice(0, 2);
      const chosen = shuffle(rng, [
        ...KEY_POINTS.map((t) => ({ text: t, bucket: "key" })),
        ...chosenMinor.map((t) => ({ text: t, bucket: "minor" })),
      ]);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement into Key point or Supporting detail.",
        items,
        buckets: [
          { id: "key", label: "Key point" },
          { id: "minor", label: "Supporting detail" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is a ${c.bucket === "key" ? "key point" : "supporting detail"}.`).join(" "),
      };
    }

    if (branch === "mc-summary") {
      const choices = shuffle(rng, [SUMMARY_OPTIONS.correct, ...SUMMARY_OPTIONS.distractors]);
      return {
        kind: "multiple-choice",
        passage: PASSAGE,
        prompt: "Which sentence best summarises the passage without losing its key meaning?",
        choices,
        correctIndex: choices.indexOf(SUMMARY_OPTIONS.correct),
        layout: "list",
        hint: "A good summary is not too narrow (missing the main resolution), too broad (making an untrue general claim), or inaccurate.",
        explanation: `"${SUMMARY_OPTIONS.correct}" captures the passage's key points concisely and accurately — the other options are either too narrow, an untrue generalisation, or factually wrong.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, SENSE_PHRASES.map((s) => ({ id: s.sense, label: s.sense })));
      const targets = shuffle(rng, SENSE_PHRASES.map((s) => ({ id: s.sense, label: s.phrase })));
      const correctMap: Record<string, string> = {};
      for (const s of SENSE_PHRASES) correctMap[s.sense] = s.sense;
      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each sense to the phrase in the passage that appeals to it, helping create a mental image.",
        tokens,
        targets,
        correctMap,
        hint: "Look for words describing sounds, smells, sights, or physical feelings in the passage.",
        explanation: SENSE_PHRASES.map((s) => `${s.sense} — "${s.phrase}."`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the passage.",
        before: "Fatuma later told her friends to always keep",
        after: ", since proof of purchase is often the first thing a shop will ask for.",
        correctAnswer: "receipts",
        inputMode: "text",
        hint: "The exact word is stated directly in the passage above.",
        explanation: "The passage reads: \"Fatuma later told her friends to always keep receipts, since proof of purchase is often the first thing a shop will ask for.\"",
      };
    }

    if (rng() < 0.5) {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Arrange the events of the passage in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "Follow the passage from the radio breaking to Fatuma's advice to her friends at the end.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
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
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
