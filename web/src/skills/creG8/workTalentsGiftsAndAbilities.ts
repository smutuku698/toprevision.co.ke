import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of the parable of the talents (Matthew 25:14-30) in the correct order.",
  "Put these events of the parable of the talents into their correct order.",
  "Sequence these events of the parable correctly.",
  "Arrange these moments from Matthew 25:14-30 in order.",
  "Order these events the way they happened in the parable of the talents.",
  "Sort these events into the order they happened in this parable.",
];

const MATCH_PROMPTS = [
  "Match each element of the parable of the talents to what it represents.",
  "Pair each element below with what it represents.",
  "Connect each element of the parable to its meaning.",
  "Match each element to the statement that explains it.",
  "Link each element of the parable to what it symbolises.",
  "Match each element to the description of what it represents.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each action as 'Faithful use of a talent' or 'Wasting a talent'.",
  "Decide whether each action is faithful use or wasting a talent, and sort it there.",
  "Group these actions under faithful use of a talent or wasting a talent.",
  "Sort each action below into the correct category.",
  "Place each action into the bucket for faithful use or wasting.",
  "Read each action and sort it under faithful use or wasting a talent.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const SYMBOLS: { element: string; meaning: string }[] = [
  { element: "The master", meaning: "Represents God, who entrusts gifts to his people" },
  { element: "The talents", meaning: "Represent the God-given gifts, abilities, and resources given to each person" },
  { element: "The servants who invested", meaning: "Represent people who faithfully use and grow what God has given them" },
  { element: "The servant who buried his talent", meaning: "Represents someone who wastes a God-given gift out of fear" },
  { element: "'Well done, good and faithful servant'", meaning: "God's commendation for faithful use of one's gifts" },
];

const FAITHFUL = [
  "Practising and developing a skill in music, sport, or art",
  "Using a business idea to start a small income-generating enterprise",
  "Saving money earned from one's own effort responsibly",
  "Sharing one's gift to help and serve others",
];
const WASTING = [
  "Ignoring a talent out of fear of failure",
  "Refusing to practise or develop a God-given ability",
  "Being lazy and making excuses instead of trying",
  "Hiding one's gifts instead of using them to serve others",
];

const TIMELINE = [
  { id: "t1", label: "A master prepares to go on a journey and entrusts his property to his servants" },
  { id: "t2", label: "He gives five talents to one servant, two to another, and one to a third, each according to their ability" },
  { id: "t3", label: "The servant with five talents trades and gains five more" },
  { id: "t4", label: "The servant with one talent digs a hole and buries his master's money" },
  { id: "t5", label: "The master returns and settles accounts with his servants" },
  { id: "t6", label: "He commends the faithful servants and rebukes the one who buried his talent" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to James 1:17, where do good gifts come from?", a: "From above, from the Father of heavenly lights", explanation: "James 1:17 teaches that every good and perfect gift is given by God." },
  { q: "According to Romans 11:29, what does the Bible say about God's gifts and calling?", a: "They are irrevocable", explanation: "Romans 11:29 says God's gifts and his call are irrevocable — he does not take them back." },
  { q: "In the parable of the talents, how many talents did the master give in total?", a: "Eight (five, two, and one)", explanation: "Matthew 25:15 records the master giving five talents to one servant, two to another, and one to the third." },
  { q: "What did the servant with one talent do?", a: "He dug a hole and buried his master's money", explanation: "Matthew 25:18 records this servant hiding his talent out of fear rather than using it." },
  { q: "How did the master respond to the servants who doubled their talents?", a: "He commended them as good and faithful, giving them more responsibility", explanation: "Matthew 25:21-23 records the master's praise for the servants who used their talents faithfully." },
];

const FILL_BLANKS = [
  { before: "In the parable, the master commends the faithful servants, saying: 'Well done, good and", after: "servant!'", answer: "faithful", accepted: ["faithful"] },
  { before: "James 1:17 says every good and perfect gift comes down from the Father of the heavenly", after: ".", answer: "lights", accepted: ["lights"] },
];

export const workTalentsGiftsAndAbilities: Skill = {
  id: "g8-cre-cl-work-talents-gifts-and-abilities",
  code: "CL.5",
  subjectId: "cre",
  strandId: "g8-cre-cl",
  grade: 8,
  title: "Work: Talents, Gifts and Abilities",
  description: "Discovering and using God-given talents, the parable of the talents, and applying its lessons through enterprise and service.",
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
        hint: "Start with the master entrusting his talents and end with him settling accounts on his return.",
        explanation: TIMELINE.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SYMBOLS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.element, label: s.element })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.element, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.element] = s.element;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Jesus used talents (money) to picture the gifts and abilities God entrusts to each person.",
        explanation: chosen.map((s) => `${s.element} — represents ${s.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const faithful = shuffle(rng, FAITHFUL).slice(0, 3);
      const wasting = shuffle(rng, WASTING).slice(0, 3);
      const items = shuffle(rng, [
        ...faithful.map((f, i) => ({ id: `f${i}`, label: f, bucket: "faithful" })),
        ...wasting.map((w, i) => ({ id: `w${i}`, label: w, bucket: "wasting" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "faithful", label: "Faithful use of a talent" },
          { id: "wasting", label: "Wasting a talent" },
        ],
        correctBucket,
        hint: "Faithful use grows and shares a gift; wasting it means hiding or ignoring it out of fear or laziness.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "faithful" ? "faithful use of a talent" : "wasting a talent"}.`).join(" "),
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
        hint: "Recall James 1:17, Romans 11:29, and the parable of the talents in Matthew 25:14-30.",
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
