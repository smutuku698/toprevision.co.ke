import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the outpouring of the Holy Spirit at Pentecost in the correct order.",
  "Put these events of Pentecost into their correct order.",
  "Sequence these events of the Holy Spirit's outpouring correctly.",
  "Arrange these moments from Acts 2 in order.",
  "Order these events the way they happened at Pentecost.",
  "Sort these events into the order they happened in Acts 2.",
];

const MATCH_PROMPTS = [
  "Match each fruit of the Holy Spirit (Galatians 5:22-23) to what it means.",
  "Pair each fruit of the Spirit below with its correct meaning.",
  "Connect each fruit to the meaning it fits.",
  "Match each fruit to the statement that explains it.",
  "Link each fruit of the Holy Spirit to its correct definition.",
  "Match each fruit to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each behaviour as 'Shows a fruit of the Holy Spirit' or 'Shows the opposite behaviour'.",
  "Decide whether each behaviour shows a fruit of the Spirit or its opposite, and sort it there.",
  "Group these behaviours under fruit of the Spirit or opposite behaviour.",
  "Sort each behaviour below into the correct category.",
  "Place each behaviour into the bucket for fruit of the Spirit or its opposite.",
  "Read each behaviour and sort it under fruit of the Spirit or opposite.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const TIMELINE = [
  { id: "t1", label: "The disciples are gathered together in one place in Jerusalem" },
  { id: "t2", label: "A sound like a rushing wind fills the whole house" },
  { id: "t3", label: "Tongues of fire appear and rest on each of them" },
  { id: "t4", label: "They are filled with the Holy Spirit and begin to speak in other tongues" },
  { id: "t5", label: "A crowd from many nations gathers, amazed to hear them in their own languages" },
  { id: "t6", label: "Peter stands up and preaches to the crowd about Jesus" },
];

const FRUIT: { fruit: string; meaning: string }[] = [
  { fruit: "Love", meaning: "Unselfish care and goodwill toward others" },
  { fruit: "Joy", meaning: "A deep gladness that does not depend on circumstances" },
  { fruit: "Peace", meaning: "Inner calm and right relationship with God and others" },
  { fruit: "Patience", meaning: "Enduring difficulties or people without becoming angry" },
  { fruit: "Kindness", meaning: "Being considerate and generous toward others" },
  { fruit: "Goodness", meaning: "Moral uprightness expressed in good actions" },
  { fruit: "Faithfulness", meaning: "Being reliable, loyal, and true to one's word" },
  { fruit: "Gentleness", meaning: "A humble and mild manner in dealing with others" },
  { fruit: "Self-control", meaning: "Mastery over one's own desires and impulses" },
];

const SHOWS_FRUIT = [
  "Remaining calm and forgiving someone who wronged you",
  "Being generous and kind to a stranger in need",
  "Keeping a promise even when it is difficult",
  "Controlling your temper when provoked",
];
const OPPOSITE = [
  "Losing your temper and shouting at others",
  "Being jealous and quarrelling with classmates",
  "Breaking a promise without any good reason",
  "Being selfish and refusing to help others",
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "What sound accompanied the coming of the Holy Spirit at Pentecost?", a: "A sound like a rushing wind from heaven", explanation: "Acts 2:2 records a sound like the blowing of a violent wind filling the whole house." },
  { q: "What appeared and rested on each of the believers at Pentecost?", a: "What seemed to be tongues of fire", explanation: "Acts 2:3 describes tongues of fire separating and resting on each believer." },
  { q: "What ability amazed the crowd on the day of Pentecost?", a: "The disciples spoke in other languages that the crowd understood", explanation: "Acts 2:6-11 records people from many nations hearing the disciples in their own languages." },
  { q: "On which Jewish festival did the outpouring of the Holy Spirit happen?", a: "Pentecost", explanation: "Acts 2:1 sets the outpouring of the Spirit on the day of Pentecost." },
  { q: "Where were the disciples gathered when the Holy Spirit came?", a: "Together in one place in Jerusalem", explanation: "Acts 2:1 says they were all together in one place when the Spirit came." },
];

const FILL_BLANKS = [
  { before: "Acts 2 records that at Pentecost, the disciples were filled with the Holy Spirit and began to speak in other", after: ".", answer: "tongues", accepted: ["tongues"] },
  { before: "Galatians 5:22-23 lists love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-", after: "as the fruit of the Spirit.", answer: "control", accepted: ["control"] },
];

export const theHolySpirit: Skill = {
  id: "g8-cre-ch-the-holy-spirit",
  code: "CH.1",
  subjectId: "cre",
  strandId: "g8-cre-ch",
  grade: 8,
  title: "The Holy Spirit",
  description: "The outpouring of the Holy Spirit at Pentecost and the fruit of the Spirit that Christians should exemplify.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "recall", "blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TIMELINE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: TIMELINE.map((t) => t.id),
        hint: "Start with the disciples gathered together and end with Peter preaching to the crowd.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FRUIT).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.fruit, label: f.fruit })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.fruit, label: f.meaning })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.fruit] = f.fruit;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The fruit of the Spirit describes the character the Holy Spirit produces in a believer's life.",
        explanation: chosen.map((f) => `${f.fruit} — ${f.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const fruit = shuffle(rng, SHOWS_FRUIT).slice(0, 3);
      const opposite = shuffle(rng, OPPOSITE).slice(0, 3);
      const items = shuffle(rng, [
        ...fruit.map((f, i) => ({ id: `f${i}`, label: f, bucket: "fruit" })),
        ...opposite.map((o, i) => ({ id: `o${i}`, label: o, bucket: "opposite" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "fruit", label: "Shows a fruit of the Holy Spirit" },
          { id: "opposite", label: "Shows the opposite behaviour" },
        ],
        correctBucket,
        hint: "The fruit of the Spirit builds people up; the opposite behaviours tear relationships down.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "fruit" ? "shows a fruit of the Holy Spirit" : "shows the opposite behaviour"}.`).join(" "),
      };
    }

    if (branch === "recall") {
      const target = randChoice(rng, FACTS);
      const distractors = shuffle(rng, FACTS.filter((f) => f.a !== target.a)).slice(0, 3).map((f) => f.a);
      const choices = shuffle(rng, [target.a, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: target.q,
        choices,
        correctIndex: choices.indexOf(target.a),
        layout: "list",
        hint: "Recall the account of Pentecost in Acts 2:1-11.",
        explanation: target.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS)(fb.before, fb.after),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: fb.accepted,
      inputMode: "text",
      hint: "Think about the exact wording of the scripture.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
