import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface PassageEntry {
  passage: string;
  mainIdea: string;
  details: string[];
  mainQ: { correct: string; distractors: string[] };
  detailQ: { q: string; correct: string; distractors: string[] };
  fillBlank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] };
}

const PASSAGES: PassageEntry[] = [
  {
    passage:
      "Before buying cooking oil, Amina's mother always compares the price per litre of at least two brands instead of just picking the cheapest-looking bottle. Last Saturday, a large bottle of Brand A cost more overall but had a lower price per litre than the smaller, cheaper-looking Brand B. By checking the label and doing the maths, Amina's mother saved money by choosing Brand A, even though it looked more expensive on the shelf.",
    mainIdea: "Amina's mother compares the price per litre of different brands to get the best value, not just the lowest sticker price",
    details: ["Brand A's bottle cost more overall but had a lower price per litre.", "Brand B looked cheaper but was a smaller bottle.", "Checking the label and doing the maths saved money."],
    mainQ: {
      correct: "Amina's mother compares the price per litre of different brands to get the best value, not just the lowest sticker price",
      distractors: ["Amina's mother always buys the brand with the biggest label", "Amina's mother refuses to buy cooking oil at all", "Amina's mother only buys the cheapest-looking bottle without checking"],
    },
    detailQ: {
      q: "According to the passage, why did Amina's mother choose Brand A even though it looked more expensive?",
      correct: "It had a lower price per litre than Brand B",
      distractors: ["It came in a smaller bottle", "It was recommended by a friend", "It was the only brand available"],
    },
    fillBlank: { before: "By checking the label and doing the maths, Amina's mother saved", after: "by choosing Brand A.", correctAnswer: "money" },
  },
  {
    passage:
      "Before eating a packet of biscuits, Otieno checks the label for the expiry date and the list of ingredients, especially since his younger sister is allergic to peanuts. Once, he noticed a packet had expired three days earlier, even though it looked fine, so he returned it to the shop for a refund. Reading labels carefully has become a habit that helps his whole family avoid wasted money and health risks.",
    mainIdea: "Otieno reads product labels carefully to check expiry dates and ingredients, which helps his family stay safe and avoid waste",
    details: ["His sister is allergic to peanuts, so he checks ingredients.", "He once found a packet that had expired three days earlier.", "He returned the expired packet to the shop for a refund."],
    mainQ: {
      correct: "Otieno reads product labels carefully to check expiry dates and ingredients, which helps his family stay safe and avoid waste",
      distractors: ["Otieno never checks labels before eating anything", "Otieno's sister enjoys eating peanuts every day", "Otieno only buys biscuits that have no label at all"],
    },
    detailQ: {
      q: "According to the passage, why does Otieno pay special attention to the ingredients list?",
      correct: "His younger sister is allergic to peanuts",
      distractors: ["He dislikes the taste of biscuits", "He is trying to lose weight", "He wants to count the calories exactly"],
    },
    fillBlank: { before: "Once, he noticed a packet had expired three days earlier, so he returned it to the shop for a", after: ".", correctAnswer: "refund" },
  },
  {
    passage:
      "After buying what he thought was a genuine phone charger from a roadside stall, Kiplangat found it stopped working within a week and had no proper packaging or receipt. A consumer rights officer later explained that shoppers should always buy from licensed vendors and keep their receipts, since these make it much easier to return or exchange faulty goods. Kiplangat now buys electronics only from registered shops and keeps every receipt in a small folder.",
    mainIdea: "Kiplangat learned to protect himself as a consumer by buying from licensed vendors and keeping receipts after being sold a fake charger",
    details: ["The charger stopped working within a week.", "It had no proper packaging or receipt.", "A consumer rights officer advised buying from licensed vendors and keeping receipts."],
    mainQ: {
      correct: "Kiplangat learned to protect himself as a consumer by buying from licensed vendors and keeping receipts after being sold a fake charger",
      distractors: ["Kiplangat decided to stop using phone chargers altogether", "Kiplangat opened his own roadside stall selling chargers", "Kiplangat's charger worked perfectly for many years"],
    },
    detailQ: {
      q: "According to the passage, what advice did the consumer rights officer give?",
      correct: "Buy from licensed vendors and keep receipts, since these help with returning or exchanging faulty goods",
      distractors: ["Never buy electronics of any kind again", "Only buy chargers that are the cheapest available", "Avoid keeping any paperwork from a purchase"],
    },
    fillBlank: { before: "Kiplangat now buys electronics only from registered shops and keeps every", after: "in a small folder.", correctAnswer: "receipt", acceptedAnswers: ["receipts"] },
  },
];

const STRATEGIES: { name: string; description: string }[] = [
  { name: "Skimming", description: "Quickly looking over a text to get its general idea without reading every word" },
  { name: "Scanning", description: "Looking quickly for one specific piece of information, such as a price or a date" },
  { name: "Predicting", description: "Guessing what a text will be about before reading, using its title or headings" },
  { name: "Close reading", description: "Reading carefully, word by word, to fully understand every detail" },
];

const STRATEGY_STEPS = [
  { id: "predict", label: "Predict what the text is about from its title or headings" },
  { id: "skim", label: "Skim the whole text quickly to get its general idea" },
  { id: "scan", label: "Scan for the one specific detail you actually need" },
  { id: "confirm", label: "Read closely to confirm and understand the detail fully" },
];

const SCENARIO_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "A shopper wants to quickly check whether a product's price fits their budget, without reading the whole label. Which strategy should they use?",
    correct: "Scanning — looking for just the price",
    distractors: ["Predicting — guessing the price without looking", "Close reading — reading every word on the label", "Skimming — reading only the brand name"],
  },
  {
    q: "Why should one read for main ideas?",
    correct: "It helps a reader quickly understand what a text is really about, before focusing on smaller details",
    distractors: ["It is the only way to remember a text word for word", "It removes the need to ever read details", "It is useful only for reading advertisements"],
  },
  {
    q: "How can you improve your reading?",
    correct: "By practising strategies such as skimming, scanning, and predicting, and by choosing the right strategy for your purpose",
    distractors: ["By reading every text at exactly the same slow speed", "By avoiding reading anything unfamiliar", "By reading only the first sentence of every text"],
  },
];

export const mainIdeasAndDetails: Skill = {
  id: "g8-eng-r-main-ideas-and-details",
  code: "R.7",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Main Ideas and Details",
  description: "Identify main ideas and supporting details in consumer-related passages, and apply reading strategies such as skimming, scanning, and predicting.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "mc-passage", "mc-scenario"] as const);
    const hint = "The main idea sums up the whole passage; the supporting details are the specific facts that back it up.";

    if (branch === "categorize") {
      const p = randChoice(rng, PASSAGES);
      const details = shuffle(rng, p.details).slice(0, 2);
      const items = shuffle(rng, [
        { id: "main", label: p.mainIdea, bucket: "main" },
        ...details.map((label, i) => ({ id: `d${i}`, label, bucket: "detail" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each statement into Main idea or Supporting detail.",
        passage: p.passage,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "main", label: "Main idea" },
          { id: "detail", label: "Supporting detail" },
        ],
        correctBucket,
        hint,
        explanation: `Main idea: "${p.mainIdea}". Supporting details: ${details.join(" / ")}`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, STRATEGIES.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, STRATEGIES.map((s) => ({ id: s.name, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of STRATEGIES) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: "Match each reading strategy to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the strategy is for a general overview, a specific fact, a guess before reading, or full understanding.",
        explanation: STRATEGIES.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, STRATEGY_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for using reading strategies efficiently in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: STRATEGY_STEPS.map((s) => s.id),
        hint: "Start by predicting the topic, then get the general idea, then find the specific detail, then confirm it by reading closely.",
        explanation: STRATEGY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "mc-passage") {
      const p = randChoice(rng, PASSAGES);
      const useMain = rng() < 0.5;
      const set = useMain ? p.mainQ : p.detailQ;
      const q = useMain ? "What is the main idea of this passage?" : p.detailQ.q;
      const choices = shuffle(rng, [set.correct, ...set.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q,
        passage: p.passage,
        choices,
        correctIndex: choices.indexOf(set.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${set.correct}".`,
      };
    }

    const entry = randChoice(rng, SCENARIO_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Choose the strategy that matches the goal: a general idea, a specific fact, a prediction, or full understanding.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
