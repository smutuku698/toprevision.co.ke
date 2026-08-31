import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const IRREGULAR_PAST: { base: string; past: string }[] = [
  { base: "go", past: "went" },
  { base: "buy", past: "bought" },
  { base: "see", past: "saw" },
  { base: "eat", past: "ate" },
  { base: "take", past: "took" },
  { base: "choose", past: "chose" },
  { base: "pay", past: "paid" },
  { base: "sell", past: "sold" },
  { base: "spend", past: "spent" },
  { base: "bring", past: "brought" },
  { base: "know", past: "knew" },
  { base: "think", past: "thought" },
] as const;

const FILL_PAST_SENTENCES: { before: string; verb: string; after: string; past: string; rule: string }[] = [
  { before: "Yesterday, the customer ", verb: "shop", after: " for fresh vegetables at the market.", past: "shopped", rule: "double the final consonant before adding -ed" },
  { before: "Before buying the shoes, she ", verb: "compare", after: " prices at three different shops.", past: "compared", rule: "add only -d, since the verb already ends in 'e'" },
  { before: "The shopkeeper ", verb: "carry", after: " the heavy sacks of maize into the store.", past: "carried", rule: "change 'y' to 'i' before adding -ed" },
  { before: "After the warranty expired, he ", verb: "complain", after: " about the faulty radio to the seller.", past: "complained", rule: "simply add -ed to the base verb" },
  { before: "Last week, the family ", verb: "plan", after: " their monthly shopping budget carefully.", past: "planned", rule: "double the final consonant before adding -ed" },
  { before: "The customer ", verb: "try", after: " on three pairs of shoes before deciding.", past: "tried", rule: "change 'y' to 'i' before adding -ed" },
];

const PRESENT_AGREEMENT: { before: string; verb: string; after: string; form: string }[] = [
  { before: "The shopkeeper always ", verb: "weigh", after: " the fruit before selling it.", form: "weighs" },
  { before: "This shop ", verb: "sell", after: " affordable school supplies.", form: "sells" },
  { before: "She ", verb: "watch", after: " for discounts before every purchase.", form: "watches" },
  { before: "He rarely ", verb: "wash", after: " the vegetables before weighing them.", form: "washes" },
  { before: "The cashier ", verb: "try", after: " to give the correct change every time.", form: "tries" },
  { before: "My uncle ", verb: "carry", after: " goods to the market every Saturday.", form: "carries" },
  { before: "That repair shop ", verb: "fix", after: " broken appliances for a small fee.", form: "fixes" },
  { before: "The clerk ", verb: "go", after: " through the receipts every evening.", form: "goes" },
];

const TENSE_SENTENCES: { text: string; tense: "present" | "past" }[] = [
  { text: "The vendor weighs the tomatoes carefully.", tense: "present" },
  { text: "She bought a new pair of shoes yesterday.", tense: "past" },
  { text: "Customers often compare prices before buying.", tense: "present" },
  { text: "He returned the faulty blender to the shop.", tense: "past" },
  { text: "The shop opens at eight every morning.", tense: "present" },
  { text: "They paid for the goods in cash.", tense: "past" },
  { text: "I always check the expiry date on food.", tense: "present" },
  { text: "We chose the cheaper brand last week.", tense: "past" },
  { text: "The manager rarely gives refunds.", tense: "present" },
  { text: "The seller sold the last packet this morning.", tense: "past" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to use the correct tense when communicating?",
    correct: "It helps the listener or reader know clearly when an action happened",
    distractors: [
      "It makes sentences sound more formal, regardless of meaning",
      "It has no real effect on how a message is understood",
      "It only matters in written English, never in speech",
    ],
  },
  {
    q: "Which sentence correctly uses the simple past tense?",
    correct: "She bought new shoes at the market.",
    distractors: ["She buys new shoes at the market.", "She buy new shoes at the market.", "She is buying new shoes at the market."],
  },
  {
    q: "Which sentence correctly uses the simple present tense with the right subject-verb agreement?",
    correct: "The shop sells fresh bread every morning.",
    distractors: ["The shop sell fresh bread every morning.", "The shop selling fresh bread every morning.", "The shop sold fresh bread every morning."],
  },
  {
    q: "Which of these sentences contains an error in the simple past tense?",
    correct: "Yesterday she goed to the market to buy vegetables.",
    distractors: ["Yesterday she went to the market to buy vegetables.", "Last week they paid for the repairs.", "He chose the blue shirt over the red one."],
  },
];

export const simplePresentPast: Skill = {
  id: "g8-eng-g-simple-present-past",
  code: "G.4",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Verbs and Tense: Simple Present and Simple Past",
  description: "Identify and correctly use verbs in the simple present and simple past tense.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "past-fill", "present-fill", "concept"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, IRREGULAR_PAST).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.base, label: v.base })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.base, label: v.past })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.base] = v.base;
      return {
        kind: "click-match",
        prompt: "Match each verb to its irregular simple past tense form.",
        tokens,
        targets,
        correctMap,
        hint: "These verbs do not simply add -ed to form the past tense — their past forms must be learned individually.",
        explanation: chosen.map((v) => `The simple past of "${v.base}" is "${v.past}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, TENSE_SENTENCES).slice(0, 6);
      const buckets = [
        { id: "present", label: "Simple present tense" },
        { id: "past", label: "Simple past tense" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.tense));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by its tense: simple present or simple past.",
        items,
        buckets,
        correctBucket,
        hint: "Simple present describes habits or facts now; simple past describes completed actions, often with words like 'yesterday' or 'last week'.",
        explanation: chosen.map((s) => `"${s.text}" is in the simple ${s.tense} tense.`).join(" "),
      };
    }

    if (branch === "past-fill") {
      const entry = randChoice(rng, FILL_PAST_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: `Fill in the simple past tense of the verb "${entry.verb}" to complete the sentence.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.past,
        inputMode: "text",
        hint: `To form the past tense here, ${entry.rule}.`,
        explanation: `The simple past of "${entry.verb}" is "${entry.past}" — to form it, ${entry.rule}: "${entry.before}${entry.past}${entry.after}"`,
      };
    }

    if (branch === "present-fill") {
      const entry = randChoice(rng, PRESENT_AGREEMENT);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct simple present tense form of the verb "${entry.verb}" to complete the sentence.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.form,
        inputMode: "text",
        hint: "With he, she, it, or a singular subject, the simple present verb usually ends in -s or -es.",
        explanation: `With a singular subject, "${entry.verb}" becomes "${entry.form}" in the simple present tense: "${entry.before}${entry.form}${entry.after}"`,
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
      hint: "Check the subject of the sentence and whether the action is a present habit/fact or a completed past event.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
