import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each needy group to the scripture that calls Christians to help them.",
  "Pair each group below with the scripture that calls for helping them.",
  "Connect each needy group to the Bible passage about caring for them.",
  "Match each group to the scripture that explains the call to help.",
  "Link each needy group to the passage calling Christians to compassion for them.",
  "Match each group to the scripture reference that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each action as 'An act of compassion (Matthew 25:34-40)' or 'An unrighteous failure to help (Matthew 25:41-46)'.",
  "Decide whether each action is an act of compassion or a failure to help, and sort it there.",
  "Group these actions under act of compassion or failure to help.",
  "Sort each action below into the correct category.",
  "Place each action into the bucket for compassion or failure to help.",
  "Read each action and sort it under act of compassion or failure to help.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for organising a community service activity of compassion.",
  "Put these steps for organising an act of compassion into order.",
  "Sequence these steps for a community service activity correctly.",
  "Arrange these steps for planning an act of compassion in order.",
  "Order the steps for carrying out a community service activity.",
  "Sort these steps into the order they should be followed for an act of compassion.",
];

const FILL_PROMPTS = [
  (before: string, after: string) => `Fill in the missing word: "${before} ___ ${after}"`,
  (before: string, after: string) => `Complete this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Supply the missing word in this verse: "${before} ___ ${after}"`,
  (before: string, after: string) => `Which word completes this passage? "${before} ___ ${after}"`,
  (before: string, after: string) => `Fill in the blank in this scripture: "${before} ___ ${after}"`,
  (before: string, after: string) => `Read the verse and fill in the missing word: "${before} ___ ${after}"`,
];

const GROUP_TO_SCRIPTURE: { group: string; scripture: string }[] = [
  { group: "The elderly", scripture: "Leviticus 19:32 calls Christians to rise and show respect to the aged" },
  { group: "The poor and oppressed", scripture: "Psalm 82:3 calls for defending the poor and the oppressed" },
  { group: "Orphans and widows", scripture: "Psalm 82:3 calls for upholding the cause of the fatherless and the widow" },
  { group: "The hungry and thirsty", scripture: "Matthew 25:35 calls for feeding and giving drink to those in need" },
  { group: "Strangers and foreigners", scripture: "Matthew 25:35 calls for welcoming the stranger" },
  { group: "The sick and imprisoned", scripture: "Matthew 25:36 calls for visiting the sick and those in prison" },
];

const RIGHTEOUS = [
  "Giving food to someone who is hungry",
  "Visiting a sick person in hospital",
  "Welcoming a stranger or refugee into your community",
  "Visiting someone in prison",
  "Giving clothes to someone in need",
];
const UNRIGHTEOUS = [
  "Walking past a hungry person without helping",
  "Refusing to visit or comfort someone who is sick",
  "Turning away a stranger who needs help",
  "Ignoring someone in prison who needs support",
];

const STEPS = [
  { id: "s1", label: "Identify the needy in your school or community (the elderly, the poor, orphans, widows)" },
  { id: "s2", label: "Decide which act of compassion you can offer, such as food, clothing, or a visit" },
  { id: "s3", label: "Plan and gather what is needed together with others in your class or church" },
  { id: "s4", label: "Carry out the act of compassion together as a group" },
  { id: "s5", label: "Reflect on how the activity reflects Matthew 25:34-40" },
];

const FACTS: { q: string; a: string; explanation: string }[] = [
  { q: "According to Matthew 25:35-36, name one act of compassion Jesus lists.", a: "Feeding the hungry", explanation: "Matthew 25:35-36 lists feeding the hungry, giving drink to the thirsty, welcoming strangers, clothing the naked, visiting the sick, and visiting prisoners." },
  { q: "According to Leviticus 19:32, how should the elderly be treated?", a: "With respect, by rising in their presence", explanation: "Leviticus 19:32 instructs believers to rise in the presence of the aged and honour them." },
  { q: "According to Psalm 82:3, who should be defended?", a: "The weak, the fatherless, the poor, and the oppressed", explanation: "Psalm 82:3 calls for defending the cause of the weak, the fatherless, and the oppressed." },
  { q: "According to Matthew 25:34-40, who inherits the kingdom prepared for them?", a: "Those who did acts of compassion to 'the least of these'", explanation: "Jesus taught that helping the needy is the same as doing it for him personally." },
  { q: "According to Matthew 25:41-46, what happens to those who fail to help the needy?", a: "They are sent away for failing to act with compassion", explanation: "Matthew 25:41-46 warns of serious consequences for ignoring the needs of others." },
];

const FILL_BLANKS = [
  { before: "Matthew 25:40 says: 'Whatever you did for one of the least of these brothers and sisters of mine, you did for", after: ".'", answer: "me", accepted: ["me"] },
  { before: "Leviticus 19:32 instructs believers to rise in the presence of the", after: "and show them respect.", answer: "elderly", accepted: ["elderly", "aged"] },
];

export const actsOfCompassion: Skill = {
  id: "g8-cre-ch-acts-of-compassion",
  code: "CH.2",
  subjectId: "cre",
  strandId: "g8-cre-ch",
  grade: 8,
  title: "Acts of Compassion",
  description: "The role of the church in helping the needy and the acts of compassion taught in Matthew 25.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "recall", "blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, GROUP_TO_SCRIPTURE).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((g) => ({ id: g.group, label: g.group })));
      const targets = shuffle(rng, chosen.map((g) => ({ id: g.group, label: g.scripture })));
      const correctMap: Record<string, string> = {};
      for (const g of chosen) correctMap[g.group] = g.group;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The Bible names specific groups the church is called to care for.",
        explanation: chosen.map((g) => `${g.group} — ${g.scripture.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const righteous = shuffle(rng, RIGHTEOUS).slice(0, 3);
      const unrighteous = shuffle(rng, UNRIGHTEOUS).slice(0, 3);
      const items = shuffle(rng, [
        ...righteous.map((r, i) => ({ id: `r${i}`, label: r, bucket: "righteous" })),
        ...unrighteous.map((u, i) => ({ id: `u${i}`, label: u, bucket: "unrighteous" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "righteous", label: "An act of compassion" },
          { id: "unrighteous", label: "An unrighteous failure to help" },
        ],
        correctBucket,
        hint: "Matthew 25:34-46 contrasts those who helped 'the least of these' with those who ignored them.",
        explanation: items.map((i) => `"${i.label}" — ${i.bucket === "righteous" ? "an act of compassion" : "a failure to show compassion"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: STEPS.map((s) => s.id),
        hint: "Start by identifying who needs help, and end by reflecting on the experience.",
        explanation: STEPS.map((s) => s.label).join(" → "),
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
        hint: "Recall Matthew 25:31-46, Leviticus 19:32-33, and Psalm 82:3.",
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
