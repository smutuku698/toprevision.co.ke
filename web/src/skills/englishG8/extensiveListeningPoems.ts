import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM_TEXT =
  "Read the label, check the date, / before you buy, before too late. / Ask the price, compare, be wise, / don't let sweet talk cloud your eyes. / Keep your receipt, know your right, / report the wrong, stand and fight. / A careful buyer, sharp and free, / protects herself and her family.";

const MESSAGE_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "According to the poem, what should a buyer do before purchasing something?",
    correct: "Read the label and check the date",
    distractors: ["Buy the most expensive item available", "Avoid comparing prices between shops", "Trust every seller's word without question"],
  },
  {
    q: "According to the poem, what should a consumer keep after buying something?",
    correct: "The receipt",
    distractors: ["The shopping bag only", "Nothing, receipts are not important", "The seller's business card"],
  },
  {
    q: "What is the overall message of this poem?",
    correct: "Consumers should be careful, informed, and aware of their rights when buying goods",
    distractors: ["Sellers should always be trusted without question", "Prices never need to be compared between shops", "Consumer rights do not matter in everyday shopping"],
  },
  {
    q: "What does the poem urge a consumer to do if something is wrong with a purchase?",
    correct: "Report the wrong and stand up for their rights",
    distractors: ["Stay silent and accept any loss", "Return the item without any explanation", "Buy the same item again elsewhere"],
  },
];

const TECHNIQUE_EFFECTS: { technique: string; effect: string }[] = [
  { technique: "Pace", effect: "Controls how fast or slow lines are delivered, building emotion or urgency" },
  { technique: "Pause", effect: "Creates suspense or lets an important idea sink in before moving on" },
  { technique: "Volume", effect: "Shows the intensity of feeling, louder for strong emotion, softer for gentleness" },
  { technique: "Eye contact", effect: "Connects the performer directly with the audience" },
  { technique: "Gestures", effect: "Adds visual meaning to the words being spoken" },
  { technique: "Stress on key words", effect: "Highlights the most important words in a line" },
];

const VOCAL_TECHNIQUES = ["Pace", "Pause", "Volume", "Tone", "Pitch", "Stress on key words"];
const PHYSICAL_TECHNIQUES = ["Eye contact", "Gestures", "Facial expression", "Posture"];

const FILL_ITEMS = [
  { before: "Keep your receipt, know your", after: ".", correctAnswer: "right", acceptedAnswers: ["rights"] },
  { before: "Read the label, check the", after: ",", correctAnswer: "date" },
  { before: "Ask the price, compare, be", after: ",", correctAnswer: "wise" },
];

export const extensiveListeningPoems: Skill = {
  id: "g8-eng-ls-extensive-listening-poems",
  code: "LS.13",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Extensive Listening: Poems",
  description: "Identify the message in a poem and use appropriate performance techniques to perform it.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill"] as const);
    const hint = "Poems carry their message through word choice and rhyme, and are best performed using varied pace, pauses, volume, gestures and eye contact.";

    if (branch === "match") {
      const chosen = shuffle(rng, TECHNIQUE_EFFECTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.technique, label: t.technique })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.technique, label: t.effect })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.technique] = t.technique;
      return {
        kind: "click-match",
        prompt: "Match each performance technique to the effect it achieves.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.technique} — ${t.effect.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const vocal = shuffle(rng, VOCAL_TECHNIQUES).slice(0, 3);
      const physical = shuffle(rng, PHYSICAL_TECHNIQUES).slice(0, 3);
      const items = shuffle(rng, [
        ...vocal.map((label) => ({ id: label, label, bucket: "vocal" })),
        ...physical.map((label) => ({ id: label, label, bucket: "physical" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each performance element into Vocal technique or Physical technique.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "vocal", label: "Vocal technique" },
          { id: "physical", label: "Physical technique" },
        ],
        correctBucket,
        hint: "Vocal techniques change how the voice sounds; physical techniques involve the body.",
        explanation: `Vocal techniques: ${vocal.join(" / ")}. Physical techniques: ${physical.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing rhyming word from the poem.",
        passage: POEM_TEXT,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: "The missing word is given directly in the poem text above.",
        explanation: `The line reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, MESSAGE_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: POEM_TEXT,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
